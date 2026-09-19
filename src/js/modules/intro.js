import { prefersReducedMotion, isCoarsePointer } from './utils';
import { ambientAudio, intro as introContent, memories } from '../siteConfig';
import { isVideoItem } from './media';

export function initIntro({ onOpen }) {
  const intro = document.querySelector('.intro');
  const openBtn = document.querySelector('[data-intro-open]');
  const site = document.querySelector('.site');
  if (!intro || !openBtn || !site) {
    return;
  }

  const greeting = intro.querySelector('[data-intro-greeting]');
  const text = intro.querySelector('[data-intro-text]');
  if (greeting) {
    greeting.textContent = introContent.greeting;
  }
  if (text) {
    text.innerHTML = introContent.text.replace(/\n/g, '<br>');
  }
  openBtn.textContent = introContent.button;

  renderFloatingPhotos(intro);

  openBtn.addEventListener('click', () => {
    openBtn.classList.add('is-pressed');
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
    tryStartAmbient();
  });
}

function renderFloatingPhotos(intro) {
  const stage = intro.querySelector('[data-intro-float]');
  if (!stage) {
    return;
  }
  const picks = memories.filter((item) => !isVideoItem(item)).slice(0, 5);
  const positions = [
    { t: '10%', l: '4%', r: '-8deg' },
    { t: '14%', l: '70%', r: '6deg' },
    { t: '64%', l: '5%', r: '5deg' },
    { t: '68%', l: '68%', r: '-7deg' },
    { t: '38%', l: '74%', r: '3deg' }
  ];
  stage.innerHTML = picks
    .map((m, i) => {
      const p = positions[i] || positions[0];
      return `
        <div class="intro__photo" style="top:${p.t};left:${p.l};--rot:${p.r}" data-parallax>
          <img src="${m.image}" alt="" loading="lazy" data-fallback>
        </div>
      `;
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

function tryStartAmbient() {
  if (prefersReducedMotion()) {
    return;
  }
  const audio = document.querySelector('[data-ambient-audio]');
  if (!audio) {
    return;
  }
  audio.src = ambientAudio;
  audio.volume = 0.22;
  const play = audio.play();
  if (play && typeof play.catch === 'function') {
    play.catch(() => {});
  }
}
