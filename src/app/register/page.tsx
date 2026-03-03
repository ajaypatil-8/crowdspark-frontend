"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, ApiError } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";
import { useCursor } from "@/hooks/usecursor";
import ThemeToggle from "@/components/ThemeToggle";

const GOOGLE  = "http://localhost:8080/crowdspark/oauth2/authorization/google";
const GITHUB  = "http://localhost:8080/crowdspark/oauth2/authorization/github";
const PHONE_RE = /^(\+91)?[6-9]\d{9}$/;

interface Form {
  email: string; password: string; confirm: string;
  username: string; name: string; phone: string;
}
interface Errs {
  email?: string; password?: string; confirm?: string;
  username?: string; name?: string; phone?: string; general?: string;
}

/* ── icons ── */
const Arrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const Warn = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8"  x2="12"    y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
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
const Tick = ({ color }: { color: string }) => (
  <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
    <path d="M1 4.5l3 3 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
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
  <svg width="16" height="16" viewBox="0 0 24 24" fill={dark ? "#e5e7eb" : "#374151"}>
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

const LBL: React.CSSProperties = {
  display: "block", fontFamily: "DM Sans, sans-serif",
  fontWeight: 600, fontSize: 11, letterSpacing: "0.18em",
  textTransform: "uppercase", color: "var(--lbl)", marginBottom: 7,
};
const ERR: React.CSSProperties = {
  marginTop: 5, fontSize: 12, color: "#ef4444",
  fontFamily: "DM Sans, sans-serif",
  display: "flex", alignItems: "flex-start", gap: 5, lineHeight: 1.4,
};

export default function RegisterPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { cursorRef, followerRef } = useCursor();

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const [form,  setForm]  = useState<Form>({ email: "", password: "", confirm: "", username: "", name: "", phone: "" });
  const [errs,  setErrs]  = useState<Errs>({});

  const set = (k: keyof Form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrs(e => ({ ...e, [k]: undefined, general: undefined }));
  };

  const pwStr = form.password.length === 0 ? 0
    : form.password.length < 5  ? 1
    : form.password.length < 8  ? 2
    : form.password.length < 12 ? 3 : 4;
  const pwLbl = ["","Weak","Fair","Good","Strong"][pwStr];
  const pwClr = ["","#ef4444","#f59e0b","#3b82f6","var(--accent)"][pwStr];

  const btnClr = isDark ? "#050508" : "#fff";

  const v1 = () => {
    const e: Errs = {};
    if (!form.email.trim())
      e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email.";
    if (!form.password)
      e.password = "Password is required.";
    else if (form.password.length < 8)
      e.password = "Min 8 characters.";
    if (!form.confirm)
      e.confirm = "Please confirm your password.";
    else if (form.password !== form.confirm)
      e.confirm = "Passwords do not match.";
    setErrs(e); return Object.keys(e).length === 0;
  };

  const v2 = () => {
    const e: Errs = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.username.trim()) e.username = "Username is required.";
    else if (form.username.length < 3 || form.username.length > 30)
      e.username = "3–30 characters.";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      e.username = "Letters, numbers, underscores only.";
    if (form.phone && !PHONE_RE.test(form.phone))
      e.phone = "Valid Indian mobile number required.";
    setErrs(e); return Object.keys(e).length === 0;
  };

  const next = () => { if (v1()) setStep(2); };

  const submit = async () => {
    if (!v2()) return;
    setLoading(true);
    try {
      await authApi.register({
        email: form.email.trim(), password: form.password,
        username: form.username.trim(), name: form.name.trim(),
        ...(form.phone ? { phoneNumber: form.phone.trim() } : {}),
      });
      setDone(true); setStep(3);
    } catch (err) {
      const e = err as ApiError;
      if (e.status === 409) {
        const msg = (e.message || "").toLowerCase();
        if (msg.includes("email"))    { setErrs({ email: "Email already registered." }); setStep(1); }
        else if (msg.includes("username")) setErrs({ username: "Username taken." });
        else setErrs({ general: e.message });
      } else if (e.status === 400 && e.errors) {
        setErrs({ email: e.errors["email"], password: e.errors["password"], username: e.errors["username"], name: e.errors["name"], phone: e.errors["phoneNumber"] });
        setStep(1);
      } else { setErrs({ general: e.message || "Registration failed." }); }
    } finally { setLoading(false); }
  };

  const slide = {
    enter:  (d: number) => ({ x: d * 32, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d * -32, opacity: 0 }),
  };

  const oauthStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 9, padding: "13px 0", borderRadius: 12,
    background: "var(--bg-ghost)", border: "1px solid var(--border)",
    color: "var(--text)", fontFamily: "DM Sans, sans-serif",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
  };

  const primaryStyle: React.CSSProperties = {
    padding: "15px 0", borderRadius: 11, border: "none",
    background: "linear-gradient(135deg, var(--accent), var(--accent-h))",
    color: btnClr, fontFamily: "Syne, sans-serif",
    fontWeight: 700, fontSize: 14, letterSpacing: "0.04em",
    boxShadow: "var(--btn-shadow)", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <div ref={cursorRef}   className="cursor" />
      <div ref={followerRef} className="cursor-follower" />

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
            width: 34, height: 34, borderRadius: 10, background: "var(--accent)",
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
          <Link href="/login" className="link-accent" style={{
            fontSize: 13, padding: "9px 20px", borderRadius: 999,
            border: "1px solid var(--accent-dim)", background: "var(--accent-dim)",
            fontFamily: "DM Sans, sans-serif", fontWeight: 500, textDecoration: "none",
          }}>
            Sign in
          </Link>
        </div>
      </nav>

      {/* content — single motion wrapper */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "36px 16px",
        position: "relative", zIndex: 10,
      }}>
        <motion.div
          style={{ width: "100%", maxWidth: 480 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {!done && (
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <p style={{
                fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11,
                letterSpacing: "0.26em", textTransform: "uppercase",
                color: "var(--accent)", marginBottom: 10,
              }}>
                {step === 1 ? "Free forever · No credit card" : "Almost done"}
              </p>
              <h1 style={{
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: 42, lineHeight: 1.08,
                color: "var(--text)", letterSpacing: "-0.02em",
              }}>
                {step === 1 ? (
                  <>Create your <span style={{ color: "var(--accent)", textShadow: "var(--accent-ts)" }}>account</span></>
                ) : (
                  <>Your <span style={{ color: "var(--accent)", textShadow: "var(--accent-ts)" }}>profile</span></>
                )}
              </h1>
            </div>
          )}

          <div className="auth-card">
            <div className="card-shimmer" />

            {/* progress */}
            {!done && (
              <div style={{ display: "flex", alignItems: "center", marginBottom: 22 }}>
                {[1,2].map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 1 ? 1 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: step > s ? "var(--accent)" : step === s ? "var(--accent-dim)" : "var(--bg-input)",
                        border: `1.5px solid ${step >= s ? "var(--accent)" : "var(--border)"}`,
                        color: step > s ? btnClr : step === s ? "var(--accent)" : "var(--text-muted)",
                        fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12,
                        transition: "background 0.25s, border-color 0.25s",
                      }}>
                        {step > s ? <Tick color={btnClr} /> : s}
                      </div>
                      <span style={{ fontSize: 12, fontFamily: "DM Sans, sans-serif", fontWeight: 500, color: step >= s ? "var(--text)" : "var(--text-muted)" }}>
                        {s === 1 ? "Credentials" : "Profile"}
                      </span>
                    </div>
                    {i < 1 && (
                      <div style={{ flex: 1, height: 1, margin: "0 10px", background: "var(--border)", overflow: "hidden", position: "relative" }}>
                        <motion.div
                          animate={{ width: step > 1 ? "100%" : "0%" }}
                          transition={{ duration: 0.35 }}
                          style={{ height: "100%", background: "var(--accent)", position: "absolute", left: 0 }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* error */}
            <AnimatePresence>
              {errs.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)",
                    borderRadius: 10, padding: "11px 14px", marginBottom: 16,
                    fontSize: 13, color: "#ef4444",
                    fontFamily: "DM Sans, sans-serif",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <Warn /> {errs.general}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait" custom={step}>

              {/* success */}
              {done ? (
                <motion.div key="done"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.34, 1.4, 0.64, 1] }}
                  style={{ textAlign: "center", padding: "20px 0" }}
                >
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    margin: "0 auto 20px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent)",
                    boxShadow: "0 0 30px var(--accent-glow)",
                  }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                      stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, color: "var(--text)", marginBottom: 10 }}>
                    Account created! 🎉
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 6, fontFamily: "DM Sans, sans-serif", lineHeight: 1.6 }}>
                    Welcome, <strong style={{ color: "var(--text)" }}>{form.name || form.username}</strong>!
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 28, fontFamily: "DM Sans, sans-serif" }}>
                    Check your inbox then sign in.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => router.push("/login")}
                    style={{ ...primaryStyle, display: "inline-flex", width: "auto", padding: "14px 28px" }}
                  >
                    Go to Sign in <Arrow />
                  </button>
                </motion.div>

              ) : step === 1 ? (
                /* step 1 */
                <motion.div key="s1" custom={1} variants={slide}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    <button type="button" className="btn-ghost" style={oauthStyle}
                      onClick={() => { window.location.href = GOOGLE; }}>
                      <GoogleLogo /> Google
                    </button>
                    <button type="button" className="btn-ghost" style={oauthStyle}
                      onClick={() => { window.location.href = GITHUB; }}>
                      <GithubLogo dark={isDark} /> GitHub
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>or with email</span>
                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={LBL}>Email address</label>
                    <input type="email" value={form.email} placeholder="you@example.com"
                      autoComplete="email" className="auth-input"
                      style={{ padding: "13px 16px", borderRadius: 11, borderColor: errs.email ? "#ef4444" : undefined }}
                      onChange={e => set("email", e.target.value)} />
                    {errs.email && <div style={ERR}><Warn />{errs.email}</div>}
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={LBL}>Password</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPw ? "text" : "password"} value={form.password}
                        placeholder="Min 8 characters" autoComplete="new-password"
                        className="auth-input"
                        style={{ padding: "13px 42px 13px 16px", borderRadius: 11, borderColor: errs.password ? "#ef4444" : undefined }}
                        onChange={e => set("password", e.target.value)} />
                      <button type="button"
                        onClick={() => setShowPw(v => !v)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: showPw ? "var(--accent)" : "var(--text-ph)", display: "flex", padding: 0 }}>
                        {showPw ? <EyeOff /> : <EyeOn />}
                      </button>
                    </div>
                    {form.password && (
                      <div style={{ marginTop: 7 }}>
                        <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
                          {[1,2,3,4].map(i => (
                            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStr ? pwClr : "var(--border)", transition: "background 0.2s" }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 11, color: pwClr, fontFamily: "DM Sans, sans-serif" }}>{pwLbl} password</span>
                      </div>
                    )}
                    {errs.password && <div style={ERR}><Warn />{errs.password}</div>}
                  </div>

                  <div style={{ marginBottom: 22 }}>
                    <label style={LBL}>Confirm password</label>
                    <div style={{ position: "relative" }}>
                      <input type="password" value={form.confirm}
                        placeholder="Repeat your password" autoComplete="new-password"
                        className="auth-input"
                        style={{ padding: "13px 42px 13px 16px", borderRadius: 11, borderColor: errs.confirm ? "#ef4444" : undefined }}
                        onChange={e => set("confirm", e.target.value)} />
                      {form.confirm && (
                        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
                          {form.confirm === form.password
                            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          }
                        </div>
                      )}
                    </div>
                    {errs.confirm && <div style={ERR}><Warn />{errs.confirm}</div>}
                  </div>

                  <button type="button" className="btn-primary"
                    style={{ ...primaryStyle, width: "100%" }}
                    onClick={next}>
                    Continue <Arrow />
                  </button>
                </motion.div>

              ) : (
                /* step 2 */
                <motion.div key="s2" custom={2} variants={slide}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    <div>
                      <label style={LBL}>Full name</label>
                      <input type="text" value={form.name} placeholder="Jane Smith"
                        className="auth-input"
                        style={{ padding: "13px 16px", borderRadius: 11, borderColor: errs.name ? "#ef4444" : undefined }}
                        onChange={e => set("name", e.target.value)} />
                      {errs.name && <div style={ERR}><Warn />{errs.name}</div>}
                    </div>
                    <div>
                      <label style={LBL}>Username</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>@</span>
                        <input type="text" value={form.username} placeholder="janesmith"
                          className="auth-input"
                          style={{ padding: "13px 13px 13px 24px", borderRadius: 11, borderColor: errs.username ? "#ef4444" : undefined }}
                          onChange={e => set("username", e.target.value.toLowerCase())} />
                      </div>
                      {errs.username && <div style={ERR}><Warn />{errs.username}</div>}
                    </div>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={LBL}>
                      Phone{" "}
                      <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400, color: "var(--text-muted)", fontSize: 10 }}>
                        (optional · Indian)
                      </span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none" }}>🇮🇳</span>
                      <input type="tel" value={form.phone} placeholder="+91 98765 43210"
                        className="auth-input"
                        style={{ padding: "13px 13px 13px 36px", borderRadius: 11, borderColor: errs.phone ? "#ef4444" : undefined }}
                        onChange={e => set("phone", e.target.value)} />
                    </div>
                    {errs.phone && <div style={ERR}><Warn />{errs.phone}</div>}
                  </div>

                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    marginBottom: 22, padding: "11px 13px",
                    borderRadius: 10, background: "var(--accent-dim)",
                    border: "1px solid var(--card-border)",
                  }}>
                    <svg style={{ flexShrink: 0, marginTop: 1 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span style={{ fontSize: 12, color: "var(--text-sub)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.5 }}>
                      By registering you agree to our{" "}
                      <span style={{ color: "var(--accent)", cursor: "pointer" }}>Terms</span> and{" "}
                      <span style={{ color: "var(--accent)", cursor: "pointer" }}>Privacy Policy</span>.{" "}
                      Default role: <strong style={{ color: "var(--accent)" }}>Backer</strong>.
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" className="btn-outline"
                      style={{
                        flex: 1, padding: "15px 0", borderRadius: 11,
                        border: "1px solid var(--border)", background: "var(--bg-ghost)",
                        color: "var(--text-muted)", fontFamily: "Syne, sans-serif",
                        fontWeight: 600, fontSize: 14, cursor: "pointer",
                      }}
                      onClick={() => setStep(1)}>
                      ← Back
                    </button>
                    <button type="button" className="btn-primary"
                      disabled={loading}
                      style={{ ...primaryStyle, flex: 2, boxShadow: loading ? "none" : "var(--btn-shadow)" }}
                      onClick={submit}>
                      {loading
                        ? <><div className="spinner" style={{ borderTopColor: btnClr }} /> Creating...</>
                        : <>Create Account <Arrow /></>
                      }
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!done && (
              <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 20, fontFamily: "DM Sans, sans-serif" }}>
                Already have an account?{" "}
                <Link href="/login" className="link-accent" style={{ fontWeight: 500, textDecoration: "none" }}>
                  Sign in →
                </Link>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}