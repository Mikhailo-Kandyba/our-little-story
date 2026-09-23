/**
 * Notification service — frontend only calls the public Worker endpoint.
 * Secrets (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) live ONLY on Cloudflare.
 *
 * See api/telegram.js + worker/index.js.
 */

import { NOTIFY_ENDPOINT } from '../siteConfig';
import { getVisitorId, getVisitorName } from '../modules/visitor';

const QUIZ_FAIL_KEY = 'nastyaQuizPending';
const DATE_FAIL_KEY = 'nastyaDateChoicePending';
const GAME_FINALE_SENT_KEY = 'nastyaGameFinaleAnswerSent';

/**
 * @param {object} data
 * @returns {Promise<{ ok: boolean, simulated?: boolean }>}
 */
export function sendNotification(data) {
  const payload = Object.assign({}, data, {
    timestamp: data.timestamp || new Date().toISOString(),
    visitorName: data.visitorName || getVisitorName(),
    visitorId: data.visitorId || getVisitorId()
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
      if (err && typeof err.status === 'number') {
        if (typeof console !== 'undefined' && console.error) {
          console.error('[notify] request failed', 'status=' + err.status);
        }
        return Promise.reject(err);
      }
      return simulate(payload);
    });
}

/**
 * Send one quiz answer via the shared notify pipeline.
 * Failures are stored locally for a later retry and never throw to the UI.
 *
 * @param {{
 *   questionId: string,
 *   question: string,
 *   answer: string | string[],
 *   questionNumber?: number,
 *   answerType?: string
 * }} params
 * @returns {Promise<{ ok: boolean, simulated?: boolean, pending?: boolean }>}
 */
export function sendQuizAnswer(params) {
  const answer = Array.isArray(params.answer)
    ? params.answer.map((item) => String(item).trim()).filter(Boolean)
    : String(params.answer == null ? '' : params.answer).trim();

  const payload = {
    type: 'quiz_answer',
    questionId: params.questionId,
    questionNumber: params.questionNumber || 0,
    question: params.question,
    answer: answer,
    answerType: params.answerType || 'text'
  };

  return sendNotification(payload)
    .then((result) => result)
    .catch((err) => {
      storeQuizPending(payload);
      if (typeof console !== 'undefined' && console.error) {
        console.error(
          '[quiz] notify failed',
          err && err.status ? 'status=' + err.status : err
        );
      }
      return { ok: false, pending: true };
    });
}

/**
 * Send date-choice selection via the shared notify pipeline.
 * Failures are stored locally and never throw to the UI.
 *
 * @param {{
 *   selectedDates: Array<{ id: string, title: string, emoji?: string }>,
 *   details?: string,
 *   visitorLabel?: string
 * }} params
 * @returns {Promise<{ ok: boolean, simulated?: boolean, pending?: boolean }>}
 */
export function sendDateChoice(params) {
  const selectedDates = (params.selectedDates || [])
    .map((item) => ({
      id: String(item.id || '').trim(),
      title: String(item.title || '').trim(),
      emoji: String(item.emoji || '').trim()
    }))
    .filter((item) => item.id && item.title);

  const payload = {
    type: 'date_choice',
    selectedDates: selectedDates,
    details: String(params.details == null ? '' : params.details).trim(),
    visitorLabel: params.visitorLabel || ''
  };

  return sendNotification(payload)
    .then((result) => result)
    .catch((err) => {
      storeDateChoicePending(payload);
      if (typeof console !== 'undefined' && console.error) {
        console.error(
          '[date-choice] notify failed',
          err && err.status ? 'status=' + err.status : err
        );
      }
      return { ok: false, pending: true };
    });
}

/**
 * Send the story-game finale answer via the shared notify pipeline.
 * Deduped by sessionStorage. Failures never throw to the UI.
 *
 * @param {{ question: string, answer: string }} params
 * @returns {Promise<{ ok: boolean, simulated?: boolean, pending?: boolean, skipped?: boolean }>}
 */
export function sendGameFinaleAnswer(params) {
  const question = String(params.question == null ? '' : params.question).trim();
  const answer = String(params.answer == null ? '' : params.answer).trim();
  if (!answer) {
    return Promise.resolve({ ok: false, skipped: true });
  }

  try {
    if (window.sessionStorage.getItem(GAME_FINALE_SENT_KEY) === '1') {
      return Promise.resolve({ ok: true, skipped: true });
    }
  } catch (e) {
    // ignore
  }

  const payload = {
    type: 'game_completed',
    question: question,
    answer: answer,
    completedChapters: 5
  };

  return sendNotification(payload)
    .then((result) => {
      markGameFinaleSent();
      return result;
    })
    .catch((err) => {
      if (typeof console !== 'undefined' && console.error) {
        console.error(
          '[game-finale] notify failed',
          err && err.status ? 'status=' + err.status : err
        );
      }
      return { ok: false, pending: true };
    });
}

function markGameFinaleSent() {
  try {
    window.sessionStorage.setItem(GAME_FINALE_SENT_KEY, '1');
  } catch (e) {
    // ignore
  }
}

function storeQuizPending(payload) {
  try {
    const prev = JSON.parse(window.sessionStorage.getItem(QUIZ_FAIL_KEY) || '[]');
    const withoutDup = prev.filter(
      (item) => !(item && item.questionId === payload.questionId)
    );
    withoutDup.push(payload);
    window.sessionStorage.setItem(QUIZ_FAIL_KEY, JSON.stringify(withoutDup));
  } catch (e) {
    // ignore storage errors
  }
}

function storeDateChoicePending(payload) {
  try {
    window.sessionStorage.setItem(DATE_FAIL_KEY, JSON.stringify(payload));
  } catch (e) {
    // ignore storage errors
  }
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
