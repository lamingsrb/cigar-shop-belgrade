// =======================================================
// CIGAR SHOP — Reusable tab-showcase component
// Tabs at top + grid of item-thumbnails per tab. Klik na thumb → lightbox.
// Korišćen unificirano u Humidor (Kuba/Novi svet), Spirits (Viski/Burbon/...),
// Gear (Sekači/Upaljači/...). Modern, kompaktan, animativan.
// =======================================================

const STATE = new WeakMap();

export function initTabShowcase(host, options = {}) {
  if (!host) return;
  teardownTabShowcase(host);

  const { tabs = [], regions = {}, defaultTab } = options;
  if (!tabs.length) return;

  let active = defaultTab || tabs[0].key;
  if (!regions[active]) active = tabs[0].key;

  // DOM struktura: tabs row + grid (intro removed for cleanliness)
  host.innerHTML = `
    <div class="tab-showcase__tabs" role="tablist"></div>
    <div class="tab-showcase__grid"></div>
  `;
  host.classList.add('tab-showcase');

  const tabsHost = host.querySelector('.tab-showcase__tabs');
  const gridHost = host.querySelector('.tab-showcase__grid');

  function renderTabs() {
    tabsHost.innerHTML = tabs.map(t => {
      const isActive = t.key === active ? ' is-active' : '';
      const items = regions[t.key]?.items || [];
      return `<button class="tab-showcase__tab${isActive}" data-key="${t.key}" type="button" role="tab" aria-selected="${t.key === active}">
        <span class="tab-showcase__tab-name">${t.label}</span>
        <span class="tab-showcase__tab-count">${items.length}</span>
      </button>`;
    }).join('');
  }

  function renderGrid() {
    const items = regions[active]?.items || [];
    if (!items.length) {
      gridHost.innerHTML = '';
      return;
    }
    // Force fade-out → fade-in by toggling class
    gridHost.classList.remove('is-active');
    void gridHost.offsetWidth; // force reflow
    gridHost.innerHTML = items.map(it => `
      <figure class="tab-showcase__item"
              data-lb-type="image"
              data-lb-src="${it.src}"
              data-lb-caption="${escape(it.caption || it.name || '')}">
        <img loading="lazy" decoding="async"
             src="${it.thumb || it.src}"
             alt="${escape(it.alt || it.name || '')}">
        <figcaption class="tab-showcase__item-name">${escape(it.name || '')}</figcaption>
      </figure>
    `).join('');
    requestAnimationFrame(() => gridHost.classList.add('is-active'));
  }

  function escape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  renderTabs();
  renderGrid();

  tabsHost.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-showcase__tab');
    if (!btn) return;
    const key = btn.dataset.key;
    if (!key || key === active || !regions[key]) return;
    active = key;
    renderTabs();
    renderGrid();
  });

  STATE.set(host, { tabsHost, gridHost });
}

function teardownTabShowcase(host) {
  STATE.delete(host);
}
