// src/components/campaign/SuccessScorePanel.tsx
// Feature #41 — AI Campaign Success Predictor (UI)
//
// Deliberately distinct from the existing readiness gauge above it in
// Step5Review: that one is instant/local and checks "did you fill in the
// required fields" (0-100, red/amber/green). This one is an API call and
// judges "how likely is this to actually get funded" (0-100, violet) —
// different question, so it gets its own look and its own explicit
// "Analyze" trigger rather than auto-firing and looking like a duplicate
// of the gauge already on the page.

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aiApi, type CampaignScoreResponse } from "@/lib/api";

interface Props {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  goalAmount: number;
  durationDays: number;
  mediaCount: number;
  hasVideo: boolean;
  hasThumbnail: boolean;
  rewardTierCount: number;
  isDark: boolean;
}

const ACCENT = "#8b5cf6";

export default function SuccessScorePanel(props: Props) {
  const { isDark } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<CampaignScoreResponse | null>(null);

  const bdr   = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const txt   = isDark ? "#f0f0f0" : "#111";

  const ready = props.title.trim().length >= 5
    && props.shortDescription.trim().length > 0
    && props.fullDescription.trim().length >= 50
    && props.goalAmount > 0;

  const analyze = async () => {
    if (!ready || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await aiApi.predictSuccess({
        title: props.title,
        shortDescription: props.shortDescription,
        fullDescription: props.fullDescription,
        category: props.category || undefined,
        goalAmount: props.goalAmount,
        durationDays: Math.max(1, props.durationDays),
        mediaCount: props.mediaCount,
        hasVideo: props.hasVideo,
        hasThumbnail: props.hasThumbnail,
        rewardTierCount: props.rewardTierCount,
      });
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Couldn't analyze your campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = !result ? ACCENT : result.score < 50 ? "#ef4444" : result.score < 75 ? "#f59e0b" : "#34d399";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: 18, padding: "20px 22px", marginBottom: 22,
        border: `1px solid ${ACCENT}35`,
        background: isDark
          ? `linear-gradient(150deg, ${ACCENT}12, ${ACCENT}05)`
          : `linear-gradient(150deg, ${ACCENT}0c, ${ACCENT}03)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: result ? 16 : 6 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11, flexShrink: 0,
          background: `linear-gradient(135deg,${ACCENT},#a78bfa)`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          boxShadow: `0 0 16px ${ACCENT}55`,
        }}>
          🤖
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14.5, color: txt }}>
            AI Success Prediction
          </p>
          <p style={{ margin: "2px 0 0", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted }}>
            An honest read on how this campaign is likely to perform
          </p>
        </div>
        {!result && (
          <motion.button
            onClick={analyze}
            disabled={!ready || loading}
            whileHover={ready && !loading ? { scale: 1.02 } : {}}
            whileTap={ready && !loading ? { scale: 0.97 } : {}}
            style={{
              padding: "9px 16px", borderRadius: 11, border: "none", flexShrink: 0,
              background: ready ? `linear-gradient(135deg,${ACCENT},#a78bfa)` : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"),
              color: ready ? "#fff" : muted,
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13,
              cursor: ready && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap",
            }}
          >
            {loading
              ? <><span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", animation: "sspSpin .7s linear infinite", display: "block" }} /> Analyzing…</>
              : "Analyze my campaign"}
          </motion.button>
        )}
      </div>

      {!ready && !result && (
        <p style={{ margin: 0, fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#f59e0b" }}>
          Fill in your title, pitch, a story of at least 50 characters, and a goal amount first.
        </p>
      )}

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ margin: "8px 0 0", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "#ef4444" }}>
            ✕ {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 14 }}>
              <div style={{ position: "relative", width: 68, height: 68, flexShrink: 0 }}>
                <svg width={68} height={68} style={{ transform: "rotate(-90deg)" }}>
                  <circle cx={34} cy={34} r={28} fill="none" strokeWidth={6} stroke={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"} />
                  <motion.circle
                    cx={34} cy={34} r={28} fill="none" strokeWidth={6} stroke={scoreColor}
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    initial={{ strokeDashoffset: `${2 * Math.PI * 28}` }}
                    animate={{ strokeDashoffset: `${2 * Math.PI * 28 * (1 - result.score / 100)}` }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 15, color: scoreColor }}>
                  {result.score}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: scoreColor, margin: "0 0 5px" }}>
                  {result.verdict}
                </p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: txt, lineHeight: 1.6, margin: 0 }}>
                  {result.explanation}
                </p>
              </div>
            </div>

            {result.tips.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ margin: "0 0 8px", fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  To improve
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {result.tips.map((tip, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 6, background: `${ACCENT}18`, color: ACCENT, fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 10.5, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                        {i + 1}
                      </span>
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, lineHeight: 1.55 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <motion.button
              onClick={analyze}
              disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{
                padding: "8px 15px", borderRadius: 10, border: `1px solid ${bdr}`, background: "transparent",
                color: txt, fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
              }}
            >
              {loading ? "Re-analyzing…" : "↻ Re-analyze"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes sspSpin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
