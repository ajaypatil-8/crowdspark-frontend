"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  FileCheck, CheckCircle2, XCircle, X, User,
  Shield, Clock, AlertTriangle, RefreshCcw,
  Eye, CreditCard, Building2, Hash,
} from "lucide-react";
import { adminApi, type KycStatusResponse } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const ACCENT = "#7c3aed";

function Toast({ msg, ok, onClose }: { msg: string; ok: boolean; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const color = ok ? "#34d399" : "#ef4444";
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12 }}
      style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "13px 18px", borderRadius: 14, background: "#141414", border: `1px solid ${color}44`, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 10 }}
    >
      {ok ? <CheckCircle2 size={16} color={color} /> : <XCircle size={16} color={color} />}
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2, display: "flex", marginLeft: 4 }}><X size={13} /></button>
    </motion.div>
  );
}

function DocImg({ url, label, isDark, bdr }: { url: string | null; label: string; isDark: boolean; bdr: string }) {
  return (
    <div>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 7px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      {url ? (
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: `1px solid ${bdr}` }}>
          <img src={url} alt={label} style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block", cursor: "pointer" }} onClick={() => window.open(url, "_blank")} />
          <button
            onClick={() => window.open(url, "_blank")}
            style={{ position: "absolute", bottom: 7, right: 7, padding: "4px 10px", borderRadius: 7, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, backdropFilter: "blur(4px)" }}
          >
            <Eye size={11} /> View full
          </button>
        </div>
      ) : (
        <div style={{ height: 100, borderRadius: 12, border: `1px dashed ${bdr}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--text-muted)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <AlertTriangle size={18} style={{ opacity: 0.4 }} />
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12 }}>Not uploaded</span>
        </div>
      )}
    </div>
  );
}

function KycDetailPanel({ kyc, onApprove, onReject, busy }: {
  kyc: KycStatusResponse;
  onApprove: (id: number) => void;
  onReject: () => void;
  busy: boolean;
}) {
  const { isDark } = useTheme();
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card = isDark ? "rgba(255,255,255,0.03)" : "#f9f9f9";

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 20, overflow: "hidden",
        background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
        border: `1px solid ${bdr}`,
        boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)",
        display: "flex", flexDirection: "column", height: "100%",
      }}
    >
      {/* Header */}
      <div style={{ padding: "18px 22px", borderBottom: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg,transparent,${ACCENT}55,transparent)` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${ACCENT},#a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
            {kyc.username[0].toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", margin: "0 0 3px" }}>@{kyc.username}</h3>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>{kyc.email}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>

        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { icon: <Hash size={12} />, label: "PAN Number", value: kyc.panNumber ?? "—" },
            { icon: <Hash size={12} />, label: "Aadhaar Number", value: kyc.aadhaarNumber ?? "—" },
            { icon: <Building2 size={12} />, label: "Bank Name", value: kyc.bankName ?? "—" },
            { icon: <CreditCard size={12} />, label: "Account (masked)", value: kyc.maskedBankAccount ?? "—" },
            { icon: <Hash size={12} />, label: "IFSC Code", value: kyc.bankIfscCode ?? "—" },
            { icon: <Hash size={12} />, label: "UPI ID", value: kyc.upiId ?? "—" },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ padding: "10px 12px", borderRadius: 12, background: card, border: `1px solid ${bdr}` }}>
              <p style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "DM Sans, sans-serif", fontSize: 10.5, color: "var(--text-muted)", margin: "0 0 4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {icon} {label}
              </p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, wordBreak: "break-all" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Submitted / reviewed */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <div style={{ flex: 1, padding: "9px 12px", borderRadius: 10, background: card, border: `1px solid ${bdr}`, display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={12} color="var(--text-muted)" />
            <div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Submitted</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </p>
            </div>
          </div>
          {kyc.reviewedAt && (
            <div style={{ flex: 1, padding: "9px 12px", borderRadius: 10, background: card, border: `1px solid ${bdr}`, display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={12} color="var(--text-muted)" />
              <div>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Reviewed</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                  {new Date(kyc.reviewedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Documents */}
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.09em" }}>KYC Documents</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <DocImg url={kyc.panCardImageUrl} label="PAN Card" isDark={isDark} bdr={bdr} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <DocImg url={kyc.aadhaarFrontImageUrl} label="Aadhaar (Front)" isDark={isDark} bdr={bdr} />
            <DocImg url={kyc.aadhaarBackImageUrl} label="Aadhaar (Back)" isDark={isDark} bdr={bdr} />
          </div>
        </div>

        {/* Rejection reason if any */}
        {kyc.rejectionReason && (
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 20 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "#ef4444", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Previous rejection reason</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#ef4444", margin: 0, lineHeight: 1.6 }}>{kyc.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: "16px 22px", borderTop: `1px solid ${bdr}`, display: "flex", gap: 10, flexShrink: 0 }}>
        <button
          onClick={() => onApprove(kyc.userId)}
          disabled={busy}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none", cursor: busy ? "wait" : "pointer",
            background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff",
            fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            opacity: busy ? 0.7 : 1, transition: "opacity 0.15s",
            boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
          }}
        >
          <CheckCircle2 size={15} /> {busy ? "Approving…" : "Approve KYC"}
        </button>
        <button
          onClick={onReject}
          disabled={busy}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 12, cursor: busy ? "wait" : "pointer",
            border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.08)", color: "#ef4444",
            fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            opacity: busy ? 0.7 : 1, transition: "opacity 0.15s",
          }}
        >
          <XCircle size={15} /> Reject
        </button>
      </div>
    </motion.div>
  );
}

function RejectModal({ onConfirm, onClose }: { onConfirm: (reason: string) => void; onClose: () => void }) {
  const { isDark } = useTheme();
  const [reason, setReason] = useState("");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(6px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} onClick={e => e.stopPropagation()}
        style={{ width: 460, borderRadius: 22, background: isDark ? "#161616" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, padding: "28px", boxShadow: "0 32px 96px rgba(0,0,0,0.5)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", marginBottom: 16 }}>
          <XCircle size={22} />
        </div>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)", margin: "0 0 7px", letterSpacing: "-0.02em" }}>Reject KYC Application</h3>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 20px", lineHeight: 1.7 }}>
          Reason will be sent to the user. Please be specific.
        </p>
        <textarea value={reason} onChange={e => setReason(e.target.value)}
          placeholder="e.g. PAN card image is blurry, please re-upload a clearer photo…"
          rows={4}
          style={{ width: "100%", boxSizing: "border-box" as const, padding: "12px 14px", borderRadius: 12, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, resize: "vertical", outline: "none" }}
          onFocus={e => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.08)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "transparent", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => { if (reason.trim()) onConfirm(reason.trim()); }} disabled={!reason.trim()}
            style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: reason.trim() ? "linear-gradient(135deg,#ef4444,#dc2626)" : "rgba(239,68,68,0.3)", color: "#fff", fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, cursor: reason.trim() ? "pointer" : "not-allowed", boxShadow: reason.trim() ? "0 4px 16px rgba(239,68,68,0.3)" : "none" }}>
            Confirm Rejection
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Skeleton() {
  const { isDark } = useTheme();
  const b = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  return (
    <div style={{ padding: "40px 36px 60px", maxWidth: 1100, margin: "0 auto", display: "flex", gap: 24 }}>
      <div style={{ width: 280, flexShrink: 0 }}>
        <div style={{ height: 36, width: 160, borderRadius: 10, background: b, marginBottom: 20, animation: "adkPulse 1.6s ease-in-out infinite" }} />
        {[0,1,2,3].map(i => <div key={i} style={{ height: 74, borderRadius: 14, background: b, marginBottom: 10, animation: "adkPulse 1.6s ease-in-out infinite", animationDelay: `${i*0.08}s` }} />)}
      </div>
      <div style={{ flex: 1, height: 500, borderRadius: 20, background: b, animation: "adkPulse 1.6s ease-in-out infinite" }} />
      <style>{`@keyframes adkPulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </div>
  );
}

export default function AdminKycPage() {
  const { isDark } = useTheme();
  const headerRef = useRef<HTMLDivElement>(null);
  const [queue, setQueue]         = useState<KycStatusResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<KycStatusResponse | null>(null);
  const [actionId, setActionId]   = useState<number | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.pendingKyc().then(q => { setQueue(q); if (q.length > 0) setSelected(q[0]); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!loading && headerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".adky-enter", { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.5, ease: "power3.out" });
      }, headerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const showToast = (msg: string, ok = true) => setToast({ msg, ok });

  const approve = async (userId: number) => {
    setActionId(userId);
    try {
      await adminApi.approveKyc(userId);
      setQueue(q => q.filter(k => k.userId !== userId));
      setSelected(null);
      showToast("KYC approved — user is now CREATOR ✓");
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Failed", false); }
    finally { setActionId(null); }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selected) return;
    setActionId(selected.userId);
    try {
      await adminApi.rejectKyc(selected.userId, reason);
      setQueue(q => q.filter(k => k.userId !== selected.userId));
      setSelected(null); setShowReject(false);
      showToast("KYC rejected");
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Failed", false); }
    finally { setActionId(null); }
  };

  if (loading) return <Skeleton />;

  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card = isDark ? "rgba(255,255,255,0.03)" : "#fff";
  const busy = actionId !== null;

  return (
    <div ref={headerRef} style={{ padding: "40px 36px 60px", maxWidth: 1100, margin: "0 auto" }}>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showReject && <RejectModal onConfirm={handleRejectConfirm} onClose={() => setShowReject(false)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="adky-enter" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${ACCENT}15`, border: `1px solid ${ACCENT}28`, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}>
            <FileCheck size={13} />
          </div>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Identity Verification</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(22px,3vw,34px)", color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
            KYC Queue
            {queue.length > 0 && (
              <span style={{ marginLeft: 12, fontSize: 16, fontWeight: 700, color: ACCENT, fontFamily: "DM Sans, sans-serif" }}>({queue.length} pending)</span>
            )}
          </h1>
          <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: `1px solid ${bdr}`, background: "transparent", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = "var(--text)"; el.style.borderColor = ACCENT + "44"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = "var(--text-muted)"; el.style.borderColor = bdr; }}>
            <RefreshCcw size={13} /> Refresh
          </button>
        </div>
      </div>

      {queue.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", padding: "80px 24px", borderRadius: 22, background: card, border: `1px solid ${bdr}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: `${ACCENT}10`, filter: "blur(70px)", pointerEvents: "none" }} />
          <CheckCircle2 size={44} color="#34d399" style={{ marginBottom: 16, opacity: 0.7 }} />
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, color: "var(--text)", margin: "0 0 10px" }}>All clear!</h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14.5, color: "var(--text-muted)", margin: 0 }}>No pending KYC applications.</p>
        </motion.div>
      ) : (
        <div className="adky-enter" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18, alignItems: "start" }}>

          {/* Queue list */}
          <div style={{ borderRadius: 20, background: card, border: `1px solid ${bdr}`, overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)" }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.09em" }}>Applications ({queue.length})</p>
            </div>
            <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 240px)" }}>
              {queue.map((k, i) => {
                const isSelected = selected?.userId === k.userId;
                return (
                  <motion.button
                    key={k.userId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelected(k)}
                    style={{
                      display: "flex", alignItems: "center", gap: 11, width: "100%",
                      padding: "13px 18px", background: isSelected ? `${ACCENT}12` : "transparent",
                      border: "none", borderBottom: `1px solid ${bdr}`,
                      borderLeft: `3px solid ${isSelected ? ACCENT : "transparent"}`,
                      cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)"; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${ACCENT},#a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                      {k.username[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: isSelected ? ACCENT : "var(--text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{k.username}</p>
                      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {k.submittedAt ? new Date(k.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                      </p>
                    </div>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 6px #f59e0b", flexShrink: 0, animation: "adkDot 1.5s ease-in-out infinite" }} />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          <div style={{ position: "sticky", top: 80 }}>
            {selected ? (
              <KycDetailPanel
                kyc={selected}
                onApprove={approve}
                onReject={() => setShowReject(true)}
                busy={busy}
              />
            ) : (
              <div style={{ borderRadius: 20, padding: "60px 24px", textAlign: "center", background: card, border: `1px solid ${bdr}` }}>
                <User size={32} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.35 }} />
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", margin: "0 0 6px" }}>Select an application</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Click an entry from the queue to review.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .adky-enter{opacity:0;}
        @keyframes adkDot{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
        @media(max-width:860px){
          div[style*="grid-template-columns: 280px"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
