// =======================================================
// CIGAR SHOP — Reusable paged-gallery component (Instagram-style)
// items[] grupisano u "page" od N (default 6), 3-col grid per page,
// crossfade tranzicija izmedju pageova, auto-advance, pagination dots.
// Uvek auto-cikluje (bez IntersectionObserver pause-on-leave).
// Pause samo na hover.
// =======================================================

const STATE = new WeakMap();

export function initGalleryPages(host, options = {}) {
  if (!host) return;
  // Tear down ako vec postoji init na ovom host-u (gear/humidor-cigars re-init na tab klik)
  teardownGalleryPages(host);

  const {
    items = [],
    itemsPerPage = 6,
    intervalMs = 3500,
    autoplay = true,
  } = options;
  if (!items.length) return;

  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Render pages
  const pagesHTML = [];
  for (let p = 0; p < totalPages; p++) {
    const start = p * itemsPerPage;
    const slice = items.slice(start, start + itemsPerPage);
    const cells = slice.map((it, i) => `
      <div class="gallery-page__item"
           data-lb-type="image"
           data-lb-src="${it.src}"
           data-lb-caption="${it.caption || ''}">
        <img src="${it.thumb || it.src}" alt="${it.alt || it.caption || ''}"
             loading="lazy" decoding="async"
             width="600" height="450">
      </div>
    `).join('');
    pagesHTML.push(`<div class="gallery-page${p === 0 ? ' is-active' : ''}" data-page="${p}">${cells}</div>`);
  }
  host.innerHTML = pagesHTML.join('');
  host.classList.add('gallery-pages');
  host.dataset.itemsPerPage = String(itemsPerPage);

  // Dots — append do parent wrap-a (.gallery-pages-wrap)
  const wrap = host.parentElement || host;
  let dotsHost = wrap.querySelector('.gallery-pages__dots');
  if (totalPages > 1) {
    if (!dotsHost) {
      dotsHost = document.createElement('div');
      dotsHost.className = 'gallery-pages__dots';
      wrap.appendChild(dotsHost);
    }
    dotsHost.innerHTML = Array.from({ length: totalPages }).map((_, i) =>
      `<button class="gallery-pages__dot${i === 0 ? ' is-active' : ''}" data-page="${i}" aria-label="Page ${i + 1}" type="button"></button>`
    ).join('');
  } else if (dotsHost) {
    dotsHost.remove();
    dotsHost = null;
  }

  let current = 0;
  let timer = null;
  const pages = Array.from(host.querySelectorAll('.gallery-page'));
  const dots = dotsHost ? Array.from(dotsHost.querySelectorAll('.gallery-pages__dot')) : [];

  function go(idx) {
    if (totalPages < 2 || idx === current) return;
    idx = ((idx % totalPages) + totalPages) % totalPages;
    pages[current].classList.remove('is-active');
    pages[idx].classList.add('is-active');
    if (dots.length) {
      dots[current]?.classList.remove('is-active');
      dots[idx]?.classList.add('is-active');
    }
    current = idx;
  }

  function start() {
    if (!autoplay || totalPages < 2) return;
    if (timer) clearInterval(timer);
    timer = setInterval(() => go(current + 1), intervalMs);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  // Pause samo na hover (bez IntersectionObserver — preagresivan u praksi)
  wrap.addEventListener('mouseenter', stop);
  wrap.addEventListener('mouseleave', start);

  if (dotsHost) {
    dotsHost.addEventListener('click', (e) => {
      const btn = e.target.closest('.gallery-pages__dot');
      if (!btn) return;
      const idx = Number(btn.dataset.page);
      if (Number.isFinite(idx)) {
        go(idx);
        start(); // reset clock
      }
    });
  }

  STATE.set(host, { stop });
  start();
}

function teardownGalleryPages(host) {
  const s = STATE.get(host);
  if (!s) return;
  s.stop?.();
  STATE.delete(host);
}
