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
    <span class="cursor__ring"></span>
  `;

  const logo = cursor.querySelector('.cursor__logo');
  const ring = cursor.querySelector('.cursor__ring');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let logoX = mouseX, logoY = mouseY;
  let ringX = mouseX, ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function loop() {
    // Logo prati sa laganom inertion (0.28), ring dal\u017ee (0.12) za "comet tail" feel
    logoX += (mouseX - logoX) * 0.28;
    logoY += (mouseY - logoY) * 0.28;
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    logo.style.transform = `translate3d(${logoX}px, ${logoY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
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
