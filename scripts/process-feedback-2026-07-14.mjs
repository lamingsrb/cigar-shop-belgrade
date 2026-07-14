// =======================================================
// Feedback 14-07-2026 (Anini mejlovi od 06.07) — procesiranje novih slika:
// - CS/1_1..3_1  → spirits/vitrine-01..03 (prave fotke vitrina pića, zamena Viber snimaka)
// - CS/4_1..8_1  → gallery/ambijent/01..05 (Manifest "Ambijent radnji" slideshow)
// - Naslovna/e   → spirits/gin.webp  (prava naslovna umesto placeholder destilacije)
// - Naslovna/a   → spirits/rum.webp  (prava naslovna umesto placeholder buradi)
// - Naslovna/"X glavna 1x1" → gear/X-cover.webp (kvadratne naslovne kartica)
// - CS/1..12     → gear/ashtrays/03..14 (product fotke pepeljara za detail galeriju)
//
// Output: full-size (recompress q82, cap 1600w) + {basename}-m.webp (768w q78).
// =======================================================
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, stat } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'Feedback_loop', '14-07-2026', 'Media');
const PUB = join(ROOT, 'public', 'assets');

const FULL_Q = 82;
const FULL_MAX_W = 1600;
const MOBILE_W = 768;
const MOBILE_Q = 78;

const JOBS = [
  // Spirits — vitrine pića (zamena in-place, ista imena → bez HTML izmena)
  ['CS/1_1.webp', 'spirits/vitrine-01.webp'],
  ['CS/2_1.webp', 'spirits/vitrine-02.webp'],
  ['CS/3_1.webp', 'spirits/vitrine-03.webp'],
  // Manifest — ambijent radnji
  ['CS/4_1.webp', 'gallery/ambijent/01.webp'],
  ['CS/7_1.webp', 'gallery/ambijent/02.webp'],
  ['CS/8_1.webp', 'gallery/ambijent/03.webp'],
  ['CS/5_1.webp', 'gallery/ambijent/04.webp'],
  ['CS/6_1.webp', 'gallery/ambijent/05.webp'],
  // Spirits — nove naslovne za kategorije koje su imale placeholder
  ['Naslovna slika/e.webp', 'spirits/gin.webp'],
  ['Naslovna slika/a.webp', 'spirits/rum.webp'],
  // Gear — kvadratne 1x1 naslovne kartica (novi -cover fajlovi)
  ['Naslovna slika/sekaci glavna 1x1.webp', 'gear/cutters-cover.webp'],
  ['Naslovna slika/Upaljaci glavna 1x1.webp', 'gear/lighters-cover.webp'],
  ['Naslovna slika/Humidori glavna 1x1.webp', 'gear/humidors-cover.webp'],
  ['Naslovna slika/Piksle glavna 1x1.webp', 'gear/ashtrays-cover.webp'],
  ['Naslovna slika/Futrole glavna 1x1.webp', 'gear/cases-cover.webp'],
  // Pepeljare — product galerija (01 i 02 već postoje od ranije)
  ...Array.from({ length: 12 }, (_, i) =>
    [`CS/${i + 1}.webp`, `gear/ashtrays/${String(i + 3).padStart(2, '0')}.webp`]),
];

let done = 0;
for (const [src, dest] of JOBS) {
  const srcPath = join(SRC, src);
  const destPath = join(PUB, dest);
  await mkdir(dirname(destPath), { recursive: true });

  const meta = await sharp(srcPath).metadata();
  await sharp(srcPath)
    .resize({ width: FULL_MAX_W, withoutEnlargement: true })
    .webp({ quality: FULL_Q })
    .toFile(destPath);

  const mPath = destPath.replace(/\.webp$/, '-m.webp');
  await sharp(srcPath)
    .resize({ width: MOBILE_W, withoutEnlargement: true })
    .webp({ quality: MOBILE_Q })
    .toFile(mPath);

  const s = await stat(destPath);
  const sm = await stat(mPath);
  console.log(`${src.padEnd(42)} → ${dest.padEnd(32)} ${meta.width}x${meta.height}  full ${(s.size / 1024).toFixed(0)}KB  -m ${(sm.size / 1024).toFixed(0)}KB`);
  done++;
}
console.log(`\n[feedback-14-07] ${done}/${JOBS.length} slika procesirano.`);
