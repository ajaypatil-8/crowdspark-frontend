// src/components/dashboard/CreatorRewardFulfillment.tsx
// Creator view: manage reward claim fulfillment per campaign.
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift, Package, Truck, CheckCircle2, XCircle,
  Loader2, AlertCircle, ChevronDown, ChevronUp,
  MapPin, Send,
} from "lucide-react";
import {
  rewardClaimApi,
  type RewardClaimResponse,
  type RewardClaimStatus,
} from "@/lib/api";

interface Props { projectId: number; isDark: boolean }

const STATUSES: { value: string; label: string; color: string }[] = [
  { value: "",           label: "All",        color: "inherit" },
  { value: "PENDING",    label: "Pending",    color: "#f59e0b" },
  { value: "PROCESSING", label: "Processing", color: "#3b82f6" },
  { value: "SHIPPED",    label: "Shipped",    color: "#8b5cf6" },
  { value: "FULFILLED",  label: "Delivered",  color: "#22c55e" },
  { value: "CANCELLED",  label: "Cancelled",  color: "#ef4444" },
];

function fmt(v: number) {
  if (v >= 100_000) return `₹${(v / 100_000).toFixed(1)}L`;
  if (v >= 1_000)   return `₹${(v / 1_000).toFixed(0)}K`;
  return `₹${v.toLocaleString("en-IN")}`;
}

// ── Status action panel ───────────────────────────────────────────────────────
function StatusPanel({
  claim, isDark, onUpdated,
}: {
  claim: RewardClaimResponse; isDark: boolean; onUpdated: (c: RewardClaimResponse) => void;
}) {
  const [newStatus,  setNewStatus]  = useState<string>("");
  const [tracking,   setTracking]   = useState(claim.trackingNumber ?? "");
  const [note,       setNote]       = useState(claim.fulfillmentNote ?? "");
  const [saving,     setSaving]     = useState(false);
  const [err,        setErr]        = useState<string | null>(null);

  const txt     = isDark ? "#f0f0f0"                : "#0a0a0a";
  const muted   = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr     = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f8f6";

  const transitions: Record<RewardClaimStatus, string[]> = {
    PENDING:    ["PROCESSING", "FULFILLED", "CANCELLED"],
    PROCESSING: ["SHIPPED", "FULFILLED", "CANCELLED"],
    SHIPPED:    ["FULFILLED", "CANCELLED"],
    FULFILLED:  ["CANCELLED"],
    CANCELLED:  [],
  };
  const allowed = transitions[claim.status] ?? [];

  async function handleUpdate() {
    if (!newStatus) { setErr("Select a new status"); return; }
    if (newStatus === "SHIPPED" && !tracking.trim()) {
      setErr("Tracking number required for SHIPPED status"); return;
    }
    setSaving(true); setErr(null);
    try {
      const updated = await rewardClaimApi.updateStatus(claim.id, {
        status: newStatus as any,
        trackingNumber:  tracking.trim() || undefined,
        fulfillmentNote: note.trim()    || undefined,
      });
      onUpdated(updated);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to update");
    } finally { setSaving(false); }
  }

  if (allowed.length === 0) return null;

  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: muted, marginBottom: 4,
                    textTransform: "uppercase", letterSpacing: 0.5 }}>
        Update Status
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {allowed.map(s => (
          <button key={s} onClick={() => setNewStatus(s)}
            style={{
              padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: `1px solid ${newStatus === s ? "#ff5c00" : bdr}`,
              background: newStatus === s ? "rgba(255,92,0,0.12)" : "transparent",
              color: newStatus === s ? "#ff5c00" : muted,
              cursor: "pointer", transition: "all 0.15s",
            }}>
            {s}
          </button>
        ))}
      </div>

      {(newStatus === "SHIPPED" || tracking) && (
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>
            Tracking Number {newStatus === "SHIPPED" ? "*" : "(optional)"}
          </label>
          <input value={tracking} onChange={e => setTracking(e.target.value)}
            placeholder="e.g. DTDC1234567890"
            style={{ width: "100%", background: inputBg, border: `1px solid ${bdr}`,
                     borderRadius: 8, padding: "8px 12px", color: txt, fontSize: 13,
                     outline: "none", boxSizing: "border-box" }} />
        </div>
      )}

      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>
          Note to backer (optional)
        </label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
          placeholder="e.g. Thank you! Your package ships Monday."
          style={{ width: "100%", background: inputBg, border: `1px solid ${bdr}`,
                   borderRadius: 8, padding: "8px 12px", color: txt, fontSize: 13,
                   outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      </div>

      {err && (
        <div style={{ color: "#ef4444", fontSize: 12, display: "flex", gap: 5 }}>
          <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 1 }} /> {err}
        </div>
      )}

      <button onClick={handleUpdate} disabled={saving || !newStatus}
        style={{
          alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6,
          background: newStatus ? "#ff5c00" : (isDark ? "#1e1e1e" : "#e5e5e5"),
          color: newStatus ? "#fff" : muted, border: "none", borderRadius: 8,
          padding: "8px 16px", cursor: newStatus && !saving ? "pointer" : "not-allowed",
          fontSize: 13, fontWeight: 600,
        }}>
        {saving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        Update
      </button>
    </div>
  );
}

// ── Claim row ─────────────────────────────────────────────────────────────────
function ClaimRow({
  claim, isDark, onUpdated,
}: {
  claim: RewardClaimResponse; isDark: boolean; onUpdated: (c: RewardClaimResponse) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const txt  = isDark ? "#f0f0f0" : "#0a0a0a";
  const muted= isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card = isDark ? "#111" : "#fff";

  const STATUS_COLOR: Record<RewardClaimStatus, string> = {
    PENDING: "#f59e0b", PROCESSING: "#3b82f6", SHIPPED: "#8b5cf6",
    FULFILLED: "#22c55e", CANCELLED: "#ef4444",
  };
  const color = STATUS_COLOR[claim.status] ?? "#9ca3af";

  return (
    <motion.div layout style={{ background: card, border: `1px solid ${bdr}`,
                                borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10 }}
           onClick={() => setExpanded(p => !p)}>
        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
          background: "linear-gradient(135deg,#ff5c00,#ff9000)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: 12,
        }}>
          {claim.backerProfileImageUrl
            ? <img src={claim.backerProfileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : claim.backerName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: txt,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {claim.backerName}
            <span style={{ fontSize: 11, color: muted, marginLeft: 6 }}>
              @{claim.backerUsername}
            </span>
          </div>
          <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>
            {claim.rewardTierTitle} · {fmt(claim.donationAmount)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {claim.shippingProvided && <MapPin size={12} color={muted} title="Address provided" />}
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
            background: color + "18", color,
          }}>
            {claim.status}
          </span>
          {expanded ? <ChevronUp size={14} color={muted} /> : <ChevronDown size={14} color={muted} />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{   height: 0, opacity: 0 }}
            style={{ borderTop: `1px solid ${bdr}`, padding: "12px 14px", overflow: "hidden" }}
          >
            {claim.shippingProvided && (
              <div style={{ fontSize: 12, color: muted, marginBottom: 10 }}>
                <strong style={{ color: txt }}>Ship to: </strong>
                {[claim.shippingName, claim.shippingAddress,
                  claim.shippingCity, claim.shippingPincode,
                  claim.shippingPhone].filter(Boolean).join(" · ")}
              </div>
            )}
            {!claim.shippingProvided && (
              <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 10 }}>
                ⚠ Backer hasn't provided a shipping address yet.
              </div>
            )}
            <StatusPanel claim={claim} isDark={isDark} onUpdated={onUpdated} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CreatorRewardFulfillment({ projectId, isDark }: Props) {
  const [claims,     setClaims]     = useState<RewardClaimResponse[]>([]);
  const [summary,    setSummary]    = useState<Record<string, number>>({});
  const [filter,     setFilter]     = useState("");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [page,       setPage]       = useState(0);

  const txt   = isDark ? "#f0f0f0"                : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  async function load(f = filter, p = 0) {
    setLoading(true); setError(null);
    try {
      const [res, sum] = await Promise.all([
        rewardClaimApi.getProjectClaims(projectId, f || undefined, p, 20),
        rewardClaimApi.getClaimSummary(projectId),
      ]);
      setClaims(res.content);
      setTotalPages(res.totalPages);
      setPage(p);
      setSummary(sum as Record<string, number>);
    } catch { setError("Failed to load claims"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [projectId]);

  function handleUpdated(updated: RewardClaimResponse) {
    setClaims(prev => prev.map(c => c.id === updated.id ? updated : c));
  }

  const totalClaims = Object.values(summary).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Summary chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {STATUSES.map(s => {
          const count = s.value ? (summary[s.value] ?? 0) : totalClaims;
          const active = filter === s.value;
          return (
            <button key={s.value}
              onClick={() => { setFilter(s.value); load(s.value, 0); }}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1px solid ${active ? "#ff5c00" : bdr}`,
                background: active ? "rgba(255,92,0,0.10)" : "transparent",
                color: active ? "#ff5c00" : muted, cursor: "pointer", transition: "all 0.15s",
              }}>
              {s.label} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <Loader2 size={20} style={{ color: muted, animation: "spin 1s linear infinite" }} />
        </div>
      ) : error ? (
        <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
      ) : claims.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: muted }}>
          <Gift size={28} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>No claims {filter ? `with status ${filter}` : "yet"}.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {claims.map(c => (
            <ClaimRow key={c.id} claim={c} isDark={isDark} onUpdated={handleUpdated} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => load(filter, i)}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: page === i ? "#ff5c00" : "transparent",
                color: page === i ? "#fff" : muted,
                border: `1px solid ${bdr}`, cursor: "pointer",
                fontSize: 13, fontWeight: 600,
              }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
