// =======================================================
// CIGAR SHOP — hero cinematic scene (samo cigara)
// Čaša viskija je Sketchfab iframe model (CC-BY, Francesco Coldesina)
// Drag-to-rotate cigara, world-space dim, custom žar shader, dust motes.
// =======================================================

import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHeroCigar() {
  console.log('[CigarShop] hero-cigar init');
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0605, 0.034);

  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.25, 8.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.55;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Transparent — CSS hero__bg se vidi ispod, iframe je pored
  scene.background = null;

  // ---------- Lights ----------
  const key = new THREE.PointLight(0xffc89a, 4.2, 14, 2);
  key.position.set(-1.2, 1.5, 2.8);
  scene.add(key);

  const fillFront = new THREE.PointLight(0xffd4a0, 2.2, 10, 2);
  fillFront.position.set(-1.5, 0.2, 4);
  scene.add(fillFront);

  const rim = new THREE.PointLight(0xc9a961, 1.8, 10, 2);
  rim.position.set(-3.5, -0.3, 1.0);
  scene.add(rim);

  // žar light — kratki domet, ne dominira scenom
  const emberLight = new THREE.PointLight(0xff6b1a, 1.4, 2.2, 2);
  scene.add(emberLight);

  scene.add(new THREE.AmbientLight(0xa07050, 0.95));

  // =======================================================
  // CIGAR (pomeranje ulevo-centar; čaša je iframe na desnoj)
  // =======================================================
  const cigarGroup = new THREE.Group();
  cigarGroup.position.set(-1.4, 0.5, 0);
  cigarGroup.scale.setScalar(0.82);
  scene.add(cigarGroup);

  const bodyGeom = new THREE.CylinderGeometry(0.28, 0.26, 4.4, 96, 32, false);
  bodyGeom.rotateZ(Math.PI / 2);
  cigarGroup.add(new THREE.Mesh(bodyGeom, new THREE.MeshStandardMaterial({
    map: makeCigarTexture(),
    normalMap: makeCigarNormal(),
    normalScale: new THREE.Vector2(0.45, 0.45),
    roughness: 0.72, metalness: 0.05, color: 0xc68256,
    emissive: 0x5a2e10, emissiveIntensity: 0.5
  })));

  const bandGeom = new THREE.CylinderGeometry(0.287, 0.287, 0.5, 96, 1, false);
  bandGeom.rotateZ(Math.PI / 2);
  const band = new THREE.Mesh(bandGeom, new THREE.MeshStandardMaterial({
    color: 0xc9a961, roughness: 0.25, metalness: 0.88,
    emissive: 0x3a2d13, emissiveIntensity: 0.22
  }));
  band.position.x = -1.1;
  cigarGroup.add(band);

  const accentGeom = new THREE.CylinderGeometry(0.29, 0.29, 0.1, 96, 1, false);
  accentGeom.rotateZ(Math.PI / 2);
  const accent = new THREE.Mesh(accentGeom, new THREE.MeshStandardMaterial({
    color: 0x2a1810, roughness: 0.4, metalness: 0.3,
    emissive: 0xff6b1a, emissiveIntensity: 0.4
  }));
  accent.position.x = -1.1;
  cigarGroup.add(accent);

  // Ember tip shader
  const emberGeom = new THREE.CircleGeometry(0.28, 64);
  emberGeom.rotateY(Math.PI / 2);
  const emberMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } }, transparent: true, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      precision highp float; uniform float uTime; varying vec2 vUv;
      vec2 hash(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return -1.0+2.0*fract(sin(p)*43758.5453123); }
      float noise(vec2 p){
        const float K1=0.366025404,K2=0.211324865;
        vec2 i=floor(p+(p.x+p.y)*K1); vec2 a=p-i+(i.x+i.y)*K2;
        vec2 o=(a.x>a.y)?vec2(1.0,0.0):vec2(0.0,1.0);
        vec2 b=a-o+K2; vec2 c=a-1.0+2.0*K2;
        vec3 h=max(0.5-vec3(dot(a,a),dot(b,b),dot(c,c)),0.0);
        vec3 n=h*h*h*h*vec3(dot(a,hash(i)),dot(b,hash(i+o)),dot(c,hash(i+1.0)));
        return dot(n,vec3(70.0));
      }
      float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.05; a*=0.5; } return v; }
      void main(){
        vec2 uv=vUv-0.5; float d=length(uv)*2.0; if(d>1.0) discard;
        float n=fbm(uv*5.0+vec2(uTime*0.8,-uTime*0.4));
        float n2=noise(uv*18.0+vec2(uTime*0.5));
        float heat=smoothstep(1.0,0.0,d)*(0.45+0.55*n+0.25*n2);
        float ashM=smoothstep(0.75,1.0,d);
        vec3 col=mix(vec3(0.35,0.18,0.1),vec3(1.0,0.38,0.06),smoothstep(0.1,0.55,heat));
        col=mix(col,vec3(1.0,0.88,0.45),smoothstep(0.6,0.9,heat));
        col=mix(col,vec3(1.0,0.96,0.78),smoothstep(0.92,1.05,heat));
        col=mix(col,vec3(0.12,0.1,0.09),ashM*0.78);
        float pulse=0.82+0.18*sin(uTime*2.5+n*4.0)+0.06*sin(uTime*8.3);
        col*=pulse;
        gl_FragColor=vec4(col, smoothstep(1.0,0.78,d));
      }
    `
  });
  const emberMesh = new THREE.Mesh(emberGeom, emberMat);
  emberMesh.position.x = 2.22;
  cigarGroup.add(emberMesh);

  // Glow discs — tight, pored same žari, ne halo
  const glowTex = makeGlowTexture();
  const glowMat = new THREE.MeshBasicMaterial({ map: glowTex, color: 0xff6b1a, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), glowMat);
  glow.position.x = 2.23; glow.rotation.y = Math.PI / 2;
  cigarGroup.add(glow);
  const glow2Mat = new THREE.MeshBasicMaterial({ map: glowTex, color: 0xffaa55, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false });
  const glow2 = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), glow2Mat);
  glow2.position.x = 2.24; glow2.rotation.y = Math.PI / 2;
  cigarGroup.add(glow2);

  // =======================================================
  // MATCH (\u0160IBICA) — pored cigare, lebdi, \u010deka klik da kresne
  // Proporcije: \u0161ibica ~1/3 du\u017eine cigare (~5cm vs ~15cm u stvarnom svetu).
  // =======================================================
  const matchGroup = new THREE.Group();
  matchGroup.position.set(2.7, -0.4, 0.2);
  matchGroup.scale.setScalar(0.72);
  matchGroup.rotation.z = -0.28;
  scene.add(matchGroup);

  // Drveni \u0161tap
  const stickGeom = new THREE.CylinderGeometry(0.035, 0.035, 2.2, 14);
  const stickMat = new THREE.MeshStandardMaterial({
    color: 0xd4a56a,
    roughness: 0.92,
    metalness: 0.02,
    emissive: 0x3a2515,
    emissiveIntensity: 0.15
  });
  const stick = new THREE.Mesh(stickGeom, stickMat);
  matchGroup.add(stick);

  // \u010carbon zone (dno \u0161tapa — zapa\u010deno nakon paljenja)
  const charGeom = new THREE.CylinderGeometry(0.036, 0.038, 0.25, 14);
  const charMat = new THREE.MeshStandardMaterial({
    color: 0x2a1408,
    roughness: 0.95,
    emissive: 0x6a2a08,
    emissiveIntensity: 0.0  // pali se nakon strike
  });
  const charred = new THREE.Mesh(charGeom, charMat);
  charred.position.y = 1.0;
  matchGroup.add(charred);

  // Glava \u0161ibice (crveno-braon)
  const headGeom = new THREE.SphereGeometry(0.11, 20, 14);
  headGeom.scale(1, 1.55, 1);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x9a2e16,
    roughness: 0.55,
    metalness: 0.02,
    emissive: 0x3a0a04,
    emissiveIntensity: 0.12
  });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.y = 1.24;
  matchGroup.add(head);

  // Plamen — sprite-like ali shader-driven. Vidljiv samo nakon strike-a.
  const flameGeom = new THREE.PlaneGeometry(0.55, 0.95, 1, 1);
  const flameMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:      { value: 0 },
      uIntensity: { value: 0 }  // 0=ugasen, 1=pun plamen
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
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

      void main() {
        // Rani exit ako je plamen ugašen — additive blend ignoriše alpha pa MORAMO da nuliramo col
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

        // KRITI\u010cNO: col × uIntensity da additive blending vidi 0 kad je ugašen
        col *= flicker * uIntensity;
        float alpha = flameShape * flicker * uIntensity;

        gl_FragColor = vec4(col, alpha);
      }
    `
  });
  const flame = new THREE.Mesh(flameGeom, flameMat);
  flame.position.y = 1.78;
  flame.visible = false; // pojavljuje se tek nakon prvog klik-a
  matchGroup.add(flame);

  // Vru\u0107a to\u010dka (drugi, manji glow disc iza plamena)
  const flameGlowMat = new THREE.MeshBasicMaterial({
    map: glowTex,
    color: 0xffb060,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const flameGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), flameGlowMat);
  flameGlow.position.y = 1.55;
  matchGroup.add(flameGlow);

  // Svetlo koje plamen baca na scenu
  const flameLight = new THREE.PointLight(0xffa040, 0, 4.5, 2);
  flameLight.position.y = 1.6;
  matchGroup.add(flameLight);

  // State: pre/tokom/posle strike-a
  const matchState = {
    ignited: false,
    strikeT: 0,        // time of strike event
    progress: 0,       // 0..1 animation progress
    hover: false
  };

  // =======================================================
  // WORLD-SPACE SMOKE
  // =======================================================
  const SMOKE_COUNT = window.innerWidth < 800 ? 280 : 620;
  const sPos = new Float32Array(SMOKE_COUNT * 3);
  const sVel = new Float32Array(SMOKE_COUNT * 3);
  const sLife = new Float32Array(SMOKE_COUNT);
  const sMaxLife = new Float32Array(SMOKE_COUNT);
  const sSize = new Float32Array(SMOKE_COUNT);

  const tipWorld = new THREE.Vector3();
  const tipLocal = new THREE.Vector3(2.22, 0, 0);

  function resetSmoke(i, initLife = 0) {
    const verticalOffset = Math.random() * 3.5;
    sPos[i * 3 + 0] = tipWorld.x + (Math.random() - 0.5) * (0.18 + verticalOffset * 0.3);
    sPos[i * 3 + 1] = tipWorld.y + verticalOffset;
    sPos[i * 3 + 2] = tipWorld.z + (Math.random() - 0.5) * (0.18 + verticalOffset * 0.2);
    // Sporije, prirodnije — dim lagano klizi ka gore, ne leti
    sVel[i * 3 + 0] = (Math.random() - 0.5) * 0.007;
    sVel[i * 3 + 1] = 0.008 + Math.random() * 0.014;
    sVel[i * 3 + 2] = (Math.random() - 0.5) * 0.007;
    sSize[i] = 1.6 + Math.random() * 2.8;
    // Duži vek — dim lebdi dugo pre nego nestane
    sMaxLife[i] = 11 + Math.random() * 6;
    sLife[i] = initLife + verticalOffset * 0.55;
  }

  const smokeGeom = new THREE.BufferGeometry();
  smokeGeom.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  smokeGeom.setAttribute('size', new THREE.BufferAttribute(sSize, 1));
  smokeGeom.setAttribute('life', new THREE.BufferAttribute(sLife, 1));
  smokeGeom.setAttribute('maxLife', new THREE.BufferAttribute(sMaxLife, 1));

  const smokeMat = new THREE.ShaderMaterial({
    uniforms: {
      uSize: { value: 380.0 * renderer.getPixelRatio() },
      uTexture: { value: makeSmokeTexture() }
    },
    transparent: true, depthWrite: false, blending: THREE.NormalBlending,
    vertexShader: `
      attribute float size; attribute float life; attribute float maxLife;
      varying float vAlpha; varying float vRot;
      uniform float uSize;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float lifeN = clamp(life / maxLife, 0.0, 1.0);
        gl_PointSize = uSize * size * (0.6 + lifeN * 1.8) * (1.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
        float fi = smoothstep(0.0, 0.1, lifeN);
        float fo = 1.0 - smoothstep(0.5, 1.0, lifeN);
        vAlpha = fi * fo * 1.1;
        vRot = life * 0.5 + float(gl_VertexID) * 0.4;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture; varying float vAlpha; varying float vRot;
      void main(){
        vec2 p = gl_PointCoord - 0.5;
        float c = cos(vRot), s = sin(vRot);
        p = mat2(c, -s, s, c) * p + 0.5;
        if (p.x<0.0||p.x>1.0||p.y<0.0||p.y>1.0) discard;
        vec4 tex = texture2D(uTexture, p);
        vec3 col = mix(vec3(0.82, 0.77, 0.70), vec3(1.0, 0.96, 0.88), tex.a);
        gl_FragColor = vec4(col, tex.a * vAlpha);
      }
    `
  });
  const smokeMesh = new THREE.Points(smokeGeom, smokeMat);
  smokeMesh.renderOrder = 20;
  scene.add(smokeMesh);

  cigarGroup.updateMatrixWorld();
  tipWorld.copy(tipLocal).applyMatrix4(cigarGroup.matrixWorld);
  for (let i = 0; i < SMOKE_COUNT; i++) resetSmoke(i, Math.random() * 4);

  // =======================================================
  // SMOKE RINGS — povremeni puffovi iz pravca gledaoca ka sceni
  // =======================================================
  const ringTex = makeSmokeRingTexture();
  const rings = [];
  let ringEmitTimer = 0;
  let nextRingEmit = 3 + Math.random() * 2; // prvi ring brzo, pa dalje 8-14s

  function emitSmokeRing() {
    const mat = new THREE.SpriteMaterial({
      map: ringTex,
      color: 0xe8e0d2,
      transparent: true,
      opacity: 0,
      blending: THREE.NormalBlending,
      depthWrite: false,
      rotation: Math.random() * Math.PI * 2
    });
    const sprite = new THREE.Sprite(mat);
    // Pocinje blizu kamere, blago pomeren sa centra
    const offX = (Math.random() - 0.5) * 1.2;
    const offY = (Math.random() - 0.5) * 0.6 - 0.2;
    sprite.position.set(offX, offY, camera.position.z - 0.4);
    sprite.scale.setScalar(0.15);
    sprite.userData = {
      life: 0,
      maxLife: 3.8 + Math.random() * 1.5,
      startX: offX, startY: offY,
      driftX: (Math.random() - 0.5) * 0.3,
      driftY: 0.15 + Math.random() * 0.2,
      rotSpeed: (Math.random() - 0.5) * 0.4
    };
    sprite.renderOrder = 22;
    scene.add(sprite);
    rings.push(sprite);
  }

  // =======================================================
  // Dust motes
  // =======================================================
  const DUST = 110;
  const dustPos = new Float32Array(DUST * 3);
  const dustSpeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3 + 0] = (Math.random() - 0.5) * 14;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 7;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    dustSpeed[i] = 0.003 + Math.random() * 0.008;
  }
  const dustGeom = new THREE.BufferGeometry();
  dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  scene.add(new THREE.Points(dustGeom, new THREE.PointsMaterial({
    color: 0xc9a961, size: 0.025, transparent: true, opacity: 0.35,
    blending: THREE.AdditiveBlending, depthWrite: false
  })));

  // =======================================================
  // Drag-to-rotate cigar
  // =======================================================
  const cigarTarget = { x: 0, y: 0 };
  const cigarCurrent = { x: 0, y: 0 };
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let autoRotTimer = 0;
  const mousePar = { x: 0, y: 0 };

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const matchHitTargets = [stick, head, charred];

  function getMatchHit(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObjects(matchHitTargets);
  }

  canvas.style.touchAction = 'pan-y';

  canvas.addEventListener('pointerdown', (e) => {
    // Ako je klik na \u0161ibicu \u2014 zapali je (ne pokre\u0107e drag cigare)
    if (getMatchHit(e.clientX, e.clientY).length) {
      if (!matchState.ignited) {
        matchState.ignited = true;
        matchState.strikeT = 0; // restart progress
      } else {
        // Ako je ve\u0107 upaljena, klik je gasi i resetuje
        matchState.ignited = false;
        matchState.progress = 0;
      }
      return;
    }
    isDragging = true;
    canvas.setPointerCapture?.(e.pointerId);
    dragStartX = e.clientX; dragStartY = e.clientY;
    autoRotTimer = 0;
  });
  window.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
  });
  window.addEventListener('pointermove', (e) => {
    mousePar.x = (e.clientX / window.innerWidth) - 0.5;
    mousePar.y = (e.clientY / window.innerHeight) - 0.5;
    // Hover na \u0161ibici \u2014 menja cursor + flag
    matchState.hover = getMatchHit(e.clientX, e.clientY).length > 0;
    canvas.style.cursor = matchState.hover ? 'pointer' : '';
    if (!isDragging) return;
    cigarTarget.y += (e.clientX - dragStartX) * 0.006;
    cigarTarget.x += (e.clientY - dragStartY) * 0.004;
    cigarTarget.x = Math.max(-0.8, Math.min(0.8, cigarTarget.x));
    dragStartX = e.clientX; dragStartY = e.clientY;
  });

  // =======================================================
  // Scroll dolly
  // =======================================================
  const scrollState = { progress: 0 };
  ScrollTrigger.create({
    trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: (self) => { scrollState.progress = self.progress; }
  });

  // =======================================================
  // Loop
  // =======================================================
  const clock = new THREE.Clock();
  let running = true;
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => { running = entry.isIntersecting; });
  }, { threshold: 0 }).observe(document.getElementById('hero'));

  function tick() {
    requestAnimationFrame(tick);
    if (!running) return;
    const dt = clock.getDelta();
    const t = clock.getElapsedTime();

    autoRotTimer += dt;
    if (!isDragging && autoRotTimer > 1.5) cigarTarget.y += 0.15 * dt;
    cigarCurrent.x += (cigarTarget.x - cigarCurrent.x) * 0.08;
    cigarCurrent.y += (cigarTarget.y - cigarCurrent.y) * 0.08;
    cigarGroup.rotation.x = cigarCurrent.x;
    cigarGroup.rotation.y = cigarCurrent.y;
    cigarGroup.position.y = 0.5 + Math.sin(t * 0.7) * 0.04 - mousePar.y * 0.06;

    cigarGroup.updateMatrixWorld();
    tipWorld.copy(tipLocal).applyMatrix4(cigarGroup.matrixWorld);
    emberLight.position.copy(tipWorld);

    // --- Match idle + strike animation ---
    // Idle lebdi: pronounced bob + sway + subtle rotate-y da se vidi 3D forma
    const baseX = 2.7;
    const baseY = -0.4;
    const baseRotZ = -0.28;
    const hoverLift = matchState.hover ? 0.12 : 0;
    matchGroup.position.x = baseX + Math.sin(t * 0.6) * 0.06;
    matchGroup.position.y = baseY + Math.sin(t * 0.9) * 0.12 + hoverLift;
    matchGroup.rotation.z = baseRotZ + Math.sin(t * 0.5) * 0.08;
    matchGroup.rotation.y = Math.sin(t * 0.4) * 0.22;

    // "Pulse" na glavi \u0161ibice u idle — suptilan signal da je klikabilna
    if (!matchState.ignited) {
      const idlePulse = 0.12 + Math.abs(Math.sin(t * 1.8)) * 0.08 + (matchState.hover ? 0.2 : 0);
      head.material.emissiveIntensity = idlePulse;
    }

    if (matchState.ignited) {
      matchState.strikeT += dt;
      const st = matchState.strikeT;
      flame.visible = true;

      // Strike: 0-0.18s drhtanje (kao struganje po boxu)
      if (st < 0.18) {
        matchGroup.rotation.z += Math.sin(st * 180) * 0.08;
        matchGroup.position.x += Math.sin(st * 200) * 0.05;
      }

      // Plamen progress 0 \u2192 1 tokom prvih 1.2s
      matchState.progress = Math.min(1, st / 1.2);
      const p = matchState.progress;

      flameMat.uniforms.uIntensity.value = p;
      flameMat.uniforms.uTime.value = t;

      // Billboard plamen da uvek gleda ka kameri
      flame.quaternion.copy(camera.quaternion);

      flameGlowMat.opacity = 0.55 * p * (0.85 + Math.sin(t * 8) * 0.15);
      flameGlow.scale.setScalar(0.8 + p * 0.4 + Math.sin(t * 6) * 0.08);

      flameLight.intensity = 2.8 * p * (0.9 + Math.sin(t * 9) * 0.1);
      flameLight.color.setHex(0xffa040);

      head.material.emissiveIntensity = 0.12 + p * 0.6;
      head.material.color.setHex(p > 0.5 ? 0x4a1a0a : 0x9a2e16);
      charred.material.emissiveIntensity = p * 0.35;
    } else {
      // Fade plamen van i sakrij mesh kad je potpuno 0 (u\u0161teda draw call-a)
      const cur = flameMat.uniforms.uIntensity.value;
      const next = Math.max(0, cur - dt * 2);
      flameMat.uniforms.uIntensity.value = next;
      flameMat.uniforms.uTime.value = t;
      flame.visible = next > 0.01;
      flameGlowMat.opacity = Math.max(0, flameGlowMat.opacity - dt * 2);
      flameLight.intensity = Math.max(0, flameLight.intensity - dt * 5);
      head.material.color.setHex(0x9a2e16);
      charred.material.emissiveIntensity = 0;
    }

    emberMat.uniforms.uTime.value = t;
    const pulse = 0.9 + Math.sin(t * 2.5) * 0.18;
    emberLight.intensity = 1.4 * pulse;
    glow.scale.setScalar(0.92 + pulse * 0.1);
    glow2.scale.setScalar(0.95 + Math.sin(t * 4.1) * 0.08);
    glowMat.opacity = 0.18 + 0.08 * pulse;
    glow2Mat.opacity = 0.22 + 0.1 * pulse;

    camera.position.z = 8.5 + scrollState.progress * 4;
    camera.position.y = 0.25 - scrollState.progress * 0.5;
    camera.lookAt(0, 0, 0);

    // Smoke rings — povremena emisija + animacija
    ringEmitTimer += dt;
    if (ringEmitTimer > nextRingEmit) {
      emitSmokeRing();
      ringEmitTimer = 0;
      nextRingEmit = 7 + Math.random() * 7; // sledeci 7-14s
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      const d = r.userData;
      d.life += dt;
      const p = d.life / d.maxLife; // 0..1
      // Kre\u0107e se od kamere ka sceni (z smanjuje)
      r.position.z = camera.position.z - 0.4 - p * 11;
      // Lagana vertikalna drift + horizontalna drift
      r.position.x = d.startX + d.driftX * p;
      r.position.y = d.startY + d.driftY * p;
      // Raste — po\u010dinje mali, kulminira srednji pa se jako ra\u0161iri
      const scale = 0.15 + p * 5.5;
      r.scale.set(scale, scale, 1);
      // Lagana rotacija texture
      r.material.rotation += d.rotSpeed * dt;
      // Opacity: fade-in brzo, fade-out sporije
      const fadeIn = Math.min(1, p * 8);
      const fadeOut = 1 - Math.max(0, (p - 0.6) / 0.4);
      r.material.opacity = 0.55 * fadeIn * fadeOut;
      if (d.life >= d.maxLife) {
        scene.remove(r);
        r.material.dispose();
        rings.splice(i, 1);
      }
    }

    if (SMOKE_COUNT > 0) {
      for (let i = 0; i < SMOKE_COUNT; i++) {
        sLife[i] += dt;
        // Blaga buoyancy — dim se lagano ubrzava na gore, ne "juri"
        sVel[i * 3 + 1] += 0.003 * dt;
        sPos[i * 3 + 0] += sVel[i * 3 + 0] * dt * 60;
        sPos[i * 3 + 1] += sVel[i * 3 + 1] * dt * 60;
        sPos[i * 3 + 2] += sVel[i * 3 + 2] * dt * 60;
        // Sporije, \u0161iroke turbulencije — prirodno kovitlanje
        const life01 = sLife[i] / sMaxLife[i];
        const turbStrength = 0.0012 * (0.3 + life01 * 0.8); // ja\u010de kad je dim vi\u0161i
        sPos[i * 3 + 0] += Math.sin(t * 0.35 + i * 0.7) * turbStrength;
        sPos[i * 3 + 2] += Math.cos(t * 0.28 + i * 0.5) * turbStrength;
        // Lagano \u0161irenje horizontalno sa starošću (dim se razliva)
        sVel[i * 3 + 0] *= 0.9985;
        sVel[i * 3 + 2] *= 0.9985;
        if (sLife[i] > sMaxLife[i]) resetSmoke(i);
      }
      smokeGeom.attributes.position.needsUpdate = true;
      smokeGeom.attributes.life.needsUpdate = true;
    }

    for (let i = 0; i < DUST; i++) {
      dustPos[i * 3 + 1] += dustSpeed[i];
      if (dustPos[i * 3 + 1] > 3.5) dustPos[i * 3 + 1] = -3.5;
    }
    dustGeom.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  tick();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    smokeMat.uniforms.uSize.value = 380.0 * renderer.getPixelRatio();
  });
}

// =======================================================
// Textures
// =======================================================
function makeCigarTexture() {
  const size = 1024;
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, size, 0);
  g.addColorStop(0, '#5a2f18'); g.addColorStop(0.3, '#8a5a32');
  g.addColorStop(0.55, '#a06a3c'); g.addColorStop(0.8, '#7a4a26');
  g.addColorStop(1, '#4a2813');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 6500; i++) {
    ctx.fillStyle = `rgba(${40 + Math.random() * 50}, ${25 + Math.random() * 25}, 10, ${0.05 + Math.random() * 0.2})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 2.5, 0.5 + Math.random() * 2);
  }
  ctx.strokeStyle = 'rgba(20, 10, 4, 0.08)'; ctx.lineWidth = 0.6;
  for (let y = 0; y < size; y += 1.5) {
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(y * 0.03) * 2);
    ctx.lineTo(size, y + Math.sin(y * 0.03 + 1) * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(30, 16, 6, 0.22)'; ctx.lineWidth = 1.2;
  for (let i = -size; i < size * 2; i += 22) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + size * 0.45, size); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1); tex.anisotropy = 16;
  return tex;
}

function makeCigarNormal() {
  const size = 512;
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#8080ff'; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1200; i++) {
    const x = Math.random() * size, y = Math.random() * size, r = 1 + Math.random() * 3;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(130, 130, 255, 1)');
    g.addColorStop(1, 'rgba(128, 128, 255, 0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2, 1);
  return tex;
}

function makeSmokeTexture() {
  const size = 256;
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255, 250, 244, 0.95)');
  g.addColorStop(0.2, 'rgba(230, 222, 210, 0.7)');
  g.addColorStop(0.5, 'rgba(160, 150, 135, 0.28)');
  g.addColorStop(1, 'rgba(90, 82, 72, 0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  const d = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < d.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 28;
    d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n;
  }
  ctx.putImageData(d, 0, 0);
  return new THREE.CanvasTexture(c);
}

function makeSmokeRingTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const cx = size / 2, cy = size / 2;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy) / (size / 2);
      // Annulus — pick at ~0.55, fade out both inward and outward
      let a = 0;
      if (r > 0.18 && r < 0.92) {
        const d = Math.abs(r - 0.55);
        a = Math.max(0, 1 - d / 0.35);
        a = Math.pow(a, 1.8); // steeper curve
        // blagi noise za soft edge
        a *= 0.7 + Math.random() * 0.3;
      }
      const idx = (y * size + x) * 4;
      img.data[idx + 0] = 220;
      img.data[idx + 1] = 212;
      img.data[idx + 2] = 198;
      img.data[idx + 3] = Math.floor(a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  // small blur pass
  ctx.filter = 'blur(2px)';
  ctx.drawImage(c, 0, 0);
  ctx.filter = 'none';
  const tex = new THREE.CanvasTexture(c);
  tex.center = new THREE.Vector2(0.5, 0.5);
  return tex;
}

function makeGlowTexture() {
  const size = 256;
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255, 200, 120, 1)');
  g.addColorStop(0.25, 'rgba(255, 130, 40, 0.7)');
  g.addColorStop(0.55, 'rgba(255, 80, 20, 0.18)');
  g.addColorStop(1, 'rgba(255, 60, 10, 0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
