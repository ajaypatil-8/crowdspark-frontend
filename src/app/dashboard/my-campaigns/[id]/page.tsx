"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import CreatorRewardFulfillment from "@/components/dashboard/CreatorRewardFulfillment";
import {
  ArrowLeft, BarChart2, DollarSign, Users, Clock, TrendingUp,
  Gift, ExternalLink, AlertTriangle, RefreshCcw, Zap,
  CheckCircle2, XCircle, Eye, Calendar, Target,
  ChevronRight, Edit3, Share2, Sparkles, Rocket, Plus, Flag, 
} from "lucide-react";
import MilestonesManager   from "@/components/dashboard/MilestonesManager";
import { useTheme } from "@/contexts/ThemeContext";
import { projectApi, exploreApi, type ProjectFullDetailsResponse } from "@/lib/api";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import { StatCard } from "@/components/dashboard/widgets";

type ProjectAnalytics = ProjectFullDetailsResponse & {
  status?: string;
  rejectionReason?: string | null;
  backersCount?: number;
  totalDays?: number;
};

// ─── Mini bar chart (no external lib needed) ────────────────────────────────
function MiniBarChart({
  data,
  color = "#ff8800",
  height = 80,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const { isDark } = useTheme();
  const max = Math.max(...data, 1);
  const barW = 100 / data.length;

  return (
    <div style={{ height, display: "flex", alignItems: "flex-end", gap: 3, paddingTop: 8 }}>
      {data.map((v, i) => {
        const pct = (v / max) * 100;
        return (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(pct, 4)}%` }}
            transition={{ duration: 0.6, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            title={`Day ${i + 1}: ₹${v.toLocaleString("en-IN")}`}
            style={{
              flex: 1,
              borderRadius: 4,
              background: i === data.length - 1
                ? `linear-gradient(to top, ${color}, ${color}cc)`
                : isDark ? `rgba(255,255,255,0.12)` : `rgba(0,0,0,0.08)`,
              cursor: "default",
              transition: "background 0.2s",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Circular progress ───────────────────────────────────────────────────────
function CircleProgress({
  pct, size = 120, stroke = 8, color = "#ff8800",
}: {
  pct: number; size?: number; stroke?: number; color?: string;
}) {
  const { isDark } = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 0,
      }}>
        <span style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: size * 0.2,
          color: "var(--text)", lineHeight: 1, letterSpacing: "-0.03em",
        }}>
          {pct}%
        </span>
        <span style={{
          fontFamily: "DM Sans, sans-serif", fontSize: size * 0.092,
          color: "var(--text-muted)", lineHeight: 1,
        }}>
          funded
        </span>
      </div>
    </div>
  );
}

// ─── Reward tier card ─────────────────────────────────────────────────────────
function RewardCard({
  reward,
  index,
}: {
  reward: { id: number; title: string; description: string | null; minimumAmount: number };
  index: number;
}) {
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState(false);
  const colors = ["#ff8800", "#a78bfa", "#34d399", "#60a5fa", "#f59e0b"];
  const color = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "16px 18px", borderRadius: 16,
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        border: `1px solid ${hovered ? `${color}44` : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)")}`,
        transition: "all 0.2s",
        display: "flex", alignItems: "flex-start", gap: 14,
        cursor: "default",
        boxShadow: hovered ? `0 4px 24px rgba(0,0,0,0.12)` : "none",
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: color,
        boxShadow: hovered ? `0 0 14px ${color}44` : "none",
        transition: "box-shadow 0.2s",
      }}>
        <Gift size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
          <span style={{
            fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
            color: "var(--text)",
          }}>
            {reward.title}
          </span>
          <span style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14,
            color: color, whiteSpace: "nowrap",
          }}>
            ₹{reward.minimumAmount.toLocaleString("en-IN")}+
          </span>
        </div>
        {reward.description && (
          <p style={{
            fontFamily: "DM Sans, sans-serif", fontSize: 12.5,
            color: "var(--text-muted)", margin: 0, lineHeight: 1.65,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {reward.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Status banner ────────────────────────────────────────────────────────────
function StatusBanner({ project }: { project: ProjectAnalytics }) {
  const status = project.status as string | undefined;
  if (!status || status === "APPROVED") return null;

  const cfgs: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; text: string }> = {
    PENDING:   { color: "#f59e0b", bg: "rgba(245,158,11,0.06)",  border: "rgba(245,158,11,0.2)",  icon: <Clock size={14} />,        text: "This campaign is currently under review by our team." },
    DRAFT:     { color: "#94a3b8", bg: "rgba(148,163,184,0.06)", border: "rgba(148,163,184,0.2)", icon: <Edit3 size={14} />,        text: "This campaign is a draft. Submit it for review when ready." },
    REJECTED:  { color: "#ef4444", bg: "rgba(239,68,68,0.06)",   border: "rgba(239,68,68,0.2)",   icon: <XCircle size={14} />,      text: project.rejectionReason ?? "This campaign was rejected." },
    FUNDED:    { color: "#a78bfa", bg: "rgba(167,139,250,0.06)", border: "rgba(167,139,250,0.2)", icon: <CheckCircle2 size={14} />, text: "🎉 Congratulations! This campaign has been fully funded." },
    COMPLETED: { color: "#34d399", bg: "rgba(52,211,153,0.06)",  border: "rgba(52,211,153,0.2)",  icon: <CheckCircle2 size={14} />, text: "This campaign has been completed successfully." },
  };

  const cfg = cfgs[status];
  if (!cfg) return null;

  return (
    <div style={{
      padding: "12px 16px", borderRadius: 13, marginBottom: 28,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      display: "flex", alignItems: "flex-start", gap: 10, color: cfg.color,
    }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: cfg.color, lineHeight: 1.6 }}>
        {cfg.text}
      </span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  const { isDark } = useTheme();
  const b = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  return (
    <div style={{ padding: "32px 36px 60px", maxWidth: 1160, margin: "0 auto" }}>
      <div style={{ width: 120, height: 12, borderRadius: 6, background: b, marginBottom: 24, animation: "mcaPulse 1.6s ease-in-out infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        <div>
          <div style={{ height: 280, borderRadius: 20, background: b, marginBottom: 20, animation: "mcaPulse 1.6s ease-in-out infinite" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ height: 110, borderRadius: 16, background: b, animation: "mcaPulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
        <div style={{ height: 400, borderRadius: 20, background: b, animation: "mcaPulse 1.6s ease-in-out infinite" }} />
      </div>
      <style>{`@keyframes mcaPulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CampaignAnalyticsPage() {
  const { isDark } = useTheme();
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const containerRef = useRef<HTMLDivElement>(null);

  const [project, setProject]   = useState<ProjectAnalytics | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "rewards" | "activity" | "milestones" | "fulfillment">("overview");

  // Simulated daily funding data (replace with real API when available)
  const mockDailyData = Array.from({ length: 14 }, (_, i) => {
    const base = (project?.currentAmount ?? 50000) / 14;
    return Math.round(base * (0.5 + Math.random()));
  });

  const fetchProject = useCallback(async () => {
    if (!id || isNaN(id)) { router.push("/dashboard/my-campaigns"); return; }
    setLoading(true); setError(null);
    try {
      const data = await exploreApi.getFullDetails(id);
      setProject(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load campaign");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  useEffect(() => {
    if (!loading && project && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".mca-enter",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, duration: 0.55, ease: "power3.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, project]);

  if (loading) return <Skeleton />;

  if (error || !project) {
    return (
      <div style={{ padding: "60px 36px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: 16, opacity: 0.7 }} />
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", marginBottom: 10 }}>
          Could not load campaign
        </h2>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
          {error}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={fetchProject}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
              fontWeight: 600, cursor: "pointer",
            }}
          >
            <RefreshCcw size={13} /> Retry
          </button>
          <Link
            href="/dashboard/my-campaigns"
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10,
              background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.3)",
              color: "#ff8800", fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
              fontWeight: 600, textDecoration: "none",
            }}
          >
            <ArrowLeft size={13} /> Back
          </Link>
        </div>
      </div>
    );
  }

  const pct = Math.min(Math.round((project.currentAmount / project.goalAmount) * 100), 100);
  const progressColor = pct >= 100 ? "#34d399" : pct >= 50 ? "#ff8800" : "#a78bfa";
  const daysLeft = project.daysLeft ?? 0;
  const cardBg  = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const cardBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  const TABS = [
    { key: "overview",  label: "Overview",    icon: <BarChart2 size={14} /> },
    { key: "rewards",   label: "Reward Tiers", icon: <Gift size={14} /> },
    { key: "activity",  label: "Activity",    icon: <TrendingUp size={14} /> },
  ] as const;

  return (
    <div ref={containerRef} style={{ padding: "32px 36px 60px", maxWidth: 1160, margin: "0 auto", position: "relative" }}>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: isDark
            ? "radial-gradient(circle at 8% 15%, rgba(255,107,0,0.08), transparent 34%), radial-gradient(circle at 88% 12%, rgba(96,165,250,0.08), transparent 30%)"
            : "radial-gradient(circle at 8% 15%, rgba(255,107,0,0.06), transparent 34%), radial-gradient(circle at 88% 12%, rgba(37,99,235,0.05), transparent 30%)",
        }}
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -20, 0], y: [0, 14, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          left: 28,
          top: 20,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(96,165,250,0.16) 0%, transparent 70%)",
          filter: "blur(10px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>

      {/* ── Back + breadcrumb ── */}
      <div className="mca-enter" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
        <Link
          href="/dashboard/my-campaigns"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 13px", borderRadius: 9,
            border: `1px solid ${cardBdr}`,
            background: cardBg,
            color: "var(--text-muted)",
            fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 500,
            textDecoration: "none", transition: "all 0.16s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,136,0,0.3)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = cardBdr;
          }}
        >
          <ArrowLeft size={13} /> My Campaigns
        </Link>
        <ChevronRight size={13} color="var(--text-muted)" style={{ opacity: 0.4 }} />
        <span style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)",
          maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {project.title}
        </span>
      </div>

      {/* ── Status banner ── */}
      <StatusBanner project={project} />

      {/* ── Campaign header ── */}
      <div className="mca-enter" style={{
        display: "flex", gap: 20, marginBottom: 28,
        alignItems: "flex-start", flexWrap: "wrap",
      }}>
        {/* Thumbnail */}
        <div style={{
          width: 80, height: 80, borderRadius: 18, overflow: "hidden", flexShrink: 0,
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          border: `1px solid ${cardBdr}`,
        }}>
          {project.thumbnailUrl ? (
            <img src={project.thumbnailUrl} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Rocket size={28} color={progressColor} style={{ opacity: 0.4 }} />
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600,
            }}>
              {project.category ?? "Campaign"}
            </span>
            {project.status && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 9px", borderRadius: 20,
                background: progressColor + "1a", border: `1px solid ${progressColor}33`,
                fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700,
                color: progressColor,
              }}>
                {project.status === "APPROVED" ? "● Live" : project.status}
              </span>
            )}
          </div>
          <h1 style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: "clamp(20px,2.5vw,30px)", color: "var(--text)",
            letterSpacing: "-0.025em", margin: "0 0 8px", lineHeight: 1.2,
          }}>
            {project.title}
          </h1>
          <p style={{
            fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)",
            margin: 0, lineHeight: 1.65,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {project.shortDescription}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 9, flexShrink: 0 }}>
          {project.status === "APPROVED" && (
            <Link
              href={`/projects/${project.id}`}
              target="_blank"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", borderRadius: 11,
                border: `1px solid ${cardBdr}`,
                background: cardBg,
                color: "var(--text-muted)", textDecoration: "none",
                fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 500,
                transition: "all 0.16s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.18)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = cardBdr;
              }}
            >
              <Eye size={13} /> Preview <ExternalLink size={11} />
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="mca-enter" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 13, marginBottom: 32,
      }}>
        <StatCard
          icon={<DollarSign size={16} />}
          label="Amount raised"
          value={`₹${(project.currentAmount / 100000).toFixed(1)}L`}
          sub={`of ₹${(project.goalAmount / 100000).toFixed(1)}L goal`}
          accentColor={progressColor}
          delay={0}
          trend={{ direction: pct > 0 ? "up" : "flat", label: `${pct}% funded` }}
        />
        <StatCard
          icon={<Users size={16} />}
          label="Total backers"
          value={project.backersCount ?? "—"}
          accentColor="#60a5fa"
          delay={80}
        />
        <StatCard
          icon={<Clock size={16} />}
          label="Days remaining"
          value={daysLeft <= 0 ? "Ended" : `${daysLeft}d`}
          accentColor={daysLeft <= 5 ? "#ef4444" : "#34d399"}
          delay={160}
          trend={
            daysLeft > 0
              ? { direction: daysLeft <= 5 ? "down" : "up", label: daysLeft <= 5 ? "Ending soon" : "Running" }
              : { direction: "flat", label: "Campaign ended" }
          }
        />
        <StatCard
          icon={<Target size={16} />}
          label="Goal"
          value={`₹${(project.goalAmount / 100000).toFixed(1)}L`}
          accentColor="#a78bfa"
          delay={240}
        />
      </div>

      {/* ── Tabs ── */}
      <div className="mca-enter" style={{
        display: "flex", gap: 4, marginBottom: 24,
        borderBottom: `1px solid ${cardBdr}`, paddingBottom: 0,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 16px", borderRadius: "11px 11px 0 0",
              border: "none",
              borderBottom: `2px solid ${activeTab === tab.key ? "#ff8800" : "transparent"}`,
              background: activeTab === tab.key
                ? (isDark ? "rgba(255,136,0,0.07)" : "rgba(255,107,0,0.05)")
                : "transparent",
              color: activeTab === tab.key ? "#ff8800" : "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
              fontWeight: activeTab === tab.key ? 700 : 500,
              cursor: "pointer", transition: "all 0.16s",
              whiteSpace: "nowrap",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        {/* STEP C — Feature #15: Analytics tab */}
        <button
          onClick={() => setActiveTab("analytics")}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 16px", borderRadius: "11px 11px 0 0",
            border: "none",
            borderBottom: `2px solid ${activeTab === "analytics" ? "#ff8800" : "transparent"}`,
            background: activeTab === "analytics"
              ? (isDark ? "rgba(255,136,0,0.07)" : "rgba(255,107,0,0.05)")
              : "transparent",
            color: activeTab === "analytics" ? "#ff8800" : "var(--text-muted)",
            fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
            fontWeight: activeTab === "analytics" ? 700 : 500,
            cursor: "pointer", transition: "all 0.16s",
            whiteSpace: "nowrap",
          }}
        >
          <BarChart2 size={14} /> Analytics
        </button>
      </div>

      <button
          onClick={() => setActiveTab("milestones")}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 16px", borderRadius: "11px 11px 0 0",
            border: "none",
            borderBottom: `2px solid ${activeTab === "milestones" ? "#ff8800" : "transparent"}`,
            background: activeTab === "milestones"
              ? (isDark ? "rgba(255,136,0,0.07)" : "rgba(255,107,0,0.05)")
              : "transparent",
            color: activeTab === "milestones" ? "#ff8800" : "var(--text-muted)",
            fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
            fontWeight: activeTab === "milestones" ? 700 : 500,
            cursor: "pointer", transition: "all 0.16s",
            whiteSpace: "nowrap",
          }}
        >
          <Flag size={14} /> Milestones
        </button>

        <button
          onClick={() => setActiveTab("fulfillment")}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 16px", borderRadius: "11px 11px 0 0",
            border: "none",
            borderBottom: `2px solid ${activeTab === "fulfillment" ? "#ff8800" : "transparent"}`,
            background: activeTab === "fulfillment"
              ? (isDark ? "rgba(255,136,0,0.07)" : "rgba(255,107,0,0.05)")
              : "transparent",
            color: activeTab === "fulfillment" ? "#ff8800" : "var(--text-muted)",
            fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
            fontWeight: activeTab === "fulfillment" ? 700 : 500,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          <Gift size={14} /> Fulfillment
        </button>




      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}
            className="mca-grid-main"
          >
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Funding progress card */}
              <div style={{
                borderRadius: 20, padding: "24px 24px 22px",
                background: cardBg, border: `1px solid ${cardBdr}`,
                boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <p style={{
                      fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700,
                      color: "var(--text-muted)", textTransform: "uppercase",
                      letterSpacing: "0.1em", margin: "0 0 4px",
                    }}>
                      Funding Progress
                    </p>
                    <p style={{
                      fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28,
                      color: "var(--text)", margin: 0, letterSpacing: "-0.025em",
                    }}>
                      ₹{(project.currentAmount / 100000).toFixed(2)}L
                    </p>
                  </div>
                  <CircleProgress pct={pct} color={progressColor} size={96} stroke={7} />
                </div>

                {/* Full progress bar */}
                <div style={{
                  height: 8, borderRadius: 999,
                  background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                  overflow: "hidden", marginBottom: 10,
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                    style={{
                      height: "100%", borderRadius: 999,
                      background: `linear-gradient(90deg, ${progressColor}, ${progressColor}88)`,
                      position: "relative", overflow: "hidden",
                    }}
                  >
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(90deg,transparent 30%,rgba(255,255,255,0.3) 50%,transparent 70%)",
                      animation: "mcaShine 2s ease-in-out infinite",
                    }} />
                  </motion.div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>
                    Goal: ₹{(project.goalAmount / 100000).toFixed(1)}L
                  </span>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>
                    {daysLeft > 0 ? `${daysLeft} days remaining` : "Campaign ended"}
                  </span>
                </div>
              </div>

              {/* Daily funding chart */}
              <div style={{
                borderRadius: 20, padding: "22px 24px",
                background: cardBg, border: `1px solid ${cardBdr}`,
                boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div>
                    <p style={{
                      fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700,
                      color: "var(--text-muted)", textTransform: "uppercase",
                      letterSpacing: "0.1em", margin: "0 0 3px",
                    }}>
                      Daily Funding Activity
                    </p>
                    <p style={{
                      fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
                      color: "var(--text)", margin: 0,
                    }}>
                      Last 14 days
                    </p>
                  </div>
                  <div style={{
                    padding: "5px 10px", borderRadius: 8,
                    background: `${progressColor}1a`,
                    border: `1px solid ${progressColor}33`,
                    fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 600,
                    color: progressColor,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <TrendingUp size={12} />
                    Live data
                  </div>
                </div>
                <MiniBarChart data={mockDailyData} color={progressColor} height={100} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>14 days ago</span>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>Today</span>
                </div>
              </div>

              {/* Campaign details */}
              <div style={{
                borderRadius: 20, padding: "22px 24px",
                background: cardBg, border: `1px solid ${cardBdr}`,
                boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.04)",
              }}>
                <p style={{
                  fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700,
                  color: "var(--text-muted)", textTransform: "uppercase",
                  letterSpacing: "0.1em", margin: "0 0 16px",
                }}>
                  Campaign Details
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Category",       value: project.category ?? "—",     icon: <Sparkles size={13} /> },
                    { label: "Deadline",        value: project.deadline ? new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—", icon: <Calendar size={13} /> },
                    { label: "Reward tiers",    value: `${project.rewards?.length ?? 0} tiers`, icon: <Gift size={13} /> },
                    { label: "Gallery images",  value: `${project.galleryImages?.length ?? 0} images`, icon: <Eye size={13} /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "9px 0",
                      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                    }}>
                      <span style={{
                        display: "flex", alignItems: "center", gap: 7,
                        fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)",
                      }}>
                        {icon} {label}
                      </span>
                      <span style={{
                        fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600,
                        color: "var(--text)",
                      }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — quick info sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Funding velocity */}
              <div style={{
                borderRadius: 20, padding: "20px",
                background: cardBg, border: `1px solid ${cardBdr}`,
                boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.04)",
              }}>
                <p style={{
                  fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700,
                  color: "var(--text-muted)", textTransform: "uppercase",
                  letterSpacing: "0.1em", margin: "0 0 14px",
                }}>
                  Funding Velocity
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  {[
                    {
                      label: "Avg / day",
                      value: daysLeft < (project.totalDays ?? 30)
                        ? `₹${Math.round(project.currentAmount / Math.max(1, (project.totalDays ?? 30) - daysLeft)).toLocaleString("en-IN")}`
                        : "₹—",
                      color: "#34d399",
                    },
                    {
                      label: "Needed / day to fund",
                      value: daysLeft > 0
                        ? `₹${Math.round((project.goalAmount - project.currentAmount) / daysLeft).toLocaleString("en-IN")}`
                        : pct >= 100 ? "Funded!" : "Ended",
                      color: daysLeft <= 5 ? "#ef4444" : "#ff8800",
                    },
                    {
                      label: "Completion forecast",
                      value: pct >= 100 ? "Funded ✓" : daysLeft > 0 ? `~${Math.round(daysLeft * (100 / Math.max(pct, 1)))}d at current pace` : "Not funded",
                      color: pct >= 100 ? "#34d399" : "#a78bfa",
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      padding: "11px 13px", borderRadius: 12,
                      background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                    }}>
                      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)", margin: "0 0 4px" }}>
                        {label}
                      </p>
                      <p style={{ fontFamily: "Syne, sans-serif", fontSize: 15, fontWeight: 800, color, margin: 0, letterSpacing: "-0.02em" }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div style={{
                borderRadius: 20, padding: "20px",
                background: cardBg, border: `1px solid ${cardBdr}`,
                boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.04)",
              }}>
                <p style={{
                  fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700,
                  color: "var(--text-muted)", textTransform: "uppercase",
                  letterSpacing: "0.1em", margin: "0 0 14px",
                }}>
                  Quick Actions
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "View campaign page", icon: <Eye size={13} />, href: `/projects/${project.id}`, color: "#60a5fa" },
                    { label: "Share campaign",      icon: <Share2 size={13} />, href: "#", color: "#a78bfa" },
                    { label: "My campaigns",        icon: <Zap size={13} />, href: "/dashboard/my-campaigns", color: "#ff8800" },
                    { label: "Create new campaign", icon: <Plus size={13} />, href: "/dashboard/create-campaign", color: "#34d399" },
                  ].map(({ label, icon, href, color }) => (
                    <Link
                      key={label}
                      href={href}
                      style={{
                        display: "flex", alignItems: "center", gap: 9,
                        padding: "10px 13px", borderRadius: 11,
                        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                        color: "var(--text-muted)", textDecoration: "none",
                        fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 500,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.color = color;
                        el.style.borderColor = color + "44";
                        el.style.background = color + "10";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.color = "var(--text-muted)";
                        el.style.borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
                        el.style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)";
                      }}
                    >
                      <span style={{ color }}>{icon}</span>
                      {label}
                      <ChevronRight size={11} style={{ marginLeft: "auto" }} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "rewards" && (
          <motion.div
            key="rewards"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {project.rewards && project.rewards.length > 0 ? (
              <>
                <div style={{ marginBottom: 20 }}>
                  <p style={{
                    fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18,
                    color: "var(--text)", margin: "0 0 6px",
                  }}>
                    Reward Tiers ({project.rewards.length})
                  </p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
                    These are the reward tiers available to your backers.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 680 }}>
                  {project.rewards.map((reward, i) => (
                    <RewardCard key={reward.id} reward={reward} index={i} />
                  ))}
                </div>
              </>
            ) : (
              <div style={{
                textAlign: "center", padding: "64px 24px",
                borderRadius: 20,
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                border: `1px dashed ${cardBdr}`,
              }}>
                <Gift size={36} color="var(--text-muted)" style={{ marginBottom: 14, opacity: 0.4 }} />
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 8 }}>
                  No reward tiers
                </p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)" }}>
                  This campaign has no reward tiers configured.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              borderRadius: 20, padding: "28px 24px",
              background: cardBg, border: `1px solid ${cardBdr}`,
              textAlign: "center",
            }}>
              <TrendingUp size={36} color="var(--text-muted)" style={{ marginBottom: 14, opacity: 0.35 }} />
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 8 }}>
                Activity feed coming soon
              </p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", maxWidth: 360, margin: "0 auto" }}>
                Real-time backer activity, comments, and updates will appear here once the feature is available.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP D — Feature #15: Analytics tab panel (outside AnimatePresence — mounts/unmounts simply) */}
      {activeTab === "analytics" && (
        <AnalyticsDashboard projectId={project.id} isDark={isDark} />
      )}

      {activeTab === "milestones" && (
        <motion.div
          key="milestones"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ paddingTop: 4 }}
        >
          <MilestonesManager
            projectId={id}
            isDark={isDark}
            goalAmount={project?.goalAmount}
          />
        </motion.div>
      )}
      {activeTab === "fulfillment" && (
        <motion.div
          key="fulfillment"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CreatorRewardFulfillment projectId={id} isDark={isDark} />
        </motion.div>
      )}



      <style>{`
        .mca-enter { opacity: 0; }
        @keyframes mcaShine { 0%,100%{transform:translateX(-60%)} 50%{transform:translateX(160%)} }
        @media(max-width:900px) {
          .mca-grid-main { grid-template-columns:1fr!important; }
        }
        @media(max-width:768px) {
          div[style*="padding: 32px 36px"] { padding:20px 16px 48px!important; }
        }
      `}</style>
      </div>
    </div>
  );
}