// Dijagnostika (privremeno): meri layout + učitanost novih slika na :5175.
import { chromium } from 'playwright-core';

const BASE = 'http://localhost:5175';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function probe(viewport, label) {
  const ctx = await browser.newContext({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(2500);
  const data = await page.evaluate(async () => {
    const out = { boxes: {}, imgs: [] };
    const sels = {
      manifestSlideshow: '.manifest__slideshow',
      manifestSlide1Img: '.manifest__slideshow .media-slideshow__slide img',
      spiritsVitrine: '.spirits__m-vitrine',
      spiritsMedia: '#spirits-media',
      gearMedia: '#gear-media',
    };
    for (const [k, sel] of Object.entries(sels)) {
      const el = document.querySelector(sel);
      if (!el) { out.boxes[k] = 'NOT FOUND'; continue; }
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      out.boxes[k] = { w: Math.round(r.width), h: Math.round(r.height), display: cs.display, visibility: cs.visibility, position: cs.position };
    }
    const urls = [
      '/assets/gallery/ambijent/01.webp', '/assets/gallery/ambijent/05.webp',
      '/assets/spirits/vitrine-01.webp', '/assets/spirits/gin.webp', '/assets/spirits/rum.webp',
      '/assets/gear/cutters-cover.webp', '/assets/gear/cases-cover.webp',
      '/assets/gear/ashtrays/03.webp', '/assets/gear/ashtrays/14.webp',
      '/assets/gallery/ambijent/01-m.webp', '/assets/spirits/gin-m.webp', '/assets/gear/cutters-cover-m.webp',
    ];
    for (const u of urls) {
      try { const res = await fetch(u, { method: 'HEAD' }); out.imgs.push(`${u} → ${res.status}`); }
      catch (e) { out.imgs.push(`${u} → ERR ${e.message}`); }
    }
    // Da li img u manifest slideshow-u ima ucitan bitmap?
    const im = document.querySelector('.manifest__slideshow img');
    out.manifestImg = im ? { currentSrc: im.currentSrc, natural: `${im.naturalWidth}x${im.naturalHeight}`, complete: im.complete } : 'NOT FOUND';
    out.slideCount = document.querySelectorAll('.manifest__slideshow .media-slideshow__slide').length;
    return out;
  });
  console.log(`\n===== ${label} (${viewport.width}px) =====`);
  console.log(JSON.stringify(data, null, 1));
  await ctx.close();
}

await probe({ width: 1440, height: 1000 }, 'DESKTOP');
await probe({ width: 390, height: 844 }, 'MOBILE');
await browser.close();
