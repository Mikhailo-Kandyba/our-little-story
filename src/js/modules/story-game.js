import { gameContent, gameSection } from '../siteConfig';
import { prefersReducedMotion, trapFocus } from './utils';
import {
  completeChapter,
  createInitialState,
  loadGameState,
  resetGameState,
  saveGameState
} from './game/game-state';
import {
  initGameAudio,
  playHeartSound,
  playUiSound,
  unlockGameAudio
} from './game/game-audio';
import { clearNode, el, preventScrollWhile, spawnParticles, wait } from './game/game-dom';
import { mountRevealMemory } from './game/chapters/reveal-memory';
import { mountCatchMoments } from './game/chapters/catch-moments';
import { mountPuzzle } from './game/chapters/puzzle';
import { mountMaze } from './game/chapters/maze';
import { mountHiddenHeart } from './game/chapters/hidden-heart';
import { mountFinale } from './game/chapters/finale';

let state = createInitialState();
let activeChapter = null;
let overlayOpen = false;
let lastFocus = null;

export function initStoryGame() {
  const teaser = document.querySelector('[data-story-game-teaser]');
  const overlay = document.querySelector('[data-story-game]');
  if (!teaser || !overlay) {
    return;
  }

  hydrateTeaser(teaser);
  initGameAudio(gameContent.sounds);

  state = loadGameState();

  const openBtns = teaser.querySelectorAll('[data-game-open]');
  openBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      unlockGameAudio();
      playUiSound();
      openGame(overlay);
    });
  });

  const closeBtns = overlay.querySelectorAll('[data-game-close]');
  closeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      playUiSound();
      closeGame(overlay);
    });
  });

  const restartBtn = overlay.querySelector('[data-game-restart]');
  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      playUiSound();
      state = resetGameState();
      renderProgress(overlay);
      showIntro(overlay);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (!overlayOpen) {
      return;
    }
    if (event.key === 'Escape') {
      closeGame(overlay);
    }
    if (event.key === 'Tab') {
      trapFocus(overlay, event);
    }
  });
}

function hydrateTeaser(teaser) {
  const eyebrow = teaser.querySelector('[data-game-eyebrow]');
  const title = teaser.querySelector('[data-game-heading]');
  const lead = teaser.querySelector('[data-game-lead]');
  const prompt = teaser.querySelector('[data-game-prompt]');
  const btn = teaser.querySelector('[data-game-open]');
  if (eyebrow) {
    eyebrow.textContent = gameSection.eyebrow;
  }
  if (title) {
    title.textContent = gameSection.heading;
  }
  if (lead) {
    lead.textContent = gameSection.lead;
  }
  if (prompt) {
    prompt.textContent = gameSection.startPrompt || '';
  }
  if (btn) {
    btn.textContent = gameSection.startButton;
  }
}

function openGame(overlay) {
  lastFocus = document.activeElement;
  overlayOpen = true;
  state = loadGameState();
  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('has-story-game');
  preventScrollWhile(true);
  requestAnimationFrame(function () {
    overlay.classList.add('is-open');
  });

  renderProgress(overlay);
  const closeBtn = overlay.querySelector('[data-game-close]');
  if (closeBtn) {
    closeBtn.focus();
  }

  if (!state.gameStarted) {
    showIntro(overlay);
  } else if (state.gameCompleted || state.currentChapter >= 6) {
    showChapter(overlay, 6);
  } else {
    showChapter(overlay, Math.max(1, state.currentChapter || 1));
  }
}

function closeGame(overlay) {
  overlayOpen = false;
  destroyChapter();
  overlay.classList.remove('is-open');
  document.body.classList.remove('has-story-game');
  preventScrollWhile(false);
  document.body.classList.remove('sg-playing');
  window.setTimeout(function () {
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
  }, 320);
}

function showIntro(overlay) {
  destroyChapter();
  const stage = overlay.querySelector('[data-game-stage]');
  if (!stage) {
    return;
  }
  clearNode(stage);

  const intro = el('div', 'sg-intro');
  const particles = el('div', 'sg-intro__particles', { 'aria-hidden': 'true' });
  for (let i = 0; i < 12; i += 1) {
    let symbol = '♡';
    if (i % 3 === 0) {
      symbol = '💗';
    } else if (i % 2 === 0) {
      symbol = '✨';
    }
    const p = el('span', 'sg-intro__floater', {
      text: symbol
    });
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 3 + 's';
    p.style.animationDuration = 6 + Math.random() * 6 + 's';
    particles.appendChild(p);
  }
  intro.appendChild(particles);
  intro.appendChild(el('h2', 'sg-intro__title', { text: gameContent.title }));
  intro.appendChild(el('p', 'sg-intro__sub', { text: gameContent.subtitle }));

  const start = el('button', 'btn btn_primary sg-btn', {
    type: 'button',
    text: gameContent.startStory
  });
  start.addEventListener('click', function () {
    unlockGameAudio();
    playUiSound();
    state.gameStarted = true;
    state.currentChapter = 1;
    saveGameState(state);
    showChapter(overlay, 1);
  });
  intro.appendChild(start);
  stage.appendChild(intro);
  spawnParticles(intro, 8);
}

function showChapter(overlay, chapterNum) {
  destroyChapter();
  renderProgress(overlay);
  const stage = overlay.querySelector('[data-game-stage]');
  if (!stage) {
    return;
  }
  clearNode(stage);
  stage.classList.remove('is-fade');
  void stage.offsetWidth;
  stage.classList.add('is-enter');

  const ctx = {
    content: gameContent,
    onComplete: function () {
      awardFragment(overlay, chapterNum).then(function () {
        const next = completeChapter(state, chapterNum);
        state = next;
        renderProgress(overlay);
        return transitionTo(overlay, chapterNum + 1);
      });
    },
    onReplay: function () {
      state = resetGameState();
      renderProgress(overlay);
      showIntro(overlay);
    },
    onClose: function () {
      closeGame(overlay);
    },
    onAnswer: function (answer) {
      state.finalAnswer = answer;
      state.gameCompleted = true;
      saveGameState(state);
    }
  };

  if (chapterNum === 1) {
    activeChapter = mountRevealMemory(stage, ctx);
  } else if (chapterNum === 2) {
    activeChapter = mountCatchMoments(stage, ctx);
  } else if (chapterNum === 3) {
    activeChapter = mountPuzzle(stage, ctx);
  } else if (chapterNum === 4) {
    activeChapter = mountMaze(stage, ctx);
  } else if (chapterNum === 5) {
    // Hidden heart awards fragment then goes to finale via onComplete
    activeChapter = mountHiddenHeart(stage, {
      content: gameContent,
      onComplete: function () {
        awardFragment(overlay, 5).then(function () {
          state = completeChapter(state, 5);
          renderProgress(overlay);
          return transitionTo(overlay, 6);
        });
      }
    });
  } else {
    activeChapter = mountFinale(stage, ctx);
  }
}

function transitionTo(overlay, chapterNum) {
  const stage = overlay.querySelector('[data-game-stage]');
  const ms = prefersReducedMotion()
    ? 200
    : gameContent.chapterTransitionMs || 900;
  if (stage) {
    stage.classList.add('is-fade');
  }
  return wait(ms).then(function () {
    showChapter(overlay, chapterNum);
  });
}

function awardFragment(overlay, chapterNum) {
  playHeartSound();
  const progress = overlay.querySelector('[data-game-progress]');
  if (!progress || prefersReducedMotion()) {
    return wait(200);
  }
  const flyer = el('span', 'sg-flyer', { text: '💗', 'aria-hidden': 'true' });
  overlay.appendChild(flyer);
  const hearts = progress.querySelectorAll('.sg-progress__heart');
  const target = hearts[chapterNum - 1] || progress;
  const fromRect = {
    left: window.innerWidth / 2,
    top: window.innerHeight * 0.45
  };
  const toRect = target.getBoundingClientRect();
  flyer.style.left = fromRect.left + 'px';
  flyer.style.top = fromRect.top + 'px';
  requestAnimationFrame(function () {
    flyer.style.left = toRect.left + toRect.width / 2 + 'px';
    flyer.style.top = toRect.top + toRect.height / 2 + 'px';
    flyer.classList.add('is-fly');
  });
  return wait(700).then(function () {
    if (flyer.parentNode) {
      flyer.parentNode.removeChild(flyer);
    }
    progress.classList.add('is-pulse');
    window.setTimeout(function () {
      progress.classList.remove('is-pulse');
    }, 500);
  });
}

function renderProgress(overlay) {
  const progress = overlay.querySelector('[data-game-progress]');
  if (!progress) {
    return;
  }
  const count = state.heartFragments || 0;
  let html = '';
  for (let i = 0; i < 5; i += 1) {
    const on = i < count;
    html +=
      '<span class="sg-progress__heart' +
      (on ? ' is-on' : '') +
      '" aria-hidden="true">' +
      (on ? '❤️' : '♡') +
      '</span>';
  }
  html +=
    '<span class="sg-progress__count">' +
    count +
    ' / 5</span>';
  progress.innerHTML = html;
  progress.setAttribute(
    'aria-label',
    gameContent.fragmentsLabel + ': ' + count + ' з 5'
  );
}

function destroyChapter() {
  if (activeChapter && typeof activeChapter.destroy === 'function') {
    activeChapter.destroy();
  }
  activeChapter = null;
}
