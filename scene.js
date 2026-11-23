// Nachtelijke snelweg met zwarte vrachtwagen. Laadt automatisch models/truck.glb (indien aanwezig);
// zonder model toont de scene een rustige natte nachtweg met platina lichtbundels. Geen fouten bij ontbrekend model.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.getElementById("scene");
const PLAT = 0xd4cfc7;
setTimeout(() => { if (canvas) init().catch(() => { canvas.style.display = "none"; }); }, 0);

function glowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,255,255,.45)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function streakTexture() {
  const c = document.createElement("canvas"); c.width = 64; c.height = 256;
  const g = c.getContext("2d"), l = g.createLinearGradient(0, 0, 0, 256);
  l.addColorStop(0, "rgba(255,255,255,0)"); l.addColorStop(0.5, "rgba(255,255,255,.8)"); l.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = l; g.fillRect(0, 0, 64, 256);
  const h = g.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, "rgba(0,0,0,1)"); h.addColorStop(0.5, "rgba(0,0,0,0)"); h.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = h; g.fillRect(0, 0, 64, 256);
  return new THREE.CanvasTexture(c);
}

function asfaltTexture(maxAniso) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 1024;
  const g = c.getContext("2d");
  g.fillStyle = "#101216"; g.fillRect(0, 0, 512, 1024);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`; g.fillRect(Math.random() * 512, Math.random() * 1024, 2, 2); }
  g.fillStyle = "rgba(245,246,248,.85)";
  g.fillRect(14, 0, 8, 1024); g.fillRect(490, 0, 8, 1024);            // randlijnen
  for (let y = 0; y < 1024; y += 256) g.fillRect(252, y + 40, 8, 120);   // middenstreep
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function logoTexture(label) {
  const c = document.createElement("canvas"); c.width = 2048; c.height = 512;
  const g = c.getContext("2d");
  g.clearRect(0, 0, 2048, 512);
  g.font = "700 250px 'Segoe UI', Inter, Arial, sans-serif";
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "#d4cfc7"; g.shadowColor = "rgba(212,207,199,.35)"; g.shadowBlur = 24;
  if ("letterSpacing" in g) g.letterSpacing = "18px";
  let size = 250; while (g.measureText(label).width > 1900 && size > 80) { size -= 10; g.font = `700 ${size}px 'Segoe UI', Inter, Arial, sans-serif`; }
  g.fillText(label, 1024, 262);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function beam(len, r, kleur, sterkte) {
  const geo = new THREE.ConeGeometry(r, len, 28, 1, true);
  geo.translate(0, -len / 2, 0); geo.rotateX(Math.PI / 2);     // spits bij de oorsprong, wijst naar -z
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uC: { value: new THREE.Color(kleur) }, uS: { value: sterkte } },
    vertexShader: "varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv=uv; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }",
    fragmentShader: "uniform vec3 uC; uniform float uS; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float a=pow(vUv.y,1.4)*pow(abs(dot(normalize(vN),normalize(vV))),1.6); gl_FragColor=vec4(uC, a*uS); }"
  });
  return new THREE.Mesh(geo, m);
}

async function init() {
  const mobiel = matchMedia("(max-width: 768px)").matches;
  const minder = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LABEL = canvas.dataset.logo || "ATAS GROUP";
  const FLIP = new URLSearchParams(location.search).has("flip") || window.TRUCK_FLIP === true;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobiel, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08090c);
  scene.fog = new THREE.Fog(0x08090c, 25, 110);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 200);

  scene.add(new THREE.HemisphereLight(0x9aa3b5, 0x050608, 0.35));
  const key = new THREE.DirectionalLight(0xf5f6f8, 1.1); key.position.set(-8, 12, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(PLAT, 0.8); rim.position.set(9, 5, -10); scene.add(rim);

  // natte asfaltweg met eindeloos scrollende textuur
  const ROAD_LEN = 260, TILE = 12;
  const asf = asfaltTexture(renderer.capabilities.getMaxAnisotropy()); asf.repeat.set(1, ROAD_LEN / TILE);
  const weg = new THREE.Mesh(new THREE.PlaneGeometry(14, ROAD_LEN),
    new THREE.MeshStandardMaterial({ map: asf, roughness: 0.22, metalness: 0.55, envMapIntensity: 0.55 }));
  weg.rotation.x = -Math.PI / 2; weg.position.z = -ROAD_LEN / 2 + 30; scene.add(weg);
  const berm = new THREE.Mesh(new THREE.PlaneGeometry(220, ROAD_LEN), new THREE.MeshBasicMaterial({ color: 0x050608 }));
  berm.rotation.x = -Math.PI / 2; berm.position.set(0, -0.03, -ROAD_LEN / 2 + 30); scene.add(berm);

  // lantaarns + reflecties op nat asfalt
  const glow = glowTexture(), streak = streakTexture();
  const lampen = [];
  for (let i = 0; i < 14; i++) for (const zijde of [-1, 1]) {
    const grp = new THREE.Group();
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: PLAT, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }));
    s.scale.set(1.1, 1.1, 1); s.position.set(zijde * 8.2, 7, 0);
    const refl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 12), new THREE.MeshBasicMaterial({ map: streak, color: PLAT, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.16 }));
    refl.rotation.x = -Math.PI / 2; refl.position.set(zijde * 4.6, 0.02, 0);
    grp.add(s, refl); grp.position.z = 30 - i * 18 - (zijde > 0 ? 9 : 0); scene.add(grp); lampen.push(grp);
  }

  const wielen = [];
  let truck = null, front = -6.5, achter = 6.5;

  // model zoeken en laden
  let heeftModel = false;
  try { const r = await fetch("models/truck.glb", { method: "HEAD" }); heeftModel = r.ok && !/text\/html/.test(r.headers.get("content-type") || ""); } catch (e) { /* geen model */ }

  if (heeftModel) {
    try {
      const loader = new GLTFLoader();
      const draco = new DRACOLoader(); draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
      loader.setDRACOLoader(draco);
      const gltf = await loader.loadAsync("models/truck.glb");
      truck = bouwTruck(gltf.scene);
    } catch (e) { truck = null; }
  }
  if (!truck) {   // fallback: platina lichtbundels boven de weg
    for (const x of [-2.6, 2.6]) {
      const b = beam(60, 7, PLAT, 0.22); b.position.set(x, 12, 14); b.rotation.x = 0.55; scene.add(b);
    }
    const spot = new THREE.SpotLight(PLAT, 900, 80, 0.5, 0.8, 1.2); spot.position.set(0, 14, 6); spot.target.position.set(0, 0, -14);
    scene.add(spot, spot.target);
  }

  function bouwTruck(model) {
    // 1) richting en schaal: voorkant = -z, lengte 13 eenheden, wielen op y=0
    if (FLIP) model.rotation.y += Math.PI;
    const holder = new THREE.Group();
    let box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3());
    if (size.x > size.z) model.rotation.y += Math.PI / 2;
    holder.add(model); holder.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(holder); size = box.getSize(new THREE.Vector3());
    model.scale.multiplyScalar(13 / Math.max(size.x, size.z)); holder.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(holder);
    const c = box.getCenter(new THREE.Vector3());
    model.position.x -= c.x; model.position.z -= c.z; model.position.y -= box.min.y;
    holder.updateMatrixWorld(true);

    // 2) hulpvlakken (anchor_*) onzichtbaar maken; benoemde delen opzoeken
    const benoemd = (re) => { const r = []; model.traverse((o) => { if (o.isMesh && re.test(o.name)) r.push(o); }); return r; };
    benoemd(/^anchor_/).forEach((a) => { a.userData.anker = true; });
    const midden = (o) => new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
    const maten = (o) => new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3());

    // 3) materialen: matte obsidiaan-zwarte metallic lak; glas, banden, chroom en lampen blijven functioneel
    const lak = (m) => new THREE.MeshStandardMaterial({ color: 0x0a0b0e, metalness: 0.85, roughness: 0.25, envMapIntensity: 1.8, normalMap: (m && m.normalMap) || null, aoMap: (m && m.aoMap) || null });
    model.traverse((o) => {
      if (!o.isMesh) return;
      if (o.userData.anker) { o.visible = false; return; }
      const lijst = (Array.isArray(o.material) ? o.material : [o.material]).map((m) => {
        const n = ((m && m.name) + " " + o.name).toLowerCase();
        if (/glass|window|windscreen|ruit|\bcam\b/.test(n)) return new THREE.MeshStandardMaterial({ color: 0x04060a, metalness: 1, roughness: 0.05, envMapIntensity: 1.2 });
        if (/tire|tyre|rubber|lastik/.test(n)) return new THREE.MeshStandardMaterial({ color: 0x0b0b0d, metalness: 0, roughness: 0.9 });
        if (/chrome|silver|alu/.test(n)) return m;
        if (/light|lamp|\bled\b|\bfar\b|signal/.test(n)) return m;
        return lak(m);
      });
      o.material = lijst.length === 1 ? lijst[0] : lijst;
    });

    // 4) wielen: bovenste knopen met wiel-naam krijgen een eigen draaipunt in het wielmidden
    const kandidaten = [];
    model.traverse((o) => { if (/wheel|teker|lastik/i.test(o.name) && !kandidaten.some((k) => k.getObjectById(o.id))) kandidaten.push(o); });
    kandidaten.forEach((w) => {
      const b = new THREE.Box3().setFromObject(w); if (b.isEmpty()) return;
      const pivot = new THREE.Group(); holder.add(pivot);
      pivot.position.copy(holder.worldToLocal(b.getCenter(new THREE.Vector3())));
      pivot.attach(w); wielen.push(pivot);
    });

    holder.updateMatrixWorld(true);
    const hb = new THREE.Box3().setFromObject(holder), hs = hb.getSize(new THREE.Vector3());
    front = hb.min.z; achter = hb.max.z;
    const W = hs.x, H = hs.y, L = hs.z;
    const glowMat = (kleur, op = 0.9) => new THREE.SpriteMaterial({ map: glow, color: kleur, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op });

    // 5) logo op de dorsezijkanten: exact op de anker-vlakken uit het model, anders geschat
    const logoMat = new THREE.MeshBasicMaterial({ map: logoTexture(LABEL), transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const ankers = benoemd(/^anchor_decal_/);
    if (ankers.length) {
      model.traverse((o) => { if (o.userData.anker && /^anchor_decal_/.test(o.name)) {
        const cc = midden(o), s = maten(o), zijde = Math.sign(cc.x) || 1;
        const d = new THREE.Mesh(new THREE.PlaneGeometry(s.z, s.y), logoMat);
        d.position.set(cc.x + zijde * (s.x / 2 + 0.003), cc.y, cc.z); d.rotation.y = zijde * Math.PI / 2; holder.add(d);
      } });
    } else {
      for (const zijde of [1, -1]) {
        const d = new THREE.Mesh(new THREE.PlaneGeometry(0.46 * L, 0.115 * L), logoMat);
        d.position.set(zijde * (W / 2 + 0.02), hb.min.y + 0.55 * H, achter - 0.31 * L); d.rotation.y = zijde * Math.PI / 2; holder.add(d);
      }
    }

    // 6) lichten op de echte lampen uit het model; zonder die lampen: schatting op basis van de afmetingen
    const koplampen = benoemd(/^headlight_/), staart = benoemd(/^taillight_/), marker = benoemd(/^marker_/);
    if (koplampen.length) {
      koplampen.forEach((lens) => {
        const p = holder.worldToLocal(midden(lens)); p.z = front;
        const sp = new THREE.SpotLight(0xfff4e0, 260, 60, 0.38, 0.6, 1.4);
        sp.position.copy(p); sp.target.position.set(p.x * 0.6, 0, front - 25); holder.add(sp, sp.target);
        const b = beam(22, 2.6, 0xfff4e0, 0.35); b.position.copy(p); holder.add(b);
        const g = new THREE.Sprite(glowMat(0xfff4e0)); g.scale.set(1.2, 1.2, 1); g.position.copy(p); holder.add(g);
      });
    } else {
      for (const x of [-1, 1]) {
        const p = new THREE.Vector3(x * 0.34 * W, hb.min.y + 0.26 * H, front + 0.1);
        const sp = new THREE.SpotLight(0xfff4e0, 260, 60, 0.38, 0.6, 1.4);
        sp.position.copy(p); sp.target.position.set(p.x * 0.6, 0, front - 25); holder.add(sp, sp.target);
        const b = beam(22, 2.6, 0xfff4e0, 0.35); b.position.copy(p); holder.add(b);
      }
    }
    marker.forEach((m) => { const g = new THREE.Sprite(glowMat(0xff8a1f, 0.8)); g.scale.set(0.55, 0.55, 1); g.position.copy(holder.worldToLocal(midden(m))); holder.add(g); });
    if (staart.length) {
      staart.forEach((t) => { const g = new THREE.Sprite(glowMat(0xff1a1a)); g.scale.set(1.3, 1.3, 1); g.position.copy(holder.worldToLocal(midden(t))); g.position.z = achter + 0.05; holder.add(g); });
      const stop = new THREE.PointLight(0xff1a1a, 6, 8, 1.8); stop.position.set(0, hb.min.y + 0.3 * H, achter + 0.8); holder.add(stop);
    } else {
      const rood = new THREE.MeshBasicMaterial({ color: 0xff1a1a });
      for (const x of [-1, 1]) {
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.34, 0.08), rood);
        lamp.position.set(x * 0.38 * W, hb.min.y + 0.3 * H, achter + 0.04); holder.add(lamp);
        const g = new THREE.Sprite(glowMat(0xff1a1a)); g.scale.set(1.4, 1.4, 1); g.position.copy(lamp.position); holder.add(g);
      }
      const stop = new THREE.PointLight(0xff1a1a, 6, 8, 1.8); stop.position.set(0, hb.min.y + 0.3 * H, achter + 0.8); holder.add(stop);
    }
    if (!marker.length) {
      const oranje = new THREE.MeshBasicMaterial({ color: 0xff8a1f });
      for (const zijde of [-1, 1]) for (let i = 0; i < 5; i++) {
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.22), oranje);
        lamp.position.set(zijde * (W / 2 + 0.02), hb.min.y + 0.8 * H, achter - 0.06 * L - i * 0.14 * L); holder.add(lamp);
        const g = new THREE.Sprite(glowMat(0xff8a1f, 0.8)); g.scale.set(0.7, 0.7, 1); g.position.copy(lamp.position); holder.add(g);
      }
    }
    scene.add(holder);
    return holder;
  }

  // camerastanden: truck-scene en fallback, gestuurd door scrollen
  const standen = truck
    ? [[-9, 2.4, 12, 0, 1.6, 0], [11, 2.4, -13, 0, 1.9, -3], [0, 9, 15, 0, 0.5, -8]]
    : [[0, 1.5, 10, 0, 9, -30], [0, 3, 11, 0, 4, -30], [0, 10, 14, 0, 0, -30]];
  const ease = (x) => x * x * (3 - 2 * x);
  const doel = new THREE.Vector2(), muis = new THREE.Vector2();
  if (!mobiel) addEventListener("pointermove", (e) => doel.set((e.clientX / innerWidth - 0.5) * 2, -(e.clientY / innerHeight - 0.5) * 2), { passive: true });
  const dbg = new URLSearchParams(location.search).get("p");
  let scroll = dbg !== null ? Math.min(Math.max(+dbg, 0), 1) : 0;
  if (dbg === null) addEventListener("scroll", () => { scroll = Math.min(scrollY / (innerHeight * 1.2), 1); }, { passive: true });

  function formaat() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < 0.8 ? 58 : 42; cam.updateProjectionMatrix();
  }
  addEventListener("resize", formaat); formaat();

  let zichtbaar = true, bezig = false, t0 = performance.now();
  new IntersectionObserver(([e]) => { zichtbaar = e.isIntersecting; if (zichtbaar && !minder && !bezig) { t0 = performance.now(); loop(); } }).observe(canvas);

  function frame(nu) {
    const dt = Math.min((nu - t0) / 1000, 0.05); t0 = nu;
    const v = minder ? 0 : 16;
    asf.offset.y += (v * dt) / TILE;
    lampen.forEach((l) => { l.position.z += v * dt; if (l.position.z > 34) l.position.z -= 14 * 18; });
    wielen.forEach((w) => { w.rotation.x += (v * dt) / 0.42; });
    if (truck) truck.position.y = Math.sin(nu / 230) * 0.01 * (minder ? 0 : 1);
    canvas.style.opacity = String(Math.max(0.28, 1 - scroll * 0.72));
    muis.lerp(doel, 0.05);
    const p = scroll * 2, i = Math.min(Math.floor(p), 1), f = ease(p - i), a = standen[i], b = standen[i + 1];
    const m = (k) => a[k] + (b[k] - a[k]) * f;
    cam.position.set(m(0) + muis.x * 0.8, m(1) + muis.y * 0.3, m(2));
    cam.lookAt(m(3), m(4), m(5));
    renderer.render(scene, cam);
  }
  function loop() { if (!zichtbaar || minder) { bezig = false; return; } bezig = true; frame(performance.now()); requestAnimationFrame(loop); }
  frame(performance.now());
  if (!minder) loop();
}
