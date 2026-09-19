/**
 * Notification service — frontend only calls the public Worker endpoint.
 * Secrets (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) live ONLY on Cloudflare.
 *
 * See api/telegram.js + worker/index.js.
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
        const err = new Error('notify_failed');
        err.status = res.status;
        throw err;
      }
      return res.json().catch(() => ({ ok: true }));
    })
    .catch((err) => {
      // HTTP failures (400/429/500) must reach callers — do not soft-succeed.
      if (err && typeof err.status === 'number') {
        if (typeof console !== 'undefined' && console.error) {
          console.error('[notify] request failed', 'status=' + err.status);
        }
        return Promise.reject(err);
      }
      // Network / unexpected: soft-fail so other UX (booking, reactions) stays intact.
      return simulate(payload);
    });
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
