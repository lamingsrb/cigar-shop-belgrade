// =======================================================
// CIGAR SHOP — Spirits sekcija (redizajnirana po uzoru na Biblioteka cigara)
// Tab-ovi po kategoriji (viski, burbon, konjak, dzin, rum, votka, rakija, vino).
// Unutar svakog taba: grid kartica po geografskom poreklu (brendovi unutar kategorije
// iz brands.json.spirits), svaka sa kratkim intro-om + do 6 placeholder slika.
// =======================================================

import { getLang, onLangChange } from './i18n.js';

const BRANDS_URL  = '/data/brands.json';
const STORIES_URL = (lang) => `/locales/brand-stories-${lang}.json`;

// Placeholder slike po kategoriji (nas 6 spirit WebP-ova + gallery fill-in).
// Zamene\u0107e se kad klijent po\u0161alje pravu product fotografiju po brendu.
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

const CAT_LABEL_KEY = {
  whisky:  'Viski',
  bourbon: 'Burbon',
  cognac:  'Konjak',
  gin:     'D\u017ein',
  rum:     'Rum',
  vodka:   'Votka',
  rakija:  'Rakija',
  wine:    'Vino'
};
const CAT_LABEL_EN = {
  whisky:  'Whisky',
  bourbon: 'Bourbon',
  cognac:  'Cognac',
  gin:     'Gin',
  rum:     'Rum',
  vodka:   'Vodka',
  rakija:  'Rakija',
  wine:    'Wine'
};

let brandsData = null;
let storiesData = null;
let activeCat = 'whisky';

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
  return getLang() === 'en' ? CAT_LABEL_EN[cat] : CAT_LABEL_KEY[cat];
}

function imagesFor(cat, brandIndex) {
  const pool = PLACEHOLDER_BY_CAT[cat] || [];
  if (!pool.length) return [];
  // Deterministic stagger tako da svaki brand dobije razli\u010dit rotirani set
  const out = [];
  const take = Math.min(6, pool.length);
  for (let i = 0; i < take; i++) {
    out.push(pool[(brandIndex * 2 + i) % pool.length]);
  }
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
    const imgs = imagesFor(activeCat, i);
    const gallery = imgs.length
      ? `<div class="brand-card__gallery">
          ${imgs.map(src => `<img loading="lazy" decoding="async" src="${src}" alt="${b.brand}">`).join('')}
        </div>`
      : '';
    return `
      <article class="brand-card">
        <div class="brand-card__header">
          <h3 class="brand-card__name">${b.brand}</h3>
          <span class="brand-card__count">${b.count}</span>
        </div>
        ${gallery}
      </article>
    `;
  }).join('');

  host.innerHTML = `${introBlock}<div class="brands__vault"><div class="brands__cards">${cards}</div></div>`;
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
