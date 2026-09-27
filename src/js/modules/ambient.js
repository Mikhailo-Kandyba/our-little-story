import { ambientAudio, BACKGROUND_VOLUME } from '../siteConfig';
import { prefersReducedMotion } from './utils';

let ambientEl = null;
let musicUnlocked = false;
let musicWanted = false;
let bound = false;
/** Invalidates in-flight ambient.play() callbacks after a newer sync. */
let syncGeneration = 0;

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
  syncGeneration += 1;
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

/**
 * Pause ambient while any video is actually playing; resume when none are.
 * Safe to call after play / pause / ended / carousel slide changes.
 */
export function syncBackgroundMusicWithVideos() {
  const audio = getAmbient();
  if (!audio) {
    return;
  }

  if (hasPlayingVideo()) {
    syncGeneration += 1;
    if (!audio.paused) {
      audio.pause();
    }
    return;
  }

  if (!musicUnlocked || !musicWanted || !audio.paused) {
    return;
  }

  const generation = (syncGeneration += 1);
  audio.volume = BACKGROUND_VOLUME;
  const play = audio.play();
  if (play && typeof play.then === 'function') {
    play.catch((error) => {
      if (generation !== syncGeneration) {
        return;
      }
      console.warn('Background music resume failed:', error);
    });
  }
}

function bindVideoMusicBridge() {
  if (bound) {
    return;
  }
  bound = true;

  document.addEventListener(
    'play',
    (event) => {
      if (!isVideoEventTarget(event)) {
        return;
      }
      syncBackgroundMusicWithVideos();
    },
    true
  );

  document.addEventListener(
    'pause',
    (event) => {
      if (!isVideoEventTarget(event)) {
        return;
      }
      syncBackgroundMusicWithVideos();
    },
    true
  );

  document.addEventListener(
    'ended',
    (event) => {
      if (!isVideoEventTarget(event)) {
        return;
      }
      syncBackgroundMusicWithVideos();
    },
    true
  );
}

function hasPlayingVideo() {
  const videos = document.querySelectorAll('video');
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    // Prefer real element state over a mirrored boolean (can desync on slide changes).
    // readyState > 0 skips MEDIA_NONE shells that never loaded; still true once playback starts.
    if (!video.paused && !video.ended && video.readyState > 0) {
      return true;
    }
  }
  return false;
}

function isVideoEventTarget(event) {
  const el = event && event.target;
  return !!(el && el.tagName === 'VIDEO');
}

function getAmbient() {
  if (!ambientEl || !ambientEl.isConnected) {
    ambientEl = document.querySelector('[data-ambient-audio]');
  }
  return ambientEl;
}
