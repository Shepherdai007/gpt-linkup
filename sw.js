/* LinkUp Chat — Service Worker */
var CACHE_NAME = 'linkup-v1';
var APP_SHELL  = ['./'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k)   { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Network-first: return live response, fall back to cache
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});

/* ── Push Notifications ── */
self.addEventListener('push', function(e) {
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch(err) {}

  var title   = data.title   || 'LinkUp Chat';
  var options = {
    body:    data.body    || data.message || 'You have a new message',
    icon:    './icon-192.png',
    badge:   './icon-192.png',
    tag:     data.tag     || 'linkup-msg',
    data:    data,
    vibrate: [200, 100, 200]
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

/* ── Notification Click ── */
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = e.notification.data && e.notification.data.url
    ? e.notification.data.url
    : './';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url.includes('gpt-linkup') && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
