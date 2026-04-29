/**
 * src/animations/variants.ts
 * Shared Framer Motion variants — import wherever needed.
 * Usage: <motion.div variants={fadeUp} initial="hidden" animate="show" />
 *        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} />
 */

import type { Variants } from "framer-motion";

// ─── Fade ────────────────────────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -36 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 36 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Scale ───────────────────────────────────────────────────────────────────

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const scaleSpring: Variants = {
  hidden: { opacity: 0, scale: 0.78 },
  show:   { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  show:   { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 28 } },
};

// ─── Containers (stagger children) ───────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0 } },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

// ─── Cards ───────────────────────────────────────────────────────────────────

export const cardItem: Variants = {
  hidden: { opacity: 0, y: 44, scale: 0.95 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export const cardItemFast: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};

// ─── Slide ───────────────────────────────────────────────────────────────────

export const slideUp: Variants = {
  hidden: { opacity: 0, y: "100%" },
  show:   { opacity: 1, y: "0%",   transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, y: "100%", transition: { duration: 0.3, ease: "easeIn" } },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: "-100%" },
  show:   { opacity: 1, y: "0%",    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, y: "-100%", transition: { duration: 0.26, ease: "easeIn" } },
};

// ─── Modal / overlay ─────────────────────────────────────────────────────────

export const backdropVariant: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.2 } },
  exit:   { opacity: 0, transition: { duration: 0.18 } },
};

export const modalVariant: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.94 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, y: 32, scale: 0.96, transition: { duration: 0.2, ease: "easeIn" } },
};

export const bottomSheetVariant: Variants = {
  hidden: { opacity: 0, y: "100%" },
  show:   { opacity: 1, y: 0,      transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, y: "100%", transition: { duration: 0.24, ease: "easeIn" } },
};

// ─── Page transitions ─────────────────────────────────────────────────────────

export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, y: -10, transition: { duration: 0.26, ease: "easeIn" } },
};

// ─── Progress bars ────────────────────────────────────────────────────────────

export const progressBar = (pct: number) => ({
  initial: { width: 0 },
  animate: { width: `${Math.min(pct, 100)}%` },
  transition: { duration: 1.4, ease: [0.23, 1, 0.32, 1], delay: 0.2 },
});

// ─── Text reveal ─────────────────────────────────────────────────────────────

export const textReveal: Variants = {
  hidden: { opacity: 0, y: "105%", clipPath: "inset(0 0 100% 0)" },
  show: {
    opacity: 1, y: "0%", clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const charReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Notification / toast ────────────────────────────────────────────────────

export const toastVariant: Variants = {
  hidden: { opacity: 0, x: 72, scale: 0.92 },
  show:   { opacity: 1, x: 0, scale: 1, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, x: 72, scale: 0.92, transition: { duration: 0.2, ease: "easeIn" } },
};

// ─── Hover helpers (use with whileHover / whileTap) ─────────────────────────

export const hoverLift    = { y: -5, transition: { duration: 0.18 } };
export const hoverLiftSm  = { y: -2, transition: { duration: 0.15 } };
export const hoverScale   = { scale: 1.04, transition: { duration: 0.18 } };
export const hoverScaleSm = { scale: 1.016, transition: { duration: 0.15 } };
export const tapScale     = { scale: 0.96, transition: { duration: 0.1 } };
export const tapScaleSm   = { scale: 0.98, transition: { duration: 0.08 } };

// ─── List items ──────────────────────────────────────────────────────────────

export const listItem: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1, x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Sidebar drawer ──────────────────────────────────────────────────────────

export const sidebarVariant: Variants = {
  hidden: { x: "100%", opacity: 0 },
  show:   { x: 0, opacity: 1, transition: { type: "spring", stiffness: 340, damping: 36 } },
  exit:   { x: "100%", opacity: 0, transition: { duration: 0.24, ease: "easeIn" } },
};

export const sidebarLeftVariant: Variants = {
  hidden: { x: "-100%", opacity: 0 },
  show:   { x: 0, opacity: 1, transition: { type: "spring", stiffness: 340, damping: 36 } },
  exit:   { x: "-100%", opacity: 0, transition: { duration: 0.24, ease: "easeIn" } },
};

// ─── Counter (use with useMotionValue + animate) ──────────────────────────────

/** Returns spring config for animated counters */
export const counterSpring = {
  type: "spring" as const,
  stiffness: 60,
  damping: 16,
  mass: 0.8,
};
