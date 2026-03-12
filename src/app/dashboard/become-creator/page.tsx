"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authApi, creatorApi, KycSubmitRequest } from "@/lib/api";
import { useProfile } from "@/contexts/ProfileContext";

type Step = "start" | "otp-sent" | "otp-verified" | "docs" | "submitted";

interface DocUpload {
  url: string;
  publicId: string;
  fileName: string;
}

export default function BecomeCreatorPage() {
  const router = useRouter();
  const { user, loading, refetch } = useProfile();

  const [step, setStep] = useState<Step>("start");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // KYC form
  const [panDoc, setPanDoc] = useState<DocUpload | null>(null);
  const [aadhaarFront, setAadhaarFront] = useState<DocUpload | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<DocUpload | null>(null);

  const [kyc, setKyc] = useState({
    panNumber: "",
    aadhaarNumber: "",
    bankAccountHolderName: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    bankName: "",
    bankBranchName: "",
    upiId: "",
  });

  const panRef = useRef<HTMLInputElement | null>(null);
  const aadhaarFrontRef = useRef<HTMLInputElement | null>(null);
  const aadhaarBackRef = useRef<HTMLInputElement | null>(null);

  const kycStatus = user?.kycStatus ?? (user?.kycVerified ? "APPROVED" : "NOT_SUBMITTED");

  if (!loading && user) {
    if (kycStatus === "APPROVED") {
      return (
        <div style={{ padding: 48 }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={headingStyle}>You&apos;re already a verified creator!</h2>
            <p style={mutedStyle}>Your KYC has been approved. Start creating your campaigns.</p>
            <button onClick={() => router.push("/dashboard/my-campaigns")} style={primaryBtn}>
              Go to My Campaigns
            </button>
          </div>
        </div>
      );
    }

    if (kycStatus === "PENDING_APPROVAL") {
      return (
        <div style={{ padding: 48 }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 style={headingStyle}>KYC Under Review</h2>
            <p style={mutedStyle}>
              Your documents are being reviewed by our team. This usually takes 1–2 business days.
            </p>
          </div>
        </div>
      );
    }
  }

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await fn();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = () =>
    run(async () => {
      await creatorApi.sendOtp();
      setStep("otp-sent");
      setSuccessMsg(`OTP sent to ${user?.email}. Valid for 10 minutes.`);
    });

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = () =>
    run(async () => {
      if (otp.length !== 6) throw new Error("Enter the 6-digit OTP");
      await creatorApi.verifyOtp(otp);
      // CRITICAL: refresh JWT so it now contains CREATOR role
      await authApi.refresh(localStorage.getItem("cs_refresh") || "");
      await refetch(); // update user in context
      setStep("otp-verified");
      setSuccessMsg("OTP verified! You now have CREATOR role. Please upload your documents.");
      setTimeout(() => setStep("docs"), 1500);
    });

  // ── Step 3: Upload individual document ────────────────────────────────────
  const uploadDoc = async (
    file: File,
    setter: (d: DocUpload) => void
  ) => {
    setBusy(true);
    setError(null);
    try {
      const result = await creatorApi.uploadKycDoc(file);
      setter({
        url: result.secure_url,
        publicId: result.public_id,
        fileName: file.name,
      });
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  // ── Step 4: Submit KYC ────────────────────────────────────────────────────
  const handleSubmitKyc = () =>
    run(async () => {
      if (!panDoc) throw new Error("Please upload your PAN card");
      if (!aadhaarFront) throw new Error("Please upload Aadhaar front");
      if (!aadhaarBack) throw new Error("Please upload Aadhaar back");
      if (!kyc.panNumber) throw new Error("PAN number is required");
      if (!kyc.aadhaarNumber) throw new Error("Aadhaar number is required");
      if (!kyc.bankAccountHolderName) throw new Error("Account holder name is required");
      if (!kyc.bankAccountNumber) throw new Error("Bank account number is required");
      if (!kyc.bankIfscCode) throw new Error("IFSC code is required");
      if (!kyc.bankName) throw new Error("Bank name is required");
      if (!kyc.upiId) throw new Error("UPI ID is required");

      const payload: KycSubmitRequest = {
        panNumber: kyc.panNumber.toUpperCase(),
        panCardImageUrl: panDoc.url,
        panCardImagePublicId: panDoc.publicId,
        aadhaarNumber: kyc.aadhaarNumber,
        aadhaarFrontImageUrl: aadhaarFront.url,
        aadhaarFrontPublicId: aadhaarFront.publicId,
        aadhaarBackImageUrl: aadhaarBack.url,
        aadhaarBackPublicId: aadhaarBack.publicId,
        bankAccountHolderName: kyc.bankAccountHolderName,
        bankAccountNumber: kyc.bankAccountNumber,
        bankIfscCode: kyc.bankIfscCode.toUpperCase(),
        bankName: kyc.bankName,
        bankBranchName: kyc.bankBranchName || undefined,
        upiId: kyc.upiId,
      };

      await creatorApi.submitKyc(payload);
      await refetch();
      setStep("submitted");
    });

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return <div style={{ padding: 48, color: "var(--text-muted)" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 640 }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
        Become a Creator
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 40 }}>
        Complete KYC verification to start creating campaigns
      </p>

      {/* Progress */}
      <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
        {["Email OTP", "Verify", "Documents", "Submit"].map((s, i) => {
          const stepNum = i + 1;
          const currentNum =
            step === "start" ? 1
            : step === "otp-sent" ? 2
            : step === "otp-verified" ? 3
            : step === "docs" ? 3
            : 4;
          const done = stepNum < currentNum;
          const active = stepNum === currentNum;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: done ? "#00cc66" : active ? "var(--accent, #ff6b00)" : "#222",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}
              >
                {done ? "✓" : stepNum}
              </div>
              <span style={{ fontSize: 12, color: active ? "var(--text)" : "var(--text-muted)" }}>{s}</span>
              {i < 3 && <div style={{ flex: 1, height: 1, background: done ? "#00cc6666" : "#222" }} />}
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{ background: "#ff000018", border: "1px solid #ff4444", borderRadius: 8, padding: "12px 16px", marginBottom: 24, color: "#ff6666", fontSize: 14 }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ background: "#00ff8818", border: "1px solid #00cc66", borderRadius: 8, padding: "12px 16px", marginBottom: 24, color: "#00cc66", fontSize: 14 }}>
          {successMsg}
        </div>
      )}

      {/* Step: Start */}
      {step === "start" && (
        <div style={cardStyle}>
          <h2 style={headingStyle}>Step 1: Verify your email</h2>
          <p style={mutedStyle}>
            We&apos;ll send a 6-digit OTP to <strong style={{ color: "var(--text)" }}>{user?.email}</strong>
          </p>
          <button onClick={handleSendOtp} disabled={busy} style={primaryBtn}>
            {busy ? "Sending..." : "Send OTP"}
          </button>
        </div>
      )}

      {/* Step: OTP sent */}
      {step === "otp-sent" && (
        <div style={cardStyle}>
          <h2 style={headingStyle}>Step 2: Enter OTP</h2>
          <p style={mutedStyle}>Enter the 6-digit code sent to {user?.email}</p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            placeholder="123456"
            style={{ ...inputStyle, fontSize: 24, letterSpacing: "0.3em", textAlign: "center", marginBottom: 16 }}
          />
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={handleVerifyOtp} disabled={busy || otp.length !== 6} style={primaryBtn}>
              {busy ? "Verifying..." : "Verify OTP"}
            </button>
            <button onClick={handleSendOtp} disabled={busy} style={ghostBtn}>
              Resend
            </button>
          </div>
        </div>
      )}

      {/* Step: Upload docs */}
      {(step === "otp-verified" || step === "docs") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={cardStyle}>
            <h2 style={headingStyle}>Step 3: Upload Documents</h2>
            <p style={mutedStyle}>Upload clear, readable images. All 3 are required.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
              <DocUploadRow
                label="PAN Card"
                doc={panDoc}
                inputRef={panRef}
                onChange={(file) => uploadDoc(file, setPanDoc)}
                busy={busy}
              />
              <DocUploadRow
                label="Aadhaar — Front"
                doc={aadhaarFront}
                inputRef={aadhaarFrontRef}
                onChange={(file) => uploadDoc(file, setAadhaarFront)}
                busy={busy}
              />
              <DocUploadRow
                label="Aadhaar — Back"
                doc={aadhaarBack}
                inputRef={aadhaarBackRef}
                onChange={(file) => uploadDoc(file, setAadhaarBack)}
                busy={busy}
              />
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={headingStyle}>Step 4: KYC Details</h2>

            {/* PAN */}
            <FormRow label="PAN Number (ABCDE1234F)">
              <input
                style={inputStyle}
                value={kyc.panNumber}
                onChange={(e) => setKyc({ ...kyc, panNumber: e.target.value.toUpperCase() })}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            </FormRow>

            {/* Aadhaar */}
            <FormRow label="Aadhaar Number (XXXX-XXXX-XXXX)">
              <input
                style={inputStyle}
                value={kyc.aadhaarNumber}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "").slice(0, 12);
                  v = v.replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) =>
                    c ? `${a}-${b}-${c}` : b ? `${a}-${b}` : a
                  );
                  setKyc({ ...kyc, aadhaarNumber: v });
                }}
                placeholder="1234-5678-9012"
                maxLength={14}
              />
            </FormRow>

            {/* Bank */}
            <FormRow label="Account Holder Name">
              <input style={inputStyle} value={kyc.bankAccountHolderName}
                onChange={(e) => setKyc({ ...kyc, bankAccountHolderName: e.target.value })}
                placeholder="As per bank records" />
            </FormRow>
            <FormRow label="Bank Account Number">
              <input style={inputStyle} value={kyc.bankAccountNumber}
                onChange={(e) => setKyc({ ...kyc, bankAccountNumber: e.target.value.replace(/\D/g, "") })}
                placeholder="Account number" />
            </FormRow>
            <FormRow label="IFSC Code (HDFC0001234)">
              <input style={inputStyle} value={kyc.bankIfscCode}
                onChange={(e) => setKyc({ ...kyc, bankIfscCode: e.target.value.toUpperCase() })}
                placeholder="HDFC0001234" maxLength={11} />
            </FormRow>
            <FormRow label="Bank Name">
              <input style={inputStyle} value={kyc.bankName}
                onChange={(e) => setKyc({ ...kyc, bankName: e.target.value })}
                placeholder="e.g. HDFC Bank" />
            </FormRow>
            <FormRow label="Branch Name (optional)">
              <input style={inputStyle} value={kyc.bankBranchName}
                onChange={(e) => setKyc({ ...kyc, bankBranchName: e.target.value })}
                placeholder="e.g. Koregaon Park" />
            </FormRow>

            {/* UPI */}
            <FormRow label="UPI ID (name@upi)">
              <input style={inputStyle} value={kyc.upiId}
                onChange={(e) => setKyc({ ...kyc, upiId: e.target.value })}
                placeholder="yourname@upi" />
            </FormRow>

            <button
              onClick={handleSubmitKyc}
              disabled={busy || !panDoc || !aadhaarFront || !aadhaarBack}
              style={{ ...primaryBtn, marginTop: 8 }}
            >
              {busy ? "Submitting..." : "Submit KYC Application"}
            </button>
          </div>
        </div>
      )}

      {/* Step: Submitted */}
      {step === "submitted" && (
        <div style={cardStyle}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={headingStyle}>KYC Submitted!</h2>
          <p style={mutedStyle}>
            Your documents are under review. We&apos;ll notify you at {user?.email} once approved.
            This usually takes 1–2 business days.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DocUploadRow({
  label,
  doc,
  inputRef,
  onChange,
  busy,
}: {
  label: string;
  doc: { url: string; publicId: string; fileName: string } | null;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  onChange: (file: File) => void;
  busy: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        background: doc ? "#00ff8808" : "#0a0a0a",
        border: `1px solid ${doc ? "#00cc6644" : "#222"}`,
        borderRadius: 8,
        gap: 16,
      }}
    >
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{label}</p>
        {doc && (
          <p style={{ fontSize: 12, color: "#00cc66", margin: "2px 0 0" }}>✓ {doc.fileName}</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        style={{
          padding: "8px 16px",
          background: doc ? "#0a0a0a" : "var(--accent, #ff6b00)",
          color: doc ? "var(--text-muted)" : "#fff",
          border: doc ? "1px solid #333" : "none",
          borderRadius: 6,
          fontSize: 13,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {doc ? "Replace" : "Upload"}
      </button>
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "#111",
  border: "1px solid #1e1e1e",
  borderRadius: 12,
  padding: 28,
};

const headingStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: "var(--text)",
  margin: "0 0 8px",
};

const mutedStyle: React.CSSProperties = {
  fontSize: 14,
  color: "var(--text-muted)",
  margin: "0 0 20px",
};

const primaryBtn: React.CSSProperties = {
  padding: "12px 24px",
  background: "var(--accent, #ff6b00)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  padding: "12px 24px",
  background: "none",
  color: "var(--text-muted)",
  border: "1px solid #333",
  borderRadius: 8,
  fontSize: 14,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "#0a0a0a",
  border: "1px solid #2a2a2a",
  borderRadius: 8,
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};