"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RewardTierResponse } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: number;
  projectTitle: string;
  rewards: RewardTierResponse[];
  isDark: boolean;
  onSuccess?: () => void;
}

export default function BackProjectModal({
  open, onClose, projectId, projectTitle, rewards, isDark, onSuccess,
}: Props) {
  const [selectedReward, setSelectedReward] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const bdr = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const bg  = isDark ? "#111" : "#fff";
  const txt = isDark ? "#fff" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const inputBg = isDark ? "rgba(255,255,255,0.05)" : "#f8f8f8";
  const accent = "#ff6b00";

  const minAmount = selectedReward
    ? rewards.find((r) => r.id === selectedReward)?.minimumAmount ?? 1
    : 1;

  async function handleSubmit() {
    const amt = parseFloat(amount);
    if (!amt || amt < minAmount) {
      setError(`Minimum amount is ₹${minAmount}`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { tokenStorage } = await import("@/lib/api");
      const token = tokenStorage.getAccess();
      if (!token) throw new Error("Please login to back this project");

      const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/crowdspark";
      const res = await fetch(`${BASE}/api/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          projectId,
          amount: amt,
          rewardTierId: selectedReward ?? null,
          message: message.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Donation failed");
      }
      setDone(true);
      onSuccess?.();
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setDone(false);
    setError(null);
    setAmount("");
    setMessage("");
    setSelectedReward(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{
            position: "fixed", inset: 0, zIndex: 9000,
            background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: bg,
              border: `1px solid ${bdr}`,
              borderRadius: 20,
              padding: "32px 28px",
              maxWidth: 520,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {done ? (
              /* Success state */
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: txt, marginBottom: 8 }}>
                  You&apos;re a backer!
                </h2>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted, marginBottom: 28 }}>
                  Thank you for backing <strong style={{ color: txt }}>{projectTitle}</strong>. Your support means the world!
                </p>
                <button
                  onClick={handleClose}
                  style={{ padding: "12px 32px", borderRadius: 12, background: accent, color: "#fff", border: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: txt, margin: "0 0 4px" }}>
                      Back this project
                    </h2>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, margin: 0 }}>
                      {projectTitle}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    style={{ width: 32, height: 32, borderRadius: "50%", background: bdr, border: "none", color: txt, cursor: "pointer", fontSize: 16, flexShrink: 0 }}
                  >
                    ✕
                  </button>
                </div>

                {/* Reward tiers */}
                {rewards.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, color: muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Choose a reward (optional)
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {rewards.map((r) => {
                        const sel = selectedReward === r.id;
                        return (
                          <button
                            key={r.id}
                            onClick={() => {
                              setSelectedReward(sel ? null : r.id);
                              if (!sel) setAmount(String(r.minimumAmount));
                            }}
                            style={{
                              textAlign: "left",
                              padding: "14px 16px",
                              borderRadius: 12,
                              border: `1.5px solid ${sel ? accent : bdr}`,
                              background: sel ? `${accent}12` : inputBg,
                              cursor: "pointer",
                              transition: "all 0.18s",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: txt }}>{r.title}</span>
                              <span style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 13, color: accent }}>₹{r.minimumAmount}+</span>
                            </div>
                            {r.description && (
                              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: muted, margin: 0, lineHeight: 1.5 }}>{r.description}</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Amount input */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, color: muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Your pledge amount
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: muted }}>₹</span>
                    <input
                      type="number"
                      min={minAmount}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={String(minAmount)}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "14px 16px 14px 32px",
                        borderRadius: 12, border: `1.5px solid ${bdr}`,
                        background: inputBg, color: txt,
                        fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16,
                        outline: "none",
                      }}
                    />
                  </div>
                  {minAmount > 1 && (
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: muted, margin: "6px 0 0" }}>
                      Minimum: ₹{minAmount}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, color: muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Message to creator (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Share your support..."
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "12px 14px",
                      borderRadius: 12, border: `1.5px solid ${bdr}`,
                      background: inputBg, color: txt,
                      fontFamily: "DM Sans, sans-serif", fontSize: 14,
                      outline: "none", resize: "vertical",
                    }}
                  />
                </div>

                {error && (
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#ef4444", marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: 12,
                    background: loading ? "rgba(255,107,0,0.5)" : `linear-gradient(135deg,${accent},#ffcc00)`,
                    border: "none",
                    color: "#fff",
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 4px 20px rgba(255,100,0,0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  {loading ? "Processing…" : `Back with ₹${amount || "…"}`}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
