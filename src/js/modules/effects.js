import { prefersReducedMotion, isCoarsePointer } from './utils';
import { moodAtmosphere } from '../siteConfig';

const FLOATER_POOL = 14;
let floaterLayer = null;
let floaterNodes = [];

export function initEffects() {
  initProgress();
  initImageFallbacks();
  initMagneticButtons();
  initCursorGlow();
  initParallax();
  initFloaters();
}

function initProgress() {
  const bar = document.querySelector('[data-progress]');
  if (!bar) {
    return;
  }
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = value + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initImageFallbacks() {
  document.addEventListener(
    'error',
    (event) => {
      const img = event.target;
      if (img && img.tagName === 'IMG') {
        img.classList.add('is-fallback');
      }
    },
    true
  );
}

function initMagneticButtons() {
  if (prefersReducedMotion() || isCoarsePointer()) {
    return;
  }
  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('mousemove', (event) => {
      const rect = btn.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      btn.style.transform = 'translate(' + x * 0.12 + 'px, ' + y * 0.18 + 'px)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

function initCursorGlow() {
  const glow = document.querySelector('[data-cursor-glow]');
  if (!glow || prefersReducedMotion() || isCoarsePointer()) {
    if (glow) {
      glow.hidden = true;
    }
    return;
  }
  let raf = 0;
  let x = 0;
  let y = 0;
  window.addEventListener(
    'pointermove',
    (event) => {
      x = event.clientX;
      y = event.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          glow.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
          raf = 0;
        });
      }
    },
    { passive: true }
  );

  document.addEventListener('pointerover', (e) => {
    if (e.target.closest('button, a, [role="button"], .carousel__slide, .mood__card')) {
      glow.classList.add('is-hot');
    }
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest('button, a, [role="button"], .carousel__slide, .mood__card')) {
      glow.classList.remove('is-hot');
    }
  });
}

function initParallax() {
  if (prefersReducedMotion() || isCoarsePointer()) {
    return;
  }
  const items = document.querySelectorAll('[data-parallax]');
  if (!items.length) {
    return;
  }
  window.addEventListener(
    'scroll',
    () => {
      const mid = window.innerHeight / 2;
      items.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - mid) * -0.04;
        el.style.transform = 'translate3d(0, ' + offset + 'px, 0)';
      });
    },
    { passive: true }
  );
}

function initFloaters() {
  floaterLayer = document.querySelector('[data-floaters]');
  floaterNodes = [];
  if (!floaterLayer) {
    return;
  }
  if (prefersReducedMotion()) {
    floaterLayer.hidden = true;
    return;
  }

  floaterLayer.innerHTML = '';
  for (let i = 0; i < FLOATER_POOL; i++) {
    const span = document.createElement('span');
    span.className = 'floater';
    span.setAttribute('aria-hidden', 'true');
    span.hidden = true;
    floaterLayer.appendChild(span);
    floaterNodes.push(span);
  }

  // дефолтний набір до вибору mood
  applyFloaterConfig({
    symbols: ['♡', '✨', '🌸', '💗'],
    countDesktop: 8,
    countMobile: 5,
    speed: 1,
    opacity: 0.22,
    scale: 1
  });
}

/**
 * Оновлює існуючий пул floaters без створення нового animation loop.
 */
export function updateFloatersForMood(moodId) {
  const cfg = moodAtmosphere[moodId];
  if (!cfg) {
    return;
  }
  applyFloaterConfig(cfg);
}

function applyFloaterConfig(cfg) {
  if (!floaterLayer || prefersReducedMotion() || !floaterNodes.length) {
    return;
  }

  const count = isCoarsePointer()
    ? cfg.countMobile || 4
    : cfg.countDesktop || 8;
  const symbols = cfg.symbols && cfg.symbols.length ? cfg.symbols : ['✨'];
  const speed = cfg.speed || 1;
  const opacity = cfg.opacity != null ? cfg.opacity : 0.22;
  const scale = cfg.scale || 1;

  document.documentElement.style.setProperty('--animation-speed', String(speed));
  document.documentElement.style.setProperty('--floating-opacity', String(opacity));

  floaterNodes.forEach((span, i) => {
    if (i >= count) {
      span.hidden = true;
      span.style.animationPlayState = 'paused';
      return;
    }

    span.hidden = false;
    span.style.animationPlayState = 'running';
    span.textContent = symbols[i % symbols.length];
    span.style.left = ((i * 17 + 7) % 92) + 4 + '%';
    // duration *= speed (більший speed = повільніше)
    const base = 16 + (i % 5) * 3;
    span.style.animationDuration = base * speed + 's';
    span.style.animationDelay = -(i * 2.4) + 's';
    span.style.fontSize = 12 * scale + (i % 4) * 4 + 'px';
    span.style.opacity = String(opacity * (0.7 + (i % 3) * 0.15));
    span.style.transform = 'scale(' + scale + ')';
  });
}
