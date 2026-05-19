"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Rocket, Users, Shield, DollarSign, Settings,
  BookOpen, MessageSquare, ArrowRight, ExternalLink,
  Zap, CheckCircle2, Clock, Star, ChevronRight,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

const HELP_CATS = [
  {
    icon: <Rocket size={22} />,
    color: "#ff8800",
    title: "Getting started",
    desc: "New to CrowdSpark-X? Start here.",
    links: [
      { label: "Create your first account",    href: "/register" },
      { label: "How backing a campaign works",  href: "/faq#backers" },
      { label: "Explore active campaigns",      href: "/explore" },
      { label: "What makes a great campaign?",  href: "/faq#creators" },
    ],
  },
  {
    icon: <Shield size={22} />,
    color: "#7c3aed",
    title: "KYC & verification",
    desc: "Everything about identity verification.",
    links: [
      { label: "Why KYC is required",           href: "/faq#kyc" },
      { label: "Documents needed for KYC",      href: "/faq#kyc" },
      { label: "KYC review timeline",           href: "/faq#kyc" },
      { label: "My KYC was rejected — help",    href: "/contact" },
    ],
  },
  {
    icon: <DollarSign size={22} />,
    color: "#34d399",
    title: "Payments & payouts",
    desc: "Fees, refunds, and payout timelines.",
    links: [
      { label: "Accepted payment methods",      href: "/faq#payments" },
      { label: "Platform fee breakdown",        href: "/faq#payments" },
      { label: "When will I receive my payout?", href: "/faq#payments" },
      { label: "How refunds work",              href: "/faq#payments" },
    ],
  },
  {
    icon: <Users size={22} />,
    color: "#60a5fa",
    title: "Creator tools",
    desc: "Launch and manage your campaigns.",
    links: [
      { label: "Create a campaign",             href: "/dashboard/create-campaign" },
      { label: "My campaign dashboard",         href: "/dashboard/my-campaigns" },
      { label: "Managing reward tiers",         href: "/faq#creators" },
      { label: "Campaign analytics explained",  href: "/dashboard/my-campaigns" },
    ],
  },
  {
    icon: <BookOpen size={22} />,
    color: "#f59e0b",
    title: "Policies",
    desc: "Our rules, terms, and commitments.",
    links: [
      { label: "Terms of Service",              href: "/terms" },
      { label: "Privacy Policy",               href: "/privacy" },
      { label: "Backer Protection Policy",     href: "/faq#backers" },
      { label: "Prohibited campaigns list",    href: "/terms#creators" },
    ],
  },
  {
    icon: <Settings size={22} />,
    color: "#ec4899",
    title: "Account & settings",
    desc: "Manage your profile and preferences.",
    links: [
      { label: "Update your profile",          href: "/dashboard/profile" },
      { label: "Change email or password",     href: "/dashboard/settings" },
      { label: "Notification preferences",     href: "/dashboard/settings" },
      { label: "Delete your account",          href: "/contact" },
    ],
  },
];

const QUICK_LINKS = [
  { icon: <Rocket size={15} />,      color: "#ff8800", label: "Start a campaign",    href: "/dashboard/create-campaign" },
  { icon: <Shield size={15} />,      color: "#7c3aed", label: "Complete KYC",        href: "/dashboard/become-creator" },
  { icon: <MessageSquare size={15}/>, color: "#60a5fa", label: "Contact support",    href: "/contact" },
  { icon: <BookOpen size={15} />,    color: "#34d399", label: "Browse FAQs",         href: "/faq" },
];

const STATUS_ITEMS = [
  { label: "Platform API",          status: "operational" as const },
  { label: "Payment processing",    status: "operational" as const },
  { label: "KYC verification",      status: "operational" as const },
  { label: "Email notifications",   status: "operational" as const },
  { label: "File uploads",          status: "operational" as const },
];

function StatusDot({ status }: { status: "operational" | "degraded" | "down" }) {
  const colors = { operational: "#34d399", degraded: "#f59e0b", down: "#ef4444" };
  const c = colors[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}`, animation: "hlDot 1.5s ease-in-out infinite" }} />
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 600, color: c, textTransform: "capitalize" }}>{status}</span>
    </span>
  );
}

export default function HelpPage() {
  const { isDark } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx1 = gsap.context(() => {
      gsap.fromTo(".hl-hero-in",
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.09, duration: 0.75, ease: "power3.out", delay: 0.15 }
      );
    }, heroRef);

    const ctx2 = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".hl-reveal").forEach(el => {
        gsap.fromTo(el,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true } }
        );
      });
    }, bodyRef);

    return () => { ctx1.revert(); ctx2.revert(); };
  }, []);

  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card = isDark ? "rgba(255,255,255,0.03)" : "#fff";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingTop: 64 }}>

      {/* Ambient */}
      <div aria-hidden style={{ position: "fixed", top: "-6%", right: "-6%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(52,211,153,0.055) 0%,transparent 70%)", filter: "blur(65px)", pointerEvents: "none", zIndex: 0 }} />
      <div aria-hidden style={{ position: "fixed", bottom: "6%", left: "-5%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.05) 0%,transparent 70%)", filter: "blur(65px)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── Hero ── */}
      <section ref={heroRef} style={{ position: "relative", zIndex: 1, padding: "80px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div className="hl-hero-in" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.28)", marginBottom: 24 }}>
            <Zap size={12} color="#34d399" />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em" }}>Help Centre</span>
          </div>
          <h1 className="hl-hero-in" style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(36px,5.5vw,66px)", color: "var(--text)", letterSpacing: "-0.035em", lineHeight: 1.05, margin: "0 0 20px" }}>
            How can we
            <br />
            <span style={{ color: "var(--accent)", textShadow: "0 0 40px var(--accent-glow)" }}>help you?</span>
          </h1>
          <p className="hl-hero-in" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "clamp(14px,1.7vw,17px)", color: "var(--text-muted)", lineHeight: 1.85, maxWidth: 520, margin: "0 auto 40px" }}>
            Find answers, guides, and everything you need to make the most of CrowdSpark-X.
          </p>

          {/* Quick action buttons */}
          <div className="hl-hero-in" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {QUICK_LINKS.map(({ icon, color, label, href }) => (
              <Link key={label} href={href}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 12, border: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", color: "var(--text-muted)", textDecoration: "none", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, transition: "all 0.15s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = color + "44"; el.style.color = color; el.style.background = color + "0e"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = bdr; el.style.color = "var(--text-muted)"; el.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"; }}
              >
                <span style={{ color }}>{icon}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div ref={bodyRef}>
        {/* ── Help categories ── */}
        <section style={{ position: "relative", zIndex: 1, padding: "0 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="hl-reveal" style={{ textAlign: "center", marginBottom: 44 }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(22px,3vw,34px)", color: "var(--text)", letterSpacing: "-0.025em", margin: 0 }}>
                Browse by topic
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="hl-cats-grid">
              {HELP_CATS.map(({ icon, color, title, desc, links }) => (
                <motion.div
                  key={title}
                  className="hl-reveal"
                  whileHover={{ y: -5, boxShadow: `0 16px 48px rgba(0,0,0,0.12), 0 0 0 1px ${color}20` }}
                  transition={{ duration: 0.2 }}
                  style={{ borderRadius: 22, background: card, border: `1px solid ${bdr}`, overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)", position: "relative" }}
                >
                  {/* Top line */}
                  <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg,transparent,${color}55,transparent)` }} />

                  <div style={{ padding: "24px 22px 20px" }}>
                    <div style={{ width: 46, height: 46, borderRadius: 14, background: `${color}15`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", color, marginBottom: 16 }}>
                      {icon}
                    </div>
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.015em" }}>{title}</h3>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: "0 0 18px" }}>{desc}</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 18, borderTop: `1px solid ${bdr}` }}>
                      {links.map(({ label, href }) => (
                        <Link key={label} href={href}
                          style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.15s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = color; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
                        >
                          <ChevronRight size={12} style={{ flexShrink: 0, color }} />
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Platform status ── */}
        <section style={{ position: "relative", zIndex: 1, padding: "0 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }} className="hl-bottom-grid">

            {/* Status card */}
            <div className="hl-reveal" style={{ borderRadius: 22, background: card, border: `1px solid ${bdr}`, overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.05)", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(52,211,153,0.5),transparent)" }} />
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", margin: 0 }}>Platform Status</h2>
                </div>
                <a href="#" target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", textDecoration: "none", fontWeight: 600, transition: "color 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#34d399"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
                >
                  Status page <ExternalLink size={11} />
                </a>
              </div>
              <div style={{ padding: "12px 24px 20px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 8, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", marginBottom: 18 }}>
                  <CheckCircle2 size={13} color="#34d399" />
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "#34d399" }}>All systems operational</span>
                </div>
                {STATUS_ITEMS.map(({ label, status }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text)", fontWeight: 500 }}>{label}</span>
                    <StatusDot status={status} />
                  </div>
                ))}
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)", margin: "12px 0 0", display: "flex", alignItems: "center", gap: 5 }}>
                  <Clock size={11} /> Last checked: just now
                </p>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Contact support */}
              <div className="hl-reveal" style={{ borderRadius: 20, padding: "22px", background: isDark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.2)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent)" }} />
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed", marginBottom: 14 }}>
                  <MessageSquare size={18} />
                </div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text)", margin: "0 0 8px" }}>Still need help?</h3>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 18px", lineHeight: 1.75 }}>
                  Our support team is available Mon–Sat, 9AM to 7PM IST. We reply to every message.
                </p>
                <Link href="/contact"
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 11, background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 4px 18px rgba(124,58,237,0.35)", transition: "transform 0.18s, box-shadow 0.18s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 28px rgba(124,58,237,0.45)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = ""; el.style.boxShadow = "0 4px 18px rgba(124,58,237,0.35)"; }}
                >
                  Contact support <ArrowRight size={14} />
                </Link>
              </div>

              {/* Response times */}
              <div className="hl-reveal" style={{ borderRadius: 20, padding: "20px 22px", background: card, border: `1px solid ${bdr}`, boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)" }}>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.09em" }}>Expected response times</p>
                {[
                  { channel: "Live chat",  time: "Under 3 minutes",   color: "#34d399" },
                  { channel: "Email",      time: "Under 24 hours",    color: "#60a5fa" },
                  { channel: "Phone",      time: "Under 1 minute",    color: "#ff8800" },
                ].map(({ channel, time, color }) => (
                  <div key={channel} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text)", fontWeight: 500 }}>{channel}</span>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 700, color, background: color + "12", padding: "3px 9px", borderRadius: 7, border: `1px solid ${color}22` }}>{time}</span>
                  </div>
                ))}
              </div>

              {/* Satisfaction */}
              <div className="hl-reveal" style={{ borderRadius: 20, padding: "18px 22px", background: card, border: `1px solid ${bdr}`, display: "flex", alignItems: "center", gap: 14, boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[0,1,2,3,4].map(i => <Star key={i} size={17} color="#f59e0b" fill="#f59e0b" />)}
                </div>
                <div>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text)", margin: "0 0 2px" }}>97% satisfaction</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Based on 4,200+ support tickets resolved</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Popular guides ── */}
        <section style={{ position: "relative", zIndex: 1, padding: "0 24px 96px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="hl-reveal" style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(20px,2.8vw,32px)", color: "var(--text)", letterSpacing: "-0.025em", margin: "0 0 6px" }}>Popular guides</h2>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: 0 }}>The most-visited help articles this month</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }} className="hl-guides-grid">
              {[
                { title: "How to complete your KYC in under 10 minutes",         cat: "KYC",       color: "#7c3aed", href: "/faq#kyc" },
                { title: "Setting reward tiers that backers actually want",        cat: "Creators",  color: "#ff8800", href: "/faq#creators" },
                { title: "All-or-nothing vs keep-what-you-raise: which to pick",  cat: "Creators",  color: "#ff8800", href: "/faq#creators" },
                { title: "Understanding your campaign analytics dashboard",        cat: "Creators",  color: "#ff8800", href: "/dashboard/my-campaigns" },
                { title: "What happens when I back a campaign?",                  cat: "Backers",   color: "#60a5fa", href: "/faq#backers" },
                { title: "How to get a refund if rewards aren't delivered",        cat: "Backers",   color: "#60a5fa", href: "/faq#backers" },
              ].map(({ title, cat, color, href }) => (
                <Link key={title} href={href} className="hl-reveal"
                  style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", borderRadius: 16, background: card, border: `1px solid ${bdr}`, textDecoration: "none", transition: "all 0.18s", boxShadow: isDark ? "none" : "0 1px 10px rgba(0,0,0,0.04)" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = color + "44"; el.style.boxShadow = `0 6px 28px rgba(0,0,0,0.12), 0 0 0 1px ${color}18`; el.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = bdr; el.style.boxShadow = isDark ? "none" : "0 1px 10px rgba(0,0,0,0.04)"; el.style.transform = ""; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}12`, border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
                    <BookOpen size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 5px", lineHeight: 1.35 }}>{title}</p>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700, color, background: color + "12", padding: "2px 8px", borderRadius: 6 }}>{cat}</span>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .hl-hero-in, .hl-reveal { opacity: 0; }
        @keyframes hlDot { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
        @media(max-width:900px){
          .hl-cats-grid   { grid-template-columns: repeat(2,1fr) !important; }
          .hl-bottom-grid { grid-template-columns: 1fr !important; }
          .hl-guides-grid { grid-template-columns: 1fr !important; }
        }
        @media(max-width:540px){
          .hl-cats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}