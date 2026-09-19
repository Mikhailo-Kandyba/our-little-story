import { GAME_STORAGE_KEY } from '../../siteConfig';

export function createInitialState() {
  return {
    currentChapter: 0,
    completedChapters: [],
    heartFragments: 0,
    gameStarted: false,
    gameCompleted: false,
    finalAnswer: ''
  };
}

export function loadGameState() {
  try {
    const raw = window.sessionStorage.getItem(GAME_STORAGE_KEY);
    if (!raw) {
      return createInitialState();
    }
    const parsed = JSON.parse(raw);
    const base = createInitialState();
    return Object.assign(base, {
      currentChapter: clampInt(parsed.currentChapter, 0, 6),
      completedChapters: Array.isArray(parsed.completedChapters)
        ? parsed.completedChapters.filter((n) => n >= 1 && n <= 5)
        : [],
      heartFragments: clampInt(parsed.heartFragments, 0, 5),
      gameStarted: Boolean(parsed.gameStarted),
      gameCompleted: Boolean(parsed.gameCompleted),
      finalAnswer: typeof parsed.finalAnswer === 'string' ? parsed.finalAnswer : ''
    });
  } catch (err) {
    return createInitialState();
  }
}

export function saveGameState(state) {
  try {
    window.sessionStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // ignore quota / private mode
  }
}

export function resetGameState() {
  const state = createInitialState();
  saveGameState(state);
  return state;
}

export function completeChapter(state, chapterNum) {
  const next = Object.assign({}, state);
  if (next.completedChapters.indexOf(chapterNum) === -1) {
    next.completedChapters = next.completedChapters.concat([chapterNum]);
  }
  next.heartFragments = Math.min(5, next.completedChapters.length);
  next.currentChapter = Math.min(6, chapterNum + 1);
  if (chapterNum >= 5) {
    next.gameCompleted = true;
  }
  saveGameState(next);
  return next;
}

function clampInt(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return min;
  }
  return Math.max(min, Math.min(max, Math.round(n)));
}
