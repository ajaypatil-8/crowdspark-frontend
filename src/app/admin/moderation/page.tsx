"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  MessageSquareOff,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";
import { adminApi, type AdminFlaggedCommentResponse } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  spam: { label: "Spam", color: "#f59e0b" },
  hate_speech: { label: "Hate speech", color: "#ef4444" },
  misleading: { label: "Misleading", color: "#8b5cf6" },
};

function formatDate(value: string | null) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminModerationPage() {
  const { isDark } = useTheme();
  const [flags, setFlags] = useState<AdminFlaggedCommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const bdr   = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const card  = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";

  const load = () => {
    setLoading(true);
    adminApi.flaggedComments()
      .then(setFlags)
      .catch(() => setError("Couldn't load the moderation queue. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resolve = async (checkId: number, restore: boolean) => {
    setBusyId(checkId);
    try {
      await adminApi.resolveFlaggedComment(checkId, restore);
      setFlags(prev => prev.filter(f => f.checkId !== checkId));
    } catch {
      setError("Couldn't resolve that flag. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <ShieldAlert size={22} color="#8b5cf6" />
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: 0 }}>
          Content Moderation
        </h1>
      </div>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 24px" }}>
        Comments the AI moderation check flagged for spam, hate speech, or misleading claims — each
        was auto-hidden the moment it was flagged. Restore if it's a false positive, or confirm to
        leave it hidden. Flagged campaign descriptions show up in the Projects queue instead, next to
        each campaign's fraud-risk badge.
      </p>

      {error && (
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#ef4444", marginBottom: 16 }}>
          {error}
        </p>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: 96, borderRadius: 14, background: card, border: `1px solid ${bdr}`, opacity: 0.5 }} />
          ))}
        </div>
      ) : flags.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "56px 24px", borderRadius: 16,
          background: card, border: `1px solid ${bdr}`,
        }}>
          <CheckCircle2 size={32} color="#34d399" style={{ marginBottom: 10 }} />
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 4px" }}>
            Nothing flagged right now
          </p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>
            New comments are checked automatically as they're posted.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AnimatePresence>
            {flags.map(f => {
              const meta = f.category ? CATEGORY_META[f.category] : undefined;
              return (
                <motion.div
                  key={f.checkId}
                  initial={{ opacity: 1 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  style={{ borderRadius: 14, padding: 16, background: card, border: `1px solid ${bdr}` }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999,
                        background: `${meta?.color ?? "#8b5cf6"}18`, color: meta?.color ?? "#8b5cf6",
                        fontFamily: "DM Sans, sans-serif",
                      }}>
                        {meta?.label ?? "Flagged"}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                        <MessageSquareOff size={13} /> Auto-hidden
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                      {formatDate(f.flaggedAt)}
                    </span>
                  </div>

                  <p style={{
                    fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text)",
                    margin: "0 0 8px", padding: "10px 12px", borderRadius: 10,
                    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)", lineHeight: 1.55,
                  }}>
                    "{f.commentContent}"
                  </p>

                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: "0 0 4px" }}>
                    by <strong>{f.commentAuthorUsername}</strong> on{" "}
                    <a href={`/projects/${f.projectId}`} target="_blank" rel="noreferrer"
                       style={{ color: "var(--accent)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
                      {f.projectTitle} <ExternalLink size={11} />
                    </a>
                  </p>
                  {f.reasoning && (
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px", fontStyle: "italic" }}>
                      AI reasoning: {f.reasoning}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => resolve(f.checkId, true)}
                      disabled={busyId === f.checkId}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10,
                        border: "none", background: "linear-gradient(135deg,#34d399,#10b981)", color: "#fff",
                        fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12.5,
                        cursor: busyId === f.checkId ? "default" : "pointer", opacity: busyId === f.checkId ? 0.6 : 1,
                      }}
                    >
                      <Eye size={13} /> Restore (false positive)
                    </button>
                    <button
                      onClick={() => resolve(f.checkId, false)}
                      disabled={busyId === f.checkId}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10,
                        border: `1px solid ${bdr}`, background: "transparent", color: "var(--text)",
                        fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 12.5,
                        cursor: busyId === f.checkId ? "default" : "pointer", opacity: busyId === f.checkId ? 0.6 : 1,
                      }}
                    >
                      <EyeOff size={13} /> Confirm, keep hidden
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <button
        onClick={load}
        style={{
          display: "flex", alignItems: "center", gap: 6, marginTop: 20, padding: "8px 14px", borderRadius: 10,
          border: `1px solid ${bdr}`, background: "transparent", color: "var(--text-muted)",
          fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
        }}
      >
        <RefreshCcw size={13} /> Refresh
      </button>
    </div>
  );
}
