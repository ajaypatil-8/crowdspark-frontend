"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi, creatorApi, type KycSubmitRequest } from "@/lib/api";
import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/contexts/ThemeContext";

type Step = "start" | "otp-sent" | "otp-verified" | "docs" | "submitted";
interface DocUpload { url: string; publicId: string; fileName: string; preview: string }

const IcMail = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IcCheck = ({ s = 12 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcUpload = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
  </svg>
);
const IcShield = ({ s = 12 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IcRocket = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
  </svg>
);
const IcClock = ({ s = 24 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcZap = ({ s = 24 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IcCircleCheck = ({ s = 28 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

function StepBar({ step }: { step: Step }) {
  const { isDark } = useTheme();
  const steps = ["Email OTP", "Verify", "Documents", "Submit"];
  const cur = step === "start" ? 0 : step === "otp-sent" ? 1 : (step === "otp-verified" || step === "docs") ? 2 : 3;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
      {steps.map((s, i) => {
        const done = i < cur; const active = i === cur;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "Syne, sans-serif", flexShrink: 0, background: done ? "#34d399" : active ? "linear-gradient(135deg,#ff6b00,#ffcc00)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"), color: (done || active) ? "#fff" : "var(--text-muted)", boxShadow: active ? "0 0 12px rgba(255,100,0,0.4)" : "none", transition: "all 0.3s" }}>
                {done ? <IcCheck s={12} /> : i + 1}
              </div>
              <span style={{ fontSize: 10.5, fontFamily: "DM Sans, sans-serif", color: active ? "var(--text)" : "var(--text-muted)", fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 1, margin: "0 6px", marginBottom: 16, background: done ? "rgba(52,211,153,0.4)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"), transition: "background 0.3s" }} />}
          </div>
        );
      })}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <div style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`, borderRadius: 16, padding: 24, boxShadow: isDark ? "none" : "0 2px 14px rgba(0,0,0,0.05)", marginBottom: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,140,0,0.3),transparent)", pointerEvents: "none" }} />
      {children}
    </div>
  );
}

function FInput({ label, value, onChange, placeholder, maxLength, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number; type?: string }) {
  const { isDark } = useTheme();
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11.5, fontFamily: "DM Sans, sans-serif", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, boxSizing: "border-box" as const, fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)", color: "var(--text)", transition: "border-color 0.15s" }} />
    </div>
  );
}

function DocRow({ label, doc, inputRef, onChange, busy }: { label: string; doc: DocUpload | null; inputRef: React.MutableRefObject<HTMLInputElement | null>; onChange: (f: File) => void; busy: boolean }) {
  const { isDark } = useTheme();
  const has = !!doc;
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${has ? "rgba(52,211,153,0.3)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)")}`, background: has ? "rgba(52,211,153,0.04)" : (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"), overflow: "hidden", transition: "all 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: has ? "rgba(52,211,153,0.1)" : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"), display: "flex", alignItems: "center", justifyContent: "center", color: has ? "#34d399" : "var(--text-muted)" }}>
          {has ? <IcCheck s={14} /> : <IcUpload s={14} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color: "var(--text)", margin: 0 }}>{label}</p>
          {has && <p style={{ fontSize: 11.5, color: "#34d399", margin: "2px 0 0", fontFamily: "DM Sans, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.fileName}</p>}
        </div>
        <input ref={inputRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
        <button onClick={() => inputRef.current?.click()} disabled={busy}
          style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${has ? "rgba(52,211,153,0.3)" : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)")}`, background: has ? "transparent" : "linear-gradient(135deg,#ff6b00,#ffcc00)", color: has ? "#34d399" : "#fff", fontSize: 12.5, fontFamily: "DM Sans, sans-serif", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "opacity 0.15s" }}>
          {has ? "Replace" : "Upload"}
        </button>
      </div>
      {has && doc.preview && (
        <div style={{ padding: "0 14px 12px" }}>
          <img src={doc.preview} alt={label} style={{ width: "100%", maxHeight: 100, objectFit: "cover", borderRadius: 8, border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }} />
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, color: "var(--text-muted)", margin: "5px 0 0", textAlign: "right" }}>Preview — will upload on submit</p>
        </div>
      )}
    </div>
  );
}

function PrimaryBtn({ label, onClick, busy, disabled }: { label: string; onClick: () => void; busy?: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={busy || disabled}
      style={{ padding: "12px 24px", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", border: "none", borderRadius: 11, fontSize: 14, fontWeight: 700, fontFamily: "Syne, sans-serif", cursor: (busy || disabled) ? "not-allowed" : "pointer", opacity: (busy || disabled) ? 0.65 : 1, position: "relative", overflow: "hidden", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 0 20px rgba(255,100,0,0.3)", transition: "opacity 0.18s" }}>
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "bcshimmer 2.4s ease-in-out infinite" }} />
      {busy && <span style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "bcspin .7s linear infinite", flexShrink: 0, position: "relative" }} />}
      <span style={{ position: "relative" }}>{busy ? "Please wait…" : label}</span>
    </button>
  );
}

function GhostBtn({ label, onClick }: { label: string; onClick: () => void }) {
  const { isDark } = useTheme();
  return (
    <button onClick={onClick} style={{ padding: "12px 24px", background: "none", color: "var(--text-muted)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, borderRadius: 11, fontSize: 14, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>{label}</button>
  );
}

function StatusCard({ icon, iconBg, iconBorder, iconColor, title, titleColor, desc, children }: { icon: React.ReactNode; iconBg: string; iconBorder: string; iconColor: string; title: string; titleColor: string; desc: string; children?: React.ReactNode }) {
  return (
    <Card>
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, margin: "0 auto 16px", background: iconBg, border: `1px solid ${iconBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor }}>{icon}</div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: titleColor, margin: "0 0 8px", letterSpacing: "-0.02em" }}>{title}</h2>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: "0 0 20px", lineHeight: 1.7, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>{desc}</p>
        {children}
      </div>
    </Card>
  );
}

export default function BecomeCreatorPage() {
  const router = useRouter();
  const { user, loading, refetch } = useProfile();
  const { isDark } = useTheme();
  const [step, setStep] = useState<Step>("start");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [panDoc, setPanDoc] = useState<DocUpload | null>(null);
  const [aadhaarFront, setAadhaarFront] = useState<DocUpload | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<DocUpload | null>(null);
  const [kyc, setKyc] = useState({ panNumber: "", aadhaarNumber: "", bankAccountHolderName: "", bankAccountNumber: "", bankIfscCode: "", bankName: "", bankBranchName: "", upiId: "" });
  const panRef = useRef<HTMLInputElement | null>(null);
  const afRef = useRef<HTMLInputElement | null>(null);
  const abRef = useRef<HTMLInputElement | null>(null);
  const kycStatus = user?.kycStatus ?? (user?.kycVerified ? "APPROVED" : "NOT_SUBMITTED");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setError(null); setSuccessMsg(null);
    try { await fn(); } catch (e: any) { setError(e.message || "Something went wrong"); } finally { setBusy(false); }
  };

  const uploadDoc = async (file: File, setter: (d: DocUpload) => void) => {
    setBusy(true); setError(null);
    try {
      const preview = URL.createObjectURL(file);
      const r = await creatorApi.uploadKycDoc(file);
      setter({ url: r.secure_url, publicId: r.public_id, fileName: file.name, preview });
    } catch (e: any) { setError(e.message || "Upload failed"); } finally { setBusy(false); }
  };

  const handleSendOtp = () => run(async () => { await creatorApi.sendOtp(); setStep("otp-sent"); setSuccessMsg(`OTP sent to ${user?.email}. Valid 10 minutes.`); });
  const handleVerifyOtp = () => run(async () => {
    if (otp.length !== 6) throw new Error("Enter the 6-digit OTP");
    await creatorApi.verifyOtp(otp);
    await authApi.refresh(localStorage.getItem("cs_refresh") || "");
    await refetch(); setStep("otp-verified"); setSuccessMsg("Email verified! Upload your documents.");
    setTimeout(() => setStep("docs"), 1500);
  });

  const handleSubmitKyc = () => run(async () => {
    if (!panDoc) throw new Error("Upload your PAN card");
    if (!aadhaarFront) throw new Error("Upload Aadhaar front");
    if (!aadhaarBack) throw new Error("Upload Aadhaar back");
    if (!kyc.panNumber) throw new Error("PAN number required");
    if (!kyc.aadhaarNumber) throw new Error("Aadhaar number required");
    if (!kyc.bankAccountHolderName) throw new Error("Account holder name required");
    if (!kyc.bankAccountNumber) throw new Error("Bank account number required");
    if (!kyc.bankIfscCode) throw new Error("IFSC code required");
    if (!kyc.bankName) throw new Error("Bank name required");
    if (!kyc.upiId) throw new Error("UPI ID required");
    const payload: KycSubmitRequest = { panNumber: kyc.panNumber.toUpperCase(), panCardImageUrl: panDoc.url, panCardImagePublicId: panDoc.publicId, aadhaarNumber: kyc.aadhaarNumber, aadhaarFrontImageUrl: aadhaarFront.url, aadhaarFrontPublicId: aadhaarFront.publicId, aadhaarBackImageUrl: aadhaarBack.url, aadhaarBackPublicId: aadhaarBack.publicId, bankAccountHolderName: kyc.bankAccountHolderName, bankAccountNumber: kyc.bankAccountNumber, bankIfscCode: kyc.bankIfscCode.toUpperCase(), bankName: kyc.bankName, bankBranchName: kyc.bankBranchName || undefined, upiId: kyc.upiId };
    await creatorApi.submitKyc(payload); await refetch(); setStep("submitted");
  });

  if (!loading && user) {
    if (kycStatus === "APPROVED") return (
      <div style={{ padding: "40px 36px" }}>
        <StatusCard icon={<IcZap s={28} />} iconBg="rgba(52,211,153,0.1)" iconBorder="rgba(52,211,153,0.3)" iconColor="#34d399" title="You're a Verified Creator!" titleColor="var(--text)" desc="Your KYC has been approved. You can now create and launch campaigns.">
          <PrimaryBtn label="Go to My Campaigns →" onClick={() => router.push("/dashboard/my-campaigns")} />
        </StatusCard>
      </div>
    );
    if (kycStatus === "PENDING_APPROVAL") return (
      <div style={{ padding: "40px 36px" }}>
        <StatusCard icon={<IcClock s={28} />} iconBg="rgba(167,139,250,0.1)" iconBorder="rgba(167,139,250,0.3)" iconColor="#a78bfa" title="KYC Under Review" titleColor="var(--text)" desc="Your documents are being reviewed by our team. Usually 1–2 business days." />
      </div>
    );
  }

  if (loading) return <div style={{ padding: "40px 36px", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 14 }}>Loading…</div>;

  return (
    <div style={{ padding: "40px 36px 60px", maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Creator Verification</p>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Become a Creator</h1>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: 0 }}>Complete KYC verification to start creating campaigns</p>
      </div>

      <StepBar step={step} />

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 20, color: "#ef4444", fontSize: 13.5, fontFamily: "DM Sans, sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", marginBottom: 20, color: "#34d399", fontSize: 13.5, fontFamily: "DM Sans, sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
          <IcCheck s={14} />{successMsg}
        </div>
      )}

      {step === "start" && (
        <Card>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800", flexShrink: 0 }}><IcMail s={18} /></div>
            <div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", margin: "0 0 4px" }}>Step 1: Verify your email</h2>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>We'll send a 6-digit OTP to <strong style={{ color: "var(--text)" }}>{user?.email}</strong></p>
            </div>
          </div>
          <PrimaryBtn label="Send OTP →" onClick={handleSendOtp} busy={busy} />
        </Card>
      )}

      {step === "otp-sent" && (
        <Card>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 22 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800", flexShrink: 0 }}><IcMail s={18} /></div>
            <div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", margin: "0 0 4px" }}>Step 2: Enter OTP</h2>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Sent to <strong style={{ color: "var(--text)" }}>{user?.email}</strong></p>
            </div>
          </div>
          <input type="text" value={otp} maxLength={6} placeholder="••••••"
            onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 12, boxSizing: "border-box" as const, fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 800, textAlign: "center", letterSpacing: "0.4em", outline: "none", border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)", color: "var(--text)", marginBottom: 16 }} />
          <div style={{ display: "flex", gap: 10 }}>
            <PrimaryBtn label="Verify OTP →" onClick={handleVerifyOtp} busy={busy} disabled={otp.length !== 6} />
            <GhostBtn label="Resend" onClick={handleSendOtp} />
          </div>
        </Card>
      )}

      {(step === "otp-verified" || step === "docs") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Card>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 4px" }}>Step 3: Upload Documents</h2>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: "0 0 16px" }}>Upload clear, readable images. All 3 required.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <DocRow label="PAN Card" doc={panDoc} inputRef={panRef} onChange={f => uploadDoc(f, setPanDoc)} busy={busy} />
              <DocRow label="Aadhaar — Front" doc={aadhaarFront} inputRef={afRef} onChange={f => uploadDoc(f, setAadhaarFront)} busy={busy} />
              <DocRow label="Aadhaar — Back" doc={aadhaarBack} inputRef={abRef} onChange={f => uploadDoc(f, setAadhaarBack)} busy={busy} />
            </div>
          </Card>
          <Card>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 16px" }}>Step 4: KYC Details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }} className="bc-grid">
              <FInput label="PAN Number" value={kyc.panNumber} onChange={v => setKyc({ ...kyc, panNumber: v.toUpperCase() })} placeholder="ABCDE1234F" maxLength={10} />
              <FInput label="Aadhaar Number" value={kyc.aadhaarNumber} onChange={v => { let r = v.replace(/\D/g, "").slice(0, 12); r = r.replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) => c ? `${a}-${b}-${c}` : b ? `${a}-${b}` : a); setKyc({ ...kyc, aadhaarNumber: r }); }} placeholder="1234-5678-9012" maxLength={14} />
              <div style={{ gridColumn: "1/-1" }}><FInput label="Account Holder Name" value={kyc.bankAccountHolderName} onChange={v => setKyc({ ...kyc, bankAccountHolderName: v })} placeholder="Full name on account" /></div>
              <FInput label="Account Number" value={kyc.bankAccountNumber} onChange={v => setKyc({ ...kyc, bankAccountNumber: v.replace(/\D/g, "") })} placeholder="Account number" />
              <FInput label="IFSC Code" value={kyc.bankIfscCode} onChange={v => setKyc({ ...kyc, bankIfscCode: v.toUpperCase() })} placeholder="HDFC0001234" maxLength={11} />
              <FInput label="Bank Name" value={kyc.bankName} onChange={v => setKyc({ ...kyc, bankName: v })} placeholder="HDFC Bank" />
              <FInput label="Branch Name" value={kyc.bankBranchName} onChange={v => setKyc({ ...kyc, bankBranchName: v })} placeholder="e.g. Koregaon Park" />
              <FInput label="UPI ID" value={kyc.upiId} onChange={v => setKyc({ ...kyc, upiId: v })} placeholder="yourname@upi" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", borderRadius: 8, marginBottom: 16, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, color: "var(--text-muted)" }}>
              <IcShield s={12} /><span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5 }}>Documents are encrypted and stored securely.</span>
            </div>
            <PrimaryBtn label="Submit KYC Application →" onClick={handleSubmitKyc} busy={busy} disabled={!panDoc || !aadhaarFront || !aadhaarBack} />
          </Card>
        </div>
      )}

      {step === "submitted" && (
        <StatusCard icon={<IcCircleCheck s={28} />} iconBg="rgba(52,211,153,0.1)" iconBorder="rgba(52,211,153,0.3)" iconColor="#34d399" title="KYC Submitted!" titleColor="var(--text)" desc={`Your documents are under review. We'll notify you at ${user?.email} once approved. Usually 1–2 business days.`} />
      )}

      <style>{`
        @keyframes bcshimmer{0%{transform:translateX(-100%)}60%{transform:translateX(200%)}100%{transform:translateX(200%)}}
        @keyframes bcspin{to{transform:rotate(360deg)}}
        @media(max-width:520px){.bc-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}