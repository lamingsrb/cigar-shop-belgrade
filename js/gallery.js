// =======================================================
// CIGAR SHOP — Glavna galerija na dnu sekcije "Godine tišine"
// 50 brendiranih slika iz Aninog Viber batch-a 26-05-2026.
// Paginated 6 per page = 9 stranica, auto-cycle.
// =======================================================

import { initGalleryPages } from './gallery-pages.js';

const TOTAL_IMAGES = 50;
const BASE = '/assets/gallery/main';

export async function initGallery() {
  const host = document.getElementById('gallery-track');
  if (!host) return;

  const items = Array.from({ length: TOTAL_IMAGES }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      src: `${BASE}/${num}.webp`,
      thumb: `${BASE}/${num}-thumb.webp`,
      alt: 'Cigar Shop galerija',
      caption: '',
    };
  });

  initGalleryPages(host, { items, itemsPerPage: 6, intervalMs: 3500 });
}
