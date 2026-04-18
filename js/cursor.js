// =======================================================
// CIGAR SHOP — cigar-shaped ember cursor
// Tiny cigar body + glowing ember tip + smoke trail (handled in ambient-particles.js)
// =======================================================

export function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) {
    console.warn('[CigarShop] #cursor element not found');
    return;
  }

  // Na touch uređajima native cursor nema smisla — skloni custom
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) {
    cursor.remove();
    document.body.style.cursor = 'auto';
    return;
  }
  console.log('[CigarShop] cursor init OK');

  // Zamenim sadržaj sa cigar shape
  cursor.innerHTML = `
    <div class="cursor__cigar">
      <span class="cursor__cigar-body"></span>
      <span class="cursor__cigar-band"></span>
      <span class="cursor__cigar-ember"></span>
    </div>
    <span class="cursor__ring"></span>
  `;

  const cigar = cursor.querySelector('.cursor__cigar');
  const ring  = cursor.querySelector('.cursor__ring');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let prevX = mouseX, prevY = mouseY;
  let cigarX = mouseX, cigarY = mouseY;
  let ringX = mouseX, ringY = mouseY;
  let targetAngle = 0;
  let currentAngle = 0;

  window.addEventListener('mousemove', (e) => {
    prevX = mouseX; prevY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    const dx = mouseX - prevX;
    const dy = mouseY - prevY;
    if (Math.abs(dx) + Math.abs(dy) > 1) {
      targetAngle = Math.atan2(dy, dx);
    }
  });

  function loop() {
    cigarX += (mouseX - cigarX) * 0.5;
    cigarY += (mouseY - cigarY) * 0.5;
    ringX  += (mouseX - ringX) * 0.14;
    ringY  += (mouseY - ringY) * 0.14;

    // smooth angle (handle wrap-around)
    let diff = targetAngle - currentAngle;
    while (diff > Math.PI)  diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    currentAngle += diff * 0.2;

    cigar.style.transform = `translate(${cigarX}px, ${cigarY}px) translate(-50%, -50%) rotate(${currentAngle}rad)`;
    ring.style.transform  = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Hover na interaktivnim elementima — cigara se uveća, ring pulsira
  const interactive = 'a, button, input, textarea, .bento__card, .spirit-card, .location-card, [role="button"]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactive)) cursor.classList.add('is-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest?.(interactive)) cursor.classList.remove('is-hover');
  });

  window.addEventListener('mouseleave', () => (cursor.style.opacity = '0'));
  window.addEventListener('mouseenter', () => (cursor.style.opacity = '1'));

  // Klik "drag" na žar — kratka animacija
  document.addEventListener('pointerdown', () => cursor.classList.add('is-press'));
  document.addEventListener('pointerup',   () => cursor.classList.remove('is-press'));
}
