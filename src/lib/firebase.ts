
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";

declare module "firebase/messaging";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY             ?? "AIzaSyCCsgeC7Glf82DqISupHo3dB31mxFpYGsg",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN         ?? "crowdspark-68d80.firebaseapp.com",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID          ?? "crowdspark-68d80",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      ?? "crowdspark-68d80.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1060676595589",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID              ?? "1:1060676595589:web:cfc5dd5da9775f75fadeec",
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

async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if ("serviceWorker" in navigator) {
    return navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });
  }
  throw new Error("Service workers not supported");
}


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