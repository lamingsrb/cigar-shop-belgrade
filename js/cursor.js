// =======================================================
// CIGAR SHOP — cursor (no-op)
// Po Aninom feedback-u: nativni OS pointer (bez monogram logoa).
// Stara implementacija (logo cursor) sačuvana u git istoriji ako zatreba.
// =======================================================

export function initCursor() {
  const cursor = document.getElementById('cursor');
  if (cursor) cursor.remove();
  document.body.style.cursor = 'auto';
}
