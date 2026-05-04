"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, ChevronRight, ArrowUp } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

const LAST_UPDATED = "1 January 2025";

const SECTIONS = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: [
      {
        heading: "Account information",
        body: "When you register on CrowdSpark-X, we collect your name, email address, mobile number, and password (stored as a cryptographic hash). Creators additionally provide PAN card details, Aadhaar number, bank account information, and UPI ID for KYC verification and payout processing.",
      },
      {
        heading: "Campaign and transaction data",
        body: "We store all campaign content you create including titles, descriptions, images, videos, reward tiers, and funding goals. We also record all backing transactions including amounts, timestamps, payment references, and backer identities.",
      },
      {
        heading: "Usage and device data",
        body: "We automatically collect certain technical data when you use our platform: IP address, browser type and version, operating system, device identifiers, pages visited, time spent on pages, referring URLs, and interaction events (clicks, scrolls, form submissions). This data is used solely to improve our platform.",
      },
      {
        heading: "Communications",
        body: "When you contact our support team, participate in surveys, or respond to our emails, we retain those communications and any information you provide in them.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    content: [
      {
        heading: "To operate the platform",
        body: "We use your information to create and manage your account, process payments, facilitate campaign creation and discovery, send transaction notifications, and provide customer support.",
      },
      {
        heading: "KYC and fraud prevention",
        body: "Creator KYC documents are used exclusively to verify identity and comply with Indian financial regulations. We do not sell or share this data with any third party except our KYC verification partner and the regulatory authorities where legally required.",
      },
      {
        heading: "Communications",
        body: "We send transactional emails (receipts, campaign updates, payout confirmations) and, with your consent, marketing communications. You can opt out of marketing emails at any time via the unsubscribe link or your account settings.",
      },
      {
        heading: "Analytics and improvement",
        body: "Aggregated, anonymised usage data helps us understand how the platform is used, identify bugs, improve performance, and develop new features. This data cannot be linked back to any individual user.",
      },
    ],
  },
  {
    id: "sharing",
    title: "Sharing of information",
    content: [
      {
        heading: "We do not sell your data",
        body: "CrowdSpark-X does not sell, rent, or trade your personal information to any third party for commercial purposes. Ever.",
      },
      {
        heading: "Service providers",
        body: "We share limited data with trusted service providers who help us operate: Razorpay (payment processing), AWS (cloud hosting), SendGrid (email delivery), and our KYC partner. All providers are bound by data processing agreements and may not use your data for any other purpose.",
      },
      {
        heading: "Campaign visibility",
        body: "Campaign content you publish (title, description, images, goal, progress) is publicly visible to all platform visitors. Your name as a creator is displayed on your campaign page. Backer names may be displayed publicly unless you choose to back anonymously.",
      },
      {
        heading: "Legal requirements",
        body: "We may disclose your information if required by law, court order, or government authority, or where disclosure is necessary to protect the rights, safety, or property of CrowdSpark-X, our users, or the public.",
      },
    ],
  },
  {
    id: "data-security",
    title: "Data security",
    content: [
      {
        heading: "Encryption",
        body: "All data transmitted between your browser and our servers is encrypted using TLS 1.3. Data at rest is encrypted using AES-256. Passwords are hashed using bcrypt with a work factor of 12.",
      },
      {
        heading: "Access controls",
        body: "Access to production systems and user data is restricted to authorised personnel on a need-to-know basis. All access is logged and audited. We use multi-factor authentication for all administrative access.",
      },
      {
        heading: "KYC document security",
        body: "KYC documents are stored in encrypted, access-controlled storage with strict retention policies. Documents are accessible only to our KYC review team and are purged after regulatory retention periods expire.",
      },
      {
        heading: "Breach response",
        body: "In the event of a data breach affecting your personal information, we will notify you within 72 hours of becoming aware, in accordance with DPDP Act 2023 requirements.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    content: [
      {
        heading: "Access and portability",
        body: "You have the right to request a copy of all personal data we hold about you. We will provide this in a machine-readable format within 30 days of your request. Email privacy@crowdspark.in to make a request.",
      },
      {
        heading: "Correction",
        body: "You can update most of your personal information directly in your account settings. For KYC data corrections, contact our support team with valid documentation.",
      },
      {
        heading: "Deletion",
        body: "You may request deletion of your account and associated personal data. Note that transaction records, KYC data, and campaign data may be retained for the legally required period (typically 7 years) even after account deletion for compliance purposes.",
      },
      {
        heading: "Withdraw consent",
        body: "Where we rely on consent to process your data (e.g., marketing emails), you may withdraw that consent at any time without affecting the lawfulness of processing prior to withdrawal.",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies and tracking",
    content: [
      {
        heading: "Essential cookies",
        body: "We use strictly necessary cookies to keep you logged in and maintain your session. These cannot be disabled as the platform would not function without them.",
      },
      {
        heading: "Analytics cookies",
        body: "With your consent, we use analytics cookies (via a self-hosted Plausible instance) to understand how you navigate the platform. No data is shared with Google or other ad networks.",
      },
      {
        heading: "No advertising cookies",
        body: "We do not use advertising or third-party tracking cookies. We do not serve ads, and we do not participate in ad networks or data brokers.",
      },
    ],
  },
  {
    id: "data-retention",
    title: "Data retention",
    content: [
      {
        heading: "Account data",
        body: "Account information is retained for the duration of your account and for 3 years after account deletion for fraud prevention purposes.",
      },
      {
        heading: "Transaction records",
        body: "Payment and transaction records are retained for 7 years as required under Indian tax and financial regulations.",
      },
      {
        heading: "KYC documents",
        body: "KYC documents are retained for 5 years after the end of a business relationship, as required under PMLA 2002 and RBI guidelines.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact and grievance officer",
    content: [
      {
        heading: "Data Protection Officer",
        body: "For privacy-related queries, requests, or concerns, contact our Data Protection Officer at: privacy@crowdspark.in or by post at: CrowdSpark Technologies Pvt. Ltd., 4th Floor, Prestige Tech Park, Marathahalli, Bangalore – 560037.",
      },
      {
        heading: "Grievance redressal",
        body: "As required by the DPDP Act 2023, we have appointed a Grievance Officer. Complaints will be acknowledged within 48 hours and resolved within 30 days. If unsatisfied with our response, you may escalate to the Data Protection Board of India.",
      },
    ],
  },
];

export default function PrivacyPage() {
  const { isDark } = useTheme();
  const heroRef   = useRef<HTMLDivElement>(null);
  const bodyRef   = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".pv-hero-in",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: "power3.out", delay: 0.15 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 400);
      const ids = SECTIONS.map(s => s.id);
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(ids[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card = isDark ? "rgba(255,255,255,0.025)" : "#fff";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingTop: 64 }}>

      <div aria-hidden style={{ position: "fixed", top: "-5%", right: "-6%", width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.055) 0%,transparent 70%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── Hero ── */}
      <section ref={heroRef} style={{ position: "relative", zIndex: 1, padding: "72px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div className="pv-hero-in" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", marginBottom: 22 }}>
            <Shield size={12} color="#7c3aed" />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em" }}>Privacy Policy</span>
          </div>
          <h1 className="pv-hero-in" style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(34px,5vw,60px)", color: "var(--text)", letterSpacing: "-0.035em", lineHeight: 1.06, margin: "0 0 18px" }}>
            Your privacy,
            <br />
            <span style={{ color: "var(--accent)", textShadow: "0 0 36px var(--accent-glow)" }}>our responsibility.</span>
          </h1>
          <p className="pv-hero-in" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "clamp(13px,1.6vw,16px)", color: "var(--text-muted)", lineHeight: 1.85, margin: "0 auto" }}>
            We believe privacy is a right, not a feature. This policy explains exactly how
            we collect, use, and protect your data — in plain language.
          </p>
          <div className="pv-hero-in" style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${bdr}` }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>Last updated: <strong style={{ color: "var(--text)" }}>{LAST_UPDATED}</strong></span>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 96px" }}>
        <div ref={bodyRef} style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "220px 1fr", gap: 32, alignItems: "start" }} className="pv-body-grid">

          {/* Sticky TOC */}
          <nav style={{ position: "sticky", top: 88, borderRadius: 18, background: card, border: `1px solid ${bdr}`, overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>Contents</p>
            </div>
            <div style={{ padding: "8px 8px 12px" }}>
              {SECTIONS.map((s, i) => {
                const active = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7, width: "100%",
                      padding: "8px 11px", borderRadius: 9, background: active ? "rgba(124,58,237,0.1)" : "transparent",
                      border: `1px solid ${active ? "rgba(124,58,237,0.25)" : "transparent"}`,
                      color: active ? "#7c3aed" : "var(--text-muted)",
                      fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: active ? 700 : 500,
                      cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLButtonElement; el.style.color = "var(--text)"; el.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"; }}}
                    onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLButtonElement; el.style.color = "var(--text-muted)"; el.style.background = "transparent"; }}}
                  >
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, color: active ? "#7c3aed" : "var(--text-muted)", opacity: 0.7, flexShrink: 0, width: 14 }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 800, color: "#7c3aed" }}>
                      {String(si + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(18px,2.2vw,24px)", color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>
                    {section.title}
                  </h2>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {section.content.map(({ heading, body }) => (
                    <div
                      key={heading}
                      style={{ padding: "20px 22px", borderRadius: 16, background: card, border: `1px solid ${bdr}`, boxShadow: isDark ? "none" : "0 1px 10px rgba(0,0,0,0.04)" }}
                    >
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.01em" }}>
                        {heading}
                      </h3>
                      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.82, margin: 0 }}>
                        {body}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Footer note */}
            <div style={{ padding: "22px 24px", borderRadius: 16, background: isDark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.2)" }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.8, margin: "0 0 10px" }}>
                This privacy policy may be updated from time to time. We will notify you of any significant changes by email and by posting a notice on this page. Continued use of CrowdSpark-X after changes constitutes acceptance of the revised policy.
              </p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Link href="/terms" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "#7c3aed", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                  Terms of Service <ChevronRight size={13} />
                </Link>
                <Link href="/contact" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                  Contact us <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Scroll to top */}
      {showTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ position: "fixed", bottom: 28, right: 28, zIndex: 50, width: 42, height: 42, borderRadius: 13, background: "rgba(124,58,237,0.9)", border: "1px solid rgba(124,58,237,0.4)", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUp size={16} />
        </motion.button>
      )}

      <style>{`
        .pv-hero-in { opacity: 0; }
        @media(max-width: 860px) {
          .pv-body-grid { grid-template-columns: 1fr !important; }
          nav[style*="position: sticky"] { position: static !important; }
        }
      `}</style>
    </div>
  );
}
