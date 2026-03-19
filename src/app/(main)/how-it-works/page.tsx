"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/contexts/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

// ── Data ──────────────────────────────────────────────────────────────────────
const CREATOR_STEPS = [
  {
    num: "01", color: "#ff8800", icon: "✦",
    title: "Create your account",
    desc: "Sign up in 30 seconds with email, Google, or GitHub. No credit card needed to get started.",
    tag: "Free forever",
  },
  {
    num: "02", color: "#a78bfa", icon: "◈",
    title: "Complete KYC verification",
    desc: "Upload your PAN card and Aadhaar to unlock the Creator role. Our team reviews within 24 hours.",
    tag: "24h review",
  },
  {
    num: "03", color: "#34d399", icon: "⬡",
    title: "Launch your campaign",
    desc: "Set your goal, write your story, add rewards, and publish. Our AI helps you write compelling copy.",
    tag: "5 min setup",
  },
  {
    num: "04", color: "#60a5fa", icon: "◎",
    title: "Get funded & withdraw",
    desc: "Funds reach your verified bank account within 3–5 days after campaign ends. GST invoice auto-generated.",
    tag: "3–5 day payout",
  },
];

const BACKER_STEPS = [
  {
    num: "01", color: "#00d4b8", icon: "◈",
    title: "Discover campaigns",
    desc: "Browse by category, trending, or let our AI match you with projects you'll love. No account needed.",
    tag: "No login needed",
  },
  {
    num: "02", color: "#ff8800", icon: "✦",
    title: "Back a project",
    desc: "Choose a reward tier. Pay via UPI, NetBanking, cards, or wallets. All payments are secured by escrow.",
    tag: "UPI & cards",
  },
  {
    num: "03", color: "#f59e0b", icon: "⬡",
    title: "Track progress",
    desc: "Get live updates, backer-only posts, and milestone announcements straight to your inbox.",
    tag: "Live updates",
  },
  {
    num: "04", color: "#a78bfa", icon: "◎",
    title: "Receive your reward",
    desc: "Creators ship rewards on milestone completion. Rate the experience and help the community grow.",
    tag: "Guaranteed",
  },
];

const FAQS = [
  { q: "Is CrowdSpark free for backers?", a: "Yes, completely. Backers pay only what they pledge. There are zero platform fees for backers." },
  { q: "What fees does CrowdSpark charge creators?", a: "We charge a flat 5% platform fee on successfully funded campaigns, plus a 2% payment processing fee. If your campaign doesn't reach its goal, you pay nothing." },
  { q: "How does the escrow system work?", a: "All pledged funds are held in escrow until the campaign meets its goal. If the goal isn't met, every backer is fully refunded automatically within 3–5 business days." },
  { q: "What documents do I need for KYC?", a: "You'll need a valid PAN card and Aadhaar. For organisations, you'll also need a GST registration certificate. Verification typically takes under 24 hours." },
  { q: "Can I run a campaign from outside India?", a: "Campaigns must be run by Indian residents or registered Indian entities. Backers from anywhere in the world can support campaigns." },
  { q: "What happens if a creator can't deliver rewards?", a: "CrowdSpark has a Creator Accountability Policy. Creators must provide updates and, where possible, partial refunds. Our team mediates disputes between creators and backers." },
];

const STATS = [
  { val: "₹98M+", label: "Total raised",     color: "#ff8800" },
  { val: "12,400+", label: "Campaigns funded", color: "#34d399" },
  { val: "94%",   label: "Success rate",     color: "#a78bfa" },
  { val: "24h",   label: "Avg KYC review",   color: "#60a5fa" },
];

export default function HowItWorksPage() {
  const { isDark } = useTheme();
  const [tab, setTab]         = useState<"creator" | "backer">("creator");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const heroRef  = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const faqRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo(".hiw-hero-item",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out", delay: 0.2 }
      );
      // Stats
      gsap.fromTo(".hiw-stat",
        { y: 36, opacity: 0, scale: 0.88 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.08, duration: 0.65, ease: "back.out(1.4)",
          scrollTrigger: { trigger: statsRef.current, start: "top 82%" } }
      );
      // Step cards
      gsap.fromTo(".hiw-step",
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: stepsRef.current, start: "top 78%" } }
      );
      // FAQ
      gsap.fromTo(".hiw-faq-item",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.07, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: faqRef.current, start: "top 80%" } }
      );
      // Section headings
      gsap.utils.toArray<HTMLElement>(".hiw-sec-h").forEach(el =>
        gsap.fromTo(el, { x: -32, opacity: 0 }, { x: 0, opacity: 1, duration: 0.65, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 87%" } })
      );
      // Timeline line draw
      gsap.fromTo(".hiw-line", { scaleY: 0, transformOrigin: "top" }, {
        scaleY: 1, duration: 1.4, ease: "power2.inOut",
        scrollTrigger: { trigger: stepsRef.current, start: "top 72%" }
      });
    });
    return () => ctx.revert();
  }, []);

  const bg      = isDark ? "#080808" : "#fafaf8";
  const card    = isDark ? "#0f0f0f" : "#ffffff";
  const bdr     = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const txt     = isDark ? "#fff" : "#0a0a0a";
  const muted   = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const secBg   = isDark ? "#0c0c0c" : "#f4f4f2";

  const steps = tab === "creator" ? CREATOR_STEPS : BACKER_STEPS;

  return (
    <div style={{ minHeight: "100vh", background: bg, overflowX: "hidden", paddingTop: 92 }}>

      {/* ── Ambient orbs ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.07) 0%,transparent 65%)", filter: "blur(60px)" }}/>
        <div style={{ position: "absolute", bottom: "20%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,184,0.06) 0%,transparent 65%)", filter: "blur(55px)" }}/>
      </div>

      {/* ── Hero ── */}
      <section ref={heroRef} style={{ position: "relative", zIndex: 1, padding: "72px 24px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="hiw-hero-item" style={{ opacity: 0, display: "inline-flex", alignItems: "center", gap: 8, paddingTop: 5, paddingBottom: 5, paddingLeft: 6, paddingRight: 14, borderRadius: 999, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.2)", marginBottom: 28 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#ff5500,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>⚡</span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, color: "#ff8800" }}>Simple. Transparent. Powerful.</span>
          </div>

          <h1 className="hiw-hero-item" style={{ opacity: 0, fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(38px,6vw,72px)", lineHeight: 1.04, letterSpacing: "-0.035em", color: txt, margin: "0 0 24px" }}>
            How CrowdSpark
            <br />
            <span style={{ background: "linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>actually works</span>
          </h1>

          <p className="hiw-hero-item" style={{ opacity: 0, fontFamily: "DM Sans, sans-serif", fontSize: "clamp(15px,2vw,18px)", color: muted, lineHeight: 1.8, maxWidth: 540, margin: "0 auto 44px" }}>
            Whether you're launching an idea or backing one, here's everything you need to know — in plain language, no jargon.
          </p>

          {/* Tab switcher */}
          <div className="hiw-hero-item" style={{ opacity: 0, display: "inline-flex", gap: 6, padding: 6, borderRadius: 16, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border: `1px solid ${bdr}` }}>
            {(["creator", "backer"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  paddingTop: 10, paddingBottom: 10, paddingLeft: 28, paddingRight: 28,
                  borderRadius: 11, border: "none", cursor: "pointer",
                  fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
                  background: tab === t ? "linear-gradient(135deg,#ff5500,#ffcc00)" : "transparent",
                  color: tab === t ? "#fff" : muted,
                  boxShadow: tab === t ? "0 4px 18px rgba(255,100,0,0.35)" : "none",
                  transition: "all 0.22s",
                }}
              >
                {t === "creator" ? "I'm a Creator" : "I'm a Backer"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section ref={statsRef} style={{ position: "relative", zIndex: 1, background: secBg, borderTop: `1px solid ${bdr}`, borderBottom: `1px solid ${bdr}`, padding: "44px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }} className="hiw-stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="hiw-stat" style={{ opacity: 0, textAlign: "center" }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(28px,3.5vw,44px)", color: s.color, margin: "0 0 5px", letterSpacing: "-0.03em", textShadow: `0 0 28px ${s.color}55` }}>{s.val}</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Steps ── */}
      <section ref={stepsRef} style={{ position: "relative", zIndex: 1, padding: "96px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div className="hiw-sec-h" style={{ opacity: 0, marginBottom: 64 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "#ff8800", marginBottom: 10 }}>
              Step by step
            </p>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(28px,4vw,50px)", color: txt, letterSpacing: "-0.025em", margin: 0, lineHeight: 1.1 }}>
              {tab === "creator" ? "From idea to funded" : "From curious to committed"}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.32 }}>
              <div style={{ position: "relative" }}>
                {/* Vertical timeline line */}
                <div className="hiw-line" style={{ position: "absolute", left: 27, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom,${steps[0].color}44,${steps[2].color}44,${steps[3].color}44)`, transformOrigin: "top" }} />

                {steps.map((step, i) => (
                  <div key={step.num} className="hiw-step" style={{ opacity: 0, display: "flex", gap: 32, marginBottom: i < steps.length - 1 ? 52 : 0, position: "relative" }}>
                    {/* Number bubble */}
                    <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: "50%", background: isDark ? `${step.color}18` : `${step.color}12`, border: `2px solid ${step.color}44`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2, boxShadow: `0 0 24px ${step.color}30` }}>
                      <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 11, color: step.color, letterSpacing: "0.05em" }}>{step.num}</span>
                    </div>

                    {/* Content card */}
                    <div style={{ flex: 1, paddingTop: 10, paddingBottom: 28, paddingLeft: 28, paddingRight: 28, borderRadius: 20, background: card, border: `1px solid ${bdr}`, position: "relative", overflow: "hidden", boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.06)" }}>
                      {/* Colour stripe */}
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${step.color}88,transparent)` }} />
                      {/* Icon */}
                      <div style={{ position: "absolute", top: 16, right: 20, fontSize: 32, opacity: 0.07, color: step.color, fontFamily: "monospace" }}>{step.icon}</div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, marginTop: 8 }}>
                        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(16px,2vw,20px)", color: txt, margin: 0 }}>{step.title}</h3>
                        <span style={{ paddingTop: 3, paddingBottom: 3, paddingLeft: 10, paddingRight: 10, borderRadius: 999, background: isDark ? `${step.color}18` : `${step.color}10`, border: `1px solid ${step.color}28`, fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: step.color, whiteSpace: "nowrap" }}>{step.tag}</span>
                      </div>
                      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: muted, lineHeight: 1.75, margin: 0 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── Trust features ── */}
      <section style={{ position: "relative", zIndex: 1, background: secBg, borderTop: `1px solid ${bdr}`, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="hiw-sec-h" style={{ opacity: 0, textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(26px,3.5vw,46px)", color: txt, letterSpacing: "-0.025em", margin: "0 0 12px", lineHeight: 1.1 }}>
              Built on trust &amp;{" "}
              <span style={{ color: isDark ? "#00d4b8" : "#009e8c" }}>transparency</span>
            </h2>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: muted, margin: 0 }}>Every rupee is tracked. Every milestone is verified.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="hiw-trust-grid">
            {[
              { icon: "🔒", title: "Escrow protection", desc: "Funds are held securely and only released on verified milestone completion. Full audit trail for every transaction.", color: "#34d399" },
              { icon: "📋", title: "KYC-verified creators", desc: "Every creator is identity-verified before going live. PAN + Aadhaar verification eliminates fraud at the source.", color: "#60a5fa" },
              { icon: "💸", title: "GST-compliant invoicing", desc: "All transactions generate GST-compliant invoices automatically. Backers and creators both get proper documentation.", color: "#a78bfa" },
              { icon: "📊", title: "Real-time dashboards", desc: "Creators track backers, conversion rates, and traffic live. Backers see milestone progress in real time.", color: "#f59e0b" },
              { icon: "🌐", title: "All Indian payment methods", desc: "UPI, NetBanking, all major wallets, debit & credit cards. Seamless checkout optimised for Indian users.", color: "#ff8800" },
              { icon: "🤝", title: "Dispute resolution", desc: "Our team mediates between creators and backers. Creator Accountability Policy protects both sides.", color: "#f87171" },
            ].map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.55, ease: "easeOut" }}
                whileHover={{ y: -4, boxShadow: isDark ? `0 16px 40px rgba(0,0,0,0.4),0 0 0 1px ${f.color}22` : `0 16px 40px rgba(0,0,0,0.08),0 0 0 1px ${f.color}18` }}
                style={{ paddingTop: 26, paddingBottom: 26, paddingLeft: 24, paddingRight: 24, borderRadius: 20, background: card, border: `1px solid ${bdr}`, position: "relative", overflow: "hidden", cursor: "default", transition: "box-shadow 0.22s" }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${f.color}55,transparent)` }}/>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: isDark ? `${f.color}14` : `${f.color}0e`, border: `1px solid ${f.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: txt, margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: muted, lineHeight: 1.72, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section ref={faqRef} style={{ position: "relative", zIndex: 1, padding: "88px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="hiw-sec-h" style={{ opacity: 0, marginBottom: 52 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "#ff8800", marginBottom: 10 }}>FAQ</p>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(26px,4vw,46px)", color: txt, letterSpacing: "-0.025em", margin: 0 }}>Common questions</h2>
          </div>

          {FAQS.map((faq, i) => (
            <div key={i} className="hiw-faq-item" style={{ opacity: 0, borderBottom: `1px solid ${bdr}` }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", paddingTop: 22, paddingBottom: 22, background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 20 }}
              >
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "clamp(14px,1.8vw,16.5px)", color: txt, flex: 1 }}>{faq.q}</span>
                <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration: 0.22 }}
                  style={{ width: 28, height: 28, borderRadius: "50%", background: openFaq === i ? "rgba(255,107,0,0.15)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: openFaq === i ? "#ff8800" : muted, fontSize: 18, lineHeight: 1 }}>
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: muted, lineHeight: 1.8, paddingBottom: 22, margin: 0 }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "40px 24px 100px" }}>
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ maxWidth: 800, margin: "0 auto", borderRadius: 28, paddingTop: 72, paddingBottom: 72, paddingLeft: 52, paddingRight: 52, textAlign: "center", background: card, border: `1px solid ${bdr}`, position: "relative", overflow: "hidden", boxShadow: isDark ? "none" : "0 4px 40px rgba(0,0,0,0.06)" }}
        >
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${isDark?"rgba(255,100,0,0.06)":"rgba(255,100,0,0.04)"} 0%,transparent 70%)`, pointerEvents: "none" }}/>
          <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 2, background: "linear-gradient(90deg,transparent,rgba(255,100,0,0.8) 28%,rgba(255,210,0,1) 50%,rgba(255,100,0,0.8) 72%,transparent)" }}/>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "#ff8800", marginBottom: 16, position: "relative" }}>Ready to begin?</p>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(26px,4vw,48px)", color: txt, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 16, position: "relative" }}>
            Your spark is
            <br /><span style={{ color: isDark ? "#00d4b8" : "#009e8c" }}>waiting to ignite.</span>
          </h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: muted, lineHeight: 1.75, maxWidth: 420, margin: "0 auto 36px", position: "relative" }}>
            Join thousands of creators and backers already making ideas real on CrowdSpark.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, paddingTop: 13, paddingBottom: 13, paddingLeft: 28, paddingRight: 28, borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5, textDecoration: "none", boxShadow: "0 4px 24px rgba(255,100,0,0.35)", position: "relative", overflow: "hidden" }}>
              <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "hiwShimmer 2.4s ease-in-out infinite" }}/>
              <span style={{ position: "relative" }}>Start for free →</span>
            </Link>
            <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 7, paddingTop: 13, paddingBottom: 13, paddingLeft: 24, paddingRight: 24, borderRadius: 12, background: "none", border: `1px solid ${bdr}`, color: muted, fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14.5, textDecoration: "none" }}>
              Explore campaigns
            </Link>
          </div>
        </motion.div>
      </section>

      <style>{`
        @keyframes hiwShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(200%)} 100%{transform:translateX(200%)} }
        .hiw-trust-grid { grid-template-columns: repeat(3,1fr); }
        .hiw-stats-grid { grid-template-columns: repeat(4,1fr); }
        @media(max-width:900px){ .hiw-trust-grid{ grid-template-columns:1fr 1fr !important; } }
        @media(max-width:700px){ .hiw-stats-grid{ grid-template-columns:1fr 1fr !important; } .hiw-trust-grid{ grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  );
}