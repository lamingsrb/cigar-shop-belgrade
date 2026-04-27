// =======================================================
// CIGAR SHOP — loader (no-op, page se otvara odmah)
// =======================================================

export function runLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.remove();
}
