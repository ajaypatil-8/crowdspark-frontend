"use client";
import { useState, useRef, useEffect, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import TotpSetupSection from "@/components/dashboard/TotpSetupSection";
import {
  authApi, creatorApi, tokenStorage,
  type KycStatusResponse, type KycStatus,
  gdprApi,
} from "@/lib/api";

type WizardStep = "intro" | "otp-sent" | "otp-verified" | "kyc-form" | "submitted" | "approved" | "rejected";

async function safeCall(fn: () => Promise<unknown>): Promise<void> {
  try { await fn(); }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const isJsonError = e instanceof SyntaxError || msg.includes("is not valid JSON") || msg.includes("Unexpected token") || msg.includes("JSON.parse");
    if (!isJsonError) throw e;
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcMail   = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
const IcRocket = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg>);
const IcCard   = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>);
const IcWarn   = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
const IcCheck  = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const IcZap    = ({ s = 24 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>);
const IcClock  = ({ s = 24 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const IcUpload = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>);
const IcLock   = ({ s = 12 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>);
const IcShield = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);

// ─── Section Card ─────────────────────────────────────────────────────────────
function Section({ title, icon, subtitle, children, accentColor = "#ff8800" }: {
  title: string; icon: React.ReactNode; subtitle?: string; children: React.ReactNode; accentColor?: string;
}) {
  const { isDark } = useTheme();
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ borderRadius: 22, overflow: "hidden", marginBottom: 18, background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`, boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)" }}
    >
      <div style={{ padding: "16px 22px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`, background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg,transparent,${accentColor}70,transparent)` }} />
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accentColor}14`, border: `1px solid ${accentColor}25`, display: "flex", alignItems: "center", justifyContent: "center", color: accentColor, flexShrink: 0 }}>{icon}</div>
        <div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: 0 }}>{title}</h2>
          {subtitle && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ padding: 22 }}>{children}</div>
    </motion.section>
  );
}

// ─── SInput ──────────────────────────────────────────────────────────────────
function SInput({ label, value, onChange, placeholder, type = "text", maxLength, disabled, hint, error, required }: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string; type?: string;
  maxLength?: number; disabled?: boolean; hint?: string; error?: string; required?: boolean;
}) {
  const { isDark } = useTheme();
  const fid = useId();
  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={fid} style={{ display: "block", fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 10.5, color: "var(--text-muted)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
      </label>
      <input
        id={fid} type={type} value={value} maxLength={maxLength} disabled={disabled} placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, boxSizing: "border-box" as const, fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", border: `1px solid ${error ? "#ef4444" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: disabled ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)"), color: disabled ? "var(--text-muted)" : "var(--text)", cursor: disabled ? "not-allowed" : "text", transition: "border-color 0.15s, box-shadow 0.15s" }}
        onFocus={e => { if (!disabled) { e.currentTarget.style.borderColor = "rgba(255,107,0,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,0,0.08)"; }}}
        onBlur={e => { e.currentTarget.style.borderColor = error ? "#ef4444" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
      />
      {error && <p role="alert" style={{ fontSize: 11.5, color: "#ef4444", fontFamily: "DM Sans, sans-serif", margin: "5px 0 0" }}>✕ {error}</p>}
      {hint && !error && <p style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: "5px 0 0" }}>{hint}</p>}
    </div>
  );
}

// ─── Buttons ──────────────────────────────────────────────────────────────────
function FireBtn({ label, onClick, loading, disabled, fullWidth }: { label: string; onClick?: () => void; loading?: boolean; disabled?: boolean; fullWidth?: boolean }) {
  const inactive = disabled || loading;
  return (
    <motion.button
      type="button" whileHover={!inactive ? { scale: 1.02 } : {}} whileTap={!inactive ? { scale: 0.98 } : {}}
      onClick={!inactive ? onClick : undefined} disabled={inactive}
      style={{ padding: "12px 24px", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: "Syne, sans-serif", cursor: inactive ? "not-allowed" : "pointer", opacity: inactive ? 0.65 : 1, position: "relative", overflow: "hidden", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: inactive ? "none" : "0 0 20px rgba(255,100,0,0.3)", transition: "opacity 0.18s, box-shadow 0.18s", width: fullWidth ? "100%" : "auto", justifyContent: "center" }}
    >
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "stShimmer 2.4s ease-in-out infinite" }} />
      {loading && <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "stSpin .7s linear infinite", flexShrink: 0, position: "relative" }} />}
      <span style={{ position: "relative" }}>{label}</span>
    </motion.button>
  );
}

function GhostBtn({ label, onClick, disabled }: { label: string; onClick?: () => void; disabled?: boolean }) {
  const { isDark } = useTheme();
  return (
    <button type="button" onClick={!disabled ? onClick : undefined} disabled={disabled}
      style={{ padding: "12px 24px", background: "none", color: "var(--text-muted)", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`, borderRadius: 12, fontSize: 14, fontFamily: "DM Sans, sans-serif", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, transition: "all 0.15s" }}
    >{label}</button>
  );
}

// ─── Doc Card ─────────────────────────────────────────────────────────────────
function DocCard({ label, sublabel, file, url, onFile, onError, uploading }: {
  label: string; sublabel: string; file: File | null; url: string; onFile: (f: File) => void; onError: (msg: string) => void; uploading: boolean;
}) {
  const { isDark } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const has = !!url;

  const handleFile = useCallback((f: File) => {
    if (f.size > 5 * 1024 * 1024) { onError("Max 5MB"); return; }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(f.type)) { onError("JPG, PNG or PDF only"); return; }
    onFile(f);
  }, [onFile, onError]);

  return (
    <motion.div
      role="button" tabIndex={0}
      whileHover={{ scale: 1.01 }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      style={{ padding: "14px 16px", borderRadius: 14, border: `1px solid ${has ? "rgba(52,211,153,0.35)" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`, background: has ? "rgba(52,211,153,0.05)" : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)", cursor: uploading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s", boxShadow: has ? "0 0 16px rgba(52,211,153,0.1)" : "none" }}
    >
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,application/pdf" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }} />
      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: has ? "rgba(52,211,153,0.12)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: has ? "#34d399" : "var(--text-muted)", border: has ? "1px solid rgba(52,211,153,0.25)" : "none" }}>
        {uploading ? <span style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "stSpin .7s linear infinite", display: "block" }} /> : has ? <IcCheck s={15} /> : <IcUpload s={15} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color: "var(--text)", margin: 0 }}>{label}</p>
        <p style={{ fontSize: 11.5, color: has ? "#34d399" : "var(--text-muted)", margin: "2px 0 0", fontFamily: "DM Sans, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {has ? (file?.name ?? "Uploaded ✓") : sublabel}
        </p>
      </div>
      {!has && !uploading && <span style={{ fontSize: 11.5, fontFamily: "DM Sans, sans-serif", fontWeight: 600, color: "#ff8800", flexShrink: 0 }}>Upload</span>}
    </motion.div>
  );
}

// ─── Step Dots ────────────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  const { isDark } = useTheme();
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 20 }}>
      {Array.from({ length: total }, (_, i) => (
        <motion.div key={i} animate={{ width: i === current ? 24 : 8 }} transition={{ duration: 0.3 }}
          style={{ height: 3, borderRadius: 2, background: i <= current ? "linear-gradient(90deg,#ff6b00,#ffcc00)" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
      ))}
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", marginLeft: 4 }}>Step {current + 1}/{total}</span>
    </div>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OtpInput({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const { isDark } = useTheme();
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const handle = useCallback((i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = value.split("");
    next[i] = v;
    onChange(next.join("").slice(0, 6));
    if (v && i < 5) refs[i + 1]?.current?.focus();
  }, [value, onChange]);

  const handleKey = useCallback((i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs[i - 1]?.current?.focus();
  }, [value]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p) { e.preventDefault(); onChange(p); refs[Math.min(p.length, 5)]?.current?.focus(); }
  }, [onChange]);

  return (
    <div>
      <div style={{ display: "flex", gap: 9, marginBottom: error ? 10 : 20, justifyContent: "center" }}>
        {digits.map((d, i) => (
          <input key={i} ref={refs[i]} type="tel" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handle(i, e.target.value)} onKeyDown={e => handleKey(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            style={{ width: 50, height: 58, textAlign: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, borderRadius: 14, outline: "none", transition: "all 0.15s", border: `1.5px solid ${error ? "#ef4444" : d ? isDark ? "rgba(255,107,0,0.6)" : "rgba(255,107,0,0.5)" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: d ? isDark ? "rgba(255,107,0,0.1)" : "rgba(255,107,0,0.06)" : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)", color: d ? "#ff8800" : "var(--text)", boxShadow: d ? "0 0 12px rgba(255,107,0,0.25)" : "none" }}
          />
        ))}
      </div>
      {error && <p role="alert" style={{ fontSize: 12.5, color: "#ef4444", fontFamily: "DM Sans, sans-serif", margin: "0 0 14px", textAlign: "center" }}>✕ {error}</p>}
    </div>
  );
}

// ─── KYC Form ─────────────────────────────────────────────────────────────────
function KycFormStep({ onSubmitted, onBack, showToast }: { onSubmitted: (d: KycStatusResponse) => void; onBack: () => void; showToast: (msg: string, type: "success" | "error" | "info") => void }) {
  const [pan, setPan] = useState(""); const [aadhaar, setAadhaar] = useState("");
  const [acHolder, setAcHolder] = useState(""); const [acNumber, setAcNumber] = useState("");
  const [ifsc, setIfsc] = useState(""); const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState(""); const [upiId, setUpiId] = useState("");
  const [panUrl, setPanUrl] = useState(""); const [panPid, setPanPid] = useState(""); const [panFile, setPanFile] = useState<File | null>(null);
  const [afUrl, setAfUrl] = useState(""); const [afPid, setAfPid] = useState(""); const [afFile, setAfFile] = useState<File | null>(null);
  const [abUrl, setAbUrl] = useState(""); const [abPid, setAbPid] = useState(""); const [abFile, setAbFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<"pan" | "af" | "ab" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [totpEnabled, setTotpEnabled] = useState<boolean>(false);

  const uploadDoc = useCallback(async (file: File, type: "pan" | "af" | "ab") => {
    setUploadingDoc(type);
    try {
      const r = await creatorApi.uploadKycDoc(file);
      if (type === "pan") { setPanUrl(r.secure_url); setPanPid(r.public_id); setPanFile(file); }
      if (type === "af")  { setAfUrl(r.secure_url);  setAfPid(r.public_id);  setAfFile(file); }
      if (type === "ab")  { setAbUrl(r.secure_url);  setAbPid(r.public_id);  setAbFile(file); }
      showToast(`${{ pan: "PAN", af: "Aadhaar Front", ab: "Aadhaar Back" }[type]} uploaded!`, "success");
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Upload failed", "error"); }
    finally { setUploadingDoc(null); }
  }, [showToast]);

  const submit = useCallback(async () => {
    if (!panUrl || !afUrl || !abUrl) { showToast("Upload all 3 documents first", "error"); return; }
    const e: Record<string, string> = {};
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) e.pan = "Invalid PAN (e.g. ABCDE1234F)";
    if (!/^\d{4}-\d{4}-\d{4}$/.test(aadhaar)) e.aadhaar = "Format: XXXX-XXXX-XXXX";
    if (!acHolder.trim()) e.acHolder = "Required";
    if (!acNumber.trim()) e.acNumber = "Required";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) e.ifsc = "Invalid IFSC";
    if (!bankName.trim()) e.bankName = "Required";
    if (!branch.trim()) e.branch = "Required";
    if (!/^[\w.\-_]+@[a-zA-Z]+$/.test(upiId)) e.upiId = "Invalid UPI ID";
    if (Object.keys(e).length > 0) { setErrs(e); showToast("Fix the errors below", "error"); return; }
    setSubmitting(true);
    try {
      const data = await creatorApi.submitKyc({ panNumber: pan, panCardImageUrl: panUrl, panCardImagePublicId: panPid, aadhaarNumber: aadhaar, aadhaarFrontImageUrl: afUrl, aadhaarFrontPublicId: afPid, aadhaarBackImageUrl: abUrl, aadhaarBackPublicId: abPid, bankAccountHolderName: acHolder, bankAccountNumber: acNumber, bankIfscCode: ifsc, bankName, bankBranchName: branch, upiId });
      onSubmitted(data);
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Submission failed", "error"); }
    finally { setSubmitting(false); }
  }, [panUrl, afUrl, abUrl, pan, aadhaar, acHolder, acNumber, ifsc, bankName, branch, upiId, panPid, afPid, abPid, showToast, onSubmitted]);

  const { isDark } = useTheme();
  return (
    <div>
      <StepDots current={1} total={3} />
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 14px" }}>1. Upload documents</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        <DocCard label="PAN Card" sublabel="Front — JPG, PNG or PDF" file={panFile} url={panUrl} uploading={uploadingDoc === "pan"} onFile={f => uploadDoc(f, "pan")} onError={msg => showToast(msg, "error")} />
        <DocCard label="Aadhaar Front" sublabel="Front side of Aadhaar" file={afFile} url={afUrl} uploading={uploadingDoc === "af"} onFile={f => uploadDoc(f, "af")} onError={msg => showToast(msg, "error")} />
        <DocCard label="Aadhaar Back" sublabel="Back side of Aadhaar" file={abFile} url={abUrl} uploading={uploadingDoc === "ab"} onFile={f => uploadDoc(f, "ab")} onError={msg => showToast(msg, "error")} />
      </div>
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 14px" }}>2. Identity & Bank details</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }} className="kyc-grid">
        <SInput label="PAN Number" value={pan} onChange={v => setPan(v.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} error={errs.pan} required />
        <SInput label="Aadhaar" value={aadhaar} onChange={v => { let r = v.replace(/\D/g, "").slice(0, 12); r = r.replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) => c ? `${a}-${b}-${c}` : b ? `${a}-${b}` : a); setAadhaar(r); }} placeholder="XXXX-XXXX-XXXX" maxLength={14} error={errs.aadhaar} required />
        <SInput label="Account Holder" value={acHolder} onChange={setAcHolder} placeholder="Full name" error={errs.acHolder} required />
        <SInput label="Account Number" value={acNumber} onChange={setAcNumber} placeholder="Account number" type="password" error={errs.acNumber} required />
        <SInput label="IFSC Code" value={ifsc} onChange={v => setIfsc(v.toUpperCase())} placeholder="HDFC0001234" maxLength={11} error={errs.ifsc} required />
        <SInput label="Bank Name" value={bankName} onChange={setBankName} placeholder="HDFC Bank" error={errs.bankName} required />
        <SInput label="Branch Name" value={branch} onChange={setBranch} placeholder="Andheri West" error={errs.branch} required />
        <SInput label="UPI ID" value={upiId} onChange={setUpiId} placeholder="name@upi" hint="Format: name@upi" error={errs.upiId} required />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, marginBottom: 18, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
        <IcLock s={12} /><IcShield s={12} />
        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)" }}>All documents encrypted & stored securely</span>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <FireBtn label={submitting ? "Submitting…" : "Submit KYC"} onClick={submit} loading={submitting} disabled={!panUrl || !afUrl || !abUrl} />
        <GhostBtn label="← Back" onClick={onBack} />
      </div>
    </div>
  );
}

// ─── Become Creator Wizard ────────────────────────────────────────────────────
function BecomeCreatorWizard() {
  const { user, refetch } = useProfile();
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = useCallback((msg: string, type: "success" | "error" | "info" = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); }, []);
  useEffect(() => { setMounted(true); }, []);

  const isCreator = user?.roles?.includes("CREATOR");
  const kycStatus = (user?.kycStatus ?? "NOT_SUBMITTED") as KycStatus;
  const [kycData, setKycData] = useState<KycStatusResponse | null>(null);
  const [step, setStep] = useState<WizardStep>("intro");
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    if (isCreator || kycStatus === "APPROVED") setStep("approved");
    else if (kycStatus === "PENDING_APPROVAL") setStep("submitted");
    else if (kycStatus === "REJECTED") setStep("rejected");
    else if (kycStatus === "PENDING_SUBMISSION") setStep("otp-verified");
    else setStep("intro");
  }, [kycStatus, isCreator]);

  useEffect(() => {
    if (isCreator || kycStatus === "APPROVED" || kycStatus === "PENDING_APPROVAL") {
      creatorApi.kycStatus().then(setKycData).catch(() => {});
    }
  }, [isCreator, kycStatus]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendOtp = useCallback(async () => {
    setOtpSending(true);
    try { await safeCall(() => creatorApi.sendOtp()); showToast("OTP sent to your email", "success"); setStep("otp-sent"); setCooldown(60); }
    catch (e: unknown) { showToast(e instanceof Error ? e.message : "Failed to send OTP", "error"); }
    finally { setOtpSending(false); }
  }, [showToast]);

  const verifyOtp = useCallback(async () => {
    if (otp.length !== 6) { setOtpError("Enter the 6-digit OTP"); return; }
    setOtpVerifying(true);
    try {
      await safeCall(() => creatorApi.verifyOtp(otp));
      const rt = tokenStorage.getRefresh();
      if (rt) { try { await authApi.refresh(rt); } catch {} }
      showToast("Email verified! Submit KYC docs.", "success"); await refetch(); setStep("otp-verified"); setOtpError("");
    } catch (e: unknown) { setOtpError(e instanceof Error ? e.message : "Invalid OTP"); }
    finally { setOtpVerifying(false); }
  }, [otp, showToast, refetch]);

  const handleKycSubmitted = useCallback(async (data: KycStatusResponse) => {
    setKycData(data); await refetch(); showToast("KYC submitted! Review takes 24–48 hours.", "success"); setStep("submitted");
  }, [refetch, showToast]);

  if (!mounted) return null;
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  const ToastBanner = () => toast ? (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      style={{ marginTop: 14, padding: "11px 16px", borderRadius: 12, background: toast.type === "error" ? "rgba(239,68,68,0.07)" : "rgba(52,211,153,0.07)", border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.2)" : "rgba(52,211,153,0.2)"}`, color: toast.type === "error" ? "#ef4444" : "#34d399", fontFamily: "DM Sans, sans-serif", fontSize: 13 }}>
      {toast.msg}
    </motion.div>
  ) : null;

  if (step === "approved") return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}><IcZap s={24} /></div>
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: "#34d399", margin: "0 0 6px" }}>Verified Creator</p>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 18px" }}>Your KYC is approved. You can launch campaigns.</p>
      {kycData && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "left" }}>
          {([["PAN", kycData.panNumber], ["Bank", kycData.bankName], ["Account", kycData.maskedBankAccount], ["IFSC", kycData.bankIfscCode], ["UPI", kycData.upiId]] as [string, string|undefined][]).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ padding: "10px 14px", borderRadius: 12, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1px solid ${bdr}` }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, color: "var(--text-muted)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.07em" }}>{k}</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text)", margin: 0, fontWeight: 600 }}>{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (step === "submitted") return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa" }}><IcClock s={24} /></div>
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: "#a78bfa", margin: "0 0 6px" }}>Under Review</p>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "0 auto", maxWidth: 320, lineHeight: 1.75 }}>Our team is reviewing your documents. Usually 24–48 hours.</p>
      {kycData?.submittedAt && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: "14px 0 0" }}>Submitted: {new Date(kycData.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>}
    </div>
  );

  if (step === "rejected") return (
    <div>
      <div style={{ padding: "14px 18px", borderRadius: 14, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 18 }}>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#ef4444", margin: "0 0 4px" }}>❌ KYC Rejected</p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Reason: <span style={{ color: "#ef4444" }}>{kycData?.rejectionReason ?? "Contact support."}</span></p>
      </div>
      <FireBtn label="Resubmit KYC" onClick={() => setStep("kyc-form")} />
    </div>
  );

  if (step === "kyc-form") return <KycFormStep onSubmitted={handleKycSubmitted} onBack={() => setStep("otp-verified")} showToast={showToast} />;

  if (step === "intro") return (
    <div>
      <StepDots current={0} total={3} />
      <div style={{ padding: "18px 20px", borderRadius: 16, background: "linear-gradient(135deg,rgba(255,107,0,0.08),rgba(255,204,0,0.04))", border: "1px solid rgba(255,107,0,0.18)", marginBottom: 22, display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800", flexShrink: 0 }}><IcRocket s={20} /></div>
        <div>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 5px" }}>Become a Creator</p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.65 }}>Launch campaigns and raise funds from thousands of backers.</p>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {[["📧","Verify OTP"],["📄","Submit KYC"],["✅","Get approved"]].map(([e,t]) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{e}</span>
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FireBtn label="Get started →" onClick={sendOtp} loading={otpSending} />
      <AnimatePresence><ToastBanner /></AnimatePresence>
    </div>
  );

  if (step === "otp-sent") return (
    <div>
      <StepDots current={0} total={3} />
      <div style={{ padding: "14px 16px", borderRadius: 14, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)", border: `1px solid ${bdr}`, marginBottom: 22, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ color: "#ff8800", marginTop: 1 }}><IcMail s={16} /></div>
        <div>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13.5, color: "var(--text)", margin: "0 0 3px" }}>Check your inbox</p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0 }}>OTP sent to <strong style={{ color: "var(--text)" }}>{user?.email}</strong></p>
        </div>
      </div>
      <OtpInput value={otp} onChange={setOtp} error={otpError} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <FireBtn label="Verify OTP" onClick={verifyOtp} loading={otpVerifying} />
        <GhostBtn label={cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"} onClick={cooldown > 0 ? undefined : sendOtp} disabled={cooldown > 0} />
      </div>
    </div>
  );

  if (step === "otp-verified") return (
    <div>
      <StepDots current={1} total={3} />
      <div style={{ padding: "14px 18px", borderRadius: 14, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ color: "#34d399" }}><IcCheck s={18} /></div>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "#34d399", margin: 0 }}>Email verified! Submit your KYC documents.</p>
      </div>
      <FireBtn label="Submit KYC Documents →" onClick={() => setStep("kyc-form")} />
    </div>
  );

  return null;
}

// ─── Email Verification ───────────────────────────────────────────────────────
function EmailVerification() {
  const { user } = useProfile();
  const { isDark } = useTheme();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = useCallback(async () => {
    setSending(true);
    try { await safeCall(() => authApi.sendVerificationEmail()); setMsg({ text: "Verification email sent! Check your inbox.", type: "success" }); setSent(true); setCooldown(60); }
    catch (e: unknown) { setMsg({ text: e instanceof Error ? e.message : "Failed to send email", type: "error" }); }
    finally { setSending(false); }
  }, []);

  if (user?.emailVerified) return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
        <IcCheck s={18} />
      </div>
      <div>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#34d399", margin: "0 0 2px" }}>Email verified</p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>{user.email}</p>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}><IcMail s={18} /></div>
        <div>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#f59e0b", margin: "0 0 2px" }}>Email not verified</p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>{user?.email}</p>
        </div>
      </div>
      <AnimatePresence>
        {msg && (
          <motion.div key="msg" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: "11px 16px", borderRadius: 12, background: msg.type === "success" ? "rgba(52,211,153,0.07)" : "rgba(239,68,68,0.07)", border: `1px solid ${msg.type === "success" ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`, marginBottom: 16, color: msg.type === "success" ? "#34d399" : "#ef4444", fontFamily: "DM Sans, sans-serif", fontSize: 13 }}>
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>
      <FireBtn label={cooldown > 0 ? `Resend in ${cooldown}s` : sent ? "Resend email" : "Send verification email"} onClick={cooldown > 0 ? undefined : send} loading={sending} disabled={cooldown > 0} />
    </div>
  );
}

// ─── Account Info ─────────────────────────────────────────────────────────────
function AccountInfo() {
  const { user } = useProfile();
  const { isDark } = useTheme();
  if (!user) return null;

  const maskPhone = (p: string | null | undefined) =>
    !p ? "—" : p.length <= 4 ? p : p.slice(0, p.length - 4).replace(/./g, "•") + p.slice(-4);
  const fmt = (s: string | null | undefined) =>
    !s ? "—" : s.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());

  const rows: [string, string][] = [
    ["Username", `@${user.username}`], ["Email", user.email],
    ["Phone", maskPhone(user.phoneNumber)],
    ["Account", fmt(user.accountStatus)], ["KYC", fmt(user.kycStatus)],
    ["Member since", new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
  ];

  return (
    <dl style={{ margin: 0 }}>
      {rows.map(([k, v], i) => (
        <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < rows.length - 1 ? `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` : undefined }}>
          <dt style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", fontWeight: 500, margin: 0 }}>{k}</dt>
          <dd style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text)", fontWeight: 600, margin: 0, maxWidth: "60%", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

// ─── Danger Zone ──────────────────────────────────────────────────────────────
// FIX: All state declarations, handler functions, and JSX are now correctly
//      placed — state/handlers in the function body, JSX in the return.
function DangerZone() {
  const { isDark } = useTheme();

  // ── State ──────────────────────────────────────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Handlers ───────────────────────────────────────────────────────────────

  /** GDPR Art. 20 — downloads all personal data as a JSON file */
  async function handleExport() {
    try {
      const data = await gdprApi.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `crowdspark-data-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export data. Please try again.");
    }
  }

  /** GDPR Art. 17 — permanently deletes account after password confirmation */
  async function handleDeleteAccount() {
    if (!deletePassword.trim()) {
      setDeleteError("Password is required to confirm deletion");
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await gdprApi.deleteAccount(deletePassword);
      // Wipe all local auth state and redirect to home
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : "Deletion failed. Check your password.");
    } finally {
      setDeleting(false);
    }
  }

  function cancelDelete() {
    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteError(null);
  }

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Download My Data ─────────────────────────────────────────────── */}
      <div style={{ padding: 18, borderRadius: 16, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexShrink: 0 }}>
            <IcShield s={15} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 4px" }}>Download my data</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.65 }}>
              Export all data we hold about you as JSON (GDPR Art. 20 — Right to portability).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExport}
          style={{ padding: "10px 20px", background: "none", color: "var(--text)", border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}`, borderRadius: 11, fontSize: 13.5, fontFamily: "DM Sans, sans-serif", fontWeight: 600, cursor: "pointer", transition: "all 0.18s" }}
        >
          ↓ Download My Data
        </button>
      </div>

      {/* ── Delete Account ────────────────────────────────────────────────── */}
      <div style={{ padding: 18, borderRadius: 16, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.14)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: showDeleteModal ? 16 : 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0 }}>
            <IcWarn s={15} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#ef4444", margin: "0 0 4px" }}>Delete account</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.65 }}>
              Permanently deletes all personal data. Financial records are kept for legal compliance. This cannot be undone.
            </p>
          </div>
        </div>

        {!showDeleteModal ? (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            style={{ marginTop: 14, padding: "10px 20px", background: "none", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 11, fontSize: 13.5, fontFamily: "DM Sans, sans-serif", fontWeight: 600, cursor: "pointer", transition: "all 0.18s" }}
          >
            Delete my account
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text)", margin: "0 0 14px", lineHeight: 1.65 }}>
                ⚠️ This will permanently delete your account and all personal data.
                Enter your current password to confirm.
              </p>
              <SInput
                label="Confirm Password"
                value={deletePassword}
                onChange={setDeletePassword}
                type="password"
                placeholder="Enter your password to confirm"
                error={deleteError ?? undefined}
                required
              />
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  style={{ padding: "10px 20px", background: deleting ? "rgba(239,68,68,0.5)" : "#ef4444", color: "#fff", border: "none", borderRadius: 11, fontSize: 13.5, fontFamily: "DM Sans, sans-serif", fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.18s" }}
                >
                  {deleting && <span style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "stSpin .7s linear infinite", flexShrink: 0 }} />}
                  {deleting ? "Deleting…" : "Permanently Delete"}
                </button>
                <GhostBtn label="Cancel" onClick={cancelDelete} />
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ── Deactivate Account (softer — contact support) ─────────────────── */}
      <div style={{ padding: 18, borderRadius: 16, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.14)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: showConfirm ? 16 : 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0 }}>
            <IcWarn s={15} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#ef4444", margin: "0 0 4px" }}>Deactivate account</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.65 }}>
              Suspends your account. Reactivate any time via support.
            </p>
          </div>
        </div>

        {!showConfirm && (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            style={{ marginTop: 14, padding: "10px 20px", background: "none", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 11, fontSize: 13.5, fontFamily: "DM Sans, sans-serif", fontWeight: 600, cursor: "pointer", transition: "all 0.18s" }}
          >
            Deactivate my account
          </button>
        )}

        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              role="alert"
              style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text)", margin: "0 0 12px", lineHeight: 1.65 }}>
                Contact <strong>support@crowdspark.in</strong> to deactivate your account.
              </p>
              <GhostBtn label="Dismiss" onClick={() => setShowConfirm(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, loading } = useProfile();
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 36px" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, borderTopColor: "#ff8800", animation: "stSpin .7s linear infinite" }} />
      </div>
    );
  }

  const isCreator = user?.roles?.includes("CREATOR");

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 28px 80px", position: "relative" }}>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: isDark
            ? "radial-gradient(circle at 8% 12%, rgba(255,107,0,0.09), transparent 34%), radial-gradient(circle at 88% 15%, rgba(0,245,212,0.08), transparent 33%), radial-gradient(circle at 50% 100%, rgba(167,139,250,0.08), transparent 40%)"
            : "radial-gradient(circle at 8% 12%, rgba(255,107,0,0.06), transparent 34%), radial-gradient(circle at 88% 15%, rgba(0,168,130,0.06), transparent 33%), radial-gradient(circle at 50% 100%, rgba(167,139,250,0.05), transparent 40%)",
        }}
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, 26, 0], y: [0, -12, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: 40, right: 40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,136,0,0.16) 0%, transparent 70%)", filter: "blur(8px)", pointerEvents: "none", zIndex: 0 }}
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -20, 0], y: [0, 16, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: 10, left: 10, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 70%)", filter: "blur(8px)", pointerEvents: "none", zIndex: 0 }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800" }}>
              <IcCard s={14} />
            </div>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>Account</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,3vw,36px)", color: isDark ? "#fff" : "#0a0a0a", letterSpacing: "-0.03em", margin: "0 0 6px", lineHeight: 1.1 }}>Settings</h1>
          <p style={{ fontSize: 14, color: isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>Manage verification, creator status, and account details.</p>
        </motion.div>

        <Section title="Email Verification" icon={<IcMail s={14} />} subtitle="Verify your email to unlock all features">
          <EmailVerification />
        </Section>

        <Section title={isCreator ? "Creator Status" : "Become a Creator"} icon={<IcRocket s={14} />} subtitle={isCreator ? "Your KYC verification details" : "3-step process to start launching campaigns"} accentColor={isCreator ? "#34d399" : "#ff8800"}>
          <BecomeCreatorWizard />
        </Section>

        <Section title="Account Information" icon={<IcCard s={14} />} subtitle="Your account details and status">
          <AccountInfo />
        </Section>

        <Section title="Danger Zone" icon={<IcWarn s={14} />} subtitle="Data export and irreversible account actions" accentColor="#ef4444">
          <DangerZone />
        </Section>
      </div>

      <style>{`
        @keyframes stShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(200%)} 100%{transform:translateX(200%)} }
        @keyframes stSpin { to{transform:rotate(360deg)} }
        @media(max-width:520px){ .kyc-grid{ grid-template-columns:1fr!important; } }
      `}</style>
    </div>
  );
}