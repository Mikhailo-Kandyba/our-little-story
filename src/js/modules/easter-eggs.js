import { easterEggs } from '../siteConfig';

export function initEasterEggs() {
  let heartClicks = 0;
  const heart = document.querySelector('[data-egg-heart]');
  if (heart) {
    heart.addEventListener('click', () => {
      heartClicks += 1;
      if (heartClicks >= easterEggs.heartClicks) {
        heartClicks = 0;
        showToast(easterEggs.heartMessage);
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-memory-secret]')) {
      showToast(easterEggs.secretNote);
    }
  });

  const sign = document.querySelector('[data-closing-sign]');
  if (sign) {
    let taps = 0;
    sign.addEventListener('click', () => {
      taps += 1;
      if (taps >= 2) {
        taps = 0;
        showToast('Так, це справді я ✨');
      }
    });
  }
}

function showToast(text) {
  let toast = document.querySelector('.egg-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'egg-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('is-visible');
  window.setTimeout(() => toast.classList.remove('is-visible'), 2800);
}
