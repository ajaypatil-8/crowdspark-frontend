/**
 * src/hooks/useIntersectionObserver.ts
 * Section 11 Part 3 — IntersectionObserver hooks.
 *
 *   useInView(options)    : returns [ref, inView] — true when element is visible
 *   useScrollReveal()     : convenience hook for CSS class-based reveal
 *   useSentinel(onReach)  : callback when sentinel element enters viewport (infinite scroll)
 */

import { useEffect, useRef, useState, useCallback, RefObject } from "react";

interface InViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
}

// ─── useInView ─────────────────────────────────────────────────────────────────
export function useInView<T extends Element = HTMLDivElement>(
  options: InViewOptions = {}
): [RefObject<T>, boolean] {
  const { threshold = 0.1, rootMargin = "0px", once = true } = options;
  const ref       = useRef<T>(null!);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

// ─── useSentinel ──────────────────────────────────────────────────────────────
export function useSentinel(
  onReach: () => void,
  options: { threshold?: number; rootMargin?: string; enabled?: boolean } = {}
): RefObject<HTMLDivElement> {
  const { threshold = 0.1, rootMargin = "0px", enabled = true } = options;
  const ref = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onReach();
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onReach, threshold, rootMargin, enabled]);

  return ref;
}

// ─── useScrollProgress ────────────────────────────────────────────────────────
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handle = () => {
      const el  = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return progress;
}

// ─── useScrollY ───────────────────────────────────────────────────────────────
export function useScrollY(): number {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}
