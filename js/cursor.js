// =======================================================
// CIGAR SHOP — monogram logo cursor
// Brand monogram (CS) prati mi\u0161a sa blagom inertion, sub-pixel smooth,
// suptilna idle pulse + hover scale + press shrink. Ring iza njega pulsira.
// =======================================================

export function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  // Na touch uređajima native cursor nema smisla
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) {
    cursor.remove();
    document.body.style.cursor = 'auto';
    return;
  }

  cursor.innerHTML = `
    <img class="cursor__logo" src="/assets/brand/logo-monogram-128.png" alt="" draggable="false">
  `;

  const logo = cursor.querySelector('.cursor__logo');
  // Cursor-arrow tilt (nakrivljen kao da je klasi\u010dan pointer)
  const TILT = -22; // stepeni

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let logoX = mouseX, logoY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function loop() {
    logoX += (mouseX - logoX) * 0.32;
    logoY += (mouseY - logoY) * 0.32;
    // Vrh logoa je pivot (transform-origin: 50% 0) — pozicioniramo top-center na kursor,
    // rotacija tilta telo nadole-levo kao klasi\u010dna strelica.
    logo.style.transform =
      `translate3d(${logoX}px, ${logoY}px, 0) translate(-50%, 0) rotate(${TILT}deg)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Hover na interaktivnim elementima
  const interactive = 'a, button, input, textarea, select, .bento__card, .spirit-card, .location-card, .brand-card, .contact-card, .hero__dot, .contact__select-trigger, .contact__select-option, [role="button"]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest?.(interactive)) cursor.classList.add('is-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest?.(interactive)) cursor.classList.remove('is-hover');
  });

  window.addEventListener('mouseleave', () => (cursor.style.opacity = '0'));
  window.addEventListener('mouseenter', () => (cursor.style.opacity = '1'));

  document.addEventListener('pointerdown', () => cursor.classList.add('is-press'));
  document.addEventListener('pointerup',   () => cursor.classList.remove('is-press'));
}
