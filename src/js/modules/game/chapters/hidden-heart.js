import { clearNode, el, spawnParticles, wait } from '../game-dom';
import { playHeartSound, playUiSound } from '../game-audio';
import { prefersReducedMotion } from '../../utils';

/**
 * Chapter 5 — hidden-object scene; find the last heart fragment.
 */
export function mountHiddenHeart(root, ctx) {
  const c = ctx.content.hidden;
  let destroyed = false;
  let found = false;

  clearNode(root);
  const wrap = el('div', 'sg-chapter sg-hidden');
  wrap.appendChild(el('h2', 'sg-chapter__title', { text: c.title }));
  wrap.appendChild(el('p', 'sg-chapter__sub', { text: c.subtitle }));

  const scene = el('div', 'sg-hidden__scene');
  const toast = el('p', 'sg-hidden__toast', { hidden: 'true' });

  const isMobile = window.innerWidth < 600;
  const decoys = isMobile
    ? [
      { cls: 'sg-hidden__deco sg-hidden__star', text: '✨', x: 14, y: 16 },
      { cls: 'sg-hidden__deco sg-hidden__flower', text: '🌸', x: 82, y: 20 },
      { cls: 'sg-hidden__deco sg-hidden__env', text: '💌', x: 16, y: 72 },
      { cls: 'sg-hidden__deco sg-hidden__star', text: '⭐', x: 78, y: 76 },
      { cls: 'sg-hidden__deco sg-hidden__flower', text: '🌷', x: 50, y: 12 }
    ]
    : [
      { cls: 'sg-hidden__deco sg-hidden__star', text: '✨', x: 12, y: 18 },
      { cls: 'sg-hidden__deco sg-hidden__flower', text: '🌸', x: 78, y: 22 },
      { cls: 'sg-hidden__deco sg-hidden__env', text: '💌', x: 18, y: 68 },
      { cls: 'sg-hidden__deco sg-hidden__star', text: '⭐', x: 70, y: 72 },
      { cls: 'sg-hidden__deco sg-hidden__flower', text: '🌷', x: 48, y: 14 },
      { cls: 'sg-hidden__deco sg-hidden__env', text: '✉️', x: 86, y: 48 },
      { cls: 'sg-hidden__deco sg-hidden__heart-soft', text: '♡', x: 8, y: 42 }
    ];

  const photoPositions = isMobile
    ? [
      { x: 30, y: 32, rot: -5 },
      { x: 68, y: 34, rot: 4 },
      { x: 36, y: 62, rot: 3 },
      { x: 66, y: 64, rot: -4 }
    ]
    : [
      { x: 28, y: 28, rot: -6 },
      { x: 58, y: 36, rot: 5 },
      { x: 38, y: 58, rot: 3 },
      { x: 62, y: 58, rot: -4 }
    ];

  (c.collagePhotos || []).forEach(function (src, i) {
    const p = photoPositions[i % photoPositions.length];
    const card = el('button', 'sg-hidden__photo', {
      type: 'button'
    });
    card.style.left = p.x + '%';
    card.style.top = p.y + '%';
    card.style.transform = 'translate(-50%,-50%) rotate(' + p.rot + 'deg)';
    card.appendChild(el('img', '', { src: src, alt: 'Спогад' }));
    card.addEventListener('click', function () {
      if (found) {
        return;
      }
      wobble(card);
      showToast(randomMsg());
      playUiSound();
    });
    scene.appendChild(card);
  });

  decoys.forEach(function (d) {
    const btn = el('button', d.cls, {
      type: 'button',
      text: d.text,
      'aria-label': 'Декор'
    });
    btn.style.left = d.x + '%';
    btn.style.top = d.y + '%';
    btn.addEventListener('click', function () {
      if (found) {
        return;
      }
      wobble(btn);
      showToast(randomMsg());
      playUiSound();
    });
    scene.appendChild(btn);
  });

  // Hidden fragment — tucked near bottom-right photo edge, soft glow
  const fragment = el('button', 'sg-hidden__fragment', {
    type: 'button',
    text: '💗',
    'aria-label': 'Фрагмент серця'
  });
  fragment.style.left = isMobile ? '72%' : '74%';
  fragment.style.top = isMobile ? '66%' : '64%';
  fragment.addEventListener('click', function () {
    if (found || destroyed) {
      return;
    }
    found = true;
    playHeartSound();
    onFound();
  });
  scene.appendChild(fragment);

  wrap.appendChild(scene);
  wrap.appendChild(toast);
  root.appendChild(wrap);

  function randomMsg() {
    const msgs = c.decoyMessages || ['Не тут 😌'];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  function showToast(msg) {
    toast.hidden = false;
    toast.textContent = msg;
    toast.classList.add('is-show');
    window.setTimeout(function () {
      toast.classList.remove('is-show');
    }, 900);
  }

  function wobble(node) {
    node.classList.remove('is-wobble');
    void node.offsetWidth;
    node.classList.add('is-wobble');
  }

  function onFound() {
    fragment.classList.add('is-found');
    scene.classList.add('is-locked');
    spawnParticles(scene, 16);

    wait(prefersReducedMotion() ? 200 : 600).then(function () {
      if (destroyed) {
        return;
      }
      // Assemble all 5 fragments in center
      const assemble = el('div', 'sg-hidden__assemble');
      for (let i = 0; i < 5; i += 1) {
        const piece = el('span', 'sg-hidden__piece', {
          text: '💗',
          'aria-hidden': 'true'
        });
        piece.style.setProperty('--sg-i', String(i));
        assemble.appendChild(piece);
      }
      const whole = el('div', 'sg-hidden__whole', { text: '❤️' });
      assemble.appendChild(whole);
      scene.appendChild(assemble);

      wait(prefersReducedMotion() ? 400 : 1600).then(function () {
        if (destroyed) {
          return;
        }
        whole.classList.add('is-beat');
        ctx.onComplete({});
      });
    });
  }

  return {
    destroy: function () {
      destroyed = true;
      clearNode(root);
    }
  };
}
