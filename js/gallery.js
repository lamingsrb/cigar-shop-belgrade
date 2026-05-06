// =======================================================
// CIGAR SHOP — Godine tišine galerija
// Page-based slideshow (Instagram-style): grupe od 6 slika per "page",
// fade tranzicija između grupa, auto-advance, pagination dots.
// =======================================================

const MANIFEST_URL = '/data/gallery-manifest.json';
const ITEMS_PER_PAGE = 6;        // 2 reda × 3 kolone
const PAGE_INTERVAL_MS = 5500;   // ~5.5s per page
const TRANSITION_MS = 700;

export async function initGallery() {
  const track = document.getElementById('gallery-track');
  if (!track) return;

  let manifest;
  try {
    const res = await fetch(MANIFEST_URL);
    manifest = await res.json();
  } catch (err) {
    console.error('[gallery] Failed to load manifest', err);
    return;
  }

  if (!manifest.length) return;

  // Render kao paged slides
  const totalPages = Math.ceil(manifest.length / ITEMS_PER_PAGE);
  const pagesHTML = [];
  for (let p = 0; p < totalPages; p++) {
    const start = p * ITEMS_PER_PAGE;
    const slice = manifest.slice(start, start + ITEMS_PER_PAGE);
    const figures = slice.map((it, i) => `
      <div class="gallery-page__item"
           data-lb-type="image"
           data-lb-src="${it.src}"
           data-lb-caption="">
        <img src="${it.thumb}" alt="Cigar Shop galerija ${start + i + 1}"
             loading="lazy" decoding="async"
             width="600" height="450">
      </div>
    `).join('');
    pagesHTML.push(`<div class="gallery-page${p === 0 ? ' is-active' : ''}" data-page="${p}">${figures}</div>`);
  }

  // Replace masonry-track sa pages container
  track.innerHTML = pagesHTML.join('');
  track.classList.add('gallery-pages');
  track.style.transform = ''; // očisti naslede iz starog masonry-a

  // Sakrij stare prev/next dugmiće (zamenjeni dot-ovima)
  const oldPrev = document.getElementById('gallery-prev');
  const oldNext = document.getElementById('gallery-next');
  if (oldPrev) oldPrev.style.display = 'none';
  if (oldNext) oldNext.style.display = 'none';

  // Render dots
  let dotsHost = track.parentElement.querySelector('.gallery-pages__dots');
  if (!dotsHost) {
    dotsHost = document.createElement('div');
    dotsHost.className = 'gallery-pages__dots';
    track.parentElement.appendChild(dotsHost);
  }
  dotsHost.innerHTML = Array.from({ length: totalPages }).map((_, i) =>
    `<button class="gallery-pages__dot${i === 0 ? ' is-active' : ''}" data-page="${i}" aria-label="Page ${i + 1}"></button>`
  ).join('');

  let current = 0;
  let timer = null;
  let paused = false;
  const pages = Array.from(track.querySelectorAll('.gallery-page'));
  const dots = Array.from(dotsHost.querySelectorAll('.gallery-pages__dot'));

  function go(idx) {
    if (idx === current) return;
    idx = ((idx % totalPages) + totalPages) % totalPages;
    pages[current].classList.remove('is-active');
    pages[idx].classList.add('is-active');
    dots[current].classList.remove('is-active');
    dots[idx].classList.add('is-active');
    current = idx;
  }
  function next() { go(current + 1); }

  function start() {
    stop();
    if (!paused) timer = setInterval(next, PAGE_INTERVAL_MS);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  // Pause na hover + dok je lightbox otvoren
  track.parentElement.addEventListener('mouseenter', () => { paused = true; stop(); });
  track.parentElement.addEventListener('mouseleave', () => { paused = false; start(); });

  // Klik na dot
  dotsHost.addEventListener('click', (e) => {
    const btn = e.target.closest('.gallery-pages__dot');
    if (!btn) return;
    const idx = Number(btn.dataset.page);
    if (Number.isFinite(idx)) {
      go(idx);
      stop();
      setTimeout(start, PAGE_INTERVAL_MS * 1.5);
    }
  });

  // Pauziraj kad nije u viewport-u
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) start();
      else stop();
    });
  }, { threshold: 0.15 });
  observer.observe(track.parentElement);

  start();
}
