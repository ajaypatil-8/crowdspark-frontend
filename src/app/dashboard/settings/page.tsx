"use client";
import { useState, useRef, useEffect, useCallback, useId } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import { authApi, creatorApi, tokenStorage, type KycStatusResponse, type KycStatus } from "@/lib/api";

type WizardStep = "intro" | "otp-sent" | "otp-verified" | "kyc-form" | "submitted" | "approved" | "rejected";

const IcMail = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IcRocket = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
  </svg>
);
const IcCard = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);
const IcWarn = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IcCheck = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcShield = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IcZap = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IcClock = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcUpload = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
  </svg>
);
const IcLock = ({ s = 12 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const show = useCallback((msg: string, type: "success" | "error" | "info" = "success") => setToast({ msg, type }), []);
  const dismiss = useCallback(() => setToast(null), []);
  return { toast, show, dismiss };
}

function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error" | "info"; onClose: () => void }) {
  const c = { success: { bg: "rgba(52,211,153,0.12)", bdr: "rgba(52,211,153,0.3)", text: "#34d399" }, error: { bg: "rgba(239,68,68,0.12)", bdr: "rgba(239,68,68,0.3)", text: "#ef4444" }, info: { bg: "rgba(0,245,212,0.1)", bdr: "rgba(0,245,212,0.25)", text: "#00f5d4" } }[type];
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div role="alert" style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, padding: "12px 18px", borderRadius: 14, backdropFilter: "blur(20px)", background: c.bg, border: `1px solid ${c.bdr}`, color: c.text, fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: 13.5, display: "flex", alignItems: "center", gap: 10, maxWidth: 360, boxShadow: `0 8px 32px ${c.bdr}` }}>
      <span style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${c.text}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IcCheck s={9} /></span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: c.text, padding: 0, fontSize: 18, opacity: 0.6, lineHeight: 1 }}>×</button>
    </div>
  );
}

function Section({ title, icon, subtitle, children }: { title: string; icon: React.ReactNode; subtitle?: string; children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <section style={{ borderRadius: 18, overflow: "hidden", marginBottom: 16, background: isDark ? "rgba(255,255,255,0.03)" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`, boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`, background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,140,0,0.4),transparent)" }} />
        <div style={{ color: "#ff8800" }}>{icon}</div>
        <div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--text)", margin: 0 }}>{title}</h2>
          {subtitle && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)", margin: "2px 0 0" }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </section>
  );
}

function SInput({ label, value, onChange, placeholder, type = "text", maxLength, disabled, hint, error, required }: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string;
  type?: string; maxLength?: number; disabled?: boolean; hint?: string; error?: string; required?: boolean;
}) {
  const { isDark } = useTheme();
  const fid = useId();
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={fid} style={{ display: "block", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11.5, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
      </label>
      <input id={fid} type={type} value={value} maxLength={maxLength} disabled={disabled} placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, boxSizing: "border-box" as const, fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", border: `1px solid ${error ? "#ef4444" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: disabled ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)"), color: disabled ? "var(--text-muted)" : "var(--text)", cursor: disabled ? "not-allowed" : "text", transition: "border-color 0.15s" }} />
      {error && <p role="alert" style={{ fontSize: 11.5, color: "#ef4444", fontFamily: "DM Sans, sans-serif", margin: "4px 0 0" }}>✕ {error}</p>}
      {hint && !error && <p style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: "4px 0 0" }}>{hint}</p>}
    </div>
  );
}

function FireBtn({ label, onClick, loading, disabled, fullWidth }: { label: string; onClick?: () => void; loading?: boolean; disabled?: boolean; fullWidth?: boolean }) {
  return (
    <button type="button" onClick={!disabled && !loading ? onClick : undefined} disabled={disabled || loading}
      style={{ padding: "11px 22px", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", border: "none", borderRadius: 11, fontSize: 13.5, fontWeight: 700, fontFamily: "Syne, sans-serif", cursor: (disabled || loading) ? "not-allowed" : "pointer", opacity: (disabled || loading) ? 0.65 : 1, position: "relative", overflow: "hidden", display: "inline-flex", alignItems: "center", gap: 7, boxShadow: "0 0 18px rgba(255,100,0,0.28)", transition: "opacity 0.18s", width: fullWidth ? "100%" : "auto", justifyContent: "center" }}>
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "stshimmer 2.4s ease-in-out infinite" }} />
      {loading && <span style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "stspin .7s linear infinite", flexShrink: 0, position: "relative" }} />}
      <span style={{ position: "relative" }}>{label}</span>
    </button>
  );
}

function GhostBtn({ label, onClick, disabled }: { label: string; onClick?: () => void; disabled?: boolean }) {
  const { isDark } = useTheme();
  return (
    <button type="button" onClick={!disabled ? onClick : undefined} disabled={disabled}
      style={{ padding: "11px 22px", background: "none", color: "var(--text-muted)", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`, borderRadius: 11, fontSize: 13.5, fontFamily: "DM Sans, sans-serif", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1 }}>
      {label}
    </button>
  );
}

function DocCard({ label, sublabel, file, url, onFile, onError, uploading }: { label: string; sublabel: string; file: File | null; url: string; onFile: (f: File) => void; onError: (msg: string) => void; uploading: boolean }) {
  const { isDark } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const has = !!url;
  const handleFile = useCallback((f: File) => {
    if (f.size > 5 * 1024 * 1024) { onError("Max 5MB"); return; }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(f.type)) { onError("JPG, PNG or PDF only"); return; }
    onFile(f);
  }, [onFile, onError]);
  return (
    <div role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${has ? "rgba(52,211,153,0.3)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)")}`, background: has ? "rgba(52,211,153,0.04)" : (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"), cursor: uploading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,application/pdf" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }} />
      <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: has ? "rgba(52,211,153,0.1)" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"), display: "flex", alignItems: "center", justifyContent: "center", color: has ? "#34d399" : "var(--text-muted)" }}>
        {uploading ? <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "stspin .7s linear infinite", display: "block" }} /> : has ? <IcCheck s={14} /> : <IcUpload s={14} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color: "var(--text)", margin: 0 }}>{label}</p>
        <p style={{ fontSize: 11.5, color: has ? "#34d399" : "var(--text-muted)", margin: "2px 0 0", fontFamily: "DM Sans, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{has ? (file?.name ?? "Uploaded ✓") : sublabel}</p>
      </div>
      {!has && !uploading && <span style={{ fontSize: 11.5, fontFamily: "DM Sans, sans-serif", fontWeight: 600, color: "#ff8800", flexShrink: 0 }}>Upload</span>}
    </div>
  );
}

function StepDots({ current, total }: { current: number; total: number }) {
  const { isDark } = useTheme();
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 20 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ height: 3, borderRadius: 2, width: i === current ? 22 : 7, background: i <= current ? "linear-gradient(90deg,#ff6b00,#ffcc00)" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"), transition: "all 0.3s" }} />
      ))}
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", marginLeft: 3 }}>Step {current + 1}/{total}</span>
    </div>
  );
}

function OtpInput({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const { isDark } = useTheme();
  const r0 = useRef<HTMLInputElement>(null); const r1 = useRef<HTMLInputElement>(null);
  const r2 = useRef<HTMLInputElement>(null); const r3 = useRef<HTMLInputElement>(null);
  const r4 = useRef<HTMLInputElement>(null); const r5 = useRef<HTMLInputElement>(null);
  const refs = [r0, r1, r2, r3, r4, r5];
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const handle = useCallback((i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = value.split(""); next[i] = v; onChange(next.join("").slice(0, 6));
    if (v && i < 5) refs[i + 1]?.current?.focus();
  }, [value, onChange]);
  const handleKey = useCallback((i: number, e: React.KeyboardEvent) => { if (e.key === "Backspace" && !value[i] && i > 0) refs[i - 1]?.current?.focus(); }, [value]);
  const handlePaste = useCallback((e: React.ClipboardEvent) => { const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6); if (p) { e.preventDefault(); onChange(p); refs[Math.min(p.length, 5)]?.current?.focus(); } }, [onChange]);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: error ? 8 : 20, justifyContent: "center" }}>
        {digits.map((d, i) => (
          <input key={i} ref={refs[i]} type="tel" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handle(i, e.target.value)} onKeyDown={e => handleKey(i, e)} onPaste={i === 0 ? handlePaste : undefined}
            style={{ width: 44, height: 52, textAlign: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, borderRadius: 11, outline: "none", transition: "all 0.15s", border: `1.5px solid ${error ? "#ef4444" : d ? (isDark ? "rgba(255,107,0,0.5)" : "rgba(255,107,0,0.4)") : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")}`, background: d ? (isDark ? "rgba(255,107,0,0.08)" : "rgba(255,107,0,0.05)") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)"), color: d ? "#ff8800" : "var(--text)", boxShadow: d ? "0 0 8px rgba(255,107,0,0.2)" : "none" }} />
        ))}
      </div>
      {error && <p role="alert" style={{ fontSize: 12, color: "#ef4444", fontFamily: "DM Sans, sans-serif", margin: "0 0 12px", textAlign: "center" }}>✕ {error}</p>}
    </div>
  );
}

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

  const uploadDoc = useCallback(async (file: File, type: "pan" | "af" | "ab") => {
    setUploadingDoc(type);
    try {
      const r = await creatorApi.uploadKycDoc(file);
      if (type === "pan") { setPanUrl(r.secure_url); setPanPid(r.public_id); setPanFile(file); }
      if (type === "af") { setAfUrl(r.secure_url); setAfPid(r.public_id); setAfFile(file); }
      if (type === "ab") { setAbUrl(r.secure_url); setAbPid(r.public_id); setAbFile(file); }
      showToast(`${({ pan: "PAN", af: "Aadhaar Front", ab: "Aadhaar Back" }[type])} uploaded!`, "success");
    } catch (e: any) { showToast(e.message ?? "Upload failed", "error"); }
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
    } catch (e: any) { showToast(e.message ?? "Submission failed", "error"); }
    finally { setSubmitting(false); }
  }, [panUrl, afUrl, abUrl, pan, aadhaar, acHolder, acNumber, ifsc, bankName, branch, upiId, panPid, afPid, abPid, showToast, onSubmitted]);

  return (
    <div>
      <StepDots current={1} total={3} />
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--text)", margin: "0 0 12px" }}>1. Upload documents</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        <DocCard label="PAN Card" sublabel="Front — JPG, PNG or PDF" file={panFile} url={panUrl} uploading={uploadingDoc === "pan"} onFile={f => uploadDoc(f, "pan")} onError={msg => showToast(msg, "error")} />
        <DocCard label="Aadhaar Front" sublabel="Front of Aadhaar" file={afFile} url={afUrl} uploading={uploadingDoc === "af"} onFile={f => uploadDoc(f, "af")} onError={msg => showToast(msg, "error")} />
        <DocCard label="Aadhaar Back" sublabel="Back of Aadhaar" file={abFile} url={abUrl} uploading={uploadingDoc === "ab"} onFile={f => uploadDoc(f, "ab")} onError={msg => showToast(msg, "error")} />
      </div>
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--text)", margin: "0 0 12px" }}>2. Identity details</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }} className="kyc-grid">
        <SInput label="PAN Number" value={pan} onChange={v => setPan(v.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} error={errs.pan} required />
        <SInput label="Aadhaar" value={aadhaar} onChange={v => { let r = v.replace(/\D/g, "").slice(0, 12); r = r.replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) => c ? `${a}-${b}-${c}` : b ? `${a}-${b}` : a); setAadhaar(r); }} placeholder="XXXX-XXXX-XXXX" maxLength={14} error={errs.aadhaar} required />
      </div>
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--text)", margin: "0 0 12px" }}>3. Bank details</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }} className="kyc-grid">
        <SInput label="Account Holder" value={acHolder} onChange={setAcHolder} placeholder="Full name on account" error={errs.acHolder} required />
        <SInput label="Account Number" value={acNumber} onChange={setAcNumber} placeholder="Account number" type="password" error={errs.acNumber} required />
        <SInput label="IFSC Code" value={ifsc} onChange={v => setIfsc(v.toUpperCase())} placeholder="HDFC0001234" maxLength={11} error={errs.ifsc} required />
        <SInput label="Bank Name" value={bankName} onChange={setBankName} placeholder="HDFC Bank" error={errs.bankName} required />
        <SInput label="Branch Name" value={branch} onChange={setBranch} placeholder="Andheri West" error={errs.branch} required />
        <SInput label="UPI ID" value={upiId} onChange={setUpiId} placeholder="name@upi" error={errs.upiId} required />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", borderRadius: 8, marginBottom: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <IcLock s={12} /><span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)" }}>Documents encrypted &amp; stored securely.</span>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <FireBtn label={submitting ? "Submitting…" : "Submit KYC"} onClick={submit} loading={submitting} disabled={!panUrl || !afUrl || !abUrl} />
        <GhostBtn label="← Back" onClick={onBack} />
      </div>
    </div>
  );
}

function BecomeCreatorWizard() {
  const { user, refetch } = useProfile();
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { toast, show, dismiss } = useToast();
  useEffect(() => { setMounted(true); }, []);

  const isCreator = user?.roles?.includes("CREATOR");
  const kycStatus = (user?.kycStatus ?? "NOT_SUBMITTED") as KycStatus;
  const [kycData, setKycData] = useState<KycStatusResponse | null>(null);
  const [step, setStep] = useState<WizardStep>("intro");
  const [otp, setOtp] = useState(""); const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false); const [cooldown, setCooldown] = useState(0);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    if (isCreator || kycStatus === "APPROVED") setStep("approved");
    else if (kycStatus === "PENDING_APPROVAL") setStep("submitted");
    else if (kycStatus === "REJECTED") setStep("rejected");
    else if (kycStatus === "PENDING_SUBMISSION") setStep("otp-verified");
    else setStep("intro");
  }, [kycStatus, isCreator]);

  useEffect(() => { if (isCreator || kycStatus === "APPROVED" || kycStatus === "PENDING_APPROVAL") creatorApi.kycStatus().then(setKycData).catch(() => {}); }, [isCreator, kycStatus]);
  useEffect(() => { if (cooldown <= 0) return; const t = setTimeout(() => setCooldown(c => c - 1), 1000); return () => clearTimeout(t); }, [cooldown]);

  const sendOtp = useCallback(async () => {
    setOtpSending(true);
    try { await creatorApi.sendOtp(); show("OTP sent to your email", "success"); setStep("otp-sent"); setCooldown(60); }
    catch (e: any) { show(e.message ?? "Failed to send OTP", "error"); }
    finally { setOtpSending(false); }
  }, [show]);

  const verifyOtp = useCallback(async () => {
    if (otp.length !== 6) { setOtpError("Enter the 6-digit OTP"); return; }
    setOtpVerifying(true);
    try {
      await creatorApi.verifyOtp(otp);
      const rt = tokenStorage.getRefresh();
      if (rt) { try { await authApi.refresh(rt); } catch {} }
      show("Email verified! Submit KYC docs.", "success");
      await refetch(); setStep("otp-verified"); setOtpError("");
    } catch (e: any) { setOtpError(e.message ?? "Invalid OTP"); }
    finally { setOtpVerifying(false); }
  }, [otp, show, refetch]);

  const handleKycSubmitted = useCallback(async (data: KycStatusResponse) => {
    setKycData(data); await refetch(); show("KYC submitted! Review takes 24–48 hours.", "success"); setStep("submitted");
  }, [refetch, show]);

  if (!mounted) return null;

  if (step === "approved") return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 14px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}><IcZap s={24} /></div>
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: "#34d399", margin: "0 0 6px" }}>Verified Creator</p>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 16px" }}>Your KYC is approved. You can launch campaigns.</p>
      {kycData && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "left" }}>
          {([["PAN", kycData.panNumber], ["Bank", kycData.bankName], ["Account", kycData.maskedBankAccount], ["IFSC", kycData.bankIfscCode], ["UPI", kycData.upiId]] as [string, string | undefined][]).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ padding: "10px 12px", borderRadius: 10, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, color: "var(--text-muted)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.07em" }}>{k}</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text)", margin: 0, fontWeight: 600 }}>{v}</p>
            </div>
          ))}
        </div>
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={dismiss} />}
    </div>
  );

  if (step === "submitted") return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 14px", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa" }}><IcClock s={24} /></div>
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: "#a78bfa", margin: "0 0 6px" }}>Under Review</p>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "0 auto", maxWidth: 300, lineHeight: 1.7 }}>Our team is reviewing your documents. Usually 24–48 hours.</p>
      {kycData?.submittedAt && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: "12px 0 0" }}>Submitted: {new Date(kycData.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={dismiss} />}
    </div>
  );

  if (step === "rejected") return (
    <div>
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 16 }}>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#ef4444", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}><IcWarn s={14} /> KYC Rejected</p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Reason: <span style={{ color: "#ef4444" }}>{kycData?.rejectionReason ?? "Contact support."}</span></p>
      </div>
      <FireBtn label="Resubmit KYC" onClick={() => setStep("kyc-form")} />
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={dismiss} />}
    </div>
  );

  if (step === "intro") return (
    <div>
      <StepDots current={0} total={3} />
      <div style={{ padding: 16, borderRadius: 12, background: "linear-gradient(135deg,rgba(255,107,0,0.08),rgba(255,204,0,0.04))", border: "1px solid rgba(255,107,0,0.18)", marginBottom: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800", flexShrink: 0 }}><IcRocket s={18} /></div>
        <div>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5, color: "var(--text)", margin: "0 0 4px" }}>Become a Creator</p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: "0 0 10px", lineHeight: 1.6 }}>Launch campaigns and raise funds from thousands of backers.</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {([["📧", "Verify OTP"], ["📄", "Submit KYC"], ["✅", "Get approved"]] as const).map(([e, t]) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 13 }}>{e}</span>
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FireBtn label="Get started →" onClick={sendOtp} loading={otpSending} />
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={dismiss} />}
    </div>
  );

  if (step === "otp-sent") return (
    <div>
      <StepDots current={0} total={3} />
      <div style={{ padding: "12px 14px", borderRadius: 10, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`, marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ color: "#ff8800", marginTop: 2 }}><IcMail s={15} /></div>
        <div>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, color: "var(--text)", margin: "0 0 2px" }}>Check your inbox</p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>OTP sent to <strong style={{ color: "var(--text)" }}>{user?.email}</strong></p>
        </div>
      </div>
      <OtpInput value={otp} onChange={setOtp} error={otpError} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <FireBtn label="Verify OTP" onClick={verifyOtp} loading={otpVerifying} />
        <GhostBtn label={cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"} onClick={cooldown > 0 ? undefined : sendOtp} disabled={cooldown > 0} />
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={dismiss} />}
    </div>
  );

  if (step === "otp-verified") return (
    <div>
      <StepDots current={1} total={3} />
      <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ color: "#34d399" }}><IcShield s={16} /></div>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#34d399", margin: 0 }}>Email verified! Submit your KYC documents to complete creator setup.</p>
      </div>
      <FireBtn label="Submit KYC Documents →" onClick={() => setStep("kyc-form")} />
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={dismiss} />}
    </div>
  );

  if (step === "kyc-form") return (
    <>
      <KycFormStep onSubmitted={handleKycSubmitted} onBack={() => setStep("otp-verified")} showToast={show} />
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={dismiss} />}
    </>
  );

  return null;
}

function EmailVerification() {
  const { user } = useProfile();
  const { toast, show, dismiss } = useToast();
  const [sending, setSending] = useState(false); const [sent, setSent] = useState(false); const [cooldown, setCooldown] = useState(0);
  useEffect(() => { if (cooldown <= 0) return; const t = setTimeout(() => setCooldown(c => c - 1), 1000); return () => clearTimeout(t); }, [cooldown]);

  const send = useCallback(async () => {
    setSending(true);
    try { await authApi.sendVerificationEmail(); show("Verification email sent!", "success"); setSent(true); setCooldown(60); }
    catch (e: any) { show(e.message ?? "Failed to send", "error"); }
    finally { setSending(false); }
  }, [show]);

  if (user?.emailVerified) return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}><IcCheck s={16} /></div>
      <div>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#34d399", margin: 0 }}>Email verified</p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: "2px 0 0" }}>{user.email}</p>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}><IcMail s={16} /></div>
        <div>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#f59e0b", margin: 0 }}>Email not verified</p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: "2px 0 0" }}>{user?.email}</p>
        </div>
      </div>
      {sent && <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.2)", marginBottom: 14 }}><p style={{ fontSize: 13, color: "#00f5d4", fontFamily: "DM Sans, sans-serif", margin: 0 }}>✓ Check your inbox and click the verification link.</p></div>}
      <FireBtn label={cooldown > 0 ? `Resend in ${cooldown}s` : sent ? "Resend email" : "Send verification email"} onClick={cooldown > 0 ? undefined : send} loading={sending} disabled={cooldown > 0} />
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={dismiss} />}
    </div>
  );
}

function AccountInfo() {
  const { user } = useProfile();
  const { isDark } = useTheme();
  if (!user) return null;
  const maskPhone = (p: string | null | undefined) => !p ? "—" : p.length <= 4 ? p : p.slice(0, p.length - 4).replace(/./g, "•") + p.slice(-4);
  const fmt = (s: string | null | undefined) => !s ? "—" : s.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());
  const rows: [string, string][] = [
    ["User ID", `#${user.id}`], ["Username", `@${user.username}`], ["Email", user.email],
    ["Phone", maskPhone(user.phoneNumber)], ["Roles", (user.roles ?? []).join(", ") || "None"],
    ["Account", fmt(user.accountStatus)], ["KYC", fmt(user.kycStatus)],
    ["Member since", new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
  ];
  return (
    <dl style={{ margin: 0 }}>
      {rows.map(([k, v], i) => (
        <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < rows.length - 1 ? `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` : undefined }}>
          <dt style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", fontWeight: 500, margin: 0 }}>{k}</dt>
          <dd style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text)", fontWeight: 600, margin: 0, maxWidth: "60%", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function DeactivateSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <div style={{ padding: 16, borderRadius: 12, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.14)" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: showConfirm ? 14 : 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0 }}><IcWarn s={14} /></div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#ef4444", margin: "0 0 3px" }}>Deactivate account</p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Suspends your account. Contact support to reactivate any time.</p>
        </div>
      </div>
      {!showConfirm && (
        <button type="button" onClick={() => setShowConfirm(true)} style={{ marginTop: 12, padding: "9px 18px", background: "none", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontSize: 13, fontFamily: "DM Sans, sans-serif", fontWeight: 600, cursor: "pointer" }}>
          Deactivate my account
        </button>
      )}
      {showConfirm && (
        <div role="alert" style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text)", margin: "0 0 10px" }}>Contact <strong>support@crowdspark.in</strong> to deactivate your account.</p>
          <GhostBtn label="Dismiss" onClick={() => setShowConfirm(false)} />
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading } = useProfile();
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 36px" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, borderTopColor: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)", animation: "stspin .7s linear infinite" }} />
    </div>
  );

  const isCreator = user?.roles?.includes("CREATOR");

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 28px 60px" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Account</p>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: "var(--text)", letterSpacing: "-0.03em", margin: "0 0 6px" }}>Settings</h1>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>Manage verification, creator status, and account details.</p>
      </div>

      <Section title="Email Verification" icon={<IcMail s={13} />} subtitle="Verify your email to unlock all features">
        <EmailVerification />
      </Section>

      <Section title={isCreator ? "Creator Status" : "Become a Creator"} icon={<IcRocket s={13} />} subtitle={isCreator ? "Your KYC verification details" : "3-step process to start launching campaigns"}>
        <BecomeCreatorWizard />
      </Section>

      <Section title="Account Information" icon={<IcCard s={13} />} subtitle="Your account details and current status">
        <AccountInfo />
      </Section>

      <Section title="Danger Zone" icon={<IcWarn s={13} />}>
        <DeactivateSection />
      </Section>

      <style>{`
        @keyframes stshimmer{0%{transform:translateX(-100%)}60%{transform:translateX(200%)}100%{transform:translateX(200%)}}
        @keyframes stspin{to{transform:rotate(360deg)}}
        @media(max-width:520px){.kyc-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}