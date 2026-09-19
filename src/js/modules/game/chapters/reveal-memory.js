import { clearNode, el, spawnParticles, wait } from '../game-dom';
import { playSuccessSound, playUiSound } from '../game-audio';
import { prefersReducedMotion } from '../../utils';

/**
 * Chapter 1 — wipe fog to reveal a memory photo (canvas mask).
 */
export function mountRevealMemory(root, ctx) {
  const c = ctx.content.reveal;
  let destroyed = false;
  let completed = false;
  let drawing = false;
  let lastX = 0;
  let lastY = 0;
  let revealed = 0;

  clearNode(root);
  const wrap = el('div', 'sg-chapter sg-reveal');
  wrap.appendChild(el('h2', 'sg-chapter__title', { text: c.title }));
  wrap.appendChild(el('p', 'sg-chapter__sub', { text: c.subtitle }));

  const frame = el('div', 'sg-reveal__frame');
  const img = el('img', 'sg-reveal__photo', {
    src: c.photo,
    alt: c.photoAlt || '',
    draggable: 'false'
  });
  const canvas = el('canvas', 'sg-reveal__fog');
  canvas.setAttribute('aria-label', 'Стирай туман пальцем або мишкою');
  const progress = el('p', 'sg-reveal__progress', {
    text: c.progressLabel + ' 0%'
  });

  frame.appendChild(img);
  frame.appendChild(canvas);
  wrap.appendChild(frame);
  wrap.appendChild(progress);
  root.appendChild(wrap);

  const ctx2d = canvas.getContext('2d');
  let brush = 42;
  let lastW = 0;
  let lastH = 0;
  let fogReady = false;

  function sizeCanvas() {
    const rect = frame.getBoundingClientRect();
    const w = Math.max(240, Math.floor(rect.width));
    const h = Math.max(180, Math.floor(w * 0.72));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const same = fogReady && Math.abs(w - lastW) < 8 && Math.abs(h - lastH) < 8;
    if (same) {
      return;
    }
    // Preserve reveal only if already progressed meaningfully — otherwise reset fog
    const keepReveal = fogReady && revealed > 0.05;
    let saved = null;
    if (keepReveal) {
      try {
        saved = ctx2d.getImageData(0, 0, canvas.width, canvas.height);
      } catch (err) {
        saved = null;
      }
    }
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    frame.style.height = h + 'px';
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    brush = Math.max(40, Math.min(72, w * 0.1));
    lastW = w;
    lastH = h;
    if (saved) {
      try {
        const tmp = document.createElement('canvas');
        tmp.width = saved.width;
        tmp.height = saved.height;
        tmp.getContext('2d').putImageData(saved, 0, 0);
        ctx2d.drawImage(tmp, 0, 0, w, h);
      } catch (err) {
        paintFog(w, h);
      }
    } else {
      paintFog(w, h);
    }
    fogReady = true;
  }

  function paintFog(w, h) {
    const g = ctx2d.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(255, 246, 250, 0.97)');
    g.addColorStop(0.5, 'rgba(244, 220, 232, 0.95)');
    g.addColorStop(1, 'rgba(232, 210, 240, 0.96)');
    ctx2d.globalCompositeOperation = 'source-over';
    ctx2d.fillStyle = g;
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 18; i += 1) {
      ctx2d.beginPath();
      ctx2d.arc(
        Math.random() * w,
        Math.random() * h,
        20 + Math.random() * 50,
        0,
        Math.PI * 2
      );
      ctx2d.fill();
    }
  }

  function pointerPos(event) {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches && event.touches[0];
    const clientX = touch ? touch.clientX : event.clientX;
    const clientY = touch ? touch.clientY : event.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function eraseAt(x, y) {
    ctx2d.globalCompositeOperation = 'destination-out';
    ctx2d.beginPath();
    ctx2d.arc(x, y, brush, 0, Math.PI * 2);
    ctx2d.fill();
    if (lastX || lastY) {
      ctx2d.lineWidth = brush * 2;
      ctx2d.lineCap = 'round';
      ctx2d.beginPath();
      ctx2d.moveTo(lastX, lastY);
      ctx2d.lineTo(x, y);
      ctx2d.stroke();
    }
    lastX = x;
    lastY = y;
  }

  function sampleReveal() {
    try {
      const data = ctx2d.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      const step = 16;
      for (let i = 3; i < data.length; i += 4 * step) {
        if (data[i] < 40) {
          clear += 1;
        }
      }
      const total = Math.ceil(data.length / (4 * step));
      revealed = total ? clear / total : 0;
      progress.textContent =
        c.progressLabel + ' ' + Math.min(100, Math.round(revealed * 100)) + '%';
      if (revealed >= (c.completeAt || 0.75) && !completed) {
        finishReveal();
      }
    } catch (err) {
      // tainted canvas unlikely for same-origin img
    }
  }

  function finishReveal() {
    if (completed || destroyed) {
      return;
    }
    completed = true;
    canvas.style.opacity = '0';
    frame.classList.add('is-clear');
    spawnParticles(frame, 12);
    playSuccessSound();
    progress.textContent = c.progressLabel + ' 100%';

    wait(prefersReducedMotion() ? 200 : 700).then(function () {
      if (destroyed) {
        return;
      }
      const after = el('div', 'sg-reveal__after');
      after.appendChild(el('p', 'sg-reveal__prompt', { text: c.afterReveal }));
      const choices = el('div', 'sg-choices');
      (c.choices || []).forEach(function (label) {
        const btn = el('button', 'sg-choice', { type: 'button', text: label });
        btn.addEventListener('click', function () {
          playUiSound();
          choices.querySelectorAll('button').forEach(function (b) {
            b.disabled = true;
          });
          ctx.onComplete({ choice: label });
        });
        choices.appendChild(btn);
      });
      after.appendChild(choices);
      wrap.appendChild(after);
    });
  }

  function onDown(event) {
    if (completed) {
      return;
    }
    drawing = true;
    const p = pointerPos(event);
    lastX = p.x;
    lastY = p.y;
    eraseAt(p.x, p.y);
    if (event.cancelable) {
      event.preventDefault();
    }
  }

  function onMove(event) {
    if (!drawing || completed) {
      return;
    }
    const p = pointerPos(event);
    eraseAt(p.x, p.y);
    sampleReveal();
    if (event.cancelable) {
      event.preventDefault();
    }
  }

  function onUp() {
    drawing = false;
    lastX = 0;
    lastY = 0;
    if (!completed) {
      sampleReveal();
    }
  }

  canvas.addEventListener('mousedown', onDown);
  canvas.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  canvas.addEventListener('touchstart', onDown, { passive: false });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onUp);
  canvas.addEventListener('touchcancel', onUp);

  img.addEventListener('load', sizeCanvas);
  window.addEventListener('resize', sizeCanvas);
  sizeCanvas();

  return {
    destroy: function () {
      destroyed = true;
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('resize', sizeCanvas);
      clearNode(root);
    }
  };
}
