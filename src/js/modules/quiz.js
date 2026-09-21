import { questions, quizAlbum, ui } from '../siteConfig';
import { sendQuizAnswer } from '../services/notify';
import { prefersReducedMotion } from './utils';

const DEDUPE_MS = 2500;
const QUIZ_LOCAL_KEY = 'nastyaQuizAnswers';

export function initQuiz() {
  const root = document.querySelector('[data-quiz]');
  if (!root || !questions.length) {
    return;
  }

  let index = 0;
  let phase = 'question'; // question | album | done
  let busy = false;
  let lastSubmitKey = '';
  let lastSubmitAt = 0;
  const localAnswers = loadLocalAnswers();

  function render(direction) {
    let enterClass = 'is-enter';
    if (!prefersReducedMotion() && direction === 'next') {
      enterClass = 'is-enter-next';
    }

    if (phase === 'album') {
      root.innerHTML = `
        <div class="quiz__card quiz__card_album ${enterClass}" data-quiz-card>
          <h3 class="quiz__question">${escapeHtml(quizAlbum.title)}</h3>
          <div class="quiz__lead">${nl2br(escapeHtml(quizAlbum.text))}</div>
          <div class="quiz__answers" role="group" aria-label="Відповіді">
            ${quizAlbum.answers
    .map(
      (answer, i) => `
              <button type="button" class="quiz__answer" data-album-answer="${i}">
                ${escapeHtml(answer)}
              </button>
            `
    )
    .join('')}
          </div>
          <p class="quiz__feedback" data-quiz-feedback hidden></p>
        </div>
      `;
      root.querySelectorAll('[data-album-answer]').forEach((btn) => {
        btn.addEventListener('click', () => onAlbumAnswer(btn));
      });
      requestAnimationFrame(() => revealCard(root));
      return;
    }

    const q = questions[index];
    const total = questions.length;
    const progress = `${index + 1} / ${total}`;

    root.innerHTML = `
      <div class="quiz__card ${enterClass}" data-quiz-card data-quiz-type="${q.type}">
        <p class="quiz__progress" aria-live="polite">${progress}</p>
        <h3 class="quiz__question">${nl2br(escapeHtml(q.question))}</h3>
        ${
  q.lead
    ? `<div class="quiz__lead">${nl2br(escapeHtml(q.lead))}</div>`
    : ''
}
        ${renderBody(q)}
        <p class="quiz__feedback" data-quiz-feedback hidden></p>
      </div>
    `;

    bindQuestion(q);
    requestAnimationFrame(() => revealCard(root));
  }

  function renderBody(q) {
    if (q.type === 'choice') {
      return `
        <div class="quiz__answers" role="group" aria-label="Відповіді">
          ${q.answers
    .map(
      (answer, i) => `
            <button type="button" class="quiz__answer" data-answer="${i}">
              ${escapeHtml(answer)}
            </button>
          `
    )
    .join('')}
        </div>
      `;
    }

    if (q.type === 'multi') {
      return `
        <div class="quiz__answers quiz__answers_multi" role="group" aria-label="Відповіді">
          ${q.answers
    .map(
      (answer, i) => `
            <button type="button" class="quiz__answer quiz__answer_multi" data-multi="${i}" aria-pressed="false">
              <span class="quiz__check" aria-hidden="true"></span>
              <span class="quiz__answer-label">${escapeHtml(answer)}</span>
            </button>
          `
    )
    .join('')}
        </div>
        <button type="button" class="btn btn_primary quiz__next" data-quiz-done disabled>
          ${escapeHtml(q.doneLabel || ui.quizDone)}
        </button>
      `;
    }

    const isArea = q.type === 'textarea';
    const tag = isArea ? 'textarea' : 'input';
    const extra = isArea
      ? 'rows="5"'
      : 'type="text" autocomplete="off"';
    const cls = isArea ? 'quiz__textarea' : 'quiz__input';

    return `
      <div class="quiz__free">
        <${tag}
          class="${cls}"
          data-quiz-input
          ${extra}
          placeholder="${escapeAttr(q.placeholder || '')}"
          aria-label="${escapeAttr(q.question)}"
        ></${tag}>
        <button type="button" class="btn btn_primary quiz__next" data-quiz-next disabled>
          ${escapeHtml(ui.quizNext)}
        </button>
      </div>
    `;
  }

  function bindQuestion(q) {
    if (q.type === 'choice') {
      root.querySelectorAll('[data-answer]').forEach((btn) => {
        btn.addEventListener('click', () => onChoice(btn, q));
      });
      return;
    }

    if (q.type === 'multi') {
      const done = root.querySelector('[data-quiz-done]');
      root.querySelectorAll('[data-multi]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (busy) {
            return;
          }
          const on = btn.getAttribute('aria-pressed') === 'true';
          btn.setAttribute('aria-pressed', on ? 'false' : 'true');
          btn.classList.toggle('is-selected', !on);
          const any = root.querySelectorAll('[data-multi].is-selected').length > 0;
          if (done) {
            done.disabled = !any;
          }
        });
      });
      if (done) {
        done.addEventListener('click', () => onMulti(q));
      }
      return;
    }

    const input = root.querySelector('[data-quiz-input]');
    const next = root.querySelector('[data-quiz-next]');
    if (!input || !next) {
      return;
    }

    const sync = () => {
      next.disabled = !String(input.value || '').trim();
    };
    input.addEventListener('input', sync);
    sync();

    next.addEventListener('click', () => onFree(q, input));

    if (q.type === 'text') {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (!next.disabled) {
            onFree(q, input);
          }
        }
      });
    }
  }

  function onChoice(btn, q) {
    if (busy) {
      return;
    }
    const chosen = Number(btn.getAttribute('data-answer'));
    const answerText = q.answers[chosen];
    const submitKey = q.id + '\0' + chosen;
    if (!beginSubmit(submitKey)) {
      return;
    }

    const hasCorrect = typeof q.correct === 'number';
    const buttons = root.querySelectorAll('[data-answer]');
    buttons.forEach((b) => {
      b.disabled = true;
      const i = Number(b.getAttribute('data-answer'));
      if (hasCorrect && i === q.correct) {
        b.classList.add('quiz__answer_correct');
      }
      if (hasCorrect && i === chosen && chosen !== q.correct) {
        b.classList.add('quiz__answer_soft');
      }
      if (!hasCorrect && i === chosen) {
        b.classList.add('quiz__answer_correct');
      }
    });

    let feedbackText = '';
    if (hasCorrect) {
      feedbackText =
        chosen === q.correct
          ? q.successText || ''
          : q.softText || ui.quizSoft;
    } else if (q.afterByAnswer && q.afterByAnswer[chosen]) {
      feedbackText = q.afterByAnswer[chosen];
    }

    showFeedback(feedbackText);
    persistAndNotify(q, answerText, 'choice', index + 1);
    scheduleNext();
  }

  function onMulti(q) {
    if (busy) {
      return;
    }
    const selected = Array.prototype.slice
      .call(root.querySelectorAll('[data-multi].is-selected'))
      .map((btn) => Number(btn.getAttribute('data-multi')))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);

    if (!selected.length) {
      return;
    }

    const answerList = selected.map((i) => q.answers[i]);
    const submitKey = q.id + '\0' + selected.join(',');
    if (!beginSubmit(submitKey)) {
      return;
    }

    const correctSet = Array.isArray(q.correct) ? q.correct : null;
    root.querySelectorAll('[data-multi]').forEach((b) => {
      b.disabled = true;
      const i = Number(b.getAttribute('data-multi'));
      const picked = selected.indexOf(i) !== -1;
      if (correctSet) {
        const isRight = correctSet.indexOf(i) !== -1;
        if (isRight) {
          b.classList.add('quiz__answer_correct');
        } else if (picked) {
          b.classList.add('quiz__answer_soft');
        }
      } else if (picked) {
        b.classList.add('quiz__answer_correct');
      }
    });

    const done = root.querySelector('[data-quiz-done]');
    if (done) {
      done.disabled = true;
    }

    let feedbackText = '';
    if (correctSet) {
      const ok =
        selected.length === correctSet.length &&
        selected.every((i) => correctSet.indexOf(i) !== -1);
      feedbackText = ok
        ? q.successText || ''
        : q.softText || ui.quizSoft;
    }

    showFeedback(feedbackText);
    persistAndNotify(q, answerList, 'multi', index + 1);
    scheduleNext();
  }

  function onFree(q, input) {
    if (busy) {
      return;
    }
    const value = String(input.value || '').trim();
    if (!value) {
      return;
    }

    const submitKey = q.id + '\0' + value;
    if (!beginSubmit(submitKey)) {
      return;
    }

    input.disabled = true;
    const next = root.querySelector('[data-quiz-next]');
    if (next) {
      next.disabled = true;
    }

    showFeedback(q.afterText || '');
    persistAndNotify(q, value, q.type, index + 1);
    scheduleNext(q.afterText ? 1800 : undefined);
  }

  function onAlbumAnswer(btn) {
    if (busy) {
      return;
    }
    const chosen = Number(btn.getAttribute('data-album-answer'));
    const answerText = quizAlbum.answers[chosen];
    const submitKey = quizAlbum.id + '\0' + chosen;
    if (!beginSubmit(submitKey)) {
      return;
    }

    root.querySelectorAll('[data-album-answer]').forEach((b) => {
      b.disabled = true;
      if (Number(b.getAttribute('data-album-answer')) === chosen) {
        b.classList.add('quiz__answer_correct');
      }
    });

    showFeedback(quizAlbum.afterText);
    saveLocal(quizAlbum.id, answerText);
    sendQuizAnswer({
      questionId: quizAlbum.id,
      question: quizAlbum.title,
      answer: answerText,
      questionNumber: 0,
      answerType: 'album'
    });

    // Stay on the album card with feedback; do not unlock to avoid double-send.
    phase = 'done';
  }

  function beginSubmit(submitKey) {
    const now = Date.now();
    if (busy) {
      return false;
    }
    if (submitKey === lastSubmitKey && now - lastSubmitAt < DEDUPE_MS) {
      return false;
    }
    busy = true;
    lastSubmitKey = submitKey;
    lastSubmitAt = now;
    return true;
  }

  function persistAndNotify(q, answer, answerType, questionNumber) {
    saveLocal(q.id, answer);
    sendQuizAnswer({
      questionId: q.id,
      question: q.question,
      answer: answer,
      questionNumber: questionNumber,
      answerType: answerType
    });
  }

  function showFeedback(text) {
    const feedback = root.querySelector('[data-quiz-feedback]');
    if (!feedback || !text) {
      return;
    }
    feedback.hidden = false;
    feedback.textContent = text;
  }

  function scheduleNext(customDelay) {
    let delay = 1100;
    if (prefersReducedMotion()) {
      delay = 400;
    }
    if (customDelay != null) {
      delay = prefersReducedMotion() ? Math.min(customDelay, 500) : customDelay;
    }

    window.setTimeout(() => {
      goNext();
    }, delay);
  }

  function goNext() {
    const card = root.querySelector('[data-quiz-card]');
    if (card && !prefersReducedMotion()) {
      card.classList.add('is-leave');
      window.setTimeout(advance, 280);
    } else {
      advance();
    }
  }

  function advance() {
    busy = false;
    if (index >= questions.length - 1) {
      phase = 'album';
      render('next');
      return;
    }
    index += 1;
    render('next');
  }

  function saveLocal(id, answer) {
    localAnswers[id] = {
      answer: answer,
      at: new Date().toISOString()
    };
    try {
      window.sessionStorage.setItem(QUIZ_LOCAL_KEY, JSON.stringify(localAnswers));
    } catch (e) {
      // ignore
    }
  }

  render();
}

function revealCard(root) {
  const card = root.querySelector('[data-quiz-card]');
  if (!card) {
    return;
  }
  card.classList.add('is-visible');
}

function loadLocalAnswers() {
  try {
    return JSON.parse(window.sessionStorage.getItem(QUIZ_LOCAL_KEY) || '{}') || {};
  } catch (e) {
    return {};
  }
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

function nl2br(value) {
  return String(value).replace(/\n/g, '<br>');
}
