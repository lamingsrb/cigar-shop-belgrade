// =======================================================
// Feedback 2026-05-09: process media + recolor logo
// 1. Crop watermark + convert KUBA 9.jpg → /assets/categories/cuba.webp
// 2. Convert PICE 1.jpg → /assets/spirits/spirits-pour.webp (replaces vitrine-01)
// 3. Convert OPREMA 6.jpg → /assets/gear/gear-ritual.webp (replaces vitrine-01)
// 4. Recolor logo monogram from #c9a961-ish gold → #d4af37 champagne
// =======================================================
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, copyFile } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'Feedback_loop', '09-05-2026', 'Media');
const PUB = join(ROOT, 'public', 'assets');

async function ensureDirs() {
  await mkdir(join(PUB, 'categories'), { recursive: true });
  await mkdir(join(PUB, 'spirits'), { recursive: true });
  await mkdir(join(PUB, 'gear'), { recursive: true });
  await mkdir(join(PUB, 'brand'), { recursive: true });
}

async function processKuba() {
  // KUBA 9.jpg has a watermark "BL4 CiGAR Co." in the bottom-left corner.
  // Strategy: crop ~bottom 18% off (text + watermark area), keep the gorgeous cigar-box hero.
  const src = join(SRC, 'KUBA 9.jpg');
  const meta = await sharp(src).metadata();
  const w = meta.width;
  const h = meta.height;

  // KUBA 9.jpg (1080×1350) has:
  //   - Top ~38%: "Not All Cigars Are Created Equal" title + "Some fade, some burn harsh..." subtitle
  //   - Bottom ~22%: "BL4 CiGAR Co." competitor logo + watermark
  // Keep only clean middle portion (the open humidor box of cigars), then center-crop to 16:11 hero ratio.
  const top = Math.round(h * 0.38);
  const cropH = Math.round(h * 0.42);

  const outFull = join(PUB, 'categories', 'cuba.webp');
  const outThumb = join(PUB, 'categories', 'cuba-thumb.webp');

  await sharp(src)
    .extract({ left: 0, top, width: w, height: cropH })
    .resize({ width: 1600, height: 1100, fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile(outFull);

  await sharp(src)
    .extract({ left: 0, top, width: w, height: cropH })
    .resize({ width: 800, height: 600, fit: 'cover', position: 'center' })
    .webp({ quality: 80 })
    .toFile(outThumb);

  console.log('[kuba] Done:', outFull);
}

async function processPice() {
  const src = join(SRC, 'PICE 1.jpg');
  const outFull = join(PUB, 'spirits', 'spirits-pour.webp');
  const outThumb = join(PUB, 'spirits', 'spirits-pour-thumb.webp');

  await sharp(src)
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(outFull);

  await sharp(src)
    .resize({ width: 800, height: 600, fit: 'cover', position: 'center' })
    .webp({ quality: 80 })
    .toFile(outThumb);

  console.log('[pice] Done:', outFull);
}

async function processOprema() {
  const src = join(SRC, 'OPREMA 6.jpg');
  const outFull = join(PUB, 'gear', 'gear-ritual.webp');
  const outThumb = join(PUB, 'gear', 'gear-ritual-thumb.webp');

  await sharp(src)
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(outFull);

  await sharp(src)
    .resize({ width: 800, height: 600, fit: 'cover', position: 'center' })
    .webp({ quality: 80 })
    .toFile(outThumb);

  console.log('[oprema] Done:', outFull);
}

// Recolor a logo PNG from current gold tones → bright champagne #d4af37 (matches hero wordmark).
// We always source from the .original.png backup (set first time we run) so successive runs are idempotent.
async function recolorOne(srcPath, backupPath) {
  // Idempotency: always source from backup if it exists. Otherwise create backup from current src.
  const fs = await import('fs/promises');
  let useSrc = srcPath;
  try {
    await fs.access(backupPath);
    useSrc = backupPath; // backup exists → use it
  } catch {
    // No backup yet — create one from current src
    await fs.copyFile(srcPath, backupPath);
    console.log('[logo] Created backup', backupPath);
  }

  const meta = await sharp(useSrc).metadata();
  const { width, height } = meta;
  const raw = await sharp(useSrc).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const channels = info.channels;
  const out = Buffer.alloc(width * height * 4);

  // Target champagne color (matches hero wordmark `--champagne: #d4af37`)
  // Keep the metallic 3D shading (highlights + shadows) while shifting hue/saturation to champagne.
  // Strategy: convert to HSL, swap H+S to target's, keep original L (clamped).
  const TARGET_H = 45 / 360;   // hue of #d4af37 ≈ 45°
  const TARGET_S = 0.65;        // saturation

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h, s, l];
  }
  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    const a = data[i * channels + 3];

    if (a === 0) {
      out[i * 4] = 0;
      out[i * 4 + 1] = 0;
      out[i * 4 + 2] = 0;
      out[i * 4 + 3] = 0;
      continue;
    }

    const [, , L] = rgbToHsl(r, g, b);
    // Lift mid-tones so the logo reads bright champagne (#d4af37 has L≈0.52).
    // Map original L [0..1] → [0.42..0.78] so the average pixel sits at champagne lightness.
    const Lout = 0.42 + Math.min(1, Math.max(0, L)) * 0.36;
    const [nr, ng, nb] = hslToRgb(TARGET_H, TARGET_S, Lout);

    out[i * 4]     = nr;
    out[i * 4 + 1] = ng;
    out[i * 4 + 2] = nb;
    out[i * 4 + 3] = a;
  }

  return { buffer: out, width, height };
}

async function saveResized(buffer, width, height, outPath, targetH) {
  const img = sharp(buffer, { raw: { width, height, channels: 4 } }).png();
  if (targetH) {
    await img.clone().resize({ height: targetH }).toFile(outPath);
  } else {
    await img.clone().toFile(outPath);
  }
}

async function recolorLogo() {
  // Monogram (used in header + footer)
  const monoSrc = join(PUB, 'brand', 'logo-monogram-gold-512.png');
  const monoBackup = join(PUB, 'brand', 'logo-monogram-gold-512.original.png');
  const mono = await recolorOne(monoSrc, monoBackup);
  await saveResized(mono.buffer, mono.width, mono.height, monoSrc);
  await saveResized(mono.buffer, mono.width, mono.height, join(PUB, 'brand', 'logo-monogram-gold-256.png'), 256);
  await saveResized(mono.buffer, mono.width, mono.height, join(PUB, 'brand', 'logo-monogram-gold-128.png'), 128);
  console.log('[logo] Monogram recolored → #d4af37');

  // Full logo (might be used elsewhere)
  try {
    const fullSrc = join(PUB, 'brand', 'logo.png');
    const fullBackup = join(PUB, 'brand', 'logo.original.png');
    const full = await recolorOne(fullSrc, fullBackup);
    await saveResized(full.buffer, full.width, full.height, fullSrc);
    await saveResized(full.buffer, full.width, full.height, join(PUB, 'brand', 'logo-512.png'), 512);
    await saveResized(full.buffer, full.width, full.height, join(PUB, 'brand', 'logo-256.png'), 256);
    await saveResized(full.buffer, full.width, full.height, join(PUB, 'brand', 'logo-128.png'), 128);
    console.log('[logo] Full logo recolored');
  } catch (e) {
    console.warn('[logo] Full logo skipped:', e.message);
  }
}

async function main() {
  await ensureDirs();
  await Promise.all([
    processKuba(),
    processPice(),
    processOprema(),
    recolorLogo(),
  ]);
  console.log('\n[feedback 2026-05-09] All tasks complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
