/**
 * Notification service — фронтенд лише викликає публічний endpoint.
 * Секрети email (Resend / SendGrid) живуть ТІЛЬКИ на сервері.
 *
 * Потрібна конфігурація (один секрет):
 *   RESEND_API_KEY=re_xxx
 *   NOTIFY_TO_EMAIL=you@example.com
 *   (опційно) NOTIFY_FROM_EMAIL=noreply@yourdomain.com
 *
 * Див. /api/notify.js — приклад serverless.
 */

import { NOTIFY_ENDPOINT } from '../siteConfig';

/**
 * @param {object} data
 * @returns {Promise<{ ok: boolean, simulated?: boolean }>}
 */
export function sendNotification(data) {
  const payload = Object.assign({}, data, {
    timestamp: data.timestamp || new Date().toISOString()
  });

  if (!NOTIFY_ENDPOINT) {
    return simulate(payload);
  }

  return fetch(NOTIFY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('notify_failed');
      }
      return res.json().catch(() => ({ ok: true }));
    })
    .catch(() => simulate(payload));
}

function simulate(payload) {
  try {
    const key = 'nastyaNotifications';
    const prev = JSON.parse(window.sessionStorage.getItem(key) || '[]');
    prev.push(payload);
    window.sessionStorage.setItem(key, JSON.stringify(prev));
  } catch (err) {
    // ignore
  }
  if (typeof console !== 'undefined' && console.info) {
    console.info('[notify:simulated]', payload);
  }
  return Promise.resolve({ ok: true, simulated: true });
}
