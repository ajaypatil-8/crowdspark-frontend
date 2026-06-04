"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  // Motion values
  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);

  // Smooth springs for the ring
  const ringX = useSpring(mouseX, { stiffness: 400, damping: 28, mass: 0.5 });
  const ringY = useSpring(mouseY, { stiffness: 400, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Disable on touch devices or if reduced motion is preferred
    const isFinePointer = window.matchMedia("(any-pointer: fine)").matches;
    const wantsReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (!isFinePointer || wantsReducedMotion) {
      setIsTouchDevice(true);
      return;
    }
    
    setIsTouchDevice(false);
    document.documentElement.classList.add("cs-cursor-ready");

    const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor='hover']";

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(INTERACTIVE)) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const rel = e.relatedTarget as HTMLElement | null;
      if (!rel?.closest(INTERACTIVE)) {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsHovering(false);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseout", handleMouseOut, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("blur", handleMouseLeave);

    return () => {
      document.documentElement.classList.remove("cs-cursor-ready");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("blur", handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Central Dot */}
      <motion.div
        className="cs-dot"
        aria-hidden="true"
        style={{
          x: mouseX,
          y: mouseY,
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
      {/* Outer Ring */}
      <motion.div
        className="cs-ring"
        aria-hidden="true"
        data-hover={isHovering ? "1" : "0"}
        style={{
          x: ringX,
          y: ringY,
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isHovering ? 1.4 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />
    </>
  );
}
