"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Search, SlidersHorizontal, X, TrendingUp, Sparkles, Flame, ChevronLeft, ChevronRight, Rocket } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { exploreApi, categoryApi, type ProjectFeedResponse, type Category } from "@/lib/api";
import CampaignCard from "@/components/explore/CampaignCard";
import SkeletonCard from "@/components/explore/SkeletonCard";

// ── Ambient orbs ──────────────────────────────────────────────────────────────
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
      { x:0.1,  y:0.15, r:0.38, vx: 0.00022, vy: 0.00016, hue:22,  a: isDark?0.085:0.05  },
      { x:0.85, y:0.65, r:0.32, vx:-0.00018, vy: 0.00020, hue:180, a: isDark?0.07:0.04   },
      { x:0.5,  y:0.05, r:0.24, vx: 0.00016, vy:-0.00022, hue:260, a: isDark?0.06:0.035  },
      { x:0.05, y:0.80, r:0.22, vx: 0.00020, vy:-0.00016, hue:40,  a: isDark?0.055:0.032 },
      { x:0.90, y:0.10, r:0.20, vx:-0.00014, vy: 0.00018, hue:320, a: isDark?0.05:0.03   },
    ];
    const W = () => canvas.offsetWidth, H = () => canvas.offsetHeight;
    let frame = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick); frame++;
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x<-0.15||o.x>1.15) o.vx*=-1;
        if (o.y<-0.15||o.y>1.15) o.vy*=-1;
        const gx=o.x*w, gy=o.y*h, gr=o.r*Math.min(w,h);
        const g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
        g.addColorStop(0, `hsla(${o.hue},80%,${isDark?58:50}%,${o.a})`);
        g.addColorStop(1,"transparent");
        ctx.fillStyle=g;
        ctx.beginPath(); ctx.arc(gx,gy,gr,0,Math.PI*2); ctx.fill();
      });
      const sy=((frame*0.25)%(h+80))-40;
      const sl=ctx.createLinearGradient(0,sy-1,0,sy+1);
      sl.addColorStop(0,"transparent");
      sl.addColorStop(0.5,`rgba(255,145,0,${isDark?0.025:0.012})`);
      sl.addColorStop(1,"transparent");
      ctx.fillStyle=sl; ctx.fillRect(0,sy-1,w,2);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, [isDark]);
  return (
    <canvas ref={ref} style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }}/>
  );
}

// ── Sort options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "NEWEST",      label: "Newest",      icon: <Sparkles size={13}/> },
  { value: "TRENDING",    label: "Trending",    icon: <TrendingUp size={13}/> },
  { value: "MOST_FUNDED", label: "Most Funded", icon: <Flame size={13}/> },
];

// ── Stagger container ─────────────────────────────────────────────────────────
const staggerGrid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const { isDark } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);

  const [query,      setQuery]      = useState("");
  const [category,   setCategory]   = useState<number | undefined>(undefined);
  const [sort,       setSort]       = useState("NEWEST");
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects,   setProjects]   = useState<ProjectFeedResponse[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Colours
  const bg    = isDark ? "#080808"                  : "#f9f9f7";
  const card  = isDark ? "rgba(14,14,14,0.92)"      : "rgba(255,255,255,0.92)";
  const bdr   = isDark ? "rgba(255,255,255,0.07)"   : "rgba(0,0,0,0.07)";
  const txt   = isDark ? "#f0f0f0"                  : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)"   : "rgba(0,0,0,0.42)";
  const secBg = isDark ? "rgba(10,10,10,0.92)"      : "rgba(248,248,246,0.92)";

  // Load categories
  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(() => {});
  }, []);

  // Hero GSAP entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".ex-hero",
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: "power3.out", delay: 0.15 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const fetchProjects = useCallback(async (kw: string, cat: number | undefined, s: string, pg: number) => {
    setLoading(true); setError(null);
    try {
      const res = await exploreApi.search({ keyword: kw || undefined, categoryId: cat, sort: s, page: pg, size: 12 });
      setProjects(res.content);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalElements);
    } catch (e: any) {
      setError(e.message ?? "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search/filter changes
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      fetchProjects(query, category, sort, 0);
    }, 340);
    return () => clearTimeout(debounceRef.current);
  }, [query, category, sort, fetchProjects]);

  // Page change
  useEffect(() => {
    fetchProjects(query, category, sort, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const clearSearch = () => { setQuery(""); setCategory(undefined); setSort("NEWEST"); };

  const hasFilters = query || category !== undefined || sort !== "NEWEST";

  return (
    <div style={{ minHeight: "100vh", background: bg, overflowX: "hidden", paddingTop: 88 }}>
      <AmbientCanvas isDark={isDark} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} style={{ position: "relative", zIndex: 1, padding: "72px 24px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* Live pill */}
          <div className="ex-hero" style={{ opacity: 0, display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px 5px 8px", borderRadius: 999, background: isDark ? "rgba(0,212,184,0.09)" : "rgba(0,212,184,0.07)", border: "1px solid rgba(0,212,184,0.22)", marginBottom: 28 }}>
            <motion.span
              animate={{ scale: [1, 1.45, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#00d4b8", display: "block" }}
            />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 700, color: "#00d4b8", letterSpacing: "0.02em" }}>
              Live campaigns · Updated now
            </span>
          </div>

          {/* Headline */}
          <h1 className="ex-hero" style={{ opacity: 0, fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(38px,5.8vw,70px)", lineHeight: 1.04, letterSpacing: "-0.038em", color: txt, margin: "0 0 20px" }}>
            Discover ideas<br />
            <span style={{ backgroundImage: "linear-gradient(110deg,#ff6b00 0%,#ffcc00 55%,#ff6b00 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              worth backing.
            </span>
          </h1>

          <p className="ex-hero" style={{ opacity: 0, fontFamily: "DM Sans, sans-serif", fontSize: "clamp(15px,1.8vw,18px)", color: muted, lineHeight: 1.8, maxWidth: 500, margin: "0 auto 40px" }}>
            From clean energy to indie music — find the next big thing before everyone else does.
          </p>

          {/* Search bar */}
          <div className="ex-hero" style={{ opacity: 0, position: "relative", maxWidth: 560, margin: "0 auto" }}>
            <motion.div
              animate={{
                boxShadow: searchFocused
                  ? isDark ? "0 0 0 3px rgba(255,107,0,0.25), 0 8px 32px rgba(0,0,0,0.4)" : "0 0 0 3px rgba(255,107,0,0.18), 0 8px 32px rgba(0,0,0,0.1)"
                  : isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)",
              }}
              style={{
                borderRadius: 18,
                border: `1.5px solid ${searchFocused ? "rgba(255,107,0,0.45)" : bdr}`,
                background: isDark ? "rgba(18,18,18,0.9)" : "rgba(255,255,255,0.95)",
                display: "flex", alignItems: "center",
                backdropFilter: "blur(16px)",
                transition: "border-color 0.2s",
                overflow: "hidden",
              }}
            >
              <Search size={17} color={searchFocused ? "#ff6b00" : muted} style={{ margin: "0 0 0 18px", flexShrink: 0, transition: "color 0.2s" }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search campaigns, creators, categories…"
                style={{
                  flex: 1, padding: "16px 14px", border: "none", background: "transparent",
                  color: txt, fontFamily: "DM Sans, sans-serif", fontSize: 15, outline: "none",
                }}
              />
              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                    onClick={() => setQuery("")}
                    style={{ padding: "0 16px", background: "transparent", border: "none", cursor: "pointer", color: muted, display: "flex" }}
                  >
                    <X size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Stats row */}
          <div className="ex-hero" style={{ opacity: 0, display: "flex", gap: 24, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
            {[
              { label: "Live Campaigns", value: totalCount > 0 ? totalCount.toLocaleString("en-IN") : "—" },
              { label: "Categories", value: categories.length.toString() },
              { label: "Updated", value: "Just now" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: txt, margin: 0 }}>{s.value}</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ───────────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 76, zIndex: 40,
        background: isDark ? "rgba(8,8,8,0.88)" : "rgba(249,249,247,0.88)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${bdr}`, borderBottom: `1px solid ${bdr}`,
      }}>
        {/* Sort toggles */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "12px 24px", display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          {/* Sort pills */}
          <div style={{ display: "flex", gap: 6 }}>
            {SORT_OPTIONS.map(o => {
              const active = sort === o.value;
              return (
                <motion.button
                  key={o.value}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSort(o.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 999,
                    border: `1px solid ${active ? "rgba(255,107,0,0.45)" : bdr}`,
                    background: active ? "rgba(255,107,0,0.12)" : "transparent",
                    color: active ? "#ff8800" : muted,
                    fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: active ? 700 : 500,
                    cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap",
                  }}
                >
                  {o.icon}{o.label}
                </motion.button>
              );
            })}
          </div>

          {/* Filter toggle + clear */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearSearch}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                <X size={12} /> Clear
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setShowFilters(f => !f)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 14px", borderRadius: 999,
                border: `1px solid ${showFilters ? "rgba(255,107,0,0.45)" : bdr}`,
                background: showFilters ? "rgba(255,107,0,0.12)" : "transparent",
                color: showFilters ? "#ff8800" : muted,
                fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              }}
            >
              <SlidersHorizontal size={13} /> Filters
            </motion.button>
          </div>
        </div>

        {/* Category pills (collapsible) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden", borderTop: `1px solid ${bdr}` }}
            >
              <div style={{ maxWidth: 1280, margin: "0 auto", padding: "12px 24px 14px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[{ id: undefined, name: "All Categories" }, ...categories].map(cat => {
                  const active = cat.id === category;
                  return (
                    <motion.button
                      key={cat.id ?? "all"}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setCategory(cat.id as number | undefined)}
                      style={{
                        padding: "6px 14px", borderRadius: 999,
                        border: `1px solid ${active ? "rgba(0,212,184,0.45)" : bdr}`,
                        background: active ? "rgba(0,212,184,0.1)" : "transparent",
                        color: active ? "#00d4b8" : muted,
                        fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: active ? 700 : 500,
                        cursor: "pointer", transition: "all 0.16s", whiteSpace: "nowrap",
                      }}
                    >
                      {cat.name}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── GRID ─────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "48px 24px 100px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          {/* Result count */}
          {!loading && !error && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, marginBottom: 28 }}
            >
              Showing <strong style={{ color: txt, fontFamily: "Syne, sans-serif" }}>{projects.length}</strong>
              {totalCount > 0 && <> of <strong style={{ color: txt, fontFamily: "Syne, sans-serif" }}>{totalCount}</strong></>} campaigns
              {category !== undefined && (
                <span> in <strong style={{ color: "#00d4b8" }}>{categories.find(c => c.id === category)?.name}</strong></span>
              )}
            </motion.p>
          )}

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", padding: "80px 0" }}
            >
              <div style={{ width: 72, height: 72, borderRadius: 22, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>
                ⚠️
              </div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: txt, margin: "0 0 8px" }}>Could not load campaigns</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted, marginBottom: 24 }}>{error}</p>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => fetchProjects(query, category, sort, page)}
                style={{ padding: "11px 26px", borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ff9900)", color: "#fff", border: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 18px rgba(255,107,0,0.4)" }}
              >
                Try Again
              </motion.button>
            </motion.div>
          )}

          {/* Skeleton */}
          {loading && !error && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(288px,1fr))", gap: 22 }}>
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} isDark={isDark} />)}
            </div>
          )}

          {/* Cards */}
          {!loading && !error && (
            <AnimatePresence mode="wait">
              {projects.length === 0 ? (
                <motion.div
                  key="empty" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ textAlign: "center", padding: "80px 0" }}
                >
                  <div style={{ width: 80, height: 80, borderRadius: 24, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 38 }}>
                    🔍
                  </div>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: txt, margin: "0 0 10px" }}>No campaigns found</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: muted, margin: "0 0 24px" }}>
                    Try different keywords or browse all categories.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={clearSearch}
                    style={{ padding: "10px 22px", borderRadius: 10, border: `1px solid ${bdr}`, background: "transparent", color: txt, fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}
                  >
                    Clear filters
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key={`grid-${page}-${sort}-${category}`}
                  variants={staggerGrid} initial="hidden" animate="show"
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(288px,1fr))", gap: 22 }}
                >
                  {projects.map(p => (
                    <CampaignCard key={p.id} p={p} isDark={isDark} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* ── PAGINATION ───────────────────────────────────────────────── */}
          {!loading && !error && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 56, flexWrap: "wrap" }}
            >
              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  border: `1px solid ${bdr}`, background: "transparent",
                  color: page === 0 ? muted : txt,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.35 : 1,
                }}
              >
                <ChevronLeft size={16} />
              </motion.button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const active = i === page;
                const show = i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1;
                if (!show) {
                  if (i === 1 && page > 2) return <span key={i} style={{ color: muted, fontSize: 13 }}>…</span>;
                  if (i === totalPages - 2 && page < totalPages - 3) return <span key={i} style={{ color: muted, fontSize: 13 }}>…</span>;
                  return null;
                }
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                    onClick={() => setPage(i)}
                    style={{
                      minWidth: 38, height: 38, padding: "0 6px", borderRadius: 10,
                      border: `1px solid ${active ? "rgba(255,107,0,0.45)" : bdr}`,
                      background: active ? "linear-gradient(135deg,rgba(255,107,0,0.18),rgba(255,180,0,0.12))" : "transparent",
                      color: active ? "#ff8800" : txt,
                      fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: active ? 800 : 500,
                      cursor: "pointer",
                      boxShadow: active ? "0 0 0 1px rgba(255,107,0,0.2)" : "none",
                    }}
                  >
                    {i + 1}
                  </motion.button>
                );
              })}

              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  border: `1px solid ${bdr}`, background: "transparent",
                  color: page === totalPages - 1 ? muted : txt,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: page === totalPages - 1 ? "not-allowed" : "pointer", opacity: page === totalPages - 1 ? 0.35 : 1,
                }}
              >
                <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          )}

          {/* ── CTA BANNER ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginTop: 72, padding: "48px 40px", borderRadius: 28,
              background: isDark
                ? "linear-gradient(135deg,rgba(255,107,0,0.10) 0%,rgba(255,200,0,0.06) 50%,rgba(0,212,184,0.08) 100%)"
                : "linear-gradient(135deg,rgba(255,107,0,0.07) 0%,rgba(255,200,0,0.05) 50%,rgba(0,212,184,0.06) 100%)",
              border: `1px solid ${bdr}`,
              backdropFilter: "blur(12px)",
              textAlign: "center", position: "relative", overflow: "hidden",
            }}
          >
            {/* Decorative orbs */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.15) 0%,transparent 65%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -30, left: -30, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,184,0.12) 0%,transparent 65%)", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,rgba(255,107,0,0.2),rgba(255,200,0,0.15))", border: "1px solid rgba(255,107,0,0.2)", marginBottom: 18 }}>
                <Rocket size={24} color="#ff8800" />
              </div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(20px,2.5vw,26px)", color: txt, margin: "0 0 10px" }}>
                Have an idea worth funding?
              </p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: muted, margin: "0 0 26px", maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
                Launch your own campaign and reach thousands of backers on CrowdSpark-X.
              </p>
              <Link href="/register" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "14px 30px", borderRadius: 14,
                background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
                color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 6px 24px rgba(255,100,0,0.40)",
                letterSpacing: "-0.01em",
              }}>
                <Sparkles size={16} /> Start a Campaign
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
