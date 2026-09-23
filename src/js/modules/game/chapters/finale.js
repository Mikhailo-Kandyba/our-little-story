import { clearNode, el, spawnParticles, wait } from '../game-dom';
import { playHeartSound, playSuccessSound, playUiSound } from '../game-audio';
import { sendGameFinaleAnswer } from '../../../services/notify';
import { loadGameState } from '../game-state';
import { prefersReducedMotion } from '../../utils';

/**
 * Final scene — assembled heart + gentle optional question.
 */
export function mountFinale(root, ctx) {
  const c = ctx.content.finale;
  let destroyed = false;
  let custom = false;
  let submitted = false;
  let sending = false;

  clearNode(root);
  const wrap = el('div', 'sg-chapter sg-finale');
  const heartWrap = el('div', 'sg-finale__heart-wrap');
  const photo = el('img', 'sg-finale__photo', {
    src: c.revealPhoto,
    alt: 'Спогад'
  });
  const heart = el('div', 'sg-finale__heart', { text: '❤️', 'aria-hidden': 'true' });
  heartWrap.appendChild(photo);
  heartWrap.appendChild(heart);
  wrap.appendChild(heartWrap);

  const lines = el('div', 'sg-finale__lines');
  const line1 = el('p', 'sg-finale__line', { text: c.foundAll });
  const line2 = el('p', 'sg-finale__line', { text: c.oneQuestion });
  line1.hidden = true;
  line2.hidden = true;
  lines.appendChild(line1);
  lines.appendChild(line2);
  wrap.appendChild(lines);

  const form = el('div', 'sg-finale__form');
  form.hidden = true;
  form.appendChild(el('p', 'sg-finale__question', { text: c.question }));

  if (c.notifyNote) {
    form.appendChild(el('p', 'sg-finale__notify-note', { text: c.notifyNote }));
  }

  const options = el('div', 'sg-choices');
  let selected = '';

  (c.options || []).forEach(function (label) {
    const btn = el('button', 'sg-choice', { type: 'button', text: label });
    btn.addEventListener('click', function () {
      if (submitted) {
        return;
      }
      playUiSound();
      custom = false;
      selected = label;
      options.querySelectorAll('.sg-choice').forEach(function (b) {
        b.classList.remove('is-active');
      });
      btn.classList.add('is-active');
      customBox.hidden = true;
    });
    options.appendChild(btn);
  });

  const customBtn = el('button', 'sg-choice', {
    type: 'button',
    text: c.customOption
  });
  customBtn.addEventListener('click', function () {
    if (submitted) {
      return;
    }
    playUiSound();
    custom = true;
    selected = '';
    options.querySelectorAll('.sg-choice').forEach(function (b) {
      b.classList.remove('is-active');
    });
    customBtn.classList.add('is-active');
    customBox.hidden = false;
    textarea.focus();
  });
  options.appendChild(customBtn);
  form.appendChild(options);

  const customBox = el('div', 'sg-finale__custom');
  customBox.hidden = true;
  const textarea = el('textarea', 'sg-finale__textarea', {
    rows: '3',
    placeholder: c.customPlaceholder || '',
    maxlength: '400'
  });
  customBox.appendChild(textarea);
  form.appendChild(customBox);

  const saveBtn = el('button', 'btn btn_primary sg-btn', {
    type: 'button',
    text: c.save
  });
  saveBtn.addEventListener('click', onSave);
  form.appendChild(saveBtn);
  wrap.appendChild(form);

  const thanks = el('div', 'sg-finale__thanks');
  thanks.hidden = true;
  thanks.appendChild(el('p', 'sg-finale__thanks-text', { text: c.thanks }));
  const actions = el('div', 'sg-finale__actions');
  const replay = el('button', 'btn sg-btn', { type: 'button', text: c.replay });
  const back = el('button', 'btn btn_primary sg-btn', {
    type: 'button',
    text: c.backToSite
  });
  replay.addEventListener('click', function () {
    playUiSound();
    ctx.onReplay();
  });
  back.addEventListener('click', function () {
    playUiSound();
    ctx.onClose();
  });
  actions.appendChild(replay);
  actions.appendChild(back);
  thanks.appendChild(actions);
  wrap.appendChild(thanks);
  root.appendChild(wrap);

  const existing = loadGameState();
  const alreadyAnswered = Boolean(existing.finalAnswer && String(existing.finalAnswer).trim());

  if (alreadyAnswered) {
    submitted = true;
    showThanksImmediate();
  } else {
    runOpeningSequence();
  }

  function runOpeningSequence() {
    spawnParticles(heartWrap, 14);
    heart.classList.add('is-enter');
    playHeartSound();

    const step = prefersReducedMotion() ? 200 : 900;
    wait(step)
      .then(function () {
        if (destroyed) {
          return;
        }
        line1.hidden = false;
        line1.classList.add('is-show');
        return wait(step + 200);
      })
      .then(function () {
        if (destroyed) {
          return;
        }
        line2.hidden = false;
        line2.classList.add('is-show');
        return wait(step);
      })
      .then(function () {
        if (destroyed) {
          return;
        }
        form.hidden = false;
        form.classList.add('is-show');
      });
  }

  function showThanksImmediate() {
    line1.hidden = false;
    line1.classList.add('is-show');
    line2.hidden = false;
    line2.classList.add('is-show');
    heart.classList.add('is-enter');
    form.hidden = true;
    thanks.hidden = false;
    thanks.classList.add('is-show');
  }

  function onSave() {
    if (submitted || sending) {
      return;
    }
    let answer = selected;
    if (custom) {
      answer = (textarea.value || '').trim();
    }
    if (!answer) {
      textarea.focus();
      customBox.hidden = false;
      custom = true;
      customBtn.classList.add('is-active');
      return;
    }

    submitted = true;
    sending = true;
    saveBtn.disabled = true;
    playSuccessSound();

    // Soft-fail: Telegram errors must not block the finale UX.
    sendGameFinaleAnswer({
      question: c.question,
      answer: answer
    }).then(
      function () {
        sending = false;
      },
      function () {
        sending = false;
      }
    );

    form.hidden = true;
    thanks.hidden = false;
    thanks.classList.add('is-show');
    spawnParticles(heartWrap, 10);
    ctx.onAnswer(answer);
  }

  return {
    destroy: function () {
      destroyed = true;
      clearNode(root);
    }
  };
}
