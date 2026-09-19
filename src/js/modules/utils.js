export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isCoarsePointer() {
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

export function formatLongDate(isoDate) {
  const date = new Date(isoDate + 'T12:00:00');
  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

export function trapFocus(container, event) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) {
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    last.focus();
    event.preventDefault();
  } else if (!event.shiftKey && document.activeElement === last) {
    first.focus();
    event.preventDefault();
  }
}

export function staggerReveal(root, selector, step) {
  const nodes = root.querySelectorAll(selector);
  nodes.forEach((el, i) => {
    el.style.transitionDelay = (i * (step || 80)) + 'ms';
  });
}
