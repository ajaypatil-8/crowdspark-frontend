"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useCursor() {
  const cursorRef   = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot      = cursorRef.current;
    const ring     = followerRef.current;
    if (!dot || !ring) return;

    let raf: number;
    let mx = 0, my = 0, rx = 0, ry = 0;
    let live = true;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      gsap.set(dot, { x: mx, y: my });
    };

    const tick = () => {
      if (!live) return;
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      gsap.set(ring, { x: rx, y: ry });
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      live = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return { cursorRef, followerRef };
}