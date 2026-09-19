/**
 * Telegram notify — shared formatting + send (Cloudflare Worker /api/telegram).
 * Secrets only from env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
 */

export const ALLOWED_TYPES = ['mood', 'booking', 'reaction'];

const MAX_TEXT = 500;
const MAX_ID = 64;

function clip(value, max) {
  if (value == null) {
    return '';
  }
  const str = String(value).trim();
  return str.length > max ? str.slice(0, max) : str;
}

/**
 * @param {unknown} body
 * @returns {{ ok: true, data: object } | { ok: false, error: string }}
 */
export function validatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'invalid_body' };
  }

  const type = body.type;
  if (!ALLOWED_TYPES.includes(type)) {
    return { ok: false, error: 'invalid_type' };
  }

  // Never accept client-supplied chat routing
  if (body.chat_id != null || body.chatId != null || body.token != null) {
    return { ok: false, error: 'forbidden_fields' };
  }

  if (type === 'mood') {
    return {
      ok: true,
      data: {
        type,
        mood: clip(body.mood, 80),
        emoji: clip(body.emoji, 16),
        message: clip(body.message, MAX_TEXT),
        timestamp: clip(body.timestamp, 64)
      }
    };
  }

  if (type === 'booking') {
    const bookingType = body.bookingType === 'call' ? 'call' : 'meet';
    return {
      ok: true,
      data: {
        type,
        bookingType,
        date: clip(body.date, 40),
        dateLabel: clip(body.dateLabel, 120),
        time: clip(body.time, 40),
        timestamp: clip(body.timestamp, 64)
      }
    };
  }

  return {
    ok: true,
    data: {
      type,
      memoryId: clip(body.memoryId, MAX_ID),
      reaction: clip(body.reaction, 16),
      timestamp: clip(body.timestamp, 64)
    }
  };
}

export function formatTelegramText(body) {
  if (body.type === 'mood') {
    return [
      'Новий настрій 💭',
      '',
      'Настрій: ' + (body.mood || '') + ' ' + (body.emoji || ''),
      'Повідомлення: ' + (body.message || '(без тексту)'),
      'Час: ' + (body.timestamp || '')
    ].join('\n');
  }

  if (body.type === 'booking') {
    const typeLabel = body.bookingType === 'call' ? 'Зідзвонитися' : 'Побачитися';
    return [
      'Нове бронювання 💗',
      '',
      'Тип: ' + typeLabel,
      'Дата: ' + (body.dateLabel || body.date || ''),
      'Час: ' + (body.time || ''),
      'Час запиту: ' + (body.timestamp || '')
    ].join('\n');
  }

  if (body.type === 'reaction') {
    return [
      'Реакція на спогад',
      '',
      'Спогад: ' + (body.memoryId || ''),
      'Реакція: ' + (body.reaction || ''),
      'Час: ' + (body.timestamp || '')
    ].join('\n');
  }

  return '';
}

/**
 * @param {{ TELEGRAM_BOT_TOKEN?: string, TELEGRAM_CHAT_ID?: string }} env
 * @param {string} text
 */
export async function sendTelegramMessage(env, text) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { ok: false, reason: 'missing_env' };
  }

  const url =
    'https://api.telegram.org/bot' + encodeURIComponent(token) + '/sendMessage';

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        disable_web_page_preview: true
      })
    });
  } catch (err) {
    return { ok: false, reason: 'network_error' };
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return { ok: false, reason: errText || 'telegram_http_' + res.status };
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    return { ok: false, reason: 'invalid_telegram_response' };
  }

  if (!data || data.ok !== true) {
    return { ok: false, reason: (data && data.description) || 'telegram_rejected' };
  }

  return { ok: true };
}

export function jsonResponse(payload, status, extraHeaders) {
  const headers = Object.assign(
    {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    extraHeaders || {}
  );
  return new Response(JSON.stringify(payload), { status: status, headers: headers });
}

/**
 * Handle POST /api/telegram (and OPTIONS).
 * Soft-fails when Telegram is down so the frontend UX stays intact.
 */
export async function handleTelegramRequest(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'method_not_allowed' }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ ok: false, error: 'invalid_json' }, 400);
  }

  const validated = validatePayload(body);
  if (!validated.ok) {
    return jsonResponse({ ok: false, error: validated.error }, 400);
  }

  const data = Object.assign({}, validated.data, {
    timestamp: validated.data.timestamp || new Date().toISOString()
  });

  const text = formatTelegramText(data);
  const result = await sendTelegramMessage(env, text);

  if (!result.ok && result.reason === 'missing_env') {
    console.log('[api/telegram] missing env, simulated:', data);
    return jsonResponse({ ok: true, simulated: true }, 200);
  }

  if (!result.ok) {
    console.error('[api/telegram] send failed:', result.reason);
    // Do not break the site if Telegram is unavailable
    return jsonResponse({ ok: true, delivered: false }, 200);
  }

  return jsonResponse({ ok: true, delivered: true }, 200);
}
