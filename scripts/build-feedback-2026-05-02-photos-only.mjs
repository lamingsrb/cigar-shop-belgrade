// Pure-sharp photo processor — no ffmpeg.
// Processes humidor (10), spirits vitrine (3), gear vitrine (3).
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC  = join(ROOT, 'Feedback_loop', '02-05-2026', 'Media');
const SRC_KC = join(SRC, 'Kubanske_cigare_unzipped');
const OUT_HUMIDOR = join(ROOT, 'public', 'assets', 'humidor');
const OUT_SPIRITS = join(ROOT, 'public', 'assets', 'spirits');
const OUT_GEAR    = join(ROOT, 'public', 'assets', 'gear');

for (const d of [OUT_HUMIDOR, OUT_SPIRITS, OUT_GEAR]) {
  await mkdir(d, { recursive: true });
}

// HUMIDOR — 10 product photos
{
  const sources = [];
  for (let i = 1; i <= 9; i++) sources.push({ src: join(SRC_KC, `${i}.jpg`), idx: i });
  sources.push({ src: join(SRC_KC, 'CIGAR HJUMIDOR I SKLOPIVA PEPELJARA.jpg'), idx: 10 });
  for (const { src, idx } of sources) {
    const out = join(OUT_HUMIDOR, `humidor-${String(idx).padStart(2, '0')}.webp`);
    await sharp(src)
      .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(out);
    await sharp(src)
      .resize({ width: 700, height: 525, fit: 'cover' })
      .webp({ quality: 78 })
      .toFile(join(OUT_HUMIDOR, `humidor-${String(idx).padStart(2, '0')}-thumb.webp`));
    console.log(`[humidor] ${idx}/10 OK`);
  }
}

// SPIRITS VITRINE
{
  const map = [
    { in: 'Pica 1.jpg', out: 'vitrine-01.webp' },
    { in: 'pica 2.jpg', out: 'vitrine-02.webp' },
    { in: 'pica 3.jpg', out: 'vitrine-03.webp' }
  ];
  for (const { in: i, out } of map) {
    await sharp(join(SRC, i))
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(join(OUT_SPIRITS, out));
    console.log(`[spirits-vitrine] ${out} OK`);
  }
}

// GEAR VITRINE
{
  const map = [
    { in: 'alati rituala 1.jpg', out: 'vitrine-01.webp' },
    { in: 'alati rituala 2.jpg', out: 'vitrine-02.webp' },
    { in: 'alati rituala 3.jpg', out: 'vitrine-03.webp' }
  ];
  for (const { in: i, out } of map) {
    await sharp(join(SRC, i))
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(join(OUT_GEAR, out));
    console.log(`[gear-vitrine] ${out} OK`);
  }
}

// Manifest poster — extract a frame from the JPEG fallback (use existing slide2-poster as placeholder)
// Skip: manifest video can use no poster — browser will show first frame.

console.log('[photos-only] Done.');
