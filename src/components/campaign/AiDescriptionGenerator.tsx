// src/components/campaign/AiDescriptionGenerator.tsx
// Feature #39 — AI Campaign Description Generator (UI)
// Lives above Step1BasicInfo in the create-campaign wizard. Bullet points are
// component-local scratch input — only the accepted result gets lifted into
// the wizard's real state (basic.shortDescription / basic.goalAmount /
// story.fullDescription) via the onApply callback.

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aiApi, type GenerateDescriptionResponse } from "@/lib/api";

interface Props {
  title: string;
  isDark: boolean;
  onApply: (result: GenerateDescriptionResponse) => void;
}

export default function AiDescriptionGenerator({ title, isDark, onApply }: Props) {
  const [expanded, setExpanded]     = useState(false);
  const [bulletsText, setBullets]   = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [result, setResult]         = useState<GenerateDescriptionResponse | null>(null);
  const [applied, setApplied]       = useState(false);

  const bdr   = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const txt   = isDark ? "#f0f0f0" : "#111";

  const bullets     = bulletsText.split("\n").map(b => b.trim()).filter(Boolean);
  const titleReady  = title.trim().length >= 5;
  const canGenerate = titleReady && bullets.length > 0 && !loading;

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError("");
    setApplied(false);
    try {
      const res = await aiApi.generateDescription({
        title: title.trim(),
        bulletPoints: bullets,
      });
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Couldn't generate a draft. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    if (!result) return;
    onApply(result);
    setApplied(true);
  };

  return (
    <motion.div
      layout
      style={{
        marginBottom: 22,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(255,107,0,0.22)",
        background: isDark
          ? "linear-gradient(150deg, rgba(255,107,0,0.07), rgba(139,92,246,0.04))"
          : "linear-gradient(150deg, rgba(255,107,0,0.05), rgba(139,92,246,0.03))",
      }}
    >
      {/* Header / toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", padding: "16px 18px", background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
            background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            boxShadow: "0 0 16px rgba(255,107,0,0.35)",
          }}>
            ✨
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14.5, color: txt }}>
              Draft this with AI
            </p>
            <p style={{ margin: "2px 0 0", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted }}>
              Title + a few rough points → pitch, full story &amp; a suggested goal
            </p>
          </div>
        </div>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} style={{ color: "#ff8800", fontSize: 12, flexShrink: 0 }}>
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

              {!titleReady && (
                <p style={{ margin: 0, fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "#f59e0b" }}>
                  ↓ Add a campaign title below (at least 5 characters) to enable AI drafting.
                </p>
              )}

              <div>
                <label style={{
                  fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, color: muted,
                  textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 7,
                }}>
                  Rough points — one per line
                </label>
                <textarea
                  value={bulletsText}
                  onChange={e => setBullets(e.target.value)}
                  disabled={loading}
                  rows={4}
                  placeholder={"e.g.\nSolar-powered water purifier for rural homes\nCosts ₹4,000 per unit to manufacture\nPilot already tested with 20 families in Pune\nFunds go to the first production batch of 500 units"}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 12, boxSizing: "border-box",
                    fontFamily: "DM Sans, sans-serif", fontSize: 13.5, lineHeight: 1.6, outline: "none", resize: "vertical",
                    border: `1px solid ${bdr}`,
                    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                    color: "var(--text)",
                  }}
                />
              </div>

              <motion.button
                onClick={generate}
                disabled={!canGenerate}
                whileHover={canGenerate ? { scale: 1.01 } : {}}
                whileTap={canGenerate ? { scale: 0.98 } : {}}
                style={{
                  padding: "11px 18px", borderRadius: 12, border: "none", alignSelf: "flex-start",
                  background: canGenerate
                    ? "linear-gradient(135deg,#ff6b00,#ffcc00)"
                    : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"),
                  color: canGenerate ? "#fff" : muted,
                  fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5,
                  cursor: canGenerate ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 13, height: 13, borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff",
                      animation: "aidgSpin .7s linear infinite", display: "block",
                    }} />
                    Drafting…
                  </>
                ) : (
                  <>✨ Generate draft</>
                )}
              </motion.button>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ margin: 0, fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "#ef4444" }}
                  >
                    ✕ {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{
                      borderRadius: 14,
                      border: `1px solid ${isDark ? "rgba(52,211,153,0.25)" : "rgba(52,211,153,0.3)"}`,
                      background: isDark ? "rgba(52,211,153,0.05)" : "rgba(52,211,153,0.04)",
                      padding: 16, display: "flex", flexDirection: "column", gap: 12,
                    }}
                  >
                    <div>
                      <p style={{ margin: "0 0 4px", fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Short pitch
                      </p>
                      <p style={{ margin: 0, fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: txt, lineHeight: 1.6 }}>
                        {result.shortPitch}
                      </p>
                    </div>

                    <div>
                      <p style={{ margin: "0 0 4px", fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Suggested goal
                      </p>
                      <p style={{ margin: 0, fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: txt }}>
                        ₹{result.suggestedGoalAmount.toLocaleString("en-IN")}
                      </p>
                      <p style={{ margin: "3px 0 0", fontFamily: "DM Sans, sans-serif", fontSize: 12, color: muted }}>
                        {result.goalReasoning}
                      </p>
                    </div>

                    <div>
                      <p style={{ margin: "0 0 4px", fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Full story
                      </p>
                      <div style={{
                        maxHeight: 180, overflowY: "auto", padding: "10px 12px", borderRadius: 10,
                        background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)", border: `1px solid ${bdr}`,
                      }}>
                        <p style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, lineHeight: 1.65 }}>
                          {result.fullDescription}
                        </p>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontFamily: "DM Sans, sans-serif", fontSize: 11, color: muted, fontStyle: "italic" }}>
                      AI draft — review before publishing. Goal amount is a rough estimate, not financial advice.
                    </p>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <motion.button
                        onClick={apply}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        style={{
                          padding: "9px 18px", borderRadius: 11, border: "none",
                          background: applied ? "rgba(52,211,153,0.15)" : "linear-gradient(135deg,#34d399,#10b981)",
                          color: applied ? "#34d399" : "#fff",
                          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
                        }}
                      >
                        {applied ? "✓ Applied" : "✓ Use this draft"}
                      </motion.button>
                      <motion.button
                        onClick={generate}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        style={{
                          padding: "9px 18px", borderRadius: 11, border: `1px solid ${bdr}`, background: "transparent",
                          color: txt, fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
                        }}
                      >
                        ↻ Regenerate
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes aidgSpin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
