"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { savedApi, type ProjectFeedResponse } from "@/lib/api";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcBookmark = ({ s = 16, filled = false }: { s?: number; filled?: boolean }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
  </svg>
);
const IcSearch = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcTrash = ({ s = 13 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IcArrow = ({ s = 13 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IcClock = ({ s = 12 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcX = ({ s = 13 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IcGrid = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IcList = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const IcUsers = ({ s = 11 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

// ─── Project Card (Grid) ───────────────────────────────────────────────────────
function ProjectCard({
  project, onRemove, isDark, index,
}: {
  project: ProjectFeedResponse;
  onRemove: (id: number) => void;
  isDark: boolean;
  index: number;
}) {
  const [hovered,  setHovered]  = useState(false);
  const [removing, setRemoving] = useState(false);
  const accent  = "#ff5c00";
  const pct     = Math.min(100, Math.round((project.currentAmount / project.goalAmount) * 100));
  const urgency = project.daysLeft <= 5;

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(project.id), 300);
    savedApi.unsave(project.id).catch(() => {});
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: removing ? 0 : 1, y: removing ? -12 : 0, scale: removing ? 0.94 : 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: removing ? 0.25 : 0.45, delay: removing ? 0 : index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)"
          : "#ffffff",
        border: `1px solid ${hovered
          ? isDark ? "rgba(255,92,0,0.3)" : "rgba(255,92,0,0.18)"
          : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        borderRadius: 22, overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: hovered
          ? isDark ? "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,92,0,0.1)" : "0 16px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,92,0,0.06)"
          : isDark ? "0 1px 0 rgba(255,255,255,0.04) inset" : "0 2px 20px rgba(0,0,0,0.05)",
        transition: "all 0.28s cubic-bezier(.22,1,.36,1)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        position: "relative",
      }}
    >
      {/* Top shimmer on hover */}
      <div style={{
        position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
        background: `linear-gradient(90deg,transparent,${accent}55,transparent)`,
        opacity: hovered ? 1 : 0, transition: "opacity 0.25s", zIndex: 2,
      }} />

      {/* Thumbnail */}
      <div style={{ position: "relative", height: 188, overflow: "hidden", background: isDark ? "#1a1a1a" : "#f0f0f0", flexShrink: 0 }}>
        {project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt={project.title}
            style={{ width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.5s cubic-bezier(.22,1,.36,1)",
              transform: hovered ? "scale(1.06)" : "scale(1)" }} />
        ) : (
          <div style={{ width: "100%", height: "100%",
            background: `linear-gradient(135deg,${accent}20,rgba(255,153,0,0.15))`,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IcBookmark s={44} filled />
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)", pointerEvents: "none" }} />

        {/* Category pill */}
        {project.category && (
          <div style={{ position: "absolute", top: 12, left: 12,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            borderRadius: 20, padding: "4px 11px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5,
              color: "#fff", letterSpacing: "0.05em", fontWeight: 600 }}>
              {project.category}
            </span>
          </div>
        )}

        {/* Urgency badge */}
        {urgency && project.daysLeft > 0 && (
          <div style={{ position: "absolute", bottom: 12, left: 12,
            background: "rgba(239,68,68,0.85)", backdropFilter: "blur(6px)",
            borderRadius: 20, padding: "3px 9px", border: "1px solid rgba(239,68,68,0.4)" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, color: "#fff", fontWeight: 700 }}>
              ⚡ {project.daysLeft}d left
            </span>
          </div>
        )}

        {/* Remove button */}
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          onClick={e => { e.preventDefault(); handleRemove(); }}
          aria-label="Remove from saved"
          style={{
            position: "absolute", top: 12, right: 12,
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(239,68,68,0.88)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(239,68,68,0.3)", color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hovered ? 1 : 0, transition: "opacity 0.22s",
            boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
          }}>
          <IcTrash s={13} />
        </motion.button>
      </div>

      {/* Content */}
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700,
            fontSize: 15.5, color: "var(--text)", margin: "0 0 6px",
            lineHeight: 1.35,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {project.title}
          </h3>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13,
            color: "var(--text-muted)", margin: 0, lineHeight: 1.6,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {project.shortDescription}
          </p>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 }}>
              {fmt(project.currentAmount)} raised
            </span>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 12.5, color: accent }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 4, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", overflow: "hidden", position: "relative" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, delay: 0.3 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${accent},#ffb300)`, borderRadius: 4, position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)", animation: "savedShine 2.5s ease-in-out infinite" }} />
            </motion.div>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 4, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4,
              fontFamily: "DM Sans, sans-serif", fontSize: 12,
              color: urgency ? "#ef4444" : "var(--text-muted)", fontWeight: urgency ? 600 : 400 }}>
              <IcClock s={11} />
              {project.daysLeft <= 0 ? "Ended" : `${project.daysLeft}d left`}
            </span>
            {project.backersCount !== undefined && project.backersCount > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>
                <IcUsers s={11} /> {project.backersCount.toLocaleString()}
              </span>
            )}
          </div>

          <Link href={`/projects/${project.id}`}
            style={{ display: "flex", alignItems: "center", gap: 5,
              fontFamily: "Syne, sans-serif", fontWeight: 700,
              fontSize: 12.5, color: accent,
              textDecoration: "none",
              padding: "6px 13px", borderRadius: 10,
              background: hovered ? `${accent}18` : `${accent}0d`,
              border: `1px solid ${hovered ? `${accent}35` : "transparent"}`,
              transition: "all 0.2s" }}>
            View <IcArrow s={11} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Project Row (List view) ───────────────────────────────────────────────────
function ProjectRow({
  project, onRemove, isDark, index,
}: {
  project: ProjectFeedResponse;
  onRemove: (id: number) => void;
  isDark: boolean;
  index: number;
}) {
  const [hov, setHov] = useState(false);
  const [removing, setRemoving] = useState(false);
  const accent = "#ff5c00";
  const pct = Math.min(100, Math.round((project.currentAmount / project.goalAmount) * 100));

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(project.id), 280);
    savedApi.unsave(project.id).catch(() => {});
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: removing ? 0 : 1, x: removing ? -30 : 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: removing ? 0.22 : 0.38, delay: removing ? 0 : index * 0.05 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", gap: 16, alignItems: "center",
        padding: "14px 16px", borderRadius: 16,
        background: hov
          ? isDark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.025)"
          : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
        border: `1px solid ${hov ? (isDark ? "rgba(255,92,0,0.25)" : "rgba(255,92,0,0.14)") : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)")}`,
        transition: "all 0.2s cubic-bezier(.22,1,.36,1)",
        transform: hov ? "translateX(3px)" : "none",
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: 56, height: 56, borderRadius: 13, flexShrink: 0, overflow: "hidden", background: isDark ? "#1a1a1a" : "#f0f0f0" }}>
        {project.thumbnailUrl
          ? <img src={project.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${accent}22,#ff990022)`, display: "flex", alignItems: "center", justifyContent: "center" }}><IcBookmark s={22} filled /></div>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.title}</h3>
          {project.category && (
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, color: "var(--text-muted)", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0 }}>{project.category}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, maxWidth: 180, height: 3, borderRadius: 3, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${accent},#ffb300)`, borderRadius: 3 }} />
          </div>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: accent, fontWeight: 700, whiteSpace: "nowrap" }}>{pct}%</span>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmt(project.currentAmount)}</span>
          {project.daysLeft > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: "DM Sans, sans-serif", fontSize: 12, color: project.daysLeft <= 5 ? "#ef4444" : "var(--text-muted)", whiteSpace: "nowrap" }}>
              <IcClock s={10} /> {project.daysLeft}d
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <Link href={`/projects/${project.id}`} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 10, background: `${accent}12`, color: accent, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12.5, textDecoration: "none", border: `1px solid ${accent}22`, transition: "all 0.15s" }}>
          View <IcArrow s={11} />
        </Link>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleRemove}
          aria-label="Remove"
          style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: hov ? 1 : 0, transition: "opacity 0.2s" }}
        >
          <IcTrash s={13} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard({ isDark, viewMode }: { isDark: boolean; viewMode: "grid" | "list" }) {
  const b = isDark ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.055)";
  if (viewMode === "list") {
    return (
      <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "14px 16px", borderRadius: 16, border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)" }}>
        <div style={{ width: 56, height: 56, borderRadius: 13, background: b, animation: "savedPulse 1.6s ease-in-out infinite", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, width: "55%", borderRadius: 6, background: b, marginBottom: 8, animation: "savedPulse 1.6s ease-in-out infinite" }} />
          <div style={{ height: 3, width: "40%", borderRadius: 3, background: b, animation: "savedPulse 1.6s ease-in-out infinite" }} />
        </div>
        <div style={{ width: 70, height: 34, borderRadius: 10, background: b, animation: "savedPulse 1.6s ease-in-out infinite" }} />
      </div>
    );
  }
  return (
    <div style={{ borderRadius: 22, overflow: "hidden", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
      <div style={{ height: 188, background: b, animation: "savedPulse 1.6s ease-in-out infinite" }} />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ height: 14, width: "75%", borderRadius: 6, background: b, marginBottom: 10, animation: "savedPulse 1.6s ease-in-out infinite" }} />
        <div style={{ height: 11, width: "90%", borderRadius: 6, background: b, marginBottom: 6, animation: "savedPulse 1.6s ease-in-out infinite" }} />
        <div style={{ height: 11, width: "60%", borderRadius: 6, background: b, animation: "savedPulse 1.6s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SavedPage() {
  const { isDark } = useTheme();
  const [projects, setProjects] = useState<ProjectFeedResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [search,   setSearch]   = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy,   setSortBy]   = useState<"default" | "funded" | "recent" | "urgent">("default");
  const [category, setCategory] = useState("all");

  const accent = "#ff5c00";

  useEffect(() => {
    let cancelled = false;
    savedApi.getSaved()
      .then(data => {
        if (!cancelled) setProjects(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load saved projects");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  function handleRemove(id: number) {
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  const categories = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));

  const filtered = (() => {
    let list = category === "all" ? projects : projects.filter(p => p.category === category);

    list = search.trim()
      ? list.filter(p =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.shortDescription?.toLowerCase().includes(search.toLowerCase()))
      : list;

    if (sortBy === "funded") list = [...list].sort((a, b) => (b.currentAmount / b.goalAmount) - (a.currentAmount / a.goalAmount));
    else if (sortBy === "recent") list = [...list].sort((a, b) => b.id - a.id);
    else if (sortBy === "urgent") list = [...list].sort((a, b) => (a.daysLeft || 999) - (b.daysLeft || 999));
    return list;
  })();

  return (
    <div style={{ minHeight: "100vh", padding: "32px 24px 80px", maxWidth: 1280, margin: "0 auto" }}>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: `${accent}18`, border: `1px solid ${accent}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 16px ${accent}18`,
              }}>
                <span style={{ color: accent }}><IcBookmark s={22} filled /></span>
              </div>
              <div>
                <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(22px,4vw,30px)", color: "var(--text)", margin: 0, letterSpacing: "-0.035em" }}>
                  Saved Projects
                </h1>
              </div>
            </div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: 0, paddingLeft: 56 }}>
              {loading ? "Loading…" : `${projects.length} project${projects.length !== 1 ? "s" : ""} saved`}
              {search && filtered.length !== projects.length && ` · ${filtered.length} match${filtered.length !== 1 ? "es" : ""}`}
            </p>
          </div>

          {/* View toggle */}
          {!loading && projects.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px", borderRadius: 12, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
              {(["grid", "list"] as const).map(mode => (
                <motion.button
                  key={mode}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setViewMode(mode)}
                  style={{
                    width: 34, height: 34, borderRadius: 9, border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: viewMode === mode ? (isDark ? "rgba(255,255,255,0.1)" : "#fff") : "transparent",
                    color: viewMode === mode ? "var(--text)" : "var(--text-muted)",
                    boxShadow: viewMode === mode ? (isDark ? "none" : "0 1px 8px rgba(0,0,0,0.08)") : "none",
                    transition: "all 0.18s",
                  }}
                  aria-label={`${mode} view`}
                >
                  {mode === "grid" ? <IcGrid s={15} /> : <IcList s={15} />}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Controls: Search + Sort */}
      {!loading && projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 380 }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
              <IcSearch s={14} />
            </div>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search saved projects…"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "11px 36px 11px 38px", borderRadius: 13,
                border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                color: "var(--text)", fontFamily: "DM Sans, sans-serif",
                fontSize: 14, outline: "none",
                transition: "border-color 0.2s",
                boxShadow: isDark ? "none" : "0 2px 10px rgba(0,0,0,0.04)",
              }}
              onFocus={e => (e.target.style.borderColor = `${accent}60`)}
              onBlur={e => (e.target.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)")}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 2 }}>
                <IcX s={13} />
              </button>
            )}
          </div>

          {/* Sort pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {([
              { key: "default", label: "Default" },
              { key: "funded",  label: "Most Funded" },
              { key: "urgent",  label: "Ending Soon" },
              { key: "recent",  label: "Recent" },
            ] as const).map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                style={{
                  padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: sortBy === opt.key ? 700 : 500,
                  background: sortBy === opt.key ? `${accent}14` : "transparent",
                  border: `1px solid ${sortBy === opt.key ? `${accent}40` : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)")}`,
                  color: sortBy === opt.key ? accent : "var(--text-muted)",
                  transition: "all 0.18s",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {categories.length > 0 && (
            <div className="saved-categories" aria-label="Filter saved projects by category">
              {["all", ...categories].map(cat => {
                const active = category === cat;
                return (
                  <motion.button
                    key={cat}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setCategory(cat)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "8px 13px", borderRadius: 999, cursor: "pointer",
                      fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: active ? 800 : 600,
                      background: active ? "var(--accent-dim)" : "var(--bg-ghost)",
                      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      color: active ? "var(--accent)" : "var(--text-muted)",
                      boxShadow: active ? "0 8px 22px var(--accent-dim)" : "none",
                      transition: "all 0.18s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: active ? "var(--accent)" : "var(--text-muted)",
                      opacity: active ? 1 : 0.45,
                    }} />
                    {cat === "all" ? "All categories" : cat}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: "16px 20px", borderRadius: 14,
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.18)",
            fontFamily: "DM Sans, sans-serif", fontSize: 14,
            color: "#ef4444", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
          {error}
        </motion.div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className={viewMode === "grid" ? "saved-grid" : "saved-list"}>
          {[0,1,2,3,4,5].map(i => (
            <SkeletonCard key={i} isDark={isDark} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          style={{
            textAlign: "center", padding: "80px 40px",
            borderRadius: 28, border: `1.5px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.015)",
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle,${accent}10,transparent 70%)`, pointerEvents: "none" }} />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 76, height: 76, borderRadius: 24, background: `${accent}12`, border: `1px solid ${accent}22`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: accent }}
          >
            <IcBookmark s={34} filled />
          </motion.div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 24, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.03em" }}>
            {search ? "No results found" : "Nothing saved yet"}
          </h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: "var(--text-muted)", margin: "0 0 30px", lineHeight: 1.75, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
            {search
              ? `No saved projects match "${search}". Try a different search.`
              : "Browse campaigns and tap the bookmark icon to save projects you love."}
          </p>
          {search ? (
            <button onClick={() => setSearch("")} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 22px", borderRadius: 12, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "transparent", color: "var(--text)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              <IcX /> Clear search
            </button>
          ) : (
            <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 13, background: `linear-gradient(135deg,${accent},#ff9900)`, color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: `0 6px 24px ${accent}35` }}>
              Explore Campaigns <IcArrow s={13} />
            </Link>
          )}
        </motion.div>
      )}

      {/* Grid / List */}
      {!loading && filtered.length > 0 && (
        <motion.div
          layout
          className={viewMode === "grid" ? "saved-grid" : "saved-list"}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => viewMode === "grid"
              ? <ProjectCard key={p.id} project={p} onRemove={handleRemove} isDark={isDark} index={i} />
              : <ProjectRow  key={p.id} project={p} onRemove={handleRemove} isDark={isDark} index={i} />
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <style>{`
        .saved-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 22px;
        }
        .saved-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .saved-categories {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          overflow-x: auto;
          padding: 2px 0 4px;
          scrollbar-width: none;
        }
        .saved-categories::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 640px) {
          .saved-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes savedPulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes savedShine { 0%{transform:translateX(-100%)} 60%,100%{transform:translateX(200%)} }
      `}</style>
    </div>
  );
}
