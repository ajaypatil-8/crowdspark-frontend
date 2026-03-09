"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile, calcCompletion, getBadge, COMPLETION_FIELDS } from "./layout";

/* ── animated counter ── */
function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    let start = 0;
    const dur = 1400;
    const t0  = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.floor(ease * to));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to]);
  return <>{prefix}{val.toLocaleString("en-IN")}{suffix}</>;
}

/* ── stat card ── */
function StatCard({ label, value, raw, icon, color, delay }: {
  label: string; value: string; raw: number; icon: string; color: string; delay: number;
}) {
  const { isDark } = useTheme();
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div ref={ref} style={{
      padding: "24px", borderRadius: 20, position: "relative", overflow: "hidden",
      background: isDark
        ? "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)"
        : "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
      border: isDark ? `1px solid ${color}25` : `1px solid ${color}30`,
      boxShadow: isDark ? `0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)` : `0 4px 24px rgba(0,0,0,0.06)`,
      backdropFilter: "blur(20px)",
      transform: vis ? "translateY(0)" : "translateY(20px)",
      opacity: vis ? 1 : 0,
      transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease",
      cursor: "default",
    }}
      onMouseEnter={e => {
        const d = e.currentTarget as HTMLDivElement;
        d.style.transform = "translateY(-4px)";
        d.style.boxShadow = `0 12px 40px ${color}30, 0 0 0 1px ${color}20`;
        d.style.borderColor = `${color}50`;
      }}
      onMouseLeave={e => {
        const d = e.currentTarget as HTMLDivElement;
        d.style.transform = "translateY(0)";
        d.style.boxShadow = isDark ? `0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)` : `0 4px 24px rgba(0,0,0,0.06)`;
        d.style.borderColor = `${color}25`;
      }}
    >
      {/* glow blob */}
      <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:"50%", background:`${color}15`, filter:"blur(30px)", pointerEvents:"none" }} />
      {/* top shimmer line */}
      <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:1, background:`linear-gradient(90deg,transparent,${color}60,transparent)` }} />

      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{
          width:44, height:44, borderRadius:14,
          background:`linear-gradient(135deg,${color}25,${color}10)`,
          border:`1px solid ${color}30`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
          boxShadow:`0 0 16px ${color}20`,
        }}>{icon}</div>
        <div style={{ width:6, height:6, borderRadius:"50%", background:color, boxShadow:`0 0 8px ${color}`, marginTop:6 }} />
      </div>

      <p style={{
        fontFamily:"Syne, sans-serif", fontWeight:800,
        fontSize:30, color:"var(--text)", margin:"0 0 4px", letterSpacing:"-0.03em", lineHeight:1,
      }}>
        {vis ? <Counter to={raw} prefix={value.startsWith("₹")?"₹":""} suffix={value.endsWith("L")?value.replace(/[^L]/g,"").replace("L","L"):""} /> : "0"}
      </p>
      <p style={{ fontSize:13, color:"var(--text-muted)", fontFamily:"DM Sans, sans-serif", margin:0, fontWeight:500 }}>{label}</p>
    </div>
  );
}

/* ── ring progress ── */
function RingProgress({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDrawn(pct), 300);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={6} stroke="rgba(255,255,255,0.07)" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={6}
        stroke={color} strokeDasharray={c} strokeLinecap="round"
        strokeDashoffset={c * (1 - drawn/100)}
        style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}

/* ── completion card ── */
function CompletionCard() {
  const { user } = useProfile();
  const { isDark } = useTheme();
  if (!user) return null;
  const pct   = calcCompletion(user);
  const badge = getBadge(pct);
  const done  = COMPLETION_FIELDS.filter(f => f.check(user));
  const todo  = COMPLETION_FIELDS.filter(f => !f.check(user));

  return (
    <div style={{
      borderRadius:20, overflow:"hidden",
      background: isDark ? "linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))" : "linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,255,255,0.8))",
      border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
      boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.06)" : "0 4px 24px rgba(0,0,0,0.06)",
    }}>
      {/* header */}
      <div style={{
        padding:"20px 24px", display:"flex", alignItems:"center", gap:20,
        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.04)",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${badge.color}50,transparent)` }} />

        <div style={{ position:"relative", flexShrink:0 }}>
          <RingProgress pct={pct} color={badge.color} size={72} />
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:14, color:badge.color, transform:"rotate(90deg)" }}>{pct}</span>
          </div>
        </div>

        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:17, color:"var(--text)" }}>Profile Completion</span>
          </div>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:999,
            background:`${badge.color}15`, border:`1px solid ${badge.color}30`,
            fontSize:12, fontWeight:700, color:badge.color, fontFamily:"Syne, sans-serif",
          }}>{badge.emoji} {badge.label}</span>
          <div style={{ marginTop:10, height:4, borderRadius:2, background: isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)", overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:2, background:`linear-gradient(90deg,#ff6b00,${badge.color})`, width:`${pct}%`, transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)", boxShadow:`0 0 10px ${badge.color}50` }} />
          </div>
        </div>
      </div>

      {/* checklist */}
      <div style={{ padding:"16px 24px" }}>
        {todo.length > 0 && (
          <>
            <p style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--text-muted)", fontFamily:"DM Sans, sans-serif", marginBottom:10 }}>
              Complete to unlock {todo.reduce((s,f)=>s+f.weight,0)} more %
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }} className="cc-grid">
              {todo.map(f => (
                <Link key={f.label} href="/dashboard/profile" style={{
                  display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:10,
                  textDecoration:"none", transition:"all 0.15s",
                  background: isDark?"rgba(255,255,255,0.025)":"rgba(0,0,0,0.025)",
                  border: isDark?"1px solid rgba(255,255,255,0.05)":"1px solid rgba(0,0,0,0.05)",
                }}
                  onMouseEnter={e=>{const a=e.currentTarget as HTMLAnchorElement;a.style.background=isDark?"rgba(255,107,0,0.08)":"rgba(255,107,0,0.05)";a.style.borderColor="rgba(255,107,0,0.3)";}}
                  onMouseLeave={e=>{const a=e.currentTarget as HTMLAnchorElement;a.style.background=isDark?"rgba(255,255,255,0.025)":"rgba(0,0,0,0.025)";a.style.borderColor=isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)";}}
                >
                  <div style={{ width:18, height:18, borderRadius:6, border:"1.5px dashed rgba(255,107,0,0.4)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(255,107,0,0.4)" }} />
                  </div>
                  <span style={{ fontSize:12, color:"var(--text-muted)", fontFamily:"DM Sans, sans-serif", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.label}</span>
                  <span style={{ fontSize:10, color:"#ff8800", fontWeight:700, fontFamily:"Syne, sans-serif", flexShrink:0 }}>+{f.weight}%</span>
                </Link>
              ))}
            </div>
          </>
        )}
        {done.length > 0 && todo.length > 0 && <div style={{ height:1, background: isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)", margin:"12px 0" }} />}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {done.map(f => (
            <span key={f.label} style={{
              display:"inline-flex", alignItems:"center", gap:5, padding:"4px 9px", borderRadius:999,
              background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)",
              fontSize:11, color:"#34d399", fontFamily:"DM Sans, sans-serif",
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              {f.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── activity feed ── */
function ActivityFeed() {
  const { isDark } = useTheme();
  const items = [
    { icon:"🎯", text:"Account created", sub:"Welcome to CrowdSpark", color:"#a78bfa", time:"Just now" },
    { icon:"📧", text:"Verify your email", sub:"Unlock full access", color:"#f59e0b", time:"Pending", link:"/dashboard/settings" },
    { icon:"🚀", text:"Complete your profile", sub:"Get discovered by creators", color:"#ff6b00", time:"In progress", link:"/dashboard/profile" },
  ];
  return (
    <div style={{
      borderRadius:20, overflow:"hidden",
      background: isDark?"linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))":"linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,255,255,0.8))",
      border: isDark?"1px solid rgba(255,255,255,0.08)":"1px solid rgba(0,0,0,0.06)",
    }}>
      <div style={{ padding:"16px 20px", borderBottom: isDark?"1px solid rgba(255,255,255,0.05)":"1px solid rgba(0,0,0,0.04)", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:14, height:2, borderRadius:1, background:"linear-gradient(90deg,#ff6b00,#ffcc00)", display:"inline-block" }} />
        <span style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:"var(--text)" }}>Activity</span>
      </div>
      <div style={{ padding:"8px 12px" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 8px", borderRadius:12, cursor:item.link?"pointer":"default", transition:"background 0.15s" }}
            onClick={()=>item.link && (window.location.href=item.link)}
            onMouseEnter={e=>{ if(item.link)(e.currentTarget as HTMLDivElement).style.background=isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"; }}
            onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background="transparent";}}
          >
            <div style={{ width:36, height:36, borderRadius:12, background:`${item.color}15`, border:`1px solid ${item.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{item.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontFamily:"DM Sans, sans-serif", fontWeight:600, fontSize:13, color:"var(--text)", margin:0 }}>{item.text}</p>
              <p style={{ fontFamily:"DM Sans, sans-serif", fontSize:11.5, color:"var(--text-muted)", margin:0 }}>{item.sub}</p>
            </div>
            <span style={{ fontSize:11, color:item.color, fontFamily:"Syne, sans-serif", fontWeight:600, flexShrink:0 }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── status pills ── */
function StatusPanel() {
  const { user } = useProfile();
  const { isDark } = useTheme();
  if (!user) return null;
  const items = [
    { label:"Email",   ok:user.emailVerified,             warn:!user.emailVerified,    icon:"📧" },
    { label:"Phone",   ok:user.phoneVerified,             warn:!user.phoneVerified,    icon:"📱" },
    { label:"KYC",     ok:user.kycStatus==="APPROVED",    warn:user.kycStatus==="PENDING_APPROVAL"||user.kycStatus==="PENDING_SUBMISSION", icon:"🪪" },
    { label:"Account", ok:user.accountStatus==="ACTIVE",  warn:false,                  icon:"⚡" },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
      {items.map(item => (
        <div key={item.label} style={{
          padding:"12px 14px", borderRadius:14, display:"flex", alignItems:"center", gap:10,
          background: item.ok
            ? (isDark?"rgba(52,211,153,0.06)":"rgba(52,211,153,0.05)")
            : item.warn
              ? (isDark?"rgba(245,158,11,0.06)":"rgba(245,158,11,0.05)")
              : (isDark?"rgba(239,68,68,0.06)":"rgba(239,68,68,0.05)"),
          border: item.ok?"1px solid rgba(52,211,153,0.2)":item.warn?"1px solid rgba(245,158,11,0.2)":"1px solid rgba(239,68,68,0.15)",
        }}>
          <span style={{ fontSize:18 }}>{item.icon}</span>
          <div>
            <p style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:"var(--text)", margin:0 }}>{item.label}</p>
            <p style={{ fontFamily:"DM Sans, sans-serif", fontSize:11, margin:0, color:item.ok?"#34d399":item.warn?"#f59e0b":"#ef4444" }}>
              {item.ok?"Verified":item.warn?"Pending":"Not set"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── quick actions ── */
function QuickActions() {
  const { isDark } = useTheme();
  const { user } = useProfile();
  const isCreator = user?.roles?.includes("CREATOR");
  const actions = [
    { label:"Edit Profile",       href:"/dashboard/profile",  icon:"✏️", color:"#a78bfa" },
    { label:"Settings & KYC",     href:"/dashboard/settings", icon:"⚙️", color:"#00f5d4" },
    { label:"Backed Projects",    href:"/dashboard/backed",   icon:"🎯", color:"#ff8800" },
    ...(isCreator ? [{ label:"Creator Dashboard", href:"/creator", icon:"🚀", color:"#ff6b00" }] : [{ label:"Become Creator", href:"/dashboard/settings", icon:"🚀", color:"#ff6b00" }]),
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
      {actions.map(a => (
        <Link key={a.label} href={a.href} style={{
          display:"flex", flexDirection:"column", alignItems:"flex-start", gap:6,
          padding:"14px", borderRadius:14, textDecoration:"none",
          background: isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)",
          border: isDark?"1px solid rgba(255,255,255,0.06)":"1px solid rgba(0,0,0,0.05)",
          transition:"all 0.18s", position:"relative", overflow:"hidden",
        }}
          onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.background=`${a.color}10`;el.style.borderColor=`${a.color}35`;el.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.background=isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)";el.style.borderColor=isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)";el.style.transform="translateY(0)";}}
        >
          <span style={{ fontSize:20 }}>{a.icon}</span>
          <span style={{ fontFamily:"DM Sans, sans-serif", fontWeight:600, fontSize:12.5, color:"var(--text)", lineHeight:1.3 }}>{a.label}</span>
          <span style={{ position:"absolute", bottom:10, right:12, fontSize:14, color:a.color, opacity:0.5 }}>→</span>
        </Link>
      ))}
    </div>
  );
}

/* ── main page ── */
export default function DashboardPage() {
  const { user, loading } = useProfile();
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", flexDirection:"column", gap:16 }}>
      <div style={{ position:"relative", width:48, height:48 }}>
        <div style={{ width:48, height:48, borderRadius:"50%", border:"3px solid rgba(255,107,0,0.15)", position:"absolute" }} />
        <div style={{ width:48, height:48, borderRadius:"50%", border:"3px solid transparent", borderTopColor:"#ff6b00", position:"absolute", animation:"spin 0.8s linear infinite" }} />
      </div>
      <p style={{ fontFamily:"DM Sans, sans-serif", fontSize:13, color:"var(--text-muted)" }}>Loading your dashboard…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN",{month:"long",year:"numeric"}) : "";

  return (
    <div style={{ padding:"36px 32px 60px", maxWidth:1100, margin:"0 auto",
      opacity: mounted?1:0, transform: mounted?"translateY(0)":"translateY(12px)",
      transition:"opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
    }}>

      {/* welcome header */}
      <div style={{ marginBottom:36, display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <p style={{ fontFamily:"DM Sans, sans-serif", fontSize:12.5, color:"var(--text-muted)", marginBottom:6, letterSpacing:"0.05em" }}>
            {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})} · Member since {joinDate}
          </p>
          <h1 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:"clamp(26px,3.5vw,40px)", color:"var(--text)", letterSpacing:"-0.03em", margin:0, lineHeight:1.1 }}>
            Hey, <span style={{ background:"linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          {user?.bio && <p style={{ fontSize:14, color:"var(--text-muted)", fontFamily:"DM Sans, sans-serif", marginTop:8, margin:"8px 0 0" }}>{user.bio}</p>}
        </div>
        <Link href="/dashboard/profile" style={{
          display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:12,
          background:"linear-gradient(135deg,#ff6b00,#ffcc00)", color:"#fff", textDecoration:"none",
          fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13,
          boxShadow:"0 0 24px rgba(255,100,0,0.35)", position:"relative", overflow:"hidden",
        }}>
          <span style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.25) 50%,transparent 70%)", animation:"shimmer 2.4s ease-in-out infinite" }} />
          <span style={{ position:"relative" }}>Edit Profile →</span>
        </Link>
      </div>

      {/* stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }} className="dash-stats">
        <StatCard label="Projects Backed"   value={String(user?.totalProjectsBacked??0)}   raw={user?.totalProjectsBacked??0}   icon="🎯" color="#00f5d4" delay={0}   />
        <StatCard label="Total Backed"      value={`₹${user?.totalAmountBacked??0}`}        raw={user?.totalAmountBacked??0}     icon="💰" color="#ff8800" delay={80}  />
        <StatCard label="Campaigns Created" value={String(user?.totalProjectsCreated??0)}   raw={user?.totalProjectsCreated??0}  icon="🚀" color="#a78bfa" delay={160} />
        <StatCard label="Funds Raised"      value={`₹${user?.totalFundsRaised??0}`}         raw={user?.totalFundsRaised??0}      icon="📈" color="#34d399" delay={240} />
      </div>

      {/* main grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16, alignItems:"start" }} className="dash-main">
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <CompletionCard />
          <ActivityFeed />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <p style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Account Status</p>
            <StatusPanel />
          </div>
          <div>
            <p style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Quick Actions</p>
            <QuickActions />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(200%)} 100%{transform:translateX(200%)} }
        @media (max-width:960px) { .dash-main  { grid-template-columns: 1fr !important; } }
        @media (max-width:860px) { .dash-stats { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width:500px) { .dash-stats { grid-template-columns: 1fr !important; } .cc-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}