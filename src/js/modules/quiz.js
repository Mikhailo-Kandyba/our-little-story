import { questions, quizFinale, ui } from '../siteConfig';
import { prefersReducedMotion } from './utils';

export function initQuiz() {
  const root = document.querySelector('[data-quiz]');
  if (!root || !questions.length) {
    return;
  }

  let index = 0;

  function render() {
    if (index >= questions.length) {
      root.innerHTML = `
        <div class="quiz__finale" data-reveal>
          <p class="quiz__finale-text">${quizFinale}</p>
        </div>
      `;
      return;
    }

    const q = questions[index];
    root.innerHTML = `
      <div class="quiz__card" data-quiz-card>
        <p class="quiz__progress">${ui.questionOf} ${index + 1} ${ui.of} ${questions.length}</p>
        <h3 class="quiz__question">${q.question}</h3>
        <div class="quiz__answers" role="group" aria-label="Відповіді">
          ${q.answers
    .map(
      (answer, i) => `
            <button type="button" class="quiz__answer" data-answer="${i}">${answer}</button>
          `
    )
    .join('')}
        </div>
        <p class="quiz__feedback" data-quiz-feedback hidden></p>
      </div>
    `;

    root.querySelectorAll('[data-answer]').forEach((btn) => {
      btn.addEventListener('click', () => onAnswer(btn, q));
    });
  }

  function onAnswer(btn, q) {
    const chosen = Number(btn.getAttribute('data-answer'));
    const feedback = root.querySelector('[data-quiz-feedback]');
    const buttons = root.querySelectorAll('[data-answer]');
    buttons.forEach((b) => {
      b.disabled = true;
      const i = Number(b.getAttribute('data-answer'));
      if (i === q.correct) {
        b.classList.add('quiz__answer_correct');
      }
      if (i === chosen && chosen !== q.correct) {
        b.classList.add('quiz__answer_soft');
      }
    });

    if (feedback) {
      feedback.hidden = false;
      feedback.textContent =
        chosen === q.correct ? q.successText : ui.quizSoft;
    }

    const delay = prefersReducedMotion() ? 400 : 1100;
    window.setTimeout(() => {
      index += 1;
      render();
    }, delay);
  }

  render();
}
