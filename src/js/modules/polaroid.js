import { memories } from '../siteConfig';
import { prefersReducedMotion } from './utils';

export function initPolaroid() {
  const root = document.querySelector('[data-polaroid]');
  if (!root || !memories.length) {
    return;
  }

  let stack = memories.map((m) => Object.assign({}, m));
  let startX = 0;
  let dragging = false;

  function render() {
    root.innerHTML = stack
      .slice(0, 4)
      .map((m, i) => {
        const rot = (i % 2 === 0 ? -1 : 1) * (4 + i * 2);
        return `
          <article class="polaroid__card" data-polaroid-card style="--z:${40 - i};--rot:${rot}deg;--y:${i * 8}px" tabindex="0" role="button" aria-label="${m.date}">
            <div class="polaroid__photo">
              <img src="${m.image}" alt="" draggable="false" data-fallback>
            </div>
            <p class="polaroid__caption">${m.caption || m.text}</p>
            <time class="polaroid__date">${m.date}</time>
          </article>
        `;
      })
      .join('');
  }

  function flyTop(dir) {
    const top = root.querySelector('[data-polaroid-card]');
    if (!top || stack.length < 1) {
      return;
    }
    const gone = stack.shift();
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

  root.addEventListener('click', () => flyTop(1));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flyTop(1);
    }
  });

  root.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('[data-polaroid-card]')) {
      return;
    }
    dragging = true;
    startX = e.clientX;
    root.setPointerCapture(e.pointerId);
  });
  root.addEventListener('pointerup', (e) => {
    if (!dragging) {
      return;
    }
    dragging = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) {
      flyTop(dx < 0 ? -1 : 1);
    }
  });

  render();
}
