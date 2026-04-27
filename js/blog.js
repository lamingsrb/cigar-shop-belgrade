// CIGAR SHOP — Blog showcase (homepage rail) + blog page renderer
import { getLang, onLangChange, t } from './i18n.js';

const BLOG_URL = '/data/blog.json';
let blogData = null;

async function loadBlog() {
  if (blogData) return blogData;
  try { blogData = await (await fetch(BLOG_URL)).json(); }
  catch { blogData = { posts: [] }; }
  return blogData;
}

function renderRail(host) {
  const lang = getLang();
  const posts = (blogData?.posts || []).slice(0, 10);
  host.innerHTML = posts.map((p, i) => `
    <a class="blog-card" href="/blog.html#${p.slug}" data-i="${i}">
      <figure class="blog-card__media">
        <img loading="lazy" decoding="async" src="${p.image}" alt="${lang === 'en' ? p.titleen : p.titlesr}">
      </figure>
      <div class="blog-card__body">
        <span class="blog-card__date">${p.date}</span>
        <h3 class="blog-card__title">${lang === 'en' ? p.titleen : p.titlesr}</h3>
        <p class="blog-card__excerpt">${lang === 'en' ? p.excerpten : p.excerptsr}</p>
        <span class="blog-card__cta" data-i18n="blog.readMore">${t('blog.readMore') || 'Pročitaj →'}</span>
      </div>
    </a>
  `).join('');
}

export async function initBlog() {
  const rail = document.getElementById('blog-rail');
  if (!rail) return;
  await loadBlog();
  renderRail(rail);
  onLangChange(() => renderRail(rail));
}

// =======================================================
// Blog page renderer (used on /blog.html)
// =======================================================
function mdInline(s) {
  // minimal: **bold**, *italic*
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function mdBlock(body) {
  // split paragraphs by double newline; bullets `- x` → <ul>
  const paras = body.split(/\n\n+/);
  return paras.map(p => {
    const lines = p.split(/\n/);
    if (lines.every(l => l.trim().startsWith('- '))) {
      return '<ul>' + lines.map(l => `<li>${mdInline(l.replace(/^\s*-\s+/, ''))}</li>`).join('') + '</ul>';
    }
    return `<p>${mdInline(p)}</p>`;
  }).join('');
}

function renderPosts(host) {
  const lang = getLang();
  const posts = blogData?.posts || [];
  host.innerHTML = posts.map(p => `
    <article class="blog-post" id="${p.slug}">
      <figure class="blog-post__media">
        <img loading="lazy" decoding="async" src="${p.image}" alt="${lang === 'en' ? p.titleen : p.titlesr}">
      </figure>
      <div class="blog-post__body">
        <span class="blog-post__date">${p.date}</span>
        <h2 class="blog-post__title">${lang === 'en' ? p.titleen : p.titlesr}</h2>
        <div class="blog-post__excerpt">${mdInline(lang === 'en' ? p.excerpten : p.excerptsr)}</div>
        <div class="blog-post__content">${mdBlock(lang === 'en' ? p.bodyen : p.bodysr)}</div>
      </div>
    </article>
  `).join('');
}

export async function initBlogPage() {
  const host = document.getElementById('blog-posts');
  if (!host) return;
  await loadBlog();
  renderPosts(host);

  // scroll to anchor if present
  if (window.location.hash) {
    requestAnimationFrame(() => {
      const el = document.querySelector(window.location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  onLangChange(() => renderPosts(host));
}
