// =======================================================
// CIGAR SHOP — Hero 2-slide rotator
// Prebacuje izme\u0111u hero__slide--a i --b svakih 5s.
// Klik na dots menja manuelno i resetuje tajmer.
// Pauza dok je stranica sakrivena.
// =======================================================

const INTERVAL_MS = 5000;

export function initHeroRotator() {
  const slides = Array.from(document.querySelectorAll('.hero__slide'));
  const dots   = Array.from(document.querySelectorAll('.hero__dot'));
  if (slides.length < 2) return;

  let current = 0;
  let timer = null;

  function apply(index) {
    slides.forEach((s, i) => {
      const active = i === index;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
      // Pause/resume embedded video kad slajd postane ne-aktivan/aktivan
      const vid = s.querySelector('video');
      if (vid) {
        if (active) { vid.play().catch(() => {}); }
        else        { vid.pause(); }
      }
    });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    current = index;
  }

  function next() { apply((current + 1) % slides.length); }

  function start() {
    stop();
    timer = setInterval(next, INTERVAL_MS);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      apply(i);
      start(); // reset the clock after manual nav
    });
  });

  // Pause while tab is hidden (no point rotating invisible slides)
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  start();
}
