"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile, calcCompletion, getBadge, COMPLETION_FIELDS } from "./layout";
import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════════════════════ */
function Counter({
  to,
  prefix = "",
  suffix = "",
}: {
  to: number;
  prefix?: string;
  suffix?: string;
}) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const dur = 1400;
    const t0 = performance.now();

    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.floor(ease * to));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [to]);

  return (
    <>
      {prefix}
      {val.toLocaleString("en-IN")}
      {suffix}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════════════ */
function StatCard({
  label,
  value,
  raw,
  icon,
  color,
  delay,
}: {
  label: string;
  value: string;
  raw: number;
  icon: string;
  color: string;
  delay: number;
}) {
  const { isDark } = useTheme();
  const [vis, setVis] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  /* Use IntersectionObserver for proper viewport-based animation */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => setVis(true), delay);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const cardId = `stat-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={vis ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`dash-stat-card ${isDark ? "dark" : "light"}`}
      style={
        {
          "--stat-color": color,
          "--stat-color-25": `${color}25`,
          "--stat-color-30": `${color}30`,
        } as React.CSSProperties
      }
      role="group"
      aria-labelledby={cardId}
    >
      {/* glow blob */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `${color}15`,
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      {/* top shimmer line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "20%",
          right: "20%",
          height: 1,
          background: `linear-gradient(90deg,transparent,${color}60,transparent)`,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={vis ? { scale: 1 } : { scale: 0 }}
          transition={{
            delay: delay / 1000 + 0.3,
            type: "spring",
            stiffness: 100,
          }}
          aria-hidden="true"
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: `linear-gradient(135deg,${color}25,${color}10)`,
            border: `1px solid ${color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            boxShadow: `0 0 16px ${color}20`,
          }}
        >
          {icon}
        </motion.div>
        <div
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 8px ${color}`,
            marginTop: 6,
          }}
        />
      </div>

      <p
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 800,
          fontSize: 30,
          color: "var(--text)",
          margin: "0 0 4px",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
        aria-live="polite"
      >
        {vis ? (
          <Counter
            to={raw}
            prefix={value.startsWith("₹") ? "₹" : ""}
            suffix={value.endsWith("L") ? "L" : ""}
          />
        ) : (
          "0"
        )}
      </p>
      <p
        id={cardId}
        style={{
          fontSize: 13,
          color: "var(--text-muted)",
          fontFamily: "DM Sans, sans-serif",
          margin: 0,
          fontWeight: 500,
        }}
      >
        {label}
      </p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   RING PROGRESS
══════════════════════════════════════════════════════════════ */
function RingProgress({
  pct,
  color,
  size = 80,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const { isDark } = useTheme();
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const [drawn, setDrawn] = useState(0);
  const trackColor = isDark
    ? "rgba(255,255,255,0.07)"
    : "rgba(0,0,0,0.07)";

  useEffect(() => {
    const t = setTimeout(() => setDrawn(pct), 300);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
      role="img"
      aria-label={`${pct}% complete`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={6}
        stroke={trackColor}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={6}
        stroke={color}
        strokeDasharray={c}
        strokeLinecap="round"
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - drawn / 100) }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPLETION CARD
══════════════════════════════════════════════════════════════ */
function CompletionCard() {
  const { user } = useProfile();
  const { isDark } = useTheme();

  if (!user) return null;

  const pct = calcCompletion(user);
  const badge = getBadge(pct);
  const done = COMPLETION_FIELDS.filter(f => f.check(user));
  const todo = COMPLETION_FIELDS.filter(f => !f.check(user));
  const remainingPct = todo.reduce((s, f) => s + f.weight, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`dash-card ${isDark ? "dark" : "light"}`}
      role="region"
      aria-label="Profile completion"
    >
      {/* header */}
      <div className="dash-card-header">
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg,transparent,${badge.color}50,transparent)`,
          }}
        />

        <div style={{ position: "relative", flexShrink: 0 }}>
          <RingProgress pct={pct} color={badge.color} size={72} />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 14,
                color: badge.color,
                transform: "rotate(90deg)",
              }}
            >
              {pct}
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 17,
              color: "var(--text)",
              margin: "0 0 6px",
            }}
          >
            Profile Completion
          </h3>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 999,
              background: `${badge.color}15`,
              border: `1px solid ${badge.color}30`,
              fontSize: 12,
              fontWeight: 700,
              color: badge.color,
              fontFamily: "Syne, sans-serif",
            }}
          >
            {badge.emoji} {badge.label}
          </motion.span>

          <div
            style={{
              marginTop: 10,
              height: 4,
              borderRadius: 2,
              background: isDark
                ? "rgba(255,255,255,0.07)"
                : "rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Profile ${pct}% complete`}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              style={{
                height: "100%",
                borderRadius: 2,
                background: `linear-gradient(90deg,#ff6b00,${badge.color})`,
                boxShadow: `0 0 10px ${badge.color}50`,
              }}
            />
          </div>
        </div>
      </div>

      {/* checklist */}
      <div style={{ padding: "16px 24px" }}>
        {todo.length > 0 && (
          <>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                fontFamily: "DM Sans, sans-serif",
                marginBottom: 10,
              }}
            >
              Complete to unlock {remainingPct} more %
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
              }}
              className="cc-grid"
            >
              {todo.map((f, idx) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                >
                  <Link
                    href="/dashboard/profile"
                    className="dash-todo-link"
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 6,
                        border: "1.5px dashed rgba(255,107,0,0.4)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: "rgba(255,107,0,0.4)",
                        }}
                      />
                    </div>
                    <span className="dash-todo-label">{f.label}</span>
                    <span className="dash-todo-weight">+{f.weight}%</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {done.length > 0 && todo.length > 0 && (
          <div
            style={{
              height: 1,
              background: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.05)",
              margin: "12px 0",
            }}
          />
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {done.map((f, idx) => (
            <motion.span
              key={f.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.5 + todo.length * 0.05 + idx * 0.05,
              }}
              className="dash-done-badge"
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {f.label}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ACTIVITY FEED
══════════════════════════════════════════════════════════════ */
const ACTIVITY_ITEMS = [
  {
    id: "created",
    icon: "🎯",
    text: "Account created",
    sub: "Welcome to CrowdSpark",
    color: "#a78bfa",
    time: "Just now",
    href: undefined,
  },
  {
    id: "verify-email",
    icon: "📧",
    text: "Verify your email",
    sub: "Unlock full access",
    color: "#f59e0b",
    time: "Pending",
    href: "/dashboard/settings",
  },
  {
    id: "complete-profile",
    icon: "🚀",
    text: "Complete your profile",
    sub: "Get discovered by creators",
    color: "#ff6b00",
    time: "In progress",
    href: "/dashboard/profile",
  },
] as const;

function ActivityFeed() {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`dash-card ${isDark ? "dark" : "light"}`}
      role="region"
      aria-label="Recent activity"
    >
      <div className="dash-card-section-header">
        <span
          aria-hidden="true"
          style={{
            width: 14,
            height: 2,
            borderRadius: 1,
            background: "linear-gradient(90deg,#ff6b00,#ffcc00)",
            display: "inline-block",
          }}
        />
        <h3
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "var(--text)",
            margin: 0,
          }}
        >
          Activity
        </h3>
      </div>

      <div style={{ padding: "8px 12px" }}>
        {ACTIVITY_ITEMS.map((item, i) => {
          const content = (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 + 0.1 }}
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </motion.div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  {item.text}
                </p>
                <p
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 11.5,
                    color: "var(--text-muted)",
                    margin: 0,
                  }}
                >
                  {item.sub}
                </p>
              </div>

              <span
                style={{
                  fontSize: 11,
                  color: item.color,
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {item.time}
              </span>
            </>
          );

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className="dash-activity-item clickable"
                >
                  {content}
                </Link>
              ) : (
                <div className="dash-activity-item">{content}</div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STATUS PANEL
══════════════════════════════════════════════════════════════ */
function StatusPanel() {
  const { user } = useProfile();
  const { isDark } = useTheme();

  if (!user) return null;

  const hasPhone = !!user.phoneNumber;

  const items = [
    {
      label: "Email",
      ok: user.emailVerified,
      warn: !user.emailVerified,
      icon: "📧",
    },
    {
      label: "Phone",
      ok: hasPhone && user.phoneVerified,
      warn: hasPhone && !user.phoneVerified,
      icon: "📱",
    },
    {
      label: "KYC",
      ok: user.kycStatus === "APPROVED",
      warn:
        user.kycStatus === "PENDING_APPROVAL" ||
        user.kycStatus === "PENDING_SUBMISSION",
      icon: "🪪",
    },
    {
      label: "Account",
      ok: user.accountStatus === "ACTIVE",
      warn: false,
      icon: "⚡",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
      }}
      role="list"
      aria-label="Account verification status"
    >
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + idx * 0.05 }}
          role="listitem"
          className={`dash-status-item ${item.ok ? "ok" : item.warn ? "warn" : "error"} ${isDark ? "dark" : "light"}`}
        >
          <span aria-hidden="true" style={{ fontSize: 18 }}>
            {item.icon}
          </span>
          <div>
            <p
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--text)",
                margin: 0,
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 11,
                margin: 0,
                color: item.ok
                  ? "#34d399"
                  : item.warn
                    ? "#f59e0b"
                    : "#ef4444",
              }}
            >
              {item.ok ? "Verified" : item.warn ? "Pending" : "Not set"}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   QUICK ACTIONS
══════════════════════════════════════════════════════════════ */
function QuickActions() {
  const { isDark } = useTheme();
  const { user } = useProfile();
  const isCreator = user?.roles?.includes("CREATOR");

  const actions = useMemo(
    () => [
      {
        label: "Edit Profile",
        href: "/dashboard/profile",
        icon: "✏️",
        color: "#a78bfa",
      },
      {
        label: "Settings & KYC",
        href: "/dashboard/settings",
        icon: "⚙️",
        color: "#00f5d4",
      },
      {
        label: "Backed Projects",
        href: "/dashboard/backed",
        icon: "🎯",
        color: "#ff8800",
      },
      ...(isCreator
        ? [
            {
              label: "Creator Dashboard",
              href: "/creator",
              icon: "🚀",
              color: "#ff6b00",
            },
          ]
        : [
            {
              label: "Become Creator",
              href: "/dashboard/become-creator",
              icon: "🚀",
              color: "#ff6b00",
            },
          ]),
    ],
    [isCreator]
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
      }}
      role="list"
      aria-label="Quick actions"
    >
      {actions.map((a, idx) => (
        <motion.div
          key={a.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + idx * 0.05 }}
          role="listitem"
        >
          <Link
            href={a.href}
            className="dash-quick-action"
            style={
              {
                "--action-color": a.color,
              } as React.CSSProperties
            }
          >
            <span aria-hidden="true" style={{ fontSize: 20 }}>
              {a.icon}
            </span>
            <span className="dash-quick-action-label">{a.label}</span>
            <span
              aria-hidden="true"
              className="dash-quick-action-arrow"
            >
              →
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LOADING SKELETON
══════════════════════════════════════════════════════════════ */
function DashboardSkeleton() {
  const { isDark } = useTheme();
  const bg = isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.06)";
  const bgStrong = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.08)";

  return (
    <div
      style={{
        padding: "36px 32px 60px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: 36 }}>
        <div
          className="dash-skeleton"
          style={{
            width: 200,
            height: 14,
            borderRadius: 8,
            background: bg,
            marginBottom: 12,
          }}
        />
        <div
          className="dash-skeleton"
          style={{
            width: 300,
            height: 40,
            borderRadius: 12,
            background: bgStrong,
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 24,
        }}
        className="dash-stats"
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="dash-skeleton"
            style={{
              height: 160,
              borderRadius: 20,
              background: bg,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, loading } = useProfile();
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Compute date string only on client to avoid hydration mismatch */
  const todayStr = useMemo(() => {
    if (!mounted) return "";
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, [mounted]);

  const joinDate = useMemo(() => {
    if (!user?.createdAt) return "";
    return new Date(user.createdAt).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }, [user?.createdAt]);

  /* ── Guard: don't render until client is mounted ── */
  if (!mounted || loading) return <DashboardSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: "36px 32px 60px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          marginBottom: 36,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 12.5,
              color: "var(--text-muted)",
              marginBottom: 6,
              letterSpacing: "0.05em",
            }}
          >
            {todayStr} · Member since {joinDate}
          </p>
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(26px,3.5vw,40px)",
              color: "var(--text)",
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Hey,{" "}
            <span className="dash-gradient-name">
              {user?.name?.split(" ")[0]}
            </span>{" "}
            👋
          </h1>
          {user?.bio && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: 14,
                color: "var(--text-muted)",
                fontFamily: "DM Sans, sans-serif",
                margin: "8px 0 0",
              }}
            >
              {user.bio}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/dashboard/profile" className="dash-edit-profile-btn">
            <span aria-hidden="true" className="dash-shimmer-overlay" />
            <span style={{ position: "relative" }}>Edit Profile →</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* stat cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 24,
        }}
        className="dash-stats"
      >
        <StatCard
          label="Projects Backed"
          value={String(user?.totalProjectsBacked ?? 0)}
          raw={user?.totalProjectsBacked ?? 0}
          icon="🎯"
          color="#00f5d4"
          delay={0}
        />
        <StatCard
          label="Total Backed"
          value={`₹${user?.totalAmountBacked ?? 0}`}
          raw={user?.totalAmountBacked ?? 0}
          icon="💰"
          color="#ff8800"
          delay={80}
        />
        <StatCard
          label="Campaigns Created"
          value={String(user?.totalProjectsCreated ?? 0)}
          raw={user?.totalProjectsCreated ?? 0}
          icon="🚀"
          color="#a78bfa"
          delay={160}
        />
        <StatCard
          label="Funds Raised"
          value={`₹${user?.totalFundsRaised ?? 0}`}
          raw={user?.totalFundsRaised ?? 0}
          icon="📈"
          color="#34d399"
          delay={240}
        />
      </motion.div>

      {/* main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 16,
          alignItems: "start",
        }}
        className="dash-main"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <CompletionCard />
          <ActivityFeed />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="dash-section-heading">Account Status</h2>
            <StatusPanel />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="dash-section-heading">Quick Actions</h2>
            <QuickActions />
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════ SCOPED STYLES ═══════════════════ */}
      <style>{`
        /* ── animations ───────────────────────────── */
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(200%); }
          100% { transform: translateX(200%); }
        }
        @keyframes dashPulse {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
        .dash-skeleton {
          animation: dashPulse 2s ease-in-out infinite;
        }

        /* ── gradient name ────────────────────────── */
        .dash-gradient-name {
          background: linear-gradient(135deg, #ff6b00, #ffcc00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── section heading ──────────────────────── */
        .dash-section-heading {
          font-family: "Syne", sans-serif;
          font-weight: 700;
          font-size: 12px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0 0 10px;
        }

        /* ── cards ────────────────────────────────── */
        .dash-card {
          border-radius: 20px;
          overflow: hidden;
        }
        .dash-card.dark {
          background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .dash-card.light {
          background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8));
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        .dash-card-header {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          overflow: hidden;
        }
        .dash-card.dark .dash-card-header {
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .dash-card.light .dash-card-header {
          background: rgba(0,0,0,0.01);
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }

        .dash-card-section-header {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dash-card.dark .dash-card-section-header {
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .dash-card.light .dash-card-section-header {
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }

        /* ── stat cards ───────────────────────────── */
        .dash-stat-card {
          padding: 24px;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px);
          cursor: default;
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .dash-stat-card.dark {
          background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid var(--stat-color-25);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .dash-stat-card.light {
          background: linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
          border: 1px solid var(--stat-color-30);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .dash-stat-card:hover {
          box-shadow: 0 12px 40px color-mix(in srgb, var(--stat-color) 30%, transparent),
                      0 0 0 1px color-mix(in srgb, var(--stat-color) 20%, transparent);
          border-color: color-mix(in srgb, var(--stat-color) 50%, transparent);
        }

        /* ── todo links ───────────────────────────── */
        .dash-todo-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s;
        }
        .dash-card.dark .dash-todo-link {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .dash-card.light .dash-todo-link {
          background: rgba(0,0,0,0.025);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .dash-todo-link:hover {
          background: rgba(255,107,0,0.08) !important;
          border-color: rgba(255,107,0,0.3) !important;
        }
        .dash-todo-label {
          font-size: 12px;
          color: var(--text-muted);
          font-family: "DM Sans", sans-serif;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dash-todo-weight {
          font-size: 10px;
          color: #ff8800;
          font-weight: 700;
          font-family: "Syne", sans-serif;
          flex-shrink: 0;
        }

        /* ── done badges ──────────────────────────── */
        .dash-done-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 9px;
          border-radius: 999px;
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.2);
          font-size: 11px;
          color: #34d399;
          font-family: "DM Sans", sans-serif;
        }

        /* ── activity items ───────────────────────── */
        .dash-activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 8px;
          border-radius: 12px;
          transition: background 0.15s;
          text-decoration: none;
          color: inherit;
        }
        .dash-activity-item.clickable {
          cursor: pointer;
        }
        .dash-activity-item.clickable:hover {
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
        }

        /* ── status items ─────────────────────────── */
        .dash-status-item {
          padding: 12px 14px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dash-status-item.ok.dark   { background: rgba(52,211,153,0.06);  border: 1px solid rgba(52,211,153,0.2); }
        .dash-status-item.ok.light  { background: rgba(52,211,153,0.05);  border: 1px solid rgba(52,211,153,0.2); }
        .dash-status-item.warn.dark  { background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.2); }
        .dash-status-item.warn.light { background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.2); }
        .dash-status-item.error.dark  { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15); }
        .dash-status-item.error.light { background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.15); }

        /* ── quick actions ────────────────────────── */
        .dash-quick-action {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          padding: 14px;
          border-radius: 14px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: background 0.18s, border-color 0.18s, transform 0.18s;
        }
        .dash-quick-action {
          background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"};
        }
        .dash-quick-action:hover {
          background: color-mix(in srgb, var(--action-color) 10%, transparent);
          border-color: color-mix(in srgb, var(--action-color) 35%, transparent);
          transform: translateY(-2px);
        }
        .dash-quick-action-label {
          font-family: "DM Sans", sans-serif;
          font-weight: 600;
          font-size: 12.5px;
          color: var(--text);
          line-height: 1.3;
        }
        .dash-quick-action-arrow {
          position: absolute;
          bottom: 10px;
          right: 12px;
          font-size: 14px;
          color: var(--action-color);
          opacity: 0.5;
        }

        /* ── edit profile button ──────────────────── */
        .dash-edit-profile-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #ff6b00, #ffcc00);
          color: #fff;
          text-decoration: none;
          font-family: "Syne", sans-serif;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 0 24px rgba(255,100,0,0.35);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .dash-shimmer-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%);
          animation: shimmer 2.4s ease-in-out infinite;
        }

        /* ── responsive ───────────────────────────── */
        @media (max-width: 960px) {
          .dash-main { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 860px) {
          .dash-stats { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 500px) {
          .dash-stats { grid-template-columns: 1fr !important; }
          .cc-grid    { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
}