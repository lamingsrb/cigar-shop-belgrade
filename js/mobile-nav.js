// =======================================================
// CIGAR SHOP — Mobile nav drawer toggle
// Otvara/zatvara slide-in drawer na hamburger klik. Zatvara na:
// - klik backdrop-a
// - klik na link unutar drawer-a (auto-close pa scroll)
// - Escape key
// - resize na desktop (>768px)
// ARIA: aria-expanded na buttonu, aria-hidden na drawer-u.
// =======================================================

export function initMobileNav() {
  const btn = document.getElementById('nav-toggle');
  const drawer = document.getElementById('nav-drawer');
  const backdrop = document.querySelector('.nav-backdrop');
  if (!btn || !drawer || !backdrop) return;

  const links = drawer.querySelectorAll('a[href^="#"]');

  function open() {
    drawer.classList.add('is-open');
    backdrop.classList.add('is-visible');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Zatvori meni');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-drawer-open');
  }

  function close() {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-visible');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Otvori meni');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-drawer-open');
  }

  function toggle() {
    if (drawer.classList.contains('is-open')) close();
    else open();
  }

  btn.addEventListener('click', toggle);
  backdrop.addEventListener('click', close);

  // Klik na link → zatvori drawer (Lenis će handlovati smooth scroll)
  links.forEach(a => a.addEventListener('click', () => {
    // Kratak delay da klik triggeruje navigation pre nego što drawer nestane
    setTimeout(close, 50);
  }));

  // Escape zatvori
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
  });

  // Auto-close na resize iznad mobile breakpoint-a
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768 && drawer.classList.contains('is-open')) close();
    }, 150);
  });
}
