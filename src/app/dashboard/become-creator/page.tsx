"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "../layout";
import { creatorApi, type KycStatusResponse, type KycSubmitRequest, type KycStatus } from "@/lib/api";

/* ════════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════════ */
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error" | "info"; onClose: () => void }) {
  const c = {
    success: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", text: "#34d399" },
    error:   { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  text: "#ef4444" },
    info:    { bg: "rgba(0,245,212,0.1)",   border: "rgba(0,245,212,0.25)", text: "#00f5d4" },
  }[type];
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, padding: "12px 18px", borderRadius: 14, backdropFilter: "blur(20px)", background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: 13.5, display: "flex", alignItems: "center", gap: 10, maxWidth: 360, boxShadow: `0 8px 32px ${c.border}`, animation: "slideUp 0.28s cubic-bezier(0.16,1,0.3,1)" }}>
      <span style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${c.text}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>{{ success: "✓", error: "✕", info: "ℹ" }[type]}</span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: c.text, padding: 0, fontSize: 18, opacity: 0.6, lineHeight: 1 }}>×</button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   FIRE BUTTON
════════════════════════════════════════════════════════════ */
function FireBtn({ label, onClick, loading, disabled, variant = "fire", size = "md" }: {
  label: string; onClick?: () => void; loading?: boolean; disabled?: boolean;
  variant?: "fire" | "outline" | "ghost"; size?: "sm" | "md" | "lg";
}) {
  const pad = { sm: "8px 18px", md: "11px 26px", lg: "14px 36px" }[size];
  const fz  = { sm: 12.5, md: 13.5, lg: 15 }[size];
  const s   = {
    fire:    { background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", border: "none", boxShadow: "0 0 20px rgba(255,100,0,0.4)" },
    outline: { background: "transparent", color: "var(--text)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "none" },
    ghost:   { background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "none" },
  }[variant];
  return (
    <button onClick={disabled || loading ? undefined : onClick} style={{ padding: pad, borderRadius: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: fz, cursor: disabled || loading ? "not-allowed" : "pointer", transition: "all 0.18s", position: "relative", overflow: "hidden", display: "inline-flex", alignItems: "center", gap: 8, opacity: disabled ? 0.5 : 1, ...s }}
      onMouseEnter={e => { if (!disabled && !loading && variant === "fire") { const b = e.currentTarget as HTMLButtonElement; b.style.boxShadow = "0 0 36px rgba(255,100,0,0.7)"; b.style.transform = "translateY(-2px)"; } }}
      onMouseLeave={e => { if (variant === "fire") { const b = e.currentTarget as HTMLButtonElement; b.style.boxShadow = "0 0 20px rgba(255,100,0,0.4)"; b.style.transform = "translateY(0)"; } }}
    >
      {variant === "fire" && !loading && <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.25) 50%,transparent 70%)", animation: "shimmer 2.4s ease-in-out infinite" }} />}
      <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
        {loading ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "spin 0.7s linear infinite", display: "inline-block" }} />{label}</> : label}
      </span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════
   INPUT / DOC CARD
════════════════════════════════════════════════════════════ */
function Input({ label, value, onChange, placeholder, type = "text", maxLength, hint, disabled }: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string;
  type?: string; maxLength?: number; hint?: string; disabled?: boolean;
}) {
  const { isDark } = useTheme();
  return (
    <div>
      <label style={{ display: "block", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11.5, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</label>
      <input type={type} value={value} maxLength={maxLength} disabled={disabled} placeholder={placeholder} onChange={e => onChange?.(e.target.value)}
        style={{ width: "100%", padding: "10px 13px", borderRadius: 11, boxSizing: "border-box", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", background: disabled ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)") : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.025)"), color: disabled ? "var(--text-muted)" : "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", cursor: disabled ? "not-allowed" : "text" }}
        onFocus={e => { if (!disabled) { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,107,0,0.1)"; } }}
        onBlur={e => { e.target.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; e.target.style.boxShadow = "none"; }}
      />
      {hint && <p style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: "4px 0 0" }}>{hint}</p>}
    </div>
  );
}

function DocCard({ label, sublabel, file, url, onFile, uploading }: {
  label: string; sublabel: string; file: File | null; url: string; onFile: (f: File) => void; uploading: boolean;
}) {
  const { isDark } = useTheme();
  const ref = useRef<HTMLInputElement>(null);
  const has = !!url;
  return (
    <div onClick={() => ref.current?.click()} style={{ padding: "14px", borderRadius: 14, cursor: "pointer", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: has ? "1px solid rgba(52,211,153,0.35)" : isDark ? "1px dashed rgba(255,255,255,0.1)" : "1px dashed rgba(0,0,0,0.1)", transition: "all 0.18s" }}
      onMouseEnter={e => { if (!has) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,107,0,0.4)"; }}
      onMouseLeave={e => { if (!has) (e.currentTarget as HTMLDivElement).style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; }}
    >
      <input ref={ref} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: has ? "rgba(52,211,153,0.1)" : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: has ? "1px solid rgba(52,211,153,0.25)" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {uploading ? <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
            : has ? <svg width="18" height="18" fill="none" stroke="#34d399" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            : <svg width="18" height="18" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13, color: "var(--text)", margin: "0 0 2px" }}>{label}</p>
          <p style={{ fontSize: 11.5, color: has ? "#34d399" : "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {has ? (file?.name ?? "Uploaded ✓") : sublabel}
          </p>
        </div>
        {!has && !uploading && <span style={{ fontSize: 11, color: "#ff8800", fontFamily: "Syne, sans-serif", fontWeight: 700, flexShrink: 0, padding: "3px 8px", borderRadius: 6, background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.2)" }}>Upload</span>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   OTP BOXES
════════════════════════════════════════════════════════════ */
function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { isDark } = useTheme();
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const handle = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const arr = value.split(""); arr[i] = v;
    onChange(arr.join("").slice(0, 6));
    if (v && i < 5) refs[i + 1]?.current?.focus();
  };
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "24px 0" }}>
      {digits.map((d, i) => (
        <input key={i} ref={refs[i]} type="tel" inputMode="numeric" maxLength={1} value={d}
          onChange={e => handle(i, e.target.value)}
          onKeyDown={e => e.key === "Backspace" && !value[i] && i > 0 && refs[i - 1]?.current?.focus()}
          style={{ width: 52, height: 60, textAlign: "center", borderRadius: 14, border: d ? "1.5px solid rgba(255,107,0,0.6)" : isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.12)", background: d ? (isDark ? "rgba(255,107,0,0.08)" : "rgba(255,107,0,0.05)") : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)", color: "var(--text)", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, outline: "none", transition: "all 0.15s", boxShadow: d ? "0 0 0 3px rgba(255,107,0,0.12)" : "none" }}
          onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,107,0,0.15)"; }}
          onBlur={e => { e.target.style.borderColor = d ? "rgba(255,107,0,0.6)" : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"; e.target.style.boxShadow = d ? "0 0 0 3px rgba(255,107,0,0.12)" : "none"; }}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   STEP PROGRESS BAR
════════════════════════════════════════════════════════════ */
const STEP_LABELS = ["Terms", "Verify OTP", "KYC Docs", "Done"];

function StepBar({ current }: { current: number }) {
  const { isDark } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
      {STEP_LABELS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEP_LABELS.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, transition: "all 0.4s",
                background: done ? "linear-gradient(135deg,#ff6b00,#ffcc00)" : active ? (isDark ? "rgba(255,107,0,0.15)" : "rgba(255,107,0,0.1)") : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                border: done ? "none" : active ? "2px solid rgba(255,107,0,0.7)" : isDark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid rgba(0,0,0,0.1)",
                color: done ? "#fff" : active ? "var(--accent)" : "var(--text-muted)",
                boxShadow: active ? "0 0 20px rgba(255,107,0,0.3)" : done ? "0 0 16px rgba(255,107,0,0.25)" : "none",
              }}>
                {done ? <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg> : i + 1}
              </div>
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: active ? 600 : 500, color: active ? "var(--accent)" : done ? "var(--text)" : "var(--text-muted)", whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: "0 8px", marginBottom: 22, borderRadius: 1, background: done ? "linear-gradient(90deg,#ff6b00,#ffcc00)" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", transition: "background 0.4s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TERMS & CONDITIONS
════════════════════════════════════════════════════════════ */
const TERMS = [
  {
    title: "Eligibility & Identity",
    icon: "🪪",
    body: "You must be at least 18 years of age and a resident of India to become a CrowdSpark Creator. You agree to provide accurate, complete, and up-to-date KYC (Know Your Customer) information including a valid PAN card, Aadhaar card, and active bank account. Misrepresentation of identity is grounds for immediate account termination.",
  },
  {
    title: "Campaign Standards",
    icon: "📋",
    body: "All campaigns must represent genuine projects with honest descriptions, realistic funding goals, and achievable timelines. Creators are prohibited from running campaigns for illegal activities, hate speech, gambling, adult content, counterfeit goods, or any activity that violates Indian law. CrowdSpark reserves the right to remove any campaign without notice.",
  },
  {
    title: "Fees & Payouts",
    icon: "💰",
    body: "CrowdSpark charges a platform fee of 5% on funds successfully raised. Payment gateway fees of approximately 2% apply separately. Payouts are processed within 7–14 business days after a campaign successfully closes. You are responsible for all applicable taxes including GST and TDS on amounts received.",
  },
  {
    title: "Creator Obligations",
    icon: "🤝",
    body: "Creators are legally responsible for fulfilling all promises made to backers. If a campaign is funded, you must deliver the stated rewards or provide transparent updates if circumstances change. Failure to deliver without reasonable cause may result in account suspension, fund clawback, and potential legal action by affected backers.",
  },
  {
    title: "Intellectual Property",
    icon: "©️",
    body: "By posting campaign content on CrowdSpark, you grant CrowdSpark a non-exclusive, worldwide, royalty-free licence to display, share, and promote your campaign content for marketing purposes. You confirm that all content you post is original or that you have the necessary rights and licences for it.",
  },
  {
    title: "Privacy & Data",
    icon: "🔒",
    body: "Your KYC documents and banking details are stored securely using industry-standard encryption on Cloudinary and are used solely for identity verification and payment processing. CrowdSpark will never sell your personal data to third parties. You may request deletion of your data by contacting support@crowdspark.in, subject to legal retention requirements.",
  },
  {
    title: "Account Suspension & Termination",
    icon: "⚠️",
    body: "CrowdSpark reserves the right to suspend or permanently ban creator accounts that violate these terms, receive multiple backer complaints, engage in fraudulent behaviour, or fail KYC review. In cases of fraud, CrowdSpark will cooperate fully with law enforcement authorities.",
  },
  {
    title: "Governing Law",
    icon: "⚖️",
    body: "These terms are governed by the laws of India. Any disputes arising from your use of the CrowdSpark creator programme shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra. By agreeing to these terms you consent to this jurisdiction.",
  },
];

function TermsStep({ onAgree }: { onAgree: () => void }) {
  const { isDark } = useTheme();
  const [checked,  setChecked]  = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setScrolled(true);
  };

  return (
    <div>
      {/* hero banner */}
      <div style={{ borderRadius: 20, padding: "32px", marginBottom: 28, position: "relative", overflow: "hidden", background: "linear-gradient(135deg,rgba(255,107,0,0.1),rgba(167,139,250,0.07),rgba(0,245,212,0.05))", border: "1px solid rgba(255,107,0,0.2)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#ff6b00,#ffcc00,#ff6b00)", backgroundSize: "200% 100%", animation: "fireSlide 3s linear infinite" }} />
        <div style={{ position: "absolute", top: -80, right: -80, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,107,0,0.07)", filter: "blur(60px)", pointerEvents: "none" }} />

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,rgba(255,107,0,0.2),rgba(255,204,0,0.15))", border: "1px solid rgba(255,107,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🚀</div>
          <div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Creator Programme
            </h2>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: "0 0 18px", lineHeight: 1.7 }}>
              Join thousands of creators who have raised funds on CrowdSpark. Read and agree to the terms below to get started.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[["3,40,000+", "Backers"], ["₹12Cr+", "Raised"], ["2,800+", "Campaigns"], ["94%", "Success rate"]].map(([v, l]) => (
                <div key={l} style={{ padding: "8px 14px", borderRadius: 10, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: "var(--accent)", margin: 0, lineHeight: 1 }}>{v}</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* terms scroll area */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 16, height: 2, borderRadius: 1, background: "linear-gradient(90deg,#ff6b00,#ffcc00)", display: "inline-block" }} />
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Terms & Conditions</span>
          </div>
          {!scrolled && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", display: "flex", alignItems: "center", gap: 4, animation: "pulse 2s ease-in-out infinite" }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              Scroll to read
            </span>
          )}
        </div>

        <div ref={scrollRef} onScroll={onScroll} style={{ maxHeight: 420, overflowY: "auto", paddingRight: 4, scrollbarWidth: "thin", scrollbarColor: isDark ? "rgba(255,107,0,0.3) transparent" : "rgba(0,0,0,0.1) transparent" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TERMS.map((t, i) => (
              <div key={t.title} style={{ borderRadius: 16, overflow: "hidden", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)", background: isDark ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.7)", animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}>
                <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{t.title}</span>
                  <span style={{ marginLeft: "auto", fontFamily: "DM Sans, sans-serif", fontSize: 10, color: "var(--text-muted)", padding: "1px 6px", borderRadius: 999, border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" }}>{i + 1}/{TERMS.length}</span>
                </div>
                <p style={{ padding: "12px 16px", fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.75 }}>{t.body}</p>
              </div>
            ))}
          </div>

          {/* bottom fade hint */}
          <div style={{ height: 20 }} />
        </div>

        {/* gradient fade at bottom when not scrolled */}
        {!scrolled && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 4, height: 80, background: isDark ? "linear-gradient(to top,var(--bg) 0%,transparent 100%)" : "linear-gradient(to top,#f8f8f8 0%,transparent 100%)", pointerEvents: "none", borderRadius: "0 0 16px 16px" }} />
        )}
      </div>

      {/* agree checkbox */}
      <div style={{ padding: "16px 20px", borderRadius: 14, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: checked ? "1px solid rgba(52,211,153,0.3)" : isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)", marginBottom: 20, transition: "border-color 0.2s", cursor: "pointer" }}
        onClick={() => setChecked(v => !v)}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", background: checked ? "linear-gradient(135deg,#ff6b00,#ffcc00)" : "transparent", border: checked ? "none" : isDark ? "1.5px solid rgba(255,255,255,0.2)" : "1.5px solid rgba(0,0,0,0.15)", boxShadow: checked ? "0 0 12px rgba(255,107,0,0.4)" : "none" }}>
            {checked && <svg width="12" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 12 10"><path d="M1 5l3.5 4 6.5-8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text)", margin: 0, lineHeight: 1.6 }}>
            I have read and agree to CrowdSpark's <span style={{ color: "var(--accent)", fontWeight: 600 }}>Terms & Conditions</span>, <span style={{ color: "var(--accent)", fontWeight: 600 }}>Creator Guidelines</span>, and <span style={{ color: "var(--accent)", fontWeight: 600 }}>Privacy Policy</span>. I confirm I am 18+ years of age and a resident of India.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <FireBtn label="Agree & Continue →" onClick={onAgree} disabled={!checked} size="lg" />
        <Link href="/dashboard" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← Back to dashboard</Link>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   OTP STEP
════════════════════════════════════════════════════════════ */
function OtpStep({ onVerified, onBack }: { onVerified: () => void; onBack: () => void }) {
  const { user } = useProfile();
  const [otp, setOtp]             = useState("");
  const [sending, setSending]     = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent]           = useState(false);
  const [cooldown, setCooldown]   = useState(0);
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const show = (msg: string, type: "success" | "error" | "info" = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => { if (cooldown <= 0) return; const t = setTimeout(() => setCooldown(c => c - 1), 1000); return () => clearTimeout(t); }, [cooldown]);

  const sendOtp = async () => {
    setSending(true);
    try { await creatorApi.sendOtp(); show("OTP sent to " + user?.email, "success"); setSent(true); setCooldown(60); }
    catch (e: any) { show(e.message ?? "Failed to send OTP", "error"); }
    finally { setSending(false); }
  };

  const verify = async () => {
    if (otp.length !== 6) { show("Enter the complete 6-digit OTP", "error"); return; }
    setVerifying(true);
    try { await creatorApi.verifyOtp(otp); show("Verified! Proceeding to KYC…", "success"); setTimeout(onVerified, 800); }
    catch (e: any) { show(e.message ?? "Invalid OTP. Try again.", "error"); }
    finally { setVerifying(false); }
  };

  const { isDark } = useTheme();

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>📧</div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Verify your email</h2>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: 0, lineHeight: 1.7 }}>
          We'll send a 6-digit OTP to <strong style={{ color: "var(--text)" }}>{user?.email}</strong>
        </p>
      </div>

      {!sent ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.7 }}>
            We need to verify your email address before you can submit KYC documents. This OTP is valid for 10 minutes.
          </p>
          <FireBtn label="Send OTP to my email" onClick={sendOtp} loading={sending} size="lg" />
        </div>
      ) : (
        <div>
          <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(0,245,212,0.07)", border: "1px solid rgba(0,245,212,0.2)", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" fill="none" stroke="#00f5d4" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "#00f5d4", margin: 0 }}>OTP sent! Check your inbox and spam folder.</p>
          </div>

          <OtpBoxes value={otp} onChange={setOtp} />

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <FireBtn label="Verify OTP" onClick={verify} loading={verifying} disabled={otp.length < 6} />
            <FireBtn label={cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"} onClick={cooldown > 0 ? undefined : sendOtp} loading={sending} disabled={cooldown > 0} variant="outline" />
          </div>
        </div>
      )}

      <button onClick={onBack} style={{ display: "block", margin: "24px auto 0", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13 }}>← Back to terms</button>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   KYC STEP
════════════════════════════════════════════════════════════ */
function KycStep({ onSubmitted, onBack }: { onSubmitted: (d: KycStatusResponse) => void; onBack: () => void }) {
  const { isDark } = useTheme();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const show = (msg: string, type: "success" | "error" | "info" = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const [tab, setTab]   = useState<"docs" | "identity" | "bank">("docs");

  const [panUrl, setPanUrl]   = useState(""); const [panPid, setPanPid] = useState(""); const [panFile, setPanFile] = useState<File | null>(null);
  const [afUrl, setAfUrl]     = useState(""); const [afPid, setAfPid]   = useState(""); const [afFile, setAfFile]   = useState<File | null>(null);
  const [abUrl, setAbUrl]     = useState(""); const [abPid, setAbPid]   = useState(""); const [abFile, setAbFile]   = useState<File | null>(null);
  const [uploadingDoc, setUD] = useState<"pan" | "af" | "ab" | null>(null);

  const [panNumber, setPanNumber]   = useState("");
  const [aadhaarNum, setAadhaarNum] = useState("");
  const [acHolder, setAcHolder]     = useState("");
  const [acNumber, setAcNumber]     = useState("");
  const [ifsc, setIfsc]             = useState("");
  const [bankName, setBankName]     = useState("");
  const [branch, setBranch]         = useState("");
  const [upiId, setUpiId]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  const uploadDoc = async (file: File, type: "pan" | "af" | "ab") => {
    setUD(type);
    try {
      const r = await creatorApi.uploadKycDoc(file);
      if (type === "pan") { setPanUrl(r.secure_url); setPanPid(r.public_id); setPanFile(file); }
      if (type === "af")  { setAfUrl(r.secure_url);  setAfPid(r.public_id);  setAfFile(file); }
      if (type === "ab")  { setAbUrl(r.secure_url);  setAbPid(r.public_id);  setAbFile(file); }
      show(`${type === "pan" ? "PAN card" : type === "af" ? "Aadhaar front" : "Aadhaar back"} uploaded!`);
    } catch (e: any) { show(e.message ?? "Upload failed", "error"); }
    finally { setUD(null); }
  };

  const submit = async () => {
    if (!panUrl || !afUrl || !abUrl) { show("Upload all 3 documents first", "error"); setTab("docs"); return; }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber))  { show("Invalid PAN format (e.g. ABCDE1234F)", "error"); setTab("identity"); return; }
    if (!/^\d{4}-\d{4}-\d{4}$/.test(aadhaarNum))         { show("Aadhaar must be XXXX-XXXX-XXXX", "error");        setTab("identity"); return; }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc))            { show("Invalid IFSC code", "error");                     setTab("bank"); return; }
    if (!/^[\w.\-_]+@[a-zA-Z]+$/.test(upiId))            { show("Invalid UPI ID format (e.g. name@upi)", "error"); setTab("bank"); return; }

    setSubmitting(true);
    try {
      const payload: KycSubmitRequest = { panNumber, panCardImageUrl: panUrl, panCardImagePublicId: panPid, aadhaarNumber: aadhaarNum, aadhaarFrontImageUrl: afUrl, aadhaarFrontPublicId: afPid, aadhaarBackImageUrl: abUrl, aadhaarBackPublicId: abPid, bankAccountHolderName: acHolder, bankAccountNumber: acNumber, bankIfscCode: ifsc, bankName, bankBranchName: branch, upiId };
      const data = await creatorApi.submitKyc(payload);
      onSubmitted(data);
    } catch (e: any) { show(e.message ?? "Submission failed. Try again.", "error"); }
    finally { setSubmitting(false); }
  };

  const docsOk     = !!panUrl && !!afUrl && !!abUrl;
  const identityOk = !!panNumber && !!aadhaarNum;
  const bankOk     = !!acHolder && !!acNumber && !!ifsc && !!bankName && !!upiId;

  const TABS = [
    { key: "docs",     label: "Documents", ok: docsOk     },
    { key: "identity", label: "Identity",  ok: identityOk },
    { key: "bank",     label: "Bank",      ok: bankOk     },
  ] as const;

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Submit KYC Documents</h2>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Complete all three sections to submit for review.</p>
      </div>

      {/* tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, padding: "4px", borderRadius: 14, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: tab === t.key ? (isDark ? "rgba(255,255,255,0.08)" : "#fff") : "transparent", color: tab === t.key ? "var(--text)" : "var(--text-muted)", boxShadow: tab === t.key ? (isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)") : "none" }}>
            {t.ok && <svg width="12" height="12" fill="none" stroke="#34d399" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>}
            {t.label}
          </button>
        ))}
      </div>

      {/* docs tab */}
      {tab === "docs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.15)", marginBottom: 4 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
              Upload clear photos or scans. Accepted formats: JPG, PNG, PDF. Max 5MB each. Make sure all text is clearly readable.
            </p>
          </div>
          <DocCard label="PAN Card"      sublabel="Front side — must be clearly visible" file={panFile} url={panUrl} uploading={uploadingDoc === "pan"} onFile={f => uploadDoc(f, "pan")} />
          <DocCard label="Aadhaar Front" sublabel="Front side with name & photo"         file={afFile}  url={afUrl}  uploading={uploadingDoc === "af"}  onFile={f => uploadDoc(f, "af")}  />
          <DocCard label="Aadhaar Back"  sublabel="Back side with address"                file={abFile}  url={abUrl}  uploading={uploadingDoc === "ab"}  onFile={f => uploadDoc(f, "ab")}  />
          <div style={{ marginTop: 8 }}>
            <FireBtn label="Next: Identity Details →" onClick={() => setTab("identity")} disabled={!docsOk} />
          </div>
        </div>
      )}

      {/* identity tab */}
      {tab === "identity" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }} className="kyc-grid">
            <Input label="PAN Number"     value={panNumber}  onChange={setPanNumber}  placeholder="ABCDE1234F"      maxLength={10} hint="5 letters · 4 digits · 1 letter" />
            <Input label="Aadhaar Number" value={aadhaarNum} onChange={setAadhaarNum} placeholder="XXXX-XXXX-XXXX" maxLength={14} hint="Format: XXXX-XXXX-XXXX" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <FireBtn label="Next: Bank Details →" onClick={() => setTab("bank")} disabled={!identityOk} />
            <FireBtn label="← Back" onClick={() => setTab("docs")} variant="outline" />
          </div>
        </div>
      )}

      {/* bank tab */}
      {tab === "bank" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }} className="kyc-grid">
            <Input label="Account Holder Name" value={acHolder}  onChange={setAcHolder}  placeholder="As on bank account" />
            <Input label="Account Number"       value={acNumber}  onChange={setAcNumber}  placeholder="Enter account number" type="password" />
            <Input label="IFSC Code"             value={ifsc}      onChange={setIfsc}      placeholder="HDFC0001234" maxLength={11} hint="11-character code" />
            <Input label="Bank Name"             value={bankName}  onChange={setBankName}  placeholder="HDFC Bank" />
            <Input label="Branch Name"           value={branch}    onChange={setBranch}    placeholder="Andheri West (optional)" />
            <Input label="UPI ID"                value={upiId}     onChange={setUpiId}     placeholder="yourname@upi" hint="Used for quick payouts" />
          </div>

          <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.15)", marginBottom: 20 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
              🔒 Your banking information is encrypted and stored securely. It is used only for processing payouts and will never be shared with third parties.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <FireBtn label={submitting ? "Submitting…" : "Submit KYC for Review 🚀"} onClick={submit} loading={submitting} size="lg" disabled={!bankOk} />
            <FireBtn label="← Back" onClick={() => setTab("identity")} variant="outline" />
          </div>
        </div>
      )}

      <button onClick={onBack} style={{ display: "block", marginTop: 20, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13 }}>← Back to OTP</button>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DONE STEP
════════════════════════════════════════════════════════════ */
function DoneStep({ kycData }: { kycData: KycStatusResponse | null }) {
  const router = useRouter();
  const { isDark } = useTheme();
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 24px" }}>
        <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="40" cy="40" r="34" fill="none" strokeWidth="4" stroke="rgba(52,211,153,0.2)" />
          <circle cx="40" cy="40" r="34" fill="none" strokeWidth="4" stroke="#34d399" strokeDasharray={2 * Math.PI * 34} strokeLinecap="round" style={{ animation: "drawCircle 1s cubic-bezier(0.16,1,0.3,1) forwards" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>🎉</div>
      </div>

      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
        KYC Submitted!
      </h2>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: "0 auto 28px", maxWidth: 380, lineHeight: 1.75 }}>
        Our team will review your documents within <strong style={{ color: "var(--text)" }}>24–48 hours</strong>. You'll receive an email at <strong style={{ color: "var(--accent)" }}>{kycData?.email}</strong> once approved.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, maxWidth: 400, margin: "0 auto 28px", textAlign: "left" }}>
        {[["Step 1", "Terms agreed", "✓"], ["Step 2", "OTP verified", "✓"], ["Step 3", "KYC submitted", "✓"]].map(([s, l, i]) => (
          <div key={s} style={{ padding: "12px", borderRadius: 14, background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{i}</div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 11, color: "#34d399", margin: "0 0 2px" }}>{s}</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{l}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <FireBtn label="Go to Dashboard →" onClick={() => router.push("/dashboard")} size="lg" />
        <FireBtn label="View Settings" onClick={() => router.push("/dashboard/settings")} variant="outline" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ALREADY CREATOR STATE
════════════════════════════════════════════════════════════ */
function AlreadyCreator({ kycStatus }: { kycStatus: KycStatus }) {
  const router = useRouter();
  const configs: Record<string, { icon: string; color: string; title: string; msg: string }> = {
    APPROVED:         { icon: "⚡", color: "#34d399", title: "You're a Verified Creator!",  msg: "Your KYC is approved. Head to your creator dashboard to start launching campaigns." },
    PENDING_APPROVAL: { icon: "🕐", color: "#a78bfa", title: "KYC Under Review",           msg: "Our team is reviewing your documents. Usually 24–48 hours. You'll get an email when done." },
    PENDING_SUBMISSION: { icon: "📄", color: "#f59e0b", title: "Continue KYC Submission", msg: "Your OTP is verified. You can now upload your KYC documents to complete the process." },
  };
  const cfg = configs[kycStatus] ?? configs.APPROVED;
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>{cfg.icon}</div>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: cfg.color, margin: "0 0 10px" }}>{cfg.title}</h2>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", maxWidth: 360, margin: "0 auto 28px", lineHeight: 1.7 }}>{cfg.msg}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <FireBtn label="Go to Dashboard →" onClick={() => router.push("/dashboard")} />
        <FireBtn label="Settings" onClick={() => router.push("/dashboard/settings")} variant="outline" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */
export default function BecomeCreatorPage() {
  const { user, loading, refetch } = useProfile();
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [step, setStep]       = useState(0);
  const [kycResult, setKycResult] = useState<KycStatusResponse | null>(null);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const kycStatus = (user?.kycStatus ?? "NOT_SUBMITTED") as KycStatus;
  const isCreator = user?.roles?.includes("CREATOR");
  const alreadyInProgress = isCreator || kycStatus === "APPROVED" || kycStatus === "PENDING_APPROVAL";

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid var(--accent)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px 80px",
      opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* page header */}
        <div style={{ marginBottom: 36 }}>
          <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", textDecoration: "none", marginBottom: 20, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            Back to Dashboard
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg,rgba(255,107,0,0.2),rgba(255,204,0,0.15))", border: "1px solid rgba(255,107,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🚀</div>
            <div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(22px,3vw,32px)", color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
                Become a Creator
              </h1>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "4px 0 0" }}>
                Launch campaigns · Raise funds · Build your audience
              </p>
            </div>
          </div>
        </div>

        {/* main card */}
        <div style={{ borderRadius: 24, overflow: "hidden", background: isDark ? "linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))" : "linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,255,255,0.85))", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)", boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)" : "0 8px 40px rgba(0,0,0,0.08)", position: "relative" }}>
          {/* top fire line */}
          <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#ff6b00 30%,#ffcc00 60%,transparent)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)", animation: "shimmer 2s ease-in-out infinite" }} />
          </div>

          <div style={{ padding: "32px 36px" }} className="creator-pad">
            {alreadyInProgress
              ? <AlreadyCreator kycStatus={kycStatus} />
              : step < 3
                ? <>
                    <StepBar current={step} />
                    {step === 0 && <TermsStep onAgree={() => setStep(1)} />}
                    {step === 1 && <OtpStep onVerified={async () => { await refetch(); setStep(2); }} onBack={() => setStep(0)} />}
                    {step === 2 && <KycStep onSubmitted={async (d) => { setKycResult(d); await refetch(); setStep(3); }} onBack={() => setStep(1)} />}
                  </>
                : <DoneStep kycData={kycResult} />
            }
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes shimmer    { 0%{transform:translateX(-100%)} 60%{transform:translateX(200%)} 100%{transform:translateX(200%)} }
        @keyframes slideUp    { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeUp     { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fireSlide  { 0%{background-position:0 0} 100%{background-position:200% 0} }
        @keyframes drawCircle { from{stroke-dashoffset:${2 * Math.PI * 34}} to{stroke-dashoffset:0} }
        @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @media(max-width:580px){ .creator-pad{padding:20px 16px!important} .kyc-grid{grid-template-columns:1fr!important} }
      `}</style>
    </div>
  );
}