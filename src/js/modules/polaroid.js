import { memories } from '../siteConfig';
import { prefersReducedMotion } from './utils';
import {
  armVideoPreload,
  isVideoItem,
  mediaPath,
  pointerOnVideo,
  videoMarkup
} from './media';

export function initPolaroid() {
  const root = document.querySelector('[data-polaroid]');
  if (!root || !memories.length) {
    return;
  }

  let stack = memories.map((m) => Object.assign({}, m));
  let startX = 0;
  let dragging = false;
  let didSwipe = false;

  function render() {
    root.innerHTML = stack
      .slice(0, 4)
      .map((m, i) => {
        const rot = (i % 2 === 0 ? -1 : 1) * (4 + i * 2);
        const video = isVideoItem(m);
        const media = video
          ? videoMarkup(m)
          : '<img src="' + mediaPath(m) + '" alt="" draggable="false" data-fallback>';
        const button = video ? ' tabindex="0"' : ' tabindex="0" role="button"';
        return `
          <article class="polaroid__card" data-polaroid-card style="--z:${40 - i};--rot:${rot}deg;--y:${i * 8}px"${button} aria-label="${m.date}">
            <div class="polaroid__photo">
              ${media}
            </div>
            <p class="polaroid__caption">${m.caption || m.text}</p>
            <time class="polaroid__date">${m.date}</time>
          </article>
        `;
      })
      .join('');
    armVideoPreload(root);
  }

  function flyTop(dir) {
    const top = root.querySelector('[data-polaroid-card]');
    if (!top || stack.length < 1) {
      return;
    }
    const gone = stack.shift();
    const playing = top.querySelector('video');
    if (playing) {
      playing.pause();
    }
    if (!prefersReducedMotion()) {
      top.classList.add(dir < 0 ? 'is-fly-left' : 'is-fly-right');
      window.setTimeout(() => {
        stack.push(gone);
        render();
      }, 420);
    } else {
      stack.push(gone);
      render();
    }
  }

  root.addEventListener('click', (e) => {
    if (pointerOnVideo(e)) {
      return;
    }
    if (didSwipe) {
      didSwipe = false;
      return;
    }
    flyTop(1);
  });
  root.addEventListener('keydown', (e) => {
    if (pointerOnVideo(e)) {
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flyTop(1);
    }
  });

  root.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('[data-polaroid-card]') || pointerOnVideo(e)) {
      return;
    }
    dragging = true;
    didSwipe = false;
    startX = e.clientX;
    root.classList.add('is-dragging');
    root.setPointerCapture(e.pointerId);
  });
  root.addEventListener('pointermove', (e) => {
    if (!dragging) {
      return;
    }
    if (Math.abs(e.clientX - startX) > 12) {
      didSwipe = true;
    }
  });
  root.addEventListener('pointerup', (e) => {
    if (!dragging) {
      return;
    }
    dragging = false;
    root.classList.remove('is-dragging');
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) {
      didSwipe = true;
      flyTop(dx < 0 ? -1 : 1);
    }
  });
  root.addEventListener('pointercancel', () => {
    dragging = false;
    root.classList.remove('is-dragging');
  });

  render();
  armVideoPreload(root);
}
