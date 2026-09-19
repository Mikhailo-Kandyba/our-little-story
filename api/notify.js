/**
 * Serverless notify endpoint (Vercel / Netlify-compatible style).
 *
 * Deploy this as `/api/notify`.
 * Set environment variables (NEVER put these in frontend):
 *   RESEND_API_KEY
 *   NOTIFY_TO_EMAIL
 *   NOTIFY_FROM_EMAIL (optional)
 *
 * Locally without deploy: frontend falls back to sessionStorage simulation.
 */

const RESEND_URL = 'https://api.resend.com/emails';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

function formatSubject(body) {
  if (body.type === 'mood') {
    return 'Новий настрій 💭';
  }
  if (body.type === 'booking') {
    return 'Нове бронювання 💗';
  }
  if (body.type === 'reaction') {
    return 'Реакція на спогад ' + (body.reaction || '');
  }
  return 'Повідомлення зі сторінки';
}

function formatText(body) {
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
  return JSON.stringify(body, null, 2);
}

async function sendViaResend(text, subject) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_TO_EMAIL;
  const from = process.env.NOTIFY_FROM_EMAIL || 'onboarding@resend.dev';

  if (!apiKey || !to) {
    return { ok: false, reason: 'missing_env' };
  }

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: from,
      to: [to],
      subject: subject,
      text: text
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    return { ok: false, reason: errText };
  }
  return { ok: true };
}

// Vercel-style handler
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, corsHeaders());
    res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const subject = formatSubject(body || {});
  const text = formatText(body || {});
  const result = await sendViaResend(text, subject);

  if (!result.ok && result.reason === 'missing_env') {
    // Dev-friendly: accept payload without sending mail
    console.log('[api/notify] missing env, logged only:', body);
    res.writeHead(200, corsHeaders());
    res.end(JSON.stringify({ ok: true, simulated: true }));
    return;
  }

  if (!result.ok) {
    res.writeHead(502, corsHeaders());
    res.end(JSON.stringify({ ok: false, error: 'email_failed' }));
    return;
  }

  res.writeHead(200, corsHeaders());
  res.end(JSON.stringify({ ok: true }));
};
