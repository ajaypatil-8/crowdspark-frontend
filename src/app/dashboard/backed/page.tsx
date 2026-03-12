"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import { motion } from "framer-motion";

/* ── skeleton ─────────────────────────── */
function BackedSkeleton() {
  const { isDark } = useTheme();
  const bg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const bgS = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  return (
    <div style={{ padding: "36px 32px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 36, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ width: 120, height: 14, borderRadius: 8, background: bg, marginBottom: 6, animation: "bpulse 2s ease-in-out infinite" }} />
          <div style={{ width: 280, height: 36, borderRadius: 12, background: bgS, animation: "bpulse 2s ease-in-out infinite" }} />
        </div>
        <div style={{ width: 280, height: 100, borderRadius: 14, background: bg, animation: "bpulse 2s ease-in-out infinite" }} />
      </div>
      <div style={{ borderRadius: 24, padding: "80px 40px", textAlign: "center", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px dashed rgba(255,255,255,0.08)" : "1px dashed rgba(0,0,0,0.08)" }}>
        {[80, 200, 300].map((w, i) => (
          <div key={i} style={{ width: w, height: i === 0 ? 80 : i === 1 ? 24 : 14, borderRadius: i === 0 ? 24 : 8, margin: "0 auto", marginBottom: i < 2 ? 20 : 0, background: bg, animation: "bpulse 2s ease-in-out infinite" }} />
        ))}
      </div>
      <style>{`@keyframes bpulse{0%,100%{opacity:.6}50%{opacity:1}}`}</style>
    </div>
  );
}

/* ── mini stat ────────────────────────── */
function MiniStat({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ textAlign: "center", flex: 1 }}>
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} style={{ fontSize: 20, marginBottom: 6 }}>{icon}</motion.div>
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color, margin: "0 0 4px", lineHeight: 1 }}>{value}</p>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: 0, fontWeight: 500 }}>{label}</p>
    </motion.div>
  );
}

/* ── error state ──────────────────────── */
function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ padding: "36px 32px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ padding: 24, borderRadius: 16, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>⚠️</span>
          <div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#ef4444", margin: "0 0 8px" }}>Error loading data</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.6 }}>{error}</p>
            {onRetry && (
              <button onClick={onRetry} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── empty state ──────────────────────── */
function EmptyState() {
  const { isDark } = useTheme();
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
      style={{ borderRadius: 24, padding: "80px 40px", textAlign: "center", position: "relative", overflow: "hidden",
        background: isDark ? "linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))" : "linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,255,255,0.7))",
        border: isDark ? "1px dashed rgba(255,255,255,0.08)" : "1px dashed rgba(0,0,0,0.08)",
      }}>
      <motion.div animate={{ scale: [1,1.2,1], opacity:[0.5,0.8,0.5] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,136,0,0.06)", filter: "blur(60px)", pointerEvents: "none" }} />
      <motion.div animate={{ scale: [1,0.8,1], opacity:[0.5,0.8,0.5] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(167,139,250,0.05)", filter: "blur(60px)", pointerEvents: "none" }} />

      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ width: 80, height: 80, borderRadius: 24, margin: "0 auto 20px", background: isDark ? "rgba(255,136,0,0.08)" : "rgba(255,136,0,0.06)", border: "1px solid rgba(255,136,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
        🎯
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
        No backed projects yet
      </motion.h2>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: "0 auto 28px", maxWidth: 360, lineHeight: 1.7 }}>
        Discover campaigns that excite you and back the ideas you believe in. Every contribution makes a difference.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 0 24px rgba(255,100,0,0.4)", position: "relative", overflow: "hidden" }}>
          <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.25) 50%,transparent 70%)", animation: "bshimmer 2.4s ease-in-out infinite" }} />
          <span style={{ position: "relative" }}>Explore campaigns →</span>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 40, flexWrap: "wrap" }}>
        {([ ["🔍","Discover","Find campaigns you love"], ["💰","Back","Contribute any amount"], ["📈","Track","Watch your impact grow"] ] as const).map(([emoji, title, desc], idx) => (
          <motion.div key={title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + idx * 0.1 }} whileHover={{ y: -4 }} style={{ textAlign: "center" }}>
            <motion.div animate={{ scale: [1,1.15,1] }} transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }} style={{ fontSize: 22, marginBottom: 6 }}>{emoji}</motion.div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: "var(--text)", margin: "0 0 2px" }}>{title}</p>
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ── stats bar ────────────────────────── */
function BackedStats({ totalBacked, projectsBacked }: { totalBacked: number; projectsBacked: number }) {
  const { isDark } = useTheme();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}
      style={{ padding: "12px 18px", borderRadius: 14, display: "flex", gap: 24, background: isDark ? "rgba(255,136,0,0.06)" : "rgba(255,136,0,0.04)", border: "1px solid rgba(255,136,0,0.2)" }}>
      <MiniStat icon="🎯" label="Backed" value={projectsBacked.toString()} color="#ff8800" />
      <div style={{ width: 1, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />
      <MiniStat icon="💰" label="Total backed" value={`₹${totalBacked.toLocaleString("en-IN")}`} color="#34d399" />
    </motion.div>
  );
}

/* ── main page ────────────────────────── */
export default function BackedPage() {
  const { isDark } = useTheme();
  const { user, loading, error, refetch } = useProfile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || loading) return <BackedSkeleton />;

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!user) return <ErrorState error="Unable to load user data. Please refresh." onRetry={refetch} />;

  const hasBacked      = (user.totalProjectsBacked ?? 0) > 0;
  const totalBacked    = user.totalAmountBacked ?? 0;
  const projectsBacked = user.totalProjectsBacked ?? 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      style={{ padding: "36px 32px 60px", maxWidth: 1100, margin: "0 auto" }}>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ marginBottom: 36, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 100 }}
              style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,136,0,0.12)", border: "1px solid rgba(255,136,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
              🎯
            </motion.div>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Your backing history
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,3vw,36px)", color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
            Backed Projects
          </motion.h1>
        </div>
        {hasBacked && <BackedStats totalBacked={totalBacked} projectsBacked={projectsBacked} />}
      </motion.div>

      {!hasBacked ? (
        <EmptyState />
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ borderRadius: 24, padding: 40, textAlign: "center",
            background: isDark ? "linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))" : "linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,255,255,0.8))",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
          <motion.div animate={{ scale: [1,1.1,1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 48, marginBottom: 16 }}>🚀</motion.div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 8px" }}>Projects coming soon!</h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: "0 0 20px", maxWidth: 360, lineHeight: 1.6 }}>
            Your backed projects will appear here once campaigns are live.
          </p>
          <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, boxShadow: "0 0 24px rgba(255,100,0,0.4)", position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.25) 50%,transparent 70%)", animation: "bshimmer 2.4s ease-in-out infinite" }} />
            <span style={{ position: "relative" }}>Find campaigns →</span>
          </Link>
        </motion.div>
      )}

      <style>{`
        @keyframes bshimmer{0%{transform:translateX(-100%)}60%{transform:translateX(200%)}100%{transform:translateX(200%)}}
        @keyframes bpulse{0%,100%{opacity:.6}50%{opacity:1}}
      `}</style>
    </motion.div>
  );
}