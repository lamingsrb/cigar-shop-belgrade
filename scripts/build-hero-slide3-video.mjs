// Optimizuje "Novi video za 3. slajd heroa.mp4" za sajt:
//   - 1600x900 (cover crop), 30fps
//   - warm grade (isti kao u build-hero-video.mjs)
//   - palindrome (boomerang) loop: napred + nazad → fluidno vraćanje bez
//     skoka na početak; HTML <video loop> onda samo zacikluje besprekorno
//   - CRF 18, +faststart (web stream-friendly)
//   - poster (prvi frejm sa istim grade-om → webp)
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { stat, copyFile } from 'fs/promises';
import ffmpegPath from 'ffmpeg-static';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'Feedback_loop', '09-05-2026', 'Media', 'Novi video za 3. slajd heroa.mp4');
const OUT_DIR = join(ROOT, 'public', 'assets', 'video');
const OUT_MP4 = join(OUT_DIR, 'hero-slide3.mp4');
const OUT_POSTER = join(OUT_DIR, 'hero-slide3-poster.webp');
const BACKUP_MP4 = join(OUT_DIR, 'hero-slide3.previous.mp4');

function run(args, label = 'ffmpeg') {
  return new Promise((resolve, reject) => {
    console.log(`[${label}]`, args.slice(0, 6).join(' '), '...');
    const p = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    p.stderr.on('data', d => { err += d.toString(); });
    p.on('close', code => {
      if (code === 0) resolve();
      else { console.error(err.slice(-2000)); reject(new Error(`${label} exit ${code}`)); }
    });
  });
}

// 1) Backup prethodnog hero-slide3.mp4 (ako postoji)
try {
  await copyFile(OUT_MP4, BACKUP_MP4);
  console.log('[backup] saved →', BACKUP_MP4);
} catch (e) {
  if (e.code !== 'ENOENT') console.warn('[backup]', e.message);
}

// 2) Probe input duration (so we can chain seamless if needed)
const probeInfo = await new Promise((resolve) => {
  const p = spawn(ffmpegPath, ['-i', SRC], { stdio: ['ignore', 'pipe', 'pipe'] });
  let err = '';
  p.stderr.on('data', d => { err += d.toString(); });
  p.on('close', () => {
    const m = /Duration: (\d+):(\d+):(\d+)\.(\d+)/.exec(err);
    const dur = m ? (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + (+m[4]) / 100 : null;
    const res = /(\d+)x(\d+)/.exec(err);
    resolve({ dur, w: res ? +res[1] : null, h: res ? +res[2] : null });
  });
});
console.log(`[input] duration=${probeInfo.dur}s, resolution=${probeInfo.w}x${probeInfo.h}`);

// 3) Encode optimized MP4 sa palindromom (forward + reverse).
// Korak 3a: jednom prođe pipeline (scale+crop+grade+30fps) → forward.mp4.
// Korak 3b: reverse-uj forward → reversed.mp4 (`reverse` filter mora da
//   učita ceo stream u memoriju, pa za 5s @ 30fps je sasvim ok).
// Korak 3c: concat forward + reversed → final hero-slide3.mp4.
// Boundary trick: reversed.mp4 počinje sa duplim frame-om (kraj forward-a),
// pa trim=start_frame=1 + setpts=PTS-STARTPTS preskaču taj duplikat.
const vf = [
  'scale=1600:900:force_original_aspect_ratio=increase',
  'crop=1600:900',
  'setsar=1:1',
  'fps=30',
  'eq=brightness=-0.04:contrast=1.12:saturation=1.15',
  'colorbalance=rs=0.05:gs=-0.02:bs=-0.05',
].join(',');

const TMP_DIR = join(ROOT, 'scripts', '.tmp-slide3');
const FORWARD = join(TMP_DIR, 'forward.mp4');
const REVERSED = join(TMP_DIR, 'reversed.mp4');
const { mkdir, unlink } = await import('fs/promises');
await mkdir(TMP_DIR, { recursive: true });

// 3a) Encode forward sa svim grading filtrima
await run([
  '-y', '-i', SRC,
  '-vf', vf,
  '-an',
  '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
  '-pix_fmt', 'yuv420p',
  FORWARD,
], 'encode-forward');

// 3b) Reverse forward (prva frame se kasnije trim-uje da ne dupli boundary)
await run([
  '-y', '-i', FORWARD,
  '-vf', 'reverse',
  '-an',
  '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
  '-pix_fmt', 'yuv420p',
  REVERSED,
], 'encode-reversed');

// 3c) Concat forward + reversed (sa trim prvog frame-a reversed-a) → final
await run([
  '-y', '-i', FORWARD, '-i', REVERSED,
  '-filter_complex',
    '[1:v]trim=start_frame=1,setpts=PTS-STARTPTS[r];' +
    '[0:v][r]concat=n=2:v=1:a=0[out]',
  '-map', '[out]',
  '-an',
  '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  OUT_MP4,
], 'concat-palindrome');

// 4) Poster — uzimamo iz FORWARD međufajla (ne iz palindrome OUT_MP4 jer
// concat-encoded stream ima nepravilan PTS na startu pa -ss seek ne radi).
await run([
  '-y', '-ss', '1.0', '-i', FORWARD,
  '-frames:v', '1',
  '-vf', 'scale=1280:720',
  '-c:v', 'libwebp', '-quality', '80',
  OUT_POSTER,
], 'poster');

// Cleanup tmp
try { await unlink(FORWARD); } catch {}
try { await unlink(REVERSED); } catch {}

// 5) Report sizes
const sizeMp4 = (await stat(OUT_MP4)).size;
const sizePoster = (await stat(OUT_POSTER)).size;
const sizeSrc = (await stat(SRC)).size;
console.log('\n[done]');
console.log(`  source            : ${(sizeSrc / 1e6).toFixed(2)} MB`);
console.log(`  hero-slide3.mp4   : ${(sizeMp4 / 1e6).toFixed(2)} MB`);
console.log(`  hero-slide3-poster: ${(sizePoster / 1024).toFixed(1)} KB`);
