"use client";

/**
 * src/components/dashboard/widgets.tsx
 * Shared premium dashboard widget components for CrowdSpark-X Section 6.
 * Import: import { StatCard, SectionCard, ActivityFeed, ... } from "@/components/dashboard/widgets"
 */

import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

// ─── Stat Card ─────────────────────────────────────────────────────────────────
export interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accentColor?: string;
  delay?: number;
  trend?: { direction: "up" | "down" | "flat"; label: string };
}

export function StatCard({ icon, label, value, sub, accentColor = "#ff8800", delay = 0, trend }: StatCardProps) {
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState(false);

  const bg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const r = parseInt(accentColor.slice(1, 3), 16);
  const g = parseInt(accentColor.slice(3, 5), 16);
  const b = parseInt(accentColor.slice(5, 7), 16);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 18,
        background: bg,
        border: `1px solid ${hovered ? accentColor + "44" : bdr}`,
        padding: "18px 20px",
        cursor: "default",
        transition: "all 0.2s cubic-bezier(.22,1,.36,1)",
        boxShadow: hovered
          ? (isDark ? `0 8px 32px rgba(${r},${g},${b},0.18), 0 0 0 1px ${accentColor}33` : `0 8px 24px rgba(${r},${g},${b},0.12)`)
          : (isDark ? "none" : "0 2px 12px rgba(0,0,0,0.04)"),
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient shine on hover */}
      {hovered && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse at 20% 20%, rgba(${r},${g},${b},0.07) 0%, transparent 70%)`,
        }}/>
      )}

      {/* Top line accent */}
      <div style={{
        position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
        background: `linear-gradient(90deg,transparent,${accentColor}66,transparent)`,
        transition: "opacity 0.2s",
        opacity: hovered ? 1 : 0.3,
      }}/>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: `rgba(${r},${g},${b},0.1)`,
          border: `1px solid rgba(${r},${g},${b},0.2)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: accentColor,
          boxShadow: hovered ? `0 0 16px rgba(${r},${g},${b},0.25)` : "none",
          transition: "box-shadow 0.2s",
        }}>
          {icon}
        </div>
        {trend && (
          <span style={{
            fontSize: 10.5, fontFamily: "DM Sans, sans-serif", fontWeight: 600,
            padding: "3px 7px", borderRadius: 20,
            background: trend.direction === "up"
              ? "rgba(34,197,94,0.1)"
              : trend.direction === "down"
              ? "rgba(239,68,68,0.1)"
              : "rgba(107,114,128,0.1)",
            color: trend.direction === "up" ? "#22c55e" : trend.direction === "down" ? "#ef4444" : "#6b7280",
          }}>
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"} {trend.label}
          </span>
        )}
      </div>

      <div>
        <p style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26,
          color: "var(--text)", margin: "0 0 3px", letterSpacing: "-0.02em",
          lineHeight: 1,
        }}>
          {value}
        </p>
        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 500,
          color: "var(--text-muted)", margin: 0,
        }}>
          {label}
        </p>
        {sub && (
          <p style={{
            fontFamily: "DM Sans, sans-serif", fontSize: 11, color: accentColor,
            margin: "5px 0 0", fontWeight: 500,
          }}>
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────
export function SectionCard({
  title, children, action, icon, delay = 0
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  delay?: number;
}) {
  const { isDark } = useTheme();
  const bg = isDark ? "rgba(255,255,255,0.025)" : "#ffffff";
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 20,
        background: bg,
        border: `1px solid ${bdr}`,
        boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: `1px solid ${bdr}`,
        background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
          background: "linear-gradient(90deg,transparent,rgba(255,136,0,0.35),transparent)",
        }}/>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && (
            <span style={{ color: "#ff8800", display: "flex", opacity: 0.8 }}>{icon}</span>
          )}
          <span style={{
            fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
            color: "var(--text)",
          }}>
            {title}
          </span>
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Body */}
      <div style={{ padding: "16px 20px" }}>
        {children}
      </div>
    </motion.div>
  );
}

// ─── Activity Item ─────────────────────────────────────────────────────────────
export interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  sub: string;
  time: string;
  accentColor?: string;
}

function ActivityRow({ item, isDark, index }: { item: ActivityItem; isDark: boolean; index: number }) {
  const [hovered, setHovered] = useState(false);
  const bdr = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 12px", borderRadius: 12,
        background: hovered ? (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)") : "transparent",
        transition: "background 0.15s",
        cursor: "default",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        border: `1px solid ${bdr}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16,
      }}>
        {item.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600,
          color: "var(--text)", margin: "0 0 2px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {item.title}
        </p>
        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)",
          margin: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {item.sub}
        </p>
      </div>
      <span style={{
        fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)",
        flexShrink: 0, whiteSpace: "nowrap",
      }}>
        {item.time}
      </span>
    </motion.div>
  );
}

export function ActivityFeed({
  items, emptyMessage = "No recent activity"
}: {
  items: ActivityItem[];
  emptyMessage?: string;
}) {
  const { isDark } = useTheme();
  if (!items.length) {
    return <EmptyState icon="📭" message={emptyMessage}/>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((item, i) => (
        <ActivityRow key={item.id} item={item} isDark={isDark} index={i}/>
      ))}
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({
  icon = "📭",
  message = "Nothing here yet",
  sub,
  action,
}: {
  icon?: string;
  message?: string;
  sub?: string;
  action?: ReactNode;
}) {
  const { isDark } = useTheme();
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 10, padding: "32px 16px", textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24,
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
          color: "var(--text)", margin: "0 0 5px",
        }}>
          {message}
        </p>
        {sub && (
          <p style={{
            fontFamily: "DM Sans, sans-serif", fontSize: 12.5,
            color: "var(--text-muted)", margin: 0,
          }}>
            {sub}
          </p>
        )}
      </div>
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}

// ─── Widget Skeleton ───────────────────────────────────────────────────────────
export function WidgetSkeleton({ height = 120, delay = 0 }: { height?: number; delay?: number }) {
  const { isDark } = useTheme();
  const bg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  return (
    <div style={{
      height, borderRadius: 18, background: bg,
      animation: "wsPulse 2s ease-in-out infinite",
      animationDelay: `${delay}s`,
    }}>
      <style>{`@keyframes wsPulse{0%,100%{opacity:.4}50%{opacity:.85}}`}</style>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div style={{
      display: "grid", gap: 16,
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    }}>
      {[0, 1, 2, 3].map(i => <WidgetSkeleton key={i} height={120} delay={i * 0.1}/>)}
    </div>
  );
}

// ─── Profile Completion Bar ────────────────────────────────────────────────────
export function ProfileCompletionBar({ pct }: { pct: number }) {
  const { isDark } = useTheme();
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div style={{
      padding: "14px 16px", borderRadius: 14,
      background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
      border: `1px solid ${bdr}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>
          Profile Completion
        </span>
        <span style={{
          fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 800,
          background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          {pct}%
        </span>
      </div>
      <div style={{
        height: 5, borderRadius: 5,
        background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
        overflow: "hidden",
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%", borderRadius: 5,
            background: "linear-gradient(90deg,#ff6b00,#ffcc00)",
            boxShadow: "0 0 8px rgba(255,107,0,0.4)",
          }}
        />
      </div>
      {pct < 100 && (
        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)",
          margin: "6px 0 0",
        }}>
          {pct < 50 ? "Add your bio and avatar to stand out" : "Almost there! Complete your profile"}
        </p>
      )}
    </div>
  );
}

// ─── Animated Counter ──────────────────────────────────────────────────────────
import { useEffect, useRef } from "react";

export function AnimatedCounter({
  target, prefix = "", suffix = "", duration = 1200
}: {
  target: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const start = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);
      if (ref.current) ref.current.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, prefix, suffix, duration]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}
