// Ekstrahuje logo iz "CIGAR SHOP - lOGO.pdf" → public/assets/brand/
// Output: logo.png (transparent, trimmed), logo-512.png, logo-256.png, favicon.svg template
import { pdf } from 'pdf-to-img';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PDF_PATH = join(ROOT, 'Media RAW', 'CIGAR SHOP - lOGO.pdf');
const OUT_DIR = join(ROOT, 'public', 'assets', 'brand');

await mkdir(OUT_DIR, { recursive: true });

console.log('[logo] Rendering PDF page 1 at 600 DPI...');
const document = await pdf(PDF_PATH, { scale: 8 }); // ~600 DPI equivalent
let pageIndex = 0;
for await (const image of document) {
  pageIndex++;
  if (pageIndex > 1) break; // samo prva strana
  const rawPath = join(OUT_DIR, 'logo-raw.png');
  await writeFile(rawPath, image);
  console.log('[logo] Raw render saved:', rawPath);

  // Original PDF ima crnu pozadinu → trebamo da je uklonimo
  // Sharp: učitaj, ekstrahuj alpha koji je inverz luminanse (crna → providno)
  const img = sharp(image);
  const meta = await img.metadata();
  console.log(`[logo] Raw dimensions: ${meta.width}x${meta.height}`);

  // Strategy: pretvori crnu pozadinu u alpha.
  // Koristimo extractChannel + ekstrakcija luminance kao alpha mask.
  // Pristup: invertuj crnu u belu sa threshold-om, koristi kao mask.
  const raw = await sharp(image).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const { width, height, channels } = info;
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    // Luminanca kao proxy za "koliko je blizu crnoj"
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // Crna (lum < 24) → potpuno providno. Ina\u010de: zadr\u017ei originalnu boju + alpha proporcionalan luminanci.
    const alpha = lum < 24 ? 0 : Math.min(255, Math.round(lum * 1.15));
    pixels[i * 4] = r;
    pixels[i * 4 + 1] = g;
    pixels[i * 4 + 2] = b;
    pixels[i * 4 + 3] = alpha;
  }

  const trimmed = sharp(pixels, { raw: { width, height, channels: 4 } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 });

  const logoPath = join(OUT_DIR, 'logo.png');
  await trimmed.clone().toFile(logoPath);
  console.log('[logo] Transparent logo saved:', logoPath);

  // Resize varijante
  const meta2 = await sharp(logoPath).metadata();
  console.log(`[logo] Trimmed dimensions: ${meta2.width}x${meta2.height}`);

  await sharp(logoPath).resize({ height: 512 }).toFile(join(OUT_DIR, 'logo-512.png'));
  await sharp(logoPath).resize({ height: 256 }).toFile(join(OUT_DIR, 'logo-256.png'));
  await sharp(logoPath).resize({ height: 128 }).toFile(join(OUT_DIR, 'logo-128.png'));
  console.log('[logo] 512/256/128 variants saved.');

  // Paleta: top 5 dominant colors
  const stats = await sharp(logoPath).stats();
  console.log('[logo] Dominant channel means:', stats.channels.map(c => c.mean.toFixed(0)));
}

console.log('[logo] Done.');
