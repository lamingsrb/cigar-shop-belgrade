// =======================================================
// CIGAR SHOP — Cigar brands (Kuba / Novi svet)
// 2 tab-a, klik na regiju otvara auto-advance slajd-galeriju:
// 1) brend kartice (typography "logo" stil) sa brand-mama te regije,
// 2) product photo carousel sa slikama tih brendova (auto-advance).
// =======================================================

import { getLang, onLangChange } from './i18n.js';

const BRANDS_URL  = '/data/brands.json';
const GALLERY_URL = '/data/brand-gallery.json';

// Regije: Kuba je posebno, Novi svet = sve ostalo (DR, NIC, HON, CR, MEX, ITA)
const GROUP_DEFS = {
  cuba:  ['cuba'],
  world: ['dominican', 'nicaragua', 'honduras', 'costa', 'mexico', 'italy'],
};
const GROUP_LABEL_SR = { cuba: 'Kuba', world: 'Novi svet' };
const GROUP_LABEL_EN = { cuba: 'Cuba', world: 'New World' };

let brandsData = null;
let galleryData = null;
let activeGroup = 'cuba';
let slideTimer = null;
let slideIndex = 0;

async function loadData() {
  if (!brandsData) {
    try { brandsData = await (await fetch(BRANDS_URL)).json(); }
    catch { brandsData = { cigars: {} }; }
  }
  if (!galleryData) {
    try { galleryData = await (await fetch(GALLERY_URL)).json(); }
    catch { galleryData = { _fallback: [] }; }
  }
}

function groupLabel(g) {
  return getLang() === 'en' ? GROUP_LABEL_EN[g] : GROUP_LABEL_SR[g];
}

function brandsForGroup(group) {
  const regions = GROUP_DEFS[group] || [];
  const out = [];
  for (const r of regions) {
    const b = brandsData?.cigars?.[r]?.brands || [];
    for (const item of b) out.push({ ...item, region: r });
  }
  return out;
}

function imagesForGroup(group) {
  const brands = brandsForGroup(group);
  const out = [];
  for (const b of brands) {
    const pool = galleryData?.[b.brand?.toUpperCase()] || galleryData?.[b.brand];
    if (Array.isArray(pool)) {
      pool.forEach(name => out.push({ brand: b.brand, src: `/assets/gallery/${name}` }));
    }
  }
  if (!out.length) {
    const fb = galleryData?._fallback || [];
    fb.forEach(name => out.push({ brand: groupLabel(group), src: `/assets/gallery/${name}` }));
  }
  return out;
}

function renderTabs(host) {
  const groups = Object.keys(GROUP_DEFS);
  host.innerHTML = groups.map(g => {
    const label = groupLabel(g);
    const count = brandsForGroup(g).length;
    const active = g === activeGroup ? ' is-active' : '';
    return `<button class="brands__tab${active}" data-group="${g}">
      <span class="brands__tab-name">${label}</span>
      <span class="brands__tab-count">${count}</span>
    </button>`;
  }).join('');
}

function renderGrid(host) {
  const brands = brandsForGroup(activeGroup);
  const images = imagesForGroup(activeGroup);

  const chips = brands.map(b => `
    <div class="brand-chip" data-brand="${b.brand}">
      <span class="brand-chip__name">${b.brand}</span>
      <span class="brand-chip__count">${b.count}</span>
    </div>
  `).join('');

  const slides = images.map((img, i) => `
    <figure class="brand-slide${i === 0 ? ' is-active' : ''}" data-i="${i}">
      <img loading="lazy" decoding="async" src="${img.src}" alt="${img.brand}">
      <figcaption>${img.brand}</figcaption>
    </figure>
  `).join('');

  host.innerHTML = `
    <div class="brand-chips">${chips}</div>
    <div class="brand-carousel" data-count="${images.length}">
      <button class="brand-carousel__nav brand-carousel__prev" aria-label="Prev">&#8249;</button>
      <div class="brand-carousel__track">${slides}</div>
      <button class="brand-carousel__nav brand-carousel__next" aria-label="Next">&#8250;</button>
      <div class="brand-carousel__dots" aria-hidden="true"></div>
    </div>
  `;

  slideIndex = 0;
  startCarousel(host);
}

function startCarousel(host) {
  stopCarousel();
  const slides = host.querySelectorAll('.brand-slide');
  if (!slides.length) return;

  const show = (idx) => {
    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    slideIndex = idx;
  };

  slideTimer = setInterval(() => {
    const next = (slideIndex + 1) % slides.length;
    show(next);
  }, 3500);

  // Manual controls
  const prev = host.querySelector('.brand-carousel__prev');
  const next = host.querySelector('.brand-carousel__next');
  if (prev) prev.onclick = () => {
    show((slideIndex - 1 + slides.length) % slides.length);
    restartTimer(host);
  };
  if (next) next.onclick = () => {
    show((slideIndex + 1) % slides.length);
    restartTimer(host);
  };

  // Pause on hover
  const carousel = host.querySelector('.brand-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', () => startCarousel(host));
  }
}

function restartTimer(host) {
  stopCarousel();
  const slides = host.querySelectorAll('.brand-slide');
  if (!slides.length) return;
  slideTimer = setInterval(() => {
    const next = (slideIndex + 1) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === next));
    slideIndex = next;
  }, 3500);
}

function stopCarousel() {
  if (slideTimer) { clearInterval(slideTimer); slideTimer = null; }
}

export async function initBrands() {
  const tabsHost = document.getElementById('brands-tabs');
  const gridHost = document.getElementById('brands-grid');
  if (!tabsHost || !gridHost) return;

  await loadData();
  renderTabs(tabsHost);
  renderGrid(gridHost);

  tabsHost.addEventListener('click', (e) => {
    const btn = e.target.closest('.brands__tab');
    if (!btn) return;
    activeGroup = btn.dataset.group;
    renderTabs(tabsHost);
    renderGrid(gridHost);
  });

  onLangChange(async () => {
    await loadData();
    renderTabs(tabsHost);
    renderGrid(gridHost);
  });
}
