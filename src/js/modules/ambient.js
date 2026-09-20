import { ambientAudio, BACKGROUND_VOLUME } from '../siteConfig';
import { prefersReducedMotion } from './utils';

const playingVideos = [];

let ambientEl = null;
let musicUnlocked = false;
let musicWanted = false;
let musicHeldForVideo = false;
let bound = false;

export function initAmbientMusic() {
  ambientEl = document.querySelector('[data-ambient-audio]');
  if (ambientEl) {
    ambientEl.volume = BACKGROUND_VOLUME;
  }
  bindVideoMusicBridge();
}

/**
 * Start ambient after a user gesture (intro open).
 * Marks music as unlocked + wanted when play succeeds.
 */
export function startAmbientFromUserGesture() {
  if (prefersReducedMotion()) {
    return Promise.resolve(false);
  }
  const audio = getAmbient();
  if (!audio) {
    return Promise.resolve(false);
  }

  if (!audio.getAttribute('src') && !audio.src) {
    audio.src = ambientAudio;
  }
  audio.volume = BACKGROUND_VOLUME;
  audio.loop = true;

  const result = audio.play();
  if (result && typeof result.then === 'function') {
    return result
      .then(() => {
        musicUnlocked = true;
        musicWanted = true;
        return true;
      })
      .catch(() => false);
  }

  if (!audio.paused) {
    musicUnlocked = true;
    musicWanted = true;
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}

/** Explicit user mute / stop (future UI). */
export function stopAmbientByUser() {
  musicWanted = false;
  musicHeldForVideo = false;
  const audio = getAmbient();
  if (audio) {
    audio.pause();
  }
}

export function isAmbientWanted() {
  return musicWanted;
}

export function isAmbientUnlocked() {
  return musicUnlocked;
}

function bindVideoMusicBridge() {
  if (bound) {
    return;
  }
  bound = true;

  document.addEventListener(
    'play',
    (event) => {
      const video = event.target;
      if (!video || video.tagName !== 'VIDEO') {
        return;
      }
      onVideoPlay(video);
    },
    true
  );

  document.addEventListener(
    'pause',
    (event) => {
      const video = event.target;
      if (!video || video.tagName !== 'VIDEO') {
        return;
      }
      onVideoStop(video);
    },
    true
  );

  document.addEventListener(
    'ended',
    (event) => {
      const video = event.target;
      if (!video || video.tagName !== 'VIDEO') {
        return;
      }
      onVideoStop(video);
    },
    true
  );
}

function onVideoPlay(video) {
  if (playingVideos.indexOf(video) === -1) {
    if (playingVideos.length === 0) {
      holdAmbientForVideo();
    }
    playingVideos.push(video);
  }
}

function onVideoStop(video) {
  const idx = playingVideos.indexOf(video);
  if (idx === -1) {
    return;
  }
  playingVideos.splice(idx, 1);
  if (playingVideos.length === 0) {
    releaseAmbientAfterVideo();
  }
}

function holdAmbientForVideo() {
  const audio = getAmbient();
  if (!audio) {
    return;
  }
  if (!audio.paused) {
    musicHeldForVideo = true;
    audio.pause();
    return;
  }
  // Already paused: keep hold flag if music was wanted/unlocked so we can resume later.
  if (musicUnlocked && musicWanted) {
    musicHeldForVideo = true;
  }
}

function releaseAmbientAfterVideo() {
  if (!musicHeldForVideo) {
    return;
  }
  if (!musicUnlocked || !musicWanted) {
    musicHeldForVideo = false;
    return;
  }
  if (playingVideos.length > 0) {
    return;
  }

  const audio = getAmbient();
  if (!audio) {
    musicHeldForVideo = false;
    return;
  }

  audio.volume = BACKGROUND_VOLUME;
  const play = audio.play();
  if (play && typeof play.then === 'function') {
    play
      .then(() => {
        musicHeldForVideo = false;
      })
      .catch(() => {
        // Autoplay blocked — keep flag so a later gesture can retry if needed.
        musicHeldForVideo = true;
      });
    return;
  }
  musicHeldForVideo = audio.paused;
}

function getAmbient() {
  if (!ambientEl || !ambientEl.isConnected) {
    ambientEl = document.querySelector('[data-ambient-audio]');
  }
  return ambientEl;
}
