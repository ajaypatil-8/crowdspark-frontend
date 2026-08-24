// src/components/SupportChatWidget.tsx
// Feature #42 — AI Support Chatbot (UI)
//
// Mounted once, globally, in app/layout.tsx (same pattern as the existing
// <PushNotificationSetup /> right next to it) so it's available on every
// page — marketing site, dashboard, admin, logged in or not. Deliberately
// NOT "Frontend (Claude API direct)" as the original feature spec suggested:
// that would mean shipping the AI API key in the browser bundle, readable by
// anyone. This calls the app's own public backend endpoint instead, exactly
// like every other AI feature in this app — the key never leaves the server.

"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { aiApi, type ChatMessage } from "@/lib/api";

const WELCOME: ChatMessage = {
  role: "assistant",
  content: "Hi! I'm CrowdSpark's support assistant. Ask me anything about how backing or launching a campaign works.",
};

export default function SupportChatWidget() {
  const { isDark } = useTheme();
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [escalate, setEscalate] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const res = await aiApi.sendChatMessage({ messages: next });
      setMessages([...next, { role: "assistant", content: res.reply }]);
      setEscalate(res.escalate);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setEscalate(true); // AI unreachable — still offer the human path
    } finally {
      setLoading(false);
    }
  };

  const bg     = isDark ? "#0e0e13" : "#ffffff";
  const bdr    = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const muted  = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const txt    = isDark ? "#f0f0f0" : "#111";
  const bubble = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.045)";

  return (
    <>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? "Close support chat" : "Open support chat"}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9997,
          width: 56, height: 56, borderRadius: "50%", border: "none", cursor: "pointer",
          background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
          boxShadow: "0 6px 24px rgba(255,107,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
        }}
      >
        {open ? "✕" : "💬"}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", bottom: 92, right: 24, zIndex: 9998,
              width: "min(370px, calc(100vw - 32px))", height: "min(520px, calc(100vh - 140px))",
              borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column",
              background: bg, border: `1px solid ${bdr}`, boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
            }}
          >
            {/* Header */}
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${bdr}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🤖</div>
              <div>
                <p style={{ margin: 0, fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13.5, color: txt }}>CrowdSpark Support</p>
                <p style={{ margin: 0, fontFamily: "DM Sans, sans-serif", fontSize: 11, color: muted }}>Usually replies in seconds</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              <Bubble msg={WELCOME} bg={bubble} txt={txt} isDark={isDark} />
              {messages.map((m, i) => (
                <Bubble key={i} msg={m} bg={bubble} txt={txt} isDark={isDark} />
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 4, padding: "10px 14px", borderRadius: 14, background: bubble, alignSelf: "flex-start" }}>
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: muted, display: "block" }} />
                  ))}
                </div>
              )}
              {error && (
                <p style={{ margin: 0, fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#ef4444" }}>✕ {error}</p>
              )}
              {escalate && !loading && (
                <Link href="/contact" style={{
                  display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
                  padding: "8px 14px", borderRadius: 12, textDecoration: "none",
                  background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)",
                  fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 12, color: "#ff8800",
                }}>
                  👤 Talk to our support team →
                </Link>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: 12, borderTop: `1px solid ${bdr}`, display: "flex", gap: 8, flexShrink: 0 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask a question…"
                maxLength={2000}
                disabled={loading}
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 12, border: `1px solid ${bdr}`,
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", color: txt,
                  fontFamily: "DM Sans, sans-serif", fontSize: 13, outline: "none",
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                style={{
                  width: 40, height: 40, borderRadius: 12, border: "none", flexShrink: 0,
                  background: input.trim() && !loading ? "linear-gradient(135deg,#ff6b00,#ffcc00)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"),
                  color: input.trim() && !loading ? "#fff" : muted,
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontSize: 16,
                }}
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ msg, bg, txt, isDark }: { msg: ChatMessage; bg: string; txt: string; isDark: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      alignSelf: isUser ? "flex-end" : "flex-start", maxWidth: "84%",
      padding: "10px 14px", borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
      background: isUser ? "linear-gradient(135deg,#ff6b00,#ffcc00)" : bg,
      color: isUser ? "#fff" : txt,
      fontFamily: "DM Sans, sans-serif", fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap",
      border: isUser ? "none" : `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`,
    }}>
      {msg.content}
    </div>
  );
}
