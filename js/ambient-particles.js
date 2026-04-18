// =======================================================
// CIGAR SHOP — globalna cinematic particle layer
// Reaguje na: mouse move (smoke trail), klik (burst ember + dim),
// scroll (vetar pomera čestice naviše)
// Čestice: dim (velike, meke, sive), pepeo (male, zlatne, rotirajuće),
// ember sparks (klik-only, vrlo kratkog veka)
// =======================================================

export function initAmbientParticles() {
  console.log('[CigarShop] ambient particles init');

  // canvas overlay
  const canvas = document.createElement('canvas');
  canvas.className = 'ambient-particles';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    zIndex: '20',
    pointerEvents: 'none',
    mixBlendMode: 'screen'
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });

  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // ---------- state ----------
  const particles = [];
  const TYPE = { SMOKE: 0, ASH: 1, SPARK: 2, TRAIL: 3 };

  let mouseX = W / 2, mouseY = H / 2;
  let prevMouseX = mouseX, prevMouseY = mouseY;
  let mouseSpeed = 0;
  let lastEmit = 0;

  // scroll "wind" — each scroll delta pushes particles
  let lastScroll = window.scrollY || 0;
  let scrollWind = 0;

  // limit population based on device
  const LIMIT = window.innerWidth < 900 ? 160 : 320;

  // ---------- helpers ----------
  function rand(a, b) { return a + Math.random() * (b - a); }

  function spawnSmoke(x, y, vx = 0, vy = 0, opts = {}) {
    if (particles.length > LIMIT) particles.shift();
    particles.push({
      type: TYPE.SMOKE,
      x, y,
      vx: vx + rand(-0.15, 0.15),
      vy: vy + rand(-0.6, -0.15),
      r: rand(14, 38),
      life: 0,
      maxLife: rand(1.8, 3.5),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: rand(-0.5, 0.5),
      alpha: opts.alpha ?? rand(0.14, 0.32),
      color: opts.color || 'rgba(170, 155, 140, 1)'
    });
  }

  function spawnAsh(x, y) {
    if (particles.length > LIMIT) particles.shift();
    particles.push({
      type: TYPE.ASH,
      x, y,
      vx: rand(-0.3, 0.3),
      vy: rand(-1.2, -0.3),
      r: rand(1, 2.5),
      life: 0,
      maxLife: rand(2.5, 5),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: rand(-2, 2),
      alpha: rand(0.55, 1),
      color: Math.random() > 0.5 ? '#c9a961' : '#ff9855'
    });
  }

  function spawnSpark(x, y) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(2, 6);
    particles.push({
      type: TYPE.SPARK,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      r: rand(1.2, 2.4),
      life: 0,
      maxLife: rand(0.5, 1.1),
      alpha: 1,
      color: '#ffb877'
    });
  }

  function spawnTrail(x, y, vx, vy) {
    particles.push({
      type: TYPE.TRAIL,
      x, y,
      vx: vx * 0.3 + rand(-0.1, 0.1),
      vy: vy * 0.3 + rand(-0.6, -0.2),
      r: rand(8, 22),
      life: 0,
      maxLife: rand(0.9, 1.8),
      alpha: rand(0.2, 0.4),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: rand(-1, 1),
      color: 'rgba(200, 180, 155, 1)'
    });
  }

  // ---------- events ----------
  window.addEventListener('mousemove', (e) => {
    prevMouseX = mouseX; prevMouseY = mouseY;
    mouseX = e.clientX; mouseY = e.clientY;
    const dx = mouseX - prevMouseX;
    const dy = mouseY - prevMouseY;
    mouseSpeed = Math.min(12, Math.hypot(dx, dy));

    const now = performance.now();
    if (now - lastEmit > 28 && mouseSpeed > 1.2) {
      const n = Math.min(3, Math.floor(mouseSpeed / 3) + 1);
      for (let i = 0; i < n; i++) {
        spawnTrail(
          mouseX + rand(-6, 6),
          mouseY + rand(-6, 6) + 8,
          dx * 0.1, dy * 0.1
        );
      }
      lastEmit = now;
    }
  });

  window.addEventListener('click', (e) => {
    // ember burst
    for (let i = 0; i < 14; i++) spawnSpark(e.clientX, e.clientY);
    for (let i = 0; i < 6; i++)  spawnSmoke(e.clientX, e.clientY, 0, -1.5, { alpha: 0.35 });
    for (let i = 0; i < 3; i++)  spawnAsh(e.clientX, e.clientY);
  });

  window.addEventListener('scroll', () => {
    const y = window.scrollY || 0;
    const delta = y - lastScroll;
    scrollWind += delta * 0.04;
    lastScroll = y;
  }, { passive: true });

  // ambient emitter — lazy drift od dna
  let ambientEmitClock = 0;

  // ---------- loop ----------
  let lastTime = performance.now();
  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    // ambient emission (slow upward drift from bottom)
    ambientEmitClock += dt;
    if (ambientEmitClock > 0.35 && particles.length < LIMIT * 0.7) {
      ambientEmitClock = 0;
      spawnSmoke(
        rand(0, W),
        H + rand(10, 60),
        rand(-0.05, 0.05),
        rand(-0.25, -0.08),
        { alpha: 0.1 + Math.random() * 0.14 }
      );
      if (Math.random() < 0.3) {
        spawnAsh(rand(0, W), H + 10);
      }
    }

    // scroll wind decays
    scrollWind *= 0.94;

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) { particles.splice(i, 1); continue; }

      // apply scroll wind (negative = scroll down = wind carries particles up)
      p.vy -= scrollWind * 0.003;

      // gravity / buoyancy
      if (p.type === TYPE.SMOKE || p.type === TYPE.TRAIL) {
        p.vy -= 0.02 * dt * 30; // rise faster
        p.vx *= 0.99;
      } else if (p.type === TYPE.ASH) {
        p.vy += 0.4 * dt;        // gravity down
        p.vx *= 0.995;
      } else if (p.type === TYPE.SPARK) {
        p.vy += 2.5 * dt;
        p.vx *= 0.96;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.rot += (p.rotSpeed || 0) * dt;

      const lifeN = p.life / p.maxLife;
      const fadeIn = Math.min(1, lifeN * 6);
      const fadeOut = 1 - Math.max(0, (lifeN - 0.6) / 0.4);
      const a = fadeIn * fadeOut * p.alpha;

      ctx.globalAlpha = a;

      if (p.type === TYPE.SMOKE || p.type === TYPE.TRAIL) {
        const r = p.r * (1 + lifeN * 1.3);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, p.color);
        g.addColorStop(0.4, 'rgba(120, 110, 100, 0.25)');
        g.addColorStop(1, 'rgba(60, 50, 42, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === TYPE.ASH) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(-p.r * 0.5, -p.r * 0.5, p.r, p.r * 0.6);
        ctx.restore();
      } else if (p.type === TYPE.SPARK) {
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#ff6b1a';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
  requestAnimationFrame(tick);
}
