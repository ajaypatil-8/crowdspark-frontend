// src/components/dashboard/TotpSetupSection.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ShieldOff, QrCode, KeyRound,
  Loader2, AlertCircle, CheckCircle2, Copy, Check, Eye, EyeOff,
} from "lucide-react";
import QRCode from "qrcode";
import { totpApi } from "@/lib/api";
function QrImage({ uri, size = 200 }: { uri: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed,  setFailed]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    setFailed(false);

    QRCode.toDataURL(uri, { width: size, margin: 1 })
      .then(url => { if (!cancelled) setDataUrl(url); })
      .catch(() => { if (!cancelled) setFailed(true); });

    return () => { cancelled = true; };
  }, [uri, size]);

  if (failed) {
    return (
      <div style={{
        width: size, height: size, display: "flex", alignItems: "center",
        justifyContent: "center", color: "#ef4444", fontSize: 12, textAlign: "center",
        padding: 12,
      }}>
        Couldn&apos;t generate QR code. Use the manual entry code instead.
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div style={{
        width: size, height: size, display: "flex", alignItems: "center",
        justifyContent: "center",
      }}>
        <Loader2 size={24} className="animate-spin" color="#999" />
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Scan with your authenticator app"
      width={size}
      height={size}
      style={{ borderRadius: 10, display: "block" }}
    />
  );
}

interface Props {
  isDark:      boolean;
  totpEnabled: boolean; // current state from user profile
  onChanged:   () => void; // refresh parent after toggle
}

type Step = "idle" | "scanning" | "confirming" | "disabling";

export default function TotpSetupSection({ isDark, totpEnabled, onChanged }: Props) {
  const [step,        setStep]        = useState<Step>("idle");
  const [otpauthUri,  setOtpauthUri]  = useState("");
  const [secret,      setSecret]      = useState("");
  const [code,        setCode]        = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [success,     setSuccess]     = useState<string | null>(null);

  const txt     = isDark ? "#f0f0f0"                : "#0a0a0a";
  const muted   = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr     = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const card    = isDark ? "#111"                   : "#fff";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f8f6";

  function resetState() {
    setStep("idle"); setCode(""); setPassword("");
    setError(null); setSuccess(null);
  }

  // ── Start enable flow ──────────────────────────────────────────────────
  async function startEnable() {
    setLoading(true); setError(null);
    try {
      const data = await totpApi.setup();
      setOtpauthUri(data.otpauthUri);
      setSecret(data.secret);
      setStep("scanning");
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  }

  // ── Confirm first code ─────────────────────────────────────────────────
  async function confirmEnable() {
    if (code.length !== 6) { setError("Enter the 6-digit code from your app"); return; }
    setLoading(true); setError(null);
    try {
      await totpApi.enable(code);
      setSuccess("Two-factor authentication is now active! Your account is more secure.");
      setStep("idle");
      onChanged();
    } catch (e: any) {
      setError(e?.message ?? "Invalid code — try again");
    } finally {
      setLoading(false);
    }
  }

  // ── Disable flow ───────────────────────────────────────────────────────
  async function confirmDisable() {
    if (code.length !== 6)     { setError("Enter the 6-digit code from your app"); return; }
    if (!password.trim())       { setError("Enter your account password"); return; }
    setLoading(true); setError(null);
    try {
      await totpApi.disable(code, password);
      setSuccess("Two-factor authentication has been disabled.");
      resetState();
      onChanged();
    } catch (e: any) {
      setError(e?.message ?? "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(secret).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Digit-only code input ─────────────────────────────────────────────
  const codeInput = (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: muted,
                      textTransform: "uppercase", letterSpacing: 0.5 }}>
        6-digit code *
      </label>
      <input
        value={code}
        onChange={e => {
          const v = e.target.value.replace(/\D/g, "").slice(0, 6);
          setCode(v); setError(null);
        }}
        placeholder="000000"
        inputMode="numeric"
        maxLength={6}
        autoComplete="one-time-code"
        style={{
          background: inputBg, border: `1px solid ${code.length === 6 ? "#22c55e" : bdr}`,
          borderRadius: 10, padding: "12px 16px", color: txt,
          fontSize: 22, fontWeight: 700, letterSpacing: 8,
          outline: "none", width: 180, textAlign: "center",
          transition: "border-color 0.2s",
        }}
      />
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: card, border: `1px solid ${bdr}`,
      borderRadius: 16, padding: "22px 24px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start",
                    justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: totpEnabled
              ? "linear-gradient(135deg,#22c55e,#16a34a)"
              : (isDark ? "#1e1e1e" : "#f0f0f0"),
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {totpEnabled
              ? <ShieldCheck size={18} color="#fff" />
              : <ShieldOff   size={18} color={muted} />}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: txt }}>
              Two-Factor Authentication
            </div>
            <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>
              {totpEnabled
                ? "Active — your account requires a code at each login"
                : "Not enabled — add an extra layer of security"}
            </div>
          </div>
        </div>

        {/* Toggle button — idle state only */}
        {step === "idle" && (
          <button
            onClick={totpEnabled ? () => setStep("disabling") : startEnable}
            disabled={loading}
            style={{
              background: totpEnabled ? "transparent" : "#ff5c00",
              color: totpEnabled ? "#ef4444" : "#fff",
              border: totpEnabled ? "1px solid rgba(239,68,68,0.35)" : "none",
              borderRadius: 10, padding: "8px 16px",
              cursor: loading ? "wait" : "pointer",
              fontSize: 13, fontWeight: 600, flexShrink: 0,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {loading
              ? <Loader2 size={13} className="animate-spin" />
              : totpEnabled ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
            {totpEnabled ? "Disable" : "Enable"}
          </button>
        )}
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0 }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              color: "#22c55e", fontSize: 13, padding: "10px 0",
              borderTop: `1px solid ${bdr}`, marginTop: 12,
            }}
          >
            <CheckCircle2 size={16} /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SCANNING STEP ── */}
      <AnimatePresence>
        {step === "scanning" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: -8 }}
            style={{ borderTop: `1px solid ${bdr}`, marginTop: 16, paddingTop: 18 }}
          >
            <p style={{ fontSize: 13, color: muted, marginBottom: 16, lineHeight: 1.6 }}>
              Scan the QR code with <strong style={{ color: txt }}>Google Authenticator</strong>,{" "}
              <strong style={{ color: txt }}>Authy</strong>, or any TOTP app.
              Then enter the 6-digit code to confirm setup.
            </p>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
              {/* QR code */}
              <div style={{
                padding: 10, background: "#fff", borderRadius: 12,
                display: "inline-flex", flexShrink: 0,
                boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
              }}>
                <QrImage uri={otpauthUri} size={180} />
              </div>

              {/* Manual entry */}
              <div style={{ display: "flex", flexDirection: "column",
                            justifyContent: "center", gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: muted,
                              textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Or enter code manually
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: inputBg, border: `1px solid ${bdr}`,
                  borderRadius: 10, padding: "8px 12px",
                }}>
                  <KeyRound size={14} color={muted} />
                  <span style={{
                    fontFamily: "monospace", fontSize: 13, color: txt,
                    letterSpacing: 2, wordBreak: "break-all",
                  }}>
                    {secret}
                  </span>
                  <button onClick={copySecret} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: copied ? "#22c55e" : muted, padding: 2, lineHeight: 0, marginLeft: 4,
                  }}>
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Code input + confirm */}
            {codeInput}
            {error && <ErrorMsg msg={error} />}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Btn label="Confirm Setup" icon={<ShieldCheck size={13} />}
                  onClick={confirmEnable} loading={loading} primary />
              <Btn label="Cancel" onClick={resetState} />
            </div>
          </motion.div>
        )}

        {/* ── DISABLING STEP ── */}
        {step === "disabling" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: -8 }}
            style={{ borderTop: `1px solid ${bdr}`, marginTop: 16, paddingTop: 18 }}
          >
            <p style={{ fontSize: 13, color: muted, marginBottom: 16, lineHeight: 1.6 }}>
              To disable 2FA, enter your current authenticator code and account password.
            </p>

            {codeInput}

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: muted,
                              textTransform: "uppercase", letterSpacing: 0.5 }}>
                Account Password *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  placeholder="Your current password"
                  style={{
                    width: "100%", background: inputBg, border: `1px solid ${bdr}`,
                    borderRadius: 10, padding: "10px 44px 10px 14px",
                    color: txt, fontSize: 14, outline: "none", boxSizing: "border-box",
                  }}
                />
                <button onClick={() => setShowPass(p => !p)}
                  style={{ position: "absolute", right: 12, top: "50%",
                           transform: "translateY(-50%)", background: "none",
                           border: "none", cursor: "pointer", color: muted, lineHeight: 0 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <ErrorMsg msg={error} />}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Btn label="Disable 2FA" icon={<ShieldOff size={13} />}
                  onClick={confirmDisable} loading={loading} danger />
              <Btn label="Cancel" onClick={resetState} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7,
                  color: "#ef4444", fontSize: 12, marginTop: 10 }}>
      <AlertCircle size={13} /> {msg}
    </div>
  );
}

function Btn({
  label, icon, onClick, loading, primary, danger,
}: {
  label: string; icon?: React.ReactNode; onClick: () => void;
  loading?: boolean; primary?: boolean; danger?: boolean;
}) {
  const bg = primary ? "#ff5c00" : danger ? "transparent" : "transparent";
  const color = primary ? "#fff" : danger ? "#ef4444" : "rgba(255,255,255,0.42)";
  const border = primary ? "none"
    : danger ? "1px solid rgba(239,68,68,0.35)"
    : "1px solid rgba(255,255,255,0.08)";

  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        background: bg, color, border, borderRadius: 10, padding: "8px 16px",
        cursor: loading ? "wait" : "pointer", fontSize: 13, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 6,
      }}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}