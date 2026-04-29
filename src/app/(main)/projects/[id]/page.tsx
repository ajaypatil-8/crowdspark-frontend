"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import {
  exploreApi,
  isLoggedIn,
  type ProjectFullDetailsResponse,
  type RewardTierResponse,
} from "@/lib/api";
import ProjectGallery from "@/components/ProjectGallery";
import BackProjectModal from "@/components/BackProjectModal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/* ── tiny helpers ────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : n >= 1000
    ? `₹${(n / 1000).toFixed(0)}K`
    : `₹${n}`;

const daysColor = (d: number | null | undefined) =>
  !d || d <= 3 ? "#ef4444" : d <= 7 ? "#f59e0b" : "#22c55e";

/* ── component ───────────────────────────────────────────────────────────── */
export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { isDark } = useTheme();

  const [project, setProject] = useState<ProjectFullDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"story" | "rewards" | "updates">("story");
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const heroImgRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  /* fetch project + current user */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { authApi: auth, isLoggedIn: loggedIn } = await import("@/lib/api");
        const [proj] = await Promise.all([
          exploreApi.getFullDetails(id),
          loggedIn()
            ? auth.me().then((u) => setMyUsername(u.username)).catch(() => {})
            : Promise.resolve(),
        ]);
        setProject(proj);
        // init saved state
        try {
          const s = JSON.parse(localStorage.getItem("cs_saved_projects") ?? "[]") as number[];
          setSaved(s.includes(proj.id));
        } catch { /* ignore */ }
      } catch (e: any) {
        setError(e.message ?? "Project not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* GSAP entrance */
  useEffect(() => {
    if (!project) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-text > *",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        ".sidebar-card",
        { x: 32, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.85, ease: "power3.out", delay: 0.35 }
      );
      gsap.utils.toArray<Element>(".reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 28, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }
        );
      });
    }, mainRef);
    return () => ctx.revert();
  }, [project]);

  /* ── theme tokens ──────────────────────────────────────────────────────── */
  const bg     = isDark ? "#060608"      : "#f7f6f3";
  const card   = isDark ? "#0d0d0f"      : "#ffffff";
  const card2  = isDark ? "#111114"      : "#f0efe9";
  const bdr    = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const txt    = isDark ? "#f1f0ee"      : "#100f0d";
  const muted  = isDark ? "rgba(241,240,238,0.42)" : "rgba(16,15,13,0.42)";
  const accent = "#ff5c00";
  const accentSoft = isDark ? "rgba(255,92,0,0.12)" : "rgba(255,92,0,0.09)";

  /* ── states ────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 52, height: 52 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${accent}20` }} />
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: `2px solid transparent`,
              borderTopColor: accent,
              animation: "cspin 0.7s linear infinite",
            }} />
          </div>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: muted, letterSpacing: "0.15em" }}>LOADING PROJECT</span>
        </div>
        <style>{`@keyframes cspin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 72, lineHeight: 1 }}>💫</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: txt, margin: 0 }}>Project not found</h1>
        {error && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: muted, maxWidth: 320, textAlign: "center", margin: 0 }}>{error}</p>}
        <Link href="/explore" style={{ marginTop: 8, padding: "12px 28px", borderRadius: 12, background: accent, color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
          Browse campaigns
        </Link>
      </div>
    );
  }

  const pct    = Math.min(project.fundedPercentage ?? 0, 100);
  const raised = fmt(project.currentAmount ?? 0);
  const goal   = fmt(project.goalAmount ?? 0);
  const rewards: RewardTierResponse[] = (project as any).rewards ?? [];

  return (
    <div ref={mainRef} style={{ minHeight: "100vh", background: bg, paddingTop: 72 }}>
      {/* ── toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
              zIndex: 9999, padding: "12px 22px", borderRadius: 12,
              background: isDark ? "#1a1a1e" : "#fff",
              border: `1px solid ${accent}40`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px ${accent}20`,
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: txt,
              display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: accent }}>✓</span> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ambient blobs ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "0%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,${accent}09 0%,transparent 65%)`, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,0.06) 0%,transparent 65%)", filter: "blur(70px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ─────────────────────────── HERO STRIP ─────────────────────────── */}
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 0" }}>

          {/* breadcrumb */}
          <nav className="hero-text" style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Mono', monospace", fontSize: 11, color: muted, letterSpacing: "0.1em", marginBottom: 24 }}>
            <Link href="/" style={{ color: muted, textDecoration: "none" }}>HOME</Link>
            <span style={{ opacity: 0.4 }}>/</span>
            <Link href="/explore" style={{ color: muted, textDecoration: "none" }}>EXPLORE</Link>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: accent }}>{project.title.slice(0, 24).toUpperCase()}{project.title.length > 24 ? "…" : ""}</span>
          </nav>

          {/* title block */}
          <div className="hero-text">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              {project.category && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: accentSoft, border: `1px solid ${accent}30`, fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: accent, letterSpacing: "0.1em" }}>
                  ◆ {project.category.toUpperCase()}
                </span>
              )}
              {(project.daysLeft ?? 0) <= 7 && (project.daysLeft ?? 0) > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#ef4444", letterSpacing: "0.08em" }}>
                  ⏳ ENDING SOON
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(28px,4.5vw,56px)", lineHeight: 1.06, letterSpacing: "-0.03em", color: txt, margin: "0 0 16px", maxWidth: 860 }}>
              {project.title}
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(15px,1.6vw,18px)", color: muted, lineHeight: 1.75, maxWidth: 680, margin: 0 }}>
              {project.shortDescription}
            </p>
          </div>

          {/* creator strip */}
          <div className="hero-text" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24, padding: "14px 18px", borderRadius: 14, background: card2, border: `1px solid ${bdr}`, maxWidth: 420 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `conic-gradient(from 135deg,${accent},#facc15,${accent})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 0 0 3px ${accentSoft}` }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 16, color: "#fff" }}>
                {project.creator?.username?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: muted, margin: "0 0 2px", letterSpacing: "0.12em" }}>CAMPAIGN BY</p>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: txt, margin: 0 }}>@{project.creator?.username}</p>
            </div>
          </div>
        </div>

        {/* ──────────────────────── MAIN GRID ──────────────────────────────── */}
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 24px 100px", display: "grid", gridTemplateColumns: "1fr clamp(300px, 32%, 380px)", gap: 40, alignItems: "start" }}>

          {/* ═══════ LEFT COLUMN ═══════ */}
          <div>
            {/* Gallery */}
            <div className="reveal" style={{ marginBottom: 36, borderRadius: 20, overflow: "hidden", border: `1px solid ${bdr}` }}>
              <ProjectGallery
                images={[...(project.thumbnailUrl ? [project.thumbnailUrl] : []), ...(project.galleryImages ?? [])]}
                videos={project.previewVideos ?? []}
                thumbnail={project.thumbnailUrl}
                isDark={isDark}
              />
            </div>

            {/* Tab bar */}
            <div className="reveal" style={{ display: "flex", gap: 4, marginBottom: 28, background: card2, borderRadius: 14, padding: 4, border: `1px solid ${bdr}` }}>
              {(["story", "rewards", "updates"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "none",
                    background: activeTab === tab ? card : "transparent",
                    color: activeTab === tab ? txt : muted,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: activeTab === tab ? 700 : 500,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: activeTab === tab ? `0 1px 8px rgba(0,0,0,0.12)` : "none",
                    textTransform: "capitalize",
                    letterSpacing: "0.02em",
                  }}
                >
                  {tab === "story" ? "📖 Story" : tab === "rewards" ? "🎁 Rewards" : "📢 Updates"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* ── Story tab ── */}
                {activeTab === "story" && (
                  <div style={{ padding: "32px", borderRadius: 20, background: card, border: `1px solid ${bdr}` }}>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: txt, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ display: "inline-block", width: 4, height: 22, borderRadius: 2, background: accent }} />
                      About this campaign
                    </h2>
                    <div
                      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15.5, color: txt, lineHeight: 1.9, opacity: 0.88 }}
                      dangerouslySetInnerHTML={{ __html: (project.fullDescription ?? "").replace(/\n/g, "<br/>") }}
                    />
                    {(project.storyImages ?? []).length > 0 && (
                      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 20 }}>
                        {project.storyImages.map((img, i) => (
                          <motion.img
                            key={i}
                            src={img}
                            alt={`Story ${i + 1}`}
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            style={{ width: "100%", borderRadius: 14, objectFit: "cover", border: `1px solid ${bdr}` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Rewards tab ── */}
                {activeTab === "rewards" && (
                  <div>
                    {rewards.length === 0 ? (
                      <div style={{ padding: "40px 32px", borderRadius: 20, background: card, border: `1px solid ${bdr}`, textAlign: "center" }}>
                        <p style={{ fontSize: 40, marginBottom: 12 }}>🎁</p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: muted }}>No reward tiers for this campaign.</p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: muted, opacity: 0.6 }}>You can still back this project with any amount.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {rewards.map((r, i) => (
                          <motion.div
                            key={r.id}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                            whileHover={{ y: -3, boxShadow: `0 8px 32px ${accent}18` }}
                            onClick={() => setModal(true)}
                            style={{ padding: "22px 24px", borderRadius: 18, background: card, border: `1px solid ${bdr}`, cursor: "pointer", transition: "box-shadow 0.2s" }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: txt, margin: "0 0 6px" }}>{r.title}</p>
                                {r.description && (
                                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: muted, margin: 0, lineHeight: 1.6 }}>{r.description}</p>
                                )}
                              </div>
                              <div style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 10, background: accentSoft, border: `1px solid ${accent}30` }}>
                                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 16, color: accent }}>₹{r.minimumAmount}+</span>
                              </div>
                            </div>
                            <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'DM Mono', monospace", fontSize: 11, color: accent, letterSpacing: "0.08em" }}>
                              SELECT THIS TIER →
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Updates tab ── */}
                {activeTab === "updates" && (
                  <div style={{ padding: "40px 32px", borderRadius: 20, background: card, border: `1px solid ${bdr}`, textAlign: "center" }}>
                    <p style={{ fontSize: 40, marginBottom: 12 }}>📢</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: muted }}>No updates posted yet.</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: muted, opacity: 0.6 }}>Check back later for campaign news.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ═══════ RIGHT SIDEBAR ═══════ */}
          <div className="sidebar-card" style={{ position: "sticky", top: 88 }}>

            {/* Funding card */}
            <div style={{ padding: "28px 24px", borderRadius: 22, background: card, border: `1px solid ${bdr}`, boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.5)" : "0 8px 40px rgba(0,0,0,0.1)", marginBottom: 16 }}>

              {/* Amount */}
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 38, color: txt, letterSpacing: "-0.04em" }}>
                  {raised}
                </span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: muted, margin: "0 0 18px" }}>
                raised of <strong style={{ color: txt }}>{goal}</strong> goal
              </p>

              {/* Progress */}
              <div style={{ position: "relative", height: 8, borderRadius: 4, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", marginBottom: 8, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                  style={{ position: "absolute", inset: "0 auto 0 0", borderRadius: 4, background: `linear-gradient(90deg,${accent},#ffb300)` }}
                />
              </div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: accent, letterSpacing: "0.1em", margin: "0 0 22px" }}>{pct}% FUNDED</p>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                {[
                  { label: "DAYS LEFT", value: project.daysLeft ?? 0, color: daysColor(project.daysLeft) },
                  { label: "% FUNDED", value: `${pct}%`, color: txt },
                ].map((s) => (
                  <div key={s.label} style={{ padding: "14px 16px", borderRadius: 14, background: card2, border: `1px solid ${bdr}`, textAlign: "center" }}>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 22, color: s.color as string, margin: "0 0 4px" }}>{s.value}</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: muted, margin: 0, letterSpacing: "0.1em" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: `0 8px 32px ${accent}50` }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (!isLoggedIn()) { router.push("/login"); return; }
                  if (myUsername && project?.creator?.username === myUsername) return;
                  setModal(true);
                }}
                style={{
                  width: "100%",
                  padding: "17px",
                  borderRadius: 14,
                  border: "none",
                  background: myUsername && project?.creator?.username === myUsername
                    ? (isDark ? "#2a2a2a" : "#e0e0e0")
                    : `linear-gradient(135deg,${accent} 0%,#ff8c00 100%)`,
                  cursor: myUsername && project?.creator?.username === myUsername ? "not-allowed" : "pointer",
                  color: "#fff",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                  marginBottom: 12,
                }}
              >
                {myUsername && project?.creator?.username === myUsername
                  ? "🚫 Your own campaign"
                  : "❤️ Back this project"}
              </motion.button>

              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: muted, textAlign: "center", letterSpacing: "0.1em", margin: 0 }}>
                DEADLINE · {new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }).toUpperCase()}
              </p>
            </div>

            {/* Rewards quick list (if any) */}
            {rewards.length > 0 && (
              <div style={{ padding: "20px 22px", borderRadius: 18, background: card, border: `1px solid ${bdr}` }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: muted, letterSpacing: "0.12em", margin: "0 0 14px" }}>POPULAR TIERS</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {rewards.slice(0, 3).map((r) => (
                    <motion.button
                      key={r.id}
                      whileHover={{ x: 4 }}
                      onClick={() => { setActiveTab("rewards"); }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 12, background: card2, border: `1px solid ${bdr}`, cursor: "pointer", textAlign: "left" }}
                    >
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: txt, fontWeight: 500 }}>{r.title}</span>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, color: accent, fontWeight: 700, flexShrink: 0 }}>₹{r.minimumAmount}+</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Share strip */}
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              {[
                { label: "Share", icon: "🔗", action: () => {
                    navigator.clipboard?.writeText(window.location.href)
                      .then(() => showToast("Link copied to clipboard!"))
                      .catch(() => showToast("Copy: " + window.location.href));
                  }},
                { label: saved ? "Saved ✓" : "Save", icon: saved ? "🔖" : "🔖", action: () => {
                    try {
                      const key = "cs_saved_projects";
                      const list = JSON.parse(localStorage.getItem(key) ?? "[]") as number[];
                      if (saved) {
                        const updated = list.filter((x) => x !== project!.id);
                        localStorage.setItem(key, JSON.stringify(updated));
                        setSaved(false);
                        showToast("Removed from saved");
                      } else {
                        if (!list.includes(project!.id)) list.push(project!.id);
                        localStorage.setItem(key, JSON.stringify(list));
                        setSaved(true);
                        showToast("Project saved!");
                      }
                    } catch { showToast("Could not save"); }
                  }},
              ].map((b) => (
                <motion.button
                  key={b.label}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={b.action}
                  style={{ flex: 1, padding: "11px", borderRadius: 12, background: card2, border: `1px solid ${bdr}`, color: muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  {b.icon} {b.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back modal */}
      <BackProjectModal
        open={modal}
        onClose={() => setModal(false)}
        projectId={project.id}
        projectTitle={project.title}
        rewards={rewards}
        isDark={isDark}
        goalAmount={project.goalAmount}
        currentAmount={project.currentAmount}
        onSuccess={() => exploreApi.getFullDetails(id).then(setProject).catch(() => {})}
      />
    </div>
  );
}
