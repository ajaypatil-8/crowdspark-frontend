"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Inbox,
  Mail,
  MessageSquare,
  RefreshCcw,
  Reply,
  Send,
} from "lucide-react";
import { adminApi, type ContactMessageResponse, type ContactMessageStatus } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const STATUS_META: Record<ContactMessageStatus, { label: string; color: string; bg: string }> = {
  NEW: { label: "New", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  READ: { label: "Read", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  REPLIED: { label: "Replied", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
};

function formatDate(value: string | null) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminMessagesPage() {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<ContactMessageResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selected = useMemo(
    () => messages.find((message) => message.id === selectedId) ?? messages[0] ?? null,
    [messages, selectedId],
  );

  const bdr = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const card = isDark ? "rgba(255,255,255,0.035)" : "#fff";
  const muted = "var(--text-muted)";

  const loadMessages = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await adminApi.contactMessages();
      setMessages(data);
      setSelectedId((current) => current ?? data[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setReplySubject(`Re: ${selected.topic}`);
    setReplyMessage("");
  }, [selected]);

  const selectMessage = async (message: ContactMessageResponse) => {
    setSelectedId(message.id);
    setNotice("");
    if (message.status !== "NEW") return;
    try {
      const updated = await adminApi.markContactMessageRead(message.id);
      setMessages((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      // Keep selection responsive even if the read marker fails.
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !replySubject.trim() || !replyMessage.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await adminApi.replyContactMessage(
        selected.id,
        replySubject.trim(),
        replyMessage.trim(),
      );
      setMessages((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      setReplyMessage("");
      setNotice("Reply sent and message marked as replied.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setBusy(false);
    }
  };

  const counts = useMemo(() => ({
    total: messages.length,
    newCount: messages.filter((message) => message.status === "NEW").length,
    replied: messages.filter((message) => message.status === "REPLIED").length,
  }), [messages]);

  return (
    <div style={{ padding: "34px 24px 70px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, marginBottom: 24 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(236,72,153,0.12)", color: "#ec4899", fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            <MessageSquare size={14} /> Contact inbox
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(30px,4vw,46px)", lineHeight: 1, margin: 0, color: "var(--text)", letterSpacing: "-0.03em" }}>
            User messages
          </h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", color: muted, fontSize: 14.5, lineHeight: 1.7, margin: "12px 0 0", maxWidth: 620 }}>
            Review contact form submissions, mark them read, and reply directly from the admin panel.
          </p>
        </div>
        <button
          type="button"
          onClick={loadMessages}
          disabled={loading}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 15px", borderRadius: 12, border: `1px solid ${bdr}`, background: card, color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 800, cursor: loading ? "wait" : "pointer" }}
        >
          <RefreshCcw size={15} /> Refresh
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 14, marginBottom: 18 }} className="adm-msg-stats">
        {[
          { label: "Total messages", value: counts.total, color: "#ec4899", Icon: Inbox },
          { label: "New", value: counts.newCount, color: "#f59e0b", Icon: Clock3 },
          { label: "Replied", value: counts.replied, color: "#34d399", Icon: CheckCircle2 },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} style={{ borderRadius: 18, padding: 18, background: card, border: `1px solid ${bdr}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, fontWeight: 700 }}>{label}</span>
              <span style={{ width: 34, height: 34, borderRadius: 11, display: "grid", placeItems: "center", color, background: `${color}14` }}><Icon size={16} /></span>
            </div>
            <strong style={{ display: "block", fontFamily: "Syne, sans-serif", fontSize: 28, color: "var(--text)", marginTop: 8 }}>{value}</strong>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: 13, borderRadius: 14, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 700, marginBottom: 16 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "390px minmax(0,1fr)", gap: 18, alignItems: "start" }} className="adm-msg-grid">
        <section style={{ borderRadius: 22, background: card, border: `1px solid ${bdr}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${bdr}`, display: "flex", alignItems: "center", gap: 8 }}>
            <Mail size={17} color="#ec4899" />
            <strong style={{ fontFamily: "Syne, sans-serif", color: "var(--text)", fontSize: 16 }}>Inbox</strong>
          </div>

          {loading ? (
            <div style={{ padding: 30, color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 14 }}>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div style={{ padding: 30, color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 14 }}>No contact messages yet.</div>
          ) : (
            <div style={{ maxHeight: "68vh", overflow: "auto" }}>
              {messages.map((message) => {
                const active = selected?.id === message.id;
                const meta = STATUS_META[message.status];
                return (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => selectMessage(message)}
                    style={{ width: "100%", textAlign: "left", border: 0, borderBottom: `1px solid ${bdr}`, padding: 16, background: active ? "rgba(236,72,153,0.09)" : "transparent", cursor: "pointer", display: "block" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 7 }}>
                      <strong style={{ color: "var(--text)", fontFamily: "Syne, sans-serif", fontSize: 14 }}>{message.name}</strong>
                      <span style={{ padding: "4px 8px", borderRadius: 999, background: meta.bg, color: meta.color, fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 800 }}>{meta.label}</span>
                    </div>
                    <p style={{ margin: "0 0 5px", color: "#ec4899", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 800 }}>{message.topic}</p>
                    <p style={{ margin: 0, color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 12.5, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{message.message}</p>
                    <span style={{ display: "block", color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 11.5, marginTop: 8 }}>{formatDate(message.createdAt)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section style={{ borderRadius: 22, background: card, border: `1px solid ${bdr}`, overflow: "hidden", minHeight: 500 }}>
          {!selected ? (
            <div style={{ minHeight: 500, display: "grid", placeItems: "center", color: muted, fontFamily: "DM Sans, sans-serif" }}>Select a message to reply.</div>
          ) : (
            <motion.div key={selected.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <div style={{ padding: 24, borderBottom: `1px solid ${bdr}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, margin: "0 0 8px", color: "var(--text)", letterSpacing: "-0.02em" }}>{selected.topic}</h2>
                    <p style={{ fontFamily: "DM Sans, sans-serif", color: muted, fontSize: 13.5, margin: 0 }}>
                      From <strong style={{ color: "var(--text)" }}>{selected.name}</strong> at <a href={`mailto:${selected.email}`} style={{ color: "#ec4899", textDecoration: "none", fontWeight: 800 }}>{selected.email}</a>
                    </p>
                  </div>
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: STATUS_META[selected.status].bg, color: STATUS_META[selected.status].color, fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 900 }}>{STATUS_META[selected.status].label}</span>
                </div>

                <div style={{ marginTop: 20, padding: 18, borderRadius: 16, background: isDark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.025)", border: `1px solid ${bdr}` }}>
                  <p style={{ whiteSpace: "pre-wrap", fontFamily: "DM Sans, sans-serif", fontSize: 14.5, lineHeight: 1.8, color: "var(--text)", margin: 0 }}>{selected.message}</p>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 14, color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 12 }}>
                  <span>Received: {formatDate(selected.createdAt)}</span>
                  <span>Read: {formatDate(selected.readAt)}</span>
                  <span>Replied: {formatDate(selected.repliedAt)}</span>
                </div>
              </div>

              <form onSubmit={sendReply} style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <Reply size={17} color="#ec4899" />
                  <strong style={{ color: "var(--text)", fontFamily: "Syne, sans-serif", fontSize: 17 }}>Send reply</strong>
                </div>

                {selected.replyMessage && (
                  <div style={{ padding: 14, borderRadius: 14, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399", fontFamily: "DM Sans, sans-serif", fontSize: 13, marginBottom: 16 }}>
                    Last reply by {selected.repliedByName ?? "admin"} on {formatDate(selected.repliedAt)}
                  </div>
                )}

                {notice && (
                  <div style={{ padding: 14, borderRadius: 14, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399", fontFamily: "DM Sans, sans-serif", fontSize: 13, marginBottom: 16 }}>
                    {notice}
                  </div>
                )}

                <label style={{ display: "block", color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>Subject</label>
                <input
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  required
                  style={{ width: "100%", padding: "13px 14px", borderRadius: 13, border: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.025)", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", marginBottom: 14 }}
                />

                <label style={{ display: "block", color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>Reply message</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  required
                  rows={8}
                  maxLength={5000}
                  placeholder="Write your reply to the user..."
                  style={{ width: "100%", padding: "13px 14px", borderRadius: 13, border: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.025)", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", resize: "vertical", lineHeight: 1.7 }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 16 }}>
                  <span style={{ color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 12 }}>{replyMessage.length}/5000</span>
                  <button
                    type="submit"
                    disabled={busy || !replySubject.trim() || !replyMessage.trim()}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: 13, border: 0, background: "linear-gradient(135deg,#ec4899,#f59e0b)", color: "#fff", fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 800, cursor: busy ? "wait" : "pointer", opacity: busy || !replySubject.trim() || !replyMessage.trim() ? 0.7 : 1 }}
                  >
                    <Send size={15} /> {busy ? "Sending..." : "Send reply"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </section>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .adm-msg-grid { grid-template-columns: 1fr !important; }
          .adm-msg-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
