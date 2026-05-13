"use client";
import { useState, useCallback, useEffect, useRef, Suspense, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

// ── Ambient Canvas ──────────────────────────────────────────────────────────
function AmbientCanvas({ isDark }: { isDark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => { canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; ctx.scale(dpr, dpr); };
    resize(); window.addEventListener("resize", resize);
    type N = { x: number; y: number; vx: number; vy: number; r: number; hue: number };
    const W = () => canvas.offsetWidth, H = () => canvas.offsetHeight;
    const nodes: N[] = Array.from({ length: 38 }, () => ({
      x: Math.random() * W(), y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      r: 1 + Math.random() * 1.6, hue: [22, 38, 200][Math.floor(Math.random() * 3)],
    }));
    type Orb = { x: number; y: number; r: number; vx: number; vy: number; hue: number; a: number };
    const orbs: Orb[] = [
      { x: 0.15, y: 0.2, r: 0.40, vx: 0.00020, vy: 0.00015, hue: 22, a: isDark ? 0.09 : 0.055 },
      { x: 0.82, y: 0.68, r: 0.32, vx: -0.00018, vy: 0.00020, hue: 200, a: isDark ? 0.07 : 0.04 },
      { x: 0.50, y: 0.08, r: 0.22, vx: 0.00015, vy: -0.00022, hue: 38, a: isDark ? 0.06 : 0.036 },
    ];
    let frame = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick); frame++;
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -0.15 || o.x > 1.15) o.vx *= -1;
        if (o.y < -0.15 || o.y > 1.15) o.vy *= -1;
        const gx = o.x * w, gy = o.y * h, gr = o.r * Math.min(w, h);
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        g.addColorStop(0, `hsla(${o.hue},82%,${isDark ? 58 : 50}%,${o.a})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.fill();
      });
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) { n.x = 0; n.vx *= -1; } if (n.x > w) { n.x = w; n.vx *= -1; }
        if (n.y < 0) { n.y = 0; n.vy *= -1; } if (n.y > h) { n.y = h; n.vy *= -1; }
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < 90) {
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(255,136,0,${(1 - d / 90) * (isDark ? 0.09 : 0.05)})`; ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      }
      nodes.forEach(n => { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fillStyle = `hsla(${n.hue},80%,62%,${isDark ? 0.38 : 0.22})`; ctx.fill(); });
      const sy = ((frame * 0.28) % (h + 60)) - 30;
      const sl = ctx.createLinearGradient(0, sy - 1, 0, sy + 1);
      sl.addColorStop(0, "transparent"); sl.addColorStop(0.5, `rgba(255,145,0,${isDark ? 0.03 : 0.015})`); sl.addColorStop(1, "transparent");
      ctx.fillStyle = sl; ctx.fillRect(0, sy - 1, w, 2);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [isDark]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ── Password Input ──────────────────────────────────────────────────────────
function PasswordInput({ label, value, onChange, autoComplete, isDark, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  autoComplete?: string; isDark: boolean; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div style={{ position: "relative" }}>
      <motion.label
        animate={{
          top: lifted ? 8 : "50%", y: lifted ? 0 : "-50%",
          fontSize: lifted ? 9 : 14, fontWeight: lifted ? 800 : 400,
          letterSpacing: lifted ? "0.14em" : 0,
          color: focused ? "#ff8800" : lifted ? (isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.38)") : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)"),
        }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: "absolute", left: 16, zIndex: 2, pointerEvents: "none", textTransform: lifted ? "uppercase" as const : "none" as const, fontFamily: "Syne, sans-serif" }}
      >{label}</motion.label>

      <input
        type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete} disabled={disabled}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box" as const,
          paddingTop: lifted ? 22 : 15, paddingBottom: lifted ? 8 : 15,
          paddingLeft: 16, paddingRight: 50,
          borderRadius: 14, outline: "none",
          fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: isDark ? "#eeeef5" : "#1a1a2e",
          border: `1.5px solid ${focused ? "rgba(255,107,0,0.65)" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"}`,
          background: focused ? (isDark ? "rgba(255,107,0,0.05)" : "rgba(255,107,0,0.025)") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.022)"),
          boxShadow: focused ? "0 0 0 4px rgba(255,107,0,0.1)" : "none",
          transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
          opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "text",
        }}
      />
      <AnimatePresence>
        {focused && (
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
            style={{ position: "absolute", bottom: 0, left: 10, right: 10, height: 2, borderRadius: 1, overflow: "hidden", originX: "center" }}>
            <div style={{ height: "100%", width: "55%", background: "linear-gradient(90deg,transparent,#ff6b00,#ffcc00,#ff6b00,transparent)", animation: "rpLaser 1.1s ease-in-out infinite" }} />
          </motion.div>
        )}
      </AnimatePresence>
      <button type="button" onClick={() => setShow(v => !v)}
        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", display: "flex", padding: 4, zIndex: 3 }}>
        {show
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        }
      </button>
    </div>
  );
}

// ── Strength Bar ────────────────────────────────────────────────────────────
function StrengthBar({ pw, isDark }: { pw: string; isDark: boolean }) {
  if (!pw) return null;
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const colors = ["#ef4444", "#f59e0b", "#eab308", "#22c55e"];
  const labels = ["Too weak", "Weak", "Fair", "Strong"];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 8, marginBottom: 4 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[...Array(4)].map((_, i) => (
          <motion.div key={i} animate={{ background: i < score ? colors[score - 1] : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)") }} transition={{ duration: 0.3 }}
            style={{ flex: 1, height: 3, borderRadius: 2 }} />
        ))}
      </div>
      {score > 0 && (
        <span style={{ fontFamily: "Syne, sans-serif", fontSize: 11, fontWeight: 700, color: colors[score - 1] }}>{labels[score - 1]}</span>
      )}
    </motion.div>
  );
}

// ── Success State ───────────────────────────────────────────────────────────
function SuccessState({ isDark }: { isDark: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "8px 0 4px" }}>
      <div style={{ position: "relative", width: 88, height: 88, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
        {[1, 2, 3].map(i => (
          <motion.div key={i} initial={{ scale: 0, opacity: 0.7 }} animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 2, delay: i * 0.35, repeat: Infinity, ease: "easeOut" }}
            style={{ position: "absolute", width: 60, height: 60, borderRadius: "50%", border: "1.5px solid rgba(34,197,94,0.4)" }} />
        ))}
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
          style={{
            width: 72, height: 72, borderRadius: 22,
            background: isDark ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.08)",
            border: "1.5px solid rgba(34,197,94,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 40px rgba(34,197,94,0.2)",
          }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
      </div>

      <motion.h2 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
        style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 26, color: isDark ? "#eeeef5" : "#1a1a2e", letterSpacing: "-0.03em", margin: "0 0 10px", lineHeight: 1.1 }}>
        Password updated!
      </motion.h2>
      <motion.div initial={{ scaleX: 0, originX: "center" }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.45 }}
        style={{ width: 48, height: 3, borderRadius: 2, background: "linear-gradient(90deg,#22c55e,#34d399)", marginBottom: 16, boxShadow: "0 0 14px rgba(34,197,94,0.4)" }} />
      <motion.p initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.32 }}
        style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: isDark ? "rgba(255,255,255,0.48)" : "rgba(0,0,0,0.5)", margin: "0 0 28px", lineHeight: 1.65 }}>
        Your password has been reset successfully. You can now sign in with your new credentials.
      </motion.p>
      <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }} style={{ width: "100%" }}>
        <Link href="/login"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            paddingTop: 15, paddingBottom: 15, paddingLeft: 20, paddingRight: 20,
            borderRadius: 14, border: "none", textDecoration: "none",
            background: "linear-gradient(135deg,#ff4500 0%,#ff8800 50%,#ffcc00 100%)",
            color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15,
            boxShadow: "0 0 32px rgba(255,100,0,0.4)", position: "relative", overflow: "hidden",
          }}>
          <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 28%,rgba(255,255,255,0.2) 50%,transparent 72%)", animation: "rpShimmer 2.2s ease-in-out infinite" }} />
          <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
            Sign in now
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ── Invalid Token ───────────────────────────────────────────────────────────
function InvalidState({ isDark }: { isDark: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "8px 0 4px" }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}
        style={{ width: 72, height: 72, borderRadius: 22, marginBottom: 24, background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.35)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 28px rgba(239,68,68,0.15)" }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </motion.div>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 22, color: isDark ? "#eeeef5" : "#1a1a2e", margin: "0 0 10px" }}>
        Link invalid or expired
      </h2>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: isDark ? "rgba(255,255,255,0.48)" : "rgba(0,0,0,0.5)", margin: "0 0 28px", lineHeight: 1.65 }}>
        This password reset link is invalid or has expired. Please request a new one.
      </p>
      <Link href="/forgot-password"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          paddingTop: 14, paddingBottom: 14, paddingLeft: 20, paddingRight: 20,
          borderRadius: 14, textDecoration: "none",
          background: "linear-gradient(135deg,#ff4500 0%,#ff8800 50%,#ffcc00 100%)",
          color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14.5,
          boxShadow: "0 0 28px rgba(255,100,0,0.35)",
        }}>
        Request new link
      </Link>
    </motion.div>
  );
}

// ── Inner page ──────────────────────────────────────────────────────────────
function ResetPasswordInner() {
  const { isDark } = useTheme();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isInvalid = !token || !email;
  const passwordsMatch = password === confirm;
  const canSubmit = !loading && password.length >= 8 && confirm.length > 0 && passwordsMatch;

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (!passwordsMatch) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/crowdspark"}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.message || "Something went wrong. Please try again."); }
      else { setDone(true); }
    } catch { setError("Network error. Please check your connection and try again."); }
    finally { setLoading(false); }
  }, [canSubmit, password, confirm, email, token, passwordsMatch]);

  const pageBg = isDark ? "#06050a" : "#f3f2ee";
  const cardBg = isDark ? "rgba(10,8,18,0.95)" : "rgba(255,255,255,0.97)";
  const cardBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const mutedClr = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.42)";

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <AmbientCanvas isDark={isDark} />

      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: isDark ? 0.022 : 0.014 }}>
        <defs><pattern id="rpg" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke={isDark ? "#ff8800" : "#000"} strokeWidth="0.7" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#rpg)" />
      </svg>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200, background: `linear-gradient(to bottom,${isDark ? "rgba(6,5,10,0.5)" : "rgba(243,242,238,0.5)"} 0%,transparent 100%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: `linear-gradient(to top,${isDark ? "rgba(6,5,10,0.5)" : "rgba(243,242,238,0.5)"} 0%,transparent 100%)`, pointerEvents: "none" }} />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ position: "absolute", top: 28, left: 36, display: "flex", alignItems: "center", gap: 10, zIndex: 10 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <motion.div whileHover={{ scale: 1.08, rotate: 5 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}
            style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#ff4500,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(255,100,0,0.55)" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill={isDark ? "#050508" : "#fff"}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </motion.div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: isDark ? "#eeeef5" : "#1a1a2e", letterSpacing: "-0.025em" }}>
            Crowd<span style={{ color: "#ff8800" }}>Spark</span>
          </span>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 38, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative", zIndex: 5,
          width: "100%", maxWidth: 448, margin: "0 16px",
          background: cardBg, backdropFilter: "blur(32px) saturate(1.5)", WebkitBackdropFilter: "blur(32px) saturate(1.5)",
          border: `1px solid ${cardBdr}`, borderRadius: 28,
          paddingTop: 44, paddingBottom: 40, paddingLeft: 42, paddingRight: 42,
          boxShadow: isDark
            ? "0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,107,0,0.06), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,107,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "7%", right: "7%", height: 2.5, background: "linear-gradient(90deg,transparent,rgba(255,90,0,0.85) 28%,rgba(255,220,0,1) 50%,rgba(255,90,0,0.85) 72%,transparent)" }} />
        <div style={{ position: "absolute", top: -55, left: "50%", transform: "translateX(-50%)", width: 280, height: 110, background: "radial-gradient(ellipse,rgba(255,107,0,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 12, right: 12, width: 55, height: 55, borderTop: `1.5px solid ${isDark ? "rgba(255,136,0,0.12)" : "rgba(255,136,0,0.18)"}`, borderRight: `1.5px solid ${isDark ? "rgba(255,136,0,0.12)" : "rgba(255,136,0,0.18)"}`, borderRadius: "0 12px 0 0", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 12, left: 12, width: 55, height: 55, borderBottom: `1.5px solid ${isDark ? "rgba(96,165,250,0.1)" : "rgba(96,165,250,0.14)"}`, borderLeft: `1.5px solid ${isDark ? "rgba(96,165,250,0.1)" : "rgba(96,165,250,0.14)"}`, borderRadius: "0 0 0 12px", pointerEvents: "none" }} />

        <AnimatePresence mode="wait">
          {isInvalid ? (
            <motion.div key="invalid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InvalidState isDark={isDark} />
            </motion.div>
          ) : done ? (
            <motion.div key="done" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
              <SuccessState isDark={isDark} />
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4 }}>
              {/* Back */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ marginBottom: 28 }}>
                <Link href="/login"
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, color: mutedClr, fontFamily: "DM Sans, sans-serif", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Back to sign in
                </Link>
              </motion.div>

              {/* Heading */}
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} style={{ marginBottom: 28 }}>
                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.2 }}
                  style={{ position: "relative", width: 64, height: 64, marginBottom: 22 }}>
                  {[1, 2].map(i => (
                    <motion.div key={i} animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2.4, delay: i * 0.6, repeat: Infinity }}
                      style={{ position: "absolute", inset: 0, borderRadius: 18, border: "1.5px solid rgba(255,136,0,0.35)" }} />
                  ))}
                  <div style={{
                    width: 64, height: 64, borderRadius: 18,
                    background: isDark ? "rgba(255,107,0,0.09)" : "rgba(255,107,0,0.07)",
                    border: "1.5px solid rgba(255,107,0,0.28)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 32px rgba(255,107,0,0.18)", position: "relative", zIndex: 1,
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff8800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </motion.div>

                <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(24px,3.5vw,34px)", color: isDark ? "#eeeef5" : "#1a1a2e", letterSpacing: "-0.03em", margin: "0 0 10px", lineHeight: 1.06 }}>
                  Set new password
                </h1>
                <motion.div initial={{ scaleX: 0, originX: "left" }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.5 }}
                  style={{ width: 48, height: 3, borderRadius: 2, background: "linear-gradient(90deg,#ff5500,#ffcc00)", marginBottom: 14, boxShadow: "0 0 16px rgba(255,107,0,0.55)" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: mutedClr, margin: 0, lineHeight: 1.6 }}>
                  Choose a strong password with at least 8 characters.
                </p>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                    style={{ paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16, borderRadius: 12, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)", marginBottom: 20, color: "#ef4444", fontSize: 13.5, fontFamily: "DM Sans, sans-serif", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28, duration: 0.4 }}>
                  <PasswordInput label="New password" value={password} onChange={setPassword} autoComplete="new-password" isDark={isDark} disabled={loading} />
                  <StrengthBar pw={password} isDark={isDark} />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.33, duration: 0.4 }}>
                  <PasswordInput label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" isDark={isDark} disabled={loading} />
                </motion.div>

                {/* Match indicator */}
                <AnimatePresence>
                  {confirm.length > 0 && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{
                        fontFamily: "DM Sans, sans-serif", fontSize: 12.5, margin: "-6px 0 0 4px",
                        color: passwordsMatch ? "#34d399" : "#ef4444",
                        display: "flex", alignItems: "center", gap: 6, fontWeight: 600,
                      }}>
                      <motion.span animate={{ scale: [1.3, 1] }} transition={{ duration: 0.2 }}>{passwordsMatch ? "✓" : "✕"}</motion.span>
                      {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }} style={{ marginTop: 4 }}>
                  <motion.button type="submit" disabled={!canSubmit}
                    whileHover={canSubmit ? { scale: 1.025, boxShadow: "0 0 48px rgba(255,100,0,0.54)" } : {}}
                    whileTap={canSubmit ? { scale: 0.975 } : {}}
                    style={{
                      width: "100%", paddingTop: 15, paddingBottom: 15, paddingLeft: 20, paddingRight: 20,
                      borderRadius: 14, border: "none",
                      background: canSubmit ? "linear-gradient(135deg,#ff4500 0%,#ff8800 50%,#ffcc00 100%)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"),
                      color: canSubmit ? "#fff" : (isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)"),
                      fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15.5,
                      cursor: canSubmit ? "pointer" : "not-allowed",
                      position: "relative", overflow: "hidden",
                      boxShadow: canSubmit ? "0 0 32px rgba(255,100,0,0.4), 0 4px 20px rgba(255,100,0,0.2)" : "none",
                      transition: "background 0.3s, color 0.3s, box-shadow 0.3s",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                    }}>
                    {canSubmit && <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 25%,rgba(255,255,255,0.22) 50%,transparent 75%)", animation: "rpShimmer 2.2s ease-in-out infinite" }} />}
                    {loading ? (
                      <><span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "rpSpin .65s linear infinite", flexShrink: 0 }} /><span style={{ position: "relative" }}>Updating password…</span></>
                    ) : (
                      <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
                        Set new password
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        @keyframes rpSpin    { to{transform:rotate(360deg)} }
        @keyframes rpShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(220%)} 100%{transform:translateX(220%)} }
        @keyframes rpLaser   { 0%{transform:translateX(-200%)} 100%{transform:translateX(400%)} }
      `}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
