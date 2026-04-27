// Humidor walkthrough — scrub video.currentTime via scroll progress through section.
// User scroll-skroluje sekciju, a video se pomera napred/nazad mapirano na progress.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHumidorScrub() {
  const video = document.getElementById('humidor-scrub-video');
  const stage = document.getElementById('humidor-scrub-stage');
  if (!video || !stage) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    // Fall back to autoplay loop
    video.loop = true;
    video.autoplay = true;
    video.play().catch(() => {});
    return;
  }

  // Wait for metadata so duration is known
  const setup = () => {
    if (!video.duration || !isFinite(video.duration)) return;

    // Smooth scrub via tween proxy
    const proxy = { t: 0 };

    ScrollTrigger.create({
      trigger: '#humidor',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.6,
      onUpdate: (self) => {
        const target = self.progress * video.duration;
        gsap.to(proxy, {
          t: target,
          duration: 0.25,
          overwrite: true,
          ease: 'power1.out',
          onUpdate: () => {
            try { video.currentTime = proxy.t; } catch (_) {}
          }
        });
      }
    });

    // Hide scrub hint after first interaction
    const hint = stage.querySelector('.humidor__scrub-hint');
    let hidden = false;
    const hide = () => {
      if (hidden || !hint) return;
      hidden = true;
      hint.classList.add('is-fading');
      setTimeout(() => hint.remove(), 800);
    };
    window.addEventListener('scroll', hide, { once: true, passive: true });
  };

  if (video.readyState >= 1) setup();
  else video.addEventListener('loadedmetadata', setup, { once: true });
}
