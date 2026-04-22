// =======================================================
// CIGAR SHOP — Brands sekcija
// Tab filter po regiji + grid kartica sa brand storytelling-om.
// Klik na brand karticu menja gornji .process__showcase red sa slikama
// tog brenda. Default stanje showcase-a: 4 scene proizvodnje (Polje, Fermentacija,
// Rolanje, Humidor) — snapshot uzet iz DOM-a pri inicijalizaciji.
// =======================================================

import { getLang, onLangChange, t } from './i18n.js';

const BRANDS_URL = '/data/brands.json';
const STORIES_URL = (lang) => `/locales/brand-stories-${lang}.json`;
const GALLERY_URL = '/data/brand-gallery.json';

let brandsData = null;
let storiesData = null;
let galleryData = null;
let activeRegion = 'cuba';
let activeBrand = null;                // trenutno kliknut brend
let defaultShowcaseHTML = null;        // zapamti default figure markup

async function loadData() {
  if (!brandsData) {
    try { brandsData = await (await fetch(BRANDS_URL)).json(); } catch { brandsData = { cigars: {}, spirits: {} }; }
  }
  if (!galleryData) {
    try { galleryData = await (await fetch(GALLERY_URL)).json(); } catch { galleryData = { _fallback: [] }; }
  }
  const lang = getLang();
  try { storiesData = await (await fetch(STORIES_URL(lang))).json(); } catch { storiesData = {}; }
}

// Deterministički uzmi do N slika iz _fallback po brand-indeksu
function fallbackSlice(index, count = 5) {
  const pool = galleryData?._fallback || [];
  if (!pool.length) return [];
  const out = [];
  for (let i = 0; i < count && i < pool.length; i++) {
    out.push(pool[(index * 7 + i * 3) % pool.length]);
  }
  return out;
}

function imagesForBrand(brand, index) {
  const curated = galleryData?.[brand];
  if (Array.isArray(curated) && curated.length) return curated.slice(0, 10);
  return fallbackSlice(index, 5);
}

function renderTabs(host) {
  const regions = Object.keys(brandsData.cigars || {});
  host.innerHTML = regions.map(r => {
    const label = storiesData[r]?.regionName || r;
    const count = brandsData.cigars[r]?.brands?.length || 0;
    const active = r === activeRegion ? ' is-active' : '';
    return `<button class="brands__tab${active}" data-region="${r}">
      <span class="brands__tab-name">${label}</span>
      <span class="brands__tab-count">${count}</span>
    </button>`;
  }).join('');
}

function renderGrid(host) {
  const region = brandsData.cigars[activeRegion];
  const stories = storiesData[activeRegion];
  if (!region || !stories) { host.innerHTML = ''; return; }

  const regionIntro = stories.regionStory
    ? `<p class="brands__region-story">${stories.regionStory}</p>`
    : '';

  const cards = region.brands.map((b, i) => {
    const story = stories.brands?.[b.brand] || '';
    const isActive = b.brand === activeBrand ? ' is-active' : '';
    return `
      <article class="brand-card${isActive}" data-brand="${b.brand}" data-index="${i}" role="button" tabindex="0">
        <div class="brand-card__header">
          <h3 class="brand-card__name">${b.brand}</h3>
          <span class="brand-card__count">${b.count}</span>
        </div>
        ${story ? `<p class="brand-card__story">${story}</p>` : ''}
      </article>
    `;
  }).join('');

  host.innerHTML = `${regionIntro}<div class="brands__vault"><div class="brands__cards">${cards}</div></div>`;
}

function renderShowcase(brand, index) {
  const showcase = document.getElementById('process-showcase');
  if (!showcase) return;

  if (!brand) {
    // vrati default 4 scene
    if (defaultShowcaseHTML != null) {
      showcase.innerHTML = defaultShowcaseHTML;
      showcase.dataset.default = 'true';
      showcase.removeAttribute('data-brand');
    }
    return;
  }

  const images = imagesForBrand(brand, index || 0);
  if (!images.length) return;

  // Uzmi do 4 slike, pad-uj ciklično ako ih je manje
  const slots = 4;
  const picks = [];
  for (let i = 0; i < slots; i++) picks.push(images[i % images.length]);

  showcase.innerHTML = picks.map(name => `
    <figure>
      <img loading="lazy" decoding="async" src="/assets/gallery/${name}" alt="${brand}">
      <figcaption>${brand}</figcaption>
    </figure>
  `).join('');
  showcase.dataset.default = 'false';
  showcase.dataset.brand = brand;
}

function handleBrandClick(article) {
  const brand = article.dataset.brand;
  const index = parseInt(article.dataset.index || '0', 10);
  if (activeBrand === brand) {
    // Toggle off — vrati default
    activeBrand = null;
    renderShowcase(null);
  } else {
    activeBrand = brand;
    renderShowcase(brand, index);
  }
  // re-render grid da se is-active stanje ažurira
  const gridHost = document.getElementById('brands-grid');
  if (gridHost) renderGrid(gridHost);

  // smooth scroll do showcase-a da korisnik vidi promenu
  const showcase = document.getElementById('process-showcase');
  if (showcase) {
    const top = showcase.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export async function initBrands() {
  const tabsHost = document.getElementById('brands-tabs');
  const gridHost = document.getElementById('brands-grid');
  if (!tabsHost || !gridHost) return;

  // Zapamti default showcase markup pre ijedne izmene
  const showcase = document.getElementById('process-showcase');
  if (showcase && defaultShowcaseHTML == null) defaultShowcaseHTML = showcase.innerHTML;

  await loadData();
  renderTabs(tabsHost);
  renderGrid(gridHost);

  tabsHost.addEventListener('click', (e) => {
    const btn = e.target.closest('.brands__tab');
    if (!btn) return;
    activeRegion = btn.dataset.region;
    activeBrand = null;
    renderShowcase(null);
    renderTabs(tabsHost);
    renderGrid(gridHost);
  });

  gridHost.addEventListener('click', (e) => {
    const card = e.target.closest('.brand-card');
    if (!card) return;
    handleBrandClick(card);
  });
  gridHost.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.brand-card');
    if (!card) return;
    e.preventDefault();
    handleBrandClick(card);
  });

  onLangChange(async () => {
    await loadData();
    renderTabs(tabsHost);
    renderGrid(gridHost);
    // default showcase captions su data-i18n, i18n.js će ih sam rerendrovati
  });
}
