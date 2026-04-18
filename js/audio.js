// =======================================================
// CIGAR SHOP — ambient audio (Howler)
// =======================================================

import { Howl } from 'howler';

let ambient = null;
let playing = false;

function createAmbient() {
  return new Howl({
    src: ['/assets/audio/ambient.mp3', '/assets/audio/ambient.webm'],
    loop: true,
    volume: 0.32,
    html5: true,
    preload: false,
    onloaderror: () => {
      // Silently ignore if asset missing (demo mode)
    },
    onplayerror: () => {
      // Autoplay blocked — button re-tries on next click
    }
  });
}

export function initAudio() {
  const btn = document.getElementById('audio-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!ambient) ambient = createAmbient();

    if (playing) {
      ambient.fade(ambient.volume(), 0, 500);
      setTimeout(() => ambient.pause(), 500);
      playing = false;
      btn.setAttribute('aria-pressed', 'false');
    } else {
      if (!ambient.playing()) ambient.play();
      ambient.fade(0, 0.32, 800);
      playing = true;
      btn.setAttribute('aria-pressed', 'true');
    }
  });
}
