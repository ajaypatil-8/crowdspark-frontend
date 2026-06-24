// src/components/TotpVerifyModal.tsx
// Shown after a successful credential login when totpRequired=true.
"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, AlertCircle, KeyRound } from "lucide-react";
import { totpApi, tokenStorage } from "@/lib/api";

interface Props {
  pendingToken: string;
  isDark:       boolean;
  onSuccess:    () => void; // called after tokens stored — parent redirects
  onCancel:     () => void;
}

export default function TotpVerifyModal({
  pendingToken, isDark, onSuccess, onCancel,
}: Props) {
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const txt     = isDark ? "#f0f0f0"                : "#0a0a0a";
  const muted   = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr     = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const overlay = isDark ? "rgba(0,0,0,0.75)"       : "rgba(0,0,0,0.45)";
  const card    = isDark ? "#0d0d0d"                : "#fff";

  async function handleVerify() {
    if (code.length !== 6) { setError("Enter the 6-digit code"); return; }
    setLoading(true); setError(null);
    try {
      const data = await totpApi.verifyLogin(pendingToken, code);
      // ✅ FIX: use tokenStorage (keys "cs_access" / "cs_refresh") — NOT raw
      // localStorage.setItem("accessToken") which api.ts never reads.
      tokenStorage.set(data.accessToken, data.refreshToken);
      onSuccess();
    } catch (e: any) {
      setError(e?.message ?? "Invalid code — try again");
      setCode("");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(v);
    setError(null);
    // Auto-submit when 6 digits entered
    if (v.length === 6) {
      // brief delay so user sees the final digit
      setTimeout(() => {
        setCode(v);
        document.getElementById("totp-submit-btn")?.click();
      }, 120);
    }
  }

  return (
    /* Backdrop */
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: overlay, backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: card, border: `1px solid ${bdr}`,
          borderRadius: 20, padding: "32px 30px",
          width: "100%", maxWidth: 380, margin: "0 16px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: "0 auto 18px",
          background: "linear-gradient(135deg,#ff5c00,#ff9000)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ShieldCheck size={26} color="#fff" />
        </div>

        {/* Heading */}
        <h2 style={{
          textAlign: "center", fontSize: 20, fontWeight: 800,
          color: txt, margin: "0 0 6px",
        }}>
          Two-Factor Verification
        </h2>
        <p style={{
          textAlign: "center", fontSize: 13, color: muted,
          margin: "0 0 28px", lineHeight: 1.55,
        }}>
          Open your authenticator app and enter the 6-digit code for{" "}
          <strong style={{ color: txt }}>CrowdSpark</strong>.
        </p>

        {/* Code input */}
        <div style={{ marginBottom: 18 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: isDark ? "rgba(255,255,255,0.04)" : "#f5f5f3",
            border: `2px solid ${code.length === 6 ? "#ff5c00" : bdr}`,
            borderRadius: 14, padding: "10px 16px",
            transition: "border-color 0.2s",
          }}>
            <KeyRound size={18} color={muted} />
            <input
              ref={inputRef}
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: 28, fontWeight: 700, letterSpacing: 10,
                color: txt, width: "100%", textAlign: "center",
                caretColor: "#ff5c00",
              }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            color: "#ef4444", fontSize: 12, marginBottom: 14,
          }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        {/* Verify button */}
        <button
          id="totp-submit-btn"
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          style={{
            width: "100%", padding: "13px 0",
            background: code.length === 6
              ? "linear-gradient(135deg,#ff5c00,#ff9000)"
              : (isDark ? "#1e1e1e" : "#e5e5e5"),
            color: code.length === 6 ? "#fff" : muted,
            border: "none", borderRadius: 12,
            cursor: code.length === 6 && !loading ? "pointer" : "not-allowed",
            fontSize: 14, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s",
          }}
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Verifying…</>
            : <><ShieldCheck size={16} /> Verify &amp; Sign In</>}
        </button>

        {/* Cancel */}
        <button
          onClick={onCancel}
          style={{
            width: "100%", marginTop: 10, padding: "10px 0",
            background: "none", border: "none",
            color: muted, fontSize: 13, cursor: "pointer",
          }}
        >
          ← Back to login
        </button>
      </motion.div>
    </div>
  );
}