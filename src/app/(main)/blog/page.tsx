"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

const CATEGORIES = ["All", "Creator Stories", "Platform Updates", "Tips & Guides", "Industry News"] as const;
type Cat = (typeof CATEGORIES)[number];

const POSTS = [
  {
    id: 1,
    category: "Creator Stories",
    tag: "Featured",
    title: "How Aditya Raised ₹28 Lakhs for His Smart Irrigation Startup in 45 Days",
    excerpt: "A Pune-based agricultural engineer shares the exact strategy that helped him smash his funding goal by 340% — from storytelling to backer outreach.",
    author: "Priya Nair",
    authorRole: "Platform Writer",
    date: "14 May 2025",
    readTime: "8 min read",
    emoji: "🌱",
    color: "#34d399",
  },
  {
    id: 2,
    category: "Platform Updates",
    tag: "New",
    title: "Introducing Instant KYC: Go Live in Under 2 Hours",
    excerpt: "We've partnered with DigiLocker to make creator verification faster than ever. Here's everything you need to know about our new instant KYC system.",
    author: "CrowdSpark Team",
    authorRole: "Product",
    date: "10 May 2025",
    readTime: "4 min read",
    emoji: "⚡",
    color: "#ff8800",
  },
  {
    id: 3,
    category: "Tips & Guides",
    tag: "Guide",
    title: "The Perfect Campaign Page: 12 Elements Every Top-Funded Project Has",
    excerpt: "We analysed 500+ successful campaigns on CrowdSpark. Here are the common elements that separate funded projects from ones that fall short.",
    author: "Rahul Mehta",
    authorRole: "Growth Lead",
    date: "5 May 2025",
    readTime: "11 min read",
    emoji: "📋",
    color: "#7c3aed",
  },
  {
    id: 4,
    category: "Industry News",
    tag: "News",
    title: "India's Crowdfunding Market to Hit ₹1,800 Crore by 2027: New Report",
    excerpt: "A comprehensive analysis of the Indian crowdfunding landscape, what's driving growth, and what it means for creators and backers on our platform.",
    author: "Sneha Kapoor",
    authorRole: "Research",
    date: "1 May 2025",
    readTime: "6 min read",
    emoji: "📈",
    color: "#60a5fa",
  },
  {
    id: 5,
    category: "Creator Stories",
    tag: "Story",
    title: "From Rejection to ₹15L: Meera's Children's Book Campaign",
    excerpt: "Rejected by 12 publishers, Meera turned to CrowdSpark — and her debut illustrated children's book found 2,400 backers who believed in her vision.",
    author: "Priya Nair",
    authorRole: "Platform Writer",
    date: "26 April 2025",
    readTime: "7 min read",
    emoji: "📚",
    color: "#f59e0b",
  },
  {
    id: 6,
    category: "Tips & Guides",
    tag: "Guide",
    title: "How to Write a Campaign Update Your Backers Will Actually Read",
    excerpt: "Backer engagement drops 60% after the first week. These update templates and timing strategies keep your community excited through the finish line.",
    author: "Rahul Mehta",
    authorRole: "Growth Lead",
    date: "20 April 2025",
    readTime: "5 min read",
    emoji: "✉️",
    color: "#34d399",
  },
  {
    id: 7,
    category: "Platform Updates",
    tag: "Update",
    title: "New Dashboard Analytics: Track Every Rupee and Every Backer",
    excerpt: "We've rebuilt the creator dashboard from scratch. Real-time charts, backer geography, reward tier breakdown, and conversion funnel — all in one place.",
    author: "CrowdSpark Team",
    authorRole: "Product",
    date: "15 April 2025",
    readTime: "3 min read",
    emoji: "📊",
    color: "#7c3aed",
  },
  {
    id: 8,
    category: "Industry News",
    tag: "Interview",
    title: "SEBI's New Crowdfunding Guidelines: What They Mean for You",
    excerpt: "We spoke with our legal team to break down what SEBI's updated crowdfunding regulations mean for creators, backers, and platforms like CrowdSpark.",
    author: "Sneha Kapoor",
    authorRole: "Research",
    date: "10 April 2025",
    readTime: "9 min read",
    emoji: "⚖️",
    color: "#ff8800",
  },
];

export default function BlogPage() {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState<Cat>("All");
  const [search, setSearch] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);

  const filtered = POSTS.filter(p => {
    const matchesCat = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = search === "" || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featured = POSTS[0];
  const rest = filtered.filter(p => p.id !== featured.id);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Hero */}
      <div ref={heroRef} style={{ position: "relative", overflow: "hidden", padding: "96px 44px 72px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,136,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.25)", marginBottom: 20 }}>
            <span style={{ fontSize: 14 }}>✍️</span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "#ff8800" }}>CrowdSpark Blog</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--text)", margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Stories, Guides &{" "}
            <span style={{ background: "linear-gradient(135deg,#ff5500,#ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Platform News
            </span>
          </h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 18, color: "var(--text-muted)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
              Insights from India&apos;s fastest-growing crowdfunding community — for creators who are ready to build something real.
          </p>
          {/* Search */}
          <div style={{ maxWidth: 460, margin: "0 auto", position: "relative" }}>
            <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles..."
              style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 44px 96px" }}>
        {/* Featured post */}
        {activeCategory === "All" && search === "" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 56 }}>
            <div style={{ borderRadius: 24, background: isDark ? "rgba(255,255,255,0.03)" : "#fff", border: "1px solid var(--border)", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1.1fr", boxShadow: isDark ? "0 24px 72px rgba(0,0,0,0.5)" : "0 8px 40px rgba(0,0,0,0.08)" }}>
              <div style={{ background: `linear-gradient(135deg, rgba(52,211,153,0.12), rgba(0,0,0,0.3))`, minHeight: 340, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 96 }}>{featured.emoji}</span>
              </div>
              <div style={{ padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(255,136,0,0.12)", border: "1px solid rgba(255,136,0,0.25)", fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: "#ff8800" }}>⭐ Featured</span>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>{featured.category}</span>
                </div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", color: "var(--text)", margin: "0 0 14px", letterSpacing: "-0.02em", lineHeight: 1.25 }}>{featured.title}</h2>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.72, margin: "0 0 28px" }}>{featured.excerpt}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#ff5500,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, color: "#fff" }}>{featured.author[0]}</div>
                    <div>
                      <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{featured.author}</div>
                      <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>{featured.date} · {featured.readTime}</div>
                    </div>
                  </div>
                  <Link href={`/blog/${featured.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg,#ff5500,#ff8800)", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                    Read →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "8px 18px", borderRadius: 999, border: `1.5px solid ${activeCategory === cat ? "rgba(255,136,0,0.6)" : "var(--border)"}`, background: activeCategory === cat ? "rgba(255,136,0,0.1)" : "var(--bg-ghost)", color: activeCategory === cat ? "#ff8800" : "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.18s" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
          <AnimatePresence mode="popLayout">
            {rest.map((post, i) => (
              <motion.div key={post.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/blog/${post.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ borderRadius: 20, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: "1px solid var(--border)", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.2)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}>
                    <div style={{ height: 160, background: `linear-gradient(135deg, ${post.color}18, rgba(0,0,0,0.1))`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 56 }}>{post.emoji}</span>
                    </div>
                    <div style={{ padding: "22px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ padding: "3px 9px", borderRadius: 999, background: `${post.color}18`, border: `1px solid ${post.color}35`, fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: post.color }}>{post.tag}</span>
                        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>{post.category}</span>
                      </div>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", margin: "0 0 10px", lineHeight: 1.35 }}>{post.title}</h3>
                      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.65, margin: "0 0 18px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>{post.author} · {post.date}</div>
                        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No articles found</div>
            <div style={{ fontSize: 14 }}>Try a different search term or category.</div>
          </div>
        )}
      </div>
    </div>
  );
}
