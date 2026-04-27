// Humidor walkthrough — decoupled drag-to-navigate viewer with full UI controls.
// Inputs: drag (mouse / touch), wheel (locked to viewer), keyboard (←→↑↓ Home End Space),
// visible buttons (◀ play/pause ▶ reset). Page scroll je strikno blokiran dok je pointer
// unutar viewer-a (desktop) ili dok user prevlači (mobile).

export function initHumidorScrub() {
  const video = document.getElementById('humidor-scrub-video');
  const stage = document.getElementById('humidor-scrub-stage');
  if (!video || !stage) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  stage.setAttribute('tabindex', '0');
  stage.setAttribute('role', 'application');
  stage.setAttribute('aria-label', 'Šetnja kroz humidor — prevuci, koristi strelice ili dugmad');

  // -------------------- UI: control bar + progress + legend --------------------
  const ui = document.createElement('div');
  ui.className = 'humidor-walkthrough-ui';
  ui.innerHTML = `
    <div class="humidor-walkthrough-bar" aria-hidden="true">
      <div class="humidor-walkthrough-bar__fill" id="humidor-bar-fill"></div>
    </div>
    <div class="humidor-walkthrough-controls" role="toolbar" aria-label="Kontrole šetnje">
      <button type="button" class="hw-btn" data-action="reset" aria-label="Početak">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6v12M19 6l-9 6 9 6V6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="hw-btn" data-action="prev" aria-label="Korak nazad">
        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="hw-btn hw-btn--play" data-action="toggle" aria-label="Pusti / pauziraj">
        <svg class="hw-icon-play" viewBox="0 0 24 24" width="20" height="20"><path d="M7 5l12 7-12 7V5z" fill="currentColor"/></svg>
        <svg class="hw-icon-pause" viewBox="0 0 24 24" width="20" height="20" hidden><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor"/></svg>
      </button>
      <button type="button" class="hw-btn" data-action="next" aria-label="Korak napred">
        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="hw-time" aria-live="off"><span id="hw-time-cur">0.0</span> / <span id="hw-time-total">0.0</span> s</span>
      <button type="button" class="hw-btn hw-btn--help" data-action="help" aria-label="Pomoć">
        <svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 2-2.5 3v1M12 17.5h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="humidor-walkthrough-legend" id="humidor-legend" hidden>
      <h4>Kako koristiti šetnju</h4>
      <ul>
        <li><strong>Prevuci levo / desno</strong> mišem ili prstom</li>
        <li><strong>Strelice ← → ↑ ↓</strong> za korak po korak</li>
        <li><strong>Dugmad ◀ ▶</strong> za precizan korak; <strong>Play</strong> za auto-prolaz</li>
        <li><strong>Wheel / scroll</strong> nad video-om — kreće šetnju, stranica se ne pomera</li>
        <li><strong>Home / End</strong> skok na početak / kraj</li>
      </ul>
      <button type="button" class="hw-legend-close" data-action="close-help">Zatvori</button>
    </div>
  `;
  stage.appendChild(ui);

  const fill = ui.querySelector('#humidor-bar-fill');
  const tCur = ui.querySelector('#hw-time-cur');
  const tTot = ui.querySelector('#hw-time-total');
  const playIcon = ui.querySelector('.hw-icon-play');
  const pauseIcon = ui.querySelector('.hw-icon-pause');
  const legend = ui.querySelector('#humidor-legend');

  // Prevent buttons from triggering stage drag/wheel handlers
  ui.addEventListener('pointerdown', (e) => e.stopPropagation());

  const updateUI = () => {
    if (!isFinite(video.duration) || !video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    if (fill) fill.style.width = `${pct.toFixed(2)}%`;
    if (tCur) tCur.textContent = video.currentTime.toFixed(1);
    if (tTot) tTot.textContent = video.duration.toFixed(1);
  };
  video.addEventListener('timeupdate', updateUI);

  const setPlayingIcon = (playing) => {
    if (playIcon) playIcon.hidden = playing;
    if (pauseIcon) pauseIcon.hidden = !playing;
  };
  video.addEventListener('play', () => setPlayingIcon(true));
  video.addEventListener('pause', () => setPlayingIcon(false));
  video.addEventListener('ended', () => setPlayingIcon(false));

  // Wait for metadata before scrubbing
  const onReady = () => {
    if (!isFinite(video.duration) || !video.duration) return;
    video.pause();
    video.currentTime = 0;
    updateUI();
  };
  if (video.readyState >= 1) onReady();
  else video.addEventListener('loadedmetadata', onReady, { once: true });

  // Reduced-motion fallback
  if (prefersReduced) {
    video.loop = true;
    video.play().catch(() => {});
    return;
  }

  const setTime = (t) => {
    if (!isFinite(video.duration) || !video.duration) return;
    const clamped = Math.max(0, Math.min(video.duration, t));
    try { video.currentTime = clamped; } catch (_) {}
    updateUI();
  };

  const stepSize = () => (video.duration || 1) / 30;

  // -------------------- Control buttons --------------------
  ui.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'reset') {
      video.pause();
      setTime(0);
    } else if (action === 'prev') {
      video.pause();
      setTime(video.currentTime - stepSize());
    } else if (action === 'next') {
      video.pause();
      setTime(video.currentTime + stepSize());
    } else if (action === 'toggle') {
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    } else if (action === 'help') {
      legend.hidden = false;
    } else if (action === 'close-help') {
      legend.hidden = true;
    }
  });

  // -------------------- Drag to scrub --------------------
  let dragging = false;
  let startX = 0;
  let startTime = 0;
  let secPerPx = 0.02;

  const onPointerDown = (e) => {
    if (!isFinite(video.duration) || !video.duration) return;
    if (e.target.closest('.humidor-walkthrough-ui')) return; // let UI handle clicks
    dragging = true;
    startX = e.clientX;
    startTime = video.currentTime;
    const w = stage.getBoundingClientRect().width || 1;
    secPerPx = video.duration / w;
    stage.classList.add('is-dragging');
    stage.setPointerCapture?.(e.pointerId);
    stage.focus({ preventScroll: true });
    video.pause();
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

  // -------------------- Strict page-scroll lock while pointer is over viewer --------------------
  // Stage wheel scrubs the video. Additionally, we install a document-level wheel
  // blocker while the pointer is inside the viewer — guarantees the page never
  // scrolls when the user expects to be navigating the humidor.
  const onStageWheel = (e) => {
    if (!isFinite(video.duration)) return;
    e.preventDefault();
    e.stopPropagation();
    const stepSec = (e.deltaY + e.deltaX) * 0.005;
    video.pause();
    setTime(video.currentTime + stepSec);
  };
  stage.addEventListener('wheel', onStageWheel, { passive: false });

  const blockDocWheel = (e) => e.preventDefault();
  let docBlocking = false;
  const startDocBlock = () => {
    if (docBlocking) return;
    docBlocking = true;
    document.addEventListener('wheel', blockDocWheel, { passive: false });
    document.addEventListener('touchmove', blockDocWheel, { passive: false });
  };
  const stopDocBlock = () => {
    if (!docBlocking) return;
    docBlocking = false;
    document.removeEventListener('wheel', blockDocWheel, { passive: false });
    document.removeEventListener('touchmove', blockDocWheel, { passive: false });
  };
  stage.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') startDocBlock();
  });
  stage.addEventListener('pointerleave', () => stopDocBlock());
  // Also block during touch drag (in case touch starts on stage)
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') startDocBlock();
  });
  stage.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'mouse') stopDocBlock();
  });
  stage.addEventListener('pointercancel', () => stopDocBlock());

  // -------------------- Keyboard --------------------
  stage.addEventListener('keydown', (e) => {
    if (!isFinite(video.duration)) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      video.pause();
      setTime(video.currentTime + stepSize());
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      video.pause();
      setTime(video.currentTime - stepSize());
    } else if (e.key === 'Home') {
      e.preventDefault();
      video.pause();
      setTime(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      video.pause();
      setTime(video.duration);
    } else if (e.key === ' ') {
      e.preventDefault();
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    } else if (e.key === 'Escape') {
      legend.hidden = true;
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
  ui.addEventListener('click', hide, { once: true });
}
