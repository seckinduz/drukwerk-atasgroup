// Hero-scene: 3D envelop met gouden A6 kaart. Muis = 3D-kanteling en glans, plus zwevende gouddeeltjes (canvas 2D).
(function () {
  'use strict';
  var hero = document.getElementById('banner'), box = document.getElementById('env'), env = document.getElementById('env3d'), card = document.getElementById('goldcard'), cv = document.getElementById('dust');
  if (!hero || !env || !cv) return;
  var minder = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, deeltjes = [], zichtbaar = true, actief = false;
  var tx = 0, ty = 0, cx = 0, cy = 0, mx = .5, my = .4, ptr = false, t0 = performance.now();

  function maat() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); W = box.clientWidth || 1; H = box.clientHeight || 1;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(70, Math.max(22, W * H / 22000)));
    deeltjes = []; for (var i = 0; i < n; i++) deeltjes.push(nieuw(true));
  }
  function nieuw(init) {
    var d = Math.random();
    return { x: W * (.18 + Math.random() * .64), y: init ? H * (.15 + Math.random() * .7) : H * (.72 + Math.random() * .1), r: 1 + d * 2.6, v: .12 + d * .42, w: Math.random() * 6.28, s: .4 + Math.random() * 1.2, a: .5 + d * .5 };
  }
  function teken(t) {
    ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
    deeltjes.forEach(function (d) {
      if (!minder) { d.y -= d.v; d.x += Math.sin(t / 1400 * d.s + d.w) * .35; }
      if (d.y < H * .06) { Object.assign(d, nieuw(false)); }
      var tw = .55 + .45 * Math.sin(t / 500 * d.s + d.w), g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 5);
      g.addColorStop(0, 'rgba(243,111,33,' + (d.a * tw).toFixed(3) + ')'); g.addColorStop(.35, 'rgba(212,165,58,' + (d.a * tw * .45).toFixed(3) + ')'); g.addColorStop(1, 'rgba(230,203,131,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 5, 0, 6.2832); ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
  }
  function lus(now) {
    actief = false; if (!zichtbaar || document.hidden) return;
    var t = now - t0;
    if (!ptr && !minder) { mx = .5 + Math.sin(t / 2600) * .22; my = .4 + Math.cos(t / 3100) * .15; }
    tx = (.5 - my) * 14; ty = (mx - .5) * 22;
    cx += (tx - cx) * .07; cy += (ty - cy) * .07;
    env.style.setProperty('--rx', cx.toFixed(2) + 'deg'); env.style.setProperty('--ry', cy.toFixed(2) + 'deg');
    card.style.setProperty('--mx', (mx * 100).toFixed(1) + '%'); card.style.setProperty('--my', (my * 100).toFixed(1) + '%');
    teken(now); start();
  }
  function start() { if (!actief) { actief = true; requestAnimationFrame(lus); } }

  hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); ptr = true; mx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); my = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)); });
  hero.addEventListener('pointerleave', function () { ptr = false; });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { zichtbaar = es[0].isIntersecting; if (zichtbaar) start(); }).observe(hero);
  document.addEventListener('visibilitychange', start);
  addEventListener('resize', maat);
  maat(); start();
})();
