import { timeline as timelineData, ui } from '../siteConfig';
import { prefersReducedMotion } from './utils';
import {
  armVideoPreload,
  isVideoItem,
  mediaPath,
  pointerOnVideo,
  videoMarkup
} from './media';

export function initTimeline({ onOpenMemory }) {
  const root = document.querySelector('[data-timeline]');
  if (!root) {
    return;
  }

  root.innerHTML = timelineData
    .map((item, index) => {
      const side = index % 2 === 0 ? 'left' : 'right';
      const path = mediaPath(item);
      const video = isVideoItem(item);
      const image = path
        ? '<div class="timeline__media">' +
          (video
            ? videoMarkup(item)
            : '<img src="' + path + '" alt="" loading="lazy" data-fallback>') +
          '</div>'
        : '';
      const button = video
        ? ' tabindex="0"'
        : ' tabindex="0" role="button" aria-label="' + item.title + '"';
      return `
        <article class="timeline__item timeline__item_${side}" data-reveal data-timeline-index="${index}"${button}>
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
    if (pointerOnVideo(event)) {
      return;
    }
    const item = event.target.closest('[data-timeline-index]');
    if (!item) {
      return;
    }
    openItem(item, onOpenMemory);
  });

  root.addEventListener('keydown', (event) => {
    if (pointerOnVideo(event)) {
      return;
    }
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

  armVideoPreload(root);
  void ui;
}

function openItem(item, onOpenMemory) {
  const index = Number(item.getAttribute('data-timeline-index'));
  const data = timelineData[index];
  if (!data || typeof onOpenMemory !== 'function') {
    return;
  }
  const inline = item.querySelector('video');
  if (inline) {
    inline.pause();
  }
  onOpenMemory({
    type: data.type,
    src: data.src,
    image: data.image,
    poster: data.poster,
    alt: data.alt,
    date: data.date,
    text: data.text,
    title: data.title
  });
}
