// Kurira humidor fotke (briše neodabrane) i re-enkodira videe sa manjim bitrate-om.
// Targets: slide2.mp4 → ~3 MB (CRF 28, 960p), manifest-tvoj-izbor.mp4 → ~5-6 MB.
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { unlink, stat, copyFile, rename } from 'fs/promises';
import ffmpegPath from 'ffmpeg-static';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC  = join(ROOT, 'Feedback_loop', '02-05-2026', 'Media');
const OUT_VIDEO   = join(ROOT, 'public', 'assets', 'video');
const OUT_HUMIDOR = join(ROOT, 'public', 'assets', 'humidor');

function run(args, label = 'ffmpeg') {
  return new Promise((resolve, reject) => {
    console.log(`[${label}] starting`);
    const p = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    p.stdout.on('data', () => {});
    let err = '';
    p.stderr.on('data', d => { err += d.toString(); if (err.length > 50000) err = err.slice(-50000); });
    p.on('close', code => {
      if (code === 0) { console.log(`[${label}] OK`); resolve(); }
      else { console.error(`[${label}] EXIT ${code}\n${err.slice(-1500)}`); reject(new Error(`${label} exit ${code}`)); }
    });
    p.on('error', e => { console.error(`[${label}] ERROR`, e); reject(e); });
  });
}

// 1) Curate humidor — keep only 6 best (01, 04, 06, 07, 09, 10); delete 02, 03, 05, 08.
const KEEP = new Set([1, 4, 6, 7, 9, 10]);
for (let i = 1; i <= 10; i++) {
  if (KEEP.has(i)) continue;
  const idx = String(i).padStart(2, '0');
  for (const suffix of ['.webp', '-thumb.webp']) {
    const p = join(OUT_HUMIDOR, `humidor-${idx}${suffix}`);
    try { await unlink(p); console.log(`[humidor] removed ${idx}${suffix}`); }
    catch (e) { /* already gone */ }
  }
}

// Renumber kept photos to 01..06 for clean HTML wiring.
const renamePlan = [
  { from: 1,  to: 1 },  // mahogany w/ cigars + tools
  { from: 4,  to: 2 },  // walnut w/ cigar bundle, digital hygro
  { from: 6,  to: 3 },  // red mahogany w/ wine context
  { from: 7,  to: 4 },  // humidor base + folding ashtray
  { from: 9,  to: 5 },  // folding ashtray w/ Nikka whisky
  { from: 10, to: 6 },  // humidor + folding ashtray w/ logo
];
// Two-pass rename via tmp suffix to avoid collisions
for (const { from, to } of renamePlan) {
  if (from === to) continue;
  const fIdx = String(from).padStart(2, '0');
  const tIdx = String(to).padStart(2, '0');
  for (const suffix of ['.webp', '-thumb.webp']) {
    const src = join(OUT_HUMIDOR, `humidor-${fIdx}${suffix}`);
    const dst = join(OUT_HUMIDOR, `humidor-${tIdx}${suffix}.tmp`);
    try { await rename(src, dst); }
    catch (e) { console.error(`[rename] ${fIdx} -> ${tIdx} (${suffix}) failed`, e.message); }
  }
}
for (const { to } of renamePlan) {
  const tIdx = String(to).padStart(2, '0');
  for (const suffix of ['.webp', '-thumb.webp']) {
    const tmp = join(OUT_HUMIDOR, `humidor-${tIdx}${suffix}.tmp`);
    const dst = join(OUT_HUMIDOR, `humidor-${tIdx}${suffix}`);
    try { await rename(tmp, dst); console.log(`[rename] -> ${tIdx}${suffix}`); }
    catch (e) { /* already in place */ }
  }
}
console.log('[humidor] curated to 6 best');

// 2) Re-encode slide2.mp4 with smaller bitrate
{
  const src = join(SRC, 'Nova pozadina koju ana predlaze za slajd na hero sekciji umesto trenutnog, opisala je ona u tasku na koji tacno slajd hero sekcije misli.mp4');
  const tmp = join(OUT_VIDEO, 'slide2.tmp.mp4');
  await run([
    '-y', '-i', src,
    '-vf', 'scale=960:-2:flags=lanczos,fps=30',
    '-an',
    '-c:v', 'libx264', '-crf', '28', '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    tmp
  ], 'slide2-reenc');
  await rename(tmp, join(OUT_VIDEO, 'slide2.mp4'));
  const s = await stat(join(OUT_VIDEO, 'slide2.mp4'));
  console.log(`[slide2] ${(s.size / 1e6).toFixed(2)} MB`);
}

// 3) Re-encode manifest-tvoj-izbor.mp4 with smaller bitrate
{
  const src = join(SRC, 'Ovaj video je dala da stavimo na tvoj izbor nasa prica.mp4');
  const tmp = join(OUT_VIDEO, 'manifest-tvoj-izbor.tmp.mp4');
  await run([
    '-y', '-i', src,
    '-vf', 'scale=960:-2:flags=lanczos,fps=30',
    '-an',
    '-c:v', 'libx264', '-crf', '28', '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    tmp
  ], 'manifest-reenc');
  await rename(tmp, join(OUT_VIDEO, 'manifest-tvoj-izbor.mp4'));
  const s = await stat(join(OUT_VIDEO, 'manifest-tvoj-izbor.mp4'));
  console.log(`[manifest] ${(s.size / 1e6).toFixed(2)} MB`);
}

console.log('[curate] All done.');
