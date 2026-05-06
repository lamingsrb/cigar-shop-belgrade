// =======================================================
// CIGAR SHOP — Spirits sekcija (Nastavi sa pićem) — tab-showcase pattern
// 6 tabova (Viski, Burbon, Džin, Konjak, Rum, Rakija). Klik na tab →
// grid slika sa brand-name overlay-ima. Renduje preko unified tab-showcase.
// =======================================================

import { getLang, onLangChange } from './i18n.js';
import { initTabShowcase } from './tab-showcase.js';

const BRANDS_URL = '/data/brands.json';

// Slike per kategorija (bottle/process imagery + vitrine)
const VITRINE = [
  '/assets/spirits/vitrine-01.webp',
  '/assets/spirits/vitrine-02.webp',
  '/assets/spirits/vitrine-03.webp',
];
const IMAGES_BY_CAT = {
  whisky:  ['/assets/spirits/scotch.webp', '/assets/spirits/japanese.webp', '/assets/spirits/irish.webp', ...VITRINE],
  bourbon: ['/assets/spirits/bourbon.webp', '/assets/spirits/spirits-process-3-odlezavanje.webp', '/assets/spirits/spirits-process-4-selekcija.webp', ...VITRINE],
  gin:     ['/assets/spirits/spirits-process-1-destilacija.webp', '/assets/gallery/img-002.webp', '/assets/gallery/img-021.webp', ...VITRINE],
  cognac:  ['/assets/spirits/cognac.webp', '/assets/spirits/spirits-process-2-destilerija.webp', '/assets/spirits/spirits-process-3-odlezavanje.webp', ...VITRINE],
  rum:     ['/assets/spirits/spirits-process-3-odlezavanje.webp', '/assets/gallery/img-008.webp', '/assets/gallery/img-018.webp', ...VITRINE],
  rakija:  ['/assets/spirits/rakija.webp', '/assets/spirits/spirits-process-2-destilerija.webp', '/assets/gallery/img-021.webp', ...VITRINE],
};

const CAT_LABEL_SR = { whisky: 'Viski', bourbon: 'Burbon', gin: 'Džin', cognac: 'Konjak', rum: 'Rum', rakija: 'Rakija' };
const CAT_LABEL_EN = { whisky: 'Whisky', bourbon: 'Bourbon', gin: 'Gin', cognac: 'Cognac', rum: 'Rum', rakija: 'Rakija' };
const VISIBLE_CATS = ['whisky', 'bourbon', 'gin', 'cognac', 'rum', 'rakija'];

let brandsData = null;

async function loadData() {
  if (brandsData) return;
  try { brandsData = await (await fetch(BRANDS_URL)).json(); }
  catch { brandsData = { spirits: {} }; }
}

function buildRegions() {
  const lang = getLang();
  const labels = lang === 'en' ? CAT_LABEL_EN : CAT_LABEL_SR;
  const tabs = VISIBLE_CATS.map(k => ({ key: k, label: labels[k] }));
  const regions = {};
  VISIBLE_CATS.forEach(cat => {
    const brandList = brandsData?.spirits?.[cat]?.brands || [];
    const images = IMAGES_BY_CAT[cat] || [];
    if (!images.length) return;
    // Uzmi do 6 brendova (najveći prvi, već su sortirani u brands.json)
    const picks = brandList.slice(0, 6);
    // Mapiraj brand → image (cycle ako brendova više nego slika)
    regions[cat] = {
      items: picks.map((b, i) => ({
        src: images[i % images.length],
        thumb: images[i % images.length],
        name: b.brand || labels[cat],
        caption: b.brand || labels[cat],
        alt: b.brand || labels[cat],
      })),
    };
    // Fallback: ako nema brendova, prikaži same slike sa generic labelom
    if (!regions[cat].items.length) {
      regions[cat].items = images.slice(0, 6).map((src, i) => ({
        src, thumb: src,
        name: `${labels[cat]} ${i + 1}`,
        caption: labels[cat],
        alt: labels[cat],
      }));
    }
  });
  return { tabs, regions };
}

export async function initSpirits() {
  const host = document.getElementById('spirits-tab-showcase');
  if (!host) return;
  await loadData();

  function rerender() {
    const { tabs, regions } = buildRegions();
    initTabShowcase(host, { tabs, regions });
  }
  rerender();
  onLangChange(rerender);
}
