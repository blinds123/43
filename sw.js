
// Service Worker v1.0 - Ultra-fast caching
const CACHE_NAME = 'auralo-ultra-v1';
const CORE_ASSETS = [
  '/',
  '/index-ultra-optimized.html',
  '/images/dscxr443e2_optimized (1).jpg',
  '/images/hamptons-store_optimized.jpg'
];

// Install and cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate and clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch - cache first, then network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request)
        .then(fetchResponse => {
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return fetchResponse;
        })
      )
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/index-ultra-optimized.html');
        }
      })
  );
});
