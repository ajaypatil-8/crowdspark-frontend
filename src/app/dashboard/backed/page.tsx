"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import { backerApi, type BackedProjectResponse } from "@/lib/api";
import MyRewardClaims from "@/components/dashboard/MyRewardClaims";

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
const IcArrow = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IcRefresh = ({ s = 13 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
  </svg>
);

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  APPROVED: { color: "#34d399", bg: "rgba(52,211,153,0.12)", label: "Active" },
  ACTIVE:   { color: "#34d399", bg: "rgba(52,211,153,0.12)", label: "Active" },
  PENDING:  { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", label: "Pending" },
  REJECTED: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Rejected" },
  CLOSED:   { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", label: "Closed" },
  FUNDED:   { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", label: "Funded" },
};

function SkeletonRow({ isDark }: { isDark: boolean }) {
  const b = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 110px 100px", gap: 12, padding: "18px 28px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`, alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 60, height: 46, borderRadius: 12, background: b, flexShrink: 0, animation: "bkpulse 1.6s ease-in-out infinite" }} />
        <div>
          <div style={{ width: 180, height: 13, borderRadius: 6, background: b, marginBottom: 8, animation: "bkpulse 1.6s ease-in-out infinite" }} />
          <div style={{ width: 100, height: 10, borderRadius: 6, background: b, animation: "bkpulse 1.6s ease-in-out infinite" }} />
        </div>
      </div>
      <div style={{ width: 70, height: 14, borderRadius: 6, background: b, animation: "bkpulse 1.6s ease-in-out infinite" }} />
      <div style={{ width: 80, height: 8, borderRadius: 4, background: b, animation: "bkpulse 1.6s ease-in-out infinite" }} />
      <div style={{ width: 60, height: 24, borderRadius: 20, background: b, animation: "bkpulse 1.6s ease-in-out infinite" }} />
    </div>
  );
}

function StatPill({ icon, label, value, color, isDark }: { icon: React.ReactNode; label: string; value: string; color: string; isDark: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        padding: "16px 22px", borderRadius: 18,
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)",
        minWidth: 110,
      }}
    >
      <div style={{ color, opacity: 0.85 }}>{icon}</div>
      <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontWeight: 500, textAlign: "center" }}>{label}</span>
    </motion.div>
  );
}

export default function BackedPage() {
  const { isDark } = useTheme();
  const { user } = useProfile();
  const [projects, setProjects] = useState<BackedProjectResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [mounted, setMounted]   = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | number | null>(null);
  const [activeTab, setActiveTab] = useState<"backed" | "rewards">("backed");

  useEffect(() => { setMounted(true); }, []);

  const fetchBacked = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await backerApi.backedProjects();
      setProjects(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load backed projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (mounted) fetchBacked(); }, [mounted, fetchBacked]);

  const txt   = isDark ? "#fff" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card  = isDark ? "rgba(255,255,255,0.025)" : "#ffffff";
  const accent = "#ff8800";

  const totalBacked     = user?.totalAmountBacked ?? projects.reduce((s, p) => s + p.amountBacked, 0);
  const totalCount      = projects.length;
  const activeCampaigns = projects.filter(p => ["APPROVED", "ACTIVE"].includes(p.status ?? "")).length;

  if (!mounted) return null;

  return (
    <div style={{ padding: "40px 32px 80px", maxWidth: 1160, margin: "0 auto", position: "relative" }}>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: isDark
            ? "radial-gradient(circle at 10% 14%, rgba(255,107,0,0.08), transparent 34%), radial-gradient(circle at 85% 12%, rgba(0,245,212,0.06), transparent 30%)"
            : "radial-gradient(circle at 10% 14%, rgba(255,107,0,0.06), transparent 34%), radial-gradient(circle at 85% 12%, rgba(0,168,130,0.05), transparent 30%)",
        }}
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, 22, 0], y: [0, -14, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,136,0,0.14) 0%, transparent 70%)",
          filter: "blur(9px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ marginBottom: 36 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
            <IcTarget s={14} />
          </div>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>Your backing history</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(26px,3vw,38px)", color: txt, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>
            Backed Projects
          </h1>
          {!loading && !error && totalCount > 0 && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <StatPill icon={<IcTarget s={16} />} label="Total backed" value={String(totalCount)} color={accent} isDark={isDark} />
              <StatPill icon={<IcCoin s={16} />} label="Amount pledged" value={`₹${totalBacked >= 100000 ? (totalBacked/100000).toFixed(1)+"L" : totalBacked.toLocaleString("en-IN")}`} color="#34d399" isDark={isDark} />
              <StatPill icon={<IcRocket s={16} />} label="Active now" value={String(activeCampaigns)} color="#a78bfa" isDark={isDark} />
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Error Banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: "16px 20px", borderRadius: 16, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24 }}
          >
            <div style={{ color: "#ef4444", marginTop: 1, flexShrink: 0 }}><IcTriangle s={18} /></div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#ef4444", margin: "0 0 4px" }}>Failed to load</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, margin: "0 0 12px" }}>{error}</p>
              <button onClick={fetchBacked} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 9, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                <IcRefresh s={13} /> Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

              <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {(["backed", "rewards"] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: "8px 18px", borderRadius: 10, border: "none",
                background: activeTab === t ? "#ff5c00" : "transparent",
                color: activeTab === t ? "#fff" : muted,
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {t === "backed" ? "Backed Projects" : "🎁 Reward Claims"}
            </button>
          ))}
        </div>

        {activeTab === "backed" && (
          <></>
        )}

        {activeTab === "rewards" && (
          <MyRewardClaims isDark={isDark} />
        )}

      {/* ── Content Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          borderRadius: 24, background: card, border: `1px solid ${bdr}`,
          boxShadow: isDark ? "0 0 0 1px rgba(255,255,255,0.03)" : "0 4px 40px rgba(0,0,0,0.06)",
          overflow: "hidden", position: "relative",
        }}
      >
        {/* Glow accent top */}
        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,136,0,0.5),transparent)", pointerEvents: "none" }} />

        {/* Skeleton */}
        {loading && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 110px 100px", gap: 12, padding: "14px 28px", borderBottom: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
              {["Campaign", "Your pledge", "Progress", "Status"].map(h => (
                <span key={h} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
              ))}
            </div>
            {[1, 2, 3, 4].map(i => <SkeletonRow key={i} isDark={isDark} />)}
          </>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <div style={{ padding: "80px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)`, pointerEvents: "none" }} />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ width: 72, height: 72, borderRadius: 22, margin: "0 auto 20px", background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: accent }}
            >
              <IcTarget s={30} />
            </motion.div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, color: txt, margin: "0 0 12px", letterSpacing: "-0.02em" }}>No backed projects yet</h2>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: muted, margin: "0 auto 32px", maxWidth: 380, lineHeight: 1.8 }}>
              Discover campaigns you believe in and back the ideas that excite you. Every rupee counts.
            </p>
            <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 30px", borderRadius: 14, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 0 30px rgba(255,100,0,0.3)", position: "relative", overflow: "hidden" }}>
              <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.2) 50%,transparent 70%)", animation: "shimmer 2.4s ease-in-out infinite" }} />
              Explore campaigns <IcArrow s={14} />
            </Link>
          </div>
        )}

        {/* Project list */}
        {!loading && !error && projects.length > 0 && (
          <div>
            {/* Table head */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 110px 100px", gap: 12, padding: "14px 28px", borderBottom: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
              {["Campaign", "Your pledge", "Progress", "Status"].map(h => (
                <span key={h} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
              ))}
            </div>

            <AnimatePresence>
              {projects.map((p, i) => {
                const pct = Math.min(p.fundedPercentage ?? 0, 100);
                const sc = STATUS_CONFIG[p.status] ?? { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", label: p.status ?? "—" };
                const rowKey = p.donationId ?? `${p.projectId}-${i}`;
                const isHovered = hoveredRow === rowKey;

                return (
                  <motion.div
                    key={rowKey}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.35, ease: "easeOut" }}
                    onMouseEnter={() => setHoveredRow(rowKey)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      display: "grid", gridTemplateColumns: "1fr 130px 110px 100px",
                      gap: 12, padding: "18px 28px",
                      borderBottom: i < projects.length - 1 ? `1px solid ${bdr}` : "none",
                      alignItems: "center",
                      background: isHovered ? (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)") : "transparent",
                      transition: "background 0.18s",
                      cursor: "default",
                    }}
                  >
                    {/* Project info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                      <div style={{ width: 60, height: 46, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", border: `1px solid ${bdr}`, position: "relative" }}>
                        {p.thumbnailUrl
                          ? <img src={p.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🚀</div>
                        }
                        {isHovered && <div style={{ position: "absolute", inset: 0, background: "rgba(255,107,0,0.1)", transition: "all 0.18s" }} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <Link href={`/projects/${p.projectId}`} style={{ textDecoration: "none" }}>
                          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: isHovered ? accent : txt, margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "color 0.18s" }}>
                            {p.projectTitle}
                          </p>
                        </Link>
                        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted, margin: 0 }}>
                          Backed {new Date(p.backedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* Pledge */}
                    <div>
                      <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, color: "#34d399" }}>
                        ₹{p.amountBacked.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Progress */}
                    <div>
                      <div style={{ height: 5, borderRadius: 4, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 5 }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.06 + 0.3 }}
                          style={{ height: "100%", borderRadius: 4, background: pct >= 100 ? "#34d399" : "linear-gradient(90deg,#ff6b00,#ffcc00)" }}
                        />
                      </div>
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: muted, fontWeight: 600 }}>{pct}%</span>
                    </div>

                    {/* Status */}
                    <div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 999, background: sc.bg, border: `1px solid ${sc.color}25`, fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: sc.color }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.color, flexShrink: 0, boxShadow: `0 0 6px ${sc.color}` }} />
                        {sc.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Footer summary */}
            <div style={{ padding: "14px 28px", borderTop: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.015)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted }}>
                Showing <strong style={{ color: txt }}>{totalCount}</strong> backed {totalCount === 1 ? "project" : "projects"}
              </span>
              <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, color: accent, textDecoration: "none" }}>
                Explore more <IcArrow s={12} />
              </Link>
            </div>
          </div>
        )}
      </motion.div>

      <style>{`
        @keyframes bkpulse { 0%,100%{opacity:.35} 50%{opacity:.85} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(200%)} 100%{transform:translateX(200%)} }
        @media(max-width:700px){
          .bk-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      </div>
    </div>
  );
}
