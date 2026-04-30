"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { tokenStorage } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

type State = "loading" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed:         "OAuth sign-in failed. Please try again.",
  unsupported_provider: "That login provider is not supported.",
  account_suspended:    "Your account has been suspended. Contact support.",
};

// ── Particle field canvas ─────────────────────────────────────────────────────
function ParticleCanvas({ isDark }: { isDark: boolean }) {
  const ref = useState(() => typeof document !== "undefined" ? document.createElement("canvas") : null)[0];
  const canvasRef = { current: ref };

  useEffect(() => {
    const el = document.getElementById("oc-canvas") as HTMLCanvasElement | null;
    if (!el) return;
    const ctx = el.getContext("2d")!;
    let raf: number;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      el.width  = el.offsetWidth  * dpr;
      el.height = el.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    type Orb = { x:number; y:number; r:number; vx:number; vy:number; hue:number; a:number };
    const orbs: Orb[] = [
      { x:0.15, y:0.25, r:0.32, vx: 0.0002, vy: 0.00018, hue:22,  a: isDark?0.08:0.05 },
      { x:0.82, y:0.70, r:0.28, vx:-0.0002, vy: 0.00022, hue:200, a: isDark?0.07:0.04 },
      { x:0.55, y:0.12, r:0.20, vx: 0.00018, vy:-0.0002, hue:265, a: isDark?0.06:0.035},
    ];

    type Particle = { x:number; y:number; vx:number; vy:number; life:number; maxLife:number; r:number };
    const particles: Particle[] = [];
    let frame = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick); frame++;
      const W = el.offsetWidth, H = el.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      // orbs
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x<-0.15||o.x>1.15) o.vx*=-1;
        if (o.y<-0.15||o.y>1.15) o.vy*=-1;
        const gx=o.x*W, gy=o.y*H, gr=o.r*Math.min(W,H);
        const g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
        g.addColorStop(0, `hsla(${o.hue},82%,58%,${o.a})`);
        g.addColorStop(1,"transparent");
        ctx.fillStyle=g;
        ctx.beginPath(); ctx.arc(gx,gy,gr,0,Math.PI*2); ctx.fill();
      });

      // floating particles
      if (frame%4===0 && particles.length < 35) {
        particles.push({
          x: Math.random()*W, y: H + 8,
          vx:(Math.random()-0.5)*0.6, vy:-(0.4+Math.random()*1.2),
          life:0, maxLife:80+Math.random()*80, r:1+Math.random()*2,
        });
      }
      for (let i=particles.length-1;i>=0;i--) {
        const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.life++;
        if (p.life>=p.maxLife||p.y<-10){particles.splice(i,1);continue;}
        const t=p.life/p.maxLife, a=Math.sin(t*Math.PI)*0.55;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*(1-t*0.4),0,Math.PI*2);
        ctx.fillStyle=`rgba(255,${136+Math.round(t*60)},0,${a})`;
        ctx.fill();
      }
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, [isDark]);

  return (
    <canvas id="oc-canvas" style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}/>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function OAuthCallbackPage() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [state,    setState]    = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const params  = new URLSearchParams(window.location.search);
    const access  = params.get("token");
    const refresh = params.get("refresh");
    const error   = params.get("error");

    if (error) {
      setErrorMsg(ERROR_MESSAGES[error] ?? "Sign-in failed. Please try again.");
      setState("error");
      return;
    }

    if (access && refresh) {
      tokenStorage.set(access, refresh);
      router.replace("/dashboard");
    } else {
      setErrorMsg("No tokens received from server. Please try again.");
      setState("error");
    }
  }, [router, mounted]);

  const pageBg  = isDark ? "#06050a" : "#f3f2ee";
  const cardBg  = isDark ? "rgba(10,8,18,0.90)" : "rgba(255,255,255,0.90)";
  const cardBdr = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  if (!mounted) return null;

  return (
    <div style={{
      minHeight:"100vh", background:pageBg,
      display:"flex", alignItems:"center", justifyContent:"center",
      position:"relative", overflow:"hidden", padding:"24px 16px",
    }}>
      <ParticleCanvas isDark={isDark}/>

      {/* Grid */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:isDark?0.025:0.014 }}>
        <defs>
          <pattern id="ocg" x="0" y="0" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M 52 0 L 0 0 0 52" fill="none" stroke={isDark?"#ff8800":"#000"} strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ocg)"/>
      </svg>

      {/* Logo */}
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55 }}
        style={{ position:"absolute", top:28, left:36, zIndex:10 }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <motion.div
            whileHover={{ scale:1.08, rotate:5 }}
            transition={{ type:"spring", stiffness:400, damping:18 }}
            style={{ width:38, height:38, borderRadius:11, background:"linear-gradient(135deg,#ff5500,#ffcc00)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 22px rgba(255,100,0,0.5)" }}
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
        initial={{ opacity:0, y:36, scale:0.91 }}
        animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}
        style={{
          position:"relative", zIndex:5,
          width:"100%", maxWidth:400,
          background:cardBg,
          backdropFilter:"blur(28px) saturate(1.4)",
          WebkitBackdropFilter:"blur(28px) saturate(1.4)",
          border:`1px solid ${cardBdr}`,
          borderRadius:28,
          paddingTop:48, paddingBottom:44, paddingLeft:40, paddingRight:40,
          boxShadow: isDark
            ?"0 40px 100px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,107,0,0.07), inset 0 1px 0 rgba(255,255,255,0.05)"
            :"0 32px 80px rgba(0,0,0,0.11), 0 0 0 1px rgba(255,107,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
          overflow:"hidden", textAlign:"center",
        }}
      >
        {/* Top accent */}
        <div style={{
          position:"absolute", top:0, left:"7%", right:"7%", height:2.5,
          background:"linear-gradient(90deg,transparent,rgba(255,90,0,0.85) 28%,rgba(255,220,0,1) 50%,rgba(255,90,0,0.85) 72%,transparent)",
        }}/>
        <div style={{ position:"absolute", top:-55, left:"50%", transform:"translateX(-50%)", width:260, height:110, background:"radial-gradient(ellipse,rgba(255,107,0,0.09) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:12, right:12, width:50, height:50, borderTop:`1.5px solid ${isDark?"rgba(255,136,0,0.12)":"rgba(255,136,0,0.16)"}`, borderRight:`1.5px solid ${isDark?"rgba(255,136,0,0.12)":"rgba(255,136,0,0.16)"}`, borderRadius:"0 12px 0 0", pointerEvents:"none" }}/>

        <AnimatePresence mode="wait">
          {/* ── LOADING ── */}
          {state === "loading" && (
            <motion.div key="loading"
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
              transition={{ duration:0.4 }}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24 }}
            >
              {/* Multi-ring spinner */}
              <div style={{ position:"relative", width:88, height:88, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <motion.div
                  animate={{ rotate:360 }}
                  transition={{ duration:1.3, repeat:Infinity, ease:"linear" }}
                  style={{ position:"absolute", width:80, height:80, borderRadius:"50%", border:`2.5px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"}`, borderTopColor:"#ff8800", boxShadow:"0 0 20px rgba(255,136,0,0.28)" }}
                />
                <motion.div
                  animate={{ rotate:-360 }}
                  transition={{ duration:2, repeat:Infinity, ease:"linear" }}
                  style={{ position:"absolute", width:62, height:62, borderRadius:"50%", border:"2px solid transparent", borderTopColor:"rgba(255,204,0,0.5)", borderLeftColor:"rgba(255,204,0,0.2)" }}
                />
                <motion.div
                  animate={{ scale:[1,1.1,1], opacity:[0.7,1,0.7] }}
                  transition={{ duration:1.8, repeat:Infinity, ease:"easeInOut" }}
                  style={{
                    width:40, height:40, borderRadius:12,
                    background:"linear-gradient(135deg,#ff5500,#ffcc00)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 0 22px rgba(255,100,0,0.48)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isDark?"#050508":"#fff"}>
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </motion.div>
              </div>

              <div>
                <h2 style={{ fontFamily:"Syne, sans-serif", fontWeight:900, fontSize:21, color:"var(--text)", margin:"0 0 8px", letterSpacing:"-0.02em" }}>
                  Completing sign in…
                </h2>
                <p style={{ fontFamily:"DM Sans, sans-serif", fontSize:14, color:isDark?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.42)", margin:"0 0 20px" }}>
                  Hang tight, you&#39;re being redirected.
                </p>

                {/* Animated progress bar */}
                <div style={{ width:200, height:3, borderRadius:2, background:isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)", overflow:"hidden", margin:"0 auto" }}>
                  <motion.div
                    animate={{ x:["-100%","100%"] }}
                    transition={{ duration:1.6, repeat:Infinity, ease:"easeInOut" }}
                    style={{ height:"100%", width:"55%", background:"linear-gradient(90deg,transparent,#ff8800,#ffcc00,transparent)", borderRadius:2 }}
                  />
                </div>
              </div>

              {/* Floating status dots */}
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                {["Verifying identity","Fetching profile","Redirecting"].map((step, i) => (
                  <motion.div key={step}
                    initial={{ opacity:0.3, scale:0.95 }}
                    animate={{ opacity:[0.3,1,0.3], scale:[0.95,1.02,0.95] }}
                    transition={{ duration:1.8, delay:i*0.55, repeat:Infinity, ease:"easeInOut" }}
                    style={{
                      paddingTop:6, paddingBottom:6, paddingLeft:11, paddingRight:11,
                      borderRadius:20, fontSize:11, fontFamily:"DM Sans, sans-serif", fontWeight:600,
                      background: isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",
                      border: `1px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)"}`,
                      color:isDark?"rgba(255,255,255,0.45)":"rgba(0,0,0,0.45)",
                      whiteSpace:"nowrap",
                    }}
                  >
                    {step}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {state === "error" && (
            <motion.div key="error"
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
              transition={{ duration:0.4 }}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}
            >
              {/* Icon */}
              <div style={{ position:"relative", width:90, height:90, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22 }}>
                {[1,2].map(i=>(
                  <motion.div key={i}
                    initial={{ scale:0, opacity:0.6 }}
                    animate={{ scale:2.8, opacity:0 }}
                    transition={{ duration:2.2, delay:i*0.5, repeat:Infinity, ease:"easeOut" }}
                    style={{ position:"absolute", width:58, height:58, borderRadius:"50%", border:"1.5px solid rgba(239,68,68,0.4)" }}
                  />
                ))}
                <motion.div
                  initial={{ scale:0, rotate:-20 }} animate={{ scale:1, rotate:0 }}
                  transition={{ type:"spring", stiffness:200, damping:14 }}
                  style={{
                    width:68, height:68, borderRadius:20,
                    background:"rgba(239,68,68,0.08)", border:"1.5px solid rgba(239,68,68,0.28)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 0 28px rgba(239,68,68,0.16)", color:"#ef4444",
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </motion.div>
              </div>

              <motion.h2 initial={{ y:10, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.15 }}
                style={{ fontFamily:"Syne, sans-serif", fontWeight:900, fontSize:22, color:"#ef4444", margin:"0 0 6px", letterSpacing:"-0.025em" }}>
                Sign-in Failed
              </motion.h2>
              <motion.div initial={{ scaleX:0, originX:"center" }} animate={{ scaleX:1 }} transition={{ delay:0.28 }}
                style={{ width:38, height:3, borderRadius:2, background:"linear-gradient(90deg,#dc2626,#ef4444)", marginBottom:12 }}
              />
              <motion.p initial={{ y:8, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.22 }}
                style={{ fontFamily:"DM Sans, sans-serif", fontSize:14, color:isDark?"rgba(255,255,255,0.45)":"rgba(0,0,0,0.48)", margin:"0 0 28px", lineHeight:1.65 }}>
                {errorMsg}
              </motion.p>

              <motion.div initial={{ y:8, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.32 }}
                style={{ width:"100%", display:"flex", flexDirection:"column", gap:10 }}>
                <motion.button
                  onClick={() => router.push("/login")}
                  whileHover={{ scale:1.025, boxShadow:"0 0 32px rgba(255,100,0,0.45)" }}
                  whileTap={{ scale:0.975 }}
                  style={{
                    width:"100%", paddingTop:14, paddingBottom:14, paddingLeft:20, paddingRight:20,
                    borderRadius:14, border:"none",
                    background:"linear-gradient(135deg,#ff5500 0%,#ff8800 50%,#ffcc00 100%)",
                    color:"#fff", fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:15,
                    cursor:"pointer", boxShadow:"0 0 28px rgba(255,100,0,0.36)",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:9,
                    position:"relative", overflow:"hidden",
                  }}
                >
                  <span style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,transparent 25%,rgba(255,255,255,0.2) 50%,transparent 75%)", animation:"ocShimmer 2.2s ease-in-out infinite" }}/>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position:"relative" }}>
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  <span style={{ position:"relative" }}>Back to Login</span>
                </motion.button>

                <Link href="/"
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                    paddingTop:13, paddingBottom:13,
                    borderRadius:14, border:`1.5px solid ${isDark?"rgba(255,255,255,0.09)":"rgba(0,0,0,0.09)"}`,
                    color:isDark?"rgba(255,255,255,0.45)":"rgba(0,0,0,0.45)", fontFamily:"DM Sans, sans-serif", fontSize:14, fontWeight:600,
                    textDecoration:"none",
                  }}
                >
                  Go to Home
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        @keyframes ocShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(220%)} 100%{transform:translateX(220%)} }
      `}</style>
    </div>
  );
}
