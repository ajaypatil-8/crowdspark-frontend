"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/contexts/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

// ── Mock creator data ──────────────────────────────────────────────────────────
const CREATORS = [
  { id:1, name:"Priya Mehta",     handle:"@priyacreates",  role:"Music Producer",    city:"Mumbai",     campaigns:3, raised:"₹42L",  backers:3240, avatar:"#a78bfa", cat:"Music & Art",    story:"Raised ₹18L in 8 days for Svara, my Indian classical music app. CrowdSpark's community helped me reach backers across 18 countries.", rating:4.9, badge:"Top Creator" },
  { id:2, name:"Ravi Kumar",      handle:"@ravikagro",     role:"AgriTech Founder",  city:"Pune",       campaigns:2, raised:"₹67L",  backers:4870, avatar:"#00d4b8", cat:"AgriTech",        story:"My AgroSense sensors are now deployed on 200+ farms. CrowdSpark gave me the runway to prove the concept without VC pressure.", rating:4.8, badge:"Verified" },
  { id:3, name:"Ananya Singh",    handle:"@ananyaclean",   role:"CleanTech Engineer",city:"Bangalore",  campaigns:4, raised:"₹1.2Cr",backers:8910, avatar:"#34d399", cat:"CleanTech",       story:"CleanSip funded in 3 weeks. We're now supplying 12,000 households in rural Maharashtra. CrowdSpark changed my life.", rating:5.0, badge:"Star Creator" },
  { id:4, name:"Mohit Anand",     handle:"@mohitvayu",     role:"EV Entrepreneur",   city:"Delhi",      campaigns:2, raised:"₹89L",  backers:5430, avatar:"#4ade80", cat:"EV & Mobility",   story:"From prototype to 500 pre-orders in 6 weeks. The platform's analytics helped us refine pricing and hit our funding goal.", rating:4.7, badge:"Top Creator" },
  { id:5, name:"Neha Joshi",      handle:"@nehalearns",    role:"EdTech Creator",    city:"Hyderabad",  campaigns:2, raised:"₹28L",  backers:2100, avatar:"#60a5fa", cat:"Education",       story:"LearnBridge is now serving 45,000 students. I started with zero investors — just my campaign page and 2,100 believers.", rating:4.9, badge:"Verified" },
  { id:6, name:"Dr. Arun Pillai", handle:"@drarundx",      role:"HealthTech Founder",city:"Chennai",    campaigns:1, raised:"₹31L",  backers:1890, avatar:"#f87171", cat:"HealthTech",      story:"Our HealthNest kits are now used in 80+ cities. Crowdfunding let us stay patient-first instead of investor-first.", rating:4.8, badge:"Verified" },
];

const PROCESS_STEPS = [
  { num:"01", title:"Register & verify", desc:"Create your account and complete KYC in under 24 hours. PAN + Aadhaar verification unlocks the Creator role.", color:"#ff8800", icon:"◎" },
  { num:"02", title:"Build your campaign", desc:"Use our editor to craft your story, set your goal, define reward tiers, and add media. Our AI helps with copy.", color:"#a78bfa", icon:"◈" },
  { num:"03", title:"Launch & promote", desc:"Go live with one click. Share to social, use our built-in backer CRM, and watch the momentum grow.", color:"#34d399", icon:"✦" },
  { num:"04", title:"Get funded",         desc:"Reach your goal, funds are released from escrow within 3–5 days. GST invoice auto-generated. Ship your rewards.", color:"#60a5fa", icon:"⬡" },
];

const PLATFORM_STATS = [
  { val: "12,400+", label: "Campaigns launched",  color: "#ff8800" },
  { val: "₹98M+",  label: "Total raised",          color: "#34d399" },
  { val: "94%",    label: "Funding success rate",  color: "#a78bfa" },
  { val: "21 days", label: "Avg. time to fund",     color: "#60a5fa" },
];

type Creator = (typeof CREATORS)[number];

// ── Creator card ──────────────────────────────────────────────────────────────
function CreatorCard({
  c,
  isDark,
  card,
  bdr,
  txt,
  muted,
}: {
  c: Creator;
  isDark: boolean;
  card: string;
  bdr: string;
  txt: string;
  muted: string;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setFlipped(true)}
      onHoverEnd={() => setFlipped(false)}
      whileHover={{ y: -6 }}
      style={{ perspective: 1000, cursor: "pointer", height: 320 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
        style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" as const, borderRadius: 22, background: card, border: `1px solid ${bdr}`, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${c.avatar}88,transparent)` }}/>
          <div style={{ paddingTop: 28, paddingBottom: 20, paddingLeft: 24, paddingRight: 24, flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${c.avatar},${c.avatar}99)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 18, flexShrink: 0, boxShadow: `0 0 18px ${c.avatar}44` }}>
                {c.name.split(" ").map((w: string) => w[0]).join("")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15.5, color: txt, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                  {c.badge === "Star Creator" && <span style={{ fontSize: 13 }}>⭐</span>}
                </div>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)", margin: "0 0 5px" }}>{c.handle} · {c.city}</p>
                <span style={{ display: "inline-flex", paddingTop: 3, paddingBottom: 3, paddingLeft: 8, paddingRight: 8, borderRadius: 999, background: isDark ? `${c.avatar}18` : `${c.avatar}12`, border: `1px solid ${c.avatar}28`, fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, color: c.avatar, textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{c.badge}</span>
              </div>
            </div>

            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, lineHeight: 1.65, margin: "0 0 auto" }}>{c.role} · {c.cat}</p>

            <div style={{ display: "flex", gap: 0, marginTop: 16, borderRadius: 12, overflow: "hidden", border: `1px solid ${bdr}` }}>
              {[{ val: c.campaigns, label: "Campaigns" }, { val: c.raised, label: "Raised" }, { val: c.backers.toLocaleString("en-IN"), label: "Backers" }].map((s, i, arr) => (
                <div key={s.label} style={{ flex: 1, paddingTop: 8, paddingBottom: 8, textAlign: "center", borderRight: i < arr.length - 1 ? `1px solid ${bdr}` : "none", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)" }}>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, color: c.avatar, margin: 0, letterSpacing: "-0.02em" }}>{s.val}</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, color: muted, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ paddingBottom: 12, paddingLeft: 24, paddingRight: 24 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: muted, textAlign: "center", margin: 0 }}>Hover to read story →</p>
          </div>
        </div>

        {/* Back */}
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" as const, transform: "rotateY(180deg)", borderRadius: 22, background: isDark ? `linear-gradient(160deg,#0f0a05,#080508)` : `linear-gradient(160deg,#fff8f0,#f8f4ff)`, border: `1.5px solid ${c.avatar}40`, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 28, paddingBottom: 28, paddingLeft: 28, paddingRight: 28, boxShadow: `0 0 0 1px ${c.avatar}22, 0 24px 56px ${c.avatar}18` }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${c.avatar},transparent)` }}/>
          <span style={{ fontSize: 28, marginBottom: 16 }}>💬</span>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.78)", lineHeight: 1.75, margin: "0 0 18px", fontStyle: "italic" }}>&quot;{c.story}&quot;</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${c.avatar}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 12, boxShadow: `0 0 10px ${c.avatar}60` }}>
              {c.name.split(" ").map((w: string) => w[0]).join("")}
            </div>
            <div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: txt, margin: 0 }}>{c.name}</p>
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: i < Math.floor(c.rating) ? "#ffcc00" : muted, fontSize: 11 }}>★</span>
                ))}
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, color: muted, marginLeft: 4 }}>{c.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CreatorsPage() {
  const { isDark } = useTheme();
  const heroRef    = useRef<HTMLDivElement>(null);
  const stepsRef   = useRef<HTMLDivElement>(null);
  const statsRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".cr-hero-item", { y: 48, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out", delay: 0.2 });
      gsap.fromTo(".cr-card", { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.65, ease: "power2.out",
        scrollTrigger: { trigger: ".cr-cards-grid", start: "top 80%" } });
      gsap.fromTo(".cr-step", { x: -36, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.65, ease: "power2.out",
        scrollTrigger: { trigger: stepsRef.current, start: "top 78%" } });
      gsap.fromTo(".cr-stat", { y: 32, opacity: 0, scale: 0.88 }, { y: 0, opacity: 1, scale: 1, stagger: 0.08, duration: 0.65, ease: "back.out(1.4)",
        scrollTrigger: { trigger: statsRef.current, start: "top 82%" } });
      gsap.utils.toArray<HTMLElement>(".cr-sec-h").forEach(el =>
        gsap.fromTo(el, { x: -32, opacity: 0 }, { x: 0, opacity: 1, duration: 0.65, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 87%" } })
      );
    });
    return () => ctx.revert();
  }, []);

  const bg    = isDark ? "#080808" : "#fafaf8";
  const card  = isDark ? "#0f0f0f" : "#ffffff";
  const bdr   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const txt   = isDark ? "#fff" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const secBg = isDark ? "#0c0c0c" : "#f4f4f2";

  return (
    <div style={{ minHeight: "100vh", background: bg, overflowX: "hidden", paddingTop: 92, position: "relative" }}>
      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "8%",  left: "3%",  width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.07) 0%,transparent 65%)", filter: "blur(60px)" }}/>
        <div style={{ position: "absolute", bottom:"15%", right:"4%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.07) 0%,transparent 65%)", filter: "blur(55px)" }}/>
      </div>
      <motion.div
        aria-hidden
        animate={{ x: [0, 28, 0], y: [0, -14, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: 24,
          right: 26,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,136,0,0.15) 0%, transparent 70%)",
          filter: "blur(9px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -24, 0], y: [0, 16, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: 30,
          left: 26,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,184,0.14) 0%, transparent 70%)",
          filter: "blur(9px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Hero ── */}
      <section ref={heroRef} style={{ position: "relative", zIndex: 1, padding: "72px 24px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="cr-hero-item" style={{ opacity: 0, display: "inline-flex", alignItems: "center", gap: 8, paddingTop: 5, paddingBottom: 5, paddingLeft: 6, paddingRight: 14, borderRadius: 999, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.2)", marginBottom: 28 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#ff5500,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>⚡</span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, color: "#ff8800" }}>Join 5,000+ active creators</span>
          </div>
          <h1 className="cr-hero-item" style={{ opacity: 0, fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(38px,6vw,72px)", lineHeight: 1.04, letterSpacing: "-0.035em", color: txt, margin: "0 0 22px" }}>
            Real creators.
            <br />
            <span style={{ background: "linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Real results.</span>
          </h1>
          <p className="cr-hero-item" style={{ opacity: 0, fontFamily: "DM Sans, sans-serif", fontSize: "clamp(15px,2vw,18px)", color: muted, lineHeight: 1.8, maxWidth: 540, margin: "0 auto 44px" }}>
            From solo makers to growing startups — meet the people who turned their ideas into fully-funded realities on CrowdSpark.
          </p>
          <div className="cr-hero-item" style={{ opacity: 0, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, paddingTop: 13, paddingBottom: 13, paddingLeft: 28, paddingRight: 28, borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5, textDecoration: "none", boxShadow: "0 4px 24px rgba(255,100,0,0.35)", position: "relative", overflow: "hidden" }}>
              <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "crShimmer 2.4s ease-in-out infinite" }}/>
              <span style={{ position: "relative" }}>Become a Creator →</span>
            </Link>
            <Link href="/how-it-works" style={{ display: "inline-flex", alignItems: "center", gap: 7, paddingTop: 13, paddingBottom: 13, paddingLeft: 24, paddingRight: 24, borderRadius: 12, background: "none", border: `1px solid ${bdr}`, color: muted, fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14.5, textDecoration: "none" }}>
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section ref={statsRef} style={{ position: "relative", zIndex: 1, background: secBg, borderTop: `1px solid ${bdr}`, borderBottom: `1px solid ${bdr}`, padding: "44px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }} className="cr-stats-grid">
          {PLATFORM_STATS.map(s => (
            <div key={s.label} className="cr-stat" style={{ opacity: 0, textAlign: "center" }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(28px,3.5vw,44px)", color: s.color, margin: "0 0 5px", letterSpacing: "-0.03em", textShadow: `0 0 28px ${s.color}55` }}>{s.val}</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Creator showcase ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "88px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="cr-sec-h" style={{ opacity: 0, marginBottom: 52 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "#ff8800", marginBottom: 10 }}>Creator spotlight</p>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(26px,4vw,48px)", color: txt, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1 }}>
              Meet the makers
            </h2>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: muted, margin: 0 }}>Hover a card to read their story.</p>
          </div>

          <div className="cr-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
            {CREATORS.map(c => (
              <div key={c.id} className="cr-card" style={{ opacity: 0 }}>
                <CreatorCard c={c} isDark={isDark} card={card} bdr={bdr} txt={txt} muted={muted}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to become a creator ── */}
      <section ref={stepsRef} style={{ position: "relative", zIndex: 1, background: secBg, borderTop: `1px solid ${bdr}`, padding: "88px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="cr-sec-h" style={{ opacity: 0, textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "#ff8800", marginBottom: 10 }}>Start today</p>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(26px,4vw,48px)", color: txt, letterSpacing: "-0.025em", margin: 0, lineHeight: 1.1 }}>
              How to become a creator
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }} className="cr-process-grid">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.num} className="cr-step" style={{ opacity: 0, position: "relative" }}>
                {/* Connector */}
                {i < PROCESS_STEPS.length - 1 && (
                  <div style={{ position: "absolute", top: 27, left: "calc(50% + 28px)", right: "calc(-50% + 28px)", height: 1.5, background: `linear-gradient(90deg,${step.color}40,${PROCESS_STEPS[i+1].color}40)`, pointerEvents: "none" }} className="cr-connector"/>
                )}
                <div style={{ paddingTop: 24, paddingBottom: 24, paddingLeft: 20, paddingRight: 20, borderRadius: 20, background: card, border: `1px solid ${bdr}`, textAlign: "center", height: "100%", boxSizing: "border-box" as const, position: "relative", overflow: "hidden", boxShadow: isDark ? "none" : "0 4px 18px rgba(0,0,0,0.05)" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${step.color}55,transparent)` }}/>
                  <div style={{ width: 54, height: 54, borderRadius: "50%", background: isDark ? `${step.color}18` : `${step.color}12`, border: `2px solid ${step.color}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 20px ${step.color}28` }}>
                    <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 12, color: step.color, letterSpacing: "0.05em" }}>{step.num}</span>
                  </div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14.5, color: txt, margin: "0 0 10px" }}>{step.title}</h3>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px 100px", textAlign: "center" }}>
        <motion.div initial={{ scale: 0.93, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}
          style={{ maxWidth: 780, margin: "0 auto", borderRadius: 28, paddingTop: 72, paddingBottom: 72, paddingLeft: 52, paddingRight: 52, background: card, border: `1px solid ${bdr}`, position: "relative", overflow: "hidden", boxShadow: isDark ? "none" : "0 4px 40px rgba(0,0,0,0.06)" }}>
          <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 2, background: "linear-gradient(90deg,transparent,rgba(255,100,0,0.8) 28%,rgba(255,210,0,1) 50%,rgba(255,100,0,0.8) 72%,transparent)" }}/>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: isDark ? "radial-gradient(circle,rgba(255,100,0,0.06) 0%,transparent 70%)" : "radial-gradient(circle,rgba(255,100,0,0.04) 0%,transparent 70%)", pointerEvents: "none" }}/>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "#ff8800", marginBottom: 14, position: "relative" }}>Your turn</p>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(28px,4.5vw,52px)", color: txt, letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 14, position: "relative" }}>
            Your idea deserves
            <br /><span style={{ color: isDark ? "#00d4b8" : "#009e8c" }}>a real shot.</span>
          </h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: muted, lineHeight: 1.75, maxWidth: 440, margin: "0 auto 36px", position: "relative" }}>
            Join thousands of creators who have already launched, funded, and shipped their ideas on CrowdSpark.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, paddingTop: 13, paddingBottom: 13, paddingLeft: 28, paddingRight: 28, borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5, textDecoration: "none", boxShadow: "0 4px 24px rgba(255,100,0,0.35)", position: "relative", overflow: "hidden" }}>
              <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "crShimmer 2.4s ease-in-out infinite" }}/>
              <span style={{ position: "relative" }}>Start for free →</span>
            </Link>
            <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 7, paddingTop: 13, paddingBottom: 13, paddingLeft: 24, paddingRight: 24, borderRadius: 12, background: "none", border: `1px solid ${bdr}`, color: muted, fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14.5, textDecoration: "none" }}>
              View pricing
            </Link>
          </div>
        </motion.div>
      </section>

      <style>{`
        @keyframes crShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(200%)} 100%{transform:translateX(200%)} }
        .cr-cards-grid   { grid-template-columns: repeat(3,1fr); }
        .cr-process-grid { grid-template-columns: repeat(4,1fr); }
        .cr-stats-grid   { grid-template-columns: repeat(4,1fr); }
        .cr-connector    { display:block; }
        @media(max-width:1000px){ .cr-process-grid{ grid-template-columns:1fr 1fr !important; } .cr-connector{display:none !important;} }
        @media(max-width:900px) { .cr-cards-grid  { grid-template-columns:1fr 1fr !important; } }
        @media(max-width:700px) { .cr-cards-grid  { grid-template-columns:1fr !important; } .cr-stats-grid{ grid-template-columns:1fr 1fr !important; } }
      `}</style>
    </div>
  );
}
