import { dateChoiceSection, dateChoices, girlName } from '../siteConfig';
import { sendDateChoice } from '../services/notify';
import { prefersReducedMotion } from './utils';

const DEDUPE_MS = 3000;
const MAX_SELECT = 2;
const DONE_KEY = 'nastyaDateChoiceDone';
const FORM_LEAVE_MS = 450;
const HEART_ANIM_MS = 3400;

const HEART_SVG = `
  <svg class="date-choice-heart-fx__heart" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="date-heart-grad" x1="12%" y1="8%" x2="88%" y2="92%">
        <stop offset="0%" stop-color="#ffb6c8"/>
        <stop offset="45%" stop-color="#e8a0b4"/>
        <stop offset="100%" stop-color="#d4849c"/>
      </linearGradient>
      <filter id="date-heart-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.4" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path
      fill="url(#date-heart-grad)"
      filter="url(#date-heart-glow)"
      d="M32 56.5C20.8 49.1 8 39.2 8 24.8 8 15.4 15.2 9 23.4 9c4.7 0 8.9 2.2 11.6 5.6C37.7 11.2 41.9 9 46.6 9 54.8 9 62 15.4 62 24.8c0 14.4-12.8 24.3-24 31.7-.8.5-1.7.8-2.5.8s-1.7-.3-2.5-.8z"
    />
  </svg>
`;

/**
 * Date-choice section — always visible after quiz in the page flow.
 */
export function initDateChoice() {
  const section = document.querySelector('[data-date-choice]');
  const root = document.querySelector('[data-date-choice-root]');
  if (!section || !root || !dateChoices.length) {
    return;
  }

  hydrateSectionCopy(section);

  let selected = [];
  let busy = false;
  let submitted = false;
  let lastSubmitKey = '';
  let lastSubmitAt = 0;
  let limitTimer = null;

  try {
    if (window.sessionStorage.getItem(DONE_KEY) === '1') {
      submitted = true;
    }
  } catch (e) {
    // ignore
  }

  render();

  function render() {
    if (submitted) {
      root.innerHTML = thanksMarkup(true);
      return;
    }

    root.innerHTML = `
      <div class="date-choice__form" data-date-form>
        <p class="date-choice__hint">${escapeHtml(dateChoiceSection.hint)}</p>
        <p class="date-choice__limit" data-date-limit hidden>${escapeHtml(
    dateChoiceSection.limitMessage
  )}</p>
        <div class="date-choice__grid" role="group" aria-label="Варіанти побачень">
          ${dateChoices
    .map(
      (item) => `
            <button
              type="button"
              class="date-choice__card"
              data-date-id="${escapeAttr(item.id)}"
              aria-pressed="false"
            >
              <div class="date-choice__media">
                <img class="date-choice__image" src="${escapeAttr(item.image)}" alt="" loading="lazy" data-fallback>
                <span class="date-choice__check" aria-hidden="true">♥</span>
              </div>
              <div class="date-choice__body">
                <span class="date-choice__emoji" aria-hidden="true">${escapeHtml(
    item.emoji
  )}</span>
                <h3 class="date-choice__title">${escapeHtml(item.title)}</h3>
                <p class="date-choice__desc">${escapeHtml(item.description)}</p>
              </div>
            </button>
          `
    )
    .join('')}
        </div>
        <div class="date-choice__details" data-date-details>
          <h3 class="date-choice__details-title">${escapeHtml(
    dateChoiceSection.detailsTitle
  )}</h3>
          <p class="date-choice__details-lead">${escapeHtml(
    dateChoiceSection.detailsLead
  )}</p>
          <textarea
            class="date-choice__textarea"
            data-date-details-input
            rows="4"
            placeholder="${escapeAttr(dateChoiceSection.detailsPlaceholder)}"
            aria-label="${escapeAttr(dateChoiceSection.detailsTitle)}"
          ></textarea>
        </div>
        <div class="date-choice__actions">
          <button type="button" class="btn btn_primary date-choice__submit" data-date-submit disabled>
            ${escapeHtml(dateChoiceSection.submit)}
          </button>
        </div>
      </div>
      ${thanksMarkup(false)}
    `;

    root.querySelectorAll('[data-date-id]').forEach((btn) => {
      btn.addEventListener('click', () => onToggle(btn));
    });

    const submit = root.querySelector('[data-date-submit]');
    if (submit) {
      submit.addEventListener('click', onSubmit);
    }
  }

  function onToggle(btn) {
    if (busy || submitted) {
      return;
    }
    const id = btn.getAttribute('data-date-id');
    const idx = selected.indexOf(id);
    if (idx !== -1) {
      selected.splice(idx, 1);
    } else if (selected.length >= MAX_SELECT) {
      showLimit();
      return;
    } else {
      selected.push(id);
    }
    syncSelectionUi();
  }

  function syncSelectionUi() {
    root.querySelectorAll('[data-date-id]').forEach((btn) => {
      const id = btn.getAttribute('data-date-id');
      const on = selected.indexOf(id) !== -1;
      btn.classList.toggle('is-selected', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    const details = root.querySelector('[data-date-details]');
    const submit = root.querySelector('[data-date-submit]');
    const has = selected.length > 0;
    if (details) {
      details.classList.toggle('is-show', has);
    }
    if (submit) {
      submit.disabled = !has || busy;
    }
  }

  function showLimit() {
    const el = root.querySelector('[data-date-limit]');
    if (!el) {
      return;
    }
    el.hidden = false;
    el.classList.add('is-show');
    if (limitTimer) {
      window.clearTimeout(limitTimer);
    }
    limitTimer = window.setTimeout(() => {
      el.classList.remove('is-show');
      window.setTimeout(() => {
        el.hidden = true;
      }, 350);
    }, 2200);
  }

  function onSubmit() {
    if (busy || submitted || !selected.length) {
      return;
    }

    const picks = selected
      .map((id) => dateChoices.find((item) => item.id === id))
      .filter(Boolean)
      .map((item) => ({
        id: item.id,
        title: item.title,
        emoji: item.emoji
      }));

    const input = root.querySelector('[data-date-details-input]');
    const details = input ? String(input.value || '').trim() : '';
    const submitKey =
      picks
        .map((p) => p.id)
        .sort()
        .join(',') +
      '\0' +
      details;
    const now = Date.now();
    if (submitKey === lastSubmitKey && now - lastSubmitAt < DEDUPE_MS) {
      return;
    }

    busy = true;
    lastSubmitKey = submitKey;
    lastSubmitAt = now;

    const submitBtn = root.querySelector('[data-date-submit]');
    if (submitBtn) {
      submitBtn.disabled = true;
    }
    root.querySelectorAll('[data-date-id]').forEach((btn) => {
      btn.disabled = true;
    });
    if (input) {
      input.disabled = true;
    }

    sendDateChoice({
      selectedDates: picks,
      details: details,
      visitorLabel: girlName
    }).then(() => {
      submitted = true;
      try {
        window.sessionStorage.setItem(DONE_KEY, '1');
      } catch (e) {
        // ignore
      }
      showThanks(true);
    });
  }

  function showThanks(animate) {
    if (!animate || prefersReducedMotion()) {
      revealThanks();
      busy = false;
      return;
    }

    playHeartCelebration().then(() => {
      revealThanks();
      busy = false;
    });
  }

  function revealThanks() {
    const form = root.querySelector('[data-date-form]');
    const thanks = root.querySelector('[data-date-thanks]');
    if (form) {
      form.classList.add('is-hidden');
      form.classList.remove('is-leaving');
    }
    if (thanks) {
      thanks.hidden = false;
      requestAnimationFrame(() => {
        thanks.classList.add('is-show');
      });
    } else {
      root.innerHTML = thanksMarkup(true);
    }
  }

  function playHeartCelebration() {
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) {
          return;
        }
        settled = true;
        if (fx.parentNode) {
          fx.parentNode.removeChild(fx);
        }
        resolve();
      };

      const form = root.querySelector('[data-date-form]');
      if (form) {
        form.classList.add('is-leaving');
      }

      const fx = document.createElement('div');
      fx.className = 'date-choice-heart-fx';
      fx.setAttribute('aria-hidden', 'true');
      fx.innerHTML = HEART_SVG;

      window.setTimeout(() => {
        if (form) {
          form.classList.add('is-hidden');
        }
        document.body.appendChild(fx);
        requestAnimationFrame(() => {
          fx.classList.add('is-play');
        });

        const heart = fx.querySelector('.date-choice-heart-fx__heart');
        if (heart) {
          heart.addEventListener('animationend', finish, { once: true });
        }
        window.setTimeout(finish, HEART_ANIM_MS + 200);
      }, FORM_LEAVE_MS);
    });
  }
}

function hydrateSectionCopy(section) {
  const eyebrow = section.querySelector('[data-date-choice-eyebrow]');
  const heading = section.querySelector('[data-date-choice-heading]');
  const lead = section.querySelector('[data-date-choice-lead]');
  if (eyebrow) {
    eyebrow.textContent = dateChoiceSection.eyebrow || '';
  }
  if (heading) {
    heading.textContent = dateChoiceSection.heading || '';
  }
  if (lead) {
    lead.textContent = dateChoiceSection.lead || '';
  }
}

function thanksMarkup(visible) {
  const hearts = prefersReducedMotion()
    ? ''
    : `
      <div class="date-choice__hearts" aria-hidden="true">
        <span class="date-choice__heart">❤️</span>
        <span class="date-choice__heart">💕</span>
        <span class="date-choice__heart">❤️</span>
        <span class="date-choice__heart">💗</span>
      </div>
    `;
  return `
    <div class="date-choice__thanks${visible ? ' is-show' : ''}" data-date-thanks ${
  visible ? '' : 'hidden'
}>
      ${hearts}
      <p class="date-choice__thanks-text">${escapeHtml(dateChoiceSection.thanks)}</p>
      <p class="date-choice__thanks-note">${escapeHtml(dateChoiceSection.thanksNote)}</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}
