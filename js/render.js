// =======================================================
// CIGAR SHOP — dynamic content renderers
// Bento grids, spirits rail, locations cards (with images)
// =======================================================

import { tObj, onLangChange, t } from './i18n.js';

const IMG = '/assets/img/kaliman';

// Pool slika dostupnih za rotaciju (preuzete sa kalimancaribe)
const IMAGES = {
  banner:     `${IMG}/Banner_1950x480px-eng.jpg`,
  productBig: `${IMG}/i1_jcos-dg.jpg`,
  product:    `${IMG}/p1.jpg`,
  store:      `${IMG}/stores_1.jpg`,
  index5:     `${IMG}/index5.jpg`,
  index2:     `${IMG}/index2-1.webp`,
  mapCohiba:  `${IMG}/map-cohiba.webp`,
  mapLacasa:  `${IMG}/map-lacasa.webp`,
  mapPremium: `${IMG}/map-premium.webp`,
  auth:       `${IMG}/authcheck.webp`
};

// Manual mapiranje slika na sekcije (isto u SR/EN — slike su neutralne)
const COLLECTION_IMAGES = [
  IMAGES.productBig,
  IMAGES.product,
  IMAGES.mapLacasa,
  IMAGES.mapCohiba,
  IMAGES.banner
];

const SPIRITS_IMAGES = [
  IMAGES.store,
  IMAGES.index5,
  IMAGES.product,
  IMAGES.productBig,
  IMAGES.index2,
  IMAGES.banner
];

const ACCESSORIES_IMAGES = [
  IMAGES.index5,
  IMAGES.index2,
  IMAGES.store,
  IMAGES.mapPremium,
  IMAGES.auth,
  IMAGES.banner
];

// Overlay gradient which darkens the image so text is legible
const OVERLAY = 'linear-gradient(180deg, rgba(10,6,5,0.15) 0%, rgba(10,6,5,0.5) 50%, rgba(10,6,5,0.92) 100%)';

function bg(img) {
  return `background: ${OVERLAY}, url('${img}') center/cover no-repeat; background-blend-mode: multiply;`;
}

// ---------- COLLECTION (bento) ----------
export function renderCollection() {
  const host = document.getElementById('collection-bento');
  if (!host) return;

  const build = () => {
    const items = tObj('collection.items') || [];
    host.innerHTML = items.map((it, i) => `
      <article class="bento__card bento__card--${it.size || 'md'} reveal reveal--delay-${(i % 3) + 1}">
        <div class="bento__img" style="${bg(COLLECTION_IMAGES[i % COLLECTION_IMAGES.length])}"></div>
        <div class="bento__body">
          <h3 class="bento__title">${it.title}</h3>
          <p class="bento__sub">${it.sub}</p>
        </div>
      </article>
    `).join('');
  };

  build();
  onLangChange(build);
}

// ---------- SPIRITS (horizontal rail) ----------
export function renderSpirits() {
  const host = document.getElementById('spirits-rail');
  if (!host) return;

  const build = () => {
    const items = tObj('spirits.items') || [];
    host.innerHTML = items.map((it, i) => `
      <article class="spirit-card reveal">
        <div class="spirit-card__img" style="${bg(SPIRITS_IMAGES[i % SPIRITS_IMAGES.length])}"></div>
        <div class="spirit-card__body">
          <h3 class="spirit-card__title">${it.title}</h3>
          <p class="spirit-card__sub">${it.sub}</p>
        </div>
      </article>
    `).join('');
  };

  build();
  onLangChange(build);
}

// ---------- ACCESSORIES (bento) ----------
export function renderAccessories() {
  const host = document.getElementById('accessories-bento');
  if (!host) return;

  const build = () => {
    const items = tObj('accessories.items') || [];
    host.innerHTML = items.map((it, i) => `
      <article class="bento__card bento__card--${it.size || 'md'} reveal reveal--delay-${(i % 3) + 1}">
        <div class="bento__img" style="${bg(ACCESSORIES_IMAGES[i % ACCESSORIES_IMAGES.length])}"></div>
        <div class="bento__body">
          <h3 class="bento__title">${it.title}</h3>
          <p class="bento__sub">${it.sub}</p>
        </div>
      </article>
    `).join('');
  };

  build();
  onLangChange(build);
}

// ---------- LOCATIONS (cards) ----------
export function renderLocations() {
  const host = document.getElementById('locations-list');
  if (!host) return;

  const build = () => {
    const items = tObj('locations.stores') || [];
    const navLabel = t('locations.navigate') || 'Navigate';
    const hoursLabel = t('locations.hoursLabel') || 'Hours';
    host.innerHTML = items.map((it) => `
      <article class="location-card reveal">
        <h3>${it.name}</h3>
        <p>${it.address}</p>
        <p class="location-card__hours">${hoursLabel}: ${it.hours}</p>
        <p class="location-card__hours">${it.phone || ''}</p>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${it.lat},${it.lng}" target="_blank" rel="noopener">${navLabel} →</a>
      </article>
    `).join('');
  };

  build();
  onLangChange(build);
}
