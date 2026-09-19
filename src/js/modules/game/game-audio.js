/**
 * Soft SFX hooks — silent if files missing or autoplay blocked.
 * Paths come from gameContent.sounds in siteConfig.
 */

let unlocked = false;
let paths = {
  ui: '',
  success: '',
  heart: '',
  memory: ''
};

export function initGameAudio(soundPaths) {
  paths = Object.assign({}, paths, soundPaths || {});
}

export function unlockGameAudio() {
  unlocked = true;
}

function play(src, volume) {
  if (!unlocked || !src) {
    return;
  }
  try {
    const audio = new Audio(src);
    audio.volume = volume == null ? 0.28 : volume;
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () {});
    }
  } catch (err) {
    // ignore
  }
}

export function playUiSound() {
  play(paths.ui, 0.18);
}

export function playSuccessSound() {
  play(paths.success, 0.32);
}

export function playHeartSound() {
  play(paths.heart, 0.3);
}

export function playMemorySound() {
  play(paths.memory, 0.26);
}
