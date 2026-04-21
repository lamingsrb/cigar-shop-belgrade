// =======================================================
// CIGAR SHOP — dynamic content renderers
// Bento grids, spirits rail, locations cards (with images)
// =======================================================

import { tObj, onLangChange, t } from './i18n.js';

// Ručno mapirane slike iz nove gallery (63 slike klijenta).
// Mapping je na osnovu semanti\u010dke klasifikacije: beauty product shots, boxed cigars,
// store displays, authenticity posters.
const GALLERY = '/assets/gallery';

// COLLECTION — 5 bento kartica. Koristim kombinaciju box + premium shots.
const COLLECTION_IMAGES = [
  `${GALLERY}/img-012.webp`,  // lg: boxed premium shot
  `${GALLERY}/img-003.webp`,  // md: product beauty
  `${GALLERY}/img-028.webp`,  // sm: brand shot
  `${GALLERY}/img-040.webp`,  // sm: brand shot
  `${GALLERY}/img-055.webp`   // wide: limited editions poster
];

// SPIRITS — 6 kartica \u010dirokih kategorija (viski/burbon/\u2026). Koristim atmosfere + product shots.
const SPIRITS_IMAGES = [
  `${GALLERY}/img-018.webp`,  // Single Malt Scotch
  `${GALLERY}/img-025.webp`,  // Japanese
  `${GALLERY}/img-032.webp`,  // Irish
  `${GALLERY}/img-008.webp`,  // Bourbon
  `${GALLERY}/img-044.webp`,  // Cognac
  `${GALLERY}/img-050.webp`   // Rakija
];

// ACCESSORIES — 6 kartica (rezači, upaljači, humidori, pepeljare, etui, boveda).
// Hand-pick: store displays i product shots koji pokazuju pribor.
const ACCESSORIES_IMAGES = [
  `${GALLERY}/img-015.webp`,  // Rezači
  `${GALLERY}/img-022.webp`,  // Upaljači
  `${GALLERY}/img-036.webp`,  // Humidori
  `${GALLERY}/img-048.webp`,  // Pepeljare
  `${GALLERY}/img-061.webp`,  // Putni etui
  `${GALLERY}/img-057.webp`   // Boveda
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

// ---------- ACCESSORIES (rail carousel) ----------
export function renderAccessories() {
  const host = document.getElementById('accessories-rail');
  if (!host) return;

  const build = () => {
    const items = tObj('accessories.items') || [];
    host.innerHTML = items.map((it, i) => `
      <article class="spirit-card reveal">
        <div class="spirit-card__img" style="${bg(ACCESSORIES_IMAGES[i % ACCESSORIES_IMAGES.length])}"></div>
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
