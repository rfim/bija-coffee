// Offline shell for the Bija app: pages load from the network first, the cache keeps the last copy for when the signal drops.
const CACHE = 'bija-v3';
const SHELL = ['./', 'index.html', 'app.html', 'shop.html', 'product.html', 'subscribe.html', 'rewards.html', 'checkout.html', 'delivery.html', 'site-shop.css', 'site-shop.js', 'privacy.html', 'accessibility.html', 'legal.css', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/app-qr.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; }).catch(() => caches.match(req, { ignoreSearch: true })));
});
