// Offline shell for the Bija app: pages load from the network first, the cache keeps the last copy for when the signal drops.
const CACHE = 'bija-v5';
const SHELL = ['./', 'index.html', 'app.html', 'app-motion.css', 'app-motion.js', 'app-staff.js', 'native-bridge.js', 'wallet.js', 'bija-supabase.js', 'shop.html', 'product.html', 'subscribe.html', 'rewards.html', 'checkout.html', 'delivery.html', 'menu.html', 'find.html', 'origins.html', 'brew.html', 'visit.html', 'events.html', 'gifts.html', 'offices.html', 'press.html', 'sustainability.html', 'help.html', 'contact.html', 'install.html', 'trace.html', 'trace.js', 'labels.html', 'labels.js', 'qr.js', 'site-shop.css', 'site-shop.js', 'site-discover.js', 'privacy.html', 'accessibility.html', 'allergens.html', '404.html', 'legal.css', 'manifest.webmanifest', 'fonts/fonts.css', 'fonts/fonts-site.css', 'fonts/archivo-latin-700-normal.woff2', 'fonts/archivo-latin-800-normal.woff2', 'fonts/archivo-latin-900-normal.woff2', 'fonts/inter-latin-400-normal.woff2', 'fonts/inter-latin-600-normal.woff2', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/app-qr.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; }).catch(() => caches.match(req, { ignoreSearch: true })));
});
