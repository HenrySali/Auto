// Service Worker para PWA
const CACHE_NAME = 'auto-manager-v1';
const urlsToCache = [
  '/Auto/',
  '/Auto/css/style.css',
  '/Auto/js/app.js',
  '/Auto/js/github-api.js',
  '/Auto/js/pages/dashboard.js',
  '/Auto/js/pages/km.js',
  '/Auto/js/pages/entregas.js',
  '/Auto/js/pages/fotos.js',
  '/Auto/js/pages/gastos.js',
  '/Auto/js/pages/vehiculo.js',
  '/Auto/js/pages/notas.js',
  '/Auto/icon-192.svg',
  '/Auto/icon-512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
