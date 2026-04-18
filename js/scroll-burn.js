// =======================================================
// CIGAR SHOP — scroll "burn" progress bar (cigara sagoreva)
// =======================================================

export function initScrollBurn() {
  const bar = document.getElementById('scroll-burn');
  if (!bar) return;

  function update() {
    const scroll = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (scroll / max) * 100 : 0;
    bar.style.width = `${pct.toFixed(2)}%`;
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}
