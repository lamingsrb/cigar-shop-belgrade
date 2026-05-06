// =======================================================
// CIGAR SHOP — media-slideshow component (single-frame fade carousel)
// Uvek auto-cikluje (bez IntersectionObserver — pause-on-leave je previse
// agresivan i znao da spreci start). Pause samo na hover.
// Klik na slajd → lightbox preko data-lb-src.
// =======================================================

const INTERVAL_MS = 4000;

export function initMediaSlideshow(host) {
  if (!host || host.dataset.msInit === '1') return;
  host.dataset.msInit = '1';

  const slides = Array.from(host.querySelectorAll('.media-slideshow__slide'));
  if (slides.length < 2) return;

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
    `<button class="media-slideshow__dot${i === current ? ' is-active' : ''}" data-i="${i}" aria-label="Slide ${i + 1}" type="button"></button>`
  ).join('');
  const dots = Array.from(dotsHost.querySelectorAll('.media-slideshow__dot'));

  function go(idx) {
    const len = slides.length;
    idx = ((idx % len) + len) % len;
    if (idx === current) return;
    slides[current].classList.remove('is-active');
    slides[idx].classList.add('is-active');
    dots[current]?.classList.remove('is-active');
    dots[idx]?.classList.add('is-active');
    current = idx;
  }

  let timer = setInterval(() => go(current + 1), INTERVAL_MS);

  // Pause na hover, resume na leave
  host.addEventListener('mouseenter', () => {
    if (timer) { clearInterval(timer); timer = null; }
  });
  host.addEventListener('mouseleave', () => {
    if (!timer) timer = setInterval(() => go(current + 1), INTERVAL_MS);
  });

  // Klik na dot
  dotsHost.addEventListener('click', (e) => {
    const btn = e.target.closest('.media-slideshow__dot');
    if (!btn) return;
    const idx = Number(btn.dataset.i);
    if (!Number.isFinite(idx)) return;
    go(idx);
    if (timer) clearInterval(timer);
    timer = setInterval(() => go(current + 1), INTERVAL_MS);
  });
}

export function initAllMediaSlideshows() {
  document.querySelectorAll('.media-slideshow').forEach(initMediaSlideshow);
}
