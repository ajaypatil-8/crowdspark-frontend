"use client";
import { useState, useCallback, useEffect, useRef, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

// ── Shared ambient canvas (same orb system as login/register) ────────────────
function AmbientCanvas({ isDark }: { isDark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    type Orb = { x:number; y:number; r:number; vx:number; vy:number; hue:number; a:number };
    const orbs: Orb[] = [
      { x:0.18, y:0.20, r:0.36, vx: 0.00025, vy: 0.00018, hue:22,  a: isDark?0.09:0.055 },
      { x:0.80, y:0.72, r:0.30, vx:-0.00020, vy: 0.00022, hue:210, a: isDark?0.07:0.04  },
      { x:0.55, y:0.10, r:0.22, vx: 0.00018, vy:-0.00025, hue:270, a: isDark?0.06:0.038 },
      { x:0.06, y:0.78, r:0.20, vx: 0.00022, vy:-0.00018, hue:40,  a: isDark?0.06:0.035 },
    ];
    const W = () => canvas.offsetWidth, H = () => canvas.offsetHeight;
    let frame = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick); frame++;
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x<-0.15||o.x>1.15) o.vx*=-1;
        if (o.y<-0.15||o.y>1.15) o.vy*=-1;
        const gx=o.x*w, gy=o.y*h, gr=o.r*Math.min(w,h);
        const g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
        g.addColorStop(0, `hsla(${o.hue},82%,${isDark?58:50}%,${o.a})`);
        g.addColorStop(1,"transparent");
        ctx.fillStyle=g;
        ctx.beginPath(); ctx.arc(gx,gy,gr,0,Math.PI*2); ctx.fill();
      });
      // scan line
      const sy=((frame*0.3)%(h+60))-30;
      const sl=ctx.createLinearGradient(0,sy-1,0,sy+1);
      sl.addColorStop(0,"transparent");
      sl.addColorStop(0.5,`rgba(255,145,0,${isDark?0.03:0.015})`);
      sl.addColorStop(1,"transparent");
      ctx.fillStyle=sl; ctx.fillRect(0,sy-1,w,2);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, [isDark]);
  return <canvas ref={ref} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}/>;
}

// ── Forge Input ──────────────────────────────────────────────────────────────
function ForgeInput({ label, type="text", value, onChange, autoComplete, isDark, disabled }: {
  label:string; type?:string; value:string; onChange:(v:string)=>void;
  autoComplete?:string; isDark:boolean; disabled?:boolean;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div style={{ position:"relative" }}>
      <label style={{
        position:"absolute", left:16, zIndex:2, pointerEvents:"none",
        top: lifted ? 8 : "50%",
        transform: lifted ? "none" : "translateY(-50%)",
        fontSize: lifted ? 9.5 : 14.5,
        fontFamily:"Syne, sans-serif",
        fontWeight: lifted ? 800 : 400,
        letterSpacing: lifted ? "0.14em" : 0,
        textTransform: lifted ? "uppercase" : "none",
        color: focused ? "#ff8800"
          : lifted
            ? (isDark?"rgba(255,255,255,0.38)":"rgba(0,0,0,0.38)")
            : (isDark?"rgba(255,255,255,0.28)":"rgba(0,0,0,0.3)"),
        transition:"all 0.22s cubic-bezier(0.4,0,0.2,1)",
      }}>{label}</label>
      <input
        type={type} value={value} onChange={e=>onChange(e.target.value)}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        autoComplete={autoComplete} disabled={disabled}
        style={{
          width:"100%", boxSizing:"border-box" as const,
          paddingTop: lifted ? 24 : 16, paddingBottom: lifted ? 8 : 16,
          paddingLeft: 16, paddingRight: 16,
          borderRadius:14, outline:"none",
          fontFamily:"DM Sans, sans-serif", fontSize:14.5, color:"var(--text)",
          border:`1.5px solid ${focused?"rgba(255,107,0,0.7)":isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.1)"}`,
          background: focused
            ?(isDark?"rgba(255,107,0,0.06)":"rgba(255,107,0,0.03)")
            :(isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.022)"),
          boxShadow: focused
            ?"0 0 0 3.5px rgba(255,107,0,0.13), inset 0 1px 0 rgba(255,200,100,0.05)"
            :"none",
          transition:"all 0.22s cubic-bezier(0.4,0,0.2,1)",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
      {focused && !disabled && (
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2.5, borderRadius:"0 0 14px 14px", overflow:"hidden", pointerEvents:"none" }}>
          <div style={{ height:"100%", width:"55%", background:"linear-gradient(90deg,transparent,#ff6b00,#ffcc00,#ff6b00,transparent)", animation:"fpLaser 1.1s ease-in-out infinite" }}/>
        </div>
      )}
    </div>
  );
}

// ── Email Sent success state ─────────────────────────────────────────────────
function SentState({ email, isDark, onRetry }: { email:string; isDark:boolean; onRetry:()=>void }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:0.9, y:16 }}
      animate={{ opacity:1, scale:1, y:0 }}
      transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", padding:"8px 0 4px" }}
    >
      {/* Pulsing ring stack */}
      <div style={{ position:"relative", width:88, height:88, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:26 }}>
        {[1,2,3].map(i=>(
          <motion.div key={i}
            initial={{ scale:0, opacity:0.7 }}
            animate={{ scale:2.6, opacity:0 }}
            transition={{ duration:2, delay:i*0.35, repeat:Infinity, ease:"easeOut" }}
            style={{ position:"absolute", width:60, height:60, borderRadius:"50%", border:"1.5px solid rgba(255,136,0,0.45)" }}
          />
        ))}
        <motion.div
          initial={{ scale:0, rotate:-20 }}
          animate={{ scale:1, rotate:0 }}
          transition={{ type:"spring", stiffness:200, damping:14, delay:0.1 }}
          style={{
            width:72, height:72, borderRadius:22,
            background: isDark?"rgba(255,107,0,0.1)":"rgba(255,107,0,0.08)",
            border:"1.5px solid rgba(255,107,0,0.35)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 36px rgba(255,107,0,0.22)",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ff8800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </motion.div>
      </div>

      <motion.h2
        initial={{ y:12, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.25 }}
        style={{ fontFamily:"Syne, sans-serif", fontWeight:900, fontSize:24, color:"var(--text)", letterSpacing:"-0.03em", margin:"0 0 10px", lineHeight:1.1 }}
      >
        Check your inbox
      </motion.h2>
      <motion.div
        initial={{ scaleX:0, originX:"center" }} animate={{ scaleX:1 }}
        transition={{ delay:0.4, duration:0.45, ease:"easeOut" }}
        style={{ width:48, height:3, borderRadius:2, background:"linear-gradient(90deg,#ff5500,#ffcc00)", marginBottom:14, boxShadow:"0 0 14px rgba(255,107,0,0.5)" }}
      />
      <motion.p
        initial={{ y:8, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.32 }}
        style={{ fontFamily:"DM Sans, sans-serif", fontSize:14, color:isDark?"rgba(255,255,255,0.48)":"rgba(0,0,0,0.48)", margin:"0 0 6px", lineHeight:1.65 }}
      >
        We sent a password reset link to
      </motion.p>
      <motion.p
        initial={{ y:8, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.38 }}
        style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14.5, color:"#ff8800", margin:"0 0 28px", wordBreak:"break-all" }}
      >
        {email}
      </motion.p>

      <motion.div initial={{ y:8, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.45 }}
        style={{ width:"100%", display:"flex", flexDirection:"column", gap:10 }}
      >
        <p style={{ fontFamily:"DM Sans, sans-serif", fontSize:12.5, color:isDark?"rgba(255,255,255,0.28)":"rgba(0,0,0,0.32)", margin:0 }}>
          Didn&#39;t receive it? Check spam or{" "}
          <button onClick={onRetry}
            style={{ background:"none", border:"none", cursor:"pointer", color:"#ff8800", fontFamily:"DM Sans, sans-serif", fontSize:12.5, fontWeight:700, padding:0 }}>
            try again
          </button>
        </p>
        <Link href="/login"
          style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
            paddingTop:14, paddingBottom:14, paddingLeft:20, paddingRight:20,
            borderRadius:14, border:`1.5px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`,
            background:"none", color:"var(--text)", fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14,
            textDecoration:"none", transition:"border-color 0.2s",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to sign in
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const { isDark } = useTheme();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string|null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null); setLoading(true);
    try {
      // POST /auth/forgot-password  — backend endpoint when ready
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/crowdspark"}/auth/forgot-password`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok && res.status !== 200) {
        // still show success — never confirm if email exists (security)
      }
      setSent(true);
    } catch {
      // show success regardless to avoid email enumeration
      setSent(true);
    } finally { setLoading(false); }
  }, [email]);

  const pageBg  = isDark ? "#06050a" : "#f3f2ee";
  const cardBg  = isDark ? "rgba(10,8,18,0.88)" : "rgba(255,255,255,0.88)";
  const cardBdr = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const mutedClr= isDark ? "rgba(255,255,255,0.4)"  : "rgba(0,0,0,0.42)";
  const canSubmit = !loading && email.includes("@");

  if (!mounted) return null;

  return (
    <div style={{
      minHeight:"100vh", background:pageBg,
      display:"flex", alignItems:"center", justifyContent:"center",
      position:"relative", overflow:"hidden",
    }}>
      {/* Ambient canvas */}
      <AmbientCanvas isDark={isDark}/>

      {/* Grid overlay */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:isDark?0.028:0.016 }}>
        <defs>
          <pattern id="fpg" x="0" y="0" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M 52 0 L 0 0 0 52" fill="none" stroke={isDark?"#ff8800":"#000"} strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fpg)"/>
      </svg>

      {/* Edge fades */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:200, background:`linear-gradient(to bottom,${isDark?"rgba(6,5,10,0.55)":"rgba(243,242,238,0.55)"} 0%,transparent 100%)`, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:200, background:`linear-gradient(to top,${isDark?"rgba(6,5,10,0.55)":"rgba(243,242,238,0.55)"} 0%,transparent 100%)`, pointerEvents:"none" }}/>

      {/* Logo */}
      <motion.div
        initial={{ opacity:0, y:-22 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.6, ease:"easeOut" }}
        style={{ position:"absolute", top:28, left:36, display:"flex", alignItems:"center", gap:10, zIndex:10 }}
      >
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <motion.div
            whileHover={{ scale:1.08, rotate:5 }}
            transition={{ type:"spring", stiffness:400, damping:18 }}
            style={{ width:38, height:38, borderRadius:11, background:"linear-gradient(135deg,#ff5500,#ffcc00)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 24px rgba(255,100,0,0.55)" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill={isDark?"#050508":"#fff"}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </motion.div>
          <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:20, color:"var(--text)", letterSpacing:"-0.025em" }}>
            Crowd<span style={{ color:"#ff8800" }}>Spark</span>
          </span>
        </Link>
      </motion.div>

      {/* ─── Card ─── */}
      <motion.div
        initial={{ opacity:0, y:38, scale:0.91 }}
        animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:0.72, ease:[0.22,1,0.36,1] }}
        style={{
          position:"relative", zIndex:5,
          width:"100%", maxWidth:448, margin:"0 16px",
          background:cardBg,
          backdropFilter:"blur(30px) saturate(1.5)",
          WebkitBackdropFilter:"blur(30px) saturate(1.5)",
          border:`1px solid ${cardBdr}`,
          borderRadius:28,
          paddingTop:44, paddingBottom:40, paddingLeft:42, paddingRight:42,
          boxShadow: isDark
            ?"0 40px 100px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,107,0,0.07), inset 0 1px 0 rgba(255,255,255,0.05)"
            :"0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,107,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
          overflow:"hidden",
        }}
      >
        {/* Top accent line */}
        <div style={{
          position:"absolute", top:0, left:"7%", right:"7%", height:2.5,
          background:"linear-gradient(90deg,transparent,rgba(255,90,0,0.85) 28%,rgba(255,220,0,1) 50%,rgba(255,90,0,0.85) 72%,transparent)",
        }}/>
        {/* Inner glow */}
        <div style={{ position:"absolute", top:-55, left:"50%", transform:"translateX(-50%)", width:300, height:110, background:"radial-gradient(ellipse,rgba(255,107,0,0.1) 0%,transparent 70%)", pointerEvents:"none" }}/>
        {/* Corner deco */}
        <div style={{ position:"absolute", top:12, right:12, width:60, height:60, borderTop:`1.5px solid ${isDark?"rgba(255,136,0,0.12)":"rgba(255,136,0,0.18)"}`, borderRight:`1.5px solid ${isDark?"rgba(255,136,0,0.12)":"rgba(255,136,0,0.18)"}`, borderRadius:"0 12px 0 0", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:12, left:12, width:60, height:60, borderBottom:`1.5px solid ${isDark?"rgba(96,165,250,0.1)":"rgba(96,165,250,0.15)"}`, borderLeft:`1.5px solid ${isDark?"rgba(96,165,250,0.1)":"rgba(96,165,250,0.15)"}`, borderRadius:"0 0 0 12px", pointerEvents:"none" }}/>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="sent"
              initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}
              transition={{ duration:0.4, ease:"easeOut" }}
            >
              <SentState email={email} isDark={isDark} onRetry={()=>{ setSent(false); setEmail(""); }}/>
            </motion.div>
          ) : (
            <motion.div key="form"
              initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:30 }}
              transition={{ duration:0.4, ease:"easeOut" }}
            >
              {/* Back link */}
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }} style={{ marginBottom:28 }}>
                <Link href="/login"
                  style={{ display:"inline-flex", alignItems:"center", gap:7, color:mutedClr, fontFamily:"DM Sans, sans-serif", fontSize:13, textDecoration:"none", fontWeight:500 }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to sign in
                </Link>
              </motion.div>

              {/* Heading */}
              <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15, duration:0.5 }} style={{ marginBottom:30 }}>
                {/* Icon */}
                <motion.div
                  initial={{ scale:0 }} animate={{ scale:1 }}
                  transition={{ type:"spring", stiffness:220, damping:16, delay:0.2 }}
                  style={{
                    width:52, height:52, borderRadius:16, marginBottom:18,
                    background: isDark?"rgba(255,107,0,0.08)":"rgba(255,107,0,0.07)",
                    border:"1.5px solid rgba(255,107,0,0.22)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 0 24px rgba(255,107,0,0.15)",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff8800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </motion.div>

                <h1 style={{
                  fontFamily:"Syne, sans-serif", fontWeight:900,
                  fontSize:"clamp(26px,3.5vw,36px)",
                  color:"var(--text)", letterSpacing:"-0.03em",
                  margin:"0 0 8px", lineHeight:1.06,
                }}>Reset password</h1>
                <motion.div
                  initial={{ scaleX:0, originX:"left" }} animate={{ scaleX:1 }}
                  transition={{ delay:0.4, duration:0.5, ease:"easeOut" }}
                  style={{ width:48, height:3.5, borderRadius:2, background:"linear-gradient(90deg,#ff5500,#ffcc00)", marginBottom:12, boxShadow:"0 0 16px rgba(255,107,0,0.58)" }}
                />
                <p style={{ fontFamily:"DM Sans, sans-serif", fontSize:14, color:mutedClr, margin:0, lineHeight:1.6 }}>
                  Enter your email and we&#39;ll send you a reset link.
                </p>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, scale:0.97 }}
                    style={{
                      paddingTop:12, paddingBottom:12, paddingLeft:16, paddingRight:16,
                      borderRadius:13, background:"rgba(239,68,68,0.07)",
                      border:"1px solid rgba(239,68,68,0.22)", marginBottom:20,
                      color:"#ef4444", fontSize:13.5, fontFamily:"DM Sans, sans-serif",
                      display:"flex", alignItems:"flex-start", gap:10,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <motion.div initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.28, duration:0.4 }}>
                  <ForgeInput
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    isDark={isDark}
                    disabled={loading}
                  />
                </motion.div>

                <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.36, duration:0.4 }}>
                  <motion.button
                    type="submit" disabled={!canSubmit}
                    whileHover={canSubmit?{ scale:1.025, boxShadow:"0 0 48px rgba(255,100,0,0.54)" }:{}}
                    whileTap={canSubmit?{ scale:0.975 }:{}}
                    style={{
                      width:"100%",
                      paddingTop:15, paddingBottom:15, paddingLeft:20, paddingRight:20,
                      borderRadius:14, border:"none",
                      background: canSubmit
                        ?"linear-gradient(135deg,#ff5500 0%,#ff8800 50%,#ffcc00 100%)"
                        :(isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"),
                      color: canSubmit?"#fff":(isDark?"rgba(255,255,255,0.22)":"rgba(0,0,0,0.22)"),
                      fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:15.5,
                      cursor: canSubmit?"pointer":"not-allowed",
                      position:"relative", overflow:"hidden",
                      boxShadow: canSubmit?"0 0 32px rgba(255,100,0,0.4), 0 4px 20px rgba(255,100,0,0.2)":"none",
                      transition:"background 0.3s, color 0.3s, box-shadow 0.3s",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:9,
                    }}
                  >
                    {canSubmit && <span style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,transparent 25%,rgba(255,255,255,0.22) 50%,transparent 75%)", animation:"fpShimmer 2.2s ease-in-out infinite" }}/>}
                    {loading ? (
                      <>
                        <span style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"fpSpin .65s linear infinite", flexShrink:0 }}/>
                        <span style={{ position:"relative" }}>Sending link…</span>
                      </>
                    ) : (
                      <span style={{ position:"relative", display:"flex", alignItems:"center", gap:8 }}>
                        Send reset link
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                      </span>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
                style={{ marginTop:24, textAlign:"center", color:mutedClr, fontFamily:"DM Sans, sans-serif", fontSize:14 }}>
                Remember it after all?{" "}
                <Link href="/login" style={{ color:"#ff8800", fontWeight:700, textDecoration:"none" }}>Sign in →</Link>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        @keyframes fpShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(220%)} 100%{transform:translateX(220%)} }
        @keyframes fpSpin    { to{transform:rotate(360deg)} }
        @keyframes fpLaser   { 0%{transform:translateX(-200%)} 100%{transform:translateX(400%)} }
      `}</style>
    </div>
  );
}
