import { memories, randomMemory as copy } from '../siteConfig';
import { prefersReducedMotion } from './utils';

export function initRandomMemory() {
  const stage = document.querySelector('[data-random-stage]');
  const button = document.querySelector('[data-random-btn]');
  const heading = document.querySelector('[data-random-heading]');
  if (!stage || !button || !memories.length) {
    return;
  }
  if (heading) {
    heading.textContent = copy.heading;
  }
  button.textContent = copy.button;

  let lastIndex = -1;

  button.addEventListener('click', () => {
    button.classList.add('is-shuffle');
    window.setTimeout(() => button.classList.remove('is-shuffle'), 500);

    let index = Math.floor(Math.random() * memories.length);
    if (memories.length > 1) {
      let guard = 0;
      while (index === lastIndex && guard < 8) {
        index = Math.floor(Math.random() * memories.length);
        guard += 1;
      }
    }
    lastIndex = index;
    showMemory(stage, memories[index]);
  });
}

function showMemory(stage, memory) {
  const reduce = prefersReducedMotion();
  const next = document.createElement('div');
  next.className = 'random__card';
  next.innerHTML = `
    <div class="random__photo">
      <img src="${memory.image}" alt="" data-fallback>
    </div>
    <div class="random__body">
      <time class="random__date">${memory.date}</time>
      <p class="random__text">${memory.text}</p>
    </div>
  `;

  const current = stage.querySelector('.random__card');
  if (!current) {
    stage.appendChild(next);
    requestAnimationFrame(() => next.classList.add('is-visible'));
    return;
  }

  if (reduce) {
    stage.innerHTML = '';
    stage.appendChild(next);
    next.classList.add('is-visible');
    return;
  }

  current.classList.remove('is-visible');
  current.classList.add('is-leaving');
  window.setTimeout(() => {
    if (current.parentNode) {
      current.parentNode.removeChild(current);
    }
    stage.appendChild(next);
    requestAnimationFrame(() => next.classList.add('is-visible'));
  }, 320);
}
