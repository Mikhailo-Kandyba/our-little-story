import { clearNode, el, spawnParticles, wait } from '../game-dom';
import { playHeartSound, playUiSound } from '../game-audio';
import { prefersReducedMotion } from '../../utils';

const OPEN_MS = 3400;

/**
 * Chapter 5 — romantic envelope; open to reveal Carpathians photo.
 */
export function mountHiddenHeart(root, ctx) {
  const c = ctx.content.hidden;
  let destroyed = false;
  let opened = false;
  let completed = false;

  clearNode(root);

  const wrap = el('div', 'sg-chapter sg-envelope');
  wrap.appendChild(el('h2', 'sg-chapter__title sg-envelope__title', { text: c.title }));
  wrap.appendChild(el('p', 'sg-chapter__sub sg-envelope__sub', { text: c.subtitle }));

  const stage = el('div', 'sg-envelope__stage');

  const envelope = el('button', 'sg-envelope__btn', {
    type: 'button',
    'aria-label': c.ariaLabel || 'Відкрити конверт',
    'aria-expanded': 'false'
  });

  const body = el('div', 'sg-envelope__body', { 'aria-hidden': 'true' });
  body.appendChild(el('div', 'sg-envelope__back'));

  const letter = el('div', 'sg-envelope__letter');
  const polaroid = el('div', 'sg-envelope__polaroid');
  polaroid.appendChild(
    el('img', 'sg-envelope__photo', {
      src: c.photo,
      alt: c.photoAlt || 'Наш спогад'
    })
  );
  letter.appendChild(polaroid);
  body.appendChild(letter);

  body.appendChild(el('div', 'sg-envelope__pocket'));
  body.appendChild(el('div', 'sg-envelope__flap'));
  body.appendChild(
    el('span', 'sg-envelope__seal', {
      text: '♥',
      'aria-hidden': 'true'
    })
  );

  envelope.appendChild(body);
  stage.appendChild(envelope);
  stage.appendChild(el('p', 'sg-envelope__hint', { text: c.hint }));

  const reveal = el('div', 'sg-envelope__reveal');
  stage.appendChild(reveal);

  const after = el('div', 'sg-envelope__after');
  after.appendChild(el('p', 'sg-envelope__caption', { text: c.caption }));
  const continueBtn = el('button', 'btn btn_primary sg-btn sg-envelope__continue', {
    type: 'button',
    text: c.continueButton || 'Продовжити ❤️'
  });
  after.appendChild(continueBtn);
  stage.appendChild(after);

  wrap.appendChild(stage);
  root.appendChild(wrap);

  const hint = stage.querySelector('.sg-envelope__hint');

  requestAnimationFrame(function () {
    if (!destroyed) {
      wrap.classList.add('is-ready');
    }
  });

  if (prefersReducedMotion()) {
    promotePhoto();
    showOpenedChrome();
  }

  envelope.addEventListener('click', onOpen);

  continueBtn.addEventListener('click', function () {
    if (completed || destroyed) {
      return;
    }
    completed = true;
    playUiSound();
    ctx.onComplete({});
  });

  function onOpen() {
    if (opened || destroyed) {
      return;
    }
    opened = true;
    playHeartSound();
    envelope.setAttribute('aria-expanded', 'true');
    envelope.disabled = true;
    envelope.classList.add('is-opening');
    stage.classList.add('is-opening');
    if (hint) {
      hint.classList.add('is-hide');
    }

    if (prefersReducedMotion()) {
      promotePhoto();
      finishOpen();
      return;
    }

    wait(OPEN_MS).then(function () {
      if (destroyed) {
        return;
      }
      promotePhoto();
      finishOpen();
    });
  }

  function promotePhoto() {
    if (polaroid.parentNode !== reveal) {
      reveal.appendChild(polaroid);
    }
    reveal.classList.add('is-show');
  }

  function showOpenedChrome() {
    opened = true;
    envelope.disabled = true;
    envelope.setAttribute('aria-expanded', 'true');
    envelope.classList.add('is-open');
    stage.classList.add('is-open');
    if (hint) {
      hint.classList.add('is-hide');
    }
    after.classList.add('is-show');
  }

  function finishOpen() {
    envelope.classList.remove('is-opening');
    envelope.classList.add('is-open');
    stage.classList.remove('is-opening');
    stage.classList.add('is-open');
    spawnParticles(stage, 12);
    wait(prefersReducedMotion() ? 50 : 450).then(function () {
      if (destroyed) {
        return;
      }
      after.classList.add('is-show');
      continueBtn.focus();
    });
  }

  return {
    destroy: function () {
      destroyed = true;
      clearNode(root);
    }
  };
}
