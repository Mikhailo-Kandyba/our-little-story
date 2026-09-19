import { timeline as timelineData, ui } from '../siteConfig';
import { prefersReducedMotion } from './utils';

export function initTimeline({ onOpenMemory }) {
  const root = document.querySelector('[data-timeline]');
  if (!root) {
    return;
  }

  root.innerHTML = timelineData
    .map((item, index) => {
      const side = index % 2 === 0 ? 'left' : 'right';
      const image = item.image
        ? `<div class="timeline__media"><img src="${item.image}" alt="" loading="lazy" data-fallback></div>`
        : '';
      return `
        <article class="timeline__item timeline__item_${side}" data-reveal data-timeline-index="${index}" tabindex="0" role="button" aria-label="${item.title}">
          <div class="timeline__marker" aria-hidden="true"></div>
          <div class="timeline__card">
            <time class="timeline__date">${item.date}</time>
            <h3 class="timeline__title">${item.title}</h3>
            <p class="timeline__text">${item.text}</p>
            ${image}
          </div>
        </article>
      `;
    })
    .join('');

  root.addEventListener('click', (event) => {
    const item = event.target.closest('[data-timeline-index]');
    if (!item) {
      return;
    }
    openItem(item, onOpenMemory);
  });

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    const item = event.target.closest('[data-timeline-index]');
    if (!item) {
      return;
    }
    event.preventDefault();
    openItem(item, onOpenMemory);
  });

  if (!prefersReducedMotion()) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    root.querySelectorAll('.timeline__item').forEach((el) => observer.observe(el));
  } else {
    root.querySelectorAll('.timeline__item').forEach((el) => el.classList.add('is-inview'));
  }

  void ui;
}

function openItem(item, onOpenMemory) {
  const index = Number(item.getAttribute('data-timeline-index'));
  const data = timelineData[index];
  if (!data || typeof onOpenMemory !== 'function') {
    return;
  }
  onOpenMemory({
    image: data.image,
    date: data.date,
    text: data.text,
    title: data.title
  });
}
