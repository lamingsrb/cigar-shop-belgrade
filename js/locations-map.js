// =======================================================
// CIGAR SHOP — Leaflet mapa Beograda sa 9 žar-tačaka
// =======================================================

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { tObj, onLangChange, t } from './i18n.js';

let map = null;
let markerLayer = null;

export function initLocationsMap() {
  const el = document.getElementById('map');
  if (!el || map) return;

  map = L.map(el, {
    zoomControl: false,
    scrollWheelZoom: false
  }).setView([44.815, 20.455], 12);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Carto Dark Matter — free, tamna estetika, bez API key
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap · © Carto',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);
  renderMarkers();
  onLangChange(renderMarkers);
}

function renderMarkers() {
  if (!map || !markerLayer) return;
  markerLayer.clearLayers();

  const stores = tObj('locations.stores') || [];
  const navLabel = t('locations.navigate') || 'Directions';
  const hoursLabel = t('locations.hoursLabel') || 'Hours';

  stores.forEach((s) => {
    const icon = L.divIcon({
      className: 'ember-marker-wrapper',
      html: '<div class="ember-marker"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const m = L.marker([s.lat, s.lng], { icon }).addTo(markerLayer);
    m.bindPopup(`
      <div style="min-width: 220px;">
        <strong style="font-family:'Cinzel', serif; letter-spacing:0.1em; color:#c9a961; font-size:0.95rem;">
          ${s.name.toUpperCase()}
        </strong>
        <p style="margin:0.5rem 0; font-family:'Cormorant Garamond', serif; font-style:italic; color:#f5e6d3;">
          ${s.address}
        </p>
        <p style="font-size:0.75rem; letter-spacing:0.15em; color:rgba(245,230,211,0.65); margin-bottom:0.4rem;">
          ${hoursLabel}: ${s.hours}
        </p>
        <a href="tel:${(s.phone || '').replace(/\s/g, '')}" style="color:#c9a961; font-size:0.85rem; display:block; margin-bottom:0.4rem;">
          ${s.phone || ''}
        </a>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}" target="_blank" rel="noopener"
           style="color:#e4c88a; font-family:'Inter', sans-serif; font-size:0.75rem; letter-spacing:0.2em; text-transform:uppercase; border-bottom:1px solid #b8935a;">
          ${navLabel} →
        </a>
      </div>
    `);
  });
}
