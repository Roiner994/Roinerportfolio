import { buildPortfolioKnowledgeContext } from '../src/data/portfolioProfile';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string) => void;
};

type JsonRequest = {
  method?: string;
  body?: unknown;
  on?: (event: 'data' | 'end' | 'error', callback: (chunk?: Buffer | string | Error) => void) => void;
};

const DEFAULT_MODEL = 'openai/gpt-4.1-mini';
let cachedLocalEnv: Record<string, string> | null = null;

function isChatMessageArray(value: unknown): value is ChatMessage[] {
  return Array.isArray(value) && value.every((message) => {
    return (
      message &&
      typeof message === 'object' &&
      (message.role === 'user' || message.role === 'assistant') &&
      typeof message.content === 'string'
    );
  });
}

function buildSystemPrompt() {
  return [
    'Eres el modo AI del portfolio de Roiner Hernandez.',
    'Responde solo sobre su perfil profesional, experiencia, habilidades, proyectos, disponibilidad, CV, ubicacion y contacto.',
    'Usa exclusivamente la fuente de verdad suministrada abajo. No inventes datos, fechas, clientes, links, salarios, certificaciones ni experiencias que no aparezcan en el contexto.',
    'Si el usuario pregunta algo fuera del portfolio o fuera del contexto disponible, responde de forma amable que este modo AI solo puede hablar sobre Roiner y sus proyectos, e invita a preguntar sobre skills, experiencia, proyectos o contacto.',
    'Habla principalmente en espanol, con tono claro, breve y profesional.',
    'Si el usuario pide contacto, menciona el email disponible en la fuente de verdad.',
    'Si el usuario pregunta por disponibilidad, responde con el status indicado en la fuente de verdad.',
    'Fuente de verdad:',
    buildPortfolioKnowledgeContext(),
  ].join('\n\n');
}

function readLocalEnvFile() {
  if (cachedLocalEnv) {
    return cachedLocalEnv;
  }

  const envPath = path.join(process.cwd(), '.env.local');
  const values: Record<string, string> = {};

  if (!existsSync(envPath)) {
    cachedLocalEnv = values;
    return values;
  }

  const raw = readFileSync(envPath, 'utf8');

  raw.split('\n').forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (key) {
      values[key] = value;
    }
  });

  cachedLocalEnv = values;
  return values;
}

function getServerEnv(name: string) {
  const runtimeValue = process.env[name];

  if (runtimeValue && runtimeValue.trim()) {
    return runtimeValue.trim();
  }

  const localValue = readLocalEnvFile()[name];
  return localValue && localValue.trim() ? localValue.trim() : '';
}

async function readJsonBody(request: JsonRequest) {
  if (request.body && typeof request.body === 'object') {
    return request.body;
  }

  if (typeof request.body === 'string') {
    return JSON.parse(request.body);
  }

  if (!request.on) {
    return null;
  }

  const rawBody = await new Promise<string>((resolve, reject) => {
    let data = '';

    request.on?.('data', (chunk) => {
      data += typeof chunk === 'string' ? chunk : chunk?.toString() ?? '';
    });

    request.on?.('end', () => resolve(data));
    request.on?.('error', (error) => reject(error));
  });

  return rawBody ? JSON.parse(rawBody) : null;
}

async function fetchOpenRouterReply(messages: ChatMessage[]) {
  const apiKey = getServerEnv('OPENROUTER_API_KEY');

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY_MISSING');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(getServerEnv('APP_URL') ? { 'HTTP-Referer': getServerEnv('APP_URL') } : {}),
        ...(getServerEnv('APP_NAME') ? { 'X-Title': getServerEnv('APP_NAME') } : {}),
      },
      body: JSON.stringify({
        model: getServerEnv('OPENROUTER_MODEL') || DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(),
          },
          ...messages,
        ],
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        'No pude obtener una respuesta del proveedor AI.';
      throw new Error(errorMessage);
    }

    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('El proveedor AI no devolvio contenido util.');
    }

    return {
      content: content.trim(),
      model: data?.model || getServerEnv('OPENROUTER_MODEL') || DEFAULT_MODEL,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(request: JsonRequest, response: JsonResponse) {
  response.setHeader?.('Content-Type', 'application/json');

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const payload = await readJsonBody(request);
    const messages = (payload as { messages?: unknown } | null)?.messages;

    if (!isChatMessageArray(messages) || messages.length === 0) {
      response.status(400).json({ error: 'Invalid payload. Expected a non-empty messages array.' });
      return;
    }

    const trimmedMessages = messages
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.content.trim(),
      }))
      .filter((message) => message.content.length > 0);

    if (trimmedMessages.length === 0) {
      response.status(400).json({ error: 'No valid messages were provided.' });
      return;
    }

    const reply = await fetchOpenRouterReply(trimmedMessages);

    response.status(200).json({
      message: {
        role: 'assistant',
        content: reply.content,
      },
      provider: 'openrouter',
      model: reply.model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';

    if (message === 'OPENROUTER_API_KEY_MISSING') {
      response.status(500).json({ error: 'Missing OPENROUTER_API_KEY on the server.' });
      return;
    }

    if (message.includes('aborted')) {
      response.status(504).json({ error: 'The AI request timed out. Please try again.' });
      return;
    }

    if (message.includes('Unexpected token')) {
      response.status(400).json({ error: 'Invalid JSON payload.' });
      return;
    }

    response.status(500).json({ error: message });
  }
}
