import { clearNode, el, spawnParticles } from '../game-dom';
import { playHeartSound, playUiSound } from '../game-audio';
import { prefersReducedMotion } from '../../utils';

/**
 * Chapter 2 — catch falling good moments.
 */
export function mountCatchMoments(root, ctx) {
  const c = ctx.content.catch;
  let destroyed = false;
  let score = 0;
  let combo = 0;
  let playerX = 0.5;
  let raf = 0;
  let start = 0;
  let ended = false;
  const items = [];
  let spawnAcc = 0;
  let polaroidIdx = 0;

  clearNode(root);
  const wrap = el('div', 'sg-chapter sg-catch');
  wrap.appendChild(el('h2', 'sg-chapter__title', { text: c.title }));
  wrap.appendChild(el('p', 'sg-chapter__sub', { text: c.subtitle }));

  const hud = el('div', 'sg-catch__hud');
  const scoreEl = el('span', 'sg-catch__score', {
    text: c.scoreLabel + ' 0'
  });
  const timerEl = el('span', 'sg-catch__timer', {
    text: (c.durationSec || 20) + 's'
  });
  const comboEl = el('span', 'sg-catch__combo', { text: '' });
  hud.appendChild(scoreEl);
  hud.appendChild(comboEl);
  hud.appendChild(timerEl);
  wrap.appendChild(hud);

  const field = el('div', 'sg-catch__field', { tabindex: '0' });
  const player = el('div', 'sg-catch__player', {
    text: '💗',
    'aria-hidden': 'true'
  });
  const polaroid = el('div', 'sg-catch__polaroid', { hidden: 'true' });
  const polaroidImg = el('img', '', { alt: '' });
  polaroid.appendChild(polaroidImg);
  field.appendChild(player);
  field.appendChild(polaroid);
  wrap.appendChild(field);
  root.appendChild(wrap);

  function setPlayer(ratio) {
    playerX = Math.max(0.06, Math.min(0.94, ratio));
    player.style.left = playerX * 100 + '%';
  }
  setPlayer(0.5);

  const isNarrow = window.innerWidth < 600;
  const catchRadius = isNarrow ? 0.14 : 0.1;
  const speedScale = isNarrow ? 0.82 : 1;

  function onPointer(event) {
    const rect = field.getBoundingClientRect();
    const touch = event.touches && event.touches[0];
    const x = (touch ? touch.clientX : event.clientX) - rect.left;
    setPlayer(x / rect.width);
    if (event.cancelable && event.type.indexOf('touch') === 0) {
      event.preventDefault();
    }
  }

  function onKey(event) {
    if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
      setPlayer(playerX - 0.06);
      event.preventDefault();
    } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
      setPlayer(playerX + 0.06);
      event.preventDefault();
    }
  }

  field.addEventListener('mousemove', onPointer);
  field.addEventListener('touchstart', onPointer, { passive: false });
  field.addEventListener('touchmove', onPointer, { passive: false });
  window.addEventListener('keydown', onKey);

  const goodPool = [
    { symbol: '❤️', points: 1 },
    { symbol: '✨', points: 1 },
    { symbol: '🌸', points: 1 },
    { symbol: '📸', points: 2, polaroid: true }
  ];

  function spawn() {
    const bad = Math.random() < 0.18;
    const def = bad
      ? { symbol: '💔', points: -1, bad: true }
      : goodPool[Math.floor(Math.random() * goodPool.length)];
    const node = el('div', 'sg-catch__item' + (def.bad ? ' is-bad' : ''), {
      text: def.symbol,
      'aria-hidden': 'true'
    });
    const x = 0.1 + Math.random() * 0.8;
    node.style.left = x * 100 + '%';
    field.appendChild(node);
    items.push({
      node: node,
      x: x,
      y: -0.08,
      speed: (0.16 + Math.random() * 0.2) * speedScale,
      points: def.points,
      bad: Boolean(def.bad),
      polaroid: Boolean(def.polaroid)
    });
  }

  function showPolaroid() {
    const photos = c.polaroidPhotos || [];
    if (!photos.length) {
      return;
    }
    polaroidImg.src = photos[polaroidIdx % photos.length];
    polaroidIdx += 1;
    polaroid.hidden = false;
    polaroid.classList.add('is-show');
    window.setTimeout(function () {
      polaroid.classList.remove('is-show');
      polaroid.hidden = true;
    }, 1400);
  }

  function catchItem(item) {
    if (item.bad) {
      score = Math.max(0, score - 1);
      combo = 0;
      comboEl.textContent = '';
      field.classList.add('is-shake');
      window.setTimeout(function () {
        field.classList.remove('is-shake');
      }, 280);
    } else {
      score += item.points;
      combo += 1;
      if (combo >= 2) {
        comboEl.textContent = (combo >= 3 ? '💗 x' : '✨ x') + combo;
      }
      playHeartSound();
      if (item.polaroid) {
        showPolaroid();
      }
    }
    scoreEl.textContent = c.scoreLabel + ' ' + score;
    if (item.node.parentNode) {
      item.node.parentNode.removeChild(item.node);
    }
  }

  function endGame() {
    if (ended || destroyed) {
      return;
    }
    ended = true;
    cancelAnimationFrame(raf);
    spawnParticles(field, 10);
    const end = el('div', 'sg-catch__end');
    end.appendChild(
      el('p', 'sg-catch__end-text', {
        text: c.endLabel + ' ' + score + ' ' + c.endSuffix
      })
    );
    const btn = el('button', 'btn btn_primary sg-btn', {
      type: 'button',
      text: 'Далі 💗'
    });
    btn.addEventListener('click', function () {
      playUiSound();
      ctx.onComplete({ score: score });
    });
    end.appendChild(btn);
    wrap.appendChild(end);
  }

  function tick(now) {
    if (destroyed || ended) {
      return;
    }
    if (!start) {
      start = now;
    }
    const elapsed = (now - start) / 1000;
    const left = Math.max(0, (c.durationSec || 20) - elapsed);
    timerEl.textContent = Math.ceil(left) + 's';

    const dt = Math.min(0.05, (tick.prev ? now - tick.prev : 16) / 1000);
    tick.prev = now;

    spawnAcc += dt;
    const spawnEvery = prefersReducedMotion() ? 0.9 : 0.55;
    if (spawnAcc >= spawnEvery && left > 0.4) {
      spawnAcc = 0;
      spawn();
    }

    const catchY = 0.82;
    for (let i = items.length - 1; i >= 0; i -= 1) {
      const item = items[i];
      item.y += item.speed * dt;
      item.node.style.top = item.y * 100 + '%';
      if (item.y > 1.05) {
        if (item.node.parentNode) {
          item.node.parentNode.removeChild(item.node);
        }
        items.splice(i, 1);
        combo = 0;
        comboEl.textContent = '';
        continue;
      }
      if (Math.abs(item.x - playerX) < catchRadius && item.y > catchY && item.y < 0.95) {
        catchItem(item);
        items.splice(i, 1);
      }
    }

    if (left <= 0) {
      endGame();
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);
  field.focus();

  return {
    destroy: function () {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      clearNode(root);
    }
  };
}
