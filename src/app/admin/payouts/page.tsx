
"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote, CheckCircle2, XCircle, Clock, Loader2,
  RefreshCcw, AlertTriangle, X, User, ExternalLink,
} from "lucide-react";
import {
  adminApi, payoutApi,
  type AdminProjectResponse, type PayoutResponse,
} from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const ACCENT = "#7c3aed";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  AWAITING:   { label: "Awaiting Payout", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  INITIATED:  { label: "Initiated",       color: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  PROCESSING: { label: "Processing",      color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  COMPLETED:  { label: "Completed",       color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  FAILED:     { label: "Failed",          color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
};

function Toast({ msg, ok, onClose }: { msg: string; ok: boolean; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [onClose]);
  const color = ok ? "#34d399" : "#ef4444";
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "13px 18px", borderRadius: 14, background: "#141414", border: `1px solid ${color}44`, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 10, maxWidth: 420 }}
    >
      {ok ? <CheckCircle2 size={16} color={color} /> : <XCircle size={16} color={color} />}
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2, display: "flex", marginLeft: 4 }}><X size={13} /></button>
    </motion.div>
  );
}

interface Row {
  project: AdminProjectResponse;
  payout:  PayoutResponse | null;
}

export default function AdminPayoutsPage() {
  const { isDark } = useTheme();
  const [rows,      setRows]      = useState<Row[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [actionId,  setActionId]  = useState<number | null>(null);
  const [toast,     setToast]     = useState<{ msg: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allProjects, allPayouts] = await Promise.all([
        adminApi.allProjects(),
        payoutApi.getAll(),
      ]);

      const funded = allProjects.filter(p => p.status === "FUNDED");
      const merged: Row[] = funded.map(project => ({
        project,
        payout: allPayouts.find(p => p.projectId === project.id) ?? null,
      }));

      // Funded-but-unpaid first, then by most recent payout activity
      merged.sort((a, b) => {
        if (!a.payout && b.payout) return -1;
        if (a.payout && !b.payout) return 1;
        return 0;
      });

      setRows(merged);
    } catch {
      setToast({ msg: "Failed to load payouts. Please refresh.", ok: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleInitiate = async (projectId: number) => {
    setActionId(projectId);
    try {
      await payoutApi.initiate(projectId);
      setToast({ msg: "Payout initiated successfully.", ok: true });
      await load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to initiate payout.";
      setToast({ msg: message, ok: false });
    } finally {
      setActionId(null);
    }
  };

  const bg    = isDark ? "#0f0f0f" : "#ffffff";
  const bdr   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const txt   = isDark ? "#fff" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap" as const, gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}>
              <Banknote size={17} />
            </div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: txt, margin: 0, letterSpacing: "-0.02em" }}>Creator Payouts</h1>
          </div>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: muted, margin: 0 }}>
            Disburse funds to creators of successfully funded campaigns via Razorpay.
          </p>
        </div>
        <button onClick={load} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 11, border: `1px solid ${bdr}`, background: "none", color: muted, cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600 }}>
          <RefreshCcw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && rows.length === 0 && (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <Loader2 size={28} color={ACCENT} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      )}

      {/* Empty state */}
      {!loading && rows.length === 0 && (
        <div style={{ padding: "60px 24px", borderRadius: 20, textAlign: "center", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px dashed ${bdr}` }}>
          <Banknote size={32} color={muted} style={{ marginBottom: 12 }} />
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: txt, margin: "0 0 4px" }}>No funded campaigns yet</p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, margin: 0 }}>Payouts will appear here once a campaign reaches FUNDED status.</p>
        </div>
      )}

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map(({ project, payout }) => {
          const statusKey = payout?.status ?? "AWAITING";
          const cfg = STATUS_CFG[statusKey];
          const isBusy = actionId === project.id;
          const canInitiate = !payout || payout.status === "FAILED";

          return (
            <motion.div key={project.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ borderRadius: 18, background: bg, border: `1px solid ${bdr}`, padding: "18px 20px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" as const }}>

              {/* Thumbnail */}
              <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                {project.thumbnailUrl
                  ? <img src={project.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${ACCENT},#a855f7)` }} />
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5, color: txt, margin: "0 0 4px" }}>{project.title}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "DM Sans, sans-serif", fontSize: 12, color: muted }}>
                  <User size={11} /> @{project.creatorUsername}
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: muted, margin: "0 2px" }} />
                  Goal ₹{project.goalAmount.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Amounts (once a payout exists) */}
              {payout && (
                <div style={{ textAlign: "right", minWidth: 130 }}>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, color: "#34d399", margin: "0 0 2px" }}>
                    ₹{payout.netAmount.toLocaleString("en-IN")}
                  </p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: muted, margin: 0 }}>
                    net of ₹{payout.platformFeeAmount.toLocaleString("en-IN")} fee
                  </p>
                </div>
              )}

              {/* Status badge */}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: cfg.bg, border: `1px solid ${cfg.color}30`, fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: cfg.color, whiteSpace: "nowrap" as const }}>
                {statusKey === "PROCESSING" && <Clock size={12} />}
                {statusKey === "COMPLETED"  && <CheckCircle2 size={12} />}
                {statusKey === "FAILED"     && <AlertTriangle size={12} />}
                {cfg.label}
              </span>

              {/* Action */}
              {canInitiate ? (
                <button
                  onClick={() => handleInitiate(project.id)}
                  disabled={isBusy}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "9px 18px", borderRadius: 11, border: "none",
                    background: isBusy ? "rgba(124,58,237,0.5)" : `linear-gradient(135deg,${ACCENT},#a855f7)`,
                    color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13,
                    cursor: isBusy ? "not-allowed" : "pointer", whiteSpace: "nowrap" as const,
                    boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
                  }}
                >
                  {isBusy
                    ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Processing…</>
                    : payout?.status === "FAILED" ? "Retry Payout" : "Initiate Payout"
                  }
                </button>
              ) : (
                payout?.razorpayPayoutId && (
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: muted, display: "flex", alignItems: "center", gap: 4 }}>
                    <ExternalLink size={11} /> {payout.razorpayPayoutId}
                  </span>
                )
              )}

              {/* Failure reason */}
              {payout?.status === "FAILED" && payout.failureReason && (
                <div style={{ width: "100%", marginTop: 4, padding: "8px 12px", borderRadius: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "#ef4444", margin: 0 }}>{payout.failureReason}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}