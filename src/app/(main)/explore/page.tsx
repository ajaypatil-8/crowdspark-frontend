"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { easeInOut, easeOut } from "framer-motion";
import gsap from "gsap";
import { useTheme } from "@/contexts/ThemeContext";

// ── Mock campaign data ─────────────────────────────────────────────────────────
const CAMPAIGNS = [
  { id:1,  title:"AgroSense IoT Platform",    cat:"AgriTech",     raised:1840000, goal:2000000, backers:1240, days:4,  creator:"Ravi Kumar",     clr:"#00f5d4", featured:true,  desc:"Smart sensors that help farmers monitor soil, weather and crop health in real time." },
  { id:2,  title:"Svara — Indian Music App",  cat:"Music & Art",  raised: 920000, goal:1250000, backers: 873, days:11, creator:"Priya Mehta",    clr:"#a78bfa", featured:false, desc:"A streaming platform built for Indian classical and folk music with lossless audio." },
  { id:3,  title:"CleanSip Water Purifier",   cat:"CleanTech",    raised:2480000, goal:2500000, backers:3102, days:2,  creator:"Ananya Singh",   clr:"#34d399", featured:true,  desc:"Portable solar-powered purifier that cleans 10L/hr with no electricity required." },
  { id:4,  title:"Rethread Fashion Co.",      cat:"Sustainability",raised: 610000, goal:1200000, backers: 540, days:19, creator:"Dev Sharma",     clr:"#f59e0b", featured:false, desc:"Upcycled fashion that transforms waste textiles into premium everyday clothing." },
  { id:5,  title:"LearnBridge EdTech",        cat:"Education",    raised:1120000, goal:1500000, backers: 987, days:7,  creator:"Neha Joshi",     clr:"#60a5fa", featured:false, desc:"Vernacular-first learning app for students in tier-2 and tier-3 Indian cities." },
  { id:6,  title:"HealthNest Diagnostics",    cat:"HealthTech",   raised: 780000, goal:1000000, backers: 432, days:14, creator:"Dr. Arun Pillai", clr:"#f87171", featured:false, desc:"At-home diagnostic kits with AI analysis, doorstep collection in 120+ cities." },
  { id:7,  title:"Vayu Electric Scooter",     cat:"EV & Mobility", raised:3200000, goal:3500000, backers:2890, days:6,  creator:"Mohit Anand",    clr:"#4ade80", featured:true,  desc:"Lightweight 150km-range scooter built for Indian traffic, priced under ₹60,000." },
  { id:8,  title:"PawCare Pet Insurance",     cat:"FinTech",      raised: 450000, goal: 800000, backers: 321, days:22, creator:"Sunita Rao",     clr:"#fb923c", featured:false, desc:"India's first parametric pet insurance with zero paperwork, instant payouts." },
  { id:9,  title:"Nirman 3D Homes",           cat:"Construction", raised:1650000, goal:2000000, backers: 218, days:9,  creator:"Arjun Menon",    clr:"#e879f9", featured:false, desc:"3D-printed affordable housing that builds a 600sqft home in under 24 hours." },
  { id:10, title:"Dhaaba Cloud Kitchen",      cat:"Food & Bev",   raised: 390000, goal: 600000, backers: 267, days:16, creator:"Kavita Singh",   clr:"#fbbf24", featured:false, desc:"Authentic regional Indian cuisine, ghost-kitchen model across 12 cities." },
  { id:11, title:"SpaceMath AR Learning",     cat:"Education",    raised: 880000, goal:1100000, backers: 634, days:5,  creator:"Rahul Nair",     clr:"#38bdf8", featured:false, desc:"Augmented reality math tutor that makes algebra visual and intuitive for kids." },
  { id:12, title:"SunGrid Rural Energy",      cat:"CleanTech",    raised:2100000, goal:2200000, backers:1430, days:3,  creator:"Geeta Iyer",     clr:"#a3e635", featured:true,  desc:"Modular solar micro-grids for remote villages, 100% off-grid and weather-proof." },
];

const CATEGORIES = ["All", "AgriTech", "Music & Art", "CleanTech", "Sustainability", "Education", "HealthTech", "EV & Mobility", "FinTech", "Construction", "Food & Bev"];
const SORT_OPTIONS = [
  { value: "trending",   label: "Trending" },
  { value: "newest",     label: "Newest" },
  { value: "mostFunded", label: "Most funded" },
  { value: "endingSoon", label: "Ending soon" },
];

// ── Campaign Card ─────────────────────────────────────────────────────────────
function CampaignCard({ c, isDark, bdr, card, txt, muted }: any) {
  const pct = Math.min(Math.round((c.raised / c.goal) * 100), 100);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -6, boxShadow: isDark ? "0 20px 48px rgba(0,0,0,0.45)" : "0 20px 48px rgba(0,0,0,0.1)" }}
      style={{ borderRadius: 20, overflow: "hidden", background: card, border: `1px solid ${bdr}`, cursor: "pointer", transition: "box-shadow 0.22s" }}
    >
      {/* Thumbnail */}
      <div style={{ height: 148, background: `linear-gradient(135deg,${c.clr}20,${c.clr}08)`, borderBottom: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {c.featured && (
          <div style={{ position: "absolute", top: 10, right: 10, paddingTop: 4, paddingBottom: 4, paddingLeft: 9, paddingRight: 9, borderRadius: 999, background: "linear-gradient(135deg,#ff5500,#ffcc00)", fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, color: "#fff" }}>Featured ✦</div>
        )}
        <div style={{ position: "absolute", top: 10, left: 10, paddingTop: 4, paddingBottom: 4, paddingLeft: 9, paddingRight: 9, borderRadius: 999, background: isDark ? `${c.clr}1a` : `${c.clr}14`, border: `1px solid ${c.clr}30`, fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 600, color: c.clr }}>{c.cat}</div>
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 15, color: c.clr, opacity: 0.22, textAlign: "center", paddingLeft: 16, paddingRight: 16 }}>{c.title}</span>
      </div>

      <div style={{ paddingTop: 16, paddingBottom: 18, paddingLeft: 16, paddingRight: 16 }}>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: txt, margin: "0 0 6px", lineHeight: 1.3 }}>{c.title}</h3>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, lineHeight: 1.6, margin: "0 0 14px" }}>{c.desc}</p>

        {/* Progress bar */}
        <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
          style={{ height: 4, borderRadius: 2, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", marginBottom: 8, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: easeOut, delay: 0.2 }}
            style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${c.clr},${c.clr}88)` }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: txt }}>₹{(c.raised / 100000).toFixed(1)}L</span>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: c.clr }}>{pct}%</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted }}>{c.backers.toLocaleString("en-IN")} backers</span>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: c.days <= 5 ? "#ef4444" : muted, fontWeight: c.days <= 5 ? 700 : 400 }}>{c.days}d left</span>
        </div>
      </div>
    </motion.article>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const { isDark } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const [query,    setQuery]    = useState("");
  const [category, setCategory] = useState("All");
  const [sort,     setSort]     = useState("trending");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".ex-hero-item", { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.85, ease: "power3.out", delay: 0.2 });
    });
    return () => ctx.revert();
  }, []);

  const filtered = useMemo(() => {
    let arr = [...CAMPAIGNS];
    if (category !== "All") arr = arr.filter(c => c.cat === category);
    if (query.trim())        arr = arr.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) || c.desc.toLowerCase().includes(query.toLowerCase()));
    if (sort === "trending")   arr.sort((a, b) => b.backers - a.backers);
    if (sort === "newest")     arr.sort((a, b) => b.days - a.days);
    if (sort === "mostFunded") arr.sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
    if (sort === "endingSoon") arr.sort((a, b) => a.days - b.days);
    return arr;
  }, [category, query, sort]);

  const bg    = isDark ? "#080808" : "#fafaf8";
  const card  = isDark ? "#0f0f0f" : "#ffffff";
  const bdr   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const txt   = isDark ? "#fff" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const secBg = isDark ? "#0c0c0c" : "#f4f4f2";

  return (
    <div style={{ minHeight: "100vh", background: bg, overflowX: "hidden", paddingTop: 92 }}>
      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "5%", right: "5%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,245,212,0.06) 0%,transparent 65%)", filter: "blur(55px)" }}/>
        <div style={{ position: "absolute", bottom: "10%", left: "3%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.06) 0%,transparent 65%)", filter: "blur(55px)" }}/>
      </div>

      {/* ── Hero ── */}
      <section ref={heroRef} style={{ position: "relative", zIndex: 1, padding: "64px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="ex-hero-item" style={{ opacity: 0, display: "inline-flex", alignItems: "center", gap: 7, paddingTop: 5, paddingBottom: 5, paddingLeft: 6, paddingRight: 14, borderRadius: 999, background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.2)", marginBottom: 26 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00d4b8", animation: "exPulse 1.4s ease-in-out infinite" }}/>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, color: "#00d4b8" }}>12,400+ live campaigns</span>
          </div>
          <h1 className="ex-hero-item" style={{ opacity: 0, fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(36px,5.5vw,66px)", lineHeight: 1.05, letterSpacing: "-0.035em", color: txt, margin: "0 0 18px" }}>
            Discover ideas
            <br />
            <span style={{ color: isDark ? "#00d4b8" : "#009e8c" }}>worth backing.</span>
          </h1>
          <p className="ex-hero-item" style={{ opacity: 0, fontFamily: "DM Sans, sans-serif", fontSize: "clamp(14px,1.8vw,17px)", color: muted, lineHeight: 1.8, maxWidth: 480, margin: "0 auto 36px" }}>
            From clean energy to indie music — find the next big thing before everyone else does.
          </p>

          {/* Search */}
          <div className="ex-hero-item" style={{ opacity: 0, position: "relative", maxWidth: 520, margin: "0 auto" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: muted, pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search campaigns, creators, categories…"
              style={{ width: "100%", boxSizing: "border-box" as const, paddingTop: 16, paddingBottom: 16, paddingLeft: 48, paddingRight: 20, borderRadius: 16, border: `1.5px solid ${query ? "rgba(0,212,184,0.5)" : bdr}`, background: isDark ? "rgba(255,255,255,0.05)" : "#fff", color: txt, fontFamily: "DM Sans, sans-serif", fontSize: 15, outline: "none", boxShadow: query ? "0 0 0 3px rgba(0,212,184,0.12)" : "none", transition: "all 0.22s" }}
            />
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section style={{ position: "relative", zIndex: 1, background: secBg, borderTop: `1px solid ${bdr}`, borderBottom: `1px solid ${bdr}`, padding: "16px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          {/* Category pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{ paddingTop: 7, paddingBottom: 7, paddingLeft: 16, paddingRight: 16, borderRadius: 999, border: `1px solid ${category === cat ? "rgba(255,107,0,0.5)" : bdr}`, background: category === cat ? "rgba(255,107,0,0.12)" : "transparent", color: category === cat ? "#ff8800" : muted, fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: category === cat ? 700 : 500, cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap" }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 36, borderRadius: 10, border: `1px solid ${bdr}`, background: isDark ? "#0f0f0f" : "#fff", color: txt, fontFamily: "DM Sans, sans-serif", fontSize: 13, cursor: "pointer", outline: "none", appearance: "none" as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </section>

      {/* ── Grid ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "48px 24px 96px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Result count */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: muted }}>
              Showing <strong style={{ color: txt }}>{filtered.length}</strong> campaigns
              {category !== "All" && <> in <strong style={{ color: "#ff8800" }}>{category}</strong></>}
            </p>
          </div>

          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "80px 0" }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: txt, marginBottom: 10 }}>No campaigns found</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted }}>Try different keywords or browse all categories.</p>
              </motion.div>
            ) : (
              <motion.div layout key="grid"
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
                {filtered.map(c => (
                  <CampaignCard key={c.id} c={c} isDark={isDark} bdr={bdr} card={card} txt={txt} muted={muted} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA to backend note */}
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
            style={{ marginTop: 64, textAlign: "center", paddingTop: 36, paddingBottom: 36, borderRadius: 20, border: `1px dashed ${bdr}`, background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)" }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, color: txt, marginBottom: 8 }}>Have an idea worth funding?</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted, marginBottom: 20 }}>Launch your own campaign and reach thousands of backers.</p>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24, borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 20px rgba(255,100,0,0.35)" }}>
              Start a campaign →
            </Link>
          </motion.div>
        </div>
      </section>

      <style>{`
        @keyframes exPulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
      `}</style>
    </div>
  );
}