"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, ApiError } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";
import { useCursor } from "@/hooks/usecursor";
import ThemeToggle from "@/components/ThemeToggle";

/* ══════════════════════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════════════════════ */
const GOOGLE_URL =
  process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL ||
  "http://localhost:8080/crowdspark/oauth2/authorization/google";
const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_OAUTH_URL ||
  "http://localhost:8080/crowdspark/oauth2/authorization/github";

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
type Errors = {
  identifier?: string;
  password?: string;
  general?: string;
};

/* ══════════════════════════════════════════════════════════════
   ICONS (static — no state, so no re-renders)
══════════════════════════════════════════════════════════════ */
const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
             a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4
             c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19
             m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const EyeOnIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const WarnIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const OkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92
      c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77
      c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84
      C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09
      V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15
      C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84
      c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GithubLogo = ({ dark }: { dark: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24"
    fill={dark ? "#e5e7eb" : "#374151"}>
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
             c0-6.627-5.373-12-12-12z" />
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════════════════════════════ */
const LBL: React.CSSProperties = {
  display: "block",
  fontFamily: "DM Sans, sans-serif",
  fontWeight: 600,
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--lbl)",
  marginBottom: 7,
};

const ERR_STYLE: React.CSSProperties = {
  marginTop: 5,
  fontSize: 12,
  color: "#ef4444",
  fontFamily: "DM Sans, sans-serif",
  display: "flex",
  alignItems: "center",
  gap: 5,
};

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { cursorRef, followerRef } = useCursor();

  const [id, setId]           = useState("");
  const [pw, setPw]           = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Errors>({});
  const [success, setSuccess] = useState("");

  const btnClr = isDark ? "#050508" : "#fff";

  /* ── clear a specific field error ── */
  const clearError = (field: keyof Errors) => {
    setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
  };

  /* ── form submission ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    // client-side validation
    const errs: Errors = {};
    if (!id.trim()) errs.identifier = "Email or username is required.";
    if (!pw.trim()) errs.password = "Password is required.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await authApi.login({
        identifier: id.trim(),
        password: pw,
      });
      setSuccess("Welcome back!");
      setTimeout(() => router.push("/"), 800);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401) {
        setErrors({ general: "Invalid credentials." });
      } else if (apiErr.status === 400 && apiErr.errors) {
        setErrors({
          identifier: apiErr.errors["identifier"],
          password: apiErr.errors["password"],
        });
      } else {
        setErrors({ general: apiErr.message || "Something went wrong." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column",
    }}>
      <div ref={cursorRef} className="cursor" />
      <div ref={followerRef} className="cursor-follower" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="dot-grid" />

      {/* ═══════════════════ NAV ═══════════════════ */}
      <nav className="login-nav" style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "24px 40px 0",
      }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 10,
          textDecoration: "none",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={btnClr} />
            </svg>
          </div>
          <span style={{
            fontFamily: "Syne, sans-serif", fontWeight: 700,
            fontSize: 20, color: "var(--text)", letterSpacing: "-0.02em",
          }}>
            Crowd<span style={{ color: "var(--accent)" }}>Spark</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <Link href="/register" className="link-accent" style={{
            fontSize: 13, padding: "9px 20px", borderRadius: 999,
            border: "1px solid var(--accent-dim)",
            background: "var(--accent-dim)",
            fontFamily: "DM Sans, sans-serif", fontWeight: 500,
            textDecoration: "none",
          }}>
            Create account
          </Link>
        </div>
      </nav>

      {/* ═══════════════════ CONTENT ═══════════════════ */}
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
          {/* ── heading ── */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <p style={{
              fontFamily: "DM Sans, sans-serif", fontWeight: 600,
              fontSize: 11, letterSpacing: "0.26em",
              textTransform: "uppercase", color: "var(--accent)",
              marginBottom: 10,
            }}>
              Welcome back
            </p>
            <h1 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800,
              fontSize: "clamp(32px, 5vw, 44px)", lineHeight: 1.08,
              color: "var(--text)", letterSpacing: "-0.02em",
            }}>
              Sign in to{" "}
              <span style={{
                color: "var(--accent)",
                textShadow: "0 0 40px rgba(0,245,212,0.3)",
              }}>
                CrowdSpark
              </span>
            </h1>
          </div>

          {/* ── OAuth buttons ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 12, marginBottom: 20,
          }}>
            <button
              type="button"
              className="login-oauth-btn"
              onClick={() => { window.location.href = GOOGLE_URL; }}
            >
              <GoogleLogo /> Google
            </button>
            <button
              type="button"
              className="login-oauth-btn"
              onClick={() => { window.location.href = GITHUB_URL; }}
            >
              <GithubLogo dark={isDark} /> GitHub
            </button>
          </div>

          {/* ── divider ── */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            marginBottom: 20,
          }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{
              fontSize: 12, color: "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif",
            }}>
              or with email
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* ── auth card ── */}
          <div className="auth-card">
            <div className="card-shimmer" />

            {/* banners */}
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  key="error-banner"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="login-banner login-banner-error"
                >
                  <WarnIcon /> {errors.general}
                </motion.div>
              )}
              {success && (
                <motion.div
                  key="success-banner"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="login-banner login-banner-success"
                >
                  <OkIcon /> {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate>
              {/* identifier field */}
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="login-id" style={LBL}>
                  Email or Username
                </label>
                <input
                  id="login-id"
                  type="text"
                  value={id}
                  placeholder="you@example.com or @username"
                  autoComplete="username"
                  className="auth-input"
                  style={{
                    borderColor: errors.identifier ? "#ef4444" : undefined,
                  }}
                  onChange={e => {
                    setId(e.target.value);
                    clearError("identifier");
                  }}
                />
                {errors.identifier && (
                  <div style={ERR_STYLE}>
                    <WarnIcon />{errors.identifier}
                  </div>
                )}
              </div>

              {/* password field */}
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 7,
                }}>
                  <label htmlFor="login-pw" style={{ ...LBL, marginBottom: 0 }}>
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="link-accent"
                    style={{
                      fontSize: 12, textDecoration: "none",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Forgot?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    id="login-pw"
                    type={showPw ? "text" : "password"}
                    value={pw}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="auth-input"
                    style={{
                      paddingRight: 44,
                      borderColor: errors.password ? "#ef4444" : undefined,
                    }}
                    onChange={e => {
                      setPw(e.target.value);
                      clearError("password");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute", right: 13, top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none",
                      cursor: "pointer",
                      color: showPw ? "var(--accent)" : "var(--text-ph)",
                      display: "flex", padding: 0,
                    }}
                  >
                    {showPw ? <EyeOffIcon /> : <EyeOnIcon />}
                  </button>
                </div>
                {errors.password && (
                  <div style={ERR_STYLE}>
                    <WarnIcon />{errors.password}
                  </div>
                )}
              </div>

              {/* remember me */}
              <div style={{
                display: "flex", alignItems: "center", gap: 9,
                marginBottom: 22,
              }}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={remember}
                  aria-label="Keep me signed in"
                  onClick={() => setRemember(v => !v)}
                  className="login-checkbox"
                  style={{
                    borderColor: remember ? "var(--accent)" : "var(--border)",
                    background: remember ? "var(--accent-dim)" : "var(--bg-input)",
                  }}
                >
                  {remember && (
                    <svg width="9" height="8" viewBox="0 0 9 8" fill="none">
                      <path d="M1 4l2.5 3 5-6" stroke="var(--accent)"
                        strokeWidth="1.6" strokeLinecap="round"
                        strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span style={{
                  fontSize: 13, color: "var(--text-sub)",
                  fontFamily: "DM Sans, sans-serif",
                }}>
                  Keep me signed in
                </span>
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary login-submit"
              >
                {loading ? (
                  <>
                    <div className="spinner"
                      style={{ borderTopColor: btnClr }} />
                    Signing in…
                  </>
                ) : (
                  <>Sign in <ArrowIcon /></>
                )}
              </button>
            </form>

            <p style={{
              textAlign: "center", fontSize: 13,
              color: "var(--text-muted)", marginTop: 22,
              fontFamily: "DM Sans, sans-serif",
            }}>
              No account?{" "}
              <Link href="/register" className="link-accent"
                style={{ fontWeight: 500, textDecoration: "none" }}>
                Create one free →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════ SCOPED STYLES ═══════════════════ */}
      <style>{`
        /* ── OAuth buttons ─────────────────────────── */
        .login-oauth-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; padding: 13px 0; border-radius: 12px;
          background: var(--bg-ghost);
          border: 1px solid var(--border);
          color: var(--text);
          font-family: "DM Sans", sans-serif;
          font-size: 13px; font-weight: 600;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .login-oauth-btn:hover {
          border-color: var(--accent);
          background: var(--accent-dim);
        }
        .login-oauth-btn:active {
          transform: scale(0.98);
        }

        /* ── banners ───────────────────────────────── */
        .login-banner {
          border-radius: 10px; padding: 11px 14px;
          margin-bottom: 18px; font-size: 13px;
          font-family: "DM Sans", sans-serif;
          display: flex; align-items: center; gap: 8px;
          overflow: hidden;
        }
        .login-banner-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.28);
          color: #ef4444;
        }
        .login-banner-success {
          background: var(--accent-dim);
          border: 1px solid var(--card-border);
          color: var(--accent);
        }

        /* ── checkbox ──────────────────────────────── */
        .login-checkbox {
          width: 19px; height: 19px; border-radius: 5px;
          padding: 0; flex-shrink: 0;
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .login-checkbox:hover {
          border-color: var(--accent);
        }

        /* ── submit button ─────────────────────────── */
        .login-submit {
          width: 100%; padding: 15px 0; border-radius: 11px;
          border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent-h));
          color: ${btnClr};
          font-family: "Syne", sans-serif;
          font-weight: 700; font-size: 14px; letter-spacing: 0.04em;
          box-shadow: var(--btn-shadow);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 8px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .login-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px var(--accent-glow);
        }
        .login-submit:disabled {
          opacity: 0.7; cursor: not-allowed;
        }

        /* ── nav responsive ────────────────────────── */
        @media (max-width: 600px) {
          .login-nav {
            padding: 16px 20px 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

