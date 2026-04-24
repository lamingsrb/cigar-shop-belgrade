// =======================================================
// CIGAR SHOP — i18n (srpski/engleski)
// =======================================================

const DEFAULT_LANG = 'sr';
const SUPPORTED = ['sr', 'en'];

let currentLang = DEFAULT_LANG;
let dictionary = {};
const listeners = new Set();

function detectLang() {
  const stored = localStorage.getItem('cs_lang');
  if (stored && SUPPORTED.includes(stored)) return stored;
  const browser = navigator.language?.slice(0, 2);
  return SUPPORTED.includes(browser) ? browser : DEFAULT_LANG;
}

async function loadDictionary(lang) {
  // Pokušaj absolute path, pa relative kao fallback (za deploy u subpath-u)
  const candidates = [`/locales/${lang}.json`, `./locales/${lang}.json`, `locales/${lang}.json`];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (_) { /* pokušaj sledeći */ }
  }
  throw new Error(`Cannot load locale: ${lang}`);
}

function getByPath(obj, path) {
  return path.split('.').reduce((acc, k) => (acc != null ? acc[k] : undefined), obj);
}

export function t(path, fallback = '') {
  const val = getByPath(dictionary, path);
  return typeof val === 'string' ? val : fallback;
}

export function tObj(path) {
  const val = getByPath(dictionary, path);
  return val ?? null;
}

export function getLang() { return currentLang; }

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function applyDOM() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (!val) return;
    if (el.tagName === 'META') {
      el.setAttribute('content', val);
    } else if (el.tagName === 'TITLE') {
      el.textContent = val;
    } else if (val.indexOf('<') !== -1) {
      // Lokale stringovi koji sadrže HTML tagove (npr <strong>) — innerHTML
      // Bezbedno jer locale fajlovi su pod našom kontrolom (public/locales/*.json).
      el.innerHTML = val;
    } else {
      el.textContent = val;
    }
  });

  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const spec = el.getAttribute('data-i18n-attr'); // "placeholder:contact.nameLabel"
    spec.split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const val = t(key);
      if (val) el.setAttribute(attr, val);
    });
  });

  const toggle = document.getElementById('lang-toggle');
  if (toggle) toggle.setAttribute('data-active', currentLang);

  listeners.forEach((fn) => {
    try { fn(currentLang, dictionary); } catch (e) { console.error(e); }
  });
}

export async function setLang(lang) {
  if (!SUPPORTED.includes(lang) || lang === currentLang) return;
  dictionary = await loadDictionary(lang);
  currentLang = lang;
  localStorage.setItem('cs_lang', lang);
  applyDOM();
}

export async function initI18n() {
  currentLang = detectLang();
  try {
    dictionary = await loadDictionary(currentLang);
  } catch (err) {
    console.error('[CigarShop] locale load failed for', currentLang, err);
    // Fallback na drugi jezik ako prvi padne
    const alt = currentLang === 'sr' ? 'en' : 'sr';
    try {
      dictionary = await loadDictionary(alt);
      currentLang = alt;
    } catch (err2) {
      console.error('[CigarShop] fallback locale also failed, running with empty dictionary', err2);
      dictionary = {};
    }
  }
  applyDOM();

  // Wire up toggle
  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = currentLang === 'sr' ? 'en' : 'sr';
      // Foil-print animation: pulse the toggle
      toggle.animate(
        [
          { filter: 'brightness(1)', transform: 'scale(1)' },
          { filter: 'brightness(1.6)', transform: 'scale(1.08)' },
          { filter: 'brightness(1)', transform: 'scale(1)' }
        ],
        { duration: 500, easing: 'cubic-bezier(0.19, 1, 0.22, 1)' }
      );
      setLang(next);
    });
  }
}
