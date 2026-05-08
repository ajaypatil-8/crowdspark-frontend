"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import {
  backerApi, projectApi, exploreApi,
  type BackedProjectResponse, type BackerStatsResponse,
  type ProjectFeedResponse,
} from "@/lib/api";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Heart:    ({ s=18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>),
  Rocket:   ({ s=18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg>),
  Zap:      ({ s=18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
  Bookmark: ({ s=18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>),
  Coins:    ({ s=18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1110.34 18"/><path d="M7 6h1v4"/></svg>),
  Compass:  ({ s=18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>),
  Plus:     ({ s=18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  ArrowRight: ({ s=14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>),
  User:     ({ s=18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
  Shield:   ({ s=18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
  Trend:    ({ s=18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>),
  Check:    ({ s=14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
  Mail:     ({ s=14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>),
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    const step = Math.ceil(end / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display.toLocaleString("en-IN")}{suffix}</>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, bg, index }: {
  label: string; value: number; icon: React.ReactNode;
  color: string; bg: string; index: number;
}) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      style={{
        padding: "22px 24px",
        borderRadius: 20,
        background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -24, right: -24, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle,${color}22 0%,transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      </div>
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, color, margin: 0, letterSpacing: "-0.03em", lineHeight: 1 }}>
        <Counter value={value} />
      </p>
    </motion.div>
  );
}

// ─── Backed Project Card ──────────────────────────────────────────────────────
function BackedCard({ project, index }: { project: BackedProjectResponse; index: number }) {
  const { isDark } = useTheme();
  const pct = Math.min(100, Math.round(project.fundedPercentage));
  const statusColor = project.status === "FUNDED" ? "#34d399" : project.status === "ACTIVE" ? "#ff8800" : "#94a3b8";
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.35 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
      style={{
        display: "flex", gap: 14, alignItems: "center", padding: "14px 16px",
        borderRadius: 16,
        background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
        cursor: "default",
        transition: "background 0.15s",
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
        {project.thumbnailUrl
          ? <img src={project.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic.Rocket s={20} />
            </div>
        }
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--text)", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.projectTitle}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700, color: "#ff8800" }}>
            ₹{project.amountBacked.toLocaleString("en-IN")} backed
          </span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>
            {new Date(project.backedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
          <span style={{ marginLeft: "auto", fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: statusColor, background: `${statusColor}14`, padding: "2px 7px", borderRadius: 6 }}>
            {project.status}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, borderRadius: 4, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: 0.5 + index * 0.08, ease: "easeOut" }}
            style={{ height: "100%", borderRadius: 4, background: pct >= 100 ? "#34d399" : "linear-gradient(90deg,#ff6b00,#ffcc00)" }}
          />
        </div>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, color: "var(--text-muted)", margin: "4px 0 0" }}>{pct}% funded</p>
      </div>
    </motion.div>
  );
}

// ─── Quick Action ─────────────────────────────────────────────────────────────
function QuickAction({ href, label, sub, icon, color, bg, index }: {
  href: string; label: string; sub: string; icon: React.ReactNode;
  color: string; bg: string; index: number;
}) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.4 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
    >
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        <div style={{
          padding: "20px 20px",
          borderRadius: 18,
          background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
          boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.04)",
          transition: "all 0.18s ease",
          cursor: "pointer",
          position: "relative", overflow: "hidden",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = `${color}40`;
          el.style.boxShadow = isDark ? `0 8px 32px ${color}18` : `0 8px 32px ${color}20`;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
          el.style.boxShadow = isDark ? "none" : "0 2px 16px rgba(0,0,0,0.04)";
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: `radial-gradient(circle,${color}18 0%,transparent 70%)` }} />
          <div style={{ width: 42, height: 42, borderRadius: 13, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, marginBottom: 14 }}>
            {icon}
          </div>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5, color: "var(--text)", margin: "0 0 4px" }}>{label}</p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{sub}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 14, color }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700 }}>Go</span>
            <Ic.ArrowRight />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHead({ title, href, linkLabel, delay = 0.3 }: { title: string; href?: string; linkLabel?: string; delay?: number }) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>{title}</h2>
      {href && linkLabel && (
        <Link href={href} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "#ff8800", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, opacity: 0.85 }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"; }}>
          {linkLabel} <Ic.ArrowRight />
        </Link>
      )}
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function Empty({ icon, title, sub, cta, href }: { icon: React.ReactNode; title: string; sub: string; cta: string; href: string }) {
  const { isDark } = useTheme();
  return (
    <div style={{ padding: "36px 24px", borderRadius: 20, textAlign: "center", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "var(--text-muted)" }}>
        {icon}
      </div>
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 5px" }}>{title}</p>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: "0 0 18px" }}>{sub}</p>
      <Link href={href} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 10, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px rgba(255,107,0,0.25)" }}>
        {cta} <Ic.ArrowRight />
      </Link>
    </div>
  );
}

// ─── Hero Welcome ─────────────────────────────────────────────────────────────
function HeroWelcome({ user, isCreator, isDark }: { user: any; isCreator: boolean; isDark: boolean }) {
  const initials = user?.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 24, padding: "32px 36px",
        background: isDark
          ? "linear-gradient(135deg, rgba(255,107,0,0.06) 0%, rgba(10,10,10,0) 60%)"
          : "linear-gradient(135deg, rgba(255,107,0,0.05) 0%, rgba(255,255,255,0) 60%)",
        border: `1px solid ${bdr}`,
        marginBottom: 32,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: "30%", width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,204,0,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" as const, position: "relative" }}>
        {/* Avatar */}
        <motion.div whileHover={{ scale: 1.05 }} style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden", border: "3px solid rgba(255,107,0,0.35)", boxShadow: "0 0 24px rgba(255,107,0,0.25)", flexShrink: 0 }}>
          {user?.profileImageUrl
            ? <img src={user.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 24 }}>{initials}</div>
          }
        </motion.div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", margin: "0 0 3px", fontWeight: 600 }}>
            {greeting} 👋
          </p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(22px,4vw,32px)", color: isDark ? "#fff" : "#0a0a0a", letterSpacing: "-0.03em", margin: "0 0 6px", lineHeight: 1.1 }}>
            {user?.name ?? "Explorer"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)" }}>@{user?.username}</span>
            {isCreator ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 8, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: "#34d399", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                <Ic.Shield s={10} /> Verified Creator
              </span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 8, background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)", fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: "#ff8800", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                <Ic.User s={10} /> Backer
              </span>
            )}
            {user?.emailVerified ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 8, background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                <Ic.Check s={9} /> Verified
              </span>
            ) : (
              <Link href="/dashboard/settings" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.05em", textTransform: "uppercase" as const, textDecoration: "none" }}>
                <Ic.Mail s={9} /> Verify Email
              </Link>
            )}
          </div>
        </div>

        {/* CTA */}
        <Link href="/explore" style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 14,
          background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none",
          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
          boxShadow: "0 8px 24px rgba(255,107,0,0.3)", transition: "all 0.2s",
          whiteSpace: "nowrap" as const,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 12px 32px rgba(255,107,0,0.45)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 24px rgba(255,107,0,0.3)"; (e.currentTarget as HTMLAnchorElement).style.transform = "none"; }}>
          <Ic.Compass s={16} />
          Explore Projects
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardOverviewPage() {
  const { user, loading } = useProfile();
  const { isDark } = useTheme();
  const [stats, setStats]     = useState<BackerStatsResponse | null>(null);
  const [backed, setBacked]   = useState<BackedProjectResponse[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const load = useCallback(async () => {
    try {
      const [statsData, backedData] = await Promise.allSettled([
        backerApi.stats(),
        backerApi.backedProjects(),
      ]);
      if (statsData.status === "fulfilled") setStats(statsData.value);
      if (backedData.status === "fulfilled") setBacked(backedData.value ?? []);
    } catch {}
  }, []);

  useEffect(() => { if (!loading && user) load(); }, [loading, user, load]);

  if (!mounted || loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid rgba(255,136,0,0.15)", borderTopColor: "#ff8800" }} />
    </div>
  );

  const isCreator    = !!user?.roles?.includes("CREATOR");
  const recentBacked = backed.slice(0, 5);

  const statCards = [
    { label: "Backed Projects",   value: stats?.totalBacked ?? backed.length,      icon: <Ic.Heart s={17} />,    color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    { label: "Total Contributed", value: stats?.totalAmountBacked ?? 0,             icon: <Ic.Coins s={17} />,    color: "#ff8800", bg: "rgba(255,136,0,0.12)" },
    { label: "Active Campaigns",  value: stats?.activeCampaigns ?? 0,               icon: <Ic.Trend s={17} />,    color: "#34d399", bg: "rgba(52,211,153,0.12)" },
    { label: "Member Since",      value: new Date(user?.createdAt ?? Date.now()).getFullYear(), icon: <Ic.User s={17} />, color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  ];

  const quickActions = [
    { href: "/explore",                    label: "Explore",         sub: "Discover campaigns to back", icon: <Ic.Compass s={20} />, color: "#ff8800",  bg: "rgba(255,136,0,0.12)" },
    { href: "/dashboard/backed",           label: "Backed Projects", sub: "Track your investments",     icon: <Ic.Heart s={20} />,   color: "#ef4444",  bg: "rgba(239,68,68,0.1)"  },
    { href: "/dashboard/saved",            label: "Saved",           sub: "Projects you bookmarked",    icon: <Ic.Bookmark s={20}/>, color: "#a78bfa",  bg: "rgba(167,139,250,0.1)" },
    isCreator
      ? { href: "/dashboard/create-campaign", label: "New Campaign",  sub: "Launch a new campaign",      icon: <Ic.Plus s={20} />,    color: "#34d399",  bg: "rgba(52,211,153,0.1)"  }
      : { href: "/dashboard/become-creator",  label: "Become Creator", sub: "Start raising funds",        icon: <Ic.Rocket s={20} />,  color: "#34d399",  bg: "rgba(52,211,153,0.1)"  },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      {/* Welcome hero */}
      <HeroWelcome user={user} isCreator={isCreator} isDark={isDark} />

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 40 }} className="cs-stats-grid">
        {statCards.map((s, i) => (
          <StatCard key={s.label} index={i}
            label={s.label}
            value={s.value}
            icon={s.icon}
            color={s.color}
            bg={s.bg}
          />
        ))}
      </div>

      {/* Main 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }} className="cs-main-grid">
        {/* Left: Backed Projects */}
        <div>
          <SectionHead title="Recent Backed Projects" href="/dashboard/backed" linkLabel="View all" delay={0.3} />
          {recentBacked.length === 0
            ? <Empty icon={<Ic.Heart />} title="No backed projects yet" sub="Back a campaign to see it here" cta="Explore projects" href="/explore" />
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recentBacked.map((p, i) => <BackedCard key={p.projectId} project={p} index={i} />)}
              </div>
            )
          }
        </div>

        {/* Right: Quick Actions */}
        <div>
          <SectionHead title="Quick Actions" delay={0.3} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {quickActions.map((a, i) => (
              <QuickAction key={a.href} index={i} href={a.href} label={a.label} sub={a.sub} icon={a.icon} color={a.color} bg={a.bg} />
            ))}
          </div>

          {/* Profile completeness nudge */}
          {!user?.emailVerified && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              style={{
                marginTop: 16, padding: "16px 18px", borderRadius: 16,
                background: "linear-gradient(135deg,rgba(245,158,11,0.08),rgba(255,107,0,0.04))",
                border: "1px solid rgba(245,158,11,0.22)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                  <Ic.Mail s={15} />
                </div>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "#f59e0b", margin: 0 }}>Verify your email</p>
              </div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.55 }}>
                Unlock all features by verifying your email address.
              </p>
              <Link href="/dashboard/settings" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 9, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 700, textDecoration: "none" }}>
                Go to Settings <Ic.ArrowRight s={12} />
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        .cs-stats-grid { grid-template-columns: repeat(4,1fr); }
        .cs-main-grid  { grid-template-columns: 1fr 320px; }
        @media(max-width:1100px){ .cs-main-grid{ grid-template-columns:1fr!important; } }
        @media(max-width:820px) { .cs-stats-grid{ grid-template-columns:repeat(2,1fr)!important; } }
        @media(max-width:480px) { .cs-stats-grid{ grid-template-columns:1fr 1fr!important; } }
      `}</style>
    </div>
  );
}
