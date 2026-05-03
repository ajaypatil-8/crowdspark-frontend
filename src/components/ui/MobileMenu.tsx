"use client";

/**
 * src/components/ui/MobileMenu.tsx
 * Section 11 Part 3 — Reusable full-height animated mobile bottom-drawer/menu
 * Used by Navbar for mobile navigation.
 *
 * Features:
 * - spring slide-up animation from bottom
 * - drag-to-dismiss (swipe down)
 * - focus trap + Escape to close
 * - backdrop blur overlay
 * - scroll lock on open
 * - respects reduced motion
 */

import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { FocusTrap } from "./Accessibility";
import { useReducedMotion } from "./AnimationPolish";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function MobileMenu({ open, onClose, children }: MobileMenuProps) {
  const { isDark }      = useTheme();
  const prefersReduced  = useReducedMotion();
  const dragControls    = useDragControls();

  // Scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const bg     = isDark ? "rgba(6,6,10,0.97)"    : "rgba(255,255,255,0.97)";
  const bdr    = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mob-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.22 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
            aria-hidden="true"
          />

          {/* Drawer */}
          <FocusTrap active={open} onEscape={onClose}>
            <motion.div
              key="mob-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.3 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80) onClose();
              }}
              initial={prefersReduced ? { opacity: 0 } : { y: "100%" }}
              animate={prefersReduced ? { opacity: 1 } : { y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { y: "100%" }}
              transition={{
                type: "spring",
                damping: 32,
                stiffness: 280,
                mass: 0.9,
              }}
              style={{
                position: "fixed",
                left: 12, right: 12, bottom: 12,
                zIndex: 1001,
                borderRadius: 24,
                background: bg,
                border: `1px solid ${bdr}`,
                boxShadow: isDark
                  ? "0 -20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)"
                  : "0 -12px 48px rgba(0,0,0,0.15)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                overflow: "hidden",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Drag handle */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                style={{
                  display: "flex", justifyContent: "center", padding: "14px 0 6px",
                  cursor: "grab", flexShrink: 0,
                }}
              >
                <div style={{
                  width: 36, height: 4, borderRadius: 2,
                  background: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.18)",
                }}/>
              </div>

              {/* Content */}
              <div style={{ overflowY: "auto", flex: 1, padding: "8px 16px 20px" }}>
                {children}
              </div>
            </motion.div>
          </FocusTrap>
        </>
      )}
    </AnimatePresence>
  );
}
