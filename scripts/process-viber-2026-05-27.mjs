// =======================================================
// Feedback 2026-05-27 Viber batch:
// - 8 fotke za sekciju "Godine tišine" (slideshow)
// - 50 slika za "Glavna galerija" (paginated gallery at bottom)
// - burbon.jpg → bourbon.webp card (naslovna za Burbon)
// =======================================================
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, readdir } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VIBER = join(ROOT, 'Feedback_loop', '27-05-2026', 'Media iz vibera');
const PUB = join(ROOT, 'public', 'assets');

const FULL_W = 1600;
const FULL_Q = 85;
const THUMB_W = 800;
const THUMB_H = 600;
const THUMB_Q = 80;

async function convert(srcPath, destDir, destBase) {
  await mkdir(destDir, { recursive: true });
  const outFull = join(destDir, `${destBase}.webp`);
  const outThumb = join(destDir, `${destBase}-thumb.webp`);

  await sharp(srcPath)
    .resize({ width: FULL_W, height: FULL_W, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: FULL_Q })
    .toFile(outFull);

  await sharp(srcPath)
    .resize({ width: THUMB_W, height: THUMB_H, fit: 'cover', position: 'center' })
    .webp({ quality: THUMB_Q })
    .toFile(outThumb);
}

async function batchSequential(srcDir, destDir) {
  const files = (await readdir(srcDir)).filter(f => /\.jpe?g$/i.test(f)).sort();
  await Promise.all(files.map((f, i) => {
    const num = String(i + 1).padStart(2, '0');
    return convert(join(srcDir, f), destDir, num);
  }));
  return files.length;
}

async function main() {
  // 1. Godine tišine slideshow — 8 images
  const godineCount = await batchSequential(
    join(VIBER, 'fotke za sekciju godine uzivanja'),
    join(PUB, 'gallery', 'godine-tisine')
  );
  console.log(`[godine-tisine] ${godineCount} images`);

  // 2. Glavna galerija (paginated) — 50 images
  const galleryCount = await batchSequential(
    join(VIBER, 'Glavna galerija slideshov koji je na dnu stranice'),
    join(PUB, 'gallery', 'main')
  );
  console.log(`[gallery/main] ${galleryCount} images`);

  // 3. Burbon naslovna — burbon.jpg → bourbon.webp (card image)
  const burbonSrc = join(ROOT, 'Feedback_loop', '27-05-2026', 'Media', 'Burbon', 'burbon.jpg');
  await sharp(burbonSrc)
    .resize({ width: FULL_W, height: FULL_W, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: FULL_Q })
    .toFile(join(PUB, 'spirits', 'bourbon.webp'));
  await sharp(burbonSrc)
    .resize({ width: THUMB_W, height: THUMB_H, fit: 'cover', position: 'center' })
    .webp({ quality: THUMB_Q })
    .toFile(join(PUB, 'spirits', 'bourbon-thumb.webp'));
  console.log('[bourbon] card image updated from burbon.jpg');

  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
