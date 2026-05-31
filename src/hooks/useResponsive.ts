"use client";

/**
 * src/hooks/useResponsive.ts
 * Section 11 Part 3 — Responsive / media-query hooks.
 *   - useMediaQuery(query)  : generic boolean hook
 *   - useBreakpoint()       : returns current named breakpoint
 *   - useIsMobile()         : true when width ≤ 768px
 *   - useIsTablet()         : true when 768 < width ≤ 1024px
 *   - useIsDesktop()        : true when width > 1024px
 *   - useWindowSize()       : { width, height } updated on resize
 *   - useIsTouch()          : true when primary pointer is coarse (touch)
 */

import { useEffect, useState, useCallback } from "react";

// ─── useMediaQuery ─────────────────────────────────────────────────────────────
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const timer = window.setTimeout(() => setMatches(mql.matches), 0);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => {
      window.clearTimeout(timer);
      mql.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}

// ─── useWindowSize ─────────────────────────────────────────────────────────────
export function useWindowSize(): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

// ─── Breakpoint helpers ────────────────────────────────────────────────────────
export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const BP_VALUES: Record<Breakpoint, number> = {
  xs:  0,
  sm:  480,
  md:  768,
  lg:  1024,
  xl:  1280,
  "2xl": 1536,
};

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowSize();

  if (width < BP_VALUES.sm)  return "xs";
  if (width < BP_VALUES.md)  return "sm";
  if (width < BP_VALUES.lg)  return "md";
  if (width < BP_VALUES.xl)  return "lg";
  if (width < BP_VALUES["2xl"]) return "xl";
  return "2xl";
}

export function useIsMobile()  { return useMediaQuery("(max-width: 768px)"); }
export function useIsTablet()  { return useMediaQuery("(min-width: 769px) and (max-width: 1024px)"); }
export function useIsDesktop() { return useMediaQuery("(min-width: 1025px)"); }
export function useIsTouch()   { return useMediaQuery("(pointer: coarse)"); }

// ─── useBreakpointValue ────────────────────────────────────────────────────────
/**
 * Return different values per breakpoint.
 * @example
 *   const cols = useBreakpointValue({ xs: 1, sm: 2, md: 3, lg: 4 });
 */
export function useBreakpointValue<T>(
  values: Partial<Record<Breakpoint, T>> & { xs: T }
): T {
  const bp = useBreakpoint();
  const order: Breakpoint[] = ["2xl", "xl", "lg", "md", "sm", "xs"];

  for (const b of order) {
    const idx = order.indexOf(b);
    const curIdx = order.indexOf(bp);
    if (curIdx <= idx && values[b] !== undefined) {
      return values[b] as T;
    }
  }
  // Walk down from current bp
  const startIdx = order.indexOf(bp);
  for (let i = startIdx; i < order.length; i++) {
    const key = order[i];
    if (values[key] !== undefined) return values[key] as T;
  }
  return values.xs;
}
