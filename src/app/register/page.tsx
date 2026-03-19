"use client";
import { useState, useCallback, useEffect, useRef, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const STEPS = ["Identity", "Contact", "Security"];

// ── Password Strength ─────────────────────────────────────────────────────────
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
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      style={{ marginTop: -8, marginBottom: 20 }}
    >
      <div style={{ display: "flex", gap: 4, marginBottom: 7 }}>
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            animate={{ background: i < score ? colors[score] : "rgba(128,128,128,0.18)" }}
            transition={{ duration: 0.35 }}
            style={{ flex: 1, height: 3.5, borderRadius: 2, boxShadow: i < score ? `0 0 6px ${colors[score]}88` : "none" }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Syne, sans-serif", fontSize: 11, fontWeight: 700, color: score > 0 ? colors[score] : "var(--text-muted)" }}>{labels[score]}</span>
        <div style={{ display: "flex", gap: 10 }}>
          {checks.map(c => (
            <span key={c.label} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, color: c.ok ? "#34d399" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
              <motion.span animate={{ scale: c.ok ? [1.4, 1] : 1 }} transition={{ duration: 0.2 }} style={{ fontSize: 9 }}>{c.ok ? "✓" : "○"}</motion.span>
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Forge Input ───────────────────────────────────────────────────────────────
function FInput({ label, type = "text", value, onChange, autoComplete, required, isDark, hint, maxLength }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  autoComplete?: string; required?: boolean; isDark: boolean; hint?: string; maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPw = type === "password";
  const lifted = focused || value.length > 0;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ position: "relative" }}>
        <label style={{
          position: "absolute", left: 16, zIndex: 2, pointerEvents: "none",
          top: lifted ? 9 : "50%",
          transform: lifted ? "none" : "translateY(-50%)",
          fontSize: lifted ? 9.5 : 14.5,
          fontFamily: "Syne, sans-serif",
          fontWeight: lifted ? 800 : 400,
          letterSpacing: lifted ? "0.13em" : 0,
          textTransform: lifted ? "uppercase" : "none",
          color: focused ? "#ff8800" : (lifted ? "rgba(128,128,128,0.7)" : "rgba(128,128,128,0.45)"),
          transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        }}>{label}</label>

        <input
          type={isPw && showPw ? "text" : type}
          value={value} onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete} required={required} maxLength={maxLength}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", boxSizing: "border-box" as const,
            padding: lifted ? "24px 48px 8px 16px" : "15px 48px 15px 16px",
            borderRadius: 14, outline: "none",
            fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: "var(--text)",
            border: `1.5px solid ${focused ? "rgba(255,107,0,0.65)" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)"}`,
            background: focused
              ? (isDark ? "rgba(255,107,0,0.05)" : "rgba(255,107,0,0.025)")
              : (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"),
            boxShadow: focused
              ? "0 0 0 3.5px rgba(255,107,0,0.12), inset 0 1px 0 rgba(255,200,100,0.04)"
              : "none",
            transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        />

        {/* Laser scan */}
        {focused && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2.5, borderRadius: "0 0 14px 14px", overflow: "hidden", pointerEvents: "none" }}>
            <div style={{ height: "100%", width: "50%", background: "linear-gradient(90deg,transparent,#ff6b00,#ffcc00,#ff6b00,transparent)", animation: "rpLaser 1.1s ease-in-out infinite" }} />
          </div>
        )}

        {isPw && (
          <button type="button" onClick={() => setShowPw(v => !v)}
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4, zIndex: 3 }}>
            {showPw
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        )}
      </div>
      {hint && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: "5px 0 0 4px", opacity: 0.8 }}>{hint}</p>}
    </div>
  );
}

// ── Success Animation ─────────────────────────────────────────────────────────
function SuccessAnim() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "48px 0" }}
    >
      {/* Pulsing rings */}
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 3.5, opacity: 0 }}
          transition={{ duration: 1.8, delay: i * 0.3, repeat: Infinity, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 72, height: 72, borderRadius: "50%",
            border: "1.5px solid rgba(52,211,153,0.5)",
          }}
        />
      ))}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        style={{
          width: 72, height: 72, borderRadius: 22,
          background: "rgba(52,211,153,0.12)",
          border: "1.5px solid rgba(52,211,153,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#34d399", position: "relative",
          boxShadow: "0 0 40px rgba(52,211,153,0.2)",
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </motion.div>
      <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 22, color: "var(--text)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Account created! 🎉</p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: 0 }}>Logging you in automatically…</p>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", border: "2.5px solid rgba(52,211,153,0.35)", borderTopColor: "#34d399", animation: "rpSpin .7s linear infinite", display: "block" }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Cosmic Background Canvas ──────────────────────────────────────────────────
function CosmicBg({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

    type Orb = { x: number; y: number; r: number; vx: number; vy: number; hue: number; alpha: number };
    const orbs: Orb[] = Array.from({ length: 6 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 120 + Math.random() * 180,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      hue: [18, 38, 160, 260, 200, 45][Math.floor(Math.random() * 6)],
      alpha: 0.04 + Math.random() * 0.06,
    }));

    let frame = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      frame++;
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      // Draw floating orbs
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r) o.x = W + o.r;
        if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        if (o.y > H + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},85%,${isDark ? 60 : 55}%,${o.alpha})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle dot grid (dark mode only)
      if (isDark && frame % 60 === 0) {
        // only draw dots on first frame since they don't change
      }
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [isDark]);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ── Step Progress ─────────────────────────────────────────────────────────────
function StepProgress({ step, isDark }: { step: number; isDark: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center" }}>
          {/* Step circle */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Pulsing ring for active step */}
            {i === step && (
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  width: 28, height: 28, borderRadius: "50%",
                  border: "1.5px solid rgba(255,107,0,0.6)",
                }}
              />
            )}
            <motion.div
              animate={{
                background: i < step
                  ? "#34d399"
                  : i === step
                  ? "linear-gradient(135deg,#ff5500,#ffcc00)"
                  : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                boxShadow: i === step
                  ? "0 0 16px rgba(255,107,0,0.45)"
                  : i < step
                  ? "0 0 12px rgba(52,211,153,0.35)"
                  : "none",
                scale: i === step ? 1.12 : 1,
              }}
              transition={{ duration: 0.35 }}
              style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, fontFamily: "Syne, sans-serif",
                color: i <= step ? "#fff" : "var(--text-muted)",
                position: "relative", zIndex: 1, cursor: "default",
              }}
            >
              {i < step ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : i + 1}
            </motion.div>
          </div>

          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div style={{ position: "relative", width: 28, height: 2, margin: "0 2px" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 1, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" }} />
              <motion.div
                animate={{ width: i < step ? "100%" : "0%" }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                style={{ position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 1, background: "linear-gradient(90deg,#34d399,#22c55e)", boxShadow: "0 0 6px rgba(52,211,153,0.5)" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
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
    setError(null);
    setStep(s => s + 1);
  }, [step, canNext0, canNext1]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) { setError(form.password !== form.confirmPassword ? "Passwords don't match" : "Password must be at least 8 characters"); return; }
    setError(null); setLoading(true);
    try {
      await authApi.register({
        username: form.username.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
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

  const STEP_DATA = [
    { heading: "Who are you?", sub: "Your name and a unique username." },
    { heading: "How to reach you?", sub: "Your email for login and notifications." },
    { heading: "Secure your account", sub: "A strong password to protect your account." },
  ];

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", position: "relative", overflow: "hidden", background: pageBg,
    }}>
      {/* Cosmic canvas background */}
      <div style={{ position: "absolute", inset: 0 }}>
        <CosmicBg isDark={isDark} />

        {/* Static gradient orbs */}
        <div style={{ position: "absolute", top: "-15%", left: "-8%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.1) 0%,transparent 65%)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-12%", right: "-4%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,184,0.09) 0%,transparent 65%)", filter: "blur(55px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "42%", right: "12%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.07) 0%,transparent 65%)", filter: "blur(40px)", pointerEvents: "none" }} />

        {/* Dot grid */}
        {isDark && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.025, pointerEvents: "none" }}>
            <defs>
              <pattern id="rp-dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="#ff8800" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#rp-dots)" />
          </svg>
        )}
      </div>

      {/* Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 36 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%", maxWidth: 490, position: "relative",
          background: isDark ? "rgba(9,8,16,0.96)" : "rgba(255,255,255,0.97)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
          borderRadius: 26, padding: "38px 38px 34px",
          boxShadow: isDark
            ? "0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,107,0,0.06), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 32px 80px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,107,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Glowing top line */}
        <div style={{ position: "absolute", top: 0, left: "6%", right: "6%", height: 2, background: "linear-gradient(90deg,transparent,rgba(255,90,0,0.75) 25%,rgba(255,220,0,1) 50%,rgba(255,90,0,0.75) 75%,transparent)", borderRadius: "0 0 4px 4px" }} />

        {/* Subtle inner glow */}
        <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 300, height: 120, background: "radial-gradient(ellipse,rgba(255,107,0,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />

        {!success && (
          <>
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: "linear-gradient(135deg,#ff5500,#ffcc00)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 16px rgba(255,100,0,0.5)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff"/></svg>
                </motion.div>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16.5, color: "var(--text)", letterSpacing: "-0.02em" }}>
                  Crowd<span style={{ color: "#ff8800" }}>Spark</span>
                </span>
              </Link>
              <StepProgress step={step} isDark={isDark} />
            </div>

            {/* Step heading */}
            <motion.div
              key={`heading-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{ marginBottom: 26 }}
            >
              <span style={{ fontFamily: "Syne, sans-serif", fontSize: 10.5, fontWeight: 800, color: "#ff8800", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Step {step + 1} of 3
              </span>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 26, color: "var(--text)", letterSpacing: "-0.03em", margin: "6px 0 4px", lineHeight: 1.15 }}>
                {STEP_DATA[step].heading}
              </h1>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.45)", margin: 0 }}>
                {STEP_DATA[step].sub}
              </p>
            </motion.div>
          </>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                padding: "12px 15px", borderRadius: 12,
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.22)",
                marginBottom: 18, color: "#ef4444",
                fontFamily: "DM Sans, sans-serif", fontSize: 13,
                display: "flex", alignItems: "center", gap: 9,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form content */}
        {success ? <SuccessAnim /> : (
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s0"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                >
                  <FInput label="Full Name" value={form.name} onChange={set("name")} autoComplete="name" required isDark={isDark} />
                  <FInput
                    label="Username (3–30 chars)"
                    value={form.username}
                    onChange={v => set("username")(v.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    autoComplete="username" required isDark={isDark} maxLength={30}
                    hint="Only lowercase letters, numbers, underscores"
                  />
                </motion.div>
              )}
              {step === 1 && (
                <motion.div key="s1"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                >
                  <FInput label="Email Address" type="email" value={form.email} onChange={set("email")} autoComplete="email" required isDark={isDark} />
                  <FInput label="Phone Number (optional)" type="tel" value={form.phoneNumber} onChange={set("phoneNumber")} autoComplete="tel" isDark={isDark} hint="+91XXXXXXXXXX or 10-digit number" />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="s2"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                >
                  <FInput label="Password (min 8 chars)" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" required isDark={isDark} />
                  <StrengthBar pw={form.password} />
                  <FInput label="Confirm Password" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" required isDark={isDark} />
                  <AnimatePresence>
                    {form.confirmPassword.length > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                          fontFamily: "DM Sans, sans-serif", fontSize: 12.5,
                          color: form.password === form.confirmPassword ? "#34d399" : "#ef4444",
                          margin: "-10px 0 18px 4px",
                          display: "flex", alignItems: "center", gap: 6,
                          fontWeight: 600,
                        }}
                      >
                        <motion.span
                          animate={{ scale: [1.3, 1] }}
                          transition={{ duration: 0.2 }}
                        >
                          {form.password === form.confirmPassword ? "✓" : "✕"}
                        </motion.span>
                        {form.password === form.confirmPassword ? "Passwords match" : "Passwords don't match"}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              {step > 0 && (
                <motion.button
                  type="button"
                  onClick={() => { setError(null); setStep(s => s - 1); }}
                  whileHover={{ scale: 1.02, borderColor: "rgba(255,136,0,0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: "0 0 auto", padding: "14px 22px",
                    background: "none",
                    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                    borderRadius: 14, fontSize: 14,
                    fontFamily: "DM Sans, sans-serif", fontWeight: 600,
                    color: "var(--text-muted)", cursor: "pointer",
                    transition: "border-color 0.2s",
                    display: "flex", alignItems: "center", gap: 7,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back
                </motion.button>
              )}

              {step < 2 ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.025, boxShadow: "0 0 36px rgba(255,100,0,0.48)" }}
                  whileTap={{ scale: 0.975 }}
                  style={{
                    flex: 1, padding: "14px",
                    background: "linear-gradient(135deg,#ff5500 0%,#ff8800 50%,#ffcc00 100%)",
                    color: "#fff", border: "none", borderRadius: 14,
                    fontSize: 15, fontWeight: 800, fontFamily: "Syne, sans-serif",
                    cursor: "pointer", position: "relative", overflow: "hidden",
                    boxShadow: "0 0 28px rgba(255,100,0,0.38)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                  }}
                >
                  <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 28%,rgba(255,255,255,0.22) 50%,transparent 72%)", animation: "rpShimmer 2.3s ease-in-out infinite" }} />
                  <span style={{ position: "relative" }}>Continue</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={loading || !canSubmit}
                  whileHover={!loading && canSubmit ? { scale: 1.025, boxShadow: "0 0 38px rgba(255,100,0,0.5)" } : {}}
                  whileTap={!loading && canSubmit ? { scale: 0.975 } : {}}
                  style={{
                    flex: 1, padding: "14px",
                    background: canSubmit
                      ? "linear-gradient(135deg,#ff5500 0%,#ff8800 50%,#ffcc00 100%)"
                      : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    color: canSubmit ? "#fff" : "var(--text-muted)",
                    border: "none", borderRadius: 14,
                    fontSize: 15, fontWeight: 800, fontFamily: "Syne, sans-serif",
                    cursor: loading || !canSubmit ? "not-allowed" : "pointer",
                    opacity: loading ? 0.75 : 1,
                    position: "relative", overflow: "hidden",
                    boxShadow: canSubmit && !loading ? "0 0 30px rgba(255,100,0,0.4)" : "none",
                    transition: "all 0.25s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                  }}
                >
                  {canSubmit && <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 28%,rgba(255,255,255,0.22) 50%,transparent 72%)", animation: "rpShimmer 2.3s ease-in-out infinite" }} />}
                  {loading && <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", animation: "rpSpin .7s linear infinite", position: "relative", flexShrink: 0 }} />}
                  <span style={{ position: "relative" }}>{loading ? "Creating account…" : "Create account"}</span>
                  {!loading && canSubmit && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}>
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  )}
                </motion.button>
              )}
            </div>

            <p style={{ textAlign: "center", color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.4)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, margin: "22px 0 0" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#ff8800", fontWeight: 700, textDecoration: "none", letterSpacing: "0.01em" }}>Sign in →</Link>
            </p>
          </form>
        )}
      </motion.div>

      <style>{`
        @keyframes rpShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(220%)} 100%{transform:translateX(220%)} }
        @keyframes rpSpin    { to{transform:rotate(360deg)} }
        @keyframes rpLaser   { 0%{transform:translateX(-200%)} 100%{transform:translateX(400%)} }
      `}</style>
    </div>
  );
}