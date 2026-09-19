import { clearNode, el, spawnParticles, wait } from '../game-dom';
import { playSuccessSound, playUiSound } from '../game-audio';
import { prefersReducedMotion } from '../../utils';

/**
 * Chapter 3 — 3x3 grid swap puzzle (reliable on mobile).
 */
export function mountPuzzle(root, ctx) {
  const c = ctx.content.puzzle;
  let destroyed = false;
  let completed = false;
  let selected = null;
  let helpShown = false;

  // order[i] = which piece id sits in slot i (0..8). Goal: order[i] === i
  let order = shuffleSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8]);

  clearNode(root);
  const wrap = el('div', 'sg-chapter sg-puzzle');
  wrap.appendChild(el('h2', 'sg-chapter__title', { text: c.title }));
  wrap.appendChild(el('p', 'sg-chapter__sub', { text: c.subtitle }));

  const board = el('div', 'sg-puzzle__board', {
    role: 'grid',
    'aria-label': 'Пазл зі спогаду'
  });
  const slots = [];

  [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach(function (slotIndex) {
    const slot = el('button', 'sg-puzzle__slot', {
      type: 'button',
      role: 'gridcell',
      'aria-label': 'Клітинка ' + (slotIndex + 1)
    });
    const tile = el('span', 'sg-puzzle__tile');
    slot.appendChild(tile);
    board.appendChild(slot);
    slots.push({ slot: slot, tile: tile, index: slotIndex });

    slot.addEventListener('click', function () {
      if (completed) {
        return;
      }
      onSlotTap(slotIndex);
    });
  });

  wrap.appendChild(board);

  const helpBtn = el('button', 'btn btn_ghost sg-btn sg-puzzle__help', {
    type: 'button',
    text: c.helpButton,
    hidden: 'true'
  });
  helpBtn.addEventListener('click', function () {
    playUiSound();
    flashHint();
  });
  wrap.appendChild(helpBtn);
  root.appendChild(wrap);

  function pieceStyle(pieceId) {
    const col = pieceId % 3;
    const row = Math.floor(pieceId / 3);
    return {
      backgroundImage: 'url("' + c.photo + '")',
      backgroundSize: '300% 300%',
      backgroundPosition: col * 50 + '% ' + row * 50 + '%'
    };
  }

  function render() {
    slots.forEach(function (s, i) {
      const pieceId = order[i];
      const st = pieceStyle(pieceId);
      s.tile.style.backgroundImage = st.backgroundImage;
      s.tile.style.backgroundSize = st.backgroundSize;
      s.tile.style.backgroundPosition = st.backgroundPosition;
      s.slot.classList.toggle('is-correct', pieceId === i);
      s.slot.classList.toggle('is-selected', selected === i);
    });
  }

  function onSlotTap(i) {
    playUiSound();
    if (selected == null) {
      selected = i;
      render();
      return;
    }
    if (selected === i) {
      selected = null;
      render();
      return;
    }
    const a = selected;
    const tmp = order[a];
    order[a] = order[i];
    order[i] = tmp;
    selected = null;
    render();
    checkDone();
  }

  function flashHint() {
    for (let i = 0; i < 9; i += 1) {
      if (order[i] !== i) {
        const correctSlot = order.indexOf(i);
        slots[i].slot.classList.add('is-hint');
        if (correctSlot >= 0) {
          slots[correctSlot].slot.classList.add('is-hint-source');
        }
        window.setTimeout(function () {
          slots.forEach(function (s) {
            s.slot.classList.remove('is-hint', 'is-hint-source');
          });
        }, 1200);
        return;
      }
    }
  }

  function checkDone() {
    const ok = order.every(function (v, i) {
      return v === i;
    });
    if (!ok || completed) {
      return;
    }
    completed = true;
    board.classList.add('is-complete');
    spawnParticles(board, 14);
    playSuccessSound();

    wait(prefersReducedMotion() ? 250 : 800).then(function () {
      if (destroyed) {
        return;
      }
      const after = el('div', 'sg-puzzle__after');
      after.appendChild(el('p', 'sg-puzzle__done', { text: c.done }));
      after.appendChild(el('p', 'sg-puzzle__note', { text: c.afterText }));
      const btn = el('button', 'btn btn_primary sg-btn', {
        type: 'button',
        text: 'Далі 💗'
      });
      btn.addEventListener('click', function () {
        playUiSound();
        ctx.onComplete({});
      });
      after.appendChild(btn);
      wrap.appendChild(after);
    });
  }

  render();

  window.setTimeout(function () {
    if (!destroyed && !completed && !helpShown) {
      helpShown = true;
      helpBtn.hidden = false;
    }
  }, c.helpAfterMs || 12000);

  return {
    destroy: function () {
      destroyed = true;
      clearNode(root);
    }
  };
}

function shuffleSolvable(arr) {
  const a = arr.slice();
  let guard = 0;
  do {
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    guard += 1;
  } while (isSolved(a) && guard < 20);
  return a;
}

function isSolved(a) {
  return a.every(function (v, i) {
    return v === i;
  });
}
