// =======================================================
// CIGAR SHOP — Category detail page (Kuba/Novi svet/spirits/gear)
// Loads /data/categories.json, renders post-style detail by URL hash.
// Routes: /category.html#cuba, #world, #whisky, #bourbon, #gin, #cognac,
//         #rum, #rakija, #cutters, #lighters, #humidors, #ashtrays, #cases
// =======================================================
import { initI18n, getLang, onLangChange, t } from './i18n.js';
import { initLightbox } from './lightbox.js';

const CATEGORIES_URL = '/data/categories.json';
let data = null;

function mdInline(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function mdBlock(body) {
  const paras = body.split(/\n\n+/);
  return paras.map(p => {
    const lines = p.split(/\n/);
    if (lines.every(l => l.trim().startsWith('- '))) {
      return '<ul>' + lines.map(l => `<li>${mdInline(l.replace(/^\s*-\s+/, ''))}</li>`).join('') + '</ul>';
    }
    return `<p>${mdInline(p)}</p>`;
  }).join('');
}

function renderCategory(host, key) {
  const cat = data?.[key];
  if (!cat) {
    host.innerHTML = `
      <section class="blog-page__hero">
        <p class="kicker">404</p>
        <h1 class="heading-display">Kategorija nije pronađena.</h1>
        <p class="lead">Vrati se na <a href="/">sajt</a>.</p>
      </section>`;
    document.title = 'Cigar Shop — Kategorija ne postoji';
    return;
  }

  const lang = getLang();
  const title = lang === 'en' ? cat.titleen : cat.titlesr;
  const excerpt = lang === 'en' ? cat.excerpten : cat.excerptsr;
  const body = lang === 'en' ? cat.bodyen : cat.bodysr;
  const kicker = (cat.kicker && (cat.kicker[lang] || cat.kicker.sr)) || '';

  document.title = `Cigar Shop — ${title.replace(/\.$/, '')}`;

  const galleryItems = (cat.gallery || []).map((src, i) => `
    <figure class="category-gallery__item"
            data-lb-type="image"
            data-lb-src="${src}"
            data-lb-caption="${title}">
      <img loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async"
           src="${src}" alt="${title} — slika ${i + 1}">
    </figure>
  `).join('');

  host.innerHTML = `
    <article class="blog-post category-post">
      <figure class="category-post__hero">
        <img loading="eager" decoding="async" src="${cat.image}" alt="${title}">
        <div class="category-post__hero-overlay" aria-hidden="true"></div>
        <div class="category-post__hero-text">
          <p class="kicker">${kicker}</p>
          <h1 class="heading-display">${title}</h1>
        </div>
      </figure>
      <div class="blog-post__body category-post__body">
        <div class="blog-post__excerpt">${mdInline(excerpt)}</div>
        <div class="blog-post__content">${mdBlock(body)}</div>
      </div>
      ${galleryItems ? `
        <section class="category-gallery" aria-label="Gallery">
          <div class="category-gallery__grid">${galleryItems}</div>
        </section>
      ` : ''}
    </article>
  `;
}

function currentKey() {
  const h = (window.location.hash || '').replace(/^#/, '').toLowerCase();
  // Backward-compat: stari URL #cuba i dalje vodi na Stari svet stranicu.
  if (h === 'cuba') return 'oldworld';
  return h || 'oldworld'; // default
}

async function load() {
  if (data) return;
  try { data = await (await fetch(CATEGORIES_URL)).json(); }
  catch { data = {}; }
}

(async function bootstrap() {
  await initI18n();
  await load();

  const host = document.getElementById('category-root');
  if (!host) return;

  function rerender() {
    renderCategory(host, currentKey());
  }
  rerender();

  initLightbox();

  window.addEventListener('hashchange', rerender);
  onLangChange(rerender);
})();
