"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi, type AdminProjectResponse, type UserResponse, type KycStatusResponse } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const ACCENT = "#7c3aed";

function StatCard({ label, value, sub, color, href }: { label: string; value: string | number; sub?: string; color: string; href: string }) {
  const { isDark } = useTheme();
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        padding: "24px 26px", borderRadius: 18,
        background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)",
        cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)"; }}
      >
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 36, color, margin: "0 0 4px", lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{sub}</p>}
      </div>
    </Link>
  );
}

export default function AdminOverviewPage() {
  const { isDark } = useTheme();
  const [pending, setPending]     = useState<AdminProjectResponse[]>([]);
  const [kycQueue, setKycQueue]   = useState<KycStatusResponse[]>([]);
  const [users, setUsers]         = useState<UserResponse[]>([]);
  const [allProjects, setAll]     = useState<AdminProjectResponse[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.allSettled([
      adminApi.pendingProjects(),
      adminApi.pendingKyc(),
      adminApi.allUsers(),
      adminApi.allProjects(),
    ]).then(([p, k, u, a]) => {
      if (p.status === "fulfilled") setPending(p.value);
      if (k.status === "fulfilled") setKycQueue(k.value);
      if (u.status === "fulfilled") setUsers(u.value);
      if (a.status === "fulfilled") setAll(a.value);
      setLoading(false);
    });
  }, []);

  const approved  = allProjects.filter(p => p.status === "APPROVED").length;
  const rejected  = allProjects.filter(p => p.status === "REJECTED").length;

  const card = isDark ? "rgba(255,255,255,0.03)" : "#fff";
  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div style={{ padding: "40px 36px 60px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontFamily: "DM Sans, sans-serif", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Admin Panel</span>
        </div>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(26px,3vw,36px)", color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
          Overview
        </h1>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: "6px 0 0" }}>
          Platform health at a glance
        </p>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ height: 120, borderRadius: 18, background: bdr, animation: "pulse 2s ease-in-out infinite", animationDelay: `${i*0.1}s` }} />
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 36 }}>
          <StatCard label="Pending Projects"    value={pending.length}   sub="awaiting review"     color="#f59e0b" href="/admin/projects" />
          <StatCard label="KYC Queue"           value={kycQueue.length}  sub="need verification"   color={ACCENT}  href="/admin/kyc"      />
          <StatCard label="Total Users"         value={users.length}     sub="registered accounts" color="#34d399" href="/admin/users"    />
          <StatCard label="Live Projects"       value={approved}         sub={`${rejected} rejected`} color="#60a5fa" href="/admin/projects" />
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Pending projects preview */}
        <div style={{ borderRadius: 20, background: card, border: `1px solid ${bdr}`, padding: "24px 24px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", margin: 0 }}>Pending Projects</h2>
            <Link href="/admin/projects" style={{ fontSize: 12, color: ACCENT, textDecoration: "none", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>View all →</Link>
          </div>
          {pending.length === 0 ? (
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>✅ No pending projects</p>
          ) : (
            pending.slice(0, 4).map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${bdr}` }}>
                <div>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{p.title}</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>by @{p.creatorUsername}</p>
                </div>
                <Link href="/admin/projects" style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: "DM Sans, sans-serif", border: "1px solid rgba(245,158,11,0.25)" }}>
                  Review
                </Link>
              </div>
            ))
          )}
        </div>

        {/* KYC queue preview */}
        <div style={{ borderRadius: 20, background: card, border: `1px solid ${bdr}`, padding: "24px 24px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", margin: 0 }}>KYC Queue</h2>
            <Link href="/admin/kyc" style={{ fontSize: 12, color: ACCENT, textDecoration: "none", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>View all →</Link>
          </div>
          {kycQueue.length === 0 ? (
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>✅ No pending KYC</p>
          ) : (
            kycQueue.slice(0, 4).map(k => (
              <div key={k.userId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${bdr}` }}>
                <div>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>@{k.username}</p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{k.email}</p>
                </div>
                <Link href="/admin/kyc" style={{ padding: "5px 12px", borderRadius: 8, background: `${ACCENT}18`, color: ACCENT, fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: "DM Sans, sans-serif", border: `1px solid ${ACCENT}33` }}>
                  Verify
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
