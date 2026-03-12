"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import {
  authApi,
  creatorApi,
  tokenStorage,
  type KycStatusResponse,
  type KycSubmitRequest,
  type KycStatus,
} from "@/lib/api";

type WizardStep =
  | "intro"
  | "otp-sent"
  | "otp-verified"
  | "kyc-form"
  | "submitted"
  | "approved"
  | "rejected";

/* ══════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════ */
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
    success: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", text: "#34d399", icon: "✓" },
    error:   { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  text: "#ef4444", icon: "✕" },
    info:    { bg: "rgba(0,245,212,0.1)",   border: "rgba(0,245,212,0.25)", text: "#00f5d4", icon: "ℹ" },
  }[type];

  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div role="alert" aria-live="assertive" className="settings-toast"
      style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, boxShadow: `0 8px 32px ${colors.border}` }}>
      <span aria-hidden="true" style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${colors.text}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>
        {colors.icon}
      </span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} aria-label="Dismiss notification"
        style={{ background: "none", border: "none", cursor: "pointer", color: colors.text, padding: 0, fontSize: 18, opacity: 0.6, lineHeight: 1 }}>
        ×
      </button>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const show = useCallback((msg: string, type: "success" | "error" | "info" = "success") => setToast({ msg, type }), []);
  const dismiss = useCallback(() => setToast(null), []);
  return { toast, show, dismiss };
}

/* ══════════════════════════════════════════════════════════════
   SECTION
══════════════════════════════════════════════════════════════ */
function Section({ title, icon, subtitle, children }: { title: string; icon: string; subtitle?: string; children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <section aria-label={title} className={`settings-section ${isDark ? "dark" : "light"}`}>
      <div className="settings-section-header">
        <div className="settings-section-shimmer" aria-hidden="true" />
        <span aria-hidden="true" style={{ fontSize: 16 }}>{icon}</span>
        <div>
          <h2 className="settings-section-title">{title}</h2>
          {subtitle && <p className="settings-section-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   INPUT
══════════════════════════════════════════════════════════════ */
function Input({ label, value, onChange, placeholder, type = "text", maxLength, disabled, hint, error, required }: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string;
  type?: string; maxLength?: number; disabled?: boolean; hint?: string; error?: string; required?: boolean;
}) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const hintId  = `${fieldId}-hint`;
  const hasError = !!error;
  const describedBy = [hasError ? errorId : null, hint && !hasError ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={fieldId} className="settings-input-label">
        {label}
        {required && <span style={{ color: "#ef4444" }} aria-hidden="true">*</span>}
        {required && <span className="sr-only">(required)</span>}
      </label>
      <input id={fieldId} type={type} value={value} maxLength={maxLength} disabled={disabled} placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)} aria-invalid={hasError || undefined} aria-describedby={describedBy}
        aria-required={required || undefined} className={`settings-input ${hasError ? "has-error" : ""} ${disabled ? "is-disabled" : ""}`} />
      {hasError && <p id={errorId} className="settings-input-error" role="alert">✕ {error}</p>}
      {hint && !hasError && <p id={hintId} className="settings-input-hint">{hint}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BUTTON
══════════════════════════════════════════════════════════════ */
function Btn({ label, onClick, loading, disabled, variant = "fire", fullWidth = false }: {
  label: string; onClick?: () => void; loading?: boolean; disabled?: boolean;
  variant?: "fire" | "outline" | "danger"; fullWidth?: boolean;
}) {
  const isInactive = disabled || loading;
  return (
    <button type="button" onClick={isInactive ? undefined : onClick} disabled={isInactive}
      aria-busy={loading || undefined} className={`settings-btn settings-btn-${variant}`}
      style={{ width: fullWidth ? "100%" : "auto", justifyContent: fullWidth ? "center" : "flex-start" }}>
      {variant === "fire" && !loading && <span className="settings-btn-shimmer" aria-hidden="true" />}
      <span className="settings-btn-content">
        {loading ? (<><span className="settings-spinner-sm" aria-hidden="true" />{label}</>) : label}
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   DOC CARD
══════════════════════════════════════════════════════════════ */
function DocCard({ label, sublabel, file, url, onFile, onError, uploading, hint }: {
  label: string; sublabel: string; file: File | null; url: string;
  onFile: (f: File) => void; onError: (msg: string) => void; uploading: boolean; hint?: string;
}) {
  const { isDark } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const cardId = useId();
  const has = !!url;

  const handleFile = useCallback((f: File) => {
    if (f.size > 5 * 1024 * 1024) { onError("File size must be less than 5MB"); return; }
    if (!["image/jpeg","image/png","application/pdf"].includes(f.type)) { onError("Only JPG, PNG, or PDF files are allowed"); return; }
    onFile(f);
  }, [onFile, onError]);

  const handleClick = useCallback(() => inputRef.current?.click(), []);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }, [handleClick]);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
    e.target.value = "";
  }, [handleFile]);

  return (
    <div role="button" tabIndex={0} aria-label={has ? `${label}: uploaded. Click to replace.` : `Upload ${label}`}
      aria-describedby={hint && !has ? `${cardId}-hint` : undefined} onClick={handleClick} onKeyDown={handleKeyDown}
      className={`settings-doc-card ${has ? "uploaded" : ""} ${isDark ? "dark" : "light"}`}
      style={{ cursor: uploading ? "wait" : "pointer" }}>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,application/pdf" style={{ display: "none" }} onChange={handleChange} aria-hidden="true" tabIndex={-1} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className={`settings-doc-icon ${has ? "success" : ""}`} aria-hidden="true">
          {uploading ? <div className="settings-spinner-sm" /> : has ? (
            <svg width="18" height="18" fill="none" stroke="#34d399" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="settings-doc-label">{label}</p>
          <p className="settings-doc-sublabel" style={{ color: has ? "#34d399" : "var(--text-muted)" }}>
            {has ? file?.name ?? "Uploaded ✓" : sublabel}
          </p>
          {hint && !has && <p id={`${cardId}-hint`} className="settings-doc-hint">{hint}</p>}
        </div>
        {!has && !uploading && <span className="settings-doc-cta" aria-hidden="true">Upload</span>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STEP DOTS
══════════════════════════════════════════════════════════════ */
function StepDots({ current, total }: { current: number; total: number }) {
  const { isDark } = useTheme();
  const inactiveColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 20 }}
      role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total} aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} aria-hidden="true" style={{ height: 4, borderRadius: 2, width: i === current ? 24 : 8,
          background: i <= current ? "linear-gradient(90deg,#ff6b00,#ffcc00)" : inactiveColor, transition: "all 0.3s" }} />
      ))}
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", marginLeft: 4 }}>
        Step {current + 1}/{total}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   OTP INPUT
══════════════════════════════════════════════════════════════ */
function OtpInput({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const groupId = useId();
  const errorId = `${groupId}-error`;
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const ref4 = useRef<HTMLInputElement>(null);
  const ref5 = useRef<HTMLInputElement>(null);
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5];
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const handle = useCallback((i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = value.split("");
    next[i] = v;
    onChange(next.join("").slice(0, 6));
    if (v && i < 5) refs[i + 1]?.current?.focus();
  }, [value, onChange, refs]);

  const handleKey = useCallback((i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs[i - 1]?.current?.focus();
  }, [value, refs]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) { e.preventDefault(); onChange(pasted); refs[Math.min(pasted.length, 5)]?.current?.focus(); }
  }, [onChange, refs]);

  return (
    <div role="group" aria-labelledby={`${groupId}-label`} aria-describedby={error ? errorId : undefined}>
      <span id={`${groupId}-label`} className="sr-only">Enter 6-digit OTP</span>
      <div style={{ display: "flex", gap: 8, marginBottom: error ? 8 : 20, justifyContent: "center" }}>
        {digits.map((d, i) => (
          <input key={i} ref={refs[i]} type="tel" inputMode="numeric" maxLength={1} value={d}
            onChange={(e) => handle(i, e.target.value)} onKeyDown={(e) => handleKey(i, e)}
            onPaste={i === 0 ? handlePaste : undefined} aria-label={`Digit ${i + 1}`}
            aria-invalid={!!error || undefined} className={`settings-otp-digit ${error ? "has-error" : ""} ${d ? "filled" : ""}`} />
        ))}
      </div>
      {error && <p id={errorId} role="alert" style={{ fontSize: 12, color: "#ef4444", fontFamily: "DM Sans, sans-serif", margin: "0 0 12px", textAlign: "center" }}>✕ {error}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WIZARD STEPS
══════════════════════════════════════════════════════════════ */
function WizardIntro({ onStart, loading }: { onStart: () => void; loading: boolean }) {
  return (
    <div>
      <div className="settings-wizard-banner">
        <div className="settings-wizard-banner-shimmer" aria-hidden="true" />
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <span style={{ fontSize: 36, flexShrink: 0 }} aria-hidden="true">🚀</span>
          <div>
            <p className="settings-wizard-banner-title">Become a Creator</p>
            <p className="settings-wizard-banner-desc">Launch campaigns, raise funds from thousands of backers, and turn your ideas into reality.</p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {([ ["📧","Verify OTP"], ["📄","Submit KYC"], ["✅","Get approved"] ] as const).map(([emoji, text]) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14 }} aria-hidden="true">{emoji}</span>
                  <span className="settings-wizard-step-label">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Btn label="🔥 Get started" onClick={onStart} loading={loading} />
    </div>
  );
}

function WizardOtpSent({ email, otp, setOtp, otpError, onVerify, verifying, onResend, resending, cooldown }: {
  email: string; otp: string; setOtp: (v: string) => void; otpError: string;
  onVerify: () => void; verifying: boolean; onResend: () => void; resending: boolean; cooldown: number;
}) {
  const { isDark } = useTheme();
  return (
    <div>
      <StepDots current={0} total={3} />
      <div className={`settings-info-card ${isDark ? "dark" : "light"}`} style={{ marginBottom: 20 }}>
        <p className="settings-info-title">📧 Check your inbox</p>
        <p className="settings-info-body">6-digit OTP sent to <strong style={{ color: "var(--text)" }}>{email}</strong>. Valid 10 min.</p>
      </div>
      <OtpInput value={otp} onChange={setOtp} error={otpError} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Btn label="Verify OTP" onClick={onVerify} loading={verifying} />
        <Btn label={cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"} onClick={cooldown > 0 ? undefined : onResend} loading={resending} disabled={cooldown > 0} variant="outline" />
      </div>
    </div>
  );
}

function WizardOtpVerified({ onProceed }: { onProceed: () => void }) {
  return (
    <div>
      <div className="settings-success-banner" style={{ marginBottom: 20 }}>
        <svg width="18" height="18" fill="none" stroke="#34d399" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#34d399", margin: 0 }}>
          Email verified! Submit your KYC documents to complete creator setup.
        </p>
      </div>
      <Btn label="📄 Submit KYC Documents" onClick={onProceed} />
    </div>
  );
}

function WizardKycForm({ onSubmitted, onBack, showToast }: {
  onSubmitted: (data: KycStatusResponse) => void; onBack: () => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}) {
  const [panNumber, setPanNumber] = useState("");
  const [aadhaarNum, setAadhaarNum] = useState("");
  const [acHolder, setAcHolder]     = useState("");
  const [acNumber, setAcNumber]     = useState("");
  const [ifsc, setIfsc]             = useState("");
  const [bankName, setBankName]     = useState("");
  const [branch, setBranch]         = useState("");
  const [upiId, setUpiId]           = useState("");

  const [panUrl, setPanUrl]   = useState(""); const [panPid, setPanPid]   = useState(""); const [panFile, setPanFile]   = useState<File | null>(null);
  const [afUrl, setAfUrl]     = useState(""); const [afPid, setAfPid]     = useState(""); const [afFile, setAfFile]     = useState<File | null>(null);
  const [abUrl, setAbUrl]     = useState(""); const [abPid, setAbPid]     = useState(""); const [abFile, setAbFile]     = useState<File | null>(null);

  const [uploadingDoc, setUploadingDoc] = useState<"pan" | "af" | "ab" | null>(null);
  const [submitting, setSubmitting]     = useState(false);
  const [formErrors, setFormErrors]     = useState<Record<string, string>>({});

  const uploadDoc = useCallback(async (file: File, type: "pan" | "af" | "ab") => {
    setUploadingDoc(type);
    try {
      const r = await creatorApi.uploadKycDoc(file);
      if (type === "pan") { setPanUrl(r.secure_url); setPanPid(r.public_id); setPanFile(file); }
      if (type === "af")  { setAfUrl(r.secure_url);  setAfPid(r.public_id);  setAfFile(file); }
      if (type === "ab")  { setAbUrl(r.secure_url);  setAbPid(r.public_id);  setAbFile(file); }
      showToast(`${({ pan:"PAN", af:"Aadhaar Front", ab:"Aadhaar Back" }[type])} uploaded!`, "success");
    } catch (e: any) {
      showToast(e.message ?? "Upload failed", "error");
    } finally {
      setUploadingDoc(null);
    }
  }, [showToast]);

  const handleDocError = useCallback((msg: string) => showToast(msg, "error"), [showToast]);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber))  errors.panNumber  = "Invalid PAN (e.g. ABCDE1234F)";
    if (!/^\d{4}-\d{4}-\d{4}$/.test(aadhaarNum))         errors.aadhaarNum = "Aadhaar must be XXXX-XXXX-XXXX";
    if (!acHolder.trim())  errors.acHolder = "Account holder name is required";
    if (!acNumber.trim())  errors.acNumber = "Account number is required";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc))            errors.ifsc       = "Invalid IFSC code";
    if (!bankName.trim())  errors.bankName  = "Bank name is required";
    if (!branch.trim())    errors.branch    = "Branch name is required";
    if (!/^[\w.\-_]+@[a-zA-Z]+$/.test(upiId))            errors.upiId      = "Invalid UPI ID (e.g., name@upi)";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [panNumber, aadhaarNum, acHolder, acNumber, ifsc, bankName, branch, upiId]);

  const submitKyc = useCallback(async () => {
    if (!panUrl || !afUrl || !abUrl) { showToast("Upload all 3 documents first", "error"); return; }
    if (!validateForm()) { showToast("Please fix the errors below", "error"); return; }
    setSubmitting(true);
    try {
      const data = await creatorApi.submitKyc({
        panNumber, panCardImageUrl: panUrl, panCardImagePublicId: panPid,
        aadhaarNumber: aadhaarNum, aadhaarFrontImageUrl: afUrl, aadhaarFrontPublicId: afPid,
        aadhaarBackImageUrl: abUrl, aadhaarBackPublicId: abPid,
        bankAccountHolderName: acHolder, bankAccountNumber: acNumber,
        bankIfscCode: ifsc, bankName, bankBranchName: branch, upiId,
      });
      onSubmitted(data);
    } catch (e: any) {
      showToast(e.message ?? "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  }, [panUrl, afUrl, abUrl, panPid, afPid, abPid, panNumber, aadhaarNum, acHolder, acNumber, ifsc, bankName, branch, upiId, validateForm, showToast, onSubmitted]);

  return (
    <div>
      <StepDots current={1} total={3} />
      <h3 className="settings-kyc-heading">1. Upload documents</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        <DocCard label="PAN Card"      sublabel="Front side — JPG, PNG or PDF" file={panFile} url={panUrl} uploading={uploadingDoc === "pan"} onFile={(f) => uploadDoc(f, "pan")} onError={handleDocError} hint="Max 5MB" />
        <DocCard label="Aadhaar Front" sublabel="Front of Aadhaar card"        file={afFile}  url={afUrl}  uploading={uploadingDoc === "af"}  onFile={(f) => uploadDoc(f, "af")}  onError={handleDocError} hint="Max 5MB" />
        <DocCard label="Aadhaar Back"  sublabel="Back of Aadhaar card"         file={abFile}  url={abUrl}  uploading={uploadingDoc === "ab"}  onFile={(f) => uploadDoc(f, "ab")}  onError={handleDocError} hint="Max 5MB" />
      </div>

      <h3 className="settings-kyc-heading">2. Identity details</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }} className="kyc-grid">
        <Input label="PAN Number"    value={panNumber}  onChange={setPanNumber}  placeholder="ABCDE1234F"     maxLength={10} hint="Format: ABCDE1234F"     error={formErrors.panNumber}  required />
        <Input label="Aadhaar Number" value={aadhaarNum} onChange={setAadhaarNum} placeholder="XXXX-XXXX-XXXX" maxLength={14} hint="Format: XXXX-XXXX-XXXX" error={formErrors.aadhaarNum} required />
      </div>

      <h3 className="settings-kyc-heading">3. Bank details</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }} className="kyc-grid">
        <Input label="Account Holder" value={acHolder}  onChange={setAcHolder}  placeholder="Full name on account" error={formErrors.acHolder} required />
        <Input label="Account Number" value={acNumber}  onChange={setAcNumber}  placeholder="Your account number" type="password" error={formErrors.acNumber} required />
        <Input label="IFSC Code"      value={ifsc}      onChange={setIfsc}      placeholder="HDFC0001234" maxLength={11} error={formErrors.ifsc}     required />
        <Input label="Bank Name"      value={bankName}  onChange={setBankName}  placeholder="HDFC Bank"              error={formErrors.bankName}  required />
        <Input label="Branch Name"    value={branch}    onChange={setBranch}    placeholder="Andheri West"           error={formErrors.branch}    required />
        <Input label="UPI ID"         value={upiId}     onChange={setUpiId}     placeholder="yourname@upi" hint="Format: name@upi" error={formErrors.upiId} required />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <Btn label={submitting ? "Submitting…" : "Submit KYC"} onClick={submitKyc} loading={submitting} disabled={!panUrl || !afUrl || !abUrl} />
        <Btn label="← Back" onClick={onBack} variant="outline" />
      </div>
      <p className="settings-security-note">🔒 Documents are encrypted and stored securely. Used only for identity verification.</p>
    </div>
  );
}

function WizardApproved({ kycData }: { kycData: KycStatusResponse | null }) {
  const { isDark } = useTheme();
  const rows = ([ ["PAN", kycData?.panNumber], ["Bank", kycData?.bankName], ["Account", kycData?.maskedBankAccount], ["IFSC", kycData?.bankIfscCode], ["UPI", kycData?.upiId] ] as [string, string | undefined][]).filter(([, v]) => v);
  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div className="settings-status-icon success" aria-hidden="true">⚡</div>
      <p className="settings-status-title" style={{ color: "#34d399" }}>Verified Creator</p>
      <p className="settings-status-desc">Your KYC is approved. You can now launch campaigns.</p>
      {rows.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "left" }}>
          {rows.map(([k, v]) => (
            <div key={k} className={`settings-kyc-detail ${isDark ? "dark" : "light"}`}>
              <p className="settings-kyc-detail-label">{k}</p>
              <p className="settings-kyc-detail-value">{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WizardSubmitted({ kycData }: { kycData: KycStatusResponse | null }) {
  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div className="settings-status-icon pending" aria-hidden="true">🕐</div>
      <p className="settings-status-title" style={{ color: "#a78bfa" }}>Under Review</p>
      <p className="settings-status-desc" style={{ maxWidth: 320, margin: "0 auto" }}>
        Our team is verifying your documents. Usually 24–48 hours. You'll get an email when approved.
      </p>
      {kycData?.submittedAt && (
        <p className="settings-status-date">
          Submitted: {new Date(kycData.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}
    </div>
  );
}

function WizardRejected({ reason, onResubmit }: { reason: string; onResubmit: () => void }) {
  return (
    <div>
      <div className="settings-rejected-banner" role="alert">
        <p className="settings-rejected-title">❌ KYC Rejected</p>
        <p className="settings-rejected-reason">Reason: <span style={{ color: "#ef4444" }}>{reason}</span></p>
      </div>
      <Btn label="Resubmit KYC" onClick={onResubmit} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BECOME CREATOR WIZARD (orchestrator)
   FIX 1: useProfile from @/contexts/ProfileContext
   FIX 2: token refresh after verifyOtp
   FIX 3: creatorApi.kycStatus() alias exists in api.ts
══════════════════════════════════════════════════════════════ */
function BecomeCreatorWizard() {
  const { user, refetch } = useProfile();
  const [mounted, setMounted] = useState(false);
  const { toast, show, dismiss } = useToast();

  useEffect(() => { setMounted(true); }, []);

  const isCreator = user?.roles?.includes("CREATOR");
  const kycStatus = (user?.kycStatus ?? "NOT_SUBMITTED") as KycStatus;
  const [kycData, setKycData] = useState<KycStatusResponse | null>(null);
  const [step, setStep] = useState<WizardStep>("intro");
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending]     = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [cooldown, setCooldown]         = useState(0);
  const [otpError, setOtpError]         = useState("");

  // Sync wizard step from server state
  useEffect(() => {
    if (isCreator || kycStatus === "APPROVED")          setStep("approved");
    else if (kycStatus === "PENDING_APPROVAL")          setStep("submitted");
    else if (kycStatus === "REJECTED")                  setStep("rejected");
    else if (kycStatus === "PENDING_SUBMISSION")        setStep("otp-verified");
    else                                                 setStep("intro");
  }, [kycStatus, isCreator]);

  // Fetch KYC data for creators
  useEffect(() => {
    if (isCreator || kycStatus === "APPROVED" || kycStatus === "PENDING_APPROVAL") {
      creatorApi.kycStatus().then(setKycData).catch(() => {});
    }
  }, [isCreator, kycStatus]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendOtp = useCallback(async () => {
    setOtpSending(true);
    try {
      await creatorApi.sendOtp();
      show("OTP sent to your email", "success");
      setStep("otp-sent");
      setCooldown(60);
    } catch (e: any) {
      show(e.message ?? "Failed to send OTP", "error");
    } finally {
      setOtpSending(false);
    }
  }, [show]);

  const verifyOtp = useCallback(async () => {
    if (otp.length !== 6) { setOtpError("Enter the 6-digit OTP"); return; }
    setOtpVerifying(true);
    try {
      await creatorApi.verifyOtp(otp);

      // ── CRITICAL FIX ──────────────────────────────────────────────────
      // Backend adds CREATOR role after verifyOtp, but the current JWT
      // still has old roles. Refresh the token NOW so subsequent calls
      // to upload-kyc-doc and submit-kyc pass the ROLE_CREATOR check.
      const rt = tokenStorage.getRefresh();
      if (rt) {
        try {
          await authApi.refresh(rt);
        } catch {
          // refresh failed — user can still proceed, error will show on next protected call
        }
      }
      // ─────────────────────────────────────────────────────────────────

      show("Email verified! Now submit KYC docs.", "success");
      await refetch();
      setStep("otp-verified");
      setOtpError("");
    } catch (e: any) {
      setOtpError(e.message ?? "Invalid OTP");
    } finally {
      setOtpVerifying(false);
    }
  }, [otp, show, refetch]);

  const handleKycSubmitted = useCallback(async (data: KycStatusResponse) => {
    setKycData(data);
    await refetch();
    show("KYC submitted! Review takes 24–48 hours.", "success");
    setStep("submitted");
  }, [refetch, show]);

  if (!mounted) return null;

  return (
    <>
      {step === "approved"     && <WizardApproved kycData={kycData} />}
      {step === "submitted"    && <WizardSubmitted kycData={kycData} />}
      {step === "rejected"     && <WizardRejected reason={kycData?.rejectionReason ?? "Contact support."} onResubmit={() => setStep("kyc-form")} />}
      {step === "intro"        && <WizardIntro onStart={sendOtp} loading={otpSending} />}
      {step === "otp-sent"     && <WizardOtpSent email={user?.email ?? ""} otp={otp} setOtp={setOtp} otpError={otpError} onVerify={verifyOtp} verifying={otpVerifying} onResend={sendOtp} resending={otpSending} cooldown={cooldown} />}
      {step === "otp-verified" && <WizardOtpVerified onProceed={() => setStep("kyc-form")} />}
      {step === "kyc-form"     && <WizardKycForm onSubmitted={handleKycSubmitted} onBack={() => setStep("otp-verified")} showToast={show} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={dismiss} />}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   EMAIL VERIFICATION
   FIX: authApi.sendVerificationEmail() now exists in api.ts
   (shows "not yet available" if backend returns 404)
══════════════════════════════════════════════════════════════ */
function EmailVerification() {
  const { user } = useProfile();
  const { toast, show, dismiss } = useToast();
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = useCallback(async () => {
    setSending(true);
    try {
      await authApi.sendVerificationEmail();
      show("Verification email sent!", "success");
      setSent(true);
      setCooldown(60);
    } catch (e: any) {
      show(e.message ?? "Failed to send verification email", "error");
    } finally {
      setSending(false);
    }
  }, [show]);

  if (user?.emailVerified)
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="settings-verify-icon verified" aria-hidden="true">
          <svg width="18" height="18" fill="none" stroke="#34d399" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="settings-verify-status verified">Email verified</p>
          <p className="settings-verify-email">{user.email}</p>
        </div>
      </div>
    );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div className="settings-verify-icon pending" aria-hidden="true">
          <svg width="18" height="18" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="settings-verify-status pending">Email not verified</p>
          <p className="settings-verify-email">{user?.email}</p>
        </div>
      </div>
      {sent && (
        <div className="settings-sent-banner" style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: "#00f5d4", fontFamily: "DM Sans, sans-serif", margin: 0 }}>
            ✓ Check your inbox at <strong>{user?.email}</strong> and click the verification link.
          </p>
        </div>
      )}
      <Btn label={cooldown > 0 ? `Resend in ${cooldown}s` : sent ? "Resend email" : "Send verification email"}
        onClick={cooldown > 0 ? undefined : send} loading={sending} disabled={cooldown > 0} />
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={dismiss} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ACCOUNT INFO
══════════════════════════════════════════════════════════════ */
function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  if (phone.length <= 4) return phone;
  return phone.slice(0, phone.length - 4).replace(/./g, "•") + phone.slice(-4);
}

function formatStatus(status: string | null | undefined): string {
  if (!status) return "Not submitted";
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function AccountInfo() {
  const { user } = useProfile();
  const { isDark } = useTheme();
  if (!user) return null;

  const rows: [string, string][] = [
    ["User ID",      `#${user.id}`],
    ["Username",     `@${user.username}`],
    ["Email",        user.email],
    ["Phone",        maskPhone(user.phoneNumber)],
    ["Roles",        (user.roles ?? []).join(", ") || "None"],
    ["Account",      formatStatus(user.accountStatus)],
    ["KYC",          formatStatus(user.kycStatus)],
    ["Member since", new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
  ];

  return (
    <dl style={{ margin: 0 }}>
      {rows.map(([k, v], i) => (
        <div key={k} className={`settings-info-row ${isDark ? "dark" : "light"}`}
          style={{ borderBottom: i < rows.length - 1 ? isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)" : "none" }}>
          <dt className="settings-info-key">{k}</dt>
          <dd className="settings-info-value">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ══════════════════════════════════════════════════════════════
   DEACTIVATE
══════════════════════════════════════════════════════════════ */
function DeactivateSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <div className="settings-danger-card">
      <p className="settings-danger-title">Deactivate account</p>
      <p className="settings-danger-desc">This will suspend your account. Contact support to reactivate at any time.</p>
      {showConfirm ? (
        <div role="alert" className="settings-danger-confirm">
          <p className="settings-danger-confirm-text">Please contact <strong>support@crowdspark.in</strong> to deactivate your account.</p>
          <Btn label="Dismiss" variant="outline" onClick={() => setShowConfirm(false)} />
        </div>
      ) : (
        <Btn label="Deactivate my account" variant="danger" onClick={() => setShowConfirm(true)} />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SETTINGS PAGE
══════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const { user, loading } = useProfile();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || loading)
    return <div className="settings-loading"><div className="settings-spinner" /></div>;

  const isCreator = user?.roles?.includes("CREATOR");

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 60px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: "var(--text)", letterSpacing: "-0.03em", margin: "0 0 6px" }}>
          Settings
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>
          Manage verification, creator status, and account details.
        </p>
      </div>

      <Section title="Email Verification" icon="📧" subtitle="Verify your email to unlock all features (+15% completion)">
        <EmailVerification />
      </Section>

      <Section title={isCreator ? "Creator Status" : "Become a Creator"} icon="🚀"
        subtitle={isCreator ? "Your KYC verification details" : "3-step process to start launching campaigns"}>
        <BecomeCreatorWizard />
      </Section>

      <Section title="Account Information" icon="🪪" subtitle="Your account details and current status">
        <AccountInfo />
      </Section>

      <Section title="Danger Zone" icon="⚠️">
        <DeactivateSection />
      </Section>

      <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}`}</style>
    </div>
  );
}