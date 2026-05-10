// Optimizuje "Novi Video za drugi slajd heroa.mp4" za sajt:
//   - 1600x900 (cover crop), 30fps
//   - warm grade (isti kao u build-hero-video.mjs / hero-slide3)
//   - palindrome (boomerang) loop: napred + nazad → fluidno vraćanje bez
//     skoka na početak; HTML <video loop> onda samo zacikluje besprekorno
//   - CRF 18, +faststart (web stream-friendly)
//   - poster (frame na 1s sa istim grade-om → webp)
//
// Identičan pipeline kao build-hero-slide3-video.mjs (samo različiti SRC i
// OUT putevi). Source video je iz iste ComfyUI sesije (5.04s @ 1280x704
// 24fps h264).
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { stat, copyFile } from 'fs/promises';
import ffmpegPath from 'ffmpeg-static';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'Feedback_loop', '09-05-2026', 'Media', 'Novi Video za drugi slajd heroa.mp4');
const OUT_DIR = join(ROOT, 'public', 'assets', 'video');
const OUT_MP4 = join(OUT_DIR, 'slide2.mp4');
const OUT_POSTER = join(OUT_DIR, 'slide2-poster.webp');
const BACKUP_MP4 = join(OUT_DIR, 'slide2.previous.mp4');

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

// 1) Backup prethodnog slide2.mp4 (ako postoji)
try {
  await copyFile(OUT_MP4, BACKUP_MP4);
  console.log('[backup] saved →', BACKUP_MP4);
} catch (e) {
  if (e.code !== 'ENOENT') console.warn('[backup]', e.message);
}

// 2) Probe input
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

// 3) Encode optimized MP4 sa palindromom (forward + reverse) u JEDNOM
// ffmpeg pozivu — sve filtre kroz filter_complex graph. Single-pass
// izbegava artefakte od triput-encode-ovanog h264 streama.
//
// Filter graph:
//   1. apply scale/crop/grade/fps na input → [base]
//   2. split [base] na dve grane: [main] (forward) i [copy]
//   3. reverse + trim=start_frame=1 (skip dupli boundary frame) → [rev]
//   4. concat [main][rev] = forward + reversed = palindrome
const baseGrade = [
  'scale=1600:900:force_original_aspect_ratio=increase',
  'crop=1600:900',
  'setsar=1:1',
  'fps=30',
  'eq=brightness=-0.04:contrast=1.12:saturation=1.15',
  'colorbalance=rs=0.05:gs=-0.02:bs=-0.05',
].join(',');

const filterComplex = [
  `[0:v]${baseGrade}[base]`,
  `[base]split=2[main][copy]`,
  `[copy]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[rev]`,
  `[main][rev]concat=n=2:v=1:a=0[out]`,
].join(';');

await run([
  '-y', '-i', SRC,
  '-filter_complex', filterComplex,
  '-map', '[out]',
  '-an',
  '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  OUT_MP4,
], 'encode-palindrome');

// 4) Poster — frame na 1s (skip black intro if any)
await run([
  '-y', '-ss', '1.0', '-i', OUT_MP4,
  '-frames:v', '1',
  '-vf', 'scale=1280:720',
  '-c:v', 'libwebp', '-quality', '80',
  OUT_POSTER,
], 'poster');

// 5) Report
const sizeMp4 = (await stat(OUT_MP4)).size;
const sizePoster = (await stat(OUT_POSTER)).size;
const sizeSrc = (await stat(SRC)).size;
console.log('\n[done]');
console.log(`  source         : ${(sizeSrc / 1e6).toFixed(2)} MB`);
console.log(`  slide2.mp4     : ${(sizeMp4 / 1e6).toFixed(2)} MB`);
console.log(`  slide2-poster  : ${(sizePoster / 1024).toFixed(1)} KB`);
