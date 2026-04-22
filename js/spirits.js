// =======================================================
// CIGAR SHOP — Spirits sekcija (po uzoru na Biblioteka cigara)
// Tab-ovi po kategoriji + brand kartice + gornji showcase koji se
// menja na klik brenda. Isti pattern kao brands.js, samo druga data izvora.
// =======================================================

import { getLang, onLangChange } from './i18n.js';

const BRANDS_URL  = '/data/brands.json';
const STORIES_URL = (lang) => `/locales/brand-stories-${lang}.json`;

// Placeholder slike po kategoriji. Zamene\u0107e se pravim product fotografijama
// kad klijent po\u0161alje.
const PLACEHOLDER_BY_CAT = {
  whisky:  ['/assets/spirits/scotch.webp', '/assets/spirits/japanese.webp', '/assets/spirits/irish.webp', '/assets/gallery/img-008.webp', '/assets/gallery/img-018.webp'],
  bourbon: ['/assets/spirits/bourbon.webp', '/assets/gallery/img-008.webp', '/assets/gallery/img-018.webp'],
  cognac:  ['/assets/spirits/cognac.webp', '/assets/gallery/img-025.webp', '/assets/gallery/img-044.webp'],
  gin:     ['/assets/gallery/img-002.webp', '/assets/gallery/img-021.webp', '/assets/gallery/img-028.webp', '/assets/gallery/img-031.webp'],
  rum:     ['/assets/gallery/img-008.webp', '/assets/gallery/img-018.webp', '/assets/gallery/img-036.webp', '/assets/gallery/img-049.webp'],
  vodka:   ['/assets/gallery/img-028.webp', '/assets/gallery/img-052.webp'],
  rakija:  ['/assets/spirits/rakija.webp', '/assets/gallery/img-021.webp', '/assets/gallery/img-037.webp'],
  wine:    ['/assets/gallery/img-033.webp', '/assets/gallery/img-048.webp', '/assets/gallery/img-037.webp']
};

const CAT_LABEL_SR = { whisky:'Viski', bourbon:'Burbon', cognac:'Konjak', gin:'D\u017ein', rum:'Rum', vodka:'Votka', rakija:'Rakija', wine:'Vino' };
const CAT_LABEL_EN = { whisky:'Whisky', bourbon:'Bourbon', cognac:'Cognac', gin:'Gin', rum:'Rum', vodka:'Vodka', rakija:'Rakija', wine:'Wine' };

let brandsData = null;
let storiesData = null;
let activeCat = 'whisky';
let activeBrand = null;
let defaultShowcaseHTML = null;

async function loadData() {
  if (!brandsData) {
    try { brandsData = await (await fetch(BRANDS_URL)).json(); }
    catch { brandsData = { cigars: {}, spirits: {} }; }
  }
  const lang = getLang();
  try { storiesData = await (await fetch(STORIES_URL(lang))).json(); }
  catch { storiesData = {}; }
}

function catLabel(cat) {
  return getLang() === 'en' ? CAT_LABEL_EN[cat] : CAT_LABEL_SR[cat];
}

function imagesFor(cat, brandIndex) {
  const pool = PLACEHOLDER_BY_CAT[cat] || [];
  if (!pool.length) return [];
  const out = [];
  const take = Math.min(4, pool.length);
  for (let i = 0; i < take; i++) out.push(pool[(brandIndex * 2 + i) % pool.length]);
  return out;
}

function renderTabs(host) {
  const cats = Object.keys(brandsData.spirits || {});
  host.innerHTML = cats.map(c => {
    const label = catLabel(c);
    const count = brandsData.spirits[c]?.brands?.length || 0;
    const active = c === activeCat ? ' is-active' : '';
    return `<button class="brands__tab${active}" data-cat="${c}">
      <span class="brands__tab-name">${label}</span>
      <span class="brands__tab-count">${count}</span>
    </button>`;
  }).join('');
}

function renderGrid(host) {
  const cat = brandsData.spirits[activeCat];
  const intro = storiesData.spirits?.[activeCat]?.story || '';
  if (!cat) { host.innerHTML = ''; return; }

  const introBlock = intro ? `<p class="brands__region-story">${intro}</p>` : '';

  const cards = (cat.brands || []).map((b, i) => {
    const isActive = b.brand === activeBrand ? ' is-active' : '';
    return `
      <article class="brand-card${isActive}" data-brand="${b.brand}" data-index="${i}" role="button" tabindex="0">
        <div class="brand-card__header">
          <h3 class="brand-card__name">${b.brand}</h3>
          <span class="brand-card__count">${b.count}</span>
        </div>
      </article>
    `;
  }).join('');

  host.innerHTML = `${introBlock}<div class="brands__vault"><div class="brands__cards">${cards}</div></div>`;
}

function renderShowcase(brand, index) {
  const showcase = document.getElementById('spirits-showcase');
  if (!showcase) return;

  if (!brand) {
    if (defaultShowcaseHTML != null) {
      showcase.innerHTML = defaultShowcaseHTML;
      showcase.dataset.default = 'true';
      showcase.removeAttribute('data-brand');
    }
    return;
  }

  const images = imagesFor(activeCat, index || 0);
  if (!images.length) return;

  const slots = 4;
  const picks = [];
  for (let i = 0; i < slots; i++) picks.push(images[i % images.length]);

  showcase.innerHTML = picks.map(src => `
    <figure>
      <img loading="lazy" decoding="async" src="${src}" alt="${brand}">
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
    activeBrand = null;
    renderShowcase(null);
  } else {
    activeBrand = brand;
    renderShowcase(brand, index);
  }
  const gridHost = document.getElementById('spirits-grid');
  if (gridHost) renderGrid(gridHost);
  const showcase = document.getElementById('spirits-showcase');
  if (showcase) {
    const top = showcase.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export async function initSpirits() {
  const tabsHost = document.getElementById('spirits-tabs');
  const gridHost = document.getElementById('spirits-grid');
  if (!tabsHost || !gridHost) return;

  const showcase = document.getElementById('spirits-showcase');
  if (showcase && defaultShowcaseHTML == null) defaultShowcaseHTML = showcase.innerHTML;

  await loadData();
  renderTabs(tabsHost);
  renderGrid(gridHost);

  tabsHost.addEventListener('click', (e) => {
    const btn = e.target.closest('.brands__tab');
    if (!btn) return;
    activeCat = btn.dataset.cat;
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
    // Default showcase captions se re-render-uju jer koriste data-i18n
    // ali samo ako smo u default stanju; ina\u010de ostaje brand label
    if (!activeBrand && defaultShowcaseHTML != null && showcase) {
      // Re-snapshot da uhvatimo novi lang koji je i18n.js ve\u0107 primenio
      defaultShowcaseHTML = showcase.innerHTML;
    }
  });
}
