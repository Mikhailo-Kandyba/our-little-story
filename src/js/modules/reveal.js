import { prefersReducedMotion } from './utils';

export function initReveal() {
  const nodes = document.querySelectorAll('[data-reveal]');
  if (!nodes.length) {
    return;
  }

  if (prefersReducedMotion()) {
    nodes.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = Number(el.getAttribute('data-reveal-delay') || 0);
          window.setTimeout(() => el.classList.add('is-revealed'), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }
  );

  nodes.forEach((el, i) => {
    if (!el.hasAttribute('data-reveal-delay')) {
      const group = el.parentElement;
      if (group) {
        const siblings = Array.prototype.slice.call(group.querySelectorAll(':scope > [data-reveal]'));
        const idx = siblings.indexOf(el);
        if (idx > 0) {
          el.setAttribute('data-reveal-delay', String(idx * 90));
        }
      } else if (i % 5 === 0) {
        // keep default
      }
    }
    observer.observe(el);
  });
}
