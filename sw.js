// LinkUp Chat — Service Worker
// Provides offline support via cache-first strategy for app shell

var CACHE_NAME = 'linkup-v1';
var APP_SHELL = [
  './',
  './index.html'
];

// Install: cache the app shell
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names
          .filter(function(name) { return name !== CACHE_NAME; })
          .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for navigation, cache-first for static assets
self.addEventListener('fetch', function(event) {
  var request = event.request;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (Firebase, fonts CDN, etc.)
  if (!request.url.startsWith(self.location.origin)) return;

  // Navigation requests: network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(function(response) {
        // Cache the latest version
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(request, clone);
        });
        return response;
      }).catch(function() {
        return caches.match(request).then(function(cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  // Static assets: cache-first with network fallback
  event.respondWith(
    caches.match(request).then(function(cached) {
      if (cached) return cached;
      return fetch(request).then(function(response) {
        // Cache same-origin successful responses
        if (response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, clone);
          });
        }
        return response;
      });
    })
  );
});

// Handle notification clicks — forward to main thread
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var data = event.notification.data || {};
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
      if (clients.length > 0) {
        clients[0].focus();
        clients[0].postMessage(data);
      } else {
        self.clients.openWindow('./');
      }
    })
  );
});
