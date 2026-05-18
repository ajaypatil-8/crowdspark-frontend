"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = -300, my = -300;
    let rx = -300, ry = -300;
    let dotTargetS  = 1, ringTargetS = 1;
    let dotCurS     = 1, ringCurS    = 1;
    let rafId: number;
    let visible    = false;
    let isHovering = false;
    let isPressed  = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const show = () => {
      if (visible) return;
      dot.style.opacity  = "1";
      ring.style.opacity = "1";
      visible = true;
    };

    const hide = () => {
      dot.style.opacity  = "0";
      ring.style.opacity = "0";
      visible = false;
      mx = -300; my = -300;
    };

    const syncScales = () => {
      if (isPressed) {
        dotTargetS  = 0.6;
        ringTargetS = 0.8;
      } else if (isHovering) {
        dotTargetS  = 1.8;
        ringTargetS = 1.5;
      } else {
        dotTargetS  = 1;
        ringTargetS = 1;
      }
    };

    const INTERACTIVE =
      "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor='hover']";

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      show();
    };

    const onOver = (e: Event) => {
      const hit = (e.target as HTMLElement | null)?.closest(INTERACTIVE);
      isHovering = Boolean(hit);
      ring.dataset.hover = isHovering ? "1" : "0";
      syncScales();
    };

    const onOut = (e: Event) => {
      const rel = (e as MouseEvent).relatedTarget as HTMLElement | null;
      isHovering = Boolean(rel?.closest(INTERACTIVE));
      ring.dataset.hover = isHovering ? "1" : "0";
      syncScales();
    };

    // Only left-click triggers press animation — right-click is ignored entirely
    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isPressed = true;
      syncScales();
    };

    const onUp = () => {
      isPressed = false;
      syncScales();
    };

    const onLeave = () => {
      isHovering = false;
      isPressed  = false;
      hide();
      syncScales();
    };

    const RING_SPEED  = 0.18;
    const SCALE_SPEED = 0.20;

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      dot.style.transform =
        `translate(${mx}px,${my}px) scale(${dotCurS.toFixed(3)})`;

      rx = lerp(rx, mx, RING_SPEED);
      ry = lerp(ry, my, RING_SPEED);
      ring.style.transform =
        `translate(${rx.toFixed(2)}px,${ry.toFixed(2)}px) scale(${ringCurS.toFixed(3)})`;

      dotCurS  = lerp(dotCurS,  dotTargetS,  SCALE_SPEED);
      ringCurS = lerp(ringCurS, ringTargetS, SCALE_SPEED);
    };

    document.addEventListener("mousemove",  onMove, { passive: true });
    document.addEventListener("mouseover",  onOver, { passive: true });
    document.addEventListener("mouseout",   onOut,  { passive: true });
    document.addEventListener("mousedown",  onDown, { passive: true });
    document.addEventListener("mouseup",    onUp,   { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur",         onLeave);

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mouseout",   onOut);
      document.removeEventListener("mousedown",  onDown);
      document.removeEventListener("mouseup",    onUp);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur",         onLeave);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cs-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cs-ring" aria-hidden="true" />
    </>
  );
}