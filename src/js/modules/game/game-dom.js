import { prefersReducedMotion } from '../utils';

export function clearNode(node) {
  if (!node) {
    return;
  }
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

export function el(tag, className, attrs) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (attrs) {
    Object.keys(attrs).forEach(function (key) {
      if (key === 'text') {
        node.textContent = attrs[key];
      } else if (key === 'html') {
        node.innerHTML = attrs[key];
      } else if (attrs[key] != null) {
        node.setAttribute(key, attrs[key]);
      }
    });
  }
  return node;
}

export function wait(ms) {
  return new Promise(function (resolve) {
    window.setTimeout(resolve, prefersReducedMotion() ? Math.min(ms, 200) : ms);
  });
}

export function spawnParticles(container, count, symbols) {
  if (!container || prefersReducedMotion()) {
    return;
  }
  const list = symbols || ['💗', '✨', '♡'];
  const n = count || 10;
  for (let i = 0; i < n; i += 1) {
    const p = el('span', 'sg-particle', {
      text: list[i % list.length],
      'aria-hidden': 'true'
    });
    p.style.left = 20 + Math.random() * 60 + '%';
    p.style.top = 30 + Math.random() * 40 + '%';
    p.style.animationDelay = Math.random() * 0.4 + 's';
    p.style.setProperty('--sg-dx', (Math.random() * 80 - 40) + 'px');
    p.style.setProperty('--sg-dy', (-40 - Math.random() * 80) + 'px');
    container.appendChild(p);
    window.setTimeout(function () {
      if (p.parentNode) {
        p.parentNode.removeChild(p);
      }
    }, 1400);
  }
}

export function preventScrollWhile(active) {
  if (active) {
    document.body.classList.add('sg-playing');
  } else {
    document.body.classList.remove('sg-playing');
  }
}
