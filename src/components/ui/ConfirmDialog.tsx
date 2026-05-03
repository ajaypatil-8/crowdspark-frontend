"use client";
/**
 * src/components/ui/ConfirmDialog.tsx
 *
 * Premium animated confirm / alert dialog.
 *
 * Usage (imperative — via hook):
 *   const confirm = useConfirm();
 *   const ok = await confirm({
 *     title: "Delete campaign?",
 *     description: "This action cannot be undone.",
 *     confirmLabel: "Delete",
 *     variant: "danger",
 *   });
 *   if (ok) await deleteApi(id);
 *
 * Usage (declarative):
 *   <ConfirmDialog
 *     open={open}
 *     onConfirm={handleConfirm}
 *     onCancel={() => setOpen(false)}
 *     title="Are you sure?"
 *     variant="danger"
 *   />
 *
 * Wrap root layout with <ConfirmProvider> to use the hook.
 */

import {
  createContext, useContext, useCallback,
  useState, useRef, ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, Info, CheckCircle2, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConfirmVariant = "danger" | "warning" | "info" | "success";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  isDark?: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

type ResolveFn = (value: boolean) => void;

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: () => Promise.resolve(false),
});

// ─── Variant config ───────────────────────────────────────────────────────────

const VARIANT_CFG: Record<ConfirmVariant, {
  icon: ReactNode; accent: string; dim: string; confirmBg: string;
}> = {
  danger: {
    icon: <Trash2 size={22} />,
    accent: "#ef4444",
    dim: "rgba(239,68,68,0.12)",
    confirmBg: "linear-gradient(135deg,#ef4444,#dc2626)",
  },
  warning: {
    icon: <AlertTriangle size={22} />,
    accent: "#f59e0b",
    dim: "rgba(245,158,11,0.12)",
    confirmBg: "linear-gradient(135deg,#f59e0b,#d97706)",
  },
  info: {
    icon: <Info size={22} />,
    accent: "#60a5fa",
    dim: "rgba(96,165,250,0.12)",
    confirmBg: "linear-gradient(135deg,#60a5fa,#3b82f6)",
  },
  success: {
    icon: <CheckCircle2 size={22} />,
    accent: "#10b981",
    dim: "rgba(16,185,129,0.12)",
    confirmBg: "linear-gradient(135deg,#10b981,#059669)",
  },
};

// ─── Dialog ───────────────────────────────────────────────────────────────────

interface DialogProps extends ConfirmOptions {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, onConfirm, onCancel,
  title, description,
  confirmLabel = "Confirm", cancelLabel = "Cancel",
  variant = "danger", isDark = true,
}: DialogProps) {
  const cfg  = VARIANT_CFG[variant];
  const bg   = isDark ? "#0c0c0c" : "#ffffff";
  const bdr  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const txt  = isDark ? "#eeeef5" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.44)" : "rgba(0,0,0,0.44)";
  const cancelBg  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const cancelBdr = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onCancel}
          style={{
            position: "fixed", inset: 0, zIndex: 8000,
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.88, y: 28, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, y: 28, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: bg,
              border: `1px solid ${bdr}`,
              borderRadius: 24,
              padding: "32px 28px",
              maxWidth: 420, width: "100%",
              boxShadow: isDark
                ? "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)"
                : "0 40px 100px rgba(0,0,0,0.15)",
              position: "relative",
            }}
          >
            {/* Close X */}
            <motion.button
              whileHover={{ scale: 1.1, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}
              whileTap={{ scale: 0.9 }}
              onClick={onCancel}
              style={{
                position: "absolute", top: 16, right: 16,
                width: 30, height: 30, borderRadius: "50%",
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                border: `1px solid ${bdr}`, color: muted,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={13} />
            </motion.button>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 280, delay: 0.08 }}
              style={{
                width: 56, height: 56, borderRadius: 17,
                background: cfg.dim,
                border: `1px solid ${cfg.accent}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: cfg.accent, marginBottom: 20,
                boxShadow: `0 0 0 6px ${cfg.accent}08`,
              }}
            >
              {cfg.icon}
            </motion.div>

            {/* Title */}
            <p style={{
              fontFamily: "Syne, sans-serif", fontWeight: 900,
              fontSize: 19, color: txt, margin: "0 0 10px", lineHeight: 1.25,
            }}>
              {title}
            </p>

            {description && (
              <p style={{
                fontFamily: "DM Sans, sans-serif", fontSize: 14.5,
                color: muted, lineHeight: 1.7, margin: "0 0 28px",
              }}>
                {description}
              </p>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={onCancel}
                style={{
                  flex: 1, padding: "12px",
                  borderRadius: 12, cursor: "pointer",
                  background: cancelBg, border: `1px solid ${cancelBdr}`,
                  color: muted,
                  fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600,
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = txt;
                  (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = muted;
                  (e.currentTarget as HTMLElement).style.background = cancelBg;
                }}
              >
                {cancelLabel}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: `0 8px 24px ${cfg.accent}45` }}
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                style={{
                  flex: 1, padding: "12px",
                  borderRadius: 12, cursor: "pointer",
                  background: cfg.confirmBg, border: "none", color: "#fff",
                  fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 800,
                  boxShadow: `0 4px 16px ${cfg.accent}35`,
                  transition: "box-shadow 0.2s",
                }}
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Provider + hook ──────────────────────────────────────────────────────────

interface PendingDialog extends ConfirmOptions {
  id: string;
}

export function ConfirmProvider({ children, isDark = true }: { children: ReactNode; isDark?: boolean }) {
  const [dialogs, setDialogs] = useState<PendingDialog[]>([]);
  const resolvers = useRef<Map<string, ResolveFn>>(new Map());

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      const id = Math.random().toString(36).slice(2);
      resolvers.current.set(id, resolve);
      setDialogs(d => [...d, { ...opts, id }]);
    });
  }, []);

  const resolve = (id: string, value: boolean) => {
    resolvers.current.get(id)?.(value);
    resolvers.current.delete(id);
    setDialogs(d => d.filter(x => x.id !== id));
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialogs.map(d => (
        <ConfirmDialog
          key={d.id}
          open
          isDark={isDark}
          title={d.title}
          description={d.description}
          confirmLabel={d.confirmLabel}
          cancelLabel={d.cancelLabel}
          variant={d.variant}
          onConfirm={() => resolve(d.id, true)}
          onCancel={() => resolve(d.id, false)}
        />
      ))}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return ctx.confirm;
}

export default ConfirmDialog;
