"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

const CHANNELS = [
  { emoji: "💬", name: "Discord Server", desc: "Real-time chat with 4,200+ creators and backers. Get feedback on your campaign, ask questions, and share wins.", members: "4,200+", color: "#7c3aed", cta: "Join Discord", href: "#" },
  { emoji: "🐦", name: "Twitter / X Community", desc: "Follow campaign launches, platform updates, and creator spotlights. Tag us in your wins!", members: "8,900+", color: "#60a5fa", cta: "Follow Us", href: "#" },
  { emoji: "📸", name: "Instagram", desc: "Behind-the-scenes creator stories, campaign highlights, and platform culture.", members: "6,100+", color: "#f59e0b", cta: "Follow Now", href: "#" },
  { emoji: "💼", name: "LinkedIn Group", desc: "Professional networking for creators, investors, and platform builders in the crowdfunding space.", members: "2,800+", color: "#34d399", cta: "Join Group", href: "#" },
];

const FORUMS = [
  { tag: "🔥 Trending", title: "Tips for reaching your first 100 backers in 48 hours?", author: "Karan M.", replies: 34, views: "1.2k", time: "2h ago", category: "Creator Tips" },
  { tag: "💡 New", title: "How do you handle reward fulfilment across different cities?", author: "Priya S.", replies: 18, views: "640", time: "5h ago", category: "Logistics" },
  { tag: "❓ Question", title: "Is it better to set a lower goal with stretch targets?", author: "Anuj K.", replies: 27, views: "890", time: "1d ago", category: "Strategy" },
  { tag: "🎉 Success", title: "Funded in 3 days! Here's my step-by-step breakdown", author: "Riya T.", replies: 56, views: "2.4k", time: "2d ago", category: "Creator Stories" },
  { tag: "🛠 Help", title: "KYC documents submitted 5 days ago, no update?", author: "Dev P.", replies: 9, views: "310", time: "3d ago", category: "Support" },
  { tag: "📣 Announcement", title: "Monthly Creator Meetup — Pune, 15 June 2025", author: "CrowdSpark", replies: 41, views: "3.1k", time: "4d ago", category: "Events" },
];

const EVENTS = [
  { name: "Creator Bootcamp — Pune", date: "15 June 2025", type: "In-person", spots: "12 left", emoji: "🏙️" },
  { name: "Campaign Pitch Night", date: "22 June 2025", type: "Online", spots: "Open", emoji: "🎤" },
  { name: "Backer AMA with Founders", date: "29 June 2025", type: "Online", spots: "Open", emoji: "💬" },
  { name: "Creator Bootcamp — Bangalore", date: "13 July 2025", type: "In-person", spots: "20 left", emoji: "🌆" },
];

export default function CommunityPage() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<"forums" | "events">("forums");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "96px 44px 80px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(52,211,153,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", marginBottom: 20 }}>
            <span style={{ fontSize: 14 }}>🤝</span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "#34d399" }}>18,400+ Members</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--text)", margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            The CrowdSpark{" "}
            <span style={{ background: "linear-gradient(135deg,#34d399,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Community
            </span>
          </h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 18, color: "var(--text-muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
            India&apos;s most supportive crowdfunding community — learn from fellow creators, connect with backers, and share your wins.
          </p>
        </motion.div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 44px 96px" }}>

        {/* Community Channels */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--text)", marginBottom: 8 }}>Join the Conversation</h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-muted)", marginBottom: 32 }}>Find us where you hang out.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {CHANNELS.map((ch, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <div style={{ padding: "28px 24px", borderRadius: 22, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: `1px solid ${ch.color}25`, height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px ${ch.color}18`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}>
                  <div style={{ fontSize: 36, marginBottom: 14 }}>{ch.emoji}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", margin: 0 }}>{ch.name}</h3>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: ch.color, fontWeight: 700 }}>{ch.members}</span>
                  </div>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.68, flex: 1, marginBottom: 20 }}>{ch.desc}</p>
                  <a href={ch.href} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, background: `${ch.color}18`, border: `1px solid ${ch.color}30`, color: ch.color, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, textDecoration: "none", alignSelf: "flex-start", transition: "background 0.18s" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = `${ch.color}30`)}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = `${ch.color}18`)}>
                    {ch.cta} →
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tabs: Forums & Events */}
        <div>
          <div style={{ display: "flex", gap: 4, marginBottom: 32, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", borderRadius: 14, padding: 4, width: "fit-content" }}>
            {(["forums", "events"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "10px 24px", borderRadius: 11, border: "none", background: activeTab === tab ? (isDark ? "rgba(255,255,255,0.1)" : "#fff") : "transparent", color: activeTab === tab ? "var(--text)" : "var(--text-muted)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.18s", boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.12)" : "none", textTransform: "capitalize" }}>
                {tab === "forums" ? "💬 Forums" : "📅 Events"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "forums" && (
              <motion.div key="forums" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {FORUMS.map((post, i) => (
                    <div key={i} style={{ padding: "18px 22px", borderRadius: 16, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", transition: "border-color 0.18s" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(52,211,153,0.3)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "")}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700 }}>{post.tag}</span>
                          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>{post.category}</span>
                        </div>
                        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>{post.title}</div>
                        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>by {post.author} · {post.time}</div>
                      </div>
                      <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{post.replies}</div>
                          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>replies</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{post.views}</div>
                          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>views</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 13, border: "1.5px solid var(--border)", color: "var(--text-muted)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none", transition: "border-color 0.18s, color 0.18s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,211,153,0.4)"; (e.currentTarget as HTMLElement).style.color = "#34d399"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ""; (e.currentTarget as HTMLElement).style.color = ""; }}>
                    View All Discussions →
                  </a>
                </div>
              </motion.div>
            )}

            {activeTab === "events" && (
              <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                  {EVENTS.map((ev, i) => (
                    <div key={i} style={{ padding: "24px", borderRadius: 18, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: "1px solid var(--border)", cursor: "pointer", transition: "transform 0.2s, border-color 0.2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(52,211,153,0.4)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.borderColor = ""; }}>
                      <div style={{ fontSize: 36, marginBottom: 14 }}>{ev.emoji}</div>
                      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>{ev.name}</div>
                      <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>📅 {ev.date}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                        <span style={{ padding: "4px 10px", borderRadius: 999, background: ev.type === "Online" ? "rgba(96,165,250,0.12)" : "rgba(52,211,153,0.12)", border: `1px solid ${ev.type === "Online" ? "rgba(96,165,250,0.3)" : "rgba(52,211,153,0.3)"}`, fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: ev.type === "Online" ? "#60a5fa" : "#34d399" }}>{ev.type}</span>
                        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>🎟 {ev.spots}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
