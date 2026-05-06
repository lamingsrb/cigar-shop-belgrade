// =======================================================
// CIGAR SHOP — Humidor "Po regiji" tab-showcase (Kuba | Novi svet)
// Unificirana sa Spirits + Gear tab-showcase patternom.
// =======================================================

import { initTabShowcase } from './tab-showcase.js';

const REGIONS = {
  cuba: {
    items: [
      { src: '/assets/humidor/humidor-01.webp', thumb: '/assets/humidor/humidor-01-thumb.webp',
        name: 'Cohiba',  caption: 'Mahagonijev humidor sa kubanskim cigarama', alt: 'Cohiba humidor postavka' },
      { src: '/assets/humidor/humidor-02.webp', thumb: '/assets/humidor/humidor-02-thumb.webp',
        name: 'Montecristo', caption: 'Walnut humidor + digitalni higrometar', alt: 'Montecristo postavka' },
      { src: '/assets/humidor/humidor-03.webp', thumb: '/assets/humidor/humidor-03-thumb.webp',
        name: 'Romeo y Julieta', caption: 'Crveni mahagoni uz Barolo', alt: 'Romeo y Julieta postavka' },
      { src: '/assets/humidor/humidor-04.webp', thumb: '/assets/humidor/humidor-04-thumb.webp',
        name: 'Partagas', caption: 'Humidor sa sklopivom pepeljarom', alt: 'Partagas postavka' },
      { src: '/assets/humidor/humidor-06.webp', thumb: '/assets/humidor/humidor-06-thumb.webp',
        name: 'H. Upmann', caption: 'Premium kombinacija humidor + pepeljara', alt: 'H. Upmann postavka' },
    ],
  },
  world: {
    items: [
      { src: '/assets/gallery/img-001.webp', thumb: '/assets/gallery/img-001-thumb.webp',
        name: 'Davidoff',     caption: 'Cigare iz Cibao doline (Dominikana)',           alt: 'Davidoff' },
      { src: '/assets/gallery/img-002.webp', thumb: '/assets/gallery/img-002-thumb.webp',
        name: 'Drew Estate',  caption: 'Drew Estate (Liga Privada)',                    alt: 'Drew Estate' },
      { src: '/assets/gallery/img-008.webp', thumb: '/assets/gallery/img-008-thumb.webp',
        name: 'Padron',       caption: 'Padron — Estelí, Nikaragva',                    alt: 'Padron' },
      { src: '/assets/gallery/img-016.webp', thumb: '/assets/gallery/img-016-thumb.webp',
        name: 'Joya de Nicaragua', caption: 'Joya de Nicaragua — Antaño liga',           alt: 'Joya de Nicaragua' },
      { src: '/assets/gallery/img-021.webp', thumb: '/assets/gallery/img-021-thumb.webp',
        name: 'Plasencia',    caption: 'Plasencia — najveći proizvođači u Nikaragvi',   alt: 'Plasencia' },
    ],
  },
};

const TABS = [
  { key: 'cuba',  label: 'Kuba' },
  { key: 'world', label: 'Novi svet' },
];

export function initHumidorCigars() {
  const host = document.getElementById('humidor-cigars-tab-showcase');
  if (!host) return;
  initTabShowcase(host, { tabs: TABS, regions: REGIONS });
}
