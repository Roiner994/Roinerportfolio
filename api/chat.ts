import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildPortfolioKnowledgeContext } from '../src/data/portfolioProfile';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const DEFAULT_MODEL = 'openai/gpt-4.1-mini';

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

function getEnv(name: string): string {
  return (process.env[name] ?? '').trim();
}

async function fetchOpenRouterReply(messages: ChatMessage[]) {
  const apiKey = getEnv('OPENROUTER_API_KEY');

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY_MISSING');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const appUrl = getEnv('APP_URL');
    const appName = getEnv('APP_NAME');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(appUrl ? { 'HTTP-Referer': appUrl } : {}),
        ...(appName ? { 'X-Title': appName } : {}),
      },
      body: JSON.stringify({
        model: getEnv('OPENROUTER_MODEL') || DEFAULT_MODEL,
        max_tokens: 1024,
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
      model: data?.model || getEnv('OPENROUTER_MODEL') || DEFAULT_MODEL,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Content-Type', 'application/json');

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const messages = request.body?.messages;

    if (!isChatMessageArray(messages) || messages.length === 0) {
      return response.status(400).json({ error: 'Invalid payload. Expected a non-empty messages array.' });
    }

    const trimmedMessages = messages
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.content.trim(),
      }))
      .filter((message) => message.content.length > 0);

    if (trimmedMessages.length === 0) {
      return response.status(400).json({ error: 'No valid messages were provided.' });
    }

    const reply = await fetchOpenRouterReply(trimmedMessages);

    return response.status(200).json({
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
      return response.status(500).json({ error: 'Missing OPENROUTER_API_KEY on the server.' });
    }

    if (message.includes('aborted')) {
      return response.status(504).json({ error: 'The AI request timed out. Please try again.' });
    }

    if (message.includes('Unexpected token')) {
      return response.status(400).json({ error: 'Invalid JSON payload.' });
    }

    return response.status(500).json({ error: message });
  }
}
