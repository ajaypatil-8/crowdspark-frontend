"use client";

import { useEffect, useRef } from "react";

/**
 * CustomCursor — renders the dot + follower ring cursor.
 * Drop inside RootLayout body, outside ThemeProvider is fine.
 * Hides on touch/coarse-pointer devices via CSS.
 */
export default function CustomCursor() {
  const dotRef      = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot      = dotRef.current;
    const follower = followerRef.current;
    if (!dot || !follower) return;

    let mx = -100, my = -100;
    let fx = -100, fy = -100;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const onEnterLink = () => follower.classList.add("hovering");
    const onLeaveLink = () => follower.classList.remove("hovering");

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      // dot tracks instantly
      dot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;

      // follower lags behind
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.transform = `translate(calc(${fx}px - 50%), calc(${fy}px - 50%))`;
    };

    // attach hover effect to interactive elements
    const attachHover = () => {
      document
        .querySelectorAll<HTMLElement>("a, button, [role='button'], input, textarea, select, label")
        .forEach(el => {
          el.addEventListener("mouseenter", onEnterLink, { passive: true });
          el.addEventListener("mouseleave", onLeaveLink, { passive: true });
        });
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    attachHover();
    tick();

    // re-attach on route changes via MutationObserver
    const observer = new MutationObserver(attachHover);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef}      className="cursor" />
      <div ref={followerRef} className="cursor-follower" />
    </>
  );
}
