
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey:            "AIzaSyCCsgeC7Glf82DqISupHo3dB31mxFpYGsg",
  authDomain:        "crowdspark-68d80.firebaseapp.com",
  projectId:         "crowdspark-68d80",
  storageBucket:     "crowdspark-68d80.firebasestorage.app",
  messagingSenderId: "1060676595589",
  appId:             "1:1060676595589:web:cfc5dd5da9775f75fadeec",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// ── Background message handler ────────────────────────────────────────────
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background push received:", payload);

  const { title, body, icon, image } = payload.notification ?? {};
  const link = payload.fcmOptions?.link ?? payload.data?.link ?? "/dashboard";

  const notificationTitle = title || "CrowdSpark";
  const notificationOptions = {
    body:    body  || "You have a new notification.",
    icon:    icon  || "/icon-192.png",
    image:   image || undefined,
    badge:   "/badge-72.png",
    tag:     "crowdspark-notification",  // collapse multiple notifs into one
    renotify: true,
    data:    { link },
    actions: [
      { action: "open", title: "View" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ── Notification click handler ────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const link = event.notification.data?.link || "/dashboard";
  const fullUrl = new URL(link, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus an existing tab if one is open on this origin
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(fullUrl);
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) return clients.openWindow(fullUrl);
    })
  );
});