"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { notificationApi, isLoggedIn, type NotificationResponse } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

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

const TYPE_META: Record<string, { icon: string; color: string }> = {
  PROJECT_APPROVED: { icon: "✅", color: "#22c55e" },
  PROJECT_REJECTED: { icon: "❌", color: "#ef4444" },
  PROJECT_BACKED:   { icon: "💰", color: "#f59e0b" },
  KYC_APPROVED:     { icon: "🎉", color: "#8b5cf6" },
  KYC_REJECTED:     { icon: "⚠️", color: "#ef4444" },
  SYSTEM:           { icon: "📣", color: "#3b82f6" },
};

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 00 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const CheckAllIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
    <polyline points="20 6 9 17 4 12" transform="translate(-4,0)"/>
  </svg>
);

function NotifDropdown({
  items, loading, isDark, rect, onMarkRead, onMarkAll, unread, onClose
}: {
  items: NotificationResponse[];
  loading: boolean;
  isDark: boolean;
  rect: DOMRect;
  onMarkRead: (n: NotificationResponse) => void;
  onMarkAll: () => void;
  unread: number;
  onClose: () => void;
}) {
  const bdr  = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.09)";
  const bg   = isDark ? "#111111" : "#ffffff";
  const txt  = isDark ? "#f0f0f0" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const hoverBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)";
  const unreadBg = isDark ? "rgba(255,136,0,0.06)" : "rgba(255,107,0,0.04)";

  const top   = rect.bottom + 10;
  const right = window.innerWidth - rect.right;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top, right,
        width: 360, maxHeight: 460,
        background: bg, border: `1px solid ${bdr}`,
        borderRadius: 20, overflow: "hidden",
        boxShadow: isDark
          ? "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)"
          : "0 16px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
        zIndex: 9999,
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px 12px",
        borderBottom: `1px solid ${bdr}`,
        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, color: txt,
          }}>
            Notifications
          </span>
          {unread > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 800, fontFamily: "DM Sans, sans-serif",
              background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
              color: "#fff", padding: "2px 7px", borderRadius: 20,
            }}>
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={onMarkAll}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 10px", borderRadius: 8,
              background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.18)",
              color: "#ff8800", cursor: "pointer", fontSize: 11.5,
              fontFamily: "DM Sans, sans-serif", fontWeight: 600,
              transition: "all 0.15s",
            }}
          >
            <CheckAllIcon /> Mark all read
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ maxHeight: 370, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: "28px 18px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                  animation: "nfPulse 1.6s ease-in-out infinite",
                  animationDelay: `${i * 0.15}s`,
                }}/>
                <div style={{ flex: 1 }}>
                  <div style={{
                    height: 11, borderRadius: 6, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                    marginBottom: 7, width: "75%", animation: "nfPulse 1.6s ease-in-out infinite",
                    animationDelay: `${i * 0.15}s`,
                  }}/>
                  <div style={{
                    height: 9, borderRadius: 6, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                    width: "45%", animation: "nfPulse 1.6s ease-in-out infinite",
                    animationDelay: `${i * 0.15 + 0.1}s`,
                  }}/>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{
            padding: "48px 18px", textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>
              🔔
            </div>
            <div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: txt, margin: "0 0 4px" }}>
                All caught up!
              </p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, margin: 0 }}>
                No notifications yet
              </p>
            </div>
          </div>
        ) : (
          items.map((n, i) => {
            const meta = TYPE_META[n.type] ?? { icon: "📌", color: "#6b7280" };
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.22 }}
                onClick={() => onMarkRead(n)}
                style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "12px 18px",
                  borderBottom: `1px solid ${bdr}`,
                  cursor: "pointer",
                  background: !n.read ? unreadBg : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = !n.read ? unreadBg : "transparent"; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                  border: `1px solid ${bdr}`,
                }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: n.read ? 400 : 600,
                    color: txt, margin: "0 0 3px", lineHeight: 1.4,
                  }}>
                    {n.message}
                  </p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: muted, margin: 0 }}>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.read && (
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                    background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
                    boxShadow: "0 0 6px rgba(255,107,0,0.5)",
                  }}/>
                )}
              </motion.div>
            );
          })
        )}
      </div>
      <style>{`
        @keyframes nfPulse { 0%,100%{opacity:.4} 50%{opacity:.9} }
      `}</style>
    </motion.div>,
    document.body
  );
}

// ─── Main Bell Component ───────────────────────────────────────────────────────
export default function DashboardNotificationBell({ compact = false }: { compact?: boolean }) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const bdr = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.09)";

  useEffect(() => { setMounted(true); }, []);

  const fetchNotifs = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const [page, cnt] = await Promise.all([
        notificationApi.getAll(0, 20),
        notificationApi.unreadCount(),
      ]);
      setItems(page.content ?? []);
      setUnread(cnt.unreadCount ?? 0);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, POLL_MS);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const drop = document.getElementById("cs-dash-notif-drop");
      if (!btnRef.current?.contains(e.target as Node) && !drop?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleToggle = () => {
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(o => !o);
  };

  const handleMarkRead = async (n: NotificationResponse) => {
    if (n.read) return;
    try {
      await notificationApi.markRead(n.id);
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAll = async () => {
    try {
      await notificationApi.markAllRead();
      setItems(prev => prev.map(x => ({ ...x, read: true })));
      setUnread(0);
    } catch {}
  };

  const [ring, setRing] = useState(false);
  useEffect(() => {
    if (unread > 0) { setRing(true); const t = setTimeout(() => setRing(false), 600); return () => clearTimeout(t); }
  }, [unread]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        style={{
          position: "relative",
          padding: compact ? "7px" : "8px 10px",
          borderRadius: 11,
          border: `1px solid ${bdr}`,
          background: open
            ? (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)")
            : "transparent",
          cursor: "pointer",
          color: "var(--text-muted)",
          display: "flex", alignItems: "center",
          transition: "all 0.15s",
          transform: ring ? "rotate(-15deg)" : "rotate(0deg)",
        }}
        title="Notifications"
      >
        <BellIcon />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: compact ? 5 : 6, right: compact ? 5 : 6,
            width: 8, height: 8, borderRadius: "50%",
            background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
            border: `2px solid ${isDark ? "#0d0d0d" : "#ffffff"}`,
            boxShadow: "0 0 8px rgba(255,107,0,0.6)",
          }}/>
        )}
      </button>

      {mounted && (
        <AnimatePresence>
          {open && rect && (
            <div id="cs-dash-notif-drop">
              <NotifDropdown
                items={items}
                loading={loading}
                isDark={isDark}
                rect={rect}
                onMarkRead={handleMarkRead}
                onMarkAll={handleMarkAll}
                unread={unread}
                onClose={() => setOpen(false)}
              />
            </div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}