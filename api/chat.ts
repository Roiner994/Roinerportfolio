import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildPortfolioKnowledgeContext } from './_portfolioContext.js';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const DEFAULT_MODEL = 'openai/gpt-4.1-mini';

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

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

function buildSystemPrompt(language: 'es' | 'en' = 'es') {
  const prompts = {
    es: {
      identity: 'Eres el modo AI del portfolio de Roiner Hernandez.',
      scope: 'Responde solo sobre su perfil profesional, experiencia, habilidades, proyectos, disponibilidad, CV, ubicación y contacto.',
      constraint: 'Usa exclusivamente la fuente de verdad suministrada abajo. No inventes datos, fechas, clientes, enlaces, salarios, certificaciones ni experiencias que no aparezcan en el contexto.',
      outOfScope: 'Si el usuario pregunta algo fuera del portfolio o fuera del contexto disponible, responde de forma amable que este modo AI solo puede hablar sobre Roiner y sus proyectos, e invita a preguntar sobre habilidades, experiencia, proyectos o contacto.',
      tone: 'Habla principalmente en español, con tono claro, breve y profesional.',
      contact: 'Si el usuario pide contacto, menciona el email disponible en la fuente de verdad.',
      status: 'Si el usuario pregunta por disponibilidad, responde con el status indicado en la fuente de verdad.',
      truth: 'Fuente de verdad:',
    },
    en: {
      identity: "You are the AI mode of Roiner Hernandez's portfolio.",
      scope: 'Respond only about his professional profile, experience, skills, projects, availability, CV, location, and contact.',
      constraint: 'Exclusively use the truth source provided below. Do not invent facts, dates, clients, links, salaries, certifications, or experiences that do not appear in the context.',
      outOfScope: 'If the user asks something outside the portfolio or context available, respond politely that this AI mode can only talk about Roiner and his projects, and invite them to ask about skills, experience, projects, or contact.',
      tone: 'Speak primarily in English, with a clear, brief, and professional tone.',
      contact: 'If the user asks for contact, mention the email available in the truth source.',
      status: 'If the user asks about availability, respond with the status indicated in the truth source.',
      truth: 'Truth source:',
    }
  };

  const p = prompts[language];

  return [
    p.identity,
    p.scope,
    p.constraint,
    p.outOfScope,
    p.tone,
    p.contact,
    p.status,
    p.truth,
    buildPortfolioKnowledgeContext(language),
  ].join('\n\n');
}

function getEnv(name: string): string {
  return (process.env[name] ?? '').trim();
}

function normalizeHeaderValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function isPublicHttpUrl(value: string) {
  try {
    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    return !['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
}

function resolveAppUrl(request: VercelRequest) {
  const configuredUrl = getEnv('APP_URL');

  if (configuredUrl && isPublicHttpUrl(configuredUrl)) {
    return configuredUrl;
  }

  const forwardedProto = normalizeHeaderValue(request.headers['x-forwarded-proto']);
  const forwardedHost = normalizeHeaderValue(request.headers['x-forwarded-host']);
  const host = normalizeHeaderValue(request.headers.host);

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  if (host) {
    return `https://${host}`;
  }

  const vercelUrl = getEnv('VERCEL_URL');
  return vercelUrl ? `https://${vercelUrl}` : '';
}

async function fetchOpenRouterReply(messages: ChatMessage[], language: 'es' | 'en', appUrl?: string) {
  const apiKey = getEnv('OPENROUTER_API_KEY');

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY_MISSING');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const appName = getEnv('APP_NAME');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(appUrl ? { 'HTTP-Referer': appUrl } : {}),
        ...(appName ? { 'X-OpenRouter-Title': appName } : {}),
      },
      body: JSON.stringify({
        model: getEnv('OPENROUTER_MODEL') || DEFAULT_MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(language),
          },
          ...messages,
        ],
      }),
      signal: controller.signal,
    });

    const rawResponse = await response.text();
    const data = rawResponse
      ? safeJsonParse<{
          error?: { message?: string };
          message?: string;
          model?: string;
          choices?: Array<{ message?: { content?: string } }>;
        }>(rawResponse)
      : null;

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        rawResponse ||
        (language === 'es' ? 'No pude obtener una respuesta del proveedor AI.' : 'Could not get a response from the AI provider.');
      throw new Error(`OpenRouter request failed (${response.status}): ${errorMessage}`);
    }

    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== 'string' || !content.trim()) {
      throw new Error(language === 'es' ? 'El proveedor AI no devolvio contenido util.' : 'The AI provider did not return useful content.');
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
    const requestBody =
      typeof request.body === 'string'
        ? safeJsonParse<{ messages?: unknown, language?: 'es' | 'en' }>(request.body)
        : request.body;
    const messages = requestBody?.messages;
    const language = requestBody?.language === 'en' ? 'en' : 'es';

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

    const reply = await fetchOpenRouterReply(trimmedMessages, language, resolveAppUrl(request));

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

    console.error('[api/chat] request failed', {
      message,
      method: request.method,
      url: request.url,
      host: request.headers.host,
      forwardedHost: request.headers['x-forwarded-host'],
      forwardedProto: request.headers['x-forwarded-proto'],
      hasApiKey: Boolean(getEnv('OPENROUTER_API_KEY')),
      model: getEnv('OPENROUTER_MODEL') || DEFAULT_MODEL,
      resolvedAppUrl: resolveAppUrl(request),
    });

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
