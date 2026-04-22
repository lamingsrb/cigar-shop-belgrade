// =======================================================
// CIGAR SHOP — Contact store picker
// Dropdown sa 5 prodavnica; ažurira address/phone/hours kartice
// i Google Maps iframe. Ušće default (flagship).
// =======================================================

import { tObj, t, onLangChange } from './i18n.js';

const MAP_SRC = (query) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

function telHref(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  return digits ? `tel:+381${digits.replace(/^0/, '')}` : '#';
}

function gmapsSearch(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function initContactSelector() {
  const select = document.getElementById('contact-store-select');
  if (!select) return;

  const addressCard = document.querySelector('.contact-card[data-role="address"]');
  const addressValue = document.querySelector('[data-role="address-value"]');
  const phoneCard = document.querySelector('.contact-card[data-role="phone"]');
  const phoneValue = document.querySelector('[data-role="phone-value"]');
  const hoursValue = document.querySelector('[data-role="hours-value"]');
  const mapIframe = document.getElementById('contact-map-iframe');

  function populate() {
    const stores = tObj('locations.stores') || [];
    // Build options
    const current = select.value;
    select.innerHTML = stores
      .map((s, i) => `<option value="${i}">${s.name}</option>`)
      .join('');
    // Preserve selection across language toggles
    const idx = current && stores[current] ? current : '0';
    select.value = idx;
    applyStore(+idx);
  }

  function applyStore(i) {
    const stores = tObj('locations.stores') || [];
    const s = stores[i];
    if (!s) return;
    if (addressCard) addressCard.setAttribute('href', gmapsSearch(s.address));
    if (addressValue) addressValue.textContent = s.address;
    if (phoneCard) phoneCard.setAttribute('href', telHref(s.phone));
    if (phoneValue) phoneValue.textContent = s.phone || '';
    if (hoursValue) hoursValue.textContent = s.hours || '';
    if (mapIframe) mapIframe.src = MAP_SRC(`${s.name}, ${s.address}`);
  }

  select.addEventListener('change', (e) => applyStore(+e.target.value));
  populate();
  onLangChange(populate);
}
