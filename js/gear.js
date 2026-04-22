// =======================================================
// CIGAR SHOP — Oprema (Gear / Accessories) sekcija
// Placeholder podaci u public/data/gear.json dok klijent ne po\u0161alje
// pravi Excel. Grid kartica, svaka sa imenom kategorije, mini-pri\u010dom,
// listom primera proizvoda i 2-3 placeholder slike.
// =======================================================

import { getLang, onLangChange } from './i18n.js';

const GEAR_URL = '/data/gear.json';
let gearData = null;

async function loadData() {
  if (gearData) return;
  try { gearData = await (await fetch(GEAR_URL)).json(); }
  catch { gearData = { categories: [] }; }
}

function render(host) {
  const lang = getLang();
  const cats = gearData.categories || [];
  host.innerHTML = cats.map((c) => {
    const name  = lang === 'en' ? c.nameen : c.namesr;
    const story = lang === 'en' ? c.storyen : c.storysr;
    const items = (c.items || []).map(it =>
      `<li><strong>${it.name}</strong><span>${it.sub}</span></li>`
    ).join('');
    const media = (c.images || []).slice(0, 3).map(src =>
      `<img loading="lazy" decoding="async" src="${src}" alt="${name}">`
    ).join('');
    return `
      <article class="gear-card" data-cat="${c.key}">
        <div class="gear-card__media">${media}</div>
        <div class="gear-card__body">
          <h3 class="gear-card__name">${name}</h3>
          ${story ? `<p class="gear-card__story">${story}</p>` : ''}
          ${items ? `<ul class="gear-card__items">${items}</ul>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

export async function initGear() {
  const host = document.getElementById('gear-grid');
  if (!host) return;
  await loadData();
  render(host);
  onLangChange(() => render(host));
}
