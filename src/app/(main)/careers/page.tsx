"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

const DEPARTMENTS = ["All", "Engineering", "Design", "Marketing", "Operations", "Finance"] as const;
type Dept = (typeof DEPARTMENTS)[number];

const JOBS = [
  { id: 1, title: "Senior Full-Stack Engineer", dept: "Engineering", type: "Full-time", location: "Pune / Remote", salary: "₹18–28 LPA", emoji: "⚙️", color: "#60a5fa", desc: "Build and scale the platform used by thousands of Indian creators and backers. You'll work across Node.js, Next.js, PostgreSQL and our real-time notification system." },
  { id: 2, title: "React Native Developer", dept: "Engineering", type: "Full-time", location: "Remote — India", salary: "₹12–20 LPA", emoji: "📱", color: "#34d399", desc: "Lead development of our upcoming mobile app. Own the entire feature lifecycle from design handoff to App Store release." },
  { id: 3, title: "Product Designer (UI/UX)", dept: "Design", type: "Full-time", location: "Pune", salary: "₹10–18 LPA", emoji: "🎨", color: "#a78bfa", desc: "Design beautiful, functional experiences for India's crowdfunding community. From research to final pixel — you own the design process end to end." },
  { id: 4, title: "Growth Marketing Manager", dept: "Marketing", type: "Full-time", location: "Pune / Remote", salary: "₹10–16 LPA", emoji: "📣", color: "#ff8800", desc: "Drive creator acquisition and backer engagement through data-driven campaigns. You'll own our SEO, content, and paid media channels." },
  { id: 5, title: "Creator Success Manager", dept: "Operations", type: "Full-time", location: "Pune", salary: "₹6–10 LPA", emoji: "🤝", color: "#f59e0b", desc: "Be the trusted advisor for our top creators. Help them launch successful campaigns, troubleshoot challenges, and grow on the platform." },
  { id: 6, title: "Compliance & Finance Analyst", dept: "Finance", type: "Full-time", location: "Pune", salary: "₹8–13 LPA", emoji: "📊", color: "#ef4444", desc: "Own GST filings, RBI compliance, and creator payout reconciliation. You'll ensure CrowdSpark is always on the right side of Indian financial regulations." },
  { id: 7, title: "DevOps Engineer", dept: "Engineering", type: "Full-time", location: "Remote — India", salary: "₹14–22 LPA", emoji: "🛠️", color: "#60a5fa", desc: "Manage our AWS infrastructure, build CI/CD pipelines, and ensure 99.9% uptime for a platform handling crores of rupees in transactions." },
  { id: 8, title: "Brand & Social Media Executive", dept: "Marketing", type: "Full-time", location: "Pune / Remote", salary: "₹5–8 LPA", emoji: "✨", color: "#a78bfa", desc: "Tell CrowdSpark's story across Instagram, LinkedIn, and YouTube. Collaborate with creators on content and grow our community organically." },
];

const PERKS = [
  { emoji: "🏥", title: "Health Insurance", desc: "Full family health coverage from day one" },
  { emoji: "🏠", title: "Remote-friendly", desc: "Work from anywhere in India, with optional Pune office" },
  { emoji: "📚", title: "Learning Budget", desc: "₹50,000/year for courses, conferences & books" },
  { emoji: "🍽️", title: "Meals & Snacks", desc: "Daily lunch and unlimited snacks at the Pune office" },
  { emoji: "🚀", title: "ESOP Pool", desc: "Meaningful equity stake for every permanent employee" },
  { emoji: "🌴", title: "Generous Leave", desc: "30 days PTO + all national holidays + birthday off" },
];

export default function CareersPage() {
  const { isDark } = useTheme();
  const [activeDept, setActiveDept] = useState<Dept>("All");
  const [openJob, setOpenJob] = useState<number | null>(null);

  const filtered = JOBS.filter(j => activeDept === "All" || j.dept === activeDept);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "96px 44px 80px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", marginBottom: 20 }}>
            <span style={{ fontSize: 14 }}>💼</span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "#7c3aed" }}>We're hiring</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--text)", margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Build the{" "}
            <span style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Future of Funding
            </span>{" "}
            with Us
          </h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 18, color: "var(--text-muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
            Join a small, ambitious team building India's most trusted crowdfunding platform. We're backed by great investors and backed by even better values.
          </p>
        </motion.div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 44px 96px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 72 }}>
          {[{ v: "38", l: "Team size" }, { v: "4+", l: "Years building" }, { v: "4.8★", l: "Glassdoor rating" }, { v: "96%", l: "Retention rate" }].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} style={{ textAlign: "center", padding: "28px 20px", borderRadius: 20, background: isDark ? "rgba(255,255,255,0.03)" : "#fff", border: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "var(--text)", marginBottom: 4 }}>{s.v}</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)" }}>{s.l}</div>
            </motion.div>
          ))}
        </div>

        {/* Perks */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--text)", marginBottom: 8 }}>Why CrowdSpark?</h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-muted)", marginBottom: 32 }}>We believe happy employees build the best products.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {PERKS.map((perk, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.06 }} style={{ padding: "24px", borderRadius: 18, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: "1px solid var(--border)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{perk.emoji}</div>
                <div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>{perk.title}</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{perk.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Open Roles */}
        <div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--text)", marginBottom: 8 }}>Open Roles</h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-muted)", marginBottom: 28 }}>{JOBS.length} positions across {DEPARTMENTS.length - 1} departments.</p>
          {/* Filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
            {DEPARTMENTS.map(dept => (
              <button key={dept} onClick={() => setActiveDept(dept)} style={{ padding: "8px 18px", borderRadius: 999, border: `1.5px solid ${activeDept === dept ? "rgba(124,58,237,0.6)" : "var(--border)"}`, background: activeDept === dept ? "rgba(124,58,237,0.1)" : "var(--bg-ghost)", color: activeDept === dept ? "#7c3aed" : "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.18s" }}>
                {dept}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((job, i) => (
                <motion.div key={job.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}>
                  <div style={{ borderRadius: 18, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: `1px solid ${openJob === job.id ? job.color + "55" : "var(--border)"}`, overflow: "hidden", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: openJob === job.id ? `0 8px 32px ${job.color}18` : "none" }}>
                    <button onClick={() => setOpenJob(openJob === job.id ? null : job.id)} style={{ width: "100%", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, textAlign: "left" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${job.color}18`, border: `1px solid ${job.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{job.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>{job.title}</div>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {[job.dept, job.type, job.location, job.salary].map((tag, ti) => (
                            <span key={ti} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>
                              {ti > 0 && <span style={{ marginRight: 12, opacity: 0.3 }}>·</span>}{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <svg style={{ color: "var(--text-muted)", transform: openJob === job.id ? "rotate(180deg)" : "", transition: "transform 0.25s", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <AnimatePresence>
                      {openJob === job.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                          <div style={{ padding: "0 24px 24px 84px" }}>
                            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.72, marginBottom: 20 }}>{job.desc}</p>
                            <Link href={`mailto:careers@crowdspark.in?subject=Application: ${job.title}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 12, background: `linear-gradient(135deg,${job.color},${job.color}cc)`, color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                              Apply Now →
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔭</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>No open roles in {activeDept}</div>
              <div style={{ fontSize: 13 }}>Check back soon, or send a speculative application to <a href="mailto:careers@crowdspark.in" style={{ color: "#7c3aed" }}>careers@crowdspark.in</a>.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
