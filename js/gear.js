// =======================================================
// CIGAR SHOP — Oprema sekcija (po uzoru na Biblioteka cigara / Spirits)
// Tab-ovi po vrsti (rezaci / upaljaci / humidori / pepeljare / putni etui),
// grid kartica po brendu/modelu, klik na karticu menja gornji showcase red.
// Placeholder podaci u public/data/gear.json \u2014 zamene\u0107e se realnim kad stigne.
// =======================================================

import { getLang, onLangChange } from './i18n.js';

const GEAR_URL = '/data/gear.json';
let gearData = null;
let activeCat = null;
let activeItem = null;
let defaultShowcaseHTML = null;

async function loadData() {
  if (gearData) return;
  try { gearData = await (await fetch(GEAR_URL)).json(); }
  catch { gearData = { categories: [] }; }
}

function catsList() { return gearData?.categories || []; }
function currentCat() {
  const cats = catsList();
  if (!cats.length) return null;
  return cats.find(c => c.key === activeCat) || cats[0];
}
function catLabel(cat) { return getLang() === 'en' ? cat.nameen : cat.namesr; }
function catStory(cat) { return getLang() === 'en' ? cat.storyen : cat.storysr; }

function renderTabs(host) {
  const cats = catsList();
  if (!activeCat && cats.length) activeCat = cats[0].key;
  host.innerHTML = cats.map(c => {
    const label = catLabel(c);
    const count = (c.items || []).length;
    const active = c.key === activeCat ? ' is-active' : '';
    return `<button class="brands__tab${active}" data-cat="${c.key}">
      <span class="brands__tab-name">${label}</span>
      <span class="brands__tab-count">${count}</span>
    </button>`;
  }).join('');
}

function renderGrid(host) {
  const cat = currentCat();
  if (!cat) { host.innerHTML = ''; return; }

  const story = catStory(cat);
  const introBlock = story ? `<p class="brands__region-story">${story}</p>` : '';

  const cards = (cat.items || []).map((it, i) => {
    const isActive = it.name === activeItem ? ' is-active' : '';
    return `
      <article class="brand-card${isActive}" data-item="${it.name}" data-index="${i}" role="button" tabindex="0">
        <div class="brand-card__header">
          <h3 class="brand-card__name">${it.name}</h3>
        </div>
        ${it.sub ? `<p class="brand-card__story">${it.sub}</p>` : ''}
      </article>
    `;
  }).join('');

  host.innerHTML = `${introBlock}<div class="brands__vault"><div class="brands__cards">${cards}</div></div>`;
}

function renderShowcase(itemName) {
  const showcase = document.getElementById('gear-showcase');
  if (!showcase) return;

  const cat = currentCat();
  const pool = cat?.images || [];

  // Bez aktivne kartice → prikaži CEO pool kategorije (10 fotki po Aninom briefu).
  if (!itemName) {
    if (!pool.length) {
      if (defaultShowcaseHTML != null) {
        showcase.innerHTML = defaultShowcaseHTML;
        showcase.dataset.default = 'true';
        showcase.removeAttribute('data-item');
      }
      return;
    }
    showcase.innerHTML = pool.map(src => `
      <figure data-lb-type="image" data-lb-src="${src}" data-lb-caption="${catLabel(cat)}">
        <img loading="lazy" decoding="async" src="${src}" alt="${catLabel(cat)}">
        <figcaption>${catLabel(cat)}</figcaption>
      </figure>
    `).join('');
    showcase.dataset.default = 'true';
    showcase.removeAttribute('data-item');
    return;
  }

  if (!pool.length) return;

  showcase.innerHTML = pool.map(src => `
    <figure data-lb-type="image" data-lb-src="${src}" data-lb-caption="${itemName}">
      <img loading="lazy" decoding="async" src="${src}" alt="${itemName}">
      <figcaption>${itemName}</figcaption>
    </figure>
  `).join('');
  showcase.dataset.default = 'false';
  showcase.dataset.item = itemName;
}

function handleCardClick(article) {
  const name = article.dataset.item;
  if (activeItem === name) {
    activeItem = null;
    renderShowcase(null);
  } else {
    activeItem = name;
    renderShowcase(name);
  }
  const gridHost = document.getElementById('gear-grid');
  if (gridHost) renderGrid(gridHost);
  const showcase = document.getElementById('gear-showcase');
  if (showcase) {
    const top = showcase.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export async function initGear() {
  const tabsHost = document.getElementById('gear-tabs');
  const gridHost = document.getElementById('gear-grid');
  if (!tabsHost || !gridHost) return;

  const showcase = document.getElementById('gear-showcase');
  if (showcase && defaultShowcaseHTML == null) defaultShowcaseHTML = showcase.innerHTML;

  await loadData();
  renderTabs(tabsHost);
  renderGrid(gridHost);
  // Inicijalno prikaži ceo pool prve kategorije (10 fotki) kako je Ana tražila.
  renderShowcase(null);

  tabsHost.addEventListener('click', (e) => {
    const btn = e.target.closest('.brands__tab');
    if (!btn) return;
    activeCat = btn.dataset.cat;
    activeItem = null;
    renderShowcase(null);
    renderTabs(tabsHost);
    renderGrid(gridHost);
  });

  gridHost.addEventListener('click', (e) => {
    const card = e.target.closest('.brand-card');
    if (!card) return;
    handleCardClick(card);
  });
  gridHost.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.brand-card');
    if (!card) return;
    e.preventDefault();
    handleCardClick(card);
  });

  onLangChange(() => {
    renderTabs(tabsHost);
    renderGrid(gridHost);
  });
}
