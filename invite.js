// Invite landing: shows the friend's code and passes it to the app (app.html reads ?ref= and fills it in).
(function () {
  const raw = new URLSearchParams(location.search).get('ref') || '';
  const code = /^BIJA-[A-Z0-9]{2,5}$/i.test(raw) ? raw.toUpperCase() : '';
  const ready = () => {
    const open = document.querySelector('[data-open]');
    if (!code) return;
    if (open) open.href = 'app.html?view=app&ref=' + encodeURIComponent(code);
    const wrap = document.querySelector('[data-code-wrap]'); wrap.hidden = false;
    document.querySelector('[data-code]').textContent = code;
    const copy = document.querySelector('[data-copy]');
    copy.addEventListener('click', () => {
      const done = () => { copy.textContent = 'Copied'; setTimeout(() => { copy.textContent = 'Copy'; }, 1800); };
      try { navigator.clipboard.writeText(code).then(done, () => {}); } catch { /* the code is on screen to type */ }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
