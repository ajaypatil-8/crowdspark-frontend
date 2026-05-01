"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  FolderCheck, FileCheck, Users, Activity,
  TrendingUp, Clock, CheckCircle2, XCircle,
  ArrowRight, Zap, AlertTriangle, BarChart2,
} from "lucide-react";
import { adminApi, type AdminProjectResponse, type UserResponse, type KycStatusResponse } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const ACCENT = "#7c3aed";

function StatCard({ label, value, sub, color, href, icon, delay = 0 }: {
  label: string; value: string | number; sub?: string;
  color: string; href: string; icon: React.ReactNode; delay?: number;
}) {
  const { isDark } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        <div
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            padding: "22px 22px 20px", borderRadius: 20,
            background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
            border: `1px solid ${hov ? `${color}44` : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)")}`,
            boxShadow: hov
              ? `0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px ${color}22`
              : isDark ? "none" : "0 2px 16px rgba(0,0,0,0.05)",
            transition: "all 0.2s cubic-bezier(.22,1,.36,1)",
            transform: hov ? "translateY(-4px)" : "translateY(0)",
            cursor: "pointer", position: "relative", overflow: "hidden",
          }}
        >
          {/* Top line */}
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg,transparent,${color}55,transparent)`, opacity: hov ? 1 : 0.5, transition: "opacity 0.2s" }} />
          {/* Ambient */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle,${color}18 0%,transparent 70%)`, pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", color, boxShadow: hov ? `0 0 14px ${color}44` : "none", transition: "box-shadow 0.2s" }}>
              {icon}
            </div>
            <ArrowRight size={13} color={color} style={{ opacity: hov ? 1 : 0.3, transition: "opacity 0.2s", marginTop: 4 }} />
          </div>

          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.09em" }}>{label}</p>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 34, color, margin: "0 0 4px", lineHeight: 1, letterSpacing: "-0.03em", textShadow: hov ? `0 0 24px ${color}55` : "none", transition: "text-shadow 0.2s" }}>{value}</p>
          {sub && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{sub}</p>}
        </div>
      </Link>
    </motion.div>
  );
}

function ActivityRow({ icon, title, sub, time, color }: { icon: React.ReactNode; title: string; sub: string; time: string; color: string }) {
  const { isDark } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, color: "var(--text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>{sub}</p>
      </div>
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>{time}</span>
    </div>
  );
}

function Skeleton() {
  const { isDark } = useTheme();
  const b = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const pulse = "adovPulse 1.6s ease-in-out infinite";
  return (
    <div style={{ padding: "40px 36px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ height: 36, width: 220, borderRadius: 10, background: b, animation: pulse, marginBottom: 32 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ height: 140, borderRadius: 20, background: b, animation: pulse, animationDelay: `${i*0.08}s` }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {[0,1].map(i => <div key={i} style={{ height: 320, borderRadius: 20, background: b, animation: pulse, animationDelay: `${i*0.1}s` }} />)}
      </div>
      <style>{`@keyframes adovPulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { isDark } = useTheme();
  const headerRef = useRef<HTMLDivElement>(null);
  const [pending,     setPending]    = useState<AdminProjectResponse[]>([]);
  const [kycQueue,    setKycQueue]   = useState<KycStatusResponse[]>([]);
  const [users,       setUsers]      = useState<UserResponse[]>([]);
  const [allProjects, setAll]        = useState<AdminProjectResponse[]>([]);
  const [loading,     setLoading]    = useState(true);

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

  useEffect(() => {
    if (!loading && headerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".adov-enter", { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.55, ease: "power3.out" });
      }, headerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  if (loading) return <Skeleton />;

  const approved  = allProjects.filter(p => p.status === "APPROVED").length;
  const rejected  = allProjects.filter(p => p.status === "REJECTED").length;
  const funded    = allProjects.filter(p => p.status === "FUNDED" || p.status === "COMPLETED").length;
  const creators  = users.filter(u => u.roles?.includes("CREATOR")).length;

  const card = isDark ? "rgba(255,255,255,0.03)" : "#fff";
  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div ref={headerRef} style={{ padding: "40px 36px 60px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div className="adov-enter" style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${ACCENT}15`, border: `1px solid ${ACCENT}28`, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}>
            <Zap size={13} />
          </div>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Admin Panel</span>
        </div>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(26px,3vw,38px)", color: "var(--text)", letterSpacing: "-0.03em", margin: "0 0 6px" }}>
          Platform Overview
        </h1>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: 0 }}>
          Real-time health of CrowdSpark-X
        </p>
      </div>

      {/* Stat cards */}
      <div className="adov-enter" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 15, marginBottom: 28 }} id="adov-grid">
        <StatCard label="Pending Review"    value={pending.length}  sub="projects awaiting"    color="#f59e0b" href="/admin/projects" icon={<Clock size={16} />}        delay={0} />
        <StatCard label="KYC Queue"         value={kycQueue.length} sub="need verification"    color={ACCENT}  href="/admin/kyc"      icon={<FileCheck size={16} />}     delay={80} />
        <StatCard label="Total Users"       value={users.length}    sub={`${creators} creators`} color="#34d399" href="/admin/users"    icon={<Users size={16} />}         delay={160} />
        <StatCard label="Live Campaigns"    value={approved}        sub={`${funded} funded, ${rejected} rejected`} color="#60a5fa" href="/admin/projects" icon={<Activity size={16} />} delay={240} />
      </div>

      {/* Secondary stats row */}
      <div className="adov-enter" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Funded campaigns",   value: funded,   color: "#a78bfa", icon: <CheckCircle2 size={13} /> },
          { label: "Rejected projects",  value: rejected, color: "#ef4444", icon: <XCircle size={13} /> },
          { label: "Approval rate",      value: allProjects.length > 0 ? `${Math.round((approved / allProjects.length) * 100)}%` : "—", color: "#34d399", icon: <TrendingUp size={13} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{ padding: "14px 18px", borderRadius: 14, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: `1px solid ${bdr}`, display: "flex", alignItems: "center", gap: 12, boxShadow: isDark ? "none" : "0 1px 10px rgba(0,0,0,0.04)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}12`, border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>{icon}</div>
            <div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color, margin: 0, letterSpacing: "-0.02em" }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-col panels */}
      <div className="adov-enter" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

        {/* Pending projects */}
        <div style={{ borderRadius: 20, background: card, border: `1px solid ${bdr}`, overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "18px 22px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(245,158,11,0.5),transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                <FolderCheck size={15} />
              </div>
              <div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: 0 }}>Pending Projects</h2>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>{pending.length} awaiting review</p>
              </div>
            </div>
            <Link href="/admin/projects" style={{ fontSize: 12, color: "#f59e0b", textDecoration: "none", fontFamily: "DM Sans, sans-serif", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ padding: "6px 22px 16px" }}>
            {pending.length === 0 ? (
              <div style={{ padding: "36px 0", textAlign: "center" }}>
                <CheckCircle2 size={28} color="#34d399" style={{ marginBottom: 10, opacity: 0.6 }} />
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 4px" }}>All clear!</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No pending projects</p>
              </div>
            ) : (
              pending.slice(0, 5).map((p, i) => (
                <ActivityRow
                  key={p.id}
                  icon={<FolderCheck size={13} />}
                  title={p.title}
                  sub={`by @${p.creatorUsername} · ₹${(p.goalAmount/100000).toFixed(1)}L goal`}
                  time={new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  color="#f59e0b"
                />
              ))
            )}
            {pending.length > 5 && (
              <Link href="/admin/projects" style={{ display: "block", textAlign: "center", padding: "10px 0 4px", fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#f59e0b", textDecoration: "none", fontWeight: 600 }}>
                +{pending.length - 5} more →
              </Link>
            )}
          </div>
        </div>

        {/* KYC Queue */}
        <div style={{ borderRadius: 20, background: card, border: `1px solid ${bdr}`, overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "18px 22px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg,transparent,${ACCENT}50,transparent)` }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${ACCENT}12`, border: `1px solid ${ACCENT}22`, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}>
                <FileCheck size={15} />
              </div>
              <div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: 0 }}>KYC Queue</h2>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>{kycQueue.length} pending verification</p>
              </div>
            </div>
            <Link href="/admin/kyc" style={{ fontSize: 12, color: ACCENT, textDecoration: "none", fontFamily: "DM Sans, sans-serif", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ padding: "6px 22px 16px" }}>
            {kycQueue.length === 0 ? (
              <div style={{ padding: "36px 0", textAlign: "center" }}>
                <CheckCircle2 size={28} color="#34d399" style={{ marginBottom: 10, opacity: 0.6 }} />
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 4px" }}>All clear!</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No pending KYC</p>
              </div>
            ) : (
              kycQueue.slice(0, 5).map((k) => (
                <ActivityRow
                  key={k.userId}
                  icon={<FileCheck size={13} />}
                  title={`@${k.username}`}
                  sub={k.email}
                  time={k.submittedAt ? new Date(k.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                  color={ACCENT}
                />
              ))
            )}
            {kycQueue.length > 5 && (
              <Link href="/admin/kyc" style={{ display: "block", textAlign: "center", padding: "10px 0 4px", fontFamily: "DM Sans, sans-serif", fontSize: 13, color: ACCENT, textDecoration: "none", fontWeight: 600 }}>
                +{kycQueue.length - 5} more →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Recent users strip */}
      {users.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          style={{ marginTop: 18, borderRadius: 20, background: card, border: `1px solid ${bdr}`, overflow: "hidden", boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)" }}
        >
          <div style={{ padding: "16px 22px", borderBottom: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
                <Users size={15} />
              </div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: 0 }}>Recent Users</h2>
            </div>
            <Link href="/admin/users" style={{ fontSize: 12, color: "#60a5fa", textDecoration: "none", fontFamily: "DM Sans, sans-serif", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              Manage all <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ padding: "6px 22px 14px" }}>
            {users.slice(0, 4).map(u => {
              const initials = u.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: `1.5px solid ${bdr}` }}>
                    {u.profileImageUrl
                      ? <img src={u.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 11 }}>{initials}</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, color: "var(--text)", margin: "0 0 2px" }}>{u.name} <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>@{u.username}</span></p>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>{u.email}</p>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {(u.roles ?? []).map((role: string) => {
                      const c = role === "ADMIN" ? ACCENT : role === "CREATOR" ? "#ff8800" : "#60a5fa";
                      return (
                        <span key={role} style={{ padding: "2px 8px", borderRadius: 6, background: `${c}15`, color: c, fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                          {role}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <style>{`
        .adov-enter{opacity:0;}
        @media(max-width:900px){
          #adov-grid{grid-template-columns:repeat(2,1fr)!important;}
        }
        @media(max-width:580px){
          #adov-grid{grid-template-columns:1fr 1fr!important;}
          div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
