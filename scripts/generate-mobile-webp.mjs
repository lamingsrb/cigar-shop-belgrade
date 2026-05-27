// =======================================================
// Generiše mobile-friendly WebP varijantu (768w, aspect preserved)
// za sve velike slike koje se mogu pojaviti na mobile-u:
// - /assets/gallery/main/01..50.webp → 01-m.webp ... 50-m.webp
// - /assets/categories/*.webp + oldworld/* + newworld/* (galerije)
// - /assets/spirits/*.webp + viski/* konjak/* itd
// - /assets/gear/*-card.webp + cutters/* lighters/* ...
// - /assets/humidor/humidor-*.webp
//
// Output: {basename}-m.webp pored postojećih full-size fajlova.
// Skip ako mobile varijanta već postoji ili ako source < 1000w (već je mala).
// =======================================================
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';
import { readdir, stat } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUB = join(ROOT, 'public', 'assets');

const MOBILE_W = 768;
const MOBILE_Q = 78;
const SKIP_BELOW_W = 1000;

// Folderi koji imaju kandidate za mobile varijantu
const TARGETS = [
  'gallery/main',
  'gallery/godine-tisine',
  'categories',
  'categories/oldworld',
  'categories/newworld',
  'spirits',
  'spirits/viski',
  'spirits/konjak',
  'spirits/dzin',
  'spirits/rakija',
  'spirits/burbon',
  'spirits/rum',
  'gear',
  'gear/cutters',
  'gear/lighters',
  'gear/cases',
  'gear/ashtrays',
  'humidor',
  'blog',
];

async function processFile(srcPath, destPath) {
  const meta = await sharp(srcPath).metadata();
  if ((meta.width || 0) < SKIP_BELOW_W) return null; // small enough
  await sharp(srcPath)
    .resize({ width: MOBILE_W, withoutEnlargement: true })
    .webp({ quality: MOBILE_Q })
    .toFile(destPath);
  const s = await stat(destPath);
  return s.size;
}

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

let totalGen = 0;
let totalBytes = 0;

for (const folder of TARGETS) {
  const dir = join(PUB, folder);
  let files;
  try {
    files = await readdir(dir);
  } catch { continue; }

  // Samo .webp koji NISU vec mobile varijante (-m.webp) ili thumb-ovi (-thumb.webp)
  const sources = files.filter(f =>
    /\.webp$/.test(f) &&
    !f.endsWith('-m.webp') &&
    !f.endsWith('-thumb.webp')
  );

  for (const f of sources) {
    const srcPath = join(dir, f);
    const destPath = join(dir, f.replace(/\.webp$/, '-m.webp'));
    if (await exists(destPath)) continue; // već generisano
    try {
      const bytes = await processFile(srcPath, destPath);
      if (bytes !== null) {
        totalGen++;
        totalBytes += bytes;
      }
    } catch (e) {
      console.error(`  ✗ ${folder}/${f}: ${e.message}`);
    }
  }
  process.stdout.write(`  ${folder}: done\n`);
}

console.log(`\n[mobile-webp] Generated ${totalGen} variants (${(totalBytes / 1024 / 1024).toFixed(1)} MB total)`);
