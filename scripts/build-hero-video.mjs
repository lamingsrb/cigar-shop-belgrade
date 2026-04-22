// Compile-uje 5 MP4 fajlova iz Media RAW u jedan cinematic hero video sa xfade transitions.
// Output: public/assets/video/hero.mp4, hero.webm, hero-poster.webp
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, readdir, writeFile, unlink } from 'fs/promises';
import ffmpegPath from 'ffmpeg-static';
import { stat } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_DIR = join(ROOT, 'Media RAW', 'Images and Videos');
const NEW_DIR = join(ROOT, 'Feedback_loop', '22-04-2026', 'Video');
const OUT_DIR = join(ROOT, 'public', 'assets', 'video');
const TMP_DIR = join(ROOT, 'scripts', '.tmp-video');

await mkdir(OUT_DIR, { recursive: true });
await mkdir(TMP_DIR, { recursive: true });

function run(args, label = 'ffmpeg') {
  return new Promise((resolve, reject) => {
    console.log(`[${label}]`, ffmpegPath, args.slice(0, 8).join(' '), '...');
    const p = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err += d.toString(); });
    p.on('close', (code) => {
      if (code === 0) resolve();
      else { console.error(err.slice(-2000)); reject(new Error(`${label} exit ${code}`)); }
    });
  });
}

// 1) Helper: na\u0111i fajl po hash-fragmentu
async function resolveClip(dir, hashFragment) {
  const files = await readdir(dir);
  const match = files.find(f => f.includes(hashFragment));
  if (!match) throw new Error(`Clip matching "${hashFragment}" not found in ${dir}`);
  return join(dir, match);
}

// Eksplicitan redosled klipova za hero video.
// Prvi klip je obavezno ulaz u prodavnicu (staklena vrata / storefront).
// Zatim mix: shop tour \u2192 product shot \u2192 interior \u2192 viski \u2192 product shot.
const CLIP_PLAN = [
  { src: NEW_DIR,  hash: '6bc34d63577a7ebc5733605fa3c05cbd', dur: 5.0, start: 0,  note: 'Ulazna vrata / storefront' },
  { src: NEW_DIR,  hash: '9478ce446d96f0eb764e7415357ba200', dur: 3.5, start: 0,  note: 'CIGAR SHOP sign + humidor' },
  { src: SRC_DIR,  hash: '31d882e17975431b3ceddabc125db7ca', dur: 3.5, start: 0,  note: 'Horacio XL open box' },
  { src: NEW_DIR,  hash: '9e3a657f2d98f6911fbc9796640757bf', dur: 3.5, start: 0,  note: 'Interior humidor' },
  { src: SRC_DIR,  hash: 'ffa85fd21575a683c590edd6021c45c7', dur: 3.5, start: 6,  note: 'Japanski viski shop tour' },
  { src: SRC_DIR,  hash: '82b82a68228e40261ad19004ee8ff94e', dur: 3.0, start: 0,  note: 'Horacio SLED open' }
];

const CLIPS = await Promise.all(CLIP_PLAN.map(c => resolveClip(c.src, c.hash)));
console.log('[hero] Clip plan:');
CLIP_PLAN.forEach((c, i) => console.log(`  ${i}. ${c.note}  (${c.dur}s @ ${c.start}s from ${c.hash.slice(0,9)}...)`));

const SEGMENT_DURATIONS = CLIP_PLAN.map(c => c.dur);
const SEGMENT_STARTS    = CLIP_PLAN.map(c => c.start);
const processed = [];

for (let i = 0; i < CLIPS.length; i++) {
  const src = CLIPS[i];
  const dur = SEGMENT_DURATIONS[i] || 3;
  const start = SEGMENT_STARTS[i] || 0;
  const out = join(TMP_DIR, `seg${i}.mp4`);
  // Skaliraj, crop, trim, warmth grade, stabilni fps
  // 1280x720 za hero loop \u2014 dobar kvalitet + malena veli\u010dina (target total < 6MB mp4).
  const vf = [
    `scale=1280:720:force_original_aspect_ratio=increase`,
    `crop=1280:720`,
    `setsar=1:1`,
    `fps=30`,
    `eq=brightness=-0.04:contrast=1.12:saturation=1.15`,
    `colorbalance=rs=0.05:gs=-0.02:bs=-0.05`
  ].join(',');
  const args = ['-y'];
  if (start > 0) args.push('-ss', String(start));
  args.push('-i', src, '-t', String(dur), '-vf', vf, '-an',
    '-c:v', 'libx264', '-crf', '22', '-preset', 'medium',
    '-pix_fmt', 'yuv420p', out);
  await run(args, `seg${i}`);
  processed.push(out);
}

// 3) Concat sa xfade transitions \u2014 filter_complex
// Svaki xfade traje 0.8s, tako final dur = sum(durations) - (N-1)*0.8
const XFADE_DUR = 0.8;
const totalDur = SEGMENT_DURATIONS.slice(0, CLIPS.length).reduce((a,b)=>a+b,0) - (CLIPS.length - 1) * XFADE_DUR;

// Build filter_complex chain
// [0:v][1:v] xfade=transition=fade:duration=0.8:offset=(dur0-0.8) [v01]
// [v01][2:v] xfade=...:offset=(dur0+dur1-2*0.8) [v012]
// itd.
const XFADE_TYPES = ['fade', 'circleopen', 'slideleft', 'circleclose', 'fadeblack'];
let filter = '';
let accum = 0;
let lastLabel = '[0:v]';
for (let i = 1; i < CLIPS.length; i++) {
  accum += SEGMENT_DURATIONS[i - 1] - XFADE_DUR;
  const trans = XFADE_TYPES[(i - 1) % XFADE_TYPES.length];
  const newLabel = i === CLIPS.length - 1 ? '[v]' : `[v${i}]`;
  filter += `${lastLabel}[${i}:v]xfade=transition=${trans}:duration=${XFADE_DUR}:offset=${accum.toFixed(3)}${newLabel};`;
  lastLabel = newLabel;
}
filter = filter.slice(0, -1); // trim trailing ;

console.log('[hero] Concat filter:', filter);
console.log('[hero] Target duration:', totalDur.toFixed(2), 's');

const heroMp4 = join(OUT_DIR, 'hero.mp4');
const inputs = [];
processed.forEach(p => { inputs.push('-i', p); });

await run([
  '-y', ...inputs,
  '-filter_complex', filter,
  '-map', '[v]',
  '-c:v', 'libx264', '-crf', '22', '-preset', 'medium',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  heroMp4
], 'concat-mp4');

// 4) WebM (VP9) \u2014 target ~3 MB
const heroWebm = join(OUT_DIR, 'hero.webm');
await run([
  '-y', '-i', heroMp4,
  '-c:v', 'libvpx-vp9', '-crf', '32', '-b:v', '0',
  '-deadline', 'good', '-cpu-used', '3',
  '-an',
  heroWebm
], 'to-webm');

// 5) Poster (prvi clean frame sa warm grade-om)
const posterPath = join(OUT_DIR, 'hero-poster.webp');
await run([
  '-y', '-i', heroMp4, '-ss', '0.5',
  '-frames:v', '1',
  '-c:v', 'libwebp', '-quality', '80',
  posterPath
], 'poster');

// 6) Veli\u010dine
const sizeMp4 = (await stat(heroMp4)).size;
const sizeWebm = (await stat(heroWebm)).size;
const sizePoster = (await stat(posterPath)).size;
console.log('[hero] Done!');
console.log(`  hero.mp4   : ${(sizeMp4 / 1e6).toFixed(2)} MB`);
console.log(`  hero.webm  : ${(sizeWebm / 1e6).toFixed(2)} MB`);
console.log(`  hero-poster.webp: ${(sizePoster / 1024).toFixed(1)} KB`);

// 7) Cleanup tmp
for (const p of processed) {
  try { await unlink(p); } catch {}
}
