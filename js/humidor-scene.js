// =======================================================
// CIGAR SHOP — humidor 3D walkthrough scene
// Kamera ulazi u humidor dok korisnik scroll-uje sekciju
// =======================================================

import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHumidorScene() {
  const canvas = document.getElementById('humidor-canvas');
  if (!canvas) return;
  const section = document.getElementById('humidor');

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1a0d06, 0.08);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0.2, 8);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  function resize() {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // ---------- warm lights ----------
  const warm = new THREE.PointLight(0xffb877, 2.5, 12, 2);
  warm.position.set(0, 2.2, 2);
  scene.add(warm);

  const ember = new THREE.PointLight(0xff6b1a, 1.6, 8, 2);
  ember.position.set(-2, -0.5, 1);
  scene.add(ember);

  scene.add(new THREE.AmbientLight(0x3d2817, 0.4));

  // ---------- wood texture ----------
  const woodTex = makeWoodTexture();
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.75,
    color: 0x6b3a1c
  });
  const woodDark = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.82,
    color: 0x3d2817
  });

  // ---------- humidor walls (box inside-out) ----------
  const HUMIDOR_W = 10;
  const HUMIDOR_H = 5;
  const HUMIDOR_D = 14;

  const walls = new THREE.Group();
  scene.add(walls);

  // back wall
  const back = new THREE.Mesh(new THREE.PlaneGeometry(HUMIDOR_W, HUMIDOR_H), woodDark);
  back.position.z = -HUMIDOR_D / 2;
  walls.add(back);

  // left wall
  const left = new THREE.Mesh(new THREE.PlaneGeometry(HUMIDOR_D, HUMIDOR_H), woodDark);
  left.rotation.y = Math.PI / 2;
  left.position.x = -HUMIDOR_W / 2;
  walls.add(left);

  // right wall
  const right = new THREE.Mesh(new THREE.PlaneGeometry(HUMIDOR_D, HUMIDOR_H), woodDark);
  right.rotation.y = -Math.PI / 2;
  right.position.x = HUMIDOR_W / 2;
  walls.add(right);

  // ceiling
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(HUMIDOR_W, HUMIDOR_D), woodMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = HUMIDOR_H / 2;
  walls.add(ceil);

  // floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HUMIDOR_W, HUMIDOR_D), woodMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -HUMIDOR_H / 2;
  walls.add(floor);

  // ---------- shelves with cigars ----------
  const cigarMat = new THREE.MeshStandardMaterial({
    color: 0x6a3c1e,
    roughness: 0.78
  });
  const bandMat = new THREE.MeshStandardMaterial({
    color: 0xc9a961,
    roughness: 0.3,
    metalness: 0.6
  });

  const cigarGeom = new THREE.CylinderGeometry(0.08, 0.075, 1.6, 12);
  cigarGeom.rotateZ(Math.PI / 2);
  const cigarMesh = new THREE.InstancedMesh(cigarGeom, cigarMat, 180);
  scene.add(cigarMesh);

  const dummy = new THREE.Object3D();
  let idx = 0;

  const SHELF_LEVELS = [-1.4, 0.1, 1.6];
  const shelfMat = new THREE.MeshStandardMaterial({
    color: 0x4a2813,
    roughness: 0.6
  });

  SHELF_LEVELS.forEach((y) => {
    // shelf plank (both sides of corridor)
    [-2.6, 2.6].forEach((xSide) => {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.08, HUMIDOR_D - 1),
        shelfMat
      );
      plank.position.set(xSide, y - 0.1, 0);
      scene.add(plank);

      // row of cigars on the plank
      for (let z = -HUMIDOR_D / 2 + 1.2; z < HUMIDOR_D / 2 - 1; z += 0.22) {
        if (idx >= 180) break;
        dummy.position.set(
          xSide + (Math.random() - 0.5) * 0.15,
          y - 0.02,
          z + (Math.random() - 0.5) * 0.05
        );
        dummy.rotation.y = Math.random() * 0.2 - 0.1;
        dummy.scale.setScalar(0.9 + Math.random() * 0.15);
        dummy.updateMatrix();
        cigarMesh.setMatrixAt(idx, dummy.matrix);
        idx++;
      }
    });
  });
  cigarMesh.count = idx;
  cigarMesh.instanceMatrix.needsUpdate = true;

  // Glowing hanging pendant lights
  for (let z = -HUMIDOR_D / 2 + 2; z < HUMIDOR_D / 2; z += 3.5) {
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffb877, transparent: true, opacity: 0.9 })
    );
    bulb.position.set(0, HUMIDOR_H / 2 - 0.6, z);
    scene.add(bulb);

    const bulbLight = new THREE.PointLight(0xffaa55, 1.4, 6, 2);
    bulbLight.position.copy(bulb.position);
    scene.add(bulbLight);
  }

  // ---------- scroll drives camera dolly ----------
  const scrollState = { progress: 0 };
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => { scrollState.progress = self.progress; }
  });

  // ---------- loop ----------
  let visible = false;
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => { visible = entry.isIntersecting; });
  }, { threshold: 0 }).observe(section);

  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;

    // camera dolly from outside → deep into humidor
    const p = scrollState.progress;
    camera.position.z = 8 - p * 12;      // start outside, travel inside
    camera.position.y = 0.1 + Math.sin(p * Math.PI) * 0.2;
    camera.lookAt(0, 0, -HUMIDOR_D / 2);

    renderer.render(scene, camera);
  }
  tick();
}

// ---------- procedural wood grain ----------
function makeWoodTexture() {
  const w = 512, h = 512;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#4a2813');
  grad.addColorStop(0.5, '#6a3c1e');
  grad.addColorStop(1, '#3d2010');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // grain rings
  ctx.strokeStyle = 'rgba(30, 15, 5, 0.22)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 80; i++) {
    const y = (i / 80) * h + (Math.sin(i * 0.5) * 3);
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < w; x += 6) {
      ctx.lineTo(x, y + Math.sin((x + i * 40) * 0.03) * 2);
    }
    ctx.stroke();
  }

  // knots
  for (let i = 0; i < 4; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 6 + Math.random() * 10;
    const kg = ctx.createRadialGradient(x, y, 0, x, y, r);
    kg.addColorStop(0, '#1a0806');
    kg.addColorStop(1, 'rgba(26, 8, 6, 0)');
    ctx.fillStyle = kg;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.anisotropy = 8;
  return tex;
}
