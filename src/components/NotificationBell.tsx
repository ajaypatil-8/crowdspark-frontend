"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { notificationApi, isLoggedIn, type NotificationResponse } from "@/lib/api";

const POLL_MS = 30_000;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_ICON: Record<string, string> = {
  PROJECT_APPROVED: "✅",
  PROJECT_REJECTED: "❌",
  PROJECT_BACKED:   "💰",
  KYC_APPROVED:     "🎉",
  KYC_REJECTED:     "⚠️",
  SYSTEM:           "📣",
};

// ─── Dropdown (portalled to body) ─────────────────────────────────────────────
function NotifDropdown({
  items, loading, isDark, rect, onMarkRead, onMarkAll, unread,
}: {
  items: NotificationResponse[];
  loading: boolean;
  isDark: boolean;
  rect: DOMRect;
  onMarkRead: (n: NotificationResponse) => void;
  onMarkAll: () => void;
  unread: number;
}) {
  const bdr   = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";
  const bg    = isDark ? "#0d0d0d" : "#ffffff";
  const txt   = isDark ? "#fff" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";

  const top   = rect.bottom + 10;
  const right = window.innerWidth - rect.right;

  return createPortal(
    <motion.div
      id="cs-notif-drop"
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top, right,
        width: 340, maxHeight: 440,
        background: bg, border: `1px solid ${bdr}`,
        borderRadius: 18, overflow: "hidden",
        boxShadow: isDark
          ? "0 20px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(255,107,0,0.1)"
          : "0 20px 60px rgba(0,0,0,0.15)",
        zIndex: 10001, display: "flex", flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 12px", borderBottom: `1px solid ${bdr}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14.5, color: txt }}>Notifications</span>
          {unread > 0 && (
            <span style={{ padding: "2px 7px", borderRadius: 999, background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.25)", fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: "#ff8800" }}>
              {unread} new
            </span>
          )}
        </div>
        {items.some(x => !x.read) && (
          <button
            onClick={onMarkAll}
            style={{ background: "none", border: "none", fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 600, color: "#ff8800", cursor: "pointer", padding: "3px 6px", borderRadius: 6 }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {loading && [1, 2, 3].map(i => (
          <div key={i} style={{ padding: "12px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", flexShrink: 0, animation: "nbPulse 1.5s infinite" }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 11, borderRadius: 5, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", width: "75%", marginBottom: 7, animation: "nbPulse 1.5s infinite" }} />
              <div style={{ height: 10, borderRadius: 5, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", width: "50%", animation: "nbPulse 1.5s infinite" }} />
            </div>
          </div>
        ))}

        {!loading && items.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🔔</p>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: txt, margin: "0 0 5px" }}>All caught up</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, margin: 0 }}>No notifications yet.</p>
          </div>
        )}

        {!loading && items.map((n, idx) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            onClick={() => onMarkRead(n)}
            style={{
              display: "flex", gap: 11, padding: "12px 16px",
              borderBottom: idx < items.length - 1 ? `1px solid ${bdr}` : "none",
              background: n.read ? "transparent" : (isDark ? "rgba(255,107,0,0.05)" : "rgba(255,107,0,0.04)"),
              cursor: n.read ? "default" : "pointer",
              transition: "background 0.15s",
              position: "relative",
            }}
          >
            {!n.read && (
              <span style={{ position: "absolute", top: 14, right: 12, width: 7, height: 7, borderRadius: "50%", background: "#ff6b00", boxShadow: "0 0 6px rgba(255,107,0,0.6)" }} />
            )}
            <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
              {TYPE_ICON[n.type] ?? "📢"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: n.read ? 400 : 600, color: txt, margin: "0 0 3px", lineHeight: 1.4, paddingRight: n.read ? 0 : 14 }}>
                {n.title}
              </p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted, margin: "0 0 4px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {n.message}
              </p>
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)" }}>
                {timeAgo(n.createdAt)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      <style>{`@keyframes nbPulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </motion.div>,
    document.body
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
// Place <NotificationBell isDark={isDark} /> in Navbar right section,
// between <ThemeToggle /> and <ProfileTrigger />.
// Dropdown portals to document.body — never clipped by navbar overflow:hidden.

export default function NotificationBell({ isDark }: { isDark: boolean }) {
  const btnRef    = useRef<HTMLButtonElement>(null);
  const [open,    setOpen]    = useState(false);
  const [count,   setCount]   = useState(0);
  const [items,   setItems]   = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loggedIn,setLoggedIn]= useState(false);
  const [rect,    setRect]    = useState<DOMRect | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => { setMounted(true); setLoggedIn(isLoggedIn()); }, []);

  const fetchCount = useCallback(async () => {
    if (!isLoggedIn()) return;
    try { const r = await notificationApi.unreadCount(); setCount(r.unreadCount); } catch {}
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    fetchCount();
    timerRef.current = setInterval(fetchCount, POLL_MS);
    return () => clearInterval(timerRef.current);
  }, [loggedIn, fetchCount]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try { const p = await notificationApi.getAll(0, 15); setItems(p.content); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { if (open) fetchItems(); }, [open, fetchItems]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      const btn  = btnRef.current;
      const drop = document.getElementById("cs-notif-drop");
      if (btn && !btn.contains(e.target as Node) && (!drop || !drop.contains(e.target as Node))) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const toggle = () => {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(v => !v);
  };

  const markRead = async (n: NotificationResponse) => {
    if (n.read) return;
    try {
      await notificationApi.markRead(n.id);
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      setCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const markAll = async () => {
    try {
      await notificationApi.markAllRead();
      setItems(prev => prev.map(x => ({ ...x, read: true })));
      setCount(0);
    } catch {}
  };

  if (!mounted || !loggedIn) return null;

  return (
    <>
      <motion.button
        ref={btnRef}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={toggle}
        aria-label="Notifications"
        style={{
          position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
          width: 36, height: 36, borderRadius: "50%", cursor: "pointer", border: "none",
          background: open
            ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)")
            : "transparent",
          color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)",
          transition: "background 0.18s", flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>

        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute", top: 1, right: 1,
              minWidth: 16, height: 16, borderRadius: 999,
              background: "#ff6b00", color: "#fff",
              fontFamily: "DM Sans, sans-serif", fontSize: 9, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1, padding: "0 3px",
              boxShadow: "0 0 0 2px " + (isDark ? "#0d0d0d" : "#fff"),
            }}
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && rect && (
          <NotifDropdown
            items={items} loading={loading} isDark={isDark} rect={rect}
            onMarkRead={markRead} onMarkAll={markAll} unread={count}
          />
        )}
      </AnimatePresence>
    </>
  );
}