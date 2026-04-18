// =======================================================
// CIGAR SHOP — main bootstrap
// Orchestrates Lenis, GSAP, i18n, loader, all scenes
// =======================================================

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { initI18n, t } from './i18n.js';
import { runLoader } from './loader.js';
import { initCursor } from './cursor.js';
import { initAudio } from './audio.js';
import { initHeroCigar } from './hero-cigar.js';
import { initGlobeOrigins } from './globe-origins.js';
import { initHumidorScene } from './humidor-scene.js';
import { initLocationsMap } from './locations-map.js';
import { initScrollBurn } from './scroll-burn.js';
import { initAmbientParticles } from './ambient-particles.js';
import { renderCollection, renderSpirits, renderAccessories, renderLocations } from './render.js';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// -------------------------------------------------------
// Smooth scroll (Lenis)
// -------------------------------------------------------
function initSmoothScroll() {
  if (prefersReducedMotion) return null;

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links — Lenis handles the scroll
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -60, duration: 1.6 });
    });
  });

  return lenis;
}

// -------------------------------------------------------
// Scroll-driven reveal (IntersectionObserver)
// -------------------------------------------------------
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-reveal');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Auto-tag common elements
  document.querySelectorAll(
    '.section__header, .manifest__copy, .manifest__media, .origins__header, .humidor__copy, .ritual__steps, .contact__grid, .bento__card, .spirit-card, .location-card'
  ).forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

// -------------------------------------------------------
// Header scroll state + nav scroll-spy
// -------------------------------------------------------
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  ScrollTrigger.create({
    start: 80,
    end: 'max',
    onUpdate: (self) => {
      header.classList.toggle('is-scrolled', self.scroll() > 80);
    }
  });
}

function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav a[href^="#"], .footer__col a[href^="#"]');
  if (!navLinks.length) return;

  const linkMap = new Map();
  navLinks.forEach((a) => {
    const id = a.getAttribute('href').slice(1);
    if (!linkMap.has(id)) linkMap.set(id, []);
    linkMap.get(id).push(a);
  });

  const sections = Array.from(linkMap.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  let active = null;

  function setActive(id) {
    if (active === id) return;
    active = id;
    linkMap.forEach((links, key) => {
      links.forEach((a) => a.classList.toggle('is-active', key === id));
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      // Pick section closest to top center
      const candidates = entries.filter((e) => e.isIntersecting);
      if (!candidates.length) return;
      candidates.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
      setActive(candidates[0].target.id);
    },
    { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.1, 0.5, 1] }
  );
  sections.forEach((s) => observer.observe(s));
}

// -------------------------------------------------------
// Contact form (client-side only, shows confirmation)
// -------------------------------------------------------
function initContactForm() {
  const form = document.getElementById('contact-form');
  const note = document.getElementById('contact-note');
  if (!form || !note) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name')?.toString().trim();
    const email = data.get('email')?.toString().trim();
    const message = data.get('message')?.toString().trim();

    if (!name || !email || !message) {
      note.textContent = t('contact.error');
      note.style.color = 'var(--ember)';
      return;
    }

    note.textContent = t('contact.success');
    note.style.color = 'var(--gold-leaf)';
    form.reset();
  });
}

// -------------------------------------------------------
// Footer year
// -------------------------------------------------------
function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

// -------------------------------------------------------
// Boot
// -------------------------------------------------------
async function boot() {
  // 1) i18n first — renders initial content in chosen lang
  //    Ako locale fetch padne, nastavi sa fallback sadr\u017eajem da ceo sajt ne bude prazan.
  try {
    await initI18n();
  } catch (err) {
    console.error('[CigarShop] i18n init failed, continuing with fallback', err);
  }

  // 2) Dynamic content renders (bento, spirits, locations)
  renderCollection();
  renderSpirits();
  renderAccessories();
  renderLocations();

  // 3) Small UI bits
  initFooterYear();
  initContactForm();
  initCursor();
  initAudio();
  initAmbientParticles();

  // 4) Scroll infrastructure
  initSmoothScroll();
  initReveal();
  initHeaderScroll();
  initScrollSpy();
  initScrollBurn();

  // 5) Three.js scenes (heavy — kick off after layout ready)
  requestIdleCallback?.(() => {
    initHeroCigar();
    initGlobeOrigins();
    initHumidorScene();
  }) || setTimeout(() => {
    initHeroCigar();
    initGlobeOrigins();
    initHumidorScene();
  }, 100);

  // 6) Map (when scrolled into view)
  const mapEl = document.getElementById('map');
  if (mapEl) {
    const mapObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          initLocationsMap();
          mapObserver.disconnect();
        }
      });
    }, { rootMargin: '200px' });
    mapObserver.observe(mapEl);
  }

  // 7) Finally — loader
  runLoader();
}

document.addEventListener('DOMContentLoaded', boot);
