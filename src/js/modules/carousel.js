import { memories, reactions, ui, easterEggs } from '../siteConfig';
import { prefersReducedMotion } from './utils';
import { sendNotification } from '../services/notify';
import {
  armVideoPreload,
  isVideoItem,
  mediaPath,
  pointerOnVideo,
  videoMarkup
} from './media';

export function initCarousel() {
  const root = document.querySelector('[data-carousel]');
  if (!root || !memories.length) {
    return;
  }

  let index = 0;
  let startX = 0;
  let deltaX = 0;
  let dragging = false;
  let videoPointer = null;

  root.innerHTML = `
    <div class="carousel__viewport" data-carousel-viewport>
      <div class="carousel__track" data-carousel-track></div>
    </div>
    <div class="carousel__meta">
      <p class="carousel__progress" data-carousel-progress></p>
      <time class="carousel__date" data-carousel-date></time>
      <p class="carousel__text" data-carousel-text></p>
      <div class="carousel__reactions" data-carousel-reactions></div>
    </div>
    <div class="carousel__nav">
      <button type="button" class="carousel__btn" data-carousel-prev aria-label="${ui.prev}">←</button>
      <button type="button" class="carousel__btn" data-carousel-next aria-label="${ui.next}">→</button>
    </div>
  `;

  const track = root.querySelector('[data-carousel-track]');
  const viewport = root.querySelector('[data-carousel-viewport]');

  track.innerHTML = memories
    .map((m, i) => {
      const secret =
        m.id === easterEggs.secretPhotoId ? ' data-memory-secret="1"' : '';
      const media = isVideoItem(m)
        ? videoMarkup(m, { secret: !!secret })
        : '<img src="' + mediaPath(m) + '" alt="" draggable="false" data-fallback' + secret + '>';
      return `
      <article class="carousel__slide" data-carousel-slide="${i}"${secret}>
        ${media}
      </article>
    `;
    })
    .join('');

  const reactionsEl = root.querySelector('[data-carousel-reactions]');
  reactionsEl.innerHTML = reactions
    .map(
      (r) =>
        `<button type="button" class="reaction" data-reaction="${r}" aria-label="${r}">${r}</button>`
    )
    .join('');

  function render() {
    const slides = track.querySelectorAll('[data-carousel-slide]');
    slides.forEach((slide, i) => {
      const offset = i - index;
      slide.style.setProperty('--offset', String(offset));
      slide.classList.toggle('is-center', offset === 0);
      slide.classList.toggle('is-side', Math.abs(offset) === 1);
      slide.classList.toggle('is-far', Math.abs(offset) > 1);
    });

    const m = memories[index];
    root.querySelector('[data-carousel-progress]').textContent =
      index + 1 + ' / ' + memories.length;
    root.querySelector('[data-carousel-date]').textContent = m.date;
    root.querySelector('[data-carousel-text]').textContent = m.text;
    track.querySelectorAll('video').forEach((video) => {
      const slide = video.closest('[data-carousel-slide]');
      const slideIndex = slide ? Number(slide.getAttribute('data-carousel-slide')) : -1;
      if (slideIndex !== index) {
        video.pause();
      }
    });
  }

  function go(dir) {
    index = (index + dir + memories.length) % memories.length;
    render();
  }

  root.querySelector('[data-carousel-prev]').addEventListener('click', () => go(-1));
  root.querySelector('[data-carousel-next]').addEventListener('click', () => go(1));

  document.addEventListener('keydown', (e) => {
    if (pointerOnVideo(e)) {
      return;
    }
    if (
      document.body.classList.contains('has-modal') ||
      document.body.classList.contains('is-locked') ||
      document.body.classList.contains('has-story-game')
    ) {
      return;
    }
    if (e.key === 'ArrowLeft') {
      go(-1);
    }
    if (e.key === 'ArrowRight') {
      go(1);
    }
  });

  const onDown = (x) => {
    dragging = true;
    startX = x;
    deltaX = 0;
    viewport.classList.add('is-dragging');
  };
  const onMove = (x) => {
    if (!dragging) {
      return;
    }
    deltaX = x - startX;
    if (Math.abs(deltaX) > 10) {
      viewport.style.touchAction = 'none';
    }
    track.style.transform = 'translateX(' + deltaX * 0.35 + 'px)';
  };
  const onUp = () => {
    if (!dragging) {
      return;
    }
    dragging = false;
    viewport.classList.remove('is-dragging');
    viewport.style.touchAction = '';
    track.style.transform = '';
    if (Math.abs(deltaX) > 40) {
      go(deltaX < 0 ? 1 : -1);
    }
  };

  viewport.addEventListener('pointerdown', (e) => {
    const video = pointerOnVideo(e) ? e.target.closest('video') : null;
    if (video) {
      const rect = video.getBoundingClientRect();
      const bar = Math.min(96, Math.max(64, rect.height * 0.22));
      videoPointer = {
        x: e.clientX,
        y: e.clientY,
        controls: e.clientY >= rect.bottom - bar
      };
      return;
    }
    videoPointer = null;
    viewport.setPointerCapture(e.pointerId);
    onDown(e.clientX);
  });
  viewport.addEventListener('pointermove', (e) => {
    if (videoPointer) {
      return;
    }
    onMove(e.clientX);
  });
  viewport.addEventListener('pointerup', (e) => {
    if (videoPointer) {
      const dx = e.clientX - videoPointer.x;
      const dy = e.clientY - videoPointer.y;
      const onControls = videoPointer.controls;
      videoPointer = null;
      if (!onControls && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        go(dx < 0 ? 1 : -1);
      }
      return;
    }
    onUp();
  });
  viewport.addEventListener('pointercancel', () => {
    if (videoPointer) {
      videoPointer = null;
      return;
    }
    onUp();
  });

  reactionsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-reaction]');
    if (!btn) {
      return;
    }
    const reaction = btn.getAttribute('data-reaction');
    flyReaction(btn, reaction);
    sendNotification({
      type: 'reaction',
      memoryId: memories[index].id,
      reaction: reaction
    });
  });

  render();
  armVideoPreload(viewport);
}

function flyReaction(btn, emoji) {
  if (prefersReducedMotion()) {
    return;
  }
  const fly = document.createElement('span');
  fly.className = 'reaction-fly';
  fly.textContent = emoji;
  const rect = btn.getBoundingClientRect();
  fly.style.left = rect.left + rect.width / 2 + 'px';
  fly.style.top = rect.top + 'px';
  document.body.appendChild(fly);
  requestAnimationFrame(() => fly.classList.add('is-up'));
  window.setTimeout(() => {
    if (fly.parentNode) {
      fly.parentNode.removeChild(fly);
    }
  }, 900);
}
