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

  // -------------------- UI: progress bar (inside stage) + controls (below stage) + legend --------------------
  // Progress bar je tanka linija na dnu video-a (i dalje overlay).
  const progressEl = document.createElement('div');
  progressEl.className = 'humidor-walkthrough-bar';
  progressEl.setAttribute('aria-hidden', 'true');
  progressEl.innerHTML = `<div class="humidor-walkthrough-bar__fill" id="humidor-bar-fill"></div>`;
  stage.appendChild(progressEl);

  // Legenda overlay-uje stage (transient help)
  const legendEl = document.createElement('div');
  legendEl.className = 'humidor-walkthrough-legend';
  legendEl.id = 'humidor-legend';
  legendEl.hidden = true;
  legendEl.innerHTML = `
    <h4>Kako koristiti šetnju</h4>
    <ul>
      <li><strong>Prevuci levo / desno</strong> mišem ili prstom</li>
      <li><strong>Strelice ← → ↑ ↓</strong> za korak po korak</li>
      <li><strong>Dugmad ◀ ▶</strong> za precizan korak; <strong>Play</strong> za auto-prolaz</li>
      <li><strong>Wheel / scroll</strong> nad video-om — kreće šetnju, stranica se ne pomera</li>
      <li><strong>Home / End</strong> skok na početak / kraj</li>
    </ul>
    <button type="button" class="hw-legend-close" data-action="close-help">Zatvori</button>
  `;
  stage.appendChild(legendEl);

  // Control bar — sibling ISPOD figure-a, NIJE overlay
  const controls = document.createElement('div');
  controls.className = 'humidor-walkthrough-controls';
  controls.setAttribute('role', 'toolbar');
  controls.setAttribute('aria-label', 'Kontrole šetnje');
  controls.innerHTML = `
    <div class="hw-group hw-group--left">
      <button type="button" class="hw-btn" data-action="reset" aria-label="Početak" title="Početak">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6v12M19 6l-9 6 9 6V6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      </button>
      <span class="hw-time" aria-live="off"><span id="hw-time-cur">0.0</span> / <span id="hw-time-total">0.0</span></span>
    </div>
    <div class="hw-group hw-group--center">
      <button type="button" class="hw-btn hw-btn--step" data-action="prev" aria-label="Korak nazad" title="Korak nazad">
        <svg viewBox="0 0 24 24" width="22" height="22"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="hw-btn hw-btn--play" data-action="toggle" aria-label="Pusti / pauziraj" title="Pusti / pauziraj">
        <svg class="hw-icon-play" viewBox="0 0 24 24" width="22" height="22"><path d="M8 5l11 7-11 7V5z" fill="currentColor"/></svg>
        <svg class="hw-icon-pause" viewBox="0 0 24 24" width="22" height="22" hidden><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>
      </button>
      <button type="button" class="hw-btn hw-btn--step" data-action="next" aria-label="Korak napred" title="Korak napred">
        <svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
    <div class="hw-group hw-group--right">
      <button type="button" class="hw-btn hw-btn--help" data-action="help" aria-label="Pomoć" title="Pomoć">
        <svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 2-2.5 3v1M12 17.5h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
  `;
  // Wrap figure + controls in a flex column so controls site PRAVO ispod video-a
  // u istoj grid ćeliji, ne lome 2-column humidor__grid layout.
  const wrap = document.createElement('div');
  wrap.className = 'humidor__walkthrough';
  stage.parentNode.insertBefore(wrap, stage);
  wrap.appendChild(stage);
  wrap.appendChild(controls);

  // Compatibility refs
  const ui = controls;
  const legend = legendEl;

  const fill = stage.querySelector('#humidor-bar-fill');
  const tCur = ui.querySelector('#hw-time-cur');
  const tTot = ui.querySelector('#hw-time-total');
  const playIcon = ui.querySelector('.hw-icon-play');
  const pauseIcon = ui.querySelector('.hw-icon-pause');

  // Prevent buttons from triggering stage drag/wheel handlers
  ui.addEventListener('pointerdown', (e) => e.stopPropagation());
  legendEl.addEventListener('pointerdown', (e) => e.stopPropagation());
  legendEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (btn && btn.dataset.action === 'close-help') legendEl.hidden = true;
  });

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

  // -------------------- Palindrome auto-loop --------------------
  // Forward: native video.play(). Reverse: rAF dekrementira currentTime jer
  // browser-i ne podržavaju negative playbackRate na <video>. Smena pravca je
  // bešavna — kad video stigne do kraja prebacuje se u reverse, kad stigne na 0
  // se vraća u forward.
  let direction = 1;        // 1 = forward, -1 = reverse
  let autoLoopActive = false;
  let reverseRaf = null;
  let lastT = 0;

  const stopReverseRaf = () => {
    if (reverseRaf != null) {
      cancelAnimationFrame(reverseRaf);
      reverseRaf = null;
    }
  };

  const reverseStep = (ts) => {
    if (!autoLoopActive || direction !== -1) { stopReverseRaf(); return; }
    const dt = (ts - lastT) / 1000;
    lastT = ts;
    const next = video.currentTime - dt;
    if (next <= 0) {
      try { video.currentTime = 0; } catch (_) {}
      stopReverseRaf();
      direction = 1;
      video.play().catch(() => {});
      return;
    }
    try { video.currentTime = next; } catch (_) {}
    reverseRaf = requestAnimationFrame(reverseStep);
  };

  const startAutoLoop = (fromZero = true) => {
    if (!isFinite(video.duration) || !video.duration) return;
    stopReverseRaf();
    autoLoopActive = true;
    direction = 1;
    if (fromZero) {
      try { video.currentTime = 0; } catch (_) {}
    }
    video.play().catch(() => {});
  };

  const stopAutoLoop = () => {
    autoLoopActive = false;
    stopReverseRaf();
    video.pause();
  };

  // When forward play ends, switch to reverse pass
  video.addEventListener('ended', () => {
    if (!autoLoopActive) return;
    direction = -1;
    lastT = performance.now();
    reverseRaf = requestAnimationFrame(reverseStep);
  });

  // -------------------- IntersectionObserver: auto-play on enter --------------------
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          startAutoLoop(true);
        } else {
          stopAutoLoop();
        }
      }
    }, { threshold: [0, 0.4, 1] });
    io.observe(stage);
  }

  // Helper used by all manual interactions — they stop the auto-loop so user has control
  const userTookOver = () => {
    autoLoopActive = false;
    stopReverseRaf();
    video.pause();
  };

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
      userTookOver();
      setTime(0);
    } else if (action === 'prev') {
      userTookOver();
      setTime(video.currentTime - stepSize());
    } else if (action === 'next') {
      userTookOver();
      setTime(video.currentTime + stepSize());
    } else if (action === 'toggle') {
      // Play toggle — restart palindrome auto-loop ako je pauziran, ili stop ako je aktivan
      if (autoLoopActive || !video.paused || reverseRaf != null) {
        userTookOver();
      } else {
        startAutoLoop(false);
      }
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
    if (e.target.closest('.humidor-walkthrough-controls, .humidor-walkthrough-legend')) return; // let UI handle clicks
    dragging = true;
    startX = e.clientX;
    startTime = video.currentTime;
    const w = stage.getBoundingClientRect().width || 1;
    secPerPx = video.duration / w;
    stage.classList.add('is-dragging');
    stage.setPointerCapture?.(e.pointerId);
    stage.focus({ preventScroll: true });
    userTookOver();
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
    userTookOver();
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
      userTookOver();
      setTime(video.currentTime + stepSize());
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      userTookOver();
      setTime(video.currentTime - stepSize());
    } else if (e.key === 'Home') {
      e.preventDefault();
      userTookOver();
      setTime(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      userTookOver();
      setTime(video.duration);
    } else if (e.key === ' ') {
      e.preventDefault();
      if (autoLoopActive || !video.paused || reverseRaf != null) userTookOver();
      else startAutoLoop(false);
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
