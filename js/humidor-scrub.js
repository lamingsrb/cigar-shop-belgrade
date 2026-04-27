// Humidor walkthrough — decoupled drag-to-navigate video viewer.
// User interakcija: mouse drag, touch swipe, keyboard arrows scrub video.currentTime.
// Page scroll NIJE hijack-ovan — jedino unutar viewer-a (touch-action: none) pointer
// gestovi ne pomeraju stranicu.

export function initHumidorScrub() {
  const video = document.getElementById('humidor-scrub-video');
  const stage = document.getElementById('humidor-scrub-stage');
  if (!video || !stage) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Make stage focusable for keyboard
  stage.setAttribute('tabindex', '0');
  stage.setAttribute('role', 'application');
  stage.setAttribute('aria-label', 'Drag, swipe or use arrow keys to walk through the humidor');

  // Build progress bar UI
  const ui = document.createElement('div');
  ui.className = 'humidor-walkthrough-ui';
  ui.innerHTML = `
    <div class="humidor-walkthrough-bar">
      <div class="humidor-walkthrough-bar__fill" id="humidor-bar-fill"></div>
    </div>
  `;
  stage.appendChild(ui);
  const fill = ui.querySelector('#humidor-bar-fill');

  const updateUI = () => {
    if (!isFinite(video.duration) || !video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    if (fill) fill.style.width = `${pct.toFixed(2)}%`;
  };
  video.addEventListener('timeupdate', updateUI);

  // Wait for metadata before scrubbing
  const onReady = () => {
    if (!isFinite(video.duration) || !video.duration) return;
    video.pause();
    video.currentTime = 0;
    updateUI();
  };
  if (video.readyState >= 1) onReady();
  else video.addEventListener('loadedmetadata', onReady, { once: true });

  // Reduced motion: just play at low loop
  if (prefersReduced) {
    video.loop = true;
    video.play().catch(() => {});
    return;
  }

  // -------------------- Drag to scrub --------------------
  let dragging = false;
  let startX = 0;
  let startTime = 0;
  // Sensitivity: how many seconds of video per pixel of horizontal drag.
  // We want full duration ≈ stage width. We compute on drag start.
  let secPerPx = 0.02;

  const setTime = (t) => {
    if (!isFinite(video.duration) || !video.duration) return;
    const clamped = Math.max(0, Math.min(video.duration, t));
    try { video.currentTime = clamped; } catch (_) {}
    updateUI();
  };

  const onPointerDown = (e) => {
    if (!isFinite(video.duration) || !video.duration) return;
    dragging = true;
    startX = e.clientX;
    startTime = video.currentTime;
    // Stage width spans full duration (one full traversal = drag across stage)
    const w = stage.getBoundingClientRect().width || 1;
    secPerPx = video.duration / w;
    stage.classList.add('is-dragging');
    stage.setPointerCapture?.(e.pointerId);
    stage.focus({ preventScroll: true });
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    setTime(startTime + dx * secPerPx);
  };

  const onPointerUp = (e) => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    stage.releasePointerCapture?.(e.pointerId);
  };

  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointercancel', onPointerUp);
  stage.addEventListener('pointerleave', onPointerUp);

  // -------------------- Wheel inside viewer = scrub (no page scroll) --------------------
  // Only active when the cursor is over the viewer; otherwise page scroll continues.
  stage.addEventListener('wheel', (e) => {
    if (!isFinite(video.duration) || !video.duration) return;
    e.preventDefault();
    const stepSec = (e.deltaY + e.deltaX) * 0.005;
    setTime(video.currentTime + stepSec);
  }, { passive: false });

  // -------------------- Keyboard --------------------
  stage.addEventListener('keydown', (e) => {
    if (!isFinite(video.duration)) return;
    const step = video.duration / 30;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setTime(video.currentTime + step);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setTime(video.currentTime - step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setTime(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setTime(video.duration);
    }
  });

  // -------------------- Hide hint after first interaction --------------------
  const hint = stage.querySelector('.humidor__scrub-hint');
  let hidden = false;
  const hide = () => {
    if (hidden || !hint) return;
    hidden = true;
    hint.classList.add('is-fading');
    setTimeout(() => hint.remove(), 800);
  };
  stage.addEventListener('pointerdown', hide, { once: true });
  stage.addEventListener('keydown', hide, { once: true });
  stage.addEventListener('wheel', hide, { once: true, passive: true });
}
