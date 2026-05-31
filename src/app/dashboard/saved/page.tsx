"use client";
// src/app/dashboard/saved/page.tsx
// FULL REPLACEMENT — now uses backend API instead of localStorage

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
const IcTrash = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IcArrow = ({ s = 13 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IcClock = ({ s = 12 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

// ─── Project Card ─────────────────────────────────────────────────────────────
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
  const bdr     = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const txt     = isDark ? "#f0f0f0" : "#0a0a0a";
  const muted   = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const accent  = "#ff5c00";
  const pct     = Math.min(100, Math.round((project.currentAmount / project.goalAmount) * 100));
  const urgency = project.daysLeft <= 5;

  const handleRemove = () => {
    setRemoving(true);
    // Optimistic UI: remove card after 300ms fade
    setTimeout(() => onRemove(project.id), 300);
    // Call API (fire-and-forget — if it fails the next page load will re-sync)
    savedApi.unsave(project.id).catch(() => {});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: removing ? 0 : 1, y: removing ? -10 : 0, scale: removing ? 0.95 : 1 }}
      transition={{ duration: removing ? 0.25 : 0.4, delay: removing ? 0 : index * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
        border: `1px solid ${hovered ? (isDark ? "rgba(255,136,0,0.3)" : "rgba(255,107,0,0.2)") : bdr}`,
        borderRadius: 20, overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: hovered
          ? (isDark ? "0 8px 40px rgba(255,107,0,0.12)" : "0 8px 40px rgba(0,0,0,0.12)")
          : (isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)"),
        transition: "all 0.25s cubic-bezier(.22,1,.36,1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        position: "relative",
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", height: 180, overflow: "hidden",
        background: isDark ? "#1a1a1a" : "#f0f0f0" }}>
        {project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt={project.title}
            style={{ width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.04)" : "scale(1)" }} />
        ) : (
          <div style={{ width: "100%", height: "100%",
            background: `linear-gradient(135deg,${accent}22,#ff990022)`,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IcBookmark s={40} filled />
          </div>
        )}
        {/* Category pill */}
        {project.category && (
          <div style={{ position: "absolute", top: 12, left: 12,
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
            borderRadius: 8, padding: "4px 10px" }}>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10.5,
              color: "#fff", letterSpacing: "0.06em" }}>
              {project.category}
            </span>
          </div>
        )}
        {/* Remove button */}
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={e => { e.preventDefault(); handleRemove(); }}
          style={{ position: "absolute", top: 12, right: 12,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(239,68,68,0.85)", backdropFilter: "blur(4px)",
            border: "none", color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>
          <IcTrash s={13} />
        </motion.button>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 18px", flex: 1,
        display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700,
            fontSize: 15, color: txt, margin: "0 0 6px",
            lineHeight: 1.35,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {project.title}
          </h3>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5,
            color: muted, margin: 0, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {project.shortDescription}
          </p>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: "DM Sans, sans-serif",
              fontSize: 12, color: muted }}>
              {fmt(project.currentAmount)} raised
            </span>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800,
              fontSize: 12, color: accent }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 2,
            background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
            overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`,
              background: `linear-gradient(90deg,${accent},#ffb300)`,
              borderRadius: 2 }} />
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginTop: "auto" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4,
            fontFamily: "DM Sans, sans-serif", fontSize: 12,
            color: urgency ? "#ef4444" : muted }}>
            <IcClock s={11} />
            {project.daysLeft <= 0
              ? "Ended"
              : urgency
                ? `${project.daysLeft}d left!`
                : `${project.daysLeft}d left`}
          </span>
          <Link href={`/projects/${project.id}`}
            style={{ display: "flex", alignItems: "center", gap: 5,
              fontFamily: "Syne, sans-serif", fontWeight: 700,
              fontSize: 12.5, color: accent,
              textDecoration: "none",
              padding: "5px 12px", borderRadius: 8,
              background: `${accent}14`,
              transition: "background 0.15s" }}>
            View <IcArrow s={11} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SavedPage() {
  const { isDark } = useTheme();
  const [projects, setProjects] = useState<ProjectFeedResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [search,   setSearch]   = useState("");

  const txt   = isDark ? "#f0f0f0" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const accent = "#ff5c00";

  // ── Fetch saved projects from backend ──────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    savedApi.getSaved()
      .then(setProjects)
      .catch(e => setError(e?.message ?? "Failed to load saved projects"))
      .finally(() => setLoading(false));
  }, []);

  function handleRemove(id: number) {
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  const filtered = search.trim()
    ? projects.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.shortDescription?.toLowerCase().includes(search.toLowerCase()))
    : projects;

  return (
    <div style={{ minHeight: "100vh",
      background: isDark ? "#080808" : "#fafaf8",
      padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12,
            background: `${accent}18`, border: `1px solid ${accent}30`,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IcBookmark s={20} filled />
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900,
            fontSize: 26, color: txt, margin: 0 }}>
            Saved Projects
          </h1>
        </div>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14,
          color: muted, margin: 0, paddingLeft: 52 }}>
          {loading ? "Loading…"
            : `${projects.length} project${projects.length !== 1 ? "s" : ""} saved`}
        </p>
      </div>

      {/* Search */}
      {!loading && projects.length > 0 && (
        <div style={{ position: "relative", marginBottom: 28, maxWidth: 400 }}>
          <div style={{ position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)" }}>
            <IcSearch s={14} />
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search saved projects…"
            style={{ width: "100%", boxSizing: "border-box",
              padding: "11px 14px 11px 38px", borderRadius: 12,
              border: `1.5px solid ${bdr}`,
              background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
              color: txt, fontFamily: "DM Sans, sans-serif",
              fontSize: 14, outline: "none" }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: "16px 20px", borderRadius: 14,
          background: "rgba(239,68,68,0.07)",
          border: "1px solid rgba(239,68,68,0.2)",
          fontFamily: "DM Sans, sans-serif", fontSize: 14,
          color: "#ef4444", marginBottom: 24 }}>
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
          gap: 20 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ borderRadius: 20, overflow: "hidden",
              border: `1px solid ${bdr}`,
              animation: "pulse 1.5s ease-in-out infinite" }}>
              <div style={{ height: 180,
                background: isDark ? "rgba(255,255,255,0.04)" : "#f0f0f0" }} />
              <div style={{ padding: 18 }}>
                <div style={{ height: 14, width: "75%", borderRadius: 6, marginBottom: 10,
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
                <div style={{ height: 10, width: "90%", borderRadius: 6, marginBottom: 6,
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
                <div style={{ height: 10, width: "60%", borderRadius: 6,
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", padding: "64px 32px",
            borderRadius: 24, border: `1.5px dashed ${bdr}` }}>
          <div style={{ width: 72, height: 72, borderRadius: 22,
            background: `${accent}12`, border: `1px solid ${accent}22`,
            display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 20px" }}>
            <IcBookmark s={32} />
          </div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900,
            fontSize: 22, color: txt, margin: "0 0 10px" }}>
            {search ? "No results found" : "Nothing saved yet"}
          </h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14,
            color: muted, margin: "0 0 28px", lineHeight: 1.7 }}>
            {search
              ? `No saved projects match "${search}"`
              : "Browse campaigns and tap the bookmark icon to save projects you're interested in."}
          </p>
          <Link href="/explore"
            style={{ display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 12,
              background: `linear-gradient(135deg,${accent},#ff9900)`,
              color: "#fff", fontFamily: "Syne, sans-serif",
              fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Explore Campaigns <IcArrow s={13} />
          </Link>
        </motion.div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
          gap: 20 }}>
          <AnimatePresence>
            {filtered.map((p, i) => (
              <ProjectCard key={p.id} project={p} onRemove={handleRemove}
                isDark={isDark} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
