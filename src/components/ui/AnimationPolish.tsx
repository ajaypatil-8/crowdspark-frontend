"use client";

/**
 * src/components/ui/AnimationPolish.tsx
 * Section 11 Part 3 — Animation utilities:
 *   - useReducedMotion   : respects prefers-reduced-motion
 *   - ScrollReveal       : intersection-observer reveal wrapper
 *   - StaggerList        : staggered children animation
 *   - PageTransition     : smooth page entry animation
 *   - AnimatedNumber     : smooth counting animation
 *   - PulseRing          : pulsing glow ring (for CTAs / live badges)
 */

import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  Children,
  cloneElement,
  isValidElement,
  CSSProperties,
} from "react";
import { motion, useReducedMotion as _useReducedMotion, Variants } from "framer-motion";

// ─── useReducedMotion ──────────────────────────────────────────────────────────
export function useReducedMotion(): boolean {
  return !!_useReducedMotion();
}

// ─── Easing presets ───────────────────────────────────────────────────────────
export const ease = {
  spring:  [0.22, 1, 0.36, 1]   as [number,number,number,number],
  smooth:  [0.4,  0, 0.2,  1]   as [number,number,number,number],
  bouncy:  [0.34, 1.56, 0.64, 1] as [number,number,number,number],
  snappy:  [0.77, 0, 0.175, 1]  as [number,number,number,number],
};

// ─── Variant presets ──────────────────────────────────────────────────────────
export const variants = {
  fadeUp: {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: ease.spring } },
  } as Variants,

  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: ease.smooth } },
  } as Variants,

  scaleIn: {
    hidden:  { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: ease.spring } },
  } as Variants,

  slideRight: {
    hidden:  { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: ease.spring } },
  } as Variants,

  slideLeft: {
    hidden:  { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: ease.spring } },
  } as Variants,

  staggerContainer: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  } as Variants,
};

// ─── ScrollReveal ─────────────────────────────────────────────────────────────
export function ScrollReveal({
  children,
  variant = "fadeUp",
  delay = 0,
  threshold = 0.12,
  once = true,
  style,
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  delay?: number;
  threshold?: number;
  once?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const v = variants[variant];

  if (prefersReduced) {
    return <div style={style} className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={v}
      transition={{ delay }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggerList ───────────────────────────────────────────────────────────────
export function StaggerList({
  children,
  staggerDelay = 0.07,
  childVariant = "fadeUp",
  className,
  style,
}: {
  children: ReactNode;
  staggerDelay?: number;
  childVariant?: keyof typeof variants;
  className?: string;
  style?: CSSProperties;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className} style={style}>{children}</div>;
  }

  const containerVariants: Variants = {
    hidden:  {},
    visible: { transition: { staggerChildren: staggerDelay, delayChildren: 0.04 } },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={containerVariants}
      className={className}
      style={style}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        return (
          <motion.div variants={variants[childVariant]}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─── PageTransition ───────────────────────────────────────────────────────────
export function PageTransition({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.38, ease: ease.spring }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── AnimatedNumber ────────────────────────────────────────────────────────────
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1400,
  className,
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref      = useRef<HTMLSpanElement>(null);
  const prefersR = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    if (prefersR) {
      ref.current.textContent = prefix + value.toFixed(decimals) + suffix;
      return;
    }

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current  = eased * value;
      if (ref.current) {
        ref.current.textContent = prefix + current.toFixed(decimals) + suffix;
      }
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, prefix, suffix, decimals, duration, prefersR]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}0{suffix}
    </span>
  );
}

// ─── PulseRing ────────────────────────────────────────────────────────────────
export function PulseRing({
  color = "rgba(0,245,212,0.5)",
  size = 10,
  children,
}: {
  color?: string;
  size?: number;
  children?: ReactNode;
}) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{
        position: "absolute",
        width: size, height: size, borderRadius: "50%",
        background: color,
        animation: "pulseRing 2s ease-out infinite",
      }}/>
      <span style={{
        position: "absolute",
        width: size, height: size, borderRadius: "50%",
        background: color,
        animation: "pulseRing 2s ease-out infinite 0.5s",
      }}/>
      {children}
      <style>{`
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.8; }
          80%  { transform: scale(2.8); opacity: 0; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      `}</style>
    </span>
  );
}

// ─── HoverCard ────────────────────────────────────────────────────────────────
export function HoverCard({
  children,
  liftPx = 4,
  className,
  style,
  onClick,
}: {
  children: ReactNode;
  liftPx?: number;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  const prefersR = useReducedMotion();
  const lift = prefersR ? 0 : liftPx;

  return (
    <motion.div
      whileHover={{ y: -lift, scale: 1.005 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.22, ease: ease.spring }}
      className={className}
      style={{ cursor: onClick ? "pointer" : undefined, ...style }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
