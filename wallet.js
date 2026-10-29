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
  const SITE = 'https://rfim.github.io/bija-coffee/';
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
  const available = () => !demo() && !!platform && status[platform] === true;
  function options() {
    if (demo()) return [];
    if (platform) return available() ? [{ id: platform, label: LABEL[platform], mode: 'add', badge: badge(platform) }] : [];
    return ['apple', 'google'].filter((k) => status[k]).map((k) => ({ id: k, label: LABEL[k], mode: 'qr', badge: badge(k) }));
  }

  async function add(id = platform) {
    if (!id || !status[id] || demo()) return { ok: false, reason: 'not_available' };
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

  window.BijaWallet = { platform, refresh, available, options, add, qrUrl, qrSvg, fromHash, badge };
  // warm the cache once the backend is connected; harmless in demo mode
  if (!demo()) setTimeout(() => { refresh(); }, 1500);
})();
