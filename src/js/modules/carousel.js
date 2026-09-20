import { memories, reactions, ui, easterEggs, videoMoments } from '../siteConfig';
import { prefersReducedMotion } from './utils';
import { sendNotification } from '../services/notify';
import {
  armVideoPreload,
  ensureVideoSource,
  isVideoItem,
  mediaPath,
  pointerOnVideo,
  unloadVideoSource,
  videoMarkup
} from './media';

export function initCarousel() {
  mountCarousel({
    root: document.querySelector('[data-carousel]'),
    items: memories,
    showReactions: true,
    showMetaCopy: true,
    lazyWindow: 2,
    deferVideoSrc: false,
    keyboard: true
  });
}

export function initVideoCarousel() {
  mountCarousel({
    root: document.querySelector('[data-video-carousel]'),
    items: videoMoments,
    showReactions: false,
    showMetaCopy: false,
    lazyWindow: 0,
    deferVideoSrc: true,
    keyboard: true
  });
}

function mountCarousel(options) {
  const root = options.root;
  const items = options.items || [];
  if (!root || !items.length) {
    return;
  }

  const showReactions = !!options.showReactions;
  const showMetaCopy = options.showMetaCopy !== false;
  const lazyWindow = options.lazyWindow == null ? 2 : options.lazyWindow;
  const deferVideoSrc = !!options.deferVideoSrc;
  const useKeyboard = options.keyboard !== false;

  let index = 0;
  let startX = 0;
  let deltaX = 0;
  let dragging = false;
  let videoPointer = null;
  let inView = true;

  root.innerHTML =
    '<div class="carousel__viewport" data-carousel-viewport>' +
    '<div class="carousel__track" data-carousel-track></div>' +
    '</div>' +
    '<div class="carousel__meta">' +
    '<p class="carousel__progress" data-carousel-progress></p>' +
    (showMetaCopy
      ? '<time class="carousel__date" data-carousel-date></time>' +
        '<p class="carousel__text" data-carousel-text></p>'
      : '') +
    (showReactions ? '<div class="carousel__reactions" data-carousel-reactions></div>' : '') +
    '</div>' +
    '<div class="carousel__nav">' +
    '<button type="button" class="carousel__btn" data-carousel-prev aria-label="' +
    ui.prev +
    '">←</button>' +
    '<button type="button" class="carousel__btn" data-carousel-next aria-label="' +
    ui.next +
    '">→</button>' +
    '</div>';

  const track = root.querySelector('[data-carousel-track]');
  const viewport = root.querySelector('[data-carousel-viewport]');
  const dateEl = root.querySelector('[data-carousel-date]');
  const textEl = root.querySelector('[data-carousel-text]');
  const progressEl = root.querySelector('[data-carousel-progress]');
  const reactionsEl = root.querySelector('[data-carousel-reactions]');

  track.innerHTML = items
    .map((m, i) => {
      const secret =
        m.id === easterEggs.secretPhotoId ? ' data-memory-secret="1"' : '';
      let media;
      if (isVideoItem(m)) {
        media = videoMarkup(m, {
          secret: !!secret,
          lazy: true
        });
      } else {
        media =
          '<img alt="" draggable="false" loading="lazy" data-fallback data-lazy-src="' +
          mediaPath(m) +
          '"' +
          secret +
          '>';
      }
      return (
        '<article class="carousel__slide" data-carousel-slide="' +
        i +
        '"' +
        secret +
        '>' +
        media +
        '</article>'
      );
    })
    .join('');

  if (reactionsEl) {
    reactionsEl.innerHTML = reactions
      .map(
        (r) =>
          '<button type="button" class="reaction" data-reaction="' +
          r +
          '" aria-label="' +
          r +
          '">' +
          r +
          '</button>'
      )
      .join('');
  }

  if (window.IntersectionObserver) {
    const visibility = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === root) {
            inView = entry.isIntersecting;
          }
        });
      },
      { threshold: 0.2 }
    );
    visibility.observe(root);
  }

  function syncMedia() {
    const slides = track.querySelectorAll('[data-carousel-slide]');
    slides.forEach((slide, i) => {
      const distance = Math.abs(i - index);
      const item = items[i];
      const img = slide.querySelector('img[data-lazy-src]');
      const video = slide.querySelector('video');

      if (img) {
        if (distance <= lazyWindow) {
          const path = img.getAttribute('data-lazy-src');
          if (path && img.getAttribute('src') !== path) {
            img.setAttribute('src', path);
          }
        }
      }

      if (video && isVideoItem(item)) {
        if (deferVideoSrc) {
          if (i === index) {
            ensureVideoSource(video, item);
          } else {
            unloadVideoSource(video);
          }
        } else if (distance <= Math.max(lazyWindow, 1)) {
          ensureVideoSource(video, item);
          if (i !== index) {
            video.pause();
          }
        } else {
          unloadVideoSource(video);
        }
      }
    });
  }

  function render() {
    const slides = track.querySelectorAll('[data-carousel-slide]');
    slides.forEach((slide, i) => {
      const offset = i - index;
      slide.style.setProperty('--offset', String(offset));
      slide.classList.toggle('is-center', offset === 0);
      slide.classList.toggle('is-side', Math.abs(offset) === 1);
      slide.classList.toggle('is-far', Math.abs(offset) > 1);
    });

    const m = items[index];
    if (progressEl) {
      progressEl.textContent = index + 1 + ' / ' + items.length;
    }
    if (dateEl) {
      dateEl.textContent = m.date || '';
      dateEl.hidden = !m.date;
    }
    if (textEl) {
      textEl.textContent = m.text || '';
      textEl.hidden = !m.text;
    }
    syncMedia();
  }

  function go(dir) {
    index = (index + dir + items.length) % items.length;
    render();
  }

  root.querySelector('[data-carousel-prev]').addEventListener('click', () => go(-1));
  root.querySelector('[data-carousel-next]').addEventListener('click', () => go(1));

  if (useKeyboard) {
    document.addEventListener('keydown', (e) => {
      if (!inView || pointerOnVideo(e)) {
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
  }

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

  if (reactionsEl) {
    reactionsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-reaction]');
      if (!btn) {
        return;
      }
      const reaction = btn.getAttribute('data-reaction');
      flyReaction(btn, reaction);
      sendNotification({
        type: 'reaction',
        memoryId: items[index].id,
        reaction: reaction
      });
    });
  }

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
