// =======================================================
// CIGAR SHOP — Gallery masonry carousel
// Adaptirano iz PredatorLaserTag pattern-a. Ho izontal scroll,
// 3 reda × mnogo kolona, pauza na hover, prev/next navigacija.
// Klik na item → Lightbox (vidi js/lightbox.js)
// =======================================================

const MANIFEST_URL = '/data/gallery-manifest.json';

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

  // Render 63 item-a
  track.innerHTML = manifest.map((it, i) => `
    <div class="masonry-item"
         data-lb-type="image"
         data-lb-src="${it.src}"
         data-lb-caption="">
      <div class="masonry-media">
        <img src="${it.thumb}" alt="Cigar Shop galerija ${i + 1}"
             loading="lazy" decoding="async"
             width="600" height="450">
        <div class="masonry-overlay"></div>
        <div class="masonry-zoom" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5 9 5 5-1.4 1.4-5-5L15 15Z"
                  fill="currentColor"/>
          </svg>
        </div>
        <div class="masonry-frame"></div>
      </div>
    </div>
  `).join('');

  // Kloniraj item-e za beskonačan scroll
  const original = Array.from(track.querySelectorAll('.masonry-item'));
  original.forEach(el => track.appendChild(el.cloneNode(true)));

  const masonry = track.parentElement;
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');

  let offset = 0;
  let halfWidth = 0;
  const speed = 0.5; // px po frame-u
  let paused = false;
  let manualHoldUntil = 0;

  function measure() {
    // Ukupna \u0161irina jedne kopije track-a (original + gap)
    const itemWidth = original.length ? original[0].offsetWidth : 300;
    const gap = parseFloat(getComputedStyle(track).gap) || 16;
    const columns = Math.ceil(original.length / 3); // 3 reda
    halfWidth = columns * (itemWidth + gap);
  }
  measure();
  window.addEventListener('resize', measure);

  function applyOffset() {
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
  }

  function tick(ts) {
    requestAnimationFrame(tick);
    if (paused || ts < manualHoldUntil || document.body.classList.contains('lightbox-open')) return;
    offset -= speed;
    if (halfWidth > 0 && offset <= -halfWidth) offset += halfWidth;
    applyOffset();
  }
  requestAnimationFrame(tick);

  // Hover / touch pause
  masonry.addEventListener('mouseenter', () => { paused = true; });
  masonry.addEventListener('mouseleave', () => { paused = false; });
  masonry.addEventListener('touchstart', () => { paused = true; }, { passive: true });
  masonry.addEventListener('touchend',   () => { setTimeout(() => { paused = false; }, 1500); }, { passive: true });

  // Prev/Next navigation
  function jump(dir) {
    const itemWidth = original[0]?.offsetWidth || 300;
    const gap = parseFloat(getComputedStyle(track).gap) || 16;
    offset += dir * (itemWidth + gap) * 3;
    if (halfWidth > 0) {
      while (offset < -halfWidth) offset += halfWidth;
      while (offset > 0) offset -= halfWidth;
    }
    applyOffset();
    manualHoldUntil = performance.now() + 1500;
  }
  prevBtn?.addEventListener('click', () => jump(1));
  nextBtn?.addEventListener('click', () => jump(-1));
}
