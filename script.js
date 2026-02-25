// -------------------------------------------------------
// CUSTOM CURSOR
// -------------------------------------------------------
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';

  rx += (e.clientX - rx) * 0.15;
  ry += (e.clientY - ry) * 0.15;
  cursorRing.style.left = e.clientX + 'px';
  cursorRing.style.top = e.clientY + 'px';
});


// -------------------------------------------------------
// BG 3D SCENE (Floating particles + wireframe shapes)
// -------------------------------------------------------
(function () {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 30;

  // Particles
  const count = 1500;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [
    [0.0, 0.83, 1.0],    // cyan
    [0.49, 0.23, 0.93],  // purple
    [0.06, 0.73, 0.51],  // green
    [0.96, 0.62, 0.27],  // orange
  ];

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 130;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 130;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = c[0];
    colors[i * 3 + 1] = c[1];
    colors[i * 3 + 2] = c[2];
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.45,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Wireframe shapes
  const shapes = [];
  const geometries = [
    new THREE.DodecahedronGeometry(5.5, 0),
    new THREE.IcosahedronGeometry(4.5, 0),
    new THREE.OctahedronGeometry(5, 0),
  ];
  const cols = [0x00d4ff, 0x7c3aed, 0x10b981];
  const shapePositions = [[16, -6, -5], [-18, 10, -8], [8, 18, -10]];

  geometries.forEach((g, i) => {
    const m = new THREE.MeshBasicMaterial({
      color: cols[i], wireframe: true,
      transparent: true, opacity: 0.05,
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(...shapePositions[i]);
    scene.add(mesh);
    shapes.push(mesh);
  });

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 0.3;
    my = (e.clientY / window.innerHeight - 0.5) * 0.3;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();

  function animateBG() {
    requestAnimationFrame(animateBG);
    const t = clock.getElapsedTime();

    points.rotation.y = t * 0.012 + mx * 0.5;
    points.rotation.x = t * 0.007 + my * 0.3;

    shapes.forEach((s, i) => {
      s.rotation.y = t * (0.06 + i * 0.02);
      s.rotation.x = t * (0.04 + i * 0.015);
    });

    renderer.render(scene, camera);
  }

  animateBG();
})();


// -------------------------------------------------------
// HERO 3D CANVAS — Rotating torus knot
// -------------------------------------------------------
(function () {
  const canvas = document.getElementById('hero-canvas');
  const wrap = document.getElementById('hero-canvas-wrap');
  if (!canvas || !wrap) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 6;

  // Torus knot
  const geo = new THREE.TorusKnotGeometry(1.8, 0.42, 200, 36, 3, 5);
  const mat = new THREE.MeshPhongMaterial({
    color: 0x003344,
    emissive: 0x001122,
    specular: 0x00d4ff,
    shininess: 100,
    transparent: true,
    opacity: 0.9,
  });
  const knot = new THREE.Mesh(geo, mat);
  scene.add(knot);

  // Wireframe overlay
  const wMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff, wireframe: true,
    transparent: true, opacity: 0.12,
  });
  const knotW = new THREE.Mesh(geo, wMat);
  scene.add(knotW);

  // Lights
  scene.add(new THREE.AmbientLight(0x00d4ff, 0.3));

  const pt1 = new THREE.PointLight(0x00d4ff, 3, 20);
  pt1.position.set(5, 5, 5);
  scene.add(pt1);

  const pt2 = new THREE.PointLight(0x7c3aed, 2, 20);
  pt2.position.set(-5, -5, 3);
  scene.add(pt2);

  const pt3 = new THREE.PointLight(0x10b981, 1.5, 15);
  pt3.position.set(0, 7, -2);
  scene.add(pt3);

  function resize() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener('resize', resize);

  let mx = 0, my = 0;
  wrap.addEventListener('mousemove', e => {
    const r = wrap.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    my = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });

  const clock = new THREE.Clock();

  function animateHero() {
    requestAnimationFrame(animateHero);
    const t = clock.getElapsedTime();

    knot.rotation.x = t * 0.18 + my * 0.4;
    knot.rotation.y = t * 0.28 + mx * 0.4;
    knotW.rotation.copy(knot.rotation);

    pt1.intensity = 3 + Math.sin(t * 2.5) * 0.8;
    pt2.intensity = 2 + Math.cos(t * 1.8) * 0.6;

    renderer.render(scene, camera);
  }

  animateHero();
})();


// -------------------------------------------------------
// NAV SCROLL EFFECT
// -------------------------------------------------------
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});


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
      setTimeout(() => entry.target.classList.add('show'), i * 80);
      revObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

reveals.forEach(el => revObserver.observe(el));

// Hero section always visible on load
document.querySelectorAll('#hero .reveal').forEach(el => el.classList.add('show'));


// -------------------------------------------------------
// PROJECT FILTERS
// -------------------------------------------------------
const filterBtns = document.querySelectorAll('.filter-btn');
const projCards  = document.querySelectorAll('.proj-card');

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
// BACK TO TOP
// -------------------------------------------------------
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (!backToTop) return;
  backToTop.classList.toggle('visible', window.scrollY > 500);
});

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


// -------------------------------------------------------
// CV REQUEST MODAL
// -------------------------------------------------------
function openCVModal() {
  const modal = document.getElementById('cvModal');
  modal.style.display = 'flex';
  // Prevent background scroll
  document.body.style.overflow = 'hidden';
}

function closeCVModal() {
  const modal = document.getElementById('cvModal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Close modal when clicking the backdrop (outside the card)
document.getElementById('cvModal').addEventListener('click', function(e) {
  if (e.target === this) closeCVModal();
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeCVModal();
});