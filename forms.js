// Gedeelde verzendlaag: Web3Forms/Formspree als de sleutel is ingevuld (forms-config.js), anders mailto-terugval.
(function () {
  'use strict';
  var MAIL = 'sales@atasgroup.nl';
  var C = window.FORM_CONFIG || {};
  var enc = encodeURIComponent;

  function send(o) {
    var f = o.fields, st = o.status, btn = o.button;
    function meld(cls, t) { if (st) { st.className = 'formstatus ' + cls; st.textContent = t; } }
    function terug() {
      var body = Object.keys(f).map(function (k) { return k + ': ' + f[k]; }).join('\n');
      meld('okmsg', 'Uw e-mailprogramma opent een kant-en-klaar bericht aan ' + MAIL + '. Verstuur het om uw aanvraag te voltooien.');
      location.href = 'mailto:' + MAIL + '?subject=' + enc(o.subject) + '&body=' + enc(body);
    }
    function klaar() { meld('okmsg', 'Bedankt! Uw aanvraag is verzonden. Wij nemen zo snel mogelijk contact met u op.'); if (o.onSent) o.onSent(); }
    if (btn) btn.disabled = true;
    var fin = function () { if (btn) btn.disabled = false; };
    if (C.web3formsKey) {
      meld('okmsg', 'Bezig met verzenden…');
      fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ access_key: C.web3formsKey, subject: o.subject, from_name: 'ATAS DRUKWERK website' }, f)) })
        .then(function (r) { return r.json(); }).then(function (j) { if (j && j.success) klaar(); else terug(); }).catch(terug).then(fin);
    } else if (C.formspreeId) {
      meld('okmsg', 'Bezig met verzenden…');
      fetch('https://formspree.io/f/' + encodeURIComponent(C.formspreeId), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ _subject: o.subject }, f)) })
        .then(function (r) { if (r.ok) klaar(); else terug(); }).catch(terug).then(fin);
    } else { terug(); fin(); }
  }
  window.AtasForms = { send: send };

  function formData(form) { var d = {}; new FormData(form).forEach(function (v, k) { if (k !== 'website' && v !== '') d[k] = String(v); }); return d; }
  function bind(id, subjectFn, labels) {
    var form = document.getElementById(id); if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.website && form.elements.website.value) return; // honeypot
      var raw = formData(form), fields = {};
      Object.keys(labels).forEach(function (k) { if (raw[k] != null) fields[labels[k]] = raw[k]; });
      send({ subject: subjectFn(raw), fields: fields, status: form.querySelector('.formstatus'), button: form.querySelector('button[type=submit]'), onSent: function () { form.reset(); } });
    });
  }
  bind('f', function (r) { return 'Aanvraag digitale proefdruk - ' + r.bedrijf; },
    { bedrijf: 'Bedrijf', naam: 'Contactpersoon', email: 'E-mail', aantal: 'Oplage', mailing: 'Directe verzending naar klantenlijst', opmerking: 'Opmerking' });
  bind('sf', function (r) { return 'Aanvraag gratis samplepakket - ' + r.bedrijf; },
    { bedrijf: 'Bedrijf', naam: 'Contactpersoon', email: 'E-mail', straat: 'Straat en huisnummer', postcode: 'Postcode', plaats: 'Plaats', branche: 'Branche', opmerking: 'Opmerking' });
})();
