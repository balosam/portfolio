/* ============================================================
   HERO-3D.JS — Tech Stack Orbit (Performance Optimised)
============================================================ */

'use strict';

(function initTechOrbit() {

  const canvas = document.getElementById('hero-canvas');
  const wrap   = document.getElementById('hero-canvas-wrap');
  if (!canvas || !wrap || typeof THREE === 'undefined') return;

  // Mobile: show static grid, skip 3D
  if (window.isMobile) {
    canvas.style.display = 'none';
    const g = document.getElementById('hero-logo-grid');
    if (g) g.style.display = 'flex';
    return;
  }

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
  camera.position.z = 7.5;

  // Resize
  function resize() {
    const w = wrap.offsetWidth, h = wrap.offsetHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  if (window.ResizeObserver) { new ResizeObserver(resize).observe(wrap); }
  else { window.addEventListener('resize', resize); }

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const L1 = new THREE.PointLight(0x00d4ff, 2.2, 16); L1.position.set(4,3,5); scene.add(L1);
  const L2 = new THREE.PointLight(0x7c5cfc, 1.5, 14); L2.position.set(-4,-3,3); scene.add(L2);

  // Core
  const coreGeo  = new THREE.OctahedronGeometry(0.5, 0);
  const core     = new THREE.Mesh(coreGeo, new THREE.MeshPhongMaterial({ color:0x004466, emissive:0x001133, specular:0x00d4ff, shininess:80, transparent:true, opacity:0.9 }));
  const coreWire = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ color:0x00d4ff, wireframe:true, transparent:true, opacity:0.18 }));
  scene.add(core, coreWire);

  // Rings
  function ring(r, color, op, rx, ry) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r,0.005,2,80), new THREE.MeshBasicMaterial({color,transparent:true,opacity:op}));
    m.rotation.x = rx; m.rotation.y = ry; return m;
  }
  scene.add(
    ring(2.0, 0x00d4ff, 0.16, Math.PI/2.6, 0.2),
    ring(2.9, 0x7c5cfc, 0.10, Math.PI/1.7, 0.5),
    ring(3.7, 0xf5a623, 0.07, Math.PI/3.2, -0.7)
  );

  const r1 = scene.children[scene.children.length-3];
  const r2 = scene.children[scene.children.length-2];
  const r3 = scene.children[scene.children.length-1];

  // Logos
  const loader = new THREE.TextureLoader();
  const configs = [
    ['logo-nextjs.png',     2.0, 0.36,  0.32, 0],
    ['logo-react.png',      2.0, 0.36,  0.32, Math.PI],
    ['logo-typescript.png', 2.9, 0.22, -0.50, 0.4],
    ['logo-supabase.png',   2.9, 0.22, -0.50, 0.4+Math.PI],
    ['logo-tailwind.png',   3.7, 0.14,  0.65, 1.0],
    ['logo-firebase.png',   3.7, 0.14,  0.65, 1.0+Math.PI*0.67],
    ['logo-figma.png',      3.7, 0.14,  0.65, 1.0+Math.PI*1.33],
    ['logo-vercel.png',     2.9, 0.22, -0.50, 2.7],
  ];

  const logos = configs.map(([file, r, speed, tilt, angle]) => {
    const tex = loader.load('images/logos/' + file);
    tex.minFilter = THREE.LinearFilter;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.46),
      new THREE.MeshBasicMaterial({ map:tex, transparent:true, depthWrite:false, side:THREE.DoubleSide })
    );
    scene.add(mesh);
    return { mesh, r, speed, tilt, angle };
  });

  // Particles
  const N = 160, pp = new Float32Array(N*3), pc = new Float32Array(N*3);
  const pal = [[0,0.83,1],[0.49,0.36,0.99],[0.96,0.65,0.14]];
  for (let i=0;i<N;i++) {
    pp[i*3]=(Math.random()-.5)*14; pp[i*3+1]=(Math.random()-.5)*14; pp[i*3+2]=(Math.random()-.5)*6-3;
    const c=pal[i%3]; pc[i*3]=c[0]; pc[i*3+1]=c[1]; pc[i*3+2]=c[2];
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pp,3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(pc,3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({size:0.05,vertexColors:true,transparent:true,opacity:0.4})));

  // Mouse
  let tX=0, tY=0, cX=0, cY=0;
  wrap.addEventListener('mousemove', e => {
    const b=wrap.getBoundingClientRect();
    tX=((e.clientX-b.left)/b.width-.5)*1.0;
    tY=((e.clientY-b.top)/b.height-.5)*0.7;
  }, {passive:true});
  wrap.addEventListener('mouseleave', ()=>{ tX=0; tY=0; });

  // Animate
  const clock = new THREE.Clock();
  const isLow = navigator.hardwareConcurrency <= 4;
  let frame = 0;

  function animate() {
    requestAnimationFrame(animate);
    if (!window.pageVisible()) return;
    frame++;
    if (isLow && frame%2!==0) return;

    const t = clock.getElapsedTime();
    cX += (tX-cX)*0.05; cY += (tY-cY)*0.05;

    core.rotation.y = t*0.28+cX*0.6; core.rotation.x = t*0.18+cY*0.4;
    coreWire.rotation.copy(core.rotation);

    r1.rotation.z = t*0.10;
    r2.rotation.z = -t*0.07;
    r3.rotation.z = t*0.05;

    logos.forEach(o => {
      o.angle += o.speed*0.01;
      o.mesh.position.set(
        Math.cos(o.angle)*o.r + cX*0.25,
        Math.sin(o.angle+o.tilt)*o.r*0.32 + cY*0.18,
        Math.sin(o.angle)*o.r - 1
      );
      o.mesh.lookAt(camera.position);
      o.mesh.material.opacity = 0.72 + Math.sin(t*1.1+o.angle)*0.14;
    });

    L1.intensity = 2.2+Math.sin(t*2.0)*0.4;
    L2.intensity = 1.5+Math.cos(t*1.6)*0.3;

    camera.position.x += (cX*0.35 - camera.position.x)*0.04;
    camera.position.y += (-cY*0.25 - camera.position.y)*0.04;
    camera.lookAt(0,0,0);

    renderer.render(scene, camera);
  }
  animate();

})();