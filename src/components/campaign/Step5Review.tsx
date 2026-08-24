"use client";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import type { BasicInfo }   from "./Step1BasicInfo";
import type { StoryData }   from "./Step2Story";
import type { MediaData }   from "./Step3Media";
import type { RewardsData } from "./Step4Rewards";
import SuccessScorePanel from "./SuccessScorePanel";
import type { Category }    from "@/lib/api";

interface Props {
  basic: BasicInfo; story: StoryData; media: MediaData;
  rewards: RewardsData; categories: Category[]; isDark: boolean;
}

// ─── Readiness checks ─────────────────────────────────────────────────────────
const CHECKS = [
  { label: "Title set",          weight: 15, ok: (p: Props) => !!p.basic.title.trim() },
  { label: "Short description",  weight: 10, ok: (p: Props) => !!p.basic.shortDescription.trim() },
  { label: "Funding goal ≥ ₹1K", weight: 15, ok: (p: Props) => !!p.basic.goalAmount && Number(p.basic.goalAmount) >= 1000 },
  { label: "Deadline set",       weight: 10, ok: (p: Props) => !!p.basic.deadline },
  { label: "Category selected",  weight: 5,  ok: (p: Props) => p.basic.categoryIds.length > 0 },
  { label: "Location set",       weight: 5,  ok: (p: Props) => !!p.basic.location.trim() },
  { label: "Story ≥ 50 chars",   weight: 15, ok: (p: Props) => p.story.fullDescription.length >= 50 },
  { label: "Story ≥ 200 words",  weight: 5,  ok: (p: Props) => p.story.fullDescription.trim().split(/\s+/).length >= 200 },
  { label: "Thumbnail uploaded", weight: 15, ok: (p: Props) => !!p.media.media.find(m => m.usage === "THUMBNAIL") },
  { label: "Reward tiers added", weight: 5,  ok: (p: Props) => p.rewards.rewards.length > 0 },
];

function ReviewSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`, marginBottom: 16 }}
    >
      <div style={{ padding: "13px 18px", background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--text)", margin: 0 }}>{title}</h3>
      </div>
      <div style={{ padding: "14px 18px" }}>{children}</div>
    </motion.div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  const { isDark } = useTheme();
  return (
    <div style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`, alignItems: "flex-start" }}>
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", minWidth: 130, flexShrink: 0, paddingTop: 1 }}>{label}</span>
      <span style={{ fontFamily: mono ? "monospace" : "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text)", flex: 1 }}>{value || "—"}</span>
    </div>
  );
}

export default function Step5Review(props: Props) {
  const { basic, story, media, rewards, categories, isDark } = props;
  const muted = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";

  const checks  = CHECKS.map(c => ({ ...c, passed: c.ok(props) }));
  const score   = checks.reduce((s, c) => s + (c.passed ? c.weight : 0), 0);
  const missing = checks.filter(c => !c.passed && c.weight >= 10);

  const scoreColor = score < 60 ? "#ef4444" : score < 80 ? "#f59e0b" : "#34d399";
  const scoreLabel = score < 60 ? "Not ready — fix required fields" : score < 80 ? "Almost ready" : score < 100 ? "Ready to launch 🚀" : "Perfect! 🎉";

  const catNames = basic.categoryIds.map(id => categories.find(c => c.id === id)?.name ?? `#${id}`).join(", ");
  const thumbnail = media.media.find(m => m.usage === "THUMBNAIL");
  const deadline  = basic.deadline ? new Date(basic.deadline).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
  const wordCount = story.fullDescription.trim() ? story.fullDescription.trim().split(/\s+/).length : 0;

  // Feature #41 — derived inputs for the AI success predictor
  const durationDays = basic.deadline
    ? Math.max(1, Math.ceil((new Date(basic.deadline).getTime() - Date.now()) / 86_400_000))
    : 30;
  const hasVideo = media.media.some(m => m.mediaType === "VIDEO");

  return (
    <div>
      {/* ── Readiness score ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ padding: "22px 22px 20px", borderRadius: 18, background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)", border: `1px solid ${score >= 80 ? "rgba(52,211,153,0.28)" : "rgba(239,68,68,0.2)"}`, marginBottom: 22, position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1.5, background: `linear-gradient(90deg,transparent,${scoreColor}70,transparent)` }} />

        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          {/* Gauge */}
          <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
            <svg width={72} height={72} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={36} cy={36} r={30} fill="none" strokeWidth={6} stroke={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"} />
              <motion.circle
                cx={36} cy={36} r={30} fill="none" strokeWidth={6} stroke={scoreColor}
                strokeDasharray={`${2 * Math.PI * 30}`}
                initial={{ strokeDashoffset: `${2 * Math.PI * 30}` }}
                animate={{ strokeDashoffset: `${2 * Math.PI * 30 * (1 - score / 100)}` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 16, color: scoreColor }}>{score}</span>
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: scoreColor, margin: "0 0 4px", letterSpacing: "-0.02em" }}>{scoreLabel}</p>
            {/* Track bar */}
            <div style={{ height: 5, borderRadius: 2, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 10 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 2, background: scoreColor }}
              />
            </div>
            {/* Check chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {checks.map(c => (
                <span key={c.label} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 11.5, fontFamily: "DM Sans, sans-serif", background: c.passed ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${c.passed ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.2)"}`, color: c.passed ? "#34d399" : "#ef4444", fontWeight: 600 }}>
                  {c.passed ? "✓" : "✕"} {c.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {missing.length > 0 && (
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12.5, color: "#ef4444", margin: "0 0 6px" }}>⚠ Fix these before submitting:</p>
            {missing.map(m => (
              <p key={m.label} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#ef4444", margin: "2px 0" }}>• {m.label}</p>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── AI Success Prediction (Feature #41) ── */}
      <SuccessScorePanel
        title={basic.title}
        shortDescription={basic.shortDescription}
        fullDescription={story.fullDescription}
        category={catNames}
        goalAmount={Number(basic.goalAmount) || 0}
        durationDays={durationDays}
        mediaCount={media.media.length}
        hasVideo={hasVideo}
        hasThumbnail={!!thumbnail}
        rewardTierCount={rewards.rewards.length}
        isDark={isDark}
      />

      {/* ── Sections ── */}
      <ReviewSection title="Basic Info" icon="✦">
        <Row label="Title"       value={basic.title} />
        <Row label="Short desc"  value={basic.shortDescription} />
        <Row label="Location"    value={basic.location} />
        <Row label="Goal"        value={basic.goalAmount ? `₹${Number(basic.goalAmount).toLocaleString("en-IN")}` : "—"} />
        <Row label="Deadline"    value={deadline} />
        <Row label="Categories"  value={catNames || "—"} />
      </ReviewSection>

      <ReviewSection title="Story" icon="✍">
        <Row label="Length" value={`${story.fullDescription.length} chars · ${wordCount} words ${wordCount < 100 ? "⚠ short" : "✓"}`} />
        <Row label="Preview" value={
          <span style={{ opacity: 0.8, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {story.fullDescription.slice(0, 300) || "—"}
          </span>
        } />
      </ReviewSection>

      <ReviewSection title="Media" icon="🖼">
        {thumbnail && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>Thumbnail</p>
            <img src={thumbnail.mediaUrl} alt="thumbnail" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 12 }} />
          </div>
        )}
        <Row label="Files" value={`${media.media.length} uploaded`} />
        {media.media.filter(m => m.usage !== "THUMBNAIL").map((m, i) => (
          <Row key={i} label={m.usage.replace(/_/g, " ").toLowerCase()} value={
            m.mediaType === "IMAGE"
              ? <img src={m.mediaUrl} alt="" style={{ width: 72, height: 46, objectFit: "cover", borderRadius: 7 }} />
              : <span style={{ color: muted, fontSize: 13 }}>🎬 Video uploaded</span>
          } />
        ))}
        {!thumbnail && (
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#ef4444", margin: 0 }}>✕ No thumbnail — required before submitting</p>
        )}
      </ReviewSection>

      <ReviewSection title="Reward Tiers" icon="🎁">
        {rewards.rewards.length === 0 ? (
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: muted, margin: 0 }}>No tiers — optional</p>
        ) : (
          rewards.rewards.map((r, i) => (
            <Row key={i} label={`Tier ${i + 1}`} value={
              <span>
                <strong style={{ fontWeight: 700 }}>{r.title}</strong>
                <span style={{ color: muted }}> · ₹{Number(r.minimumAmount).toLocaleString("en-IN")} min</span>
                {r.description && <span style={{ display: "block", fontSize: 12, color: muted, marginTop: 2 }}>{r.description}</span>}
              </span>
            } />
          ))
        )}
      </ReviewSection>

      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, lineHeight: 1.7, marginTop: 4, padding: "13px 16px", borderRadius: 12, background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
        🔍 Your campaign will be submitted for <strong style={{ color: "var(--text)" }}>admin review</strong>. You&apos;ll receive an email once it&apos;s approved or if changes are needed. Approval usually takes 24–48 hours.
      </p>
    </div>
  );
}
