"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { easeOut } from "framer-motion";
import { staggerContainer, cardItem } from "@/animations/variants";
import gsap from "gsap";
import { useTheme } from "@/contexts/ThemeContext";
import { exploreApi, categoryApi, type ProjectFeedResponse, type Category } from "@/lib/api";

const SORT_OPTIONS = [
  { value: "NEWEST",      label: "Newest" },
  { value: "TRENDING",    label: "Trending" },
  { value: "MOST_FUNDED", label: "Most funded" },
];

function SkeletonCard({ bdr, card }: { bdr: string; card: string }) {
  return (
    <div style={{ borderRadius: 20, overflow: "hidden", background: card, border: `1px solid ${bdr}` }}>
      <div style={{ height: 148, background: "rgba(128,128,128,0.08)", animation: "shimmer 1.4s infinite" }} />
      <div style={{ padding: "16px 16px 18px" }}>
        {[80, 100, 60].map((w, i) => (
          <div key={i} style={{ height: 12, borderRadius: 6, background: "rgba(128,128,128,0.1)", width: `${w}%`, marginBottom: 10, animation: "shimmer 1.4s infinite" }} />
        ))}
      </div>
    </div>
  );
}

function CampaignCard({ p, isDark, bdr, card, txt, muted }: {
  p: ProjectFeedResponse; isDark: boolean;
  bdr: string; card: string; txt: string; muted: string;
}) {
  const pct = Math.min(p.fundedPercentage ?? 0, 100);
  const accent = "#00d4b8";

  return (
    <motion.article
      layout
      variants={cardItem}
      whileHover={{ y: -6, boxShadow: isDark ? "0 20px 48px rgba(0,0,0,0.45)" : "0 20px 48px rgba(0,0,0,0.1)" }}
      style={{ borderRadius: 20, overflow: "hidden", background: card, border: `1px solid ${bdr}`, cursor: "pointer", transition: "box-shadow 0.22s" }}
    >
      <div style={{ height: 148, background: p.thumbnailUrl ? "transparent" : `linear-gradient(135deg,${accent}20,${accent}08)`, borderBottom: `1px solid ${bdr}`, position: "relative", overflow: "hidden" }}>
        {p.thumbnailUrl
          ? <img src={p.thumbnailUrl} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 15, color: accent, opacity: 0.22, textAlign: "center", padding: "0 16px" }}>{p.title}</span>
            </div>
        }
        <div style={{ position: "absolute", top: 10, left: 10, padding: "4px 9px", borderRadius: 999, background: isDark ? `${accent}1a` : `${accent}14`, border: `1px solid ${accent}30`, fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 600, color: accent }}>
          {p.category}
        </div>
      </div>

      <Link href={`/projects/${p.id}`} style={{ textDecoration: "none" }}>
        <div style={{ padding: "16px 16px 18px" }}>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: txt, margin: "0 0 6px", lineHeight: 1.3 }}>{p.title}</h3>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, lineHeight: 1.6, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {p.shortDescription}
          </p>

          <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
            style={{ height: 4, borderRadius: 2, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", marginBottom: 8, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: easeOut, delay: 0.2 }}
              style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${accent},${accent}88)` }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: txt }}>
              ₹{((p.currentAmount ?? 0) / 100000).toFixed(1)}L
            </span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: accent }}>{pct}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted }}>{(p.backersCount ?? 0).toLocaleString("en-IN")} backers</span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: (p.daysLeft ?? 0) <= 5 ? "#ef4444" : muted, fontWeight: (p.daysLeft ?? 0) <= 5 ? 700 : 400 }}>
              {p.daysLeft ?? 0}d left
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function ExplorePage() {
  const { isDark } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);

  const [query,     setQuery]     = useState("");
  const [category,  setCategory]  = useState<number | undefined>(undefined);
  const [sort,      setSort]      = useState("NEWEST");
  const [categories,setCategories]= useState<Category[]>([]);
  const [projects,  setProjects]  = useState<ProjectFeedResponse[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [page,      setPage]      = useState(0);
  const [totalPages,setTotalPages]= useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".ex-hero-item",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.85, ease: "power3.out", delay: 0.2 }
      );
    });
    return () => ctx.revert();
  }, []);

  const fetchProjects = useCallback(async (kw: string, cat: number | undefined, s: string, pg: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await exploreApi.search({ keyword: kw || undefined, categoryId: cat, sort: s, page: pg, size: 12 });
      setProjects(res.content);
      setTotalPages(res.totalPages);
    } catch (e: any) {
      setError(e.message ?? "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      fetchProjects(query, category, sort, 0);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, category, sort, fetchProjects]);

  useEffect(() => {
    fetchProjects(query, category, sort, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const bg    = isDark ? "#080808" : "#fafaf8";
  const card  = isDark ? "#0f0f0f" : "#ffffff";
  const bdr   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const txt   = isDark ? "#fff" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const secBg = isDark ? "#0c0c0c" : "#f4f4f2";

  return (
    <div style={{ minHeight: "100vh", background: bg, overflowX: "hidden", paddingTop: 92 }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "5%", right: "5%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,245,212,0.06) 0%,transparent 65%)", filter: "blur(55px)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "3%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.06) 0%,transparent 65%)", filter: "blur(55px)" }} />
      </div>

      {/* Hero */}
      <section ref={heroRef} style={{ position: "relative", zIndex: 1, padding: "64px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="ex-hero-item" style={{ opacity: 0, display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px 5px 6px", borderRadius: 999, background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.2)", marginBottom: 26 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00d4b8", animation: "exPulse 1.4s ease-in-out infinite" }} />
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, color: "#00d4b8" }}>Live campaigns</span>
          </div>
          <h1 className="ex-hero-item" style={{ opacity: 0, fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(36px,5.5vw,66px)", lineHeight: 1.05, letterSpacing: "-0.035em", color: txt, margin: "0 0 18px" }}>
            Discover ideas<br />
            <span style={{ color: isDark ? "#00d4b8" : "#009e8c" }}>worth backing.</span>
          </h1>
          <p className="ex-hero-item" style={{ opacity: 0, fontFamily: "DM Sans, sans-serif", fontSize: "clamp(14px,1.8vw,17px)", color: muted, lineHeight: 1.8, maxWidth: 480, margin: "0 auto 36px" }}>
            From clean energy to indie music — find the next big thing before everyone else does.
          </p>
          <div className="ex-hero-item" style={{ opacity: 0, position: "relative", maxWidth: 520, margin: "0 auto" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: muted, pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search campaigns, creators, categories…"
              style={{ width: "100%", boxSizing: "border-box", padding: "16px 20px 16px 48px", borderRadius: 16, border: `1.5px solid ${query ? "rgba(0,212,184,0.5)" : bdr}`, background: isDark ? "rgba(255,255,255,0.05)" : "#fff", color: txt, fontFamily: "DM Sans, sans-serif", fontSize: 15, outline: "none", boxShadow: query ? "0 0 0 3px rgba(0,212,184,0.12)" : "none", transition: "all 0.22s" }} />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section style={{ position: "relative", zIndex: 1, background: secBg, borderTop: `1px solid ${bdr}`, borderBottom: `1px solid ${bdr}`, padding: "16px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
            {[{ id: undefined, name: "All" }, ...categories].map((cat) => {
              const active = cat.id === category;
              return (
                <button key={cat.id ?? "all"} onClick={() => setCategory(cat.id as number | undefined)}
                  style={{ padding: "7px 16px", borderRadius: 999, border: `1px solid ${active ? "rgba(255,107,0,0.5)" : bdr}`, background: active ? "rgba(255,107,0,0.12)" : "transparent", color: active ? "#ff8800" : muted, fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: active ? 700 : 500, cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap" }}>
                  {cat.name}
                </button>
              );
            })}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding: "8px 36px 8px 12px", borderRadius: 10, border: `1px solid ${bdr}`, background: isDark ? "#0f0f0f" : "#fff", color: txt, fontFamily: "DM Sans, sans-serif", fontSize: 13, cursor: "pointer", outline: "none", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </section>

      {/* Grid */}
      <section style={{ position: "relative", zIndex: 1, padding: "48px 24px 96px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {!loading && !error && (
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: muted, marginBottom: 28 }}>
              Showing <strong style={{ color: txt }}>{projects.length}</strong> campaigns
            </p>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>⚠️</p>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: txt, marginBottom: 8 }}>Could not load campaigns</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, marginBottom: 20 }}>{error}</p>
              <button onClick={() => fetchProjects(query, category, sort, page)}
                style={{ padding: "10px 24px", borderRadius: 10, background: "#ff6b00", color: "#fff", border: "none", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Retry
              </button>
            </div>
          )}

          {loading && !error && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} bdr={bdr} card={card} />)}
            </div>
          )}

          {!loading && !error && (
            <AnimatePresence>
              {projects.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "80px 0" }}>
                  <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: txt, marginBottom: 10 }}>No campaigns found</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted }}>Try different keywords or browse all categories.</p>
                </motion.div>
              ) : (
                <motion.div layout key="grid" variants={staggerContainer} initial="hidden" animate="show" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
                  {projects.map(p => <CampaignCard key={p.id} p={p} isDark={isDark} bdr={bdr} card={card} txt={txt} muted={muted} />)}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 48 }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                style={{ padding: "9px 20px", borderRadius: 10, border: `1px solid ${bdr}`, background: "transparent", color: page === 0 ? muted : txt, fontFamily: "DM Sans, sans-serif", fontSize: 13, cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.4 : 1 }}>
                ← Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  style={{ padding: "9px 16px", borderRadius: 10, border: `1px solid ${i === page ? "rgba(255,107,0,0.5)" : bdr}`, background: i === page ? "rgba(255,107,0,0.12)" : "transparent", color: i === page ? "#ff8800" : txt, fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: i === page ? 700 : 400, cursor: "pointer" }}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                style={{ padding: "9px 20px", borderRadius: 10, border: `1px solid ${bdr}`, background: "transparent", color: page === totalPages - 1 ? muted : txt, fontFamily: "DM Sans, sans-serif", fontSize: 13, cursor: page === totalPages - 1 ? "not-allowed" : "pointer", opacity: page === totalPages - 1 ? 0.4 : 1 }}>
                Next →
              </button>
            </div>
          )}

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
            style={{ marginTop: 64, textAlign: "center", padding: "36px", borderRadius: 20, border: `1px dashed ${bdr}`, background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)" }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, color: txt, marginBottom: 8 }}>Have an idea worth funding?</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted, marginBottom: 20 }}>Launch your own campaign and reach thousands of backers.</p>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 20px rgba(255,100,0,0.35)" }}>
              Start a campaign →
            </Link>
          </motion.div>
        </div>
      </section>

      <style>{`
        @keyframes exPulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
        @keyframes shimmer { 0%{opacity:0.6} 50%{opacity:1} 100%{opacity:0.6} }
      `}</style>
    </div>
  );
}
