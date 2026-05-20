"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { emailVerifyApi } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

type State = "loading" | "success" | "error";

// ── Ambient background ───────────────────────────────────────────────────────
function AmbientBg({ isDark }: { isDark: boolean }) {
  return (
    <>
      <div style={{ position:"absolute", top:"-18%", left:"-6%", width:520, height:520, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,107,0,0.09) 0%,transparent 65%)", filter:"blur(70px)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"-12%", right:"-4%", width:440, height:440, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,212,184,0.08) 0%,transparent 65%)", filter:"blur(60px)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"40%", right:"10%", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(167,139,250,0.07) 0%,transparent 65%)", filter:"blur(40px)", pointerEvents:"none" }}/>
      {isDark && (
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.025, pointerEvents:"none" }}>
          <defs>
            <pattern id="ve-dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#ff8800"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ve-dots)"/>
        </svg>
      )}
    </>
  );
}

// ── Loading state ─────────────────────────────────────────────────────────────
function LoadingState({ isDark }: { isDark: boolean }) {
  return (
    <motion.div
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:22, padding:"8px 0" }}
    >
      <div style={{ position:"relative", width:80, height:80, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {/* Spinning rings */}
        <motion.div
          animate={{ rotate:360 }}
          transition={{ duration:1.4, repeat:Infinity, ease:"linear" }}
          style={{
            position:"absolute", width:72, height:72, borderRadius:"50%",
            border:`2.5px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"}`,
            borderTopColor:"#ff8800",
            boxShadow:"0 0 18px rgba(255,136,0,0.3)",
          }}
        />
        <motion.div
          animate={{ rotate:-360 }}
          transition={{ duration:2.2, repeat:Infinity, ease:"linear" }}
          style={{
            position:"absolute", width:56, height:56, borderRadius:"50%",
            border:`1.5px solid transparent`,
            borderTopColor:"rgba(255,204,0,0.45)",
            borderLeftColor:"rgba(255,204,0,0.22)",
          }}
        />
        <motion.div
          animate={{ scale:[1,1.08,1], opacity:[0.6,1,0.6] }}
          transition={{ duration:1.8, repeat:Infinity, ease:"easeInOut" }}
          style={{
            width:36, height:36, borderRadius:11,
            background:"linear-gradient(135deg,#ff5500,#ffcc00)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 20px rgba(255,100,0,0.45)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isDark?"#050508":"#fff"}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </motion.div>
      </div>

      <div style={{ textAlign:"center" }}>
        <h2 style={{ fontFamily:"Syne, sans-serif", fontWeight:900, fontSize:22, color:"var(--text)", margin:"0 0 8px", letterSpacing:"-0.02em" }}>
          Verifying your email…
        </h2>
        <p style={{ fontFamily:"DM Sans, sans-serif", fontSize:14, color:isDark?"rgba(255,255,255,0.42)":"rgba(0,0,0,0.42)", margin:0 }}>
          This will only take a moment
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ width:"100%", height:3, borderRadius:2, background:isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)", overflow:"hidden" }}>
        <motion.div
          animate={{ x:["-100%","100%"] }}
          transition={{ duration:1.6, repeat:Infinity, ease:"easeInOut" }}
          style={{ height:"100%", width:"50%", background:"linear-gradient(90deg,transparent,#ff8800,#ffcc00,transparent)", borderRadius:2 }}
        />
      </div>
    </motion.div>
  );
}

// ── Success state ─────────────────────────────────────────────────────────────
function SuccessState({ isDark, onGoSettings }: { isDark:boolean; onGoSettings:()=>void }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
      transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:0 }}
    >
      {/* Icon with rings */}
      <div style={{ position:"relative", width:100, height:100, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24 }}>
        {[1,2,3].map(i=>(
          <motion.div key={i}
            initial={{ scale:0, opacity:0.7 }}
            animate={{ scale:2.8, opacity:0 }}
            transition={{ duration:2, delay:i*0.32, repeat:Infinity, ease:"easeOut" }}
            style={{ position:"absolute", width:64, height:64, borderRadius:"50%", border:"1.5px solid rgba(52,211,153,0.5)" }}
          />
        ))}
        <motion.div
          initial={{ scale:0, rotate:-30 }}
          animate={{ scale:1, rotate:0 }}
          transition={{ type:"spring", stiffness:200, damping:14, delay:0.08 }}
          style={{
            width:72, height:72, borderRadius:22,
            background:"rgba(52,211,153,0.1)", border:"1.5px solid rgba(52,211,153,0.38)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 36px rgba(52,211,153,0.22)", color:"#34d399",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </motion.div>
      </div>

      <motion.h2 initial={{ y:12, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.2 }}
        style={{ fontFamily:"Syne, sans-serif", fontWeight:900, fontSize:26, color:"#34d399", margin:"0 0 6px", letterSpacing:"-0.025em" }}>
        Email verified!
      </motion.h2>
      <motion.div initial={{ scaleX:0, originX:"center" }} animate={{ scaleX:1 }} transition={{ delay:0.35, duration:0.4 }}
        style={{ width:44, height:3, borderRadius:2, background:"linear-gradient(90deg,#22c55e,#34d399)", marginBottom:14, boxShadow:"0 0 12px rgba(52,211,153,0.45)" }}
      />
      <motion.p initial={{ y:8, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.28 }}
        style={{ fontFamily:"DM Sans, sans-serif", fontSize:14.5, color:isDark?"rgba(255,255,255,0.48)":"rgba(0,0,0,0.48)", margin:"0 0 28px", lineHeight:1.65 }}>
        Your email has been successfully verified.<br/>
        Redirecting you to settings…
      </motion.p>

      <motion.div initial={{ y:8, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.38 }} style={{ width:"100%", display:"flex", gap:10 }}>
        <motion.button
          onClick={onGoSettings}
          whileHover={{ scale:1.025, boxShadow:"0 0 32px rgba(52,211,153,0.4)" }}
          whileTap={{ scale:0.975 }}
          style={{
            flex:1, paddingTop:14, paddingBottom:14, paddingLeft:20, paddingRight:20,
            borderRadius:14, border:"none",
            background:"linear-gradient(135deg,#059669,#34d399)",
            color:"#fff", fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:14.5,
            cursor:"pointer", boxShadow:"0 0 24px rgba(52,211,153,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8, position:"relative", overflow:"hidden",
          }}
        >
          <span style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,transparent 28%,rgba(255,255,255,0.18) 50%,transparent 72%)", animation:"veShimmer 2.3s ease-in-out infinite" }}/>
          <span style={{ position:"relative" }}>Go to Settings</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position:"relative" }}>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
function ErrorState({ message, isDark, onRequest }: { message:string; isDark:boolean; onRequest:()=>void }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
      transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}
    >
      {/* Icon */}
      <div style={{ position:"relative", width:100, height:100, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24 }}>
        {[1,2].map(i=>(
          <motion.div key={i}
            initial={{ scale:0, opacity:0.6 }}
            animate={{ scale:2.6, opacity:0 }}
            transition={{ duration:2.4, delay:i*0.5, repeat:Infinity, ease:"easeOut" }}
            style={{ position:"absolute", width:64, height:64, borderRadius:"50%", border:"1.5px solid rgba(239,68,68,0.45)" }}
          />
        ))}
        <motion.div
          initial={{ scale:0 }} animate={{ scale:1 }}
          transition={{ type:"spring", stiffness:220, damping:15, delay:0.08 }}
          style={{
            width:72, height:72, borderRadius:22,
            background:"rgba(239,68,68,0.08)", border:"1.5px solid rgba(239,68,68,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 30px rgba(239,68,68,0.18)", color:"#ef4444",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </motion.div>
      </div>

      <motion.h2 initial={{ y:12, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.2 }}
        style={{ fontFamily:"Syne, sans-serif", fontWeight:900, fontSize:24, color:"#ef4444", margin:"0 0 6px", letterSpacing:"-0.025em" }}>
        Verification failed
      </motion.h2>
      <motion.div initial={{ scaleX:0, originX:"center" }} animate={{ scaleX:1 }} transition={{ delay:0.32 }}
        style={{ width:40, height:3, borderRadius:2, background:"linear-gradient(90deg,#dc2626,#ef4444)", marginBottom:14 }}
      />
      <motion.p initial={{ y:8, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.28 }}
        style={{ fontFamily:"DM Sans, sans-serif", fontSize:14, color:isDark?"rgba(255,255,255,0.45)":"rgba(0,0,0,0.48)", margin:"0 0 28px", lineHeight:1.65 }}>
        {message}
      </motion.p>

      <motion.div initial={{ y:8, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.38 }}
        style={{ width:"100%", display:"flex", gap:10, flexDirection:"column" }}
      >
        <motion.button
          onClick={onRequest}
          whileHover={{ scale:1.025 }} whileTap={{ scale:0.975 }}
          style={{
            width:"100%", paddingTop:14, paddingBottom:14, paddingLeft:20, paddingRight:20,
            borderRadius:14, border:"none",
            background:"linear-gradient(135deg,#ff5500,#ff8800)",
            color:"#fff", fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:14.5,
            cursor:"pointer", boxShadow:"0 0 24px rgba(255,100,0,0.35)",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          }}
        >
          Request new link
        </motion.button>
        <Link href="/dashboard"
          style={{
            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            paddingTop:13, paddingBottom:13,
            borderRadius:14, border:`1.5px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`,
            color:isDark?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.5)", fontFamily:"DM Sans, sans-serif", fontSize:14, fontWeight:600,
            textDecoration:"none",
          }}
        >
          Go to Dashboard
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ── Inner (uses useSearchParams — must be inside Suspense) ───────────────────
function VerifyEmailPageInner() {
  const { isDark } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setState("error");
      setMessage("Invalid verification link. Please request a new one from your settings.");
      return;
    }

    emailVerifyApi
      .verify(token, email)
      .then(() => {
        setState("success");
        setTimeout(() => router.push("/dashboard/settings"), 3200);
      })
      .catch((err: Error) => {
        setState("error");
        setMessage(err.message || "Verification failed. The link may have expired.");
      });
  }, [searchParams, router, mounted]);

  const pageBg  = isDark ? "#06050a" : "#f3f2ee";
  const cardBg  = isDark ? "rgba(10,8,18,0.92)" : "rgba(255,255,255,0.92)";
  const cardBdr = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  if (!mounted) return null;

  return (
    <div style={{
      minHeight:"100vh", background:pageBg,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"24px 16px", position:"relative", overflow:"hidden",
    }}>
      {/* BG */}
      <AmbientBg isDark={isDark}/>

      {/* Logo */}
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
        style={{ position:"absolute", top:28, left:36, zIndex:10 }}>
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

      {/* Card */}
      <motion.div
        initial={{ opacity:0, y:36, scale:0.92 }}
        animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}
        style={{
          position:"relative", zIndex:5,
          width:"100%", maxWidth:430, margin:"0 auto",
          background:cardBg,
          backdropFilter:"blur(28px) saturate(1.4)",
          WebkitBackdropFilter:"blur(28px) saturate(1.4)",
          border:`1px solid ${cardBdr}`,
          borderRadius:28,
          paddingTop:44, paddingBottom:40, paddingLeft:40, paddingRight:40,
          boxShadow: isDark
            ?"0 40px 100px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,107,0,0.06), inset 0 1px 0 rgba(255,255,255,0.05)"
            :"0 32px 80px rgba(0,0,0,0.11), 0 0 0 1px rgba(255,107,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
          overflow:"hidden",
        }}
      >
        {/* Top line */}
        <div style={{
          position:"absolute", top:0, left:"7%", right:"7%", height:2.5,
          background:"linear-gradient(90deg,transparent,rgba(255,90,0,0.85) 28%,rgba(255,220,0,1) 50%,rgba(255,90,0,0.85) 72%,transparent)",
        }}/>
        <div style={{ position:"absolute", top:-55, left:"50%", transform:"translateX(-50%)", width:260, height:110, background:"radial-gradient(ellipse,rgba(255,107,0,0.09) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:12, right:12, width:50, height:50, borderTop:`1.5px solid ${isDark?"rgba(255,136,0,0.12)":"rgba(255,136,0,0.16)"}`, borderRight:`1.5px solid ${isDark?"rgba(255,136,0,0.12)":"rgba(255,136,0,0.16)"}`, borderRadius:"0 12px 0 0", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:12, left:12, width:50, height:50, borderBottom:`1.5px solid ${isDark?"rgba(96,165,250,0.1)":"rgba(96,165,250,0.14)"}`, borderLeft:`1.5px solid ${isDark?"rgba(96,165,250,0.1)":"rgba(96,165,250,0.14)"}`, borderRadius:"0 0 0 12px", pointerEvents:"none" }}/>

        <AnimatePresence mode="wait">
          {state === "loading" && (
            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <LoadingState isDark={isDark}/>
            </motion.div>
          )}
          {state === "success" && (
            <motion.div key="success" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.4 }}>
              <SuccessState isDark={isDark} onGoSettings={()=>router.push("/dashboard/settings")}/>
            </motion.div>
          )}
          {state === "error" && (
            <motion.div key="error" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.4 }}>
              <ErrorState
                message={message}
                isDark={isDark}
                onRequest={()=>router.push("/dashboard/settings")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        @keyframes veShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(220%)} 100%{transform:translateX(220%)} }
      `}</style>
    </div>
  );
}

// ── Default export with Suspense (required for useSearchParams in Next.js) ────
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPageInner />
    </Suspense>
  );
}