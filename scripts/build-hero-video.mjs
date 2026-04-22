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

// 1) Pronadji video fajlove
const files = (await readdir(SRC_DIR)).filter(f => f.endsWith('.mp4'));
// Klip 556fb5d04 (44 MB) ima kroz ceo trajanje "Pu\u0161enje ubija" warning label
// koji se skida sa kutija (\u010detiri uzastopna box-open sekvence, svaka sa peeling fazom).
// Nema \u010diste 7s sekcije unutar njega, pa ga potpuno isklju\u010dujemo.
const EXCLUDED = ['1556fb5d0456cd673a33661967b9a2fcf1797bb88fdc646eb4d6b5ceeb540067'];
const filtered = files.filter(f => !EXCLUDED.some(ex => f.includes(ex)));
// Sortiraj po veli\u010dini (najve\u0107i = najdu\u017ei = anchor scene)
const withSizes = await Promise.all(filtered.map(async f => ({
  f, s: (await stat(join(SRC_DIR, f))).size
})));
withSizes.sort((a, b) => b.s - a.s);
console.log('[hero] Input clips (by size):');
withSizes.forEach(x => console.log('  ', (x.s / 1e6).toFixed(1), 'MB -', x.f));

// Uzimamo sve preostale klipove
const CLIPS = withSizes.map(x => join(SRC_DIR, x.f));

// 2) Pre-process svaki klip: 1280x720, 30fps.
// 4 preostala klipa, total ~19s u trajanju, minus 3 xfade-a po 0.8s = ~16.6s final loop.
// Najve\u0107i dostupan klip je fa85fd215 (50s, shop tour + japanski viski \u2014 cinematic).
const SEGMENT_DURATIONS = [7, 4.5, 4, 3.5];
const SEGMENT_STARTS    = [0, 0, 0, 0];
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
