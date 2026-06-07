"use client";
// src/components/dashboard/AnalyticsDashboard.tsx
// Drop-in analytics component for src/app/dashboard/my-campaigns/[id]/page.tsx
//
// Usage:
//   import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
//   <AnalyticsDashboard projectId={project.id} isDark={isDark} />

import { useEffect, useState } from "react";
import { analyticsApi, type ProjectAnalyticsResponse } from "@/lib/api";

type Point = { date: string; value: number };

function fmt(n: number) {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000)    return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function StatCard({ label, value, sub, color, isDark }: {
  label: string; value: string | number; sub?: string;
  color: string; isDark: boolean;
}) {
  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const txt  = isDark ? "#f0f0f0" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  return (
    <div style={{ padding: "18px 20px", borderRadius: 16,
      background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
      border: `1px solid ${bdr}`, flex: "1 1 160px", minWidth: 140 }}>
      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 10.5,
        color: muted, letterSpacing: "0.1em", textTransform: "uppercase",
        marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 900,
        fontSize: 24, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12,
        color: muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function MiniChart({ data, color, label, isDark }: {
  data: Point[]; color: string; label: string; isDark: boolean;
}) {
  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const txt  = isDark ? "#f0f0f0" : "#0a0a0a";

  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map(d => d.value), 1);
  const last7 = data.slice(-7);

  return (
    <div style={{ padding: "18px 20px", borderRadius: 16,
      background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
      border: `1px solid ${bdr}` }}>
      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 10.5,
        color: muted, letterSpacing: "0.1em", textTransform: "uppercase",
        marginBottom: 14 }}>{label} (last 30 days)</div>

      {/* Bar chart */}
      <div style={{ display: "flex", alignItems: "flex-end",
        gap: 3, height: 80, marginBottom: 8 }}>
        {data.map((pt, i) => (
          <div key={i} title={`${pt.date}: ${pt.value}`}
            style={{ flex: 1, borderRadius: "3px 3px 0 0",
              background: i >= data.length - 7
                ? color : `${color}40`,
              height: `${(pt.value / max) * 100}%`,
              minHeight: pt.value > 0 ? 3 : 0,
              transition: "height 0.4s ease" }} />
        ))}
      </div>

      {/* X-axis: show first, middle, last date */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {[data[0], data[Math.floor(data.length / 2)], data[data.length - 1]].map((pt, i) => (
          <span key={i} style={{ fontFamily: "DM Mono, monospace",
            fontSize: 10, color: muted }}>
            {pt?.date?.slice(5) ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard({
  projectId, isDark,
}: { projectId: number; isDark: boolean }) {
  const [data,    setData]    = useState<ProjectAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const txt   = isDark ? "#f0f0f0" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const accent = "#ff5c00";

  useEffect(() => {
    analyticsApi.getAnalytics(projectId)
      .then(setData)
      .catch(e => setError(e?.message ?? "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return (
    <div style={{ display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
      {[0,1,2,3,4,5].map(i => (
        <div key={i} style={{ height: 90, borderRadius: 16,
          background: isDark ? "rgba(255,255,255,0.04)" : "#f0f0f0",
          animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );

  if (error) return (
    <div style={{ padding: 20, borderRadius: 14, background: "rgba(239,68,68,0.07)",
      border: "1px solid rgba(239,68,68,0.2)", fontFamily: "DM Sans, sans-serif",
      fontSize: 14, color: "#ef4444" }}>{error}</div>
  );

  if (!data) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800,
          fontSize: 18, color: txt, margin: "0 0 4px" }}>
          Campaign Analytics
        </h3>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13,
          color: muted, margin: 0 }}>
          Last updated: {new Date().toLocaleTimeString("en-IN")}
        </p>
      </div>

      {/* Stat cards row 1 — Funding */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <StatCard label="Total Raised"
          value={fmt(data.currentAmount)}
          sub={`of ${fmt(data.goalAmount)} goal`}
          color={accent} isDark={isDark} />
        <StatCard label="Funded"
          value={`${data.fundedPercentage}%`}
          sub={`₹${data.remainingAmount.toLocaleString("en-IN")} remaining`}
          color={data.fundedPercentage >= 100 ? "#22c55e" : accent}
          isDark={isDark} />
        <StatCard label="Backers"
          value={data.backersCount.toLocaleString("en-IN")}
          sub={`avg ₹${data.avgDonationAmount.toLocaleString("en-IN")} per backer`}
          color="#6366f1" isDark={isDark} />
        <StatCard label="Conversion"
          value={`${data.conversionRate}%`}
          sub="views → backers"
          color="#ec4899" isDark={isDark} />
      </div>

      {/* Stat cards row 2 — Views */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <StatCard label="Total Views"
          value={data.totalViews.toLocaleString("en-IN")}
          sub={`${data.totalUniqueVisitors.toLocaleString("en-IN")} unique visitors`}
          color="#0ea5e9" isDark={isDark} />
        <StatCard label="Last 7 Days"
          value={data.viewsLast7Days.toLocaleString("en-IN")}
          sub="views"
          color="#0ea5e9" isDark={isDark} />
        <StatCard label="Updates"
          value={data.updatesCount}
          sub="posted to backers"
          color="#f59e0b" isDark={isDark} />
        <StatCard label="Comments"
          value={data.commentsCount}
          sub={`${data.savedCount} people saved`}
          color="#10b981" isDark={isDark} />
      </div>

      {/* Charts */}
      <div style={{ display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
        <MiniChart data={data.dailyViews} color="#0ea5e9"
          label="Daily Views" isDark={isDark} />
        <MiniChart data={data.dailyFunding} color={accent}
          label="Cumulative Raised (₹)" isDark={isDark} />
      </div>

      {/* Conversion insight */}
      <div style={{ padding: "14px 18px", borderRadius: 14,
        background: isDark ? "rgba(255,255,255,0.03)" : "#f8f8f6",
        border: `1px solid ${bdr}` }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
          color: muted, margin: 0, lineHeight: 1.7 }}>
          💡 <strong style={{ color: txt }}>Insight:</strong>{" "}
          {data.conversionRate < 1
            ? "Your conversion rate is low. Try posting a campaign update — projects with 3+ updates convert 2× better."
            : data.conversionRate < 5
              ? `${data.conversionRate}% of visitors backed your project. Industry average is 3–5%. You're on track!`
              : `Great conversion rate of ${data.conversionRate}%! Keep engaging with your backers through updates.`
          }
        </p>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
