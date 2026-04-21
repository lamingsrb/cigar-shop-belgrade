// =======================================================
// CIGAR SHOP — Brands sekcija
// Tab filter po regiji + grid kartica sa brand storytelling-om.
// Čita podatke iz public/data/brands.json + locales/brand-stories-{lang}.json
// =======================================================

import { getLang, onLangChange } from './i18n.js';

const BRANDS_URL = '/data/brands.json';
const STORIES_URL = (lang) => `/locales/brand-stories-${lang}.json`;

let brandsData = null;
let storiesData = null;
let activeRegion = 'cuba';

async function loadData() {
  if (!brandsData) {
    try { brandsData = await (await fetch(BRANDS_URL)).json(); } catch { brandsData = { cigars: {}, spirits: {} }; }
  }
  const lang = getLang();
  try { storiesData = await (await fetch(STORIES_URL(lang))).json(); } catch { storiesData = {}; }
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
  if (!region || !stories) {
    host.innerHTML = '';
    return;
  }

  const regionIntro = stories.regionStory
    ? `<p class="brands__region-story">${stories.regionStory}</p>`
    : '';

  const cards = region.brands.map((b) => {
    const story = stories.brands?.[b.brand] || '';
    return `
      <article class="brand-card">
        <div class="brand-card__header">
          <h3 class="brand-card__name">${b.brand}</h3>
          <span class="brand-card__count">${b.count}</span>
        </div>
        ${story ? `<p class="brand-card__story">${story}</p>` : ''}
      </article>
    `;
  }).join('');

  host.innerHTML = `${regionIntro}<div class="brands__cards">${cards}</div>`;
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
    activeRegion = btn.dataset.region;
    renderTabs(tabsHost);
    renderGrid(gridHost);
  });

  onLangChange(async () => {
    await loadData();
    renderTabs(tabsHost);
    renderGrid(gridHost);
  });
}
