// src/lib/firebase.ts
// Firebase JS SDK — foreground push + token retrieval.
// Only imported on the client side (no "use server" code here).

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
// Provide a minimal ambient module declaration to avoid TS errors when
// the firebase/messaging types aren't available in the environment.
declare module "firebase/messaging";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";

// ─── Config from env vars ─────────────────────────────────────────────────
// Add these to .env.local:
//   NEXT_PUBLIC_FIREBASE_API_KEY=...
//   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
//   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
//   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
//   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
//   NEXT_PUBLIC_FIREBASE_APP_ID=...
//   NEXT_PUBLIC_FIREBASE_VAPID_KEY=...  ← from Firebase Console > Cloud Messaging > Web Push certs

const firebaseConfig = {
  apiKey:            "AIzaSyCCsgeC7Glf82DqISupHo3dB31mxFpYGsg",
authDomain:        "crowdspark-68d80.firebaseapp.com",
projectId:         "crowdspark-68d80",
storageBucket:     "crowdspark-68d80.firebasestorage.app",
messagingSenderId: "1060676595589",
appId:             "1:1060676595589:web:cfc5dd5da9775f75fadeec",
};

// ─── Singleton init ───────────────────────────────────────────────────────

let app: FirebaseApp | null = null;
let messaging: Messaging  | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

function getFirebaseMessaging(): Messaging | null {
  if (typeof window === "undefined") return null; // SSR guard
  if (!messaging) {
    messaging = getMessaging(getFirebaseApp());
  }
  return messaging;
}

// ─── Public helpers ───────────────────────────────────────────────────────

/**
 * Request notification permission and return the FCM registration token.
 * Returns null if permission was denied or the browser doesn't support push.
 */
export async function requestPushPermission(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.info("[FCM] Notification permission not granted:", permission);
      return null;
    }

    const msging = getFirebaseMessaging();
    if (!msging) return null;

    const token = await getToken(msging, {
      vapidKey:          process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      serviceWorkerRegistration: await registerServiceWorker(),
    });

    console.info("[FCM] Token obtained:", token.substring(0, 20) + "...");
    return token;

  } catch (err) {
    console.error("[FCM] Permission/token error:", err);
    return null;
  }
}

/**
 * Register the service worker (must be at domain root).
 * Returns the existing registration if already registered.
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if ("serviceWorker" in navigator) {
    return navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });
  }
  throw new Error("Service workers not supported");
}

/**
 * Listen for foreground push messages (tab is visible).
 * Pass a callback to show your own toast/notification UI.
 */
export function onForegroundMessage(
  callback: (title: string, body: string, link: string) => void
): () => void {
  const msging = getFirebaseMessaging();
  if (!msging) return () => {};

  return onMessage(msging, (payload) => {
    const title = payload.notification?.title ?? "CrowdSpark";
    const body  = payload.notification?.body  ?? "";
    const link  = (payload.fcmOptions?.link ?? payload.data?.link ?? "/dashboard") as string;
    callback(title, body, link);
  });
}
