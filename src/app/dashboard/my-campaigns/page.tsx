"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import { projectApi, type CreatorProjectResponse } from "@/lib/api";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcZap = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IcPlus = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcRocket = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
  </svg>
);
const IcChart = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IcCoin = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v1m0 6v1M9.5 10.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 2-5 2-5 4 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5"/>
  </svg>
);
const IcClock = ({ s = 12 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcWarn = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:           { label: "Draft",           color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.2)" },
  PENDING:         { label: "Under Review",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)" },
  APPROVED:        { label: "Live",            color: "#34d399", bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.25)" },
  REJECTED:        { label: "Rejected",        color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)" },
  FUNDED:          { label: "Funded",          color: "#a78bfa", bg: "rgba(167,139,250,0.1)",  border: "rgba(167,139,250,0.25)" },
  COMPLETED:       { label: "Completed",       color: "#34d399", bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.25)" },
  CLOSED:          { label: "Closed",           color: "#6b7280", bg: "rgba(107,114,128,0.1)",  border: "rgba(107,114,128,0.2)" },
  CANCELLED:       { label: "Cancelled",       color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.2)" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700, color: cfg.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ current, goal, isDark }: { current: number; goal: number; isDark: boolean }) {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  const color = pct >= 100 ? "#34d399" : pct >= 50 ? "#ff8800" : "#a78bfa";
  return (
    <div style={{ width: "100%" }}>
      <div style={{ height: 4, borderRadius: 2, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: color, transition: "width 0.6s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>
          ₹{current.toLocaleString("en-IN")} raised
        </span>
        <span style={{ fontFamily: "Syne, sans-serif", fontSize: 11, fontWeight: 700, color }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

function CampaignCard({ project, isDark }: { project: CreatorProjectResponse; isDark: boolean }) {
  const cardBg  = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const cardBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  const deadline = project.deadline ? new Date(project.deadline) : null;
  const daysLeft = deadline
    ? Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div style={{
      borderRadius: 18, overflow: "hidden",
      background: cardBg, border: `1px solid ${cardBdr}`,
      boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)",
      display: "flex", flexDirection: "column",
      transition: "transform 0.18s, box-shadow 0.18s",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = isDark
          ? "0 8px 32px rgba(0,0,0,0.3)"
          : "0 8px 32px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)";
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: "100%", height: 160, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        {project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }}>
            <IcRocket s={40} />
          </div>
        )}
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <StatusBadge status={project.status} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: 0, letterSpacing: "-0.015em", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {project.title}
        </h3>

        <ProgressBar current={project.currentAmount ?? 0} goal={project.goalAmount ?? 0} isDark={isDark} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)" }}>
            <IcCoin s={12} />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12 }}>
              Goal: ₹{(project.goalAmount ?? 0).toLocaleString("en-IN")}
            </span>
          </div>
          {daysLeft !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: daysLeft <= 3 ? "#ef4444" : "var(--text-muted)" }}>
              <IcClock s={11} />
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: daysLeft <= 3 ? 700 : 400 }}>
                {daysLeft === 0 ? "Ends today" : `${daysLeft}d left`}
              </span>
            </div>
          )}
        </div>

        {project.status === "REJECTED" && project.rejectionReason && (
          <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", display: "flex", gap: 7, alignItems: "flex-start" }}>
            <div style={{ color: "#ef4444", flexShrink: 0, marginTop: 1 }}><IcWarn s={12} /></div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "#ef4444", margin: 0, lineHeight: 1.5 }}>
              {project.rejectionReason}
            </p>
          </div>
        )}

        <div style={{ marginTop: "auto", paddingTop: 4 }}>
          <Link
            href={`/dashboard/my-campaigns/${project.id}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 16px", borderRadius: 10,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
              color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600,
              textDecoration: "none", transition: "all 0.15s",
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,136,0,0.4)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#ff8800";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
            }}
          >
            <IcChart s={13} /> View details
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ borderRadius: 24, padding: "72px 40px", textAlign: "center", position: "relative", overflow: "hidden", background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`, boxShadow: isDark ? "none" : "0 2px 24px rgba(0,0,0,0.05)" }}>
      <div style={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,107,0,0.07)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -70, left: -70, width: 220, height: 220, borderRadius: "50%", background: "rgba(167,139,250,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ width: 72, height: 72, borderRadius: 22, margin: "0 auto 22px", background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800" }}>
        <IcRocket s={30} />
      </div>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>No campaigns yet</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: "0 auto 28px", maxWidth: 360, lineHeight: 1.75 }}>
        Launch your first campaign and start raising funds for your idea on CrowdSpark.
      </p>
      <Link
        href="/dashboard/become-creator"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 0 24px rgba(255,100,0,0.35)", position: "relative", overflow: "hidden" }}
      >
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "mcShimmer 2.4s ease-in-out infinite" }} />
        <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 7 }}>
          <IcPlus s={14} /> Create campaign
        </span>
      </Link>
    </div>
  );
}

function PageSkeleton({ isDark }: { isDark: boolean }) {
  const b = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  return (
    <div style={{ padding: "40px 36px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ width: 140, height: 12, borderRadius: 6, background: b, marginBottom: 10, animation: "mcPulse 2s ease-in-out infinite" }} />
        <div style={{ width: 260, height: 34, borderRadius: 10, background: b, animation: "mcPulse 2s ease-in-out infinite" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ height: 300, borderRadius: 18, background: b, animation: "mcPulse 2s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <style>{`@keyframes mcPulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyCampaignsPage() {
  const { isDark } = useTheme();
  const { user, loading: profileLoading } = useProfile();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<CreatorProjectResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [mounted, setMounted]   = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Show success toast when redirected after campaign creation
  useEffect(() => {
    if (searchParams.get("created") === "1") {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
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

  if (!mounted || profileLoading || loading) return <PageSkeleton isDark={isDark} />;

  const cardBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  // Stats
  const totalRaised = projects.reduce((s, p) => s + (p.currentAmount ?? 0), 0);
  const live = projects.filter(p => p.status === "APPROVED").length;

  return (
    <div style={{ padding: "40px 36px 60px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Success toast */}
      {showToast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          padding: "14px 20px", borderRadius: 14,
          background: isDark ? "#1a1a1a" : "#fff",
          border: "1px solid rgba(52,211,153,0.4)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", gap: 12,
          animation: "toastIn 0.3s ease",
        }}>
          <span style={{ fontSize: 20 }}>🎉</span>
          <div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#34d399", margin: "0 0 2px" }}>
              Campaign submitted!
            </p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>
              It's under review. We'll notify you once approved.
            </p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            style={{ marginLeft: 8, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 4 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800" }}>
              <IcZap s={13} />
            </div>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Creator dashboard</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
            My Campaigns
          </h1>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {projects.length > 0 && (
            <>
              {[
                { label: "Total campaigns", value: String(projects.length), color: "#ff8800" },
                { label: "Live now",         value: String(live),            color: "#34d399" },
                { label: "Total raised",     value: `₹${totalRaised.toLocaleString("en-IN")}`, color: "#a78bfa" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "12px 18px", borderRadius: 14, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${cardBdr}` }}>
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color, lineHeight: 1 }}>{value}</span>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
                </div>
              ))}
            </>
          )}
          <Link
            href="/dashboard/create-campaign"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "11px 20px", borderRadius: 12,
              background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
              color: "#fff", textDecoration: "none",
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5,
              boxShadow: "0 0 20px rgba(255,100,0,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            <IcPlus s={13} /> New Campaign
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "14px 18px", borderRadius: 13, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ color: "#ef4444" }}><IcWarn s={15} /></div>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "#ef4444" }}>{error}</span>
          <button onClick={fetchProjects} style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {!error && projects.length === 0 ? (
        <EmptyState isDark={isDark} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="mc-grid">
          {projects.map(p => (
            <CampaignCard key={p.id} project={p} isDark={isDark} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes mcShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(200%)} 100%{transform:translateX(200%)} }
        @keyframes mcPulse   { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes toastIn   { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 900px) { .mc-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 580px) { .mc-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
