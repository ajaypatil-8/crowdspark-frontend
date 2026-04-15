"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/contexts/ThemeContext";
import {
  exploreApi,
  isLoggedIn,
  type ProjectFullDetailsResponse,
  type RewardTierResponse,
} from "@/lib/api";
import ProjectGallery from "@/components/ProjectGallery";
import BackProjectModal from "@/components/BackProjectModal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { isDark } = useTheme();

  const [project, setProject] = useState<ProjectFullDetailsResponse | null>(null);
  const [rewards, setRewards]   = useState<RewardTierResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string | null>(null);
  const [modal,   setModal]     = useState(false);

  const heroRef    = useRef<HTMLDivElement>(null);
  const storyRef   = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [proj, rwds] = await Promise.all([
          exploreApi.getFullDetails(id),
          exploreApi.getRewards(id).catch(() => []),
        ]);
        setProject(proj);
        setRewards(rwds);
      } catch (e: any) {
        setError(e.message ?? "Project not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── GSAP scroll animations ─────────────────────────────────────────────────
  useEffect(() => {
    if (!project) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".proj-hero-item",
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out", delay: 0.15 }
      );
      gsap.fromTo(".proj-sidebar",
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.75, ease: "power3.out", delay: 0.4 }
      );
      gsap.utils.toArray<Element>(".proj-section").forEach((el) => {
        gsap.fromTo(el,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true } }
        );
      });
    });
    return () => ctx.revert();
  }, [project]);

  // ── Theme tokens ───────────────────────────────────────────────────────────
  const bg    = isDark ? "#080808" : "#fafaf8";
  const card  = isDark ? "#0f0f0f" : "#ffffff";
  const bdr   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const txt   = isDark ? "#fff" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const accent = "#ff6b00";

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: `3px solid ${accent}30`, borderTopColor: accent, margin: "0 auto 16px", animation: "spin 0.75s linear infinite" }} />
          <p style={{ fontFamily: "DM Sans, sans-serif", color: muted, fontSize: 14 }}>Loading project…</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 48 }}>😕</p>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: txt }}>Project not found</h1>
        <p style={{ fontFamily: "DM Sans, sans-serif", color: muted, fontSize: 14 }}>{error}</p>
        <Link href="/explore" style={{ padding: "10px 24px", borderRadius: 10, background: accent, color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
          Browse campaigns
        </Link>
      </div>
    );
  }

  const pct = Math.min(project.fundedPercentage ?? 0, 100);
  const raised = (project.currentAmount / 100000).toFixed(1);
  const goal   = (project.goalAmount   / 100000).toFixed(1);

  return (
    <div style={{ minHeight: "100vh", background: bg, paddingTop: 80 }}>

      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "5%", right: "5%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.07) 0%,transparent 65%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "15%", left: "3%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,184,0.05) 0%,transparent 65%)", filter: "blur(55px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "40px 24px 96px" }}>

        {/* Breadcrumb */}
        <div ref={heroRef} style={{ marginBottom: 32 }}>
          <nav className="proj-hero-item" style={{ opacity: 0, display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted }}>
            <Link href="/" style={{ color: muted, textDecoration: "none" }}>Home</Link>
            <span>›</span>
            <Link href="/explore" style={{ color: muted, textDecoration: "none" }}>Explore</Link>
            <span>›</span>
            <span style={{ color: txt }}>{project.title}</span>
          </nav>

          {/* Category tag */}
          {project.category && (
            <span className="proj-hero-item" style={{ opacity: 0, display: "inline-block", padding: "5px 14px", borderRadius: 999, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)", fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 600, color: accent, marginBottom: 14 }}>
              {project.category}
            </span>
          )}

          <h1 className="proj-hero-item" style={{ opacity: 0, fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(26px,4vw,48px)", lineHeight: 1.1, letterSpacing: "-0.03em", color: txt, margin: "0 0 12px" }}>
            {project.title}
          </h1>
          <p className="proj-hero-item" style={{ opacity: 0, fontFamily: "DM Sans, sans-serif", fontSize: "clamp(14px,1.6vw,17px)", color: muted, lineHeight: 1.7, maxWidth: 680 }}>
            {project.shortDescription}
          </p>
        </div>

        {/* Main layout: left content + right sidebar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr min(380px, 34%)", gap: 40, alignItems: "start" }}>

          {/* LEFT */}
          <div>
            {/* Gallery */}
            <div className="proj-hero-item" style={{ opacity: 0, marginBottom: 40 }}>
              <ProjectGallery
                images={[...(project.thumbnailUrl ? [project.thumbnailUrl] : []), ...project.galleryImages]}
                videos={project.previewVideos}
                thumbnail={project.thumbnailUrl}
                isDark={isDark}
              />
            </div>

            {/* Creator info */}
            <div className="proj-section" style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderRadius: 14, background: card, border: `1px solid ${bdr}`, marginBottom: 32 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg,${accent},#ffcc00)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 18, color: "#fff" }}>
                  {project.creator.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: muted, margin: "0 0 2px" }}>Campaign by</p>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: txt, margin: 0 }}>@{project.creator.username}</p>
                {project.creator.about && (
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, margin: "4px 0 0", lineHeight: 1.5 }}>{project.creator.about}</p>
                )}
              </div>
            </div>

            {/* Full story */}
            <div ref={storyRef} className="proj-section" style={{ padding: "28px 32px", borderRadius: 16, background: card, border: `1px solid ${bdr}`, marginBottom: 32 }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: txt, margin: "0 0 18px" }}>
                About this campaign
              </h2>
              <div
                style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: txt, lineHeight: 1.85, whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: project.fullDescription.replace(/\n/g, "<br/>") }}
              />
              {/* Story images */}
              {project.storyImages.length > 0 && (
                <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 16 }}>
                  {project.storyImages.map((img, i) => (
                    <img key={i} src={img} alt={`Story image ${i + 1}`} style={{ width: "100%", borderRadius: 12, objectFit: "cover" }} />
                  ))}
                </div>
              )}
            </div>

            {/* Rewards section */}
            {rewards.length > 0 && (
              <div className="proj-section" style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: txt, margin: "0 0 16px" }}>
                  Reward tiers
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {rewards.map((r) => (
                    <motion.div
                      key={r.id}
                      whileHover={{ y: -2 }}
                      style={{ padding: "20px 22px", borderRadius: 14, background: card, border: `1px solid ${bdr}`, cursor: "pointer" }}
                      onClick={() => setModal(true)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: r.description ? 8 : 0 }}>
                        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: txt }}>{r.title}</span>
                        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, color: accent, flexShrink: 0, marginLeft: 12 }}>₹{r.minimumAmount}+</span>
                      </div>
                      {r.description && (
                        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: muted, margin: 0, lineHeight: 1.6 }}>{r.description}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div ref={sidebarRef} className="proj-sidebar" style={{ opacity: 0, position: "sticky", top: 100 }}>
            <div style={{ padding: "28px 24px", borderRadius: 20, background: card, border: `1px solid ${bdr}` }}>

              {/* Amount raised */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 32, color: txt }}>
                  ₹{raised}L
                </span>
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted, marginLeft: 8 }}>
                  raised of ₹{goal}L
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, borderRadius: 3, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", marginBottom: 20, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.4, ease: "easeOut", delay: 0.6 }}
                  style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg,${accent},#ffcc00)` }}
                />
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: txt, margin: "0 0 2px" }}>{pct}%</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted, margin: 0 }}>funded</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: (project.daysLeft ?? 0) <= 5 ? "#ef4444" : txt, margin: "0 0 2px" }}>
                    {project.daysLeft}
                  </p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted, margin: 0 }}>days left</p>
                </div>
              </div>

              {/* CTA button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!isLoggedIn()) { router.push("/login"); return; }
                  setModal(true);
                }}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 14,
                  background: `linear-gradient(135deg,${accent},#ffcc00)`,
                  border: "none",
                  color: "#fff",
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 4px 24px rgba(255,100,0,0.35)",
                  marginBottom: 12,
                }}
              >
                ❤️ Back this project
              </motion.button>

              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted, textAlign: "center", margin: 0 }}>
                Deadline: {new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
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
        onSuccess={() => {
          // Refresh project data after backing
          exploreApi.getFullDetails(id).then(setProject).catch(() => {});
        }}
      />
    </div>
  );
}
