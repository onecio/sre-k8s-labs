/* ===== K8s Manual — Service Worker ===== */
var CACHE_NAME = 'k8s-manual-v1';

var PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

/* --- Install: precache core assets (CDN cached on-demand) --- */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(PRECACHE_URLS);
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
            return caches.match('./index.html');
          }
        });
      })
  );
});
