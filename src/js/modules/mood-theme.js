import { moodAtmosphere, MOOD_STORAGE_KEY } from '../siteConfig';
import { prefersReducedMotion } from './utils';
import { updateFloatersForMood } from './effects';

/**
 * Застосовує атмосферу настрою (CSS data-mood + floaters).
 * Незалежно від sendNotification.
 */
export function applyMoodTheme(moodId, options) {
  const opts = options || {};
  const id = moodAtmosphere[moodId] ? moodId : null;
  if (!id) {
    return;
  }

  const root = document.documentElement;
  root.dataset.mood = id;
  document.body.dataset.mood = id;

  try {
    window.sessionStorage.setItem(MOOD_STORAGE_KEY, id);
  } catch (err) {
    // ignore
  }

  updateFloatersForMood(id);

  if (opts.showMessage !== false) {
    showMoodAtmosphereMessage(moodAtmosphere[id].message);
  }

  if (moodAtmosphere[id].sparkle && !prefersReducedMotion()) {
    root.classList.add('has-mood-sparkle');
  } else {
    root.classList.remove('has-mood-sparkle');
  }
}

export function restoreMoodTheme() {
  let saved = null;
  try {
    saved = window.sessionStorage.getItem(MOOD_STORAGE_KEY);
  } catch (err) {
    saved = null;
  }
  if (saved && moodAtmosphere[saved]) {
    applyMoodTheme(saved, { showMessage: false });
  }
}

export function playMoodSelectTransition(card, moodId, done) {
  const reduce = prefersReducedMotion();
  const emoji = card.querySelector('.mood__emoji');

  if (emoji && !reduce) {
    emoji.classList.add('is-popping');
    window.setTimeout(() => emoji.classList.remove('is-popping'), 600);
  }

  if (!reduce) {
    spawnMoodWave(card, moodId);
  }

  const delay = reduce ? 0 : 450;
  window.setTimeout(() => {
    applyMoodTheme(moodId);
    if (typeof done === 'function') {
      done();
    }
  }, delay);
}

function spawnMoodWave(card, moodId) {
  const rect = card.getBoundingClientRect();
  const wave = document.createElement('div');
  wave.className = 'mood-wave mood-wave_' + moodId;
  wave.setAttribute('aria-hidden', 'true');
  wave.style.left = rect.left + rect.width / 2 + 'px';
  wave.style.top = rect.top + rect.height / 2 + 'px';
  document.body.appendChild(wave);
  requestAnimationFrame(() => wave.classList.add('is-active'));
  window.setTimeout(() => {
    if (wave.parentNode) {
      wave.parentNode.removeChild(wave);
    }
  }, 1400);
}

function showMoodAtmosphereMessage(text) {
  let toast = document.querySelector('[data-mood-toast]');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'mood-toast';
    toast.setAttribute('data-mood-toast', '');
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.remove('is-out');
  toast.classList.add('is-visible');

  window.clearTimeout(showMoodAtmosphereMessage._timer);
  showMoodAtmosphereMessage._timer = window.setTimeout(() => {
    toast.classList.add('is-out');
    toast.classList.remove('is-visible');
  }, 3000);
}
