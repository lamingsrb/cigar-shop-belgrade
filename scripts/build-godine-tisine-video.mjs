// Build "Godine tišine" compilation video — 30s narrative loop:
// 1) Plantaža + fabrika (library-journey.mp4 segments)
// 2) Cigare (products.mp4 segment)
// 3) Destilerija (spirits-process.mp4 segment)
// 4) Finalni ritual (ritual.mp4 segment)
// Output: public/assets/video/godine-tisine.mp4 + poster
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, unlink, stat } from 'fs/promises';
import ffmpegPath from 'ffmpeg-static';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VIDEO = join(ROOT, 'public', 'assets', 'video');
const TMP = join(ROOT, 'scripts', '.tmp-godine');

await mkdir(TMP, { recursive: true });

function run(args, label = 'ffmpeg') {
  return new Promise((resolve, reject) => {
    console.log(`[${label}] starting`);
    const p = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    p.stdout.on('data', () => {});
    let err = '';
    p.stderr.on('data', d => { err += d.toString(); if (err.length > 50000) err = err.slice(-50000); });
    p.on('close', code => code === 0 ? (console.log(`[${label}] OK`), resolve()) : (console.error(`[${label}] EXIT ${code}\n${err.slice(-1500)}`), reject(new Error(`${label} ${code}`))));
    p.on('error', reject);
  });
}

// Segments — extract + normalize to 854x480, no audio, 30 fps
const SEGMENTS = [
  { src: join(VIDEO, 'library-journey.mp4'),  start: 0,  dur: 8, label: 'plantaza-fabrika' },
  { src: join(VIDEO, 'products.mp4'),          start: 2,  dur: 6, label: 'cigare' },
  { src: join(VIDEO, 'spirits-process.mp4'),   start: 2,  dur: 6, label: 'destilerija' },
  { src: join(VIDEO, 'ritual.mp4'),            start: 2,  dur: 7, label: 'ritual' },
];

const processed = [];
for (let i = 0; i < SEGMENTS.length; i++) {
  const s = SEGMENTS[i];
  const out = join(TMP, `seg${i}.mp4`);
  const vf = [
    'scale=854:480:flags=lanczos:force_original_aspect_ratio=increase',
    'crop=854:480',
    'setsar=1',
    'fps=30',
    'eq=brightness=-0.02:contrast=1.06:saturation=1.05'
  ].join(',');
  await run([
    '-y', '-ss', String(s.start), '-i', s.src, '-t', String(s.dur),
    '-vf', vf,
    '-an',
    '-c:v', 'libx264', '-crf', '23', '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    out
  ], `seg-${s.label}`);
  processed.push(out);
}

// Concat with xfade — smooth crossfade transitions
const XFADE = 0.7;
const TYPES = ['fade', 'dissolve', 'circleopen', 'fade'];
let filter = '';
let accum = 0;
let last = '[0:v]';
for (let i = 1; i < SEGMENTS.length; i++) {
  accum += SEGMENTS[i - 1].dur - XFADE;
  const tr = TYPES[(i - 1) % TYPES.length];
  const lbl = i === SEGMENTS.length - 1 ? '[v]' : `[v${i}]`;
  filter += `${last}[${i}:v]xfade=transition=${tr}:duration=${XFADE}:offset=${accum.toFixed(3)}${lbl};`;
  last = lbl;
}
filter = filter.slice(0, -1);

const inputs = [];
processed.forEach(p => inputs.push('-i', p));
const outFinal = join(VIDEO, 'godine-tisine.mp4');
await run([
  '-y', ...inputs,
  '-filter_complex', filter,
  '-map', '[v]',
  '-an',
  '-c:v', 'libx264', '-crf', '24', '-preset', 'slow',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  outFinal
], 'concat-godine');

// Poster — single frame at 1.5s
await run([
  '-y', '-ss', '1.5', '-i', outFinal, '-frames:v', '1',
  '-c:v', 'libwebp', '-quality', '85',
  join(VIDEO, 'godine-tisine-poster.webp')
], 'poster');

const sizeKB = (await stat(outFinal)).size / 1024;
console.log(`\n[godine-tisine] ${(sizeKB / 1024).toFixed(2)} MB`);

// Cleanup
for (const p of processed) { try { await unlink(p); } catch {} }
console.log('[godine-tisine] Done.');
