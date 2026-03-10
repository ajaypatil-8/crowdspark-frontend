"use client";

import { useState, useRef, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "../layout";
import { creatorApi, type KycStatusResponse, type KycSubmitRequest, type KycStatus } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

/* ════════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════════ */
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error" | "info"; onClose: () => void }) {
  const colors = {
    success: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", text: "#34d399", icon: "✓" },
    error: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", text: "#ef4444", icon: "✕" },
    info: { bg: "rgba(0,245,212,0.1)", border: "rgba(0,245,212,0.25)", text: "#00f5d4", icon: "ℹ" },
  }[type];

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 9999, padding: "12px 18px", borderRadius: 14,
        backdropFilter: "blur(20px)", background: colors.bg, border: `1px solid ${colors.border}`,
        color: colors.text, fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: 13.5,
        display: "flex", alignItems: "center", gap: 10, maxWidth: 360, boxShadow: `0 8px 32px ${colors.border}`
      }}
    >
      <span style={{
        width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${colors.text}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0
      }}>{colors.icon}</span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button aria-label="Dismiss notification" onClick={onClose} style={{
        background: "none", border: "none", cursor: "pointer", color: colors.text,
        padding: 0, fontSize: 18, opacity: 0.6, lineHeight: 1
      }}>×</button>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   FIRE BUTTON
════════════════════════════════════════════════════════════ */
function FireBtn({
  label, onClick, loading, disabled, variant = "fire", size = "md"
}: {
  label: string; onClick?: () => void; loading?: boolean; disabled?: boolean;
  variant?: "fire" | "outline" | "ghost"; size?: "sm" | "md" | "lg";
}) {
  const pad = { sm: "8px 18px", md: "11px 26px", lg: "14px 36px" }[size];
  const fz = { sm: 12.5, md: 13.5, lg: 15 }[size];
  const styles = {
    fire: { background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", border: "none", boxShadow: "0 0 20px rgba(255,100,0,0.4)" },
    outline: { background: "transparent", color: "var(--text)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "none" },
    ghost: { background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "none" },
  }[variant];

  return (
    <motion.button
      onClick={disabled || loading ? undefined : onClick}
      whileHover={!disabled && !loading && variant === "fire" ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      style={{
        padding: pad, borderRadius: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: fz,
        cursor: disabled || loading ? "not-allowed" : "pointer", transition: "all 0.18s",
        position: "relative", overflow: "hidden", display: "inline-flex", alignItems: "center", gap: 8,
        opacity: disabled ? 0.5 : 1, ...styles
      }}
    >
      {variant === "fire" && !loading && (
        <span style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.25) 50%,transparent 70%)",
          animation: "shimmer 2.4s ease-in-out infinite"
        }} />
      )}
      <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
        {loading ? (
          <>
            <span style={{
              width: 14, height: 14, borderRadius: "50%", border: "2px solid currentColor",
              borderTopColor: "transparent", animation: "spin 0.7s linear infinite", display: "inline-block"
            }} />
            {label}
          </>
        ) : label}
      </span>
    </motion.button>
  );
}

/* ════════════════════════════════════════════════════════════
   INPUT FIELD
════════════════════════════════════════════════════════════ */
function Input({
  label, value, onChange, placeholder, type = "text", maxLength, hint, disabled, error
}: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string;
  type?: string; maxLength?: number; hint?: string; disabled?: boolean; error?: string;
}) {
  const { isDark } = useTheme();
  const inputId = useId();
  const hasError = !!error;

  return (
    <div>
      <label htmlFor={inputId} style={{
        display: "block", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11.5,
        color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase"
      }}>{label}</label>
      <motion.input
        id={inputId}
        type={type} value={value} maxLength={maxLength} disabled={disabled} placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        whileFocus={{ scale: 1.01 }}
        style={{
          width: "100%", padding: "10px 13px", borderRadius: 11, boxSizing: "border-box",
          border: hasError ? "1px solid #ef4444" : isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
          background: disabled ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)") : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.025)"),
          color: disabled ? "var(--text-muted)" : "var(--text)",
          fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s", cursor: disabled ? "not-allowed" : "text"
        }}
        onFocus={e => {
          if (!disabled) {
            e.currentTarget.style.borderColor = hasError ? "#ef4444" : "var(--accent)";
            e.currentTarget.style.boxShadow = hasError ? "0 0 0 3px rgba(239,68,68,0.1)" : "0 0 0 3px rgba(255,107,0,0.1)";
          }
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = hasError ? "#ef4444" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {error && (
        <p style={{ fontSize: 11.5, color: "#ef4444", fontFamily: "DM Sans, sans-serif", margin: "4px 0 0" }}>
          ✕ {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: "4px 0 0" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DOC CARD WITH FILE VALIDATION
════════════════════════════════════════════════════════════ */
function DocCard({
  label, sublabel, file, url, onFile, uploading, error, onError
}: {
  label: string; sublabel: string; file: File | null; url: string;
  onFile: (f: File) => void; uploading: boolean; error?: string;
  onError?: (msg: string) => void;
}) {
  const { isDark } = useTheme();
  const ref = useRef<HTMLInputElement>(null);
  const has = !!url;

  const handleFile = (f: File) => {
    const maxSize = 5 * 1024 * 1024;
    if (f.size > maxSize) {
      if (onError) onError("File must be less than 5MB");
      else alert("File must be less than 5MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(f.type)) {
      if (onError) onError("Only JPG, PNG, or PDF files allowed");
      else alert("Only JPG, PNG, or PDF files allowed");
      return;
    }
    onFile(f);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!has && !uploading ? { scale: 1.02 } : {}}
      onClick={() => ref.current?.click()}
      role="button"
      tabIndex={0}
      aria-label={`Upload ${label}`}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ref.current?.click(); } }}
      style={{
        padding: "14px", borderRadius: 14, cursor: uploading ? "wait" : "pointer",
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        border: error ? "1px solid #ef4444" : has ? "1px solid rgba(52,211,153,0.35)" : isDark ? "1px dashed rgba(255,255,255,0.1)" : "1px dashed rgba(0,0,0,0.1)",
        transition: "all 0.18s"
      }}
    >
      <input ref={ref} type="file" accept="image/*,application/pdf" style={{ display: "none" }}
        onChange={e => { if (e.target.files?.[0]) { handleFile(e.target.files[0]); e.target.value = ""; } }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <motion.div
          animate={uploading ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.6, repeat: Infinity }}
          style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: has ? "rgba(52,211,153,0.1)" : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            border: has ? "1px solid rgba(52,211,153,0.25)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >
          {uploading ? (
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              border: "2px solid var(--accent)", borderTopColor: "transparent", animation: "spin 0.7s linear infinite"
            }} />
          ) : has ? (
            <svg width="18" height="18" fill="none" stroke="#34d399" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : error ? (
            <svg width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
        </motion.div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13,
            color: "var(--text)", margin: "0 0 2px"
          }}>{label}</p>
          <p style={{
            fontSize: 11.5, color: has ? "#34d399" : error ? "#ef4444" : "var(--text-muted)",
            fontFamily: "DM Sans, sans-serif", margin: 0, overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>
            {has ? (file?.name ?? "Uploaded ✓") : error ? error : sublabel}
          </p>
        </div>
        {!has && !uploading && !error && (
          <span style={{
            fontSize: 11, color: "#ff8800", fontFamily: "Syne, sans-serif", fontWeight: 700,
            flexShrink: 0, padding: "3px 8px", borderRadius: 6,
            background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.2)"
          }}>Upload</span>
        )}
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   OTP BOXES
════════════════════════════════════════════════════════════ */
function OtpBoxes({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const { isDark } = useTheme();
  const refs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const handle = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const arr = value.split("");
    arr[i] = v;
    onChange(arr.join("").slice(0, 6));
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "24px 0", flexWrap: "wrap" }}>
        {digits.map((d, i) => (
          <motion.input
            key={i}
            ref={el => { refs.current[i] = el; }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handle(i, e.target.value)}
            onKeyDown={e => e.key === "Backspace" && !value[i] && i > 0 && refs.current[i - 1]?.focus()}
            whileFocus={{ scale: 1.1 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            style={{
              width: 52, height: 60, textAlign: "center", borderRadius: 14,
              border: error ? "1.5px solid #ef4444" : d ? "1.5px solid rgba(255,107,0,0.6)" : isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.12)",
              background: d
                ? isDark ? "rgba(255,107,0,0.08)" : "rgba(255,107,0,0.05)"
                : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
              color: "var(--text)", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22,
              outline: "none", transition: "all 0.15s",
              boxShadow: error ? "0 0 0 3px rgba(239,68,68,0.12)" : d ? "0 0 0 3px rgba(255,107,0,0.12)" : "none"
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = error ? "#ef4444" : "var(--accent)";
              e.currentTarget.style.boxShadow = error ? "0 0 0 3px rgba(239,68,68,0.15)" : "0 0 0 3px rgba(255,107,0,0.15)";
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = error ? "#ef4444" : d ? "rgba(255,107,0,0.6)" : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
              e.currentTarget.style.boxShadow = error ? "0 0 0 3px rgba(239,68,68,0.12)" : d ? "0 0 0 3px rgba(255,107,0,0.12)" : "none";
            }}
          />
        ))}
      </div>
      {error && (
        <p style={{
          fontSize: 12, color: "#ef4444", fontFamily: "DM Sans, sans-serif",
          margin: 0, textAlign: "center", marginBottom: 12
        }}>✕ {error}</p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   STEP PROGRESS BAR
═════��══════════════════════════════════════════════════════ */
const STEP_LABELS = ["Terms", "Verify OTP", "KYC Docs", "Done"];

function StepBar({ current }: { current: number }) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}
    >
      {STEP_LABELS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEP_LABELS.length - 1 ? 1 : "none" }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}
            >
              <motion.div
                animate={{
                  background: done
                    ? "linear-gradient(135deg,#ff6b00,#ffcc00)"
                    : active ? (isDark ? "rgba(255,107,0,0.15)" : "rgba(255,107,0,0.1)") : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                  boxShadow: active ? "0 0 20px rgba(255,107,0,0.3)" : "none"
                }}
                style={{
                  width: 36, height: 36, borderRadius: "50%", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13,
                  border: done ? "none" : active ? "2px solid rgba(255,107,0,0.7)" : isDark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid rgba(0,0,0,0.1)",
                  color: done ? "#fff" : active ? "var(--accent)" : "var(--text-muted)",
                  transition: "all 0.4s"
                }}
              >
                {done ? (
                  <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : i + 1}
              </motion.div>
              <span style={{
                fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: active ? 600 : 500,
                color: active ? "var(--accent)" : done ? "var(--text)" : "var(--text-muted)", whiteSpace: "nowrap"
              }}>{label}</span>
            </motion.div>
            {i < STEP_LABELS.length - 1 && (
              <motion.div
                animate={{
                  background: done ? "linear-gradient(90deg,#ff6b00,#ffcc00)" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"
                }}
                style={{
                  flex: 1, height: 2, margin: "0 8px", marginBottom: 22,
                  borderRadius: 1, transition: "background 0.4s"
                }}
              />
            )}
          </div>
        );
      })}
    </motion.div>
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
  const [checked, setChecked] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setScrolled(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
      {/* hero banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          borderRadius: 20, padding: "32px", marginBottom: 28, position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg,rgba(255,107,0,0.1),rgba(167,139,250,0.07),rgba(0,245,212,0.05))",
          border: "1px solid rgba(255,107,0,0.2)"
        }}
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,#ff6b00,#ffcc00,#ff6b00)", backgroundSize: "200% 100%",
          animation: "fireSlide 3s linear infinite"
        }} />
        <div style={{
          position: "absolute", top: -80, right: -80, width: 220, height: 220, borderRadius: "50%",
          background: "rgba(255,107,0,0.07)", filter: "blur(60px)", pointerEvents: "none"
        }} />

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              width: 56, height: 56, borderRadius: 18,
              background: "linear-gradient(135deg,rgba(255,107,0,0.2),rgba(255,204,0,0.15))",
              border: "1px solid rgba(255,107,0,0.3)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0
            }}
          >🚀</motion.div>
          <div>
            <h2 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)",
              margin: "0 0 8px", letterSpacing: "-0.02em"
            }}>Creator Programme</h2>
            <p style={{
              fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)",
              margin: "0 0 18px", lineHeight: 1.7
            }}>Join thousands of creators who have raised funds on CrowdSpark. Read and agree to the terms below to get started.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[["3,40,000+", "Backers"], ["₹12Cr+", "Raised"], ["2,800+", "Campaigns"], ["94%", "Success rate"]].map(([v, l], idx) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  style={{
                    padding: "8px 14px", borderRadius: 10,
                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)"
                  }}
                >
                  <p style={{
                    fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16,
                    color: "var(--accent)", margin: 0, lineHeight: 1
                  }}>{v}</p>
                  <p style={{
                    fontFamily: "DM Sans, sans-serif", fontSize: 11,
                    color: "var(--text-muted)", margin: "2px 0 0"
                  }}>{l}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* terms scroll area */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 16, height: 2, borderRadius: 1,
              background: "linear-gradient(90deg,#ff6b00,#ffcc00)", display: "inline-block"
            }} />
            <span style={{
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)"
            }}>Terms & Conditions</span>
          </div>
          {!scrolled && (
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                fontSize: 11, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif",
                display: "flex", alignItems: "center", gap: 4
              }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              Scroll to read
            </motion.span>
          )}
        </motion.div>

        <div ref={scrollRef} onScroll={onScroll} style={{
          maxHeight: 420, overflowY: "auto", paddingRight: 4,
          scrollbarWidth: "thin", scrollbarColor: isDark ? "rgba(255,107,0,0.3) transparent" : "rgba(0,0,0,0.1) transparent"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TERMS.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                style={{
                  borderRadius: 16, overflow: "hidden",
                  border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
                  background: isDark ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.7)"
                }}
              >
                <div style={{
                  padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                  borderBottom: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)",
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
                }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <span style={{
                    fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)"
                  }}>{t.title}</span>
                  <span style={{
                    marginLeft: "auto", fontFamily: "DM Sans, sans-serif", fontSize: 10,
                    color: "var(--text-muted)", padding: "1px 6px", borderRadius: 999,
                    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
                  }}>{i + 1}/{TERMS.length}</span>
                </div>
                <p style={{
                  padding: "12px 16px", fontFamily: "DM Sans, sans-serif", fontSize: 13,
                  color: "var(--text-muted)", margin: 0, lineHeight: 1.75
                }}>{t.body}</p>
              </motion.div>
            ))}
          </div>
          <div style={{ height: 20 }} />
        </div>

        {!scrolled && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 4, height: 80,
            background: isDark ? "linear-gradient(to top,var(--bg) 0%,transparent 100%)" : "linear-gradient(to top,#f8f8f8 0%,transparent 100%)",
            pointerEvents: "none", borderRadius: "0 0 16px 16px"
          }} />
        )}
      </div>

      {/* agree checkbox */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => setChecked(v => !v)}
        style={{
          padding: "16px 20px", borderRadius: 14,
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
          border: checked ? "1px solid rgba(52,211,153,0.3)" : isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
          marginBottom: 20, transition: "border-color 0.2s", cursor: "pointer"
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <motion.div
            animate={{
              background: checked ? "linear-gradient(135deg,#ff6b00,#ffcc00)" : "transparent",
              boxShadow: checked ? "0 0 12px rgba(255,107,0,0.4)" : "none"
            }}
            style={{
              width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
              border: checked ? "none" : isDark ? "1.5px solid rgba(255,255,255,0.2)" : "1.5px solid rgba(0,0,0,0.15)"
            }}
          >
            {checked && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                width="12" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 12 10"
              >
                <path d="M1 5l3.5 4 6.5-8" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            )}
          </motion.div>
          <p style={{
            fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text)",
            margin: 0, lineHeight: 1.6
          }}>
            I have read and agree to CrowdSpark's <span style={{ color: "var(--accent)", fontWeight: 600 }}>Terms & Conditions</span>, <span style={{ color: "var(--accent)", fontWeight: 600 }}>Creator Guidelines</span>, and <span style={{ color: "var(--accent)", fontWeight: 600 }}>Privacy Policy</span>. I confirm I am 18+ years of age and a resident of India.
          </p>
        </div>
      </motion.div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <FireBtn label="Agree & Continue →" onClick={onAgree} disabled={!checked} size="lg" />
        <Link href="/dashboard" style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", textDecoration: "none"
        }}>← Back to dashboard</Link>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   OTP STEP
════════════════════════════════════════════════════════════ */
function OtpStep({ onVerified, onBack }: { onVerified: () => void; onBack: () => void }) {
  const { user } = useProfile();
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = (msg: string, type: "success" | "error" | "info" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendOtp = async () => {
    setSending(true);
    try {
      await creatorApi.sendOtp();
      show("OTP sent to " + user?.email, "success");
      setSent(true);
      setCooldown(60);
      setOtpError("");
    } catch (e: any) {
      show(e.message ?? "Failed to send OTP", "error");
    } finally {
      setSending(false);
    }
  };

  const verify = async () => {
    if (otp.length !== 6) {
      setOtpError("Enter the complete 6-digit OTP");
      return;
    }
    setVerifying(true);
    try {
      await creatorApi.verifyOtp(otp);
      show("Verified! Proceeding to KYC…", "success");
      verifyTimerRef.current = setTimeout(onVerified, 800);
    } catch (e: any) {
      setOtpError(e.message ?? "Invalid OTP. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: 480, margin: "0 auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            width: 64, height: 64, borderRadius: 20, background: "rgba(255,107,0,0.1)",
            border: "1px solid rgba(255,107,0,0.25)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px"
          }}
        >📧</motion.div>
        <h2 style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)",
          margin: "0 0 8px", letterSpacing: "-0.02em"
        }}>Verify your email</h2>
        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)",
          margin: 0, lineHeight: 1.7
        }}>We'll send a 6-digit OTP to <strong style={{ color: "var(--text)" }}>{user?.email}</strong></p>
      </div>

      {!sent ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ textAlign: "center" }}>
          <p style={{
            fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)",
            marginBottom: 24, lineHeight: 1.7
          }}>We need to verify your email address before you can submit KYC documents. This OTP is valid for 10 minutes.</p>
          <FireBtn label="Send OTP to my email" onClick={sendOtp} loading={sending} size="lg" />
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "12px 16px", borderRadius: 12, background: "rgba(0,245,212,0.07)",
              border: "1px solid rgba(0,245,212,0.2)", marginBottom: 8,
              display: "flex", alignItems: "center", gap: 10
            }}
          >
            <svg width="16" height="16" fill="none" stroke="#00f5d4" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p style={{
              fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "#00f5d4", margin: 0
            }}>OTP sent! Check your inbox and spam folder.</p>
          </motion.div>

          <OtpBoxes value={otp} onChange={setOtp} error={otpError} />

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <FireBtn label="Verify OTP" onClick={verify} loading={verifying} disabled={otp.length < 6} />
            <FireBtn
              label={cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              onClick={cooldown > 0 ? undefined : sendOtp}
              loading={sending}
              disabled={cooldown > 0}
              variant="outline"
            />
          </div>
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onBack}
        style={{
          display: "block", margin: "24px auto 0", background: "none", border: "none",
          cursor: "pointer", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13
        }}
      >← Back to terms</motion.button>
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   KYC STEP
══════��═════════════════════════════════════════════════════ */
function KycStep({ onSubmitted, onBack }: { onSubmitted: (d: KycStatusResponse) => void; onBack: () => void }) {
  const { isDark } = useTheme();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = (msg: string, type: "success" | "error" | "info" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const [tab, setTab] = useState<"docs" | "identity" | "bank">("docs");
  const [panUrl, setPanUrl] = useState("");
  const [panPid, setPanPid] = useState("");
  const [panFile, setPanFile] = useState<File | null>(null);
  const [afUrl, setAfUrl] = useState("");
  const [afPid, setAfPid] = useState("");
  const [afFile, setAfFile] = useState<File | null>(null);
  const [abUrl, setAbUrl] = useState("");
  const [abPid, setAbPid] = useState("");
  const [abFile, setAbFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<"pan" | "af" | "ab" | null>(null);

  const [panNumber, setPanNumber] = useState("");
  const [aadhaarNum, setAadhaarNum] = useState("");
  const [acHolder, setAcHolder] = useState("");
  const [acNumber, setAcNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [upiId, setUpiId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const uploadDoc = async (file: File, type: "pan" | "af" | "ab") => {
    setUploadingDoc(type);
    try {
      const r = await creatorApi.uploadKycDoc(file);
      if (type === "pan") {
        setPanUrl(r.secure_url);
        setPanPid(r.public_id);
        setPanFile(file);
      }
      if (type === "af") {
        setAfUrl(r.secure_url);
        setAfPid(r.public_id);
        setAfFile(file);
      }
      if (type === "ab") {
        setAbUrl(r.secure_url);
        setAbPid(r.public_id);
        setAbFile(file);
      }
      show(`${type === "pan" ? "PAN card" : type === "af" ? "Aadhaar front" : "Aadhaar back"} uploaded!`);
    } catch (e: any) {
      show(e.message ?? "Upload failed", "error");
    } finally {
      setUploadingDoc(null);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      errors.panNumber = "Invalid PAN format (e.g. ABCDE1234F)";
    }
    if (!/^\d{4}-\d{4}-\d{4}$/.test(aadhaarNum)) {
      errors.aadhaarNum = "Aadhaar must be XXXX-XXXX-XXXX";
    }
    if (!acHolder.trim()) {
      errors.acHolder = "Account holder name is required";
    }
    if (!acNumber.trim()) {
      errors.acNumber = "Account number is required";
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      errors.ifsc = "Invalid IFSC code";
    }
    if (!bankName.trim()) {
      errors.bankName = "Bank name is required";
    }
    if (!/^[\w.\-_]+@[a-zA-Z]+$/.test(upiId)) {
      errors.upiId = "Invalid UPI ID format (e.g., name@upi)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async () => {
    if (!panUrl || !afUrl || !abUrl) {
      show("Upload all 3 documents first", "error");
      setTab("docs");
      return;
    }

    if (!validateForm()) {
      show("Please fix the errors below", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload: KycSubmitRequest = {
        panNumber, panCardImageUrl: panUrl, panCardImagePublicId: panPid,
        aadhaarNumber: aadhaarNum, aadhaarFrontImageUrl: afUrl, aadhaarFrontPublicId: afPid,
        aadhaarBackImageUrl: abUrl, aadhaarBackPublicId: abPid,
        bankAccountHolderName: acHolder, bankAccountNumber: acNumber,
        bankIfscCode: ifsc, bankName, bankBranchName: branch, upiId
      };
      const data = await creatorApi.submitKyc(payload);
      onSubmitted(data);
    } catch (e: any) {
      show(e.message ?? "Submission failed. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const docsOk = !!panUrl && !!afUrl && !!abUrl;
  const identityOk = !!panNumber && !!aadhaarNum;
  const bankOk = !!acHolder && !!acNumber && !!ifsc && !!bankName && !!upiId;

  const TABS = [
    { key: "docs", label: "Documents", ok: docsOk },
    { key: "identity", label: "Identity", ok: identityOk },
    { key: "bank", label: "Bank", ok: bankOk },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)",
          margin: "0 0 6px", letterSpacing: "-0.02em"
        }}>Submit KYC Documents</h2>
        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: 0
        }}>Complete all three sections to submit for review.</p>
      </div>

      {/* tab bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          display: "flex", gap: 4, marginBottom: 24, padding: "4px", borderRadius: 14,
          background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
          border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)"
        }}
      >
        {TABS.map(t => (
          <motion.button
            key={t.key}
            onClick={() => setTab(t.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              background: tab === t.key ? (isDark ? "rgba(255,255,255,0.08)" : "#fff") : "transparent",
              color: tab === t.key ? "var(--text)" : "var(--text-muted)"
            }}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer",
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: tab === t.key ? (isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)") : "none"
            }}
          >
            {t.ok && (
              <svg width="12" height="12" fill="none" stroke="#34d399" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
            {t.label}
          </motion.button>
        ))}
      </motion.div>

      {/* docs tab */}
      <AnimatePresence mode="wait">
        {tab === "docs" && (
          <motion.div
            key="docs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div style={{
              padding: "12px 14px", borderRadius: 12, background: "rgba(0,245,212,0.06)",
              border: "1px solid rgba(0,245,212,0.15)", marginBottom: 4
            }}>
              <p style={{
                fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)",
                margin: 0, lineHeight: 1.6
              }}>Upload clear photos or scans. Accepted formats: JPG, PNG, PDF. Max 5MB each. Make sure all text is clearly readable.</p>
            </div>
            <DocCard label="PAN Card" sublabel="Front side — must be clearly visible" file={panFile} url={panUrl} uploading={uploadingDoc === "pan"} onFile={f => uploadDoc(f, "pan")} onError={msg => show(msg, "error")} />
            <DocCard label="Aadhaar Front" sublabel="Front side with name & photo" file={afFile} url={afUrl} uploading={uploadingDoc === "af"} onFile={f => uploadDoc(f, "af")} onError={msg => show(msg, "error")} />
            <DocCard label="Aadhaar Back" sublabel="Back side with address" file={abFile} url={abUrl} uploading={uploadingDoc === "ab"} onFile={f => uploadDoc(f, "ab")} onError={msg => show(msg, "error")} />
            <div style={{ marginTop: 8 }}>
              <FireBtn label="Next: Identity Details →" onClick={() => setTab("identity")} disabled={!docsOk} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* identity tab */}
      <AnimatePresence mode="wait">
        {tab === "identity" && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20
            }} className="kyc-grid">
              <Input
                label="PAN Number" value={panNumber} onChange={setPanNumber}
                placeholder="ABCDE1234F" maxLength={10} hint="5 letters · 4 digits · 1 letter"
                error={formErrors.panNumber}
              />
              <Input
                label="Aadhaar Number" value={aadhaarNum} onChange={setAadhaarNum}
                placeholder="XXXX-XXXX-XXXX" maxLength={14} hint="Format: XXXX-XXXX-XXXX"
                error={formErrors.aadhaarNum}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <FireBtn label="Next: Bank Details →" onClick={() => setTab("bank")} disabled={!identityOk} />
              <FireBtn label="← Back" onClick={() => setTab("docs")} variant="outline" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* bank tab */}
      <AnimatePresence mode="wait">
        {tab === "bank" && (
          <motion.div
            key="bank"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20
            }} className="kyc-grid">
              <Input label="Account Holder Name" value={acHolder} onChange={setAcHolder} placeholder="As on bank account" error={formErrors.acHolder} />
              <Input label="Account Number" value={acNumber} onChange={setAcNumber} placeholder="Enter account number" type="password" error={formErrors.acNumber} />
              <Input label="IFSC Code" value={ifsc} onChange={setIfsc} placeholder="HDFC0001234" maxLength={11} hint="11-character code" error={formErrors.ifsc} />
              <Input label="Bank Name" value={bankName} onChange={setBankName} placeholder="HDFC Bank" error={formErrors.bankName} />
              <Input label="Branch Name" value={branch} onChange={setBranch} placeholder="Andheri West (optional)" />
                          <Input label="UPI ID" value={upiId} onChange={setUpiId} placeholder="yourname@upi" hint="Used for quick payouts" error={formErrors.upiId} />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                padding: "12px 14px", borderRadius: 12, background: "rgba(255,107,0,0.06)",
                border: "1px solid rgba(255,107,0,0.15)", marginBottom: 20
              }}
            >
              <p style={{
                fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)",
                margin: 0, lineHeight: 1.6
              }}>🔒 Your banking information is encrypted and stored securely. It is used only for processing payouts and will never be shared with third parties.</p>
            </motion.div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <FireBtn label={submitting ? "Submitting…" : "Submit KYC for Review 🚀"} onClick={submit} loading={submitting} size="lg" disabled={!bankOk} />
              <FireBtn label="← Back" onClick={() => setTab("identity")} variant="outline" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onBack}
        style={{
          display: "block", marginTop: 20, background: "none", border: "none",
          cursor: "pointer", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13
        }}
      >← Back to OTP</motion.button>
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   DONE STEP
════════════════════════════════════════════════════════════ */
function DoneStep({ kycData }: { kycData: KycStatusResponse | null }) {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{ textAlign: "center", padding: "20px 0" }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        style={{ position: "relative", width: 80, height: 80, margin: "0 auto 24px" }}
      >
        <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="40" cy="40" r="34" fill="none" strokeWidth="4" stroke="rgba(52,211,153,0.2)" />
          <motion.circle
            cx="40" cy="40" r="34" fill="none" strokeWidth="4" stroke="#34d399" strokeDasharray={2 * Math.PI * 34}
            strokeLinecap="round"
            initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: 30
        }}>🎉</div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26,
          color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.02em"
        }}
      >
        KYC Submitted!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)",
          margin: "0 auto 28px", maxWidth: 380, lineHeight: 1.75
        }}
      >
        Our team will review your documents within <strong style={{ color: "var(--text)" }}>24–48 hours</strong>. You'll receive an email at <strong style={{ color: "var(--accent)" }}>{kycData?.email}</strong> once approved.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10,
          maxWidth: 400, margin: "0 auto 28px", textAlign: "left"
        }}
      >
        {[["Step 1", "Terms agreed", "✓"], ["Step 2", "OTP verified", "✓"], ["Step 3", "KYC submitted", "✓"]].map(([s, l, i], idx) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + idx * 0.1 }}
            style={{
              padding: "12px", borderRadius: 14, background: "rgba(52,211,153,0.07)",
              border: "1px solid rgba(52,211,153,0.2)", textAlign: "center"
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 6 }}>{i}</div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 11, color: "#34d399", margin: "0 0 2px" }}>{s}</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{l}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}
      >
        <FireBtn label="Go to Dashboard →" onClick={() => router.push("/dashboard")} size="lg" />
        <FireBtn label="View Settings" onClick={() => router.push("/dashboard/settings")} variant="outline" />
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   ALREADY CREATOR STATE
════════════════════════════════════════════════════════════ */
function AlreadyCreator({ kycStatus }: { kycStatus: KycStatus }) {
  const router = useRouter();
  const configs: Record<string, { icon: string; color: string; title: string; msg: string }> = {
    APPROVED: {
      icon: "⚡", color: "#34d399", title: "You're a Verified Creator!",
      msg: "Your KYC is approved. Head to your creator dashboard to start launching campaigns."
    },
    PENDING_APPROVAL: {
      icon: "🕐", color: "#a78bfa", title: "KYC Under Review",
      msg: "Our team is reviewing your documents. Usually 24–48 hours. You'll get an email when done."
    },
    PENDING_SUBMISSION: {
      icon: "📄", color: "#f59e0b", title: "Continue KYC Submission",
      msg: "Your OTP is verified. You can now upload your KYC documents to complete the process."
    },
  };
  const cfg = configs[kycStatus] ?? configs.APPROVED;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{ textAlign: "center", padding: "40px 20px" }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
        style={{ fontSize: 52, marginBottom: 16 }}
      >{cfg.icon}</motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22,
          color: cfg.color, margin: "0 0 10px"
        }}
      >{cfg.title}</motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)",
          maxWidth: 360, margin: "0 auto 28px", lineHeight: 1.7
        }}
      >{cfg.msg}</motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ display: "flex", gap: 10, justifyContent: "center" }}
      >
        <FireBtn label="Go to Dashboard →" onClick={() => router.push("/dashboard")} />
        <FireBtn label="Settings" onClick={() => router.push("/dashboard/settings")} variant="outline" />
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */
export default function BecomeCreatorPage() {
  const { user, loading, refetch } = useProfile();
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [kycResult, setKycResult] = useState<KycStatusResponse | null>(null);

  // ✅ HYDRATION FIX: Direct mount without setTimeout
  useEffect(() => {
    setMounted(true);
  }, []);

  const kycStatus = (user?.kycStatus ?? "NOT_SUBMITTED") as KycStatus;
  const isCreator = user?.roles?.includes("CREATOR");
  const alreadyInProgress = isCreator || kycStatus === "APPROVED" || kycStatus === "PENDING_APPROVAL";

  // ✅ Loading state with skeleton
  if (loading) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", flexDirection: "column", gap: 16
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: "50%", border: "3px solid var(--accent)",
        borderTopColor: "transparent", animation: "spin 0.8s linear infinite"
      }} />
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)" }}>
        Loading creator dashboard...
      </p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );

  // ✅ Don't render until mounted (prevents hydration mismatch)
  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: "100vh", padding: "40px 20px 80px" }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* page header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: 36 }}
        >
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)",
            textDecoration: "none", marginBottom: 20, transition: "color 0.15s"
          }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Dashboard
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                width: 48, height: 48, borderRadius: 16,
                background: "linear-gradient(135deg,rgba(255,107,0,0.2),rgba(255,204,0,0.15))",
                border: "1px solid rgba(255,107,0,0.3)", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 22
              }}
            >🚀</motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <h1 style={{
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: "clamp(22px,3vw,32px)", color: "var(--text)",
                letterSpacing: "-0.03em", margin: 0
              }}>
                Become a Creator
              </h1>
              <p style={{
                fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
                color: "var(--text-muted)", margin: "4px 0 0"
              }}>
                Launch campaigns · Raise funds · Build your audience
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{
            borderRadius: 24, overflow: "hidden",
            background: isDark
              ? "linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))"
              : "linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,255,255,0.85))",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
            boxShadow: isDark
              ? "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "0 8px 40px rgba(0,0,0,0.08)",
            position: "relative"
          }}
        >
          {/* top fire line */}
          <div style={{
            height: 2, background: "linear-gradient(90deg,transparent,#ff6b00 30%,#ffcc00 60%,transparent)",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)",
              animation: "shimmer 2s ease-in-out infinite"
            }} />
          </div>

          <div style={{ padding: "32px 36px" }} className="creator-pad">
            {alreadyInProgress
              ? <AlreadyCreator kycStatus={kycStatus} />
              : step < 3
                ? <>
                  <StepBar current={step} />
                  <AnimatePresence mode="wait">
                    {step === 0 && <TermsStep key="terms" onAgree={() => setStep(1)} />}
                    {step === 1 && <OtpStep key="otp" onVerified={async () => { await refetch(); setStep(2); }} onBack={() => setStep(0)} />}
                    {step === 2 && <KycStep key="kyc" onSubmitted={async (d) => { setKycResult(d); await refetch(); setStep(3); }} onBack={() => setStep(1)} />}
                  </AnimatePresence>
                </>
                : <DoneStep kycData={kycResult} />
            }
          </div>
        </motion.div>
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
    </motion.div>
  );
}