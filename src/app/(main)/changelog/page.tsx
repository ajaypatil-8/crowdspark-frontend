"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

type ChangeType = "new" | "improved" | "fixed" | "removed";

const TYPE_CONFIG: Record<ChangeType, { label: string; color: string; bg: string; emoji: string }> = {
  new:      { label: "New",      color: "#34d399", bg: "rgba(52,211,153,0.1)",  emoji: "✨" },
  improved: { label: "Improved", color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  emoji: "⚡" },
  fixed:    { label: "Fixed",    color: "#a78bfa", bg: "rgba(167,139,250,0.1)", emoji: "🐛" },
  removed:  { label: "Removed",  color: "#f87171", bg: "rgba(248,113,113,0.1)", emoji: "🗑️" },
};

const RELEASES = [
  {
    version: "v2.4.0",
    date: "18 May 2025",
    tag: "Latest",
    tagColor: "#ff8800",
    summary: "Instant KYC with DigiLocker, redesigned campaign explore page, and backer notification improvements.",
    changes: [
      { type: "new" as ChangeType, text: "Instant KYC via DigiLocker — go live in under 2 hours with auto-verified Aadhaar and PAN." },
      { type: "new" as ChangeType, text: "Redesigned Explore page with advanced filtering by category, goal range, funding status, and location." },
      { type: "new" as ChangeType, text: "In-app notification centre with real-time backer updates, campaign milestones, and KYC status alerts." },
      { type: "improved" as ChangeType, text: "Campaign creation wizard — steps 2 and 3 are now faster with autosave every 30 seconds." },
      { type: "improved" as ChangeType, text: "Dashboard analytics now includes backer geography heatmap and conversion funnel breakdown." },
      { type: "fixed" as ChangeType, text: "Fixed edge case where payout calculations were incorrect for campaigns using 'Keep What You Raise' mode." },
      { type: "fixed" as ChangeType, text: "Resolved issue where reward tier images didn't display in dark mode on Safari." },
    ],
  },
  {
    version: "v2.3.0",
    date: "2 May 2025",
    tag: null,
    tagColor: "",
    summary: "New creator dashboard widgets, UPI mandate support, and mobile performance improvements.",
    changes: [
      { type: "new" as ChangeType, text: "UPI AutoPay mandate — backers can set up automatic monthly contributions to running campaigns." },
      { type: "new" as ChangeType, text: "Creator dashboard now includes a real-time revenue chart with daily, weekly, and monthly views." },
      { type: "new" as ChangeType, text: "Saved Campaigns — backers can now bookmark campaigns and get notified of updates." },
      { type: "improved" as ChangeType, text: "Mobile performance: page load time reduced by 40% on 4G connections through image optimisation and lazy loading." },
      { type: "improved" as ChangeType, text: "Campaign update emails now include a preview of the update text with a 'read more' button." },
      { type: "fixed" as ChangeType, text: "Fixed login redirect loop that occurred when accessing protected pages directly via URL on mobile." },
    ],
  },
  {
    version: "v2.2.0",
    date: "15 April 2025",
    tag: null,
    tagColor: "",
    summary: "Admin panel overhaul, bulk campaign approvals, and platform security hardening.",
    changes: [
      { type: "new" as ChangeType, text: "Admin panel rebuilt from scratch with role-based access, audit logs, and bulk approval tools." },
      { type: "new" as ChangeType, text: "Two-factor authentication (2FA) now available for all accounts via TOTP authenticator apps." },
      { type: "improved" as ChangeType, text: "Campaign approval SLA reduced to 24 hours for KYC-verified creators in good standing." },
      { type: "improved" as ChangeType, text: "Razorpay webhook reliability improved with exponential backoff retry and dead-letter queue." },
      { type: "fixed" as ChangeType, text: "Fixed 500 error on campaign page when the campaign had no rewards configured." },
      { type: "fixed" as ChangeType, text: "Corrected GST amount displayed in backer receipts for campaigns in certain categories." },
      { type: "removed" as ChangeType, text: "Removed the legacy v1 API endpoints. All integrations should now use v2 endpoints." },
    ],
  },
  {
    version: "v2.1.0",
    date: "28 March 2025",
    tag: null,
    tagColor: "",
    summary: "Referral programme, campaign embed widget, and help centre relaunch.",
    changes: [
      { type: "new" as ChangeType, text: "Creator Referral Programme — earn ₹500 for every new creator who successfully funds their first campaign through your link." },
      { type: "new" as ChangeType, text: "Campaign Embed Widget — creators can now embed their campaign on any website with a single line of code." },
      { type: "new" as ChangeType, text: "Fully rewritten Help Centre with 80+ articles, video guides, and a new AI-powered search." },
      { type: "improved" as ChangeType, text: "Project gallery now supports up to 20 images and YouTube/Vimeo video embedding." },
      { type: "fixed" as ChangeType, text: "Fixed issue where the funding progress bar showed 100% before the campaign goal was actually reached." },
    ],
  },
  {
    version: "v2.0.0",
    date: "1 March 2025",
    tag: "Major",
    tagColor: "#7c3aed",
    summary: "Complete platform redesign with dark mode, new dashboard, and the CrowdSpark 2.0 design system.",
    changes: [
      { type: "new" as ChangeType, text: "Complete UI redesign — CrowdSpark 2.0 design system with dark/light mode, new typography, and animation system." },
      { type: "new" as ChangeType, text: "Brand new Creator Dashboard with campaign analytics, backer insights, and payout management." },
      { type: "new" as ChangeType, text: "How It Works page with interactive step-by-step guide for creators and backers." },
      { type: "new" as ChangeType, text: "Pricing page with transparent fee breakdown and comparison calculator." },
      { type: "improved" as ChangeType, text: "Homepage completely reimagined with animated hero, live campaign feed, and creator testimonials." },
      { type: "improved" as ChangeType, text: "Platform-wide performance improvements — Lighthouse score improved from 72 to 96." },
      { type: "removed" as ChangeType, text: "Removed legacy campaign card layout in favour of the new full-bleed card design." },
    ],
  },
];

export default function ChangelogPage() {
  const { isDark } = useTheme();
  const [filter, setFilter] = useState<ChangeType | "all">("all");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "80px 44px 64px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,136,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.25)", marginBottom: 20 }}>
            <span style={{ fontSize: 14 }}>🔄</span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "#ff8800" }}>Platform Changelog</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", color: "var(--text)", margin: "0 0 12px", letterSpacing: "-0.03em" }}>What's New at CrowdSpark</h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "var(--text-muted)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Every update, improvement, and fix — documented transparently for our creator and backer community.
          </p>
        </motion.div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 44px 96px" }}>
        {/* Filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 48, justifyContent: "center" }}>
          <button onClick={() => setFilter("all")} style={{ padding: "8px 18px", borderRadius: 999, border: `1.5px solid ${filter === "all" ? "rgba(255,136,0,0.6)" : "var(--border)"}`, background: filter === "all" ? "rgba(255,136,0,0.1)" : "var(--bg-ghost)", color: filter === "all" ? "#ff8800" : "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.18s" }}>
            All changes
          </button>
          {(Object.entries(TYPE_CONFIG) as [ChangeType, typeof TYPE_CONFIG[ChangeType]][]).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilter(key)} style={{ padding: "8px 18px", borderRadius: 999, border: `1.5px solid ${filter === key ? cfg.color + "99" : "var(--border)"}`, background: filter === key ? cfg.bg : "var(--bg-ghost)", color: filter === key ? cfg.color : "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.18s" }}>
              {cfg.emoji} {cfg.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 2, background: "var(--border)", zIndex: 0 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            {RELEASES.map((release, ri) => {
              const filteredChanges = filter === "all" ? release.changes : release.changes.filter(c => c.type === filter);
              if (filteredChanges.length === 0 && filter !== "all") return null;

              return (
                <motion.div key={release.version} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ri * 0.08 }} style={{ display: "flex", gap: 28, position: "relative" }}>
                  {/* Dot */}
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: ri === 0 ? "linear-gradient(135deg,#ff5500,#ffcc00)" : (isDark ? "rgba(255,255,255,0.06)" : "#fff"), border: `2px solid ${ri === 0 ? "transparent" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1, boxShadow: ri === 0 ? "0 0 24px rgba(255,100,0,0.4)" : "none" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={ri === 0 ? "#fff" : "var(--text-muted)"}><circle cx="12" cy="12" r="5"/></svg>
                  </div>

                  {/* Card */}
                  <div style={{ flex: 1, paddingBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "var(--text)" }}>{release.version}</span>
                      {release.tag && (
                        <span style={{ padding: "3px 10px", borderRadius: 999, background: `${release.tagColor}18`, border: `1px solid ${release.tagColor}40`, fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: release.tagColor }}>
                          {release.tag}
                        </span>
                      )}
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", marginLeft: "auto" }}>{release.date}</span>
                    </div>

                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65, margin: "0 0 20px" }}>{release.summary}</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <AnimatePresence mode="popLayout">
                        {filteredChanges.map((change, ci) => {
                          const cfg = TYPE_CONFIG[change.type];
                          return (
                            <motion.div key={ci} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 12, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: "1px solid var(--border)" }}>
                              <span style={{ padding: "3px 9px", borderRadius: 999, background: cfg.bg, border: `1px solid ${cfg.color}30`, fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: cfg.color, whiteSpace: "nowrap", flexShrink: 0 }}>
                                {cfg.emoji} {cfg.label}
                              </span>
                              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-sub)", lineHeight: 1.6 }}>{change.text}</span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Subscribe CTA */}
        <div style={{ marginTop: 64, textAlign: "center", padding: "44px", borderRadius: 24, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📬</div>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.35rem", color: "var(--text)", marginBottom: 8 }}>Never miss an update</h3>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", marginBottom: 0 }}>Subscribe to the CrowdSpark newsletter and get changelog highlights delivered to your inbox every month.</p>
        </div>
      </div>
    </div>
  );
}
