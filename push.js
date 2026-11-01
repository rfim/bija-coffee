/* "Your order is ready" notifications (Web Push) for the Bija app.
   window.BijaPush = { supported(), status(), available(), enabled(), enable(), disable(), notifyReady(orderId) }
   - Only on the live backend, and only when the server has its VAPID keys (send-push /status says configured).
     In the demo (?demo=1, or no backend) it offers nothing.
   - iPhone and iPad: Web Push works only when Bija is installed to the Home Screen (iOS 16.4+), so supported() is
     false in a Safari tab.
   - enable() must be called from a tap: it asks permission, subscribes, and saves the subscription in the customer's
     own record (customers/{uid}.push), which only they can write.
   - Inside the native Capacitor app, BijaNative.push handles it instead. */
(() => {
  'use strict';
  const ua = navigator.userAgent || '';
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const standalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const native = () => !!(window.BijaNative && window.BijaNative.push);
  const demo = () => /[?&]demo=1\b/.test(location.search) || !window.BijaSupabase || !!window.claude;
  const TTL = 10 * 60 * 1000, CACHE_KEY = 'bija.push.status';

  let status = { configured: false };
  try { const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null'); if (c && Date.now() - c.at < TTL) status = c.s; } catch {}

  const supported = () => {
    if (native()) return true;
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return false;
    return !ios || standalone();
  };

  const base = () => window.BijaSupabase.config.url + '/functions/v1/send-push';
  async function session() {
    const c = await window.BijaSupabase._ensure();
    const { data } = await c.auth.getSession();
    const s = data && data.session;
    if (!s || !s.access_token) throw new Error('not_signed_in');
    return { c, uid: s.user && s.user.id, headers: { Authorization: 'Bearer ' + s.access_token, apikey: window.BijaSupabase.config.key } };
  }

  async function refresh() {
    if (demo()) { status = { configured: false }; return status; }
    try {
      const r = await fetch(base() + '/status', { headers: (await session()).headers });
      const j = r.ok ? await r.json() : {};
      status = j.configured === true && typeof j.publicKey === 'string' ? { configured: true, publicKey: j.publicKey } : { configured: false };
    } catch { status = { configured: false }; }
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), s: status })); } catch {}
    return status;
  }

  // offer the switch only when it can really work on this device
  const available = () => !demo() && supported() && (native() || status.configured === true);

  const b64ToU8 = (b64) => {
    const s = (b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(s); return Uint8Array.from(raw, (ch) => ch.charCodeAt(0));
  };
  async function keyOf(endpoint) {
    const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
    return 'd' + Array.from(new Uint8Array(d).slice(0, 8), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  const save = async (path, patch) => {
    const { c } = await session();
    const { error } = await c.rpc('doc_update', { p_path: path, p_patch: patch });
    if (error) throw new Error('save_failed');
  };

  async function current() {
    if (!('serviceWorker' in navigator)) return null;
    const reg = await navigator.serviceWorker.getRegistration();
    return reg && reg.pushManager ? reg.pushManager.getSubscription() : null;
  }

  async function enabled() {
    if (!available()) return false;
    if (native()) { try { return localStorage.getItem('bija.push.on') === '1'; } catch { return false; } }
    return Notification.permission === 'granted' && !!(await current());
  }

  // must run from a tap: browsers block permission prompts that aren't
  async function enable() {
    if (!available()) return { ok: false, reason: 'not_available' };
    if (native()) {
      const r = await window.BijaNative.push.register().catch(() => ({ ok: false }));
      if (r && r.ok) { try { localStorage.setItem('bija.push.on', '1'); } catch {} }
      return r && r.ok ? { ok: true } : { ok: false, reason: 'denied' };
    }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return { ok: false, reason: perm === 'denied' ? 'denied' : 'dismissed' };
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(status.publicKey) });
    const j = sub.toJSON();
    const { uid } = await session();
    await save(`customers/${uid}`, { push: { [await keyOf(j.endpoint)]: { endpoint: j.endpoint, keys: { p256dh: j.keys.p256dh, auth: j.keys.auth }, at: new Date().toISOString(), ua: ios ? 'ios' : /Android/.test(ua) ? 'android' : 'web' } } });
    return { ok: true };
  }

  async function disable() {
    if (native()) { try { localStorage.removeItem('bija.push.on'); } catch {} return { ok: true }; }
    const sub = await current();
    if (sub) {
      const key = await keyOf(sub.endpoint);
      await sub.unsubscribe().catch(() => {});
      if (!demo()) { const { uid } = await session(); await save(`customers/${uid}`, { push: { [key]: null } }).catch(() => {}); }
    }
    return { ok: true };
  }

  // staff side: after an order is marked Ready on the live backend. The server sends at most one push per order.
  async function notifyReady(orderId) {
    if (demo() || !status.configured) return { ok: false, reason: 'not_configured' };
    try {
      const r = await fetch(base(), { method: 'POST', headers: { ...(await session()).headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: String(orderId) }) });
      const j = await r.json().catch(() => ({}));
      return r.ok ? { ok: true, sent: j.sent || 0, reason: j.reason } : { ok: false, reason: j.reason || 'error' };
    } catch { return { ok: false, reason: 'offline' }; }
  }

  // the service worker asks open windows to re-save when the push service rotates a subscription
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'bija:resubscribe' && available() && !native() && Notification.permission === 'granted') enable().catch(() => {});
  });

  window.BijaPush = { supported, status: () => ({ ...status }), refresh, available, enabled, enable, disable, notifyReady, _keyOf: keyOf };
})();
