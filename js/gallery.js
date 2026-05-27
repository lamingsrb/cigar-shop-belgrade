// =======================================================
// CIGAR SHOP — Godine tišine slideshow
// 50 brendiranih slika iz Aninog Viber batch-a 26-05-2026.
// Popunjava media-slideshow slot u #gallery sekciji koji ide kroz svih 50
// slika sa fade tranzicijama. Klik na sliku → lightbox.
// =======================================================

const TOTAL_IMAGES = 50;
const BASE = '/assets/gallery/main';

export async function initGallery() {
  const host = document.getElementById('gallery-media');
  if (!host || host.dataset.source !== 'gallery-main') return;

  const slides = Array.from({ length: TOTAL_IMAGES }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    const src = `${BASE}/${num}.webp`;
    const mobileSrc = `${BASE}/${num}-m.webp`;
    const cls = i === 0 ? ' is-active' : '';
    return `
      <figure class="media-slideshow__slide${cls}"
              data-lb-type="image" data-lb-src="${src}"
              data-lb-caption="Cigar Shop galerija">
        <img loading="lazy" decoding="async"
             src="${src}"
             srcset="${mobileSrc} 768w, ${src} 1600w"
             sizes="(max-width: 768px) 100vw, 50vw"
             alt="Cigar Shop galerija">
      </figure>`;
  }).join('');

  host.innerHTML = slides;
}
