"use client";
import { useEffect, useState } from "react";
import { adminApi, type UserResponse } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const ACCENT = "#7c3aed";

export default function AdminUsersPage() {
  const { isDark } = useTheme();
  const [users, setUsers]       = useState<UserResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [actionId, setActionId] = useState<number | null>(null);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.allUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToastMsg = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const suspend = async (id: number) => {
    setActionId(id);
    try {
      await adminApi.suspendUser(id);
      setUsers(us => us.map(u => u.id === id ? { ...u, accountStatus: "SUSPENDED" as any } : u));
      showToastMsg("User suspended");
    } catch (e: any) {
      showToastMsg(e.message || "Failed", false);
    } finally {
      setActionId(null);
    }
  };

  const activate = async (id: number) => {
    setActionId(id);
    try {
      await adminApi.activateUser(id);
      setUsers(us => us.map(u => u.id === id ? { ...u, accountStatus: "ACTIVE" as any } : u));
      showToastMsg("User activated ✓");
    } catch (e: any) {
      showToastMsg(e.message || "Failed", false);
    } finally {
      setActionId(null);
    }
  };

  const filtered = users.filter(u =>
    !search ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const card = isDark ? "rgba(255,255,255,0.03)" : "#fff";
  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  const RoleBadge = ({ role }: { role: string }) => {
    const colors: Record<string, [string, string]> = {
      ADMIN:   ["#7c3aed", "rgba(124,58,237,0.12)"],
      CREATOR: ["#ff8800", "rgba(255,136,0,0.1)"],
      BACKER:  ["#60a5fa", "rgba(96,165,250,0.1)"],
    };
    const [c, bg] = colors[role] ?? ["#94a3b8", "rgba(148,163,184,0.1)"];
    return (
      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, background: bg, color: c, fontFamily: "DM Sans, sans-serif", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>
        {role}
      </span>
    );
  };

  return (
    <div style={{ padding: "40px 36px 60px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "13px 20px", borderRadius: 12, background: isDark ? "#1a1a1a" : "#fff", border: `1px solid ${toast.ok ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.4)"}`, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color: toast.ok ? "#34d399" : "#ef4444", animation: "toastIn 0.25s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: "var(--text)", letterSpacing: "-0.03em", margin: "0 0 5px" }}>Users</h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: 0 }}>{users.length} registered accounts</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, username…"
            style={{ padding: "10px 14px", borderRadius: 11, border: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.04)" : "#fff", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, outline: "none", width: 260 }}
          />
          <button onClick={load} style={{ padding: "10px 16px", borderRadius: 11, border: `1px solid ${bdr}`, background: "transparent", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13, cursor: "pointer" }}>↺</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total", count: users.length, color: "#60a5fa" },
          { label: "Active", count: users.filter(u => u.accountStatus === "ACTIVE").length, color: "#34d399" },
          { label: "Suspended", count: users.filter(u => u.accountStatus === "SUSPENDED").length, color: "#ef4444" },
          { label: "Creators", count: users.filter(u => u.roles?.includes("CREATOR")).length, color: "#ff8800" },
          { label: "KYC Verified", count: users.filter(u => u.kycVerified).length, color: ACCENT },
        ].map(({ label, count, color }) => (
          <div key={label} style={{ padding: "12px 18px", borderRadius: 14, background: card, border: `1px solid ${bdr}`, textAlign: "center" }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color, margin: "0 0 2px", lineHeight: 1 }}>{count}</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ height: 300, borderRadius: 18, background: bdr, animation: "pulse 2s infinite" }}>
          <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", borderRadius: 18, background: card, border: `1px solid ${bdr}` }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "var(--text-muted)" }}>No users found</p>
        </div>
      ) : (
        <div style={{ borderRadius: 18, background: card, border: `1px solid ${bdr}`, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.2fr 1fr 120px", padding: "12px 20px", borderBottom: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            {["User", "Email", "Roles", "Status", "Actions"].map(h => (
              <span key={h} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>

          {filtered.map((u, i) => {
            const isSuspended = u.accountStatus === "SUSPENDED";
            const isActing = actionId === u.id;
            return (
              <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.2fr 1fr 120px", padding: "13px 20px", borderBottom: i < filtered.length - 1 ? `1px solid ${bdr}` : "none", alignItems: "center" }}>
                {/* User */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, overflow: "hidden", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 11 }}>
                    {u.profileImageUrl
                      ? <img src={u.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : u.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</p>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: "1px 0 0" }}>@{u.username} · ID #{u.id}</p>
                  </div>
                </div>

                {/* Email */}
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.email}
                  {u.emailVerified && <span style={{ marginLeft: 5, color: "#34d399", fontSize: 11 }}>✓</span>}
                </p>

                {/* Roles */}
                <div>{u.roles?.map(r => <RoleBadge key={r} role={r} />)}</div>

                {/* Status */}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: isSuspended ? "rgba(239,68,68,0.08)" : "rgba(52,211,153,0.08)", color: isSuspended ? "#ef4444" : "#34d399", fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: isSuspended ? "#ef4444" : "#34d399", flexShrink: 0 }} />
                  {u.accountStatus}
                </span>

                {/* Actions */}
                {u.roles?.includes("ADMIN") ? (
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: ACCENT, fontWeight: 600 }}>Admin</span>
                ) : isSuspended ? (
                  <button onClick={() => activate(u.id)} disabled={isActing} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)", fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {isActing ? "…" : "Activate"}
                  </button>
                ) : (
                  <button onClick={() => suspend(u.id)} disabled={isActing} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {isActing ? "…" : "Suspend"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
