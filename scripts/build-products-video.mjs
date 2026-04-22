// Compile a Ken-Burns product showcase video from gallery stills
// for Hero Slide B. 1920x1080, CRF 20, smooth xfade transitions.
// Output: public/assets/video/products.{mp4,webm} + poster.
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, unlink, stat } from 'fs/promises';
import ffmpegPath from 'ffmpeg-static';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GAL  = join(ROOT, 'public', 'assets', 'gallery');
const OUT  = join(ROOT, 'public', 'assets', 'video');
const TMP  = join(ROOT, 'scripts', '.tmp-products');

await mkdir(OUT, { recursive: true });
await mkdir(TMP, { recursive: true });

function run(args, label = 'ffmpeg') {
  return new Promise((resolve, reject) => {
    console.log(`[${label}]`, 'ffmpeg', args.slice(0, 6).join(' '), '...');
    const p = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    p.stderr.on('data', d => { err += d.toString(); });
    p.on('close', code => {
      if (code === 0) return resolve();
      console.error(err.slice(-2000));
      reject(new Error(`${label} exit ${code}`));
    });
  });
}

// Curated showcase sequence — 10 products @ 3.2s each, 6 xfade transitions = ~28s loop.
// Koristi poznate beauty-shot slike iz galerije.
const SHOTS = [
  { img: 'img-020.webp', zoom: 'in'   },  // Cuban trio display
  { img: 'img-004.webp', zoom: 'left' },  // Bolivar Habana
  { img: 'img-003.webp', zoom: 'in'   },  // Montecristo
  { img: 'img-001.webp', zoom: 'right'},  // Romeo y Julieta
  { img: 'img-030.webp', zoom: 'in'   },  // Pasión
  { img: 'img-010.webp', zoom: 'left' },  // Julius Caesar
  { img: 'img-017.webp', zoom: 'in'   },  // Salomones
  { img: 'img-040.webp', zoom: 'right'},  // Joya Cabinetta
  { img: 'img-007.webp', zoom: 'in'   },  // Diplomatico rum
  { img: 'img-034.webp', zoom: 'left' }   // Gran Parador
];

const SEG_DUR = 3.2;
const XFADE_DUR = 0.9;
const W = 1280, H = 720;
const FPS = 30;

// Render svaki shot kao kratak Ken-Burns mp4. Zoompan u ffmpeg-u prima zoom/x/y po frame-u.
const processed = [];
for (let i = 0; i < SHOTS.length; i++) {
  const { img, zoom } = SHOTS[i];
  const src = join(GAL, img);
  const out = join(TMP, `seg${i}.mp4`);
  const totalFrames = Math.round(SEG_DUR * FPS);

  // Ken Burns motion profile
  let zExpr, xExpr, yExpr;
  if (zoom === 'in')    { zExpr = `'min(zoom+0.0009,1.18)'`;  xExpr = `'iw/2-(iw/zoom/2)'`;           yExpr = `'ih/2-(ih/zoom/2)'`; }
  else if (zoom === 'left')  { zExpr = `'1.15-on*0.0007'`;   xExpr = `'iw*0.3-(iw/zoom/2)+on*0.5'`; yExpr = `'ih/2-(ih/zoom/2)'`; }
  else if (zoom === 'right') { zExpr = `'1.08+on*0.0006'`;   xExpr = `'iw*0.65-(iw/zoom/2)-on*0.4'`;yExpr = `'ih/2-(ih/zoom/2)'`; }
  else                       { zExpr = `'1.10'`;              xExpr = `'iw/2-(iw/zoom/2)'`;          yExpr = `'ih/2-(ih/zoom/2)'`; }

  // scale dobro input + zoompan + warmth grade
  const vf = [
    `scale=4000:-1`,  // upscale da zoompan ne pixelira
    `zoompan=z=${zExpr}:x=${xExpr}:y=${yExpr}:d=${totalFrames}:s=${W}x${H}:fps=${FPS}`,
    `eq=brightness=-0.03:contrast=1.08:saturation=1.12`,
    `colorbalance=rs=0.04:gs=-0.01:bs=-0.04`
  ].join(',');

  await run([
    '-y', '-loop', '1', '-framerate', String(FPS), '-i', src,
    '-t', String(SEG_DUR),
    '-vf', vf,
    '-c:v', 'libx264', '-crf', '22', '-preset', 'medium',
    '-pix_fmt', 'yuv420p',
    out
  ], `ken-burns-${i}`);
  processed.push(out);
}

// Concat sa xfade-ovima (mod of dissolve, fade, smoothleft, slideright, circleopen)
const XFADE_TYPES = ['fade', 'dissolve', 'circleopen', 'smoothleft', 'fadewhite'];
let filter = '';
let accum = 0;
let lastLabel = '[0:v]';
for (let i = 1; i < SHOTS.length; i++) {
  accum += SEG_DUR - XFADE_DUR;
  const trans = XFADE_TYPES[(i - 1) % XFADE_TYPES.length];
  const newLabel = i === SHOTS.length - 1 ? '[v]' : `[v${i}]`;
  filter += `${lastLabel}[${i}:v]xfade=transition=${trans}:duration=${XFADE_DUR}:offset=${accum.toFixed(3)}${newLabel};`;
  lastLabel = newLabel;
}
filter = filter.slice(0, -1);

const inputs = [];
processed.forEach(p => { inputs.push('-i', p); });

const mp4 = join(OUT, 'products.mp4');
await run([
  '-y', ...inputs,
  '-filter_complex', filter,
  '-map', '[v]',
  '-c:v', 'libx264', '-crf', '22', '-preset', 'medium',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  mp4
], 'concat-products');

const webm = join(OUT, 'products.webm');
await run([
  '-y', '-i', mp4,
  '-c:v', 'libvpx-vp9', '-crf', '28', '-b:v', '0',
  '-deadline', 'good', '-cpu-used', '2',
  '-an',
  webm
], 'products-webm');

const poster = join(OUT, 'products-poster.webp');
await run([
  '-y', '-i', mp4, '-ss', '0.3',
  '-frames:v', '1',
  '-c:v', 'libwebp', '-quality', '80',
  poster
], 'products-poster');

const [m, w, p] = await Promise.all([stat(mp4), stat(webm), stat(poster)]);
console.log('[products] Done!');
console.log(`  products.mp4:  ${(m.size/1e6).toFixed(2)} MB`);
console.log(`  products.webm: ${(w.size/1e6).toFixed(2)} MB`);
console.log(`  products-poster.webp: ${(p.size/1024).toFixed(1)} KB`);

for (const f of processed) { try { await unlink(f); } catch {} }
