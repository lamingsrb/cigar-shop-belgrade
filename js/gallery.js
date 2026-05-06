// =======================================================
// CIGAR SHOP — Godine tišine galerija
// Učitava gallery-manifest.json i delegira render na gallery-pages component.
// =======================================================

import { initGalleryPages } from './gallery-pages.js';

const MANIFEST_URL = '/data/gallery-manifest.json';

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

  const items = manifest.map(it => ({
    src: it.src,
    thumb: it.thumb,
    alt: `Cigar Shop galerija`,
    caption: '',
  }));

  // Faster Instagram-style cycling — Anin feedback: brze ali da se vidi.
  initGalleryPages(host, { items, itemsPerPage: 6, intervalMs: 3500 });
}
