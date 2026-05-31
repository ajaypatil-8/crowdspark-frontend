"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { FileText, ChevronRight, ArrowUp, AlertTriangle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const LAST_UPDATED = "1 January 2025";

const SECTIONS = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    content: [
      { heading: "Agreement to terms", body: "By accessing or using CrowdSpark-X (the \"Platform\"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you must not use the Platform. These terms constitute a legally binding agreement between you and CrowdSpark Technologies Pvt. Ltd., a company incorporated under the Companies Act 2013 with its registered office in Bangalore, Karnataka, India." },
      { heading: "Changes to terms", body: "We reserve the right to modify these Terms at any time. We will notify registered users of material changes via email and an in-app notice at least 14 days before the change takes effect. Continued use of the Platform after the effective date constitutes acceptance of the revised Terms." },
      { heading: "Eligibility", body: "You must be at least 18 years of age to use CrowdSpark-X. By using the Platform, you represent that you are of legal age and have the authority to enter into this agreement. Accounts registered on behalf of companies must be managed by an authorised representative." },
    ],
  },
  {
    id: "accounts",
    title: "User accounts",
    content: [
      { heading: "Account creation", body: "You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. Notify us immediately at security@crowdspark.in of any unauthorised use." },
      { heading: "One account per person", body: "Each individual or entity may maintain only one account. Creating multiple accounts to circumvent suspensions, limits, or fees is prohibited and will result in permanent termination of all associated accounts." },
      { heading: "Account termination", body: "We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or pose a risk to the community. Users who believe their account was terminated in error may appeal by contacting appeals@crowdspark.in within 30 days." },
    ],
  },
  {
    id: "creators",
    title: "Creator obligations",
    content: [
      { heading: "KYC requirement", body: "All creators must complete our KYC verification process before launching any campaign. Providing false or fraudulent KYC documentation is a criminal offence and will result in immediate account termination and referral to law enforcement." },
      { heading: "Campaign accuracy", body: "Creators are solely responsible for the accuracy of their campaign content. All claims about products, services, timelines, and reward delivery must be truthful and achievable. Misleading backers constitutes fraud under IPC Section 420 and will be prosecuted." },
      { heading: "Reward delivery", body: "By launching a campaign, creators commit to delivering the promised rewards to backers within the stated timeline. Failure to deliver rewards without a valid reason and without offering refunds constitutes a breach of contract and these Terms." },
      { heading: "Prohibited campaigns", body: "Campaigns are prohibited for: illegal products or services, weapons, adult content, gambling, multi-level marketing schemes, politically motivated fundraising, personal debt repayment, and campaigns on behalf of deceased individuals. CrowdSpark-X reserves the right to reject any campaign at its sole discretion." },
      { heading: "Fee acceptance", body: "By launching a campaign, creators agree to a 5% platform fee on the total amount raised, plus applicable GST, and payment gateway fees (typically 2–2.5%) charged by Razorpay. These fees are deducted from payouts — there are no upfront charges." },
    ],
  },
  {
    id: "backers",
    title: "Backer terms",
    content: [
      { heading: "Nature of backing", body: "Backing a campaign on CrowdSpark-X is not an investment. You are making a contribution in exchange for a promised reward. You are not purchasing equity, debt, or any financial instrument. Past campaign success does not guarantee future results." },
      { heading: "Refund policy", body: "For all-or-nothing campaigns: if the campaign does not reach its funding goal, you will be automatically refunded within 5–7 business days. For funded campaigns: refunds are available within 24 hours of backing. After 24 hours, backing is non-refundable unless the creator fails to deliver rewards." },
      { heading: "Backer protection", body: "If a funded creator fails to deliver promised rewards, you may file a complaint within 90 days of the campaign's stated delivery date. We will investigate and, where non-delivery is confirmed, may issue a partial or full refund at our discretion." },
      { heading: "Anonymous backing", body: "You may choose to back anonymously. In this case, your name will not be displayed publicly on the campaign page, but your identity remains on record for legal and fraud prevention purposes." },
    ],
  },
  {
    id: "content",
    title: "Content and intellectual property",
    content: [
      { heading: "Your content", body: "You retain ownership of all content you submit to the Platform. By submitting content, you grant CrowdSpark-X a worldwide, royalty-free, non-exclusive licence to use, display, reproduce, and distribute that content for the purpose of operating and promoting the Platform." },
      { heading: "Our intellectual property", body: "The CrowdSpark-X name, logo, brand assets, Platform design, code, and all other Platform elements are the exclusive property of CrowdSpark Technologies Pvt. Ltd. Unauthorised use, reproduction, or distribution is prohibited." },
      { heading: "Prohibited content", body: "You may not post content that is defamatory, obscene, hateful, discriminatory, or in violation of any applicable law. We reserve the right to remove any content that violates these terms without notice." },
      { heading: "Copyright complaints", body: "If you believe your copyrighted work has been used on our Platform without authorisation, contact legal@crowdspark.in with details of the alleged infringement. We will respond within 14 business days." },
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: [
      { heading: "Platform as intermediary", body: "CrowdSpark-X is a platform that facilitates connections between creators and backers. We are not a party to any agreement between creators and backers, and we are not responsible for the performance of campaigns, delivery of rewards, or the quality of funded products." },
      { heading: "Limitation of damages", body: "To the maximum extent permitted by applicable law, CrowdSpark Technologies Pvt. Ltd. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, even if advised of the possibility of such damages. Our total liability for any claim shall not exceed ₹10,000 or the amount you paid in fees in the preceding 12 months, whichever is greater." },
      { heading: "No warranty", body: "The Platform is provided \"as is\" without warranty of any kind, express or implied. We do not warrant that the Platform will be error-free, uninterrupted, or free of viruses. We do not endorse any campaign, creator, or product on the Platform." },
    ],
  },
  {
    id: "disputes",
    title: "Disputes and governing law",
    content: [
      { heading: "Governing law", body: "These Terms are governed by the laws of India. Any disputes arising from or relating to these Terms or the Platform shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka." },
      { heading: "Dispute resolution", body: "Before initiating legal proceedings, both parties agree to attempt resolution through good-faith negotiation for at least 30 days. If unresolved, disputes shall be referred to binding arbitration under the Arbitration and Conciliation Act 1996, with a sole arbitrator appointed by mutual agreement." },
      { heading: "Class action waiver", body: "You agree to resolve disputes with CrowdSpark-X only on an individual basis and not as part of a class or representative action. This waiver is a material inducement for CrowdSpark-X to provide the Platform." },
    ],
  },
  {
    id: "miscellaneous",
    title: "Miscellaneous",
    content: [
      { heading: "Entire agreement", body: "These Terms, together with our Privacy Policy and any additional policies referenced herein, constitute the entire agreement between you and CrowdSpark-X and supersede all prior agreements and understandings." },
      { heading: "Severability", body: "If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect." },
      { heading: "Contact", body: "For questions about these Terms, contact legal@crowdspark.in or write to CrowdSpark Technologies Pvt. Ltd., 4th Floor, Prestige Tech Park, Marathahalli, Bangalore – 560037, Karnataka, India." },
    ],
  },
];

export default function TermsPage() {
  const { isDark } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".tm-hero-in",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: "power3.out", delay: 0.15 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 400);
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card = isDark ? "rgba(255,255,255,0.025)" : "#fff";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingTop: 64 }}>

      <div aria-hidden style={{ position: "fixed", top: "-5%", left: "-6%", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,0.05) 0%,transparent 70%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Hero */}
      <section ref={heroRef} style={{ position: "relative", zIndex: 1, padding: "72px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div className="tm-hero-in" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", marginBottom: 22 }}>
            <FileText size={12} color="#f59e0b" />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Terms of Service</span>
          </div>
          <h1 className="tm-hero-in" style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(34px,5vw,60px)", color: "var(--text)", letterSpacing: "-0.035em", lineHeight: 1.06, margin: "0 0 18px" }}>
            Clear terms,
            <br />
            <span style={{ color: "#f59e0b", textShadow: "0 0 36px rgba(245,158,11,0.4)" }}>no surprises.</span>
          </h1>
          <p className="tm-hero-in" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "clamp(13px,1.6vw,16px)", color: "var(--text-muted)", lineHeight: 1.85, margin: "0 auto 18px" }}>
            These terms govern your use of CrowdSpark-X. We&apos;ve written them to be as clear
            as possible — please read them carefully.
          </p>
          <div className="tm-hero-in" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <AlertTriangle size={13} color="#f59e0b" />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "#f59e0b", fontWeight: 600 }}>
              Last updated: {LAST_UPDATED}
            </span>
          </div>
        </div>
      </section>

      {/* Body */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "220px 1fr", gap: 32, alignItems: "start" }} className="tm-body-grid">

          {/* TOC */}
          <nav style={{ position: "sticky", top: 88, borderRadius: 18, background: card, border: `1px solid ${bdr}`, overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>Sections</p>
            </div>
            <div style={{ padding: "8px 8px 12px" }}>
              {SECTIONS.map((s, i) => {
                const active = activeSection === s.id;
                return (
                  <button key={s.id} onClick={() => scrollTo(s.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7, width: "100%",
                      padding: "8px 11px", borderRadius: 9,
                      background: active ? "rgba(245,158,11,0.1)" : "transparent",
                      border: `1px solid ${active ? "rgba(245,158,11,0.28)" : "transparent"}`,
                      color: active ? "#f59e0b" : "var(--text-muted)",
                      fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: active ? 700 : 500,
                      cursor: "pointer", textAlign: "left", transition: "all 0.15s", marginBottom: 2,
                    }}
                    onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLButtonElement; el.style.color = "var(--text)"; el.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"; }}}
                    onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLButtonElement; el.style.color = "var(--text-muted)"; el.style.background = "transparent"; }}}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: active ? "#f59e0b" : "var(--text-muted)", opacity: 0.7, flexShrink: 0, width: 14, fontFamily: "DM Sans, sans-serif" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ lineHeight: 1.35 }}>{s.title}</span>
                    {active && <ChevronRight size={11} style={{ marginLeft: "auto", flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content */}
          <article>
            {SECTIONS.map((section, si) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ marginBottom: 52, scrollMarginTop: 96 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 800, color: "#f59e0b" }}>
                      {String(si + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(18px,2.2vw,24px)", color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>
                    {section.title}
                  </h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {section.content.map(({ heading, body }) => (
                    <div key={heading} style={{ padding: "18px 22px", borderRadius: 16, background: card, border: `1px solid ${bdr}`, boxShadow: isDark ? "none" : "0 1px 10px rgba(0,0,0,0.04)" }}>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 9px", letterSpacing: "-0.01em" }}>{heading}</h3>
                      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.82, margin: 0 }}>{body}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <div style={{ padding: "20px 22px", borderRadius: 16, background: isDark ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.8, margin: "0 0 12px" }}>
                Questions about these Terms? Our legal team is happy to clarify.
              </p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Link href="/privacy" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "#7c3aed", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                  Privacy Policy <ChevronRight size={13} />
                </Link>
                <Link href="/contact" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                  Contact legal team <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      {showTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ position: "fixed", bottom: 28, right: 28, zIndex: 50, width: 42, height: 42, borderRadius: 13, background: "rgba(245,158,11,0.9)", border: "1px solid rgba(245,158,11,0.4)", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        >
          <ArrowUp size={16} />
        </motion.button>
      )}

      <style>{`
        .tm-hero-in { opacity: 0; }
        @media(max-width: 860px) {
          .tm-body-grid { grid-template-columns: 1fr !important; }
          nav[style*="position: sticky"] { position: static !important; }
        }
      `}</style>
    </div>
  );
}
