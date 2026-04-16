"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import { projectApi, categoryApi, type Category } from "@/lib/api";
import { useEffect } from "react";

import Step1BasicInfo, { type BasicInfo } from "@/components/campaign/Step1BasicInfo";
import Step2Story, { type StoryData } from "@/components/campaign/Step2Story";
import Step3Media, { type MediaData } from "@/components/campaign/Step3Media";
import Step4Rewards, { type RewardsData } from "@/components/campaign/Step4Rewards";
import Step5Review from "@/components/campaign/Step5Review";

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Basic Info",  short: "01" },
  { label: "Story",       short: "02" },
  { label: "Media",       short: "03" },
  { label: "Rewards",     short: "04" },
  { label: "Review",      short: "05" },
];

// ─── Default state ────────────────────────────────────────────────────────────
const DEFAULT_BASIC: BasicInfo = {
  title: "",
  shortDescription: "",
  location: "",
  goalAmount: "",
  deadline: "",
  categoryIds: [],
};

const DEFAULT_STORY: StoryData = { fullDescription: "" };
const DEFAULT_MEDIA: MediaData = { media: [] };
const DEFAULT_REWARDS: RewardsData = { rewards: [] };

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreateCampaignPage() {
  const { isDark } = useTheme();
  const { user } = useProfile();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [basic, setBasic] = useState<BasicInfo>(DEFAULT_BASIC);
  const [story, setStory] = useState<StoryData>(DEFAULT_STORY);
  const [media, setMedia] = useState<MediaData>(DEFAULT_MEDIA);
  const [rewards, setRewards] = useState<RewardsData>(DEFAULT_REWARDS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(() => {});
  }, []);

  // ── Validation per step ──────────────────────────────────────────────────
  const canProceed = (): boolean => {
    if (step === 0)
      return !!(
        basic.title.trim() &&
        basic.shortDescription.trim() &&
        basic.goalAmount &&
        Number(basic.goalAmount) > 0 &&
        basic.deadline &&
        basic.categoryIds.length > 0 &&
        basic.location.trim()
      );
    if (step === 1) return basic.shortDescription.length > 0; // story optional min
    if (step === 2) return !!media.media.find((m) => m.usage === "THUMBNAIL");
    return true; // rewards + review always ok
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await projectApi.create({
        title: basic.title,
        shortDescription: basic.shortDescription,
        fullDescription: story.fullDescription,
        goalAmount: Number(basic.goalAmount),
        deadline: basic.deadline,
        location: basic.location,
        categoryIds: basic.categoryIds,
        media: media.media,
        rewardTiers: rewards.rewards,
      });
      router.push("/dashboard/my-campaigns?created=1");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Theme shortcuts ──────────────────────────────────────────────────────
  const bg = isDark ? "#0d0d0d" : "#f7f7f5";
  const card = isDark ? "#141414" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.42)";

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        padding: "32px 20px 80px",
        color: isDark ? "#f0f0f0" : "#111",
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 760, margin: "0 auto 32px" }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: textMuted, marginBottom: 4 }}>
          Dashboard / Create Campaign
        </p>
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: "-0.03em",
            margin: 0,
            color: isDark ? "#f0f0f0" : "#111",
          }}
        >
          Launch Your Campaign
        </h1>
      </div>

      {/* Stepper */}
      <div style={{ maxWidth: 760, margin: "0 auto 28px", display: "flex", gap: 6 }}>
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <button
              key={i}
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 10,
                border: `1px solid ${active ? "#ff8800" : done ? "rgba(255,136,0,0.3)" : border}`,
                background: active
                  ? "rgba(255,136,0,0.1)"
                  : done
                  ? "rgba(255,136,0,0.04)"
                  : "transparent",
                cursor: i < step ? "pointer" : "default",
                textAlign: "left",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: 10,
                  color: active ? "#ff8800" : done ? "rgba(255,136,0,0.6)" : textMuted,
                  letterSpacing: "0.08em",
                  marginBottom: 2,
                }}
              >
                {done ? "✓" : s.short}
              </div>
              <div
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: active ? "#ff8800" : done ? (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)") : textMuted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Card */}
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          background: card,
          borderRadius: 20,
          border: `1px solid ${border}`,
          padding: "32px 32px 28px",
          boxShadow: isDark ? "0 4px 40px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Step title */}
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: "-0.025em",
            margin: "0 0 24px",
            color: isDark ? "#f0f0f0" : "#111",
          }}
        >
          {STEPS[step].label}
        </h2>

        {/* Step content */}
        {step === 0 && <Step1BasicInfo data={basic} onChange={setBasic} isDark={isDark} />}
        {step === 1 && <Step2Story data={story} onChange={setStory} isDark={isDark} />}
        {step === 2 && <Step3Media data={media} onChange={setMedia} isDark={isDark} />}
        {step === 3 && <Step4Rewards data={rewards} onChange={setRewards} isDark={isDark} />}
        {step === 4 && (
          <Step5Review
            basic={basic}
            story={story}
            media={media}
            rewards={rewards}
            categories={categories}
            isDark={isDark}
          />
        )}

        {/* Submit error */}
        {submitError && (
          <div
            style={{
              marginTop: 20,
              padding: "12px 16px",
              borderRadius: 10,
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.25)",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              color: "#ef4444",
            }}
          >
            {submitError}
          </div>
        )}

        {/* Nav buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 32,
            paddingTop: 20,
            borderTop: `1px solid ${border}`,
          }}
        >
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            style={{
              padding: "11px 24px",
              borderRadius: 12,
              border: `1px solid ${border}`,
              background: "transparent",
              color: step === 0 ? textMuted : isDark ? "#f0f0f0" : "#111",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: step === 0 ? "not-allowed" : "pointer",
              opacity: step === 0 ? 0.4 : 1,
              transition: "all 0.15s",
            }}
          >
            ← Back
          </button>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: textMuted }}>
              Step {step + 1} of {STEPS.length}
            </span>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                style={{
                  padding: "11px 28px",
                  borderRadius: 12,
                  border: "none",
                  background: canProceed() ? "#ff8800" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                  color: canProceed() ? "#fff" : textMuted,
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: canProceed() ? "pointer" : "not-allowed",
                  transition: "all 0.15s",
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: "11px 32px",
                  borderRadius: 12,
                  border: "none",
                  background: submitting ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)") : "#ff8800",
                  color: submitting ? textMuted : "#fff",
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {submitting ? (
                  <>
                    <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Submitting…
                  </>
                ) : (
                  "🚀 Submit Campaign"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
