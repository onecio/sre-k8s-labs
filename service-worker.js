/* ===== K8s Manual — Service Worker ===== */
var CACHE_NAME = 'k8s-manual-v5';

var PRECACHE_URLS = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './icon.svg', './style.css', './script.js'
];

/* --- Install: precache core assets individually (resilient to single failures) --- */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return Promise.all(
          PRECACHE_URLS.map(function(url) {
            return cache.add(url).catch(function(err) {
              console.warn('[SW] Failed to precache:', url, err);
            });
          })
        );
      })
      .then(function() {
        return self.skipWaiting();
      })
      .catch(function() {
        /* If precache fails (e.g. offline), still activate */
        return self.skipWaiting();
      })
  );
});

/* --- Activate: clean old caches --- */
self.addEventListener('activate', function(event) {
  var expectedCache = CACHE_NAME;
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== expectedCache;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* --- Fetch: cache-first, network fallback, CDN on-demand --- */
self.addEventListener('fetch', function(event) {
  /* Only handle GET requests */
  if (event.request.method !== 'GET') return;

  /* Skip non-http(s) requests (e.g. chrome-extension://, data:) */
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(function(cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(function(networkResponse) {
          /* Cache successful responses (includes CDN on-demand) */
          if (networkResponse && networkResponse.status === 200) {
            var responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(function() {
          /* Offline fallback for navigation requests */
          if (event.request.mode === 'navigate') {
            return caches.match('./offline.html');
          }
        });
      })
  );
});
