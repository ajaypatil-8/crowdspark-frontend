"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import type { RewardTierRequest } from "@/lib/api";

interface RewardsData { rewards: RewardTierRequest[]; }
interface Props { data: RewardsData; onChange: (d: RewardsData) => void; isDark: boolean; }

const PRESETS: (RewardTierRequest & { emoji: string; color: string })[] = [
  { title: "Early Backer",  description: "A heartfelt thank-you + your name in credits.", minimumAmount: 500,   emoji: "🙏", color: "#60a5fa" },
  { title: "Supporter",     description: "Thank-you + exclusive project updates via email.", minimumAmount: 1500,  emoji: "⭐", color: "#a78bfa" },
  { title: "Champion",      description: "Early access + all previous perks.", minimumAmount: 5000,  emoji: "🏆", color: "#f59e0b" },
  { title: "Patron",        description: "Recognition + 1-on-1 call with creator.", minimumAmount: 15000, emoji: "👑", color: "#ff8800" },
];

const TIER_COLORS = ["#60a5fa", "#a78bfa", "#f59e0b", "#ff8800", "#34d399", "#f472b6", "#818cf8", "#fb923c"];

function TierCard({ reward, index, total, onUpdate, onRemove, isDark }: {
  reward: RewardTierRequest; index: number; total: number;
  onUpdate: (k: keyof RewardTierRequest, v: string | number | undefined) => void;
  onRemove: () => void; isDark: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const color = TIER_COLORS[index % TIER_COLORS.length];
  const bdr = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 13px", borderRadius: 10, boxSizing: "border-box" as const,
    border: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
    color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
  };
  const lbl: React.CSSProperties = { fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = `${color}66`;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${color}14`;
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = bdr;
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ borderRadius: 18, border: `1px solid ${color}30`, background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.01)", overflow: "hidden", position: "relative", boxShadow: `0 0 20px ${color}0a` }}
    >
      {/* Left accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: `linear-gradient(to bottom, ${color}, ${color}60)`, borderRadius: "18px 0 0 18px" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px 14px 22px", cursor: "pointer" }} onClick={() => setExpanded(s => !s)}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: `${color}15`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, color, flexShrink: 0 }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: reward.title ? "var(--text)" : "var(--text-muted)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {reward.title || "Untitled Tier"}
          </p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
            {reward.minimumAmount > 0 ? `₹${Number(reward.minimumAmount).toLocaleString("en-IN")} minimum` : "Set amount below"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={e => { e.stopPropagation(); onRemove(); }}
            style={{ padding: "5px 11px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontSize: 12, fontFamily: "DM Sans, sans-serif", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            Remove
          </button>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} style={{ color: "var(--text-muted)", fontSize: 12 }}>▼</motion.span>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{ padding: "0 18px 18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ height: 1, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", marginBottom: 4 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="s4grid2">
                <div>
                  <label style={lbl}>Tier Name *</label>
                  <input style={inp} placeholder="e.g. Early Backer" value={reward.title} onChange={e => onUpdate("title", e.target.value)} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
                <div>
                  <label style={lbl}>Min. Pledge (₹) *</label>
                  <input style={inp} type="number" min={1} placeholder="500" value={reward.minimumAmount || ""} onChange={e => onUpdate("minimumAmount", Number(e.target.value))} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              </div>
              <div>
                <label style={lbl}>What backers receive</label>
                <textarea
                  style={{ ...inp, height: 80, resize: "vertical" as const }}
                  placeholder="Describe exactly what this tier includes…"
                  value={reward.description ?? ""}
                  onChange={e => onUpdate("description", e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              {/* BUG FIX (Feature #24): estimatedDelivery and limitedQuantity
                  were already validated by the backend but had no inputs
                  here at all, so they could never actually be set during
                  initial campaign creation. */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="s4grid2">
                <div>
                  <label style={lbl}>Estimated delivery</label>
                  <input
                    style={inp}
                    placeholder="e.g. March 2026"
                    value={reward.estimatedDelivery ?? ""}
                    onChange={e => onUpdate("estimatedDelivery", e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                <div>
                  <label style={lbl}>Limit quantity (optional)</label>
                  <input
                    style={inp}
                    type="number"
                    min={1}
                    placeholder="Unlimited"
                    value={reward.limitedQuantity ?? ""}
                    onChange={e => onUpdate("limitedQuantity", e.target.value === "" ? undefined : Number(e.target.value))}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Step4Rewards({ data, onChange }: Props) {
  const { isDark } = useTheme();
  const set = (rewards: RewardTierRequest[]) => onChange({ rewards });

  const add       = () => { if (data.rewards.length < 8) set([...data.rewards, { title: "", description: "", minimumAmount: 0 }]); };
  const remove    = (i: number) => set(data.rewards.filter((_, idx) => idx !== i));
  const update    = (i: number, k: keyof RewardTierRequest, v: string | number | undefined) => set(data.rewards.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const addPreset = (p: typeof PRESETS[0]) => { if (data.rewards.length < 8) set([...data.rewards, { title: p.title, description: p.description, minimumAmount: p.minimumAmount }]); };

  const bdr   = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const muted = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Info banner */}
      <div style={{ padding: "12px 16px", borderRadius: 13, background: isDark ? "rgba(167,139,250,0.06)" : "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.18)", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>🎁</span>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: muted, margin: 0, lineHeight: 1.65 }}>
        Reward tiers are <strong style={{ color: "#a78bfa" }}>optional</strong> but strongly boost conversions. Backers who pledge ≥ the minimum receive that tier&apos;s reward.
        </p>
      </div>

      {/* Presets */}
      <div>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)", margin: "0 0 10px" }}>⚡ Quick-add presets</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRESETS.map(p => (
            <motion.button
              key={p.title}
              whileHover={{ scale: 1.03, borderColor: p.color, color: p.color }}
              whileTap={{ scale: 0.97 }}
              onClick={() => addPreset(p)}
              disabled={data.rewards.length >= 8}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 999, border: `1px solid ${bdr}`, background: "transparent", color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 13, cursor: data.rewards.length >= 8 ? "not-allowed" : "pointer", opacity: data.rewards.length >= 8 ? 0.5 : 1, transition: "all 0.15s" }}
            >
              <span style={{ fontSize: 14 }}>{p.emoji}</span>
              {p.title} <span style={{ fontSize: 11, opacity: 0.7 }}>₹{p.minimumAmount.toLocaleString("en-IN")}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tier cards */}
      <AnimatePresence>
        {data.rewards.map((r, i) => (
          <TierCard key={i} reward={r} index={i} total={data.rewards.length} onUpdate={(k, v) => update(i, k, v)} onRemove={() => remove(i)} isDark={isDark} />
        ))}
      </AnimatePresence>

      {/* Add button */}
      {data.rewards.length < 8 && (
        <motion.button
          onClick={add}
          whileHover={{ borderColor: "rgba(255,107,0,0.45)", color: "#ff8800" }}
          whileTap={{ scale: 0.98 }}
          style={{ padding: "16px", borderRadius: 16, border: `2px dashed ${bdr}`, background: "transparent", color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", transition: "all 0.18s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add reward tier
          <span style={{ fontSize: 12, opacity: 0.65 }}>({data.rewards.length}/8)</span>
        </motion.button>
      )}

      {data.rewards.length === 0 && (
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, textAlign: "center", margin: 0 }}>
          No tiers yet — that&apos;s fine! You can skip this step or use the presets above.
        </p>
      )}

      <style>{`@media(max-width:520px){.s4grid2{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

export type { RewardsData };
