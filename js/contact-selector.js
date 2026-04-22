// =======================================================
// CIGAR SHOP — Contact store picker (custom dropdown)
// Div/button/ul dropdown umesto native <select> da izbegnemo browser
// system boje. Klik na trigger otvara panel sa prodavnicama; izbor
// a\u017eurira adresu/telefon/radno vreme kartice + Google Maps iframe.
// =======================================================

import { tObj, onLangChange } from './i18n.js';

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
  const combo = document.getElementById('contact-store-select');
  if (!combo) return;

  const trigger = combo.querySelector('.contact__select-trigger');
  const valueEl = combo.querySelector('.contact__select-value');
  const list    = combo.querySelector('.contact__select-list');

  const addressCard  = document.querySelector('.contact-card[data-role="address"]');
  const addressValue = document.querySelector('[data-role="address-value"]');
  const phoneCard    = document.querySelector('.contact-card[data-role="phone"]');
  const phoneValue   = document.querySelector('[data-role="phone-value"]');
  const hoursValue   = document.querySelector('[data-role="hours-value"]');
  const mapIframe    = document.getElementById('contact-map-iframe');

  let activeIndex = 0;

  function populate() {
    const stores = tObj('locations.stores') || [];
    list.innerHTML = stores.map((s, i) => `
      <li class="contact__select-option${i === activeIndex ? ' is-selected' : ''}"
          role="option" data-value="${i}" aria-selected="${i === activeIndex ? 'true' : 'false'}">
        ${s.name}
      </li>
    `).join('');
    apply(activeIndex);
  }

  function apply(i) {
    const stores = tObj('locations.stores') || [];
    const s = stores[i];
    if (!s) return;
    activeIndex = i;
    valueEl.textContent = s.name;
    list.querySelectorAll('.contact__select-option').forEach((el, idx) => {
      el.classList.toggle('is-selected', idx === i);
      el.setAttribute('aria-selected', idx === i ? 'true' : 'false');
    });
    if (addressCard)  addressCard.setAttribute('href', gmapsSearch(s.address));
    if (addressValue) addressValue.textContent = s.address;
    if (phoneCard)    phoneCard.setAttribute('href', telHref(s.phone));
    if (phoneValue)   phoneValue.textContent = s.phone || '';
    if (hoursValue)   hoursValue.textContent = s.hours || '';
    if (mapIframe)    mapIframe.src = MAP_SRC(`${s.name}, ${s.address}`);
  }

  function open()  { combo.classList.add('is-open');  combo.setAttribute('aria-expanded', 'true');  }
  function close() { combo.classList.remove('is-open'); combo.setAttribute('aria-expanded', 'false'); }
  function toggle() { combo.classList.contains('is-open') ? close() : open(); }

  trigger.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });

  list.addEventListener('click', (e) => {
    const opt = e.target.closest('.contact__select-option');
    if (!opt) return;
    apply(parseInt(opt.dataset.value, 10));
    close();
    trigger.focus();
  });

  trigger.addEventListener('keydown', (e) => {
    const stores = tObj('locations.stores') || [];
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
      list.querySelector('.is-selected')?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      apply(Math.max(0, activeIndex - 1));
    }
  });

  list.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); trigger.focus(); }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!combo.contains(e.target)) close();
  });

  populate();
  onLangChange(populate);
}
