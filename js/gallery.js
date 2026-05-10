// =======================================================
// CIGAR SHOP — Godine tišine galerija
// Učitava gallery-manifest.json i delegira render na gallery-pages component.
// Filter: hand-picked subset (Vojin feedback 09-05-2026: izbaci duplikate i
// ružne, ostavi samo najlepše — ~24 slika u 4 strane od po 6).
// =======================================================

import { initGalleryPages } from './gallery-pages.js';

const MANIFEST_URL = '/data/gallery-manifest.json';

// Curated whitelist — biraj samo ova imena iz manifesta.
// Pokriva: COHIBA hero/atmospheri, ROMEO/MONTECRISTO/PARTAGAS klasici,
// PLASENCIA/JOYA/ASHTON/MAYA SELVA/DAVIDOFF, par HORACIO (ne svih 10!),
// i nekoliko atmospheric kadrova.
const CURATED = new Set([
  'img-001', 'img-003', 'img-004', 'img-005',
  'img-008', 'img-013', 'img-014', 'img-017',
  'img-018', 'img-020', 'img-021', 'img-026',
  'img-029', 'img-030', 'img-031', 'img-032',
  'img-034', 'img-035', 'img-040', 'img-041',
  'img-049', 'img-053', 'img-056', 'img-060',
]);

export async function initGallery() {
  const host = document.getElementById('gallery-track');
  if (!host) return;

  let manifest;
  try {
    const res = await fetch(MANIFEST_URL);
    manifest = await res.json();
  } catch (err) {
    console.error('[gallery] Failed to load manifest', err);
    return;
  }

  const items = manifest
    .filter(it => CURATED.has(it.name))
    .map(it => ({
      src: it.src,
      thumb: it.thumb,
      alt: `Cigar Shop galerija`,
      caption: '',
    }));

  // Faster Instagram-style cycling — Anin feedback: brze ali da se vidi.
  initGalleryPages(host, { items, itemsPerPage: 6, intervalMs: 3500 });
}
