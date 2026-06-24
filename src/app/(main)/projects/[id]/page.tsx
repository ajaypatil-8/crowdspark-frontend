"use client";
import { useEffect, useRef, useState, useCallback, type CSSProperties, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import FollowButton from "@/components/FollowButton";
import { analyticsApi } from "@/lib/api";
import {
  campaignUpdateApi, exploreApi, isLoggedIn, savedApi,
  type CampaignUpdateResponse, type ProjectFullDetailsResponse, type RewardTierResponse,
} from "@/lib/api";
import ProjectGallery from "@/components/ProjectGallery";
import BackProjectModal from "@/components/BackProjectModal";
import MilestonesTimeline from "@/components/MilestonesTimeline";
import ShareButtons       from "@/components/ShareButtons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ChevronRight, BookOpen, Gift, Bell, Clock, Users, Bookmark, BookmarkCheck, AlertTriangle,
  TrendingUp, Calendar, ArrowLeft, MessageSquare, Star,
} from "lucide-react";
import CommentsTab  from "@/components/CommentsTab";
import ReviewsTab   from "@/components/ReviewsTab";
import { useFundingStream } from "@/hooks/useFundingStream";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

type ProjectTab = "story" | "rewards" | "updates" | "comments" | "reviews";
type ProjectDetails = ProjectFullDetailsResponse & {
  backersCount?: number;
  status?: string;
};

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
  : n >= 1000  ? `₹${(n / 1000).toFixed(0)}K`
  : `₹${n}`;

const daysColor = (d: number | null | undefined) =>
  !d || d <= 3 ? "#ef4444" : d <= 7 ? "#f59e0b" : "#22c55e";

// ── Ambient Canvas ───────────────────────────────────────────────────────────
function AmbientCanvas({ isDark }: { isDark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize(); window.addEventListener("resize", resize);
    type Orb = { x:number; y:number; r:number; vx:number; vy:number; hue:number; a:number };
    const orbs: Orb[] = [
      { x:0.05, y:0.10, r:0.35, vx:0.00020, vy:0.00015, hue:22,  a:isDark?0.07:0.045 },
      { x:0.90, y:0.60, r:0.30, vx:-0.00015,vy:0.00018, hue:200, a:isDark?0.055:0.035},
      { x:0.50, y:0.02, r:0.22, vx:0.00016, vy:-0.0002, hue:260, a:isDark?0.05:0.03  },
    ];
    const W=()=>canvas.offsetWidth, H=()=>canvas.offsetHeight;
    const tick=()=>{
      raf=requestAnimationFrame(tick);
      const w=W(),h=H();
      ctx.clearRect(0,0,w,h);
      orbs.forEach(o=>{
        o.x+=o.vx; o.y+=o.vy;
        if(o.x<-0.15||o.x>1.15)o.vx*=-1;
        if(o.y<-0.15||o.y>1.15)o.vy*=-1;
        const gx=o.x*w,gy=o.y*h,gr=o.r*Math.min(w,h);
        const g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
        g.addColorStop(0,`hsla(${o.hue},80%,${isDark?58:50}%,${o.a})`);
        g.addColorStop(1,"transparent");
        ctx.fillStyle=g;
        ctx.beginPath();ctx.arc(gx,gy,gr,0,Math.PI*2);ctx.fill();
      });
    };
    tick();
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[isDark]);
  return <canvas ref={ref} style={{ position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0 }}/>;
}

// ── Tab button ───────────────────────────────────────────────────────────────
function TabBtn({
  id,
  active,
  label,
  icon,
  onClick,
  txt,
  muted,
  card,
}: {
  id: ProjectTab;
  active: boolean;
  label: string;
  icon: ReactNode;
  onClick: (id: ProjectTab) => void;
  txt: string;
  muted: string;
  card: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick(id)}
      style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        padding: "11px 0", borderRadius: 11, border: "none",
        background: active ? card : "transparent",
        color: active ? txt : muted,
        fontFamily: "Syne, sans-serif", fontWeight: active ? 700 : 500,
        fontSize: 13.5, cursor: "pointer", transition: "all 0.2s",
        boxShadow: active ? (card === "#fff" ? "0 2px 10px rgba(0,0,0,0.08)" : "0 2px 10px rgba(0,0,0,0.3)") : "none",
      }}
    >
      {icon} {label}
    </motion.button>
  );
}

function SkeletonBlock({
  isDark,
  w = "100%",
  h = 14,
  mb = 8,
  style,
}: {
  isDark: boolean;
  w?: string | number;
  h?: number;
  mb?: number;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      style={{ height: h, width: w, borderRadius: 6, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", marginBottom: mb, ...style }}
    />
  );
}

// ── Skeleton loader ──────────────────────────────────────────────────────────
function PageSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#080808" : "#f9f9f7", paddingTop: 88 }}>
      <AmbientCanvas isDark={isDark} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr clamp(300px,30%,370px)", gap: 40 }}>
        <div>
          <SkeletonBlock isDark={isDark} h={12} w="30%" mb={24} />
          <SkeletonBlock isDark={isDark} h={56} mb={12} />
          <SkeletonBlock isDark={isDark} h={56} w="70%" mb={20} />
          <SkeletonBlock isDark={isDark} h={18} mb={8} />
          <SkeletonBlock isDark={isDark} h={18} w="80%" mb={32} />
          <SkeletonBlock isDark={isDark} h={300} mb={0} style={{ borderRadius: 20 }} />
        </div>
        <div>
          <SkeletonBlock isDark={isDark} h={320} style={{ borderRadius: 22 }} />
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = Number(params.id);
  const { isDark } = useTheme();

  const [project, setProject]  = useState<ProjectDetails | null>(null);
  const [loading, setLoading]  = useState(true);
  const [error,   setError]    = useState<string | null>(null);
  const [modal,   setModal]    = useState(false);
  const [activeTab, setActiveTab] = useState<ProjectTab>("story");
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [toast,   setToast]    = useState<string | null>(null);
  const [saved,   setSaved]    = useState(false);
  const [updates, setUpdates] = useState<CampaignUpdateResponse[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  const mainRef     = useRef<HTMLDivElement>(null);
  const toastTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { authApi: auth, isLoggedIn: loggedIn } = await import("@/lib/api");
        const logged = loggedIn();
        const [proj] = await Promise.all([
          exploreApi.getFullDetails(id),
          logged
            ? auth.me().then(u => {
                setMyUsername(u.username);
                setMyUserId(u.id);
              }).catch(() => {})
            : Promise.resolve(),
          logged
            ? savedApi.checkSaved(Number(id))
                .then(data => setSaved(data.saved))
                .catch(() => {})
            : Promise.resolve(),
        ]);
        setProject(proj);
        analyticsApi.trackView(Number(id)); 
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Project not found");
      } finally { setLoading(false); }
    })();
  }, [id]);

  useEffect(() => {
    if (activeTab === "updates" && project) {
      setUpdatesLoading(true);
      campaignUpdateApi.getUpdates(project.id)
        .then(setUpdates)
        .catch(() => setUpdates([]))
        .finally(() => setUpdatesLoading(false));
    }
  }, [activeTab, project]);

  useEffect(() => {
    if (!project) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".hero-text > *",
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.95, ease: "power3.out", delay: 0.12 }
      );
      gsap.fromTo(".sidebar-card",
        { x: 36, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.3 }
      );
      gsap.utils.toArray<Element>(".reveal").forEach(el => {
        gsap.fromTo(el, { y: 30, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    }, mainRef);
    return () => ctx.revert();
  }, [project]);

  // Tokens
  const bg     = isDark ? "#080808"                 : "#f9f9f7";
  const card   = isDark ? "#0e0e0e"                 : "#ffffff";
  const card2  = isDark ? "#141414"                 : "#f2f2f0";
  const bdr    = isDark ? "rgba(255,255,255,0.07)"  : "rgba(0,0,0,0.07)";
  const txt    = isDark ? "#f0f0f0"                 : "#0a0a0a";
  const muted  = isDark ? "rgba(255,255,255,0.42)"  : "rgba(0,0,0,0.42)";
  const accent = "#ff5c00";
  const accentSoft = isDark ? "rgba(255,92,0,0.12)" : "rgba(255,92,0,0.09)";

  // ── CHANGE 2: SSE live funding stream ────────────────────────────────────────
  // Hook MUST be called unconditionally (before early returns) — React rules of hooks.
  // When project is null (loading), enabled=false so no SSE connection opens yet.
  const funding = useFundingStream(
    project?.id ?? 0,
    {
      projectId:        project?.id        ?? 0,
      currentAmount:    project?.currentAmount    ?? 0,
      goalAmount:       project?.goalAmount       ?? 0,
      fundedPercentage: project?.fundedPercentage ?? 0,
      backersCount:     project?.backersCount ?? 0,
      status:           project?.status ?? "APPROVED",
      timestamp:        Date.now(),
    },
    // Only stream for active campaigns — no point opening SSE for FAILED/CLOSED
    !!project && ["APPROVED"].includes(project.status ?? "APPROVED")
  );

  if (loading) return <PageSkeleton isDark={isDark} />;

  if (error || !project) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, paddingTop: 88, position: "relative" }}>
        <AmbientCanvas isDark={isDark} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: accentSoft, border: `1px solid ${accent}25`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <AlertTriangle size={36} color={accent} />
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 28, color: txt, margin: "0 0 10px" }}>Project not found</h1>
          {error && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted, maxWidth: 340, margin: "0 auto 24px", lineHeight: 1.7 }}>{error}</p>}
          <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, background: `linear-gradient(135deg,${accent},#ff9900)`, color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 20px rgba(255,92,0,0.35)" }}>
            <ArrowLeft size={16} /> Browse campaigns
          </Link>
        </div>
      </div>
    );
  }

  // Derive display values from live SSE data instead of static project snapshot
  const pct     = Math.min(funding.fundedPercentage, 100);
  const raised  = fmt(funding.currentAmount);
  const goal    = fmt(funding.goalAmount);
  const rewards: RewardTierResponse[] = project.rewards ?? [];
  const isOwner = !!(myUsername && project.creator?.username === myUsername);

  return (
    <div ref={mainRef} style={{ minHeight: "100vh", background: bg, paddingTop: 80 }}>
      {/* ── CHANGE 5 (CSS): keyframe for the live-pulse dot ── */}
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

      <AmbientCanvas isDark={isDark} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            style={{
              position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
              zIndex: 9999, padding: "12px 22px", borderRadius: 14,
              background: isDark ? "#141414" : "#fff",
              border: `1px solid ${accent}35`,
              boxShadow: `0 12px 36px rgba(0,0,0,0.25), 0 0 0 1px ${accent}18`,
              fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600, color: txt,
              display: "flex", alignItems: "center", gap: 9, whiteSpace: "nowrap",
              backdropFilter: "blur(12px)",
            }}
          >
            <span style={{ color: accent, fontSize: 16 }}>✓</span> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO AREA ──────────────────────────────────────────────────── */}
        <div className="pd-hero-wrap" style={{ maxWidth: 1180, margin: "0 auto", padding: "30px 24px 0" }}>

          {/* Breadcrumb */}
          <nav className="hero-text" style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "DM Mono, monospace", fontSize: 10.5, color: muted, letterSpacing: "0.1em", marginBottom: 26 }}>
            <Link href="/" style={{ color: muted, textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => (e.currentTarget.style.color = txt)} onMouseLeave={e => (e.currentTarget.style.color = muted)}>HOME</Link>
            <ChevronRight size={12} style={{ opacity: 0.4 }} />
            <Link href="/explore" style={{ color: muted, textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => (e.currentTarget.style.color = txt)} onMouseLeave={e => (e.currentTarget.style.color = muted)}>EXPLORE</Link>
            <ChevronRight size={12} style={{ opacity: 0.4 }} />
            <span style={{ color: accent }}>{project.title.slice(0, 28).toUpperCase()}{project.title.length > 28 ? "…" : ""}</span>
          </nav>

          {/* Title block */}
          <div className="hero-text">
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {project.category && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999, background: accentSoft, border: `1px solid ${accent}28`, fontFamily: "DM Mono, monospace", fontSize: 11, fontWeight: 600, color: accent, letterSpacing: "0.1em" }}>
                  ◆ {project.category.toUpperCase()}
                </span>
              )}
              {(project.daysLeft ?? 0) <= 7 && (project.daysLeft ?? 0) > 0 && (
                <motion.span
                  animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)", fontFamily: "DM Mono, monospace", fontSize: 11, color: "#ef4444", letterSpacing: "0.08em" }}
                >
                  <Clock size={11} /> ENDING SOON
                </motion.span>
              )}
              {pct >= 100 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", fontFamily: "DM Mono, monospace", fontSize: 11, color: "#22c55e", letterSpacing: "0.08em" }}>
                  🏆 FULLY FUNDED
                </span>
              )}
            </div>

            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(28px,4.5vw,58px)", lineHeight: 1.06, letterSpacing: "-0.033em", color: txt, margin: "0 0 18px", maxWidth: 860 }}>
              {project.title}
            </h1>

            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "clamp(15px,1.6vw,18px)", color: muted, lineHeight: 1.8, maxWidth: 700, margin: 0 }}>
              {project.shortDescription}
            </p>
          </div>

          {/* Creator strip */}
          <div className="hero-text pd-creator-strip" style={{ display: "inline-flex", alignItems: "center", gap: 12, marginTop: 24, padding: "12px 18px", borderRadius: 16, background: card2, border: `1px solid ${bdr}` }}>
            {project.creator?.profileImage ? (
              <img src={project.creator.profileImage} alt={project.creator.username} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: `2px solid ${accent}30` }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `conic-gradient(from 120deg,${accent},#facc15,${accent})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 0 0 3px ${accentSoft}` }}>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 16, color: "#fff" }}>
                  {project.creator?.username?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            <div>
              <p style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: muted, margin: "0 0 2px", letterSpacing: "0.12em" }}>CAMPAIGN BY</p>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: txt, margin: 0 }}>@{project.creator?.username}</p>
            </div>
            {project.creator?.about && (
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, margin: 0, maxWidth: 220, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", borderLeft: `1px solid ${bdr}`, paddingLeft: 12 }}>
                {project.creator.about}
              </p>
            )}
          </div>
        </div>

        {/* ── MAIN GRID ────────────────────────────────────────────────── */}
        <div className="pd-detail-grid" style={{
          maxWidth: 1180, margin: "0 auto",
          padding: "32px 24px 96px",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) 340px",
          gap: 32, alignItems: "start",
        }}>

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="pd-main-column" style={{ minWidth: 0 }}>
            {/* Gallery */}
            <div className="reveal" style={{ marginBottom: 28, borderRadius: 20, overflow: "hidden", border: `1px solid ${bdr}`, boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.34)" : "0 16px 44px rgba(0,0,0,0.08)" }}>
              <ProjectGallery
                images={[...(project.thumbnailUrl ? [project.thumbnailUrl] : []), ...(project.galleryImages ?? [])]}
                videos={project.previewVideos ?? []}
                thumbnail={project.thumbnailUrl}
                isDark={isDark}
              />
            </div>

            {/* Quick stats strip */}
            <div className="reveal pd-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 26 }}>
              {[
                { icon: <TrendingUp size={15} color={accent} />, label: "Funded", value: `${pct}%` },
                // ── CHANGE 3: backers count from live SSE data ────────────────
                { icon: <Users size={15} color="#00d4b8" />, label: "Backers",
                  value: funding.backersCount.toLocaleString("en-IN") },
                { icon: <Calendar size={15} color="#818cf8" />, label: "Days Left", value: String(project.daysLeft ?? 0), color: daysColor(project.daysLeft) },
              ].map(s => (
                <div key={s.label} style={{ padding: "16px", borderRadius: 16, background: card, border: `1px solid ${bdr}`, textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{s.icon}</div>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 20, color: s.color ?? txt, margin: "0 0 3px" }}>{s.value}</p>
                  <p style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: muted, margin: 0, letterSpacing: "0.1em" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tab bar */}
            <div className="reveal pd-tab-bar" style={{ display: "flex", gap: 4, marginBottom: 20, background: card2, borderRadius: 16, padding: 5, border: `1px solid ${bdr}` }}>
              <TabBtn id="story"   active={activeTab === "story"}   label="Story"   icon={<BookOpen size={14}/>}  onClick={setActiveTab} {...{txt,muted,card}} />
              <TabBtn id="rewards" active={activeTab === "rewards"} label="Rewards" icon={<Gift size={14}/>}      onClick={setActiveTab} {...{txt,muted,card}} />
              <TabBtn id="updates" active={activeTab === "updates"} label="Updates" icon={<Bell size={14}/>}      onClick={setActiveTab} {...{txt,muted,card}} />
              <TabBtn id ="comments" active={activeTab === "comments"} label="Q&A"     icon={<MessageSquare size={14}/>} onClick={setActiveTab} {...{txt,muted,card}} />
              <TabBtn id ="reviews"  active={activeTab === "reviews"}  label="Reviews" icon={<Star size={14}/>}          onClick={setActiveTab} {...{txt,muted,card}} />
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* ── Story ── */}
                {activeTab === "story" && (
                  <div style={{ padding: "28px", borderRadius: 20, background: card, border: `1px solid ${bdr}`, boxShadow: isDark ? "0 18px 54px rgba(0,0,0,0.28)" : "0 10px 34px rgba(0,0,0,0.06)" }}>
                    <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 22, color: txt, margin: "0 0 22px", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ display: "inline-block", width: 4, height: 22, borderRadius: 2, background: `linear-gradient(to bottom,${accent},#ffb300)` }} />
                      About this campaign
                    </h2>
                    <div
                      style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15.5, color: txt, lineHeight: 1.92, opacity: 0.88 }}
                      dangerouslySetInnerHTML={{ __html: (project.fullDescription ?? "").replace(/\n/g, "<br/>") }}
                    />
                    {(project.storyImages ?? []).length > 0 && (
                      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 20 }}>
                        {project.storyImages.map((img, i) => (
                          <motion.img
                            key={i} src={img} alt={`Story ${i + 1}`}
                            initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }} transition={{ duration: 0.5 }}
                            style={{ width: "100%", borderRadius: 16, objectFit: "cover", border: `1px solid ${bdr}` }}
                          />
                        ))}
                      </div>
                    )}

                                  {/* ── Milestones ── */}
                        <div style={{ marginTop: 34 }}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
                          }}>
                            <div style={{
                              width: 3, height: 18, borderRadius: 2,
                              background: "linear-gradient(to bottom,#ff5c00,#ff9000)",
                            }} />
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: txt, margin: 0 }}>
                              Project Milestones
                            </h3>
                          </div>
                          <MilestonesTimeline
                            projectId={project.id}
                            isDark={isDark}
                            goalAmount={project.goalAmount}
                          />
                        </div>


                    {/* Deadline callout */}
                    <div style={{ marginTop: 32, padding: "18px 20px", borderRadius: 16, background: card2, border: `1px solid ${bdr}`, display: "flex", alignItems: "center", gap: 12 }}>
                      <Calendar size={18} color={accent} />
                      <div>
                        <p style={{ fontFamily: "DM Mono, monospace", fontSize: 10.5, color: muted, margin: "0 0 2px", letterSpacing: "0.1em" }}>CAMPAIGN DEADLINE</p>
                        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: txt, margin: 0 }}>
                          {new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div style={{ marginLeft: "auto" }}>
                        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: daysColor(project.daysLeft) }}>
                          {project.daysLeft ?? 0}d left
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Rewards ── */}
                {activeTab === "rewards" && (
                  <div>
                    {rewards.length === 0 ? (
                      <div style={{ padding: "48px 32px", borderRadius: 22, background: card, border: `1px solid ${bdr}`, textAlign: "center" }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: accentSoft, border: `1px solid ${accent}20`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                          <Gift size={28} color={accent} />
                        </div>
                        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, color: txt, margin: "0 0 8px" }}>No reward tiers</p>
                        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: muted, margin: 0, lineHeight: 1.7 }}>You can still back this project with any amount.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {rewards.map((r, i) => (
                          <motion.div
                            key={r.id}
                            initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ y: -4, boxShadow: isDark ? `0 12px 36px rgba(0,0,0,0.5), 0 0 0 1px ${accent}20` : `0 12px 36px rgba(0,0,0,0.1), 0 0 0 1px ${accent}15` }}
                            onClick={() => setModal(true)}
                            style={{ padding: "24px", borderRadius: 20, background: card, border: `1px solid ${bdr}`, cursor: "pointer", transition: "box-shadow 0.2s" }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: muted, background: card2, border: `1px solid ${bdr}`, padding: "2px 7px", borderRadius: 5, letterSpacing: "0.08em" }}>TIER {i + 1}</span>
                                </div>
                                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: txt, margin: "0 0 8px" }}>{r.title}</p>
                                {r.description && (
                                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted, margin: 0, lineHeight: 1.65 }}>{r.description}</p>
                                )}
                              </div>
                              <div style={{ flexShrink: 0, padding: "10px 16px", borderRadius: 12, background: accentSoft, border: `1px solid ${accent}28`, textAlign: "center" }}>
                                <p style={{ fontFamily: "DM Mono, monospace", fontSize: 9.5, color: accent, margin: "0 0 2px", letterSpacing: "0.1em" }}>PLEDGE</p>
                                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 18, color: accent, margin: 0 }}>₹{r.minimumAmount}+</p>
                              </div>
                            </div>
                            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${bdr}`, display: "flex", alignItems: "center", gap: 6, fontFamily: "DM Mono, monospace", fontSize: 11, color: accent, letterSpacing: "0.08em" }}>
                              SELECT THIS REWARD →
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Updates ── */}
                {activeTab === "updates" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {updatesLoading ? (
                      [0,1,2].map(i => (
                        <div key={`uskel-${i}`} style={{
                          padding: "24px", borderRadius: 18,
                          background: card, border: `1px solid ${bdr}`,
                          animation: "pulse 1.5s ease-in-out infinite"
                        }}>
                          <div style={{ height: 16, width: "40%", borderRadius: 8,
                            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                            marginBottom: 12 }} />
                          <div style={{ height: 12, width: "90%", borderRadius: 8,
                            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                            marginBottom: 8 }} />
                          <div style={{ height: 12, width: "75%", borderRadius: 8,
                            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
                        </div>
                      ))
                    ) : updates.length === 0 ? (
                      <div style={{
                        padding: "48px 32px", borderRadius: 22,
                        background: card, border: `1px solid ${bdr}`,
                        textAlign: "center"
                      }}>
                        <div style={{
                          width: 64, height: 64, borderRadius: 18,
                          background: "rgba(99,102,241,0.1)",
                          border: "1px solid rgba(99,102,241,0.22)",
                          display: "flex", alignItems: "center",
                          justifyContent: "center", margin: "0 auto 16px"
                        }}>
                          <Bell size={26} color="#818cf8" />
                        </div>
                        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700,
                          fontSize: 17, color: txt, margin: "0 0 8px" }}>
                          No updates yet
                        </p>
                        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
                          color: muted, margin: 0, lineHeight: 1.7 }}>
                          The creator hasn&apos;t posted any updates yet. Check back later!
                        </p>
                      </div>
                    ) : (
                      updates.map((u, i) => (
                        <motion.div
                          key={u.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          style={{
                            padding: "24px 28px", borderRadius: 20,
                            background: card, border: `1px solid ${bdr}`,
                          }}
                        >
                          {/* Header */}
                          <div style={{ display: "flex", alignItems: "center",
                            gap: 10, marginBottom: 14 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: "50%",
                              background: "linear-gradient(135deg,#ff5c00,#ff9900)",
                              display: "flex", alignItems: "center",
                              justifyContent: "center", flexShrink: 0,
                              overflow: "hidden"
                            }}>
                              {u.authorProfileImage ? (
                                <img src={u.authorProfileImage} alt={u.authorUsername}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <span style={{ fontFamily: "Syne, sans-serif",
                                  fontWeight: 800, fontSize: 14, color: "#fff" }}>
                                  {u.authorUsername?.[0]?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700,
                                fontSize: 13, color: txt, margin: 0 }}>
                                {u.authorUsername}
                              </p>
                              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5,
                                color: muted, margin: 0 }}>
                                {new Date(u.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "long", year: "numeric"
                                })}
                                {u.updatedAt && u.updatedAt !== u.createdAt && " (edited)"}
                              </p>
                            </div>
                            <span style={{
                              fontFamily: "DM Mono, monospace", fontSize: 11,
                              color: muted, background: isDark
                                ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                              padding: "3px 9px", borderRadius: 8
                            }}>
                              Update #{updates.length - i}
                            </span>
                          </div>

                          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800,
                            fontSize: 17, color: txt, margin: "0 0 10px", lineHeight: 1.3 }}>
                            {u.title}
                          </h3>

                          {u.imageUrl && (
                            <div style={{ borderRadius: 14, overflow: "hidden",
                              marginBottom: 14, maxHeight: 320 }}>
                              <img src={u.imageUrl} alt={u.title}
                                style={{ width: "100%", objectFit: "cover",
                                  maxHeight: 320, display: "block" }} />
                            </div>
                          )}

                          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5,
                            color: muted, margin: 0, lineHeight: 1.75,
                            whiteSpace: "pre-wrap" }}>
                            {u.content}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "comments" && (
                  <CommentsTab
                    projectId={project.id}
                    creatorId={project.creator.id}
                    isDark={isDark}
                    myUserId={myUserId}
                  />
                )}

                {activeTab === "reviews" && (
                  <ReviewsTab
                    projectId={project.id}
                    isDark={isDark}
                    myUserId={myUserId}
                  />
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* ═══ RIGHT SIDEBAR ═══ */}
          <div className="sidebar-card pd-sidebar" style={{ position: "sticky", top: 88, display: "flex", flexDirection: "column", gap: 12, maxHeight: "calc(100vh - 104px)", overflowY: "auto", paddingRight: 2 }}>

            {/* Funding card */}
            <div style={{
              padding: "24px 22px", borderRadius: 22,
              background: card, border: `1px solid ${bdr}`,
              boxShadow: isDark ? "0 24px 62px rgba(0,0,0,0.45)" : "0 10px 38px rgba(0,0,0,0.08)",
            }}>
              {/* Raised amount */}
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(30px,3vw,38px)", color: txt, letterSpacing: "-0.035em" }}>{raised}</span>
              </div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: muted, margin: "0 0 20px" }}>
                raised of <strong style={{ color: txt }}>{goal}</strong> goal
              </p>

              {/* Progress bar */}
              <div style={{ position: "relative", height: 9, borderRadius: 5, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", marginBottom: 8, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                  style={{ position: "absolute", inset: "0 auto 0 0", borderRadius: 5, background: `linear-gradient(90deg,${accent},#ffb300)`, boxShadow: `0 0 10px ${accent}60` }}
                />
              </div>

              {/* ── CHANGE 5: % FUNDED label with live green pulse dot ────────── */}
              <p style={{ fontFamily: "DM Mono, monospace", fontSize: 11,
                          color: accent, letterSpacing: "0.1em", margin: "0 0 22px",
                          display: "flex", alignItems: "center", gap: 6 }}>
                {pct}% FUNDED
                {["APPROVED"].includes(project.status ?? "") && (
                  <span
                    title="Live funding updates active"
                    style={{
                      display: "inline-block", width: 7, height: 7,
                      borderRadius: "50%", background: "#22c55e",
                      boxShadow: "0 0 0 2px rgba(34,197,94,0.25)",
                      animation: "livePulse 2s ease-in-out infinite",
                    }}
                  />
                )}
              </p>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 18 }}>
                {[
                  { label: "DAYS LEFT", value: project.daysLeft ?? 0, color: daysColor(project.daysLeft) },
                  { label: "% FUNDED",  value: `${pct}%`, color: txt },
                ].map(s => (
                  <div key={s.label} style={{ padding: "14px 16px", borderRadius: 14, background: card2, border: `1px solid ${bdr}`, textAlign: "center" }}>
                    <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 22, color: s.color as string, margin: "0 0 4px" }}>{s.value}</p>
                    <p style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: muted, margin: 0, letterSpacing: "0.1em" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                whileHover={!isOwner ? { scale: 1.02, boxShadow: `0 10px 36px ${accent}55` } : {}}
                whileTap={!isOwner ? { scale: 0.97 } : {}}
                onClick={() => {
                  if (!isLoggedIn()) { router.push("/login"); return; }
                  if (isOwner) return;
                  setModal(true);
                }}
                style={{
                  width: "100%", padding: "17px", borderRadius: 16, border: "none",
                  background: isOwner
                    ? (isDark ? "#1e1e1e" : "#e5e5e5")
                    : `linear-gradient(135deg,${accent} 0%,#ff9000 100%)`,
                  cursor: isOwner ? "not-allowed" : "pointer",
                  color: isOwner ? muted : "#fff",
                  fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 16,
                  letterSpacing: "0.01em", marginBottom: 12,
                  transition: "background 0.2s",
                }}
              >
                {isOwner ? "Your own campaign" : "Back this project"}
              </motion.button>

              <p style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: muted, textAlign: "center", letterSpacing: "0.1em", margin: 0 }}>
                DEADLINE · {new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }).toUpperCase()}
              </p>
            </div>

            {/* Rewards quick list */}
            {rewards.length > 0 && (
              <div style={{ padding: "18px", borderRadius: 18, background: card, border: `1px solid ${bdr}` }}>
                <p style={{ fontFamily: "DM Mono, monospace", fontSize: 10.5, color: muted, letterSpacing: "0.12em", margin: "0 0 14px", textTransform: "uppercase" }}>Popular Tiers</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {rewards.slice(0, 3).map(r => (
                    <motion.button
                      key={r.id}
                      whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveTab("rewards")}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderRadius: 12, background: card2, border: `1px solid ${bdr}`, cursor: "pointer", textAlign: "left" }}
                    >
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: txt, fontWeight: 500 }}>{r.title}</span>
                      <span style={{ fontFamily: "Syne, sans-serif", fontSize: 13, color: accent, fontWeight: 800, flexShrink: 0, background: accentSoft, padding: "2px 8px", borderRadius: 6 }}>₹{r.minimumAmount}+</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Share / Save */}
            <div style={{ display: "flex", gap: 8 }}>

              {/* ── Share — full platform popover ── */}
              <ShareButtons
                title={project.title}
                description={project.shortDescription}
                isDark={isDark}
                onShare={(platform) => {
                  // optional: fire analytics event here
                  console.log("Shared via", platform);
                }}
              />

              {/* ── Save / Bookmark ── */}
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  try {
                    savedApi.toggle(project.id)
                      .then(data => {
                        setSaved(data.saved);
                        showToast(data.saved ? "Project saved! ✓" : "Removed from saved");
                      })
                      .catch(() => showToast("Please sign in to save projects"));
                  } catch { showToast("Could not save"); }
                }}
                style={{
                  flex: 1, padding: "11px 16px", borderRadius: 14,
                  background: card, border: `1px solid ${bdr}`,
                  color: saved ? accent : muted,
                  fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}
              >
                {saved
                  ? <BookmarkCheck size={14} color={accent} />
                  : <Bookmark size={14} />}
                {saved ? "Saved" : "Save"}
              </motion.button>
            </div>


            {/* Creator card */}
            <div style={{ padding: "18px", borderRadius: 18, background: card, border: `1px solid ${bdr}` }}>
              <p style={{ fontFamily: "DM Mono, monospace", fontSize: 10.5, color: muted, letterSpacing: "0.12em", margin: "0 0 14px", textTransform: "uppercase" }}>About the Creator</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: project.creator?.about ? 12 : 0 }}>
                {/* Avatar: show profile photo if available, otherwise letter avatar */}
                {project.creator?.profileImage ? (
                  <img
                    src={project.creator.profileImage}
                    alt={project.creator.username}
                    style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `conic-gradient(from 120deg,${accent},#facc15,${accent})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 18, color: "#fff" }}>{project.creator?.username?.charAt(0)?.toUpperCase()}</span>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: txt, margin: "0 0 2px" }}>@{project.creator?.username}</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted, margin: 0 }}>Campaign Creator</p>
                </div>

                {/* Follow button — always visible, outside the avatar conditional */}
                {myUsername !== project.creator?.username && project.creator?.id && (
                  <div style={{ marginLeft: "auto" }}>
                    <FollowButton
                      targetUserId={project.creator.id}
                      isDark={isDark}
                      isLoggedIn={!!myUsername}
                      size="sm"
                    />
                  </div>
                )}
              </div>
              {project.creator?.about && (
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, margin: 0, lineHeight: 1.65 }}>{project.creator.about}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Back modal */}
      {/* ── CHANGE 4: onSuccess keeps full re-fetch (SSE handles the bar live) ── */}
      <BackProjectModal
        open={modal} onClose={() => setModal(false)}
        projectId={project.id} projectTitle={project.title}
        rewards={rewards} isDark={isDark}
        goalAmount={project.goalAmount} currentAmount={project.currentAmount}
        onSuccess={() => {
          exploreApi.getFullDetails(id).then(setProject).catch(() => {});
        }}
      />
    </div>
  );
}
