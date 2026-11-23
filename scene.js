// Scroll-gestuurde cinema: de vrachtwagenfoto rijdt bij het scrollen naar beneden en vooruit en verdwijnt in het donker.
// Canvas 2D met wegdeeltjes en lichtstrepen. Zonder externe bibliotheken, 60 fps via requestAnimationFrame.
(function () {
  const truck = document.getElementById("truck");
  const canvas = document.getElementById("scene");
  if (!truck || !canvas) return;
  const ctx = canvas.getContext("2d");
  const heroKop = document.querySelector(".hero-top"), heroOnder = document.querySelector(".hero-bottom");
  const minder = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobiel = () => matchMedia("(max-width: 768px)").matches;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  let W = 0, H = 0, dpr = 1, tx = 0, p = 0, doel = 0, vorig = 0, snelheid = 0, bezig = false, zichtbaar = true;

  function maat() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    // op mobiel is de foto breder dan het scherm: kabine (focus) in het midden zetten
    const focus = parseFloat(truck.dataset.focus || "0.3");
    tx = 0; // video past volledig in het scherm: dorse-logo nooit afgesneden
    zet();
  }

  // wegdeeltjes die vanuit het verdwijnpunt naar buiten stromen
  const N = mobiel() ? 46 : 90;
  const deeltjes = Array.from({ length: N }, () => nieuw(true));
  function nieuw(start) {
    const hoek = (0.08 + Math.random() * 0.84) * Math.PI;           // vooral het onderste halfrond (weg)
    return { a: hoek, r: start ? Math.random() * 600 : 4 + Math.random() * 20, v: 0.4 + Math.random() * 0.9, l: 0.5 + Math.random() };
  }
  function teken() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const alfa = (1 - smooth(0.5, 1.0, p)) * 0.9 + 0.1 * smooth(0.0, 0.4, p);
    if (alfa <= 0.02) return;
    const vx = W * 0.55, vy = H * 0.6, max = Math.hypot(W, H);
    ctx.lineCap = "round";
    for (const d of deeltjes) {
      const versnel = 0.25 + snelheid * 14 + p * 1.6;
      const r0 = d.r; d.r += (0.35 + d.r * 0.012) * d.v * versnel * (minder ? 0 : 1);
      if (d.r > max) Object.assign(d, nieuw(false));
      const k = Math.min(d.r / 500, 1);
      const x0 = vx + Math.cos(d.a) * r0 * 1.7, y0 = vy + Math.sin(d.a) * r0 * 0.75;
      const x1 = vx + Math.cos(d.a) * d.r * 1.7, y1 = vy + Math.sin(d.a) * d.r * 0.75;
      ctx.strokeStyle = `rgba(212,207,199,${(0.05 + 0.5 * k) * alfa * d.l})`;
      ctx.lineWidth = 0.6 + 1.8 * k;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
  }

  const vid = document.getElementById("truckvid");
  let vidDuur = 0;
  function zet() {
    const px = p * H * 0.26, s = 1 + p * 0.6, o = 1 - smooth(0.3, 0.95, p);
    truck.style.transform = `translate3d(${tx}px,${px + H * 0.10}px,0) scale(${s})`;
    truck.style.opacity = o.toFixed(3);
    if (vid && vidDuur && !minder) {
      // bovenaan: loop vrij; bij scrollen: video speelt vooruit mee met de scrollstand
      if (p > 0.01) { if (!vid.paused) vid.pause(); const t = Math.min(p, 1) * (vidDuur - 0.05); if (Math.abs(vid.currentTime - t) > 0.04) vid.currentTime = t; }
      else if (vid.paused) vid.play().catch(() => {});
    }
    if (heroKop) { const t = 1 - smooth(0.05, 0.5, p); heroKop.style.opacity = t.toFixed(3); heroKop.style.transform = `translate3d(0,${-p * 50}px,0)`; }
    if (heroOnder) { const t = 1 - smooth(0.05, 0.4, p); heroOnder.style.opacity = t.toFixed(3); heroOnder.style.transform = `translate3d(0,${p * 30}px,0)`; }
  }

  function frame() {
    p += (doel - p) * (minder ? 1 : 0.12);
    snelheid += (Math.abs(doel - vorig) - snelheid) * 0.2; vorig = doel;
    zet(); teken();
    const klaar = Math.abs(doel - p) < 0.0005 && snelheid < 0.0005;
    if (!zichtbaar || (minder && klaar)) { bezig = false; return; }
    requestAnimationFrame(frame);
  }
  function start() { if (!bezig) { bezig = true; requestAnimationFrame(frame); } }

  function scroll() {
    doel = clamp(scrollY / (innerHeight * 0.95), 0, 1.2);
    zichtbaar = scrollY < innerHeight * 1.6 && !document.hidden;
    if (zichtbaar) start();
  }
  addEventListener("scroll", scroll, { passive: true });
  addEventListener("resize", () => { maat(); start(); });
  document.addEventListener("visibilitychange", scroll);
  const media = vid || truck.querySelector("img");
  const klaarMedia = !media ? Promise.resolve() : vid ? new Promise((r) => { const ok = () => { vidDuur = vid.duration || 0; r(); }; if (vid.readyState >= 1) ok(); else { vid.addEventListener("loadedmetadata", ok, { once: true }); setTimeout(r, 2500); } }) : (media.complete ? Promise.resolve() : new Promise((r) => media.addEventListener("load", r, { once: true })));
  klaarMedia.then(() => { maat(); document.body.classList.add("cine"); });

  // ?p=0..1 : vaste scrollstand voor controle
  const dbg = new URLSearchParams(location.search).get("p");
  if (dbg !== null) { doel = p = clamp(+dbg, 0, 1.2); removeEventListener("scroll", scroll); }
  maat(); start();
})();
