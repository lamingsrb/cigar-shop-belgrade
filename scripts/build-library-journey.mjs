// Library "Godine tišine" journey compilation:
//   1) Cigar production process clip
//   2) Cigar process result photos (Ken Burns)
//   3) Spirits/rakija process clip
//   4) Spirits result photos (Ken Burns)
//   5) Final ritual/uživanje clip
//
// Output: public/assets/video/library-journey.mp4 + poster.webp

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, unlink, stat } from 'fs/promises';
import ffmpegPath from 'ffmpeg-static';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VID  = join(ROOT, 'public', 'assets', 'video');
const GAL  = join(ROOT, 'public', 'assets', 'gallery');
const SPI  = join(ROOT, 'public', 'assets', 'spirits');
const TMP  = join(ROOT, 'scripts', '.tmp-journey');

await mkdir(VID, { recursive: true });
await mkdir(TMP, { recursive: true });

const W = 1280, H = 720, FPS = 30;
const XFADE = 0.7;

function run(args, label = 'ffmpeg') {
  return new Promise((resolve, reject) => {
    console.log(`[${label}]`, args.slice(0, 8).join(' '), '...');
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

// Clip a video segment, normalize to W×H, FPS, with optional gentle grade
async function clipVideo(src, outFile, ss, t, grade = true) {
  const filters = [
    `scale=${W}:${H}:force_original_aspect_ratio=increase`,
    `crop=${W}:${H}`,
    `fps=${FPS}`,
  ];
  if (grade) {
    filters.push('eq=brightness=-0.02:contrast=1.06:saturation=1.08');
    filters.push('colorbalance=rs=0.03:gs=-0.01:bs=-0.03');
  }
  await run([
    '-y', '-ss', String(ss), '-i', src,
    '-t', String(t),
    '-vf', filters.join(','),
    '-c:v', 'libx264', '-crf', '22', '-preset', 'medium',
    '-pix_fmt', 'yuv420p', '-an',
    '-movflags', '+faststart',
    outFile
  ], 'clip');
}

// Render a Ken Burns segment from a single image
async function kenBurnsImage(src, outFile, dur, zoom = 'in') {
  const totalFrames = Math.round(dur * FPS);
  let zExpr, xExpr, yExpr;
  if (zoom === 'in')         { zExpr = `'min(zoom+0.0008,1.18)'`;  xExpr = `'iw/2-(iw/zoom/2)'`;            yExpr = `'ih/2-(ih/zoom/2)'`; }
  else if (zoom === 'left')  { zExpr = `'1.15-on*0.0006'`;          xExpr = `'iw*0.32-(iw/zoom/2)+on*0.5'`; yExpr = `'ih/2-(ih/zoom/2)'`; }
  else if (zoom === 'right') { zExpr = `'1.08+on*0.0006'`;          xExpr = `'iw*0.65-(iw/zoom/2)-on*0.4'`; yExpr = `'ih/2-(ih/zoom/2)'`; }
  else                        { zExpr = `'1.10'`;                    xExpr = `'iw/2-(iw/zoom/2)'`;            yExpr = `'ih/2-(ih/zoom/2)'`; }

  // Pre-scale just enough so zoompan doesn't pixelate (1.5x target)
  const vf = [
    `scale=1920:-1:flags=lanczos`,
    `zoompan=z=${zExpr}:x=${xExpr}:y=${yExpr}:d=${totalFrames}:s=${W}x${H}:fps=${FPS}`,
    `eq=brightness=-0.02:contrast=1.07:saturation=1.10`,
    `colorbalance=rs=0.04:gs=-0.01:bs=-0.04`
  ].join(',');

  await run([
    '-y', '-loop', '1', '-framerate', String(FPS), '-i', src,
    '-t', String(dur),
    '-vf', vf,
    '-c:v', 'libx264', '-crf', '22', '-preset', 'medium',
    '-pix_fmt', 'yuv420p', '-an',
    '-movflags', '+faststart',
    outFile
  ], 'kb');
}

// Build segment list
const SEGMENTS = [];

// 1) Cigar production process clip
await clipVideo(join(VID, 'process.mp4'), join(TMP, 'seg-01-cigar-process.mp4'), 0.5, 4.5);
SEGMENTS.push({ file: 'seg-01-cigar-process.mp4', dur: 4.5 });

// 2) Cigar process result photos
const cigarPhotos = [
  { img: join(GAL, 'process-1-plantaza.webp'),     zoom: 'in'    },
  { img: join(GAL, 'process-2-fermentacija.webp'), zoom: 'left'  },
  { img: join(GAL, 'process-3-rolanje.webp'),      zoom: 'right' },
  { img: join(GAL, 'process-4-odlezavanje.webp'),  zoom: 'in'    },
];
const PHOTO_DUR = 2.0;
for (let i = 0; i < cigarPhotos.length; i++) {
  const p = cigarPhotos[i];
  const out = join(TMP, `seg-02-cigar-photo-${i}.mp4`);
  await kenBurnsImage(p.img, out, PHOTO_DUR, p.zoom);
  SEGMENTS.push({ file: `seg-02-cigar-photo-${i}.mp4`, dur: PHOTO_DUR });
}

// 3) Spirits/rakija process clip — segment from middle that shows distillation
await clipVideo(join(VID, 'spirits-process.mp4'), join(TMP, 'seg-03-spirits-process.mp4'), 1.0, 4.5);
SEGMENTS.push({ file: 'seg-03-spirits-process.mp4', dur: 4.5 });

// 4) Spirits result photos
const spiritPhotos = [
  { img: join(SPI, 'spirits-process-1-destilacija.webp'), zoom: 'in'    },
  { img: join(SPI, 'spirits-process-2-destilerija.webp'), zoom: 'left'  },
  { img: join(SPI, 'spirits-process-3-odlezavanje.webp'), zoom: 'right' },
  { img: join(SPI, 'spirits-process-4-selekcija.webp'),   zoom: 'in'    },
];
for (let i = 0; i < spiritPhotos.length; i++) {
  const p = spiritPhotos[i];
  const out = join(TMP, `seg-04-spirit-photo-${i}.mp4`);
  await kenBurnsImage(p.img, out, PHOTO_DUR, p.zoom);
  SEGMENTS.push({ file: `seg-04-spirit-photo-${i}.mp4`, dur: PHOTO_DUR });
}

// 5) Final ritual/uživanje clip — luxurious dark study
const ritualSrc = join(VID, 'ritual.mp4');
let finalSrc;
try { await stat(ritualSrc); finalSrc = ritualSrc; } catch { finalSrc = join(VID, 'hero.mp4'); }
await clipVideo(finalSrc, join(TMP, 'seg-05-final.mp4'), 0.5, 5.5, false);
SEGMENTS.push({ file: 'seg-05-final.mp4', dur: 5.5 });

console.log(`\n[journey] ${SEGMENTS.length} segments — total ${SEGMENTS.reduce((a, s) => a + s.dur, 0).toFixed(1)}s before xfade overlap`);

// Concatenate with xfade transitions
const inputs = [];
for (const s of SEGMENTS) inputs.push('-i', join(TMP, s.file));

let filter = '';
let lastLabel = '[0:v]';
let cumOffset = 0;
for (let i = 1; i < SEGMENTS.length; i++) {
  const offset = cumOffset + SEGMENTS[i - 1].dur - XFADE;
  cumOffset = offset;
  const out = i === SEGMENTS.length - 1 ? '[outv]' : `[v${i}]`;
  filter += `${lastLabel}[${i}:v]xfade=transition=fade:duration=${XFADE}:offset=${offset}${out};`;
  lastLabel = `[v${i}]`;
}

const totalLen = SEGMENTS.reduce((a, s) => a + s.dur, 0) - XFADE * (SEGMENTS.length - 1);
console.log(`[journey] xfade total length: ${totalLen.toFixed(1)}s`);

const finalOut = join(VID, 'library-journey.mp4');
await run([
  '-y', ...inputs,
  '-filter_complex', filter.replace(/;$/, ''),
  '-map', '[outv]',
  '-c:v', 'libx264', '-crf', '21', '-preset', 'slow',
  '-pix_fmt', 'yuv420p', '-an',
  '-movflags', '+faststart',
  finalOut
], 'concat');

// Generate poster from middle of journey
const posterOut = join(VID, 'library-journey-poster.webp');
await run([
  '-y', '-ss', String(totalLen / 2), '-i', finalOut,
  '-frames:v', '1',
  posterOut
], 'poster');

const finalStat = await stat(finalOut);
console.log(`\n[journey] OK — ${finalOut} (${(finalStat.size / 1024 / 1024).toFixed(2)} MB)`);
console.log(`[journey] poster: ${posterOut}`);
