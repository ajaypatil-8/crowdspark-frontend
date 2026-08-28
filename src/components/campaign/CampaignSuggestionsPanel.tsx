// src/components/campaign/CampaignSuggestionsPanel.tsx
// Feature #46 — AI Campaign Improvement Suggestions (UI)
//
// Sits next to SuccessScorePanel (#41) on Step 5, deliberately styled and
// colored differently (teal, not violet) so the two don't read as the same
// tool twice — that one scores the whole campaign holistically, this one
// gives specific, categorized actions (title / rewards / media).

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aiApi, type CampaignSuggestionsRewardTier, type CampaignSuggestionsResponse } from "@/lib/api";

interface Props {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  goalAmount: number;
  mediaCount: number;
  hasVideo: boolean;
  hasThumbnail: boolean;
  rewardTiers: CampaignSuggestionsRewardTier[];
  isDark: boolean;
}

const ACCENT = "#06b6d4";

function Section({ label, items, isDark }: { label: string; items: string[]; isDark: boolean }) {
  if (items.length === 0) return null;
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ margin: "0 0 6px", fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ flexShrink: 0, width: 5, height: 5, borderRadius: "50%", background: ACCENT, marginTop: 7 }} />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, lineHeight: 1.55 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CampaignSuggestionsPanel(props: Props) {
  const { isDark } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<CampaignSuggestionsResponse | null>(null);

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
      const res = await aiApi.getSuggestions({
        title: props.title,
        shortDescription: props.shortDescription,
        fullDescription: props.fullDescription,
        category: props.category || undefined,
        goalAmount: props.goalAmount,
        hasVideo: props.hasVideo,
        hasThumbnail: props.hasThumbnail,
        mediaCount: props.mediaCount,
        rewardTiers: props.rewardTiers,
      });
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Couldn't get suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasAnySuggestion = result && (
    result.titleSuggestions.length > 0 || result.rewardSuggestions.length > 0 || result.mediaSuggestions.length > 0
  );

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
          background: `linear-gradient(135deg,${ACCENT},#22d3ee)`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          boxShadow: `0 0 16px ${ACCENT}55`,
        }}>
          💡
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14.5, color: txt }}>
            Improvement Suggestions
          </p>
          <p style={{ margin: "2px 0 0", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted }}>
            Specific ideas for your title, rewards, and media
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
              background: ready ? `linear-gradient(135deg,${ACCENT},#22d3ee)` : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"),
              color: ready ? "#fff" : muted,
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13,
              cursor: ready && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap",
            }}
          >
            {loading
              ? <><span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", animation: "cspSpin .7s linear infinite", display: "block" }} /> Thinking…</>
              : "Get suggestions"}
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
            {hasAnySuggestion ? (
              <>
                <Section label="Title ideas" items={result.titleSuggestions} isDark={isDark} />
                <Section label="Reward tiers" items={result.rewardSuggestions} isDark={isDark} />
                <Section label="Media" items={result.mediaSuggestions} isDark={isDark} />
              </>
            ) : (
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, margin: "0 0 12px" }}>
                Nothing to flag — this looks solid as is.
              </p>
            )}
            {result.overallNote && (
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: txt, fontStyle: "italic", margin: "0 0 14px" }}>
                {result.overallNote}
              </p>
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
              {loading ? "Refreshing…" : "↻ Refresh suggestions"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes cspSpin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
