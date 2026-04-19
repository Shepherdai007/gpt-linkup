/* LinkUp Chat — Firebase Messaging Service Worker */
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

/* Handle background push messages */
messaging.onBackgroundMessage(function(payload) {
  var data         = payload.data         || {};
  var notification = payload.notification || {};

  var title   = notification.title || data.title || 'LinkUp Chat';
  var options = {
    body:    notification.body  || data.body    || 'You have a new message',
    icon:    './icon-192.png',
    badge:   './icon-192.png',
    tag:     data.tag  || 'linkup-msg',
    data:    data,
    vibrate: [200, 100, 200]
  };

  return self.registration.showNotification(title, options);
});
