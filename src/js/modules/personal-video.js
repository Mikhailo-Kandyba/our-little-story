import { getPersonalVideoUrl, personalVideo as copy } from '../siteConfig';

export function initPersonalVideo() {
  const section = document.querySelector('[data-personal-video]');
  const player = document.querySelector('[data-personal-video-player]');
  if (!section || !player) {
    return;
  }

  const url = getPersonalVideoUrl();
  if (!url) {
    section.hidden = true;
    section.setAttribute('aria-hidden', 'true');
    return;
  }

  const eyebrow = section.querySelector('[data-personal-video-eyebrow]');
  const heading = section.querySelector('[data-personal-video-heading]');
  if (eyebrow) {
    eyebrow.textContent = copy.eyebrow || '';
  }
  if (heading) {
    heading.textContent = copy.heading || '';
  }

  while (player.firstChild) {
    player.removeChild(player.firstChild);
  }
  const source = document.createElement('source');
  source.src = url;
  source.type = 'video/mp4';
  player.appendChild(source);
  player.setAttribute('playsinline', '');
  player.setAttribute('webkit-playsinline', '');
  player.preload = 'metadata';
  player.controls = true;

  section.hidden = false;
  section.setAttribute('aria-hidden', 'false');
}
