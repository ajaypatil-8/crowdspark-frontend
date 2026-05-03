"use client";

/**
 * src/components/ui/Toast.tsx
 * Global toast/notification system for CrowdSpark-X.
 * Usage:
 *   const toast = useToast();
 *   toast.success("Campaign created!");
 *   toast.error("Something went wrong");
 *   toast.info("Saving...");
 *   toast.warning("Deadline approaching");
 *   toast.promise(apiCall(), { loading: "Saving…", success: "Saved!", error: "Failed" });
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number; // ms — 0 = persistent
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  success: (message: string, opts?: Partial<ToastItem>) => string;
  error: (message: string, opts?: Partial<ToastItem>) => string;
  warning: (message: string, opts?: Partial<ToastItem>) => string;
  info: (message: string, opts?: Partial<ToastItem>) => string;
  loading: (message: string, opts?: Partial<ToastItem>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  promise: <T>(
    promise: Promise<T>,
    msgs: { loading: string; success: string | ((data: T) => string); error: string | ((err: unknown) => string) }
  ) => Promise<T>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<ToastType, { icon: ReactNode; color: string; bg: string; border: string }> = {
  success: {
    icon: <CheckCircle2 size={18} />,
    color: "var(--success)",
    bg: "var(--success-dim)",
    border: "rgba(16,185,129,0.25)",
  },
  error: {
    icon: <XCircle size={18} />,
    color: "var(--danger)",
    bg: "var(--danger-dim)",
    border: "rgba(239,68,68,0.25)",
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    color: "var(--warning)",
    bg: "var(--warning-dim)",
    border: "rgba(245,158,11,0.25)",
  },
  info: {
    icon: <Info size={18} />,
    color: "var(--info)",
    bg: "var(--info-dim)",
    border: "rgba(96,165,250,0.25)",
  },
  loading: {
    icon: <Loader2 size={18} className="animate-spin" />,
    color: "var(--accent)",
    bg: "var(--accent-dim)",
    border: "rgba(0,245,212,0.2)",
  },
};

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3500,
  error: 5000,
  warning: 4500,
  info: 3500,
  loading: 0, // persistent until dismissed
};

// ─── Single Toast Component ───────────────────────────────────────────────────

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const cfg = TOAST_CONFIG[item.type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState(100);
  const duration = item.duration ?? DEFAULT_DURATION[item.type];

  useEffect(() => {
    if (!duration) return;

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    timerRef.current = setTimeout(() => onDismiss(item.id), duration);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [item.id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      style={{
        width: 360,
        maxWidth: "calc(100vw - 32px)",
        background: "var(--card-bg-2)",
        border: `1px solid ${cfg.border}`,
        borderRadius: 16,
        padding: "14px 16px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
        backdropFilter: "blur(24px)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Left accent */}
      <div
        style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: 3,
          background: cfg.color,
          borderRadius: "16px 0 0 16px",
        }}
      />

      {/* Progress bar */}
      {!!duration && (
        <motion.div
          style={{
            position: "absolute",
            bottom: 0, left: 0,
            height: 2,
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`,
            borderRadius: "0 0 0 16px",
            transition: "width 0.05s linear",
          }}
        />
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingLeft: 8 }}>
        {/* Icon */}
        <div
          style={{
            color: cfg.color,
            flexShrink: 0,
            marginTop: 1,
            filter: `drop-shadow(0 0 6px ${cfg.color}80)`,
          }}
        >
          {cfg.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "var(--text)",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {item.message}
          </p>
          {item.description && (
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: "var(--text-muted)",
                margin: "4px 0 0",
                lineHeight: 1.5,
              }}
            >
              {item.description}
            </p>
          )}
          {item.action && (
            <button
              onClick={item.action.onClick}
              style={{
                marginTop: 8,
                fontSize: 12,
                fontWeight: 700,
                color: cfg.color,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.02em",
              }}
            >
              {item.action.label} →
            </button>
          )}
        </div>

        {/* Dismiss */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDismiss(item.id)}
          style={{
            color: "var(--text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 2,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  const add = useCallback(
    (type: ToastType, message: string, opts: Partial<ToastItem> = {}): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const item: ToastItem = { id, type, message, ...opts };
      setToasts((prev) => {
        // max 5 visible at once
        const next = [...prev, item];
        return next.length > 5 ? next.slice(next.length - 5) : next;
      });
      return id;
    },
    []
  );

  const ctx: ToastContextValue = {
    success: (m, o) => add("success", m, o),
    error: (m, o) => add("error", m, o),
    warning: (m, o) => add("warning", m, o),
    info: (m, o) => add("info", m, o),
    loading: (m, o) => add("loading", m, { duration: 0, ...o }),
    dismiss,
    dismissAll,
    promise: async (promise, msgs) => {
      const id = add("loading", msgs.loading, { duration: 0 });
      try {
        const data = await promise;
        dismiss(id);
        const msg = typeof msgs.success === "function" ? msgs.success(data) : msgs.success;
        add("success", msg);
        return data;
      } catch (err) {
        dismiss(id);
        const msg = typeof msgs.error === "function" ? msgs.error(err) : msgs.error;
        add("error", msg);
        throw err;
      }
    },
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast Viewport */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} style={{ pointerEvents: "auto" }}>
              <Toast item={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
