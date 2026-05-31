"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

const COVERAGE = [
  { outlet: "Economic Times", date: "March 2025", headline: "CrowdSpark crosses ₹2 crore in total funds raised, eyes Series A", logo: "ET", color: "#f59e0b" },
  { outlet: "YourStory", date: "January 2025", headline: "How CrowdSpark is making crowdfunding trustworthy for Indian creators", logo: "YS", color: "#7c3aed" },
  { outlet: "Entrackr", date: "November 2024", headline: "Mandatory KYC: CrowdSpark's bet on verified crowdfunding", logo: "En", color: "#34d399" },
  { outlet: "Inc42", date: "September 2024", headline: "CrowdSpark raises seed funding to build India's Kickstarter", logo: "In", color: "#60a5fa" },
  { outlet: "The Hindu BusinessLine", date: "July 2024", headline: "Pune startup bets on GST compliance to win creator trust", logo: "HB", color: "#ff8800" },
  { outlet: "Moneycontrol", date: "May 2024", headline: "CrowdSpark: A crowdfunding platform built for Bharat's makers", logo: "MC", color: "#ef4444" },
];

const ASSETS = [
  { name: "Logo Pack (SVG + PNG)", desc: "Full-colour, white, and dark variants", size: "2.4 MB", icon: "🖼️" },
  { name: "Brand Guidelines PDF", desc: "Colours, typography, and usage rules", size: "3.1 MB", icon: "📋" },
  { name: "Product Screenshots", desc: "High-res campaign and dashboard views", size: "18 MB", icon: "🖥️" },
  { name: "Founder Headshots", desc: "Professional photos of the founding team", size: "9 MB", icon: "👤" },
  { name: "Fact Sheet", desc: "Key stats, milestones and company overview", size: "0.8 MB", icon: "📄" },
];

const TEAM = [
  { name: "Vikram Sharma", role: "CEO & Co-founder", quote: "We built CrowdSpark because every creator in India deserves a shot at funding their dream — not just the ones with Silicon Valley connections." },
  { name: "Ananya Joshi", role: "CTO & Co-founder", quote: "The technical challenge is trust at scale. Verified identities, escrow-protected funds, and real-time fraud detection — that's our moat." },
];

export default function PressPage() {
  const { isDark } = useTheme();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "96px 44px 80px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(96,165,250,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)", marginBottom: 20 }}>
            <span style={{ fontSize: 14 }}>📰</span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "#60a5fa" }}>Press & Media</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--text)", margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            CrowdSpark in the{" "}
            <span style={{ background: "linear-gradient(135deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              News
            </span>
          </h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 18, color: "var(--text-muted)", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
              Resources for journalists, analysts, and media professionals covering India&apos;s crowdfunding ecosystem.
          </p>
          <a href="mailto:press@crowdspark.in" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 14, background: "linear-gradient(135deg,#3b82f6,#7c3aed)", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 0 32px rgba(96,165,250,0.3)" }}>
            Contact Press Team →
          </a>
        </motion.div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 44px 96px" }}>
        {/* Key Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 72 }}>
          {[
            { v: "₹2.3Cr+", l: "Total Raised", emoji: "💰" },
            { v: "1,240+", l: "Campaigns Funded", emoji: "🚀" },
            { v: "18,400+", l: "Active Backers", emoji: "👥" },
            { v: "78%", l: "Success Rate", emoji: "🎯" },
            { v: "2021", l: "Founded", emoji: "📅" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={{ textAlign: "center", padding: "28px 20px", borderRadius: 20, background: isDark ? "rgba(255,255,255,0.03)" : "#fff", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--text)", marginBottom: 4 }}>{s.v}</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)" }}>{s.l}</div>
            </motion.div>
          ))}
        </div>

        {/* Media Coverage */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--text)", marginBottom: 32 }}>Media Coverage</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {COVERAGE.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 24px", borderRadius: 18, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: "1px solid var(--border)", transition: "transform 0.18s", cursor: "default" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateX(4px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "")}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${item.color}18`, border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, color: item.color, flexShrink: 0 }}>{item.logo}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>{item.headline}</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)" }}>{item.outlet} · {item.date}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Founder Quotes */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--text)", marginBottom: 32 }}>From Our Founders</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {TEAM.map((member, i) => (
              <div key={i} style={{ padding: "32px", borderRadius: 22, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: "1px solid var(--border)", position: "relative" }}>
                <div style={{ fontSize: 40, color: "rgba(255,136,0,0.3)", fontFamily: "serif", lineHeight: 1, marginBottom: 16 }}>&quot;</div>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-sub)", lineHeight: 1.75, fontStyle: "italic", margin: "0 0 24px" }}>{member.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#ff5500,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, color: "#fff" }}>{member.name[0]}</div>
                  <div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{member.name}</div>
                    <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>{member.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Press Assets */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--text)", marginBottom: 8 }}>Press Assets</h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-muted)", marginBottom: 32 }}>All assets are free to use for editorial coverage. Please do not alter logos or brand colours.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {ASSETS.map((asset, i) => (
              <div key={i} style={{ padding: "20px 22px", borderRadius: 16, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "border-color 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.4)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "")}>
                <span style={{ fontSize: 28 }}>{asset.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>{asset.name}</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>{asset.desc} · {asset.size}</div>
                </div>
                <svg style={{ color: "#60a5fa", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div style={{ textAlign: "center", padding: "56px", borderRadius: 24, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "var(--text)", marginBottom: 8 }}>Press Enquiries</h3>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-muted)", marginBottom: 28 }}>We aim to respond to all media enquiries within one business day.</p>
          <a href="mailto:press@crowdspark.in" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 14, background: "linear-gradient(135deg,#3b82f6,#7c3aed)", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            press@crowdspark.in
          </a>
        </div>
      </div>
    </div>
  );
}
