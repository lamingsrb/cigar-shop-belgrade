// =======================================================
// CIGAR SHOP — dynamic content renderers
// Bento grids, spirits rail, locations cards (with images)
// =======================================================

import { tObj, onLangChange, t } from './i18n.js';

// Ručno mapirane slike iz nove gallery (63 slike klijenta).
// Mapping je na osnovu semanti\u010dke klasifikacije: beauty product shots, boxed cigars,
// store displays, authenticity posters.
const GALLERY = '/assets/gallery';

// COLLECTION — 5 bento kartica, svaka mapirana na SPECIFI\u010cNU sliku iz galerije
// po brendu (pre-identifikovano \u010ditanjem slika):
//   img-001 = Romeo y Julieta Wide Churchill
//   img-010 = Julius Caesar (J.C. Newman)
//   img-030 = Pasión
//   img-040 = Joya Cabinetta
//   img-020 = Salomones/Bundle display (Partagas/Montecristo/Cohiba)
const COLLECTION_IMAGES = [
  `${GALLERY}/img-001.webp`,  // lg: Romeo y Julieta
  `${GALLERY}/img-010.webp`,  // md: Julius Caesar
  `${GALLERY}/img-030.webp`,  // sm: Pasión
  `${GALLERY}/img-040.webp`,  // sm: Joya Cabinetta
  `${GALLERY}/img-020.webp`   // wide: Cuban trio display
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
