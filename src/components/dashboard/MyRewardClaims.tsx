// src/components/dashboard/MyRewardClaims.tsx
// Backer view: shows all reward claims with shipping form and status timeline.
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift, MapPin, Package, CheckCircle2, XCircle,
  Loader2, AlertCircle, ChevronDown, ChevronUp, Save, Truck,
} from "lucide-react";
import {
  rewardClaimApi,
  type RewardClaimResponse,
  type RewardClaimStatus,
} from "@/lib/api";

interface Props { isDark: boolean }

const STATUS_META: Record<RewardClaimStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:    { label: "Pending",    color: "#f59e0b", icon: <Gift     size={13} /> },
  PROCESSING: { label: "Processing", color: "#3b82f6", icon: <Package  size={13} /> },
  SHIPPED:    { label: "Shipped",    color: "#8b5cf6", icon: <Truck    size={13} /> },
  FULFILLED:  { label: "Delivered",  color: "#22c55e", icon: <CheckCircle2 size={13} /> },
  CANCELLED:  { label: "Cancelled",  color: "#ef4444", icon: <XCircle  size={13} /> },
};

function fmt(v: number) {
  if (v >= 100_000) return `₹${(v / 100_000).toFixed(1)}L`;
  if (v >= 1_000)   return `₹${(v / 1_000).toFixed(0)}K`;
  return `₹${v.toLocaleString("en-IN")}`;
}

// ── Shipping form ─────────────────────────────────────────────────────────────
function ShippingForm({
  claim, isDark, onSaved,
}: {
  claim: RewardClaimResponse; isDark: boolean; onSaved: (c: RewardClaimResponse) => void;
}) {
  const [form, setForm] = useState({
    shippingName:    claim.shippingName    ?? "",
    shippingAddress: claim.shippingAddress ?? "",
    shippingCity:    claim.shippingCity    ?? "",
    shippingPincode: claim.shippingPincode ?? "",
    shippingPhone:   claim.shippingPhone   ?? "",
    shippingCountry: claim.shippingCountry ?? "India",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);
  const [ok,     setOk]     = useState(false);

  const txt     = isDark ? "#f0f0f0"                : "#0a0a0a";
  const muted   = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr     = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f8f6";

  async function handleSave() {
    if (!form.shippingName || !form.shippingAddress ||
        !form.shippingCity || !form.shippingPincode) {
      setErr("Name, address, city, and PIN code are required"); return;
    }
    setSaving(true); setErr(null);
    try {
      const updated = await rewardClaimApi.updateShipping(claim.id, form);
      onSaved(updated); setOk(true);
      setTimeout(() => setOk(false), 2500);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save address");
    } finally { setSaving(false); }
  }

  const inp = (label: string, key: keyof typeof form, half?: boolean) => (
    <div style={{ flex: half ? "0 0 calc(50% - 6px)" : "1 1 100%" }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: muted,
                      textTransform: "uppercase", letterSpacing: 0.4,
                      display: "block", marginBottom: 4 }}>
        {label}
      </label>
      <input
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        style={{
          width: "100%", background: inputBg, border: `1px solid ${bdr}`,
          borderRadius: 8, padding: "8px 12px", color: txt, fontSize: 13,
          outline: "none", boxSizing: "border-box",
        }}
      />
    </div>
  );

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 12,
                    display: "flex", alignItems: "center", gap: 6 }}>
        <MapPin size={13} /> Shipping Address
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {inp("Full Name *",   "shippingName")}
        {inp("Address *",     "shippingAddress")}
        {inp("City *",        "shippingCity",    true)}
        {inp("PIN Code *",    "shippingPincode", true)}
        {inp("Phone",         "shippingPhone",   true)}
        {inp("Country",       "shippingCountry", true)}
      </div>
      {err && (
        <div style={{ color: "#ef4444", fontSize: 12, marginTop: 8,
                      display: "flex", alignItems: "center", gap: 5 }}>
          <AlertCircle size={12} /> {err}
        </div>
      )}
      <button onClick={handleSave} disabled={saving} style={{
        marginTop: 12, display: "flex", alignItems: "center", gap: 6,
        background: ok ? "#22c55e" : "#ff5c00", color: "#fff",
        border: "none", borderRadius: 8, padding: "8px 16px",
        cursor: saving ? "wait" : "pointer", fontSize: 13, fontWeight: 600,
      }}>
        {saving ? <Loader2 size={13} className="animate-spin" />
                : ok ? <CheckCircle2 size={13} /> : <Save size={13} />}
        {ok ? "Saved!" : "Save Address"}
      </button>
    </div>
  );
}

// ── Single claim card ─────────────────────────────────────────────────────────
function ClaimCard({
  claim, isDark, onUpdated,
}: {
  claim: RewardClaimResponse; isDark: boolean; onUpdated: (c: RewardClaimResponse) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[claim.status];
  const txt  = isDark ? "#f0f0f0" : "#0a0a0a";
  const muted= isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card = isDark ? "#111" : "#fff";
  const canEditShipping = claim.status === "PENDING" || claim.status === "PROCESSING";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: card, border: `1px solid ${bdr}`, borderRadius: 14, overflow: "hidden" }}
    >
      {/* Header row */}
      <div
        style={{ padding: "14px 16px", cursor: "pointer",
                 display: "flex", alignItems: "flex-start", gap: 12 }}
        onClick={() => setExpanded(p => !p)}
      >
        {/* Status dot */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: meta.color + "20",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: meta.color,
        }}>
          {meta.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: txt }}>{claim.rewardTierTitle}</div>
          <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{claim.projectTitle}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              background: meta.color + "18", color: meta.color,
            }}>
              {meta.label}
            </span>
            <span style={{ fontSize: 11, color: muted }}>
              {fmt(claim.donationAmount)} donated
            </span>
            {claim.trackingNumber && (
              <span style={{ fontSize: 11, color: "#8b5cf6" }}>
                🚚 {claim.trackingNumber}
              </span>
            )}
          </div>
        </div>
        <div style={{ color: muted, lineHeight: 0, flexShrink: 0 }}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{   height: 0, opacity: 0 }}
            style={{ borderTop: `1px solid ${bdr}`, padding: "14px 16px",
                     overflow: "hidden" }}
          >
            {claim.fulfillmentNote && (
              <div style={{ fontSize: 13, color: muted, marginBottom: 10,
                            background: isDark ? "rgba(255,255,255,0.03)" : "#f8f8f6",
                            borderRadius: 8, padding: "8px 12px" }}>
                <strong style={{ color: txt }}>Creator note: </strong>{claim.fulfillmentNote}
              </div>
            )}
            {canEditShipping && (
              <ShippingForm claim={claim} isDark={isDark} onSaved={onUpdated} />
            )}
            {!canEditShipping && claim.shippingProvided && (
              <div style={{ fontSize: 12, color: muted }}>
                <MapPin size={11} style={{ marginRight: 4 }} />
                {[claim.shippingName, claim.shippingAddress,
                   claim.shippingCity, claim.shippingPincode].filter(Boolean).join(", ")}
              </div>
            )}
            {!canEditShipping && !claim.shippingProvided && (
              <div style={{ fontSize: 12, color: muted, fontStyle: "italic" }}>
                No shipping address on file.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MyRewardClaims({ isDark }: Props) {
  const [claims,  setClaims]  = useState<RewardClaimResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const txt   = isDark ? "#f0f0f0"                : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";

  useEffect(() => {
    rewardClaimApi.myBackerClaims()
      .then(setClaims)
      .catch(() => setError("Failed to load reward claims"))
      .finally(() => setLoading(false));
  }, []);

  function handleUpdated(updated: RewardClaimResponse) {
    setClaims(prev => prev.map(c => c.id === updated.id ? updated : c));
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
      <Loader2 size={20} style={{ color: muted, animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (error) return (
    <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
  );

  if (claims.length === 0) return (
    <div style={{ textAlign: "center", padding: "48px 0", color: muted }}>
      <Gift size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
      <p style={{ fontSize: 14 }}>No reward claims yet.</p>
      <p style={{ fontSize: 12, marginTop: 4 }}>
        Back a project with a reward tier to see your claims here.
      </p>
    </div>
  );

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: txt, marginBottom: 16 }}>
        My Reward Claims ({claims.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {claims.map(c => (
          <ClaimCard key={c.id} claim={c} isDark={isDark} onUpdated={handleUpdated} />
        ))}
      </div>
    </div>
  );
}
