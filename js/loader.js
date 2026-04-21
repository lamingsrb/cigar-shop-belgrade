// =======================================================
// CIGAR SHOP — loader (match strike intro)
// =======================================================

import { gsap } from 'gsap';

export function runLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    // Skip animation, fade out immediately
    loader.classList.add('is-gone');
    setTimeout(() => loader.remove(), 800);
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      setTimeout(() => {
        loader.classList.add('is-gone');
        setTimeout(() => loader.remove(), 900);
      }, 450);
    }
  });

  // Subtle entry
  tl.from('.loader__match', { opacity: 0, y: 40, duration: 0.6, ease: 'power2.out' })
    .from('.loader__label', { opacity: 0, y: 14, duration: 0.4, ease: 'power2.out' }, '-=0.2')
    .to({}, { duration: 0.45 })
    .add(() => {
      // Strike — CSS kicks flame animation
      loader.classList.add('is-strike');
    })
    .to('.loader__label', { opacity: 1, color: '#e4c88a', duration: 0.35 }, '+=0.3');
}
