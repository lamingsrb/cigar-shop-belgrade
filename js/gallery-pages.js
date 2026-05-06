// =======================================================
// CIGAR SHOP — Reusable paged-gallery component (Instagram-style)
// Render: items[] grupisano u "page" od N (default 6), 3-col grid per page,
// crossfade tranzicija izmedju pageova, auto-advance, pagination dots.
// Pause na hover + IntersectionObserver pause kad nije u viewport-u.
// =======================================================

const STATE = new WeakMap();

export function initGalleryPages(host, options = {}) {
  if (!host) return;
  teardownGalleryPages(host);

  const {
    items = [],
    itemsPerPage = 6,
    intervalMs = 5500,
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
      `<button class="gallery-pages__dot${i === 0 ? ' is-active' : ''}" data-page="${i}" aria-label="Page ${i + 1}"></button>`
    ).join('');
  } else if (dotsHost) {
    dotsHost.remove();
    dotsHost = null;
  }

  let current = 0;
  let timer = null;
  let paused = false;
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
  function next() { go(current + 1); }

  function start() {
    stop();
    if (!autoplay || totalPages < 2 || paused) return;
    timer = setInterval(next, intervalMs);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  wrap.addEventListener('mouseenter', () => { paused = true; stop(); });
  wrap.addEventListener('mouseleave', () => { paused = false; start(); });

  if (dotsHost) {
    dotsHost.addEventListener('click', (e) => {
      const btn = e.target.closest('.gallery-pages__dot');
      if (!btn) return;
      const idx = Number(btn.dataset.page);
      if (Number.isFinite(idx)) {
        go(idx);
        stop();
        setTimeout(start, intervalMs * 1.5);
      }
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => e.isIntersecting ? start() : stop());
  }, { threshold: 0.15 });
  observer.observe(wrap);

  STATE.set(host, { stop, observer });

  if (autoplay) start();
}

function teardownGalleryPages(host) {
  const s = STATE.get(host);
  if (!s) return;
  s.stop?.();
  s.observer?.disconnect();
  STATE.delete(host);
}
