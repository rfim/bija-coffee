// Bija Card in Apple Wallet and Google Wallet.
// Honest by design: nothing is offered until the server says that wallet is configured (the owner has added the
// Apple Pass Type ID certificate or the Google Wallet issuer account as Supabase secrets). In demo mode, or before
// that, available() is false and options() is empty, so the app never shows a button that can't work.
//
//   BijaWallet.platform      'apple' | 'google' | null (null = desktop or unknown)
//   BijaWallet.refresh()     fetch which wallets the server can issue (cached 10 minutes), resolves {apple, google}
//   BijaWallet.available()   true when this device's own wallet is configured
//   BijaWallet.options()     [{id, label, mode: 'add' | 'qr', badge}]: on phones the matching wallet to add directly,
//                            on desktop every configured wallet as a QR to scan with the phone
//   BijaWallet.add(id?)      add the card on this device: Apple downloads the signed .pkpass, Google opens its save page
//   BijaWallet.qrUrl(id)     link the desktop QR opens on the phone (the app, which then offers the add)
//   BijaWallet.qrSvg(id)     QR as an SVG string (needs qr.js / qrcode-generator on the page), '' otherwise
//   BijaWallet.fromHash()    'apple' | 'google' | null when the app was opened from that QR (#wallet=apple)
//   BijaWallet.badge(id)     SVG badge in the style of the official "Add to … Wallet" buttons
(() => {
  // The site root this script is served from (wallet.js lives at the root), so links work on any domain
  const SITE = new URL('./', (document.currentScript && document.currentScript.src) || location.href).href;
  const CACHE_KEY = 'bija.wallet.status';
  const TTL = 10 * 60 * 1000;
  const ua = navigator.userAgent || '';
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  const platform = ios ? 'apple' : android ? 'google' : null;
  const demo = () => /[?&]demo=1\b/.test(location.search) || !window.BijaSupabase;

  let status = { apple: false, google: false };
  try { const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null'); if (c && Date.now() - c.at < TTL) status = c.s; } catch {}

  const base = () => window.BijaSupabase.config.url + '/functions/v1/wallet-pass';
  async function headers() {
    const c = await window.BijaSupabase._ensure();
    const { data } = await c.auth.getSession();
    const token = data && data.session && data.session.access_token;
    if (!token) throw new Error('not_signed_in');
    return { Authorization: 'Bearer ' + token, apikey: window.BijaSupabase.config.key };
  }

  async function refresh() {
    if (demo()) { status = { apple: false, google: false }; return status; }
    try {
      const r = await fetch(base() + '/status', { headers: await headers() });
      const j = r.ok ? await r.json() : {};
      status = { apple: j.apple === true, google: j.google === true };
    } catch { status = { apple: false, google: false }; }
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), s: status })); } catch {}
    return status;
  }

  const LABEL = { apple: 'Add to Apple Wallet', google: 'Add to Google Wallet' };
  // available() is the real thing only: the live backend can issue this device's wallet. The demo preview is separate.
  const available = () => !demo() && !!platform && status[platform] === true;
  function options() {
    // demo (GitHub Pages without the backend, or ?demo=1): offer a clearly labelled preview of the pass, nothing more
    // (window.__BIJA_WALLET_DEMO = false turns the preview off, so demo behaves like a live site with no wallet set up)
    if (demo()) return window.__BIJA_WALLET_DEMO === false ? [] : (platform ? [platform] : ['apple', 'google']).map((k) => ({ id: k, label: LABEL[k], mode: 'add', demo: true, badge: badge(k) }));
    if (platform) return available() ? [{ id: platform, label: LABEL[platform], mode: 'add', badge: badge(platform) }] : [];
    return ['apple', 'google'].filter((k) => status[k]).map((k) => ({ id: k, label: LABEL[k], mode: 'qr', badge: badge(k) }));
  }

  async function add(id = platform) {
    if (demo()) {
      if (window.__BIJA_WALLET_DEMO === false) return { ok: false, reason: 'not_available' };
      preview(id === 'google' ? 'google' : 'apple'); return { ok: true, preview: true };
    }
    if (!id || !status[id]) return { ok: false, reason: 'not_available' };
    try {
      const r = await fetch(base() + '/' + id, { method: 'POST', headers: await headers() });
      if (!r.ok) return { ok: false, reason: (await r.json().catch(() => ({}))).reason || 'error' };
      if (id === 'apple') {
        // Safari shows the "Add to Apple Wallet" sheet for a .pkpass it navigates to
        const blob = await r.blob();
        const url = URL.createObjectURL(new Blob([blob], { type: 'application/vnd.apple.pkpass' }));
        location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else {
        const { url } = await r.json();
        if (!/^https:\/\/pay\.google\.com\//.test(url || '')) return { ok: false, reason: 'error' };
        location.assign(url);
      }
      return { ok: true };
    } catch (e) { return { ok: false, reason: e && e.message === 'not_signed_in' ? 'not_signed_in' : 'error' }; }
  }

  const qrUrl = (id) => SITE + 'app.html?view=app#wallet=' + (id === 'google' ? 'google' : 'apple');
  function qrSvg(id) {
    if (typeof window.qrcode !== 'function') return '';
    try { const q = window.qrcode(0, 'M'); q.addData(qrUrl(id)); q.make(); return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: 'QR code: ' + LABEL[id] + ' on your phone' }); } catch { return ''; }
  }
  const fromHash = () => { const m = /[#&]wallet=(apple|google)\b/.exec(location.hash); return m ? m[1] : null; };

  // Drawn in the style of the official badges (black, rounded, wallet glyph, two-line label). Before launch the owner
  // swaps these for the official artwork from Apple and Google (see docs/wallet/README.md); neither logo is reproduced.
  function badge(id) {
    const stripes = id === 'apple' ? ['#ff9f0a', '#30d158', '#0a84ff', '#ff453a'] : ['#4285f4', '#34a853', '#fbbc04', '#ea4335'];
    const sub = id === 'apple' ? 'Apple Wallet' : 'Google Wallet';
    const w = id === 'apple' ? 180 : 200;
    return `<svg class="wallet-badge" viewBox="0 0 ${w} 52" width="${w}" height="52" role="img" aria-label="${LABEL[id]}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="52" rx="${id === 'apple' ? 9 : 26}" fill="#000"/>
      <rect x="${id === 'apple' ? 0.5 : 0.5}" y="0.5" width="${w - 1}" height="51" rx="${id === 'apple' ? 8.5 : 25.5}" fill="none" stroke="#a6a6a6"/>
      <g transform="translate(${id === 'apple' ? 14 : 20} 11)">
        <rect width="34" height="30" rx="6" fill="#fff"/>
        ${stripes.map((c, i) => `<rect x="3" y="${3 + i * 4}" width="28" height="5" rx="2" fill="${c}"/>`).join('')}
        <path d="M3 21h9a5 5 0 0 0 10 0h9v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" fill="#f2f2f2" stroke="#d0d0d0" stroke-width=".6"/>
      </g>
      <text x="${id === 'apple' ? 58 : 64}" y="22" fill="#fff" font-family="-apple-system,'Helvetica Neue',Roboto,Arial,sans-serif" font-size="11">Add to</text>
      <text x="${id === 'apple' ? 58 : 64}" y="40" fill="#fff" font-family="-apple-system,'Helvetica Neue',Roboto,Arial,sans-serif" font-size="17" font-weight="600">${sub}</text>
    </svg>`;
  }

  // ---------- demo preview: what the pass will look like, never a claim that it was added ----------
  const ASSETS = (() => { try { return new URL('wallet/', document.currentScript.src).href; } catch { return 'wallet/'; } })();
  const escH = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // The member's demo card: an app hook if present, else the Bija Card as rendered on screen.
  function cardData() {
    const hook = window.__bijaCardData;
    const d = typeof hook === 'function' ? hook() : hook;
    if (d && typeof d === 'object') return { code: d.code || d.member_code || '', points: +d.points || 0, stamps: +d.stamps || 0, tier: d.tier || 'Seed' };
    const card = document.querySelector('.bcard[data-stamps]') || document.querySelector('.bcard');
    if (!card) return { code: '', points: 0, stamps: 0, tier: 'Seed' };
    const tier = ((card.querySelector('.tier') || {}).textContent || 'Seed').trim();
    const code = ((/BIJA-[A-Z0-9]{3,12}/.exec((card.querySelector('.no') || card).textContent || '') || [])[0]) || '';
    const TIER = { SEED: 'Seed', SPROUT: 'Sprout', 'KOPI TREE': 'Kopi Tree' };
    return { code, points: +((card.querySelector('[data-to]') || {}).dataset || {}).to || 0, stamps: +(card.dataset.stamps || 0), tier: TIER[tier.toUpperCase()] || 'Seed' };
  }

  function injectCSS() {
    if (document.getElementById('bw-css')) return;
    const s = document.createElement('style'); s.id = 'bw-css';
    s.textContent = `
.bw-back{position:fixed;inset:0;z-index:2147483000;background:rgba(11,11,11,.55);display:grid;place-items:end center;animation:bw-fade .2s ease-out}
.bw-sheet{width:min(440px,100%);max-height:92vh;overflow:auto;background:#fff;color:#0b0b0b;border-radius:24px 24px 0 0;padding:20px 20px calc(24px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 40px rgba(0,0,0,.25);animation:bw-up .32s cubic-bezier(.2,.9,.25,1.1);font:15px/1.45 Inter,system-ui,sans-serif}
@media (min-width:700px){.bw-back{place-items:center}.bw-sheet{border-radius:24px}}
.bw-top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}
.bw-sheet h2{font:900 22px/1 Archivo,'Arial Black',sans-serif;text-transform:uppercase;margin:0}
.bw-x{min-width:44px;min-height:44px;border-radius:999px;border:2px solid #0b0b0b;background:#fff;color:#0b0b0b;font:600 13px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:0 16px;cursor:pointer}
.bw-x:focus-visible,.bw-done:focus-visible{outline:3px solid #0b0b0b;outline-offset:3px}
.bw-label{display:flex;gap:10px;align-items:flex-start;background:#f2f2f0;border-radius:14px;padding:12px 14px;font-size:13.5px;color:#333;margin:0 0 16px}
.bw-label b{font-weight:600;color:#0b0b0b}
.bw-tag{flex:none;font:600 11px Inter,sans-serif;letter-spacing:.1em;text-transform:uppercase;background:#0b0b0b;color:#fff;border-radius:999px;padding:3px 9px;margin-top:1px}
.bw-pass{border-radius:16px;overflow:hidden;background:#0b0b0b;color:#fff;margin:0 auto;max-width:340px;box-shadow:0 14px 34px rgba(0,0,0,.28)}
.bw-pass .bw-lab{font-size:10px;letter-spacing:.08em;color:#a3a3a3;text-transform:uppercase}
.bw-pass .bw-val{font-size:16px}
.bw-ph{display:flex;justify-content:space-between;align-items:center;padding:12px 14px}
.bw-ph img{height:30px;width:auto}
.bw-strip{position:relative}.bw-strip img{display:block;width:100%;height:auto}
.bw-strip .bw-pts{position:absolute;left:14px;bottom:10px}.bw-strip .bw-pts .bw-val{font-size:34px;font-weight:300;line-height:1}
.bw-row{display:flex;justify-content:space-between;padding:12px 14px}
.bw-qr{background:#fff;color:#0b0b0b;width:164px;margin:4px auto 16px;padding:10px;border-radius:10px;text-align:center;font:600 12px ui-monospace,Menlo,monospace}
.bw-qr svg{display:block;width:144px;height:144px}
.bw-g{border-radius:20px;background:#0b0b0b;color:#fff;max-width:340px;margin:0 auto;overflow:hidden;box-shadow:0 14px 34px rgba(0,0,0,.28)}
.bw-g .bw-gh{display:flex;align-items:center;gap:10px;padding:14px 16px}
.bw-g .bw-gh img{width:36px;height:36px;border-radius:50%}
.bw-g .bw-prog{font:600 18px Inter,sans-serif;padding:0 16px 8px}
.bw-g .bw-row{padding:6px 16px}
.bw-g .bw-hero img{display:block;width:100%;height:auto}
.bw-done{display:flex;width:100%;justify-content:center;align-items:center;min-height:52px;margin-top:18px;border:0;border-radius:999px;background:#0b0b0b;color:#fff;font:600 14px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
@keyframes bw-up{from{transform:translateY(40px);opacity:0}}@keyframes bw-fade{from{opacity:0}}
@media (prefers-reduced-motion:reduce){.bw-back,.bw-sheet{animation:none}}`;
    document.head.appendChild(s);
  }

  let open = null;
  function close() {
    if (!open) return;
    const { el, prev, onKey } = open; open = null;
    document.removeEventListener('keydown', onKey, true); el.remove();
    if (prev && prev.focus) try { prev.focus({ preventScroll: true }); } catch {}
  }

  function preview(id) {
    close(); injectCSS();
    const d = cardData();
    const code = d.code || 'BIJA-DEMO';
    const stamps = Math.min(Math.max(0, d.stamps | 0), 9);
    const stampText = d.stamps >= 9 ? 'Next drink free' : `${stamps} of 10`;
    const qr = (() => { if (typeof window.qrcode !== 'function') return ''; try { const q = window.qrcode(0, 'M'); q.addData(code); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true, alt: 'Member code ' + code }); } catch { return ''; } })();
    const name = id === 'google' ? 'Google Wallet' : 'Apple Wallet';
    const pass = id === 'google'
      ? `<div class="bw-g" aria-label="Preview of the Bija Card in Google Wallet">
          <div class="bw-gh"><img src="${ASSETS}logo-google.png" alt="" width="36" height="36"><span>Bija Coffee</span></div>
          <div class="bw-prog">Bija Card</div>
          <div class="bw-row"><div><div class="bw-lab" style="font-size:11px;color:#a3a3a3">Points</div><div style="font-size:22px">${escH(d.points.toLocaleString('en-GB'))}</div></div><div style="text-align:right"><div style="font-size:11px;color:#a3a3a3">Stamps</div><div style="font-size:16px">${escH(stampText)}</div></div></div>
          <div class="bw-row"><div><div style="font-size:11px;color:#a3a3a3">Tier</div><div>${escH(d.tier)}</div></div><div style="text-align:right"><div style="font-size:11px;color:#a3a3a3">Member</div><div>${escH(code)}</div></div></div>
          <div class="bw-qr">${qr}<div>${escH(code)}</div></div>
          <div class="bw-hero"><img src="${ASSETS}strip@2x.png" alt="" width="750" height="246"></div>
        </div>`
      : `<div class="bw-pass" aria-label="Preview of the Bija Card in Apple Wallet">
          <div class="bw-ph"><img src="${ASSETS}logo@2x.png" alt="Bija" width="96" height="30"><div style="text-align:right"><div class="bw-lab">Tier</div><div class="bw-val">${escH(d.tier)}</div></div></div>
          <div class="bw-strip"><img src="${ASSETS}strip@2x.png" alt="" width="750" height="246"><div class="bw-pts"><div class="bw-lab">Points</div><div class="bw-val">${escH(d.points.toLocaleString('en-GB'))}</div></div></div>
          <div class="bw-row"><div><div class="bw-lab">Stamps</div><div class="bw-val">${escH(stampText)}</div></div><div style="text-align:right"><div class="bw-lab">Member</div><div class="bw-val">${escH(code)}</div></div></div>
          <div class="bw-qr">${qr}<div>${escH(code)}</div></div>
        </div>`;
    const el = document.createElement('div');
    el.className = 'bw-back'; el.dataset.walletPreview = id;
    el.innerHTML = `<div class="bw-sheet" role="dialog" aria-modal="true" aria-labelledby="bw-title">
      <div class="bw-top"><h2 id="bw-title">${name} preview</h2><button type="button" class="bw-x" data-bw-close>Close</button></div>
      <p class="bw-label"><span class="bw-tag">Preview</span><span><b>Preview:</b> in the live app this adds to ${name} once Bija's ${name} account is set up. Nothing has been added to your phone.</span></p>
      ${pass}
      <button type="button" class="bw-done" data-bw-close>Back to the app</button>
    </div>`;
    el.addEventListener('click', (e) => { if (e.target === el || e.target.closest('[data-bw-close]')) close(); });
    const onKey = (e) => {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      const f = [...el.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    };
    open = { el, prev: document.activeElement, onKey };
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(el);
    el.querySelector('.bw-x').focus({ preventScroll: true });
  }

  window.BijaWallet = { platform, refresh, available, options, add, qrUrl, qrSvg, fromHash, badge, preview, cardData, close };
  // warm the cache once the backend is connected; harmless in demo mode
  if (!demo()) setTimeout(() => { refresh(); }, 1500);
})();
