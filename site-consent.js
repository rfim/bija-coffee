/* Bija privacy choices for the website (UK GDPR and PECR).
   The site sets no cookies and runs no analytics or advertising. The browser keeps only what the shop needs
   (basket, orders placed in this browser, website or app preference, and this choice), which is strictly necessary.
   Optional categories stay off until the visitor turns them on. The choice is saved in localStorage 'bija.consent'
   with a timestamp and a policy version, and we ask again after 12 months or when VERSION changes.
   Future scripts: check window.BijaConsent.allowed('analytics') before running, and listen for the 'bija:consent' event. */
(() => {
  const KEY = 'bija.consent';
  const VERSION = '2026-10-30'; // change this when the categories or what they cover change, so everyone is asked again
  const MAX_AGE = 365 * 24 * 60 * 60 * 1000;
  const OPTIONAL = ['preferences', 'analytics', 'marketing'];
  const CATS = [
    { k: 'necessary', name: 'Strictly necessary', fixed: true,
      text: 'Keeps your basket and the orders you place in this browser, remembers whether you wanted the website or the app, keeps you signed in to your Bija Card if you use our web app, and saves this choice. The shop can\'t work without these, so they\'re always on. None of them are cookies.' },
    { k: 'preferences', name: 'Preferences',
      text: 'Lets us remember optional extras to make your next visit easier, such as coffees you looked at recently. We don\'t store anything like this yet, and we won\'t unless you turn it on.' },
    { k: 'analytics', name: 'Analytics',
      text: 'Our site doesn\'t run any analytics today. This only applies if Bija adds simple, privacy-friendly visit counts later, without cookies or tracking across other sites. It stays off unless you allow it.' },
    { k: 'marketing', name: 'Marketing',
      text: 'We don\'t show adverts, use advertising cookies or sell your data. This would only cover personalised offers on this site if we ever add them. Our email news is separate: you sign up with its own tick box.' },
  ];

  let mem = null; // fallback when the browser blocks storage, so we don't ask on every page
  let root = null, lastOpener = null, live = null;

  // ---------- storage ----------
  function valid(r) {
    if (!r || typeof r !== 'object' || r.version !== VERSION || !r.choices) return false;
    const t = Date.parse(r.ts);
    return Number.isFinite(t) && Date.now() - t < MAX_AGE && t - Date.now() < 86400000;
  }
  function read() {
    let r = null;
    try { r = JSON.parse(localStorage.getItem(KEY)); } catch { r = null; }
    if (!r && mem) r = mem;
    return valid(r) ? r : null;
  }
  function write(choices, method) {
    const ts = new Date().toISOString();
    const r = { version: VERSION, ts, expires: new Date(Date.parse(ts) + MAX_AGE).toISOString(), method, choices: { necessary: true } };
    OPTIONAL.forEach((k) => { r.choices[k] = !!choices[k]; });
    mem = r;
    try { localStorage.setItem(KEY, JSON.stringify(r)); } catch { /* storage blocked: keep it for this page only */ }
    return r;
  }
  function snapshot(r) { return r ? { version: r.version, ts: r.ts, expires: r.expires, method: r.method, choices: { ...r.choices } } : null; }
  function announce(r, initial) {
    try { window.dispatchEvent(new CustomEvent('bija:consent', { detail: { ...snapshot(r), initial: !!initial } })); } catch { /* very old browser */ }
  }

  // ---------- markup ----------
  const kawung = `<svg class="bc-kawung" aria-hidden="true" focusable="false"><defs><pattern id="bc-kw" width="24" height="24" patternUnits="userSpaceOnUse"><g fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="6" r="6"/><circle cx="18" cy="12" r="6"/><circle cx="12" cy="18" r="6"/><circle cx="6" cy="12" r="6"/></g><circle cx="12" cy="12" r="1.2" fill="currentColor"/></pattern></defs><rect width="100%" height="100%" fill="url(#bc-kw)"/></svg>`;
  const mark = '<svg class="bc-mark" viewBox="-2 -2 104 104" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="7"><circle cx="50" cy="25" r="25"/><circle cx="75" cy="50" r="25"/><circle cx="50" cy="75" r="25"/><circle cx="25" cy="50" r="25"/></g></svg>';
  const xIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  function catHtml(c) {
    const sw = c.fixed
      ? `<button type="button" class="bc-sw" role="switch" aria-checked="true" aria-disabled="true" aria-labelledby="bc-n-${c.k}" aria-describedby="bc-d-${c.k}" data-cat="${c.k}"></button><span class="bc-state">Always on</span>`
      : `<button type="button" class="bc-sw" role="switch" aria-checked="false" aria-labelledby="bc-n-${c.k}" aria-describedby="bc-d-${c.k}" data-cat="${c.k}"></button><span class="bc-state" aria-hidden="true">Off</span>`;
    return `<li class="bc-cat"><div class="bc-ct"><span class="bc-cn" id="bc-n-${c.k}">${c.name}</span><span class="bc-ctl">${sw}</span></div><p class="bc-cd" id="bc-d-${c.k}">${c.text}</p></li>`;
  }
  function build() {
    const el = document.createElement('section');
    el.className = 'bc';
    el.id = 'bija-consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-labelledby', 'bc-h');
    el.setAttribute('aria-describedby', 'bc-intro');
    el.hidden = true;
    el.innerHTML = `<div class="bc-band" aria-hidden="true">${kawung}<span class="bc-eyebrow">${mark}Privacy choices</span></div>
      <button type="button" class="bc-x" data-bc="close" aria-label="Close privacy choices" hidden>${xIcon}</button>
      <div class="bc-scroll">
        <h2 class="bc-h" id="bc-h" tabindex="-1">Your data, your call</h2>
        <p class="bc-intro" id="bc-intro">We don't use advertising or tracking cookies. Your browser keeps your basket and orders so the shop works. Anything optional stays off unless you say yes. <a href="privacy.html#cookies">Privacy notice</a></p>
        <ul class="bc-cats" id="bc-cats" aria-label="Types of storage" hidden>${CATS.map(catHtml).join('')}</ul>
        <p class="bc-when" data-bc-when hidden></p>
      </div>
      <div class="bc-acts">
        <button type="button" class="bc-btn" data-bc="accept">Accept all</button>
        <button type="button" class="bc-btn" data-bc="reject">Reject all</button>
        <button type="button" class="bc-btn" data-bc="choose" aria-expanded="false" aria-controls="bc-cats">Choose</button>
        <button type="button" class="bc-btn" data-bc="save" hidden>Save choices</button>
      </div>`;
    const skip = document.querySelector('body > .skip');
    if (skip) skip.after(el); else document.body.prepend(el);
    const spacer = document.createElement('div');
    spacer.className = 'bc-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(spacer);
    el.addEventListener('click', onClick);
    el.addEventListener('keydown', onKey);
    // keep page content scrollable out from under the panel (and keep focused controls visible above it)
    if ('ResizeObserver' in window) new ResizeObserver(syncHeight).observe(el);
    addEventListener('resize', syncHeight);
    return el;
  }
  function syncHeight() {
    if (!root) return;
    const h = root.hidden ? 0 : Math.ceil(root.getBoundingClientRect().height) + (matchMedia('(max-width: 560px)').matches ? 0 : 24);
    document.documentElement.style.setProperty('--bc-h', h + 'px');
  }

  // ---------- state ----------
  function setSwitches(choices) {
    root.querySelectorAll('.bc-sw:not([aria-disabled])').forEach((b) => setSwitch(b, !!(choices && choices[b.dataset.cat])));
  }
  function setSwitch(b, on) {
    b.setAttribute('aria-checked', on ? 'true' : 'false');
    const s = b.parentElement.querySelector('.bc-state'); if (s) s.textContent = on ? 'On' : 'Off';
  }
  function expand(on) {
    const cats = root.querySelector('#bc-cats');
    cats.hidden = !on;
    root.classList.toggle('expanded', on);
    const choose = root.querySelector('[data-bc="choose"]'), save = root.querySelector('[data-bc="save"]');
    choose.setAttribute('aria-expanded', on ? 'true' : 'false');
    choose.hidden = on; save.hidden = !on;
    syncHeight();
  }
  function show(opts = {}) {
    if (!root) root = build();
    const r = read();
    setSwitches(r && r.choices);
    const when = root.querySelector('[data-bc-when]');
    if (r) {
      const d = new Date(r.ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      when.textContent = `You last chose on ${d}. We'll ask again after 12 months, or sooner if what we store changes.`;
      when.hidden = false;
    } else when.hidden = true;
    root.querySelector('.bc-x').hidden = !r; // a first-time visitor answers with one of the three buttons
    expand(!!opts.expanded);
    const wasHidden = root.hidden;
    root.hidden = false;
    document.documentElement.classList.add('bc-open');
    if (wasHidden) { root.classList.remove('in'); void root.offsetWidth; root.classList.add('in'); }
    syncHeight();
    if (opts.focus) root.querySelector('#bc-h').focus({ preventScroll: true });
  }
  function hide() {
    if (!root || root.hidden) return;
    const hadFocus = root.contains(document.activeElement);
    root.hidden = true;
    document.documentElement.classList.remove('bc-open');
    syncHeight();
    if (!hadFocus) return;
    // return focus to whatever opened the panel, or carry on from where the panel sits in the page
    const back = lastOpener && document.contains(lastOpener) ? lastOpener : nextFocusable();
    lastOpener = null;
    if (back) back.focus({ preventScroll: true });
  }
  function nextFocusable() {
    const all = [...document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')];
    return all.find((x) => !root.contains(x) && (root.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING) && x.offsetParent !== null) || null;
  }
  function say(msg) {
    const S = window.BijaShop;
    if (S && typeof S.toast === 'function' && document.getElementById('shop-toast')) { S.toast(msg); return; }
    if (!live) { live = document.createElement('div'); live.className = 'bc-live'; live.setAttribute('role', 'status'); document.body.appendChild(live); }
    live.textContent = ''; setTimeout(() => { live.textContent = msg; }, 50);
  }
  function decide(choices, method) {
    const r = write(choices, method);
    hide();
    say(method === 'accept-all' ? 'Privacy choices saved: all on' : method === 'reject-all' ? 'Privacy choices saved: essentials only' : 'Privacy choices saved');
    announce(r, false);
  }

  // ---------- events ----------
  function onClick(e) {
    const sw = e.target.closest('.bc-sw');
    if (sw) { if (!sw.hasAttribute('aria-disabled')) setSwitch(sw, sw.getAttribute('aria-checked') !== 'true'); return; }
    const b = e.target.closest('[data-bc]'); if (!b) return;
    const act = b.dataset.bc;
    if (act === 'accept') decide({ preferences: true, analytics: true, marketing: true }, 'accept-all');
    else if (act === 'reject') decide({}, 'reject-all');
    else if (act === 'choose') { expand(true); (root.querySelector('.bc-sw:not([aria-disabled="true"])') || root.querySelector('.bc-sw')).focus(); }
    else if (act === 'save') {
      const c = {}; root.querySelectorAll('.bc-sw:not([aria-disabled])').forEach((s) => { c[s.dataset.cat] = s.getAttribute('aria-checked') === 'true'; });
      decide(c, 'custom');
    } else if (act === 'close') hide();
  }
  function onKey(e) {
    if (e.key !== 'Escape') return;
    if (read()) { e.preventDefault(); hide(); return; } // reopened: Esc closes without changing anything
    if (root.classList.contains('expanded')) { e.preventDefault(); expand(false); root.querySelector('[data-bc="choose"]').focus(); }
  }
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-consent-open]'); if (!o) return;
    e.preventDefault();
    lastOpener = o;
    show({ expanded: true, focus: true });
  });
  // another tab made a choice: follow it here too
  addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    const r = read();
    if (r && root && !root.hidden && !root.contains(document.activeElement)) hide();
    if (r) announce(r, false);
  });

  window.BijaConsent = {
    version: VERSION,
    get: () => snapshot(read()),
    allowed: (cat) => cat === 'necessary' || !!((read() || {}).choices || {})[cat],
    open: () => { lastOpener = document.activeElement && document.activeElement !== document.body ? document.activeElement : null; show({ expanded: true, focus: true }); },
  };

  function init() {
    const r = read();
    if (r) announce(r, true); else show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
