// src/components/dashboard/RecommendedForYou.tsx
// Feature #40 — AI-Powered Project Recommendations (UI)
// Self-contained: fetches its own data, fails silently (this is a dashboard
// enhancement, not core functionality — an AI outage shouldn't put a scary
// error box in front of someone checking their campaigns).

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { aiApi, type RecommendedProjectResponse } from "@/lib/api";
import CampaignCard from "@/components/explore/CampaignCard";
import SkeletonCard from "@/components/explore/SkeletonCard";

export default function RecommendedForYou({ isDark }: { isDark: boolean }) {
  const [loading, setLoading]   = useState(true);
  const [picks, setPicks]       = useState<RecommendedProjectResponse[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const [failed, setFailed]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    aiApi.getRecommendations()
      .then(res => {
        if (cancelled) return;
        setPicks(res.recommendations ?? []);
        setPersonalized(res.personalized);
      })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Nothing to show and nothing worth showing an error for — just don't render.
  if (failed || (!loading && picks.length === 0)) return null;

  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";

  return (
    <div style={{ marginTop: 36, marginBottom: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}
      >
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text)", margin: 0, letterSpacing: "-0.025em" }}>
          {personalized ? "✨ Recommended for you" : "🔥 Trending on CrowdSpark"}
        </h2>
        <Link href="/explore" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, color: "var(--accent)", textDecoration: "none", opacity: 0.8 }}>
          Explore all →
        </Link>
      </motion.div>

      <div className="rfy-grid">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} isDark={isDark} />)
          : picks.map((rec, i) => (
              <div key={rec.project.id}>
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  style={{
                    margin: "0 0 8px", padding: "6px 12px", borderRadius: 10,
                    background: isDark ? "rgba(255,107,0,0.08)" : "rgba(255,107,0,0.06)",
                    border: "1px solid rgba(255,107,0,0.16)",
                    fontFamily: "DM Sans, sans-serif", fontSize: 12, color: muted,
                    lineHeight: 1.5,
                  }}
                >
                  💡 {rec.reason}
                </motion.p>
                <CampaignCard p={rec.project} isDark={isDark} index={i} />
              </div>
            ))
        }
      </div>

      <style>{`
        .rfy-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .rfy-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .rfy-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
