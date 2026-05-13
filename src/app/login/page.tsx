"use client";
import { useState, useEffect, useRef, useCallback, FormEvent, MouseEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { authApi } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const OAUTH_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/crowdspark";

// ── Constellation Canvas ────────────────────────────────────────────────────
function ConstellationCanvas({ isDark }: { isDark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    type Node = { x: number; y: number; vx: number; vy: number; r: number; hue: number };
    const W = () => canvas.offsetWidth, H = () => canvas.offsetHeight;
    const nodes: Node[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * W(), y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
      r: 1 + Math.random() * 2, hue: [22, 38, 200, 260][Math.floor(Math.random() * 4)],
    }));

    type Orb = { x: number; y: number; r: number; vx: number; vy: number; hue: number; a: number };
    const orbs: Orb[] = [
      { x: 0.15, y: 0.25, r: 0.42, vx: 0.00022, vy: 0.00015, hue: 22, a: isDark ? 0.1 : 0.06 },
      { x: 0.80, y: 0.65, r: 0.35, vx: -0.00018, vy: 0.00020, hue: 200, a: isDark ? 0.08 : 0.045 },
      { x: 0.50, y: 0.08, r: 0.28, vx: 0.00015, vy: -0.00022, hue: 38, a: isDark ? 0.07 : 0.04 },
    ];

    type Spark = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; r: number; hue: number };
    const sparks: Spark[] = [];
    let frame = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick); frame++;
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      // Orbs
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -0.2 || o.x > 1.2) o.vx *= -1;
        if (o.y < -0.2 || o.y > 1.2) o.vy *= -1;
        const gx = o.x * w, gy = o.y * h, gr = o.r * Math.min(w, h);
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        g.addColorStop(0, `hsla(${o.hue},85%,${isDark ? 60 : 52}%,${o.a})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.fill();
      });

      // Constellation nodes & edges
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) { n.x = 0; n.vx *= -1; } if (n.x > w) { n.x = w; n.vx *= -1; }
        if (n.y < 0) { n.y = 0; n.vy *= -1; } if (n.y > h) { n.y = h; n.vy *= -1; }
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 110) {
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
            const a = (1 - dist / 110) * (isDark ? 0.13 : 0.07);
            ctx.strokeStyle = `rgba(255,136,0,${a})`; ctx.lineWidth = 0.7; ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${n.hue},80%,62%,${isDark ? 0.45 : 0.3})`; ctx.fill();
      });

      // Sparks
      if (frame % 4 === 0) sparks.push({
        x: w * (0.3 + Math.random() * 0.4), y: h * 1.02,
        vx: (Math.random() - 0.5) * 1.4, vy: -(1 + Math.random() * 3.2),
        life: 0, maxLife: 55 + Math.random() * 90, r: 1.5 + Math.random() * 2.8, hue: 10 + Math.random() * 35,
      });
      for (let k = sparks.length - 1; k >= 0; k--) {
        const s = sparks[k]; s.x += s.vx; s.y += s.vy; s.vy *= 0.99; s.life++;
        if (s.life >= s.maxLife || s.y < -20) { sparks.splice(k, 1); continue; }
        const t = s.life / s.maxLife, a = Math.sin(t * Math.PI) * 0.85;
        const sg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3.5);
        sg.addColorStop(0, `hsla(${s.hue},100%,65%,${a})`);
        sg.addColorStop(0.5, `hsla(${s.hue + 20},85%,52%,${a * 0.35})`);
        sg.addColorStop(1, "transparent");
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3.5, 0, Math.PI * 2); ctx.fill();
      }
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [isDark]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ── Animated Stat Counter ──────────────────────────────────────────────────
function StatPill({ num, label, color, delay }: { num: string; label: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5 + delay, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "rgba(8,7,14,0.75)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 16,
          paddingTop: 12, paddingBottom: 12, paddingLeft: 18, paddingRight: 18,
          boxShadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 20, color, margin: "0 0 2px", letterSpacing: "-0.02em", textShadow: `0 0 20px ${color}88` }}>{num}</p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>{label}</p>
      </motion.div>
    </motion.div>
  );
}

// ── Premium Input ───────────────────────────────────────────────────────────
function PInput({ label, type = "text", value, onChange, autoComplete, required, suffix }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  autoComplete?: string; required?: boolean; suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div style={{ position: "relative" }}>
      <motion.label
        animate={{
          top: lifted ? 8 : "50%",
          y: lifted ? 0 : "-50%",
          fontSize: lifted ? 9 : 14,
          fontWeight: lifted ? 800 : 400,
          letterSpacing: lifted ? "0.15em" : 0,
          color: focused ? "#ff8800" : lifted ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.25)",
        }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "absolute", left: 16, zIndex: 2, pointerEvents: "none",
          textTransform: lifted ? "uppercase" as const : "none" as const,
          fontFamily: "Syne, sans-serif",
        }}
      >{label}</motion.label>

      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        autoComplete={autoComplete} required={required}
        style={{
          width: "100%", boxSizing: "border-box" as const,
          paddingTop: lifted ? 22 : 15, paddingBottom: lifted ? 8 : 15,
          paddingLeft: 16, paddingRight: suffix ? 50 : 16,
          borderRadius: 14, outline: "none",
          fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: "#eeeef5",
          border: `1.5px solid ${focused ? "rgba(255,136,0,0.65)" : "rgba(255,255,255,0.07)"}`,
          background: focused ? "rgba(255,107,0,0.05)" : "rgba(255,255,255,0.04)",
          boxShadow: focused ? "0 0 0 4px rgba(255,107,0,0.1), inset 0 1px 0 rgba(255,200,100,0.04)" : "none",
          transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
        }}
      />

      {/* Animated bottom glow */}
      <AnimatePresence>
        {focused && (
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
            style={{ position: "absolute", bottom: 0, left: 10, right: 10, height: 2, borderRadius: 1, overflow: "hidden", originX: "center" }}>
            <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg,transparent,#ff6b00,#ffcc00,#ff6b00,transparent)", animation: "loginLaser 1s ease-in-out infinite" }} />
          </motion.div>
        )}
      </AnimatePresence>

      {suffix && (
        <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", cursor: "pointer", display: "flex", alignItems: "center", zIndex: 3 }}>
          {suffix}
        </div>
      )}
    </div>
  );
}

// ── Magnetic Button ─────────────────────────────────────────────────────────
function MagneticButton({ children, disabled, onClick, type = "button" }: {
  children: React.ReactNode; disabled?: boolean; onClick?: () => void; type?: "button" | "submit";
}) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 500, damping: 30 });
  const sy = useSpring(y, { stiffness: 500, damping: 30 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.3);
    y.set((e.clientY - r.top - r.height / 2) * 0.3);
  };

  return (
    <motion.button type={type} disabled={disabled} onClick={onClick}
      onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{
        x: sx, y: sy,
        width: "100%", paddingTop: 16, paddingBottom: 16, paddingLeft: 20, paddingRight: 20,
        borderRadius: 14, border: "none", cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#ff4500 0%,#ff8800 48%,#ffcc00 100%)",
        color: disabled ? "rgba(255,255,255,0.2)" : "#fff",
        fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15.5,
        position: "relative", overflow: "hidden",
        boxShadow: disabled ? "none" : "0 0 36px rgba(255,100,0,0.42), 0 4px 20px rgba(255,100,0,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
      }}
      whileHover={!disabled ? { scale: 1.025 } : {}}
      whileTap={!disabled ? { scale: 0.975 } : {}}
    >
      {!disabled && <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 25%,rgba(255,255,255,0.22) 50%,transparent 75%)", animation: "loginShimmer 2.4s ease-in-out infinite" }} />}
      <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>{children}</span>
    </motion.button>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────
function EyeIcon({ off = false }: { off?: boolean }) {
  return off ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function GoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>;
}
function GithubIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>;
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { isDark } = useTheme();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setError(null); setLoading(true);
    try {
      await authApi.login(identifier.trim(), password);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Check your credentials.");
    } finally { setLoading(false); }
  }, [identifier, password]);

  const canSubmit = !loading && identifier.length > 0 && password.length > 0;

  if (!mounted) return null;

  const STATS = [
    { num: "12,400+", label: "Campaigns funded", color: "#ff8800", delay: 0.8 },
    { num: "₹98M+", label: "Total raised", color: "#34d399", delay: 1.1 },
    { num: "3.4L+", label: "Active backers", color: "#a78bfa", delay: 1.4 },
    { num: "94%", label: "Success rate", color: "#60a5fa", delay: 1.7 },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#06050a" }}>

      {/* ═══ LEFT BRAND PANEL ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          flex: "0 0 55%", position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "40px 52px 48px",
        }}
        className="login-left-panel"
      >
        <ConstellationCanvas isDark={true} />

        {/* Diagonal separator */}
        <div style={{
          position: "absolute", top: 0, right: -1, width: 80, bottom: 0,
          background: "linear-gradient(to right, transparent 0%, #06050a 100%)",
          zIndex: 2, pointerEvents: "none",
        }} />

        {/* Subtle grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.022, zIndex: 1 }}>
          <defs>
            <pattern id="lpgrid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#ff8800" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lpgrid)" />
        </svg>

        {/* TOP: Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", gap: 12 }}>
          <motion.div whileHover={{ scale: 1.1, rotate: 8 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}
            style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(135deg,#ff4500,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 28px rgba(255,100,0,0.6)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </motion.div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#eeeef5", letterSpacing: "-0.025em" }}>
            Crowd<span style={{ color: "#ff8800" }}>Spark</span>
          </span>
        </motion.div>

        {/* MIDDLE: Hero tagline */}
        <div style={{ position: "relative", zIndex: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 11, fontWeight: 800, color: "#ff8800", letterSpacing: "0.22em", textTransform: "uppercase", display: "block", marginBottom: 18 }}>
              India's #1 crowdfunding platform
            </span>
            <h1 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 900,
              fontSize: "clamp(38px,4.5vw,58px)", lineHeight: 1.05,
              color: "#eeeef5", letterSpacing: "-0.03em", margin: "0 0 20px",
            }}>
              Fund the<br />
              <span style={{
                background: "linear-gradient(90deg,#ff5500,#ff8800,#ffcc00)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>extraordinary.</span>
            </h1>
            <motion.div
              initial={{ scaleX: 0, originX: "left" }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
              style={{ width: 64, height: 3, borderRadius: 2, background: "linear-gradient(90deg,#ff5500,#ffcc00)", marginBottom: 20, boxShadow: "0 0 18px rgba(255,107,0,0.6)" }}
            />
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: 0, maxWidth: 360 }}>
              Join thousands of creators and backers building tomorrow's innovations today.
            </p>
          </motion.div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 40, maxWidth: 380 }}>
            {STATS.map(s => <StatPill key={s.label} {...s} />)}
          </div>
        </div>

        {/* BOTTOM: Trust indicators */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: -6 }}>
            {["#ff6b35", "#34d399", "#a78bfa", "#60a5fa", "#f59e0b"].map((c, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: "2px solid #06050a", marginLeft: i > 0 ? -8 : 0 }} />
            ))}
          </div>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.38)", margin: 0 }}>
            <strong style={{ color: "rgba(255,255,255,0.65)" }}>3.4 lakh+</strong> backers already investing
          </p>
        </motion.div>
      </motion.div>

      {/* ═══ RIGHT FORM PANEL ═══ */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px", position: "relative",
      }}>
        {/* Subtle background for right panel */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 50%, rgba(255,107,0,0.03) 0%, transparent 60%)", pointerEvents: "none" }} />

        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={{
            width: "100%", maxWidth: 420, position: "relative",
            background: "rgba(10,8,18,0.95)", backdropFilter: "blur(32px) saturate(1.6)",
            WebkitBackdropFilter: "blur(32px) saturate(1.6)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 28,
            paddingTop: 44, paddingBottom: 40, paddingLeft: 40, paddingRight: 40,
            boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,107,0,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
            overflow: "hidden",
          }}
        >
          {/* Top glow line */}
          <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 2, background: "linear-gradient(90deg,transparent,rgba(255,90,0,0.9) 28%,rgba(255,220,0,1) 50%,rgba(255,90,0,0.9) 72%,transparent)" }} />
          <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 280, height: 120, background: "radial-gradient(ellipse,rgba(255,107,0,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />

          {/* Corner accents */}
          <div style={{ position: "absolute", top: 12, right: 12, width: 55, height: 55, borderTop: "1.5px solid rgba(255,136,0,0.14)", borderRight: "1.5px solid rgba(255,136,0,0.14)", borderRadius: "0 12px 0 0", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 12, left: 12, width: 55, height: 55, borderBottom: "1.5px solid rgba(96,165,250,0.1)", borderLeft: "1.5px solid rgba(96,165,250,0.1)", borderRadius: "0 0 0 12px", pointerEvents: "none" }} />

          {/* Heading */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 34, color: "#eeeef5", letterSpacing: "-0.03em", margin: "0 0 8px", lineHeight: 1.08 }}>
              Welcome back
            </h2>
            <motion.div
              initial={{ scaleX: 0, originX: "left" }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
              style={{ width: 50, height: 3, borderRadius: 2, background: "linear-gradient(90deg,#ff5500,#ffcc00)", marginBottom: 12, boxShadow: "0 0 16px rgba(255,107,0,0.55)" }}
            />
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.38)", margin: 0 }}>
              Sign in to your CrowdSpark account
            </p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                style={{
                  paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
                  borderRadius: 12, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)",
                  marginBottom: 22, color: "#ef4444", fontSize: 13.5, fontFamily: "DM Sans, sans-serif",
                  display: "flex", alignItems: "flex-start", gap: 10,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.38, duration: 0.4 }}>
              <PInput label="Username / Email / Phone" value={identifier} onChange={setIdentifier} autoComplete="username" required />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.44, duration: 0.4 }}>
              <PInput
                label="Password" type={showPass ? "text" : "password"}
                value={password} onChange={setPassword}
                autoComplete="current-password" required
                suffix={
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", display: "flex", alignItems: "center" }}>
                    <EyeIcon off={showPass} />
                  </button>
                }
              />
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ textAlign: "right", marginTop: -4 }}>
              <Link href="/forgot-password" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "#ff8800", textDecoration: "none", fontWeight: 600 }}>
                Forgot password?
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54, duration: 0.4 }} style={{ marginTop: 4 }}>
              <MagneticButton type="submit" disabled={!canSubmit}>
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "loginSpin .65s linear infinite", flexShrink: 0 }} />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </MagneticButton>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.62 }}
            style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </motion.div>

          {/* OAuth */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.66, duration: 0.4 }}
            style={{ display: "flex", gap: 10 }}>
            {[
              { label: "Google", icon: <GoogleIcon />, href: `${OAUTH_BASE}/oauth2/authorization/google` },
              { label: "GitHub", icon: <GithubIcon />, href: `${OAUTH_BASE}/oauth2/authorization/github` },
            ].map(({ label, icon, href }) => (
              <motion.a key={label} href={href}
                whileHover={{ y: -2, borderColor: "rgba(255,136,0,0.4)", background: "rgba(255,255,255,0.07)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                  paddingTop: 12, paddingBottom: 12, paddingLeft: 14, paddingRight: 14,
                  borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#eeeef5", fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600,
                  textDecoration: "none", transition: "all 0.18s",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                {icon}{label}
              </motion.a>
            ))}
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
            style={{ marginTop: 26, textAlign: "center", color: "rgba(255,255,255,0.35)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5 }}>
            {"Don't have an account? "}
            <Link href="/register" style={{ color: "#ff8800", fontWeight: 700, textDecoration: "none" }}>Sign up free →</Link>
          </motion.p>
        </motion.div>
      </div>

      <style>{`
        @keyframes loginShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(220%)} 100%{transform:translateX(220%)} }
        @keyframes loginSpin    { to{transform:rotate(360deg)} }
        @keyframes loginLaser   { 0%{transform:translateX(-200%)} 100%{transform:translateX(400%)} }
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
