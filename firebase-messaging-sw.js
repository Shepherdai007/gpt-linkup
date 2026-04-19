/* ══════════════════════════════════════════
   LinkUp Chat — Firebase Cloud Messaging SW
   Handles background push notifications
══════════════════════════════════════════ */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyB2onIwFeuDxo5ILqx0DvVgaGXo0yLRfAg",
  authDomain:        "linkup-chat-8b593.firebaseapp.com",
  projectId:         "linkup-chat-8b593",
  storageBucket:     "linkup-chat-8b593.firebasestorage.app",
  messagingSenderId: "787859584741",
  appId:             "1:787859584741:web:a8e74686d6ceddc431860c"
});

var messaging = firebase.messaging();

/* Handle background messages (when the app tab is not focused) */
messaging.onBackgroundMessage(function(payload) {
  var data = payload.data || {};
  var notif = payload.notification || {};

  var title = notif.title || data.title || 'LinkUp Chat';
  var options = {
    body: notif.body || data.body || 'You have a new message',
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: data,
    tag: data.chatId || 'linkup-default',
    renotify: true
  };

  return self.registration.showNotification(title, options);
});

/* Notification click — focus app or open it */
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var data = event.notification.data || {};

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].url.indexOf('index.html') !== -1 || clients[i].url.endsWith('/gpt-linkup/')) {
          clients[i].focus();
          clients[i].postMessage(data);
          return;
        }
      }
      return self.clients.openWindow('./');
    })
  );
});
