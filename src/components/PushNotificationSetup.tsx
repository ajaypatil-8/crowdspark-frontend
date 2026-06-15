// src/components/PushNotificationSetup.tsx
// Mount once in the root layout (client-side only).
// Quietly requests notification permission after the user logs in.
// Shows a soft prompt banner if permission is "default" (not yet decided).
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, X } from "lucide-react";
import { requestPushPermission, onForegroundMessage } from "@/lib/firebase";
import { isLoggedIn } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/crowdspark";
const STORAGE_KEY = "cs_push_token";
const DISMISSED_KEY = "cs_push_dismissed";

async function registerToken(token: string) {
  const accessToken = typeof window !== "undefined"
    ? localStorage.getItem("accessToken") : null;
  if (!accessToken) return;

  const ua = navigator.userAgent.substring(0, 100);

  await fetch(`${API_BASE}/api/notifications/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ token, deviceHint: ua }),
  });
}

async function unregisterToken(token: string) {
  const accessToken = typeof window !== "undefined"
    ? localStorage.getItem("accessToken") : null;
  if (!accessToken) return;

  await fetch(`${API_BASE}/api/notifications/unsubscribe`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ token }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PushNotificationSetup() {
  const [showBanner,  setShowBanner]  = useState(false);
  const [permission,  setPermission]  = useState<NotificationPermission | null>(null);

  // On mount: check state and wire foreground listener
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!isLoggedIn()) return;

    const current = Notification.permission as NotificationPermission;
    setPermission(current);

    // Already granted — silently re-register token (may have rotated)
    if (current === "granted") {
      silentlyRegister();
    } else if (current === "default") {
      // Show soft prompt unless user already dismissed
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (!dismissed) setShowBanner(true);
    }

    // Listen for foreground messages and show a toast via the app's toast system
    const unsubscribe = onForegroundMessage((title, body, link) => {
      // Dispatch a custom event; the ToastProvider can listen for this
      window.dispatchEvent(new CustomEvent("cs:push", { detail: { title, body, link } }));
    });

    return () => unsubscribe();
  }, []);

  async function silentlyRegister() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      const token  = await requestPushPermission();
      if (!token) return;
      if (token !== cached) {
        await registerToken(token);
        localStorage.setItem(STORAGE_KEY, token);
      }
    } catch {
      // Non-fatal — ignore
    }
  }

  async function handleAllow() {
    setShowBanner(false);
    const token = await requestPushPermission();
    if (token) {
      await registerToken(token);
      localStorage.setItem(STORAGE_KEY, token);
      setPermission("granted");
    } else {
      setPermission(Notification.permission as NotificationPermission);
    }
  }

  function handleDismiss() {
    setShowBanner(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  }

  // ── Render ──────────────────────────────────────────────────────────────
  // The banner is a floating bottom-right pill — non-intrusive.
  return (
    <AnimatePresence>
      {showBanner && permission === "default" && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{   opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position:   "fixed",
            bottom:     24,
            right:      24,
            zIndex:     9999,
            background: "linear-gradient(135deg, #1a1a1a 0%, #111 100%)",
            border:     "1px solid rgba(255,255,255,0.09)",
            borderRadius: 18,
            padding:    "16px 18px",
            width:      300,
            boxShadow:  "0 20px 60px rgba(0,0,0,0.55)",
            color:      "#f0f0f0",
          }}
        >
          {/* Close */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            style={{
              position: "absolute", top: 10, right: 10,
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.38)", padding: 4, lineHeight: 0,
            }}
          >
            <X size={13} />
          </button>

          {/* Icon + heading */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg,#ff5c00,#ff9000)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bell size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Stay in the loop</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>
                Get notified when campaigns update
              </div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.55, margin: "0 0 14px" }}>
            Enable push notifications to hear about project milestones,
            backer updates, and payout confirmations — even when the tab is closed.
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleAllow}
              style={{
                flex: 1, background: "#ff5c00", color: "#fff",
                border: "none", borderRadius: 10, padding: "9px 0",
                cursor: "pointer", fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Bell size={12} /> Enable
            </button>
            <button
              onClick={handleDismiss}
              style={{
                flex: 1, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "9px 0",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <BellOff size={12} /> Not now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
