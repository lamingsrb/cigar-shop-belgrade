// =======================================================
// CIGAR SHOP — Humidor "Po regiji" tabbed galerija
// Tabs: Kuba | Novi svet. Klik na tab → swap gallery-pages content
// (5 fotki po regiji, isti template kao Godine tisine i Pogled u humidor).
// =======================================================

import { initGalleryPages } from './gallery-pages.js';

const REGIONS = {
  cuba: {
    label: 'Kuba',
    items: [
      // 5 najlepsih iz Kubanske_cigare_unzipped (kuriran set)
      { src: '/assets/humidor/humidor-01.webp', thumb: '/assets/humidor/humidor-01-thumb.webp',
        caption: 'Mahagonijev humidor sa cigarama, sečivom i upaljačem',
        alt: 'Cuban humidor sa priborom' },
      { src: '/assets/humidor/humidor-02.webp', thumb: '/assets/humidor/humidor-02-thumb.webp',
        caption: 'Walnut humidor sa kubanskim cigarama i digitalnim higrometrom',
        alt: 'Walnut humidor sa kubanskim cigarama' },
      { src: '/assets/humidor/humidor-03.webp', thumb: '/assets/humidor/humidor-03-thumb.webp',
        caption: 'Crveni mahagoni + 2 cigare uz Barolo',
        alt: 'Mahagonijev humidor uz vino' },
      { src: '/assets/humidor/humidor-04.webp', thumb: '/assets/humidor/humidor-04-thumb.webp',
        caption: 'Humidor sa sklopivom pepeljarom — kompletna postavka',
        alt: 'Humidor sa sklopivom pepeljarom' },
      { src: '/assets/humidor/humidor-06.webp', thumb: '/assets/humidor/humidor-06-thumb.webp',
        caption: 'Humidor i sklopiva pepeljara, premium kombinacija',
        alt: 'Humidor i pepeljara, kompletna postavka' },
    ],
  },
  world: {
    label: 'Novi svet',
    items: [
      // 5 fotki iz galerije sa fokusom na cigare iz Dominikane, Nikaragve, Hondurasa
      { src: '/assets/gallery/img-001.webp', thumb: '/assets/gallery/img-001-thumb.webp',
        caption: 'Cigare iz Cibao doline (Dominikana)',
        alt: 'Cigare iz Novog sveta' },
      { src: '/assets/gallery/img-002.webp', thumb: '/assets/gallery/img-002-thumb.webp',
        caption: 'Polica sa Davidoff i Drew Estate brendovima',
        alt: 'Davidoff i Drew Estate' },
      { src: '/assets/gallery/img-008.webp', thumb: '/assets/gallery/img-008-thumb.webp',
        caption: 'Asortiman cigara iz Estelija (Nikaragva)',
        alt: 'Nikaragvanske cigare' },
      { src: '/assets/gallery/img-016.webp', thumb: '/assets/gallery/img-016-thumb.webp',
        caption: 'Hondurasi i kostarikanski blendovi',
        alt: 'Honduras i Kostarika cigare' },
      { src: '/assets/gallery/img-021.webp', thumb: '/assets/gallery/img-021-thumb.webp',
        caption: 'Premium kolekcija — Novi svet',
        alt: 'Novi svet premium kolekcija' },
    ],
  },
};

const ORDER = ['cuba', 'world'];

export function initHumidorCigars() {
  const host = document.getElementById('humidor-cigars-gallery');
  const tabs = document.getElementById('humidor-cigars-tabs');
  if (!host || !tabs) return;

  let active = 'cuba';

  function renderTabs() {
    tabs.innerHTML = ORDER.map(key => {
      const isActive = key === active ? ' is-active' : '';
      return `<button class="cigar-tab${isActive}" data-region="${key}" type="button">
        <span class="cigar-tab__name">${REGIONS[key].label}</span>
        <span class="cigar-tab__count">${REGIONS[key].items.length}</span>
      </button>`;
    }).join('');
  }

  function renderGallery() {
    initGalleryPages(host, {
      items: REGIONS[active].items,
      itemsPerPage: 5,
      autoplay: false,
    });
  }

  renderTabs();
  renderGallery();

  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.cigar-tab');
    if (!btn) return;
    const region = btn.dataset.region;
    if (!region || region === active || !REGIONS[region]) return;
    active = region;
    renderTabs();
    renderGallery();
  });
}
