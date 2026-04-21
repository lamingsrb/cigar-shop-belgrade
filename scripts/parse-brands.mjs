// Parse Excel tabele (SPISAK CIGARA.xlsx + SPISAK PI\u0106A.xlsx) \u2192 brands.json
// Grupi\u0161e proizvode po brendu, detektuje regiju iz sheet imena.
// Output: public/data/brands.json sa strukturom:
//   { cigars: { cuba: [{ brand, name, count }], dominican: [...], ... }, spirits: { whisky: [...], ... } }
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RAW_DIR = join(ROOT, 'Media RAW');
const OUT_DIR = join(ROOT, 'public', 'data');

await mkdir(OUT_DIR, { recursive: true });

// Mapping sheet name \u2192 normalized region key (cigars)
const CIGAR_REGION_MAP = {
  'KUBA':       'cuba',
  'DOMINIKANA': 'dominican',
  'NIKARAGVA':  'nicaragua',
  'HONDURAS':   'honduras',
  'KOSTARIKA':  'costa',
  'MEKSIKO':    'mexico',
  'ITALIJA':    'italy'
};

// Mapping sheet name \u2192 spirit category
const SPIRIT_CAT_MAP = {
  'VISKI':  'whisky',
  'BURBON': 'bourbon',
  'KONJAK': 'cognac',
  'D\u017dIN':   'gin',
  'DŽIN':   'gin',
  'RUM':    'rum',
  'VOTKA':  'vodka',
  'RAKIJE': 'rakija',
  'VINO':   'wine'
};

function extractBrand(name) {
  if (!name || typeof name !== 'string') return null;
  // Poku\u0161aj: prva 1-3 re\u010di (pre broja ili dash-a) = brand
  const cleaned = name.trim().replace(/\s+/g, ' ');
  // Split by first digit or dash \u2014 pre-digit = brand name usually
  const match = cleaned.match(/^([^\d\-\(]+)/);
  if (!match) return cleaned;
  return match[1].trim();
}

async function parseWorkbook(path, sheetMap) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path);
  const groups = {};
  for (const sheetName of Object.keys(sheetMap)) {
    const sheet = wb.getWorksheet(sheetName);
    if (!sheet) continue;
    const categoryKey = sheetMap[sheetName];
    const items = [];
    sheet.eachRow((row, rn) => {
      if (rn === 1) return; // header
      // Uzimamo prvu ne-praznu \u0107eliju kao ime proizvoda
      let productName = null;
      row.eachCell({ includeEmpty: false }, (cell) => {
        if (productName) return;
        const v = cell.value;
        if (typeof v === 'string' && v.trim()) productName = v.trim();
        else if (v && typeof v === 'object' && v.text) productName = String(v.text).trim();
      });
      if (!productName) return;
      const brand = extractBrand(productName);
      if (!brand) return;
      items.push({ product: productName, brand });
    });
    // Grupiraj po brendu
    const byBrand = {};
    for (const it of items) {
      if (!byBrand[it.brand]) byBrand[it.brand] = { brand: it.brand, count: 0, samples: [] };
      byBrand[it.brand].count++;
      if (byBrand[it.brand].samples.length < 3) byBrand[it.brand].samples.push(it.product);
    }
    groups[categoryKey] = {
      sheet: sheetName,
      totalItems: items.length,
      brands: Object.values(byBrand).sort((a, b) => b.count - a.count)
    };
    console.log(`[brands] ${sheetName} (${categoryKey}): ${items.length} items, ${Object.keys(byBrand).length} unique brands`);
  }
  return groups;
}

const cigars = await parseWorkbook(join(RAW_DIR, 'SPISAK CIGARA.xlsx'), CIGAR_REGION_MAP);
const spirits = await parseWorkbook(join(RAW_DIR, 'SPISAK PI\u0106A.xlsx'), SPIRIT_CAT_MAP);

const out = { cigars, spirits, generatedAt: new Date().toISOString() };
await writeFile(join(OUT_DIR, 'brands.json'), JSON.stringify(out, null, 2));

// Stats
let totalBrands = 0;
for (const cat of Object.values(cigars)) totalBrands += cat.brands.length;
for (const cat of Object.values(spirits)) totalBrands += cat.brands.length;
console.log(`[brands] Total unique brand entries: ${totalBrands}`);
console.log('[brands] Written to public/data/brands.json');
