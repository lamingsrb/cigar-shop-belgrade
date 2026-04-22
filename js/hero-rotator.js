// =======================================================
// CIGAR SHOP — Hero carousel rotator (horizontal slide)
// Outgoing klizi u levo (-100%), incoming ulazi iz desna (100% \u2192 0).
// Uvek "napred" \u2014 kada se vra\u0107amo na prvi slajd, on se prvo snap-uje desno
// (is-prepared klasa sa transition:none), pa animativno ulazi unutra.
// =======================================================

// 7s izme\u0111u prebacivanja: 1.3s tranzicija + ~5.7s stabilnog gledanja.
const INTERVAL_MS = 7000;

export function initHeroRotator() {
  const slides = Array.from(document.querySelectorAll('.hero__slide'));
  const dots   = Array.from(document.querySelectorAll('.hero__dot'));
  if (slides.length < 2) return;

  let current = slides.findIndex(s => s.classList.contains('is-active'));
  if (current < 0) current = 0;
  let timer = null;
  let isAnimating = false;

  // Inicijalni set klasa: prvi slajd is-active, ostali su u default-u (100%).
  slides.forEach((s, i) => {
    s.classList.toggle('is-active', i === current);
    s.classList.remove('is-exit');
    s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
  });

  function apply(newIdx) {
    if (newIdx === current || isAnimating) return;
    isAnimating = true;

    const outgoing = slides[current];
    const incoming = slides[newIdx];

    // Incoming mora da startuje sa desne strane (translateX 100%).
    // Ako je ranije bio "is-exit" (-100%), snapne-mo ga desno bez animacije.
    if (incoming.classList.contains('is-exit')) {
      incoming.classList.add('is-prepared');
      incoming.classList.remove('is-exit');
      // force reflow da browser "prihvati" snap poziciju pre nego \u0161to animiramo
      void incoming.offsetWidth;
      incoming.classList.remove('is-prepared');
    }

    // Outgoing: active -> exit (klizi levo)
    outgoing.classList.remove('is-active');
    outgoing.classList.add('is-exit');
    outgoing.setAttribute('aria-hidden', 'true');

    // Incoming: (sada na 100% desno) -> active (0)
    incoming.classList.add('is-active');
    incoming.setAttribute('aria-hidden', 'false');

    // Pause/resume video-a u slajdovima (CPU)
    slides.forEach((s, i) => {
      const vid = s.querySelector('video');
      if (!vid) return;
      if (i === newIdx) vid.play().catch(() => {});
      else              vid.pause();
    });

    dots.forEach((d, i) => d.classList.toggle('is-active', i === newIdx));

    current = newIdx;
    // Nakon trajanja CSS tranzicije (1.3s), otpusti lock
    setTimeout(() => { isAnimating = false; }, 1400);
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
      start(); // reset clock on manual nav
    });
  });

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  start();
}
