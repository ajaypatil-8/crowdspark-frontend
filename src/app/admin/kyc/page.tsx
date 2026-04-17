"use client";
import { useEffect, useState } from "react";
import { adminApi, type KycStatusResponse } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const ACCENT = "#7c3aed";

export default function AdminKycPage() {
  const { isDark } = useTheme();
  const [queue, setQueue]       = useState<KycStatusResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<KycStatusResponse | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject]     = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.pendingKyc()
      .then(setQueue)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToastMsg = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const approve = async (userId: number) => {
    setActionId(userId);
    try {
      await adminApi.approveKyc(userId);
      setQueue(q => q.filter(k => k.userId !== userId));
      setSelected(null);
      showToastMsg("KYC approved — user now CREATOR ✓");
    } catch (e: any) {
      showToastMsg(e.message || "Failed", false);
    } finally {
      setActionId(null);
    }
  };

  const reject = async () => {
    if (!selected || !rejectReason.trim()) return;
    setActionId(selected.userId);
    try {
      await adminApi.rejectKyc(selected.userId, rejectReason.trim());
      setQueue(q => q.filter(k => k.userId !== selected.userId));
      setSelected(null);
      setShowReject(false);
      setRejectReason("");
      showToastMsg("KYC rejected");
    } catch (e: any) {
      showToastMsg(e.message || "Failed", false);
    } finally {
      setActionId(null);
    }
  };

  const card = isDark ? "rgba(255,255,255,0.03)" : "#fff";
  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  const DocImg = ({ url, label }: { url: string | null; label: string }) => (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      {url
        ? <img src={url} alt={label} style={{ width: "100%", borderRadius: 10, border: `1px solid ${bdr}`, maxHeight: 160, objectFit: "cover", cursor: "pointer" }} onClick={() => window.open(url, "_blank")} />
        : <div style={{ height: 100, borderRadius: 10, border: `1px dashed ${bdr}`, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}>Not uploaded</div>
      }
    </div>
  );

  return (
    <div style={{ padding: "40px 36px 60px", maxWidth: 1100, margin: "0 auto", display: "flex", gap: 24 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "13px 20px", borderRadius: 12, background: isDark ? "#1a1a1a" : "#fff", border: `1px solid ${toast.ok ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.4)"}`, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color: toast.ok ? "#34d399" : "#ef4444", animation: "toastIn 0.25s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* Reject modal */}
      {showReject && selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 440, borderRadius: 20, background: isDark ? "#141414" : "#fff", border: `1px solid ${bdr}`, padding: "28px 28px 24px", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)", margin: "0 0 6px" }}>Reject KYC — @{selected.username}</h3>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 18px" }}>This will be sent to the user so they know what to fix.</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. PAN card image is blurry, please re-upload..." style={{ width: "100%", height: 100, padding: "12px 14px", borderRadius: 12, border: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.04)" : "#f8f8f8", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={reject} disabled={!rejectReason.trim() || !!actionId} style={{ flex: 1, padding: "11px", borderRadius: 11, background: "#ef4444", border: "none", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, cursor: rejectReason.trim() ? "pointer" : "not-allowed", opacity: rejectReason.trim() ? 1 : 0.5 }}>
                {actionId ? "Rejecting…" : "Reject KYC"}
              </button>
              <button onClick={() => { setShowReject(false); setRejectReason(""); }} style={{ padding: "11px 20px", borderRadius: 11, border: `1px solid ${bdr}`, background: "transparent", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Left: queue list */}
      <div style={{ width: 300, flexShrink: 0 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text)", margin: "0 0 6px" }}>KYC Queue</h1>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: "0 0 20px" }}>{queue.length} pending verification{queue.length !== 1 ? "s" : ""}</p>

        {loading ? (
          [0,1,2].map(i => <div key={i} style={{ height: 70, borderRadius: 14, background: bdr, marginBottom: 10, animation: "pulse 2s infinite" }} />)
        ) : queue.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", borderRadius: 18, background: card, border: `1px solid ${bdr}` }}>
            <p style={{ fontSize: 28, margin: "0 0 8px" }}>✅</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)" }}>All caught up!</p>
          </div>
        ) : (
          queue.map(k => (
            <div key={k.userId} onClick={() => setSelected(k)} style={{ padding: "14px 16px", borderRadius: 14, background: selected?.userId === k.userId ? `${ACCENT}18` : card, border: `1px solid ${selected?.userId === k.userId ? ACCENT + "44" : bdr}`, marginBottom: 10, cursor: "pointer", transition: "all 0.15s" }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 700, color: "var(--text)", margin: "0 0 3px" }}>@{k.username}</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.email}</p>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 8px", borderRadius: 6, fontFamily: "DM Sans, sans-serif" }}>PENDING</span>
            </div>
          ))
        )}
        <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
      </div>

      {/* Right: detail panel */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {!selected ? (
          <div style={{ height: "100%", minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 20, background: card, border: `1px solid ${bdr}` }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>📋</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)" }}>Select a submission from the left to review</p>
          </div>
        ) : (
          <div style={{ borderRadius: 20, background: card, border: `1px solid ${bdr}`, padding: "28px 28px 24px" }}>
            {/* User info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 4px" }}>@{selected.username}</h2>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{selected.email}</p>
                {selected.submittedAt && (
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>Submitted: {new Date(selected.submittedAt).toLocaleString("en-IN")}</p>
                )}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => approve(selected.userId)} disabled={!!actionId} style={{ padding: "10px 22px", borderRadius: 11, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  {actionId === selected.userId ? "Approving…" : "✓ Approve"}
                </button>
                <button onClick={() => setShowReject(true)} disabled={!!actionId} style={{ padding: "10px 22px", borderRadius: 11, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  ✕ Reject
                </button>
              </div>
            </div>

            {/* PAN */}
            <section style={{ marginBottom: 22 }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 12px" }}>PAN Card</h3>
              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>PAN Number</p>
                  <p style={{ fontFamily: "DM Sans, monospace", fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "0.1em" }}>{selected.panNumber ?? "—"}</p>
                </div>
                <DocImg url={selected.panCardImageUrl} label="PAN Image" />
              </div>
            </section>

            <div style={{ height: 1, background: bdr, margin: "0 0 22px" }} />

            {/* Aadhaar */}
            <section style={{ marginBottom: 22 }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 12px" }}>Aadhaar Card</h3>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Aadhaar Number</p>
              <p style={{ fontFamily: "DM Sans, monospace", fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 12px", letterSpacing: "0.1em" }}>{selected.aadhaarNumber ?? "—"}</p>
              <div style={{ display: "flex", gap: 14 }}>
                <DocImg url={selected.aadhaarFrontImageUrl} label="Front" />
                <DocImg url={selected.aadhaarBackImageUrl}  label="Back"  />
              </div>
            </section>

            <div style={{ height: 1, background: bdr, margin: "0 0 22px" }} />

            {/* Bank */}
            <section>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 12px" }}>Bank Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  ["Bank Name",    selected.bankName],
                  ["Account",      selected.maskedBankAccount],
                  ["IFSC",         selected.bankIfscCode],
                  ["UPI ID",       selected.upiId],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: "12px 14px", borderRadius: 12, background: isDark ? "rgba(255,255,255,0.03)" : "#f8f8f8", border: `1px solid ${bdr}` }}>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color: "var(--text)", margin: 0 }}>{value || "—"}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
