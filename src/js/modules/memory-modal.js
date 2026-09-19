import { trapFocus } from './utils';
import { ui } from '../siteConfig';
import { isVideoItem, mediaPath, mountVideo, releaseVideo } from './media';

let lastFocus = null;

export function initMemoryModal() {
  const modal = document.querySelector('[data-memory-modal]');
  if (!modal) {
    return { open() {}, close() {} };
  }

  const image = modal.querySelector('[data-memory-image]');
  const video = modal.querySelector('[data-memory-video]');
  const date = modal.querySelector('[data-memory-date]');
  const text = modal.querySelector('[data-memory-text]');
  const title = modal.querySelector('[data-memory-title]');
  const closeBtns = modal.querySelectorAll('[data-memory-close]');

  closeBtns.forEach((btn) => {
    if (btn.tagName === 'BUTTON') {
      btn.setAttribute('aria-label', ui.close);
    }
  });

  function open(memory) {
    lastFocus = document.activeElement;
    if (isVideoItem(memory) && video) {
      if (image) {
        image.hidden = true;
      }
      mountVideo(video, memory);
    } else {
      releaseVideo(video);
      if (image) {
        image.hidden = false;
        image.src = mediaPath(memory) || '';
        image.alt = memory.title || memory.date || 'Спогад';
        image.classList.remove('is-fallback');
      }
    }
    if (date) {
      date.textContent = memory.date || '';
    }
    if (text) {
      text.textContent = memory.text || '';
    }
    if (title) {
      title.textContent = memory.title || '';
      title.hidden = !memory.title;
    }
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-modal');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    const closeBtn = modal.querySelector('button[data-memory-close]');
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function close() {
    releaseVideo(video);
    modal.classList.remove('is-open');
    document.body.classList.remove('has-modal');
    window.setTimeout(() => {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      }
    }, 280);
  }

  closeBtns.forEach((btn) => btn.addEventListener('click', close));
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.classList.contains('memory-modal__backdrop')) {
      close();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (modal.hidden) {
      return;
    }
    if (event.key === 'Escape') {
      close();
    }
    if (event.key === 'Tab') {
      trapFocus(modal, event);
    }
  });

  return { open, close };
}
