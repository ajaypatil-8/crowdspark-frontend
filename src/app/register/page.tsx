"use client";
import { useState, useCallback, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const STEPS = ["Identity", "Contact", "Security"];

// ── Ambient Canvas ──────────────────────────────────────────────────────────
function AmbientBg({ isDark }: { isDark: boolean }) {
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
    resize(); window.addEventListener("resize", resize);
    type N = { x: number; y: number; vx: number; vy: number; r: number; hue: number };
    const W = () => canvas.offsetWidth, H = () => canvas.offsetHeight;
    const nodes: N[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * W(), y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      r: 1 + Math.random() * 1.8, hue: [22, 38, 210, 260][Math.floor(Math.random() * 4)],
    }));
    type Orb = { x: number; y: number; r: number; vx: number; vy: number; hue: number; a: number };
    const orbs: Orb[] = [
      { x: 0.1, y: 0.2, r: 0.38, vx: 0.00022, vy: 0.00016, hue: 22, a: isDark ? 0.09 : 0.055 },
      { x: 0.85, y: 0.7, r: 0.30, vx: -0.00018, vy: 0.00020, hue: 210, a: isDark ? 0.07 : 0.04 },
      { x: 0.55, y: 0.08, r: 0.24, vx: 0.00015, vy: -0.00023, hue: 38, a: isDark ? 0.06 : 0.038 },
      { x: 0.05, y: 0.82, r: 0.20, vx: 0.00020, vy: -0.00016, hue: 260, a: isDark ? 0.055 : 0.032 },
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
        g.addColorStop(0, `hsla(${o.hue},85%,${isDark ? 60 : 52}%,${o.a})`);
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
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 95) {
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(255,136,0,${(1 - d / 95) * (isDark ? 0.1 : 0.055)})`; ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${n.hue},80%,62%,${isDark ? 0.4 : 0.25})`; ctx.fill();
      });
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

// ── Password Strength ───────────────────────────────────────────────────────
function StrengthBar({ pw }: { pw: string }) {
  const checks = [
    { label: "8+ chars", ok: pw.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(pw) },
    { label: "Number", ok: /\d/.test(pw) },
    { label: "Symbol", ok: /[^A-Za-z0-9]/.test(pw) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["#ef4444", "#f59e0b", "#f59e0b", "#34d399", "#22c55e"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!pw.length) return null;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: -4, marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {[0, 1, 2, 3].map(i => (
          <motion.div key={i} animate={{ background: i < score ? colors[score] : "rgba(128,128,128,0.15)" }}
            transition={{ duration: 0.35 }}
            style={{ flex: 1, height: 3, borderRadius: 2, boxShadow: i < score ? `0 0 6px ${colors[score]}66` : "none" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Syne, sans-serif", fontSize: 11, fontWeight: 700, color: score > 0 ? colors[score] : "rgba(128,128,128,0.5)" }}>{labels[score]}</span>
        <div style={{ display: "flex", gap: 8 }}>
          {checks.map(c => (
            <span key={c.label} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, color: c.ok ? "#34d399" : "rgba(255,255,255,0.28)", display: "flex", alignItems: "center", gap: 3 }}>
              <motion.span animate={{ scale: c.ok ? [1.4, 1] : 1 }} transition={{ duration: 0.2 }} style={{ fontSize: 9 }}>{c.ok ? "✓" : "○"}</motion.span>
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Form Input ──────────────────────────────────────────────────────────────
function FInput({ label, type = "text", value, onChange, autoComplete, required, isDark, hint, maxLength }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  autoComplete?: string; required?: boolean; isDark: boolean; hint?: string; maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPw = type === "password";
  const lifted = focused || value.length > 0;
  const inputColor = isDark ? "#eeeef5" : "#1a1a2e";
  const borderColor = focused ? "rgba(255,136,0,0.65)" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)";
  const bgColor = focused ? (isDark ? "rgba(255,107,0,0.05)" : "rgba(255,107,0,0.025)") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)");

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ position: "relative" }}>
        <motion.label
          animate={{
            top: lifted ? 8 : "50%", y: lifted ? 0 : "-50%",
            fontSize: lifted ? 9 : 14, fontWeight: lifted ? 800 : 400,
            letterSpacing: lifted ? "0.14em" : 0,
            color: focused ? "#ff8800"
              : lifted ? (isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.38)")
              : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)"),
          }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ position: "absolute", left: 16, zIndex: 2, pointerEvents: "none", textTransform: lifted ? "uppercase" as const : "none" as const, fontFamily: "Syne, sans-serif" }}
        >{label}</motion.label>

        <input
          type={isPw && showPw ? "text" : type} value={value} onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete} required={required} maxLength={maxLength}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", boxSizing: "border-box" as const,
            paddingTop: lifted ? 22 : 15, paddingBottom: lifted ? 8 : 15,
            paddingLeft: 16, paddingRight: isPw ? 48 : 16,
            borderRadius: 13, outline: "none",
            fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: inputColor,
            border: `1.5px solid ${borderColor}`, background: bgColor,
            boxShadow: focused ? "0 0 0 4px rgba(255,107,0,0.1)" : "none",
            transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        <AnimatePresence>
          {focused && (
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
              style={{ position: "absolute", bottom: 0, left: 10, right: 10, height: 2, borderRadius: 1, overflow: "hidden", originX: "center" }}>
              <div style={{ height: "100%", width: "55%", background: "linear-gradient(90deg,transparent,#ff6b00,#ffcc00,#ff6b00,transparent)", animation: "regLaser 1.1s ease-in-out infinite" }} />
            </motion.div>
          )}
        </AnimatePresence>
        {isPw && (
          <button type="button" onClick={() => setShowPw(v => !v)}
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", display: "flex", padding: 4, zIndex: 3 }}>
            {showPw
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            }
          </button>
        )}
      </div>
      {hint && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.35)", margin: "5px 0 0 4px" }}>{hint}</p>}
    </div>
  );
}

// ── Step Progress ───────────────────────────────────────────────────────────
function StepProgress({ step, isDark }: { step: number; isDark: boolean }) {
  const mutedBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const mutedText = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {i === step && (
              <motion.div animate={{ scale: [1, 1.65, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.8, repeat: Infinity }}
                style={{ position: "absolute", width: 30, height: 30, borderRadius: "50%", border: "1.5px solid rgba(255,107,0,0.55)" }} />
            )}
            <motion.div
              animate={{
                background: i < step ? "#22c55e" : i === step ? "linear-gradient(135deg,#ff4500,#ffcc00)" : mutedBg,
                boxShadow: i === step ? "0 0 18px rgba(255,107,0,0.5)" : i < step ? "0 0 12px rgba(34,197,94,0.4)" : "none",
                scale: i === step ? 1.1 : 1,
              }}
              transition={{ duration: 0.35 }}
              style={{
                width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, fontFamily: "Syne, sans-serif",
                color: i <= step ? "#fff" : mutedText, position: "relative", zIndex: 1,
              }}
            >
              {i < step
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                : i + 1}
            </motion.div>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ width: 22, height: 2, margin: "0 3px", position: "relative", borderRadius: 1, background: mutedBg }}>
              <motion.div animate={{ width: i < step ? "100%" : "0%" }} transition={{ duration: 0.45 }}
                style={{ position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 1, background: "linear-gradient(90deg,#22c55e,#34d399)", boxShadow: "0 0 5px rgba(34,197,94,0.5)" }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Success Screen ──────────────────────────────────────────────────────────
function SuccessAnim({ isDark }: { isDark: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "44px 0" }}>
      {[1, 2, 3].map(i => (
        <motion.div key={i} initial={{ scale: 0, opacity: 0.7 }} animate={{ scale: 3.8, opacity: 0 }}
          transition={{ duration: 1.8, delay: i * 0.3, repeat: Infinity, ease: "easeOut" }}
          style={{ position: "absolute", width: 68, height: 68, borderRadius: "50%", border: "1.5px solid rgba(52,211,153,0.4)" }} />
      ))}
      <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
        style={{
          width: 74, height: 74, borderRadius: 22, background: "rgba(52,211,153,0.1)",
          border: "1.5px solid rgba(52,211,153,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
          color: "#34d399", position: "relative", boxShadow: "0 0 44px rgba(52,211,153,0.22)",
        }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </motion.div>
      <motion.div initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 23, color: isDark ? "#eeeef5" : "#1a1a2e", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Account created! 🎉</p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.45)", margin: 0 }}>Logging you in automatically…</p>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", border: "2.5px solid rgba(52,211,153,0.3)", borderTopColor: "#34d399", animation: "regSpin .7s linear infinite", display: "block" }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { isDark } = useTheme();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", phoneNumber: "", password: "", confirmPassword: "" });

  const set = useCallback((field: string) => (v: string) => setForm(f => ({ ...f, [field]: v })), []);
  const canNext0 = form.name.trim().length >= 1 && form.username.trim().length >= 3;
  const canNext1 = form.email.trim().length > 4;
  const canSubmit = form.password.length >= 8 && form.password === form.confirmPassword;

  const nextStep = useCallback(() => {
    if (step === 0 && !canNext0) { setError("Fill name and username (min 3 chars)"); return; }
    if (step === 1 && !canNext1) { setError("Enter a valid email"); return; }
    setError(null); setStep(s => s + 1);
  }, [step, canNext0, canNext1]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) { setError(form.password !== form.confirmPassword ? "Passwords don't match" : "Password must be at least 8 characters"); return; }
    setError(null); setLoading(true);
    try {
      await authApi.register({
        username: form.username.trim(), name: form.name.trim(),
        email: form.email.trim(), phoneNumber: form.phoneNumber.trim() || undefined,
        password: form.password,
      });
      await authApi.login(form.email.trim(), form.password);
      setSuccess(true);
      setTimeout(() => { window.location.href = "/"; }, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Try again.");
    } finally { setLoading(false); }
  }, [form, canSubmit]);

  const pageBg = isDark ? "#06050a" : "#f5f4f0";
  const cardBg = isDark ? "rgba(9,8,16,0.96)" : "rgba(255,255,255,0.97)";
  const cardBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const mutedClr = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.42)";

  const STEP_DATA = [
    { icon: "👤", heading: "Who are you?", sub: "Your name and a unique username." },
    { icon: "📬", heading: "How to reach you?", sub: "Your email for login and notifications." },
    { icon: "🔐", heading: "Secure your account", sub: "A strong password to protect you." },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", overflow: "hidden", background: pageBg }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <AmbientBg isDark={isDark} />
        <div style={{ position: "absolute", top: "-15%", left: "-8%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.09) 0%,transparent 65%)", filter: "blur(55px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-12%", right: "-4%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,184,0.08) 0%,transparent 65%)", filter: "blur(50px)", pointerEvents: "none" }} />
        {isDark && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.022, pointerEvents: "none" }}>
            <defs><pattern id="rp-dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="#ff8800" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#rp-dots)" />
          </svg>
        )}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 36 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%", maxWidth: 490, position: "relative",
          background: cardBg, border: `1px solid ${cardBdr}`, borderRadius: 26,
          padding: "38px 38px 34px",
          boxShadow: isDark
            ? "0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,107,0,0.06), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 32px 80px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,107,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Top glow */}
        <div style={{ position: "absolute", top: 0, left: "6%", right: "6%", height: 2, background: "linear-gradient(90deg,transparent,rgba(255,90,0,0.8) 25%,rgba(255,220,0,1) 50%,rgba(255,90,0,0.8) 75%,transparent)" }} />
        <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 280, height: 120, background: "radial-gradient(ellipse,rgba(255,107,0,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

        {/* Corner accents */}
        <div style={{ position: "absolute", top: 12, right: 12, width: 55, height: 55, borderTop: `1.5px solid ${isDark ? "rgba(255,136,0,0.12)" : "rgba(255,136,0,0.18)"}`, borderRight: `1.5px solid ${isDark ? "rgba(255,136,0,0.12)" : "rgba(255,136,0,0.18)"}`, borderRadius: "0 12px 0 0", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 12, left: 12, width: 55, height: 55, borderBottom: `1.5px solid ${isDark ? "rgba(96,165,250,0.1)" : "rgba(96,165,250,0.14)"}`, borderLeft: `1.5px solid ${isDark ? "rgba(96,165,250,0.1)" : "rgba(96,165,250,0.14)"}`, borderRadius: "0 0 0 12px", pointerEvents: "none" }} />

        {!success && (
          <>
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
                <motion.div whileHover={{ scale: 1.1, rotate: 8 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#ff4500,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(255,100,0,0.5)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff" /></svg>
                </motion.div>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: isDark ? "#eeeef5" : "#1a1a2e", letterSpacing: "-0.02em" }}>
                  Crowd<span style={{ color: "#ff8800" }}>Spark</span>
                </span>
              </Link>
              <StepProgress step={step} isDark={isDark} />
            </div>

            {/* Step heading */}
            <AnimatePresence mode="wait">
              <motion.div key={`h-${step}`}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28 }}
                style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.1 }}
                    style={{
                      width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                      background: isDark ? "rgba(255,107,0,0.08)" : "rgba(255,107,0,0.07)",
                      border: "1.5px solid rgba(255,107,0,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, boxShadow: "0 0 20px rgba(255,107,0,0.12)",
                    }}>
                    {STEP_DATA[step].icon}
                  </motion.div>
                  <div>
                    <span style={{ fontFamily: "Syne, sans-serif", fontSize: 10, fontWeight: 800, color: "#ff8800", letterSpacing: "0.18em", textTransform: "uppercase", display: "block" }}>
                      Step {step + 1} of 3
                    </span>
                    <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 22, color: isDark ? "#eeeef5" : "#1a1a2e", letterSpacing: "-0.03em", margin: "3px 0 0", lineHeight: 1.15 }}>
                      {STEP_DATA[step].heading}
                    </h1>
                  </div>
                </div>
                <motion.div initial={{ scaleX: 0, originX: "left" }} animate={{ scaleX: 1 }} transition={{ delay: 0.2, duration: 0.4 }}
                  style={{ width: 40, height: 2.5, borderRadius: 2, background: "linear-gradient(90deg,#ff5500,#ffcc00)", marginBottom: 8, boxShadow: "0 0 12px rgba(255,107,0,0.5)" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: mutedClr, margin: 0 }}>
                  {STEP_DATA[step].sub}
                </p>
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ padding: "11px 14px", borderRadius: 12, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)", marginBottom: 16, color: "#ef4444", fontFamily: "DM Sans, sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 9 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form content */}
        {success ? <SuccessAnim isDark={isDark} /> : (
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s0" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                  <FInput label="Full Name" value={form.name} onChange={set("name")} autoComplete="name" required isDark={isDark} />
                  <FInput
                    label="Username (3–30 chars)" value={form.username}
                    onChange={v => set("username")(v.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    autoComplete="username" required isDark={isDark} maxLength={30}
                    hint="Only lowercase letters, numbers, underscores"
                  />
                </motion.div>
              )}
              {step === 1 && (
                <motion.div key="s1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                  <FInput label="Email Address" type="email" value={form.email} onChange={set("email")} autoComplete="email" required isDark={isDark} />
                  <FInput label="Phone Number (optional)" type="tel" value={form.phoneNumber} onChange={set("phoneNumber")} autoComplete="tel" isDark={isDark} hint="+91XXXXXXXXXX or 10-digit number" />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="s2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                  <FInput label="Password (min 8 chars)" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" required isDark={isDark} />
                  <StrengthBar pw={form.password} />
                  <FInput label="Confirm Password" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" required isDark={isDark} />
                  <AnimatePresence>
                    {form.confirmPassword.length > 0 && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{
                          fontFamily: "DM Sans, sans-serif", fontSize: 12.5,
                          color: form.password === form.confirmPassword ? "#34d399" : "#ef4444",
                          margin: "-8px 0 16px 4px", display: "flex", alignItems: "center", gap: 6, fontWeight: 600,
                        }}>
                        <motion.span animate={{ scale: [1.3, 1] }} transition={{ duration: 0.2 }}>
                          {form.password === form.confirmPassword ? "✓" : "✕"}
                        </motion.span>
                        {form.password === form.confirmPassword ? "Passwords match" : "Passwords don't match"}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              {step > 0 && (
                <motion.button type="button" onClick={() => { setError(null); setStep(s => s - 1); }}
                  whileHover={{ scale: 1.02, borderColor: "rgba(255,136,0,0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: "0 0 auto", padding: "13px 20px",
                    background: "none", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                    borderRadius: 13, fontSize: 14, fontFamily: "DM Sans, sans-serif", fontWeight: 600,
                    color: mutedClr, cursor: "pointer", transition: "border-color 0.2s",
                    display: "flex", alignItems: "center", gap: 7,
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Back
                </motion.button>
              )}

              {step < 2 ? (
                <motion.button type="button" onClick={nextStep}
                  whileHover={{ scale: 1.025, boxShadow: "0 0 36px rgba(255,100,0,0.48)" }}
                  whileTap={{ scale: 0.975 }}
                  style={{
                    flex: 1, padding: "13px",
                    background: "linear-gradient(135deg,#ff4500 0%,#ff8800 50%,#ffcc00 100%)",
                    color: "#fff", border: "none", borderRadius: 13,
                    fontSize: 15, fontWeight: 800, fontFamily: "Syne, sans-serif",
                    cursor: "pointer", position: "relative", overflow: "hidden",
                    boxShadow: "0 0 28px rgba(255,100,0,0.38)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                  }}>
                  <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 28%,rgba(255,255,255,0.22) 50%,transparent 72%)", animation: "regShimmer 2.3s ease-in-out infinite" }} />
                  <span style={{ position: "relative" }}>Continue</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </motion.button>
              ) : (
                <motion.button type="submit" disabled={loading || !canSubmit}
                  whileHover={!loading && canSubmit ? { scale: 1.025, boxShadow: "0 0 38px rgba(255,100,0,0.5)" } : {}}
                  whileTap={!loading && canSubmit ? { scale: 0.975 } : {}}
                  style={{
                    flex: 1, padding: "13px",
                    background: canSubmit ? "linear-gradient(135deg,#ff4500 0%,#ff8800 50%,#ffcc00 100%)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    color: canSubmit ? "#fff" : mutedClr,
                    border: "none", borderRadius: 13,
                    fontSize: 15, fontWeight: 800, fontFamily: "Syne, sans-serif",
                    cursor: loading || !canSubmit ? "not-allowed" : "pointer",
                    opacity: loading ? 0.75 : 1, position: "relative", overflow: "hidden",
                    boxShadow: canSubmit && !loading ? "0 0 30px rgba(255,100,0,0.4)" : "none",
                    transition: "all 0.25s", display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                  }}>
                  {canSubmit && <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 28%,rgba(255,255,255,0.22) 50%,transparent 72%)", animation: "regShimmer 2.3s ease-in-out infinite" }} />}
                  {loading && <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", animation: "regSpin .7s linear infinite", position: "relative", flexShrink: 0 }} />}
                  <span style={{ position: "relative" }}>{loading ? "Creating account…" : "Create account"}</span>
                  {!loading && canSubmit && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  )}
                </motion.button>
              )}
            </div>

            <p style={{ textAlign: "center", color: mutedClr, fontFamily: "DM Sans, sans-serif", fontSize: 13.5, margin: "20px 0 0" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#ff8800", fontWeight: 700, textDecoration: "none" }}>Sign in →</Link>
            </p>
          </form>
        )}
      </motion.div>

      <style>{`
        @keyframes regShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(220%)} 100%{transform:translateX(220%)} }
        @keyframes regSpin    { to{transform:rotate(360deg)} }
        @keyframes regLaser   { 0%{transform:translateX(-200%)} 100%{transform:translateX(400%)} }
      `}</style>
    </div>
  );
}
