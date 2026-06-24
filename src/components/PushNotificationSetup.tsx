"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, X } from "lucide-react";
import { requestPushPermission, onForegroundMessage } from "@/lib/firebase";
import { isLoggedIn } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/crowdspark";
const STORAGE_KEY   = "cs_push_token";
const DISMISSED_KEY = "cs_push_dismissed";

async function registerToken(token: string) {
  // ✅ FIX 1: was localStorage.getItem("accessToken")
  //    api.ts stores it under "cs_access" (see tokenStorage.getAccess())
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("cs_access") : null;
  if (!accessToken) return;

  const ua = navigator.userAgent.substring(0, 100);

  // ✅ FIX 2: was /api/notifications/subscribe
  //    NotificationController @RequestMapping("/api/v1/notifications")
  await fetch(`${API_BASE}/api/v1/notifications/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ token, deviceHint: ua }),
  });
}

async function unregisterToken(token: string) {
  // ✅ FIX 1: same key fix
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("cs_access") : null;
  if (!accessToken) return;

  // ✅ FIX 2: was /api/notifications/unsubscribe
  await fetch(`${API_BASE}/api/v1/notifications/unsubscribe`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ token }),
  });
}

export default function PushNotificationSetup() {
  const [showBanner, setShowBanner] = useState(false);
  const [granted,    setGranted   ] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isLoggedIn()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const perm = Notification.permission;
    if (perm === "granted") {
      // Already granted — silently register if we have no saved token yet
      if (!localStorage.getItem(STORAGE_KEY)) {
        requestPushPermission().then(token => {
          if (token) {
            localStorage.setItem(STORAGE_KEY, token);
            registerToken(token);
          }
        });
      }
      setGranted(true);
      return;
    }

    // Show soft-prompt banner for "default" (not yet decided)
    if (perm === "default") {
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    // Listen for foreground messages (app is open) and show a toast / update UI
    const unsub = onForegroundMessage((payload) => {
      // Optional: show an in-app toast here
      console.log("[FCM] Foreground message:", payload);
    });
    return unsub;
  }, []);

  const handleAllow = async () => {
    setShowBanner(false);
    const token = await requestPushPermission();
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
      registerToken(token);
      setGranted(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          style={{
            position:     "fixed",
            bottom:       24,
            left:         "50%",
            transform:    "translateX(-50%)",
            zIndex:       9999,
            background:   "#0e0e0e",
            border:       "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding:      "16px 20px",
            display:      "flex",
            alignItems:   "center",
            gap:          14,
            boxShadow:    "0 8px 32px rgba(0,0,0,0.4)",
            maxWidth:     420,
            width:        "calc(100vw - 32px)",
          }}
        >
          <Bell size={22} color="#ff5c00" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#f0f0f0" }}>
              Stay in the loop
            </p>
            <p style={{ margin: "2px 0 0", fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              Get notified when campaigns you back hit milestones.
            </p>
          </div>
          <button
            onClick={handleAllow}
            style={{ padding: "8px 16px", borderRadius: 10, background: "#ff5c00", color: "#fff", border: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}
          >
            Allow
          </button>
          <button
            onClick={handleDismiss}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 4, flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}