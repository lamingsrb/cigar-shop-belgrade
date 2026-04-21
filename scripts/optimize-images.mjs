// Konvertuje 63 JPG slike iz Media RAW/Images and Videos/ u WebP (full + thumb).
// Output: public/assets/gallery/{name}.webp (1600px) + {name}-thumb.webp (600px)
// Takodje generi\u0161e public/data/gallery-manifest.json sa listom svih slika.
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';
import { mkdir, readdir, writeFile, stat } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_DIR = join(ROOT, 'Media RAW', 'Images and Videos');
const OUT_DIR = join(ROOT, 'public', 'assets', 'gallery');
const DATA_DIR = join(ROOT, 'public', 'data');

await mkdir(OUT_DIR, { recursive: true });
await mkdir(DATA_DIR, { recursive: true });

const files = (await readdir(SRC_DIR)).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
console.log(`[images] Found ${files.length} source images`);

const manifest = [];

for (let i = 0; i < files.length; i++) {
  const src = join(SRC_DIR, files[i]);
  // Normalizovano ime: img-001.webp, img-002.webp, ...
  const name = `img-${String(i + 1).padStart(3, '0')}`;
  const outFull = join(OUT_DIR, `${name}.webp`);
  const outThumb = join(OUT_DIR, `${name}-thumb.webp`);

  const meta = await sharp(src).metadata();
  const isPortrait = (meta.height || 0) > (meta.width || 0);

  // Full: max 1600 dugu\u017eu dimenziju, quality 82
  await sharp(src)
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(outFull);

  // Thumb: 600 \u0161iroki (za masonry carousel), portrait-aware
  await sharp(src)
    .resize({ width: 600, height: 450, fit: 'cover' })
    .webp({ quality: 78 })
    .toFile(outThumb);

  const fullSize = (await stat(outFull)).size;
  const thumbSize = (await stat(outThumb)).size;

  manifest.push({
    name,
    src: `/assets/gallery/${name}.webp`,
    thumb: `/assets/gallery/${name}-thumb.webp`,
    width: meta.width,
    height: meta.height,
    portrait: isPortrait,
    origName: files[i]
  });

  if ((i + 1) % 10 === 0 || i === files.length - 1) {
    console.log(`[images] ${i + 1}/${files.length} processed`);
  }
}

await writeFile(join(DATA_DIR, 'gallery-manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`[images] Manifest saved. Total images: ${manifest.length}`);

// Stats
const totalFullSize = manifest.reduce((a, m, i) => a, 0);
console.log('[images] Done.');
