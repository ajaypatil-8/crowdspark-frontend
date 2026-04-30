"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/contexts/ThemeContext";
import { calcCompletion } from "@/lib/profile";
import {
  StatCard, SectionCard, ActivityFeed, EmptyState,
  StatsSkeleton, WidgetSkeleton, ProfileCompletionBar, AnimatedCounter,
  type ActivityItem,
} from "@/components/dashboard/widgets";

// ─── Icons ─────────────────────────────────────────────────────────────────────
const Ic = {
  Heart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  Rupee: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12M6 8h12M6 21L12 8M6 13l8.5 8"/><path d="M6 8a4 4 0 000 5h4"/>
    </svg>
  ),
  Rocket: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
    </svg>
  ),
  TrendUp: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Zap: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Compass: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  ),
  User: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Warning: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Retry: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
    </svg>
  ),
};

// ─── Quick Action Card ─────────────────────────────────────────────────────────
function QuickAction({
  icon, label, sub, href, accent
}: {
  icon: React.ReactNode; label: string; sub: string; href: string; accent: string;
}) {
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState(false);
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", borderRadius: 14,
        border: `1px solid ${hovered ? accent + "44" : bdr}`,
        textDecoration: "none",
        background: hovered
          ? (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)")
          : "transparent",
        transition: "all 0.18s cubic-bezier(.22,1,.36,1)",
        transform: hovered ? "translateX(3px)" : "translateX(0)",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: accent, fontSize: 16,
        border: `1px solid ${bdr}`,
        boxShadow: hovered ? `0 0 14px ${accent}44` : "none",
        transition: "box-shadow 0.2s",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600,
          color: "var(--text)", margin: 0,
        }}>{label}</p>
        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)",
          margin: "1px 0 0",
        }}>{sub}</p>
      </div>
      <span style={{ color: "var(--text-muted)", opacity: 0.4, display: "flex" }}>
        <Ic.ArrowRight />
      </span>
    </Link>
  );
}

// ─── Badge alert banner ────────────────────────────────────────────────────────
function AlertBanner({ type, message, isDark }: { type: "warn" | "success"; message: string; isDark: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  const bg = type === "warn"
    ? (isDark ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.07)")
    : (isDark ? "rgba(34,197,94,0.08)" : "rgba(34,197,94,0.07)");
  const color = type === "warn" ? "#f59e0b" : "#22c55e";
  const bdr = `1px solid ${color}33`;

  if (dismissed) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "11px 16px", borderRadius: 14,
        background: bg, border: bdr, marginBottom: 22,
      }}
    >
      <span style={{ color, display: "flex" }}>
        {type === "warn" ? <Ic.Warning /> : <Ic.Shield />}
      </span>
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text)", flex: 1 }}>
        {message}
      </span>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13,
          padding: "2px 6px", borderRadius: 6,
        }}
      >
        ✕
      </button>
    </motion.div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function PageSkeleton() {
  const { isDark } = useTheme();
  return (
    <div style={{ padding: "36px 36px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <WidgetSkeleton height={14} />
        <div style={{ marginTop: 10 }}><WidgetSkeleton height={36} /></div>
      </div>
      <StatsSkeleton />
      <div style={{ marginTop: 24, display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
        <WidgetSkeleton height={220} delay={0.1}/>
        <WidgetSkeleton height={220} delay={0.2}/>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading, error, refetch } = useProfile();
  const { isDark } = useTheme();

  if (loading) return <PageSkeleton />;

  if (error || !user) {
    return (
      <div style={{ padding: "40px 36px", maxWidth: 560 }}>
        <div style={{
          padding: "20px 22px", borderRadius: 18,
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
            <span style={{ color: "#ef4444", display: "flex", marginTop: 2 }}><Ic.Warning /></span>
            <div>
              <p style={{
                fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
                color: "#ef4444", margin: "0 0 5px",
              }}>
                Could not load dashboard
              </p>
              <p style={{
                fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
                color: "var(--text-muted)", margin: 0,
              }}>
                {error ?? "Unknown error. Check the backend."}
              </p>
            </div>
          </div>
          <button
            onClick={refetch}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 18px",
              background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
              color: "#fff", border: "none", borderRadius: 10, cursor: "pointer",
              fontSize: 13.5, fontFamily: "Syne, sans-serif", fontWeight: 700,
            }}
          >
            <Ic.Retry /> Retry
          </button>
        </div>
      </div>
    );
  }

  const isCreator = user.roles?.includes("CREATOR");
  const pct = calcCompletion(user);

  const statsData = [
    {
      icon: <Ic.Heart />,
      label: "Projects Backed",
      value: user.totalProjectsBacked ?? 0,
      accentColor: "#ef4444",
      delay: 100,
    },
    {
      icon: <Ic.Rupee />,
      label: "Total Backed",
      value: `₹${((user.totalAmountBacked ?? 0) / 1000).toFixed(1)}K`,
      accentColor: "#f59e0b",
      delay: 180,
    },
    ...(isCreator ? [
      {
        icon: <Ic.Rocket />,
        label: "Campaigns Created",
        value: user.totalProjectsCreated ?? 0,
        accentColor: "#8b5cf6",
        delay: 260,
      },
      {
        icon: <Ic.TrendUp />,
        label: "Total Raised",
        value: `₹${((user.totalFundsRaised ?? 0) / 1000).toFixed(1)}K`,
        accentColor: "#22c55e",
        delay: 340,
      },
    ] : [
      {
        icon: <Ic.Rocket />,
        label: "Campaigns Explored",
        value: "—",
        accentColor: "#8b5cf6",
        delay: 260,
      },
    ]),
  ];

  const quickActions = isCreator ? [
    { icon: "🚀", label: "Create Campaign", sub: "Launch a new project", href: "/dashboard/create-campaign", accent: "#ff8800" },
    { icon: "⚡", label: "My Campaigns", sub: "Manage your projects", href: "/dashboard/my-campaigns", accent: "#8b5cf6" },
    { icon: "🔍", label: "Explore", sub: "Discover campaigns", href: "/explore", accent: "#22c55e" },
    { icon: "👤", label: "Edit Profile", sub: "Update your info", href: "/dashboard/profile", accent: "#3b82f6" },
  ] : [
    { icon: "🔍", label: "Explore Campaigns", sub: "Discover new projects", href: "/explore", accent: "#ff8800" },
    { icon: "💜", label: "Backed Projects", sub: "View your contributions", href: "/dashboard/backed", accent: "#8b5cf6" },
    { icon: "🔖", label: "Saved Projects", sub: "Your wishlist", href: "/dashboard/saved", accent: "#22c55e" },
    { icon: "🌟", label: "Become a Creator", sub: "Launch your first campaign", href: "/dashboard/become-creator", accent: "#f59e0b" },
  ];

  const activityItems: ActivityItem[] = [
    ...(user.totalProjectsBacked > 0 ? [{
      id: "b1", icon: "💜", title: `${user.totalProjectsBacked} project${user.totalProjectsBacked === 1 ? "" : "s"} backed`,
      sub: `Total contribution: ₹${(user.totalAmountBacked ?? 0).toLocaleString("en-IN")}`,
      time: "Recent",
    }] : []),
    ...(isCreator && user.totalProjectsCreated > 0 ? [{
      id: "c1", icon: "🚀", title: `${user.totalProjectsCreated} campaign${user.totalProjectsCreated === 1 ? "" : "s"} created`,
      sub: `Total raised: ₹${(user.totalFundsRaised ?? 0).toLocaleString("en-IN")}`,
      time: "Lifetime",
    }] : []),
    {
      id: "j1", icon: "🎉", title: "Joined CrowdSpark-X",
      sub: "Welcome to the community!",
      time: new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
    },
  ];

  const kycStatus = user.kycStatus;
  const needsKyc = !user.kycVerified && kycStatus !== "PENDING";
  const kycPending = kycStatus === "PENDING";

  return (
    <div style={{ padding: "32px 32px 60px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Alerts */}
      <AnimatePresence>
        {needsKyc && isCreator && (
          <AlertBanner
            type="warn"
            message="Complete KYC verification to receive payouts from your campaigns."
            isDark={isDark}
          />
        )}
        {kycPending && (
          <AlertBanner
            type="warn"
            message="Your KYC is under review. You'll be notified once it's approved."
            isDark={isDark}
          />
        )}
        {!user.emailVerified && (
          <AlertBanner
            type="warn"
            message="Please verify your email address to unlock all features."
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 28 }}
      >
        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)",
          margin: "0 0 5px", fontWeight: 500,
        }}>
          {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"} 👋
        </p>
        <h1 style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28,
          color: "var(--text)", margin: 0, letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}>
          Welcome back, {user.name?.split(" ")[0]}
        </h1>
        {isCreator && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8,
            padding: "4px 10px", borderRadius: 20,
            background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.22)",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff8800" }}/>
            <span style={{
              fontSize: 11, fontFamily: "DM Sans, sans-serif", fontWeight: 700,
              color: "#ff8800", letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              Creator Account
            </span>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div style={{
        display: "grid", gap: 16, marginBottom: 24,
        gridTemplateColumns: `repeat(${statsData.length}, 1fr)`,
      }}
        className="cs-dash-stats"
      >
        {statsData.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Main Grid */}
      <div style={{
        display: "grid", gap: 20,
        gridTemplateColumns: "1fr 340px",
      }}
        className="cs-dash-main"
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Quick Actions */}
          <SectionCard
            title="Quick Actions"
            icon={<Ic.Zap />}
            delay={300}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {quickActions.map((a) => (
                <QuickAction key={a.href} {...a} />
              ))}
            </div>
          </SectionCard>

          {/* Activity */}
          <SectionCard
            title="Recent Activity"
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            }
            delay={380}
          >
            <ActivityFeed items={activityItems} emptyMessage="No activity yet"/>
          </SectionCard>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              borderRadius: 20, overflow: "hidden",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
              background: isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
              boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.04)",
            }}
          >
            {/* Banner */}
            <div style={{
              height: 80,
              background: user.bannerImageUrl
                ? `url(${user.bannerImageUrl}) center/cover`
                : "linear-gradient(135deg,#ff6b00 0%,#ff9500 40%,#ffcc00 100%)",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.25) 100%)",
              }}/>
            </div>

            {/* Avatar + Info */}
            <div style={{ padding: "0 18px 18px", position: "relative" }}>
              <div style={{
                width: 58, height: 58, borderRadius: "50%",
                border: `3px solid ${isDark ? "#0d0d0d" : "#ffffff"}`,
                overflow: "hidden", marginTop: -30, marginBottom: 10,
                boxShadow: "0 0 0 2px rgba(255,107,0,0.35)",
              }}>
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20,
                  }}>
                    {user.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                )}
              </div>
              <p style={{
                fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
                color: "var(--text)", margin: "0 0 2px",
              }}>
                {user.name}
              </p>
              <p style={{
                fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)",
                margin: "0 0 12px",
              }}>
                @{user.username}
              </p>

              {pct < 100 && <ProfileCompletionBar pct={pct}/>}

              {/* Badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: pct < 100 ? 12 : 0 }}>
                {user.emailVerified && (
                  <span style={{
                    fontSize: 10.5, fontFamily: "DM Sans, sans-serif", fontWeight: 600,
                    padding: "3px 8px", borderRadius: 20,
                    background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
                    color: "#22c55e",
                  }}>
                    ✓ Email Verified
                  </span>
                )}
                {user.kycVerified && (
                  <span style={{
                    fontSize: 10.5, fontFamily: "DM Sans, sans-serif", fontWeight: 600,
                    padding: "3px 8px", borderRadius: 20,
                    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                    color: "#8b5cf6",
                  }}>
                    ✓ KYC Verified
                  </span>
                )}
                {isCreator && (
                  <span style={{
                    fontSize: 10.5, fontFamily: "DM Sans, sans-serif", fontWeight: 600,
                    padding: "3px 8px", borderRadius: 20,
                    background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)",
                    color: "#ff8800",
                  }}>
                    🚀 Creator
                  </span>
                )}
              </div>

              <Link href="/dashboard/profile" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                marginTop: 14, padding: "9px",
                background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
                color: "#fff", borderRadius: 12, textDecoration: "none",
                fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12.5,
                boxShadow: "0 4px 14px rgba(255,107,0,0.3)",
                transition: "opacity 0.15s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
              >
                <Ic.User /> Edit Profile
              </Link>
            </div>
          </motion.div>

          {/* Platform tips */}
          <SectionCard title="Get Started" delay={460}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { done: user.emailVerified, label: "Verify your email", href: "/dashboard/settings", icon: "📧" },
                { done: pct >= 80, label: "Complete your profile", href: "/dashboard/profile", icon: "👤" },
                { done: user.kycVerified, label: "Complete KYC", href: "/dashboard/settings", icon: "🛡️" },
                ...(isCreator ? [{ done: user.totalProjectsCreated > 0, label: "Launch first campaign", href: "/dashboard/create-campaign", icon: "🚀" }]
                  : [{ done: user.totalProjectsBacked > 0, label: "Back your first project", href: "/explore", icon: "💜" }]),
              ].map((step) => (
                <Link
                  key={step.label}
                  href={step.href}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 12,
                    textDecoration: "none",
                    background: step.done
                      ? (isDark ? "rgba(34,197,94,0.05)" : "rgba(34,197,94,0.04)")
                      : "transparent",
                    border: `1px solid ${step.done
                      ? "rgba(34,197,94,0.18)"
                      : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)")}`,
                    transition: "all 0.15s",
                    opacity: step.done ? 0.75 : 1,
                  }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{step.done ? "✅" : step.icon}</span>
                  <span style={{
                    fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 500,
                    color: step.done ? "var(--text-muted)" : "var(--text)",
                    flex: 1,
                    textDecoration: step.done ? "line-through" : "none",
                  }}>
                    {step.label}
                  </span>
                  {!step.done && (
                    <span style={{ color: "var(--text-muted)", opacity: 0.4, display: "flex" }}>
                      <Ic.ArrowRight />
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <style>{`
        .cs-dash-stats {
          grid-template-columns: repeat(${statsData.length}, 1fr) !important;
        }
        .cs-dash-main {
          grid-template-columns: 1fr 320px !important;
        }
        @media (max-width: 1024px) {
          .cs-dash-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .cs-dash-main  { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 580px) {
          .cs-dash-stats { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 400px) {
          .cs-dash-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
