"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  Zap, Plus, Rocket, BarChart2, DollarSign, Clock, AlertTriangle,
  RefreshCcw, TrendingUp, Users, CheckCircle2, XCircle, Eye,
  ArrowUpRight, Sparkles, X,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import { projectApi, type CreatorProjectResponse } from "@/lib/api";
import { StatCard } from "@/components/dashboard/widgets";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, {
  label: string; color: string; bg: string; border: string; dot: boolean; icon?: string;
}> = {
  DRAFT:      { label: "Draft",        color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.2)",  dot: false, icon: "○" },
  PENDING:    { label: "Under Review", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)",  dot: true,  icon: "◌" },
  APPROVED:   { label: "Live",         color: "#34d399", bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.25)",  dot: true  },
  REJECTED:   { label: "Rejected",     color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)",   dot: false },
  FUNDED:     { label: "Funded",       color: "#a78bfa", bg: "rgba(167,139,250,0.1)",  border: "rgba(167,139,250,0.25)", dot: true  },
  COMPLETED:  { label: "Completed",    color: "#34d399", bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.25)",  dot: false },
  CLOSED:     { label: "Closed",       color: "#6b7280", bg: "rgba(107,114,128,0.1)",  border: "rgba(107,114,128,0.2)",  dot: false },
  CANCELLED:  { label: "Cancelled",    color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.2)",  dot: false },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.DRAFT;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 11px", borderRadius: 20,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: cfg.color,
      letterSpacing: "0.03em",
    }}>
      {cfg.dot ? (
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, animation: "mcPulse 1.5s ease-in-out infinite", flexShrink: 0 }} />
      ) : null}
      {cfg.label}
    </span>
  );
}

// ─── Campaign Card ────────────────────────────────────────────────────────────
function CampaignCard({ project, now }: { project: CreatorProjectResponse; now: number }) {
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState(false);

  const pct = project.goalAmount > 0
    ? Math.min(100, Math.round((project.currentAmount / project.goalAmount) * 100))
    : 0;

  const progressColor = pct >= 100 ? "#34d399" : pct >= 50 ? "#ff8800" : "#a78bfa";

  const deadline = project.deadline ? new Date(project.deadline) : null;
  const daysLeft = deadline
    ? Math.max(0, Math.ceil((deadline.getTime() - now) / 86400000))
    : null;

  const isUrgent = daysLeft !== null && daysLeft <= 3 && project.status === "APPROVED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 22, overflow: "hidden",
        background: isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)"
          : "#ffffff",
        border: `1px solid ${hovered
          ? `${progressColor}40`
          : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: hovered
          ? isDark
            ? `0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px ${progressColor}15`
            : `0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px ${progressColor}10`
          : isDark ? "0 1px 0 rgba(255,255,255,0.04) inset" : "0 2px 20px rgba(0,0,0,0.05)",
        display: "flex", flexDirection: "column",
        transition: "all 0.25s cubic-bezier(.22,1,.36,1)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        position: "relative",
      }}
    >
      {/* Top shimmer accent */}
      <div style={{
        position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
        background: `linear-gradient(90deg,transparent,${progressColor}60,transparent)`,
        opacity: hovered ? 1 : 0.35, transition: "opacity 0.25s", zIndex: 2,
      }} />

      {/* Thumbnail */}
      <div style={{ width: "100%", height: 168, flexShrink: 0, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}>
        {project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt={project.title}
            style={{ width: "100%", height: "100%", objectFit: "cover",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.5s cubic-bezier(.22,1,.36,1)" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            background: `linear-gradient(135deg, ${progressColor}18 0%, transparent 100%)`,
            flexDirection: "column", gap: 8 }}>
            <Rocket size={36} color={progressColor} style={{ opacity: 0.28 }} />
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)", pointerEvents: "none" }} />

        {/* Status badge */}
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 2 }}>
          <StatusBadge status={project.status} />
        </div>

        {/* Urgent badge */}
        {isUrgent && (
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              position: "absolute", top: 10, right: 10, zIndex: 2,
              padding: "3px 9px", borderRadius: 20,
              background: "rgba(239,68,68,0.9)", backdropFilter: "blur(6px)",
              border: "1px solid rgba(239,68,68,0.5)",
              fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "#fff",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            ⚡ {daysLeft}d left
          </motion.div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "18px 18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 13 }}>
        <h3 style={{
          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15.5,
          color: "var(--text)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.3,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {project.title}
        </h3>

        {/* Progress */}
        <div>
          <div style={{ height: 5, borderRadius: 999, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 8, position: "relative" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              style={{ height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${progressColor}, ${progressColor}88)`, position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)", animation: "mcShine 2.2s ease-in-out infinite" }} />
            </motion.div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>
              ₹{(project.currentAmount ?? 0).toLocaleString("en-IN")} raised
            </span>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 12.5, fontWeight: 800, color: progressColor }}>
              {pct}%
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, padding: "10px 0", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}>
            <DollarSign size={12} />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12 }}>
              ₹{(project.goalAmount ?? 0).toLocaleString("en-IN")} goal
            </span>
          </div>
          {daysLeft !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: daysLeft <= 3 ? "#ef4444" : "var(--text-muted)" }}>
              <Clock size={12} />
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: daysLeft <= 3 ? 700 : 400 }}>
                {daysLeft === 0 ? "Ends today" : `${daysLeft}d left`}
              </span>
            </div>
          )}
        </div>

        {/* Rejection reason */}
        {project.status === "REJECTED" && project.rejectionReason && (
          <div style={{ padding: "9px 11px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <XCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "#ef4444", margin: 0, lineHeight: 1.55 }}>
              {project.rejectionReason}
            </p>
          </div>
        )}

        {/* CTA buttons */}
        <div style={{ marginTop: "auto", paddingTop: 2, display: "flex", gap: 8 }}>
          <Link
            href={`/dashboard/my-campaigns/${project.id}`}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px 0", borderRadius: 12,
              background: hovered ? `${progressColor}14` : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              border: `1px solid ${hovered ? `${progressColor}35` : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
              color: hovered ? progressColor : "var(--text)",
              fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600,
              textDecoration: "none", transition: "all 0.2s",
            }}
          >
            <BarChart2 size={13} /> Analytics
          </Link>
          {project.status === "APPROVED" && (
            <Link
              href={`/projects/${project.id}`}
              style={{
                padding: "10px 13px", borderRadius: 12,
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                color: "var(--text-muted)", textDecoration: "none",
                transition: "all 0.18s", display: "flex", alignItems: "center",
              }}
              title="View live campaign"
            >
              <Eye size={14} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 28, padding: "88px 48px", textAlign: "center",
        position: "relative", overflow: "hidden",
        background: isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)"
          : "#fff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: isDark ? "none" : "0 4px 32px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,107,0,0.07)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(167,139,250,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: 88, height: 88, borderRadius: 28, margin: "0 auto 28px", background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
      >
        <Rocket size={38} color="#ff8800" />
        <motion.div
          animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          style={{ position: "absolute", top: -8, right: -8 }}
        >
          <Sparkles size={18} color="#ffcc00" />
        </motion.div>
      </motion.div>

      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text)", margin: "0 0 12px", letterSpacing: "-0.03em" }}>
        No campaigns yet
      </h2>
      <p style={{ fontSize: 15, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: "0 auto 36px", maxWidth: 400, lineHeight: 1.8 }}>
        Launch your first campaign and start raising funds from thousands of backers on CrowdSpark.
      </p>

      <Link
        href="/dashboard/create-campaign"
        style={{
          display: "inline-flex", alignItems: "center", gap: 9,
          padding: "14px 32px", borderRadius: 14,
          background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
          color: "#fff", textDecoration: "none",
          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
          boxShadow: "0 6px 28px rgba(255,100,0,0.42)",
          position: "relative", overflow: "hidden",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 12px 40px rgba(255,100,0,0.55)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 28px rgba(255,100,0,0.42)";
        }}
      >
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "mcShimmer 2.4s ease-in-out infinite" }} />
        <Plus size={16} style={{ position: "relative" }} />
        <span style={{ position: "relative" }}>Create your first campaign</span>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  const { isDark } = useTheme();
  const b = isDark ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.05)";
  return (
    <div style={{ padding: "40px 32px 60px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ width: 130, height: 11, borderRadius: 6, background: b, marginBottom: 10, animation: "mcPulse 1.6s ease-in-out infinite" }} />
          <div style={{ width: 240, height: 34, borderRadius: 10, background: b, animation: "mcPulse 1.6s ease-in-out infinite" }} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 110, height: 68, borderRadius: 14, background: b, animation: "mcPulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ height: 360, borderRadius: 22, background: b, animation: "mcPulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Filter tab ───────────────────────────────────────────────────────────────
function FilterTab({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  const { isDark } = useTheme();
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "7px 15px", borderRadius: 20,
        border: `1px solid ${active ? "rgba(255,107,0,0.4)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)")}`,
        background: active ? "rgba(255,107,0,0.1)" : "transparent",
        color: active ? "#ff8800" : "var(--text-muted)",
        fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap",
        boxShadow: active ? "0 2px 12px rgba(255,107,0,0.12)" : "none",
      }}
    >
      {label}
      {count > 0 && (
        <span style={{
          fontSize: 11, fontWeight: 700,
          background: active ? "rgba(255,136,0,0.18)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"),
          color: active ? "#ff8800" : "var(--text-muted)",
          padding: "1px 7px", borderRadius: 20,
          minWidth: 20, textAlign: "center",
        }}>
          {count}
        </span>
      )}
    </motion.button>
  );
}

function CreatorStudioPanel({
  projects,
  totalRaised,
  totalGoal,
  overallPct,
}: {
  projects: CreatorProjectResponse[];
  totalRaised: number;
  totalGoal: number;
  overallPct: number;
}) {
  const { isDark } = useTheme();
  const live = projects.filter(p => p.status === "APPROVED").length;
  const review = projects.filter(p => p.status === "PENDING").length;
  const draft = projects.filter(p => p.status === "DRAFT").length;
  const funded = projects.filter(p => p.status === "FUNDED" || p.status === "COMPLETED").length;
  const topProject = [...projects].sort((a, b) => (b.currentAmount ?? 0) - (a.currentAmount ?? 0))[0];
  const total = Math.max(projects.length, 1);

  const rows = [
    { label: "Live", count: live, tone: "var(--success)" },
    { label: "In review", count: review, tone: "var(--warning)" },
    { label: "Drafts", count: draft, tone: "var(--text-muted)" },
    { label: "Funded", count: funded, tone: "var(--info)" },
  ];

  return (
    <motion.section
      className="mc-enter mc-studio-panel"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.018))"
          : "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div className="mc-studio-main">
        <div className="mc-studio-head">
          <span><BarChart2 size={14} /> Studio analytics</span>
          <h2>Creator performance</h2>
          <p>
            ₹{totalRaised.toLocaleString("en-IN")} raised across ₹{totalGoal.toLocaleString("en-IN")} in goals.
          </p>
        </div>

        <div className="mc-progress-block">
          <div>
            <strong>{overallPct}%</strong>
            <span>overall funded</span>
          </div>
          <div className="mc-progress-track" aria-label="Overall funding progress">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, overallPct)}%` }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>

      <div className="mc-pipeline">
        {rows.map((row, index) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.12 + index * 0.04 }}
          >
            <div className="mc-pipeline-label">
              <span style={{ color: row.tone }}>{row.label}</span>
              <strong>{row.count}</strong>
            </div>
            <div className="mc-pipeline-track">
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(6, Math.round((row.count / total) * 100))}%` }}
                transition={{ duration: 0.75, delay: 0.18 + index * 0.06 }}
                style={{ background: row.tone }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mc-studio-side">
        {topProject ? (
          <Link href={`/dashboard/my-campaigns/${topProject.id}`} className="mc-top-project">
            <span>Top performer</span>
            <strong>{topProject.title}</strong>
            <p>₹{(topProject.currentAmount ?? 0).toLocaleString("en-IN")} raised</p>
            <ArrowUpRight size={15} />
          </Link>
        ) : null}
        <div className="mc-studio-actions">
          <Link href="/dashboard/create-campaign"><Plus size={14} /> New</Link>
          <Link href="/dashboard/my-campaigns"><BarChart2 size={14} /> Analytics</Link>
          {topProject && topProject.status === "APPROVED" && (
            <Link href={`/projects/${topProject.id}`}><Eye size={14} /> Preview</Link>
          )}
        </div>
      </div>
    </motion.section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function MyCampaignsPageInner() {
  const { isDark } = useTheme();
  const { loading: profileLoading } = useProfile();
  const searchParams = useSearchParams();
  const headerRef = useRef<HTMLDivElement>(null);

  const [projects, setProjects]     = useState<CreatorProjectResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [mounted, setMounted]       = useState(false);
  const [showToast, setShowToast]   = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [now] = useState(() => Date.now());

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!mounted || !headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".mc-enter",
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.65, ease: "power3.out", delay: 0.1 }
      );
    }, headerRef);
    return () => ctx.revert();
  }, [mounted, loading]);

  const fetchProjects = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await projectApi.myProjects();
      setProjects(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) fetchProjects();
  }, [mounted, fetchProjects]);

  if (!mounted || profileLoading || loading) return <Skeleton />;

  // Stats
  const totalRaised   = projects.reduce((s, p) => s + (p.currentAmount ?? 0), 0);
  const totalGoal     = projects.reduce((s, p) => s + (p.goalAmount ?? 0), 0);
  const liveCount     = projects.filter(p => p.status === "APPROVED").length;
  const fundedCount   = projects.filter(p => p.status === "FUNDED" || p.status === "COMPLETED").length;
  const overallPct    = totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0;

  const FILTERS = [
    { key: "all",      label: "All",         items: projects },
    { key: "live",     label: "Live",        items: projects.filter(p => p.status === "APPROVED") },
    { key: "draft",    label: "Drafts",      items: projects.filter(p => p.status === "DRAFT") },
    { key: "review",   label: "In Review",   items: projects.filter(p => p.status === "PENDING") },
    { key: "funded",   label: "Funded",      items: projects.filter(p => p.status === "FUNDED" || p.status === "COMPLETED") },
    { key: "rejected", label: "Rejected",    items: projects.filter(p => p.status === "REJECTED") },
  ];

  const visible = FILTERS.find(f => f.key === activeFilter)?.items ?? projects;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", position: "relative" }}>
      {/* Ambient background */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: isDark
          ? "radial-gradient(circle at 8% 12%, rgba(255,107,0,0.09), transparent 32%), radial-gradient(circle at 88% 10%, rgba(167,139,250,0.08), transparent 30%)"
          : "radial-gradient(circle at 8% 12%, rgba(255,107,0,0.06), transparent 32%), radial-gradient(circle at 88% 10%, rgba(139,92,246,0.05), transparent 30%)",
      }} />
      <motion.div aria-hidden
        animate={{ x: [0, 20, 0], y: [0, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", right: 40, top: 30, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,136,0,0.14) 0%, transparent 70%)", filter: "blur(12px)", pointerEvents: "none", zIndex: 0 }}
      />

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed", top: 24, right: 24, zIndex: 9999,
              padding: "14px 18px", borderRadius: 16,
              background: isDark ? "#141414" : "#fff",
              border: "1px solid rgba(52,211,153,0.4)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(52,211,153,0.08)",
              display: "flex", alignItems: "center", gap: 12, maxWidth: 380,
            }}
          >
            <CheckCircle2 size={20} color="#34d399" />
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#34d399", margin: "0 0 2px" }}>Campaign submitted!</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>Under review — we&apos;ll notify you when it goes live.</p>
            </div>
            <button onClick={() => setShowToast(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={headerRef} style={{ padding: "40px 32px 64px", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div className="mc-enter" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800" }}>
                <Zap size={14} />
              </div>
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>
                Creator workspace
              </span>
            </div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,3vw,38px)", color: "var(--text)", letterSpacing: "-0.04em", margin: 0 }}>
              My Campaigns
            </h1>
          </div>

          <Link
            href="/dashboard/create-campaign"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 14,
              background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
              color: "#fff", textDecoration: "none",
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
              boxShadow: "0 4px 22px rgba(255,100,0,0.38)",
              whiteSpace: "nowrap", position: "relative", overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 10px 36px rgba(255,100,0,0.52)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 22px rgba(255,100,0,0.38)";
            }}
          >
            <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "mcShimmer 2.8s ease-in-out infinite" }} />
            <Plus size={15} style={{ position: "relative" }} />
            <span style={{ position: "relative" }}>New Campaign</span>
          </Link>
        </div>

        {/* ── Stat cards ── */}
        {projects.length > 0 && (
          <div className="mc-enter" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14, marginBottom: 36 }}>
            <StatCard
              icon={<Zap size={16} />}
              label="Total campaigns"
              value={String(projects.length)}
              accentColor="#ff8800"
              delay={0}
              trend={{ direction: "flat", label: "all time" }}
            />
            <StatCard
              icon={<TrendingUp size={16} />}
              label="Live now"
              value={String(liveCount)}
              accentColor="#34d399"
              delay={80}
              trend={liveCount > 0 ? { direction: "up", label: "active" } : { direction: "flat", label: "none" }}
            />
            <StatCard
              icon={<DollarSign size={16} />}
              label="Total raised"
              value={`₹${(totalRaised / 100000).toFixed(1)}L`}
              accentColor="#a78bfa"
              delay={160}
              trend={{ direction: totalRaised > 0 ? "up" : "flat", label: `${overallPct}% of goal` }}
            />
            <StatCard
              icon={<CheckCircle2 size={16} />}
              label="Funded"
              value={String(fundedCount)}
              accentColor="#60a5fa"
              delay={240}
              trend={{ direction: fundedCount > 0 ? "up" : "flat", label: "completed" }}
            />
          </div>
        )}

        {projects.length > 0 && (
          <CreatorStudioPanel
            projects={projects}
            totalRaised={totalRaised}
            totalGoal={totalGoal}
            overallPct={overallPct}
          />
        )}

        {/* ── Filter tabs ── */}
        {projects.length > 0 && (
          <div className="mc-enter" style={{
            display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28,
            paddingBottom: 20,
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
          }}>
            {FILTERS.map(f => (
              <FilterTab key={f.key} label={f.label} count={f.items.length} active={activeFilter === f.key} onClick={() => setActiveFilter(f.key)} />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{ padding: "14px 18px", borderRadius: 14, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <AlertTriangle size={15} color="#ef4444" />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "#ef4444", flex: 1 }}>{error}</span>
            <button onClick={fetchProjects} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <RefreshCcw size={11} /> Retry
            </button>
          </div>
        )}

        {/* ── Content ── */}
        {!error && (
          <AnimatePresence mode="wait">
            {projects.length === 0 ? (
              <EmptyState key="empty" />
            ) : visible.length === 0 ? (
              <motion.div key="filter-empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ textAlign: "center", padding: "64px 24px", borderRadius: 22, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px dashed ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}
              >
                <div style={{ width: 60, height: 60, borderRadius: 18, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--text-muted)" }}>
                  <Users size={24} />
                </div>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 8 }}>
                  No {FILTERS.find(f => f.key === activeFilter)?.label.toLowerCase()} campaigns
                </p>
                <button onClick={() => setActiveFilter("all")} style={{ padding: "9px 20px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, cursor: "pointer", marginTop: 8 }}>
                  Show all campaigns
                </button>
              </motion.div>
            ) : (
              <motion.div key={`grid-${activeFilter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mc-grid"
                style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}
              >
                {visible.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
                    <CampaignCard project={p} now={now} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <style>{`
        .mc-enter { opacity: 0; }
        @keyframes mcShimmer { 0%{transform:translateX(-120%)} 60%{transform:translateX(220%)} 100%{transform:translateX(220%)} }
        @keyframes mcShine   { 0%,100%{transform:translateX(-60%)} 50%{transform:translateX(160%)} }
        @keyframes mcPulse   { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.6)} }
        .mc-studio-panel {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(220px, .8fr) minmax(220px, .65fr);
          gap: 16px;
          border-radius: 22px;
          padding: 20px;
          margin: -14px 0 30px;
          position: relative;
          overflow: hidden;
        }
        .mc-studio-panel::before {
          content: "";
          position: absolute;
          top: 0;
          left: 12%;
          right: 12%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-dim), transparent);
        }
        .mc-studio-main,
        .mc-studio-side,
        .mc-pipeline {
          min-width: 0;
        }
        .mc-studio-head span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--accent);
          font-family: "DM Sans", sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .1em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .mc-studio-head h2 {
          color: var(--text);
          font-family: "Syne", sans-serif;
          font-size: clamp(20px, 2.4vw, 28px);
          font-weight: 900;
          letter-spacing: 0;
          margin: 0 0 8px;
        }
        .mc-studio-head p,
        .mc-progress-block span,
        .mc-top-project p {
          color: var(--text-muted);
          font-family: "DM Sans", sans-serif;
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        }
        .mc-progress-block {
          margin-top: 22px;
        }
        .mc-progress-block > div:first-child {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 9px;
        }
        .mc-progress-block strong {
          color: var(--accent);
          font-family: "Syne", sans-serif;
          font-size: 34px;
          font-weight: 900;
        }
        .mc-progress-track,
        .mc-pipeline-track {
          height: 7px;
          border-radius: 999px;
          background: var(--bg-ghost);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .mc-progress-track > div {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, var(--accent), var(--cta));
          box-shadow: 0 0 24px var(--accent-glow);
        }
        .mc-pipeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: center;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--bg-ghost);
          padding: 14px;
        }
        .mc-pipeline-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }
        .mc-pipeline-label span {
          font-family: "DM Sans", sans-serif;
          font-size: 12px;
          font-weight: 800;
        }
        .mc-pipeline-label strong {
          color: var(--text);
          font-family: "Syne", sans-serif;
          font-size: 14px;
        }
        .mc-pipeline-track span {
          display: block;
          height: 100%;
          border-radius: inherit;
        }
        .mc-studio-side {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mc-top-project {
          position: relative;
          display: block;
          min-height: 128px;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: var(--bg-ghost);
          text-decoration: none;
          color: var(--text);
          overflow: hidden;
        }
        .mc-top-project span {
          color: var(--text-muted);
          display: block;
          font-family: "DM Sans", sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .mc-top-project strong {
          display: -webkit-box;
          color: var(--text);
          font-family: "Syne", sans-serif;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.35;
          overflow: hidden;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .mc-top-project svg {
          position: absolute;
          right: 14px;
          bottom: 14px;
          color: var(--accent);
        }
        .mc-studio-actions {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .mc-studio-actions a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 40px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-ghost);
          color: var(--text);
          font-family: "DM Sans", sans-serif;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          transition: transform .18s, border-color .18s, color .18s;
        }
        .mc-studio-actions a:hover {
          transform: translateY(-2px);
          border-color: var(--accent);
          color: var(--accent);
        }
        @media (max-width: 960px)  { .mc-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 980px)  { .mc-studio-panel { grid-template-columns: 1fr; } }
        @media (max-width: 580px)  { .mc-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px)  { div[style*="padding: 40px 32px"] { padding: 24px 16px 48px !important; } }
        @media (max-width: 520px)  {
          .mc-studio-panel { padding: 16px; border-radius: 18px; }
          .mc-studio-actions { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default function MyCampaignsPage() {
  return (
    <Suspense fallback={null}>
      <MyCampaignsPageInner />
    </Suspense>
  );
}
