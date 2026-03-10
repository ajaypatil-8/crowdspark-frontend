"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "../layout";
import {
  creatorApi,
  type KycStatusResponse,
  type KycSubmitRequest,
  type KycStatus,
} from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

/* ════════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════════ */
function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
  const colors = {
    success: {
      bg: "rgba(52,211,153,0.12)",
      border: "rgba(52,211,153,0.3)",
      text: "#34d399",
      icon: "✓",
    },
    error: {
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.3)",
      text: "#ef4444",
      icon: "✕",
    },
    info: {
      bg: "rgba(0,245,212,0.1)",
      border: "rgba(0,245,212,0.25)",
      text: "#00f5d4",
      icon: "ℹ",
    },
  }[type];

  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 9999,
        padding: "12px 18px",
        borderRadius: 14,
        backdropFilter: "blur(20px)",
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontFamily: "DM Sans, sans-serif",
        fontWeight: 500,
        fontSize: 13.5,
        display: "flex",
        alignItems: "center",
        gap: 10,
        maxWidth: 360,
        boxShadow: `0 8px 32px ${colors.border}`,
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: `1.5px solid ${colors.text}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          flexShrink: 0,
        }}
      >
        {colors.icon}
      </span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: colors.text,
          padding: 0,
          fontSize: 18,
          opacity: 0.6,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   FIRE BUTTON
════════════════════════════════════════════════════════════ */
function FireBtn({
  label,
  onClick,
  loading,
  disabled,
  variant = "fire",
  size = "md",
}: {
  label: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "fire" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const pad = { sm: "8px 18px", md: "11px 26px", lg: "14px 36px" }[size];
  const fz = { sm: 12.5, md: 13.5, lg: 15 }[size];
  const btnStyles = {
    fire: {
      background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
      color: "#fff",
      border: "none",
      boxShadow: "0 0 20px rgba(255,100,0,0.4)",
    },
    outline: {
      background: "transparent",
      color: "var(--text)",
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "none",
    },
    ghost: {
      background: "rgba(255,255,255,0.05)",
      color: "var(--text-muted)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "none",
    },
  }[variant];

  return (
    <motion.button
      onClick={disabled || loading ? undefined : onClick}
      whileHover={
        !disabled && !loading && variant === "fire"
          ? { scale: 1.02, y: -1 }
          : {}
      }
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      style={{
        padding: pad,
        borderRadius: 12,
        fontFamily: "Syne, sans-serif",
        fontWeight: 700,
        fontSize: fz,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        transition: "all 0.18s",
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        opacity: disabled ? 0.5 : 1,
        ...btnStyles,
      }}
    >
      {variant === "fire" && !loading && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.25) 50%,transparent 70%)",
            animation: "shimmer 2.4s ease-in-out infinite",
          }}
        />
      )}
      <span
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "2px solid currentColor",
                borderTopColor: "transparent",
                animation: "spin 0.7s linear infinite",
                display: "inline-block",
              }}
            />
            {label}
          </>
        ) : (
          label
        )}
      </span>
    </motion.button>
  );
}

/* ════════════════════════════════════════════════════════════
   INPUT FIELD
════════════════════════════════════════════════════════════ */
function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  hint,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  hint?: string;
  disabled?: boolean;
  error?: string;
}) {
  const { isDark } = useTheme();
  const hasError = !!error;

  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: "DM Sans, sans-serif",
          fontWeight: 600,
          fontSize: 11.5,
          color: "var(--text-muted)",
          marginBottom: 6,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <motion.input
        type={type}
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        whileFocus={{ scale: 1.01 }}
        style={{
          width: "100%",
          padding: "10px 13px",
          borderRadius: 11,
          boxSizing: "border-box",
          border: hasError
            ? "1px solid #ef4444"
            : isDark
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid rgba(0,0,0,0.1)",
          background: disabled
            ? isDark
              ? "rgba(255,255,255,0.02)"
              : "rgba(0,0,0,0.02)"
            : isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.025)",
          color: disabled ? "var(--text-muted)" : "var(--text)",
          fontFamily: "DM Sans, sans-serif",
          fontSize: 14,
          outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          cursor: disabled ? "not-allowed" : "text",
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = hasError
              ? "#ef4444"
              : "var(--accent)";
            e.currentTarget.style.boxShadow = hasError
              ? "0 0 0 3px rgba(239,68,68,0.1)"
              : "0 0 0 3px rgba(255,107,0,0.1)";
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = hasError
            ? "#ef4444"
            : isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.1)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {error && (
        <p
          style={{
            fontSize: 11.5,
            color: "#ef4444",
            fontFamily: "DM Sans, sans-serif",
            margin: "4px 0 0",
          }}
        >
          ✕ {error}
        </p>
      )}
      {hint && !error && (
        <p
          style={{
            fontSize: 11.5,
            color: "var(--text-muted)",
            fontFamily: "DM Sans, sans-serif",
            margin: "4px 0 0",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DOC CARD — upload PAN / Aadhaar front / Aadhaar back
   Calls POST /api/creator/upload-kyc-doc (multipart)
════════════════════════════════════════════════════════════ */
function DocCard({
  label,
  sublabel,
  file,
  url,
  onFile,
  uploading,
}: {
  label: string;
  sublabel: string;
  file: File | null;
  url: string;
  onFile: (f: File) => void;
  uploading: boolean;
}) {
  const { isDark } = useTheme();
  const ref = useRef<HTMLInputElement>(null);
  const has = !!url;

  const handleFile = (f: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (f.size > maxSize) {
      alert("File must be less than 5MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(f.type)) {
      alert("Only JPG, PNG, or PDF files allowed");
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
      style={{
        padding: "14px",
        borderRadius: 14,
        cursor: uploading ? "wait" : "pointer",
        background: isDark
          ? "rgba(255,255,255,0.03)"
          : "rgba(0,0,0,0.02)",
        border: has
          ? "1px solid rgba(52,211,153,0.35)"
          : isDark
          ? "1px dashed rgba(255,255,255,0.1)"
          : "1px dashed rgba(0,0,0,0.1)",
        transition: "all 0.18s",
      }}
    >
      <input
        ref={ref}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <motion.div
          animate={uploading ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.6, repeat: Infinity }}
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            flexShrink: 0,
            background: has
              ? "rgba(52,211,153,0.1)"
              : isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.04)",
            border: has ? "1px solid rgba(52,211,153,0.25)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {uploading ? (
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "2px solid var(--accent)",
                borderTopColor: "transparent",
                animation: "spin 0.7s linear infinite",
              }}
            />
          ) : has ? (
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
        </motion.div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: "var(--text)",
              margin: "0 0 2px",
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: 11.5,
              color: has ? "#34d399" : "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {has ? file?.name ?? "Uploaded ✓" : sublabel}
          </p>
        </div>
        {!has && !uploading && (
          <span
            style={{
              fontSize: 11,
              color: "#ff8800",
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              flexShrink: 0,
              padding: "3px 8px",
              borderRadius: 6,
              background: "rgba(255,136,0,0.1)",
              border: "1px solid rgba(255,136,0,0.2)",
            }}
          >
            Upload
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   OTP INPUT BOXES
════════════════════════════════════════════════════════════ */
function OtpBoxes({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const { isDark } = useTheme();
  const refsArr = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const handle = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const arr = value.split("");
    arr[i] = v;
    onChange(arr.join("").slice(0, 6));
    if (v && i < 5) refsArr[i + 1]?.current?.focus();
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          margin: "24px 0",
          flexWrap: "wrap",
        }}
      >
        {digits.map((d, i) => (
          <motion.input
            key={i}
            ref={refsArr[i]}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handle(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !value[i] && i > 0) {
                refsArr[i - 1]?.current?.focus();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, 6);
              onChange(pasted);
              const focusIdx = Math.min(pasted.length, 5);
              refsArr[focusIdx]?.current?.focus();
            }}
            whileFocus={{ scale: 1.08 }}
            style={{
              width: 48,
              height: 56,
              textAlign: "center",
              fontSize: 22,
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              borderRadius: 14,
              border: error
                ? "2px solid #ef4444"
                : d
                ? "2px solid var(--accent)"
                : isDark
                ? "2px solid rgba(255,255,255,0.1)"
                : "2px solid rgba(0,0,0,0.1)",
              background: isDark
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.025)",
              color: "var(--text)",
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
              caretColor: "var(--accent)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(255,107,0,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error
                ? "#ef4444"
                : d
                ? "var(--accent)"
                : isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        ))}
      </div>
      {error && (
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#ef4444",
            fontFamily: "DM Sans, sans-serif",
            margin: "0 0 12px",
          }}
        >
          ✕ {error}
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   STEP 0 — INTRO / TERMS
════════════════════════════════════════════════════════════ */
function IntroStep({ onAccept }: { onAccept: () => void }) {
  const { isDark } = useTheme();
  const [agreed, setAgreed] = useState(false);

  const benefits = [
    {
      icon: "🚀",
      title: "Launch Campaigns",
      desc: "Create and manage crowdfunding projects",
    },
    {
      icon: "💰",
      title: "Receive Funds",
      desc: "Get payouts directly to your bank account",
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      desc: "Track your campaign performance in real-time",
    },
    {
      icon: "🤝",
      title: "Community Access",
      desc: "Connect with backers and supporters",
    },
  ];

  const steps = [
    { num: "1", label: "Verify Email", desc: "OTP sent to your email" },
    { num: "2", label: "Submit KYC", desc: "PAN, Aadhaar & bank details" },
    { num: "3", label: "Get Approved", desc: "Usually within 24-48 hours" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
          style={{ fontSize: 52, marginBottom: 16 }}
        >
          🔥
        </motion.div>
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: "var(--text)",
            margin: "0 0 8px",
            letterSpacing: "-0.02em",
          }}
        >
          Become a Creator
        </h2>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            color: "var(--text-muted)",
            margin: 0,
            lineHeight: 1.7,
            maxWidth: 400,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Launch campaigns, raise funds from thousands of backers, and turn your
          ideas into reality.
        </p>
      </div>

      {/* Benefits */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 28,
        }}
        className="creator-benefits-grid"
      >
        {benefits.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            style={{
              padding: "16px",
              borderRadius: 14,
              background: isDark
                ? "rgba(255,255,255,0.03)"
                : "rgba(0,0,0,0.02)",
              border: isDark
                ? "1px solid rgba(255,255,255,0.06)"
                : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>{b.icon}</div>
            <p
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--text)",
                margin: "0 0 4px",
              }}
            >
              {b.title}
            </p>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                color: "var(--text-muted)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {b.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Process steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 28,
          justifyContent: "center",
        }}
      >
        {steps.map((s, i) => (
          <div
            key={s.num}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "14px 8px",
              borderRadius: 14,
              background: isDark
                ? "rgba(255,255,255,0.03)"
                : "rgba(0,0,0,0.02)",
              border: isDark
                ? "1px solid rgba(255,255,255,0.06)"
                : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(255,107,0,0.12)",
                color: "#ff6b00",
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px",
              }}
            >
              {s.num}
            </div>
            <p
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--text)",
                margin: "0 0 2px",
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 11,
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              {s.desc}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Terms checkbox */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          padding: "14px 16px",
          borderRadius: 14,
          background: isDark
            ? "rgba(255,255,255,0.03)"
            : "rgba(0,0,0,0.02)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.06)",
          marginBottom: 20,
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              marginTop: 3,
              accentColor: "#ff6b00",
              width: 16,
              height: 16,
              cursor: "pointer",
            }}
          />
          <span
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}
          >
            I agree to CrowdSpark's{" "}
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>
              Creator Terms
            </span>{" "}
            and{" "}
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>
              Privacy Policy
            </span>
            . I understand that my KYC documents will be verified before I can
            create campaigns.
          </span>
        </label>
      </motion.div>

      <div style={{ textAlign: "center" }}>
        <FireBtn
          label="Get Started 🚀"
          onClick={onAccept}
          disabled={!agreed}
          size="lg"
        />
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   STEP 1 — OTP VERIFICATION
   Backend: POST /api/creator/send-otp   (authenticated)
            POST /api/creator/verify-otp  (authenticated)
   After verify-otp succeeds, backend adds CREATOR role
   and sets kycStatus = PENDING_SUBMISSION
════════════════════════════════════════════════════════════ */
function OtpStep({
  onVerified,
  onBack,
}: {
  onVerified: () => void;
  onBack: () => void;
}) {
  const { user } = useProfile();
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const show = (
    msg: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ msg, type });
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // POST /api/creator/send-otp
  // Backend generates 6-digit OTP, emails it. Valid 10 min.
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

  // POST /api/creator/verify-otp  { "otp": "123456" }
  // On success: CREATOR role added, kycStatus → PENDING_SUBMISSION
  // CRITICAL: parent must call refetch() so JWT/cookie reflects new role
  const verify = async () => {
    if (otp.length !== 6) {
      setOtpError("Enter the complete 6-digit OTP");
      return;
    }
    setVerifying(true);
    try {
      await creatorApi.verifyOtp(otp);
      show("Verified! Proceeding to KYC…", "success");
      setTimeout(onVerified, 800);
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
            width: 64,
            height: 64,
            borderRadius: 20,
            background: "rgba(255,107,0,0.1)",
            border: "1px solid rgba(255,107,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            margin: "0 auto 16px",
          }}
        >
          📧
        </motion.div>
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: "var(--text)",
            margin: "0 0 8px",
            letterSpacing: "-0.02em",
          }}
        >
          Verify your email
        </h2>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            color: "var(--text-muted)",
            margin: 0,
            lineHeight: 1.7,
          }}
        >
          We'll send a 6-digit OTP to{" "}
          <strong style={{ color: "var(--text)" }}>{user?.email}</strong>
        </p>
      </div>

      {!sent ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: "center" }}
        >
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13.5,
              color: "var(--text-muted)",
              marginBottom: 24,
              lineHeight: 1.7,
            }}
          >
            We need to verify your email address before you can submit KYC
            documents. This OTP is valid for 10 minutes.
          </p>
          <FireBtn
            label="Send OTP to my email"
            onClick={sendOtp}
            loading={sending}
            size="lg"
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(0,245,212,0.07)",
              border: "1px solid rgba(0,245,212,0.2)",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="#00f5d4"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12.5,
                color: "#00f5d4",
                margin: 0,
              }}
            >
              OTP sent! Check your inbox and spam folder.
            </p>
          </motion.div>

          <OtpBoxes value={otp} onChange={setOtp} error={otpError} />

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <FireBtn
              label="Verify OTP"
              onClick={verify}
              loading={verifying}
              disabled={otp.length < 6}
            />
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
          display: "block",
          margin: "24px auto 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
        }}
      >
        ← Back to terms
      </motion.button>
      <AnimatePresence>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   STEP 2 — KYC DOCUMENT SUBMISSION
   Backend flow:
     1. POST /api/creator/upload-kyc-doc (multipart, 3x calls)
        → returns { secure_url, public_id } per doc
     2. POST /api/creator/submit-kyc (JSON: KycSubmitRequest)
        → validates all fields (PAN regex, Aadhaar regex, IFSC, UPI)
        → sets kycStatus = PENDING_APPROVAL
        → returns KycStatusResponse
   
   Guards in backend:
     - Must have CREATOR role (else 403)
     - kycStatus must be PENDING_SUBMISSION or REJECTED
     - Blocks if APPROVED or PENDING_APPROVAL
════════════════════════════════════════════════════════════ */
function KycStep({
  onSubmitted,
  onBack,
}: {
  onSubmitted: (d: KycStatusResponse) => void;
  onBack: () => void;
}) {
  const { isDark } = useTheme();
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const show = (
    msg: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ msg, type });
  };

  const [tab, setTab] = useState<"docs" | "identity" | "bank">("docs");

  // Document upload state — each calls POST /api/creator/upload-kyc-doc
  const [panUrl, setPanUrl] = useState("");
  const [panPid, setPanPid] = useState("");
  const [panFile, setPanFile] = useState<File | null>(null);
  const [afUrl, setAfUrl] = useState("");
  const [afPid, setAfPid] = useState("");
  const [afFile, setAfFile] = useState<File | null>(null);
  const [abUrl, setAbUrl] = useState("");
  const [abPid, setAbPid] = useState("");
  const [abFile, setAbFile] = useState<File | null>(null);
  const [uploadingDoc, setUD] = useState<"pan" | "af" | "ab" | null>(null);

  // Identity fields — validated by backend with regex:
  // PAN: [A-Z]{5}[0-9]{4}[A-Z]{1}
  // Aadhaar: \d{4}-\d{4}-\d{4}
  const [panNumber, setPanNumber] = useState("");
  const [aadhaarNum, setAadhaarNum] = useState("");

  // Bank fields — validated by backend:
  // IFSC: ^[A-Z]{4}0[A-Z0-9]{6}$
  // UPI: ^[\w.\-_]+@[a-zA-Z]+$
  // bankBranchName is optional (no @NotBlank)
  const [acHolder, setAcHolder] = useState("");
  const [acNumber, setAcNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [upiId, setUpiId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Upload single doc to Cloudinary via backend
  const uploadDoc = async (file: File, type: "pan" | "af" | "ab") => {
    setUD(type);
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
      show(
        `${
          type === "pan"
            ? "PAN card"
            : type === "af"
            ? "Aadhaar front"
            : "Aadhaar back"
        } uploaded!`
      );
    } catch (e: any) {
      show(e.message ?? "Upload failed", "error");
    } finally {
      setUD(null);
    }
  };

  // Client-side validation matching backend regex exactly
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
      errors.ifsc = "Invalid IFSC code (e.g. HDFC0001234)";
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

  // POST /api/creator/submit-kyc — sends KycSubmitRequest JSON
  // Backend sets kycStatus → PENDING_APPROVAL and returns KycStatusResponse
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
        panNumber,
        panCardImageUrl: panUrl,
        panCardImagePublicId: panPid,
        aadhaarNumber: aadhaarNum,
        aadhaarFrontImageUrl: afUrl,
        aadhaarFrontPublicId: afPid,
        aadhaarBackImageUrl: abUrl,
        aadhaarBackPublicId: abPid,
        bankAccountHolderName: acHolder,
        bankAccountNumber: acNumber,
        bankIfscCode: ifsc,
        bankName,
        bankBranchName: branch || undefined,
        upiId,
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
  const bankOk =
    !!acHolder && !!acNumber && !!ifsc && !!bankName && !!upiId;

  const TABS = [
    { key: "docs" as const, label: "Documents", ok: docsOk },
    { key: "identity" as const, label: "Identity", ok: identityOk },
    { key: "bank" as const, label: "Bank", ok: bankOk },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: "var(--text)",
            margin: "0 0 6px",
            letterSpacing: "-0.02em",
          }}
        >
          Submit KYC Documents
        </h2>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13.5,
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          Complete all three sections to submit for review.
        </p>
      </div>

      {/* Tab bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          padding: "4px",
          borderRadius: 14,
          background: isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(0,0,0,0.04)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {TABS.map((t) => (
          <motion.button
            key={t.key}
            onClick={() => setTab(t.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              background:
                tab === t.key
                  ? isDark
                    ? "rgba(255,255,255,0.08)"
                    : "#fff"
                  : "transparent",
              color:
                tab === t.key ? "var(--text)" : "var(--text-muted)",
            }}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow:
                tab === t.key
                  ? isDark
                    ? "0 2px 8px rgba(0,0,0,0.3)"
                    : "0 2px 8px rgba(0,0,0,0.08)"
                  : "none",
            }}
          >
            {t.ok && (
              <svg
                width="12"
                height="12"
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
            {t.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Documents tab */}
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
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(0,245,212,0.06)",
                border: "1px solid rgba(0,245,212,0.15)",
                marginBottom: 4,
              }}
            >
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 12.5,
                  color: "var(--text-muted)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Upload clear photos or scans. Accepted formats: JPG, PNG, PDF.
                Max 5MB each. Make sure all text is clearly readable.
              </p>
            </div>
            <DocCard
              label="PAN Card"
              sublabel="Front side — must be clearly visible"
              file={panFile}
              url={panUrl}
              uploading={uploadingDoc === "pan"}
              onFile={(f) => uploadDoc(f, "pan")}
            />
            <DocCard
              label="Aadhaar Front"
              sublabel="Front side with name & photo"
              file={afFile}
              url={afUrl}
              uploading={uploadingDoc === "af"}
              onFile={(f) => uploadDoc(f, "af")}
            />
            <DocCard
              label="Aadhaar Back"
              sublabel="Back side with address"
              file={abFile}
              url={abUrl}
              uploading={uploadingDoc === "ab"}
              onFile={(f) => uploadDoc(f, "ab")}
            />
            <div style={{ marginTop: 8 }}>
              <FireBtn
                label="Next: Identity Details →"
                onClick={() => setTab("identity")}
                disabled={!docsOk}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Identity tab */}
      <AnimatePresence mode="wait">
        {tab === "identity" && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 20,
              }}
              className="kyc-grid"
            >
              <Input
                label="PAN Number"
                value={panNumber}
                onChange={setPanNumber}
                placeholder="ABCDE1234F"
                maxLength={10}
                hint="5 letters · 4 digits · 1 letter"
                error={formErrors.panNumber}
              />
              <Input
                label="Aadhaar Number"
                value={aadhaarNum}
                onChange={setAadhaarNum}
                placeholder="XXXX-XXXX-XXXX"
                maxLength={14}
                hint="Format: XXXX-XXXX-XXXX"
                error={formErrors.aadhaarNum}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <FireBtn
                label="Next: Bank Details →"
                onClick={() => setTab("bank")}
                disabled={!identityOk}
              />
              <FireBtn
                label="← Back"
                onClick={() => setTab("docs")}
                variant="outline"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bank tab */}
      <AnimatePresence mode="wait">
        {tab === "bank" && (
          <motion.div
            key="bank"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 20,
              }}
              className="kyc-grid"
            >
              <Input
                label="Account Holder Name"
                value={acHolder}
                onChange={setAcHolder}
                placeholder="As on bank account"
                error={formErrors.acHolder}
              />
              <Input
                label="Account Number"
                value={acNumber}
                onChange={setAcNumber}
                placeholder="Enter account number"
                type="password"
                error={formErrors.acNumber}
              />
              <Input
                label="IFSC Code"
                value={ifsc}
                onChange={setIfsc}
                placeholder="HDFC0001234"
                maxLength={11}
                hint="11-character code"
                error={formErrors.ifsc}
              />
              <Input
                label="Bank Name"
                value={bankName}
                onChange={setBankName}
                placeholder="HDFC Bank"
                error={formErrors.bankName}
              />
              <Input
                label="Branch Name"
                value={branch}
                onChange={setBranch}
                placeholder="Andheri West (optional)"
              />
              <Input
                label="UPI ID"
                value={upiId}
                onChange={setUpiId}
                placeholder="yourname@upi"
                hint="Used for quick payouts"
                error={formErrors.upiId}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(255,107,0,0.06)",
                border: "1px solid rgba(255,107,0,0.15)",
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 12.5,
                  color: "var(--text-muted)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                🔒 Your banking information is encrypted and stored securely. It
                is used only for processing payouts and will never be shared
                with third parties.
              </p>
            </motion.div>

            <div
              style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
            >
              <FireBtn
                label={
                  submitting
                    ? "Submitting…"
                    : "Submit KYC for Review 🚀"
                }
                onClick={submit}
                loading={submitting}
                size="lg"
                disabled={!bankOk}
              />
              <FireBtn
                label="← Back"
                onClick={() => setTab("identity")}
                variant="outline"
              />
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
          display: "block",
          marginTop: 20,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
        }}
      >
        ← Back to OTP
      </motion.button>
      <AnimatePresence>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   STEP 3 — SUBMISSION COMPLETE
════════════════════════════════════════════════════════════ */
function DoneStep({ kycData }: { kycData: KycStatusResponse | null }) {
  const router = useRouter();

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
        style={{
          position: "relative",
          width: 80,
          height: 80,
          margin: "0 auto 24px",
        }}
      >
        <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            strokeWidth="4"
            stroke="rgba(52,211,153,0.2)"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            strokeWidth="4"
            stroke="#34d399"
            strokeDasharray={2 * Math.PI * 34}
            strokeLinecap="round"
            initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
          }}
        >
          🎉
        </div>
      </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 24,
                color: "var(--text)",
                margin: "0 0 12px",
                letterSpacing: "-0.02em",
              }}
            >
              KYC Submitted Successfully! 🎉
            </motion.h2>
      
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                color: "var(--text-muted)",
                marginBottom: 28,
                lineHeight: 1.7,
                maxWidth: 420,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Your documents have been submitted for review. We'll verify and approve
              your creator account within 24-48 hours. You'll receive an email
              notification once approved.
            </motion.p>
      
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <FireBtn
                label="Go to Dashboard"
                onClick={() => router.push("/dashboard")}
                size="lg"
              />
            </div>
          </motion.div>
        );
      }
      
      /* ════════════════════════════════════════════════════════════
         MAIN PAGE COMPONENT
      ════════════════════════════════════════════════════════════ */
      export default function BecomeCreatorPage() {
        const { user, refetch } = useProfile();
        const [step, setStep] = useState<"intro" | "otp" | "kyc" | "done">("intro");
        const [kycData, setKycData] = useState<KycStatusResponse | null>(null);
      
        return (
          <div style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
            <AnimatePresence mode="wait">
              {step === "intro" && (
                <IntroStep
                  onAccept={() => setStep("otp")}
                  key="intro"
                />
              )}
              {step === "otp" && (
                <OtpStep
                  onVerified={() => {
                    refetch();
                    setStep("kyc");
                  }}
                  onBack={() => setStep("intro")}
                  key="otp"
                />
              )}
              {step === "kyc" && (
                <KycStep
                  onSubmitted={(d) => {
                    setKycData(d);
                    setStep("done");
                  }}
                  onBack={() => setStep("otp")}
                  key="kyc"
                />
              )}
              {step === "done" && (
                <DoneStep kycData={kycData} key="done" />
              )}
            </AnimatePresence>
          </div>
        );
      }
          