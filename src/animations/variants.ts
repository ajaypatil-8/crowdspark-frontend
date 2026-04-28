/**
 * src/animations/variants.ts
 * Shared Framer Motion variants — import wherever needed.
 * Usage: <motion.div variants={fadeUp} initial="hidden" animate="show" />
 *        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} />
 */

import type { Variants } from "framer-motion";

// ─── Fade ────────────────────────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Scale ───────────────────────────────────────────────────────────────────

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const scaleSpring: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show:   { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 280, damping: 22 } },
};

// ─── Containers (stagger children) ───────────────────────────────────────────

/** Wrap children in this container to stagger them */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

// ─── Cards ───────────────────────────────────────────────────────────────────

/** Card stagger child — combine with staggerContainer */
export const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const cardItemFast: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

// ─── Slide ───────────────────────────────────────────────────────────────────

export const slideUp: Variants = {
  hidden: { opacity: 0, y: "100%" },
  show:   { opacity: 1, y: "0%", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, y: "100%", transition: { duration: 0.3, ease: "easeIn" } },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: "-100%" },
  show:   { opacity: 1, y: "0%", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, y: "-100%", transition: { duration: 0.25, ease: "easeIn" } },
};

// ─── Modal / overlay ─────────────────────────────────────────────────────────

export const backdropVariant: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.2 } },
  exit:   { opacity: 0, transition: { duration: 0.18 } },
};

export const modalVariant: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, y: 30, scale: 0.97, transition: { duration: 0.2, ease: "easeIn" } },
};

export const bottomSheetVariant: Variants = {
  hidden: { opacity: 0, y: "100%" },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, y: "100%", transition: { duration: 0.22, ease: "easeIn" } },
};

// ─── Page transitions ─────────────────────────────────────────────────────────

export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, y: -8, transition: { duration: 0.25, ease: "easeIn" } },
};

// ─── Progress bars ────────────────────────────────────────────────────────────

/** Use as inline style width or with custom animate={{ width: `${pct}%` }} */
export const progressBar = (pct: number) => ({
  initial: { width: 0 },
  animate: { width: `${Math.min(pct, 100)}%` },
  transition: { duration: 1.2, ease: [0.23, 1, 0.32, 1] },
});

// ─── Text reveal ─────────────────────────────────────────────────────────────

export const textReveal: Variants = {
  hidden: { opacity: 0, y: "100%", clipPath: "inset(0 0 100% 0)" },
  show: {
    opacity: 1,
    y: "0%",
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Notification / toast ────────────────────────────────────────────────────

export const toastVariant: Variants = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  show:   { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } },
};

// ─── Hover helpers (use with whileHover) ────────────────────────────────────

export const hoverLift = { y: -4, transition: { duration: 0.18 } };
export const hoverScale = { scale: 1.03, transition: { duration: 0.18 } };
export const hoverScaleSm = { scale: 1.015, transition: { duration: 0.15 } };
export const tapScale = { scale: 0.97, transition: { duration: 0.1 } };
