// =======================================================
// CIGAR SHOP — Spirits sekcija (Nastavi u piće)
// 6 tabova (Viski, Burbon, Džin, Konjak, Rum, Rakija). Klik na tab →
// kratka rečenica šta je ta kategorija + auto-advance carousel sa slikama
// tipičnih primeraka.
// =======================================================

import { getLang, onLangChange } from './i18n.js';

const BRANDS_URL  = '/data/brands.json';
const STORIES_URL = (lang) => `/locales/brand-stories-${lang}.json`;

// Slike per kategorija (placeholder od Ane). Kad klijent pošalje proper product
// shots zameniti ovde.
const IMAGES_BY_CAT = {
  whisky: [
    '/assets/spirits/spirits-process-4-selekcija.webp',
    '/assets/spirits/spirits-process-1-destilacija.webp',
    '/assets/spirits/spirits-process-3-odlezavanje.webp',
    '/assets/spirits/scotch.webp',
    '/assets/spirits/japanese.webp',
    '/assets/spirits/irish.webp',
  ],
  bourbon: [
    '/assets/spirits/spirits-process-3-odlezavanje.webp',
    '/assets/spirits/bourbon.webp',
    '/assets/spirits/spirits-process-2-destilerija.webp',
  ],
  gin: [
    '/assets/spirits/spirits-process-1-destilacija.webp',
    '/assets/gallery/img-002.webp',
    '/assets/gallery/img-021.webp',
    '/assets/gallery/img-028.webp',
  ],
  cognac: [
    '/assets/spirits/spirits-process-2-destilerija.webp',
    '/assets/spirits/cognac.webp',
    '/assets/spirits/spirits-process-3-odlezavanje.webp',
  ],
  rum: [
    '/assets/spirits/spirits-process-3-odlezavanje.webp',
    '/assets/gallery/img-008.webp',
    '/assets/gallery/img-018.webp',
    '/assets/gallery/img-036.webp',
  ],
  rakija: [
    '/assets/spirits/spirits-process-2-destilerija.webp',
    '/assets/spirits/rakija.webp',
    '/assets/gallery/img-021.webp',
    '/assets/gallery/img-037.webp',
  ],
};

const CAT_LABEL_SR = { whisky: 'Viski', bourbon: 'Burbon', gin: 'Džin', cognac: 'Konjak', rum: 'Rum', rakija: 'Rakija' };
const CAT_LABEL_EN = { whisky: 'Whisky', bourbon: 'Bourbon', gin: 'Gin', cognac: 'Cognac', rum: 'Rum', rakija: 'Rakija' };

// Klijentski redosled (prikaz)
const VISIBLE_CATS = ['whisky', 'bourbon', 'gin', 'cognac', 'rum', 'rakija'];

let brandsData = null;
let storiesData = null;
let activeCat = 'whisky';
let slideTimer = null;
let slideIndex = 0;

async function loadData() {
  if (!brandsData) {
    try { brandsData = await (await fetch(BRANDS_URL)).json(); }
    catch { brandsData = { spirits: {} }; }
  }
  const lang = getLang();
  try { storiesData = await (await fetch(STORIES_URL(lang))).json(); }
  catch { storiesData = {}; }
}

function catLabel(cat) {
  return getLang() === 'en' ? CAT_LABEL_EN[cat] : CAT_LABEL_SR[cat];
}

function renderTabs(host) {
  const allCats = Object.keys(brandsData?.spirits || {});
  const cats = VISIBLE_CATS.filter(c => allCats.includes(c) || IMAGES_BY_CAT[c]);
  host.innerHTML = cats.map(c => {
    const label = catLabel(c);
    const count = brandsData?.spirits?.[c]?.brands?.length || 0;
    const active = c === activeCat ? ' is-active' : '';
    return `<button class="brands__tab${active}" data-cat="${c}">
      <span class="brands__tab-name">${label}</span>
      ${count ? `<span class="brands__tab-count">${count}</span>` : ''}
    </button>`;
  }).join('');
}

function renderGrid(host) {
  const story = storiesData?.spirits?.[activeCat]?.story || '';
  const images = IMAGES_BY_CAT[activeCat] || [];

  const slides = images.map((src, i) => `
    <figure class="brand-slide${i === 0 ? ' is-active' : ''}" data-i="${i}">
      <img loading="lazy" decoding="async" src="${src}" alt="${catLabel(activeCat)}">
      <figcaption>${catLabel(activeCat)}</figcaption>
    </figure>
  `).join('');

  host.innerHTML = `
    ${story ? `<p class="brands__region-story">${story}</p>` : ''}
    <div class="brand-carousel" data-count="${images.length}">
      <button class="brand-carousel__nav brand-carousel__prev" aria-label="Prev">&#8249;</button>
      <div class="brand-carousel__track">${slides}</div>
      <button class="brand-carousel__nav brand-carousel__next" aria-label="Next">&#8250;</button>
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
    show((slideIndex + 1) % slides.length);
  }, 3500);

  const prev = host.querySelector('.brand-carousel__prev');
  const next = host.querySelector('.brand-carousel__next');
  if (prev) prev.onclick = () => { show((slideIndex - 1 + slides.length) % slides.length); restartTimer(host); };
  if (next) next.onclick = () => { show((slideIndex + 1) % slides.length); restartTimer(host); };

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

export async function initSpirits() {
  const tabsHost = document.getElementById('spirits-tabs');
  const gridHost = document.getElementById('spirits-grid');
  if (!tabsHost || !gridHost) return;

  await loadData();
  renderTabs(tabsHost);
  renderGrid(gridHost);

  tabsHost.addEventListener('click', (e) => {
    const btn = e.target.closest('.brands__tab');
    if (!btn) return;
    activeCat = btn.dataset.cat;
    renderTabs(tabsHost);
    renderGrid(gridHost);
  });

  onLangChange(async () => {
    await loadData();
    renderTabs(tabsHost);
    renderGrid(gridHost);
  });
}
