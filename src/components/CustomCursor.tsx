"use client";

import { useEffect, useRef } from "react";

/**
 * CustomCursor — renders the dot + follower ring cursor.
 * Drop inside RootLayout body, outside ThemeProvider is fine.
 * Hides on touch/coarse-pointer devices via CSS.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const dot = dotRef.current;
    const follower = followerRef.current;
    const aura = auraRef.current;
    if (!dot || !follower || !aura) return;

    let mx = -100;
    let my = -100;
    let fx = -100;
    let fy = -100;
    let ax = -100;
    let ay = -100;
    let rafId: number;
    let isVisible = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!isVisible) {
        dot.classList.add("is-visible");
        follower.classList.add("is-visible");
        aura.classList.add("is-visible");
        isVisible = true;
      }
    };

    const setHoverState = (active: boolean) => {
      dot.classList.toggle("is-hovering", active);
      follower.classList.toggle("is-hovering", active);
      aura.classList.toggle("is-hovering", active);
    };

    const onPointerOver = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor='hover']"
      );
      setHoverState(Boolean(interactive));
    };

    const onPointerOut = (e: Event) => {
      const related = (e as MouseEvent).relatedTarget as HTMLElement | null;
      if (!related) {
        setHoverState(false);
        return;
      }
      const interactive = related.closest(
        "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor='hover']"
      );
      setHoverState(Boolean(interactive));
    };

    const onPointerDown = () => {
      dot.classList.add("is-pressed");
      follower.classList.add("is-pressed");
    };

    const onPointerUp = () => {
      dot.classList.remove("is-pressed");
      follower.classList.remove("is-pressed");
    };

    const onLeaveWindow = () => {
      dot.classList.remove("is-visible");
      follower.classList.remove("is-visible");
      aura.classList.remove("is-visible");
      setHoverState(false);
      isVisible = false;
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      // dot tracks instantly
      dot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;

      // follower lags behind
      fx += (mx - fx) * 0.16;
      fy += (my - fy) * 0.16;
      follower.style.transform = `translate(calc(${fx}px - 50%), calc(${fy}px - 50%))`;

      // aura lags even more for cinematic trail
      ax += (mx - ax) * 0.08;
      ay += (my - ay) * 0.08;
      aura.style.transform = `translate(calc(${ax}px - 50%), calc(${ay}px - 50%))`;
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onPointerOver, { passive: true });
    document.addEventListener("mouseout", onPointerOut, { passive: true });
    document.addEventListener("mousedown", onPointerDown, { passive: true });
    document.addEventListener("mouseup", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onLeaveWindow, { passive: true });
    window.addEventListener("blur", onLeaveWindow);
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onPointerOver);
      document.removeEventListener("mouseout", onPointerOut);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("mouseup", onPointerUp);
      document.removeEventListener("mouseleave", onLeaveWindow);
      window.removeEventListener("blur", onLeaveWindow);
    };
  }, []);

  return (
    <>
      <div ref={auraRef} className="cursor-aura" />
      <div ref={dotRef} className="cursor" />
      <div ref={followerRef} className="cursor-follower" />
    </>
  );
}
