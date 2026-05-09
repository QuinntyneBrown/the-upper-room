// traces_to: L2-116, L2-117
const CACHE = 'the-upper-room-shell-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('/')));
  self.skipWaiting();
});

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/')) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(e.request).then(cached => cached ?? fetch(e.request))
    );
  }
});
