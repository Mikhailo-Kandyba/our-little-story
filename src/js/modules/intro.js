import { prefersReducedMotion, isCoarsePointer } from './utils';
import { intro as introContent, memories } from '../siteConfig';
import { isVideoItem } from './media';
import { startAmbientFromUserGesture } from './ambient';
import {
  detectDeviceLabel,
  getVisitorId,
  getVisitorName,
  normalizeVisitorName,
  setVisitorName
} from './visitor';
import { sendNotification } from '../services/notify';

export function initIntro({ onOpen }) {
  const intro = document.querySelector('.intro');
  const openBtn = document.querySelector('[data-intro-open]');
  const site = document.querySelector('.site');
  const nameInput = document.querySelector('[data-intro-name]');
  const nameError = document.querySelector('[data-intro-name-error]');
  if (!intro || !openBtn || !site) {
    return;
  }

  const greeting = intro.querySelector('[data-intro-greeting]');
  const text = intro.querySelector('[data-intro-text]');
  const nameLabel = intro.querySelector('[data-intro-name-label]');
  const privacy = intro.querySelector('[data-intro-privacy]');

  if (greeting) {
    greeting.textContent = introContent.greeting;
  }
  if (text) {
    text.innerHTML = introContent.text.replace(/\n/g, '<br>');
  }
  if (nameLabel) {
    nameLabel.textContent = introContent.nameLabel || 'Як тебе звати? 🤍';
  }
  if (nameInput) {
    nameInput.placeholder = introContent.namePlaceholder || 'Твоє імʼя';
    const saved = getVisitorName();
    if (saved) {
      nameInput.value = saved;
    }
  }
  if (privacy) {
    privacy.textContent =
      introContent.privacyNote ||
      '💗';
  }
  openBtn.textContent = introContent.button;

  renderFloatingPhotos(intro);
  syncOpenState();

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      clearNameError();
      syncOpenState();
    });
    nameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        openBtn.click();
      }
    });
  }

  openBtn.addEventListener('click', () => {
    const name = normalizeVisitorName(nameInput ? nameInput.value : '');
    if (!name) {
      showNameError();
      if (nameInput) {
        nameInput.focus();
      }
      return;
    }

    setVisitorName(name);
    openBtn.classList.add('is-pressed');
    openBtn.disabled = true;
    burstHearts(intro);

    const reduce = prefersReducedMotion();
    intro.classList.add('intro_closing');
    document.body.classList.remove('is-locked');
    site.removeAttribute('hidden');
    site.setAttribute('aria-hidden', 'false');

    const finish = () => {
      intro.setAttribute('hidden', '');
      intro.setAttribute('aria-hidden', 'true');
      if (typeof onOpen === 'function') {
        onOpen();
      }
    };

    window.setTimeout(finish, reduce ? 200 : 1000);
    startAmbientFromUserGesture();
    notifyVisit(name);
  });

  function syncOpenState() {
    const name = normalizeVisitorName(nameInput ? nameInput.value : '');
    openBtn.disabled = !name;
    openBtn.setAttribute('aria-disabled', name ? 'false' : 'true');
  }

  function showNameError() {
    if (!nameError) {
      return;
    }
    nameError.textContent = introContent.nameError || 'Напиши, будь ласка, як тебе звати';
    nameError.hidden = false;
    if (nameInput) {
      nameInput.setAttribute('aria-invalid', 'true');
    }
  }

  function clearNameError() {
    if (nameError) {
      nameError.hidden = true;
      nameError.textContent = '';
    }
    if (nameInput) {
      nameInput.removeAttribute('aria-invalid');
    }
  }
}

function notifyVisit(name) {
  sendNotification({
    type: 'visit',
    visitorName: name,
    visitorId: getVisitorId(),
    device: detectDeviceLabel(),
    timestamp: formatVisitTimestamp(new Date())
  }).catch(() => {});
}

function formatVisitTimestamp(date) {
  const pad = (n) => (n < 10 ? '0' + n : String(n));
  return (
    pad(date.getDate()) +
    '.' +
    pad(date.getMonth() + 1) +
    '.' +
    date.getFullYear() +
    ' ' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes())
  );
}

function renderFloatingPhotos(intro) {
  const stage = intro.querySelector('[data-intro-float]');
  if (!stage) {
    return;
  }
  const picks = memories.filter((item) => !isVideoItem(item)).slice(0, 5);
  const positions = [
    { side: 'left', t: '8%', inset: '3%', r: '-9deg' },
    { side: 'right', t: '10%', inset: '3%', r: '7deg' },
    { side: 'left', t: '62%', inset: '4%', r: '5deg' },
    { side: 'right', t: '66%', inset: '4%', r: '-6deg' },
    { side: 'right', t: '36%', inset: '5%', r: '4deg' }
  ];
  stage.innerHTML = picks
    .map((m, i) => {
      const p = positions[i] || positions[0];
      const sideStyle =
        p.side === 'right'
          ? 'right:' + p.inset + ';left:auto;'
          : 'left:' + p.inset + ';right:auto;';
      return (
        '<div class="intro__photo intro__photo_' +
        p.side +
        '" style="top:' +
        p.t +
        ';' +
        sideStyle +
        '--rot:' +
        p.r +
        '" data-parallax>' +
        '<img src="' +
        m.image +
        '" alt="" decoding="async" data-fallback>' +
        '</div>'
      );
    })
    .join('');
}

function burstHearts(intro) {
  if (prefersReducedMotion() || isCoarsePointer()) {
    return;
  }
  const layer = document.createElement('div');
  layer.className = 'intro__burst';
  layer.setAttribute('aria-hidden', 'true');
  const symbols = ['💗', '✨', '♡', '🌸'];
  for (let i = 0; i < 12; i++) {
    const span = document.createElement('span');
    span.className = 'intro__burst-item';
    span.textContent = symbols[i % symbols.length];
    span.style.setProperty('--dx', (Math.random() * 280 - 140) + 'px');
    span.style.setProperty('--dy', (Math.random() * -220 - 40) + 'px');
    span.style.setProperty('--delay', (i * 30) + 'ms');
    layer.appendChild(span);
  }
  intro.appendChild(layer);
  window.setTimeout(() => {
    if (layer.parentNode) {
      layer.parentNode.removeChild(layer);
    }
  }, 1200);
}
