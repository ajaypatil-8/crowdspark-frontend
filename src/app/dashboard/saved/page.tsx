"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { projectApi, ProjectFeedResponse } from "@/lib/api";

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

const LS_KEY = "cs_saved_projects";

function getSavedIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as number[];
  } catch {
    return [];
  }
}

function removeSaved(id: number) {
  const list = getSavedIds().filter((x) => x !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

function ProjectCard({ project, onRemove, isDark }: { project: ProjectFeedResponse; onRemove: (id: number) => void; isDark: boolean }) {
  const card = isDark ? "rgba(255,255,255,0.025)" : "#fff";
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const pct = Math.min(100, Math.round((project.currentAmount / project.goalAmount) * 100));

  return (
    <div style={{ background: card, border: `1px solid ${bdr}`, borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)" }}>
      {/* Thumbnail */}
      <Link href={`/projects/${project.id}`} style={{ display: "block", position: "relative", paddingTop: "56%", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", flexShrink: 0 }}>
        {project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt={project.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 32 }}>🎯</div>
        )}
        <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "#fff", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
          {project.category}
        </div>
      </Link>

      {/* Body */}
      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <Link href={`/projects/${project.id}`} style={{ textDecoration: "none" }}>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {project.title}
          </h3>
        </Link>

        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {project.shortDescription}
        </p>

        {/* Progress */}
        <div style={{ marginTop: "auto" }}>
          <div style={{ height: 4, borderRadius: 4, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#ff6b00,#ffcc00)", borderRadius: 4, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>
              <b style={{ color: "var(--text)" }}>{fmt(project.currentAmount)}</b> of {fmt(project.goalAmount)} · {pct}%
            </span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>{project.daysLeft}d left</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <Link href={`/projects/${project.id}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "9px 0", borderRadius: 10, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13 }}>
            View Project
          </Link>
          <button onClick={() => onRemove(project.id)} title="Remove from saved" style={{ padding: "9px 13px", borderRadius: 10, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${bdr}`, color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IcTrash s={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  const { isDark } = useTheme();
  const b = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  return (
    <div style={{ padding: "40px 32px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ width: 140, height: 12, borderRadius: 6, background: b, marginBottom: 10, animation: "svpulse 2s ease-in-out infinite" }} />
        <div style={{ width: 260, height: 36, borderRadius: 10, background: b, animation: "svpulse 2s ease-in-out infinite" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ height: 360, borderRadius: 18, background: b, animation: "svpulse 2s ease-in-out infinite" }} />
        ))}
      </div>
      <style>{`@keyframes svpulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
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
    if (ids.length === 0) {
      setProjects([]);
      setLoading(false);
      return;
    }
    try {
      const results = await Promise.allSettled(ids.map((id) => projectApi.getById(id)));
      const loaded = results
        .filter((r): r is PromiseFulfilledResult<ProjectFeedResponse> => r.status === "fulfilled")
        .map((r) => r.value);
      setProjects(loaded);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  function handleRemove(id: number) {
    removeSaved(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  if (!mounted || loading) return <PageSkeleton />;

  const card = isDark ? "rgba(255,255,255,0.025)" : "#fff";
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div style={{ padding: "40px 32px 60px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 36, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4b8" }}>
              <IcBookmark s={13} filled />
            </div>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Collection</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
            Saved Campaigns
            {projects.length > 0 && (
              <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-muted)", marginLeft: 12 }}>({projects.length})</span>
            )}
          </h1>
        </div>
        <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${bdr}`, color: "var(--text)", textDecoration: "none", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13 }}>
          <IcSearch s={13} />
          Browse campaigns
        </Link>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div style={{ borderRadius: 24, padding: "72px 40px", textAlign: "center", position: "relative", overflow: "hidden", background: card, border: `1px solid ${bdr}`, boxShadow: isDark ? "none" : "0 2px 24px rgba(0,0,0,0.05)" }}>
          <div style={{ position: "absolute", top: -60, left: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(0,245,212,0.06)", filter: "blur(80px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,107,0,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />
          <div style={{ width: 72, height: 72, borderRadius: 22, margin: "0 auto 22px", background: isDark ? "rgba(0,245,212,0.08)" : "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4b8" }}>
            <IcBookmark s={30} />
          </div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>Nothing saved yet</h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: "0 auto 28px", maxWidth: 360, lineHeight: 1.75 }}>
            Hit the bookmark icon on any campaign to save it here. Revisit and back the ideas that excite you most.
          </p>
          <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 0 24px rgba(255,100,0,0.35)" }}>
            Browse campaigns →
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onRemove={handleRemove} isDark={isDark} />
          ))}
        </div>
      )}
    </div>
  );
}
