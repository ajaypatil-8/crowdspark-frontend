"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import {
  backerApi, projectApi,
  type BackedProjectResponse, type BackerStatsResponse,
  type CreatorProjectResponse, type UserResponse,
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
  Sparkle:  ({ s=16 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.09 4.26L17 8l-3.91 1.74L12 14l-1.09-4.26L7 8l3.91-1.74L12 2z" opacity=".6"/><path d="M19 15l.55 2.15L21.7 18l-2.15.85L19 21l-.85-2.15L16 18l2.15-.85L19 15z"/><path d="M5 15l.55 2.15L7.7 18l-2.15.85L5 21l-.85-2.15L2 18l2.15-.85L5 15z" opacity=".4"/></svg>),
  Grid:     ({ s=16 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>),
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display.toLocaleString("en-IN")}{suffix}</>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, bg, index, prefix = "", suffix = "" }: {
  label: string; value: number; icon: React.ReactNode;
  color: string; bg: string; index: number; prefix?: string; suffix?: string;
}) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{
        padding: "24px 24px 22px",
        borderRadius: 20,
        background: isDark
          ? `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)`
          : "#ffffff",
        border: `1px solid ${isDark ? `${color}18` : "rgba(0,0,0,0.06)"}`,
        boxShadow: isDark
          ? `0 0 0 1px ${color}0a, inset 0 1px 0 rgba(255,255,255,0.05)`
          : `0 2px 24px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)`,
        position: "relative", overflow: "hidden",
        cursor: "default",
      }}
    >
      {/* Ambient glow top-right */}
      <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle,${color}22 0%,transparent 70%)`, pointerEvents: "none" }} />
      {/* Bottom stripe accent */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}40, transparent)`, borderRadius: "0 0 20px 20px" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0, boxShadow: `0 4px 12px ${color}22` }}>
          {icon}
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.3)", textTransform: "uppercase" as const, letterSpacing: "0.1em", display: "block", marginBottom: 2 }}>{label}</span>
        </div>
      </div>

      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 30, color, margin: 0, letterSpacing: "-0.04em", lineHeight: 1 }}>
        <Counter value={value} prefix={prefix} suffix={suffix} />
      </p>
    </motion.div>
  );
}

// ─── Backed Project Card ──────────────────────────────────────────────────────
function BackedCard({ project, index }: { project: BackedProjectResponse; index: number }) {
  const { isDark } = useTheme();
  const pct = Math.min(100, Math.round(project.fundedPercentage));
  const statusColor = project.status === "FUNDED" ? "#34d399" : project.status === "ACTIVE" ? "#ff8800" : "#94a3b8";
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.35 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", gap: 14, alignItems: "center", padding: "14px 16px",
        borderRadius: 16,
        background: hovered
          ? isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)"
          : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
        border: `1px solid ${hovered ? (isDark ? "rgba(255,136,0,0.25)" : "rgba(255,107,0,0.15)") : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)")}`,
        cursor: "default",
        transition: "all 0.2s cubic-bezier(.22,1,.36,1)",
        transform: hovered ? "translateX(3px)" : "none",
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: 52, height: 52, borderRadius: 13, flexShrink: 0, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700, color: "#ff8800" }}>
            ₹{project.amountBacked.toLocaleString("en-IN")}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>
            {new Date(project.backedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
          <span style={{ marginLeft: "auto", fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, color: statusColor, background: `${statusColor}14`, padding: "2px 8px", borderRadius: 20, letterSpacing: "0.04em" }}>
            {project.status}
          </span>
        </div>
        <div style={{ height: 3, borderRadius: 3, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.5 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", borderRadius: 3, background: pct >= 100 ? "linear-gradient(90deg,#34d399,#059669)" : "linear-gradient(90deg,#ff6b00,#ffcc00)" }}
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
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.4 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: -2, transition: { duration: 0.18 } }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        <div style={{
          padding: "16px 18px",
          borderRadius: 16,
          background: hov
            ? isDark ? `linear-gradient(135deg, ${color}10, rgba(255,255,255,0.02))` : `linear-gradient(135deg, ${color}08, #fff)`
            : isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
          border: `1px solid ${hov ? `${color}35` : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)")}`,
          boxShadow: hov
            ? isDark ? `0 8px 32px ${color}18` : `0 8px 32px rgba(0,0,0,0.08)`
            : isDark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
          transition: "all 0.2s cubic-bezier(.22,1,.36,1)",
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 14,
          position: "relative", overflow: "hidden",
        }}>
          {/* Left accent line */}
          <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 2, borderRadius: 2, background: hov ? color : "transparent", transition: "background 0.2s" }} />

          <div style={{ width: 40, height: 40, borderRadius: 12, background: hov ? bg : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: hov ? color : "var(--text-muted)", transition: "all 0.2s", flexShrink: 0 }}>
            {icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: hov ? color : "var(--text)", margin: "0 0 2px", transition: "color 0.2s" }}>{label}</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</p>
          </div>
          <motion.div animate={{ x: hov ? 2 : 0, opacity: hov ? 1 : 0.4 }} transition={{ duration: 0.15 }} style={{ color: hov ? color : "var(--text-muted)", flexShrink: 0 }}>
            <Ic.ArrowRight s={13} />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHead({ title, href, linkLabel, delay = 0.3 }: { title: string; href?: string; linkLabel?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text)", margin: 0, letterSpacing: "-0.025em" }}>{title}</h2>
      {href && linkLabel && (
        <Link href={href} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, color: "var(--accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, opacity: 0.8, transition: "opacity 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.8"; }}>
          {linkLabel} <Ic.ArrowRight s={12} />
        </Link>
      )}
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function Empty({ icon, title, sub, cta, href }: { icon: React.ReactNode; title: string; sub: string; cta: string; href: string }) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "36px 24px", borderRadius: 18, textAlign: "center", background: isDark ? "rgba(255,255,255,0.018)" : "rgba(0,0,0,0.018)", border: `1px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 16, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "var(--text-muted)" }}>
        {icon}
      </div>
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 5px" }}>{title}</p>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: "0 0 18px" }}>{sub}</p>
      <Link href={href} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 10, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px rgba(255,107,0,0.28)" }}>
        {cta} <Ic.ArrowRight />
      </Link>
    </motion.div>
  );
}

// ─── Hero Welcome ─────────────────────────────────────────────────────────────
function HeroWelcome({ user, isCreator, isDark }: { user: UserResponse | null; isCreator: boolean; isDark: boolean }) {
  const initials = user?.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 24, padding: "32px 36px 30px",
        background: isDark
          ? "linear-gradient(135deg, rgba(255,107,0,0.07) 0%, rgba(255,204,0,0.03) 40%, rgba(10,10,14,0) 70%)"
          : "linear-gradient(135deg, rgba(255,107,0,0.06) 0%, rgba(255,204,0,0.03) 40%, rgba(255,255,255,0) 70%)",
        border: `1px solid ${isDark ? "rgba(255,107,0,0.14)" : "rgba(255,107,0,0.1)"}`,
        marginBottom: 28,
        position: "relative", overflow: "hidden",
        boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.04) inset" : "0 2px 32px rgba(255,107,0,0.06), 0 1px 0 #fff inset",
      }}
    >
      {/* Decorative orbs */}
      <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,0,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -70, left: "25%", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,204,0,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", top: 20, right: 120, width: 5, height: 5, borderRadius: "50%", background: "rgba(255,204,0,0.4)", pointerEvents: "none" }}
      />
      <motion.div
        animate={{ rotate: [0, -360] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", bottom: 30, left: "35%", width: 3, height: 3, borderRadius: "50%", background: "rgba(255,107,0,0.5)", pointerEvents: "none" }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" as const, position: "relative" }}>
        {/* Avatar */}
        <motion.div whileHover={{ scale: 1.06 }} transition={{ duration: 0.2 }} style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", overflow: "hidden", border: "2.5px solid rgba(255,107,0,0.4)", boxShadow: "0 0 0 4px rgba(255,107,0,0.1), 0 8px 24px rgba(255,107,0,0.2)" }}>
            {user?.profileImageUrl
              ? <img src={user.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 24 }}>{initials}</div>
            }
          </div>
          {/* Online dot */}
          <div style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%", background: "#34d399", border: "2px solid var(--bg)", boxShadow: "0 0 8px rgba(52,211,153,0.5)" }} />
        </motion.div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", margin: "0 0 3px", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}
          >
            {greeting}
            <motion.span animate={{ rotate: [0, 20, -10, 20, 0] }} transition={{ delay: 0.8, duration: 0.6 }} style={{ display: "inline-block" }}>👋</motion.span>
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(22px,3.5vw,30px)", color: isDark ? "#fff" : "#0a0a0a", letterSpacing: "-0.04em", margin: "0 0 8px", lineHeight: 1.1 }}
          >
            {user?.name ?? "Explorer"}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" as const }}
          >
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)" }}>@{user?.username}</span>
            {isCreator ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 20, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.22)", fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, color: "#34d399", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                <Ic.Shield s={9} /> Creator
              </span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 20, background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.18)", fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, color: "#ff8800", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                <Ic.User s={9} /> Backer
              </span>
            )}
            {user?.emailVerified ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 20, background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.18)", fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                <Ic.Check s={9} /> Verified
              </span>
            ) : (
              <Link href="/dashboard/settings" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 20, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.06em", textTransform: "uppercase" as const, textDecoration: "none" }}>
                <Ic.Mail s={9} /> Verify Email
              </Link>
            )}
          </motion.div>
        </div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}
        >
          <Link href="/explore" style={{
            display: "flex", alignItems: "center", gap: 7, padding: "11px 20px", borderRadius: 13,
            background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none",
            fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5,
            boxShadow: "0 6px 20px rgba(255,107,0,0.32)", transition: "all 0.2s",
            whiteSpace: "nowrap" as const, position: "relative", overflow: "hidden",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 10px 30px rgba(255,107,0,0.48)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 20px rgba(255,107,0,0.32)"; (e.currentTarget as HTMLAnchorElement).style.transform = "none"; }}>
            <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.2) 50%,transparent 70%)", animation: "heroShimmer 3s ease-in-out infinite" }} />
            <Ic.Compass s={15} />
            <span style={{ position: "relative" }}>Explore</span>
          </Link>
          {isCreator && (
            <Link href="/dashboard/create-campaign" style={{
              display: "flex", alignItems: "center", gap: 7, padding: "11px 18px", borderRadius: 13,
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: "var(--text)", textDecoration: "none",
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.09)"}`,
              transition: "all 0.2s", whiteSpace: "nowrap" as const,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,107,0,0.3)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.09)"; (e.currentTarget as HTMLAnchorElement).style.transform = "none"; }}>
              <Ic.Plus s={14} /> New Campaign
            </Link>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Live Campaign Row ────────────────────────────────────────────────────────
function LiveCampaignRow({ c, i }: { c: CreatorProjectResponse; i: number }) {
  const { isDark } = useTheme();
  const pct = Math.min(100, Math.round((c.currentAmount / c.goalAmount) * 100));
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      key={c.id}
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", gap: 14, alignItems: "center", padding: "14px 16px",
        borderRadius: 16,
        background: hov
          ? isDark ? "rgba(52,211,153,0.06)" : "rgba(52,211,153,0.04)"
          : isDark ? "rgba(52,211,153,0.03)" : "rgba(52,211,153,0.025)",
        border: `1px solid ${hov ? "rgba(52,211,153,0.25)" : "rgba(52,211,153,0.14)"}`,
        transition: "all 0.2s",
        transform: hov ? "translateX(3px)" : "none",
      }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
        {c.thumbnailUrl
          ? <img src={c.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic.Zap s={20} /></div>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--text)", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700, color: "#34d399" }}>₹{c.currentAmount.toLocaleString("en-IN")}</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-muted)" }} />
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>of ₹{c.goalAmount.toLocaleString("en-IN")}</span>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, color: "#34d399", background: "rgba(52,211,153,0.1)", padding: "2px 8px", borderRadius: 20 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", animation: "livePulse 1.5s ease-in-out infinite" }} />
            LIVE
          </span>
        </div>
        <div style={{ height: 3, borderRadius: 3, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg,#34d399,#059669)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)", animation: "shineSlide 2s ease-in-out infinite" }} />
          </motion.div>
        </div>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, color: "var(--text-muted)", margin: "4px 0 0" }}>{pct}% funded</p>
      </div>
    </motion.div>
  );
}

type DashboardDatum = {
  name: string;
  raised: number;
  projects: number;
  saved: number;
};

const chartTooltipStyle = {
  background: "var(--card-bg-2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
  boxShadow: "var(--card-shadow)",
} as const;

function DashboardChartPanel({
  title,
  eyebrow,
  children,
  delay,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="dash-chart-panel"
    >
      <div className="dash-chart-head">
        <span>{eyebrow}</span>
        <h3>{title}</h3>
      </div>
      <div className="dash-chart-body">{children}</div>
    </motion.section>
  );
}

function DashboardInsights({
  stats,
  backed,
  myCampaigns,
  isCreator,
}: {
  stats: BackerStatsResponse | null;
  backed: BackedProjectResponse[];
  myCampaigns: CreatorProjectResponse[];
  isCreator: boolean;
}) {
  const trendData = useMemo<DashboardDatum[]>(() => {
    const sortedBacked = [...backed]
      .sort((a, b) => new Date(a.backedAt).getTime() - new Date(b.backedAt).getTime())
      .slice(-6);

    if (sortedBacked.length > 0) {
      let cumulative = 0;
      return sortedBacked.map((item, index) => {
        cumulative += item.amountBacked ?? 0;
        return {
          name: new Date(item.backedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
          raised: cumulative,
          projects: index + 1,
          saved: backed.length,
        };
      });
    }

    const total = stats?.totalAmountBacked ?? myCampaigns.reduce((sum, project) => sum + (project.currentAmount ?? 0), 0);
    return ["Start", "Week 1", "Week 2", "Week 3", "Now"].map((name, index, arr) => ({
      name,
      raised: Math.round(total * ((index + 1) / arr.length)),
      projects: Math.max(0, Math.round((stats?.totalBacked ?? myCampaigns.length) * ((index + 1) / arr.length))),
      saved: backed.length,
    }));
  }, [backed, myCampaigns, stats]);

  const barData = useMemo(() => {
    const source = isCreator && myCampaigns.length > 0
      ? myCampaigns.map((project) => ({
          name: project.title.length > 16 ? `${project.title.slice(0, 16)}...` : project.title,
          value: project.currentAmount ?? 0,
        }))
      : backed.map((project) => ({
          name: project.projectTitle.length > 16 ? `${project.projectTitle.slice(0, 16)}...` : project.projectTitle,
          value: project.amountBacked ?? 0,
        }));

    return source
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .concat(source.length === 0 ? [{ name: "No data", value: 0 }] : []);
  }, [backed, isCreator, myCampaigns]);

  const pieData = useMemo(() => {
    const live = isCreator ? myCampaigns.filter((p) => p.status === "APPROVED").length : (stats?.activeCampaigns ?? 0);
    const saved = backed.length;
    const completed = myCampaigns.filter((p) => ["FUNDED", "COMPLETED"].includes(p.status)).length;
    const draft = myCampaigns.filter((p) => ["DRAFT", "PENDING"].includes(p.status)).length;
    const data = [
      { name: "Live", value: live, fill: "var(--success)" },
      { name: "Saved", value: saved, fill: "var(--accent)" },
      { name: "Funded", value: completed, fill: "var(--cta)" },
      { name: "Review", value: draft, fill: "var(--warning)" },
    ].filter((item) => item.value > 0);

    return data.length > 0 ? data : [{ name: "Ready", value: 1, fill: "var(--border-focus)" }];
  }, [backed.length, isCreator, myCampaigns, stats]);

  const activityItems = useMemo(() => {
    const backedItems = backed.slice(0, 3).map((project) => ({
      id: `backed-${project.projectId}`,
      icon: <Ic.Heart s={14} />,
      title: project.projectTitle,
      sub: `Backed with ₹${project.amountBacked.toLocaleString("en-IN")}`,
      time: new Date(project.backedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    }));

    const campaignItems = myCampaigns.slice(0, 3).map((project) => ({
      id: `campaign-${project.id}`,
      icon: <Ic.Rocket s={14} />,
      title: project.title,
      sub: `${project.status.toLowerCase()} campaign`,
      time: project.deadline ? new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "No date",
    }));

    return [...campaignItems, ...backedItems].slice(0, 5);
  }, [backed, myCampaigns]);

  return (
    <motion.div
      className="dash-insights"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay: 0.2 }}
    >
      <DashboardChartPanel title="Funding Momentum" eyebrow="Area chart" delay={0.2}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="dashboardMomentum" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.36} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(value) => `₹${Math.round(Number(value) / 1000)}K`} />
            <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: "var(--text-muted)" }} />
            <Area type="monotone" dataKey="raised" stroke="var(--accent)" strokeWidth={2.5} fill="url(#dashboardMomentum)" />
          </AreaChart>
        </ResponsiveContainer>
      </DashboardChartPanel>

      <DashboardChartPanel title={isCreator ? "Campaign Leaders" : "Recent Donations"} eyebrow="Bar chart" delay={0.28}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(value) => `₹${Math.round(Number(value) / 1000)}K`} />
            <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: "var(--text-muted)" }} />
            <Bar dataKey="value" fill="var(--cta)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </DashboardChartPanel>

      <DashboardChartPanel title="Portfolio Mix" eyebrow="Pie chart" delay={0.36}>
        <div className="dash-pie-wrap">
          <ResponsiveContainer width="48%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={3}>
                {pieData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: "var(--text-muted)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="dash-pie-legend">
            {pieData.map((entry) => (
              <div key={entry.name}>
                <span style={{ background: entry.fill }} />
                <p>{entry.name}</p>
                <strong>{entry.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </DashboardChartPanel>

      <DashboardChartPanel title="Activity Timeline" eyebrow="Recent signals" delay={0.44}>
        <div className="dash-activity">
          {activityItems.length === 0 ? (
            <div className="dash-activity-empty">
              <Ic.Sparkle s={18} />
              <p>Your activity stream will light up after you back or launch a campaign.</p>
            </div>
          ) : activityItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
            >
              <span>{item.icon}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.sub}</p>
              </div>
              <time>{item.time}</time>
            </motion.div>
          ))}
        </div>
      </DashboardChartPanel>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardOverviewPage() {
  const { user, loading } = useProfile();
  const { isDark } = useTheme();
  const [stats, setStats]         = useState<BackerStatsResponse | null>(null);
  const [backed, setBacked]       = useState<BackedProjectResponse[]>([]);
  const [myCampaigns, setMyCampaigns] = useState<CreatorProjectResponse[]>([]);
  const [mounted, setMounted]     = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const load = useCallback(async () => {
    try {
      const isCreatorUser = user?.roles?.includes("CREATOR");
      const calls = [
        backerApi.stats(),
        backerApi.backedProjects(),
        isCreatorUser ? projectApi.myProjects() : Promise.resolve([] as CreatorProjectResponse[]),
      ] as const;
      const results = await Promise.allSettled(calls);
      if (results[0].status === "fulfilled") setStats(results[0].value);
      if (results[1].status === "fulfilled") setBacked(results[1].value ?? []);
      if (isCreatorUser && results[2].status === "fulfilled") setMyCampaigns(results[2].value ?? []);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (loading || !user) return;
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loading, user, load]);

  if (!mounted || loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        style={{ width: 36, height: 36, borderRadius: "50%", border: "2.5px solid rgba(255,136,0,0.12)", borderTopColor: "var(--accent)" }} />
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)" }}>Loading your dashboard…</p>
    </div>
  );

  const isCreator    = !!user?.roles?.includes("CREATOR");
  const recentBacked = backed.slice(0, 5);
  const activeCampaignCount = isCreator
    ? myCampaigns.filter(c => c.status === "APPROVED").length
    : (stats?.activeCampaigns ?? 0);

  const statCards = [
    { label: "Backed Projects",   value: stats?.totalBacked ?? backed.length,   icon: <Ic.Heart s={17} />,    color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    { label: "Contributed",       value: stats?.totalAmountBacked ?? 0,          icon: <Ic.Coins s={17} />,    color: "#ff8800", bg: "rgba(255,136,0,0.12)",  prefix: "₹" },
    { label: isCreator ? "Live Campaigns" : "Active",
                                  value: activeCampaignCount,                    icon: <Ic.Trend s={17} />,    color: "#34d399", bg: "rgba(52,211,153,0.12)" },
    { label: "Member Since",      value: user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear(),
                                                                                  icon: <Ic.User s={17} />,     color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  ];

  const quickActions = [
    { href: "/explore",                    label: "Explore",         sub: "Discover new campaigns",         icon: <Ic.Compass s={18} />, color: "#ff8800",  bg: "rgba(255,136,0,0.12)" },
    { href: "/dashboard/backed",           label: "Backed Projects", sub: "Track your investments",         icon: <Ic.Heart s={18} />,   color: "#ef4444",  bg: "rgba(239,68,68,0.1)"  },
    { href: "/dashboard/saved",            label: "Saved",           sub: "Projects you bookmarked",        icon: <Ic.Bookmark s={18}/>, color: "#a78bfa",  bg: "rgba(167,139,250,0.1)" },
    isCreator
      ? { href: "/dashboard/create-campaign", label: "New Campaign",   sub: "Launch a new campaign",        icon: <Ic.Plus s={18} />,    color: "#34d399",  bg: "rgba(52,211,153,0.1)"  }
      : { href: "/dashboard/become-creator",  label: "Become Creator", sub: "Start raising funds",          icon: <Ic.Rocket s={18} />,  color: "#34d399",  bg: "rgba(52,211,153,0.1)"  },
    { href: "/dashboard/my-campaigns",     label: "My Campaigns",    sub: "Manage your campaigns",          icon: <Ic.Grid s={18} />,    color: "#f59e0b",  bg: "rgba(245,158,11,0.1)"  },
  ];

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 24px 80px" }}>
      {/* Welcome hero */}
      <HeroWelcome user={user} isCreator={isCreator} isDark={isDark} />

      {/* Stats row */}
      <div className="dash-overview-stats" style={{ marginBottom: 36 }}>
        {statCards.map((s, i) => (
          <StatCard key={s.label} index={i}
            label={s.label} value={s.value}
            icon={s.icon} color={s.color} bg={s.bg}
            prefix={(s as { prefix?: string }).prefix ?? ""}
          />
        ))}
      </div>

      <DashboardInsights
        stats={stats}
        backed={backed}
        myCampaigns={myCampaigns}
        isCreator={isCreator}
      />

      {/* Main 2-col layout */}
      <div className="dash-overview-main">
        {/* Left col */}
        <div>
          {/* Creator live campaigns */}
          {isCreator && myCampaigns.filter(c => c.status === "APPROVED").length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <SectionHead title="Your Live Campaigns" href="/dashboard/my-campaigns" linkLabel="Manage all" delay={0.25} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {myCampaigns.filter(c => c.status === "APPROVED").slice(0, 3).map((c, i) => (
                  <LiveCampaignRow key={c.id} c={c} i={i} />
                ))}
              </div>
            </div>
          )}

          {/* Backed Projects */}
          <SectionHead title="Recent Backed Projects" href="/dashboard/backed" linkLabel="View all" delay={0.3} />
          <AnimatePresence>
            {recentBacked.length === 0
              ? <Empty icon={<Ic.Heart />} title="No backed projects yet" sub="Back a campaign to see it here" cta="Explore projects" href="/explore" />
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recentBacked.map((p, i) => <BackedCard key={p.projectId} project={p} index={i} />)}
                </div>
              )
            }
          </AnimatePresence>
        </div>

        {/* Right: Quick Actions + nudge */}
        <div>
          <SectionHead title="Quick Actions" delay={0.3} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quickActions.map((a, i) => (
              <QuickAction key={a.href} index={i} href={a.href} label={a.label} sub={a.sub} icon={a.icon} color={a.color} bg={a.bg} />
            ))}
          </div>

          {/* Profile completeness nudge */}
          {!user?.emailVerified && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.75 }}
              style={{
                marginTop: 14, padding: "16px 18px", borderRadius: 16,
                background: "linear-gradient(135deg,rgba(245,158,11,0.07),rgba(255,107,0,0.04))",
                border: "1px solid rgba(245,158,11,0.2)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: -20, right: -20, width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,0.18),transparent 70%)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                  <Ic.Mail s={14} />
                </div>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "#f59e0b", margin: 0 }}>Verify your email</p>
              </div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.55 }}>
                Unlock all features by verifying your email address.
              </p>
              <Link href="/dashboard/settings" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 9, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.22)", color: "#f59e0b", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 700, textDecoration: "none" }}>
                Go to Settings <Ic.ArrowRight s={11} />
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        .dash-overview-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .dash-overview-main {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 28px;
        }
        .dash-insights {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
          gap: 14px;
          margin: -14px 0 34px;
        }
        .dash-chart-panel {
          min-height: 292px;
          border-radius: 18px;
          border: 1px solid var(--card-border);
          background: var(--card-bg);
          box-shadow: var(--card-shadow);
          backdrop-filter: blur(18px);
          overflow: hidden;
          position: relative;
        }
        .dash-chart-panel::before {
          content: "";
          position: absolute;
          top: 0;
          left: 12%;
          right: 12%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-dim), transparent);
        }
        .dash-chart-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 20px 4px;
        }
        .dash-chart-head span {
          color: var(--text-muted);
          font-family: "DM Sans", sans-serif;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .dash-chart-head h3 {
          color: var(--text);
          font-family: "Syne", sans-serif;
          font-size: 17px;
          font-weight: 900;
          letter-spacing: 0;
          margin: 4px 0 0;
        }
        .dash-chart-body {
          height: 230px;
          padding: 4px 12px 16px;
        }
        .dash-pie-wrap {
          display: flex;
          align-items: center;
          height: 100%;
          gap: 12px;
        }
        .dash-pie-legend {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 9px;
          min-width: 0;
        }
        .dash-pie-legend div,
        .dash-activity > div {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--bg-ghost);
          padding: 10px 12px;
        }
        .dash-pie-legend span {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          flex: 0 0 auto;
        }
        .dash-pie-legend p,
        .dash-activity p {
          color: var(--text-muted);
          font-family: "DM Sans", sans-serif;
          font-size: 12px;
          margin: 0;
        }
        .dash-pie-legend strong,
        .dash-activity strong {
          color: var(--text);
          font-family: "Syne", sans-serif;
          font-size: 13px;
          margin-left: auto;
        }
        .dash-activity {
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: 100%;
        }
        .dash-activity > div > span {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          background: var(--accent-dim);
          border: 1px solid var(--border);
          flex: 0 0 auto;
        }
        .dash-activity > div > div {
          min-width: 0;
          flex: 1;
        }
        .dash-activity strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin: 0 0 2px;
        }
        .dash-activity time {
          color: var(--text-muted);
          font-family: "DM Sans", sans-serif;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }
        .dash-activity-empty {
          min-height: 148px;
          justify-content: center;
          text-align: center;
          flex-direction: column;
        }
        @media (max-width: 1100px) { .dash-overview-main { grid-template-columns: 1fr !important; } }
        @media (max-width: 980px)  { .dash-insights { grid-template-columns: 1fr !important; } }
        @media (max-width: 860px)  { .dash-overview-stats { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px)  { .dash-overview-stats { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 520px)  {
          .dash-chart-panel { min-height: auto; }
          .dash-chart-body { height: 240px; padding-left: 6px; padding-right: 6px; }
          .dash-pie-wrap { flex-direction: column; align-items: stretch; }
          .dash-pie-wrap > div:first-child { width: 100% !important; height: 120px !important; }
        }
        @media (max-width: 400px)  { .dash-overview-stats { grid-template-columns: 1fr !important; } }
        @keyframes heroShimmer { 0%{transform:translateX(-120%)} 60%,100%{transform:translateX(220%)} }
        @keyframes livePulse { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:1;transform:scale(1.7)} }
        @keyframes shineSlide { 0%{transform:translateX(-100%)} 60%,100%{transform:translateX(200%)} }
      `}</style>
    </div>
  );
}
