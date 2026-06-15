// public/firebase-messaging-sw.js
// Service worker registered automatically by Firebase JS SDK.
// Handles push messages when the browser tab is in the background or closed.
// This file MUST be at the root of /public so it's served from the domain root.

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// ─── Firebase config (public values — safe to commit) ─────────────────────
// These mirror NEXT_PUBLIC_FIREBASE_* env vars; hard-code them here because
// service workers cannot read Next.js env substitutions at runtime.
// Replace with your actual project values from Firebase Console > Project Settings.
const firebaseConfig = {
  apiKey:            self.__FIREBASE_API_KEY__            || "YOUR_API_KEY",
  authDomain:        self.__FIREBASE_AUTH_DOMAIN__        || "YOUR_PROJECT.firebaseapp.com",
  projectId:         self.__FIREBASE_PROJECT_ID__         || "YOUR_PROJECT_ID",
  storageBucket:     self.__FIREBASE_STORAGE_BUCKET__     || "YOUR_PROJECT.appspot.com",
  messagingSenderId: self.__FIREBASE_MESSAGING_SENDER_ID__ || "YOUR_SENDER_ID",
  appId:             self.__FIREBASE_APP_ID__             || "YOUR_APP_ID",
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
