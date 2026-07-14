// =======================================================
// Vizuelna verifikacija feedback-a 14-07-2026 (privremena skripta).
// Playwright-core + sistemski Edge: screenshotuje Manifest/Spirits/Gear
// sekcije (desktop 1440 + mobile 390) i Pepeljare detail stranu.
// Očekuje pokrenut `vite preview` na :5175. Output: argv[2] folder.
// =======================================================
import { chromium } from 'playwright-core';

const OUT = process.argv[2] || '.';
const BASE = 'http://localhost:5175';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function shoot(ctx, url, sel, file, fullPage = false) {
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  // Loader overlay + reveal animacije: forsiraj vidljivost za statični snimak
  await page.addStyleTag({ content: `
    .loader, #loader { display: none !important; }
    .reveal { opacity: 1 !important; transform: none !important; }
  `});
  await page.waitForTimeout(2500);
  if (sel) {
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1800); // lazy slike + fade
    await el.screenshot({ path: `${OUT}/${file}` });
  } else {
    await page.screenshot({ path: `${OUT}/${file}`, fullPage });
  }
  await page.close();
  console.log('OK', file);
}

// Desktop 1440
const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await shoot(desktop, `${BASE}/`, '#manifest', 'd-manifest.png');
await shoot(desktop, `${BASE}/`, '#spirits', 'd-spirits.png');
await shoot(desktop, `${BASE}/`, '#gear', 'd-gear.png');
await shoot(desktop, `${BASE}/category.html#ashtrays`, null, 'd-ashtrays.png', true);
await desktop.close();

// Mobile 390 (iPhone-ish)
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  isMobile: true, hasTouch: true,
});
await shoot(mobile, `${BASE}/`, '#manifest', 'm-manifest.png');
await shoot(mobile, `${BASE}/`, '#spirits', 'm-spirits.png');
await shoot(mobile, `${BASE}/`, '#gear', 'm-gear.png');
await mobile.close();

await browser.close();
console.log('DONE');
