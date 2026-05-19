"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

const LAST_UPDATED = "1 January 2025";

const SECTIONS = [
  {
    id: "what-are-cookies",
    title: "What are cookies?",
    emoji: "🍪",
    content: `Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work, to work more efficiently, and to provide information to the website operators.

Cookies are not harmful. They cannot execute code, carry viruses, or access information on your device beyond what the website sets in them. They simply store a small amount of data that your browser sends back to the website on each subsequent visit.

CrowdSpark uses cookies to keep you signed in, remember your preferences, and understand how our platform is being used so we can improve it.`,
  },
  {
    id: "types-we-use",
    title: "Types of cookies we use",
    emoji: "📋",
    content: `We use four categories of cookies on CrowdSpark:

**Essential Cookies** — These are strictly necessary for the platform to function. They include your authentication session token (so you stay logged in), CSRF protection tokens (to protect against cross-site attacks), and your cookie consent preferences. You cannot opt out of essential cookies.

**Functional Cookies** — These remember your choices and preferences to provide a more personalised experience. Examples include your selected theme (light/dark mode), preferred language, and saved campaign filters. Disabling these means you'll need to set your preferences on every visit.

**Analytics Cookies** — These help us understand how visitors use CrowdSpark. We use anonymised, aggregated data to measure which pages are visited most, how long users stay, and where they navigate from. We use a self-hosted analytics solution — your data is never sent to third-party analytics providers. These cookies contain no personally identifiable information.

**Marketing Cookies** — These are used to show you relevant campaign promotions and platform updates. We do not share marketing cookie data with any advertising networks or third parties. Marketing cookies are optional and can be disabled in your preferences.`,
  },
  {
    id: "third-party",
    title: "Third-party cookies",
    emoji: "🔗",
    content: `CrowdSpark integrates with a small number of trusted third-party services that may set their own cookies:

**Razorpay** — Our payment processor sets session cookies during the checkout flow to prevent fraud and maintain payment security. These cookies are essential and cannot be disabled during a transaction. Razorpay's cookies are governed by Razorpay's own privacy and cookie policy.

**DigiLocker** — When you verify your KYC documents via DigiLocker, DigiLocker may set session cookies on their own domain. These cookies are not accessible to CrowdSpark.

We do not use Google Analytics, Facebook Pixel, or any other advertising network cookies on CrowdSpark.`,
  },
  {
    id: "managing-cookies",
    title: "Managing your cookies",
    emoji: "⚙️",
    content: `You have several options for managing cookies:

**In your browser settings** — All major browsers allow you to view, block, and delete cookies. Search for "cookies" in your browser's help section for instructions specific to your browser (Chrome, Firefox, Safari, Edge, etc.). Note that blocking essential cookies will prevent you from logging in to CrowdSpark.

**In your CrowdSpark settings** — You can manage functional and marketing cookie preferences directly in your account settings under Privacy & Data. Changes take effect immediately.

**Cookie consent banner** — When you first visit CrowdSpark, you will see a cookie consent banner. You can use it to accept all cookies, or customise your preferences by category.

**Opt-out of analytics** — You can opt out of our anonymised analytics at any time through your account settings, even if you previously consented.`,
  },
  {
    id: "retention",
    title: "How long do cookies last?",
    emoji: "⏱️",
    content: `Different cookies have different lifetimes:

**Session cookies** expire when you close your browser. These are used for temporary state like your active browsing session and CSRF tokens.

**Persistent cookies** remain on your device until they expire or you delete them. Our authentication cookie lasts 30 days if you select "Remember me", or expires at the end of your browser session otherwise. Preference cookies (theme, language) last 12 months. Analytics cookies last 6 months.

You can delete all cookies at any time via your browser settings. Deleting cookies will sign you out of CrowdSpark and reset any saved preferences.`,
  },
  {
    id: "updates",
    title: "Updates to this policy",
    emoji: "📝",
    content: `We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our platform. When we make significant changes, we will notify you via a banner on our platform and update the "Last updated" date at the top of this page.

If you have questions about our cookie practices, please contact us at privacy@crowdspark.in or visit our Help Centre.`,
  },
];

export default function CookiePolicyPage() {
  const { isDark } = useTheme();
  const [activeSection, setActiveSection] = useState("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const formatContent = (content: string) =>
    content.split("\n\n").map((para, i) => {
      if (para.startsWith("**") && para.includes("**")) {
        const parts = para.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-sub)", lineHeight: 1.8, margin: "0 0 14px" }}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} style={{ color: "var(--text)", fontWeight: 700 }}>{part}</strong> : part
            )}
          </p>
        );
      }
      return <p key={i} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-sub)", lineHeight: 1.8, margin: "0 0 14px" }}>{para}</p>;
    });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "80px 44px 64px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍪</div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", color: "var(--text)", margin: "0 0 12px", letterSpacing: "-0.03em" }}>Cookie Policy</h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-muted)" }}>Last updated: {LAST_UPDATED}</p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "var(--text-muted)", maxWidth: 520, margin: "12px auto 0", lineHeight: 1.7 }}>
            This policy explains what cookies CrowdSpark uses, why we use them, and how you can manage your preferences.
          </p>
        </motion.div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 44px 96px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 56, alignItems: "start" }}>
        {/* Sticky sidebar */}
        <nav style={{ position: "sticky", top: 88 }}>
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 14 }}>On this page</div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            {SECTIONS.map(s => (
              <li key={s.id}>
                <a href={`#${s.id}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 9, fontFamily: "DM Sans, sans-serif", fontSize: 13, color: activeSection === s.id ? "#f59e0b" : "var(--text-muted)", background: activeSection === s.id ? "rgba(245,158,11,0.08)" : "transparent", textDecoration: "none", transition: "all 0.15s", borderLeft: `2px solid ${activeSection === s.id ? "#f59e0b" : "transparent"}` }}>
                  <span style={{ fontSize: 13 }}>{s.emoji}</span>{s.title}
                </a>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 28, padding: "16px", borderRadius: 14, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "#f59e0b", marginBottom: 6 }}>⚙️ Cookie Settings</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 10 }}>Manage your cookie preferences in your account settings.</div>
            <Link href="/dashboard/settings" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#f59e0b", textDecoration: "none", fontWeight: 700 }}>Open settings →</Link>
          </div>
        </nav>

        {/* Content */}
        <div>
          {SECTIONS.map((section, i) => (
            <motion.section key={section.id} id={section.id} ref={el => { sectionRefs.current[section.id] = el; }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} style={{ marginBottom: 52, scrollMarginTop: 100 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{section.emoji}</div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.35rem", color: "var(--text)", margin: 0 }}>{section.title}</h2>
              </div>
              <div>{formatContent(section.content)}</div>
            </motion.section>
          ))}

          {/* Contact */}
          <div style={{ padding: "36px", borderRadius: 22, background: isDark ? "rgba(255,255,255,0.025)" : "#fff8f0", border: "1px solid rgba(245,158,11,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "var(--text)", marginBottom: 6 }}>Questions about cookies?</h3>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>Our privacy team is happy to help.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="mailto:privacy@crowdspark.in" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, background: "linear-gradient(135deg,#f59e0b,#ff8800)", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                privacy@crowdspark.in
              </a>
              <Link href="/help" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, border: "1.5px solid var(--border)", color: "var(--text-muted)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                Help Centre →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
