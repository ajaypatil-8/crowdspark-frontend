"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Rocket, Target, Users, Shield, Zap, Heart,
  ArrowRight, Star, TrendingUp, Globe, CheckCircle2,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

const TEAM = [
  { name: "Arjun Mehta",   role: "CEO & Co-founder",      grad: "135deg,#ff6b00,#ffcc00", init: "AM" },
  { name: "Priya Sharma",  role: "CTO & Co-founder",      grad: "135deg,#7c3aed,#a855f7", init: "PS" },
  { name: "Rohan Das",     role: "Head of Design",         grad: "135deg,#00f5d4,#00a882", init: "RD" },
  { name: "Sneha Kapoor",  role: "Head of Growth",         grad: "135deg,#60a5fa,#3b82f6", init: "SK" },
  { name: "Dev Patel",     role: "Lead Engineer",          grad: "135deg,#f59e0b,#d97706", init: "DP" },
  { name: "Meera Joshi",   role: "Community Lead",         grad: "135deg,#ec4899,#db2777", init: "MJ" },
];

const VALUES = [
  { icon: <Shield size={20} />,    color: "#7c3aed", title: "Trust first",       body: "Every campaign is KYC-verified. Every backer is protected. No exceptions." },
  { icon: <Zap size={20} />,       color: "#ff8800", title: "Move fast",         body: "We ship faster than incumbents because we believe in creators, not committees." },
  { icon: <Heart size={20} />,     color: "#ec4899", title: "Creator obsessed",  body: "We measure success by how many ideas found their funding, not by our margins." },
  { icon: <Globe size={20} />,     color: "#34d399", title: "India-first",       body: "Built for Indian creators and the 1.4 billion people who might back them." },
];

const STATS = [
  { value: "₹48Cr+", label: "Total funded",        color: "#ff8800" },
  { value: "12,400+", label: "Campaigns launched", color: "#7c3aed" },
  { value: "2.3L+",   label: "Verified backers",   color: "#34d399" },
  { value: "94%",     label: "Success rate",       color: "#60a5fa" },
];

const MILESTONES = [
  { year: "2022", title: "Founded",          desc: "CrowdSpark-X was founded in Bangalore with a simple belief: every great idea deserves funding." },
  { year: "2022", title: "First campaign",   desc: "AgroSense IoT became our first funded campaign — ₹22L raised in 18 days." },
  { year: "2023", title: "100 campaigns",    desc: "Crossed 100 successfully funded campaigns and welcomed our first institutional backers." },
  { year: "2023", title: "KYC launch",       desc: "Launched India's first in-app KYC for crowdfunding — setting a new trust standard." },
  { year: "2024", title: "10,000 backers",   desc: "Our community crossed 10,000 verified backers across 18 Indian cities." },
  { year: "2025", title: "₹48Cr milestone",  desc: "Crossed ₹48 crore in total funds raised. The momentum is just beginning." },
];

export default function AboutPage() {
  const { isDark } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const sectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx1 = gsap.context(() => {
      gsap.fromTo(".ab-hero-in",
        { y: 40, opacity: 0, filter: "blur(5px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", stagger: 0.1, duration: 0.85, ease: "power3.out", delay: 0.2 }
      );
    }, heroRef);

    const ctx2 = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".ab-reveal").forEach(el => {
        gsap.fromTo(el,
          { y: 36, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }
        );
      });
    }, sectRef);

    return () => { ctx1.revert(); ctx2.revert(); };
  }, []);

  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card = isDark ? "rgba(255,255,255,0.03)" : "#fff";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingTop: 64 }}>

      {/* ── Ambient ── */}
      <div aria-hidden style={{ position: "fixed", top: "-5%", right: "-8%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
      <div aria-hidden style={{ position: "fixed", bottom: "5%", left: "-5%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.05) 0%,transparent 70%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />

      {/* ════ HERO ════ */}
      <section ref={heroRef} style={{ position: "relative", zIndex: 1, padding: "88px 24px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          <div className="ab-hero-in" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", marginBottom: 28 }}>
            <Rocket size={13} color="#7c3aed" />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Our story
            </span>
          </div>

          <h1 className="ab-hero-in" style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(40px,6vw,76px)", color: "var(--text)", letterSpacing: "-0.035em", lineHeight: 1.04, margin: "0 0 24px" }}>
            We believe every
            <br />
            <span style={{ color: "var(--accent)", textShadow: "0 0 48px var(--accent-glow)" }}>great idea</span>
            <br />
            deserves funding.
          </h1>

          <p className="ab-hero-in" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "clamp(15px,1.8vw,18px)", color: "var(--text-muted)", lineHeight: 1.85, maxWidth: 560, margin: "0 auto 44px" }}>
            CrowdSpark-X is India's most transparent crowdfunding platform — built for creators
            who dare to dream and backers who believe in them.
          </p>

          <div className="ab-hero-in" style={{ display: "flex", gap: 13, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 13, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5, boxShadow: "0 4px 24px rgba(255,100,0,0.4)", transition: "transform 0.18s, box-shadow 0.18s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 36px rgba(255,100,0,0.5)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = ""; el.style.boxShadow = "0 4px 24px rgba(255,100,0,0.4)"; }}
            >
              Explore campaigns <ArrowRight size={14} />
            </Link>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 13, border: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", color: "var(--text)", textDecoration: "none", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14.5, transition: "all 0.18s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "rgba(124,58,237,0.4)"; el.style.color = "#7c3aed"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = bdr; el.style.color = "var(--text)"; }}
            >
              Start a campaign
            </Link>
          </div>
        </div>
      </section>

      <div ref={sectRef}>

        {/* ════ STATS ════ */}
        <section style={{ position: "relative", zIndex: 1, padding: "0 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }} className="ab-stats-grid">
            {STATS.map(({ value, label, color }, i) => (
              <motion.div
                key={label}
                className="ab-reveal"
                whileHover={{ y: -5, boxShadow: `0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px ${color}22` }}
                transition={{ duration: 0.2 }}
                style={{ padding: "28px 24px", borderRadius: 20, background: card, border: `1px solid ${bdr}`, textAlign: "center", cursor: "default", position: "relative", overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)" }}
              >
                <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle,${color}18 0%,transparent 70%)`, pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg,transparent,${color}55,transparent)` }} />
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.5vw,42px)", color, margin: "0 0 6px", letterSpacing: "-0.03em", textShadow: `0 0 28px ${color}44` }}>
                  {value}
                </p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: 0, fontWeight: 500 }}>{label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════ MISSION ════ */}
        <section style={{ position: "relative", zIndex: 1, padding: "0 24px 96px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }} className="ab-mission-grid">
            {/* Left */}
            <div className="ab-reveal">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 13px", borderRadius: 999, background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.25)", marginBottom: 20 }}>
                <Target size={12} color="#ff8800" />
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700, color: "#ff8800", textTransform: "uppercase", letterSpacing: "0.08em" }}>Our mission</span>
              </div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.5vw,44px)", color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 20px" }}>
                Democratising capital for India's creators
              </h2>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15.5, color: "var(--text-muted)", lineHeight: 1.85, margin: "0 0 18px" }}>
                For too long, access to funding was locked behind banks and investors who didn't understand
                creative, entrepreneurial, and social ventures. CrowdSpark-X changes that.
              </p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15.5, color: "var(--text-muted)", lineHeight: 1.85, margin: "0 0 32px" }}>
                We give every verified creator a direct line to the people who believe in their vision —
                with full transparency, zero hidden fees, and technology that gets out of the way.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {["100% transparent fee structure", "KYC-verified creators only", "Secure escrow-backed payouts", "Real-time backer notifications"].map(pt => (
                  <div key={pt} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircle2 size={15} color="#34d399" style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: "var(--text)", fontWeight: 500 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — visual */}
            <div className="ab-reveal" style={{ position: "relative" }}>
              <div style={{ borderRadius: 24, padding: "36px 32px", background: isDark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.18)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent)" }} />

                {[
                  { label: "Creator submits KYC", step: "01", color: "#7c3aed" },
                  { label: "Campaign goes live",  step: "02", color: "#ff8800" },
                  { label: "Backers fund the idea", step: "03", color: "#34d399" },
                  { label: "Creator receives funds", step: "04", color: "#60a5fa" },
                ].map(({ label, step, color }, i) => (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: i < 3 ? 20 : 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 12, color }}>{step}</span>
                    </div>
                    {i < 3 && (
                      <div style={{ position: "absolute", left: 52, width: 1, height: 20, background: `linear-gradient(to bottom,${color}40,transparent)`, marginTop: 40 }} />
                    )}
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text)", fontWeight: 600 }}>{label}</span>
                    <CheckCircle2 size={14} color={color} style={{ marginLeft: "auto", flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════ VALUES ════ */}
        <section style={{ position: "relative", zIndex: 1, padding: "0 24px 96px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="ab-reveal" style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 13px", borderRadius: 999, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", marginBottom: 18 }}>
                <Star size={12} color="#34d399" />
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em" }}>Our values</span>
              </div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.5vw,44px)", color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
                Principles we build by
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }} className="ab-vals-grid">
              {VALUES.map(({ icon, color, title, body }) => (
                <motion.div
                  key={title}
                  className="ab-reveal"
                  whileHover={{ y: -6, boxShadow: `0 16px 48px rgba(0,0,0,0.15), 0 0 0 1px ${color}20` }}
                  transition={{ duration: 0.2 }}
                  style={{ padding: "28px 22px", borderRadius: 22, background: card, border: `1px solid ${bdr}`, position: "relative", overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)" }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${color}55,transparent)` }} />
                  <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle,${color}14 0%,transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: `${color}15`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", color, marginBottom: 18 }}>
                    {icon}
                  </div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.015em" }}>{title}</h3>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.75, margin: 0 }}>{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════ TIMELINE ════ */}
        <section style={{ position: "relative", zIndex: 1, padding: "0 24px 96px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div className="ab-reveal" style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 13px", borderRadius: 999, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)", marginBottom: 18 }}>
                <TrendingUp size={12} color="#60a5fa" />
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em" }}>Our journey</span>
              </div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.5vw,44px)", color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
                How we got here
              </h2>
            </div>

            <div style={{ position: "relative" }}>
              {/* vertical line */}
              <div style={{ position: "absolute", left: 22, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom,transparent,var(--border),var(--border),transparent)`, zIndex: 0 }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {MILESTONES.map(({ year, title, desc }, i) => {
                  const colors = ["#ff8800","#7c3aed","#34d399","#60a5fa","#f59e0b","#ec4899"];
                  const color = colors[i % colors.length];
                  return (
                    <div key={`${year}-${title}`} className="ab-reveal" style={{ display: "flex", gap: 20, paddingBottom: 36, position: "relative" }}>
                      <div style={{ flexShrink: 0, position: "relative", zIndex: 1 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: card, border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 16px ${color}33` }}>
                          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 11, color }}>{year}</span>
                        </div>
                      </div>
                      <div style={{ paddingTop: 8, flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text)", margin: "0 0 7px", letterSpacing: "-0.015em" }}>{title}</h3>
                        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75, margin: 0 }}>{desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ════ TEAM ════ */}
        <section style={{ position: "relative", zIndex: 1, padding: "0 24px 96px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="ab-reveal" style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 13px", borderRadius: 999, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.25)", marginBottom: 18 }}>
                <Users size={12} color="#ec4899" />
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700, color: "#ec4899", textTransform: "uppercase", letterSpacing: "0.08em" }}>The team</span>
              </div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.5vw,44px)", color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
                People behind the platform
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="ab-team-grid">
              {TEAM.map(({ name, role, grad, init }) => (
                <motion.div
                  key={name}
                  className="ab-reveal"
                  whileHover={{ y: -5, boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}
                  transition={{ duration: 0.2 }}
                  style={{ padding: "28px 22px", borderRadius: 22, background: card, border: `1px solid ${bdr}`, textAlign: "center", boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)" }}
                >
                  <div style={{ width: 68, height: 68, borderRadius: "50%", background: `linear-gradient(${grad})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff" }}>
                    {init}
                  </div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: "var(--text)", margin: "0 0 5px", letterSpacing: "-0.015em" }}>{name}</h3>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════ BOTTOM CTA ════ */}
        <section className="ab-reveal" style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", borderRadius: 28, padding: "60px 48px", background: isDark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.2)", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 32px rgba(124,58,237,0.08)" }}>
            <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent)" }} />
            <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#7c3aed" }}>
              <Rocket size={26} />
            </div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,3.5vw,38px)", color: "var(--text)", letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              Join the movement
            </h2>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15.5, color: "var(--text-muted)", lineHeight: 1.8, maxWidth: 480, margin: "0 auto 36px" }}>
              Whether you're a creator with a vision or a backer looking to shape the future —
              your place on CrowdSpark-X is waiting.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 30px", borderRadius: 13, background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5, boxShadow: "0 4px 24px rgba(124,58,237,0.4)", transition: "transform 0.18s, box-shadow 0.18s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 36px rgba(124,58,237,0.5)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = ""; el.style.boxShadow = "0 4px 24px rgba(124,58,237,0.4)"; }}
              >
                Create your account <ArrowRight size={14} />
              </Link>
              <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 13, border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.06)", color: "#7c3aed", textDecoration: "none", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14.5, transition: "all 0.18s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "rgba(124,58,237,0.5)"; el.style.background = "rgba(124,58,237,0.1)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "rgba(124,58,237,0.3)"; el.style.background = "rgba(124,58,237,0.06)"; }}
              >
                Contact us
              </Link>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .ab-hero-in,.ab-reveal{opacity:0;}
        @media(max-width:900px){
          .ab-stats-grid{grid-template-columns:repeat(2,1fr)!important;}
          .ab-mission-grid{grid-template-columns:1fr!important;}
          .ab-vals-grid{grid-template-columns:repeat(2,1fr)!important;}
          .ab-team-grid{grid-template-columns:repeat(2,1fr)!important;}
        }
        @media(max-width:560px){
          .ab-stats-grid{grid-template-columns:repeat(2,1fr)!important;}
          .ab-vals-grid{grid-template-columns:1fr!important;}
          .ab-team-grid{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
