const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const isSmallScreen = window.matchMedia('(max-width: 900px)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const runInLowPowerMode = isTouchDevice || isSmallScreen || prefersReducedMotion;

// -------------------------------------------------------
// CUSTOM CURSOR (desktop only)
// -------------------------------------------------------
if (!isTouchDevice) {
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');

  if (cursor && cursorRing) {
    document.addEventListener('mousemove', e => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      cursorRing.style.left = `${e.clientX}px`;
      cursorRing.style.top = `${e.clientY}px`;
    }, { passive: true });
  }
}


// -------------------------------------------------------
// BG 3D SCENE (adaptive quality)
// -------------------------------------------------------
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !runInLowPowerMode,
    alpha: true,
    powerPreference: runInLowPowerMode ? 'low-power' : 'high-performance',
  });

  const maxPixelRatio = runInLowPowerMode ? 1.1 : 1.8;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 30;

  const particleCount = runInLowPowerMode ? 420 : 1200;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const palette = [
    [0.0, 0.83, 1.0],
    [0.49, 0.23, 0.93],
    [0.06, 0.73, 0.51],
    [0.96, 0.62, 0.27],
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 130;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 130;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c[0];
    colors[i * 3 + 1] = c[1];
    colors[i * 3 + 2] = c[2];
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: runInLowPowerMode ? 0.19 : 0.16,
    vertexColors: true,
    transparent: true,
    opacity: runInLowPowerMode ? 0.32 : 0.45,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  const shapes = [];
  const geometries = runInLowPowerMode
    ? [new THREE.OctahedronGeometry(4.8, 0)]
    : [
        new THREE.DodecahedronGeometry(5.5, 0),
        new THREE.IcosahedronGeometry(4.5, 0),
        new THREE.OctahedronGeometry(5, 0),
      ];

  const cols = [0x00d4ff, 0x7c3aed, 0x10b981];
  const shapePositions = [[16, -6, -5], [-18, 10, -8], [8, 18, -10]];

  geometries.forEach((g, i) => {
    const m = new THREE.MeshBasicMaterial({
      color: cols[i] || cols[0],
      wireframe: true,
      transparent: true,
      opacity: runInLowPowerMode ? 0.035 : 0.05,
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(...shapePositions[i]);
    scene.add(mesh);
    shapes.push(mesh);
  });

  let mx = 0;
  let my = 0;
  if (!runInLowPowerMode) {
    document.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.3;
      my = (e.clientY / window.innerHeight - 0.5) * 0.3;
    }, { passive: true });
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
  }, { passive: true });

  const clock = new THREE.Clock();
  let isRunning = true;

  document.addEventListener('visibilitychange', () => {
    isRunning = document.visibilityState === 'visible';
  });

  function animateBG() {
    requestAnimationFrame(animateBG);
    if (!isRunning) return;

    const t = clock.getElapsedTime();
    points.rotation.y = t * (runInLowPowerMode ? 0.008 : 0.012) + mx * 0.5;
    points.rotation.x = t * (runInLowPowerMode ? 0.004 : 0.007) + my * 0.3;

    shapes.forEach((s, i) => {
      s.rotation.y = t * (0.05 + i * 0.015);
      s.rotation.x = t * (0.03 + i * 0.01);
    });

    renderer.render(scene, camera);
  }

  animateBG();
})();


// -------------------------------------------------------
// HERO 3D CANVAS — Rotating torus knot (adaptive quality)
// -------------------------------------------------------
(function () {
  const canvas = document.getElementById('hero-canvas');
  const wrap = document.getElementById('hero-canvas-wrap');
  if (!canvas || !wrap || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !runInLowPowerMode,
    alpha: true,
    powerPreference: runInLowPowerMode ? 'low-power' : 'high-performance',
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, runInLowPowerMode ? 1.1 : 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 6;

  const tubularSegments = runInLowPowerMode ? 96 : 200;
  const radialSegments = runInLowPowerMode ? 16 : 36;
  const geo = new THREE.TorusKnotGeometry(1.8, 0.42, tubularSegments, radialSegments, 3, 5);

  const mat = new THREE.MeshPhongMaterial({
    color: 0x003344,
    emissive: 0x001122,
    specular: 0x00d4ff,
    shininess: runInLowPowerMode ? 60 : 100,
    transparent: true,
    opacity: 0.9,
  });
  const knot = new THREE.Mesh(geo, mat);
  scene.add(knot);

  const wMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    wireframe: true,
    transparent: true,
    opacity: runInLowPowerMode ? 0.08 : 0.12,
  });
  const knotW = new THREE.Mesh(geo, wMat);
  scene.add(knotW);

  scene.add(new THREE.AmbientLight(0x00d4ff, runInLowPowerMode ? 0.45 : 0.3));

  const pt1 = new THREE.PointLight(0x00d4ff, runInLowPowerMode ? 2 : 3, 20);
  pt1.position.set(5, 5, 5);
  scene.add(pt1);

  const pt2 = new THREE.PointLight(0x7c3aed, runInLowPowerMode ? 1.3 : 2, 20);
  pt2.position.set(-5, -5, 3);
  scene.add(pt2);

  if (!runInLowPowerMode) {
    const pt3 = new THREE.PointLight(0x10b981, 1.5, 15);
    pt3.position.set(0, 7, -2);
    scene.add(pt3);
  }

  function resize() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  let mx = 0;
  let my = 0;
  if (!runInLowPowerMode) {
    wrap.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }, { passive: true });
  }

  const clock = new THREE.Clock();
  let isRunning = true;

  document.addEventListener('visibilitychange', () => {
    isRunning = document.visibilityState === 'visible';
  });

  function animateHero() {
    requestAnimationFrame(animateHero);
    if (!isRunning) return;

    const t = clock.getElapsedTime();
    knot.rotation.x = t * (runInLowPowerMode ? 0.12 : 0.18) + my * 0.4;
    knot.rotation.y = t * (runInLowPowerMode ? 0.2 : 0.28) + mx * 0.4;
    knotW.rotation.copy(knot.rotation);

    if (!runInLowPowerMode) {
      pt1.intensity = 3 + Math.sin(t * 2.5) * 0.8;
      pt2.intensity = 2 + Math.cos(t * 1.8) * 0.6;
    }

    renderer.render(scene, camera);
  }

  animateHero();
})();


// -------------------------------------------------------
// NAV / BACK TO TOP SCROLL EFFECT (single listener)
// -------------------------------------------------------
const nav = document.getElementById('nav');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


// -------------------------------------------------------
// MOBILE MENU
// -------------------------------------------------------
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.add('open');
});

document.getElementById('closeMenu').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.remove('open');
});

function closeMM() {
  document.getElementById('mobileMenu').classList.remove('open');
}


// -------------------------------------------------------
// SCROLL REVEAL
// -------------------------------------------------------
const reveals = document.querySelectorAll('.reveal');
const revObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = runInLowPowerMode ? 0 : i * 80;
      setTimeout(() => entry.target.classList.add('show'), delay);
      revObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

reveals.forEach(el => revObserver.observe(el));
document.querySelectorAll('#hero .reveal').forEach(el => el.classList.add('show'));


// -------------------------------------------------------
// PROJECT FILTERS
// -------------------------------------------------------
const filterBtns = document.querySelectorAll('.filter-btn');
const projCards = document.querySelectorAll('.proj-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    projCards.forEach(card => {
      const show = filter === 'all' || card.dataset.cat === filter;
      card.style.display = show ? '' : 'none';
    });
  });
});


// -------------------------------------------------------
// CV REQUEST MODAL
// -------------------------------------------------------
function openCVModal() {
  const modal = document.getElementById('cvModal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeCVModal() {
  const modal = document.getElementById('cvModal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

document.getElementById('cvModal').addEventListener('click', function (e) {
  if (e.target === this) closeCVModal();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeCVModal();
});
