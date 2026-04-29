"use client";

/**
 * src/components/ui/index.tsx
 * Reusable premium UI component system for CrowdSpark-X.
 * Import individual components: import { Button, Card, Badge } from "@/components/ui"
 */

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode, CSSProperties, forwardRef } from "react";

// ─── BUTTON ──────────────────────────────────────────────────────────────────

type ButtonVariant = "cta" | "accent" | "ghost" | "outline" | "danger" | "muted";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  children?: ReactNode;
}

const BTN_STYLES: Record<ButtonVariant, CSSProperties> = {
  cta: {
    background: "linear-gradient(135deg, #ff6b00 0%, #ff9500 50%, #ffcc00 100%)",
    color: "#fff",
    border: "none",
    boxShadow: "0 0 24px rgba(255,107,0,0.45), 0 2px 12px rgba(0,0,0,0.3)",
  },
  accent: {
    background: "var(--accent)",
    color: "var(--icon-clr)",
    border: "none",
    boxShadow: "var(--btn-shadow)",
  },
  ghost: {
    background: "var(--bg-ghost)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  },
  outline: {
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid var(--border)",
  },
  danger: {
    background: "var(--danger-dim)",
    color: "var(--danger)",
    border: "1px solid rgba(239,68,68,0.2)",
  },
  muted: {
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid var(--border-2)",
  },
};

const BTN_SIZES: Record<ButtonSize, CSSProperties> = {
  xs: { padding: "5px 12px",  fontSize: 11, borderRadius: 8,  gap: 4  },
  sm: { padding: "7px 14px",  fontSize: 12, borderRadius: 9,  gap: 5  },
  md: { padding: "10px 20px", fontSize: 14, borderRadius: 12, gap: 7  },
  lg: { padding: "13px 26px", fontSize: 15, borderRadius: 14, gap: 8  },
  xl: { padding: "16px 34px", fontSize: 16, borderRadius: 16, gap: 9  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = "accent",
    size = "md",
    loading = false,
    icon,
    iconRight,
    fullWidth = false,
    rounded = false,
    children,
    disabled,
    style,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    const sizeStyle = BTN_SIZES[size];
    const variantStyle = BTN_STYLES[variant];

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        whileHover={!isDisabled ? { y: -2, scale: 1.01 } : {}}
        whileTap={!isDisabled ? { scale: 0.97 } : {}}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: variant === "cta" || variant === "accent" ? "'Syne', sans-serif" : "'DM Sans', sans-serif",
          fontWeight: variant === "cta" || variant === "accent" ? 700 : 600,
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.5 : 1,
          width: fullWidth ? "100%" : undefined,
          borderRadius: rounded ? 999 : sizeStyle.borderRadius,
          position: "relative",
          overflow: "hidden",
          transition: "box-shadow 0.18s",
          ...variantStyle,
          ...sizeStyle,
          ...style,
        }}
        {...props}
      >
        {/* shimmer for CTA/accent */}
        {(variant === "cta" || variant === "accent") && !loading && (
          <span style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)",
            animation: "shimmerBtn 2.8s ease-in-out infinite",
            pointerEvents: "none",
          }} />
        )}

        {loading ? (
          <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: "currentColor", borderColor: "rgba(255,255,255,0.2)" }} />
        ) : icon}

        {children && (
          <span style={{ position: "relative" }}>{children}</span>
        )}

        {!loading && iconRight}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

// ─── BADGE ───────────────────────────────────────────────────────────────────

type BadgeVariant = "accent" | "cta" | "success" | "danger" | "warning" | "info" | "muted" | "ghost";

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}

const BADGE_STYLES: Record<BadgeVariant, CSSProperties> = {
  accent:  { background: "var(--accent-dim)",  color: "var(--accent)",  border: "1px solid rgba(0,245,212,0.2)" },
  cta:     { background: "rgba(255,107,0,0.1)", color: "var(--cta)",    border: "1px solid rgba(255,107,0,0.2)" },
  success: { background: "var(--success-dim)", color: "var(--success)", border: "1px solid rgba(16,185,129,0.2)" },
  danger:  { background: "var(--danger-dim)",  color: "var(--danger)",  border: "1px solid rgba(239,68,68,0.2)" },
  warning: { background: "var(--warning-dim)", color: "var(--warning)", border: "1px solid rgba(245,158,11,0.2)" },
  info:    { background: "var(--info-dim)",    color: "var(--info)",    border: "1px solid rgba(96,165,250,0.2)" },
  muted:   { background: "var(--bg-ghost)",    color: "var(--text-muted)", border: "1px solid var(--border)" },
  ghost:   { background: "transparent",        color: "var(--text-muted)", border: "1px solid var(--border)" },
};

export function Badge({ variant = "accent", dot = false, children, style }: BadgeProps) {
  const vs = BADGE_STYLES[variant];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: dot ? 5 : 4,
      padding: "3px 9px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: "0.04em",
      whiteSpace: "nowrap",
      ...vs,
      ...style,
    }}>
      {dot && (
        <span style={{
          width: 5, height: 5, borderRadius: "50%",
          background: "currentColor",
          boxShadow: "0 0 5px currentColor",
          flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
}

// ─── CARD ────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
  shimmerTop?: boolean;
  glowColor?: string;
  onClick?: () => void;
  padding?: number | string;
  radius?: number;
}

export function Card({
  children,
  style,
  hover = false,
  shimmerTop = false,
  glowColor,
  onClick,
  padding = 24,
  radius = 20,
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.005 } : {}}
      onClick={onClick}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: radius,
        padding,
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : undefined,
        transition: "border-color 0.24s, box-shadow 0.24s",
        ...style,
      }}
    >
      {shimmerTop && (
        <div style={{
          position: "absolute",
          top: 0, left: "15%", right: "15%",
          height: 1,
          background: "linear-gradient(90deg, transparent, var(--accent-dim), transparent)",
          pointerEvents: "none",
        }} />
      )}
      {glowColor && (
        <div style={{
          position: "absolute",
          top: -60, left: -60,
          width: 200, height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
          opacity: 0.5,
        }} />
      )}
      {children}
    </motion.div>
  );
}

// ─── SPINNER ─────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: number;
  color?: string;
  thickness?: number;
}

export function Spinner({ size = 20, color = "currentColor", thickness = 2 }: SpinnerProps) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: `${thickness}px solid rgba(255,255,255,0.15)`,
      borderTopColor: color,
      animation: "spin 0.65s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
}

export function Skeleton({ width = "100%", height = 16, radius = 8, style }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
    />
  );
}

// ─── DIVIDER ─────────────────────────────────────────────────────────────────

interface DividerProps {
  accent?: boolean;
  margin?: number | string;
  style?: CSSProperties;
}

export function Divider({ accent = false, margin = "24px 0", style }: DividerProps) {
  return (
    <div style={{
      height: 1,
      background: accent
        ? "linear-gradient(90deg, transparent, var(--accent-dim), transparent)"
        : "linear-gradient(90deg, transparent, var(--border), transparent)",
      margin,
      ...style,
    }} />
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────

interface ProgressBarProps {
  value: number; // 0–100
  height?: number;
  color?: "accent" | "cta" | "success" | "danger" | "warning";
  animate?: boolean;
  showLabel?: boolean;
  style?: CSSProperties;
}

const PROGRESS_COLORS = {
  accent:  "linear-gradient(90deg, var(--accent), var(--accent-h))",
  cta:     "linear-gradient(90deg, var(--cta), var(--cta-2))",
  success: "linear-gradient(90deg, var(--success), #34d399)",
  danger:  "linear-gradient(90deg, var(--danger), #f87171)",
  warning: "linear-gradient(90deg, var(--warning), #fcd34d)",
};

export function ProgressBar({
  value,
  height = 5,
  color = "cta",
  animate: shouldAnimate = true,
  showLabel = false,
  style,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div style={style}>
      <div style={{
        height,
        borderRadius: 999,
        background: "var(--bg-hover)",
        overflow: "hidden",
        position: "relative",
      }}>
        <motion.div
          initial={shouldAnimate ? { width: 0 } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
          style={{
            height: "100%",
            borderRadius: 999,
            background: PROGRESS_COLORS[color],
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 40,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35))",
            animation: "progressShine 2s ease-in-out infinite",
          }} />
        </motion.div>
      </div>
      {showLabel && (
        <div style={{
          display: "flex", justifyContent: "flex-end",
          marginTop: 4,
          fontSize: 11, fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600, color: "var(--text-muted)",
        }}>
          {pct.toFixed(0)}%
        </div>
      )}
    </div>
  );
}

// ─── SECTION LABEL ───────────────────────────────────────────────────────────

interface SectionLabelProps {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}

export function SectionLabel({ children, color = "var(--accent)", style }: SectionLabelProps) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "5px 14px",
      borderRadius: 999,
      background: "var(--accent-dim)",
      border: "1px solid rgba(0,245,212,0.15)",
      marginBottom: 18,
      ...style,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}`,
        animation: "glowPulse 2s ease-in-out infinite",
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase" as const,
        color,
      }}>
        {children}
      </span>
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  accentColor?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  style?: CSSProperties;
}

export function StatCard({
  label, value, sub, icon, accentColor = "var(--accent)",
  trend, trendValue, style,
}: StatCardProps) {
  return (
    <div className="dash-stat-card" style={style}>
      {/* top accent line */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accentColor}, transparent)`,
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12, fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
        }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}25`,
            color: accentColor, flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800, fontSize: 28,
        color: "var(--text)",
        letterSpacing: "-0.03em",
        lineHeight: 1,
        marginBottom: sub ? 6 : 0,
      }}>
        {value}
      </div>

      {(sub || trendValue) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          {sub && (
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
              {sub}
            </span>
          )}
          {trendValue && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              color: trend === "up" ? "var(--success)" : trend === "down" ? "var(--danger)" : "var(--text-muted)",
              display: "flex", alignItems: "center", gap: 2,
            }}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  accentColor?: string;
}

export function EmptyState({ icon, title, description, action, accentColor = "var(--accent)" }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="empty-state"
    >
      {icon && (
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${accentColor}12`,
          border: `1px solid ${accentColor}22`,
          color: accentColor,
          marginBottom: 8,
          position: "relative",
        }}>
          {icon}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 22,
            background: `linear-gradient(135deg, ${accentColor}18, transparent)`,
            pointerEvents: "none",
          }} />
        </div>
      )}
      <h3 style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800, fontSize: 20,
        color: "var(--text)", margin: 0,
        letterSpacing: "-0.02em",
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: 14, color: "var(--text-muted)",
          fontFamily: "'DM Sans', sans-serif",
          maxWidth: 380, lineHeight: 1.75, margin: 0,
        }}>
          {description}
        </p>
      )}
      {action}
    </motion.div>
  );
}
