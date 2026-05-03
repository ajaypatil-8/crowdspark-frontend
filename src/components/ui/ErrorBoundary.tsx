"use client";
/**
 * src/components/ui/ErrorBoundary.tsx
 *
 * React class-based error boundary with a premium fallback UI.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   // With custom fallback
 *   <ErrorBoundary fallback={<p>Custom error UI</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   // HOC wrapper
 *   export default withErrorBoundary(MyPage);
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

// ─── Props / State ────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  isDark?: boolean;
  /** If true, renders a compact inline error instead of full-page */
  inline?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

// ─── Default fallback UI ──────────────────────────────────────────────────────

function DefaultFallback({
  error, onReset, isDark = true, inline = false, showDetails, onToggleDetails,
}: {
  error: Error | null;
  onReset: () => void;
  isDark?: boolean;
  inline?: boolean;
  showDetails: boolean;
  onToggleDetails: () => void;
}) {
  const bg    = isDark ? "#080808"                  : "#f9f9f7";
  const card  = isDark ? "#0e0e0e"                  : "#ffffff";
  const bdr   = isDark ? "rgba(255,255,255,0.07)"   : "rgba(0,0,0,0.07)";
  const txt   = isDark ? "#eeeef5"                  : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)"   : "rgba(0,0,0,0.42)";
  const code  = isDark ? "rgba(255,255,255,0.06)"   : "rgba(0,0,0,0.05)";

  if (inline) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{
          padding: "18px 20px", borderRadius: 16,
          background: "rgba(239,68,68,0.07)",
          border: "1px solid rgba(239,68,68,0.2)",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}
      >
        <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#ef4444", margin: "0 0 4px" }}>
            Something went wrong
          </p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, margin: "0 0 12px" }}>
            {error?.message ?? "An unexpected error occurred."}
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={onReset}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8,
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#ef4444", cursor: "pointer",
              fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 700,
            }}
          >
            <RefreshCw size={13} /> Try again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: bg }}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: 480, width: "100%", textAlign: "center" }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.5 }} animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 260, delay: 0.1 }}
          style={{
            width: 76, height: 76, borderRadius: 24,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 0 0 8px rgba(239,68,68,0.06)",
          }}
        >
          <AlertTriangle size={34} color="#ef4444" />
        </motion.div>

        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 900, fontSize: 24, color: txt, margin: "0 0 10px" }}>
          Something went wrong
        </p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: muted, lineHeight: 1.75, margin: "0 0 28px" }}>
          An unexpected error occurred in this section. You can try refreshing or go back to the homepage.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(239,68,68,0.35)" }}
            whileTap={{ scale: 0.96 }}
            onClick={onReset}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 12,
              background: "linear-gradient(135deg,#ef4444,#dc2626)",
              border: "none", color: "#fff", cursor: "pointer",
              fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14,
              boxShadow: "0 4px 16px rgba(239,68,68,0.3)",
            }}
          >
            <RefreshCw size={15} /> Try again
          </motion.button>

          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 12,
              background: card, border: `1px solid ${bdr}`,
              color: muted, textDecoration: "none",
              fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600,
              transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = txt}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = muted}
          >
            Go Home
          </Link>
        </div>

        {/* Error details toggle */}
        {error && (
          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={onToggleDetails}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "transparent", border: "none", cursor: "pointer",
                color: muted, fontFamily: "DM Mono, monospace", fontSize: 11,
                letterSpacing: "0.08em",
              }}
            >
              {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showDetails ? "HIDE DETAILS" : "SHOW DETAILS"}
            </motion.button>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                style={{ overflow: "hidden", marginTop: 12 }}
              >
                <pre style={{
                  fontFamily: "DM Mono, monospace", fontSize: 11.5,
                  color: "#ef4444", background: code,
                  border: `1px solid rgba(239,68,68,0.15)`,
                  borderRadius: 10, padding: "14px 16px",
                  textAlign: "left", overflowX: "auto",
                  lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all",
                }}>
                  {error.name}: {error.message}
                  {error.stack ? `\n\n${error.stack.split("\n").slice(1, 6).join("\n")}` : ""}
                </pre>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Class boundary ───────────────────────────────────────────────────────────

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, showDetails: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console; swap with Sentry/Datadog in production
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null, showDetails: false });

  toggleDetails = () => this.setState(s => ({ showDetails: !s.showDetails }));

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <DefaultFallback
          error={this.state.error}
          onReset={this.reset}
          isDark={this.props.isDark}
          inline={this.props.inline}
          showDetails={this.state.showDetails}
          onToggleDetails={this.toggleDetails}
        />
      );
    }
    return this.props.children;
  }
}

// ─── HOC helper ───────────────────────────────────────────────────────────────

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  boundaryProps?: Omit<Props, "children">
) {
  const WithBoundary = (props: P) => (
    <ErrorBoundary {...boundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  WithBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"})`;
  return WithBoundary;
}

export default ErrorBoundary;
