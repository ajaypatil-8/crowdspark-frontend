/**
 * src/hooks/useScrollLock.ts
 * Section 11 Part 3 — Locks body scroll when a modal/drawer is open.
 * Preserves current scroll position and restores it on unlock.
 */

import { useEffect } from "react";

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollY   = window.scrollY;
    const body      = document.body;
    const prevStyle = {
      overflow:  body.style.overflow,
      position:  body.style.position,
      top:       body.style.top,
      width:     body.style.width,
    };

    // Lock
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top      = `-${scrollY}px`;
    body.style.width    = "100%";

    return () => {
      // Restore
      body.style.overflow = prevStyle.overflow;
      body.style.position = prevStyle.position;
      body.style.top      = prevStyle.top;
      body.style.width    = prevStyle.width;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
