"use client";
/**
 * src/app/not-found.tsx
 * Next.js 404 page — premium animated design matching CrowdSpark-X design system.
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Compass } from "lucide-react";

// ── Floating particles ────────────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize(); window.addEventListener("resize", resize);

    type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; hue: number };
    const pts: P[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      a: Math.random() * 0.4 + 0.1,
      hue: [22, 180, 260, 40, 320][Math.floor(Math.random() * 5)],
    }));

    const tick = () => {
      raf = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},70%,65%,${p.a})`;
        ctx.fill();
      });
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

// ─── Quick links ──────────────────────────────────────────────────────────────
const LINKS = [
  { label: "Go Home",       href: "/",        icon: <Home size={15} />,    accent: "#ff6b00" },
  { label: "Explore",       href: "/explore",  icon: <Search size={15} />,  accent: "#00d4b8" },
  { label: "Dashboard",     href: "/dashboard",icon: <Compass size={15} />, accent: "#818cf8" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#04040a", padding: "40px 24px",
      overflow: "hidden", position: "relative",
    }}>
      <ParticleCanvas />

      {/* Background glow orbs */}
      <div style={{ position: "fixed", top: "20%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.07) 0%,transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "20%", right: "10%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,184,0.07) 0%,transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 540 }}>

        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", marginBottom: 8 }}
        >
          <span style={{
            fontFamily: "Syne, sans-serif", fontWeight: 900,
            fontSize: "clamp(96px,18vw,180px)",
            lineHeight: 1, letterSpacing: "-0.06em",
            background: "linear-gradient(135deg,rgba(255,107,0,0.18) 0%,rgba(255,200,0,0.12) 50%,rgba(0,212,184,0.14) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            display: "block",
            textShadow: "none",
          }}>
            404
          </span>
          {/* Glow behind numbers */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ width: "60%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.12) 0%,transparent 70%)", filter: "blur(24px)" }} />
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 24, padding: "5px 14px", borderRadius: 999, background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.22)" }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff6b00", display: "block" }} />
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11.5, fontWeight: 700, color: "#ff8800", letterSpacing: "0.08em" }}>
            PAGE NOT FOUND
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.55 }}
          style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(24px,4vw,38px)", color: "#eeeef5", letterSpacing: "-0.035em", lineHeight: 1.1, margin: "0 0 16px" }}
        >
          Lost in the crowd?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.5 }}
          style={{ fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "rgba(255,255,255,0.44)", lineHeight: 1.8, margin: "0 0 40px" }}
        >
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}
        >
          {LINKS.map((l, i) => (
            <motion.div key={l.href} whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}>
              <Link
                href={l.href}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 22px", borderRadius: 13,
                  background: i === 0
                    ? "linear-gradient(135deg,#ff6b00,#ffcc00)"
                    : "rgba(255,255,255,0.05)",
                  border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
                  color: i === 0 ? "#fff" : "rgba(255,255,255,0.65)",
                  textDecoration: "none",
                  fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
                  boxShadow: i === 0 ? "0 6px 22px rgba(255,100,0,0.38)" : "none",
                  transition: "background 0.18s, color 0.18s, border-color 0.18s",
                }}
                onMouseEnter={e => {
                  if (i !== 0) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)";
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                    (e.currentTarget as HTMLElement).style.borderColor = `${l.accent}40`;
                  }
                }}
                onMouseLeave={e => {
                  if (i !== 0) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                  }
                }}
              >
                <span style={{ color: i === 0 ? "rgba(255,255,255,0.85)" : l.accent }}>{l.icon}</span>
                {l.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <button
            onClick={() => window.history.back()}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
              color: "rgba(255,255,255,0.32)",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.32)"}
          >
            <ArrowLeft size={14} /> Go back
          </button>
        </motion.div>

      </div>
    </div>
  );
}
