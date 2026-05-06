// =======================================================
// CIGAR SHOP — media-slideshow component
// Single-frame foto carousel sa crossfade tranzicijama. Koristi se u
// Spirits/Gear top-right media slot-u. Max 6 slika, auto-advance ~4.5s.
// Lightbox-enabled (data-lb-src na svakom slajdu).
// =======================================================

const STATE = new WeakMap();

const INTERVAL_MS = 4500;
const TRANSITION_MS = 800;

export function initMediaSlideshow(host) {
  if (!host) return;
  teardownMediaSlideshow(host);

  const slides = Array.from(host.querySelectorAll('.media-slideshow__slide'));
  if (!slides.length) return;

  // Sigurnosno: aktiviraj prvi ako nijedan nije
  if (!slides.some(s => s.classList.contains('is-active'))) {
    slides[0].classList.add('is-active');
  }
  let current = slides.findIndex(s => s.classList.contains('is-active'));

  // Render dots
  let dotsHost = host.querySelector('.media-slideshow__dots');
  if (!dotsHost) {
    dotsHost = document.createElement('div');
    dotsHost.className = 'media-slideshow__dots';
    host.appendChild(dotsHost);
  }
  dotsHost.innerHTML = slides.map((_, i) =>
    `<button class="media-slideshow__dot${i === current ? ' is-active' : ''}" data-i="${i}" aria-label="Slide ${i + 1}"></button>`
  ).join('');

  function go(idx) {
    if (idx === current) return;
    const len = slides.length;
    idx = ((idx % len) + len) % len;
    slides[current].classList.remove('is-active');
    slides[idx].classList.add('is-active');
    dotsHost.querySelectorAll('.media-slideshow__dot').forEach((d, i) =>
      d.classList.toggle('is-active', i === idx)
    );
    current = idx;
  }
  function next() { go(current + 1); }

  let timer = setInterval(next, INTERVAL_MS);
  function pause() { if (timer) { clearInterval(timer); timer = null; } }
  function resume() { if (!timer) timer = setInterval(next, INTERVAL_MS); }

  host.addEventListener('mouseenter', pause);
  host.addEventListener('mouseleave', resume);

  dotsHost.addEventListener('click', (e) => {
    const btn = e.target.closest('.media-slideshow__dot');
    if (!btn) return;
    const idx = Number(btn.dataset.i);
    if (Number.isFinite(idx)) {
      go(idx);
      pause();
      setTimeout(resume, INTERVAL_MS * 1.5);
    }
  });

  // Pauziraj kad nije u viewport-u
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => e.isIntersecting ? resume() : pause());
  }, { threshold: 0.1 });
  observer.observe(host);

  STATE.set(host, { pause, resume, observer });
}

function teardownMediaSlideshow(host) {
  const s = STATE.get(host);
  if (!s) return;
  s.pause();
  s.observer?.disconnect();
  STATE.delete(host);
}

export function initAllMediaSlideshows() {
  document.querySelectorAll('.media-slideshow').forEach(initMediaSlideshow);
}
