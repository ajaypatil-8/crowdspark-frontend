"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  Mail, MessageSquare, Phone, MapPin,
  Send, CheckCircle2, AlertTriangle, ArrowRight,
  Twitter, Linkedin, Instagram, Github,
  Headphones, Zap, Shield,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const TOPICS = [
  "General enquiry",
  "Creator support",
  "Backer / refund issue",
  "KYC verification",
  "Technical problem",
  "Partnership / press",
  "Report abuse",
  "Other",
];

const CHANNELS = [
  { icon: <Mail size={18} />,       color: "#60a5fa",   title: "Email us",         sub: "hello@crowdspark.in",       note: "Reply within 24 hours" },
  { icon: <Headphones size={18} />, color: "#34d399",   title: "Live chat",         sub: "Available 9AM–7PM IST",    note: "Avg wait < 3 minutes" },
  { icon: <Phone size={18} />,      color: "#ff8800",   title: "Call us",           sub: "+91 80 4567 8900",          note: "Mon–Sat 10AM–6PM" },
  { icon: <MapPin size={18} />,     color: "#a78bfa",   title: "Visit us",          sub: "Bangalore, Karnataka",      note: "By appointment only" },
];

const SOCIAL = [
  { icon: <Twitter size={16} />,   href: "#", label: "Twitter",   color: "#1d9bf0" },
  { icon: <Linkedin size={16} />,  href: "#", label: "LinkedIn",  color: "#0077b5" },
  { icon: <Instagram size={16} />, href: "#", label: "Instagram", color: "#e1306c" },
  { icon: <Github size={16} />,    href: "#", label: "GitHub",    color: "#94a3b8" },
];

type FormState = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const { isDark } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [topic,   setTopic]   = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [focusField, setFocusField] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".ct-hero-in",
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.09, duration: 0.75, ease: "power3.out", delay: 0.15 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setFormState("sending");
    // Simulate API call — replace with real endpoint
    await new Promise(r => setTimeout(r, 1600));
    setFormState("success");
  };

  const resetForm = () => {
    setName(""); setEmail(""); setTopic(TOPICS[0]); setMessage("");
    setFormState("idle");
  };

  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card = isDark ? "rgba(255,255,255,0.03)" : "#fff";

  const inputBase: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "12px 14px", borderRadius: 12,
    border: `1.5px solid ${bdr}`,
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
    color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 14,
    outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingTop: 64 }}>

      {/* Ambient */}
      <div aria-hidden style={{ position: "fixed", top: "-8%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(96,165,250,0.06) 0%,transparent 70%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
      <div aria-hidden style={{ position: "fixed", bottom: "8%", right: "-8%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(52,211,153,0.05) 0%,transparent 70%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── Hero ── */}
      <section ref={heroRef} style={{ position: "relative", zIndex: 1, padding: "80px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div className="ct-hero-in" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)", marginBottom: 24 }}>
            <MessageSquare size={12} color="#60a5fa" />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em" }}>Get in touch</span>
          </div>
          <h1 className="ct-hero-in" style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(36px,5.5vw,66px)", color: "var(--text)", letterSpacing: "-0.035em", lineHeight: 1.05, margin: "0 0 20px" }}>
            We'd love to
            <br />
            <span style={{ color: "var(--accent)", textShadow: "0 0 40px var(--accent-glow)" }}>hear from you.</span>
          </h1>
          <p className="ct-hero-in" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "clamp(14px,1.7vw,17px)", color: "var(--text-muted)", lineHeight: 1.85, maxWidth: 500, margin: "0 auto" }}>
            Whether you have a question, need help, or just want to say hi —
            our team is ready to respond.
          </p>
        </div>
      </section>

      {/* ── Contact channels ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 64px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 13 }} className="ct-ch-grid">
          {CHANNELS.map(({ icon, color, title, sub, note }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, boxShadow: `0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px ${color}20` }}
              style={{ padding: "22px 20px", borderRadius: 20, background: card, border: `1px solid ${bdr}`, position: "relative", overflow: "hidden", cursor: "default", boxShadow: isDark ? "none" : "0 2px 14px rgba(0,0,0,0.05)" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${color}55,transparent)` }} />
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", color, marginBottom: 14 }}>
                {icon}
              </div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5, color: "var(--text)", margin: "0 0 5px" }}>{title}</h3>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text)", margin: "0 0 5px", fontWeight: 600 }}>{sub}</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>{note}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Main content ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }} className="ct-main-grid">

          {/* ── Form ── */}
          <div style={{ borderRadius: 24, background: card, border: `1px solid ${bdr}`, overflow: "hidden", boxShadow: isDark ? "none" : "0 4px 32px rgba(0,0,0,0.06)", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(96,165,250,0.5),transparent)" }} />

            <AnimatePresence mode="wait">
              {formState === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ padding: "72px 48px", textAlign: "center" }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}
                  >
                    <CheckCircle2 size={30} color="#34d399" />
                  </motion.div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text)", margin: "0 0 12px", letterSpacing: "-0.025em" }}>Message sent!</h3>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.8, margin: "0 0 32px", maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
                    We've received your message and will get back to you within 24 hours.
                  </p>
                  <button onClick={resetForm} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 24px", borderRadius: 12, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(52,211,153,0.15)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(52,211,153,0.1)"; }}
                  >
                    Send another <ArrowRight size={14} />
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  style={{ padding: "36px 36px 40px" }}
                >
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Send us a message</h2>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 28px" }}>
                    We respond to every message personally.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                    {/* Name */}
                    <div>
                      <label style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Full name *</label>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Arjun Mehta"
                        required
                        style={{ ...inputBase, borderColor: focusField === "name" ? "var(--border-focus)" : bdr, boxShadow: focusField === "name" ? "0 0 0 3px var(--accent-dim)" : "none" }}
                        onFocus={() => setFocusField("name")}
                        onBlur={() => setFocusField(null)}
                      />
                    </div>
                    {/* Email */}
                    <div>
                      <label style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Email *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        style={{ ...inputBase, borderColor: focusField === "email" ? "var(--border-focus)" : bdr, boxShadow: focusField === "email" ? "0 0 0 3px var(--accent-dim)" : "none" }}
                        onFocus={() => setFocusField("email")}
                        onBlur={() => setFocusField(null)}
                      />
                    </div>
                  </div>

                  {/* Topic */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Topic</label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        style={{ ...inputBase, appearance: "none", WebkitAppearance: "none", paddingRight: 36, cursor: "pointer", borderColor: focusField === "topic" ? "var(--border-focus)" : bdr }}
                        onFocus={() => setFocusField("topic")}
                        onBlur={() => setFocusField(null)}
                      >
                        {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {/* Message */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Message *</label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Describe your question or issue in detail…"
                      rows={5}
                      required
                      style={{ ...inputBase, resize: "vertical", minHeight: 120, borderColor: focusField === "msg" ? "var(--border-focus)" : bdr, boxShadow: focusField === "msg" ? "0 0 0 3px var(--accent-dim)" : "none" }}
                      onFocus={() => setFocusField("msg")}
                      onBlur={() => setFocusField(null)}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 5 }}>
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: message.length > 800 ? "#ef4444" : "var(--text-muted)" }}>
                        {message.length}/1000
                      </span>
                    </div>
                  </div>

                  {formState === "error" && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", gap: 8, alignItems: "center", marginBottom: 18 }}>
                      <AlertTriangle size={14} color="#ef4444" />
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#ef4444" }}>Something went wrong. Please try again.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formState === "sending"}
                    style={{
                      width: "100%", padding: "14px 0", borderRadius: 13, border: "none",
                      background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
                      color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
                      cursor: formState === "sending" ? "wait" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                      opacity: formState === "sending" ? 0.75 : 1,
                      boxShadow: "0 4px 24px rgba(255,100,0,0.35)",
                      transition: "transform 0.18s, box-shadow 0.18s",
                      position: "relative", overflow: "hidden",
                    }}
                    onMouseEnter={e => { if (formState !== "sending") { const el = e.currentTarget as HTMLButtonElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 36px rgba(255,100,0,0.5)"; }}}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.transform = ""; el.style.boxShadow = "0 4px 24px rgba(255,100,0,0.35)"; }}
                  >
                    <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: formState !== "sending" ? "ctShimmer 2.6s ease-in-out infinite" : "none" }} />
                    {formState === "sending" ? (
                      <>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "ctSpin 0.7s linear infinite" }} />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={15} style={{ position: "relative" }} />
                        <span style={{ position: "relative" }}>Send message</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* ── Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 88 }}>

            {/* Response time card */}
            <div style={{ borderRadius: 20, padding: "22px 22px 20px", background: card, border: `1px solid ${bdr}`, position: "relative", overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)" }}>
              <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(52,211,153,0.5),transparent)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
                  <Zap size={15} />
                </div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5, color: "var(--text)", margin: 0 }}>Fast responses</h3>
              </div>
              {[
                { channel: "Live chat",   time: "< 3 min",   dot: "#34d399" },
                { channel: "Email",       time: "< 24 hrs",  dot: "#60a5fa" },
                { channel: "Phone",       time: "< 1 min",   dot: "#ff8800" },
              ].map(({ channel, time, dot }) => (
                <div key={channel} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: `1px solid ${bdr}`, marginBottom: 10 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, boxShadow: `0 0 6px ${dot}`, flexShrink: 0 }} />
                    {channel}
                  </span>
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{time}</span>
                </div>
              ))}
            </div>

            {/* Trust card */}
            <div style={{ borderRadius: 20, padding: "20px", background: isDark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.18)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <Shield size={15} color="#7c3aed" />
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#7c3aed", margin: 0 }}>Your privacy is safe</h3>
              </div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.7 }}>
                We never share your contact details with third parties. All messages are encrypted.
              </p>
            </div>

            {/* Social */}
            <div style={{ borderRadius: 20, padding: "20px", background: card, border: `1px solid ${bdr}`, boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)" }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.09em" }}>Find us on</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {SOCIAL.map(({ icon, href, label, color }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 10, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)", border: `1px solid ${bdr}`, color: "var(--text-muted)", textDecoration: "none", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 500, transition: "all 0.15s" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = color; el.style.borderColor = color + "44"; el.style.background = color + "10"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "var(--text-muted)"; el.style.borderColor = bdr; el.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)"; }}
                  >
                    <span style={{ color }}>{icon}</span> {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .ct-hero-in{opacity:0;}
        @keyframes ctShimmer{0%{transform:translateX(-120%)}60%{transform:translateX(220%)}100%{transform:translateX(220%)}}
        @keyframes ctSpin{to{transform:rotate(360deg)}}
        @media(max-width:900px){
          .ct-ch-grid{grid-template-columns:repeat(2,1fr)!important;}
          .ct-main-grid{grid-template-columns:1fr!important;}
        }
        @media(max-width:540px){
          .ct-ch-grid{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
