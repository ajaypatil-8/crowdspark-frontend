// src/components/MilestonesTimeline.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Target, Loader2 } from "lucide-react";
import { milestoneApi, type MilestoneResponse } from "@/lib/api";

interface Props {
  projectId: number;
  isDark:    boolean;
  goalAmount?: number;
}

function fmt(v: number) {
  if (v >= 100_000) return `₹${(v / 100_000).toFixed(1)}L`;
  if (v >= 1_000)   return `₹${(v / 1_000).toFixed(0)}K`;
  return `₹${v.toLocaleString("en-IN")}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d < 1)  return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d} days ago`;
  const m = Math.floor(d / 30);
  return m < 12 ? `${m} months ago` : `${Math.floor(m / 12)} years ago`;
}

export default function MilestonesTimeline({ projectId, isDark, goalAmount }: Props) {
  const [milestones, setMilestones] = useState<MilestoneResponse[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const txt   = isDark ? "#f0f0f0"                : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const line  = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

  useEffect(() => {
    milestoneApi.getAll(projectId)
      .then(setMilestones)
      .catch(() => setError("Failed to load milestones"))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
      <Loader2 size={20} style={{ color: muted, animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (error) return (
    <p style={{ color: "#ef4444", fontSize: 14, padding: "12px 0" }}>{error}</p>
  );

  if (milestones.length === 0) return (
    <p style={{ color: muted, fontSize: 14, padding: "12px 0" }}>
      No milestones defined for this project yet.
    </p>
  );

  const completed = milestones.filter(m => m.status === "COMPLETED").length;
  const pct = Math.round((completed / milestones.length) * 100);

  return (
    <div style={{ paddingTop: 4 }}>

      {/* Progress header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: txt }}>
          {completed} / {milestones.length} completed
        </span>
        <span style={{ fontSize: 12, color: muted }}>{pct}%</span>
      </div>

      {/* Thin progress bar */}
      <div style={{ height: 4, background: bdr, borderRadius: 4, marginBottom: 28, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", background: "#ff5c00", borderRadius: 4 }}
        />
      </div>

      {/* Timeline */}
      <div style={{ position: "relative" }}>

        {/* Vertical connector line */}
        <div style={{
          position: "absolute", left: 12, top: 14, bottom: 14,
          width: 2, background: line, borderRadius: 2, zIndex: 0,
        }} />

        {milestones.map((m, i) => {
          const done = m.status === "COMPLETED";
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              style={{
                position: "relative", display: "flex", gap: 16,
                marginBottom: i < milestones.length - 1 ? 24 : 0,
                zIndex: 1,
              }}
            >
              {/* Icon */}
              <div style={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done
                  ? "linear-gradient(135deg,#ff5c00,#ff9000)"
                  : (isDark ? "#1a1a1a" : "#fff"),
                border: done ? "none" : `2px solid ${line}`,
                boxShadow: done ? "0 2px 8px rgba(255,92,0,0.35)" : "none",
                transition: "all 0.3s",
              }}>
                {done
                  ? <CheckCircle2 size={14} color="#fff" />
                  : <Circle      size={14} color={muted} />}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: 2 }}>
                <div style={{ display: "flex", alignItems: "flex-start",
                              justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: done ? txt : muted,
                    textDecoration: done ? "none" : "none",
                  }}>
                    {m.title}
                  </span>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {m.targetAmount != null && (
                      <span style={{
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: 11, color: "#f59e0b", fontWeight: 600,
                        background: "rgba(245,158,11,0.12)",
                        padding: "2px 8px", borderRadius: 20,
                      }}>
                        <Target size={10} />
                        {fmt(m.targetAmount)}
                        {goalAmount ? ` (${Math.round((m.targetAmount / goalAmount) * 100)}%)` : ""}
                      </span>
                    )}
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                      background: done ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.12)",
                      color:      done ? "#22c55e"               : muted,
                    }}>
                      {done ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>

                {m.description && (
                  <p style={{ fontSize: 13, color: muted, margin: "4px 0 0",
                               lineHeight: 1.55 }}>
                    {m.description}
                  </p>
                )}

                {done && m.completedAt && (
                  <p style={{ fontSize: 12, color: "#22c55e", margin: "4px 0 0" }}>
                    ✓ {timeAgo(m.completedAt)}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
