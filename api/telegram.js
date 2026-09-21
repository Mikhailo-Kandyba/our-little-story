/**
 * Telegram notify — shared formatting + send (Cloudflare Worker /api/telegram).
 * Secrets only from env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
 */

export const ALLOWED_TYPES = [
  'visit',
  'mood',
  'booking',
  'reaction',
  'game_completed',
  'quiz_answer',
  'date_choice'
];

const MAX_TEXT = 500;
const MAX_QUIZ_QUESTION = 600;
const MAX_QUIZ_ANSWER = 2000;
const MAX_DATE_DETAILS = 2000;
const MAX_ID = 64;
const MAX_NAME = 40;
const MAX_DATE_PICKS = 2;

function clip(value, max) {
  if (value == null) {
    return '';
  }
  const str = String(value).trim();
  return str.length > max ? str.slice(0, max) : str;
}

function visitorFields(body) {
  return {
    visitorName: clip(body.visitorName, MAX_NAME),
    visitorId: clip(body.visitorId, MAX_ID)
  };
}

function visitorLines(body) {
  const lines = [];
  if (body.visitorName) {
    lines.push('👤 Імʼя: ' + body.visitorName);
  }
  if (body.visitorId) {
    lines.push('🆔 Visitor: ' + body.visitorId);
  }
  return lines;
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

  if (body.chat_id != null || body.chatId != null || body.token != null) {
    return { ok: false, error: 'forbidden_fields' };
  }

  const visitor = visitorFields(body);

  if (type === 'visit') {
    return {
      ok: true,
      data: Object.assign(
        {
          type,
          device: clip(body.device, 80),
          timestamp: clip(body.timestamp, 64)
        },
        visitor
      )
    };
  }

  if (type === 'mood') {
    return {
      ok: true,
      data: Object.assign(
        {
          type,
          mood: clip(body.mood, 80),
          emoji: clip(body.emoji, 16),
          message: clip(body.message, MAX_TEXT),
          timestamp: clip(body.timestamp, 64)
        },
        visitor
      )
    };
  }

  if (type === 'booking') {
    const bookingType = body.bookingType === 'call' ? 'call' : 'meet';
    return {
      ok: true,
      data: Object.assign(
        {
          type,
          bookingType,
          date: clip(body.date, 40),
          dateLabel: clip(body.dateLabel, 120),
          time: clip(body.time, 40),
          timestamp: clip(body.timestamp, 64)
        },
        visitor
      )
    };
  }

  if (type === 'game_completed') {
    const chapters = Number(body.completedChapters);
    return {
      ok: true,
      data: Object.assign(
        {
          type,
          answer: clip(body.answer, MAX_TEXT),
          completedChapters: Number.isFinite(chapters)
            ? Math.max(0, Math.min(5, Math.round(chapters)))
            : 5,
          timestamp: clip(body.timestamp, 64)
        },
        visitor
      )
    };
  }

  if (type === 'quiz_answer') {
    const answerRaw = Array.isArray(body.answer)
      ? body.answer.map((item) => clip(item, 200)).filter(Boolean).join('\n')
      : clip(body.answer, MAX_QUIZ_ANSWER);
    const qNum = Number(body.questionNumber);
    return {
      ok: true,
      data: Object.assign(
        {
          type,
          questionId: clip(body.questionId, MAX_ID),
          questionNumber: Number.isFinite(qNum)
            ? Math.max(0, Math.min(99, Math.round(qNum)))
            : 0,
          question: clip(body.question, MAX_QUIZ_QUESTION),
          answer: answerRaw || '(без тексту)',
          answerType: clip(body.answerType, 32),
          timestamp: clip(body.timestamp, 64)
        },
        visitor
      )
    };
  }

  if (type === 'date_choice') {
    const rawList = Array.isArray(body.selectedDates) ? body.selectedDates : [];
    const selectedDates = rawList
      .slice(0, MAX_DATE_PICKS)
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }
        const id = clip(item.id, MAX_ID);
        const title = clip(item.title, 120);
        if (!id || !title) {
          return null;
        }
        return {
          id: id,
          title: title,
          emoji: clip(item.emoji, 16)
        };
      })
      .filter(Boolean);

    if (!selectedDates.length) {
      return { ok: false, error: 'invalid_date_choice' };
    }

    return {
      ok: true,
      data: Object.assign(
        {
          type,
          selectedDates: selectedDates,
          details: clip(body.details, MAX_DATE_DETAILS),
          visitorLabel: clip(body.visitorLabel, MAX_NAME),
          timestamp: clip(body.timestamp, 64)
        },
        visitor
      )
    };
  }

  return {
    ok: true,
    data: Object.assign(
      {
        type,
        memoryId: clip(body.memoryId, MAX_ID),
        reaction: clip(body.reaction, 16),
        timestamp: clip(body.timestamp, 64)
      },
      visitor
    )
  };
}

function formatLocalTime(iso) {
  if (!iso) {
    return '';
  }
  // Client may already send a display-friendly timestamp.
  if (/^\d{2}\.\d{2}\.\d{4}/.test(String(iso))) {
    return String(iso);
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return String(iso);
  }
  const pad = (n) => (n < 10 ? '0' + n : String(n));
  return (
    pad(date.getUTCDate()) +
    '.' +
    pad(date.getUTCMonth() + 1) +
    '.' +
    date.getUTCFullYear() +
    ' ' +
    pad(date.getUTCHours()) +
    ':' +
    pad(date.getUTCMinutes()) +
    ' UTC'
  );
}

export function formatTelegramText(body) {
  if (body.type === 'visit') {
    const place = [body.city, body.region, body.country]
      .filter(Boolean)
      .join(', ');
    return [
      '💌 Новий візит на Our Little Story',
      ''
    ]
      .concat(visitorLines(body))
      .concat([
        '📍 Приблизне місце: ' + (place || 'невідомо'),
        '🌐 IP: ' + (body.ip || 'невідомо'),
        '📱 Пристрій: ' + (body.device || 'Unknown'),
        '🕐 Час: ' + formatLocalTime(body.timestamp),
        '',
        'Відкрила нашу історію 🤍'
      ])
      .join('\n');
  }

  if (body.type === 'mood') {
    return ['Новий настрій 💭', '']
      .concat(visitorLines(body))
      .concat([
        'Настрій: ' + (body.mood || '') + ' ' + (body.emoji || ''),
        'Повідомлення: ' + (body.message || '(без тексту)'),
        'Час: ' + (body.timestamp || '')
      ])
      .join('\n');
  }

  if (body.type === 'booking') {
    const typeLabel = body.bookingType === 'call' ? 'Зідзвонитися' : 'Побачитися';
    return ['Нове бронювання 💗', '']
      .concat(visitorLines(body))
      .concat([
        'Тип: ' + typeLabel,
        'Дата: ' + (body.dateLabel || body.date || ''),
        'Час: ' + (body.time || ''),
        'Час запиту: ' + (body.timestamp || '')
      ])
      .join('\n');
  }

  if (body.type === 'reaction') {
    return ['❤️ Реакція', '']
      .concat(visitorLines(body))
      .concat([
        '❤️ Реакція: ' + (body.reaction || ''),
        '📍 Розділ: Наші спогади',
        'Спогад: ' + (body.memoryId || ''),
        'Час: ' + (body.timestamp || '')
      ])
      .join('\n');
  }

  if (body.type === 'game_completed') {
    const n = body.completedChapters != null ? body.completedChapters : 5;
    return ['🎮 Гру пройдено', '']
      .concat(visitorLines(body))
      .concat([
        '❤️ Зібрано фрагментів: ' + n + '/5',
        '',
        '💭 Момент, який вона хотіла б пережити ще раз:',
        '"' + (body.answer || '…') + '"'
      ])
      .join('\n');
  }

  if (body.type === 'quiz_answer') {
    const isAlbum = body.questionId === 'shared-album';
    const heading = isAlbum ? '❤️ Відповідь про спільний альбом' : '❤️ Нова відповідь';
    let questionLabel = 'Питання:';
    if (isAlbum) {
      questionLabel = 'Спільний альбом';
    } else if (body.questionNumber) {
      questionLabel = 'Питання ' + body.questionNumber + ':';
    }
    return [heading, '']
      .concat(visitorLines(body))
      .concat([
        questionLabel,
        body.question || '…',
        '',
        'Відповідь:',
        body.answer || '…',
        '',
        'Час: ' + formatLocalTime(body.timestamp)
      ])
      .join('\n');
  }

  if (body.type === 'date_choice') {
    const name = body.visitorName || body.visitorLabel || 'Вона';
    const picks = (body.selectedDates || [])
      .map((item) => {
        const mark = item.emoji ? item.emoji + ' ' : '';
        return mark + (item.title || item.id || '');
      })
      .filter(Boolean);
    const details = body.details && String(body.details).trim();
    const detailBlock = details
      ? [
        '💭 Що зробило б побачення ідеальним:',
        '',
        '«' + details + '»'
      ]
      : ['💭 Додаткових побажань не залишила.'];

    return ['❤️ ВИБІР ПОБАЧЕННЯ', '']
      .concat(visitorLines(body))
      .concat([name + ' обрала:', ''])
      .concat(picks)
      .concat([''])
      .concat(detailBlock)
      .concat(['', '🕐 ' + formatLocalTime(body.timestamp)])
      .join('\n');
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
    return { ok: false, reason: 'telegram_http_' + res.status };
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

function requestMeta(request) {
  const headers = request.headers || { get: function () { return null; } };
  const cf = request.cf || {};
  return {
    ip: clip(headers.get('CF-Connecting-IP') || headers.get('X-Forwarded-For') || '', 64),
    country: clip(cf.country, 64),
    region: clip(cf.region || cf.regionCode, 80),
    city: clip(cf.city, 80)
  };
}

/**
 * Handle POST /api/telegram (and OPTIONS).
 * Secrets stay in env; responses never include token/chat id.
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

  let data = Object.assign({}, validated.data, {
    timestamp: validated.data.timestamp || new Date().toISOString()
  });

  if (data.type === 'visit') {
    data = Object.assign({}, data, requestMeta(request));
  }

  const text = formatTelegramText(data);
  const result = await sendTelegramMessage(env, text);

  if (!result.ok && result.reason === 'missing_env') {
    console.log(
      '[api/telegram] missing env (token=' +
        Boolean(env.TELEGRAM_BOT_TOKEN) +
        ' chat=' +
        Boolean(env.TELEGRAM_CHAT_ID) +
        '), simulated:',
      data.type
    );
    return jsonResponse({ ok: true, simulated: true }, 200);
  }

  if (!result.ok) {
    const reason = String(result.reason || '');
    console.error('[api/telegram] send failed:', reason.slice(0, 180));
    if (reason.indexOf('telegram_http_429') !== -1 || reason.indexOf('429') === 0) {
      return jsonResponse({ ok: false, error: 'rate_limited' }, 429);
    }
    return jsonResponse({ ok: false, error: 'telegram_unavailable' }, 502);
  }

  return jsonResponse({ ok: true, delivered: true }, 200);
}
