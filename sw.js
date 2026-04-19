/* ══════════════════════════════════════════
   LinkUp Chat — Service Worker
   Caches app shell for offline/fast loads
══════════════════════════════════════════ */

var CACHE_NAME = 'linkup-v1';
var PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* ── Install: cache app shell ── */
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE);
    })
  );
});

/* ── Activate: clean old caches ── */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* ── Fetch: network-first with cache fallback ── */
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Skip cross-origin requests (Firebase, fonts, CDNs)
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request).then(function(response) {
      // Cache successful GET responses
      if (event.request.method === 'GET' && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});

/* ── Push notification click ── */
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var data = event.notification.data || {};

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
      // Focus existing window if found
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].visibilityState === 'visible' || clients[i].url.indexOf('index.html') !== -1) {
          clients[i].focus();
          clients[i].postMessage(data);
          return;
        }
      }
      // Otherwise open new window
      return self.clients.openWindow('./');
    })
  );
});
