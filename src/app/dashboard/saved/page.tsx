"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

/* ════════════════════════════════════════════════════════════
   SKELETON LOADER
════════════════════════════════════════════════════════════ */
function SavedSkeleton() {
  const { isDark } = useTheme();
  return (
    <div style={{ padding: "36px 32px 60px", maxWidth: 1100, margin: "0 auto" }}>
      {/* header skeleton */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ marginBottom: 6, width: 200, height: 14, borderRadius: 8, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", animation: "pulse 2s ease-in-out infinite" }} />
        <div style={{ width: 300, height: 36, borderRadius: 12, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", animation: "pulse 2s ease-in-out infinite" }} />
      </div>

      {/* empty state skeleton */}
      <div style={{
        borderRadius: 24, padding: "80px 40px", textAlign: "center",
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        border: isDark ? "1px dashed rgba(255,255,255,0.08)" : "1px dashed rgba(0,0,0,0.08)",
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24, margin: "0 auto 20px",
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          animation: "pulse 2s ease-in-out infinite"
        }} />
        <div style={{
          width: 200, height: 24, borderRadius: 8, margin: "0 auto 20px",
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          animation: "pulse 2s ease-in-out infinite"
        }} />
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.6 } 50% { opacity: 1 } }`}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   EMPTY STATE CARD
════════════════════════════════════════════════════════════ */
function EmptyStateCard() {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        borderRadius: 24, padding: "80px 40px", textAlign: "center",
        background: isDark
          ? "linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))"
          : "linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,255,255,0.7))",
        border: isDark ? "1px dashed rgba(255,255,255,0.08)" : "1px dashed rgba(0,0,0,0.08)",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* decorative blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: "absolute", top: -60, left: -60, width: 200, height: 200,
          borderRadius: "50%", background: "rgba(0,245,212,0.05)",
          filter: "blur(60px)", pointerEvents: "none"
        }}
      />
      <motion.div
        animate={{
          scale: [1, 0.8, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: "absolute", bottom: -60, right: -60, width: 200, height: 200,
          borderRadius: "50%", background: "rgba(255,107,0,0.05)",
          filter: "blur(60px)", pointerEvents: "none"
        }}
      />

      {/* content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          width: 80, height: 80, borderRadius: 24, margin: "0 auto 20px",
          background: isDark ? "rgba(0,245,212,0.08)" : "rgba(0,245,212,0.06)",
          border: "1px solid rgba(0,245,212,0.2)", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: 36,
          position: "relative",
        }}
      >
        🔖
        <div style={{
          position: "absolute", inset: -1, borderRadius: 24,
          background: "linear-gradient(135deg,rgba(0,245,212,0.15),transparent)",
          pointerEvents: "none"
        }} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22,
          color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.02em"
        }}
      >
        Nothing saved yet
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: 14, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif",
          margin: "0 auto 28px", maxWidth: 360, lineHeight: 1.7
        }}
      >
        Hit the bookmark icon on any campaign to save it here. Revisit and back the ideas that excite you most.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link href="/explore" style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px",
          borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
          color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif",
          fontWeight: 700, fontSize: 14, boxShadow: "0 0 24px rgba(255,100,0,0.4)",
          position: "relative", overflow: "hidden", transition: "all 0.3s ease",
          cursor: "pointer"
        }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLAnchorElement;
            btn.style.boxShadow = "0 0 32px rgba(255,100,0,0.6)";
            btn.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLAnchorElement;
            btn.style.boxShadow = "0 0 24px rgba(255,100,0,0.4)";
            btn.style.transform = "translateY(0)";
          }}
        >
          <span style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.25) 50%,transparent 70%)",
            animation: "shimmer 2.4s ease-in-out infinite"
          }} />
          <span style={{ position: "relative" }}>Browse campaigns →</span>
        </Link>
      </motion.div>

      {/* tips row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          display: "flex", justifyContent: "center", gap: 24, marginTop: 40, flexWrap: "wrap"
        }}
      >
        {[
          ["🔍", "Discover", "Find campaigns you love"],
          ["🔖", "Save", "Bookmark for later"],
          ["💸", "Back", "Fund when you're ready"]
        ].map(([emoji, title, desc], idx) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + idx * 0.1 }}
            whileHover={{ y: -4 }}
            style={{ textAlign: "center" }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
              style={{ fontSize: 22, marginBottom: 6 }}
            >{emoji}</motion.div>
            <p style={{
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12,
              color: "var(--text)", margin: "0 0 2px"
            }}>{title}</p>
            <p style={{
              fontSize: 11.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: 0
            }}>{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   HEADER SECTION
════════════════════════════════════════════════════════════ */
function PageHeader() {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        marginBottom: 36, display: "flex", alignItems: "flex-end",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 6
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: "rgba(0,245,212,0.12)", border: "1px solid rgba(0,245,212,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15
            }}
          >🔖</motion.div>
          <span style={{
            fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)",
            letterSpacing: "0.1em", textTransform: "uppercase"
          }}>Collection</span>
        </div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: "clamp(24px,3vw,36px)", color: "var(--text)",
            letterSpacing: "-0.03em", margin: 0
          }}
        >
          Saved Campaigns
        </motion.h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link href="/explore" style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px",
          borderRadius: 12, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
          color: "var(--text)", textDecoration: "none", fontFamily: "DM Sans, sans-serif",
          fontWeight: 600, fontSize: 13, transition: "all 0.15s", cursor: "pointer"
        }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLAnchorElement;
            btn.style.background = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
            btn.style.borderColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLAnchorElement;
            btn.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
            btn.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 21H7a2 2 0 01-2-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 013.586 2H21a2 2 0 012 2v15a2 2 0 01-2 2z" />
          </svg>
          Browse campaigns →
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════ */
export default function SavedPage() {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ✅ HYDRATION FIX: Direct state update without setTimeout
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Don't render until mounted (prevents hydration mismatch)
  if (!mounted) return <SavedSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: "36px 32px 60px", maxWidth: 1100, margin: "0 auto"
      }}
    >
      <PageHeader />
      <EmptyStateCard />

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) }
          60% { transform: translateX(200%) }
          100% { transform: translateX(200%) }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6 }
          50% { opacity: 1 }
        }
      `}</style>
    </motion.div>
  );
}