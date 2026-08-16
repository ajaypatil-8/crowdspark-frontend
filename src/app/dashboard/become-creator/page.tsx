"use client";
import { useState, useRef, useCallback, useEffect, useMemo, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { creatorApi, API_BASE_URL as BASE, type KycSubmitRequest, type UserResponse } from "@/lib/api";
import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/contexts/ThemeContext";

// ─────────────────────────────────────────────────────────────────────────────
// ROOT FIX: safeRefreshToken & textPost bypass request<T>() entirely.
// request<T>() has a side-effect: window.location.href="/login" on 401 fires
// BEFORE the surrounding try/catch, causing the redirect to login bug.
// ─────────────────────────────────────────────────────────────────────────────

async function safeRefreshToken(): Promise<void> {
  if (typeof window === "undefined") return;
  const rt = localStorage.getItem("cs_refresh");
  if (!rt) return;
  try {
    const res = await fetch(
      `${BASE}/auth/refresh?refreshToken=${encodeURIComponent(rt)}`,
      { method: "POST" }
    );
    if (res.ok) {
      const d = await res.json();
      if (d.accessToken)  localStorage.setItem("cs_access",  d.accessToken);
      if (d.refreshToken) localStorage.setItem("cs_refresh", d.refreshToken);
    }
  } catch { /* silently ignore */ }
}

async function textPost(path: string, body?: object): Promise<string> {
  if (typeof window === "undefined") return "";
  const token = localStorage.getItem("cs_access");
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) {
    try { const j = JSON.parse(text); throw new Error(j.message || j.error || `Error ${res.status}`); }
    catch (e) { if (e instanceof SyntaxError) throw new Error(text || `Error ${res.status}`); throw e; }
  }
  return text;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type WizardStep = "start" | "otp-sent" | "docs" | "submitted";
type KycStatus  = "NOT_SUBMITTED" | "PENDING_SUBMISSION" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
type UserKycDetails = UserResponse & { kycRejectionReason?: string | null };

interface DocUpload {
  url: string; publicId: string; name: string; preview: string | null; size: number;
}

// ─── Icons as proper React components (fixes JSX prop error) ─────────────────
function IcMail({ size = 22 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function IcCheck({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IcUpload({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>;
}
function IcShield({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function IcZap({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function IcClock({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IcCircleOk({ size = 30 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function IcAlert({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function IcFile({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function IcArrow({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
}

// ─── Animated canvas background ───────────────────────────────────────────────
function KycCanvas({ isDark }: { isDark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => { c.width = c.offsetWidth * dpr; c.height = c.offsetHeight * dpr; ctx.scale(dpr, dpr); };
    resize();
    window.addEventListener("resize", resize);

    type Orb = { x: number; y: number; r: number; vx: number; vy: number; hue: number; a: number };
    const orbs: Orb[] = [
      { x: 0.15, y: 0.3,  r: 0.32, vx:  0.0003, vy:  0.0002, hue: 22,  a: isDark ? 0.08 : 0.06 },
      { x: 0.80, y: 0.65, r: 0.26, vx: -0.0002, vy:  0.0003, hue: 45,  a: isDark ? 0.06 : 0.04 },
      { x: 0.5,  y: 0.15, r: 0.20, vx:  0.0002, vy: -0.0003, hue: 260, a: isDark ? 0.05 : 0.03 },
    ];

    type Spark = { x: number; y: number; vx: number; vy: number; life: number; ml: number; r: number; hue: number };
    const sparks: Spark[] = [];
    let frame = 0, raf: number;
    const W = () => c.offsetWidth, H = () => c.offsetHeight;

    const tick = () => {
      raf = requestAnimationFrame(tick); frame++;
      ctx.clearRect(0, 0, W(), H());
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -0.1 || o.x > 1.1) o.vx *= -1;
        if (o.y < -0.1 || o.y > 1.1) o.vy *= -1;
        const gx = o.x * W(), gy = o.y * H(), gr = o.r * Math.min(W(), H());
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        g.addColorStop(0, `hsla(${o.hue},80%,55%,${o.a})`); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.fill();
      });
      if (frame % 4 === 0) sparks.push({ x: W() * 0.5 + (Math.random() - 0.5) * W() * 0.3, y: H() * 1.05, vx: (Math.random() - 0.5) * 1.1, vy: -(0.8 + Math.random() * 2.2), life: 0, ml: 60 + Math.random() * 80, r: 1.2 + Math.random() * 2.5, hue: 10 + Math.random() * 38 });
      ctx.save();
      for (let k = sparks.length - 1; k >= 0; k--) {
        const s = sparks[k]; s.x += s.vx; s.y += s.vy; s.vy *= 0.991; s.life++;
        if (s.life >= s.ml || s.y < -20) { sparks.splice(k, 1); continue; }
        const t = s.life / s.ml; const a = Math.sin(t * Math.PI) * 0.75; const sr = s.r * (1 - t * 0.55);
        const sg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, sr * 3);
        sg.addColorStop(0, `hsla(${s.hue},100%,65%,${a})`); sg.addColorStop(1, "transparent");
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(s.x, s.y, sr * 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [isDark]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.7 }} />;
}

// ─── Step progress indicator ───────────────────────────────────────────────────
const STEP_DEFS = [
  { label: "Verify Email",    desc: "Confirm identity" },
  { label: "Enter OTP",       desc: "6-digit code" },
  { label: "Upload Docs",     desc: "PAN & Aadhaar" },
  { label: "KYC Details",     desc: "Bank & UPI" },
];

function StepProgress({ current }: { current: number }) {
  const { isDark } = useTheme();
  return (
    <div style={{ position: "relative", marginBottom: 40 }}>
      {/* Connector track */}
      <div style={{ position: "absolute", top: 16, left: "calc(12.5%)", right: "calc(12.5%)", height: 2, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: 1, zIndex: 0 }} />
      {/* Filled track */}
      <motion.div
        animate={{ width: `${(current / (STEP_DEFS.length - 1)) * 75}%` }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ position: "absolute", top: 16, left: "calc(12.5%)", height: 2, background: "linear-gradient(90deg,#ff5500,#ffcc00)", borderRadius: 1, zIndex: 1 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
        {STEP_DEFS.map((s, i) => {
          const done   = i < current;
          const active = i === current;
          return (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
              {/* Pulse ring */}
              <div style={{ position: "relative" }}>
                {active && (
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "1.5px solid rgba(255,107,0,0.5)" }}
                  />
                )}
                <motion.div
                  animate={{
                    background: done ? "#34d399" : active ? "linear-gradient(135deg,#ff5500,#ffcc00)" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                    scale: active ? 1.15 : 1,
                    boxShadow: active ? "0 0 20px rgba(255,107,0,0.45)" : done ? "0 0 12px rgba(52,211,153,0.3)" : "none",
                  }}
                  transition={{ duration: 0.35 }}
                  style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: done || active ? "#fff" : isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 12 }}
                >
                  {done ? <IcCheck size={14} /> : i + 1}
                </motion.div>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "Syne, sans-serif", fontSize: 11, fontWeight: active ? 800 : 600, color: active ? "var(--text)" : done ? "#34d399" : "var(--text-muted)", margin: "0 0 2px", transition: "color 0.3s" }}>
                  {s.label}
                </p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 9.5, color: "var(--text-muted)", margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Glass card ───────────────────────────────────────────────────────────────
function GlassCard({ children, delay = 0, accentColor = "#ff8800", noPad = false }: {
  children: React.ReactNode; delay?: number; accentColor?: string; noPad?: boolean;
}) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: isDark ? "rgba(10,8,18,0.85)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        borderRadius: 22, padding: noPad ? 0 : 28,
        boxShadow: isDark
          ? `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px ${accentColor}14, inset 0 1px 0 rgba(255,255,255,0.05)`
          : `0 16px 48px rgba(0,0,0,0.08), 0 0 0 1px ${accentColor}10, inset 0 1px 0 rgba(255,255,255,0.9)`,
        marginBottom: 16, position: "relative", overflow: "hidden",
      }}
    >
      {/* Top accent glow line */}
      <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1.5, background: `linear-gradient(90deg,transparent,${accentColor}70 30%,${accentColor}bb 50%,${accentColor}70 70%,transparent)` }} />
      {children}
    </motion.div>
  );
}

// ─── Forge input ──────────────────────────────────────────────────────────────
function ForgeInput({ label, value, onChange, placeholder, maxLength, type = "text", hint, valid, error: err }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength?: number; type?: string; hint?: string;
  valid?: boolean; error?: string;
}) {
  const { isDark } = useTheme();
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  const bdrClr = err ? "rgba(239,68,68,0.6)" : focused ? "rgba(255,107,0,0.65)" : valid ? "rgba(52,211,153,0.45)" : isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.1)";

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ position: "relative" }}>
        <label style={{ position: "absolute", left: 14, zIndex: 2, pointerEvents: "none", top: lifted ? 8 : "50%", transform: lifted ? "none" : "translateY(-50%)", fontSize: lifted ? 9.5 : 14, fontFamily: "Syne, sans-serif", fontWeight: lifted ? 800 : 400, letterSpacing: lifted ? "0.13em" : 0, textTransform: lifted ? "uppercase" : "none", color: err ? "#ef4444" : focused ? "#ff8800" : valid ? "#34d399" : lifted ? "rgba(128,128,128,0.6)" : "rgba(128,128,128,0.4)", transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)" }}>
          {label}
        </label>
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? placeholder : undefined} maxLength={maxLength}
          style={{ width: "100%", boxSizing: "border-box" as const, paddingTop: lifted ? 22 : 14, paddingBottom: lifted ? 8 : 14, paddingLeft: 14, paddingRight: valid || err ? 38 : 14, borderRadius: 12, fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", border: `1.5px solid ${bdrClr}`, background: err ? (isDark ? "rgba(239,68,68,0.05)" : "rgba(239,68,68,0.02)") : focused ? (isDark ? "rgba(255,107,0,0.05)" : "rgba(255,107,0,0.02)") : valid ? (isDark ? "rgba(52,211,153,0.05)" : "rgba(52,211,153,0.02)") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)"), color: "var(--text)", boxShadow: focused ? `0 0 0 3.5px rgba(255,107,0,0.12)` : err ? "0 0 0 3px rgba(239,68,68,0.08)" : valid ? "0 0 0 3px rgba(52,211,153,0.08)" : "none", transition: "all 0.2s" }}
        />
        {/* Status icon */}
        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <AnimatePresence>
            {valid && !err && <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ color: "#34d399", display: "flex" }}><IcCheck size={14} /></motion.span>}
            {err && <motion.span key="err" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ color: "#ef4444", display: "flex" }}><IcAlert size={14} /></motion.span>}
          </AnimatePresence>
        </div>
        {/* Laser scan when focused */}
        {focused && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "55%", background: "linear-gradient(90deg,transparent,#ff6b00,#ffcc00,#ff6b00,transparent)", animation: "bcLaser 1.1s ease-in-out infinite" }} />
          </div>
        )}
      </div>
      {err  && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "#ef4444", margin: "4px 0 0 4px", fontWeight: 600 }}>{err}</motion.p>}
      {hint && !err && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, color: "var(--text-muted)", margin: "4px 0 0 4px" }}>{hint}</p>}
    </div>
  );
}

// ─── Drag-drop document uploader ───────────────────────────────────────────────
function DocUploader({ label, icon, doc, onFile, busy, required = true }: {
  label: string; icon: React.ReactNode; doc: DocUpload | null;
  onFile: (f: File) => void; busy: boolean; required?: boolean;
}) {
  const { isDark } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const has = !!doc;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) onFile(f);
  };

  return (
    <motion.div
      animate={{ borderColor: dragging ? "rgba(255,107,0,0.6)" : has ? "rgba(52,211,153,0.4)" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", background: dragging ? "rgba(255,107,0,0.06)" : has ? (isDark ? "rgba(52,211,153,0.06)" : "rgba(52,211,153,0.04)") : "transparent" }}
      transition={{ duration: 0.2 }}
      style={{ borderRadius: 16, border: `1.5px dashed`, position: "relative", overflow: "hidden" }}
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input ref={inputRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />

      <div style={{ paddingTop: 16, paddingBottom: 16, paddingLeft: 18, paddingRight: 18, display: "flex", alignItems: "center", gap: 14 }}>
        {/* Icon box */}
        <motion.div
          animate={{ background: has ? "rgba(52,211,153,0.12)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", boxShadow: has ? "0 0 16px rgba(52,211,153,0.2)" : "none" }}
          style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: has ? "#34d399" : "var(--text-muted)", transition: "all 0.25s" }}
        >
          {has ? <IcCheck size={20} /> : icon}
        </motion.div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontSize: 13.5, fontWeight: 700, color: has ? "#34d399" : "var(--text)", margin: 0 }}>{label}</p>
            {required && !has && <span style={{ fontSize: 10, color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}>required</span>}
          </div>
          {has ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 11.5, color: "#34d399", margin: "2px 0 0", fontFamily: "DM Sans, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              ✓ {doc.name} ({(doc.size / 1024).toFixed(1)}KB)
            </motion.p>
          ) : (
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
              {dragging ? "Drop to upload" : "Drag & drop or click Upload"}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <motion.button
            onClick={() => inputRef.current?.click()} disabled={busy}
            whileHover={!busy ? { scale: 1.04 } : {}} whileTap={!busy ? { scale: 0.97 } : {}}
            style={{ paddingTop: 8, paddingBottom: 8, paddingLeft: 14, paddingRight: 14, borderRadius: 10, border: `1px solid ${has ? "rgba(52,211,153,0.35)" : isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)"}`, background: has ? "transparent" : "linear-gradient(135deg,#ff5500,#ffcc00)", color: has ? "#34d399" : "#fff", fontSize: 12.5, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1, whiteSpace: "nowrap", position: "relative", overflow: "hidden" }}>
            {!has && <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.2) 50%,transparent 70%)", animation: "bcShimmer 2.4s ease-in-out infinite" }} />}
            <span style={{ position: "relative" }}>{has ? "Replace" : "Upload"}</span>
          </motion.button>
        </div>
      </div>

      {/* Image preview */}
      <AnimatePresence>
        {has && doc.preview && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ paddingLeft: 18, paddingRight: 18, paddingBottom: 14 }}>
            <img src={doc.preview} alt={label} style={{ width: "100%", maxHeight: 100, objectFit: "cover", borderRadius: 10, border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Primary & ghost buttons ───────────────────────────────────────────────────
function PrimaryBtn({ label, onClick, busy, disabled, fullWidth = false, icon }: {
  label: string; onClick: () => void; busy?: boolean; disabled?: boolean; fullWidth?: boolean; icon?: React.ReactNode;
}) {
  const off = busy || disabled;
  return (
    <motion.button
      onClick={onClick} disabled={off}
      whileHover={!off ? { scale: 1.025, boxShadow: "0 0 40px rgba(255,100,0,0.5)" } : {}}
      whileTap={!off ? { scale: 0.975 } : {}}
      style={{ width: fullWidth ? "100%" : "auto", paddingTop: 13, paddingBottom: 13, paddingLeft: 26, paddingRight: 26, background: off ? (true ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)") : "linear-gradient(135deg,#ff5500 0%,#ff8800 50%,#ffcc00 100%)", color: off ? "rgba(128,128,128,0.5)" : "#fff", border: "none", borderRadius: 14, fontSize: 14.5, fontWeight: 800, fontFamily: "Syne, sans-serif", cursor: off ? "not-allowed" : "pointer", opacity: off ? 0.6 : 1, position: "relative", overflow: "hidden", display: "inline-flex", alignItems: "center", gap: 9, boxShadow: off ? "none" : "0 0 28px rgba(255,100,0,0.35)", transition: "background 0.25s, color 0.25s, box-shadow 0.25s" }}>
      {!off && <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 28%,rgba(255,255,255,0.22) 50%,transparent 72%)", animation: "bcShimmer 2.4s ease-in-out infinite" }} />}
      {busy && <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", animation: "bcSpin .65s linear infinite", flexShrink: 0, position: "relative" }} />}
      {icon && !busy && <span style={{ position: "relative" }}>{icon}</span>}
      <span style={{ position: "relative" }}>{busy ? "Please wait…" : label}</span>
    </motion.button>
  );
}

function GhostBtn({ label, onClick, disabled, icon }: { label: string; onClick: () => void; disabled?: boolean; icon?: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <motion.button onClick={onClick} disabled={disabled}
      whileHover={!disabled ? { borderColor: "rgba(255,107,0,0.4)" } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      style={{ paddingTop: 13, paddingBottom: 13, paddingLeft: 22, paddingRight: 22, background: "none", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, borderRadius: 14, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "DM Sans, sans-serif", color: "var(--text-muted)", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 7, transition: "border-color 0.2s" }}>
      {icon}{label}
    </motion.button>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────
function Alert({ msg, type }: { msg: string; type: "error" | "success" | "warning" }) {
  const clr = type === "error" ? "#ef4444" : type === "success" ? "#34d399" : "#f59e0b";
  const bg  = type === "error" ? "rgba(239,68,68,0.07)" : type === "success" ? "rgba(52,211,153,0.07)" : "rgba(245,158,11,0.07)";
  return (
    <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      style={{ paddingTop: 13, paddingBottom: 13, paddingLeft: 16, paddingRight: 16, borderRadius: 13, background: bg, border: `1px solid ${clr}33`, marginBottom: 20, color: clr, fontSize: 13.5, fontFamily: "DM Sans, sans-serif", display: "flex", alignItems: "flex-start", gap: 10 }}>
      {type === "error" ? <IcAlert size={15} /> : <IcCheck size={14} />}
      <span>{msg}</span>
    </motion.div>
  );
}

// ─── Progress checklist chip ──────────────────────────────────────────────────
function CheckChip({ label, done }: { label: string; done: boolean }) {
  return (
    <motion.span
      animate={{ background: done ? "rgba(52,211,153,0.12)" : "rgba(128,128,128,0.07)", borderColor: done ? "rgba(52,211,153,0.3)" : "transparent", color: done ? "#34d399" : "var(--text-muted)" }}
      transition={{ duration: 0.3 }}
      style={{ display: "inline-flex", alignItems: "center", gap: 5, paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10, borderRadius: 999, fontSize: 11, fontFamily: "DM Sans, sans-serif", fontWeight: 600, border: "1px solid transparent" }}>
      <motion.span animate={{ scale: done ? [1.3, 1] : 1 }} transition={{ duration: 0.2 }}>{done ? "✓" : "○"}</motion.span>
      {label}
    </motion.span>
  );
}

function CreatorShell({
  children,
  user,
  kycStatus,
  rail = true,
}: {
  children: React.ReactNode;
  user?: UserResponse | null;
  kycStatus?: KycStatus;
  rail?: boolean;
}) {
  const { isDark } = useTheme();
  const bdr = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const panelBg = isDark ? "rgba(11,10,15,0.82)" : "rgba(255,255,255,0.86)";
  const rowBg = isDark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.025)";
  const verified = !!user?.emailVerified;
  const statusLabel =
    kycStatus === "REJECTED" ? "Needs changes" :
    kycStatus === "PENDING_APPROVAL" ? "Under review" :
    kycStatus === "APPROVED" ? "Approved" :
    "Not submitted";
  const railItems = [
    { label: "Email check", value: verified ? "Verified" : "OTP pending", done: verified, icon: <IcMail size={15} /> },
    { label: "Identity documents", value: kycStatus === "APPROVED" ? "Approved" : "PAN and Aadhaar", done: kycStatus === "APPROVED", icon: <IcFile size={15} /> },
    { label: "Payout setup", value: "Bank and UPI", done: kycStatus === "APPROVED", icon: <IcShield size={15} /> },
  ];

  return (
    <div
      className="bc-page-shell"
      style={{
        minHeight: "calc(100vh - 62px)",
        padding: rail ? "44px 24px 84px" : "54px 24px 84px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        position: "relative",
        overflow: "hidden",
        background: isDark
          ? "linear-gradient(180deg,#08070c 0%,#070707 100%)"
          : "linear-gradient(180deg,#f7f4ed 0%,#f3f3f1 100%)",
      }}
    >
      <KycCanvas isDark={isDark} />

      <div
        className={rail ? "bc-shell-grid" : "bc-shell-grid bc-shell-grid-centered"}
        style={{
          width: "100%",
          maxWidth: rail ? 1120 : 720,
          display: "grid",
          gridTemplateColumns: rail ? "minmax(270px,360px) minmax(0,660px)" : "minmax(0,680px)",
          gap: 32,
          alignItems: "start",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {rail && (
          <motion.aside
            className="bc-side-panel"
            initial={{ opacity: 0, y: 18, x: -12 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "sticky",
              top: 86,
              borderRadius: 24,
              padding: 28,
              background: panelBg,
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: `1px solid ${bdr}`,
              boxShadow: isDark ? "0 26px 70px rgba(0,0,0,0.45)" : "0 18px 46px rgba(40,28,12,0.08)",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 28, right: 28, height: 1.5, background: "linear-gradient(90deg,transparent,#ff8800,transparent)" }} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.22)", color: "#ff8800", marginBottom: 18 }}>
              <IcZap size={13} />
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700 }}>Creator access</span>
            </div>

            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 28, lineHeight: 1.08, color: "var(--text)", margin: "0 0 12px", letterSpacing: "-0.03em" }}>
              Launch with verified payouts
            </h2>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, lineHeight: 1.75, color: "var(--text-muted)", margin: "0 0 24px" }}>
              Complete verification once, then create campaigns with secure identity and payout details already in place.
            </p>

            <div style={{ height: 1, background: bdr, marginBottom: 18 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {railItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 + index * 0.08 }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 12, background: item.done ? "rgba(52,211,153,0.12)" : rowBg, border: `1px solid ${item.done ? "rgba(52,211,153,0.28)" : bdr}`, color: item.done ? "#34d399" : "#ff8800", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.done ? <IcCheck size={15} /> : item.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--text)", margin: "0 0 2px" }}>{item.label}</p>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 16, background: rowBg, border: `1px solid ${bdr}` }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 4px" }}>Current status</p>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: kycStatus === "REJECTED" ? "#ef4444" : kycStatus === "PENDING_APPROVAL" ? "#a78bfa" : "#ff8800", margin: 0 }}>{statusLabel}</p>
            </div>
          </motion.aside>
        )}

        <div className="bc-wizard-column" style={{ minWidth: 0, width: "100%" }}>
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .bc-shell-grid { grid-template-columns: 1fr !important; max-width: 720px !important; }
          .bc-side-panel { position: relative !important; top: 0 !important; }
        }
        @media (max-width: 640px) {
          .bc-page-shell { padding: 28px 16px 64px !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Field validation hooks ───────────────────────────────────────────────────
const validators = {
  pan:    (v: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v),
  aadhar: (v: string) => /^\d{4}-\d{4}-\d{4}$/.test(v),
  ifsc:   (v: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v),
  upi:    (v: string) => /^[\w.\-_]+@[a-zA-Z]+$/.test(v),
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function BecomeCreatorPage() {
  const router     = useRouter();
  const { user, loading, refetch } = useProfile();
  const { isDark } = useTheme();

  const pageRef = useRef<HTMLDivElement>(null);
  const [step,       setStep]       = useState<WizardStep>("start");
  const [busy,       setBusy]       = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [otpDigits,  setOtpDigits]  = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Docs
  const [panDoc,       setPanDoc]       = useState<DocUpload | null>(null);
  const [aadhaarFront, setAadhaarFront] = useState<DocUpload | null>(null);
  const [aadhaarBack,  setAadhaarBack]  = useState<DocUpload | null>(null);

  // KYC form
  const [kyc, setKyc] = useState({ panNumber: "", aadhaarNumber: "", bankAccountHolderName: "", bankAccountNumber: "", bankIfscCode: "", bankName: "", bankBranchName: "", upiId: "" });
  const k = (field: string) => (v: string) => setKyc(prev => ({ ...prev, [field]: v }));

  const userWithKycDetails = user as UserKycDetails | null;
  const kycStatus: KycStatus = userWithKycDetails?.kycStatus ?? (user?.kycVerified ? "APPROVED" : "NOT_SUBMITTED");

  // Route to correct step based on KYC status
  useEffect(() => {
    if (loading || !user) return;
    if (kycStatus === "PENDING_SUBMISSION" || kycStatus === "REJECTED") setStep("docs");
  }, [loading, user, kycStatus]);

  // GSAP page entrance
  useEffect(() => {
    if (!pageRef.current) return;
    gsap.fromTo(pageRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" });
  }, []);

  // Derived OTP string
  const otpValue = otpDigits.join("");

  // Validation
  const v = useMemo(() => ({
    pan:    validators.pan(kyc.panNumber),
    aadhar: validators.aadhar(kyc.aadhaarNumber),
    ifsc:   validators.ifsc(kyc.bankIfscCode),
    upi:    validators.upi(kyc.upiId),
    bank:   !!(kyc.bankAccountHolderName.trim() && kyc.bankAccountNumber.trim() && kyc.bankName.trim()),
  }), [kyc]);

  const allDocsOk  = !!(panDoc && aadhaarFront && aadhaarBack);
  const allKycOk   = v.pan && v.aadhar && v.ifsc && v.upi && v.bank;
  const canSubmit  = allDocsOk && allKycOk;

  // Step number for progress bar
  const stepNum = step === "start" ? 0 : step === "otp-sent" ? 1 : step === "docs" ? 2 : 3;

  // ── OTP digit input handler ──────────────────────────────────────────────────
  const handleOtpDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits]; next[i] = d;
    setOtpDigits(next);
    if (d && i < 5) otpRefs[i + 1].current?.focus();
    if (!d && i > 0) otpRefs[i - 1].current?.focus();
  };
  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[i] && i > 0) otpRefs[i - 1].current?.focus();
    if (e.key === "Enter" && otpValue.length === 6) handleVerifyOtp();
  };

  // ── Aadhaar auto-formatter ────────────────────────────────────────────────────
  const handleAadhaar = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 12);
    const p = d.match(/.{1,4}/g) ?? [];
    k("aadhaarNumber")(p.join("-"));
  };

  // ── Generic runner ────────────────────────────────────────────────────────────
  const run = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true); setError(null); setSuccessMsg(null);
    try { await fn(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }, []);

  // ── Upload one doc ────────────────────────────────────────────────────────────
  const uploadDoc = useCallback(async (file: File, setter: (d: DocUpload) => void) => {
    setBusy(true); setError(null);
    try {
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
      const r = await creatorApi.uploadKycDoc(file);
      setter({ url: r.secure_url, publicId: r.public_id, name: file.name, preview, size: file.size });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally { setBusy(false); }
  }, []);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────────
  const handleSendOtp = useCallback(() => run(async () => {
    await textPost("/api/creator/send-otp");
    setOtpDigits(["", "", "", "", "", ""]);
    setStep("otp-sent");
    setSuccessMsg(`OTP sent to ${user?.email}. Valid for 10 minutes.`);
    setTimeout(() => otpRefs[0].current?.focus(), 300);
  }), [run, user?.email]);

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────────
  const handleVerifyOtp = useCallback(() => run(async () => {
    if (otpValue.length !== 6) throw new Error("Please enter all 6 digits");
    await textPost("/api/creator/verify-otp", { otp: otpValue });
    // Safe refresh — bypasses request<T>() redirect side-effect
    await safeRefreshToken();
    await refetch();
    setSuccessMsg("Email verified! Now upload your KYC documents.");
    setStep("docs");
  }), [run, otpValue, refetch]);

  // ── Step 3: Submit KYC ────────────────────────────────────────────────────────
  const handleSubmitKyc = useCallback(() => run(async () => {
    if (!panDoc)       throw new Error("PAN card is required");
    if (!aadhaarFront) throw new Error("Aadhaar front is required");
    if (!aadhaarBack)  throw new Error("Aadhaar back is required");
    if (!v.pan)        throw new Error("Invalid PAN. Format: ABCDE1234F");
    if (!v.aadhar)     throw new Error("Invalid Aadhaar. Format: 1234-5678-9012");
    if (!v.bank)       throw new Error("Complete all bank details");
    if (!v.ifsc)       throw new Error("Invalid IFSC. Format: HDFC0001234");
    if (!v.upi)        throw new Error("Invalid UPI. Format: name@upi");

    const payload: KycSubmitRequest = {
      panNumber:             kyc.panNumber.toUpperCase(),
      panCardImageUrl:       panDoc.url,
      panCardImagePublicId:  panDoc.publicId,
      aadhaarNumber:         kyc.aadhaarNumber,
      aadhaarFrontImageUrl:  aadhaarFront.url,
      aadhaarFrontPublicId:  aadhaarFront.publicId,
      aadhaarBackImageUrl:   aadhaarBack.url,
      aadhaarBackPublicId:   aadhaarBack.publicId,
      bankAccountHolderName: kyc.bankAccountHolderName,
      bankAccountNumber:     kyc.bankAccountNumber,
      bankIfscCode:          kyc.bankIfscCode.toUpperCase(),
      bankName:              kyc.bankName,
      bankBranchName:        kyc.bankBranchName || undefined,
      upiId:                 kyc.upiId,
    };
    await creatorApi.submitKyc(payload);
    await refetch();
    setStep("submitted");
  }), [run, panDoc, aadhaarFront, aadhaarBack, kyc, v, refetch]);

  // ─── Loading state ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 12, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2.5px solid rgba(255,107,0,0.3)", borderTopColor: "#ff8800", animation: "bcSpin .7s linear infinite" }} />
      Loading…
    </div>
  );

  const isRej = kycStatus === "REJECTED";
  const rejReason = userWithKycDetails?.kycRejectionReason ?? undefined;

  // ─── APPROVED ────────────────────────────────────────────────────────────────
  if (kycStatus === "APPROVED") return (
    <CreatorShell rail={false} user={user} kycStatus={kycStatus}>
      <div ref={pageRef} style={{ width: "100%", position: "relative", minHeight: 300 }}>
        <GlassCard accentColor="#34d399">
          <div style={{ textAlign: "center", paddingTop: 28, paddingBottom: 28 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }}
              style={{ width: 80, height: 80, borderRadius: 24, margin: "0 auto 22px", background: "rgba(52,211,153,0.12)", border: "1.5px solid rgba(52,211,153,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399", boxShadow: "0 0 40px rgba(52,211,153,0.2)" }}>
              <IcZap size={32} />
            </motion.div>
            {[1, 2].map(i => (
              <motion.div key={i} initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 1.8, delay: i * 0.4, repeat: Infinity, ease: "easeOut" }}
                style={{ position: "absolute", width: 80, height: 80, borderRadius: 24, border: "1.5px solid rgba(52,211,153,0.3)", left: "50%", top: 28, transform: "translateX(-50%)" }} />
            ))}
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 24, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.025em" }}>You&apos;re a Verified Creator</h2>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-muted)", margin: "0 auto 28px", maxWidth: 360, lineHeight: 1.75 }}>
              Your KYC has been approved. Launch your first campaign and start raising funds.
            </p>
            <PrimaryBtn label="Go to My Campaigns" onClick={() => router.push("/dashboard/my-campaigns")} icon={<IcArrow size={15} />} />
          </div>
        </GlassCard>
      </div>
    </CreatorShell>
  );

  // ─── PENDING APPROVAL ─────────────────────────────────────────────────────────
  if (kycStatus === "PENDING_APPROVAL") return (
    <CreatorShell rail={false} user={user} kycStatus={kycStatus}>
      <div ref={pageRef} style={{ width: "100%" }}>
        <GlassCard accentColor="#a78bfa">
          <div style={{ textAlign: "center", paddingTop: 24, paddingBottom: 24 }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ width: 72, height: 72, borderRadius: 22, margin: "0 auto 20px", background: "rgba(167,139,250,0.12)", border: "1.5px solid rgba(167,139,250,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa" }}>
              <IcClock size={30} />
            </motion.div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 22, color: "var(--text)", margin: "0 0 12px", letterSpacing: "-0.025em" }}>KYC Under Review</h2>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: "var(--text-muted)", margin: "0 auto", lineHeight: 1.8, maxWidth: 380 }}>
              Documents submitted successfully. Our team reviews within <strong style={{ color: "#a78bfa" }}>1–2 business days</strong>.
              <br />We&apos;ll email you at <strong style={{ color: "var(--text)" }}>{user?.email}</strong>.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
              <PrimaryBtn label="Back to Dashboard" onClick={() => router.push("/dashboard")} />
            </div>
          </div>
        </GlassCard>
      </div>
    </CreatorShell>
  );

  // ─── WIZARD ───────────────────────────────────────────────────────────────────
  return (
    <CreatorShell user={user} kycStatus={kycStatus}>
      <div ref={pageRef} style={{ width: "100%", position: "relative" }}>

      {/* Page header */}
      <div style={{ marginBottom: 32, position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, paddingTop: 5, paddingBottom: 5, paddingLeft: 6, paddingRight: 14, borderRadius: 999, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.2)", marginBottom: 16 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#ff5500,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IcZap size={11} />
            </span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 600, color: "#ff8800" }}>
              {isRej ? "Resubmit KYC Verification" : "Creator Verification"}
            </span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(24px,3.5vw,34px)", fontWeight: 900, color: "var(--text)", margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            {isRej ? "Resubmit Your KYC" : "Become a Creator"}
          </h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.7 }}>
            {isRej ? "Your previous submission was rejected. Fix the issues below and resubmit." : "Complete KYC verification to launch campaigns and start raising funds."}
          </p>
        </motion.div>
      </div>

      {/* Rejection banner */}
      <AnimatePresence>
        {isRej && rejReason && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ paddingTop: 14, paddingBottom: 14, paddingLeft: 18, paddingRight: 18, borderRadius: 14, background: "rgba(239,68,68,0.07)", border: "1.5px solid rgba(239,68,68,0.25)", marginBottom: 24, display: "flex", gap: 12, position: "relative", overflow: "hidden", zIndex: 1 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0 }}>
              <IcAlert size={18} />
            </div>
            <div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#ef4444", margin: "0 0 3px" }}>Rejection Reason</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "#ef4444", margin: 0, lineHeight: 1.6 }}>{rejReason}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step progress (skip for rejected — go straight to docs) */}
      {!isRej && step !== "submitted" && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <StepProgress current={stepNum} />
        </div>
      )}

      {/* Alerts */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <AnimatePresence>
          {error      && <Alert key="err" msg={error}      type="error"   />}
          {successMsg && <Alert key="ok"  msg={successMsg} type="success" />}
        </AnimatePresence>
      </div>

      {/* ── STEP: start ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {step === "start" && (
          <motion.div key="start" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.32, ease: "easeOut" }}>
            <GlassCard accentColor="#ff8800">
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
                <motion.div
                  animate={{ boxShadow: ["0 0 0 0 rgba(255,107,0,0.3)", "0 0 0 8px rgba(255,107,0,0)", "0 0 0 0 rgba(255,107,0,0)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 50, height: 50, borderRadius: 15, background: "rgba(255,107,0,0.12)", border: "1.5px solid rgba(255,107,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800", flexShrink: 0 }}>
                  <IcMail size={22} />
                </motion.div>
                <div>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text)", margin: "0 0 6px" }}>Verify your email first</h2>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: 0, lineHeight: 1.7 }}>
                    We&apos;ll send a 6-digit OTP to{" "}
                    <strong style={{ color: "var(--text)", background: "rgba(255,107,0,0.1)", paddingTop: 2, paddingBottom: 2, paddingLeft: 8, paddingRight: 8, borderRadius: 6, fontFamily: "DM Sans, sans-serif" }}>{user?.email}</strong>
                  </p>
                </div>
              </div>

              {/* Feature highlights */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }} className="bc-2col">
                {[
                  { icon: "🔒", text: "Escrow-protected funds" },
                  { icon: "⚡", text: "Launch in 5 minutes" },
                  { icon: "📊", text: "Real-time analytics" },
                  { icon: "₹",  text: "GST invoicing built-in" },
                ].map(f => (
                  <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 9, paddingTop: 10, paddingBottom: 10, paddingLeft: 12, paddingRight: 12, borderRadius: 12, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                    <span style={{ fontSize: 16 }}>{f.icon}</span>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 }}>{f.text}</span>
                  </div>
                ))}
              </div>

              <PrimaryBtn label="Send OTP to my email" onClick={handleSendOtp} busy={busy} icon={<IcMail size={16} />} />
            </GlassCard>
          </motion.div>
        )}

        {/* ── STEP: otp-sent ─────────────────────────────────────────────────── */}
        {step === "otp-sent" && (
          <motion.div key="otp-sent" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.32 }}>
            <GlassCard accentColor="#ff8800">
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text)", margin: "0 0 6px" }}>Enter the OTP</h2>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: "0 0 28px" }}>
                Sent to <strong style={{ color: "var(--text)" }}>{user?.email}</strong>. Valid for 10 minutes.
              </p>

              {/* 6 digit boxes */}
              <div style={{ display: "flex", gap: 10, marginBottom: 24, justifyContent: "center" }} className="otp-row">
                {otpDigits.map((d, i) => (
                  <motion.input
                    key={i}
                    ref={otpRefs[i]}
                    type="text" inputMode="numeric" maxLength={1}
                    value={d}
                    onChange={e => handleOtpDigit(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    onPaste={e => {
                      e.preventDefault();
                      const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
                      const next = ["", "", "", "", "", ""];
                      digits.forEach((c, j) => { next[j] = c; });
                      setOtpDigits(next);
                      otpRefs[Math.min(digits.length, 5)].current?.focus();
                    }}
                    animate={{ borderColor: d ? "rgba(255,107,0,0.7)" : "rgba(128,128,128,0.2)", scale: d ? 1.05 : 1, boxShadow: d ? "0 0 0 3px rgba(255,107,0,0.12), 0 0 16px rgba(255,107,0,0.15)" : "none" }}
                    transition={{ duration: 0.18 }}
                    style={{ width: 52, height: 58, borderRadius: 14, border: "1.5px solid", textAlign: "center", fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 900, color: d ? "#ff8800" : "var(--text)", outline: "none", background: d ? (isDark ? "rgba(255,107,0,0.07)" : "rgba(255,107,0,0.04)") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)"), caretColor: "transparent", cursor: "text", transition: "background 0.18s" } as CSSProperties}
                  />
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <PrimaryBtn label="Verify OTP" onClick={handleVerifyOtp} busy={busy} disabled={otpValue.length !== 6} />
                <GhostBtn label="Resend" onClick={handleSendOtp} disabled={busy} />
                <GhostBtn label="← Back" onClick={() => { setStep("start"); setOtpDigits(["","","","","",""]); setError(null); setSuccessMsg(null); }} disabled={busy} />
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── STEP: docs ────────────────────────────────────────────────────────── */}
        {step === "docs" && (
          <motion.div key="docs" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.32 }}>

            {/* Documents upload card */}
            <GlassCard accentColor="#60a5fa" delay={0}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
                  <IcFile size={17} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text)", margin: 0 }}>Upload Documents</h2>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>Drag & drop or click Upload. Images or PDF accepted.</p>
                </div>
              </div>

              <div style={{ height: 1, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", margin: "18px 0" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <DocUploader label="PAN Card"        icon={<IcFile size={20} />}   doc={panDoc}       onFile={f => uploadDoc(f, setPanDoc)}       busy={busy} />
                <DocUploader label="Aadhaar — Front" icon={<IcUpload size={20} />} doc={aadhaarFront} onFile={f => uploadDoc(f, setAadhaarFront)} busy={busy} />
                <DocUploader label="Aadhaar — Back"  icon={<IcUpload size={20} />} doc={aadhaarBack}  onFile={f => uploadDoc(f, setAadhaarBack)}  busy={busy} />
              </div>
            </GlassCard>

            {/* KYC Details card */}
            <GlassCard accentColor="#ff8800" delay={0.08}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,136,0,0.12)", border: "1px solid rgba(255,136,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800" }}>
                  <IcShield size={17} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text)", margin: 0 }}>KYC Details</h2>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>Your identity & bank information</p>
                </div>
              </div>
              <div style={{ height: 1, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", margin: "18px 0" }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} className="bc-2col">
                {/* PAN */}
                <ForgeInput label="PAN Number" value={kyc.panNumber}
                  onChange={v => k("panNumber")(v.toUpperCase().slice(0, 10))}
                  placeholder="ABCDE1234F" maxLength={10}
                  hint="Format: ABCDE1234F"
                  valid={v.pan}
                  error={kyc.panNumber.length > 0 && !v.pan ? "Invalid PAN format" : undefined} />

                {/* Aadhaar */}
                <ForgeInput label="Aadhaar Number" value={kyc.aadhaarNumber}
                  onChange={handleAadhaar}
                  placeholder="1234-5678-9012" maxLength={14}
                  hint="Format: XXXX-XXXX-XXXX"
                  valid={v.aadhar}
                  error={kyc.aadhaarNumber.length > 0 && !v.aadhar ? "Invalid format" : undefined} />

                {/* Account holder — full width */}
                <div style={{ gridColumn: "1/-1" }}>
                  <ForgeInput label="Account Holder Name" value={kyc.bankAccountHolderName}
                    onChange={k("bankAccountHolderName")}
                    placeholder="Full name as on bank account"
                    valid={kyc.bankAccountHolderName.trim().length > 2} />
                </div>

                {/* Account number */}
                <ForgeInput label="Account Number" value={kyc.bankAccountNumber}
                  onChange={v => k("bankAccountNumber")(v.replace(/\D/g, ""))}
                  placeholder="Account number"
                  valid={kyc.bankAccountNumber.length >= 8} />

                {/* IFSC */}
                <ForgeInput label="IFSC Code" value={kyc.bankIfscCode}
                  onChange={v => k("bankIfscCode")(v.toUpperCase().slice(0, 11))}
                  placeholder="HDFC0001234" maxLength={11}
                  hint="Format: HDFC0001234"
                  valid={v.ifsc}
                  error={kyc.bankIfscCode.length > 0 && !v.ifsc ? "Invalid IFSC" : undefined} />

                {/* Bank name */}
                <ForgeInput label="Bank Name" value={kyc.bankName}
                  onChange={k("bankName")}
                  placeholder="HDFC Bank"
                  valid={kyc.bankName.trim().length > 2} />

                {/* Branch (optional) */}
                <ForgeInput label="Branch (optional)" value={kyc.bankBranchName}
                  onChange={k("bankBranchName")}
                  placeholder="Koregaon Park, Pune" />

                {/* UPI */}
                <ForgeInput label="UPI ID" value={kyc.upiId}
                  onChange={k("upiId")}
                  placeholder="yourname@upi"
                  hint="Format: name@upi"
                  valid={v.upi}
                  error={kyc.upiId.length > 0 && !v.upi ? "Invalid UPI format" : undefined} />
              </div>

              {/* Security notice */}
              <div style={{ display: "flex", alignItems: "center", gap: 9, paddingTop: 11, paddingBottom: 11, paddingLeft: 13, paddingRight: 13, borderRadius: 10, background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`, marginBottom: 20, color: "var(--text-muted)" }}>
                <IcShield size={14} />
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5 }}>All documents encrypted · Bank details stored securely · Aadhaar number masked in our records</span>
              </div>

              {/* Progress checklist */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
                <CheckChip label="PAN Card"     done={!!panDoc} />
                <CheckChip label="Aadhaar Front" done={!!aadhaarFront} />
                <CheckChip label="Aadhaar Back"  done={!!aadhaarBack} />
                <CheckChip label="PAN Format"    done={v.pan} />
                <CheckChip label="Aadhaar No."   done={v.aadhar} />
                <CheckChip label="Bank Details"  done={v.bank} />
                <CheckChip label="IFSC"          done={v.ifsc} />
                <CheckChip label="UPI ID"        done={v.upi} />
              </div>

              {/* Submit */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <PrimaryBtn
                  label={isRej ? "Resubmit KYC Application" : "Submit KYC Application"}
                  onClick={handleSubmitKyc}
                  busy={busy}
                  disabled={!canSubmit}
                  icon={<IcArrow size={15} />}
                />
                {!isRej && (
                  <GhostBtn label="← Back" onClick={() => { setStep("start"); setError(null); setSuccessMsg(null); }} disabled={busy} />
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── STEP: submitted ─────────────────────────────────────────────────── */}
        {step === "submitted" && (
          <motion.div key="submitted" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 160, damping: 22 }}>
            <GlassCard accentColor="#34d399">
              <div style={{ textAlign: "center", paddingTop: 24, paddingBottom: 24, position: "relative" }}>
                {/* Pulsing rings */}
                {[1, 2, 3].map(i => (
                  <motion.div key={i} initial={{ scale: 0.8, opacity: 0.7 }} animate={{ scale: 2.8, opacity: 0 }} transition={{ duration: 2, delay: i * 0.35, repeat: Infinity, ease: "easeOut" }}
                    style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", border: "1.5px solid rgba(52,211,153,0.4)", left: "50%", top: 24, transform: "translateX(-50%)", pointerEvents: "none" }} />
                ))}

                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
                  style={{ width: 80, height: 80, borderRadius: 24, margin: "0 auto 22px", background: "rgba(52,211,153,0.12)", border: "1.5px solid rgba(52,211,153,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399", boxShadow: "0 0 40px rgba(52,211,153,0.2)", position: "relative" }}>
                  <IcCircleOk size={34} />
                </motion.div>

                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 24, color: "var(--text)", margin: "0 0 12px", letterSpacing: "-0.025em" }}>
                  KYC Submitted
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-muted)", margin: "0 auto 28px", lineHeight: 1.8, maxWidth: 400 }}>
                  Your documents are under review. We&apos;ll notify you at{" "}
                  <strong style={{ color: "var(--text)" }}>{user?.email}</strong>{" "}
                  within <strong style={{ color: "#34d399" }}>1–2 business days</strong>.
                </motion.p>

                {/* Timeline */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  style={{ display: "flex", gap: 0, maxWidth: 360, margin: "0 auto 28px", borderRadius: 14, overflow: "hidden", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
                  {[
                    { label: "Submitted", color: "#34d399", done: true },
                    { label: "In Review", color: "#a78bfa", done: false },
                    { label: "Approved",  color: "#ff8800", done: false },
                  ].map((s, i, arr) => (
                    <div key={s.label} style={{ flex: 1, paddingTop: 12, paddingBottom: 12, textAlign: "center", borderRight: i < arr.length - 1 ? `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` : "none", background: i === 0 ? (isDark ? "rgba(52,211,153,0.07)" : "rgba(52,211,153,0.04)") : "transparent" }}>
                      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 11, color: s.done ? s.color : "var(--text-muted)", margin: 0 }}>{s.label}</p>
                      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, color: "var(--text-muted)", margin: "3px 0 0" }}>{i === 0 ? "✓ Now" : i === 1 ? "1–2 days" : "Then"}</p>
                    </div>
                  ))}
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <PrimaryBtn label="Back to Dashboard" onClick={() => router.push("/dashboard")} />
                </motion.div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bcShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(220%)} 100%{transform:translateX(220%)} }
        @keyframes bcSpin    { to{transform:rotate(360deg)} }
        @keyframes bcLaser   { 0%{transform:translateX(-200%)} 100%{transform:translateX(400%)} }
        @media (max-width: 540px) {
          .bc-2col  { grid-template-columns: 1fr !important; }
          .otp-row  { gap: 6px !important; }
          .otp-row input { width: 40px !important; height: 48px !important; font-size: 20px !important; }
        }
      `}</style>
      </div>
    </CreatorShell>
  );
}