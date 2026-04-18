// =======================================================
// CIGAR SHOP — hero 3D match + matchbox
// Horizontalna šibica koja lebdi pored matchbox-a.
// Drag & drop mišem: povuci šibicu, spusti je na strike strip → kresne se.
// Plamen uvek ide strogo na gore (world +Y), bez obzira na rotaciju šibice.
// Prinesi upaljenu šibicu vrhu cigare → cigara se pali.
// =======================================================

import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * Dodaje šibicu i matchbox u scenu i vraća API za integraciju sa cigar ember logikom.
 *
 * @param {THREE.Scene} scene
 * @param {THREE.PerspectiveCamera} camera
 * @param {HTMLCanvasElement} canvas
 * @param {() => THREE.Vector3} getCigarTipWorld   — računa world poziciju vrha cigare svakog tick-a
 * @returns {{ update(dt:number, t:number): void, isLit(): boolean, consumeCigarLit(): boolean }}
 */
export function initHeroMatch(scene, camera, canvas, getCigarTipWorld) {

  // --- Pozicije u sceni (podignute na nivo cigare) ---
  const MATCHBOX_POS = new THREE.Vector3(3.0, -0.35, 0.15);
  const MATCH_REST_POS = new THREE.Vector3(3.0, 0.45, 0.25);
  const MATCH_REST_ROT_Z = Math.PI / 2;  // glava okrenuta ULEVO (ka cigari)
  const STRIKE_DISTANCE = 0.6;
  const LIGHT_DISTANCE = 0.55;
  const IGNITE_RATE = 0.6;     // 0..1 progress po sekundi kada je plamen uz vrh
  const IGNITE_DECAY = 0.25;   // opadanje kada je plamen udaljen

  // =====================================================
  // MATCHBOX — karton sa strike strip-om
  // =====================================================
  const boxGroup = new THREE.Group();
  boxGroup.position.copy(MATCHBOX_POS);
  // Rotirana tako da strike strip gleda ka cigari (ULEVO)
  boxGroup.rotation.set(0.1, 0.4, 0);
  scene.add(boxGroup);

  const BOX_W = 1.3, BOX_H = 0.38, BOX_D = 0.85;
  const boxBodyGeom = new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D);
  const boxBodyMat = new THREE.MeshStandardMaterial({
    map: makeMatchboxLabelTexture(),
    roughness: 0.88,
    metalness: 0.02,
    color: 0xc48a3a
  });
  const boxBody = new THREE.Mesh(boxBodyGeom, boxBodyMat);
  boxGroup.add(boxBody);

  // Strike strip (prednja strana kutije)
  const stripGeom = new THREE.PlaneGeometry(BOX_W * 0.92, BOX_H * 0.55);
  const stripMat = new THREE.MeshStandardMaterial({
    map: makeStrikeStripTexture(),
    roughness: 0.95,
    metalness: 0.0,
    color: 0x1a0d06
  });
  const strikeStrip = new THREE.Mesh(stripGeom, stripMat);
  strikeStrip.position.set(0, 0, BOX_D / 2 + 0.001);
  boxGroup.add(strikeStrip);

  // Strip takođe na gornjoj strani (standardno mesto za strike na safety match kutiji)
  const stripTop = new THREE.Mesh(stripGeom, stripMat.clone());
  stripTop.rotation.x = -Math.PI / 2;
  stripTop.position.set(0, BOX_H / 2 + 0.001, 0);
  stripTop.scale.set(1, 0.6, 1);
  boxGroup.add(stripTop);

  // World-space pozicija strike strip-a za distance check
  const strikeZoneWorld = new THREE.Vector3();
  function updateStrikeZone() {
    stripTop.updateMatrixWorld();
    strikeZoneWorld.setFromMatrixPosition(stripTop.matrixWorld);
  }

  // =====================================================
  // MATCH (šibica) — horizontalna, glava gleda ka cigari (levo)
  // =====================================================
  const matchGroup = new THREE.Group();
  matchGroup.position.copy(MATCH_REST_POS);
  matchGroup.scale.setScalar(0.75);
  // rotation.z = +PI/2 → stick geometry (Y-up default) leži horizontalno,
  // glava je na -X kraju (ka cigari, LEVO), neupaljen kraj na +X (DESNO).
  matchGroup.rotation.z = MATCH_REST_ROT_Z;
  scene.add(matchGroup);

  // Drveni štap
  const stickGeom = new THREE.CylinderGeometry(0.035, 0.035, 2.0, 14);
  const stickMat = new THREE.MeshStandardMaterial({
    color: 0xd4a56a,
    roughness: 0.92,
    metalness: 0.02,
    emissive: 0x2e1d0c,
    emissiveIntensity: 0.12
  });
  const stick = new THREE.Mesh(stickGeom, stickMat);
  matchGroup.add(stick);

  // Zona koja će sagorevati (ispod glave)
  const charGeom = new THREE.CylinderGeometry(0.038, 0.04, 0.22, 14);
  const charMat = new THREE.MeshStandardMaterial({
    color: 0x2a1408, roughness: 0.95,
    emissive: 0x6a2a08, emissiveIntensity: 0.0
  });
  const charred = new THREE.Mesh(charGeom, charMat);
  charred.position.y = 0.88;
  matchGroup.add(charred);

  // Glava šibice
  const headGeom = new THREE.SphereGeometry(0.10, 18, 12);
  headGeom.scale(1, 1.45, 1);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x9a2e16, roughness: 0.55, metalness: 0.02,
    emissive: 0x3a0a04, emissiveIntensity: 0.12
  });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.y = 1.08;
  matchGroup.add(head);

  // Head world pozicija (izračunava se svaki tick)
  const headWorld = new THREE.Vector3();

  // =====================================================
  // PLAMEN — CHILD SCENE-A, ne matchGroup-a.
  // Uvek ide strogo na gore (world +Y), bez obzira na rotaciju šibice.
  // =====================================================
  const flameGeom = new THREE.PlaneGeometry(0.5, 0.85);
  const flameMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:      { value: 0 },
      uIntensity: { value: 0 }
    },
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uTime, uIntensity;
      varying vec2 vUv;
      vec2 hash(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return -1.0+2.0*fract(sin(p)*43758.5453); }
      float noise(vec2 p){
        const float K1=0.366025404,K2=0.211324865;
        vec2 i=floor(p+(p.x+p.y)*K1); vec2 a=p-i+(i.x+i.y)*K2;
        vec2 o=(a.x>a.y)?vec2(1.0,0.0):vec2(0.0,1.0);
        vec2 b=a-o+K2; vec2 c=a-1.0+2.0*K2;
        vec3 h=max(0.5-vec3(dot(a,a),dot(b,b),dot(c,c)),0.0);
        vec3 n=h*h*h*h*vec3(dot(a,hash(i)),dot(b,hash(i+o)),dot(c,hash(i+1.0)));
        return dot(n,vec3(70.0));
      }
      float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.1; a*=0.5; } return v; }
      void main(){
        if (uIntensity <= 0.001) discard;
        vec2 uv = vUv;
        float horizontal = abs(uv.x - 0.5) * 2.0;
        float verticalFade = 1.0 - smoothstep(0.15, 1.0, uv.y);
        float flameShape = smoothstep(0.9, 0.2, horizontal / max(verticalFade, 0.001));
        if (flameShape < 0.01) discard;
        float n = fbm(vec2(uv.x * 3.0, uv.y * 2.0 - uTime * 2.5));
        float flicker = 0.75 + 0.4 * n;
        vec3 white  = vec3(1.0, 0.96, 0.82);
        vec3 yellow = vec3(1.0, 0.82, 0.3);
        vec3 orange = vec3(1.0, 0.45, 0.1);
        vec3 red    = vec3(0.85, 0.15, 0.05);
        vec3 col = mix(red, orange, smoothstep(0.0, 0.35, uv.y));
        col = mix(col, yellow, smoothstep(0.25, 0.6, uv.y));
        col = mix(col, white,  smoothstep(0.55, 0.9, uv.y));
        col *= flicker * uIntensity;
        float alpha = flameShape * flicker * uIntensity;
        gl_FragColor = vec4(col, alpha);
      }
    `
  });
  const flame = new THREE.Mesh(flameGeom, flameMat);
  flame.visible = false;
  flame.renderOrder = 15;
  scene.add(flame);

  const flameGlowTex = makeRadialGlowTexture();
  const flameGlowMat = new THREE.MeshBasicMaterial({
    map: flameGlowTex, color: 0xffb060,
    transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const flameGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), flameGlowMat);
  flameGlow.visible = false;
  flameGlow.renderOrder = 14;
  scene.add(flameGlow);

  const flameLight = new THREE.PointLight(0xffa040, 0, 4.5, 2);
  scene.add(flameLight);

  // =====================================================
  // DRAG + STATE
  // =====================================================
  const state = {
    mode: 'idle',           // 'idle' | 'dragging' | 'striking' | 'returning' | 'lit'
    lit: false,             // trenutno gori plamen?
    strikeProgress: 0,      // 0..1 ramp
    ignitionProgress: 0,    // 0..1 koliko je cigara zapaljena proximity-em
    cigarLit: false         // flag za spoljnu logiku (once progress ≥ 1)
  };

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const matchHitTargets = [stick, head, charred];

  // Drag plane — z = rest z (parallel ekranu)
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -MATCH_REST_POS.z);
  const dragOffset = new THREE.Vector3();
  const dragHit = new THREE.Vector3();

  let hoverOn = false;

  function hitMatch(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObjects(matchHitTargets).length > 0;
  }
  function hitBox(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObject(boxBody).length > 0;
  }

  function updateDragPos(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    raycaster.ray.intersectPlane(dragPlane, dragHit);
    matchGroup.position.copy(dragHit).sub(dragOffset);
  }

  function onPointerDown(e) {
    if (!hitMatch(e.clientX, e.clientY)) return false; // ne obradi, pusti cigar drag
    state.mode = 'dragging';
    const r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    raycaster.ray.intersectPlane(dragPlane, dragHit);
    dragOffset.copy(dragHit).sub(matchGroup.position);
    canvas.style.cursor = 'grabbing';
    return true;
  }

  function onPointerMove(e) {
    // Hover feedback (samo kad nije drag)
    if (state.mode === 'idle') {
      const h = hitMatch(e.clientX, e.clientY);
      if (h !== hoverOn) {
        hoverOn = h;
        canvas.style.cursor = h ? 'grab' : '';
      }
    }
    // Body klasa: skriva ember cursor + blokira particle burst iznad 3D objekata
    const over3D = state.mode === 'dragging' || hitMatch(e.clientX, e.clientY) || hitBox(e.clientX, e.clientY);
    document.body.classList.toggle('is-over-3d', over3D);
    if (state.mode === 'dragging') updateDragPos(e.clientX, e.clientY);
  }

  function onPointerUp() {
    if (state.mode !== 'dragging') return;
    canvas.style.cursor = hoverOn ? 'grab' : '';

    // Ako nije upaljena i blizu je matchbox strike zone → strike!
    updateStrikeZone();
    const distToStrike = matchGroup.position.distanceTo(strikeZoneWorld);

    if (!state.lit && distToStrike < STRIKE_DISTANCE) {
      triggerStrike();
      return;
    }

    // Inače: vrati na rest poziciju (animirano).
    // NAPOMENA: proximity-paljenje cigare se sada de\u0161ava KONTINUIRANO dok
    // korisnik dr\u017ei \u0161ibicu blizu vrha (u update()), a NE na pointerup.
    returnToRest(0.6);
  }

  function returnToRest(duration) {
    state.mode = 'returning';
    gsap.to(matchGroup.position, {
      x: MATCH_REST_POS.x, y: MATCH_REST_POS.y, z: MATCH_REST_POS.z,
      duration, ease: 'power2.out',
      onComplete: () => { state.mode = state.lit ? 'lit' : 'idle'; }
    });
    gsap.to(matchGroup.rotation, {
      z: MATCH_REST_ROT_Z, duration, ease: 'power2.out'
    });
  }

  function triggerStrike() {
    state.mode = 'striking';
    updateStrikeZone();

    // Fizička animacija: šibica klizi preko strip-a (translate + mali rotate), onda se pali
    const startPos = matchGroup.position.clone();
    const endPos = strikeZoneWorld.clone().add(new THREE.Vector3(-BOX_W * 0.35, 0.15, 0));

    gsap.timeline({ onComplete: () => { state.mode = 'lit'; state.lit = true; } })
      .to(matchGroup.position, {
        x: strikeZoneWorld.x + BOX_W * 0.2, y: strikeZoneWorld.y + 0.1, z: strikeZoneWorld.z,
        duration: 0.12, ease: 'power2.out'
      })
      .to(matchGroup.position, {
        x: strikeZoneWorld.x - BOX_W * 0.3, y: strikeZoneWorld.y + 0.05, z: strikeZoneWorld.z,
        duration: 0.22, ease: 'power2.in'
      })
      .to(matchGroup.rotation, {
        z: MATCH_REST_ROT_Z - 0.15, duration: 0.22, ease: 'power2.in'
      }, '<')
      .to({}, { duration: 0.05 })
      .add(() => {
        state.strikeProgress = 0;
        flame.visible = true;
        flameGlow.visible = true;
      })
      .to(matchGroup.position, {
        x: endPos.x, y: endPos.y + 0.4, z: endPos.z,
        duration: 0.35, ease: 'power2.out'
      })
      .to(matchGroup.rotation, {
        z: MATCH_REST_ROT_Z, duration: 0.35, ease: 'power2.out'
      }, '<');
  }

  function extinguish(duration) {
    gsap.to(flameMat.uniforms.uIntensity, {
      value: 0, duration, ease: 'power2.in',
      onComplete: () => {
        flame.visible = false;
        flameGlow.visible = false;
        state.lit = false;
        head.material.color.setHex(0x9a2e16);
      }
    });
    gsap.to(flameGlowMat, { opacity: 0, duration });
    gsap.to(flameLight, { intensity: 0, duration });
  }

  // Attach event listeners. Cigar pointerdown handler u hero-cigar.js zove ovaj first;
  // ako vraća true (hit match) — onda cigar drag se ne pokreće.
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  // =====================================================
  // Per-frame update
  // =====================================================
  const WORLD_UP = new THREE.Vector3(0, 1, 0);

  function update(dt, t) {
    // 1) Idle lebdenje (samo kad nije drag/strike)
    if (state.mode === 'idle') {
      matchGroup.position.x = MATCH_REST_POS.x + Math.sin(t * 0.6) * 0.05;
      matchGroup.position.y = MATCH_REST_POS.y + Math.sin(t * 0.9) * 0.10;
      matchGroup.rotation.z = MATCH_REST_ROT_Z + Math.sin(t * 0.5) * 0.06;
      head.material.emissiveIntensity = 0.12 + Math.abs(Math.sin(t * 1.8)) * 0.08 + (hoverOn ? 0.18 : 0);
    } else if (state.mode === 'lit') {
      const lx = matchGroup.position.x, ly = matchGroup.position.y;
      matchGroup.position.x = lx + Math.sin(t * 0.8) * 0.004;
      matchGroup.position.y = ly + Math.sin(t * 1.1) * 0.003;
    }

    // 2) Strike progress ramp
    if (state.lit && state.strikeProgress < 1) {
      state.strikeProgress = Math.min(1, state.strikeProgress + dt * 1.2);
    }

    // 3) Plamen — STROGO world-up iznad head-a (ne prati rotaciju šibice)
    head.getWorldPosition(headWorld);
    if (flame.visible) {
      flame.position.copy(headWorld).addScaledVector(WORLD_UP, 0.45);
      flame.quaternion.copy(camera.quaternion);
      flameGlow.position.copy(headWorld).addScaledVector(WORLD_UP, 0.25);
      flameGlow.quaternion.copy(camera.quaternion);
      flameLight.position.copy(headWorld).addScaledVector(WORLD_UP, 0.35);

      const p = state.strikeProgress;
      const flicker = 0.9 + Math.sin(t * 9) * 0.12;
      flameMat.uniforms.uIntensity.value = p;
      flameMat.uniforms.uTime.value = t;
      flameGlowMat.opacity = 0.55 * p * (0.85 + Math.sin(t * 8) * 0.15);
      flameGlow.scale.setScalar(0.8 + p * 0.4 + Math.sin(t * 6) * 0.08);
      flameLight.intensity = 2.8 * p * flicker;
      head.material.emissiveIntensity = 0.12 + p * 0.6;
      if (p > 0.5) head.material.color.setHex(0x4a1a0a);
      charred.material.emissiveIntensity = p * 0.35;
    }

    // 4) Proximity-based ignition cigare — KONTINUIRANO dok je \u0161ibica blizu
    const tip = getCigarTipWorld();
    const flameToTip = headWorld.distanceTo(tip);
    const isClose = state.lit && flameToTip < LIGHT_DISTANCE && state.strikeProgress > 0.4;

    if (isClose) {
      state.ignitionProgress = Math.min(1, state.ignitionProgress + dt * IGNITE_RATE);
      if (state.ignitionProgress >= 1 && !state.cigarLit) {
        state.cigarLit = true;
      }
    } else if (!state.cigarLit) {
      // Opada samo dok cigara jo\u0161 nije upaljena
      state.ignitionProgress = Math.max(0, state.ignitionProgress - dt * IGNITE_DECAY);
    }

    // Audio crackle: intenzitet prati ignitionProgress
    setCrackleLevel(isClose ? state.ignitionProgress : 0);
  }

  return {
    update,
    isLit: () => state.lit,
    consumeCigarLit: () => {
      const was = state.cigarLit;
      state.cigarLit = false;
      return was;
    },
    /** 0..1 — koliko je cigara zapaljena od šibice (za progresivni ember boost) */
    getIgnitionProgress: () => state.ignitionProgress,
    /** Pointer hit testovi — koristi ih cigar handler da izbegne drag sudar */
    isOverMatch: (e) => hitMatch(e.clientX, e.clientY),
    isOverBox:   (e) => hitBox(e.clientX, e.clientY)
  };
}

// =======================================================
// Procedural crackle SFX (Web Audio, bez external fajlova)
// Generise belu noise + filter → simulira pucketanje \u017eara.
// =======================================================
let audioCtx = null;
let crackleNoise = null;
let crackleGain = null;
let crackleFilter = null;
let crackleStarted = false;

function ensureCrackle() {
  if (audioCtx) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
    // Pre-gen noise buffer (2 sekunde, mono)
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // Sparse crackle: većinom 0, povremeno spike
      data[i] = Math.random() < 0.08 ? (Math.random() * 2 - 1) * 0.6 : 0;
    }
    crackleNoise = audioCtx.createBufferSource();
    crackleNoise.buffer = buf;
    crackleNoise.loop = true;

    crackleFilter = audioCtx.createBiquadFilter();
    crackleFilter.type = 'bandpass';
    crackleFilter.frequency.value = 900;
    crackleFilter.Q.value = 1.2;

    crackleGain = audioCtx.createGain();
    crackleGain.gain.value = 0;

    crackleNoise.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(audioCtx.destination);
  } catch (err) {
    console.warn('[CigarShop] Web Audio unavailable', err);
  }
}

/** level: 0..1 — intenzitet crackle-a (0 = tišina, 1 = pun pucketaj) */
function setCrackleLevel(level) {
  ensureCrackle();
  if (!audioCtx || !crackleGain) return;
  // Resume context on first user gesture (browsers suspenduju dok nema gesture)
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  if (!crackleStarted && level > 0.01) {
    try { crackleNoise.start(0); crackleStarted = true; } catch (_) {}
  }
  const target = Math.max(0, Math.min(0.35, level * 0.35));
  // Glatka tranzicija (izbegava klikove u zvuku)
  crackleGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.08);
}

// =======================================================
// Procedural textures
// =======================================================
function makeMatchboxLabelTexture() {
  const s = 512;
  const c = document.createElement('canvas'); c.width = s; c.height = s;
  const ctx = c.getContext('2d');
  // Base karton — topli žuto-braon
  const g = ctx.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, '#d49650'); g.addColorStop(0.5, '#b87838'); g.addColorStop(1, '#8a5522');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  // Karton noise/tekstura
  for (let i = 0; i < 4500; i++) {
    ctx.fillStyle = `rgba(${30 + Math.random() * 40}, ${15 + Math.random() * 25}, 5, ${0.06 + Math.random() * 0.12})`;
    ctx.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 2, 1 + Math.random() * 1.5);
  }
  // Suptilna "CIGAR SHOP" marka u centru
  ctx.fillStyle = 'rgba(42, 24, 16, 0.45)';
  ctx.font = 'bold 46px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CIGAR SHOP', s / 2, s / 2);
  // Rub
  ctx.strokeStyle = 'rgba(42, 24, 16, 0.35)';
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, s - 28, s - 28);
  return new THREE.CanvasTexture(c);
}

function makeStrikeStripTexture() {
  const s = 256;
  const c = document.createElement('canvas'); c.width = s; c.height = s;
  const ctx = c.getContext('2d');
  // Tamna baza (sandpaper)
  ctx.fillStyle = '#120a06';
  ctx.fillRect(0, 0, s, s);
  // Grubi peskoviti feel
  for (let i = 0; i < 18000; i++) {
    const v = 30 + Math.random() * 60;
    ctx.fillStyle = `rgba(${v}, ${v * 0.8}, ${v * 0.5}, ${0.3 + Math.random() * 0.5})`;
    ctx.fillRect(Math.random() * s, Math.random() * s, 1, 1);
  }
  // Sitni crveni i narandzasti flecks (fosforna čestica)
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(180, 50, 20, 0.5)' : 'rgba(220, 110, 40, 0.4)';
    ctx.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random(), 1 + Math.random());
  }
  return new THREE.CanvasTexture(c);
}

function makeRadialGlowTexture() {
  const s = 256;
  const c = document.createElement('canvas'); c.width = s; c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255, 200, 120, 1)');
  g.addColorStop(0.25, 'rgba(255, 130, 40, 0.7)');
  g.addColorStop(0.55, 'rgba(255, 80, 20, 0.18)');
  g.addColorStop(1, 'rgba(255, 60, 10, 0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}
