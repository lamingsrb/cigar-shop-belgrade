// =======================================================
// Feedback 2026-05-27: nove slike (Anin email batch od 26-05)
// Cilj: PROŠIRENJE galerija u kategorijama (Stari/Novi svet + 6 pića),
// + 4 portret slike za blog post-ove (Kolumbo, Castro, Čerčil, Kenedi).
// Bez izmene layout-a. Card slike (cuba.webp, newworld.webp, scotch.webp,
// rakija.webp, cognac.webp, itd) iz 25-05 feedback-a OSTAJU.
// =======================================================
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, readdir } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'Feedback_loop', '27-05-2026', 'Media');
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

// Sortira po brojnoj komponenti naziva: 1.jpg, 2.jpg, 3a.jpg, 10.jpg, ...
function naturalSort(files) {
  return files.slice().sort((a, b) => {
    const na = parseInt(a, 10), nb = parseInt(b, 10);
    if (na !== nb) return na - nb;
    return a.localeCompare(b);
  });
}

// Konvertuje sve numerisane JPG-ove u src folderu i izlaže ih u sekvencijalnim
// imenima 01.webp, 02.webp, ... u destDir.
async function batchSequential(srcDir, destDir) {
  const files = (await readdir(srcDir)).filter(f => /\.jpe?g$/i.test(f));
  const sorted = naturalSort(files);
  await Promise.all(sorted.map((f, i) => {
    const num = String(i + 1).padStart(2, '0');
    return convert(join(srcDir, f), destDir, num);
  }));
  return sorted;
}

async function processCigarRegions() {
  // Stari svet — 23 → /assets/categories/oldworld/01..23.webp
  const oldFiles = await batchSequential(join(SRC, 'StariSvet'), join(PUB, 'categories', 'oldworld'));
  console.log(`[oldworld] ${oldFiles.length} images`);
  // Novi svet — 28 → /assets/categories/newworld/01..28.webp
  const newFiles = await batchSequential(join(SRC, 'NoviSvet'), join(PUB, 'categories', 'newworld'));
  console.log(`[newworld] ${newFiles.length} images`);
}

async function processSpirits() {
  const map = [
    ['Viski',  'viski'],
    ['Konjak', 'konjak'],
    ['Dzin',   'dzin'],
    ['Rakija', 'rakija'],
    ['Burbon', 'burbon'],
    ['Rum',    'rum'],
  ];
  for (const [src, dest] of map) {
    const files = await batchSequential(join(SRC, src), join(PUB, 'spirits', dest));
    console.log(`[spirits/${dest}] ${files.length} images`);
  }
}

// Izabere najveću sliku po pixel area iz src foldera i izvuče je kao destBase.webp.
async function pickLargestAs(srcDir, destDir, destBase) {
  const files = (await readdir(srcDir)).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  if (!files.length) throw new Error(`No source files in ${srcDir}`);

  const sizes = await Promise.all(files.map(async f => {
    const m = await sharp(join(srcDir, f)).metadata();
    return { f, area: (m.width || 0) * (m.height || 0) };
  }));
  sizes.sort((a, b) => b.area - a.area);
  const best = sizes[0].f;
  await convert(join(srcDir, best), destDir, destBase);
  return best;
}

async function processBlogPortraits() {
  const map = [
    ['Kolumbo',      'kolumbo'],
    ['Fidel Castro', 'castro'],
    ['Cercil',       'churchill'],
    ['Kenedi',       'kennedy'],
  ];
  for (const [src, dest] of map) {
    const picked = await pickLargestAs(join(SRC, src), join(PUB, 'blog'), dest);
    console.log(`[blog/${dest}] picked ${picked}`);
  }
}

async function main() {
  await Promise.all([
    processCigarRegions(),
    processSpirits(),
    processBlogPortraits(),
  ]);
  console.log('\n[feedback 2026-05-27] All tasks complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
