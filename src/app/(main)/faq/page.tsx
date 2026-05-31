"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  HelpCircle, ChevronDown, Search, X,
  MessageSquare, Rocket, Shield, DollarSign,
  Users, Settings, ArrowRight,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const CATEGORIES = [
  { key: "all",      label: "All topics",        icon: <HelpCircle size={14} />,   color: "#7c3aed" },
  { key: "general",  label: "General",            icon: <Rocket size={14} />,       color: "#ff8800" },
  { key: "creators", label: "For Creators",       icon: <Users size={14} />,        color: "#34d399" },
  { key: "backers",  label: "For Backers",        icon: <DollarSign size={14} />,   color: "#60a5fa" },
  { key: "kyc",      label: "KYC & Verification", icon: <Shield size={14} />,       color: "#a78bfa" },
  { key: "payments", label: "Payments",           icon: <Settings size={14} />,     color: "#f59e0b" },
] as const;
type CatKey = (typeof CATEGORIES)[number]["key"];

const FAQS: { category: Exclude<CatKey,"all">; q: string; a: string }[] = [
  // General
  { category: "general",  q: "What is CrowdSpark-X?", a: "CrowdSpark-X is India's premier reward-based crowdfunding platform that connects verified creators with backers who want to fund innovative projects. From tech startups to indie films, we support all kinds of campaigns." },
  { category: "general",  q: "Is CrowdSpark-X free to use?", a: "Browsing and backing campaigns is free. Creators pay a 5% platform fee only on successfully funded campaigns. There are no upfront fees, no monthly charges, and no hidden costs." },
  { category: "general",  q: "Which countries are supported?", a: "Currently CrowdSpark-X is available for Indian creators and backers. Creators must have Indian bank accounts and valid KYC documents. We plan to expand internationally in 2026." },
  { category: "general",  q: "How is CrowdSpark-X different from other platforms?", a: "We are India's only crowdfunding platform with mandatory in-app KYC verification for every creator, offering verified trust at scale. We also provide real-time analytics, multi-tier rewards, and dedicated creator support." },

  // Creators
  { category: "creators", q: "How do I launch a campaign?", a: "After completing KYC verification, go to your Creator Dashboard and click 'Create Campaign'. Fill in your story, set a funding goal, add reward tiers and media. Submit for review — our team approves campaigns within 48 hours." },
  { category: "creators", q: "What happens if I don't reach my funding goal?", a: "CrowdSpark-X uses an all-or-nothing model by default. If your campaign doesn't reach its goal by the deadline, all backers are automatically refunded and no fees are charged. However, you can choose the 'Keep What You Raise' model during setup." },
  { category: "creators", q: "When do I receive my funds?", a: "Funds are released within 7 business days after your campaign successfully closes. The money is transferred directly to your verified bank account after deducting the 5% platform fee and applicable GST." },
  { category: "creators", q: "Can I edit a live campaign?", a: "You can edit campaign updates and add media to a live campaign. However, the funding goal, deadline, and reward tiers cannot be changed once the campaign is live to protect backers' trust." },
  { category: "creators", q: "Can I run multiple campaigns simultaneously?", a: "Yes! There is no limit on simultaneous campaigns as long as you are KYC-verified. We recommend spacing campaigns to give each one full attention and maximize backer engagement." },

  // Backers
  { category: "backers",  q: "What payment methods are accepted?", a: "We accept all major UPI apps (GPay, PhonePe, Paytm), credit and debit cards (Visa, Mastercard, RuPay), net banking, and wallets. All payments are secured by Razorpay." },
  { category: "backers",  q: "Can I cancel my backing?", a: "You can cancel a backing within 24 hours of payment if the campaign is still live. After 24 hours, cancellations are not possible. If the campaign doesn't meet its goal, you are automatically refunded within 5–7 business days." },
  { category: "backers",  q: "Are my payment details safe?", a: "Yes. We never store card details on our servers. All payment processing is handled by Razorpay, which is PCI-DSS Level 1 certified — the highest standard for payment security." },
  { category: "backers",  q: "What if a creator doesn't deliver rewards?", a: "Our Backer Protection Policy covers you. If a funded creator fails to deliver, you can file a complaint within 90 days of the campaign end date. Our team mediates and can issue refunds in verified cases of creator non-delivery." },

  // KYC
  { category: "kyc",      q: "Why is KYC required for creators?", a: "KYC ensures that every person asking for funds on CrowdSpark-X is a real, verified individual. This protects backers from fraud and gives creators credibility. It's mandatory for all creators before launching any campaign." },
  { category: "kyc",      q: "What documents are needed for KYC?", a: "You need: (1) PAN card — front image, (2) Aadhaar card — front and back images, (3) Bank account details (account number, IFSC code), and optionally a UPI ID for faster payouts." },
  { category: "kyc",      q: "How long does KYC verification take?", a: "Our team reviews KYC submissions within 24–48 business hours. You will receive an email notification and in-app notification once your KYC is approved or if any document needs resubmission." },
  { category: "kyc",      q: "My KYC was rejected. What do I do?", a: "Check the rejection reason in your dashboard notification. Common issues include blurry images, name mismatch between PAN and bank account, or expired documents. Re-upload the corrected documents and resubmit — the review takes another 24–48 hours." },

  // Payments
  { category: "payments", q: "How is the platform fee calculated?", a: "The platform fee is 5% of the total amount raised. This is deducted at the time of payout. Additionally, payment gateway fees (typically 2–2.5%) are also deducted. So for ₹10L raised, you receive approximately ₹9.25L." },
  { category: "payments", q: "Are there any GST charges?", a: "Yes. GST at 18% is applicable on the platform fee. For example, on ₹10L raised: platform fee = ₹50,000 + GST = ₹59,000. The payment gateway fee is separate and governed by Razorpay's pricing." },
  { category: "payments", q: "How do refunds work for backers?", a: "Refunds for unsuccessful campaigns are processed within 5–7 business days to the original payment method. For bank transfers, NEFT/IMPS refunds may take an additional 2–3 working days depending on your bank." },
];

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  const { isDark } = useTheme();
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div style={{
      borderRadius: 16, overflow: "hidden",
      background: isDark ? "rgba(255,255,255,0.025)" : "#fff",
      border: `1px solid ${isOpen ? "rgba(124,58,237,0.3)" : bdr}`,
      boxShadow: isOpen ? "0 4px 24px rgba(124,58,237,0.08)" : (isDark ? "none" : "0 1px 8px rgba(0,0,0,0.04)"),
      transition: "border-color 0.2s, box-shadow 0.2s",
    }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", padding: "18px 22px", background: "none", border: "none",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: isOpen ? "#7c3aed" : "var(--text)", lineHeight: 1.35, transition: "color 0.15s", flex: 1 }}>
          {q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{ flexShrink: 0, color: isOpen ? "#7c3aed" : "var(--text-muted)" }}
        >
          <ChevronDown size={17} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 22px 20px", borderTop: `1px solid ${bdr}`, paddingTop: 16 }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.82, margin: 0 }}>
                {a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const { isDark } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const [search,    setSearch]    = useState("");
  const [activeTab, setActiveTab] = useState<CatKey>("all");
  const [openId,    setOpenId]    = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".faq-hero-in",
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.09, duration: 0.75, ease: "power3.out", delay: 0.15 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const filtered = FAQS.filter(f => {
    const matchCat = activeTab === "all" || f.category === activeTab;
    const q = search.toLowerCase();
    const matchS = !search || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
    return matchCat && matchS;
  });

  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card = isDark ? "rgba(255,255,255,0.03)" : "#fff";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingTop: 64 }}>

      {/* Ambient */}
      <div aria-hidden style={{ position: "fixed", top: "-6%", right: "-6%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%)", filter: "blur(65px)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── Hero ── */}
      <section ref={heroRef} style={{ position: "relative", zIndex: 1, padding: "80px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="faq-hero-in" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", marginBottom: 24 }}>
            <HelpCircle size={12} color="#7c3aed" />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em" }}>Help centre</span>
          </div>
          <h1 className="faq-hero-in" style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(36px,5.5vw,66px)", color: "var(--text)", letterSpacing: "-0.035em", lineHeight: 1.05, margin: "0 0 20px" }}>
            Frequently asked
            <br />
            <span style={{ color: "var(--accent)", textShadow: "0 0 40px var(--accent-glow)" }}>questions</span>
          </h1>
          <p className="faq-hero-in" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "clamp(14px,1.7vw,17px)", color: "var(--text-muted)", lineHeight: 1.85, margin: "0 auto 36px", maxWidth: 520 }}>
            Everything you need to know about CrowdSpark-X. Can&apos;t find what you&apos;re looking for?{" "}
            <Link href="/contact" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>Contact us.</Link>
          </p>

          {/* Search */}
          <div className="faq-hero-in" style={{ position: "relative", maxWidth: 520, margin: "0 auto" }}>
            <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions…"
              style={{ width: "100%", boxSizing: "border-box" as const, padding: "15px 46px 15px 48px", borderRadius: 16, border: `1.5px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 15, outline: "none", transition: "border-color 0.15s, box-shadow 0.15s" }}
              onFocus={e => { e.currentTarget.style.borderColor = "var(--border-focus)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-dim)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = bdr; e.currentTarget.style.boxShadow = "none"; }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex" }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Main ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 32, justifyContent: "center" }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => { setActiveTab(cat.key); setOpenId(null); }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 999,
                  border: `1px solid ${activeTab === cat.key ? `${cat.color}44` : bdr}`,
                  background: activeTab === cat.key ? `${cat.color}12` : "transparent",
                  color: activeTab === cat.key ? cat.color : "var(--text-muted)",
                  fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: activeTab === cat.key ? 700 : 500,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <span style={{ color: cat.color }}>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          {search && (
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", marginBottom: 20, textAlign: "center" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;<strong style={{ color: "var(--text)" }}>{search}</strong>&quot;
            </p>
          )}

          {/* FAQ list */}
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: "center", padding: "72px 24px" }}
              >
                <HelpCircle size={40} color="var(--text-muted)" style={{ marginBottom: 16, opacity: 0.3 }} />
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)", marginBottom: 10 }}>No results found</h3>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: "var(--text-muted)", marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
                  Try different keywords or browse all topics.
                </p>
                <button onClick={() => { setSearch(""); setActiveTab("all"); }}
                  style={{ padding: "9px 20px", borderRadius: 11, border: `1px solid ${bdr}`, background: "transparent", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
                  Clear search
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`${activeTab}-${search}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {filtered.map((f, i) => {
                  const id = `${f.category}-${i}`;
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                    >
                      <FaqItem
                        q={f.q} a={f.a}
                        isOpen={openId === id}
                        onToggle={() => setOpenId(openId === id ? null : id)}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Still need help CTA ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 96px" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 720, margin: "0 auto", borderRadius: 24, padding: "52px 44px", background: card, border: `1px solid ${bdr}`, textAlign: "center", position: "relative", overflow: "hidden", boxShadow: isDark ? "none" : "0 4px 32px rgba(0,0,0,0.06)" }}
        >
          <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.4),transparent)" }} />
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#7c3aed" }}>
            <MessageSquare size={22} />
          </div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(20px,3vw,30px)", color: "var(--text)", margin: "0 0 12px", letterSpacing: "-0.025em" }}>
            Still have questions?
          </h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.8, maxWidth: 440, margin: "0 auto 28px" }}>
            Our support team is happy to help. We respond to every message within 24 hours.
          </p>
          <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 13, background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5, boxShadow: "0 4px 24px rgba(124,58,237,0.4)", transition: "transform 0.18s, box-shadow 0.18s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 36px rgba(124,58,237,0.5)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = ""; el.style.boxShadow = "0 4px 24px rgba(124,58,237,0.4)"; }}
          >
            Contact support <ArrowRight size={14} />
          </Link>
        </motion.div>
      </section>

      <style>{`.faq-hero-in{opacity:0;}`}</style>
    </div>
  );
}
