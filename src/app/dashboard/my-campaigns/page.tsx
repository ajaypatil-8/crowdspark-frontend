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
  label: string; color: string; bg: string; border: string; dot: boolean;
}> = {
  DRAFT:      { label: "Draft",        color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.2)",  dot: false },
  PENDING:    { label: "Under Review", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)",  dot: true  },
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
      padding: "3px 10px", borderRadius: 20,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700, color: cfg.color,
    }}>
      {cfg.dot && (
        <span style={{
          width: 5, height: 5, borderRadius: "50%", background: cfg.color,
          animation: "mcPulse 1.5s ease-in-out infinite", flexShrink: 0,
        }} />
      )}
      {cfg.label}
    </span>
  );
}

// ─── Campaign Card ────────────────────────────────────────────────────────────
function CampaignCard({ project }: { project: CreatorProjectResponse }) {
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState(false);

  const pct = project.goalAmount > 0
    ? Math.min(100, Math.round((project.currentAmount / project.goalAmount) * 100))
    : 0;

  const progressColor = pct >= 100 ? "#34d399" : pct >= 50 ? "#ff8800" : "#a78bfa";

  const deadline = project.deadline ? new Date(project.deadline) : null;
  const daysLeft = deadline
    ? Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86400000))
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
        borderRadius: 20, overflow: "hidden",
        background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
        border: `1px solid ${hovered ? "rgba(255,136,0,0.3)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)")}`,
        boxShadow: hovered
          ? isDark ? "0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,136,0,0.15)" : "0 12px 40px rgba(0,0,0,0.1)"
          : isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)",
        display: "flex", flexDirection: "column",
        transition: "all 0.22s cubic-bezier(.22,1,.36,1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        position: "relative",
      }}
    >
      {/* Top shimmer line */}
      <div style={{
        position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
        background: `linear-gradient(90deg,transparent,${progressColor}66,transparent)`,
        opacity: hovered ? 1 : 0.4, transition: "opacity 0.2s",
        zIndex: 2,
      }} />

      {/* Thumbnail */}
      <div style={{
        width: "100%", height: 164, flexShrink: 0,
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
        position: "relative", overflow: "hidden",
      }}>
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl} alt={project.title}
            style={{ width: "100%", height: "100%", objectFit: "cover",
              transform: hovered ? "scale(1.04)" : "scale(1)",
              transition: "transform 0.4s cubic-bezier(.22,1,.36,1)",
            }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%", display: "flex",
            alignItems: "center", justifyContent: "center",
            background: `linear-gradient(135deg, ${progressColor}1a 0%, transparent 100%)`,
            flexDirection: "column", gap: 8,
          }}>
            <Rocket size={36} color={progressColor} style={{ opacity: 0.3 }} />
            <span style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13,
              color: progressColor, opacity: 0.2, textAlign: "center", padding: "0 16px",
            }}>{project.title}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
          background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
          pointerEvents: "none",
        }} />

        {/* Status badge */}
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <StatusBadge status={project.status} />
        </div>

        {/* Urgent badge */}
        {isUrgent && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            padding: "3px 9px", borderRadius: 999,
            background: "rgba(239,68,68,0.2)",
            border: "1px solid rgba(239,68,68,0.4)",
            fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: "#ef4444",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            ⚡ {daysLeft}d left
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "18px 18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 13 }}>
        <h3 style={{
          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
          color: "var(--text)", margin: 0, letterSpacing: "-0.015em", lineHeight: 1.3,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {project.title}
        </h3>

        {/* Progress */}
        <div>
          <div style={{
            height: 5, borderRadius: 999,
            background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
            overflow: "hidden", marginBottom: 8, position: "relative",
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              style={{
                height: "100%", borderRadius: 999,
                background: `linear-gradient(90deg, ${progressColor}, ${progressColor}88)`,
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                animation: "mcShine 2.2s ease-in-out infinite",
              }} />
            </motion.div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)" }}>
              ₹{(project.currentAmount ?? 0).toLocaleString("en-IN")} raised
            </span>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 12, fontWeight: 800, color: progressColor }}>
              {pct}%
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)" }}>
            <DollarSign size={11} />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12 }}>
              Goal: ₹{(project.goalAmount ?? 0).toLocaleString("en-IN")}
            </span>
          </div>
          {daysLeft !== null && (
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              color: daysLeft <= 3 ? "#ef4444" : "var(--text-muted)",
            }}>
              <Clock size={11} />
              <span style={{
                fontFamily: "DM Sans, sans-serif", fontSize: 11.5,
                fontWeight: daysLeft <= 3 ? 700 : 400,
              }}>
                {daysLeft === 0 ? "Ends today" : `${daysLeft}d left`}
              </span>
            </div>
          )}
        </div>

        {/* Rejection reason */}
        {project.status === "REJECTED" && project.rejectionReason && (
          <div style={{
            padding: "9px 11px", borderRadius: 10,
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)",
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <XCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{
              fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "#ef4444",
              margin: 0, lineHeight: 1.55,
            }}>
              {project.rejectionReason}
            </p>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: "auto", paddingTop: 2, display: "flex", gap: 8 }}>
          <Link
            href={`/dashboard/my-campaigns/${project.id}`}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "10px 0", borderRadius: 11,
              background: hovered ? "rgba(255,136,0,0.1)" : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
              border: `1px solid ${hovered ? "rgba(255,136,0,0.35)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)")}`,
              color: hovered ? "#ff8800" : "var(--text)",
              fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600,
              textDecoration: "none", transition: "all 0.18s",
            }}
          >
            <BarChart2 size={13} /> Analytics
          </Link>
          {project.status === "APPROVED" && (
            <Link
              href={`/projects/${project.id}`}
              style={{
                padding: "10px 14px", borderRadius: 11,
                background: "transparent",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                color: "var(--text-muted)",
                textDecoration: "none", transition: "all 0.18s",
                display: "flex", alignItems: "center",
              }}
            >
              <Eye size={13} />
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
        borderRadius: 24, padding: "80px 40px", textAlign: "center",
        position: "relative", overflow: "hidden",
        background: isDark ? "rgba(255,255,255,0.025)" : "#fff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: isDark ? "none" : "0 2px 24px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{
        position: "absolute", top: -80, right: -80, width: 260, height: 260,
        borderRadius: "50%", background: "rgba(255,107,0,0.07)", filter: "blur(80px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -80, left: -80, width: 240, height: 240,
        borderRadius: "50%", background: "rgba(167,139,250,0.05)", filter: "blur(80px)", pointerEvents: "none",
      }} />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 80, height: 80, borderRadius: 24, margin: "0 auto 24px",
          background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}
      >
        <Rocket size={34} color="#ff8800" />
        <Sparkles
          size={16} color="#ffcc00"
          style={{ position: "absolute", top: -6, right: -6 }}
        />
      </motion.div>

      <h2 style={{
        fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24,
        color: "var(--text)", margin: "0 0 12px", letterSpacing: "-0.025em",
      }}>
        No campaigns yet
      </h2>
      <p style={{
        fontSize: 14.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif",
        margin: "0 auto 32px", maxWidth: 380, lineHeight: 1.8,
      }}>
        Launch your first campaign and start raising funds. Reach thousands of
        verified backers on CrowdSpark.
      </p>

      <Link
        href="/dashboard/create-campaign"
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "13px 30px", borderRadius: 13,
          background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
          color: "#fff", textDecoration: "none",
          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5,
          boxShadow: "0 4px 24px rgba(255,100,0,0.4)",
          position: "relative", overflow: "hidden",
          transition: "transform 0.18s, box-shadow 0.18s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 36px rgba(255,100,0,0.5)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 24px rgba(255,100,0,0.4)";
        }}
      >
        <span style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)",
          animation: "mcShimmer 2.4s ease-in-out infinite",
        }} />
        <Plus size={15} style={{ position: "relative" }} />
        <span style={{ position: "relative" }}>Create your first campaign</span>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  const { isDark } = useTheme();
  const b = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  return (
    <div style={{ padding: "40px 36px 60px", maxWidth: 1160, margin: "0 auto" }}>
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
          <div key={i} style={{ height: 340, borderRadius: 20, background: b, animation: "mcPulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Filter tab ───────────────────────────────────────────────────────────────
function FilterTab({
  label, count, active, onClick,
}: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  const { isDark } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "6px 14px", borderRadius: 10,
        border: `1px solid ${active ? "rgba(255,107,0,0.4)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)")}`,
        background: active ? "rgba(255,107,0,0.1)" : "transparent",
        color: active ? "#ff8800" : "var(--text-muted)",
        fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: "pointer", transition: "all 0.16s", whiteSpace: "nowrap",
      }}
    >
      {label}
      {count > 0 && (
        <span style={{
          fontSize: 10.5, fontWeight: 700,
          background: active ? "rgba(255,136,0,0.2)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"),
          color: active ? "#ff8800" : "var(--text-muted)",
          padding: "1px 6px", borderRadius: 20,
        }}>
          {count}
        </span>
      )}
    </button>
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
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: "power3.out", delay: 0.1 }
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

  // Filters
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
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: isDark
            ? "radial-gradient(circle at 10% 14%, rgba(255,107,0,0.08), transparent 34%), radial-gradient(circle at 85% 12%, rgba(167,139,250,0.08), transparent 32%)"
            : "radial-gradient(circle at 10% 14%, rgba(255,107,0,0.06), transparent 34%), radial-gradient(circle at 85% 12%, rgba(139,92,246,0.05), transparent 32%)",
        }}
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, 24, 0], y: [0, -14, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          right: 38,
          top: 24,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,136,0,0.15) 0%, transparent 70%)",
          filter: "blur(10px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed", top: 24, right: 24, zIndex: 9999,
              padding: "14px 18px", borderRadius: 14,
              background: isDark ? "#161616" : "#fff",
              border: "1px solid rgba(52,211,153,0.4)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(52,211,153,0.1)",
              display: "flex", alignItems: "center", gap: 12,
              maxWidth: 360,
            }}
          >
            <CheckCircle2 size={20} color="#34d399" />
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#34d399", margin: "0 0 2px" }}>
                Campaign submitted!
              </p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>
                Under review — we'll notify you when it goes live.
              </p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex" }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={headerRef} style={{ padding: "40px 36px 60px", maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div className="mc-enter" style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between", marginBottom: 36,
          flexWrap: "wrap", gap: 20,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800",
              }}>
                <Zap size={13} />
              </div>
              <span style={{
                fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600,
              }}>
                Creator workspace
              </span>
            </div>
            <h1 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800,
              fontSize: "clamp(24px,3vw,36px)", color: "var(--text)",
              letterSpacing: "-0.03em", margin: 0,
            }}>
              My Campaigns
            </h1>
          </div>

          <Link
            href="/dashboard/create-campaign"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 13,
              background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
              color: "#fff", textDecoration: "none",
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
              boxShadow: "0 4px 20px rgba(255,100,0,0.35)",
              whiteSpace: "nowrap", position: "relative", overflow: "hidden",
              transition: "transform 0.18s, box-shadow 0.18s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(255,100,0,0.5)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(255,100,0,0.35)";
            }}
          >
            <span style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)",
              animation: "mcShimmer 2.8s ease-in-out infinite",
            }} />
            <Plus size={14} style={{ position: "relative" }} />
            <span style={{ position: "relative" }}>New Campaign</span>
          </Link>
        </div>

        {/* ── Stat cards ── */}
        {projects.length > 0 && (
          <div className="mc-enter" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 14, marginBottom: 36,
          }}>
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

        {/* ── Filter tabs ── */}
        {projects.length > 0 && (
          <div className="mc-enter" style={{
            display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28,
            paddingBottom: 20,
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
          }}>
            {FILTERS.map(f => (
              <FilterTab
                key={f.key}
                label={f.label}
                count={f.items.length}
                active={activeFilter === f.key}
                onClick={() => setActiveFilter(f.key)}
              />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{
            padding: "14px 18px", borderRadius: 13,
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
            display: "flex", alignItems: "center", gap: 10, marginBottom: 24,
          }}>
            <AlertTriangle size={15} color="#ef4444" />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "#ef4444", flex: 1 }}>
              {error}
            </span>
            <button
              onClick={fetchProjects}
              style={{
                padding: "6px 14px", borderRadius: 8,
                border: "1px solid rgba(239,68,68,0.3)", background: "transparent",
                color: "#ef4444", fontFamily: "DM Sans, sans-serif", fontSize: 12.5,
                fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              }}
            >
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
              <motion.div
                key="filter-empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  textAlign: "center", padding: "64px 24px",
                  borderRadius: 20,
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                  border: `1px dashed ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                }}
              >
                <p style={{
                  fontFamily: "Syne, sans-serif", fontWeight: 700,
                  fontSize: 18, color: "var(--text)", marginBottom: 8,
                }}>
                  No {FILTERS.find(f => f.key === activeFilter)?.label.toLowerCase()} campaigns
                </p>
                <button
                  onClick={() => setActiveFilter("all")}
                  style={{
                    padding: "8px 18px", borderRadius: 10,
                    border: "1px solid var(--border)", background: "transparent",
                    color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif",
                    fontSize: 13, cursor: "pointer",
                  }}
                >
                  Show all campaigns
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`grid-${activeFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mc-grid"
                style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}
              >
                {visible.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <CampaignCard project={p} />
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
        @keyframes mcPulse   { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
        @media(max-width:900px)  { .mc-grid{ grid-template-columns:repeat(2,1fr)!important; } }
        @media(max-width:580px)  { .mc-grid{ grid-template-columns:1fr!important; } }
        @media(max-width:768px)  { div[style*="padding: 40px 36px"]{ padding:28px 16px 48px!important; } }
      `}</style>
    </div>
  );
}

// ─── Suspense wrapper (required for useSearchParams in Next.js) ───────────────
export default function MyCampaignsPage() {
  return (
    <Suspense fallback={null}>
      <MyCampaignsPageInner />
    </Suspense>
  );
}