"use client";

/**
 * Explore page — Section 4 updated with Section 11 skeleton loading states.
 * src/app/(main)/explore/page.tsx
 *
 * Fixes applied:
 *  1. useSearchParams wrapped in Suspense (required by Next.js 14+)
 *  2. search input rendered in toolbar so 'search' state is actually usable
 *  3. sort dropdown rendered so users can change sort order
 *  4. CampaignCard prop renamed from 'project' to 'p' to match component interface
 *  5. category passed to API search (exploreApi.search supports it)
 *  6. Removed 'as any' cast on CampaignCard — now typed correctly
 */

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Search, X, ChevronDown } from "lucide-react";

import { CampaignCardSkeletonGrid } from "@/components/ui/Skeletons";
import CampaignCard from "@/components/explore/CampaignCard";
import { useTheme } from "@/contexts/ThemeContext";
import { exploreApi } from "@/lib/api";
import type { ProjectFeedResponse } from "@/lib/api";

const PAGE_SIZE = 9;

type SortOption = "NEWEST" | "MOST_FUNDED" | "TRENDING";

const SORT_LABELS: Record<SortOption, string> = {
  NEWEST:      "Newest first",
  MOST_FUNDED: "Most funded",
  TRENDING:    "Trending",
};

// ─── Inner component that uses useSearchParams ────────────────────────────────
function ExploreContent() {
  const { isDark } = useTheme();
  const searchParams = useSearchParams();

  const [projects, setProjects]       = useState<ProjectFeedResponse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [search, setSearch]           = useState(searchParams.get("q") ?? "");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [category, setCategory]       = useState(searchParams.get("category") ?? "");
  const [sort, setSort]               = useState<SortOption>("NEWEST");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen]       = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const combinedKeyword = [search, category].filter(Boolean).join(" ") || undefined;
      const res = await exploreApi.search({
        page: page - 1,
        size: PAGE_SIZE,
        keyword: combinedKeyword,
        sort: sort || undefined,
      });
      setProjects(res.content ?? []);
      setTotal(res.totalElements ?? 0);
    } catch {
      setProjects([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Reset to page 1 when filters change
  const applySearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applySearch();
  };

  const resetFilters = () => {
    setSearch("");
    setSearchInput("");
    setCategory("");
    setSort("NEWEST");
    setPage(1);
    setFiltersOpen(false);
  };

  const hasActiveFilters = search || category || sort !== "NEWEST";

  const bdr   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 80, position: "relative" }}>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: isDark
            ? "radial-gradient(circle at 10% 14%, rgba(255,107,0,0.07), transparent 34%), radial-gradient(circle at 86% 12%, rgba(0,245,212,0.07), transparent 30%)"
            : "radial-gradient(circle at 10% 14%, rgba(255,107,0,0.05), transparent 34%), radial-gradient(circle at 86% 12%, rgba(0,168,130,0.05), transparent 30%)",
        }}
      />
      {/* ── Hero ── */}
      <section
        style={{
          paddingTop: 120,
          paddingBottom: 48,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "25%",
            top: 0,
            width: 400,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,245,212,0.07) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: "relative" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 14px",
              borderRadius: 99,
              background: "var(--accent-dim)",
              border: "1px solid rgba(0,245,212,0.18)",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 6px var(--accent-glow)",
              }}
            />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              Discover Campaigns
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(34px, 4.5vw, 50px)",
              color: "var(--text)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              margin: "0 0 14px",
            }}
          >
            Explore{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, #00c4a7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Projects
            </span>
          </h1>

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              color: "var(--text-muted)",
              margin: "0 auto 28px",
              maxWidth: 500,
            }}
          >
            Back the ideas that matter. Filter by category, funding stage, and more.
          </p>

          {/* ── Search bar in hero ── */}
          <div style={{ maxWidth: 520, margin: "0 auto", position: "relative" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search
                size={16}
                style={{ position: "absolute", left: 16, color: "var(--text-muted)", pointerEvents: "none" }}
              />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search campaigns…"
                style={{
                  width: "100%",
                  padding: "14px 52px 14px 44px",
                  borderRadius: 16,
                  border: `1px solid ${bdr}`,
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)",
                  color: "var(--text)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                  backdropFilter: "blur(12px)",
                  boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-dim)";
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = bdr;
                  e.currentTarget.style.boxShadow = isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)";
                }}
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                  style={{ position: "absolute", right: 52, background: "none", border: "none", cursor: "pointer", color: muted, display: "flex", padding: 4 }}
                >
                  <X size={14} />
                </button>
              )}
              <button
                onClick={applySearch}
                style={{
                  position: "absolute", right: 8,
                  padding: "8px 16px", borderRadius: 10, border: "none",
                  background: "var(--accent)", color: "#000",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Search
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Content ── */}
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* ── Toolbar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: filtersOpen ? 16 : 32,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: muted }}>
            {loading ? "Loading…" : `${total.toLocaleString()} campaign${total !== 1 ? "s" : ""}`}
            {hasActiveFilters && !loading && (
              <button
                onClick={resetFilters}
                style={{ marginLeft: 10, background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600 }}
              >
                × Clear filters
              </button>
            )}
          </span>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Sort dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setSortOpen(o => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 11,
                  background: "var(--bg-ghost)", border: `1px solid ${bdr}`,
                  color: "var(--text-sub)", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                {SORT_LABELS[sort]} <ChevronDown size={13} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute", top: "calc(100% + 6px)", right: 0,
                      background: isDark ? "#141414" : "#fff",
                      border: `1px solid ${bdr}`, borderRadius: 14,
                      overflow: "hidden", zIndex: 50, minWidth: 160,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    }}
                  >
                    {(Object.keys(SORT_LABELS) as SortOption[]).map(s => (
                      <button
                        key={s}
                        onClick={() => { setSort(s); setPage(1); setSortOpen(false); }}
                        style={{
                          width: "100%", padding: "10px 16px", background: s === sort ? "var(--accent-dim)" : "none",
                          border: "none", color: s === sort ? "var(--accent)" : "var(--text)",
                          fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: s === sort ? 700 : 400,
                          cursor: "pointer", textAlign: "left", transition: "background 0.12s",
                        }}
                        onMouseEnter={e => { if (s !== sort) e.currentTarget.style.background = "var(--bg-ghost)"; }}
                        onMouseLeave={e => { if (s !== sort) e.currentTarget.style.background = "none"; }}
                      >
                        {SORT_LABELS[s]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setFiltersOpen(p => !p)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 16px", borderRadius: 11,
                background: filtersOpen ? "var(--accent-dim)" : "var(--bg-ghost)",
                border: `1px solid ${filtersOpen ? "var(--accent)" : bdr}`,
                color: filtersOpen ? "var(--accent)" : "var(--text-sub)",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                transition: "all 0.15s",
              }}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasActiveFilters && (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 6px var(--accent)", flexShrink: 0 }} />
              )}
            </button>
          </div>
        </div>

        {/* ── Filters panel ── */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden", marginBottom: 24 }}
            >
              <div style={{
                padding: "20px 22px", borderRadius: 16,
                background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${bdr}`,
                display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end",
              }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => { setCategory(e.target.value); setPage(1); }}
                    placeholder="e.g. Technology, Art…"
                    style={{
                      width: "100%", padding: "10px 13px", borderRadius: 10, boxSizing: "border-box" as const,
                      border: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
                      color: "var(--text)", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none",
                    }}
                  />
                </div>
                <button
                  onClick={resetFilters}
                  style={{
                    padding: "10px 18px", borderRadius: 10, border: `1px solid ${bdr}`,
                    background: "transparent", color: muted, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 600,
                  }}
                >
                  Reset all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Grid ── */}
        {loading ? (
          <CampaignCardSkeletonGrid count={PAGE_SIZE} />
        ) : projects.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "80px 0",
              gap: 12,
            }}
          >
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)" }}>
              No campaigns found
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: muted }}>
              Try different filters or search terms
            </p>
            <button
              onClick={resetFilters}
              style={{
                marginTop: 8,
                padding: "10px 22px",
                borderRadius: 12,
                background: "var(--accent)",
                color: "#000",
                border: "none",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 26,
            }}
          >
            {projects.map((project, i) => (
              <CampaignCard
                key={project.id}
                p={project}
                isDark={isDark}
                index={i}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              marginTop: 48,
            }}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => {
                const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                return (
                  <span key={p} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {showEllipsis && (
                      <span style={{ color: muted, fontSize: 13 }}>…</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        border: `1px solid ${p === page ? "var(--accent)" : bdr}`,
                        background: p === page ? "var(--accent-dim)" : "var(--bg-ghost)",
                        color: p === page ? "var(--accent)" : muted,
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: p === page ? 700 : 500,
                        fontSize: 14,
                        transition: "all 0.15s",
                      }}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}
          </div>
        )}
      </div>

      {/* Close sort dropdown when clicking outside */}
      {sortOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40 }}
          onClick={() => setSortOpen(false)}
        />
      )}
    </main>
  );
}

// ─── Exported page wraps content in Suspense (required for useSearchParams) ──
export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <main style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 80 }}>
          <section style={{ paddingTop: 120, paddingBottom: 48, textAlign: "center" }}>
            <div style={{ height: 56, width: 320, borderRadius: 12, background: "var(--bg-ghost)", margin: "0 auto 16px", animation: "skPulse 1.6s ease-in-out infinite" }} />
            <div style={{ height: 20, width: 480, borderRadius: 8, background: "var(--bg-ghost)", margin: "0 auto", animation: "skPulse 1.6s ease-in-out infinite" }} />
          </section>
          <div className="container">
            <CampaignCardSkeletonGrid count={9} />
          </div>
        </main>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}