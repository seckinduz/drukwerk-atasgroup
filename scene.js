// Lichtgewicht 3D-scene: een tractor-oplegger rijdt door een nachtelijk landschap. Geen externe assets.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("scene");
if (canvas) init();

function init() {
  const mobiel = window.matchMedia("(max-width: 768px)").matches;
  const minder = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobiel, alpha: true, powerPreference: "low-power" });
  } catch (e) { canvas.style.display = "none"; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0e2a47, 18, 60);
  const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
  cam.position.set(7, 3.2, 9);
  cam.lookAt(0, 1.2, 0);

  scene.add(new THREE.HemisphereLight(0xe6e4e0, 0x0e2a47, 1.1));
  const zon = new THREE.DirectionalLight(0xffe2b0, 1.4);
  zon.position.set(6, 10, 6);
  scene.add(zon);

  const mat = (c, r = 0.6, m = 0.1) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const gold = mat(0xb89758, 0.35, 0.7), navy = mat(0x0e2a47, 0.5), cream = mat(0xe6e4e0, 0.7), dark = mat(0x15181d, 0.9);

  // weg
  const weg = new THREE.Mesh(new THREE.PlaneGeometry(200, 7), dark);
  weg.rotation.x = -Math.PI / 2; scene.add(weg);
  const grond = new THREE.Mesh(new THREE.PlaneGeometry(200, 120), mat(0x0a1d33, 1, 0));
  grond.rotation.x = -Math.PI / 2; grond.position.y = -0.02; scene.add(grond);

  // strepen en bomen schuiven voorbij
  const strepen = [], bomen = [];
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(2, 0.02, 0.2), cream);
    s.position.set(-30 + i * 4.5, 0.01, 0); scene.add(s); strepen.push(s);
  }
  for (let i = 0; i < 16; i++) {
    const t = new THREE.Group();
    const stam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.8, 6), mat(0x4a3b2a));
    stam.position.y = 0.4;
    const kroon = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 7), mat(0x1d4a3a));
    kroon.position.y = 1.5;
    t.add(stam, kroon);
    t.position.set(-30 + i * 4, 0, (i % 2 ? 6 : -6) - Math.random() * 3);
    scene.add(t); bomen.push(t);
  }

  // vrachtwagen
  const truck = new THREE.Group();
  const laadbak = new THREE.Mesh(new THREE.BoxGeometry(6, 2.5, 2.3), cream); laadbak.position.set(-1.6, 1.9, 0);
  const band = new THREE.Mesh(new THREE.BoxGeometry(6.02, 0.2, 2.32), gold); band.position.set(-1.6, 1.4, 0);
  const cabine = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.0, 2.2), navy); cabine.position.set(2.0, 1.7, 0);
  const raam = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 1.7), mat(0x9fc3e6, 0.2, 0.3)); raam.position.set(2.92, 2.1, 0);
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.3, 1.8), dark); chassis.position.set(-0.5, 0.55, 0);
  truck.add(laadbak, band, cabine, raam, chassis);
  const wielen = [];
  [[2.1, 1], [2.1, -1], [-0.6, 1], [-0.6, -1], [-2.3, 1], [-2.3, -1], [-3.5, 1], [-3.5, -1]].forEach(([x, z]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16), dark);
    w.rotation.x = Math.PI / 2; w.position.set(x, 0.5, z * 1.05); truck.add(w); wielen.push(w);
  });
  scene.add(truck);

  // zwevende kaarten (A6-verhouding 105x148)
  const kaarten = [];
  for (let i = 0; i < 6; i++) {
    const k = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.48, 0.03), i % 2 ? gold : cream);
    k.scale.setScalar(0.45); k.userData.f = Math.random() * 6; k.userData.x = -4 + i * 1.8;
    scene.add(k); kaarten.push(k);
  }

  function formaat() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth, h = canvas.clientHeight || 360;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.position.set(w < 600 ? 10 : 7, w < 600 ? 3.6 : 3.2, w < 600 ? 13 : 9);
    cam.lookAt(0, 1.2, 0); cam.updateProjectionMatrix();
  }
  addEventListener("resize", formaat); formaat();

  let px = 0, zichtbaar = true, t0 = performance.now();
  if (!mobiel) addEventListener("pointermove", e => { px = (e.clientX / innerWidth - 0.5) * 2; }, { passive: true });
  new IntersectionObserver(([e]) => { zichtbaar = e.isIntersecting; if (zichtbaar && !minder && !bezig) { t0 = performance.now(); loop(); } }).observe(canvas);

  function frame(tijd) {
    const dt = Math.min((tijd - t0) / 1000, 0.05); t0 = tijd;
    const v = minder ? 0 : 9;
    strepen.forEach(s => { s.position.x += v * dt; if (s.position.x > 30) s.position.x -= 63; });
    bomen.forEach(b => { b.position.x += v * dt; if (b.position.x > 30) b.position.x -= 64; });
    wielen.forEach(w => { w.rotation.z -= v * dt * 2; });
    truck.position.y = Math.sin(tijd / 180) * 0.012 * (minder ? 0 : 1);
    kaarten.forEach(k => {
      k.position.set(k.userData.x, 5 + Math.sin(tijd / 900 + k.userData.f) * 0.3, -3);
      k.rotation.y = tijd / 1500 + k.userData.f;
    });
    cam.position.x += ((7 + px * 1.5) - cam.position.x) * 0.04 * (mobiel ? 0 : 1);
    cam.lookAt(0, 1.2, 0);
    renderer.render(scene, cam);
  }
  let bezig = false;
  function loop() {
    if (!zichtbaar || minder) { bezig = false; return; }
    bezig = true; frame(performance.now()); requestAnimationFrame(loop);
  }
  frame(performance.now());
  if (!minder) loop();
}
