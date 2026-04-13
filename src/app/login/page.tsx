"use client";
import { useState, useEffect, useRef, useCallback, FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const OAUTH_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/crowdspark";

// ── Icosahedron geometry ─────────────────────────────────────────────────────
const φ = (1 + Math.sqrt(5)) / 2;
const ICO_VERTS: [number, number, number][] = [
  [-1, φ, 0], [1, φ, 0], [-1, -φ, 0], [1, -φ, 0],
  [0, -1, φ], [0, 1, φ], [0, -1, -φ], [0, 1, -φ],
  [φ, 0, -1], [φ, 0, 1], [-φ, 0, -1], [-φ, 0, 1],
].map(v => { const l = Math.hypot(...v); return v.map(c => c / l) as [number, number, number]; });

const ICO_EDGES: [number, number][] = [
  [0,1],[0,5],[0,7],[0,10],[0,11],[1,5],[1,7],[1,8],[1,9],
  [2,3],[2,4],[2,6],[2,10],[2,11],[3,4],[3,6],[3,8],[3,9],
  [4,5],[4,9],[4,11],[5,9],[5,11],[6,7],[6,8],[6,10],
  [7,8],[7,10],[8,9],[10,11],
];

function ry3(v: [number,number,number], a: number): [number,number,number] {
  const [x,y,z] = v; return [x*Math.cos(a)+z*Math.sin(a), y, -x*Math.sin(a)+z*Math.cos(a)];
}
function rx3(v: [number,number,number], a: number): [number,number,number] {
  const [x,y,z] = v; return [x, y*Math.cos(a)-z*Math.sin(a), y*Math.sin(a)+z*Math.cos(a)];
}
function proj3(v: [number,number,number], cx:number, cy:number, sc:number): [number,number,number] {
  const [x,y,z] = v; const f = 5/(5+z*0.4)*sc; return [x*f+cx, -y*f+cy, z];
}

// ── Full-screen scene canvas ──────────────────────────────────────────────────
function SceneCanvas({ isDark }: { isDark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number, ry = 0, rx = 0.28;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    type Spark = { x:number; y:number; vx:number; vy:number; life:number; maxLife:number; r:number; hue:number };
    const sparks: Spark[] = [];
    type Orb   = { x:number; y:number; r:number; vx:number; vy:number; hue:number; a:number };
    const orbs: Orb[] = [
      { x:0.12, y:0.22, r:0.34, vx: 0.0003, vy: 0.0002, hue:22,  a: isDark?0.09:0.065 },
      { x:0.82, y:0.70, r:0.30, vx:-0.0002, vy: 0.0003, hue:178, a: isDark?0.07:0.05  },
      { x:0.55, y:0.12, r:0.22, vx: 0.0002, vy:-0.0003, hue:260, a: isDark?0.06:0.04  },
      { x:0.08, y:0.80, r:0.20, vx: 0.0003, vy:-0.0002, hue:42,  a: isDark?0.06:0.038 },
      { x:0.90, y:0.40, r:0.18, vx:-0.0003, vy: 0.0001, hue:200, a: isDark?0.055:0.035},
    ];
    const W = () => canvas.offsetWidth, H = () => canvas.offsetHeight;
    let frame = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      frame++;
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      // Ambient orbs
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

      // Icosahedron 1 – bottom-left
      ry+=0.0046; rx+=0.0019;
      const ix1=w*0.11, iy1=h*0.73, is1=Math.min(w,h)*0.19;
      const tv1=ICO_VERTS.map(v=>ry3(rx3(v,rx),ry));
      const pv1=tv1.map(v=>proj3(v,ix1,iy1,is1));
      const se1=[...ICO_EDGES].sort((a,b)=>(tv1[a[0]][2]+tv1[a[1]][2])-(tv1[b[0]][2]+tv1[b[1]][2]));
      ctx.save();
      se1.forEach(([i,j])=>{
        const [x1,y1]=pv1[i],[x2,y2]=pv1[j];
        const t=((tv1[i][2]+tv1[j][2])*0.5+1)*0.5;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle=`hsla(${20+t*32},95%,60%,${0.11+t*0.56})`;
        ctx.lineWidth=0.5+t*1.5;
        ctx.shadowColor=`hsla(${20+t*32},90%,55%,${t*0.42})`;
        ctx.shadowBlur=4+t*8;
        ctx.stroke();
      });
      pv1.forEach(([x,y],i)=>{
        const t=(tv1[i][2]+1)*0.5, r=1.2+t*2.9;
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
        ctx.fillStyle=`hsla(${35+t*20},100%,62%,${0.22+t*0.68})`;
        ctx.shadowColor=`rgba(255,150,0,${t*0.6})`; ctx.shadowBlur=10+t*7; ctx.fill();
      });
      ctx.restore();

      // Icosahedron 2 – top-right, teal tones
      const ix2=w*0.89, iy2=h*0.2, is2=Math.min(w,h)*0.14;
      const tv2=ICO_VERTS.map(v=>ry3(rx3(v,rx*0.58+1.2),ry*1.4+0.8));
      const pv2=tv2.map(v=>proj3(v,ix2,iy2,is2));
      const se2=[...ICO_EDGES].sort((a,b)=>(tv2[a[0]][2]+tv2[a[1]][2])-(tv2[b[0]][2]+tv2[b[1]][2]));
      ctx.save();
      se2.forEach(([i,j])=>{
        const [x1,y1]=pv2[i],[x2,y2]=pv2[j];
        const t=((tv2[i][2]+tv2[j][2])*0.5+1)*0.5;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle=`hsla(${195+t*55},88%,58%,${0.09+t*0.48})`;
        ctx.lineWidth=0.4+t*1.1;
        ctx.shadowColor=`hsla(${195+t*55},85%,55%,${t*0.36})`;
        ctx.shadowBlur=3+t*6; ctx.stroke();
      });
      pv2.forEach(([x,y],i)=>{
        const t=(tv2[i][2]+1)*0.5, r=1+t*2.3;
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
        ctx.fillStyle=`hsla(${200+t*40},90%,62%,${0.18+t*0.58})`;
        ctx.shadowColor=`rgba(0,210,180,${t*0.5})`; ctx.shadowBlur=8+t*6; ctx.fill();
      });
      ctx.restore();

      // Fire sparks rising from bottom
      if (frame%3===0) sparks.push({
        x: w*0.5+(Math.random()-0.5)*w*0.22, y: h*1.02,
        vx:(Math.random()-0.5)*1.2, vy:-(0.9+Math.random()*2.9),
        life:0, maxLife:65+Math.random()*110,
        r:1.3+Math.random()*3.2, hue:8+Math.random()*40,
      });
      ctx.save();
      for (let k=sparks.length-1;k>=0;k--) {
        const s=sparks[k];
        s.x+=s.vx; s.y+=s.vy; s.vy*=0.99; s.vx+=(Math.random()-0.5)*0.07; s.life++;
        if (s.life>=s.maxLife||s.y<-30){sparks.splice(k,1);continue;}
        const t=s.life/s.maxLife, a=Math.sin(t*Math.PI)*0.82, sr=s.r*(1-t*0.56);
        const sg=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,sr*3);
        sg.addColorStop(0,`hsla(${s.hue},100%,65%,${a})`);
        sg.addColorStop(0.45,`hsla(${s.hue+18},85%,52%,${a*0.4})`);
        sg.addColorStop(1,"transparent");
        ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(s.x,s.y,sr*3,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();

      // Horizontal scan line
      const sy=((frame*0.35)%(h+60))-30;
      const sl=ctx.createLinearGradient(0,sy-1,0,sy+1);
      sl.addColorStop(0,"transparent");
      sl.addColorStop(0.5,`rgba(255,145,0,${isDark?0.035:0.02})`);
      sl.addColorStop(1,"transparent");
      ctx.fillStyle=sl; ctx.fillRect(0,sy-1,w,2);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, [isDark]);

  return <canvas ref={ref} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}/>;
}

// ── Floating stat pills ───────────────────────────────────────────────────────
const FLOAT_PILLS = [
  { num:"12,400+", label:"Campaigns funded", color:"#ff8800", x:"-1%",  y:"14%", delay:0   },
  { num:"₹98M",   label:"Total raised",     color:"#34d399", x:"78%",  y:"8%",  delay:0.5 },
  { num:"3.4L+",  label:"Active backers",   color:"#a78bfa", x:"-2%",  y:"74%", delay:1.1 },
  { num:"94%",    label:"Success rate",     color:"#60a5fa", x:"79%",  y:"78%", delay:0.8 },
];

function FloatPill({ p, isDark }: { p: typeof FLOAT_PILLS[0]; isDark: boolean }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:0.7, y:12 }}
      animate={{ opacity:1, scale:1, y:0 }}
      transition={{ delay:p.delay+0.7, duration:0.55, ease:[0.22,1,0.36,1] }}
      style={{
        position:"absolute", left:p.x, top:p.y,
        paddingTop:10, paddingBottom:10, paddingLeft:16, paddingRight:16,
        borderRadius:14,
        background: isDark?"rgba(10,8,18,0.82)":"rgba(255,255,255,0.88)",
        border:`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"}`,
        backdropFilter:"blur(20px)",
        WebkitBackdropFilter:"blur(20px)",
        boxShadow: isDark
          ?"0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)"
          :"0 8px 32px rgba(0,0,0,0.1)",
        whiteSpace:"nowrap", pointerEvents:"none", zIndex:4,
      }}
    >
      <motion.div
        animate={{ y:[0,-5,0] }}
        transition={{ duration:3+p.delay*0.5, repeat:Infinity, ease:"easeInOut" }}
      >
        <p style={{ fontFamily:"Syne, sans-serif", fontWeight:900, fontSize:19, color:p.color, margin:"0 0 2px", letterSpacing:"-0.025em", textShadow:`0 0 18px ${p.color}88` }}>{p.num}</p>
        <p style={{ fontFamily:"DM Sans, sans-serif", fontSize:10.5, color:isDark?"rgba(255,255,255,0.42)":"rgba(0,0,0,0.45)", margin:0 }}>{p.label}</p>
      </motion.div>
    </motion.div>
  );
}

// ── Forge Input ── NO padding shorthand mixing (fixes React console warning) ──
function ForgeInput({ label, type="text", value, onChange, autoComplete, required, isDark, suffix }: {
  label:string; type?:string; value:string; onChange:(v:string)=>void;
  autoComplete?:string; required?:boolean; isDark:boolean; suffix?:React.ReactNode;
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
        type={type} value={value}
        onChange={e=>onChange(e.target.value)}
        onFocus={()=>setFocused(true)}
        onBlur ={()=>setFocused(false)}
        autoComplete={autoComplete} required={required}
        style={{
          width:"100%", boxSizing:"border-box" as const,
          /* ✅ All explicit — never mix shorthand `padding` with `paddingRight` */
          paddingTop:    lifted ? 24 : 16,
          paddingBottom: lifted ? 8  : 16,
          paddingLeft:   16,
          paddingRight:  suffix ? 50 : 16,
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
        }}
      />

      {/* Animated laser scan on focus */}
      {focused && (
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2.5, borderRadius:"0 0 14px 14px", overflow:"hidden", pointerEvents:"none" }}>
          <div style={{ height:"100%", width:"55%", background:"linear-gradient(90deg,transparent,#ff6b00,#ffcc00,#ff6b00,transparent)", animation:"laserScan 1.1s ease-in-out infinite" }}/>
        </div>
      )}

      {suffix && (
        <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:isDark?"rgba(255,255,255,0.32)":"rgba(0,0,0,0.32)", cursor:"pointer", display:"flex", alignItems:"center", zIndex:3 }}>
          {suffix}
        </div>
      )}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function EyeIcon({ off=false }: { off?:boolean }) {
  return off ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { isDark } = useTheme();
  const [identifier, setIdentifier] = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string|null>(null);
  const [mounted,    setMounted]    = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setError(null); setLoading(true);
    try {
      await authApi.login(identifier.trim(), password);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Check your credentials.");
    } finally { setLoading(false); }
  }, [identifier, password]);

  const canSubmit = !loading && identifier.length > 0 && password.length > 0;
  const pageBg    = isDark ? "#06050a" : "#f3f2ee";
  const cardBg    = isDark ? "rgba(10,8,18,0.88)" : "rgba(255,255,255,0.88)";
  const cardBdr   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const mutedClr  = isDark ? "rgba(255,255,255,0.4)"  : "rgba(0,0,0,0.42)";
  const divBdr    = isDark ? "rgba(255,255,255,0.08)"  : "rgba(0,0,0,0.09)";

  if (!mounted) return null;

  return (
    <div style={{
      minHeight:"100vh", background:pageBg,
      display:"flex", alignItems:"center", justifyContent:"center",
      position:"relative", overflow:"hidden",
    }}>
      {/* Animated canvas BG */}
      <SceneCanvas isDark={isDark}/>

      {/* Grid overlay */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:isDark?0.028:0.016 }}>
        <defs>
          <pattern id="lg" x="0" y="0" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M 52 0 L 0 0 0 52" fill="none" stroke={isDark?"#ff8800":"#000"} strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lg)"/>
      </svg>

      {/* Edge vignettes */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:200, background:`linear-gradient(to bottom,${isDark?"rgba(6,5,10,0.55)":"rgba(243,242,238,0.55)"} 0%,transparent 100%)`, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:200, background:`linear-gradient(to top,${isDark?"rgba(6,5,10,0.55)":"rgba(243,242,238,0.55)"} 0%,transparent 100%)`, pointerEvents:"none" }}/>

      {/* Floating stat pills */}
      {FLOAT_PILLS.map(p => <FloatPill key={p.label} p={p} isDark={isDark}/>)}

      {/* Logo — top left */}
      <motion.div
        initial={{ opacity:0, y:-22 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.6, ease:"easeOut" }}
        style={{ position:"absolute", top:28, left:36, display:"flex", alignItems:"center", gap:10, zIndex:10 }}
      >
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
      </motion.div>

      {/* ─── Glass card ─── */}
      <motion.div
        initial={{ opacity:0, y:38, scale:0.91 }}
        animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:0.72, ease:[0.22,1,0.36,1] }}
        style={{
          position:"relative", zIndex:5,
          width:"100%", maxWidth:462, margin:"0 16px",
          background:cardBg,
          backdropFilter:"blur(30px) saturate(1.5)",
          WebkitBackdropFilter:"blur(30px) saturate(1.5)",
          border:`1px solid ${cardBdr}`,
          borderRadius:28,
          paddingTop:44, paddingBottom:40,
          paddingLeft:42, paddingRight:42,
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

        {/* Inner card glow */}
        <div style={{ position:"absolute", top:-55, left:"50%", transform:"translateX(-50%)", width:300, height:110, background:"radial-gradient(ellipse,rgba(255,107,0,0.1) 0%,transparent 70%)", pointerEvents:"none" }}/>

        {/* Corner decorations */}
        <div style={{ position:"absolute", top:12, right:12, width:60, height:60, borderTop:`1.5px solid ${isDark?"rgba(255,136,0,0.12)":"rgba(255,136,0,0.18)"}`, borderRight:`1.5px solid ${isDark?"rgba(255,136,0,0.12)":"rgba(255,136,0,0.18)"}`, borderRadius:"0 12px 0 0", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:12, left:12, width:60, height:60, borderBottom:`1.5px solid ${isDark?"rgba(96,165,250,0.1)":"rgba(96,165,250,0.15)"}`, borderLeft:`1.5px solid ${isDark?"rgba(96,165,250,0.1)":"rgba(96,165,250,0.15)"}`, borderRadius:"0 0 0 12px", pointerEvents:"none" }}/>

        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity:0, y:18 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.18, duration:0.5 }}
          style={{ marginBottom:34 }}
        >
          <h1 style={{
            fontFamily:"Syne, sans-serif", fontWeight:900,
            fontSize:"clamp(30px,4vw,42px)",
            color:"var(--text)", letterSpacing:"-0.03em",
            margin:"0 0 8px", lineHeight:1.06,
          }}>Welcome back</h1>
          <motion.div
            initial={{ scaleX:0, originX:"left" }}
            animate={{ scaleX:1 }}
            transition={{ delay:0.45, duration:0.5, ease:"easeOut" }}
            style={{ width:56, height:3.5, borderRadius:2, background:"linear-gradient(90deg,#ff5500,#ffcc00)", marginBottom:12, boxShadow:"0 0 16px rgba(255,107,0,0.58)" }}
          />
          <p style={{ fontFamily:"DM Sans, sans-serif", fontSize:14.5, color:mutedClr, margin:0 }}>
            Sign in to your CrowdSpark account
          </p>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity:0, y:-8, scale:0.97 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, scale:0.97 }}
              style={{
                paddingTop:12, paddingBottom:12, paddingLeft:16, paddingRight:16,
                borderRadius:13, background:"rgba(239,68,68,0.07)",
                border:"1px solid rgba(239,68,68,0.22)", marginBottom:24,
                color:"#ef4444", fontSize:13.5, fontFamily:"DM Sans, sans-serif",
                display:"flex", alignItems:"flex-start", gap:10,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <motion.div initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.26, duration:0.4 }}>
            <ForgeInput label="Username / Email / Phone" value={identifier} onChange={setIdentifier} autoComplete="username" required isDark={isDark}/>
          </motion.div>
          <motion.div initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.33, duration:0.4 }}>
            <ForgeInput
              label="Password" type={showPass?"text":"password"}
              value={password} onChange={setPassword}
              autoComplete="current-password" required isDark={isDark}
              suffix={
                <button type="button" onClick={()=>setShowPass(v=>!v)}
                  style={{ background:"none", border:"none", cursor:"pointer", padding:0, color:"inherit", display:"flex", alignItems:"center" }}>
                  <EyeIcon off={showPass}/>
                </button>
              }
            />
          </motion.div>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.38 }} style={{ textAlign:"right", marginTop:-6 }}>
            <Link href="/forgot-password" style={{ fontFamily:"DM Sans, sans-serif", fontSize:12.5, color:"#ff8800", textDecoration:"none", fontWeight:600 }}>
              Forgot password?
            </Link>
          </motion.div>

          {/* Submit button */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.42, duration:0.4 }}>
            <motion.button
              type="submit" disabled={!canSubmit}
              whileHover={canSubmit?{ scale:1.025, boxShadow:"0 0 48px rgba(255,100,0,0.54)" }:{}}
              whileTap  ={canSubmit?{ scale:0.975 }:{}}
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
                display:"flex", alignItems:"center", justifyContent:"center", gap:9, marginTop:4,
              }}
            >
              {canSubmit && <span style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,transparent 25%,rgba(255,255,255,0.22) 50%,transparent 75%)", animation:"lpShimmer 2.2s ease-in-out infinite" }}/>}
              {loading ? (
                <>
                  <span style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"lpSpin .65s linear infinite", flexShrink:0 }}/>
                  <span style={{ position:"relative" }}>Signing in…</span>
                </>
              ) : (
                <span style={{ position:"relative", display:"flex", alignItems:"center", gap:8 }}>
                  Sign in
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Divider */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          style={{ display:"flex", alignItems:"center", gap:12, margin:"26px 0" }}>
          <div style={{ flex:1, height:1, background:divBdr }}/>
          <span style={{ fontFamily:"DM Sans, sans-serif", fontSize:11.5, color:mutedClr, letterSpacing:"0.05em" }}>or continue with</span>
          <div style={{ flex:1, height:1, background:divBdr }}/>
        </motion.div>

        {/* OAuth */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.55, duration:0.4 }}
          style={{ display:"flex", gap:10 }}>
          {[
            { label:"Google", icon:<GoogleIcon/>, href:`${OAUTH_BASE}/oauth2/authorization/google` },
            { label:"GitHub", icon:<GithubIcon/>, href:`${OAUTH_BASE}/oauth2/authorization/github` },
          ].map(({ label, icon, href }) => (
            <motion.a key={label} href={href}
              whileHover={{ y:-2, borderColor:"rgba(255,136,0,0.42)", boxShadow:"0 8px 28px rgba(0,0,0,0.16)" }}
              whileTap={{ scale:0.97 }}
              style={{
                flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:9,
                paddingTop:12, paddingBottom:12, paddingLeft:16, paddingRight:16,
                borderRadius:13, border:`1.5px solid ${cardBdr}`,
                background: isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.02)",
                color:"var(--text)", fontFamily:"DM Sans, sans-serif", fontSize:14, fontWeight:600,
                textDecoration:"none", transition:"border-color 0.18s",
                boxShadow: isDark?"inset 0 1px 0 rgba(255,255,255,0.05)":"inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              {icon}{label}
            </motion.a>
          ))}
        </motion.div>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.62 }}
          style={{ marginTop:28, textAlign:"center", color:mutedClr, fontFamily:"DM Sans, sans-serif", fontSize:14 }}>
          {"Don't have an account? "}
          <Link href="/register" style={{ color:"#ff8800", fontWeight:700, textDecoration:"none" }}>Sign up free →</Link>
        </motion.p>
      </motion.div>

      <style>{`
        @keyframes lpShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(220%)} 100%{transform:translateX(220%)} }
        @keyframes lpSpin    { to{transform:rotate(360deg)} }
        @keyframes laserScan { 0%{transform:translateX(-200%)} 100%{transform:translateX(400%)} }
      `}</style>
    </div>
  );
}