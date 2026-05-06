// =======================================================
// CIGAR SHOP — Oprema (Alati rituala) — tab-showcase pattern
// Učitava gear.json i mapira items[] (4 po kategoriji) na slike iz images[]
// pool-a (cycle if needed). Render kao unified tab-showcase.
// =======================================================

import { getLang, onLangChange } from './i18n.js';
import { initTabShowcase } from './tab-showcase.js';

const GEAR_URL = '/data/gear.json';
let gearData = null;

async function loadData() {
  if (gearData) return;
  try { gearData = await (await fetch(GEAR_URL)).json(); }
  catch { gearData = { categories: [] }; }
}

function buildRegions() {
  const cats = gearData?.categories || [];
  const tabs = cats.map(c => ({ key: c.key, label: getLang() === 'en' ? c.nameen : c.namesr }));
  const regions = {};
  cats.forEach(c => {
    const items = c.items || [];
    const images = c.images || [];
    if (!items.length || !images.length) return;
    regions[c.key] = {
      items: items.map((it, i) => ({
        src: images[i % images.length],
        thumb: images[i % images.length],
        name: it.name,
        caption: it.sub || it.name,
        alt: it.name,
      })),
    };
  });
  return { tabs, regions };
}

export async function initGear() {
  const host = document.getElementById('gear-tab-showcase');
  if (!host) return;
  await loadData();

  function rerender() {
    const { tabs, regions } = buildRegions();
    initTabShowcase(host, { tabs, regions });
  }
  rerender();
  onLangChange(rerender);
}
