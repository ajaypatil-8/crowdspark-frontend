"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  FolderCheck, CheckCircle2, XCircle, Eye, Clock,
  AlertTriangle, RefreshCcw, Search, X, DollarSign,
  User, Calendar, ExternalLink, ChevronLeft, ChevronRight,
} from "lucide-react";
import { adminApi, type AdminProjectResponse, type ProjectFullDetailsResponse } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const ACCENT = "#7c3aed";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:   { label: "Pending Review", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)"  },
  APPROVED:  { label: "Live",           color: "#34d399", bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.25)"  },
  REJECTED:  { label: "Rejected",       color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)"   },
  FUNDED:    { label: "Funded",         color: "#a78bfa", bg: "rgba(167,139,250,0.1)",  border: "rgba(167,139,250,0.25)" },
  COMPLETED: { label: "Completed",      color: "#34d399", bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.25)"  },
  DRAFT:     { label: "Draft",          color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.2)"  },
};

type Filter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

function Toast({ msg, ok, onClose }: { msg: string; ok: boolean; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const color = ok ? "#34d399" : "#ef4444";
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "13px 18px", borderRadius: 14, background: "#141414", border: `1px solid ${color}44`, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 10 }}
    >
      {ok ? <CheckCircle2 size={16} color={color} /> : <XCircle size={16} color={color} />}
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2, display: "flex", marginLeft: 4 }}><X size={13} /></button>
    </motion.div>
  );
}

function DetailModal({ detail, projects, onClose, onApprove, onReject, actionId }: {
  detail: ProjectFullDetailsResponse;
  projects: AdminProjectResponse[];
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  actionId: number | null;
}) {
  const { isDark } = useTheme();
  const [imgIdx, setImgIdx] = useState(0);
  const projectStatus = projects.find(p => p.id === detail.id)?.status ?? "DRAFT";
  const cfg = STATUS_CFG[projectStatus] ?? STATUS_CFG.DRAFT;

  const allMedia = [
    ...(detail.thumbnailUrl ? [{ url: detail.thumbnailUrl, type: "image" as const }] : []),
    ...detail.galleryImages.map(u => ({ url: u, type: "image" as const })),
    ...detail.previewVideos.map(u => ({ url: u, type: "video" as const })),
  ];

  const pct = detail.goalAmount > 0 ? Math.min(100, Math.round((detail.currentAmount / detail.goalAmount) * 100)) : 0;
  const busy = actionId === detail.id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(6px)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 820, maxHeight: "90vh",
          borderRadius: 24, overflow: "hidden",
          background: isDark ? "#141414" : "#fff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
              <span style={{ padding: "3px 10px", borderRadius: 999, background: cfg.bg, border: `1px solid ${cfg.border}`, fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
              {detail.category && <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)" }}>#{detail.category}</span>}
            </div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text)", margin: 0, letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{detail.title}</h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20 }}>

            {/* Left */}
            <div>
              {/* Gallery */}
              {allMedia.length > 0 && (
                <div style={{ marginBottom: 18, borderRadius: 16, overflow: "hidden", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", position: "relative" }}>
                  <div style={{ height: 200, position: "relative" }}>
                    {allMedia[imgIdx].type === "video"
                      ? <video src={allMedia[imgIdx].url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <img src={allMedia[imgIdx].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    }
                    {allMedia.length > 1 && (
                      <>
                        <button onClick={() => setImgIdx(i => Math.max(0, i - 1))} disabled={imgIdx === 0}
                          style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: 8, border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: imgIdx === 0 ? 0.3 : 1 }}>
                          <ChevronLeft size={14} />
                        </button>
                        <button onClick={() => setImgIdx(i => Math.min(allMedia.length - 1, i + 1))} disabled={imgIdx === allMedia.length - 1}
                          style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: 8, border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: imgIdx === allMedia.length - 1 ? 0.3 : 1 }}>
                          <ChevronRight size={14} />
                        </button>
                        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
                          {allMedia.map((_, i) => (
                            <button key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? 16 : 6, height: 6, borderRadius: 999, border: "none", background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.45)", cursor: "pointer", transition: "width 0.2s", padding: 0 }} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {detail.shortDescription && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Short description</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text)", lineHeight: 1.7, margin: 0 }}>{detail.shortDescription}</p>
                </div>
              )}

              {/* Story snippet */}
              {detail.fullDescription && (
                <div style={{ padding: "13px 16px", borderRadius: 12, background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 7px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Campaign story</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text)", lineHeight: 1.7, margin: 0, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {detail.fullDescription}
                  </p>
                </div>
              )}

              {/* Rewards */}
              {detail.rewards && detail.rewards.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{detail.rewards.length} Reward tier{detail.rewards.length > 1 ? "s" : ""}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {detail.rewards.slice(0, 3).map((r, i) => (
                      <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, color: ACCENT }}>₹{r.minimumAmount.toLocaleString("en-IN")}+</span>
                        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text)", flex: 1 }}>{r.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right — metadata */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Funding */}
              <div style={{ padding: "16px", borderRadius: 16, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Funding</p>
                <div style={{ height: 5, borderRadius: 999, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: "linear-gradient(90deg,#7c3aed,#a855f7)", transition: "width 0.6s ease" }} />
                </div>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)", margin: "0 0 3px" }}>₹{(detail.currentAmount / 100000).toFixed(1)}L</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: 0 }}>of ₹{(detail.goalAmount / 100000).toFixed(1)}L goal · {pct}%</p>
              </div>

              {/* Details */}
              {[
                { icon: <User size={12} />, label: "Creator", value: `@${detail.creator?.username ?? "—"}` },
                { icon: <DollarSign size={12} />, label: "Goal", value: `₹${(detail.goalAmount/100000).toFixed(1)}L` },
                { icon: <Calendar size={12} />, label: "Deadline", value: detail.deadline ? new Date(detail.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                { icon: <Clock size={12} />, label: "Days left", value: `${detail.daysLeft ?? 0}d` },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>{icon} {label}</span>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        {projectStatus === "PENDING" && (
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`, display: "flex", gap: 10, flexShrink: 0 }}>
            <button
              onClick={() => onApprove(detail.id)}
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
              <CheckCircle2 size={15} /> {busy ? "Approving…" : "Approve"}
            </button>
            <button
              onClick={() => onReject(detail.id)}
              disabled={busy}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 12, cursor: busy ? "wait" : "pointer",
                border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.08)", color: "#ef4444",
                fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                opacity: busy ? 0.7 : 1, transition: "opacity 0.15s",
              }}
            >
              <XCircle size={15} /> {busy ? "…" : "Reject"}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function RejectModal({ projectId, onConfirm, onClose }: { projectId: number; onConfirm: (id: number, reason: string) => void; onClose: () => void }) {
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
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)", margin: "0 0 7px", letterSpacing: "-0.02em" }}>Reject Campaign</h3>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 20px", lineHeight: 1.7 }}>
          Provide a reason — it will be shown to the creator.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Insufficient campaign description, please add more details about your product…"
          rows={4}
          style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, resize: "vertical", outline: "none" }}
          onFocus={e => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.08)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "transparent", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={() => { if (reason.trim()) onConfirm(projectId, reason.trim()); }}
            disabled={!reason.trim()}
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
    <div style={{ padding: "40px 36px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ height: 36, width: 200, borderRadius: 10, background: b, animation: "adprPulse 1.6s ease-in-out infinite", marginBottom: 28 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ width: 100, height: 36, borderRadius: 10, background: b, animation: "adprPulse 1.6s ease-in-out infinite" }} />)}
      </div>
      {[0,1,2,3].map(i => <div key={i} style={{ height: 74, borderRadius: 14, background: b, marginBottom: 10, animation: "adprPulse 1.6s ease-in-out infinite", animationDelay: `${i*0.08}s` }} />)}
      <style>{`@keyframes adprPulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </div>
  );
}

export default function AdminProjectsPage() {
  const { isDark } = useTheme();
  const headerRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects]   = useState<AdminProjectResponse[]>([]);
  const [filter, setFilter]       = useState<Filter>("PENDING");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState<number | null>(null);
  const [rejectId, setRejectId]   = useState<number | null>(null);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [detail, setDetail]       = useState<ProjectFullDetailsResponse | null>(null);
  const [detailLoading, setDL]    = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.allProjects().then(setProjects).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!loading && headerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".adpr-enter", { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.5, ease: "power3.out" });
      }, headerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
  };

  const openDetail = async (id: number) => {
    setDetail(null); setDL(true);
    try { setDetail(await adminApi.getProjectDetail(id)); }
    catch { showToast("Could not load details", false); }
    finally { setDL(false); }
  };

  const approve = async (id: number) => {
    setActionId(id);
    try {
      await adminApi.approveProject(id);
      setProjects(ps => ps.map(p => p.id === id ? { ...p, status: "APPROVED" } : p));
      setDetail(null);
      showToast("Project approved ✓");
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Failed", false); }
    finally { setActionId(null); }
  };

  const handleRejectConfirm = async (id: number, reason: string) => {
    setActionId(id);
    try {
      await adminApi.rejectProject(id, reason);
      setProjects(ps => ps.map(p => p.id === id ? { ...p, status: "REJECTED" } : p));
      setDetail(null); setRejectId(null);
      showToast("Project rejected");
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Failed", false); }
    finally { setActionId(null); }
  };

  if (loading) return <Skeleton />;

  const filtered = projects.filter(p => {
    const matchF = filter === "ALL" ? true : p.status === filter;
    const matchS = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.creatorUsername.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: "ALL",      label: "All",      count: projects.length },
    { key: "PENDING",  label: "Pending",  count: projects.filter(p => p.status === "PENDING").length },
    { key: "APPROVED", label: "Approved", count: projects.filter(p => p.status === "APPROVED").length },
    { key: "REJECTED", label: "Rejected", count: projects.filter(p => p.status === "REJECTED").length },
  ];

  const card = isDark ? "rgba(255,255,255,0.03)" : "#fff";
  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div ref={headerRef} style={{ padding: "40px 36px 60px", maxWidth: 1100, margin: "0 auto" }}>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {detail && !detailLoading && (
          <DetailModal
            detail={detail} projects={projects}
            onClose={() => setDetail(null)}
            onApprove={approve}
            onReject={(id) => { setRejectId(id); setDetail(null); }}
            actionId={actionId}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {rejectId !== null && (
          <RejectModal
            projectId={rejectId}
            onConfirm={handleRejectConfirm}
            onClose={() => setRejectId(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="adpr-enter" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
              <FolderCheck size={13} />
            </div>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Project Moderation</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(22px,3vw,34px)", color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
            Campaigns
          </h1>
        </div>
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns or creators…"
            style={{ padding: "10px 14px 10px 34px", borderRadius: 12, border: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, outline: "none", width: 280, boxSizing: "border-box" as const }}
            onFocus={e => { e.currentTarget.style.borderColor = `${ACCENT}55`; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}12`; }}
            onBlur={e => { e.currentTarget.style.borderColor = bdr; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="adpr-enter" style={{ display: "flex", gap: 7, marginBottom: 22, flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "7px 15px", borderRadius: 10,
              border: `1px solid ${filter === f.key ? (f.key === "PENDING" ? "rgba(245,158,11,0.4)" : f.key === "APPROVED" ? "rgba(52,211,153,0.4)" : f.key === "REJECTED" ? "rgba(239,68,68,0.4)" : `${ACCENT}44`) : bdr}`,
              background: filter === f.key ? (f.key === "PENDING" ? "rgba(245,158,11,0.1)" : f.key === "APPROVED" ? "rgba(52,211,153,0.1)" : f.key === "REJECTED" ? "rgba(239,68,68,0.1)" : `${ACCENT}12`) : "transparent",
              color: filter === f.key ? (f.key === "PENDING" ? "#f59e0b" : f.key === "APPROVED" ? "#34d399" : f.key === "REJECTED" ? "#ef4444" : ACCENT) : "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: filter === f.key ? 700 : 500,
              cursor: "pointer", transition: "all 0.15s",
            }}>
            {f.label}
            <span style={{ padding: "1px 7px", borderRadius: 20, background: filter === f.key ? "rgba(255,255,255,0.15)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"), fontSize: 11, fontWeight: 700 }}>
              {f.count}
            </span>
          </button>
        ))}
        <span style={{ marginLeft: "auto", alignSelf: "center", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="adpr-enter" style={{ borderRadius: 20, background: card, border: `1px solid ${bdr}`, overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)" }}>
        {/* Head */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px 100px 130px", gap: 12, padding: "12px 22px", borderBottom: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)" }}>
          {["Campaign","Creator","Goal","Status","Actions"].map(h => (
            <span key={h} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <FolderCheck size={32} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.35 }} />
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text)", marginBottom: 6 }}>No campaigns found</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)" }}>Try a different filter or search.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((p, i) => {
              const cfg = STATUS_CFG[p.status] ?? STATUS_CFG.DRAFT;
              const busy = actionId === p.id;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 140px 120px 100px 130px",
                    gap: 12, padding: "14px 22px",
                    borderBottom: i < filtered.length - 1 ? `1px solid ${bdr}` : "none",
                    alignItems: "center", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  {/* Campaign info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                    <div style={{ width: 44, height: 36, borderRadius: 9, overflow: "hidden", flexShrink: 0, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", border: `1px solid ${bdr}` }}>
                      {p.thumbnailUrl
                        ? <img src={p.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚀</div>
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                        {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                        {/* Feature #43 — AI fraud/risk flag; only shown for MEDIUM/HIGH so it doesn't add noise to every low-risk row */}
                        {(p.fraudRiskLevel === "HIGH" || p.fraudRiskLevel === "MEDIUM") && (
                          <span
                            title={p.fraudReasoning ?? undefined}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "2px 8px", borderRadius: 999, cursor: "help",
                              background: p.fraudRiskLevel === "HIGH" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
                              border: `1px solid ${p.fraudRiskLevel === "HIGH" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
                              fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700,
                              color: p.fraudRiskLevel === "HIGH" ? "#ef4444" : "#f59e0b",
                            }}
                          >
                            ⚠ {p.fraudRiskLevel === "HIGH" ? "High" : "Medium"} risk · {p.fraudRiskScore}
                          </span>
                        )}
                        {/* Feature #45 — content moderation flag, separate from fraud risk above */}
                        {p.moderationStatus === "FLAGGED" && (
                          <span
                            title={p.moderationReasoning ?? undefined}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "2px 8px", borderRadius: 999, cursor: "help",
                              background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
                              fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, color: "#8b5cf6",
                            }}
                          >
                            🚩 {p.moderationCategory ? p.moderationCategory.replace("_", " ") : "flagged"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Creator */}
                  <div>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, color: "var(--text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{p.creatorUsername}</p>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.creatorEmail}</p>
                  </div>

                  {/* Goal */}
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>₹{(p.goalAmount / 100000).toFixed(1)}L</span>

                  {/* Status */}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: cfg.bg, border: `1px solid ${cfg.border}`, fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: cfg.color, whiteSpace: "nowrap" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                    {cfg.label}
                  </span>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openDetail(p.id)} disabled={detailLoading}
                      style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${bdr}`, background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = ACCENT; el.style.borderColor = `${ACCENT}44`; el.style.background = `${ACCENT}10`; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = "var(--text-muted)"; el.style.borderColor = bdr; el.style.background = "transparent"; }}
                    >
                      <Eye size={13} />
                    </button>
                    {p.status === "PENDING" && (
                      <>
                        <button onClick={() => approve(p.id)} disabled={busy}
                          style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.08)", color: "#34d399", cursor: busy ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: busy ? 0.5 : 1 }}>
                          <CheckCircle2 size={13} />
                        </button>
                        <button onClick={() => setRejectId(p.id)} disabled={busy}
                          style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: busy ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: busy ? 0.5 : 1 }}>
                          <XCircle size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <style>{`
        .adpr-enter{opacity:0;}
        @media(max-width:900px){
          div[style*="gridTemplateColumns: 1fr 140px"]{grid-template-columns:1fr 90px 80px!important;}
          div[style*="gridTemplateColumns: 1fr 140px"]>*:nth-child(4),
          div[style*="gridTemplateColumns: 1fr 140px"]>*:nth-child(5){display:none!important;}
        }
      `}</style>
    </div>
  );
}