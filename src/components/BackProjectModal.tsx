"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, CheckCircle, Trophy, AlertCircle, IndianRupee } from "lucide-react";
import type { RewardTierResponse } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: number;
  projectTitle: string;
  rewards: RewardTierResponse[];
  isDark: boolean;
  goalAmount?: number;
  currentAmount?: number;
  onSuccess?: () => void;
}

export default function BackProjectModal({
  open, onClose, projectId, projectTitle, rewards, isDark,
  goalAmount = 0, currentAmount = 0, onSuccess,
}: Props) {
  const [selectedReward, setSelectedReward] = useState<number | null>(null);
  const [amount, setAmount]   = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [done, setDone]       = useState(false);

  const bdr     = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const bg      = isDark ? "#0c0c0c" : "#ffffff";
  const card2   = isDark ? "#141414" : "#f6f6f4";
  const txt     = isDark ? "#f0f0f0" : "#0a0a0a";
  const muted   = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f8f6";
  const accent  = "#ff5c00";

  const remaining   = Math.max(goalAmount - currentAmount, 0);
  const goalReached = remaining <= 0;
  const pct = Math.min(((currentAmount / goalAmount) * 100) || 0, 100);

  const minAmount = selectedReward
    ? rewards.find(r => r.id === selectedReward)?.minimumAmount ?? 1
    : 1;

  function handleAmountChange(val: string) {
    const num = parseFloat(val);
    if (!isNaN(num) && num > remaining) setAmount(String(remaining));
    else setAmount(val);
  }

  async function handleSubmit() {
    const amt = parseFloat(amount);
    if (!amt || amt < minAmount) { setError(`Minimum amount is ₹${minAmount}`); return; }
    if (amt > remaining) { setError(`Maximum is ₹${remaining.toFixed(0)}`); return; }
    setLoading(true); setError(null);
    try {
      const { tokenStorage } = await import("@/lib/api");
      const token = tokenStorage.getAccess();
      if (!token) throw new Error("Please login to back this project");
      const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/crowdspark";
      const res = await fetch(`${BASE}/api/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId, amount: amt, rewardTierId: selectedReward ?? null, message: message.trim() || null }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Donation failed"); }
      setDone(true); onSuccess?.();
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally { setLoading(false); }
  }

  function handleClose() {
    setDone(false); setError(null); setAmount(""); setMessage(""); setSelectedReward(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{
            position: "fixed", inset: 0, zIndex: 9000,
            background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
        >
          <motion.div
            initial={{ scale: 0.88, y: 36, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, y: 36, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: bg, border: `1px solid ${bdr}`,
              borderRadius: 24, padding: "32px 28px",
              maxWidth: 520, width: "100%",
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: isDark ? "0 40px 100px rgba(0,0,0,0.8)" : "0 40px 100px rgba(0,0,0,0.18)",
              position: "relative",
            }}
          >
            {/* Close */}
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              style={{
                position: "absolute", top: 20, right: 20,
                width: 34, height: 34, borderRadius: "50%",
                background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                border: `1px solid ${bdr}`, color: muted,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={15} />
            </motion.button>

            {/* ── Goal reached ── */}
            {goalReached ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "28px 0" }}>
                <div style={{ width: 72, height: 72, borderRadius: 22, background: "linear-gradient(135deg,rgba(255,180,0,0.2),rgba(255,107,0,0.2))", border: "1px solid rgba(255,180,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <Trophy size={32} color="#ffb300" />
                </div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 24, color: txt, margin: "0 0 10px" }}>Goal Reached!</h2>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted, lineHeight: 1.7, margin: "0 0 28px" }}>
                  <strong style={{ color: txt }}>{projectTitle}</strong> has already hit its funding goal. No more contributions needed. 🎉
                </p>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleClose} style={{ padding: "13px 32px", borderRadius: 12, background: `linear-gradient(135deg,${accent},#ff9900)`, color: "#fff", border: "none", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 18px rgba(255,92,0,0.35)" }}>
                  Close
                </motion.button>
              </motion.div>

            /* ── Success ── */
            ) : done ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "28px 0" }}>
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 14, stiffness: 250, delay: 0.1 }}
                  style={{ width: 72, height: 72, borderRadius: 22, background: "linear-gradient(135deg,rgba(34,197,94,0.18),rgba(0,212,184,0.15))", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}
                >
                  <CheckCircle size={34} color="#22c55e" />
                </motion.div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 24, color: txt, margin: "0 0 10px" }}>You're a backer!</h2>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted, lineHeight: 1.7, margin: "0 0 28px" }}>
                  Thank you for backing <strong style={{ color: txt }}>{projectTitle}</strong>. Your support means the world!
                </p>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleClose} style={{ padding: "13px 32px", borderRadius: 12, background: `linear-gradient(135deg,${accent},#ff9900)`, color: "#fff", border: "none", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 18px rgba(255,92,0,0.35)" }}>
                  Awesome!
                </motion.button>
              </motion.div>

            /* ── Form ── */
            ) : (
              <>
                {/* Header */}
                <div style={{ marginBottom: 22, paddingRight: 40 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accent}18`, border: `1px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Gift size={15} color={accent} />
                    </div>
                    <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 20, color: txt, margin: 0 }}>Back this project</h2>
                  </div>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, margin: 0, paddingLeft: 42 }}>{projectTitle}</p>
                </div>

                {/* Progress pill */}
                <div style={{ padding: "14px 16px", borderRadius: 14, background: card2, border: `1px solid ${bdr}`, marginBottom: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted }}>
                      <strong style={{ color: txt, fontFamily: "Syne, sans-serif" }}>₹{remaining.toLocaleString("en-IN")}</strong> still needed
                    </span>
                    <span style={{ fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 800, color: accent }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${accent},#ffb300)`, borderRadius: 2 }} />
                  </div>
                </div>

                {/* Reward tiers */}
                {rewards.length > 0 && (
                  <div style={{ marginBottom: 22 }}>
                    <p style={{ fontFamily: "DM Mono, monospace", fontSize: 10.5, color: muted, marginBottom: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Choose a Reward (Optional)
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {rewards.map(r => {
                        const sel = selectedReward === r.id;
                        return (
                          <motion.button
                            key={r.id}
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                            onClick={() => {
                              setSelectedReward(sel ? null : r.id);
                              if (!sel) setAmount(String(Math.min(r.minimumAmount, remaining)));
                            }}
                            style={{
                              textAlign: "left", padding: "14px 16px", borderRadius: 14,
                              border: `1.5px solid ${sel ? accent : bdr}`,
                              background: sel ? `${accent}0e` : inputBg,
                              cursor: "pointer", transition: "all 0.18s",
                              boxShadow: sel ? `0 0 0 3px ${accent}18` : "none",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: r.description ? 6 : 0 }}>
                              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: txt }}>{r.title}</span>
                              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, color: accent, background: `${accent}14`, padding: "3px 10px", borderRadius: 8 }}>₹{r.minimumAmount}+</span>
                            </div>
                            {r.description && (
                              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, margin: 0, lineHeight: 1.55 }}>{r.description}</p>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Amount */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontFamily: "DM Mono, monospace", fontSize: 10.5, color: muted, display: "block", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Your Pledge Amount
                  </label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                      <IndianRupee size={15} color={muted} />
                    </div>
                    <input
                      type="number" min={minAmount} max={remaining}
                      value={amount} onChange={e => handleAmountChange(e.target.value)}
                      placeholder={String(minAmount)}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "14px 16px 14px 38px",
                        borderRadius: 12, border: `1.5px solid ${bdr}`,
                        background: inputBg, color: txt,
                        fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17,
                        outline: "none", transition: "border-color 0.2s",
                      }}
                      onFocus={e => (e.target.style.borderColor = `${accent}60`)}
                      onBlur={e => (e.target.style.borderColor = bdr)}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted }}>Min: ₹{minAmount}</span>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted }}>Max: ₹{remaining.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Message */}
                <div style={{ marginBottom: 22 }}>
                  <label style={{ fontFamily: "DM Mono, monospace", fontSize: 10.5, color: muted, display: "block", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Message to Creator (Optional)
                  </label>
                  <textarea
                    value={message} onChange={e => setMessage(e.target.value)}
                    maxLength={500} rows={3} placeholder="Share your support…"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "12px 14px", borderRadius: 12,
                      border: `1.5px solid ${bdr}`,
                      background: inputBg, color: txt,
                      fontFamily: "DM Sans, sans-serif", fontSize: 14,
                      outline: "none", resize: "vertical", transition: "border-color 0.2s",
                    }}
                    onFocus={e => (e.target.style.borderColor = `${accent}60`)}
                    onBlur={e => (e.target.style.borderColor = bdr)}
                  />
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#ef4444", marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}
                    >
                      <AlertCircle size={15} /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? "none" : `0 8px 28px ${accent}45` }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  onClick={handleSubmit} disabled={loading}
                  style={{
                    width: "100%", padding: "15px", borderRadius: 14,
                    background: loading ? `${accent}55` : `linear-gradient(135deg,${accent},#ff8c00)`,
                    border: "none", color: "#fff",
                    fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16,
                    cursor: loading ? "not-allowed" : "pointer",
                    letterSpacing: "0.01em", transition: "background 0.2s",
                  }}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "bspin 0.7s linear infinite", display: "inline-block" }} />
                      Processing…
                    </span>
                  ) : (
                    `Back with ₹${amount || "…"}`
                  )}
                </motion.button>

                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: muted, textAlign: "center", margin: "12px 0 0", lineHeight: 1.5 }}>
                  Secure contribution · No hidden fees
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
      <style>{`@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AnimatePresence>
  );
}
