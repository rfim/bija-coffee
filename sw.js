// Offline shell for the Bija app: pages load from the network first, the cache keeps the last copy for when the signal drops.
const CACHE = 'bija-v6';
const SHELL = ['./', 'index.html', 'app.html', 'app-motion.css', 'app-motion.js', 'app-staff.js', 'native-bridge.js', 'wallet.js', 'push.js', 'bija-supabase.js', 'shop.html', 'product.html', 'subscribe.html', 'rewards.html', 'checkout.html', 'delivery.html', 'menu.html', 'find.html', 'origins.html', 'brew.html', 'visit.html', 'events.html', 'gifts.html', 'offices.html', 'press.html', 'sustainability.html', 'help.html', 'contact.html', 'install.html', 'trace.html', 'trace.js', 'labels.html', 'labels.js', 'qr.js', 'site-shop.css', 'site-shop.js', 'site-discover.js', 'privacy.html', 'accessibility.html', 'allergens.html', '404.html', 'legal.css', 'manifest.webmanifest', 'fonts/fonts.css', 'fonts/fonts-site.css', 'fonts/archivo-latin-700-normal.woff2', 'fonts/archivo-latin-800-normal.woff2', 'fonts/archivo-latin-900-normal.woff2', 'fonts/inter-latin-400-normal.woff2', 'fonts/inter-latin-600-normal.woff2', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/app-qr.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; }).catch(() => caches.match(req, { ignoreSearch: true })));
});

// Order-ready alerts (Web Push). The payload comes from the send-push Edge Function.
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : '' }; }
  const clip = (s, n) => String(s || '').slice(0, n);
  e.waitUntil(self.registration.showNotification(clip(d.title, 60) || 'Bija', {
    body: clip(d.body, 140) || 'Your order is ready at the bar.',
    tag: clip(d.tag, 40) || 'bija-order',
    renotify: true,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    data: { url: /^app\.html[?#]/.test(d.url || '') ? d.url : 'app.html?view=app#card' },
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || 'app.html?view=app#card', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) {
      if (new URL(c.url).pathname.endsWith('/app.html') && 'focus' in c) return (c.navigate ? c.navigate(target).catch(() => c) : Promise.resolve(c)).then((w) => (w || c).focus());
    }
    return self.clients.openWindow(target);
  }));
});
self.addEventListener('pushsubscriptionchange', (e) => {
  // the push service rotated the subscription: ask open app windows to subscribe again and save it
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((list) => list.forEach((c) => c.postMessage({ type: 'bija:resubscribe' }))));
});
