"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  Users, Search, CheckCircle2, XCircle, X,
  Shield, UserCheck, UserX, RefreshCcw,
  ChevronLeft, ChevronRight, Filter,
} from "lucide-react";
import { adminApi, type UserResponse } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const ACCENT = "#7c3aed";

function Toast({ msg, ok, onClose }: { msg: string; ok: boolean; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
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
      <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 2, display: "flex", marginLeft: 4 }}><X size={13} /></button>
    </motion.div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, [string, string, string]> = {
    ADMIN:   [ACCENT, `${ACCENT}18`, `${ACCENT}33`],
    CREATOR: ["#ff8800", "rgba(255,136,0,0.1)", "rgba(255,136,0,0.25)"],
    BACKER:  ["#60a5fa", "rgba(96,165,250,0.1)", "rgba(96,165,250,0.25)"],
    USER:    ["#94a3b8", "rgba(148,163,184,0.1)", "rgba(148,163,184,0.2)"],
  };
  const [c, bg, border] = colors[role] ?? colors.USER;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 6, background: bg, border: `1px solid ${border}`, color: c, fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginRight: 4, whiteSpace: "nowrap" }}>
      {role === "ADMIN" && <Shield size={8} />}
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: active ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${active ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`, color: active ? "#34d399" : "#ef4444", fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "#34d399" : "#ef4444", flexShrink: 0, animation: active ? "adusrDot 1.5s ease-in-out infinite" : "none" }} />
      {active ? "Active" : status === "SUSPENDED" ? "Suspended" : status}
    </span>
  );
}

function ConfirmModal({ user, action, onConfirm, onClose, busy }: {
  user: UserResponse;
  action: "suspend" | "activate";
  onConfirm: () => void;
  onClose: () => void;
  busy: boolean;
}) {
  const { isDark } = useTheme();
  const isSuspend = action === "suspend";
  const color = isSuspend ? "#ef4444" : "#34d399";
  const initials = user.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(6px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} onClick={e => e.stopPropagation()}
        style={{ width: 420, borderRadius: 22, background: isDark ? "#161616" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, padding: "28px", boxShadow: "0 32px 96px rgba(0,0,0,0.5)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}12`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", color, marginBottom: 18 }}>
          {isSuspend ? <UserX size={20} /> : <UserCheck size={20} />}
        </div>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)", margin: "0 0 8px" }}>
          {isSuspend ? "Suspend user?" : "Activate user?"}
        </h3>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 22px", lineHeight: 1.7 }}>
          {isSuspend
            ? `This will prevent @${user.username} from accessing their account.`
            : `@${user.username}'s account will be restored to active status.`}
        </p>
        {/* User card */}
        <div style={{ padding: "12px 14px", borderRadius: 12, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`, display: "flex", alignItems: "center", gap: 11, marginBottom: 22 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}>
            {user.profileImageUrl
              ? <img src={user.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${ACCENT},#a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 12 }}>{initials}</div>
            }
          </div>
          <div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 2px" }}>{user.name}</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{user.email}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "transparent", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} disabled={busy}
            style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: isSuspend ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1, boxShadow: `0 4px 16px ${color}44` }}>
            {busy ? "Processing…" : isSuspend ? "Suspend" : "Activate"}
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
      <div style={{ height: 36, width: 180, borderRadius: 10, background: b, animation: "aduPulse 1.6s ease-in-out infinite", marginBottom: 28 }} />
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 44, borderRadius: 12, background: b, animation: "aduPulse 1.6s ease-in-out infinite" }} />
        <div style={{ width: 120, height: 44, borderRadius: 12, background: b, animation: "aduPulse 1.6s ease-in-out infinite" }} />
      </div>
      {[0,1,2,3,4,5].map(i => <div key={i} style={{ height: 68, borderRadius: 14, background: b, marginBottom: 10, animation: "aduPulse 1.6s ease-in-out infinite", animationDelay: `${i*0.07}s` }} />)}
      <style>{`@keyframes aduPulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </div>
  );
}

type RoleFilter = "ALL" | "ADMIN" | "CREATOR" | "BACKER";
type StatusFilter = "ALL" | "ACTIVE" | "SUSPENDED";

const PAGE_SIZE = 15;

export default function AdminUsersPage() {
  const { isDark } = useTheme();
  const headerRef = useRef<HTMLDivElement>(null);
  const [users, setUsers]           = useState<UserResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatus]   = useState<StatusFilter>("ALL");
  const [actionId, setActionId]     = useState<number | null>(null);
  const [confirm, setConfirm]       = useState<{ user: UserResponse; action: "suspend" | "activate" } | null>(null);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);
  const [page, setPage]             = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.allUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!loading && headerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".adus-enter", { y: 22, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.5, ease: "power3.out" });
      }, headerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const showToast = (msg: string, ok = true) => setToast({ msg, ok });

  const doAction = async () => {
    if (!confirm) return;
    const { user, action } = confirm;
    setActionId(user.id);
    try {
      if (action === "suspend") {
        await adminApi.suspendUser(user.id);
        setUsers(us => us.map(u => u.id === user.id ? { ...u, accountStatus: "SUSPENDED" } : u));
        showToast(`@${user.username} suspended`);
      } else {
        await adminApi.activateUser(user.id);
        setUsers(us => us.map(u => u.id === user.id ? { ...u, accountStatus: "ACTIVE" } : u));
        showToast(`@${user.username} activated ✓`);
      }
      setConfirm(null);
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Failed", false); }
    finally { setActionId(null); }
  };

  if (loading) return <Skeleton />;

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchS = !search || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q);
    const matchR = roleFilter === "ALL" || (u.roles ?? []).includes(roleFilter);
    const matchSt = statusFilter === "ALL" || (u.accountStatus as string) === statusFilter;
    return matchS && matchR && matchSt;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Stats
  const admins   = users.filter(u => (u.roles ?? []).includes("ADMIN")).length;
  const creators = users.filter(u => (u.roles ?? []).includes("CREATOR")).length;
  const backers  = users.filter(u => (u.roles ?? []).includes("BACKER")).length;
  const suspended = users.filter(u => (u.accountStatus as string) === "SUSPENDED").length;

  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card = isDark ? "rgba(255,255,255,0.03)" : "#fff";

  const ROLE_FILTERS: { key: RoleFilter; label: string; count: number; color: string }[] = [
    { key: "ALL",     label: "All",      count: users.length,  color: ACCENT },
    { key: "ADMIN",   label: "Admins",   count: admins,        color: ACCENT },
    { key: "CREATOR", label: "Creators", count: creators,      color: "#ff8800" },
    { key: "BACKER",  label: "Backers",  count: backers,       color: "#60a5fa" },
  ];

  return (
    <div ref={headerRef} style={{ padding: "40px 36px 60px", maxWidth: 1100, margin: "0 auto" }}>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {confirm && (
          <ConfirmModal
            user={confirm.user}
            action={confirm.action}
            onConfirm={doAction}
            onClose={() => setConfirm(null)}
            busy={actionId === confirm.user.id}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="adus-enter" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
              <Users size={13} />
            </div>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>User Management</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(22px,3vw,34px)", color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>All Users</h1>
        </div>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 11, border: `1px solid ${bdr}`, background: "transparent", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = "var(--text)"; el.style.borderColor = `${ACCENT}44`; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = "var(--text-muted)"; el.style.borderColor = bdr; }}>
          <RefreshCcw size={13} /> Refresh
        </button>
      </div>

      {/* Quick stats */}
      <div className="adus-enter" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total users",  value: users.length,  color: ACCENT },
          { label: "Creators",     value: creators,      color: "#ff8800" },
          { label: "Backers",      value: backers,       color: "#60a5fa" },
          { label: "Suspended",    value: suspended,     color: "#ef4444" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: "14px 16px", borderRadius: 14, background: card, border: `1px solid ${bdr}`, boxShadow: isDark ? "none" : "0 1px 10px rgba(0,0,0,0.04)" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color, margin: 0, letterSpacing: "-0.03em" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="adus-enter" style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 260px" }}>
          <Search size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by name, username or email…"
            style={{ width: "100%", boxSizing: "border-box" as const, padding: "11px 14px 11px 38px", borderRadius: 12, border: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", transition: "border-color 0.15s, box-shadow 0.15s" }}
            onFocus={e => { e.currentTarget.style.borderColor = `${ACCENT}55`; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}10`; }}
            onBlur={e => { e.currentTarget.style.borderColor = bdr; e.currentTarget.style.boxShadow = "none"; }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 4 }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Role filter */}
        <div style={{ display: "flex", gap: 6 }}>
          {ROLE_FILTERS.map(f => (
            <button key={f.key} onClick={() => { setRoleFilter(f.key); setPage(0); }}
              style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${roleFilter === f.key ? `${f.color}44` : bdr}`, background: roleFilter === f.key ? `${f.color}12` : "transparent", color: roleFilter === f.key ? f.color : "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: roleFilter === f.key ? 700 : 500, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
              {f.label}
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["ALL","ACTIVE","SUSPENDED"] as StatusFilter[]).map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(0); }}
              style={{ padding: "8px 13px", borderRadius: 10, border: `1px solid ${statusFilter === s ? (s === "SUSPENDED" ? "rgba(239,68,68,0.4)" : s === "ACTIVE" ? "rgba(52,211,153,0.4)" : `${ACCENT}44`) : bdr}`, background: statusFilter === s ? (s === "SUSPENDED" ? "rgba(239,68,68,0.1)" : s === "ACTIVE" ? "rgba(52,211,153,0.1)" : `${ACCENT}12`) : "transparent", color: statusFilter === s ? (s === "SUSPENDED" ? "#ef4444" : s === "ACTIVE" ? "#34d399" : ACCENT) : "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: statusFilter === s ? 700 : 500, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
              {s === "ALL" ? "Any status" : s}
            </button>
          ))}
        </div>

        <span style={{ alignSelf: "center", fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", marginLeft: "auto" }}>
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="adus-enter" style={{ borderRadius: 20, background: card, border: `1px solid ${bdr}`, overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)" }}>
        {/* Head */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 140px 110px 110px", gap: 12, padding: "12px 22px", borderBottom: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)" }}>
          {["User","Email","Roles","Status","Actions"].map(h => (
            <span key={h} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <Users size={32} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text)", marginBottom: 6 }}>No users found</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)" }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={`page-${page}-${search}-${roleFilter}-${statusFilter}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {paginated.map((u, i) => {
                const initials = u.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";
                const isSuspended = (u.accountStatus as string) === "SUSPENDED";
                const busy = actionId === u.id;

                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.035, duration: 0.28 }}
                    style={{
                      display: "grid", gridTemplateColumns: "1fr 180px 140px 110px 110px",
                      gap: 12, padding: "13px 22px",
                      borderBottom: i < paginated.length - 1 ? `1px solid ${bdr}` : "none",
                      alignItems: "center", transition: "background 0.15s",
                      opacity: isSuspended ? 0.65 : 1,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    {/* User */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `1.5px solid ${bdr}` }}>
                        {u.profileImageUrl
                          ? <img src={u.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${ACCENT},#a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 12 }}>{initials}</div>
                        }
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {u.name}
                        </p>
                        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>
                          @{u.username}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email}
                    </p>

                    {/* Roles */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {(u.roles ?? []).map(role => <RoleBadge key={role} role={role} />)}
                    </div>

                    {/* Status */}
                    <StatusBadge status={(u.accountStatus as string) ?? "ACTIVE"} />

                    {/* Actions */}
                    <div>
                      {(u.roles ?? []).includes("ADMIN") ? (
                        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)", fontStyle: "italic" }}>Protected</span>
                      ) : isSuspended ? (
                        <button
                          onClick={() => setConfirm({ user: u, action: "activate" })}
                          disabled={busy}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "6px 12px", borderRadius: 9,
                            border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.08)",
                            color: "#34d399", fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 600,
                            cursor: busy ? "wait" : "pointer", opacity: busy ? 0.5 : 1, transition: "all 0.15s",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={e => { if (!busy) { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(52,211,153,0.15)"; el.style.borderColor = "rgba(52,211,153,0.5)"; }}}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(52,211,153,0.08)"; el.style.borderColor = "rgba(52,211,153,0.3)"; }}
                        >
                          <UserCheck size={12} /> Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirm({ user: u, action: "suspend" })}
                          disabled={busy}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "6px 12px", borderRadius: 9,
                            border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)",
                            color: "#ef4444", fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 600,
                            cursor: busy ? "wait" : "pointer", opacity: busy ? 0.5 : 1, transition: "all 0.15s",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={e => { if (!busy) { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(239,68,68,0.12)"; el.style.borderColor = "rgba(239,68,68,0.45)"; }}}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(239,68,68,0.06)"; el.style.borderColor = "rgba(239,68,68,0.25)"; }}
                        >
                          <UserX size={12} /> Suspend
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "14px 22px", borderTop: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)" }}>
              Page {page + 1} of {totalPages} · {filtered.length} users
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${bdr}`, background: "transparent", color: "var(--text-muted)", cursor: page === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 0 ? 0.35 : 1, transition: "all 0.15s" }}>
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pg = totalPages <= 7 ? i : (page <= 3 ? i : page >= totalPages - 4 ? totalPages - 7 + i : page - 3 + i);
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${pg === page ? `${ACCENT}44` : bdr}`, background: pg === page ? `${ACCENT}12` : "transparent", color: pg === page ? ACCENT : "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: pg === page ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                    {pg + 1}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${bdr}`, background: "transparent", color: "var(--text-muted)", cursor: page === totalPages - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages - 1 ? 0.35 : 1, transition: "all 0.15s" }}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .adus-enter{opacity:0;}
        @keyframes adusrDot{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
        @media(max-width:900px){
          div[style*="gridTemplateColumns: 1fr 180px"]{grid-template-columns:1fr 120px 80px!important;}
          div[style*="gridTemplateColumns: 1fr 180px"]>*:nth-child(4),
          div[style*="gridTemplateColumns: 1fr 180px"]>*:nth-child(5){display:none!important;}
        }
        @media(max-width:580px){
          div[style*="repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}
        }
      `}</style>
    </div>
  );
}
