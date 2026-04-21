// =======================================================
// CIGAR SHOP — Lightbox modal
// Klik na masonry item → full-screen prikaz sa keyboard/swipe nav.
// =======================================================

export function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const stage = lightbox.querySelector('.lightbox-stage');
  const captionEl = lightbox.querySelector('.lightbox-caption');
  const currentEl = document.getElementById('lb-current');
  const totalEl = document.getElementById('lb-total');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let data = [];
  let index = 0;
  let lastFocus = null;

  function collectData() {
    // Bere data samo iz ORIGINAL items (ne iz klonova u masonry)
    const seen = new Set();
    const items = document.querySelectorAll('#gallery-track .masonry-item');
    data = [];
    items.forEach((el) => {
      const src = el.dataset.lbSrc;
      if (!src || seen.has(src)) return;
      seen.add(src);
      data.push({
        type: el.dataset.lbType || 'image',
        src,
        caption: el.dataset.lbCaption || ''
      });
    });
    if (totalEl) totalEl.textContent = String(data.length);
  }

  function render(i) {
    const item = data[i];
    if (!item) return;
    stage.innerHTML = '';
    if (item.type === 'video') {
      const v = document.createElement('video');
      v.src = item.src;
      v.controls = true;
      v.autoplay = true;
      v.loop = true;
      v.playsInline = true;
      stage.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.caption;
      stage.appendChild(img);
    }
    captionEl.textContent = item.caption;
    if (currentEl) currentEl.textContent = String(i + 1);
  }

  function open(i) {
    if (!data.length) collectData();
    index = (i + data.length) % data.length;
    lastFocus = document.activeElement;
    render(index);
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    closeBtn?.focus();
  }

  function close() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    stage.innerHTML = ''; // stops video playback
    lastFocus?.focus?.();
  }

  function next() { index = (index + 1) % data.length; render(index); }
  function prev() { index = (index - 1 + data.length) % data.length; render(index); }

  // Event delegation — klik na bilo koji masonry-item triggeruje lightbox
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.masonry-item');
    if (!item) return;
    if (!data.length) collectData();
    const src = item.dataset.lbSrc;
    const i = data.findIndex(d => d.src === src);
    if (i >= 0) open(i);
  });

  closeBtn?.addEventListener('click', close);
  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close(); // klik na pozadinu zatvara
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  });

  // Touch swipe
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
  }, { passive: true });
}
