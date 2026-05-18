"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isLoggedIn, projectApi, type ProjectFeedResponse } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const STATS = [
  { num: "1,240", label: "Campaigns funded",  suffix: "",  desc: "and counting" },
  { num: "2.3",   label: "Crore raised",      suffix: "Cr₹", desc: "across all campaigns" },
  { num: "18,400",label: "Active backers",    suffix: "",  desc: "across India" },
  { num: "78",    label: "Success rate",      suffix: "%", desc: "campaigns hit goal" },
];

const FEATURES = [
  { icon: "⚡", title: "Launch in minutes",   desc: "Set your goal, tell your story, add reward tiers — go live in under 5 minutes. No paperwork, no gatekeepers.", accent: "#f59e0b", accentDim: "rgba(245,158,11,0.12)" },
  { icon: "🔒", title: "Escrow protected",    desc: "Funds held securely and released only when milestones are hit. Full audit trail for every rupee.",                accent: "#00f5d4", accentDim: "rgba(0,245,212,0.12)" },
  { icon: "📊", title: "Live analytics",      desc: "Real-time backer data, conversion tracking, and traffic insights — all in one beautiful dashboard.",             accent: "#a78bfa", accentDim: "rgba(167,139,250,0.12)" },
  { icon: "🇮🇳", title: "Built for India",    desc: "UPI, NetBanking, wallet support. GST-compliant invoicing out of the box. Works everywhere in India.",            accent: "#60a5fa", accentDim: "rgba(96,165,250,0.12)" },
  { icon: "🤝", title: "Verified community",  desc: "A curated network of backers who actively discover and fund campaigns every single day.",                        accent: "#f97316", accentDim: "rgba(249,115,22,0.12)" },
  { icon: "🎯", title: "Smart matching",      desc: "AI surfaces your project to the right people — those who genuinely care about your category and cause.",          accent: "#f87171", accentDim: "rgba(248,113,113,0.12)" },
];

const CATEGORIES = [
  { label: "Technology",   icon: "💡", count: "428", clr: "#60a5fa" },
  { label: "AgriTech",     icon: "🌱", count: "176", clr: "#34d399" },
  { label: "Music & Arts", icon: "🎵", count: "312", clr: "#a78bfa" },
  { label: "CleanTech",    icon: "♻️", count: "203", clr: "#00f5d4" },
  { label: "Healthcare",   icon: "🏥", count: "145", clr: "#f87171" },
  { label: "Education",    icon: "📚", count: "267", clr: "#f59e0b" },
  { label: "Fashion",      icon: "👗", count: "118", clr: "#f97316" },
  { label: "Food & Bev",   icon: "🍜", count: "97",  clr: "#fb923c" },
];

const TESTIMONIALS = [
  { quote: "CrowdSpark helped us raise ₹22L in 18 days. The platform's analytics told us exactly who was backing us and why.", author: "Priya Sharma", role: "Founder, AgroSense", initials: "PS", clr: "#00f5d4" },
  { quote: "Within 48 hours of launching, 300 backers had pledged. The community here is incredibly active and supportive.", author: "Rohan Mehta",  role: "CEO, CleanSip",    initials: "RM", clr: "#a78bfa" },
  { quote: "Milestone-based fund release gave our backers complete confidence. We ended up funding 140% of our original goal.", author: "Kavita Nair",  role: "Creator, Svara",  initials: "KN", clr: "#f59e0b" },
];

const STATIC_PROJECTS = [
  { id: 0, title: "AgroSense IoT",     cat: "AgriTech",       raised: "₹18.4L", pct: 92, days: 4,  backers: 1240, clr: "#00f5d4", desc: "Smart IoT sensors for precision farming across rural India." },
  { id: 0, title: "Svara Music App",   cat: "Music & Art",    raised: "₹9.2L",  pct: 74, days: 11, backers: 873,  clr: "#a78bfa", desc: "A vernacular music discovery platform for regional artists." },
  { id: 0, title: "CleanSip",          cat: "CleanTech",      raised: "₹24.8L", pct: 99, days: 2,  backers: 3102, clr: "#34d399", desc: "Solar-powered water purifiers for off-grid communities." },
  { id: 0, title: "Rethread",          cat: "Sustainability",  raised: "₹6.1L",  pct: 51, days: 19, backers: 540,  clr: "#f59e0b", desc: "Upcycled clothing from industrial textile waste." },
  { id: 0, title: "MedKit AI",         cat: "Healthcare",     raised: "₹11.3L", pct: 68, days: 14, backers: 920,  clr: "#f87171", desc: "AI-assisted diagnostics for rural primary health centers." },
  { id: 0, title: "VidyaBox",          cat: "Education",      raised: "₹7.8L",  pct: 82, days: 6,  backers: 1470, clr: "#60a5fa", desc: "Offline-first tablets for students in low-connectivity zones." },
];

const AVATAR_COLORS = ["#00f5d4","#a78bfa","#f59e0b","#34d399","#f87171"];
const CARD_ACCENTS  = ["#f59e0b","#00f5d4","#a78bfa","#60a5fa","#f97316","#f87171","#34d399","#fb923c"];

function getAccent(i: number) { return CARD_ACCENTS[i % CARD_ACCENTS.length]; }

function fmtAmount(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || hasRun.current) return;
      hasRun.current = true;
      const num = parseFloat(target.replace(/[^\d.]/g, ""));
      if (isNaN(num)) { setDisplay(target); return; }
      let start = 0;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1800, 1);
        const e = 1 - Math.pow(1 - p, 3);
        const cur = (e * num).toFixed(num % 1 !== 0 ? 1 : 0);
        setDisplay(target.includes(".") ? cur : cur.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        if (p < 1) requestAnimationFrame(step);
        else setDisplay(target);
      };
      requestAnimationFrame(step);
      obs.disconnect();
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function Skel({ h = 300, r = 20 }: { h?: number; r?: number }) {
  return (
    <div style={{ height: h, borderRadius: r, background: "var(--card-bg)", border: "1px solid var(--card-border)", animation: "lp-skeleton 1.8s ease-in-out infinite" }} />
  );
}

// ─── HERO CAMPAIGN CARD (BIG) ─────────────────────────────────────────────────

function HeroBigCard({ p, idx }: { p: ProjectFeedResponse; idx: number }) {
  const accent = getAccent(idx);
  const pct = Math.min(Math.round(p.fundedPercentage), 100);
  const [hov, setHov] = useState(false);

  return (
    <Link href={`/projects/${p.id}`}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "block", textDecoration: "none", borderRadius: 22,
        background: "var(--card-bg)",
        border: `1px solid ${hov ? accent + "60" : "var(--card-border)"}`,
        overflow: "hidden",
        transition: "all 0.32s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: hov ? `0 28px 70px rgba(0,0,0,0.45), 0 0 0 1px ${accent}28` : "0 4px 24px rgba(0,0,0,0.2)",
        transform: hov ? "translateY(-4px)" : "none",
        position: "relative",
      }}
    >
      {/* Top glow line */}
      <div style={{ position: "absolute", top: 0, left: "5%", right: "5%", height: 2, background: `linear-gradient(90deg,transparent,${accent},transparent)`, opacity: hov ? 1 : 0.55, transition: "opacity 0.3s", zIndex: 2 }} />

      {/* Thumbnail */}
      <div style={{
        height: 210, position: "relative", overflow: "hidden",
        background: p.thumbnailUrl
          ? `url(${p.thumbnailUrl}) center/cover no-repeat`
          : `radial-gradient(ellipse at 25% 40%, ${accent}25 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, ${accent}10 0%, transparent 50%)`,
      }}>
        {!p.thumbnailUrl && (
          <>
            <div style={{ position: "absolute", right: -14, bottom: -18, fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 100, color: accent, opacity: 0.055, lineHeight: 1, userSelect: "none", letterSpacing: "-0.05em" }}>
              {p.title.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,245,212,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,212,0.03) 1px,transparent 1px)", backgroundSize: "36px 36px" }} />
          </>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)" }} />

        {/* Badges */}
        <div style={{ position: "absolute", top: 12, left: 14, display: "flex", gap: 6 }}>
          <span style={{ padding: "4px 11px", borderRadius: 999, background: `${accent}20`, border: `1px solid ${accent}44`, fontFamily: "DM Sans,sans-serif", fontSize: 11, fontWeight: 700, color: accent, backdropFilter: "blur(8px)" }}>
            {p.category}
          </span>
          {p.fundedPercentage >= 90 && (
            <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(255,107,0,0.18)", border: "1px solid rgba(255,107,0,0.35)", fontFamily: "DM Sans,sans-serif", fontSize: 10, fontWeight: 700, color: "#ff8800", backdropFilter: "blur(8px)" }}>
              🔥 Hot
            </span>
          )}
        </div>
        <div style={{ position: "absolute", top: 12, right: 14, padding: "4px 11px", borderRadius: 999, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "DM Sans,sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}>
          {p.daysLeft > 0 ? `${p.daysLeft}d left` : "Ended"}
        </div>

        {/* Creator avatar at bottom */}
        <div style={{ position: "absolute", bottom: 14, left: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: p.creator.profileImage ? `url(${p.creator.profileImage}) center/cover` : accent, border: `2px solid rgba(255,255,255,0.3)`, flexShrink: 0 }} />
          <span style={{ fontFamily: "DM Sans,sans-serif", fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
            by <strong style={{ color: "#fff" }}>@{p.creator.username}</strong>
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px 20px" }}>
        <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text)", margin: "0 0 7px", letterSpacing: "-0.025em", lineHeight: 1.22 }}>
          {p.title}
        </h3>
        <p style={{ fontFamily: "DM Sans,sans-serif", fontSize: 13, color: "var(--text-muted)", margin: "0 0 16px", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {p.shortDescription}
        </p>

        {/* Progress */}
        <div style={{ height: 5, borderRadius: 3, background: "var(--bg-ghost)", marginBottom: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: `linear-gradient(90deg,${accent},${accent}99)`, transition: "width 1.2s ease" }} />
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text)", letterSpacing: "-0.02em" }}>{fmtAmount(p.currentAmount)}</div>
            <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>of {fmtAmount(p.goalAmount)} goal</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 17, color: accent }}>{pct}%</div>
            <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>funded</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{p.backersCount.toLocaleString("en-IN")}</div>
            <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>backers</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── SMALL CAMPAIGN CARD ──────────────────────────────────────────────────────

function SmallCard({ p, idx }: { p: ProjectFeedResponse; idx: number }) {
  const accent = getAccent(idx);
  const pct = Math.min(Math.round(p.fundedPercentage), 100);
  const [hov, setHov] = useState(false);

  return (
    <Link href={`/projects/${p.id}`}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", gap: 12, textDecoration: "none", padding: "12px 14px", borderRadius: 16,
        background: hov ? `${accent}0a` : "var(--card-bg)",
        border: `1px solid ${hov ? accent + "45" : "var(--card-border)"}`,
        transition: "all 0.22s ease", cursor: "pointer",
      }}
    >
      {/* Thumb */}
      <div style={{ width: 54, height: 54, borderRadius: 12, flexShrink: 0, background: p.thumbnailUrl ? `url(${p.thumbnailUrl}) center/cover` : `${accent}22`, border: `1.5px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {!p.thumbnailUrl && <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 14, color: accent, opacity: 0.65 }}>{p.title.slice(0,2).toUpperCase()}</span>}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
          <span style={{ fontFamily: "DM Sans,sans-serif", fontSize: 9.5, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.1em" }}>{p.category}</span>
          {p.daysLeft <= 5 && p.daysLeft > 0 && (
            <span style={{ padding: "1px 6px", borderRadius: 999, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", fontFamily: "DM Sans,sans-serif", fontSize: 9, fontWeight: 700, color: "#ef4444" }}>ending soon</span>
          )}
        </div>
        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.015em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
        <div style={{ height: 3, borderRadius: 2, background: "var(--bg-ghost)", overflow: "hidden", marginBottom: 4 }}>
          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: accent }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, color: "var(--text-muted)" }}>{fmtAmount(p.currentAmount)}</span>
          <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 11, color: accent }}>{pct}%</span>
        </div>
      </div>
    </Link>
  );
}

// ─── TRENDING CARD ────────────────────────────────────────────────────────────

function TrendCard({ p, idx, accent: accentOverride }: { p?: ProjectFeedResponse; idx: number; accent?: string }) {
  const accent = accentOverride ?? getAccent(idx);
  const pct = p ? Math.min(Math.round(p.fundedPercentage), 100) : STATIC_PROJECTS[idx % STATIC_PROJECTS.length].pct;
  const stat = STATIC_PROJECTS[idx % STATIC_PROJECTS.length];
  const title = p?.title ?? stat.title;
  const cat = p?.category ?? stat.cat;
  const raised = p ? fmtAmount(p.currentAmount) : stat.raised;
  const backers = p?.backersCount ?? stat.backers;
  const days = p?.daysLeft ?? stat.days;
  const desc = p?.shortDescription ?? stat.desc;
  const href = p ? `/projects/${p.id}` : "/explore";

  const [hov, setHov] = useState(false);

  return (
    <Link href={href}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="proj-card"
      style={{
        display: "block", textDecoration: "none", borderRadius: 20,
        background: "var(--card-bg)", border: `1px solid ${hov ? accent + "55" : "var(--card-border)"}`,
        overflow: "hidden", position: "relative",
        transition: "all 0.28s cubic-bezier(0.22,1,0.36,1)",
        transform: hov ? "translateY(-6px) scale(1.005)" : "none",
        boxShadow: hov ? `0 20px 52px rgba(0,0,0,0.35), 0 0 0 1px ${accent}28` : "none",
      }}
    >
      {/* Left accent stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: `linear-gradient(to bottom,${accent},${accent}66,transparent)`, opacity: hov ? 1 : 0.45, transition: "opacity 0.25s", borderRadius: "20px 0 0 20px" }} />

      {/* Thumbnail */}
      <div style={{
        height: 152, marginLeft: 3, position: "relative", overflow: "hidden",
        background: p?.thumbnailUrl
          ? `url(${p.thumbnailUrl}) center/cover no-repeat`
          : `radial-gradient(ellipse at 20% 30%, ${accent}22 0%, transparent 55%)`,
      }}>
        {!p?.thumbnailUrl && (
          <>
            <div style={{ position: "absolute", right: -10, bottom: -16, fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 90, color: accent, opacity: 0.055, lineHeight: 1, userSelect: "none", letterSpacing: "-0.06em" }}>
              {String(idx + 1).padStart(2, "0")}
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 30, color: accent, opacity: 0.11, letterSpacing: "-0.04em" }}>
              {title.slice(0, 3).toUpperCase()}
            </div>
          </>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.6) 100%)" }} />
        <div style={{ position: "absolute", top: 10, left: 12, padding: "3px 9px", borderRadius: 999, background: `${accent}22`, border: `1px solid ${accent}42`, fontFamily: "DM Sans,sans-serif", fontSize: 10, fontWeight: 700, color: accent, backdropFilter: "blur(6px)" }}>{cat}</div>
        <div style={{ position: "absolute", bottom: 10, right: 12, fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
          {days > 0 ? `${days}d left` : "Ended"}
        </div>
        {pct >= 90 && (
          <div style={{ position: "absolute", top: 10, right: 12, padding: "3px 8px", borderRadius: 999, background: "rgba(255,107,0,0.18)", border: "1px solid rgba(255,107,0,0.35)", fontFamily: "DM Sans,sans-serif", fontSize: 10, fontWeight: 700, color: "#ff8800" }}>🔥</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 16px 19px" }}>
        <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 14.5, color: "var(--text)", margin: "0 0 5px", letterSpacing: "-0.02em", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h3>
        <p style={{ fontFamily: "DM Sans,sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.62, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{desc}</p>

        <div style={{ height: 4, borderRadius: 2, background: "var(--bg-ghost)", marginBottom: 9, overflow: "hidden" }}>
          <div className="p-bar" data-pct={pct} style={{ height: "100%", width: "0%", borderRadius: 2, background: `linear-gradient(90deg,${accent},${accent}80)` }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 14, color: "var(--text)", letterSpacing: "-0.02em" }}>{raised}</span>
            <span style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, color: "var(--text-muted)", marginLeft: 5 }}>raised</span>
          </div>
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <span style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, color: "var(--text-muted)" }}>{typeof backers === "number" ? backers.toLocaleString("en-IN") : backers} backers</span>
            <span style={{ padding: "2px 8px", borderRadius: 999, background: `${accent}18`, border: `1px solid ${accent}30`, fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 11, color: accent }}>{pct}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── HOW-IT-WORKS STEP ────────────────────────────────────────────────────────

function HowStep({ num, title, desc, accent, last }: { num: string; title: string; desc: string; accent: string; last?: boolean }) {
  return (
    <div className="how-step" style={{ padding: "32px 32px 32px 0", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: `${accent}15`, border: `1.5px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 20, color: accent, letterSpacing: "-0.04em" }}>{num}</span>
        </div>
        {!last && <div className="lp-how-connector" />}
      </div>
      <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>{title}</h3>
      <p style={{ fontFamily: "DM Sans,sans-serif", fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.75, margin: 0 }}>{desc}</p>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const heroTextRef = useRef<HTMLDivElement>(null);
  const statsRef    = useRef<HTMLElement>(null);
  const catRef      = useRef<HTMLElement>(null);
  const featRef     = useRef<HTMLElement>(null);
  const projRef     = useRef<HTMLElement>(null);
  const testiRef    = useRef<HTMLElement>(null);
  const howRef      = useRef<HTMLElement>(null);
  const ctaBanRef   = useRef<HTMLElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);

  const [activeTesti, setActiveTesti] = useState(0);
  const [campaigns,   setCampaigns]   = useState<ProjectFeedResponse[]>([]);
  const [featured,    setFeatured]    = useState<ProjectFeedResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loggedIn,    setLoggedIn]    = useState(false);

  useEffect(() => {
    projectApi.feed()
      .then(d => { setCampaigns(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  useEffect(() => {
    if (campaigns.length === 0) {
      setFeatured([]);
      return;
    }
    const shuffled = [...campaigns]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, campaigns.length));
    setFeatured(shuffled);
  }, [campaigns]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero stagger entrance
      gsap.fromTo(
        heroTextRef.current?.querySelectorAll(".hero-enter") ?? [],
        { y: 60, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.1, stagger: 0.13, ease: "power3.out", delay: 0.4 }
      );

      // Showcase cards stagger
      gsap.fromTo(
        showcaseRef.current?.querySelectorAll(".showcase-enter") ?? [],
        { x: 60, opacity: 0, scale: 0.95 },
        { x: 0, opacity: 1, scale: 1, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.8 }
      );

      // Parallax orbs
      gsap.to(".lp-orb-1", { y: -120, scrollTrigger: { trigger: "body", start: "top top", end: "bottom top", scrub: 1.5 } });
      gsap.to(".lp-orb-2", { y: -60,  scrollTrigger: { trigger: "body", start: "top top", end: "bottom top", scrub: 2 } });

      // Stats
      gsap.fromTo(
        statsRef.current?.querySelectorAll(".stat-item") ?? [],
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: statsRef.current, start: "top 82%" } }
      );

      // Categories
      gsap.fromTo(
        catRef.current?.querySelectorAll(".cat-pill") ?? [],
        { scale: 0.88, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.6)", scrollTrigger: { trigger: catRef.current, start: "top 80%" } }
      );

      // Features
      gsap.fromTo(
        featRef.current?.querySelectorAll(".feat-card") ?? [],
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.08, ease: "back.out(1.4)", scrollTrigger: { trigger: featRef.current, start: "top 78%" } }
      );

      // Projects
      gsap.fromTo(
        projRef.current?.querySelectorAll(".proj-card") ?? [],
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: projRef.current, start: "top 78%" } }
      );

      // Progress bars
      projRef.current?.querySelectorAll<HTMLElement>(".p-bar").forEach(bar => {
        const pct = Number(bar.dataset.pct) || 0;
        ScrollTrigger.create({ trigger: bar, start: "top 90%", once: true, onEnter: () => gsap.to(bar, { width: `${Math.min(pct, 100)}%`, duration: 1.6, ease: "power2.out" }) });
      });

      // How-it-works
      gsap.fromTo(
        howRef.current?.querySelectorAll(".how-step") ?? [],
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: howRef.current, start: "top 80%" } }
      );

      // Testimonials
      gsap.fromTo(testiRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: testiRef.current, start: "top 82%" } });

      // CTA
      gsap.fromTo(ctaBanRef.current, { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.5)", scrollTrigger: { trigger: ctaBanRef.current, start: "top 85%" } });

      // Section labels
      gsap.utils.toArray<HTMLElement>(".sec-label").forEach(el =>
        gsap.fromTo(el, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.65, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%" } })
      );
    });

    const t = setInterval(() => setActiveTesti(p => (p + 1) % TESTIMONIALS.length), 4500);
    return () => { ctx.revert(); clearInterval(t); };
  }, []);

  const heroProject   = featured[0] ?? null;
  const smallProjects = featured.slice(1, 3);
  const trending      = campaigns.slice(3, 9);
  const showStatic    = !loading && trending.length === 0;

  return (
    <div className="lp-root">
      {/* Ambient background */}
      <div className="page-gradient" aria-hidden />
      <div className="dot-grid" aria-hidden />
      <div className="lp-orb-1" aria-hidden />
      <div className="lp-orb-2" aria-hidden />
      <div className="lp-orb-3" aria-hidden />

      {/* ════════════════ HERO ════════════════ */}
      <section className="lp-hero" aria-label="Hero">

        {/* ── Right: Campaign Showcase ── */}
        <div className="lp-hero-canvas">
          {/* Atmospheric glows */}
          <div className="lp-canvas-orb lp-canvas-orb-a" />
          <div className="lp-canvas-orb lp-canvas-orb-b" />
          <div className="lp-canvas-orb lp-canvas-orb-c" />
          {/* Grid overlay */}
          <div className="lp-hero-grid-overlay" />
          {/* Left fade */}
          <div className="lp-hero-canvas-fade" />

          {/* Actual campaign cards */}
          <div className="lp-showcase" ref={showcaseRef}>
            {/* Big card */}
            <div className="showcase-enter lp-showcase-big">
              {loading ? <Skel h={388} /> : heroProject ? <HeroBigCard p={heroProject} idx={0} /> : (
                <div style={{ height: 388, borderRadius: 22, background: "var(--card-bg)", border: "1px solid var(--card-border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontFamily: "DM Sans,sans-serif", fontSize: 14, gap: 10 }}>
                  <span style={{ fontSize: 32 }}>🚀</span>
                  <span>Be the first to launch!</span>
                  <Link href={loggedIn ? "/dashboard/create-campaign" : "/register"} style={{ color: "#ff8800", textDecoration: "none", fontWeight: 600 }}>
                    {loggedIn ? "Create a campaign →" : "Create free account →"}
                  </Link>
                </div>
              )}
            </div>

            {/* Two small cards */}
            <div className="lp-showcase-small showcase-enter">
              {loading ? (
                <><Skel h={138} /><Skel h={138} /></>
              ) : smallProjects.length >= 2 ? (
                <>
                  <div className="lp-showcase-s1"><SmallCard p={smallProjects[0]} idx={1} /></div>
                  <div className="lp-showcase-s2"><SmallCard p={smallProjects[1]} idx={2} /></div>
                </>
              ) : (
                <div style={{ gridColumn: "1/-1", height: 138, borderRadius: 16, background: "var(--card-bg)", border: "1px solid var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontFamily: "DM Sans,sans-serif", fontSize: 13 }}>
                  More campaigns coming soon…
                </div>
              )}
            </div>

            {/* Live status pill */}
            <div className="showcase-enter" style={{ display: "flex", justifyContent: "center" }}>
              <div className="lp-live-pill">
                <span className="lp-live-dot" />
                <span>{campaigns.length > 0 ? `${campaigns.length} live campaigns` : "Live now"}</span>
                <span style={{ color: "var(--border)", margin: "0 4px" }}>·</span>
                <span style={{ color: "#34d399", fontWeight: 700 }}>{campaigns.filter(c => c.fundedPercentage >= 90).length} near goal</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Left: Hero Content ── */}
        <div className="lp-hero-content" ref={heroTextRef}>
          {/* Live badge */}
          <div className="lp-badge hero-enter">
            <span className="lp-badge-pill"><span className="lp-badge-dot" />Live now</span>
            <span className="lp-badge-text">1,240+ campaigns funded</span>
          </div>

          {/* Headline */}
          <h1 className="lp-h1 hero-enter">
            Where{" "}<span className="lp-h1-gradient">bold ideas</span>
            <br />find their{" "}<span className="lp-h1-accent">spark.</span>
          </h1>

          <p className="lp-sub hero-enter">
            India&#39;s most trusted crowdfunding platform — built for creators,
            innovators, and everyone who believes in them.
          </p>

          {/* CTA buttons */}
          <div className="lp-cta-row hero-enter">
            <Link href={loggedIn ? "/dashboard" : "/register"} className="btn-primary btn-cta lp-btn-hero">
              <span className="btn-shimmer" />
              <span style={{ position: "relative" }}>{loggedIn ? "Open dashboard" : "Start your campaign"}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14" style={{ position: "relative" }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/explore" className="btn-outline lp-btn-ghost">
              Explore projects
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>

          {/* Social proof */}
          <div className="lp-social-proof hero-enter">
            <div className="lp-avatars" aria-hidden>
              {AVATAR_COLORS.map((c, i) => <div key={i} className="lp-avatar" style={{ background: c, zIndex: 5 - i }} />)}
            </div>
            <p className="lp-proof-text"><strong>18,400+</strong> backers already here</p>
          </div>

          {/* Trust badges */}
          <div className="lp-trust-mini hero-enter">
            {["No hidden fees","UPI & NetBanking","GST compliant"].map((t, i) => (
              <span key={i} className="lp-trust-mini-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" width="11" height="11"><polyline points="20 6 9 17 4 12"/></svg>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="lp-scroll-hint" aria-hidden>
          <span className="lp-scroll-label">scroll</span>
          <div className="lp-scroll-mouse"><div className="lp-scroll-dot" /></div>
        </div>
      </section>

      {/* ════════════════ SOCIAL PROOF BAND ════════════════ */}
      <section className="lp-proof-band" aria-label="Why back on CrowdSpark">
        <div className="lp-section-inner lp-proof-band-inner">
          {[
            { k: "Avg funding speed", v: "21 days", d: "from launch to goal for top campaigns" },
            { k: "Backer repeat rate", v: "64%", d: "support more than one campaign" },
            { k: "Creator success support", v: "24x7", d: "live creator guidance and moderation" },
          ].map((item, i) => (
            <motion.div key={item.k} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }} className="lp-proof-item">
              <p className="lp-proof-k">{item.k}</p>
              <p className="lp-proof-v">{item.v}</p>
              <p className="lp-proof-d">{item.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <section ref={statsRef} className="lp-stats" aria-label="Platform statistics">
        <div className="lp-stats-inner">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item lp-stat">
              <div className="lp-stat-num"><AnimatedCounter target={s.num} suffix={s.suffix} /></div>
              <p className="lp-stat-label">{s.label}</p>
              <p className="lp-stat-desc">{s.desc}</p>
              <div className="lp-stat-sep" aria-hidden />
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ CATEGORIES ════════════════ */}
      <section ref={catRef} className="lp-cats" aria-label="Campaign categories">
        <div className="lp-section-inner">
          <div className="sec-label lp-sec-label">
            <p className="lp-overline">Browse by category</p>
            <h2 className="lp-h2">Find what moves you</h2>
          </div>
          <div className="lp-cat-grid">
            {CATEGORIES.map((c, i) => (
              <Link key={i} href={`/explore?category=${encodeURIComponent(c.label)}`} className="cat-pill lp-cat-pill" style={{ "--cat-clr": c.clr } as React.CSSProperties}>
                <span className="lp-cat-icon">{c.icon}</span>
                <span className="lp-cat-name">{c.label}</span>
                <span className="lp-cat-count">{c.count}</span>
                <div className="lp-cat-accent-line" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TRENDING PROJECTS ════════════════ */}
      <section ref={projRef} className="lp-projects" aria-label="Trending campaigns">
        <div className="lp-section-inner">
          <div className="lp-projects-header">
            <div className="sec-label lp-sec-label" style={{ marginBottom: 0 }}>
              <p className="lp-overline">Trending now</p>
              <h2 className="lp-h2" style={{ marginBottom: 0 }}>Campaigns to back today</h2>
            </div>
            <Link href="/explore" className="btn-outline lp-view-all">
              View all <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="13" height="13"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>

          <div className="lp-proj-grid">
            {loading ? (
              [0,1,2,3,4,5].map(i => <Skel key={i} h={290} r={20} />)
            ) : trending.length > 0 ? (
              trending.map((p, i) => <TrendCard key={p.id} p={p} idx={i + 3} />)
            ) : (
              STATIC_PROJECTS.map((s, i) => <TrendCard key={i} idx={i} accent={s.clr} />)
            )}
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section ref={featRef} className="lp-features" aria-label="Platform features">
        <div className="lp-section-inner">
          <div className="lp-feat-header">
            <div className="sec-label lp-sec-label" style={{ marginBottom: 0 }}>
              <p className="lp-overline">Why CrowdSpark</p>
              <h2 className="lp-h2">Everything you need<br />to launch and grow</h2>
            </div>
            <p className="lp-feat-header-sub">
              From idea to funded — we give you every tool to make it happen.
            </p>
          </div>
          <div className="lp-feat-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feat-card lp-feat-card" style={{ "--feat-accent": f.accent, "--feat-accent-dim": f.accentDim } as React.CSSProperties}>
                <div className="lp-feat-top-line" />
                <div className="lp-feat-icon">
                  <span style={{ fontSize: 22 }}>{f.icon}</span>
                </div>
                <h3 className="lp-feat-title">{f.title}</h3>
                <p className="lp-feat-desc">{f.desc}</p>
                <div className="lp-feat-corner" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section ref={testiRef} className="lp-testi" aria-label="Creator testimonials">
        <div className="lp-section-inner lp-testi-inner">
          {/* Left: heading */}
          <div className="lp-testi-left">
            <div className="sec-label lp-sec-label">
              <p className="lp-overline">Creator stories</p>
              <h2 className="lp-h2">Real results,<br />real people</h2>
            </div>
            <p style={{ fontFamily: "DM Sans,sans-serif", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 300, marginBottom: 28 }}>
              Over 1,200 creators have launched on CrowdSpark. Here's what a few of them have to say.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setActiveTesti(i)} aria-label={`Testimonial ${i+1}`}
                  style={{ width: activeTesti === i ? 28 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer", padding: 0, background: activeTesti === i ? "var(--accent)" : "var(--border)", transition: "all 0.3s ease" }}
                />
              ))}
            </div>
          </div>

          {/* Right: card */}
          <div className="lp-testi-right">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ display: activeTesti === i ? "flex" : "none", flexDirection: "column", gap: 24, padding: "40px 44px", borderRadius: 24, background: "var(--card-bg)", border: `1px solid ${t.clr}28`, boxShadow: `0 0 0 1px ${t.clr}15, 0 20px 60px rgba(0,0,0,0.3)`, animation: "lp-fade-in .5s ease", position: "relative", overflow: "hidden" }}>
                {/* BG glow */}
                <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle,${t.clr}12,transparent 70%)`, pointerEvents: "none" }} />
                <div style={{ color: t.clr, opacity: 0.45 }}>
                  <svg viewBox="0 0 32 32" fill="currentColor" width="28" height="28"><path d="M10 8C6.686 8 4 10.686 4 14v10h10V14H7c0-1.657 1.343-3 3-3V8zm14 0c-3.314 0-6 2.686-6 6v10h10V14h-7c0-1.657 1.343-3 3-3V8z"/></svg>
                </div>
                <blockquote style={{ fontFamily: "DM Sans,sans-serif", fontSize: 17, color: "var(--text-sub)", lineHeight: 1.75, margin: 0, fontStyle: "italic", position: "relative" }}>{t.quote}</blockquote>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: t.clr, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 15, color: "#fff", flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{t.author}</div>
                    <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section ref={howRef} className="lp-how" aria-label="How it works">
        <div className="lp-section-inner">
          <div className="sec-label lp-sec-label">
            <p className="lp-overline">How it works</p>
            <h2 className="lp-h2">From idea to funded<br />in three steps</h2>
          </div>
          <div className="lp-how-grid">
            <HowStep num="01" accent="#ff8800" title="Create your campaign" desc="Set your goal, tell your story, and add rewards for backers. Takes under 5 minutes to go live." />
            <HowStep num="02" accent="#00f5d4" title="Share & get discovered" desc="Our smart matching puts your campaign in front of verified backers who genuinely care about your cause." />
            <HowStep num="03" accent="#a78bfa" title="Receive funding securely" desc="Funds released on milestone completion. GST-compliant invoicing. Full transparency at every step." last />
          </div>

          {/* Reassurance chips */}
          <div className="lp-how-chips">
            {["No setup cost","Cancel anytime","7-day support","Instant payouts"].map((c, i) => (
              <div key={i} className="lp-how-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg>
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA BANNER ════════════════ */}
      <section aria-label="Call to action" className="lp-cta-section">
        <div ref={ctaBanRef as React.RefObject<HTMLDivElement>} className="lp-cta-inner">
          <div className="lp-cta-banner">
            <div className="lp-cta-bg-orb lp-cta-bg-orb-a" aria-hidden />
            <div className="lp-cta-bg-orb lp-cta-bg-orb-b" aria-hidden />
            <div className="lp-cta-noise" aria-hidden />
            <div className="lp-cta-top-line" aria-hidden />

            <p className="lp-overline lp-cta-overline">Ready to launch?</p>
            <h2 className="lp-cta-h2">Your idea deserves<br /><span className="lp-cta-accent">a real shot.</span></h2>
            <p className="lp-cta-sub">Join 1,200+ creators who have already made their vision a reality on CrowdSpark.</p>

            <div className="lp-cta-buttons">
              {!loggedIn && (
                <Link href="/register" className="btn-primary btn-cta lp-btn-hero">
                  <span className="btn-shimmer" />
                  <span style={{ position: "relative" }}>Create free account</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14" style={{ position: "relative" }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              )}
              {loggedIn && (
                <Link href="/dashboard" className="btn-primary btn-cta lp-btn-hero">
                  <span className="btn-shimmer" />
                  <span style={{ position: "relative" }}>Go to dashboard</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14" style={{ position: "relative" }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              )}
              <Link href="/explore" className="btn-outline lp-btn-ghost">Browse campaigns</Link>
            </div>

            <div className="lp-trust-row">
              {["No hidden fees","UPI supported","GST compliant","Secure escrow"].map((t, i) => (
                <span key={i} className="lp-trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ STYLES ════════════════ */}
      <style>{`
        /* ── Root ── */
        .lp-root { min-height:100vh; background:var(--bg); overflow-x:hidden; position:relative; }

        /* ── Ambient orbs ── */
        .lp-orb-1 { position:fixed; width:700px; height:700px; border-radius:50%; background:radial-gradient(circle,rgba(0,245,212,0.055) 0%,transparent 70%); filter:blur(80px); top:-200px; right:-200px; pointer-events:none; z-index:0; }
        .lp-orb-2 { position:fixed; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(100,30,220,0.045) 0%,transparent 70%); filter:blur(80px); bottom:-100px; left:-100px; pointer-events:none; z-index:0; }
        .lp-orb-3 { position:fixed; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,rgba(255,107,0,0.04) 0%,transparent 70%); filter:blur(60px); top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none; z-index:0; }

        /* ── Hero ── */
        .lp-hero { position:relative; min-height:100vh; display:flex; align-items:center; padding:120px 0 80px 56px; overflow:hidden; z-index:1; }
        .lp-hero-content { flex:0 0 50%; max-width:540px; position:relative; z-index:3; }

        /* Hero canvas */
        .lp-hero-canvas { flex:0 0 50%; position:absolute; right:0; top:0; bottom:0; height:100%; display:flex; align-items:center; justify-content:center; overflow:hidden; z-index:2; }
        .lp-hero-canvas-fade { position:absolute; top:0; bottom:0; left:0; width:130px; background:linear-gradient(to right,var(--bg),transparent); z-index:10; pointer-events:none; }
        .lp-canvas-orb { position:absolute; border-radius:50%; pointer-events:none; }
        .lp-canvas-orb-a { width:360px; height:360px; background:radial-gradient(circle,rgba(0,245,212,0.12) 0%,transparent 70%); filter:blur(40px); animation:lp-float-a 7s ease-in-out infinite; }
        .lp-canvas-orb-b { width:220px; height:220px; background:radial-gradient(circle,rgba(255,107,0,0.09) 0%,transparent 70%); filter:blur(30px); top:20%; right:15%; animation:lp-float-b 9s ease-in-out infinite; }
        .lp-canvas-orb-c { width:160px; height:160px; background:radial-gradient(circle,rgba(167,139,250,0.11) 0%,transparent 70%); filter:blur(24px); bottom:20%; left:20%; animation:lp-float-c 6s ease-in-out infinite 2s; }
        .lp-hero-grid-overlay { position:absolute; inset:0; background-image:linear-gradient(rgba(0,245,212,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,212,0.04) 1px,transparent 1px); background-size:48px 48px; mask-image:radial-gradient(ellipse 70% 80% at 50% 50%,black,transparent); pointer-events:none; }

        /* Showcase cards */
        .lp-showcase { width:460px; max-width:92%; min-height:560px; position:relative; z-index:5; }
        .lp-showcase-big { width:100%; max-width:360px; position:absolute; top:26px; left:28px; transform:rotate(-2.4deg); }
        .lp-showcase-small { position:absolute; inset:0; display:block; }
        .lp-showcase-s1 { width:220px; position:absolute; right:10px; top:30px; transform:rotate(4deg); }
        .lp-showcase-s2 { width:240px; position:absolute; left:8px; bottom:46px; transform:rotate(-4.5deg); }

        /* Live pill */
        .lp-live-pill { display:inline-flex; align-items:center; gap:7px; padding:7px 16px; border-radius:999px; background:var(--card-bg); border:1px solid var(--card-border); box-shadow:0 4px 20px rgba(0,0,0,0.25); font-family:"DM Sans",sans-serif; font-size:12px; color:var(--text-muted); white-space:nowrap; }
        .lp-live-dot { width:7px; height:7px; border-radius:50%; background:#34d399; animation:lp-pulse 1.4s ease-in-out infinite; box-shadow:0 0 8px rgba(52,211,153,0.5); flex-shrink:0; }

        /* Badge */
        .lp-badge { display:inline-flex; align-items:center; gap:10px; padding:5px 14px 5px 5px; border-radius:999px; border:1px solid var(--border); background:rgba(255,107,0,0.06); margin-bottom:28px; }
        .lp-badge-pill { display:inline-flex; align-items:center; gap:6px; padding:3px 10px; border-radius:999px; background:rgba(255,107,0,0.15); font-size:10px; font-family:"Syne",sans-serif; font-weight:800; color:#ff8800; letter-spacing:.15em; text-transform:uppercase; }
        .lp-badge-dot { width:6px; height:6px; border-radius:50%; background:#ff8800; animation:lp-pulse 1.4s ease-in-out infinite; flex-shrink:0; }
        .lp-badge-text { font-size:13px; color:var(--text-muted); font-family:"DM Sans",sans-serif; }

        /* H1 */
        .lp-h1 { font-family:"Syne",sans-serif; font-weight:800; font-size:clamp(38px,4.8vw,72px); line-height:1.04; letter-spacing:-0.03em; color:var(--text); margin:0 0 22px; }
        .lp-h1-gradient { background:linear-gradient(135deg,#ff6b00,#ffcc00); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .lp-h1-accent { color:var(--accent); text-shadow:0 0 50px var(--accent-glow); }

        .lp-sub { font-size:clamp(14px,1.5vw,17px); color:var(--text-muted); font-family:"DM Sans",sans-serif; line-height:1.82; max-width:400px; margin:0 0 40px; }
        .lp-cta-row { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:36px; align-items:center; }
        .lp-btn-hero { display:inline-flex; align-items:center; gap:8px; padding:14px 30px; font-size:14.5px; border-radius:12px; }
        .lp-btn-ghost { display:inline-flex; align-items:center; gap:8px; padding:14px 24px; font-size:14.5px; border-radius:12px; text-decoration:none; }

        .lp-social-proof { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
        .lp-avatars { display:flex; }
        .lp-avatar { width:32px; height:32px; border-radius:50%; border:2.5px solid var(--bg); margin-left:-10px; }
        .lp-avatars .lp-avatar:first-child { margin-left:0; }
        .lp-proof-text { font-size:13px; color:var(--text-muted); font-family:"DM Sans",sans-serif; }
        .lp-proof-text strong { color:var(--text); }

        .lp-trust-mini { display:flex; gap:16px; flex-wrap:wrap; }
        .lp-trust-mini-badge { display:inline-flex; align-items:center; gap:5px; font-family:"DM Sans",sans-serif; font-size:12px; color:var(--text-muted); }

        .lp-scroll-hint { position:absolute; bottom:32px; left:50%; transform:translateX(-50%); z-index:5; display:flex; flex-direction:column; align-items:center; gap:7px; opacity:.5; animation:lp-scroll-fade 2s ease-in-out 2.5s infinite alternate; pointer-events:none; }
        .lp-scroll-label { font-size:9px; color:var(--text-muted); font-family:"DM Sans",sans-serif; letter-spacing:.2em; text-transform:uppercase; }
        .lp-scroll-mouse { width:18px; height:26px; border-radius:9px; border:1.5px solid var(--border); display:flex; justify-content:center; padding-top:5px; }
        .lp-scroll-dot { width:3px; height:6px; border-radius:2px; background:#ff8800; animation:lp-scroll-dot 1.6s ease-in-out infinite; }

        /* ── Stats ── */
        .lp-stats { position:relative; z-index:1; border-top:1px solid var(--border); border-bottom:1px solid var(--border); background:var(--bg-2); padding:56px 48px; }
        .lp-stats-inner { max-width:1100px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
        .lp-stat { text-align:center; position:relative; }
        .lp-stat-num { font-family:"Syne",sans-serif; font-weight:800; font-size:clamp(28px,3.2vw,46px); color:var(--text); letter-spacing:-0.025em; line-height:1; }
        .lp-stat-label { font-size:13px; color:var(--text-sub); font-family:"DM Sans",sans-serif; margin-top:8px; font-weight:600; }
        .lp-stat-desc { font-size:11.5px; color:var(--text-muted); font-family:"DM Sans",sans-serif; margin-top:3px; }
        .lp-stat-sep { position:absolute; top:50%; right:0; width:1px; height:50%; transform:translateY(-50%); background:var(--border); }
        .lp-stat:last-child .lp-stat-sep { display:none; }

        /* ── Shared section ── */
        .lp-section-inner { max-width:1100px; margin:0 auto; }
        .lp-sec-label { margin-bottom:48px; }
        .lp-overline { font-family:"DM Sans",sans-serif; font-weight:700; font-size:11px; letter-spacing:.24em; text-transform:uppercase; color:var(--cta); margin:0 0 10px; }
        .lp-h2 { font-family:"Syne",sans-serif; font-weight:800; font-size:clamp(28px,4vw,48px); color:var(--text); letter-spacing:-0.025em; line-height:1.1; margin:0; }

        /* ── Categories ── */
        .lp-cats { padding:80px 48px; position:relative; z-index:1; background:var(--bg); border-top:1px solid var(--border); }
        .lp-cat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .lp-cat-pill { display:flex; align-items:center; gap:10px; padding:14px 18px; border-radius:16px; background:var(--card-bg); border:1px solid var(--card-border); text-decoration:none; transition:all .22s ease; position:relative; overflow:hidden; }
        .lp-cat-pill:hover { border-color:var(--cat-clr,var(--accent-dim)); box-shadow:0 8px 32px rgba(0,0,0,0.25); transform:translateY(-3px); }
        .lp-cat-accent-line { position:absolute; bottom:0; left:0; right:0; height:2px; background:var(--cat-clr,var(--accent)); opacity:0; transition:opacity .22s; }
        .lp-cat-pill:hover .lp-cat-accent-line { opacity:0.6; }
        .lp-cat-icon { font-size:20px; flex-shrink:0; }
        .lp-cat-name { flex:1; font-family:"DM Sans",sans-serif; font-weight:600; font-size:13.5px; color:var(--text-sub); }
        .lp-cat-count { font-family:"Syne",sans-serif; font-weight:700; font-size:11px; color:var(--text-muted); background:var(--bg-ghost); padding:3px 8px; border-radius:999px; }

        /* ── Projects ── */
        .lp-projects { padding:80px 48px; background:var(--bg-2); border-top:1px solid var(--border); position:relative; z-index:1; }
        .lp-projects-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:40px; gap:16px; flex-wrap:wrap; }
        .lp-view-all { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; font-size:13px; text-decoration:none; white-space:nowrap; border-radius:10px; }
        .lp-proj-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }

        /* ── Features ── */
        .lp-features { padding:80px 48px; background:var(--bg); border-top:1px solid var(--border); position:relative; z-index:1; }
        .lp-feat-header { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:48px; }
        .lp-feat-header-sub { font-family:"DM Sans",sans-serif; font-size:15px; color:var(--text-muted); max-width:280px; line-height:1.7; }
        .lp-feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .lp-feat-card { padding:28px 26px; border-radius:20px; background:var(--card-bg); border:1px solid var(--card-border); transition:all .25s ease; cursor:default; position:relative; overflow:hidden; }
        .lp-feat-card:hover { transform:translateY(-5px); border-color:var(--feat-accent,var(--accent-dim)); box-shadow:0 16px 48px rgba(0,0,0,.4),0 0 0 1px color-mix(in srgb,var(--feat-accent) 20%,transparent); }
        .lp-feat-top-line { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--feat-accent,var(--accent)),transparent); opacity:.5; }
        .lp-feat-corner { position:absolute; bottom:0; right:0; width:60px; height:60px; border-top:1.5px solid var(--feat-accent,var(--accent)); border-left:1.5px solid var(--feat-accent,var(--accent)); border-radius:0 0 0 14px; opacity:0; transform:translate(10px,10px); transition:all .25s ease; }
        .lp-feat-card:hover .lp-feat-corner { opacity:0.18; transform:translate(0,0); }
        .lp-feat-icon { width:46px; height:46px; border-radius:13px; background:var(--feat-accent-dim,var(--accent-dim)); border:1px solid color-mix(in srgb,var(--feat-accent) 22%,transparent); display:flex; align-items:center; justify-content:center; margin-bottom:18px; }
        .lp-feat-title { font-family:"Syne",sans-serif; font-weight:700; font-size:16px; color:var(--text); margin:0 0 8px; }
        .lp-feat-desc { font-size:13.5px; color:var(--text-muted); font-family:"DM Sans",sans-serif; line-height:1.75; margin:0; }

        /* ── Testimonials ── */
        .lp-testi { padding:80px 48px; background:var(--bg-2); border-top:1px solid var(--border); position:relative; z-index:1; }
        .lp-testi-inner { display:grid; grid-template-columns:1fr 1.5fr; gap:60px; align-items:center; }
        .lp-testi-left {}
        .lp-testi-right {}

        /* ── How it works ── */
        .lp-how { padding:80px 48px; position:relative; z-index:1; border-top:1px solid var(--border); }
        .lp-how-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0; position:relative; margin-bottom:40px; }
        .lp-how-connector { flex:1; height:1.5px; background:linear-gradient(to right,var(--border),transparent); margin-top:26px; }
        .lp-how-chips { display:flex; gap:10px; flex-wrap:wrap; }
        .lp-how-chip { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:999px; background:var(--card-bg); border:1px solid var(--border); font-family:"DM Sans",sans-serif; font-size:13px; color:var(--text-muted); }

        /* ── Proof band ── */
        .lp-proof-band { padding:48px 48px; border-top:1px solid var(--border); border-bottom:1px solid var(--border); background:var(--bg); position:relative; z-index:1; }
        .lp-proof-band-inner { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .lp-proof-item { border-radius:18px; padding:18px 20px; background:var(--card-bg); border:1px solid var(--card-border); }
        .lp-proof-k { margin:0 0 8px; font-family:"DM Sans",sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.09em; color:var(--text-muted); }
        .lp-proof-v { margin:0 0 6px; font-family:"Syne",sans-serif; font-size:26px; font-weight:800; letter-spacing:-0.03em; color:var(--text); }
        .lp-proof-d { margin:0; font-family:"DM Sans",sans-serif; font-size:12.5px; color:var(--text-muted); line-height:1.7; }

        /* ── CTA ── */
        .lp-cta-section { padding:72px 48px 112px; position:relative; z-index:1; }
        .lp-cta-inner { max-width:820px; margin:0 auto; }
        .lp-cta-banner { border-radius:28px; padding:76px 56px; text-align:center; background:var(--card-bg); border:1px solid var(--card-border); position:relative; overflow:hidden; box-shadow:var(--card-shadow); }
        .lp-cta-top-line { position:absolute; top:0; left:"10%"; right:"10%"; height:1.5px; background:linear-gradient(90deg,transparent,var(--accent),rgba(255,204,0,0.8),var(--accent),transparent); }
        .lp-cta-bg-orb { position:absolute; border-radius:50%; pointer-events:none; }
        .lp-cta-bg-orb-a { width:500px; height:500px; background:radial-gradient(circle,rgba(0,245,212,0.07) 0%,transparent 70%); top:50%; left:50%; transform:translate(-50%,-50%); }
        .lp-cta-bg-orb-b { width:200px; height:200px; background:rgba(255,107,0,0.06); filter:blur(60px); top:-60px; right:-60px; }
        .lp-cta-noise { position:absolute; inset:0; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E"); opacity:.08; mix-blend-mode:overlay; pointer-events:none; }
        .lp-cta-overline { position:relative; margin-bottom:18px; }
        .lp-cta-h2 { font-family:"Syne",sans-serif; font-weight:800; font-size:clamp(30px,4vw,54px); color:var(--text); letter-spacing:-0.025em; line-height:1.08; margin:0 0 20px; position:relative; }
        .lp-cta-accent { color:var(--accent); text-shadow:0 0 50px var(--accent-glow); }
        .lp-cta-sub { font-size:15.5px; color:var(--text-muted); font-family:"DM Sans",sans-serif; line-height:1.78; max-width:440px; margin:0 auto 40px; position:relative; }
        .lp-cta-buttons { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; position:relative; margin-bottom:32px; }
        .lp-trust-row { display:flex; gap:20px; justify-content:center; flex-wrap:wrap; position:relative; }
        .lp-trust-badge { display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--text-muted); font-family:"DM Sans",sans-serif; }
        .lp-trust-badge svg { color:var(--accent); flex-shrink:0; }

        /* ── Keyframes ── */
        @keyframes lp-float-a { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-22px) scale(1.04);} }
        @keyframes lp-float-b { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-16px);} }
        @keyframes lp-float-c { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-12px) scale(1.02);} }
        @keyframes lp-pulse { 0%,100%{opacity:.5;} 50%{opacity:1;} }
        @keyframes lp-scroll-fade { from{opacity:.2;} to{opacity:.6;} }
        @keyframes lp-scroll-dot { 0%{transform:translateY(0);opacity:1;} 100%{transform:translateY(10px);opacity:0;} }
        @keyframes lp-fade-in { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
        @keyframes lp-skeleton { 0%,100%{opacity:.6;} 50%{opacity:1;} }

        /* ── Responsive ── */
        @media(max-width:1100px){
          .lp-cat-grid{grid-template-columns:repeat(4,1fr);}
          .lp-feat-grid{grid-template-columns:repeat(2,1fr);}
          .lp-proj-grid{grid-template-columns:repeat(2,1fr);}
          .lp-testi-inner{grid-template-columns:1fr;}
          .lp-feat-header{flex-direction:column; align-items:flex-start;}
        }
        @media(max-width:900px){
          .lp-hero{padding:100px 24px 60px;}
          .lp-hero-content{flex:1; max-width:100%;}
          .lp-hero-canvas{display:none;}
          .lp-stats{padding:48px 24px;}
          .lp-stats-inner{grid-template-columns:repeat(2,1fr);}
          .lp-showcase,.lp-showcase-big,.lp-showcase-small,.lp-showcase-s1,.lp-showcase-s2{position:static !important; transform:none !important; width:100% !important; max-width:none !important; min-height:unset !important;}
          .lp-showcase{display:grid; gap:10px;}
          .lp-showcase-small{display:grid !important; grid-template-columns:1fr 1fr;}
          .lp-cats,.lp-features,.lp-projects,.lp-testi,.lp-how,.lp-cta-section{padding:60px 24px;}
          .lp-proof-band{padding:44px 24px;}
          .lp-proof-band-inner{grid-template-columns:1fr;}
          .lp-cat-grid{grid-template-columns:repeat(2,1fr);}
          .lp-how-grid{grid-template-columns:1fr;}
          .lp-how-connector{display:none;}
          .lp-cta-banner{padding:48px 28px;}
        }
        @media(max-width:600px){
          .lp-stats-inner{grid-template-columns:repeat(2,1fr);}
          .lp-stat-sep{display:none;}
          .lp-feat-grid{grid-template-columns:1fr;}
          .lp-proj-grid{grid-template-columns:1fr;}
          .lp-cat-grid{grid-template-columns:repeat(2,1fr);}
          .lp-trust-row{gap:12px;}
          .lp-how-chips{gap:8px;}
        }
      `}</style>
    </div>
  );
}