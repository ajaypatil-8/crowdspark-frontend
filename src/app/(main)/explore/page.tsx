"use client";

/**
 * Explore page — Section 4 updated with Section 11 skeleton loading states.
 * Replace src/app/(main)/explore/page.tsx
 */

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, LayoutGrid, List } from "lucide-react";

import { CampaignCardSkeletonGrid } from "@/components/ui/Skeletons";
import CampaignCard from "@/components/explore/CampaignCard";
import { useTheme } from "@/contexts/ThemeContext";
import api from "@/lib/api";

// Reuse design tokens
const PAGE_SIZE = 9;

export default function ExplorePage() {
  const { isDark } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page - 1),
        size: String(PAGE_SIZE),
        ...(search && { search }),
        ...(category && { category }),
        sort,
      });
      const res = await api.get(`/projects?${params}`);
      setProjects(res.data?.content ?? res.data ?? []);
      setTotal(res.data?.totalElements ?? (res.data?.length ?? 0));
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const bg = isDark ? "var(--bg)" : "var(--bg)";

  return (
    <main style={{ background: bg, minHeight: "100vh", paddingBottom: 80 }}>
      {/* Hero */}
      <section
        style={{
          paddingTop: 120,
          paddingBottom: 48,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* BG glows */}
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
                animation: "glowPulse 2s ease-in-out infinite",
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
              fontSize: "clamp(36px, 5vw, 56px)",
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
              fontSize: 16,
              color: "var(--text-muted)",
              margin: "0 auto",
              maxWidth: 500,
            }}
          >
            Back the ideas that matter. Filter by category, funding stage, and more.
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <div className="container">
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            {loading ? "Loading…" : `${total.toLocaleString()} campaigns`}
          </span>

          <button
            onClick={() => setFiltersOpen((p) => !p)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 16px",
              borderRadius: 11,
              background: "var(--bg-ghost)",
              border: "1px solid var(--border)",
              color: "var(--text-sub)",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>

        {/* Grid — show skeletons while loading, real cards after */}
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
            <p
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: "var(--text)",
              }}
            >
              No campaigns found
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "var(--text-muted)",
              }}
            >
              Try different filters or search terms
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("");
                setPage(1);
              }}
              style={{
                marginTop: 8,
                padding: "10px 22px",
                borderRadius: 12,
                background: "var(--accent)",
                color: "var(--icon-clr)",
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
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {projects.map((p: unknown, i) => (
              <CampaignCard
                key={(p as { id: number }).id}
                project={p as Parameters<typeof CampaignCard>[0]["project"]}
                isDark={isDark}
                index={i}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
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
                      <span style={{ color: "var(--text-muted)", fontSize: 13 }}>…</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        border: `1px solid ${p === page ? "var(--accent)" : "var(--border)"}`,
                        background:
                          p === page ? "var(--accent-dim)" : "var(--bg-ghost)",
                        color: p === page ? "var(--accent)" : "var(--text-muted)",
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
    </main>
  );
}
