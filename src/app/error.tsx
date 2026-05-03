"use client";
/**
 * src/app/error.tsx
 * Next.js global error boundary page.
 * Rendered when an unhandled error occurs in a route segment.
 */

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, ChevronDown } from "lucide-react";
import { useState } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log to error tracking service in production
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#04040a" }}>
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          background: "#04040a", padding: "40px 24px",
          fontFamily: "system-ui, sans-serif",
        }}>
          {/* Ambient glow */}
          <div style={{ position: "fixed", top: "15%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(239,68,68,0.07) 0%,transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ position: "fixed", bottom: "15%", right: "15%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.06) 0%,transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: 520, width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 260, delay: 0.1 }}
              style={{
                width: 80, height: 80, borderRadius: 24,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 28px",
                boxShadow: "0 0 0 10px rgba(239,68,68,0.05)",
              }}
            >
              <AlertTriangle size={36} color="#ef4444" />
            </motion.div>

            {/* Logo */}
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 17, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 20px" }}>
              CrowdSpark-X
            </p>

            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(22px,4vw,34px)", color: "#eeeef5", letterSpacing: "-0.03em", margin: "0 0 14px", lineHeight: 1.15 }}>
              Application Error
            </h1>

            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: "0 0 32px" }}>
              Something went wrong on our end. This has been logged and we're working on a fix.
            </p>

            {/* Digest badge */}
            {error.digest && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24, padding: "5px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>Error ID: {error.digest}</span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 8px 26px rgba(239,68,68,0.4)" }}
                whileTap={{ scale: 0.96 }}
                onClick={reset}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "13px 24px", borderRadius: 13,
                  background: "linear-gradient(135deg,#ef4444,#dc2626)",
                  border: "none", color: "#fff", cursor: "pointer",
                  fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14.5,
                  boxShadow: "0 4px 18px rgba(239,68,68,0.35)",
                }}
              >
                <RefreshCw size={16} /> Try Again
              </motion.button>

              <Link
                href="/"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "13px 24px", borderRadius: 13,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.65)", textDecoration: "none",
                  fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14.5,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"}
              >
                <Home size={15} /> Go Home
              </Link>
            </div>

            {/* Error details */}
            <button
              onClick={() => setShowDetails(s => !s)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "transparent", border: "none", cursor: "pointer",
                fontFamily: "DM Mono, monospace", fontSize: 11,
                color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)"}
            >
              <ChevronDown size={12} style={{ transform: showDetails ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              {showDetails ? "HIDE DETAILS" : "SHOW DETAILS"}
            </button>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                style={{ overflow: "hidden", marginTop: 14 }}
              >
                <pre style={{
                  fontFamily: "DM Mono, monospace", fontSize: 11,
                  color: "#ef4444", background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  borderRadius: 10, padding: "14px 16px",
                  textAlign: "left", overflowX: "auto",
                  lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-all",
                }}>
                  {error.name}: {error.message}
                  {error.stack ? `\n\n${error.stack.split("\n").slice(1, 5).join("\n")}` : ""}
                </pre>
              </motion.div>
            )}
          </motion.div>
        </div>
      </body>
    </html>
  );
}
