// Build Slide 2 hero video: cinematic production-journey compilation
// from Ana's 4 Feedback_loop/24-04-2026 clips. 1280x720, CRF 18, unsharp mask
// for "vrhunski kvalitet" per client request.
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, unlink, stat } from 'fs/promises';
import ffmpegPath from 'ffmpeg-static';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_DIR = join(ROOT, 'Feedback_loop', '24-04-2026');
const OUT     = join(ROOT, 'public', 'assets', 'video');
const TMP     = join(ROOT, 'scripts', '.tmp-slide2');

await mkdir(OUT, { recursive: true });
await mkdir(TMP, { recursive: true });

function run(args, label = 'ffmpeg') {
  return new Promise((resolve, reject) => {
    console.log(`[${label}]`, args.slice(0, 6).join(' '), '...');
    const p = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    p.stderr.on('data', d => { err += d.toString(); });
    p.on('close', code => code === 0 ? resolve() : (console.error(err.slice(-2000)), reject(new Error(`${label} exit ${code}`))));
  });
}

// Production journey: plantation → drying facility → aged stacks → sorting hands
const CLIPS = [
  { hash: '4be94c7223', start: 2, dur: 4, note: 'Plantation' },
  { hash: '8aecfb3573', start: 2, dur: 4, note: 'Drying/fermentation hall' },
  { hash: 'e18e12f826', start: 3, dur: 4, note: 'Aged leaf stacks close-up' },
  { hash: '357dd71e81', start: 2, dur: 4, note: 'Selection / sorting' }
];
const XFADE = 0.8;

async function resolveClip(hash) {
  const { readdir } = await import('fs/promises');
  const files = await readdir(SRC_DIR);
  const m = files.find(f => f.toLowerCase().includes(hash.toLowerCase()));
  if (!m) throw new Error(`clip ${hash} not found`);
  return join(SRC_DIR, m);
}

// Preprocess each clip to 1280x720 with sharp filter + warmth grade
const processed = [];
for (let i = 0; i < CLIPS.length; i++) {
  const c = CLIPS[i];
  const src = await resolveClip(c.hash);
  const out = join(TMP, `seg${i}.mp4`);
  const vf = [
    `scale=1280:720:flags=lanczos:force_original_aspect_ratio=increase`,
    `crop=1280:720`,
    `setsar=1`,
    `fps=30`,
    `unsharp=lx=5:ly=5:la=1.2`,                     // sharpening da kompenzuje upscale
    `eq=brightness=-0.02:contrast=1.08:saturation=1.1`,
    `colorbalance=rs=0.04:gs=-0.01:bs=-0.04`
  ].join(',');
  await run([
    '-y', '-ss', String(c.start), '-i', src, '-t', String(c.dur),
    '-vf', vf,
    '-an',
    '-c:v', 'libx264', '-crf', '18', '-preset', 'slow',
    '-pix_fmt', 'yuv420p',
    out
  ], `prep-${i}`);
  processed.push(out);
  console.log(`  [${i}] ${c.note} (${c.dur}s from ${c.start}s)`);
}

// Concat with xfade
const XFADE_TYPES = ['fade', 'dissolve', 'circleopen'];
let filter = '';
let accum = 0;
let last = '[0:v]';
for (let i = 1; i < CLIPS.length; i++) {
  accum += CLIPS[i-1].dur - XFADE;
  const tr = XFADE_TYPES[(i-1) % XFADE_TYPES.length];
  const lbl = i === CLIPS.length - 1 ? '[v]' : `[v${i}]`;
  filter += `${last}[${i}:v]xfade=transition=${tr}:duration=${XFADE}:offset=${accum.toFixed(3)}${lbl};`;
  last = lbl;
}
filter = filter.slice(0, -1);
console.log('[slide2] filter:', filter);

const inputs = [];
processed.forEach(p => inputs.push('-i', p));
const mp4 = join(OUT, 'slide2.mp4');
await run([
  '-y', ...inputs,
  '-filter_complex', filter,
  '-map', '[v]',
  '-c:v', 'libx264', '-crf', '18', '-preset', 'slow',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  mp4
], 'concat-slide2');

await run([
  '-y', '-ss', '0.5', '-i', mp4, '-frames:v', '1',
  '-c:v', 'libwebp', '-quality', '85',
  join(OUT, 'slide2-poster.webp')
], 'poster');

const s = await stat(mp4);
console.log(`[slide2] Done! ${(s.size/1e6).toFixed(2)} MB`);

for (const f of processed) { try { await unlink(f); } catch {} }
