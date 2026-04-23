// =======================================================
// CIGAR SHOP — Gold smoke particle canvas za hero Slide 1
// Lagan animirani layer: ~80 zlatnih \u010destica razli\u010ditih veli\u010dina
// drift-uju od dna nagore sa blagom horizontalnom oscilacijom, fade in/out,
// radial glow. Dodatno: nekoliko velikih wispy "smoke" blob-ova koji se
// \u0161ire i bledi, daju magli\u010dast gold smoke ose\u0107aj sli\u010dan Pinterest referencama.
// =======================================================

const COUNT_EMBERS = 80;
const COUNT_WISPS  = 6;

export function initHeroSmoke() {
  const canvas = document.getElementById('hero-smoke-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let W = 0, H = 0, dpr = 1, paused = false;
  let embers = [], wisps = [];
  let rafId = 0;
  let lastT = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnEmber(seededY) {
    // Zlatna boja sa varijacijama u toplijem opsegu
    const hue = 36 + Math.random() * 16;     // 36-52 (\u017euto-zlatno)
    const sat = 55 + Math.random() * 30;     // 55-85
    const light = 55 + Math.random() * 25;   // 55-80
    return {
      x: Math.random() * W,
      y: seededY ?? (H + Math.random() * 100),
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.15 + Math.random() * 0.45),    // sporo nagore
      r: 0.8 + Math.random() * 2.2,          // 0.8 - 3 px
      life: 0,
      maxLife: 8 + Math.random() * 10,        // sekunde
      color: `hsl(${hue.toFixed(0)}, ${sat.toFixed(0)}%, ${light.toFixed(0)}%)`,
      wobbleSeed: Math.random() * Math.PI * 2
    };
  }

  function spawnWisp(seededY) {
    return {
      x: Math.random() * W,
      y: seededY ?? (H + 50 + Math.random() * 200),
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(0.05 + Math.random() * 0.15),
      r: 80 + Math.random() * 160,          // veliki smoke blob
      life: 0,
      maxLife: 14 + Math.random() * 12,
      alpha: 0.05 + Math.random() * 0.08     // vrlo suptilan
    };
  }

  function initParticles() {
    embers = [];
    wisps  = [];
    // Seed preko celog viewporta odmah, ne samo od dole
    for (let i = 0; i < COUNT_EMBERS; i++) embers.push(spawnEmber(Math.random() * H));
    for (let i = 0; i < COUNT_WISPS;  i++) wisps.push(spawnWisp(Math.random() * H));
  }

  function drawWisp(w) {
    const t = w.life / w.maxLife;
    // fade in prvih 20%, plateau, fade out poslednjih 30%
    const fadeIn  = Math.min(1, t / 0.2);
    const fadeOut = Math.min(1, (1 - t) / 0.3);
    const a = w.alpha * Math.min(fadeIn, fadeOut);
    const grad = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, w.r);
    grad.addColorStop(0,   `hsla(42, 65%, 55%, ${a.toFixed(3)})`);
    grad.addColorStop(0.5, `hsla(38, 55%, 45%, ${(a * 0.55).toFixed(3)})`);
    grad.addColorStop(1,   `hsla(32, 50%, 35%, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawEmber(e) {
    const t = e.life / e.maxLife;
    const fadeIn  = Math.min(1, t / 0.15);
    const fadeOut = Math.min(1, (1 - t) / 0.25);
    const a = Math.min(fadeIn, fadeOut);
    // Glow halo
    const halo = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 6);
    halo.addColorStop(0,   e.color.replace('hsl', 'hsla').replace(')', `, ${(a * 0.9).toFixed(3)})`));
    halo.addColorStop(0.4, e.color.replace('hsl', 'hsla').replace(')', `, ${(a * 0.25).toFixed(3)})`));
    halo.addColorStop(1,   'hsla(40, 50%, 50%, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2);
    ctx.fill();
    // Core
    ctx.fillStyle = e.color;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function step(now) {
    if (paused) { rafId = requestAnimationFrame(step); return; }
    if (!lastT) lastT = now;
    const dt = Math.min((now - lastT) / 1000, 0.05);   // clamp @ 20fps lows
    lastT = now;

    // Background clear sa blagom trail (motion smear) \u2014 koristi lagani fade umesto punog clear
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(5, 3, 2, 0.18)';
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';

    // Wisps (ispod, veliki smoke blob-ovi)
    for (let i = 0; i < wisps.length; i++) {
      const w = wisps[i];
      w.life += dt;
      w.x += w.vx;
      w.y += w.vy;
      w.r += 0.25;
      if (w.life >= w.maxLife || w.y + w.r < -20) {
        wisps[i] = spawnWisp();
        continue;
      }
      drawWisp(w);
    }

    // Embers (iznad, mali zlatni glow-ovi)
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      e.life += dt;
      // Horizontalna oscilacija
      e.x += e.vx + Math.sin(e.life * 0.8 + e.wobbleSeed) * 0.08;
      e.y += e.vy;
      if (e.life >= e.maxLife || e.y < -20) {
        embers[i] = spawnEmber();
        continue;
      }
      drawEmber(e);
    }

    ctx.globalCompositeOperation = 'source-over';
    rafId = requestAnimationFrame(step);
  }

  // Setup
  resize();
  initParticles();
  rafId = requestAnimationFrame(step);
  new ResizeObserver(() => { resize(); initParticles(); }).observe(canvas);

  // Pause kada tab nije vidljiv ili kada slide nije aktivan (CPU save)
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) lastT = 0;
  });

  // Slide-aware pause: posmatra parent hero__slide--1, pauzira kad nije aktivan
  const slide = canvas.closest('.hero__slide');
  if (slide) {
    const obs = new MutationObserver(() => {
      paused = !slide.classList.contains('is-active');
      if (!paused) lastT = 0;
    });
    obs.observe(slide, { attributes: true, attributeFilter: ['class'] });
  }
}
