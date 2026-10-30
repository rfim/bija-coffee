// Kenduri page: register-interest form. Validates like contact.html, then saves the answers in this browser only (demo).
(() => {
  // The shared announcement bar hides rotating messages with aria-hidden; mirror it onto inert so hidden links leave the tab order.
  const syncAnnounce = () => {
    const msgs = document.querySelectorAll('.announce .msg');
    const sync = () => msgs.forEach((m) => { m.inert = m.getAttribute('aria-hidden') === 'true'; });
    sync();
    const mo = new MutationObserver(sync);
    msgs.forEach((m) => mo.observe(m, { attributes: true, attributeFilter: ['aria-hidden'] }));
  };

  const KEY = 'bija-kenduri-interest';
  const init = () => {
    syncAnnounce();
    const f = document.getElementById('kf');
    if (!f) return;
    const sum = document.getElementById('k-errsum'), sent = document.getElementById('k-sent');
    const $ = (id) => document.getElementById(id);
    const dietChecks = () => [...f.querySelectorAll('[data-diet] input:checked')];
    const hasDiet = () => dietChecks().length > 0 || $('k-notes').value.trim() !== '';
    const fields = [
      ['k-name', 'e-k-name', () => $('k-name').value.trim() ? '' : 'Enter your name'],
      ['k-email', 'e-k-email', () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($('k-email').value.trim()) ? '' : 'Enter an email address like name@example.com'],
      ['k-size', 'e-k-size', () => { const n = +$('k-size').value; return n >= 1 && n <= 8 ? '' : 'Choose a party size from 1 to 8'; }],
      ['k-feast', 'e-k-feast', () => $('k-feast').value ? '' : 'Choose a feast, or "Any feast"'],
      ['k-consent', 'e-k-consent', () => !hasDiet() || $('k-consent').checked ? '' : 'Tick to let us use your dietary information, or clear the dietary answers'],
    ];
    const setHeading = (n) => { sum.querySelector('h3').textContent = n === 1 ? 'Please check 1 thing' : `Please check ${n} things`; };

    // once a field has been flagged, clear its error as soon as it becomes valid, and keep the summary in step
    const recheck = () => {
      for (const [id, eid, check] of fields) {
        const el = $(id);
        if (el.getAttribute('aria-invalid') !== 'true' || check()) continue;
        el.setAttribute('aria-invalid', 'false'); $(eid).textContent = '';
        const link = sum.querySelector(`a[href="#${id}"]`); if (link) link.parentElement.remove();
        const left = sum.querySelectorAll('li').length;
        if (!left) sum.hidden = true; else setHeading(left);
      }
    };
    f.addEventListener('input', recheck);
    f.addEventListener('change', recheck);

    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const errs = [];
      for (const [id, eid, check] of fields) { const msg = check(); $(id).setAttribute('aria-invalid', msg ? 'true' : 'false'); $(eid).textContent = msg; if (msg) errs.push([id, msg]); }
      if (errs.length) {
        sent.hidden = true; sum.hidden = false; setHeading(errs.length);
        sum.querySelector('ul').replaceChildren(...errs.map(([id, msg]) => { const li = document.createElement('li'), a = document.createElement('a'); a.href = '#' + id; a.textContent = msg; a.addEventListener('click', (ev) => { ev.preventDefault(); $(id).focus(); }); li.append(a); return li; }));
        sum.focus(); return;
      }
      sum.hidden = true;
      const diet = hasDiet();
      const entry = {
        at: new Date().toISOString(),
        name: $('k-name').value.trim(), email: $('k-email').value.trim(),
        partySize: +$('k-size').value, feast: $('k-feast').value,
        // special category data is kept only with explicit consent
        allergens: diet ? [...f.querySelectorAll('input[name=allergen]:checked')].map((i) => i.value) : [],
        diets: diet ? [...f.querySelectorAll('input[name=diet]:checked')].map((i) => i.value) : [],
        notes: diet ? $('k-notes').value.trim() : '',
        dietaryConsent: diet && $('k-consent').checked, marketing: $('k-news').checked,
      };
      let saved = true;
      try { const list = JSON.parse(localStorage.getItem(KEY) || '[]'); list.push(entry); localStorage.setItem(KEY, JSON.stringify(list)); } catch { saved = false; }
      sent.querySelector('.ksent-h').textContent = `Thank you, ${entry.name.split(/\s+/)[0]}. You're on the list.`;
      sent.querySelector('.fine').firstChild.textContent = saved ? 'Demo: saved in this browser only. ' : 'Demo: this browser blocked saving, so nothing was kept. ';
      sent.hidden = false; sent.focus();
      f.querySelector('button[type=submit]').textContent = 'Register another party';
    });

    $('k-clear').addEventListener('click', () => {
      try { localStorage.removeItem(KEY); } catch { /* storage unavailable: nothing was saved */ }
      sent.querySelector('.fine').textContent = 'Deleted. Nothing from this form is saved in this browser now.';
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
