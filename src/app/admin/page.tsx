"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import {
  adminApi, type AdminProjectResponse, type KycStatusResponse, type UserResponse,
} from "@/lib/api";

const ACCENT = "#7c3aed";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Users:    ({ s=20 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>),
  Rocket:   ({ s=20 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg>),
  FileCheck:({ s=20 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>),
  Zap:      ({ s=20 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
  ArrowRight: ({ s=13 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>),
  Clock:    ({ s=16 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
  Check:    ({ s=14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
  Shield:   ({ s=20 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
  Refresh:  ({ s=14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>),
  Coins:    ({ s=20 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1110.34 18"/><path d="M7 6h1v4"/></svg>),
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display.toLocaleString("en-IN")}{suffix}</>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, bg, index, href }: {
  label: string; value: number; icon: React.ReactNode;
  color: string; bg: string; index: number; href?: string;
}) {
  const { isDark } = useTheme();
  const cardContent = (
    <div style={{
      padding: "22px 24px", borderRadius: 20,
      background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
      boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)",
      position: "relative", overflow: "hidden", cursor: href ? "pointer" : "default",
      transition: "border-color 0.18s",
    }}
    onMouseEnter={e => { if (href) (e.currentTarget as HTMLDivElement).style.borderColor = `${color}35`; }}
    onMouseLeave={e => { if (href) (e.currentTarget as HTMLDivElement).style.borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"; }}>
      <div style={{ position: "absolute", top: -24, right: -24, width: 88, height: 88, borderRadius: "50%", background: `radial-gradient(circle,${color}20 0%,transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>{icon}</div>
        {href && <span style={{ color, display: "flex", opacity: 0.6 }}><Ic.ArrowRight /></span>}
      </div>
      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 34, color, margin: "0 0 4px", letterSpacing: "-0.03em", lineHeight: 1 }}>
        <Counter value={value} />
      </p>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>{label}</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
    >
      {href ? <Link href={href} style={{ textDecoration: "none" }}>{cardContent}</Link> : cardContent}
    </motion.div>
  );
}

// ─── KYC Row ──────────────────────────────────────────────────────────────────
function KycRow({ kyc, index, isDark }: { kyc: KycStatusResponse; index: number; isDark: boolean }) {
  const bdr = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const initials = kyc.username?.slice(0, 2).toUpperCase() ?? "KY";
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.35 + index * 0.07 }}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: 14, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)", border: `1px solid ${bdr}`, transition: "background 0.15s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = isDark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.03)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)"; }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg,${ACCENT},#a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {kyc.username || "Applicant"}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)" }}>{kyc.panNumber}</span>
          {kyc.submittedAt && (
            <>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>
                {new Date(kyc.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </>
          )}
        </div>
      </div>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700 }}>
        <Ic.Clock s={10} /> Pending
      </span>
    </motion.div>
  );
}

// ─── Project Row ──────────────────────────────────────────────────────────────
function ProjectRow({ project, index, isDark }: { project: AdminProjectResponse; index: number; isDark: boolean }) {
  const bdr = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.35 + index * 0.07 }}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: 14, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)", border: `1px solid ${bdr}`, transition: "background 0.15s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = isDark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.03)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)"; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
        {project.thumbnailUrl
          ? <img src={project.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic.Rocket s={18} /></div>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.title}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "#ff8800", fontWeight: 600 }}>@{project.creatorUsername}</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-muted)" }} />
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>₹{(project.goalAmount / 1000).toFixed(0)}K goal</span>
        </div>
      </div>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" as const }}>
        <Ic.Clock s={10} /> Review
      </span>
    </motion.div>
  );
}

// ─── Section Panel ────────────────────────────────────────────────────────────
function Panel({ title, icon, color, count, href, linkLabel, children, index, isEmpty, emptyMsg }: {
  title: string; icon: React.ReactNode; color: string; count: number;
  href: string; linkLabel: string; children: React.ReactNode;
  index: number; isEmpty: boolean; emptyMsg: string;
}) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 22, overflow: "hidden",
        background: isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
        background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)",
        position: "relative",
      }}>
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg,transparent,${color}50,transparent)` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}14`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
          <div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, color: "var(--text)", margin: 0 }}>{title}</h2>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {count > 0 && (
            <span style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 800, fontSize: 13, color, background: `${color}12`, padding: "3px 10px", borderRadius: 8, border: `1px solid ${color}22` }}>{count}</span>
          )}
          <Link href={href} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, color, textDecoration: "none", opacity: 0.85 }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"; }}>
            {linkLabel} <Ic.ArrowRight />
          </Link>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: "16px" }}>
        {isEmpty ? (
          <div style={{ padding: "28px 16px", textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--text-muted)" }}>{icon}</div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>{emptyMsg}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────
function AdminHero({ user, isDark }: { user: UserResponse | null; isDark: boolean }) {
  const initials = user?.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() ?? "AD";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 24, padding: "28px 32px", marginBottom: 28,
        background: isDark
          ? `linear-gradient(135deg, ${ACCENT}08 0%, rgba(10,10,10,0) 60%)`
          : `linear-gradient(135deg, ${ACCENT}06 0%, rgba(255,255,255,0) 60%)`,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle,${ACCENT}10 0%,transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" as const, position: "relative" }}>
        <div style={{ width: 58, height: 58, borderRadius: "50%", overflow: "hidden", border: `3px solid ${ACCENT}40`, boxShadow: `0 0 22px ${ACCENT}25`, flexShrink: 0 }}>
          {user?.profileImageUrl
            ? <img src={user.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${ACCENT},#a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 20 }}>{initials}</div>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", margin: "0 0 3px", fontWeight: 600 }}>{greeting} 👋</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: "clamp(20px,3.5vw,28px)", color: isDark ? "#fff" : "#0a0a0a", letterSpacing: "-0.03em", margin: "0 0 7px", lineHeight: 1.1 }}>{user?.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}25`, fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: ACCENT, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
              <Ic.Shield s={10} /> Administrator
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399", animation: "admPulse 1.5s ease-in-out infinite" }} />
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "#34d399", fontWeight: 600 }}>Live</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }} className="adm-hero-actions">
          {[
            { href: "/admin/kyc",      label: "Review KYC",      color: "#34d399",  bg: "rgba(52,211,153,0.1)"  },
            { href: "/admin/projects", label: "Review Projects",  color: "#f59e0b",  bg: "rgba(245,158,11,0.1)"  },
          ].map(btn => (
            <Link key={btn.href} href={btn.href} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 12,
              background: btn.bg, border: `1px solid ${btn.color}30`, color: btn.color,
              fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 700, textDecoration: "none",
              transition: "all 0.18s", whiteSpace: "nowrap" as const,
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = `${btn.color}55`; el.style.boxShadow = `0 4px 16px ${btn.color}20`; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = `${btn.color}30`; el.style.boxShadow = "none"; }}>
              {btn.label} <Ic.ArrowRight />
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes admPulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.6)}}
        @media(max-width:700px){ .adm-hero-actions{ display:none!important; } }
      `}</style>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminOverviewPage() {
  const { user, loading } = useProfile();
  const { isDark } = useTheme();
  const [users, setUsers]         = useState<UserResponse[]>([]);
  const [pendingKyc, setPendingKyc]       = useState<KycStatusResponse[]>([]);
  const [pendingProjects, setPending] = useState<AdminProjectResponse[]>([]);
  const [allProjects, setAllProjects]   = useState<AdminProjectResponse[]>([]);
  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const results = await Promise.allSettled([
        adminApi.allUsers(),
        adminApi.pendingKyc(),
        adminApi.pendingProjects(),
        adminApi.allProjects(),
      ]);
      if (results[0].status === "fulfilled") setUsers(results[0].value ?? []);
      if (results[1].status === "fulfilled") setPendingKyc(results[1].value ?? []);
      if (results[2].status === "fulfilled") setPending(results[2].value ?? []);
      if (results[3].status === "fulfilled") setAllProjects(results[3].value ?? []);
    } catch {}
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loading, user, load]);

  if (!mounted || loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{ width: 32, height: 32, borderRadius: "50%", border: `2.5px solid ${ACCENT}25`, borderTopColor: ACCENT }} />
    </div>
  );

  const creators  = users.filter(u => (u.roles ?? []).includes("CREATOR")).length;
  const backers   = users.filter(u => (u.roles ?? []).includes("BACKER")).length;
  const suspended = users.filter(u => (u.accountStatus as string) === "SUSPENDED").length;
  const activeProjects = allProjects.filter(p => p.status === "ACTIVE" || p.status === "FUNDED").length;

  const statCards = [
    { label: "Total Users",      value: users.length,          icon: <Ic.Users s={18} />,     color: ACCENT,    bg: `${ACCENT}14`,              href: "/admin/users" },
    { label: "Creators",         value: creators,              icon: <Ic.Rocket s={18} />,    color: "#ff8800",  bg: "rgba(255,136,0,0.12)",     href: "/admin/users" },
    { label: "Pending KYC",      value: pendingKyc.length,     icon: <Ic.FileCheck s={18} />, color: "#34d399",  bg: "rgba(52,211,153,0.12)",    href: "/admin/kyc" },
    { label: "Pending Projects", value: pendingProjects.length, icon: <Ic.Zap s={18} />,      color: "#f59e0b",  bg: "rgba(245,158,11,0.12)",    href: "/admin/projects" },
    { label: "Active Campaigns", value: activeProjects,        icon: <Ic.Coins s={18} />,     color: "#60a5fa",  bg: "rgba(96,165,250,0.12)",    href: "/admin/projects" },
    { label: "Suspended",        value: suspended,             icon: <Ic.Shield s={18} />,    color: "#ef4444",  bg: "rgba(239,68,68,0.12)",     href: "/admin/users" },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      {/* Hero */}
      <AdminHero user={user} isDark={isDark} />

      {/* Refresh button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button
          onClick={load} disabled={refreshing}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            background: "transparent", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif",
            fontSize: 13, fontWeight: 600, cursor: refreshing ? "wait" : "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = "var(--text)"; el.style.borderColor = `${ACCENT}44`; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = "var(--text-muted)"; el.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; }}
        >
          <motion.span animate={refreshing ? { rotate: 360 } : { rotate: 0 }} transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: "linear" } : {}} style={{ display: "flex" }}>
            <Ic.Refresh />
          </motion.span>
          Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginBottom: 32 }} className="adm-stats">
        {statCards.map((s, i) => (
          <StatCard key={s.label} index={i} label={s.label} value={s.value} icon={s.icon} color={s.color} bg={s.bg} href={s.href} />
        ))}
      </div>

      {/* 2-col queue panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="adm-panels">
        {/* KYC Queue */}
        <Panel
          title="KYC Queue"
          icon={<Ic.FileCheck s={16} />}
          color="#34d399"
          count={pendingKyc.length}
          href="/admin/kyc"
          linkLabel="Review all"
          index={0}
          isEmpty={pendingKyc.length === 0}
          emptyMsg="No pending KYC applications"
        >
          {pendingKyc.slice(0, 6).map((kyc, i) => (
            <KycRow key={kyc.userId ?? i} kyc={kyc} index={i} isDark={isDark} />
          ))}
        </Panel>

        {/* Project Queue */}
        <Panel
          title="Projects Pending Review"
          icon={<Ic.Zap s={16} />}
          color="#f59e0b"
          count={pendingProjects.length}
          href="/admin/projects"
          linkLabel="Review all"
          index={1}
          isEmpty={pendingProjects.length === 0}
          emptyMsg="No projects pending review"
        >
          {pendingProjects.slice(0, 6).map((p, i) => (
            <ProjectRow key={p.id} project={p} index={i} isDark={isDark} />
          ))}
        </Panel>
      </div>

      <style>{`
        .adm-stats  { grid-template-columns:repeat(6,1fr); }
        .adm-panels { grid-template-columns:1fr 1fr; }
        @media(max-width:1100px){ .adm-stats{ grid-template-columns:repeat(3,1fr)!important; } }
        @media(max-width:780px) { .adm-stats{ grid-template-columns:repeat(2,1fr)!important; } .adm-panels{ grid-template-columns:1fr!important; } }
        @media(max-width:460px) { .adm-stats{ grid-template-columns:1fr 1fr!important; } }
      `}</style>
    </div>
  );
}
