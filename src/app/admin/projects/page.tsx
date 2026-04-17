"use client";
import { useEffect, useState } from "react";
import { adminApi, type AdminProjectResponse } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const ACCENT = "#7c3aed";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:        { label: "Pending Review", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  APPROVED:       { label: "Live",           color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  REJECTED:       { label: "Rejected",       color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
  FUNDED:         { label: "Funded",         color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  COMPLETED:      { label: "Completed",      color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  CANCELLED:      { label: "Cancelled",      color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  DRAFT:          { label: "Draft",          color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
};

type Filter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function AdminProjectsPage() {
  const { isDark } = useTheme();
  const [projects, setProjects] = useState<AdminProjectResponse[]>([]);
  const [filter, setFilter]     = useState<Filter>("PENDING");
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason]     = useState("");
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.allProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const approve = async (id: number) => {
    setActionId(id);
    try {
      await adminApi.approveProject(id);
      setProjects(ps => ps.map(p => p.id === id ? { ...p, status: "APPROVED" } : p));
      showToast("Project approved ✓");
    } catch (e: any) {
      showToast(e.message || "Failed", false);
    } finally {
      setActionId(null);
    }
  };

  const reject = async () => {
    if (!rejectId || !reason.trim()) return;
    setActionId(rejectId);
    try {
      await adminApi.rejectProject(rejectId, reason.trim());
      setProjects(ps => ps.map(p => p.id === rejectId ? { ...p, status: "REJECTED" } : p));
      showToast("Project rejected");
      setRejectId(null);
      setReason("");
    } catch (e: any) {
      showToast(e.message || "Failed", false);
    } finally {
      setActionId(null);
    }
  };

  const filtered = projects.filter(p => filter === "ALL" ? true : p.status === filter);
  const card = isDark ? "rgba(255,255,255,0.03)" : "#fff";
  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div style={{ padding: "40px 36px 60px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "13px 20px", borderRadius: 12, background: isDark ? "#1a1a1a" : "#fff", border: `1px solid ${toast.ok ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.4)"}`, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color: toast.ok ? "#34d399" : "#ef4444", animation: "toastIn 0.25s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* Reject modal */}
      {rejectId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 440, borderRadius: 20, background: isDark ? "#141414" : "#fff", border: `1px solid ${bdr}`, padding: "28px 28px 24px", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)", margin: "0 0 6px" }}>Reject Project</h3>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 18px" }}>Provide a reason — this will be shown to the creator.</p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Insufficient project description, missing proof of concept..."
              style={{ width: "100%", height: 110, padding: "12px 14px", borderRadius: 12, border: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.04)" : "#f8f8f8", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={reject} disabled={!reason.trim() || !!actionId} style={{ flex: 1, padding: "11px", borderRadius: 11, background: "#ef4444", border: "none", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, cursor: reason.trim() ? "pointer" : "not-allowed", opacity: reason.trim() ? 1 : 0.5 }}>
                {actionId ? "Rejecting…" : "Reject Project"}
              </button>
              <button onClick={() => { setRejectId(null); setReason(""); }} style={{ padding: "11px 20px", borderRadius: 11, border: `1px solid ${bdr}`, background: "transparent", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: "var(--text)", letterSpacing: "-0.03em", margin: "0 0 6px" }}>Projects</h1>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: 0 }}>Review and manage all campaigns on the platform</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {(["PENDING","ALL","APPROVED","REJECTED"] as Filter[]).map(f => {
          const count = f === "ALL" ? projects.length : projects.filter(p => p.status === f).length;
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${active ? ACCENT : bdr}`, background: active ? `${ACCENT}18` : "transparent", color: active ? ACCENT : "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: active ? 700 : 500, cursor: "pointer" }}>
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()} ({count})
            </button>
          );
        })}
        <button onClick={load} style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 10, border: `1px solid ${bdr}`, background: "transparent", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, cursor: "pointer" }}>↺ Refresh</button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ height: 300, borderRadius: 18, background: bdr, animation: "pulse 2s infinite" }}>
          <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", borderRadius: 18, background: card, border: `1px solid ${bdr}` }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-muted)" }}>No {filter.toLowerCase()} projects</p>
        </div>
      ) : (
        <div style={{ borderRadius: 18, background: card, border: `1px solid ${bdr}`, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr 140px", gap: 0, padding: "12px 20px", borderBottom: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            {["Project", "Creator", "Goal", "Deadline", "Status", "Actions"].map(h => (
              <span key={h} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>

          {filtered.map((p, i) => {
            const cfg = STATUS_CFG[p.status] ?? STATUS_CFG.DRAFT;
            const isPending = p.status === "PENDING";
            return (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr 140px", gap: 0, padding: "14px 20px", borderBottom: i < filtered.length - 1 ? `1px solid ${bdr}` : "none", alignItems: "center" }}>
                {/* Title */}
                <div>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{p.title}</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>ID #{p.id}</p>
                </div>
                {/* Creator */}
                <div>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text)", margin: 0 }}>@{p.creatorUsername}</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.creatorEmail}</p>
                </div>
                {/* Goal */}
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text)", margin: 0 }}>₹{(p.goalAmount ?? 0).toLocaleString("en-IN")}</p>
                {/* Deadline */}
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{p.deadline ? new Date(p.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}</p>
                {/* Status badge */}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color }} />
                  {cfg.label}
                </span>
                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  {isPending && (
                    <>
                      <button
                        onClick={() => approve(p.id)}
                        disabled={actionId === p.id}
                        style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)", fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >
                        {actionId === p.id ? "…" : "Approve"}
                      </button>
                      <button
                        onClick={() => setRejectId(p.id)}
                        disabled={actionId === p.id}
                        style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {!isPending && <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>—</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
