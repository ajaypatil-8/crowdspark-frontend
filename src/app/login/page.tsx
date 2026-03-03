"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, ApiError } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";
import { useCursor } from "@/hooks/usecursor";
import ThemeToggle from "@/components/ThemeToggle";

const GOOGLE = "http://localhost:8080/crowdspark/oauth2/authorization/google";
const GITHUB  = "http://localhost:8080/crowdspark/oauth2/authorization/github";

type Errors = { identifier?: string; password?: string; general?: string };

/* ── icons ── */
const Arrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const EyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
             a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4
             c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19
             m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const EyeOn = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const Warn = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8"  x2="12"    y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const Ok = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92
      c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77
      c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84
      C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09
      V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15
      C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84
      c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);
const GithubLogo = ({ dark }: { dark: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={dark ? "#e5e7eb" : "#374151"}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387
             .599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416
             -.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729
             1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997
             .107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931
             0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176
             0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803
             c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23
             .653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221
             0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293
             c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12
             c0-6.627-5.373-12-12-12z"/>
  </svg>
);

/* ── label style (outside component) ── */
const LBL: React.CSSProperties = {
  display: "block", fontFamily: "DM Sans, sans-serif",
  fontWeight: 600, fontSize: 11, letterSpacing: "0.18em",
  textTransform: "uppercase", color: "var(--lbl)", marginBottom: 7,
};
const ERR: React.CSSProperties = {
  marginTop: 5, fontSize: 12, color: "#ef4444",
  fontFamily: "DM Sans, sans-serif",
  display: "flex", alignItems: "center", gap: 5,
};

export default function LoginPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { cursorRef, followerRef } = useCursor();

  const [id,        setId]        = useState("");
  const [pw,        setPw]        = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [remember,  setRemember]  = useState(true);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState<Errors>({});
  const [success,   setSuccess]   = useState("");

  const btnClr = isDark ? "#050508" : "#fff";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); setSuccess("");

    const errs: Errors = {};
    if (!id.trim()) errs.identifier = "Email or username is required.";
    if (!pw)        errs.password   = "Password is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await authApi.login({ identifier: id.trim(), password: pw });
      setSuccess("Welcome back!");
      setTimeout(() => router.push("/"), 800);
    } catch (err) {
      const e = err as ApiError;
      if (e.status === 401)
        setErrors({ general: "Invalid credentials." });
      else if (e.status === 400 && e.errors)
        setErrors({ identifier: e.errors["identifier"], password: e.errors["password"] });
      else
        setErrors({ general: e.message || "Something went wrong." });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <div ref={cursorRef}   className="cursor" />
      <div ref={followerRef} className="cursor-follower" />

      {/* static background — no JS, no blur */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="dot-grid" />

      {/* nav */}
      <nav style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "24px 40px 0",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={btnClr} />
            </svg>
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Crowd<span style={{ color: "var(--accent)" }}>Spark</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <Link href="/register" className="link-accent" style={{
            fontSize: 13, padding: "9px 20px", borderRadius: 999,
            border: "1px solid var(--accent-dim)", background: "var(--accent-dim)",
            fontFamily: "DM Sans, sans-serif", fontWeight: 500, textDecoration: "none",
          }}>
            Create account
          </Link>
        </div>
      </nav>

      {/* content — ONE motion wrapper, not ten */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "40px 16px",
        position: "relative", zIndex: 10,
      }}>
        <motion.div
          style={{ width: "100%", maxWidth: 460 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* title */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <p style={{
              fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11,
              letterSpacing: "0.26em", textTransform: "uppercase",
              color: "var(--accent)", marginBottom: 10,
            }}>
              Welcome back
            </p>
            <h1 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800,
              fontSize: 44, lineHeight: 1.08,
              color: "var(--text)", letterSpacing: "-0.02em",
            }}>
              Sign in to{" "}
              <span style={{ color: "var(--accent)", textShadow: "var(--accent-ts)" }}>
                CrowdSpark
              </span>
            </h1>
          </div>

          {/* oauth */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => { window.location.href = GOOGLE; }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, padding: "13px 0", borderRadius: 12,
                background: "var(--bg-ghost)", border: "1px solid var(--border)",
                color: "var(--text)", fontFamily: "DM Sans, sans-serif",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <GoogleLogo /> Google
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => { window.location.href = GITHUB; }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, padding: "13px 0", borderRadius: 12,
                background: "var(--bg-ghost)", border: "1px solid var(--border)",
                color: "var(--text)", fontFamily: "DM Sans, sans-serif",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <GithubLogo dark={isDark} /> GitHub
            </button>
          </div>

          {/* divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
              or with email
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* card — solid bg, no backdropFilter */}
          <div className="auth-card">
            <div className="card-shimmer" />

            {/* banners */}
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.28)",
                    borderRadius: 10, padding: "11px 14px", marginBottom: 18,
                    fontSize: 13, color: "#ef4444",
                    fontFamily: "DM Sans, sans-serif",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <Warn /> {errors.general}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: "var(--accent-dim)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 10, padding: "11px 14px", marginBottom: 18,
                    fontSize: 13, color: "var(--accent)",
                    fontFamily: "DM Sans, sans-serif",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <Ok /> {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={submit}>
              {/* identifier */}
              <div style={{ marginBottom: 18 }}>
                <label style={LBL}>Email or Username</label>
                <input
                  type="text" value={id}
                  placeholder="you@example.com or @username"
                  autoComplete="username" className="auth-input"
                  style={{ padding: "13px 16px", borderRadius: 11, borderColor: errors.identifier ? "#ef4444" : undefined }}
                  onChange={e => { setId(e.target.value); setErrors(p => ({ ...p, identifier: undefined, general: undefined })); }}
                />
                {errors.identifier && <div style={ERR}><Warn />{errors.identifier}</div>}
              </div>

              {/* password */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label style={{ ...LBL, marginBottom: 0 }}>Password</label>
                  <Link href="/forgot-password" className="link-accent"
                    style={{ fontSize: 12, textDecoration: "none", fontFamily: "DM Sans, sans-serif" }}>
                    Forgot?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"} value={pw}
                    placeholder="••••••••" autoComplete="current-password"
                    className="auth-input"
                    style={{ padding: "13px 44px 13px 16px", borderRadius: 11, borderColor: errors.password ? "#ef4444" : undefined }}
                    onChange={e => { setPw(e.target.value); setErrors(p => ({ ...p, password: undefined, general: undefined })); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{
                      position: "absolute", right: 13, top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: showPw ? "var(--accent)" : "var(--text-ph)",
                      display: "flex", padding: 0,
                    }}
                  >
                    {showPw ? <EyeOff /> : <EyeOn />}
                  </button>
                </div>
                {errors.password && <div style={ERR}><Warn />{errors.password}</div>}
              </div>

              {/* remember */}
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 22 }}>
                <button
                  type="button"
                  onClick={() => setRemember(v => !v)}
                  style={{
                    width: 19, height: 19, borderRadius: 5, padding: 0,
                    border: `1px solid ${remember ? "var(--accent)" : "var(--border)"}`,
                    background: remember ? "var(--accent-dim)" : "var(--bg-input)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", flexShrink: 0,
                  }}
                >
                  {remember && (
                    <svg width="9" height="8" viewBox="0 0 9 8" fill="none">
                      <path d="M1 4l2.5 3 5-6" stroke="var(--accent)"
                        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span style={{ fontSize: 13, color: "var(--text-sub)", fontFamily: "DM Sans, sans-serif" }}>
                  Keep me signed in
                </span>
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: "100%", padding: "15px 0", borderRadius: 11, border: "none",
                  background: "linear-gradient(135deg, var(--accent), var(--accent-h))",
                  color: btnClr, fontFamily: "Syne, sans-serif",
                  fontWeight: 700, fontSize: 14, letterSpacing: "0.04em",
                  boxShadow: "var(--btn-shadow)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {loading
                  ? <><div className="spinner" style={{ borderTopColor: btnClr }} /> Signing in...</>
                  : <>Sign in <Arrow /></>
                }
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 22, fontFamily: "DM Sans, sans-serif" }}>
              No account?{" "}
              <Link href="/register" className="link-accent" style={{ fontWeight: 500, textDecoration: "none" }}>
                Create one free →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}