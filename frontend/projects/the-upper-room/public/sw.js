// traces_to: L2-116, L2-117, L2-063
const CACHE = 'the-upper-room-shell-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('/')));
  self.skipWaiting();
});

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'The Upper Room', body: '' };
  e.waitUntil(
    self.registration.showNotification(data.title, { body: data.body, icon: '/favicon.ico' })
  );
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/')) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(e.request).then(cached => cached ?? fetch(e.request))
    );
  }
});
