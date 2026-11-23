// Ademende 3D deeltjesbol (goud/marineblauw). Reageert op muis en scroll. Geen externe assets.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("scene");
if (canvas) init();

function init() {
  const mobiel = window.matchMedia("(max-width: 768px)").matches;
  const minder = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  } catch (e) { canvas.style.display = "none"; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  cam.position.z = 7.2;

  const N = mobiel ? 7000 : 20000;
  const pos = new Float32Array(N * 3), seed = new Float32Array(N), mix = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    // Fibonacci-bol met lichte diepte-spreiding
    const k = i + 0.5, phi = Math.acos(1 - 2 * k / N), th = Math.PI * (1 + Math.sqrt(5)) * k;
    const r = 2.1 + (Math.random() - 0.5) * 0.18;
    pos[i * 3] = r * Math.cos(th) * Math.sin(phi);
    pos[i * 3 + 1] = r * Math.sin(th) * Math.sin(phi);
    pos[i * 3 + 2] = r * Math.cos(phi);
    seed[i] = Math.random() * 6.283; mix[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aMix", new THREE.BufferAttribute(mix, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: 0 }, uBreath: { value: 0 }, uPx: { value: renderer.getPixelRatio() * (mobiel ? 1.5 : 2) },
                uMouse: { value: new THREE.Vector2() } },
    vertexShader: `
      uniform float uT, uBreath, uPx; uniform vec2 uMouse;
      attribute float aSeed, aMix; varying float vMix; varying float vL;
      void main(){
        vec3 p = position; vec3 n = normalize(p);
        float wave = sin(uT*.9 + aSeed + p.y*1.3) * .06 + sin(uT*.5 + p.x*1.7 + aSeed) * .05;
        float breath = 1.0 + uBreath * .12 + sin(uT*.7) * .05;
        p = n * (length(p) + wave) * breath;
        vec3 m = vec3(uMouse * 2.6, 1.2);
        float d = distance(p, m); p += n * smoothstep(1.9, 0.0, d) * .38;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.2 + aMix * 1.6) * uPx * (5.0 / -mv.z);
        vMix = aMix; vL = .5 + .5 * n.y;
      }`,
    fragmentShader: `
      varying float vMix; varying float vL;
      void main(){
        float d = length(gl_PointCoord - .5); if (d > .5) discard;
        vec3 navy = vec3(.16,.34,.62), gold = vec3(.96,.78,.42), violet = vec3(.38,.34,.86);
        vec3 c = mix(mix(navy, violet, vMix), gold, smoothstep(.45, 1.0, vL * .7 + vMix * .45));
        gl_FragColor = vec4(c, smoothstep(.5, .0, d) * .85);
      }`
  });
  const bol = new THREE.Points(geo, mat);
  scene.add(bol);

  function formaat() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.position.z = w / h < 0.8 ? 10 : 7.2; cam.updateProjectionMatrix();
  }
  addEventListener("resize", formaat); formaat();

  const doel = new THREE.Vector2(), huidig = new THREE.Vector2();
  if (!mobiel) addEventListener("pointermove", e => { doel.set((e.clientX / innerWidth - 0.5) * 2, -(e.clientY / innerHeight - 0.5) * 2); }, { passive: true });
  let scroll = 0;
  addEventListener("scroll", () => { scroll = Math.min(scrollY / innerHeight, 1.5); }, { passive: true });

  let zichtbaar = true, bezig = false, t0 = performance.now(), tijd = 0;
  new IntersectionObserver(([e]) => {
    zichtbaar = e.isIntersecting;
    if (zichtbaar && !minder && !bezig) { t0 = performance.now(); loop(); }
  }).observe(canvas);

  function frame(nu) {
    const dt = Math.min((nu - t0) / 1000, 0.05); t0 = nu; tijd += dt;
    huidig.lerp(doel, 0.05);
    mat.uniforms.uT.value = tijd;
    mat.uniforms.uBreath.value = Math.sin(tijd * 0.8) * 0.5 + scroll * 0.6;
    mat.uniforms.uMouse.value.copy(huidig);
    bol.rotation.y = tijd * 0.08 + huidig.x * 0.35 + scroll * 0.9;
    bol.rotation.x = -huidig.y * 0.25 + scroll * 0.3;
    const s = 1 + scroll * 0.35; bol.scale.setScalar(s);
    bol.position.y = scroll * 0.9;
    renderer.render(scene, cam);
  }
  function loop() {
    if (!zichtbaar || minder) { bezig = false; return; }
    bezig = true; frame(performance.now()); requestAnimationFrame(loop);
  }
  frame(performance.now());
  if (!minder) loop();
}
