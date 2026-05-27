// =======================================================
// CIGAR SHOP — Performance: pause off-screen video + CSS animations
// Štedi CPU/GPU dok korisnik ne skroluje do dela. Bez vidnog efekta na UX —
// videi automatski nastavljaju kad uđu u viewport, animacije resume-uju.
// =======================================================

const VIDEO_SELECTORS = [
  '.manifest__video',
  '.humidor__video',
  '.hero__slide1-video',
  '.hero__products-video',
  '.hero__live-video',
];

// Sekcije sa infinite CSS animacijama koje trose CPU dok su off-screen.
// Pause-uje se preko klase .perf-paused → CSS animation-play-state: paused.
const ANIM_SELECTORS = [
  '.region-grid--2',     // gold glow + shimmer sweep na Stari/Novi svet
  '.hero',               // hero rotator + ember/grain animacije
  '.humidor',            // humidor section animacije
  '#gallery',            // godine tisine slideshow
  '#blog',               // blog rail
];

export function initPerfPause() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // already minimal motion

  // Pause/resume videos po vidljivosti
  const videos = document.querySelectorAll(VIDEO_SELECTORS.join(','));
  if (videos.length) {
    const vidObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          // play() može vratiti Promise koji rejectne ako autoplay policy ne dozvoli
          v.play?.().catch(() => {});
        } else {
          v.pause?.();
        }
      });
    }, { rootMargin: '50px', threshold: 0.01 });
    videos.forEach((v) => vidObs.observe(v));
  }

  // Pause/resume CSS animacija po vidljivosti
  const animHosts = document.querySelectorAll(ANIM_SELECTORS.join(','));
  if (animHosts.length) {
    const animObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('perf-paused', !entry.isIntersecting);
      });
    }, { rootMargin: '100px', threshold: 0.01 });
    animHosts.forEach((el) => {
      el.classList.add('perf-paused'); // start paused, observer će uključiti
      animObs.observe(el);
    });
  }
}
