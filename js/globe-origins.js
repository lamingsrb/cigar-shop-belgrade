// =======================================================
// CIGAR SHOP — 3D globus porekla duvana
// Prava Earth textura (color + normal + spec) + reljef,
// OrbitControls, pulsirajuće žar-tačke sa pinovima,
// atmosfera, auto-rotate
// =======================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { tObj, onLangChange } from './i18n.js';

const REGIONS = [
  { key: 'cuba',      lat: 22.5,  lng: -79.5 },
  { key: 'dominican', lat: 19.0,  lng: -70.7 },
  { key: 'nicaragua', lat: 13.0,  lng: -85.3 },
  { key: 'honduras',  lat: 14.6,  lng: -86.5 },
  { key: 'costa',     lat: 9.7,   lng: -84.1 },
  { key: 'mexico',    lat: 18.0,  lng: -96.7 }
];

function latLngToVec3(lat, lng, radius = 1) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function initGlobeOrigins() {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;
  const section = document.getElementById('origins');
  const panel   = document.getElementById('origin-panel');
  const panelC  = document.getElementById('origin-country');
  const panelD  = document.getElementById('origin-desc');
  const closeBtn = document.getElementById('origin-close');

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.6, 4.2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  function resize() {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  // ---------- orbit controls ----------
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = 2.2;
  controls.maxDistance = 7;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;
  controls.rotateSpeed = 0.7;
  canvas.style.cursor = 'grab';
  canvas.addEventListener('pointerdown', () => { canvas.style.cursor = 'grabbing'; });
  window.addEventListener('pointerup', () => { canvas.style.cursor = 'grab'; });
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
  });
  controls.addEventListener('end', () => {
    clearTimeout(autoRotateTimer);
    autoRotateTimer = setTimeout(() => { controls.autoRotate = true; }, 2500);
  });
  let autoRotateTimer;

  // ---------- lighting (classic three planet lighting) ----------
  scene.add(new THREE.AmbientLight(0x2a1810, 0.6));

  const sun = new THREE.DirectionalLight(0xfff2dc, 1.8);
  sun.position.set(5, 3, 5);
  scene.add(sun);

  const rim = new THREE.DirectionalLight(0xff6b1a, 0.45);
  rim.position.set(-4, -1, -3);
  scene.add(rim);

  // ---------- load earth textures ----------
  const loader = new THREE.TextureLoader();
  const colorMap    = loader.load('/assets/img/earth/earth_atmos_2048.jpg');
  const normalMap   = loader.load('/assets/img/earth/earth_normal_2048.jpg');
  const specularMap = loader.load('/assets/img/earth/earth_specular_2048.jpg');
  const lightsMap   = loader.load('/assets/img/earth/earth_lights_2048.png');

  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = 16;

  // ---------- globe sphere ----------
  const globeGeom = new THREE.SphereGeometry(1, 96, 96);

  // Phong lets us use specular map nicely; enrich with emissive warm tint
  const globeMat = new THREE.MeshPhongMaterial({
    map: colorMap,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.9, 0.9),
    specularMap: specularMap,
    specular: new THREE.Color(0x553520),
    shininess: 18,
    emissive: new THREE.Color(0x2a1810),
    emissiveIntensity: 0.15
  });
  const globe = new THREE.Mesh(globeGeom, globeMat);
  scene.add(globe);

  // ---------- country border grid overlay (wireframe, golden) ----------
  const borderGeom = new THREE.SphereGeometry(1.002, 36, 36);
  const borderMat = new THREE.MeshBasicMaterial({
    color: 0xc9a961,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
    depthWrite: false
  });
  const borderMesh = new THREE.Mesh(borderGeom, borderMat);
  globe.add(borderMesh);

  // ---------- night-side city lights (subtle) ----------
  const lightsMat = new THREE.MeshBasicMaterial({
    map: lightsMap,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.55,
    depthWrite: false
  });
  const nightLights = new THREE.Mesh(new THREE.SphereGeometry(1.003, 96, 96), lightsMat);
  globe.add(nightLights);

  // ---------- atmosphere halo ----------
  const atmosMat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float i = pow(0.82 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
        vec3 warm = vec3(1.0, 0.45, 0.12);
        vec3 gold = vec3(0.79, 0.66, 0.38);
        vec3 col = mix(warm, gold, 0.4);
        gl_FragColor = vec4(col, i * 0.8);
      }
    `
  });
  const atmos = new THREE.Mesh(new THREE.SphereGeometry(1.12, 64, 64), atmosMat);
  scene.add(atmos);

  // ---------- tobacco-origin markers ----------
  const markers = [];
  const markerGroup = new THREE.Group();
  globe.add(markerGroup);

  const glowTex = makePinGlowTexture();

  REGIONS.forEach((r) => {
    const pos = latLngToVec3(r.lat, r.lng, 1.0);
    const surfaceNormal = pos.clone().normalize();

    // core dot slightly above surface
    const dotPos = pos.clone().add(surfaceNormal.clone().multiplyScalar(0.015));
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 20, 20),
      new THREE.MeshBasicMaterial({
        color: 0xffd46a,
        transparent: true,
        opacity: 1,
        depthWrite: false
      })
    );
    dot.position.copy(dotPos);
    dot.userData = { key: r.key };
    markerGroup.add(dot);

    // billboarded glow sprite (kao lens flare)
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xff6b1a,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(glowMat);
    sprite.position.copy(dotPos);
    sprite.scale.set(0.18, 0.18, 1);
    markerGroup.add(sprite);

    // vertical pin tower (ring)
    const pinHeight = 0.09;
    const pinGeom = new THREE.CylinderGeometry(0.003, 0.003, pinHeight, 8);
    const pinMat = new THREE.MeshBasicMaterial({
      color: 0xff6b1a,
      transparent: true,
      opacity: 0.8
    });
    const pin = new THREE.Mesh(pinGeom, pinMat);
    pin.position.copy(dotPos.clone().add(surfaceNormal.clone().multiplyScalar(pinHeight / 2)));
    pin.lookAt(pos.clone().multiplyScalar(10));
    pin.rotateX(Math.PI / 2);
    markerGroup.add(pin);

    // outer pulsing ring on surface (decal-ish)
    const ringGeom = new THREE.RingGeometry(0.025, 0.055, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff6b1a,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.copy(pos.clone().add(surfaceNormal.clone().multiplyScalar(0.005)));
    ring.lookAt(pos.clone().multiplyScalar(10));
    markerGroup.add(ring);

    markers.push({ dot, sprite, ring, pin, key: r.key });
  });

  // ---------- raycaster klik ----------
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(markers.map((m) => m.dot));
    if (hits.length) {
      const key = hits[0].object.userData.key;
      panel.dataset.key = key;
      openPanel(key);
    }
  });

  // hover feedback
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(markers.map((m) => m.dot));
    canvas.style.cursor = hits.length ? 'pointer' : 'grab';
  });

  function openPanel(key) {
    const data = tObj(`origins.countries.${key}`);
    if (!data) return;
    panelC.textContent = data.name;
    panelD.textContent = data.desc;
    panel.classList.add('is-open');
  }
  closeBtn?.addEventListener('click', () => panel.classList.remove('is-open'));
  onLangChange(() => {
    const current = panel.dataset.key;
    if (current) openPanel(current);
  });

  // ---------- loop ----------
  const clock = new THREE.Clock();
  let visible = false;
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => { visible = entry.isIntersecting; });
  }, { threshold: 0 }).observe(section);

  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    const t = clock.getElapsedTime();

    controls.update();

    // marker pulses
    markers.forEach((m, i) => {
      const p = 0.7 + 0.3 * Math.sin(t * 2 + i * 0.9);
      m.dot.scale.setScalar(p);

      const ringP = (t * 0.6 + i * 0.15) % 1;
      m.ring.scale.setScalar(1 + ringP * 2.5);
      m.ring.material.opacity = 0.8 * (1 - ringP);

      const spritePulse = 0.8 + 0.35 * Math.sin(t * 2.3 + i);
      m.sprite.scale.set(0.22 * spritePulse, 0.22 * spritePulse, 1);
    });

    // sun light slow drift for warmth
    sun.position.x = Math.cos(t * 0.03) * 5;
    sun.position.z = Math.sin(t * 0.03) * 5;

    renderer.render(scene, camera);
  }
  tick();
}

// ---------- soft radial gradient for pin glow sprites ----------
function makePinGlowTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255, 200, 120, 1)');
  g.addColorStop(0.3, 'rgba(255, 110, 40, 0.7)');
  g.addColorStop(0.7, 'rgba(255, 70, 10, 0.15)');
  g.addColorStop(1, 'rgba(255, 60, 10, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
