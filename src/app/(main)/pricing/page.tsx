"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/contexts/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

// ── Plans ─────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id:    "backer",
    name:  "Backer",
    badge: null,
    priceM: 0,
    priceY: 0,
    desc:  "Discover and support campaigns you believe in.",
    color: "#60a5fa",
    gradient: "linear-gradient(135deg,rgba(96,165,250,0.15),rgba(96,165,250,0.05))",
    cta:   "Start backing",
    href:  "/register",
    features: [
      { text: "Browse all campaigns",           yes: true  },
      { text: "Back unlimited projects",         yes: true  },
      { text: "UPI, cards & wallets",            yes: true  },
      { text: "Live project updates",            yes: true  },
      { text: "Backer-only posts & updates",     yes: true  },
      { text: "Refund protection via escrow",    yes: true  },
      { text: "Launch campaigns",                yes: false },
      { text: "Analytics dashboard",             yes: false },
      { text: "Priority support",                yes: false },
    ],
  },
  {
    id:    "creator",
    name:  "Creator",
    badge: "Most popular",
    priceM: 499,
    priceY: 399,
    desc:  "Everything you need to launch and fund your idea.",
    color: "#ff8800",
    gradient: "linear-gradient(135deg,rgba(255,136,0,0.18),rgba(255,200,0,0.08))",
    cta:   "Become a Creator",
    href:  "/register",
    features: [
      { text: "Everything in Backer",            yes: true  },
      { text: "Launch unlimited campaigns",      yes: true  },
      { text: "KYC verification (24h)",          yes: true  },
      { text: "Real-time analytics dashboard",   yes: true  },
      { text: "Campaign page editor",            yes: true  },
      { text: "GST-compliant invoicing",         yes: true  },
      { text: "Backer CRM & messaging",          yes: true  },
      { text: "AI copy assistant",               yes: false },
      { text: "Priority support",                yes: false },
    ],
  },
  {
    id:    "pro",
    name:  "Pro Creator",
    badge: "Best value",
    priceM: 999,
    priceY: 799,
    desc:  "Advanced tools for serious creators scaling fast.",
    color: "#a78bfa",
    gradient: "linear-gradient(135deg,rgba(167,139,250,0.18),rgba(167,139,250,0.06))",
    cta:   "Go Pro",
    href:  "/register",
    features: [
      { text: "Everything in Creator",           yes: true  },
      { text: "AI copy &amp; image assistant",   yes: true  },
      { text: "A/B testing for campaign pages",  yes: true  },
      { text: "Advanced conversion analytics",   yes: true  },
      { text: "Custom domain for campaign",      yes: true  },
      { text: "Early access to new features",    yes: true  },
      { text: "Dedicated account manager",       yes: true  },
      { text: "Priority 2-hour support",         yes: true  },
      { text: "Reduced platform fee (3%)",       yes: true  },
    ],
  },
];

const COMPARE_ROWS = [
  { label: "Platform fee",       vals: ["5%",    "5%",   "3%"]   },
  { label: "Payment fee",        vals: ["2%",    "2%",   "1.5%"] },
  { label: "Campaigns",          vals: ["—",     "∞",    "∞"]    },
  { label: "Analytics",          vals: ["—",     "Basic","Advanced"] },
  { label: "AI assistant",       vals: ["—",     "—",    "✓"]    },
  { label: "Custom domain",      vals: ["—",     "—",    "✓"]    },
  { label: "Dedicated manager",  vals: ["—",     "—",    "✓"]    },
  { label: "Support SLA",        vals: ["Forum", "24h",  "2h"]   },
];

const PRICING_FAQS = [
  { q: "Is the Backer plan really free?", a: "Yes, permanently. Backing projects is free — you only pay what you pledge. There are no hidden fees for backers." },
  { q: "What's the platform fee on funded campaigns?", a: "Creator plan: 5% + 2% payment processing. Pro Creator: 3% + 1.5% payment processing. Fees are only charged on successfully funded campaigns." },
  { q: "Can I switch plans?", a: "Yes, you can upgrade or downgrade at any time. When upgrading, you're prorated for the remaining billing period. Downgrading takes effect at the next billing cycle." },
  { q: "Is there a free trial for paid plans?", a: "Yes! Creator and Pro Creator plans include a 14-day free trial, no credit card required. You can run a live campaign during the trial period." },
  { q: "Do I get refunded if my campaign fails?", a: "If your campaign doesn't reach its goal, backers are fully refunded and you pay zero platform fees. We only earn when you earn." },
];

export default function PricingPage() {
  const { isDark } = useTheme();
  const [annual, setAnnual]   = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroRef  = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const faqRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".pr-hero-item",
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(".pr-card",
        { y: 60, opacity: 0, scale: 0.93 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.72, ease: "back.out(1.3)",
          scrollTrigger: { trigger: cardsRef.current, start: "top 80%" } }
      );
      gsap.fromTo(".pr-row",
        { x: -28, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.06, duration: 0.55, ease: "power2.out",
          scrollTrigger: { trigger: tableRef.current, start: "top 82%" } }
      );
      gsap.fromTo(".pr-faq",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.07, duration: 0.55, ease: "power2.out",
          scrollTrigger: { trigger: faqRef.current, start: "top 82%" } }
      );
      gsap.utils.toArray<HTMLElement>(".pr-sec-h").forEach(el =>
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

  const Check = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  );
  const Cross = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  );

  return (
    <div style={{ minHeight: "100vh", background: bg, overflowX: "hidden", paddingTop: 92 }}>

      {/* ── Ambient orbs ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "8%",  left: "8%",  width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,136,0,0.07) 0%,transparent 65%)",    filter: "blur(60px)" }}/>
        <div style={{ position: "absolute", bottom: "15%", right: "6%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.08) 0%,transparent 65%)", filter: "blur(55px)" }}/>
        <div style={{ position: "absolute", top: "45%", left: "45%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 65%)",    filter: "blur(50px)" }}/>
      </div>

      {/* ── Hero ── */}
      <section ref={heroRef} style={{ position: "relative", zIndex: 1, padding: "72px 24px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="pr-hero-item" style={{ opacity: 0, display: "inline-flex", alignItems: "center", gap: 8, paddingTop: 5, paddingBottom: 5, paddingLeft: 6, paddingRight: 14, borderRadius: 999, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.2)", marginBottom: 28 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#ff5500,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>₹</span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, color: "#ff8800" }}>Simple, transparent pricing</span>
          </div>

          <h1 className="pr-hero-item" style={{ opacity: 0, fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(38px,6vw,72px)", lineHeight: 1.04, letterSpacing: "-0.035em", color: txt, margin: "0 0 22px" }}>
            Pay only when
            <br />
            <span style={{ background: "linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>you succeed.</span>
          </h1>

          <p className="pr-hero-item" style={{ opacity: 0, fontFamily: "DM Sans, sans-serif", fontSize: "clamp(15px,2vw,18px)", color: muted, lineHeight: 1.8, maxWidth: 480, margin: "0 auto 40px" }}>
            No upfront costs. No platform fee if your campaign doesn't fund. We only win when you win.
          </p>

          {/* Billing toggle */}
          <div className="pr-hero-item" style={{ opacity: 0, display: "inline-flex", alignItems: "center", gap: 14, paddingTop: 10, paddingBottom: 10, paddingLeft: 16, paddingRight: 16, borderRadius: 14, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.045)", border: `1px solid ${bdr}` }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color: !annual ? txt : muted, transition: "color 0.2s" }}>Monthly</span>
            <button
              onClick={() => setAnnual(v => !v)}
              style={{ position: "relative", width: 48, height: 26, borderRadius: 999, background: annual ? "linear-gradient(135deg,#ff6b00,#ffcc00)" : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"), border: "none", cursor: "pointer", transition: "background 0.25s", flexShrink: 0 }}
            >
              <motion.div animate={{ x: annual ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{ position: "absolute", top: 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}/>
            </button>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color: annual ? txt : muted, transition: "color 0.2s", display: "flex", alignItems: "center", gap: 7 }}>
              Annual
              <AnimatePresence>
                {annual && (
                  <motion.span initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                    style={{ paddingTop: 3, paddingBottom: 3, paddingLeft: 8, paddingRight: 8, borderRadius: 999, background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", fontSize: 11, fontWeight: 700, color: "#34d399", fontFamily: "DM Sans, sans-serif" }}>
                    Save 20%
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </div>
        </div>
      </section>

      {/* ── Pricing cards ── */}
      <section ref={cardsRef} style={{ position: "relative", zIndex: 1, padding: "0 24px 88px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, alignItems: "stretch" }} className="pr-cards-grid">
          {PLANS.map((plan, pi) => {
            const price = annual ? plan.priceY : plan.priceM;
            const isPopular = plan.id === "creator";
            return (
              <div key={plan.id} className="pr-card"
                style={{
                  opacity: 0, position: "relative", borderRadius: 24,
                  background: isPopular
                    ? (isDark ? "linear-gradient(160deg,#161008,#120d05)" : "linear-gradient(160deg,#fffaf3,#fff8ec)")
                    : card,
                  border: `1.5px solid ${isPopular ? "rgba(255,136,0,0.35)" : bdr}`,
                  boxShadow: isPopular
                    ? (isDark ? "0 0 0 1px rgba(255,136,0,0.15), 0 32px 72px rgba(255,100,0,0.12)" : "0 32px 72px rgba(255,100,0,0.1), 0 0 0 1px rgba(255,136,0,0.12)")
                    : (isDark ? "none" : "0 4px 24px rgba(0,0,0,0.06)"),
                  display: "flex", flexDirection: "column",
                  transform: isPopular ? "scale(1.035)" : "none",
                }}
              >
                {/* Glow top */}
                {isPopular && <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 2, background: "linear-gradient(90deg,transparent,rgba(255,100,0,0.8) 25%,rgba(255,210,0,1) 50%,rgba(255,100,0,0.8) 75%,transparent)", borderRadius: "0 0 4px 4px" }}/>}

                <div style={{ paddingTop: 32, paddingBottom: 28, paddingLeft: 28, paddingRight: 28, borderBottom: `1px solid ${bdr}`, flex: 0 }}>
                  {/* Badge */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: plan.color }}>{plan.name}</span>
                    {plan.badge && (
                      <span style={{ paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10, borderRadius: 999, background: isDark ? `${plan.color}18` : `${plan.color}12`, border: `1px solid ${plan.color}30`, fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: plan.color }}>
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 10 }}>
                    {price === 0 ? (
                      <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 48, color: txt, letterSpacing: "-0.04em", lineHeight: 1 }}>Free</span>
                    ) : (
                      <>
                        <span style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 22, color: muted, lineHeight: 1.5 }}>₹</span>
                        <AnimatePresence mode="wait">
                          <motion.span key={price} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.25 }}
                            style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 52, color: txt, letterSpacing: "-0.04em", lineHeight: 1, display: "block" }}>
                            {price}
                          </motion.span>
                        </AnimatePresence>
                        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, marginBottom: 8 }}>/mo</span>
                      </>
                    )}
                  </div>
                  {annual && price > 0 && (
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#34d399", margin: "0 0 12px", fontWeight: 600 }}>
                      Billed ₹{price * 12}/year · Save ₹{(plan.priceM - plan.priceY) * 12}
                    </p>
                  )}
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: muted, lineHeight: 1.65, margin: 0 }}>{plan.desc}</p>
                </div>

                <div style={{ paddingTop: 24, paddingBottom: 28, paddingLeft: 28, paddingRight: 28, flex: 1, display: "flex", flexDirection: "column" }}>
                  <ul style={{ listStyle: "none", margin: "0 0 28px", padding: 0, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                    {plan.features.map((f, fi) => (
                      <li key={fi} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: f.yes ? `${plan.color}18` : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"), display: "flex", alignItems: "center", justifyContent: "center", color: f.yes ? plan.color : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"), flexShrink: 0 }}>
                          {f.yes ? <Check/> : <Cross/>}
                        </span>
                        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: f.yes ? (isDark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.82)") : muted }} dangerouslySetInnerHTML={{ __html: f.text }}/>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href}
                    style={{
                      display: "block", textAlign: "center",
                      paddingTop: 13, paddingBottom: 13,
                      borderRadius: 13, textDecoration: "none",
                      fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5,
                      background: isPopular ? "linear-gradient(135deg,#ff5500,#ffcc00)" : "none",
                      color: isPopular ? "#fff" : plan.color,
                      border: isPopular ? "none" : `1.5px solid ${plan.color}50`,
                      boxShadow: isPopular ? "0 6px 24px rgba(255,100,0,0.38)" : "none",
                      position: "relative", overflow: "hidden",
                      transition: "transform 0.18s, box-shadow 0.18s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = isPopular ? "0 10px 32px rgba(255,100,0,0.5)" : `0 6px 20px ${plan.color}30`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "none"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = isPopular ? "0 6px 24px rgba(255,100,0,0.38)" : "none"; }}
                  >
                    {isPopular && <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "prShimmer 2.4s ease-in-out infinite" }}/>}
                    <span style={{ position: "relative" }}>{plan.cta} →</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: "center", fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, marginTop: 28, position: "relative", zIndex: 1 }}>
          All plans include 14-day free trial · No credit card required · Cancel anytime
        </p>
      </section>

      {/* ── Comparison table ── */}
      <section ref={tableRef} style={{ position: "relative", zIndex: 1, background: secBg, borderTop: `1px solid ${bdr}`, padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="pr-sec-h" style={{ opacity: 0, textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "#ff8800", marginBottom: 10 }}>Compare</p>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(26px,4vw,46px)", color: txt, letterSpacing: "-0.025em", margin: 0 }}>See what's included</h2>
          </div>

          {/* Table */}
          <div style={{ borderRadius: 20, overflow: "hidden", border: `1px solid ${bdr}` }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderBottom: `1px solid ${bdr}` }}>
              <div style={{ paddingTop: 16, paddingBottom: 16, paddingLeft: 24, paddingRight: 16, fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Feature</div>
              {PLANS.map(p => (
                <div key={p.id} style={{ paddingTop: 16, paddingBottom: 16, paddingLeft: 12, paddingRight: 12, textAlign: "center", fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 800, color: p.color }}>{p.name}</div>
              ))}
            </div>
            {COMPARE_ROWS.map((row, ri) => (
              <div key={row.label} className="pr-row" style={{ opacity: 0, display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderBottom: ri < COMPARE_ROWS.length - 1 ? `1px solid ${bdr}` : "none", background: ri % 2 === 0 ? "transparent" : (isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)") }}>
                <div style={{ paddingTop: 14, paddingBottom: 14, paddingLeft: 24, paddingRight: 16, fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>{row.label}</div>
                {row.vals.map((v, vi) => (
                  <div key={vi} style={{ paddingTop: 14, paddingBottom: 14, paddingLeft: 12, paddingRight: 12, textAlign: "center", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: v === "✓" ? 700 : 400, color: v === "✓" ? PLANS[vi].color : v === "—" ? (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)") : txt }}>
                    {v}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section ref={faqRef} style={{ position: "relative", zIndex: 1, padding: "88px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="pr-sec-h" style={{ opacity: 0, marginBottom: 52 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "#ff8800", marginBottom: 10 }}>FAQ</p>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(26px,4vw,46px)", color: txt, letterSpacing: "-0.025em", margin: 0 }}>Pricing questions</h2>
          </div>
          {PRICING_FAQS.map((faq, i) => (
            <div key={i} className="pr-faq" style={{ opacity: 0, borderBottom: `1px solid ${bdr}` }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", paddingTop: 22, paddingBottom: 22, background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 20 }}>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "clamp(14px,1.8vw,16.5px)", color: txt, flex: 1 }}>{faq.q}</span>
                <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration: 0.22 }}
                  style={{ width: 28, height: 28, borderRadius: "50%", background: openFaq === i ? "rgba(255,107,0,0.15)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: openFaq === i ? "#ff8800" : muted, fontSize: 18, lineHeight: 1 }}>+</motion.span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: muted, lineHeight: 1.8, paddingBottom: 22, margin: 0 }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: "relative", zIndex: 1, background: secBg, borderTop: `1px solid ${bdr}`, padding: "80px 24px 100px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65 }}
          style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(28px,4vw,50px)", color: txt, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
            Start free.
            <br /><span style={{ background: "linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Scale when ready.</span>
          </h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: muted, lineHeight: 1.75, marginBottom: 36 }}>No credit card. No lock-in. Full access to Creator features for 14 days.</p>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, paddingTop: 14, paddingBottom: 14, paddingLeft: 32, paddingRight: 32, borderRadius: 14, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 6px 28px rgba(255,100,0,0.38)", position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "prShimmer 2.4s ease-in-out infinite" }}/>
            <span style={{ position: "relative" }}>Create free account →</span>
          </Link>
        </motion.div>
      </section>

      <style>{`
        @keyframes prShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(200%)} 100%{transform:translateX(200%)} }
        .pr-cards-grid { grid-template-columns: repeat(3,1fr); }
        @media(max-width:900px){ .pr-cards-grid{ grid-template-columns:1fr !important; } .pr-cards-grid > *{ transform: none !important; } }
      `}</style>
    </div>
  );
}