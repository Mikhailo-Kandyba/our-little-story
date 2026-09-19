import { clearNode, el } from '../game-dom';
import { playMemorySound, playSuccessSound, playUiSound } from '../game-audio';

/**
 * Chapter 4 — compact memory maze.
 * Grid legend:
 * 0 empty, 1 wall, 2 start, 3 exit,
 * 'p' photo, 'n' note, 'm' memory, 'u' music
 */
const MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 1, 0, 0, 0, 'p', 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 'n', 1],
  [1, 0, 0, 0, 0, 'm', 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 'u', 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const OBJ_KEYS = {
  p: 'photo',
  n: 'note',
  m: 'memory',
  u: 'music'
};

export function mountMaze(root, ctx) {
  const c = ctx.content.maze;
  let destroyed = false;
  let paused = false;
  let completed = false;
  const collected = {
    photo: false,
    note: false,
    memory: false,
    music: false
  };

  let px = 1;
  let py = 1;
  for (let y = 0; y < MAZE.length; y += 1) {
    for (let x = 0; x < MAZE[y].length; x += 1) {
      if (MAZE[y][x] === 2) {
        px = x;
        py = y;
      }
    }
  }

  clearNode(root);
  const wrap = el('div', 'sg-chapter sg-maze');
  wrap.appendChild(el('h2', 'sg-chapter__title', { text: c.title }));
  wrap.appendChild(el('p', 'sg-chapter__sub', { text: c.subtitle }));

  const checklist = el('ul', 'sg-maze__checklist');
  const checkItems = {};
  ['photo', 'note', 'memory', 'music'].forEach(function (key) {
    const obj = c.objects[key];
    const li = el('li', 'sg-maze__check', {
      html: '<span>' + obj.icon + ' ' + obj.label + '</span><span data-mark>—</span>'
    });
    checklist.appendChild(li);
    checkItems[key] = li;
  });
  wrap.appendChild(checklist);

  const stage = el('div', 'sg-maze__stage');
  const grid = el('div', 'sg-maze__grid');
  const cells = [];
  MAZE.forEach(function (row) {
    const rowCells = [];
    row.forEach(function (cell) {
      const node = el('div', 'sg-maze__cell');
      if (cell === 1) {
        node.classList.add('is-wall');
      } else if (cell === 3) {
        node.classList.add('is-exit');
        node.textContent = '✨';
      } else if (OBJ_KEYS[cell]) {
        node.classList.add('is-object');
        node.dataset.obj = OBJ_KEYS[cell];
        node.textContent = c.objects[OBJ_KEYS[cell]].icon;
      }
      grid.appendChild(node);
      rowCells.push(node);
    });
    cells.push(rowCells);
  });

  const player = el('div', 'sg-maze__player', { text: '❤️', 'aria-hidden': 'true' });
  grid.appendChild(player);
  stage.appendChild(grid);
  wrap.appendChild(stage);

  const pad = el('div', 'sg-maze__pad', { 'aria-label': 'Керування' });
  [
    { dir: 'up', label: '↑', dx: 0, dy: -1 },
    { dir: 'left', label: '←', dx: -1, dy: 0 },
    { dir: 'down', label: '↓', dx: 0, dy: 1 },
    { dir: 'right', label: '→', dx: 1, dy: 0 }
  ].forEach(function (d) {
    const b = el('button', 'sg-maze__pad-btn sg-maze__pad-btn_' + d.dir, {
      type: 'button',
      text: d.label,
      'aria-label': d.dir
    });
    b.addEventListener('click', function () {
      tryMove(d.dx, d.dy);
    });
    pad.appendChild(b);
  });
  wrap.appendChild(pad);

  const modal = el('div', 'sg-maze__modal', { hidden: 'true', role: 'dialog' });
  const modalCard = el('div', 'sg-maze__modal-card');
  const modalBody = el('div', 'sg-maze__modal-body');
  const modalClose = el('button', 'btn btn_primary sg-btn', {
    type: 'button',
    text: 'Далі'
  });
  modalCard.appendChild(modalBody);
  modalCard.appendChild(modalClose);
  modal.appendChild(modalCard);
  wrap.appendChild(modal);
  root.appendChild(wrap);

  function placePlayer() {
    const cell = cells[py][px];
    const cellRect = cell.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    player.style.left =
      cell.offsetLeft + cell.offsetWidth / 2 - player.offsetWidth / 2 + 'px';
    player.style.top =
      cell.offsetTop + cell.offsetHeight / 2 - player.offsetHeight / 2 + 'px';
    void cellRect;
    void gridRect;
  }

  function allCollected() {
    return collected.photo && collected.note && collected.memory && collected.music;
  }

  function updateChecks() {
    Object.keys(checkItems).forEach(function (key) {
      const mark = checkItems[key].querySelector('[data-mark]');
      if (collected[key]) {
        checkItems[key].classList.add('is-done');
        if (mark) {
          mark.textContent = '✓';
        }
      }
    });
    if (allCollected()) {
      cells.forEach(function (row) {
        row.forEach(function (node) {
          if (node.classList.contains('is-exit')) {
            node.classList.add('is-glow');
          }
        });
      });
    }
  }

  function openMemory(key) {
    if (collected[key] || paused) {
      return;
    }
    paused = true;
    collected[key] = true;
    updateChecks();
    playMemorySound();

    const obj = c.objects[key];
    clearNode(modalBody);
    modalBody.appendChild(
      el('p', 'sg-maze__modal-icon', { text: obj.icon + ' ' + obj.label })
    );
    if (obj.image) {
      modalBody.appendChild(
        el('img', 'sg-maze__modal-img', { src: obj.image, alt: obj.label })
      );
    }
    modalBody.appendChild(el('p', 'sg-maze__modal-text', { text: obj.text }));
    modal.hidden = false;
    modal.classList.add('is-open');

    // clear cell icon softly
    cells[py][px].classList.add('is-collected');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.hidden = true;
    paused = false;
    playUiSound();
    if (allCollected()) {
      // soft hint
    }
  }

  modalClose.addEventListener('click', closeModal);

  function tryMove(dx, dy) {
    if (destroyed || paused || completed) {
      return;
    }
    const nx = px + dx;
    const ny = py + dy;
    if (ny < 0 || nx < 0 || ny >= MAZE.length || nx >= MAZE[0].length) {
      return;
    }
    const cell = MAZE[ny][nx];
    if (cell === 1) {
      return;
    }

    px = nx;
    py = ny;
    placePlayer();

    if (OBJ_KEYS[cell] && !collected[OBJ_KEYS[cell]]) {
      openMemory(OBJ_KEYS[cell]);
      return;
    }

    if (cell === 3 && allCollected()) {
      completed = true;
      playSuccessSound();
      const banner = el('div', 'sg-maze__exit-banner');
      banner.appendChild(el('p', '', { text: c.exitFound }));
      const btn = el('button', 'btn btn_primary sg-btn', {
        type: 'button',
        text: 'Далі 💗'
      });
      btn.addEventListener('click', function () {
        playUiSound();
        ctx.onComplete({});
      });
      banner.appendChild(btn);
      wrap.appendChild(banner);
    }
  }

  function onKey(event) {
    const map = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      w: [0, -1],
      W: [0, -1],
      s: [0, 1],
      S: [0, 1],
      a: [-1, 0],
      A: [-1, 0],
      d: [1, 0],
      D: [1, 0]
    };
    const m = map[event.key];
    if (m) {
      tryMove(m[0], m[1]);
      event.preventDefault();
    }
  }

  window.addEventListener('keydown', onKey);
  requestAnimationFrame(placePlayer);
  window.addEventListener('resize', placePlayer);

  // Swipe navigation for mobile
  let swipeX = 0;
  let swipeY = 0;
  let swiping = false;
  grid.addEventListener(
    'touchstart',
    function (event) {
      if (paused || completed) {
        return;
      }
      const t = event.touches[0];
      if (!t) {
        return;
      }
      swiping = true;
      swipeX = t.clientX;
      swipeY = t.clientY;
    },
    { passive: true }
  );
  grid.addEventListener(
    'touchend',
    function (event) {
      if (!swiping || paused || completed) {
        swiping = false;
        return;
      }
      swiping = false;
      const t = event.changedTouches[0];
      if (!t) {
        return;
      }
      const dx = t.clientX - swipeX;
      const dy = t.clientY - swipeY;
      if (Math.abs(dx) < 28 && Math.abs(dy) < 28) {
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        tryMove(dx > 0 ? 1 : -1, 0);
      } else {
        tryMove(0, dy > 0 ? 1 : -1);
      }
    },
    { passive: true }
  );

  return {
    destroy: function () {
      destroyed = true;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', placePlayer);
      clearNode(root);
    }
  };
}
