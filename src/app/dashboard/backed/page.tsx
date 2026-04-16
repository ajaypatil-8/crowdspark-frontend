"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import { backerApi, type BackedProjectResponse } from "@/lib/api";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcTarget = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IcCoin = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v1m0 6v1M9.5 10.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 2-5 2-5 4 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5"/>
  </svg>
);
const IcRocket = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
  </svg>
);
const IcTriangle = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

function SkeletonRow({ isDark }: { isDark: boolean }) {
  const b = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  return (
    <div style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`, alignItems: "center" }}>
      <div style={{ width: 72, height: 56, borderRadius: 10, background: b, flexShrink: 0, animation: "bkpulse 1.6s ease-in-out infinite" }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: "60%", height: 13, borderRadius: 6, background: b, marginBottom: 8, animation: "bkpulse 1.6s ease-in-out infinite" }} />
        <div style={{ width: "35%", height: 10, borderRadius: 6, background: b, animation: "bkpulse 1.6s ease-in-out infinite" }} />
      </div>
      <div style={{ width: 60, height: 13, borderRadius: 6, background: b, animation: "bkpulse 1.6s ease-in-out infinite" }} />
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#34d399",
  ACTIVE:   "#34d399",
  PENDING:  "#fbbf24",
  REJECTED: "#ef4444",
  CLOSED:   "#6b7280",
  FUNDED:   "#a78bfa",
};

export default function BackedPage() {
  const { isDark } = useTheme();
  const { user } = useProfile();
  const [projects, setProjects] = useState<BackedProjectResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchBacked = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await backerApi.backedProjects();
      setProjects(data);
    } catch (e: any) {
      setError(e.message ?? "Failed to load backed projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (mounted) fetchBacked(); }, [mounted, fetchBacked]);

  const bdr  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const card = isDark ? "rgba(255,255,255,0.025)" : "#fff";
  const txt  = isDark ? "#fff" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const accent = "#ff8800";

  const totalBacked     = user?.totalAmountBacked ?? projects.reduce((s, p) => s + p.amountBacked, 0);
  const totalCount      = projects.length;
  const activeCampaigns = projects.filter(p => ["APPROVED", "ACTIVE"].includes(p.status ?? "")).length;

  if (!mounted) return null;

  return (
    <div style={{ padding: "40px 32px 80px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
              <IcTarget s={13} />
            </div>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your backing history</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: txt, letterSpacing: "-0.03em", margin: 0 }}>
            Backed Projects
          </h1>
        </div>

        {/* Stats pills */}
        {!loading && !error && totalCount > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { icon: <IcTarget s={15} />, label: "Projects", value: String(totalCount), color: accent },
              { icon: <IcCoin s={15} />, label: "Total backed", value: `₹${totalBacked.toLocaleString("en-IN")}`, color: "#34d399" },
              { icon: <IcRocket s={15} />, label: "Active", value: String(activeCampaigns), color: "#a78bfa" },
            ].map(({ icon, label, value, color }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 18px", borderRadius: 14, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${bdr}` }}>
                <div style={{ color }}>{icon}</div>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color, lineHeight: 1 }}>{value}</span>
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, color: muted, fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24 }}>
          <div style={{ color: "#ef4444", marginTop: 1 }}><IcTriangle s={17} /></div>
          <div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#ef4444", margin: "0 0 4px" }}>Failed to load</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, margin: "0 0 10px" }}>{error}</p>
            <button onClick={fetchBacked} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Retry</button>
          </div>
        </div>
      )}

      {/* Content card */}
      <div style={{ borderRadius: 20, background: card, border: `1px solid ${bdr}`, boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)", overflow: "hidden" }}>

        {/* Skeleton */}
        {loading && (
          <div style={{ padding: "8px 24px" }}>
            {[1, 2, 3].map(i => <SkeletonRow key={i} isDark={isDark} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <div style={{ padding: "72px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,107,0,0.07)", filter: "blur(70px)", pointerEvents: "none" }} />
            <div style={{ width: 64, height: 64, borderRadius: 20, margin: "0 auto 18px", background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
              <IcTarget s={28} />
            </div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: txt, margin: "0 0 10px" }}>No backed projects yet</h2>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted, margin: "0 auto 28px", maxWidth: 360, lineHeight: 1.75 }}>
              Discover campaigns you believe in and back the ideas that excite you.
            </p>
            <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 0 24px rgba(255,100,0,0.3)" }}>
              Explore campaigns →
            </Link>
          </div>
        )}

        {/* Project list */}
        {!loading && !error && projects.length > 0 && (
          <div>
            {/* Table head */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 90px", gap: 12, padding: "14px 24px", borderBottom: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
              {["Campaign", "Your pledge", "Progress", "Status"].map(h => (
                <span key={h} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
              ))}
            </div>

            <AnimatePresence>
              {projects.map((p, i) => {
                const pct = Math.min(p.fundedPercentage ?? 0, 100);
                const statusColor = STATUS_COLORS[p.status] ?? "#6b7280";
                return (
                  <motion.div
                    key={p.projectId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 90px", gap: 12, padding: "16px 24px", borderBottom: i < projects.length - 1 ? `1px solid ${bdr}` : "none", alignItems: "center", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.015)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Project info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <div style={{ width: 52, height: 40, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", border: `1px solid ${bdr}` }}>
                        {p.thumbnailUrl
                          ? <img src={p.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚀</div>
                        }
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <Link href={`/projects/${p.projectId}`} style={{ textDecoration: "none" }}>
                          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: txt, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.projectTitle}
                          </p>
                        </Link>
                        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted, margin: 0 }}>
                          Backed {new Date(p.backedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* Pledge amount */}
                    <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, color: "#34d399" }}>
                      ₹{p.amountBacked.toLocaleString("en-IN")}
                    </span>

                    {/* Progress bar */}
                    <div>
                      <div style={{ height: 5, borderRadius: 3, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", overflow: "hidden", marginBottom: 4 }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: i * 0.05 + 0.2 }}
                          style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg,#00d4b8,#00d4b880)" }}
                        />
                      </div>
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: muted, fontWeight: 600 }}>{pct}%</span>
                    </div>

                    {/* Status badge */}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: `${statusColor}14`, border: `1px solid ${statusColor}30`, fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: statusColor, width: "fit-content" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor }} />
                      {p.status ?? "—"}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style>{`@keyframes bkpulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </div>
  );
}
