"use client";
import {
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  authApi,
  creatorApi,
  type KycSubmitRequest,
} from "@/lib/api";
import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/contexts/ThemeContext";

type Step =
  | "start"
  | "otp-sent"
  | "otp-verified"
  | "docs"
  | "submitted";

interface DocUpload {
  url: string;
  publicId: string;
  fileName: string;
  preview: string;
}

async function safeCall(
  fn: () => Promise<unknown>,
): Promise<void> {
  try {
    await fn();
  } catch (e: unknown) {
    const msg =
      e instanceof Error
        ? e.message
        : String(e);
    const isJsonError =
      e instanceof SyntaxError ||
      msg.includes("is not valid JSON") ||
      msg.includes("Unexpected token") ||
      msg.includes("JSON.parse");
    if (!isJsonError) throw e;
  }
}

const IcMail = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IcCheck = ({ s = 12 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round"
    strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcUpload = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
  </svg>
);
const IcShield = ({ s = 13 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IcZap = ({ s = 28 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round"
    strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IcClock = ({ s = 28 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcCircleOk = ({ s = 28 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IcInfo = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

function StepBar({ step }: { step: Step }) {
  const { isDark } = useTheme();
  const steps = [
    "Email OTP",
    "Verify",
    "Documents",
    "Submit",
  ];
  const cur =
    step === "start" ? 0
    : step === "otp-sent" ? 1
    : step === "otp-verified" || step === "docs" ? 2
    : 3;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        marginBottom: 32,
      }}
    >
      {steps.map((s, i) => {
        const done = i < cur;
        const active = i === cur;
        const lineColor = done
          ? "#34d399"
          : isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.1)";

        return (
          <div
            key={s}
            style={{
              display: "flex",
              alignItems: "flex-start",
              flex: i < steps.length - 1 ? 1 : undefined,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <motion.div
                animate={{
                  boxShadow: active
                    ? "0 0 0 4px rgba(255,107,0,0.15)"
                    : "0 0 0 0px transparent",
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "Syne, sans-serif",
                  flexShrink: 0,
                  background: done
                    ? "#34d399"
                    : active
                      ? "linear-gradient(135deg,#ff6b00,#ffcc00)"
                      : isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.07)",
                  color:
                    done || active
                      ? "#fff"
                      : "var(--text-muted)",
                  transition: "all 0.3s",
                }}
              >
                {done ? <IcCheck s={13} /> : i + 1}
              </motion.div>
              <span
                style={{
                  fontSize: 10.5,
                  fontFamily: "DM Sans, sans-serif",
                  color: active
                    ? "var(--text)"
                    : "var(--text-muted)",
                  fontWeight: active ? 600 : 400,
                  whiteSpace: "nowrap",
                }}
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  margin: "15px 6px 0",
                  background: lineColor,
                  transition: "background 0.4s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Card({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay,
        ease: "easeOut",
      }}
      style={{
        background: isDark
          ? "rgba(255,255,255,0.03)"
          : "#ffffff",
        border: `1px solid ${
          isDark
            ? "rgba(255,255,255,0.07)"
            : "rgba(0,0,0,0.07)"
        }`,
        borderRadius: 18,
        padding: 24,
        boxShadow: isDark
          ? "none"
          : "0 2px 20px rgba(0,0,0,0.05)",
        marginBottom: 16,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 1,
          background:
            "linear-gradient(90deg,transparent,rgba(255,140,0,0.35),transparent)",
          pointerEvents: "none",
        }}
      />
      {children}
    </motion.div>
  );
}

function FInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
}) {
  const { isDark } = useTheme();
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontFamily: "DM Sans, sans-serif",
          fontWeight: 700,
          color: "var(--text-muted)",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          boxSizing: "border-box" as const,
          fontFamily: "DM Sans, sans-serif",
          fontSize: 14,
          outline: "none",
          border: `1px solid ${
            isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)"
          }`,
          background: isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(0,0,0,0.025)",
          color: "var(--text)",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor =
            "rgba(255,107,0,0.5)";
          e.currentTarget.style.boxShadow =
            "0 0 0 3px rgba(255,107,0,0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.1)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

function DocRow({
  label,
  doc,
  inputRef,
  onChange,
  busy,
}: {
  label: string;
  doc: DocUpload | null;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  onChange: (f: File) => void;
  busy: boolean;
}) {
  const { isDark } = useTheme();
  const has = !!doc;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        borderRadius: 12,
        border: `1px solid ${
          has
            ? "rgba(52,211,153,0.3)"
            : isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.07)"
        }`,
        background: has
          ? isDark
            ? "rgba(52,211,153,0.06)"
            : "rgba(52,211,153,0.03)"
          : isDark
            ? "rgba(255,255,255,0.02)"
            : "rgba(0,0,0,0.01)",
        overflow: "hidden",
        transition: "all 0.25s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            flexShrink: 0,
            background: has
              ? "rgba(52,211,153,0.12)"
              : isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: has
              ? "#34d399"
              : "var(--text-muted)",
          }}
        >
          {has ? (
            <IcCheck s={15} />
          ) : (
            <IcUpload s={15} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--text)",
              margin: 0,
            }}
          >
            {label}
          </p>
          {has && (
            <p
              style={{
                fontSize: 11.5,
                color: "#34d399",
                margin: "2px 0 0",
                fontFamily: "DM Sans, sans-serif",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {doc.fileName}
            </p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
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
            padding: "7px 14px",
            borderRadius: 8,
            border: `1px solid ${
              has
                ? "rgba(52,211,153,0.3)"
                : isDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.12)"
            }`,
            background: has
              ? "transparent"
              : "linear-gradient(135deg,#ff6b00,#ffcc00)",
            color: has ? "#34d399" : "#fff",
            fontSize: 12.5,
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 600,
            cursor: busy ? "wait" : "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "opacity 0.15s",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {has ? "Replace" : "Upload"}
        </button>
      </div>
      <AnimatePresence>
        {has && doc.preview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ padding: "0 14px 12px" }}
          >
            <img
              src={doc.preview}
              alt={label}
              style={{
                width: "100%",
                maxHeight: 90,
                objectFit: "cover",
                borderRadius: 8,
                border: `1px solid ${
                  isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.06)"
                }`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PrimaryBtn({
  label,
  onClick,
  busy,
  disabled,
}: {
  label: string;
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  const inactive = busy || disabled;
  return (
    <motion.button
      whileHover={!inactive ? { scale: 1.02 } : {}}
      whileTap={!inactive ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={inactive}
      style={{
        padding: "12px 24px",
        background:
          "linear-gradient(135deg,#ff6b00,#ffcc00)",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 700,
        fontFamily: "Syne, sans-serif",
        cursor: inactive ? "not-allowed" : "pointer",
        opacity: inactive ? 0.65 : 1,
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        boxShadow: inactive
          ? "none"
          : "0 0 20px rgba(255,100,0,0.3)",
        transition: "opacity 0.18s, box-shadow 0.18s",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)",
          animation:
            "bcShimmer 2.4s ease-in-out infinite",
        }}
      />
      {busy && (
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.4)",
            borderTopColor: "#fff",
            animation: "bcSpin .7s linear infinite",
            flexShrink: 0,
            position: "relative",
          }}
        />
      )}
      <span style={{ position: "relative" }}>
        {busy ? "Please wait…" : label}
      </span>
    </motion.button>
  );
}

function GhostBtn({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const { isDark } = useTheme();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 22px",
        background: "none",
        color: disabled
          ? "var(--text-muted)"
          : "var(--text-muted)",
        border: `1px solid ${
          isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.1)"
        }`,
        borderRadius: 12,
        fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "DM Sans, sans-serif",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.18s",
      }}
    >
      {label}
    </button>
  );
}

function Alert({
  msg,
  type,
}: {
  msg: string;
  type: "error" | "success";
}) {
  const isErr = type === "error";
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: "12px 16px",
        borderRadius: 12,
        background: isErr
          ? "rgba(239,68,68,0.07)"
          : "rgba(52,211,153,0.07)",
        border: `1px solid ${
          isErr
            ? "rgba(239,68,68,0.22)"
            : "rgba(52,211,153,0.22)"
        }`,
        marginBottom: 20,
        color: isErr ? "#ef4444" : "#34d399",
        fontSize: 13.5,
        fontFamily: "DM Sans, sans-serif",
        display: "flex",
        alignItems: "center",
        gap: 9,
      }}
    >
      {isErr ? <IcInfo s={14} /> : <IcCheck s={13} />}
      {msg}
    </motion.div>
  );
}

export default function BecomeCreatorPage() {
  const router = useRouter();
  const { user, loading, refetch } = useProfile();
  const { isDark } = useTheme();
  const [step, setStep] = useState<Step>("start");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );
  const [successMsg, setSuccessMsg] = useState<
    string | null
  >(null);
  const [panDoc, setPanDoc] =
    useState<DocUpload | null>(null);
  const [aadhaarFront, setAadhaarFront] =
    useState<DocUpload | null>(null);
  const [aadhaarBack, setAadhaarBack] =
    useState<DocUpload | null>(null);
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
  const afRef = useRef<HTMLInputElement | null>(null);
  const abRef = useRef<HTMLInputElement | null>(null);

  const kycStatus =
    user?.kycStatus ??
    (user?.kycVerified ? "APPROVED" : "NOT_SUBMITTED");

  const run = useCallback(
    async (fn: () => Promise<void>) => {
      setBusy(true);
      setError(null);
      setSuccessMsg(null);
      try {
        await fn();
      } catch (e: unknown) {
        const msg =
          e instanceof Error
            ? e.message
            : "Something went wrong";
        setError(msg);
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const uploadDoc = useCallback(
    async (
      file: File,
      setter: (d: DocUpload) => void,
    ) => {
      setBusy(true);
      setError(null);
      try {
        const preview = URL.createObjectURL(file);
        const r = await creatorApi.uploadKycDoc(file);
        setter({
          url: r.secure_url,
          publicId: r.public_id,
          fileName: file.name,
          preview,
        });
      } catch (e: unknown) {
        setError(
          e instanceof Error
            ? e.message
            : "Upload failed",
        );
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const handleSendOtp = useCallback(async () => {
    setBusy(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await safeCall(() => creatorApi.sendOtp());
      setStep("otp-sent");
      setSuccessMsg(
        `OTP sent to ${user?.email}. Valid 10 minutes.`,
      );
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to send OTP",
      );
    } finally {
      setBusy(false);
    }
  }, [user?.email]);

  const handleVerifyOtp = useCallback(async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await safeCall(() => creatorApi.verifyOtp(otp));
      const rt = localStorage.getItem("cs_refresh");
      if (rt) {
        try {
          await authApi.refresh(rt);
        } catch {}
      }
      await refetch();
      setSuccessMsg(
        "Email verified! Upload your documents.",
      );
      setStep("otp-verified");
      setTimeout(() => setStep("docs"), 1400);
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Invalid OTP",
      );
    } finally {
      setBusy(false);
    }
  }, [otp, refetch]);

  const handleSubmitKyc = () =>
    run(async () => {
      if (!panDoc) throw new Error("Upload your PAN card");
      if (!aadhaarFront)
        throw new Error("Upload Aadhaar front");
      if (!aadhaarBack)
        throw new Error("Upload Aadhaar back");
      if (!kyc.panNumber)
        throw new Error("PAN number required");
      if (!kyc.aadhaarNumber)
        throw new Error("Aadhaar number required");
      if (!kyc.bankAccountHolderName)
        throw new Error("Account holder name required");
      if (!kyc.bankAccountNumber)
        throw new Error("Account number required");
      if (!kyc.bankIfscCode)
        throw new Error("IFSC code required");
      if (!kyc.bankName)
        throw new Error("Bank name required");
      if (!kyc.upiId)
        throw new Error("UPI ID required");

      const payload: KycSubmitRequest = {
        panNumber: kyc.panNumber.toUpperCase(),
        panCardImageUrl: panDoc.url,
        panCardImagePublicId: panDoc.publicId,
        aadhaarNumber: kyc.aadhaarNumber,
        aadhaarFrontImageUrl: aadhaarFront.url,
        aadhaarFrontPublicId: aadhaarFront.publicId,
        aadhaarBackImageUrl: aadhaarBack.url,
        aadhaarBackPublicId: aadhaarBack.publicId,
        bankAccountHolderName:
          kyc.bankAccountHolderName,
        bankAccountNumber: kyc.bankAccountNumber,
        bankIfscCode: kyc.bankIfscCode.toUpperCase(),
        bankName: kyc.bankName,
        bankBranchName:
          kyc.bankBranchName || undefined,
        upiId: kyc.upiId,
      };

      await creatorApi.submitKyc(payload);
      await refetch();
      setStep("submitted");
    });

  if (!loading && user) {
    if (kycStatus === "APPROVED") {
      return (
        <div style={{ padding: "40px 36px" }}>
          <Card>
            <div
              style={{
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  margin: "0 auto 16px",
                  background: "rgba(52,211,153,0.1)",
                  border:
                    "1px solid rgba(52,211,153,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#34d399",
                }}
              >
                <IcZap s={28} />
              </div>
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
                {"You're a Verified Creator!"}
              </h2>
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 14,
                  color: "var(--text-muted)",
                  margin: "0 0 24px",
                  lineHeight: 1.7,
                }}
              >
                Your KYC has been approved. Launch
                your first campaign.
              </p>
              <PrimaryBtn
                label="Go to My Campaigns →"
                onClick={() =>
                  router.push(
                    "/dashboard/my-campaigns",
                  )
                }
              />
            </div>
          </Card>
        </div>
      );
    }
    if (kycStatus === "PENDING_APPROVAL") {
      return (
        <div style={{ padding: "40px 36px" }}>
          <Card>
            <div
              style={{
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  margin: "0 auto 16px",
                  background:
                    "rgba(167,139,250,0.1)",
                  border:
                    "1px solid rgba(167,139,250,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a78bfa",
                }}
              >
                <IcClock s={28} />
              </div>
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
                KYC Under Review
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
                Your documents are being reviewed.
                Usually 1–2 business days.
              </p>
            </div>
          </Card>
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div
        style={{
          padding: "40px 36px",
          color: "var(--text-muted)",
          fontFamily: "DM Sans, sans-serif",
          fontSize: 14,
        }}
      >
        Loading…
      </div>
    );
  }

  const G2 = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ padding: "40px 36px 60px", maxWidth: 620 }}
    >
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 11,
            color: "var(--text-muted)",
            margin: "0 0 6px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          Creator Verification
        </p>
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "clamp(22px,3vw,30px)",
            fontWeight: 800,
            color: "var(--text)",
            margin: "0 0 6px",
            letterSpacing: "-0.02em",
          }}
        >
          Become a Creator
        </h1>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          Complete KYC verification to start creating
          campaigns
        </p>
      </div>

      <StepBar step={step} />

      <AnimatePresence mode="wait">
        {error && (
          <Alert key="err" msg={error} type="error" />
        )}
        {successMsg && (
          <Alert
            key="ok"
            msg={successMsg}
            type="success"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  marginBottom: 22,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    background:
                      "rgba(255,107,0,0.1)",
                    border:
                      "1px solid rgba(255,107,0,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ff8800",
                    flexShrink: 0,
                  }}
                >
                  <IcMail s={20} />
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "var(--text)",
                      margin: "0 0 5px",
                    }}
                  >
                    Step 1: Verify your email
                  </h2>
                  <p
                    style={{
                      fontFamily:
                        "DM Sans, sans-serif",
                      fontSize: 13.5,
                      color: "var(--text-muted)",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {"We'll send a 6-digit OTP to "}
                    <strong
                      style={{ color: "var(--text)" }}
                    >
                      {user?.email}
                    </strong>
                  </p>
                </div>
              </div>
              <PrimaryBtn
                label="Send OTP →"
                onClick={handleSendOtp}
                busy={busy}
              />
            </Card>
          </motion.div>
        )}

        {step === "otp-sent" && (
          <motion.div
            key="otp-sent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  marginBottom: 22,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    background:
                      "rgba(255,107,0,0.1)",
                    border:
                      "1px solid rgba(255,107,0,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ff8800",
                    flexShrink: 0,
                  }}
                >
                  <IcMail s={20} />
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "var(--text)",
                      margin: "0 0 5px",
                    }}
                  >
                    Step 2: Enter OTP
                  </h2>
                  <p
                    style={{
                      fontFamily:
                        "DM Sans, sans-serif",
                      fontSize: 13.5,
                      color: "var(--text-muted)",
                      margin: 0,
                    }}
                  >
                    Sent to{" "}
                    <strong
                      style={{ color: "var(--text)" }}
                    >
                      {user?.email}
                    </strong>
                  </p>
                </div>
              </div>
              <input
                type="text"
                value={otp}
                maxLength={6}
                placeholder="• • • • • •"
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6),
                  )
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  boxSizing: "border-box" as const,
                  fontFamily: "Syne, sans-serif",
                  fontSize: 30,
                  fontWeight: 800,
                  textAlign: "center",
                  letterSpacing: "0.5em",
                  outline: "none",
                  border: `1.5px solid ${
                    isDark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.15)"
                  }`,
                  background: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.025)",
                  color:
                    otp.length > 0
                      ? "#ff8800"
                      : "var(--text)",
                  marginBottom: 18,
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,107,0,0.5)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(255,107,0,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    isDark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.15)";
                  e.currentTarget.style.boxShadow =
                    "none";
                }}
              />
              <div
                style={{ display: "flex", gap: 10 }}
              >
                <PrimaryBtn
                  label="Verify OTP →"
                  onClick={handleVerifyOtp}
                  busy={busy}
                  disabled={otp.length !== 6}
                />
                <GhostBtn
                  label="Resend"
                  onClick={handleSendOtp}
                  disabled={busy}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {(step === "otp-verified" ||
          step === "docs") && (
          <motion.div
            key="docs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card delay={0}>
              <h2
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--text)",
                  margin: "0 0 5px",
                }}
              >
                Step 3: Upload Documents
              </h2>
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 13,
                  color: "var(--text-muted)",
                  margin: "0 0 16px",
                }}
              >
                Upload clear, readable images. All
                3 are required.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <DocRow
                  label="PAN Card"
                  doc={panDoc}
                  inputRef={panRef}
                  onChange={(f) =>
                    uploadDoc(f, setPanDoc)
                  }
                  busy={busy}
                />
                <DocRow
                  label="Aadhaar — Front"
                  doc={aadhaarFront}
                  inputRef={afRef}
                  onChange={(f) =>
                    uploadDoc(f, setAadhaarFront)
                  }
                  busy={busy}
                />
                <DocRow
                  label="Aadhaar — Back"
                  doc={aadhaarBack}
                  inputRef={abRef}
                  onChange={(f) =>
                    uploadDoc(f, setAadhaarBack)
                  }
                  busy={busy}
                />
              </div>
            </Card>

            <Card delay={0.08}>
              <h2
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--text)",
                  margin: "0 0 16px",
                }}
              >
                Step 4: KYC Details
              </h2>
              <div style={G2} className="bc-grid">
                <FInput
                  label="PAN Number"
                  value={kyc.panNumber}
                  onChange={(v) =>
                    setKyc({
                      ...kyc,
                      panNumber: v.toUpperCase(),
                    })
                  }
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
                <FInput
                  label="Aadhaar Number"
                  value={kyc.aadhaarNumber}
                  onChange={(v) => {
                    let r = v
                      .replace(/\D/g, "")
                      .slice(0, 12);
                    r = r.replace(
                      /(\d{4})(\d{4})(\d{0,4})/,
                      (_, a, b, c) =>
                        c
                          ? `${a}-${b}-${c}`
                          : b
                            ? `${a}-${b}`
                            : a,
                    );
                    setKyc({
                      ...kyc,
                      aadhaarNumber: r,
                    });
                  }}
                  placeholder="1234-5678-9012"
                  maxLength={14}
                />
                <div style={{ gridColumn: "1/-1" }}>
                  <FInput
                    label="Account Holder Name"
                    value={kyc.bankAccountHolderName}
                    onChange={(v) =>
                      setKyc({
                        ...kyc,
                        bankAccountHolderName: v,
                      })
                    }
                    placeholder="Full name on account"
                  />
                </div>
                <FInput
                  label="Account Number"
                  value={kyc.bankAccountNumber}
                  onChange={(v) =>
                    setKyc({
                      ...kyc,
                      bankAccountNumber:
                        v.replace(/\D/g, ""),
                    })
                  }
                  placeholder="Account number"
                />
                <FInput
                  label="IFSC Code"
                  value={kyc.bankIfscCode}
                  onChange={(v) =>
                    setKyc({
                      ...kyc,
                      bankIfscCode: v.toUpperCase(),
                    })
                  }
                  placeholder="HDFC0001234"
                  maxLength={11}
                />
                <FInput
                  label="Bank Name"
                  value={kyc.bankName}
                  onChange={(v) =>
                    setKyc({ ...kyc, bankName: v })
                  }
                  placeholder="HDFC Bank"
                />
                <FInput
                  label="Branch (optional)"
                  value={kyc.bankBranchName}
                  onChange={(v) =>
                    setKyc({
                      ...kyc,
                      bankBranchName: v,
                    })
                  }
                  placeholder="Koregaon Park"
                />
                <FInput
                  label="UPI ID"
                  value={kyc.upiId}
                  onChange={(v) =>
                    setKyc({ ...kyc, upiId: v })
                  }
                  placeholder="yourname@upi"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: 9,
                  marginBottom: 18,
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.025)",
                  border: `1px solid ${
                    isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.06)"
                  }`,
                  color: "var(--text-muted)",
                }}
              >
                <IcShield s={13} />
                <span
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 12,
                  }}
                >
                  Documents encrypted & stored
                  securely
                </span>
              </div>
              <PrimaryBtn
                label="Submit KYC Application →"
                onClick={handleSubmitKyc}
                busy={busy}
                disabled={
                  !panDoc ||
                  !aadhaarFront ||
                  !aadhaarBack
                }
              />
            </Card>
          </motion.div>
        )}

        {step === "submitted" && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 22,
            }}
          >
            <Card>
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 0",
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.1,
                  }}
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 22,
                    margin: "0 auto 18px",
                    background:
                      "rgba(52,211,153,0.1)",
                    border:
                      "1px solid rgba(52,211,153,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#34d399",
                  }}
                >
                  <IcCircleOk s={30} />
                </motion.div>
                <h2
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 800,
                    fontSize: 22,
                    color: "var(--text)",
                    margin: "0 0 10px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  KYC Submitted!
                </h2>
                <p
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 14,
                    color: "var(--text-muted)",
                    margin: 0,
                    lineHeight: 1.75,
                    maxWidth: 380,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  {"Documents under review. We'll notify you at "}
                  <strong
                    style={{ color: "var(--text)" }}
                  >
                    {user?.email}
                  </strong>
                  {" once approved. Usually 1–2 business days."}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bcShimmer {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(200%); }
          100% { transform: translateX(200%); }
        }
        @keyframes bcSpin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 520px) {
          .bc-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </motion.div>
  );
}