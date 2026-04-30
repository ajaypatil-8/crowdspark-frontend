"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { easeOut } from "framer-motion";
import { Clock, Users, TrendingUp, Zap } from "lucide-react";
import type { ProjectFeedResponse } from "@/lib/api";

const ACCENT  = "#ff6b00";
const ACCENT2 = "#00d4b8";

export const cardItem = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

interface Props {
  p: ProjectFeedResponse;
  isDark: boolean;
  featured?: boolean;
}

export default function CampaignCard({ p, isDark, featured = false }: Props) {
  const pct      = Math.min(p.fundedPercentage ?? 0, 100);
  const isHot    = pct >= 75;
  const isNew    = (p.daysLeft ?? 0) >= 25;
  const urgent   = (p.daysLeft ?? 0) <= 5 && (p.daysLeft ?? 0) > 0;

  const card   = isDark ? "rgba(14,14,14,0.95)"   : "rgba(255,255,255,0.95)";
  const bdr    = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const txt    = isDark ? "#f0f0f0"                : "#0a0a0a";
  const muted  = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const track  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  const barColor = isHot
    ? `linear-gradient(90deg,${ACCENT},#ffcc00)`
    : `linear-gradient(90deg,${ACCENT2},${ACCENT2}88)`;

  return (
    <motion.article
      layout
      variants={cardItem}
      whileHover={{
        y: -8,
        boxShadow: isDark
          ? "0 24px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,107,0,0.12)"
          : "0 24px 56px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,107,0,0.10)",
      }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{
        borderRadius: featured ? 24 : 20,
        overflow: "hidden",
        background: card,
        border: `1px solid ${bdr}`,
        cursor: "pointer",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "relative",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          height: featured ? 200 : 168,
          background: p.thumbnailUrl
            ? "transparent"
            : `linear-gradient(135deg,${ACCENT}18,${ACCENT2}10)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {p.thumbnailUrl ? (
          <img
            src={p.thumbnailUrl}
            alt={p.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${ACCENT}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={22} color={ACCENT} />
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, color: txt, opacity: 0.25, textAlign: "center", padding: "0 20px", lineHeight: 1.3 }}>
              {p.title}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 55%)", pointerEvents: "none" }} />

        {/* Badges */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{
            padding: "4px 9px", borderRadius: 999,
            background: isDark ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.88)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"}`,
            fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700,
            color: ACCENT2, backdropFilter: "blur(6px)", letterSpacing: "0.02em",
          }}>
            {p.category}
          </span>
          {isHot && (
            <span style={{
              padding: "4px 9px", borderRadius: 999,
              background: `${ACCENT}22`, border: `1px solid ${ACCENT}40`,
              fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700,
              color: ACCENT, backdropFilter: "blur(6px)",
            }}>
              🔥 Hot
            </span>
          )}
          {isNew && !isHot && (
            <span style={{
              padding: "4px 9px", borderRadius: 999,
              background: "rgba(99,102,241,0.18)", border: "1px solid rgba(99,102,241,0.35)",
              fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700,
              color: "#818cf8", backdropFilter: "blur(6px)",
            }}>
              ✦ New
            </span>
          )}
        </div>

        {/* Creator avatar */}
        {p.creator?.profileImage && (
          <div style={{
            position: "absolute", bottom: 10, right: 10,
            width: 32, height: 32, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.7)",
            overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}>
            <img src={p.creator.profileImage} alt={p.creator.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
      </div>

      {/* Content */}
      <Link href={`/projects/${p.id}`} style={{ textDecoration: "none", display: "block" }}>
        <div style={{ padding: featured ? "20px 20px 22px" : "16px 16px 18px" }}>
          {/* Creator */}
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 600, color: muted, margin: "0 0 5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            by {p.creator?.username ?? "Creator"}
          </p>

          <h3 style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: featured ? 16 : 14.5,
            color: txt, margin: "0 0 7px", lineHeight: 1.3,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {p.title}
          </h3>

          <p style={{
            fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: muted,
            lineHeight: 1.65, margin: "0 0 16px",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {p.shortDescription}
          </p>

          {/* Progress */}
          <div
            role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
            style={{ height: 5, borderRadius: 3, background: track, marginBottom: 10, overflow: "hidden" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.4, ease: easeOut, delay: 0.3 }}
              style={{ height: "100%", borderRadius: 3, background: barColor, boxShadow: isHot ? `0 0 8px ${ACCENT}60` : "none" }}
            />
          </div>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, color: txt }}>
                ₹{((p.currentAmount ?? 0) / 100000).toFixed(1)}L
              </span>
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: muted, marginLeft: 5 }}>
                of ₹{((p.goalAmount ?? 0) / 100000).toFixed(1)}L
              </span>
            </div>
            <span style={{
              fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 800,
              color: isHot ? ACCENT : ACCENT2,
              background: isHot ? `${ACCENT}14` : `${ACCENT2}14`,
              padding: "2px 8px", borderRadius: 6,
            }}>
              {pct}%
            </span>
          </div>

          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted }}>
              <Users size={12} /> {(p.backersCount ?? 0).toLocaleString("en-IN")} backers
            </span>
            <span style={{
              display: "flex", alignItems: "center", gap: 4,
              fontFamily: "DM Sans, sans-serif", fontSize: 11.5,
              color: urgent ? "#ef4444" : muted,
              fontWeight: urgent ? 700 : 400,
            }}>
              <Clock size={12} />
              {urgent ? `⚡ ${p.daysLeft}d left!` : `${p.daysLeft ?? 0}d left`}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
