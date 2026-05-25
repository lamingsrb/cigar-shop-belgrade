// =======================================================
// Feedback 2026-05-25: zamena generičkih slika branded fotkama
// Folderi → ciljne sekcije:
//   - Humidor (16 + 1 main)  → /assets/humidor/humidor-01..16.webp (replace + extend)
//                              + /assets/gear/humidors-card.webp (Humidori card)
//   - Sekaci (10 + 1 main)   → /assets/gear/cutters-card.webp + /assets/gear/cutters/01..10.webp
//   - Futrole (10 + 1 main)  → /assets/gear/cases-card.webp + /assets/gear/cases/01..11.webp
//   - Pepeljare (2 + 1 main) → /assets/gear/ashtrays-card.webp + /assets/gear/ashtrays/01..02.webp
//   - Alati rituala (1 main) → /assets/gear/gear-ritual.webp (replace)
//   - Nastavi sa pićem       → /assets/spirits/* (spirits-pour, scotch, gin, cognac, rum, rakija)
//                              + rakija-2, rum-2 (additional variations)
//   - Stari/Novi svet (2)    → /assets/categories/cuba.webp (replace)
//                              + /assets/categories/newworld.webp (new)
// Svaki output dobija i thumb varijantu (-thumb.webp).
// =======================================================
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, readdir } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'Feedback_loop', '25-05-2026', 'Media');
const PUB = join(ROOT, 'public', 'assets');

const FULL_W = 1600;
const FULL_Q = 85;
const THUMB_W = 800;
const THUMB_H = 600;
const THUMB_Q = 80;

async function ensureDirs() {
  await mkdir(join(PUB, 'humidor'), { recursive: true });
  await mkdir(join(PUB, 'gear'), { recursive: true });
  await mkdir(join(PUB, 'gear', 'cutters'), { recursive: true });
  await mkdir(join(PUB, 'gear', 'cases'), { recursive: true });
  await mkdir(join(PUB, 'gear', 'ashtrays'), { recursive: true });
  await mkdir(join(PUB, 'spirits'), { recursive: true });
  await mkdir(join(PUB, 'categories'), { recursive: true });
}

// Generic converter: full WebP + thumb WebP iz srcPath -> destDir/destBase.webp + destBase-thumb.webp
async function convert(srcPath, destDir, destBase, { thumbCover = true } = {}) {
  const outFull = join(destDir, `${destBase}.webp`);
  const outThumb = join(destDir, `${destBase}-thumb.webp`);

  await sharp(srcPath)
    .resize({ width: FULL_W, height: FULL_W, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: FULL_Q })
    .toFile(outFull);

  const thumbPipe = sharp(srcPath);
  if (thumbCover) {
    await thumbPipe
      .resize({ width: THUMB_W, height: THUMB_H, fit: 'cover', position: 'center' })
      .webp({ quality: THUMB_Q })
      .toFile(outThumb);
  } else {
    await thumbPipe
      .resize({ width: THUMB_W, height: THUMB_W, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: THUMB_Q })
      .toFile(outThumb);
  }
  return outFull;
}

// Lista numerisanih JPG-ova u folderu, sortirana numerički (1, 2, 10 a ne 1, 10, 2).
async function listNumbered(dir, includeAlpha = false) {
  const files = await readdir(dir);
  return files
    .filter(f => /\.jpe?g$/i.test(f))
    .filter(f => {
      const base = f.replace(/\.jpe?g$/i, '');
      return includeAlpha ? /^\d+[a-z]?$/i.test(base) : /^\d+$/.test(base);
    })
    .sort((a, b) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (na !== nb) return na - nb;
      return a.localeCompare(b);
    });
}

async function processHumidors() {
  // Numerisane fotke (1.jpg..16.jpg minus rupe) → humidor-01..NN.webp
  // Renumerišu se sekvencijalno tako da nema rupa u izlaznim fajlovima.
  const dir = join(SRC, 'Humidor');
  const files = await listNumbered(dir);
  const tasks = files.map((f, i) => {
    const num = String(i + 1).padStart(2, '0');
    return convert(join(dir, f), join(PUB, 'humidor'), `humidor-${num}`);
  });
  // Humidori glavna → /assets/gear/humidors-card.webp (Humidori card)
  tasks.push(convert(join(dir, 'Humidori glavna.jpg'), join(PUB, 'gear'), 'humidors-card'));

  await Promise.all(tasks);
  console.log(`[humidor] ${files.length} images + humidors-card done`);
}

async function processSekaci() {
  const dir = join(SRC, 'Sekaci');
  const files = await listNumbered(dir);
  const tasks = files.map((f, i) => {
    const num = String(i + 1).padStart(2, '0');
    return convert(join(dir, f), join(PUB, 'gear', 'cutters'), num);
  });
  tasks.push(convert(join(dir, 'sekaci glavna.jpg'), join(PUB, 'gear'), 'cutters-card'));
  await Promise.all(tasks);
  console.log(`[sekaci] ${files.length} images + cutters-card done`);
}

async function processFutrole() {
  const dir = join(SRC, 'Futrole');
  // Includes 3a.jpg → sortira se sekvencijalno (1, 2, 3, 3a, 4, ..., 10)
  const files = await listNumbered(dir, true);
  const tasks = files.map((f, i) => {
    const num = String(i + 1).padStart(2, '0');
    return convert(join(dir, f), join(PUB, 'gear', 'cases'), num);
  });
  tasks.push(convert(join(dir, 'futrole glavna.jpg'), join(PUB, 'gear'), 'cases-card'));
  await Promise.all(tasks);
  console.log(`[futrole] ${files.length} images + cases-card done`);
}

async function processPepeljare() {
  // Extracted: 1.jpg, 2.jpg, Piksle glavna.webp
  const dir = join(SRC, 'Pepeljare', 'extracted');
  const tasks = [
    convert(join(dir, '1.jpg'), join(PUB, 'gear', 'ashtrays'), '01'),
    convert(join(dir, '2.jpg'), join(PUB, 'gear', 'ashtrays'), '02'),
    convert(join(dir, 'Piksle glavna.webp'), join(PUB, 'gear'), 'ashtrays-card'),
  ];
  await Promise.all(tasks);
  console.log('[pepeljare] 2 images + ashtrays-card done');
}

async function processAlatiRituala() {
  // Extracted: Oprema glavna slika.jpg → /assets/gear/gear-ritual.webp (replace)
  const src = join(SRC, 'Alati rituala nove slike', 'extracted', 'Oprema glavna slika.jpg');
  await convert(src, join(PUB, 'gear'), 'gear-ritual');
  console.log('[alati] gear-ritual done');
}

async function processNastaviSaPicem() {
  const dir = join(SRC, 'Nastavi sa picem');
  const tasks = [
    // Glavna slika za spirits sekciju
    convert(join(dir, 'glavna nastavi sa picem.jpg'), join(PUB, 'spirits'), 'spirits-pour'),
    // Per-kategorija glavne slike
    convert(join(dir, 'viski.jpg'), join(PUB, 'spirits'), 'scotch'),
    convert(join(dir, 'dzin.jpg'), join(PUB, 'spirits'), 'spirits-process-1-destilacija'),
    convert(join(dir, 'konjak.jpg'), join(PUB, 'spirits'), 'cognac'),
    convert(join(dir, 'rum.jpg'), join(PUB, 'spirits'), 'spirits-process-3-odlezavanje'),
    convert(join(dir, 'rakija.jpg'), join(PUB, 'spirits'), 'rakija'),
    // Dodatne variacije za gallery
    convert(join(dir, 'rum 1.jpg'), join(PUB, 'spirits'), 'rum-2'),
    convert(join(dir, 'rakija 1.jpg'), join(PUB, 'spirits'), 'rakija-2'),
  ];
  await Promise.all(tasks);
  console.log('[spirits] 8 images done');
}

async function processStariNoviSvet() {
  const dir = join(SRC, 'Stari svet i Novi svet', 'extracted');
  const tasks = [
    convert(join(dir, 'STARI SVET.jpg'), join(PUB, 'categories'), 'cuba'),
    convert(join(dir, 'NOVI SVET.jpg'), join(PUB, 'categories'), 'newworld'),
  ];
  await Promise.all(tasks);
  console.log('[regions] cuba + newworld done');
}

async function main() {
  await ensureDirs();
  await Promise.all([
    processHumidors(),
    processSekaci(),
    processFutrole(),
    processPepeljare(),
    processAlatiRituala(),
    processNastaviSaPicem(),
    processStariNoviSvet(),
  ]);
  console.log('\n[feedback 2026-05-25] All tasks complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
