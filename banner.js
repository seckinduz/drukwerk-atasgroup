// Hero-banner: horizontale campagne-slider (pijlen, bolletjes, swipe, autoplay met pauze).
(function () {
  'use strict';
  var b = document.getElementById('banner'), track = document.getElementById('slides');
  if (!b || !track) return;
  var sl = Array.prototype.slice.call(track.children), dots = b.querySelector('.bn-dots'), i = 0, timer = null, down = null;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  sl.forEach(function (s, k) { var d = document.createElement('button'); d.type = 'button'; d.setAttribute('aria-label', 'Campagne ' + (k + 1)); d.addEventListener('click', function () { go(k); play(); }); dots.appendChild(d); });
  function go(k) {
    i = (k + sl.length) % sl.length; track.style.transform = 'translateX(-' + i * 100 + '%)';
    sl.forEach(function (s, j) { s.setAttribute('aria-hidden', j !== i); s.inert = j !== i; });
    Array.prototype.forEach.call(dots.children, function (d, j) { d.setAttribute('aria-current', j === i); });
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function play() { stop(); if (reduce) return; timer = setInterval(function () { go(i + 1); }, 7000); }
  b.querySelector('.prev').addEventListener('click', function () { go(i - 1); play(); });
  b.querySelector('.next').addEventListener('click', function () { go(i + 1); play(); });
  b.addEventListener('pointerenter', stop); b.addEventListener('pointerleave', play); b.addEventListener('focusin', stop); b.addEventListener('focusout', play);
  b.addEventListener('pointerdown', function (e) { if (e.target.closest('button,a')) return; down = e.clientX; });
  addEventListener('pointerup', function (e) { if (down == null) return; var dx = e.clientX - down; down = null; if (Math.abs(dx) > 50) { go(i + (dx < 0 ? 1 : -1)); play(); } });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else play(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting) play(); else stop(); }).observe(b);
  go(0); play();
})();
