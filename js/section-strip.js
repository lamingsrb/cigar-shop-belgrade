// =======================================================
// CIGAR SHOP — section-strip component
// Mali horizontalni auto-advance slideshow (kompaktan, jedan red).
// Koristi se u Humidor + Gear sekcijama (deo svake sekcije, ne samostalan).
// Klik na karticu → lightbox (ako ima data-lb-src).
// =======================================================

const STRIPS = new WeakMap(); // host -> { raf, observer }

export function initSectionStrip(host) {
  if (!host) return;
  // Tear down prior init (npr. kad gear.js re-renderuje showcase)
  teardownSectionStrip(host);

  const track = host.querySelector('.section-strip__track');
  if (!track) return;
  const items = Array.from(track.children);
  if (!items.length) return;

  // Klonuj items za infinite loop (samo jednom — dedupe via dataset flag).
  if (!track.dataset.cloned) {
    items.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    track.dataset.cloned = '1';
  }

  let offset = 0;
  let halfWidth = 0;
  const speed = 0.35; // px po frame-u (sporije od galerije, suptilno)
  let paused = false;
  let raf = null;

  function measure() {
    const first = items[0];
    if (!first) return;
    const itemWidth = first.offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 12;
    halfWidth = items.length * (itemWidth + gap);
  }
  measure();
  const onResize = () => measure();
  window.addEventListener('resize', onResize);

  function tick() {
    raf = requestAnimationFrame(tick);
    if (paused || document.body.classList.contains('lightbox-open')) return;
    offset -= speed;
    if (halfWidth > 0 && offset <= -halfWidth) offset += halfWidth;
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
  }
  raf = requestAnimationFrame(tick);

  // Pause on hover / touch (suptilan UX)
  const onEnter = () => { paused = true; };
  const onLeave = () => { paused = false; };
  host.addEventListener('mouseenter', onEnter);
  host.addEventListener('mouseleave', onLeave);
  host.addEventListener('touchstart', onEnter, { passive: true });
  host.addEventListener('touchend',   () => setTimeout(onLeave, 1500), { passive: true });

  // Pauziraj kad nije u viewport-u (perf)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { paused = !e.isIntersecting; });
  }, { threshold: 0.05 });
  observer.observe(host);

  STRIPS.set(host, { raf, onResize, observer });
}

function teardownSectionStrip(host) {
  const state = STRIPS.get(host);
  if (!state) return;
  if (state.raf) cancelAnimationFrame(state.raf);
  if (state.onResize) window.removeEventListener('resize', state.onResize);
  if (state.observer) state.observer.disconnect();
  STRIPS.delete(host);
}

export function initAllSectionStrips() {
  document.querySelectorAll('.section-strip').forEach(initSectionStrip);
}
