// src/components/dashboard/WeeklyInsightsWidget.tsx
// Feature #48 — AI Creator Analytics Insights (UI)
//
// Same graceful-hide pattern as RecommendedForYou (#40): fails silently and
// renders nothing if there's an error or simply no insights yet (brand new
// creators, or before the first Monday run) — this is a bonus view of
// something already emailed weekly, not something worth showing an error
// state for on a page people check often.

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { creatorApi, type CreatorWeeklyInsightResponse } from "@/lib/api";

export default function WeeklyInsightsWidget({ isDark }: { isDark: boolean }) {
  const [loading, setLoading]   = useState(true);
  const [insights, setInsights] = useState<CreatorWeeklyInsightResponse[]>([]);
  const [failed, setFailed]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    creatorApi.weeklyInsights()
      .then(res => { if (!cancelled) setInsights(res); })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (failed || (!loading && insights.length === 0)) return null;

  const bdr   = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const txt   = isDark ? "#f0f0f0" : "#111";

  return (
    <div style={{ marginTop: 28, marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>📊</span>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: txt, margin: 0 }}>
          This week's insights
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {loading
          ? [0, 1].map(i => (
              <div key={i} style={{ height: 74, borderRadius: 14, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${bdr}`, opacity: 0.6 }} />
            ))
          : insights.map((insight, i) => (
              <motion.div
                key={insight.projectId}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                style={{
                  padding: "14px 16px", borderRadius: 14,
                  background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                  border: `1px solid ${bdr}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 10 }}>
                  <Link href={`/dashboard/my-campaigns/${insight.projectId}`} style={{
                    fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: txt,
                    textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {insight.projectTitle}
                  </Link>
                  <span style={{
                    flexShrink: 0, fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11,
                    color: "#34d399", background: "rgba(52,211,153,0.12)", padding: "2px 9px", borderRadius: 999,
                  }}>
                    {insight.fundedPercent}% funded
                  </span>
                </div>
                <p style={{ margin: 0, fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted, lineHeight: 1.55 }}>
                  {insight.summary}
                </p>
              </motion.div>
            ))
        }
      </div>
    </div>
  );
}
