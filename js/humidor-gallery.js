// =======================================================
// CIGAR SHOP — "Pogled u humidor" galerija
// Isti gallery-pages template kao i Godine tišine, samo sa kuriranim
// 6 humidor product fotki (1 page, bez auto-advance).
// =======================================================

import { initGalleryPages } from './gallery-pages.js';

const ITEMS = [
  {
    src: '/assets/humidor/humidor-01.webp',
    thumb: '/assets/humidor/humidor-01-thumb.webp',
    caption: 'Humidor sa cigarama, sečivom i upaljačem',
    alt: 'Humidor sa cigarama i priborom',
  },
  {
    src: '/assets/humidor/humidor-02.webp',
    thumb: '/assets/humidor/humidor-02-thumb.webp',
    caption: 'Humidor sa digitalnim higrometrom i cigarama',
    alt: 'Humidor sa digitalnim higrometrom',
  },
  {
    src: '/assets/humidor/humidor-03.webp',
    thumb: '/assets/humidor/humidor-03-thumb.webp',
    caption: 'Mahagonijev humidor uz Barolo',
    alt: 'Mahagonijev humidor uz piće',
  },
  {
    src: '/assets/humidor/humidor-04.webp',
    thumb: '/assets/humidor/humidor-04-thumb.webp',
    caption: 'Humidor sa sklopivom pepeljarom',
    alt: 'Humidor sa sklopivom pepeljarom',
  },
  {
    src: '/assets/humidor/humidor-05.webp',
    thumb: '/assets/humidor/humidor-05-thumb.webp',
    caption: 'Sklopiva pepeljara, sečivo i upaljač uz Nikku',
    alt: 'Sklopiva pepeljara sa priborom',
  },
  {
    src: '/assets/humidor/humidor-06.webp',
    thumb: '/assets/humidor/humidor-06-thumb.webp',
    caption: 'Humidor i sklopiva pepeljara, kompletna postavka',
    alt: 'Humidor i sklopiva pepeljara',
  },
];

export function initHumidorGallery() {
  const host = document.getElementById('humidor-gallery');
  if (!host) return;
  // 6 stavki = tačno 1 page → bez auto-advance/dots; statičan grid sa fade tranzicijom hover-a.
  initGalleryPages(host, { items: ITEMS, itemsPerPage: 6, autoplay: false });
}
