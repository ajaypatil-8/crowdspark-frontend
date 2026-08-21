"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import { projectApi, categoryApi, type Category, type GenerateDescriptionResponse } from "@/lib/api";

import Step1BasicInfo, { type BasicInfo } from "@/components/campaign/Step1BasicInfo";
import Step2Story,    { type StoryData }  from "@/components/campaign/Step2Story";
import Step3Media,    { type MediaData }  from "@/components/campaign/Step3Media";
import Step4Rewards,  { type RewardsData } from "@/components/campaign/Step4Rewards";
import Step5Review    from "@/components/campaign/Step5Review";
import AiDescriptionGenerator from "@/components/campaign/AiDescriptionGenerator";

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Basic Info",  short: "01", icon: "✦", hint: "Title, goal & category" },
  { label: "Story",       short: "02", icon: "✍",  hint: "Your campaign narrative" },
  { label: "Media",       short: "03", icon: "🖼", hint: "Images & video" },
  { label: "Rewards",     short: "04", icon: "🎁", hint: "Backer perks" },
  { label: "Review",      short: "05", icon: "🚀", hint: "Final check & submit" },
];

const DEFAULT_BASIC:   BasicInfo   = { title: "", shortDescription: "", location: "", goalAmount: "", deadline: "", categoryIds: [] };
const DEFAULT_STORY:   StoryData   = { fullDescription: "" };
const DEFAULT_MEDIA:   MediaData   = { media: [] };
const DEFAULT_REWARDS: RewardsData = { rewards: [] };

// ─── Ambient canvas ───────────────────────────────────────────────────────────
function AmbientCanvas({ isDark }: { isDark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      c.width = c.offsetWidth * dpr; c.height = c.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);
    type Orb = { x: number; y: number; r: number; vx: number; vy: number; hue: number; a: number };
    const orbs: Orb[] = [
      { x: 0.1,  y: 0.2, r: 0.35, vx:  0.00025, vy:  0.0002,  hue: 22,  a: isDark ? 0.09 : 0.05 },
      { x: 0.85, y: 0.6, r: 0.28, vx: -0.00018, vy:  0.00022, hue: 45,  a: isDark ? 0.06 : 0.03 },
      { x: 0.5,  y: 0.9, r: 0.22, vx:  0.00022, vy: -0.00028, hue: 260, a: isDark ? 0.05 : 0.025 },
    ];
    let raf: number;
    const W = () => c.offsetWidth, H = () => c.offsetHeight;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, W(), H());
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -0.1 || o.x > 1.1) o.vx *= -1;
        if (o.y < -0.1 || o.y > 1.1) o.vy *= -1;
        const gx = o.x * W(), gy = o.y * H(), gr = o.r * Math.min(W(), H());
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        g.addColorStop(0, `hsla(${o.hue},80%,55%,${o.a})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.fill();
      });
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [isDark]);
  return <canvas ref={ref} aria-hidden style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.6 }} />;
}

// ─── Premium Step Indicator ───────────────────────────────────────────────────
function StepBar({ current, onJump }: { current: number; onJump: (i: number) => void }) {
  const { isDark } = useTheme();
  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const muted = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";

  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 28, position: "relative", zIndex: 1 }}>
      {/* Track line */}
      <div style={{ position: "absolute", top: 19, left: 20, right: 20, height: 1, background: bdr, zIndex: 0, pointerEvents: "none" }} />
      <motion.div
        style={{ position: "absolute", top: 19, left: 20, height: 1, background: "linear-gradient(90deg,#ff6b00,#ffcc00)", zIndex: 1, pointerEvents: "none" }}
        animate={{ width: `calc(${(current / (STEPS.length - 1)) * 100}% - 40px)` }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />

      {STEPS.map((s, i) => {
        const done   = i < current;
        const active = i === current;
        const canGo  = i < current;

        return (
          <motion.button
            key={i}
            onClick={() => canGo && onJump(i)}
            whileHover={canGo ? { scale: 1.03 } : {}}
            whileTap={canGo ? { scale: 0.97 } : {}}
            style={{
              flex: 1, padding: "10px 8px 10px", borderRadius: 14, border: "none",
              background: active
                ? isDark ? "rgba(255,107,0,0.08)" : "rgba(255,107,0,0.06)"
                : done
                  ? isDark ? "rgba(52,211,153,0.06)" : "rgba(52,211,153,0.04)"
                  : isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
              outline: active
                ? "1.5px solid rgba(255,107,0,0.5)"
                : done
                  ? "1px solid rgba(52,211,153,0.25)"
                  : `1px solid ${bdr}`,
              cursor: canGo ? "pointer" : "default",
              textAlign: "left",
              transition: "all 0.22s",
              position: "relative",
              zIndex: 2,
              boxShadow: active ? "0 0 18px rgba(255,107,0,0.12)" : "none",
            }}
          >
            {/* Active pulse ring */}
            {active && (
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", top: 8, left: 8, width: 24, height: 24, borderRadius: "50%", border: "1.5px solid rgba(255,107,0,0.5)", pointerEvents: "none" }}
              />
            )}

            {/* Step circle */}
            <div style={{ width: 24, height: 24, borderRadius: "50%", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, fontFamily: "Syne, sans-serif", background: active ? "linear-gradient(135deg,#ff6b00,#ffcc00)" : done ? "#34d399" : bdr, color: active || done ? "#fff" : muted, boxShadow: active ? "0 0 12px rgba(255,107,0,0.4)" : done ? "0 0 8px rgba(52,211,153,0.3)" : "none", transition: "all 0.22s" }}>
              {done ? "✓" : s.short}
            </div>

            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 11, color: active ? "#ff8800" : done ? "#34d399" : muted, marginBottom: 2, transition: "color 0.2s" }}>
              {s.label}
            </div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, color: muted, display: "none" }} className="step-hint">
              {s.hint}
            </div>
          </motion.button>
        );
      })}

      <style>{`@media(min-width:640px){.step-hint{display:block!important}}`}</style>
    </div>
  );
}

function SideInfoCard({
  title,
  value,
  sub,
  tone,
  isDark,
}: {
  title: string;
  value: string;
  sub: string;
  tone: "orange" | "teal" | "violet";
  isDark: boolean;
}) {
  const tones = {
    orange: {
      glow: "rgba(255,107,0,0.2)",
      line: "linear-gradient(90deg,#ff6b00,#ffcc00)",
      soft: "rgba(255,107,0,0.08)",
      text: "#ff9300",
    },
    teal: {
      glow: "rgba(0,245,212,0.2)",
      line: "linear-gradient(90deg,#00f5d4,#41d1ff)",
      soft: "rgba(0,245,212,0.08)",
      text: "#22d3ee",
    },
    violet: {
      glow: "rgba(167,139,250,0.2)",
      line: "linear-gradient(90deg,#8b5cf6,#a78bfa)",
      soft: "rgba(139,92,246,0.08)",
      text: "#a78bfa",
    },
  } as const;

  const selected = tones[tone];
  const bdr = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";
  const txt = isDark ? "#f5f5f5" : "#111";
  const muted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      style={{
        borderRadius: 16,
        border: `1px solid ${bdr}`,
        background: isDark ? "rgba(255,255,255,0.02)" : "#fff",
        padding: "14px 14px 13px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: selected.soft,
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1.5,
          background: selected.line,
        }}
      />
      <p style={{ position: "relative", margin: "0 0 8px", fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
        {title}
      </p>
      <p style={{ position: "relative", margin: "0 0 6px", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: txt, letterSpacing: "-0.02em" }}>
        {value}
      </p>
      <p style={{ position: "relative", margin: 0, fontFamily: "DM Sans, sans-serif", fontSize: 12, color: selected.text }}>
        {sub}
      </p>
      <div
        style={{
          position: "absolute",
          width: 56,
          height: 56,
          borderRadius: "50%",
          right: -12,
          bottom: -12,
          background: selected.glow,
          filter: "blur(14px)",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreateCampaignPage() {
  const { isDark } = useTheme();
  const { user }   = useProfile();
  const router     = useRouter();

  const [step,        setStep]        = useState(0);
  const [basic,       setBasic]       = useState<BasicInfo>(DEFAULT_BASIC);
  const [story,       setStory]       = useState<StoryData>(DEFAULT_STORY);
  const [media,       setMedia]       = useState<MediaData>(DEFAULT_MEDIA);
  const [rewards,     setRewards]     = useState<RewardsData>(DEFAULT_REWARDS);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [direction,   setDirection]   = useState(1); // 1=forward, -1=back
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => { categoryApi.getAll().then(setCategories).catch(() => {}); }, []);

  const canProceed = (): boolean => {
    if (step === 0) return !!(basic.title.trim() && basic.shortDescription.trim() && basic.goalAmount && Number(basic.goalAmount) >= 1000 && basic.deadline && basic.categoryIds.length > 0 && basic.location.trim());
    if (step === 1) return story.fullDescription.trim().length >= 50;
    if (step === 2) return !!media.media.find(m => m.usage === "THUMBNAIL");
    return true;
  };

  const goNext = () => {
    if (!canProceed()) return;
    setDirection(1);
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 0));
  };

  const jumpTo = (i: number) => {
    setDirection(i < step ? -1 : 1);
    setStep(i);
  };

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
      setShowSuccess(true);
      setTimeout(() => router.push("/dashboard/my-campaigns?created=1"), 2200);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const applyAiDraft = (result: GenerateDescriptionResponse) => {
    if (
      story.fullDescription.trim().length > 0 &&
      !window.confirm("This will replace your current campaign story and short description. Continue?")
    ) {
      return;
    }
    setBasic(b => ({
      ...b,
      shortDescription: result.shortPitch,
      // Only fills the goal if the creator hasn't already typed one —
      // never overwrites a deliberate choice.
      goalAmount: b.goalAmount || String(Math.round(result.suggestedGoalAmount)),
    }));
    setStory({ fullDescription: result.fullDescription });
  };

  // ─── Theme shortcuts ──────────────────────────────────────────────────────
  const card   = isDark ? "rgba(13,13,13,0.9)" : "rgba(255,255,255,0.95)";
  const bdr    = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const muted  = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const txt    = isDark ? "#f0f0f0" : "#111";

  // ─── Slide variants ────────────────────────────────────────────────────────
  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  // Progress pct
  const progressPct = Math.round(((step) / (STEPS.length - 1)) * 100);
  const completionLabel = progressPct < 30 ? "Strong start" : progressPct < 70 ? "Good momentum" : "Almost launch-ready";
  const mediaCount = media.media.length;
  const rewardsCount = rewards.rewards.length;
  const basicDone =
    !!basic.title.trim() &&
    !!basic.shortDescription.trim() &&
    !!basic.location.trim() &&
    !!basic.goalAmount &&
    !!basic.deadline &&
    basic.categoryIds.length > 0;
  const storyDone = story.fullDescription.trim().length >= 50;
  const mediaDone = !!media.media.find((m) => m.usage === "THUMBNAIL");
  const readinessPoints = [basicDone, storyDone, mediaDone, step >= 3].filter(Boolean).length;
  const readinessPct = Math.round((readinessPoints / 4) * 100);

  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingBottom: 80 }}>
      <AmbientCanvas isDark={isDark} />
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: isDark
            ? "radial-gradient(circle at 12% 12%, rgba(255,107,0,0.12), transparent 35%), radial-gradient(circle at 82% 16%, rgba(0,245,212,0.12), transparent 35%), radial-gradient(circle at 50% 100%, rgba(139,92,246,0.1), transparent 40%)"
            : "radial-gradient(circle at 12% 12%, rgba(255,107,0,0.08), transparent 35%), radial-gradient(circle at 82% 16%, rgba(0,168,130,0.08), transparent 35%), radial-gradient(circle at 50% 100%, rgba(139,92,246,0.07), transparent 40%)",
        }}
      />

      {/* ─── Success overlay ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(16px)" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              style={{ textAlign: "center", padding: "60px 48px", borderRadius: 28, background: isDark ? "rgba(13,13,13,0.95)" : "#fff", border: `1px solid ${bdr}`, boxShadow: "0 40px 100px rgba(0,0,0,0.4)" }}
            >
              {[1, 2, 3].map(i => (
                <motion.div key={i}
                  initial={{ scale: 0.8, opacity: 0.6 }} animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 1.8, delay: i * 0.3, repeat: Infinity, ease: "easeOut" }}
                  style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", border: "2px solid rgba(52,211,153,0.4)", left: "50%", top: 60, transform: "translateX(-50%)" }}
                />
              ))}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
                style={{ width: 80, height: 80, borderRadius: 24, margin: "0 auto 24px", background: "rgba(52,211,153,0.1)", border: "2px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 0 40px rgba(52,211,153,0.25)", position: "relative" }}
              >
                🚀
              </motion.div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 26, color: txt, margin: "0 0 10px", letterSpacing: "-0.03em" }}>Campaign Submitted!</h2>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: muted, margin: "0 auto", maxWidth: 320, lineHeight: 1.75 }}>
                  Your campaign is under review. We&apos;ll notify you within 24–48 hours. Redirecting…
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "36px 20px 0", position: "relative", zIndex: 1 }}>

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ marginBottom: 24 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🚀</div>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>Campaign creation</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(24px,3vw,38px)", color: txt, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.07 }}>
              Launch Your Campaign
              </h1>
              <p style={{ margin: "8px 0 0", fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted }}>
                Premium guided builder designed to maximize trust and conversions.
              </p>
            </div>
            {/* Overall progress mini-bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 120, height: 4, borderRadius: 2, background: bdr, overflow: "hidden" }}>
                <motion.div
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#ff6b00,#ffcc00)" }}
                />
              </div>
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: muted, fontWeight: 600, minWidth: 30 }}>{progressPct}%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          style={{
            marginBottom: 20,
            borderRadius: 18,
            border: `1px solid ${bdr}`,
            background: isDark ? "rgba(12,12,12,0.72)" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            padding: "14px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff8800", boxShadow: "0 0 14px rgba(255,136,0,0.5)" }} />
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, fontWeight: 600 }}>
                {completionLabel}
              </span>
            </div>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: muted }}>
              Step {step + 1}/{STEPS.length}
            </span>
          </div>
          <StepBar current={step} onJump={jumpTo} />
        </motion.div>

        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "minmax(0,1fr)" }} className="cc-layout-grid">

        {/* ─── Main card ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            borderRadius: 24, background: card,
            border: `1px solid ${bdr}`,
            boxShadow: isDark ? "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)" : "0 8px 40px rgba(0,0,0,0.08)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            overflow: "hidden", position: "relative",
          }}
        >
          {/* Top accent */}
          <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1.5, background: "linear-gradient(90deg,transparent,rgba(255,107,0,0.7) 30%,rgba(255,204,0,0.9) 50%,rgba(255,107,0,0.7) 70%,transparent)" }} />

          {/* Step header */}
          <div style={{ padding: "28px 32px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                {STEPS[step].icon}
              </div>
              <div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: txt, margin: 0, letterSpacing: "-0.02em" }}>{STEPS[step].label}</h2>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, margin: 0 }}>{STEPS[step].hint}</p>
              </div>
            </div>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: muted, padding: "4px 12px", borderRadius: 999, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${bdr}` }}>
              Step {step + 1} of {STEPS.length}
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: bdr, margin: "22px 0 0" }} />

          {/* Step content — animated slide */}
          <div style={{ padding: "28px 32px", minHeight: 380, position: "relative", overflow: "hidden" }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === 0 && (
                  <>
                    <AiDescriptionGenerator title={basic.title} isDark={isDark} onApply={applyAiDraft} />
                    <Step1BasicInfo data={basic} onChange={setBasic} isDark={isDark} />
                  </>
                )}
                {step === 1 && <Step2Story    data={story} onChange={setStory} isDark={isDark} />}
                {step === 2 && <Step3Media    data={media} onChange={setMedia} isDark={isDark} />}
                {step === 3 && <Step4Rewards  data={rewards} onChange={setRewards} isDark={isDark} />}
                {step === 4 && (
                  <Step5Review
                    basic={basic} story={story} media={media}
                    rewards={rewards} categories={categories} isDark={isDark}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Submit error */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ margin: "0 32px 16px", padding: "13px 16px", borderRadius: 14, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.22)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "#ef4444", display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
                <span>{submitError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Nav footer ─────────────────────────────────────────────────── */}
          <div style={{ padding: "0 32px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${bdr}`, paddingTop: 22 }}>
            {/* Back */}
            <motion.button
              onClick={goBack}
              disabled={step === 0}
              whileHover={step > 0 ? { scale: 1.02 } : {}}
              whileTap={step > 0 ? { scale: 0.97 } : {}}
              style={{ padding: "12px 24px", borderRadius: 13, border: `1px solid ${bdr}`, background: "transparent", color: step === 0 ? muted : txt, fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600, cursor: step === 0 ? "not-allowed" : "pointer", opacity: step === 0 ? 0.4 : 1, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 7 }}
            >
              ← Back
            </motion.button>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Validation hint */}
              {step < 4 && !canProceed() && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#f59e0b", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                  {step === 0 && "Fill all required fields"}
                  {step === 1 && "Write at least 50 characters"}
                  {step === 2 && "Upload a thumbnail image"}
                </motion.span>
              )}

              {step < STEPS.length - 1 ? (
                <motion.button
                  onClick={goNext}
                  disabled={!canProceed()}
                  whileHover={canProceed() ? { scale: 1.02 } : {}}
                  whileTap={canProceed() ? { scale: 0.97 } : {}}
                  style={{ padding: "12px 30px", borderRadius: 13, border: "none", background: canProceed() ? "linear-gradient(135deg,#ff6b00,#ffcc00)" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", color: canProceed() ? "#fff" : muted, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, cursor: canProceed() ? "pointer" : "not-allowed", transition: "all 0.18s", boxShadow: canProceed() ? "0 0 24px rgba(255,107,0,0.3)" : "none", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 8 }}
                >
                  {canProceed() && <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.2) 50%,transparent 70%)", animation: "cc10shimmer 2.4s ease-in-out infinite" }} />}
                  <span style={{ position: "relative" }}>Continue</span>
                  <span style={{ position: "relative" }}>→</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSubmit}
                  disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02 } : {}}
                  whileTap={!submitting ? { scale: 0.97 } : {}}
                  style={{ padding: "12px 32px", borderRadius: 13, border: "none", background: submitting ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)") : "linear-gradient(135deg,#ff6b00,#ffcc00)", color: submitting ? muted : "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 0 28px rgba(255,107,0,0.35)", transition: "all 0.18s", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 9 }}
                >
                  {!submitting && <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.2) 50%,transparent 70%)", animation: "cc10shimmer 2.4s ease-in-out infinite" }} />}
                  {submitting
                    ? <><span style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "cc10spin .7s linear infinite", display: "block", flexShrink: 0 }} /><span style={{ position: "relative" }}>Submitting…</span></>
                    : <><span style={{ position: "relative" }}>🚀 Submit Campaign</span></>
                  }
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

          <aside
            style={{
              display: "none",
              position: "sticky",
              top: 84,
              alignSelf: "start",
              borderRadius: 20,
              border: `1px solid ${bdr}`,
              background: isDark ? "rgba(10,10,10,0.82)" : "rgba(255,255,255,0.9)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              overflow: "hidden",
            }}
            className="cc-side-panel"
          >
            <div style={{ padding: 18, borderBottom: `1px solid ${bdr}` }}>
              <p style={{ margin: "0 0 8px", fontFamily: "DM Sans, sans-serif", fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                Launch Readiness
              </p>
              <p style={{ margin: "0 0 10px", fontFamily: "Syne, sans-serif", fontSize: 24, color: txt, fontWeight: 900, letterSpacing: "-0.03em" }}>
                {readinessPct}%
              </p>
              <div style={{ height: 6, borderRadius: 999, background: bdr, overflow: "hidden" }}>
                <motion.div
                  animate={{ width: `${readinessPct}%` }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#ff6b00,#ffcc00)" }}
                />
              </div>
            </div>

            <div style={{ padding: 14, display: "grid", gap: 10 }}>
              <SideInfoCard title="Media Assets" value={String(mediaCount)} sub={mediaDone ? "Thumbnail included" : "Add thumbnail to proceed"} tone="teal" isDark={isDark} />
              <SideInfoCard title="Reward Tiers" value={String(rewardsCount)} sub={rewardsCount > 0 ? "Great conversion booster" : "Add at least one tier"} tone="violet" isDark={isDark} />
              <SideInfoCard title="Current Stage" value={STEPS[step].short} sub={STEPS[step].label} tone="orange" isDark={isDark} />
            </div>

            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ margin: "2px 14px 14px", padding: "14px 14px", borderRadius: 14, background: isDark ? "rgba(255,107,0,0.05)" : "rgba(255,107,0,0.04)", border: "1px solid rgba(255,107,0,0.2)", display: "flex", alignItems: "flex-start", gap: 10 }}
            >
              <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>💡</span>
              <div>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12.5, color: "#ff8800", margin: "0 0 4px" }}>Pro tip</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, margin: 0, lineHeight: 1.6 }}>
                  {step === 0 && "Campaigns with clear goals raise 3x more. Be specific about what each funding milestone unlocks."}
                  {step === 1 && "The first 3 sentences decide if a backer reads on. Start with the problem and emotional hook."}
                  {step === 2 && "High quality thumbnail and short teaser media substantially increases listing click-through rate."}
                  {step === 3 && "Reward tiers improve conversion. Keep one entry tier affordable and one premium tier aspirational."}
                  {step === 4 && "Final review: verify links, spelling, and funding details before submission to avoid review delays."}
                </p>
              </div>
            </motion.div>
          </aside>
        </div>

        {/* ─── Mobile/Tablet tips panel ─────────────────────────────────── */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          style={{ marginTop: 18, padding: "16px 22px", borderRadius: 16, background: isDark ? "rgba(255,107,0,0.04)" : "rgba(255,107,0,0.03)", border: "1px solid rgba(255,107,0,0.14)", display: "flex", alignItems: "flex-start", gap: 12 }}
          className="cc-mobile-tip"
        >
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</span>
          <div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12.5, color: "#ff8800", margin: "0 0 4px" }}>Pro tip</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, margin: 0, lineHeight: 1.65 }}>
              {step === 0 && "Campaigns with clear goals raise 3x more. Be specific about what each funding milestone unlocks."}
              {step === 1 && "The first 3 sentences decide if a backer reads on. Start with the problem and emotional hook."}
              {step === 2 && "High quality thumbnail and short teaser media substantially increases listing click-through rate."}
              {step === 3 && "Reward tiers improve conversion. Keep one entry tier affordable and one premium tier aspirational."}
              {step === 4 && "Final review: verify links, spelling, and funding details before submission to avoid review delays."}
            </p>
          </div>
        </motion.div>

      </div>

      <style>{`
        @keyframes cc10shimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(220%)} 100%{transform:translateX(220%)} }
        @keyframes cc10spin { to{transform:rotate(360deg)} }
        @media (min-width: 1080px) {
          .cc-layout-grid {
            grid-template-columns: minmax(0, 1fr) 320px !important;
            align-items: start;
          }
          .cc-side-panel {
            display: block !important;
          }
          .cc-mobile-tip {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
