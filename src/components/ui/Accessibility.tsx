"use client";

/**
 * src/components/ui/Accessibility.tsx
 * Section 11 Part 3 — Accessibility utilities:
 *   - SkipToMain     : skip-navigation link for keyboard users
 *   - FocusTrap      : traps focus inside a modal/drawer
 *   - VisuallyHidden : screen-reader-only text
 *   - useKeydown     : convenience hook for keyboard shortcuts
 *   - useFocusReturn : returns focus to trigger on close
 */

import {
  ReactNode,
  useEffect,
  useRef,
  KeyboardEvent as ReactKE,
} from "react";

// ─── Skip To Main ──────────────────────────────────────────────────────────────
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      style={{
        position: "fixed",
        top: -100,
        left: 16,
        zIndex: 99999,
        padding: "10px 20px",
        borderRadius: 10,
        background: "#ff6b00",
        color: "#fff",
        fontFamily: "DM Sans, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textDecoration: "none",
        transition: "top 0.2s",
        outline: "2px solid #ffcc00",
        outlineOffset: 2,
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.top = "16px";
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.top = "-100px";
      }}
    >
      Skip to main content
    </a>
  );
}

// ─── Visually Hidden ───────────────────────────────────────────────────────────
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {children}
    </span>
  );
}

// ─── Focus Trap ────────────────────────────────────────────────────────────────
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function FocusTrap({
  children,
  active = true,
  onEscape,
}: {
  children: ReactNode;
  active?: boolean;
  onEscape?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    // Auto-focus first focusable child
    const firstEl = ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)[0];
    firstEl?.focus();

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        onEscape();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = Array.from(
        ref.current!.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => !el.hidden && el.offsetParent !== null);

      if (!focusable.length) { e.preventDefault(); return; }

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, onEscape]);

  return (
    <div ref={ref} style={{ display: "contents" }}>
      {children}
    </div>
  );
}

// ─── useKeydown ────────────────────────────────────────────────────────────────
export function useKeydown(
  key: string,
  handler: (e: globalThis.KeyboardEvent) => void,
  active = true
) {
  useEffect(() => {
    if (!active) return;
    const cb = (e: globalThis.KeyboardEvent) => {
      if (e.key === key) handler(e);
    };
    document.addEventListener("keydown", cb);
    return () => document.removeEventListener("keydown", cb);
  }, [key, handler, active]);
}

// ─── useFocusReturn ────────────────────────────────────────────────────────────
export function useFocusReturn(active: boolean) {
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (active) {
      triggerRef.current = document.activeElement;
    } else {
      (triggerRef.current as HTMLElement | null)?.focus();
    }
  }, [active]);
}

// ─── LiveRegion  (for screen-reader announcements) ─────────────────────────────
export function LiveRegion({
  message,
  politeness = "polite",
}: {
  message: string;
  politeness?: "polite" | "assertive";
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic
      style={{
        position: "absolute",
        width: 1, height: 1,
        padding: 0, margin: -1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {message}
    </div>
  );
}
