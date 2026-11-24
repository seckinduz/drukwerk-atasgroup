// ATAS DRUKWERK: A6 kaartstudio (3D, QR, snijlijn, PNG-taslag), categorietegels, sjablonenvitrine en spotlights.
(function () {
  'use strict';
  var PRIJZEN = [[10000, 0.35], [5000, 0.45], [2500, 0.55], [1000, 0.65], [500, 0.75], [250, 0.85], [1, 0.95]];
  var MAIL = 'sales@atasgroup.nl';
  var MAXLOGO = 2 * 1024 * 1024;
  var TOEGESTAAN = ['image/png', 'image/jpeg', 'image/svg+xml'];
  var CATS_Z = ['Alle', 'Zakelijke Kerstkaarten', 'Relatiekaarten', 'Visitekaartjes', 'Bedankkaarten', 'Nieuwjaar & Jubileum', 'Eigen Ontwerp'];
  var CATS_P = ['Alle', 'Verjaardag', 'Beterschap', 'Geboorte', 'Nieuwe Woning', 'Huwelijk', 'Fotokaarten'];
  var NAMEN = {
    achtergrond: { zwart: 'Luxe zwart', creme: 'Crème mat', marine: 'Marineblauw', smaragd: 'Smaragdgroen', goudfolie: 'Goudfolie', bordeaux: 'Bordeaux', blush: 'Blush roze' },
    accent: { goud: 'Goudfolie', zilver: 'Zilverfolie', inkt: 'Tekstkleur', merk: 'Huisstijl' },
    lettertype: { klassiek: 'Klassiek', modern: 'Modern', elegant: 'Elegant', handschrift: 'Handschrift' }
  };
  var PAKKETTEN = [
    { titel: '500× Luxe Kerstkaarten 350 g + goudaccent', regio: 'Emmen & heel Nederland', tpl: 'kerst-zwart-goud', n: 500 },
    { titel: '250× Relatiekaarten met eigen logo', regio: 'Emmen & Drenthe', tpl: 'relatie-creme-rand', n: 250 },
    { titel: '1.000× Bedankkaarten in goudfolie', regio: 'Heel Nederland', tpl: 'bedank-goud', n: 1000 },
    { titel: '2.500× Nieuwjaar- en jubileumkaarten', regio: 'Heel Nederland', tpl: 'jubileum-marine-goud', n: 2500 }
  ];
  var BLANK = { sjabloon: 'Eigen ontwerp', achtergrond: 'zwart', accent: 'goud', lettertype: 'klassiek', motief: 'kader', kop: 'Uw boodschap', onder: 'Uw bedrijf', tekst: 'Schrijf hier uw persoonlijke zakelijke boodschap aan uw relaties.' };
  var BRANCHES = [
    { branche: 'Makelaars & Bouw', titel: 'Sleuteloverdracht & Kerst', tpl: 'sleutel-marine-goud', n: 250 },
    { branche: 'Autobedrijven', titel: 'Bedankt & APK', tpl: 'apk-zwart-zilver', n: 500 },
    { branche: 'Horeca', titel: 'VIP & Kerstgroet', tpl: 'horeca-smaragd-goud', n: 250 },
    { branche: 'Accountancy & Advies', titel: 'Zakelijke Relatiekaart 350g', tpl: 'relatie-advies-creme', n: 250 }
  ];
  var st = Object.assign({ bedrijf: '', logo: '', logoNaam: '', qr: true, qrUrl: 'https://drukwerk.atasgroup.nl', snij: false, brand: '', pakket: '', mailing: false, foto: '', fotoNaam: '', fotoModus: false, kaartModus: 'zakelijk' },
    BLANK, { sjabloon: 'Eigen ontwerp', kop: 'Fijne feestdagen', onder: 'Met dank voor een mooi jaar', tekst: 'Dank voor het vertrouwen in het afgelopen jaar. Wij wensen u en uw team sfeervolle feestdagen.' });
  var SJ = [], filter = 'Alle', modus = 'zakelijk';
  var $ = function (id) { return document.getElementById(id); };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  var eur = function (x) { return '€ ' + x.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function verzending(n) {
    if (n === 1) return { eur: 1.95, tekst: '1–2 werkdagen', label: 'Verzending Nederland (1 kaart)' };
    if (n >= 250) return { eur: 0, tekst: '3–5 werkdagen na akkoord proefdruk', label: 'Gratis verzending door heel Nederland' };
    return { eur: 4.95, tekst: 'levertijd bevestigen wij in uw offerte', label: 'Verzending Nederland (kleine zending)' };
  }
  function prijsPerKaart(n) { for (var i = 0; i < PRIJZEN.length; i++) if (n >= PRIJZEN[i][0]) return PRIJZEN[i][1]; return null; }

  /* ---------- QR ---------- */
  function qrNormaal(u) { u = (u || '').trim(); if (!u) return ''; if (!/^https?:\/\//i.test(u)) u = 'https://' + u; return u.slice(0, 200); }
  function qrMatrix(url) {
    try { var q = window.qrcode(0, 'M'); q.addData(url); q.make(); var n = q.getModuleCount(), m = []; for (var r = 0; r < n; r++) { m[r] = []; for (var c = 0; c < n; c++) m[r][c] = q.isDark(r, c); } return m; } catch (e) { return null; }
  }
  function qrSvg(m) {
    var ns = 'http://www.w3.org/2000/svg', n = m.length, s = document.createElementNS(ns, 'svg'), d = '';
    s.setAttribute('viewBox', '0 0 ' + (n + 8) + ' ' + (n + 8)); s.setAttribute('role', 'img'); s.setAttribute('aria-label', 'QR-code naar ' + qrNormaal(st.qrUrl));
    var bg = document.createElementNS(ns, 'rect'); bg.setAttribute('width', n + 8); bg.setAttribute('height', n + 8); bg.setAttribute('rx', 2); bg.setAttribute('fill', '#fff'); s.appendChild(bg);
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (m[r][c]) d += 'M' + (c + 4) + ' ' + (r + 4) + 'h1v1h-1z';
    var p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); p.setAttribute('fill', '#111'); s.appendChild(p); return s;
  }

  /* ---------- huisstijlkleur uit logo ---------- */
  function hexRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function rgbHex(c) { return '#' + c.map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function lum(c) { var f = function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); }
  function brandPair(bg, hex) {
    var base = hexRgb(hex || '#c9a24a'), donker = ['zwart', 'marine', 'smaragd', 'bordeaux'].indexOf(bg) >= 0, i = 0;
    if (donker) while (lum(base) < .2 && i++ < 12) base = mix(base, [255, 255, 255], .15);
    else while (lum(base) > .3 && i++ < 12) base = mix(base, [0, 0, 0], .15);
    return [rgbHex(mix(base, [255, 255, 255], .28)), rgbHex(base)];
  }
  function detectColor(src) {
    return new Promise(function (ok) {
      var im = new Image();
      im.onload = function () {
        try {
          var w0 = im.naturalWidth || 200, h0 = im.naturalHeight || 200, sc = 64 / Math.max(w0, h0), w = Math.max(1, Math.round(w0 * sc)), h = Math.max(1, Math.round(h0 * sc));
          var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var c = cv.getContext('2d', { willReadFrequently: true }); c.drawImage(im, 0, 0, w, h);
          var d = c.getImageData(0, 0, w, h).data, bk = {};
          for (var p = 0; p < d.length; p += 4) {
            var a = d[p + 3]; if (a < 200) continue;
            var r = d[p], g = d[p + 1], b = d[p + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0, v = mx / 255;
            if (v < .14 || sat < .28 || (v > .96 && sat < .35)) continue;
            var k = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4), e = bk[k] || (bk[k] = { w: 0, r: 0, g: 0, b: 0, n: 0 });
            e.w += sat * (a / 255); e.r += r; e.g += g; e.b += b; e.n++;
          }
          var best = null; Object.keys(bk).forEach(function (k2) { if (!best || bk[k2].w > best.w) best = bk[k2]; });
          ok(best && best.n >= 4 ? rgbHex([best.r / best.n, best.g / best.n, best.b / best.n]) : null);
        } catch (e) { ok(null); }
      };
      im.onerror = function () { ok(null); }; im.src = src;
    });
  }

  /* ---------- DOM-kaart ---------- */
  function maakGezicht(zijde, s, o) {
    o = o || {};
    var f = el('div', 'face ' + zijde + ' bg-' + s.achtergrond + ' ac-' + s.accent + ' ff-' + s.lettertype + ' mo-' + s.motief);
    if (s.accent === 'merk') { var bp = brandPair(s.achtergrond, s.brand); f.style.setProperty('--b1', bp[0]); f.style.setProperty('--b2', bp[1]); }
    var slot = el('div', 'logo-slot');
    if (s.logo) { var im = el('img'); im.src = s.logo; im.alt = 'Uw logo'; slot.appendChild(im); } else slot.appendChild(el('span', 'ph', 'Uw logo'));
    var nm = s.kaartModus === 'persoonlijk' ? 'Uw naam' : 'Uw bedrijfsnaam';
    if (zijde === 'front' && s.fotoModus) {
      var fb = el('div', 'fotoblk'); if (s.foto) fb.style.backgroundImage = 'url("' + s.foto + '")'; else { fb.classList.add('ph'); fb.appendChild(el('span', '', 'Uw foto')); }
      f.appendChild(fb); var fm = el('div', 'mid fotomid'); fm.appendChild(el('div', 'kop acc', s.kop || ' ')); fm.appendChild(el('div', 'sub', s.onder)); f.appendChild(fm); f.appendChild(el('div', 'naam', s.bedrijf || nm));
    } else if (zijde === 'front') {
      f.appendChild(slot);
      var mid = el('div', 'mid');
      mid.appendChild(el('div', 'kop acc', s.kop || ' ')); mid.appendChild(el('div', 'rule')); mid.appendChild(el('div', 'sub', s.onder));
      f.appendChild(mid); f.appendChild(el('div', 'naam', s.bedrijf || nm));
    } else {
      var m2 = el('div', 'mid'); m2.appendChild(el('div', 'tekst', s.tekst));
      if (s.qr && o.live) { var mx = qrMatrix(qrNormaal(s.qrUrl)); if (mx) { var w = el('div', 'qr'); w.appendChild(qrSvg(mx)); m2.appendChild(w); } }
      f.appendChild(m2); f.appendChild(slot); f.appendChild(el('div', 'naam acc', s.bedrijf || nm));
    }
    if (o.live) {
      f.appendChild(el('div', 'sheen'));
      if (s.snij) { var c = el('div', 'cutline'); c.appendChild(el('span', '', 'snijlijn · veilige zone 3 mm')); f.appendChild(c); }
    }
    return f;
  }
  function teken() {
    var fl = $('flip'); fl.textContent = '';
    fl.appendChild(maakGezicht('front', st, { live: true })); fl.appendChild(maakGezicht('back', st, { live: true }));
    samenvatting();
  }
  function aantal() { var n = parseInt($('aantal').value, 10); return isNaN(n) ? 0 : n; }
  function samenvatting() {
    var n = aantal(), p = prijsPerKaart(n);
    if (!p) { $('calc-uit').textContent = 'Kies minimaal 1 kaart.'; $('calc-tot').textContent = '—'; $('calc-verz').textContent = ''; }
    else {
      var v = verzending(n);
      $('calc-uit').textContent = eur(p) + ' per kaart × ' + n.toLocaleString('nl-NL') + (n === 1 ? ' kaart' : ' kaarten') + ' = ' + eur(p * n) + ' (excl. btw)';
      $('calc-verz').textContent = v.label + ': ' + eur(v.eur) + ' · ' + v.tekst + ' · totaal incl. verzending, excl. btw';
      $('calc-tot').textContent = eur(p * n + v.eur);
    }
    var ds = $('dr-sum'); if (ds) ds.textContent = p ? n.toLocaleString('nl-NL') + (n === 1 ? ' kaart' : ' kaarten') + ' · ' + $('calc-tot').textContent + ' incl. verzending, excl. btw · ' + verzending(n).label : 'Kies minimaal 1 kaart.';
    presetSync();
    var s = $('samenv'); s.textContent = '';
    [['Pakket', st.pakket || 'geen'], ['Sjabloon', st.sjabloon], ['Kleur', NAMEN.achtergrond[st.achtergrond]], ['Accent', NAMEN.accent[st.accent]], ['Lettertype', NAMEN.lettertype[st.lettertype]], ['Logo', st.logoNaam || 'nog niet geüpload'], ['Foto', st.fotoModus ? (st.fotoNaam || 'nog niet geüpload') : 'nee'], ['QR-code', st.qr ? qrNormaal(st.qrUrl) || 'geen link' : 'uit'], ['Directe verzending', st.mailing ? 'ja, prijs op offerte' : 'nee']].forEach(function (r) {
      var d = el('div'); d.appendChild(el('b', '', r[0] + ': ')); d.appendChild(document.createTextNode(r[1])); s.appendChild(d);
    });
  }
  function knoppen(cont, sleutel, opties, cls) {
    var c = $(cont); c.textContent = '';
    Object.keys(opties).forEach(function (k) {
      var b = el('button', cls === 'sw' ? 'sw-' + k : ''); b.type = 'button'; b.setAttribute('data-k', k);
      if (cls === 'sw') { b.setAttribute('aria-label', opties[k]); b.appendChild(el('span', '', opties[k])); } else b.textContent = opties[k];
      b.addEventListener('click', function () { st[sleutel] = k; sync(); teken(); }); c.appendChild(b);
    });
  }
  function sync() {
    [['kleur-bg', 'achtergrond'], ['kleur-ac', 'accent'], ['lt', 'lettertype']].forEach(function (p) {
      Array.prototype.forEach.call($(p[0]).children, function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-k') === st[p[1]]);
        if (b.getAttribute('data-k') === 'merk') { b.hidden = !st.brand; var bp = brandPair('zwart', st.brand || '#888888'); b.style.setProperty('--b1', bp[0]); b.style.setProperty('--b2', bp[1]); }
      });
    });
    ['kop', 'onder', 'tekst', 'bedrijf'].forEach(function (k) { if ($(k).value !== st[k]) $(k).value = st[k]; });
    $('foto-aan').checked = st.fotoModus; $('qr-aan').checked = st.qr; $('qr-url').value = st.qrUrl; $('snij').checked = st.snij;
  }
  function logoKiezen(e) {
    var fout = $('logo-fout'); fout.textContent = ''; var f = e.target.files[0]; if (!f) return;
    if (TOEGESTAAN.indexOf(f.type) < 0) { fout.textContent = 'Kies een PNG-, JPG- of SVG-bestand.'; e.target.value = ''; return; }
    if (f.size > MAXLOGO) { fout.textContent = 'Het bestand is groter dan 2 MB.'; e.target.value = ''; return; }
    var r = new FileReader(); r.onload = function () {
      st.logo = r.result; st.logoNaam = f.name; teken();
      detectColor(st.logo).then(function (hex) {
        var box = $('huis'); box.hidden = false;
        if (hex) { st.brand = hex; $('huis-sw').style.background = hex; $('huis-sw').hidden = false; $('huis-t').textContent = 'Huisstijlkleur gevonden: ' + hex.toUpperCase(); $('huis-btn').hidden = false; }
        else { st.brand = ''; $('huis-sw').hidden = true; $('huis-btn').hidden = true; $('huis-t').textContent = 'Geen duidelijke huisstijlkleur gevonden (het logo is zwart-wit of grijs). Kies handmatig een accent.'; if (st.accent === 'merk') st.accent = 'goud'; }
        sync(); teken();
      });
    }; r.readAsDataURL(f);
  }
  function fotoKiezen(e) {
    var fout = $('foto-fout'); fout.textContent = ''; var f = e.target.files[0]; if (!f) return;
    if (['image/png', 'image/jpeg', 'image/webp'].indexOf(f.type) < 0) { fout.textContent = 'Kies een PNG-, JPG- of WebP-foto.'; e.target.value = ''; return; }
    if (f.size > 8 * 1024 * 1024) { fout.textContent = 'De foto is groter dan 8 MB.'; e.target.value = ''; return; }
    var r = new FileReader(); r.onload = function () {
      var im = new Image(); im.onload = function () {
        var sc = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement('canvas'); cv.width = Math.round(im.naturalWidth * sc); cv.height = Math.round(im.naturalHeight * sc);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); st.foto = cv.toDataURL('image/jpeg', .9); st.fotoNaam = f.name; st.fotoModus = true; sync(); teken();
      }; im.onerror = function () { fout.textContent = 'Deze foto kon niet worden gelezen.'; }; im.src = r.result;
    }; r.readAsDataURL(f);
  }
  function huisToepassen() { if (!st.brand) return; st.accent = 'merk'; sync(); teken(); }
  function scrollNaar(id) { $(id).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  function pasToe(sj, n, pak) {
    ['achtergrond', 'accent', 'lettertype', 'motief', 'kop', 'onder', 'tekst'].forEach(function (k) { if (sj[k] != null) st[k] = sj[k]; });
    st.sjabloon = sj.naam; st.pakket = pak || ''; st.fotoModus = !!sj.fotokaart; st.kaartModus = sj.modus || 'zakelijk';
    if (n) $('aantal').value = n; else if (st.kaartModus === 'persoonlijk') $('aantal').value = 1; else if (aantal() < 250) $('aantal').value = 500;
    sync(); teken(); zijde(false); scrollNaar('studio');
  }
  function zijde(achter) {
    $('flip').classList.toggle('is-back', achter);
    $('btn-voor').setAttribute('aria-pressed', !achter); $('btn-achter').setAttribute('aria-pressed', achter);
  }

  /* ---------- categorietegels + vitrine (Zakelijk B2B / Persoonlijk) ---------- */
  function thumbState(s) { return Object.assign({}, st, s, { logo: '', bedrijf: '', qr: false, foto: '', fotoModus: !!s.fotokaart, kaartModus: s.modus || 'zakelijk' }); }
  function inModus(s, m) { return (s.modus || 'zakelijk') === (m || modus); }
  function rep(c, m) { return SJ.filter(function (s) { return inModus(s, m) && s.categorie === c; })[0]; }
  function tegel(c, klein, klik, m) {
    m = m || modus;
    var b = el('button', 'cat-tile' + (klein ? ' small' : '')); b.type = 'button'; b.setAttribute('data-cat', c);
    var th = el('div', 'ct-thumb'), r = rep(c, m);
    if (r) th.appendChild(maakGezicht('front', thumbState(r)));
    else { th.classList.add('ct-extra'); th.appendChild(el('span', '', c === 'Eigen Ontwerp' ? '+' : SJ.filter(function (s) { return inModus(s, m); }).length + '')); }
    b.appendChild(th); b.appendChild(el('span', 'ct-l', c)); b.addEventListener('click', function () { klik(c); });
    return b;
  }
  function zetFilter(c) {
    filter = c; q = ''; if ($('zoek')) $('zoek').value = '';
    Array.prototype.forEach.call(document.querySelectorAll('#cat-vitrine [data-cat]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cat') === c); });
    toon();
  }
  function bouwVitrine() {
    var vit = $('cat-vitrine'); vit.textContent = '';
    (modus === 'zakelijk' ? CATS_Z : CATS_P).forEach(function (c) { var t = tegel(c, true, zetFilter); t.setAttribute('aria-pressed', c === filter); vit.appendChild(t); });
  }
  function zetModus(m) {
    modus = m; filter = 'Alle'; q = ''; if ($('zoek')) $('zoek').value = '';
    Array.prototype.forEach.call($('modus').children, function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-m') === m); });
    bouwVitrine(); toon();
  }
  function toon() {
    var g = $('galerij'); g.textContent = '';
    var n = $('cat-noot'); n.textContent = modus === 'persoonlijk' ? 'Eén kaart bestellen? € 0,95 per kaart plus € 1,95 verzending binnen Nederland (1–2 werkdagen), excl. btw. Meerdere kaarten? Zie de prijstabel.' : '';
    var tag = modus === 'persoonlijk' ? '1 kaart · € 0,95' : 'vanaf € 0,35';
    $('sj-count').textContent = SJ.length;
    if (!q && filter === 'Eigen Ontwerp') {
      var a0 = el('article', 'tpl'), t0 = el('div', 'thumb'); t0.appendChild(maakGezicht('front', thumbState(Object.assign({ naam: 'Eigen ontwerp' }, BLANK))));
      a0.appendChild(t0); a0.appendChild(el('small', '', 'Eigen Ontwerp')); a0.appendChild(el('h3', '', 'Begin met een leeg ontwerp'));
      t0.appendChild(el('span', 'pricetag', tag));
      var b0 = el('button', 'btn pill', 'Dit ontwerp aanpassen'); b0.type = 'button'; b0.addEventListener('click', function () { pasToe(Object.assign({ naam: 'Eigen ontwerp' }, BLANK)); }); a0.appendChild(b0); g.appendChild(a0); return;
    }
    var l = q ? SJ.filter(function (s) { return matchT(s, q); }) : SJ.filter(function (s) { return inModus(s) && (filter === 'Alle' || s.categorie === filter); });
    if (q) n.textContent = l.length + ' resultaten voor "' + q + '" (zakelijk en persoonlijk).';
    if (!l.length) g.appendChild(el('p', 'empty', 'Geen sjablonen in deze categorie.'));
    if (filter === 'Visitekaartjes') n.textContent = 'Deze sjablonen zijn A6-kaarten in visitekaartstijl. Losse visitekaartjes (85 × 55 mm)? Vraag een offerte via ' + MAIL + '.';
    l.forEach(function (s) {
      var a = el('article', 'tpl'), th = el('div', 'thumb');
      th.appendChild(maakGezicht('front', thumbState(s)));
      th.appendChild(el('span', 'pricetag', s.modus === 'persoonlijk' ? '1 kaart · € 0,95' : 'vanaf € 0,35'));
      a.appendChild(th); a.appendChild(el('small', '', s.categorie)); a.appendChild(el('h3', '', s.naam));
      var b = el('button', 'btn pill', 'Dit ontwerp aanpassen'); b.type = 'button'; b.addEventListener('click', function () { pasToe(s); }); a.appendChild(b); g.appendChild(a);
    });
  }
  var q = '';
  function matchT(s, w) { var h = (s.naam + ' ' + s.categorie + ' ' + (s.modus || 'zakelijk') + ' ' + (s.kop || '') + ' ' + (s.onder || '')).toLowerCase(); return w.toLowerCase().split(/\s+/).every(function (x) { return !x || h.indexOf(x) >= 0; }); }
  var STRIP = [['Zakelijke Kerst', 'zakelijk', 'Zakelijke Kerstkaarten'], ['Relatiekaarten', 'zakelijk', 'Relatiekaarten'], ['Visitekaartjes', 'zakelijk', 'Visitekaartjes'], ['Bedankkaarten', 'zakelijk', 'Bedankkaarten'],
    ['Verjaardag', 'persoonlijk', 'Verjaardag'], ['Beterschap', 'persoonlijk', 'Beterschap'], ['Geboorte', 'persoonlijk', 'Geboorte'], ['Fotokaarten', 'persoonlijk', 'Fotokaarten'], ['Eigen Ontwerp', 'zakelijk', 'Eigen Ontwerp']];
  function bouwTegels() {
    var strip = $('cat-strip'); strip.textContent = '';
    STRIP.forEach(function (c) {
      var b = el('button', 'circ'); b.type = 'button'; b.setAttribute('aria-label', c[0]);
      var im = el('div', 'c-img'), r = c[2] === 'Eigen Ontwerp' ? null : rep(c[2], c[1]);
      if (r) im.appendChild(maakGezicht('front', thumbState(r))); else { im.classList.add('plus'); im.textContent = '+'; }
      b.appendChild(im); b.appendChild(el('span', 'c-l', c[0])); b.appendChild(el('span', 'c-tag', c[1] === 'zakelijk' ? 'B2B' : '1 Kaart'));
      b.addEventListener('click', function () { if (c[2] === 'Eigen Ontwerp') pasToe(Object.assign({ naam: 'Eigen ontwerp' }, BLANK)); else { zetModus(c[1]); zetFilter(c[2]); scrollNaar('sjablonen'); } });
      strip.appendChild(b);
    });
    bouwVitrine();
  }
  function suggesties() {
    var v = $('zoek').value.trim(), ul = $('sugg'); ul.textContent = '';
    if (!v) { ul.hidden = true; $('zoek').setAttribute('aria-expanded', 'false'); return; }
    var l = SJ.filter(function (s) { return matchT(s, v); }).slice(0, 6);
    if (!l.length) { var l0 = el('li'), b0 = el('button', '', 'Geen sjablonen gevonden'); b0.type = 'button'; b0.disabled = true; l0.appendChild(b0); ul.appendChild(l0); }
    l.forEach(function (s) { var li = el('li'), b = el('button'); b.type = 'button'; b.appendChild(el('span', '', s.naam)); b.appendChild(el('small', '', s.categorie)); b.addEventListener('click', function () { ul.hidden = true; pasToe(s); }); li.appendChild(b); ul.appendChild(li); });
    ul.hidden = false; $('zoek').setAttribute('aria-expanded', 'true');
  }
  function zoekGalerij() { q = $('zoek').value.trim(); $('sugg').hidden = true; toon(); scrollNaar('sjablonen'); }

  /* ---------- teklif-çekmecesi (drawer), sekmeler, aantal-kiezer, banner ---------- */
  var lastFocus = null;
  function openDrawer() {
    $('acc-form').open = false; $('dr-body').appendChild($('pf'));
    lastFocus = document.activeElement; $('drawer-ov').hidden = false; $('drawer').setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
    requestAnimationFrame(function () { $('drawer-ov').classList.add('on'); $('drawer').classList.add('open'); });
    setTimeout(function () { var f = $('pf').elements.bedrijf2; if (f) f.focus(); }, 380);
  }
  function closeDrawer() {
    if (!$('drawer').classList.contains('open')) return;
    $('drawer').classList.remove('open'); $('drawer-ov').classList.remove('on'); $('drawer').setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock');
    setTimeout(function () { if (!$('drawer').classList.contains('open')) $('drawer-ov').hidden = true; }, 420);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function tabs() {
    var ts = document.querySelectorAll('.tools .tabs button');
    Array.prototype.forEach.call(ts, function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(ts, function (x) { x.setAttribute('aria-selected', x === b); });
        Array.prototype.forEach.call(document.querySelectorAll('.tools .pane'), function (p) { p.classList.toggle('on', p.getAttribute('data-pane') === b.getAttribute('data-tab')); });
      });
    });
  }
  function presetSync() { Array.prototype.forEach.call(document.querySelectorAll('.presets button'), function (b) { b.setAttribute('aria-pressed', parseInt(b.getAttribute('data-n'), 10) === aantal()); }); }
  function setAantal(n) { $('aantal').value = Math.max(1, n); samenvatting(); }
  function stapGrootte(n, op) { var d = n < 10 ? 1 : n < 250 ? 10 : n < 1000 ? 50 : 250; return op ? d : -d; }
  function bannerFans() {
    var rot = [-9, 0, 9], ys = [12, -8, 12];
    Array.prototype.forEach.call(document.querySelectorAll('[data-fan]'), function (box) {
      box.textContent = '';
      box.getAttribute('data-fan').split(',').forEach(function (id, k) {
        var s = SJ.filter(function (x) { return x.id === id; })[0]; if (!s) return;
        var c = el('div', 'fan-c'); c.style.setProperty('--r', rot[k] + 'deg'); c.style.setProperty('--y', ys[k] + 'px'); c.style.zIndex = k === 1 ? 2 : 1;
        c.appendChild(maakGezicht('front', thumbState(s))); box.appendChild(c);
      });
    });
  }
  function bannerActies() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-act]'), function (b) {
      b.addEventListener('click', function () { var a = b.getAttribute('data-act'); if (a === 'persoonlijk') { zetModus('persoonlijk'); scrollNaar('sjablonen'); } else scrollNaar(a); });
    });
  }
  function spotlights() {
    var g = $('spot'); g.textContent = '';
    PAKKETTEN.forEach(function (p) {
      var s = SJ.filter(function (x) { return x.id === p.tpl; })[0]; if (!s) return;
      var pr = prijsPerKaart(p.n), a = el('article', 'pak glass');
      var th = el('div', 'thumb'); th.appendChild(maakGezicht('front', thumbState(s))); th.appendChild(el('span', 'pricetag', 'Voorbeeldpakket'));
      var tx = el('div', 'pak-t'); tx.appendChild(el('small', '', p.regio)); tx.appendChild(el('h3', '', p.titel));
      tx.appendChild(el('p', 'pak-p', eur(pr * p.n) + ' · ' + eur(pr) + ' per kaart'));
      tx.appendChild(el('p', 'hint', 'Indicatief, exclusief btw, met gratis verzending door heel Nederland. Wijzig oplage en ontwerp vrij in de studio.'));
      var b = el('button', 'btn pill', 'Dit pakket ontwerpen'); b.type = 'button'; b.addEventListener('click', function () { pasToe(s, p.n); }); tx.appendChild(b);
      a.appendChild(th); a.appendChild(tx); g.appendChild(a);
    });
  }

  function brancheKaarten() {
    var g = $('branche-grid'); g.textContent = '';
    BRANCHES.forEach(function (p) {
      var s = SJ.filter(function (x) { return x.id === p.tpl; })[0]; if (!s) return;
      var pr = prijsPerKaart(p.n), a = el('article', 'pak glass');
      var th = el('div', 'thumb'); th.appendChild(maakGezicht('front', thumbState(s))); th.appendChild(el('span', 'pricetag', p.n + '× · vanaf ' + eur(pr)));
      var tx = el('div', 'pak-t'); tx.appendChild(el('small', '', p.branche)); tx.appendChild(el('h3', '', p.titel));
      tx.appendChild(el('p', 'pak-p', eur(pr * p.n) + ' · ' + eur(pr) + ' per kaart'));
      tx.appendChild(el('p', 'hint', 'Indicatief, exclusief btw, met gratis verzending door heel Nederland. Ontwerp en oplage worden direct in de studio en uw offerteaanvraag gezet.'));
      var b = el('button', 'btn pill', 'Naar studio en offerte'); b.type = 'button'; b.addEventListener('click', function () { pasToe(s, p.n, p.branche + ' — ' + p.titel); }); tx.appendChild(b);
      a.appendChild(th); a.appendChild(tx); g.appendChild(a);
    });
  }

  /* ---------- PNG-taslag (canvas, met afloop, snijmarkering, veilige zone) ---------- */
  var FAM = { klassiek: ['Georgia,"Times New Roman",serif', 'bold', ''], modern: ['"Segoe UI",Inter,Arial,sans-serif', 'bold', ''], elegant: ['"Palatino Linotype",Palatino,Georgia,serif', 'bold', 'italic '], handschrift: ['"Segoe Script","Brush Script MT",cursive', 'normal', ''] };
  var BG = { zwart: ['#0b0b0d', '#f3f0ea'], creme: ['#f1e9d8', '#1d1b17'], marine: ['#0d1a33', '#eef2fa'], smaragd: ['#0a3b2c', '#eaf5ef'], bordeaux: ['#4a1220', '#fbeff0'], blush: ['#f3d9d6', '#3a1c1f'] };
  function stops(acc, bg, ink) {
    if (acc === 'merk') { var bp = brandPair(bg, st.brand); return [[0, bp[0]], [.5, bp[1]], [1, bp[0]]]; }
    if (bg === 'goudfolie' && acc !== 'inkt') return [[0, '#1a1306'], [1, '#1a1306']];
    if (acc === 'goud') return (bg === 'creme' || bg === 'blush') ? [[0, '#b8892f'], [.5, '#7a5714'], [1, '#b8892f']] : [[0, '#f6e3a3'], [.45, '#c9a24a'], [.7, '#8f6b22'], [1, '#f1d78a']];
    if (acc === 'zilver') return [[0, '#ffffff'], [.45, '#b9bec8'], [.7, '#80858f'], [1, '#e9ecf2']];
    return [[0, ink], [1, ink]];
  }
  function lg(ctx, sp, x0, y0, x1, y1) { var g = ctx.createLinearGradient(x0, y0, x1, y1); sp.forEach(function (s) { g.addColorStop(s[0], s[1]); }); return g; }
  function wrapT(ctx, text, maxW) {
    var out = []; String(text).split('\n').forEach(function (par) { var line = ''; par.split(/\s+/).forEach(function (w) { var t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }); out.push(line); }); return out;
  }
  function laadAfb(src) { return new Promise(function (ok) { if (!src) return ok(null); var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = src; }); }
  function drawFace(ctx, zijde, ox, oy, px, img, mx, foto) {
    var w = 105 * px, h = 148 * px, u = w / 100, b = 3 * px, pad = 9 * u, cx = ox + w / 2;
    var fam = FAM[st.lettertype], ink = (BG[st.achtergrond] || ['', '#1a1306'])[1], sp = stops(st.accent, st.achtergrond, ink);
    var acc = lg(ctx, sp, ox, oy, ox + w, oy + h);
    ctx.save(); ctx.beginPath(); ctx.rect(ox - b, oy - b, w + 2 * b, h + 2 * b); ctx.clip();
    ctx.fillStyle = st.achtergrond === 'goudfolie' ? lg(ctx, [[0, '#f6e3a3'], [.45, '#cba34a'], [.7, '#a07b2c'], [1, '#f1d78a']], ox - b, oy - b, ox + w + b, oy + h + b) : BG[st.achtergrond][0];
    ctx.fillRect(ox - b, oy - b, w + 2 * b, h + 2 * b);
    ctx.strokeStyle = acc; ctx.fillStyle = ink;
    if (st.motief === 'rand') { ctx.lineWidth = .5 * u; ctx.strokeRect(ox + 4.5 * u, oy + 4.5 * u, w - 9 * u, h - 9 * u); }
    if (st.motief === 'kader') { ctx.lineWidth = .4 * u; ctx.strokeRect(ox + 4.5 * u, oy + 4.5 * u, w - 9 * u, h - 9 * u); ctx.lineWidth = .25 * u; ctx.strokeRect(ox + 7 * u, oy + 7 * u, w - 14 * u, h - 14 * u); }
    if (st.motief === 'sterren') { ctx.globalAlpha = .35; for (var y = 0; y < h + 19 * u; y += 19 * u) for (var x = 0; x < w + 19 * u; x += 19 * u) { ctx.beginPath(); ctx.arc(ox + x, oy + y, .35 * u, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(ox + x + 5 * u, oy + y + 7 * u, .2 * u, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
    if (st.motief === 'lijnen') { ctx.globalAlpha = .14; ctx.strokeStyle = ink; ctx.lineWidth = .25 * u; for (var k = -h; k < w + h; k += 4 * u * 1.414) { ctx.beginPath(); ctx.moveTo(ox + k, oy); ctx.lineTo(ox + k + h, oy + h); ctx.stroke(); } ctx.globalAlpha = 1; }
    ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    var setLS = function (v) { if ('letterSpacing' in ctx) ctx.letterSpacing = v; };
    var logoY = zijde === 'front' ? oy + pad : oy + h - pad - 3.6 * u * 1.7 - 15 * u, logoH = 15 * u;
    function logo() {
      if (img) { var mw = (w - 2 * pad) * .6, r = Math.min(mw / (img.naturalWidth || 300), logoH / (img.naturalHeight || 100)), lw = (img.naturalWidth || 300) * r, lh = (img.naturalHeight || 100) * r; ctx.drawImage(img, cx - lw / 2, logoY + (logoH - lh) / 2, lw, lh); }
      else { ctx.globalAlpha = .5; ctx.fillStyle = ink; ctx.font = (3.2 * u) + 'px "Segoe UI",Arial,sans-serif'; setLS(.3 * 3.2 * u + 'px'); ctx.fillText('UW LOGO', cx, logoY + logoH / 2 + 1.1 * u); setLS('0px'); ctx.globalAlpha = 1; }
    }
    function naam(accent) { ctx.fillStyle = accent ? acc : ink; ctx.font = (3.6 * u) + 'px "Segoe UI",Arial,sans-serif'; setLS(.2 * 3.6 * u + 'px'); ctx.fillText((st.bedrijf || (st.kaartModus === 'persoonlijk' ? 'Uw naam' : 'Uw bedrijfsnaam')).toUpperCase(), cx, oy + h - pad); setLS('0px'); }
    if (zijde === 'front' && st.fotoModus) {
      var ph = 78 * u, fw = w + 2 * b; ctx.save(); ctx.beginPath(); ctx.rect(ox - b, oy - b, fw, ph + b); ctx.clip();
      if (foto) { var sc = Math.max(fw / foto.naturalWidth, (ph + b) / foto.naturalHeight), iw = foto.naturalWidth * sc, ih = foto.naturalHeight * sc; ctx.drawImage(foto, ox - b + (fw - iw) / 2, oy - b + (ph + b - ih) / 2, iw, ih); }
      else { ctx.fillStyle = lg(ctx, [[0, '#f6c9a0'], [.38, '#e58f6b'], [.62, '#5a3a5f'], [1, '#1c2447']], 0, oy - b, 0, oy + ph); ctx.fillRect(ox - b, oy - b, fw, ph + b); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = (3.6 * u) + 'px "Segoe UI",Arial,sans-serif'; setLS(.3 * 3.6 * u + 'px'); ctx.fillText('UW FOTO', cx, oy + ph / 2); setLS('0px'); }
      ctx.restore(); naam(false);
      var fk = (st.lettertype === 'handschrift' ? 9.5 : 8.2) * u; ctx.font = fam[2] + fam[1] + ' ' + fk + 'px ' + fam[0];
      var fl = wrapT(ctx, st.kop || ' ', w - 2 * pad), flh = fk * 1.1, fy = oy + ph + 9 * u + fk * .8; ctx.fillStyle = acc; fl.forEach(function (t, i) { ctx.fillText(t, cx, fy + i * flh); });
      ctx.fillStyle = ink; ctx.font = (3.6 * u) + 'px "Segoe UI",Arial,sans-serif'; setLS(.14 * 3.6 * u + 'px'); ctx.globalAlpha = .85; ctx.fillText((st.onder || '').toUpperCase(), cx, fy + (fl.length - 1) * flh + 6 * u); ctx.globalAlpha = 1; setLS('0px');
    } else if (zijde === 'front') {
      logo(); naam(false);
      var ks = (st.lettertype === 'handschrift' ? 13 : 11.5) * u; ctx.font = fam[2] + fam[1] + ' ' + ks + 'px ' + fam[0];
      var ls = wrapT(ctx, st.kop || ' ', w - 2 * pad), lh = ks * 1.08, bh = ls.length * lh + 5 * u + .4 * u + 4 * u + 4.5 * u;
      var top = oy + pad + logoH, bot = oy + h - pad - 4 * u, y0 = top + (bot - top - bh) / 2 + ks * .85;
      ctx.fillStyle = acc; ls.forEach(function (t, i) { ctx.fillText(t, cx, y0 + i * lh); });
      var ry = y0 + (ls.length - 1) * lh + ks * .15 + 5 * u; ctx.fillRect(cx - 7 * u, ry, 14 * u, .4 * u);
      ctx.fillStyle = ink; ctx.font = (3.8 * u) + 'px "Segoe UI",Arial,sans-serif'; setLS(.14 * 3.8 * u + 'px'); ctx.globalAlpha = .85; ctx.fillText((st.onder || '').toUpperCase(), cx, ry + 4 * u + 3.8 * u); ctx.globalAlpha = 1; setLS('0px');
    } else {
      logo(); naam(true);
      ctx.font = fam[2] + (st.lettertype === 'handschrift' ? 'normal' : 'normal') + ' ' + 5 * u + 'px ' + fam[0];
      var tl = wrapT(ctx, st.tekst, w - 2 * pad).slice(0, 7), tlh = 5 * u * 1.55, qs = mx ? 20 * u : 0, bh2 = tl.length * tlh + (mx ? 5 * u + qs : 0);
      var t2 = oy + pad, b2 = logoY, ys = t2 + (b2 - t2 - bh2) / 2 + 5 * u;
      ctx.fillStyle = ink; tl.forEach(function (t, i) { ctx.fillText(t, cx, ys + i * tlh); });
      if (mx) { var qy = ys + (tl.length - 1) * tlh + 5 * u + 2 * u, n = mx.length, cell = qs / (n + 8); ctx.fillStyle = '#fff'; ctx.beginPath(); (ctx.roundRect || ctx.rect).call(ctx, cx - qs / 2, qy, qs, qs, 2 * cell); ctx.fill(); ctx.fillStyle = '#111'; for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (mx[r][c]) ctx.fillRect(cx - qs / 2 + (c + 4) * cell, qy + (r + 4) * cell, cell + .4, cell + .4); }
    }
    if (st.snij) {
      var pxm = px; ctx.save(); ctx.strokeStyle = '#ff3d6e'; ctx.lineWidth = .25 * pxm; ctx.setLineDash([2 * pxm, 1.4 * pxm]); ctx.strokeRect(ox + 3 * pxm, oy + 3 * pxm, w - 6 * pxm, h - 6 * pxm); ctx.restore();
      ctx.save(); ctx.strokeStyle = '#000'; ctx.lineWidth = .2 * pxm; var m = 7 * pxm, g = b;
      [[ox, oy, -1, -1], [ox + w, oy, 1, -1], [ox, oy + h, -1, 1], [ox + w, oy + h, 1, 1]].forEach(function (c) { ctx.beginPath(); ctx.moveTo(c[0] + c[2] * g, c[1]); ctx.lineTo(c[0] + c[2] * (g + m), c[1]); ctx.moveTo(c[0], c[1] + c[3] * g); ctx.lineTo(c[0], c[1] + c[3] * (g + m)); ctx.stroke(); });
      ctx.restore();
    }
  }
  function downloadPng() {
    var fout = $('png-fout'); fout.textContent = '';
    var px = 10, mg = 12 * px, W = 105 * px, H = 148 * px;
    var cv = document.createElement('canvas'); cv.width = mg * 3 + W * 2; cv.height = mg * 2 + H + 8 * px;
    var ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    var mx = st.qr ? qrMatrix(qrNormaal(st.qrUrl)) : null;
    Promise.all([laadAfb(st.logo), st.fotoModus ? laadAfb(st.foto) : Promise.resolve(null)]).then(function (im) {
      var img = im[0], foto = im[1];
      drawFace(ctx, 'front', mg, mg, px, img, null, foto); drawFace(ctx, 'back', mg * 2 + W, mg, px, img, mx, foto);
      ctx.fillStyle = '#555'; ctx.font = (2.6 * px) + 'px Arial,sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('ATAS DRUKWERK · A6 105 × 148 mm · 3 mm afloop · voorzijde links, achterzijde rechts · taslag, geen drukklaar bestand', mg, mg + H + 6 * px);
      cv.toBlob(function (b) { if (!b) { fout.textContent = 'Downloaden mislukt in deze browser.'; return; } var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'atas-kaart-taslag.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); }, 'image/png');
    });
  }

  function proefdruk(e) {
    e.preventDefault();
    var n = aantal(), p = prijsPerKaart(n);
    if (!p) { $('calc-fout').textContent = 'Kies minimaal 1 kaart.'; return; }
    var form = $('pf'), d = new FormData(form);
    if (d.get('website')) return; // honeypot
    $('calc-fout').textContent = '';
    var fields = {
      Aanvraag: 'Digitale proefdruk A6 (105 x 148 mm, 350 g/m²)', Branchepakket: st.pakket || 'geen', Sjabloon: st.sjabloon, Kleur: NAMEN.achtergrond[st.achtergrond],
      Accent: NAMEN.accent[st.accent] + (st.accent === 'merk' ? ' (' + st.brand + ')' : ''), Lettertype: NAMEN.lettertype[st.lettertype], Motief: st.motief,
      Logo: st.logoNaam || 'volgt per e-mail (bijlage)', 'QR-code achterzijde': st.qr ? qrNormaal(st.qrUrl) : 'nee', Voorzijde: st.kop + ' / ' + st.onder, Achterzijde: st.tekst,
      Foto: st.fotoModus ? (st.fotoNaam || 'volgt per e-mail (bijlage)') : 'geen',
      Oplage: n + (n === 1 ? ' kaart' : ' kaarten'), 'Prijs per kaart': eur(p) + ' (excl. btw)', 'Kaarten totaal': eur(p * n) + ' (excl. btw)',
      Verzending: verzending(n).label + ': ' + eur(verzending(n).eur) + ' · ' + verzending(n).tekst + ' (excl. btw)', 'Indicatief totaal incl. verzending': eur(p * n + verzending(n).eur) + ' (excl. btw)',
      'Directe verzending naar klantenlijst (CSV/Excel + enveloppen)': st.mailing ? 'Ja, prijs op offerte' : 'Nee',
      Bedrijf: d.get('bedrijf2'), Contactpersoon: d.get('naam2'), 'E-mail': d.get('email2'), 'Ontvanger adres': [d.get('adres'), d.get('postcode'), d.get('plaats')].filter(Boolean).join(', ') || 'niet opgegeven', Bijlagen: 'Voeg het PNG-taslag, uw logo' + (st.fotoModus ? ', uw foto' : '') + '' + (st.mailing ? ' en uw adreslijst (CSV/Excel)' : '') + ' toe als bijlage.'
    };
    window.AtasForms.send({ subject: 'Proefdruk-aanvraag A6 kaart - ' + d.get('bedrijf2'), fields: fields, status: $('calc-fout'), button: form.querySelector('button[type=submit]') });
  }

  function start() {
    knoppen('kleur-bg', 'achtergrond', NAMEN.achtergrond, 'sw'); knoppen('kleur-ac', 'accent', NAMEN.accent, 'sw'); knoppen('lt', 'lettertype', NAMEN.lettertype, '');
    ['kop', 'onder', 'tekst', 'bedrijf'].forEach(function (k) { $(k).addEventListener('input', function () { st[k] = $(k).value; if (k === 'bedrijf' && !$('bedrijf2').value) $('bedrijf2').value = st.bedrijf; teken(); }); });
    $('qr-aan').addEventListener('change', function () { st.qr = this.checked; teken(); });
    $('qr-url').addEventListener('input', function () { st.qrUrl = this.value; var ok = !st.qr || !st.qrUrl.trim() || qrMatrix(qrNormaal(st.qrUrl)); $('qr-fout').textContent = ok ? '' : 'Deze link is te lang voor een QR-code.'; teken(); });
    $('snij').addEventListener('change', function () { st.snij = this.checked; teken(); });
    $('png').addEventListener('click', downloadPng);
    $('logo').addEventListener('change', logoKiezen);
    $('logo-weg').addEventListener('click', function () { st.logo = ''; st.logoNaam = ''; st.brand = ''; if (st.accent === 'merk') st.accent = 'goud'; $('logo').value = ''; $('huis').hidden = true; sync(); teken(); });
    $('huis-btn').addEventListener('click', huisToepassen);
    $('foto').addEventListener('change', fotoKiezen);
    $('foto-aan').addEventListener('change', function () { st.fotoModus = this.checked; teken(); });
    $('foto-weg').addEventListener('click', function () { st.foto = ''; st.fotoNaam = ''; $('foto').value = ''; teken(); });
    Array.prototype.forEach.call($('modus').children, function (b) { b.addEventListener('click', function () { zetModus(b.getAttribute('data-m')); }); });
    $('mailing').addEventListener('change', function () { st.mailing = this.checked; $('mailing-h').hidden = !this.checked; samenvatting(); });
    $('btn-voor').addEventListener('click', function () { zijde(false); }); $('btn-achter').addEventListener('click', function () { zijde(true); });
    $('aantal').addEventListener('input', samenvatting); $('pf').addEventListener('submit', proefdruk);
    tabs(); bannerActies();
    $('qty-min').addEventListener('click', function () { var n = aantal(); setAantal(n + stapGrootte(n - 1, false)); });
    $('qty-plus').addEventListener('click', function () { var n = aantal(); setAantal(n + stapGrootte(n, true)); });
    Array.prototype.forEach.call(document.querySelectorAll('.presets button'), function (b) { b.addEventListener('click', function () { setAantal(parseInt(b.getAttribute('data-n'), 10)); }); });
    $('open-drawer').addEventListener('click', openDrawer); $('open-drawer-h').addEventListener('click', openDrawer);
    $('dr-x').addEventListener('click', closeDrawer); $('drawer-ov').addEventListener('click', closeDrawer);
    $('acc-form').addEventListener('toggle', function () { if (this.open) { closeDrawer(); $('acc-body').appendChild($('pf')); } });
    $('zoek').addEventListener('input', suggesties); $('zoek-btn').addEventListener('click', zoekGalerij);
    $('zoek').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); zoekGalerij(); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDrawer(); $('sugg').hidden = true; } });
    document.addEventListener('click', function (e) { if (!e.target.closest('.hsearch')) $('sugg').hidden = true; });
    var fw = document.querySelector('.flipwrap'), tilt = $('tilt');
    if (!reduce) {
      fw.addEventListener('pointermove', function (e) { var r = fw.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; tilt.style.setProperty('--tx', ((.5 - y) * 10).toFixed(1) + 'deg'); tilt.style.setProperty('--ty', ((x - .5) * 12).toFixed(1) + 'deg'); fw.style.setProperty('--mx', (x * 100).toFixed(0) + '%'); fw.style.setProperty('--my', (y * 100).toFixed(0) + '%'); });
      fw.addEventListener('pointerleave', function () { tilt.style.setProperty('--tx', '0deg'); tilt.style.setProperty('--ty', '0deg'); });
    }
    sync(); teken();
    fetch('sjablonen/sjablonen.json').then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { SJ = j.sjablonen || []; bouwTegels(); toon(); spotlights(); brancheKaarten(); bannerFans(); })
      .catch(function () { $('galerij').textContent = 'De sjablonen konden niet worden geladen. Ververs de pagina.'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
