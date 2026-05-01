"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { projectApi, ProjectFeedResponse } from "@/lib/api";

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

const LS_KEY = "cs_saved_projects";

function getSavedIds(): number[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as number[]; }
  catch { return []; }
}
function removeSaved(id: number) {
  const list = getSavedIds().filter(x => x !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}
function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

// ─── Premium Project Card ─────────────────────────────────────────────────────
function ProjectCard({ project, onRemove, isDark, index }: { project: ProjectFeedResponse; onRemove: (id: number) => void; isDark: boolean; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [removing, setRemoving] = useState(false);
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const pct = Math.min(100, Math.round((project.currentAmount / project.goalAmount) * 100));
  const urgency = project.daysLeft <= 5;

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(project.id), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: removing ? 0 : 1, y: removing ? -10 : 0, scale: removing ? 0.95 : 1 }}
      transition={{ duration: removing ? 0.25 : 0.4, delay: removing ? 0 : index * 0.07, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
        border: `1px solid ${hovered ? (isDark ? "rgba(255,136,0,0.3)" : "rgba(255,107,0,0.2)") : bdr}`,
        borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: hovered
          ? (isDark ? "0 8px 40px rgba(255,107,0,0.12)" : "0 8px 40px rgba(0,0,0,0.12)")
          : (isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)"),
        transition: "all 0.25s cubic-bezier(.22,1,.36,1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        position: "relative",
      }}
    >
      {/* Thumbnail */}
      <Link href={`/projects/${project.id}`} style={{ display: "block", position: "relative", paddingTop: "58%", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", flexShrink: 0, overflow: "hidden" }}>
        {project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt={project.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease", transform: hovered ? "scale(1.04)" : "scale(1)" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🎯</div>
        )}
        {/* Overlay on hover */}
        <div style={{ position: "absolute", inset: 0, background: hovered ? "rgba(0,0,0,0.15)" : "transparent", transition: "background 0.25s" }} />

        {/* Category badge */}
        <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "3px 10px", fontSize: 10.5, color: "#fff", fontFamily: "DM Sans, sans-serif", fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)" }}>
          {project.category}
        </div>

        {/* Urgency badge */}
        {urgency && (
          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 4, background: "rgba(239,68,68,0.85)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "3px 9px", fontSize: 10, color: "#fff", fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>
            <IcClock s={10} /> {project.daysLeft}d left
          </div>
        )}
      </Link>

      {/* Body */}
      <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <Link href={`/projects/${project.id}`} style={{ textDecoration: "none" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: hovered ? "#ff8800" : "var(--text)", margin: "0 0 6px", letterSpacing: "-0.02em", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", transition: "color 0.18s" }}>
              {project.title}
            </h3>
          </Link>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {project.shortDescription}
          </p>
        </div>

        {/* Progress */}
        <div style={{ marginTop: "auto" }}>
          <div style={{ height: 5, borderRadius: 4, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 8 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: index * 0.07 + 0.2 }}
              style={{ height: "100%", borderRadius: 4, background: pct >= 100 ? "#34d399" : "linear-gradient(90deg,#ff6b00,#ffcc00)" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text)", fontWeight: 700 }}>{fmt(project.currentAmount)}</strong> of {fmt(project.goalAmount)}
              <span style={{ marginLeft: 6, padding: "2px 7px", borderRadius: 6, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", fontSize: 10.5, fontWeight: 600 }}>{pct}%</span>
            </span>
            {!urgency && (
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>{project.daysLeft}d left</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/projects/${project.id}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, position: "relative", overflow: "hidden", boxShadow: hovered ? "0 0 20px rgba(255,100,0,0.3)" : "none", transition: "box-shadow 0.25s" }}>
            <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.18) 50%,transparent 70%)", animation: hovered ? "shimmer 1.8s ease-in-out infinite" : "none" }} />
            View Project <IcArrow s={12} />
          </Link>
          <button
            onClick={handleRemove}
            title="Remove from saved"
            style={{ padding: "10px 13px", borderRadius: 12, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${bdr}`, color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = bdr; }}
          >
            <IcTrash s={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function PageSkeleton() {
  const { isDark } = useTheme();
  const b = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  return (
    <div style={{ padding: "40px 32px 60px", maxWidth: 1160, margin: "0 auto" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ width: 140, height: 12, borderRadius: 6, background: b, marginBottom: 12, animation: "svpulse 2s ease-in-out infinite" }} />
        <div style={{ width: 280, height: 40, borderRadius: 12, background: b, animation: "svpulse 2s ease-in-out infinite" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 22 }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ height: 380, borderRadius: 20, background: b, animation: "svpulse 2s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <style>{`@keyframes svpulse{0%,100%{opacity:.35}50%{opacity:.85}}`}</style>
    </div>
  );
}

export default function SavedPage() {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<ProjectFeedResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    loadSaved();
  }, []);

  async function loadSaved() {
    setLoading(true);
    const ids = getSavedIds();
    if (ids.length === 0) { setProjects([]); setLoading(false); return; }
    try {
      const results = await Promise.allSettled(ids.map(id => projectApi.getById(id)));
      const loaded = results
        .filter((r): r is PromiseFulfilledResult<ProjectFeedResponse> => r.status === "fulfilled")
        .map(r => r.value);
      setProjects(loaded);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  function handleRemove(id: number) {
    removeSaved(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  if (!mounted || loading) return <PageSkeleton />;

  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const txt = isDark ? "#fff" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";

  return (
    <div style={{ padding: "40px 32px 60px", maxWidth: 1160, margin: "0 auto" }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ marginBottom: 40, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4b8" }}>
              <IcBookmark s={14} filled />
            </div>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>Collection</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(26px,3vw,38px)", color: txt, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>
            Saved Campaigns
            {projects.length > 0 && (
              <span style={{ fontSize: 18, fontWeight: 600, color: muted, marginLeft: 14 }}>({projects.length})</span>
            )}
          </h1>
        </div>
        <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${bdr}`, color: txt, textDecoration: "none", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, transition: "all 0.18s" }}>
          <IcSearch s={13} /> Browse campaigns
        </Link>
      </motion.div>

      {/* ── Empty state ── */}
      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ borderRadius: 24, padding: "80px 40px", textAlign: "center", position: "relative", overflow: "hidden", background: isDark ? "rgba(255,255,255,0.025)" : "#ffffff", border: `1px solid ${bdr}`, boxShadow: isDark ? "none" : "0 4px 40px rgba(0,0,0,0.06)" }}
        >
          <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, rgba(0,212,184,0.08) 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,107,0,0.05)", filter: "blur(60px)", pointerEvents: "none" }} />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ width: 80, height: 80, borderRadius: 24, margin: "0 auto 24px", background: "rgba(0,212,184,0.08)", border: "1px solid rgba(0,212,184,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4b8" }}
          >
            <IcBookmark s={34} />
          </motion.div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: txt, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Nothing saved yet</h2>
          <p style={{ fontSize: 14.5, color: muted, fontFamily: "DM Sans, sans-serif", margin: "0 auto 36px", maxWidth: 400, lineHeight: 1.8 }}>
            Hit the bookmark icon on any campaign to save it here. Revisit and back the ideas that excite you most.
          </p>
          <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 32px", borderRadius: 14, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 0 30px rgba(255,100,0,0.3)", position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.18) 50%,transparent 70%)", animation: "shimmer 2.4s ease-in-out infinite" }} />
            Browse campaigns <IcArrow s={14} />
          </Link>
        </motion.div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 22 }}>
          <AnimatePresence>
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} onRemove={handleRemove} isDark={isDark} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(200%)} 100%{transform:translateX(200%)} }
        @keyframes svpulse { 0%,100%{opacity:.35} 50%{opacity:.85} }
      `}</style>
    </div>
  );
}
