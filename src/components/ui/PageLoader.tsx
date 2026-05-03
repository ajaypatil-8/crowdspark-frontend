"use client";

/**
 * src/components/ui/PageLoader.tsx
 * Full-screen page loading animation + inline spinner variants.
 * Usage:
 *   <PageLoader />                     — full screen overlay
 *   <SectionLoader />                  — 200px tall centered section
 *   <InlineLoader size="sm" />         — tiny inline spinner
 *   <ButtonLoader />                   — white spinner for inside buttons
 *   <RouteLoader />                    — top progress bar (put in root layout)
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// ─── Full-Screen Overlay Loader ───────────────────────────────────────────────

interface PageLoaderProps {
  visible?: boolean;
  message?: string;
}

export function PageLoader({ visible = true, message }: PageLoaderProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9990,
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: "center" }}
          >
            {/* Spark logo mark */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: "linear-gradient(135deg, var(--accent) 0%, rgba(0,245,212,0.3) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 0 40px var(--accent-glow)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Inner shimmer */}
              <motion.div
                animate={{ x: ["-150%", "150%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                }}
              />
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 24,
                  color: "var(--icon-clr)",
                  position: "relative",
                }}
              >
                C
              </span>
            </div>

            <p
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 20,
                color: "var(--text)",
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              CrowdSpark
            </p>
          </motion.div>

          {/* Spinner ring */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <RingSpinner size={40} />
          </motion.div>

          {/* Optional message */}
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              {message}
            </motion.p>
          )}

          {/* Ambient dots */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              overflow: "hidden",
            }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: ["0%", "-30%", "0%"],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.4,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  left: `${15 + i * 14}%`,
                  top: `${55 + (i % 3) * 10}%`,
                  filter: "blur(1px)",
                  boxShadow: "0 0 8px var(--accent-glow)",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Top Progress Bar (Route transitions) ─────────────────────────────────────

export function RouteLoader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = { current: null as ReturnType<typeof setInterval> | null };

  // Expose global start/stop for use in API calls
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__routeLoaderStart = () => {
      setLoading(true);
      setProgress(10);
      let p = 10;
      intervalRef.current = setInterval(() => {
        p = p < 85 ? p + (85 - p) * 0.12 : p;
        setProgress(p);
      }, 200);
    };
    (window as unknown as Record<string, unknown>).__routeLoaderDone = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 400);
    };
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{
          height: "100%",
          background: "linear-gradient(90deg, var(--accent), var(--cta))",
          boxShadow: "0 0 8px var(--accent-glow)",
          borderRadius: "0 2px 2px 0",
        }}
        animate={{ width: `${progress}%`, opacity: loading ? 1 : 0 }}
        transition={{ ease: "easeOut", duration: 0.3 }}
      />
    </div>
  );
}

// ─── Section Loader ───────────────────────────────────────────────────────────

interface SectionLoaderProps {
  height?: number | string;
  message?: string;
}

export function SectionLoader({ height = 240, message }: SectionLoaderProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height,
        gap: 16,
      }}
    >
      <RingSpinner size={32} />
      {message && (
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

// ─── Inline Loader ────────────────────────────────────────────────────────────

type SpinnerSize = "xs" | "sm" | "md" | "lg";
const SIZES: Record<SpinnerSize, number> = { xs: 12, sm: 16, md: 22, lg: 32 };

export function InlineLoader({ size = "md", color = "var(--accent)" }: { size?: SpinnerSize; color?: string }) {
  const s = SIZES[size];
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
      style={{
        width: s,
        height: s,
        borderRadius: "50%",
        border: `${s <= 16 ? 2 : 2.5}px solid rgba(255,255,255,0.12)`,
        borderTopColor: color,
        flexShrink: 0,
      }}
    />
  );
}

// ─── Ring Spinner (accent glow) ───────────────────────────────────────────────

function RingSpinner({ size = 36 }: { size?: number }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "2px solid var(--border)",
          borderTopColor: "var(--accent)",
          filter: "drop-shadow(0 0 6px var(--accent-glow))",
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          inset: "20%",
          borderRadius: "50%",
          border: "2px solid transparent",
          borderBottomColor: "var(--cta)",
          opacity: 0.7,
        }}
      />
    </div>
  );
}

// ─── Button Loader (white, small) ─────────────────────────────────────────────

export function ButtonLoader({ size = 14 }: { size?: number }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.65, repeat: Infinity, ease: "linear" }}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${size <= 14 ? 2 : 2.5}px solid rgba(255,255,255,0.25)`,
        borderTopColor: "currentColor",
        flexShrink: 0,
      }}
    />
  );
}

// ─── Dots Loader ──────────────────────────────────────────────────────────────

export function DotsLoader({ color = "var(--accent)" }: { color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: ["0%", "-60%", "0%"], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }}
        />
      ))}
    </div>
  );
}
