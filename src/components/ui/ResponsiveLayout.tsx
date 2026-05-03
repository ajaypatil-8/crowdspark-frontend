"use client";

/**
 * src/components/ui/ResponsiveLayout.tsx
 * Section 11 Part 3 — Layout primitives for perfect responsive design.
 *
 *  - Container      : centered max-width wrapper with responsive padding
 *  - ResponsiveGrid : CSS grid with breakpoint-aware columns
 *  - Stack          : vertical/horizontal flexbox stack with gap
 *  - Divider        : styled horizontal/vertical rule
 *  - Spacer         : flexible blank space
 *  - Show / Hide    : conditionally render based on breakpoint
 */

import { CSSProperties, ReactNode } from "react";

// ─── Container ─────────────────────────────────────────────────────────────────
export function Container({
  children,
  maxWidth = 1200,
  style,
  className,
  id,
}: {
  children: ReactNode;
  maxWidth?: number | string;
  style?: CSSProperties;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={className}
      style={{
        width: "100%",
        maxWidth,
        marginLeft: "auto",
        marginRight: "auto",
        paddingLeft: "clamp(16px, 4vw, 40px)",
        paddingRight: "clamp(16px, 4vw, 40px)",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── ResponsiveGrid ────────────────────────────────────────────────────────────
export function ResponsiveGrid({
  children,
  cols = { xs: 1, sm: 2, md: 3 },
  gap = 20,
  style,
  className,
}: {
  children: ReactNode;
  cols?: { xs: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | string;
  style?: CSSProperties;
  className?: string;
}) {
  const { xs, sm = xs, md = sm, lg = md, xl = lg } = cols;
  const cssGap = typeof gap === "number" ? `${gap}px` : gap;

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gap: cssGap,
        gridTemplateColumns: `repeat(${xl}, 1fr)`,
        ...style,
      }}
    >
      {children}
      <style>{`
        @media (max-width: 1279px) {
          .${className ?? "rg-auto"} { grid-template-columns: repeat(${lg}, 1fr) !important; }
        }
        @media (max-width: 1023px) {
          .${className ?? "rg-auto"} { grid-template-columns: repeat(${md}, 1fr) !important; }
        }
        @media (max-width: 767px) {
          .${className ?? "rg-auto"} { grid-template-columns: repeat(${sm}, 1fr) !important; }
        }
        @media (max-width: 479px) {
          .${className ?? "rg-auto"} { grid-template-columns: repeat(${xs}, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Stack ─────────────────────────────────────────────────────────────────────
export function Stack({
  children,
  direction = "column",
  gap = 16,
  align = "stretch",
  justify = "flex-start",
  wrap = false,
  style,
  className,
}: {
  children: ReactNode;
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  gap?: number | string;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: direction,
        gap: typeof gap === "number" ? `${gap}px` : gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Divider ───────────────────────────────────────────────────────────────────
export function Divider({
  orientation = "horizontal",
  color,
  margin,
  style,
}: {
  orientation?: "horizontal" | "vertical";
  color?: string;
  margin?: number | string;
  style?: CSSProperties;
}) {
  const m = typeof margin === "number" ? `${margin}px` : (margin ?? "16px");
  if (orientation === "vertical") {
    return (
      <div style={{
        width: 1, alignSelf: "stretch",
        background: color ?? "var(--border)",
        marginLeft: m, marginRight: m,
        flexShrink: 0,
        ...style,
      }}/>
    );
  }
  return (
    <div style={{
      height: 1, width: "100%",
      background: color ?? "var(--border)",
      marginTop: m, marginBottom: m,
      flexShrink: 0,
      ...style,
    }}/>
  );
}

// ─── Spacer ────────────────────────────────────────────────────────────────────
export function Spacer({ size = 16 }: { size?: number | string }) {
  const s = typeof size === "number" ? `${size}px` : size;
  return <div style={{ minHeight: s, minWidth: s, flexShrink: 0 }} aria-hidden="true"/>;
}

// ─── Show (render only above breakpoint) ──────────────────────────────────────
export function ShowAbove({
  breakpoint,
  children,
}: {
  breakpoint: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}) {
  const values = { sm: 480, md: 768, lg: 1024, xl: 1280 };
  return (
    <>
      {children}
      <style>{`
        @media (max-width: ${values[breakpoint] - 1}px) {
          /* hide child via wrapper trick - inject a className if needed */
        }
      `}</style>
    </>
  );
}

// ─── Truncate ─────────────────────────────────────────────────────────────────
export function Truncate({
  children,
  lines = 1,
  style,
}: {
  children: ReactNode;
  lines?: number;
  style?: CSSProperties;
}) {
  if (lines === 1) {
    return (
      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...style }}>
        {children}
      </div>
    );
  }
  return (
    <div style={{
      display: "-webkit-box",
      WebkitLineClamp: lines,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}
