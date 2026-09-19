import { moods, moodSection } from '../siteConfig';
import { sendNotification } from '../services/notify';
import { playMoodSelectTransition } from './mood-theme';

const DEDUPE_MS = 3000;

export function initMood() {
  const root = document.querySelector('[data-mood]');
  if (!root) {
    return;
  }

  let selected = null;
  let isSubmitting = false;
  let lastSubmitKey = '';
  let lastSubmitAt = 0;

  root.innerHTML = `
    <div class="mood__grid" data-mood-grid>
      ${moods
    .map(
      (m) => `
        <button type="button" class="mood__card" data-mood-id="${m.id}" data-mood-emoji="${m.emoji}" data-mood-label="${m.label}">
          <span class="mood__emoji" aria-hidden="true">${m.emoji}</span>
          <span class="mood__label">${m.label}</span>
        </button>
      `
    )
    .join('')}
    </div>
    <div class="mood__followup" data-mood-followup hidden>
      <label class="mood__note-label" for="mood-note">${moodSection.noteLabel}</label>
      <textarea id="mood-note" class="mood__note" data-mood-note rows="3" placeholder="${moodSection.notePlaceholder}"></textarea>
      <button type="button" class="btn btn_primary mood__submit" data-mood-submit>${moodSection.submit}</button>
      <p class="mood__thanks" data-mood-thanks hidden>${moodSection.thanks}</p>
      <p class="mood__error" data-mood-error hidden></p>
    </div>
  `;

  const grid = root.querySelector('[data-mood-grid]');
  const followup = root.querySelector('[data-mood-followup]');
  const note = root.querySelector('[data-mood-note]');
  const submit = root.querySelector('[data-mood-submit]');
  const thanks = root.querySelector('[data-mood-thanks]');
  const error = root.querySelector('[data-mood-error]');

  // Відновити виділення картки, якщо mood уже в сесії
  const current = document.documentElement.dataset.mood;
  if (current) {
    const active = grid.querySelector('[data-mood-id="' + current + '"]');
    if (active) {
      selected = {
        id: active.getAttribute('data-mood-id'),
        emoji: active.getAttribute('data-mood-emoji'),
        label: active.getAttribute('data-mood-label')
      };
      grid.querySelectorAll('.mood__card').forEach((c) => {
        c.classList.toggle('is-selected', c === active);
        c.classList.toggle('is-dim', c !== active);
      });
      followup.hidden = false;
    }
  }

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('[data-mood-id]');
    if (!card) {
      return;
    }
    selected = {
      id: card.getAttribute('data-mood-id'),
      emoji: card.getAttribute('data-mood-emoji'),
      label: card.getAttribute('data-mood-label')
    };
    grid.querySelectorAll('.mood__card').forEach((c) => {
      c.classList.toggle('is-selected', c === card);
      c.classList.toggle('is-dim', c !== card);
    });
    followup.hidden = false;
    thanks.hidden = true;
    error.hidden = true;

    // Тема застосовується одразу — навіть якщо пізніше API впаде
    playMoodSelectTransition(card, selected.id);
  });

  submit.addEventListener('click', () => {
    if (!selected || isSubmitting) {
      return;
    }

    const message = (note.value || '').trim();
    const submitKey = selected.id + '\0' + message;
    const now = Date.now();
    if (submitKey === lastSubmitKey && now - lastSubmitAt < DEDUPE_MS) {
      return;
    }

    isSubmitting = true;
    submit.disabled = true;
    error.hidden = true;
    thanks.hidden = true;

    sendNotification({
      type: 'mood',
      mood: selected.label,
      emoji: selected.emoji,
      message: message
    })
      .then(() => {
        lastSubmitKey = submitKey;
        lastSubmitAt = Date.now();
        note.value = '';
        thanks.hidden = false;
        error.hidden = true;
      })
      .catch((err) => {
        if (typeof console !== 'undefined' && console.error) {
          console.error('[mood] notify failed', err && err.status ? 'status=' + err.status : err);
        }
        error.hidden = false;
        if (err && err.status === 429) {
          error.textContent = 'Забагато запитів. Спробуй ще раз трохи згодом.';
        } else {
          error.textContent = 'Не вийшло надіслати. Спробуй ще раз трохи згодом.';
        }
      })
      .finally(() => {
        isSubmitting = false;
        submit.disabled = false;
        submit.hidden = false;
        note.disabled = false;
      });
  });
}
