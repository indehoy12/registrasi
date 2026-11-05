// Service worker: halaman tetap terbuka saat offline setelah pernah dibuka sekali (online).
// Network-first, jadi versi baru dari Netlify langsung terpakai bila ada internet.
const CACHE = 'registrasi-v2';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html'])));
  self.skipWaiting();
});

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Hanya file situs sendiri & library Firebase (gstatic). Lalu lintas Firestore (googleapis) dibiarkan langsung ke jaringan.
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin && u.hostname !== 'www.gstatic.com') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});