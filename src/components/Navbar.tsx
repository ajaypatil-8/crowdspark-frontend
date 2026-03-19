"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { useProfile } from "@/contexts/ProfileContext";
import { authApi, isLoggedIn } from "@/lib/api";

// ── Types matching Spring Boot enums ─────────────────────────────────────────
type Role      = "ADMIN" | "CREATOR" | "BACKER";
type KycStatus = "NOT_SUBMITTED" | "PENDING_SUBMISSION" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

const NAV_LINKS = [
  { label: "Explore",      href: "/explore"  },
  { label: "How it works", href: "/#how"     },
  { label: "Creators",     href: "/creators" },
  { label: "Pricing",      href: "/pricing"  },
];

// Role colours
const ROLE_COLOR: Record<Role, string> = {
  ADMIN:   "#ef4444",
  CREATOR: "#ff8800",
  BACKER:  "#60a5fa",
};
const ROLE_BG: Record<Role, string> = {
  ADMIN:   "rgba(239,68,68,0.13)",
  CREATOR: "rgba(255,136,0,0.13)",
  BACKER:  "rgba(96,165,250,0.13)",
};

// KYC colours
const KYC_COLOR: Record<KycStatus, string> = {
  NOT_SUBMITTED:      "#f59e0b",
  PENDING_SUBMISSION: "#f59e0b",
  PENDING_APPROVAL:   "#60a5fa",
  APPROVED:           "#34d399",
  REJECTED:           "#ef4444",
};
const KYC_LABEL: Record<KycStatus, string> = {
  NOT_SUBMITTED:      "KYC not submitted",
  PENDING_SUBMISSION: "Submit KYC docs",
  PENDING_APPROVAL:   "KYC under review",
  APPROVED:           "KYC verified ✓",
  REJECTED:           "KYC rejected — resubmit",
};

// ── Sidebar nav items (exact folder structure) ────────────────────────────────
const SIDEBAR_ITEMS = [
  {
    section: "Dashboard",
    items: [
      { label: "Overview",  desc: "Dashboard home",        href: "/dashboard",         color: "#ff8800",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
      { label: "Profile",   desc: "Edit bio & avatar",     href: "/dashboard/profile",  color: "#a78bfa",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
      { label: "Settings",  desc: "Account & preferences", href: "/dashboard/settings", color: "#00d4b8",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
    ],
  },
  {
    section: "Activity",
    items: [
      { label: "Backed",    desc: "Projects you funded",   href: "/dashboard/backed",   color: "#ef4444",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> },
      { label: "Saved",     desc: "Bookmarked campaigns",  href: "/dashboard/saved",    color: "#f59e0b",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> },
    ],
  },
  {
    section: "Grow",
    items: [
      { label: "Become a Creator", desc: "KYC & start a campaign", href: "/dashboard/become-creator", color: "#ff8800",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg> },
    ],
  },
];

// ── Fire particles on logo ────────────────────────────────────────────────────
function FireParticles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    c.width = 80; c.height = 40;
    type P = { x: number; y: number; vy: number; life: number; ml: number; s: number };
    const ps: P[] = [];
    let f = 0, raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick); f++;
      if (f % 2 === 0) ps.push({ x: 30 + Math.random() * 20, y: 36, vy: -(0.6 + Math.random()), life: 0, ml: 24 + Math.random() * 16, s: 2 + Math.random() * 3 });
      ctx.clearRect(0, 0, 80, 40);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]; p.y += p.vy; p.x += (Math.random() - 0.5) * 0.8; p.life++;
        const t = p.life / p.ml; if (t >= 1) { ps.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = (1 - t) * 0.85;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s * (1 - t * 0.6));
        g.addColorStop(0, `rgb(255,${Math.round(255*(1-t*0.85))},${Math.round(60*(1-t))})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (1 - t * 0.6), 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
    };
    tick(); return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", bottom: -4, left: -16, width: 80, height: 40, pointerEvents: "none", zIndex: 0 }} />;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ url, name, size = 32 }: { url?: string | null; name?: string | null; size?: number }) {
  const initials = name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2.5px solid rgba(255,107,0,0.6)", boxShadow: "0 0 12px rgba(255,107,0,0.35)" }}>
      {url
        ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: size * 0.36 }}>{initials}</div>
      }
    </div>
  );
}

// ── SIDEBAR — rendered via portal so it can NEVER be clipped by navbar ────────
function Sidebar({ open, onClose, isDark, user }: {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  user: any;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const roles      = (user?.roles ? Array.from(user.roles as Iterable<Role>) : []) as Role[];
  const isCreator  = roles.includes("CREATOR");
  const isAdmin    = roles.includes("ADMIN");
  const primaryRole: Role = isAdmin ? "ADMIN" : isCreator ? "CREATOR" : "BACKER";
  const kycStatus  = user?.kycStatus as KycStatus | undefined;

  const handleLogout = useCallback(async () => {
    onClose();
    try { await authApi.logout(); } catch {}
    router.push("/login");
  }, [router, onClose]);

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const sidebarBg = isDark ? "#0a0910" : "#ffffff";
  const borderClr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="sb-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: isDark ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              zIndex: 9998,
            }}
          />

          {/* ── Sidebar panel ── */}
          <motion.div
            key="sb-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            style={{
              position: "fixed",
              top: 0, right: 0, bottom: 0,
              width: "min(340px, 92vw)",
              background: sidebarBg,
              borderLeft: `1px solid ${borderClr}`,
              boxShadow: isDark
                ? "-24px 0 80px rgba(0,0,0,0.75), -1px 0 0 rgba(255,107,0,0.08)"
                : "-24px 0 80px rgba(0,0,0,0.14)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            {/* Orange top glow line */}
            <div style={{ height: 2, flexShrink: 0, background: "linear-gradient(90deg,transparent,rgba(255,100,0,0.8) 25%,rgba(255,210,0,1) 50%,rgba(255,100,0,0.8) 75%,transparent)" }} />

            {/* ── Header: avatar + name + close ── */}
            <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${borderClr}`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <Avatar url={user?.profileImageUrl} name={user?.name} size={48} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15.5, color: isDark ? "#fff" : "#0a0a0a", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.name ?? "Account"}
                    </p>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)", margin: "0 0 7px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.username ? `@${user.username}` : user?.email ?? ""}
                    </p>
                    {/* Role badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {roles.map(r => (
                        <span key={r} style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          paddingTop: 3, paddingBottom: 3, paddingLeft: 8, paddingRight: 8,
                          borderRadius: 999, fontSize: 9.5, fontWeight: 700,
                          fontFamily: "DM Sans, sans-serif", letterSpacing: "0.08em",
                          textTransform: "uppercase" as const,
                          color: ROLE_COLOR[r], background: ROLE_BG[r],
                          border: `1px solid ${ROLE_COLOR[r]}33`,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: ROLE_COLOR[r], boxShadow: `0 0 5px ${ROLE_COLOR[r]}` }} />
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  style={{ background: "none", border: "none", cursor: "pointer", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)", padding: 6, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* KYC status bar */}
              {kycStatus && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  paddingTop: 8, paddingBottom: 8, paddingLeft: 11, paddingRight: 11,
                  borderRadius: 10,
                  background: isDark ? `${KYC_COLOR[kycStatus]}14` : `${KYC_COLOR[kycStatus]}0e`,
                  border: `1px solid ${KYC_COLOR[kycStatus]}30`,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: KYC_COLOR[kycStatus], boxShadow: `0 0 6px ${KYC_COLOR[kycStatus]}`, flexShrink: 0 }} />
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 600, color: KYC_COLOR[kycStatus], flex: 1 }}>{KYC_LABEL[kycStatus]}</span>
                </div>
              )}

              {/* Stats strip */}
              {(((user?.totalProjectsBacked ?? 0) > 0) || ((user?.totalProjectsCreated ?? 0) > 0)) && (
                <div style={{ display: "flex", marginTop: 12, borderRadius: 10, overflow: "hidden", border: `1px solid ${borderClr}` }}>
                  {[
                    isCreator && { val: user?.totalProjectsCreated ?? 0, label: "Created", color: "#34d399" },
                    isCreator && { val: `₹${(user?.totalFundsRaised ?? 0).toLocaleString("en-IN")}`, label: "Raised", color: "#ff8800" },
                    { val: user?.totalProjectsBacked ?? 0, label: "Backed", color: "#60a5fa" },
                  ].filter(Boolean).map((s: any, i, arr) => (
                    <div key={s.label} style={{ flex: 1, paddingTop: 8, paddingBottom: 8, textAlign: "center", borderRight: i < arr.length - 1 ? `1px solid ${borderClr}` : "none", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.018)" }}>
                      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, color: s.color, margin: 0, letterSpacing: "-0.02em" }}>{s.val}</p>
                      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)", margin: 0 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Nav items ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
              {SIDEBAR_ITEMS.map(({ section, items }) => {
                // hide "Grow / Become a Creator" for admins
                if (section === "Grow" && isAdmin) return null;
                // rename for creators
                const sectionLabel = section === "Grow" && isCreator ? "Creator" : section;

                return (
                  <div key={section} style={{ marginBottom: 8 }}>
                    <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 9.5, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", letterSpacing: "0.14em", textTransform: "uppercase" as const, margin: "10px 0 4px", paddingLeft: 10 }}>
                      {sectionLabel}
                    </p>
                    {items.map((item, idx) => {
                      const isActive = pathname === item.href;
                      return (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, x: 18 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.22 }}
                        >
                          <Link
                            href={item.href}
                            onClick={onClose}
                            style={{
                              display: "flex", alignItems: "center", gap: 13,
                              paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 12,
                              borderRadius: 13, textDecoration: "none", marginBottom: 2,
                              background: isActive
                                ? (isDark ? `${item.color}18` : `${item.color}0f`)
                                : "transparent",
                              border: isActive ? `1px solid ${item.color}28` : "1px solid transparent",
                              transition: "background 0.15s, border-color 0.15s",
                            }}
                            onMouseEnter={e => {
                              if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = isDark ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.042)";
                            }}
                            onMouseLeave={e => {
                              if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                            }}
                          >
                            {/* Icon box */}
                            <div style={{
                              width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                              background: isDark ? `${item.color}1a` : `${item.color}12`,
                              border: `1px solid ${item.color}30`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: item.color,
                            }}>
                              {item.icon}
                            </div>
                            {/* Text */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: isActive ? 700 : 600, color: isActive ? item.color : (isDark ? "#fff" : "#0a0a0a"), margin: 0, lineHeight: 1.3 }}>
                                {item.label}
                              </p>
                              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)", margin: 0 }}>
                                {item.desc}
                              </p>
                            </div>
                            {/* Arrow */}
                            {isActive && (
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, flexShrink: 0, boxShadow: `0 0 6px ${item.color}` }} />
                            )}
                            {!isActive && (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.2)", flexShrink: 0 }}>
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* ── Footer: sign out ── */}
            <div style={{ padding: "10px 10px 24px", borderTop: `1px solid ${borderClr}`, flexShrink: 0 }}>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: 13, width: "100%",
                  paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 12,
                  borderRadius: 13, background: "none", border: "none", cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.07)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600, color: "#ef4444", margin: 0, lineHeight: 1.3 }}>Sign out</p>
                  {user?.username && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", margin: 0 }}>@{user.username}</p>}
                </div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ── Trigger button in navbar ──────────────────────────────────────────────────
function ProfileTrigger({ isDark, user, onClick }: { isDark: boolean; user: any; onClick: () => void }) {
  const roles = (user?.roles ? Array.from(user.roles as Iterable<Role>) : []) as Role[];
  const isAdmin   = roles.includes("ADMIN");
  const isCreator = roles.includes("CREATOR");
  const primaryRole: Role = isAdmin ? "ADMIN" : isCreator ? "CREATOR" : "BACKER";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        paddingTop: 3, paddingBottom: 3, paddingLeft: 4, paddingRight: 11,
        borderRadius: 999, cursor: "pointer",
        background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
        border: `1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        boxShadow: "none", outline: "none",
        transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,107,0,0.55)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 3px rgba(255,107,0,0.12)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
      }}
    >
      <Avatar url={user?.profileImageUrl} name={user?.name} size={28} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <span style={{ fontFamily: "Syne, sans-serif", fontSize: 12.5, fontWeight: 700, color: isDark ? "#fff" : "#0a0a0a", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
          {user?.name?.split(" ")[0] ?? "Account"}
        </span>
        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 9, fontWeight: 700, color: ROLE_COLOR[primaryRole], letterSpacing: "0.09em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 3, lineHeight: 1.3 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: ROLE_COLOR[primaryRole], boxShadow: `0 0 5px ${ROLE_COLOR[primaryRole]}` }} />
          {primaryRole}
        </span>
      </div>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </motion.button>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const { isDark }  = useTheme();
  const pathname    = usePathname();
  const navRef      = useRef<HTMLDivElement>(null);
  const { user }    = useProfile();

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [loggedIn,    setLoggedIn]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setMounted(true); setLoggedIn(isLoggedIn()); }, []);
  useEffect(() => { setLoggedIn(isLoggedIn()); }, [pathname]);
  useEffect(() => {
    gsap.fromTo(navRef.current, { y: -80, opacity: 0, scale: 0.88 }, { y: 0, opacity: 1, scale: 1, duration: 1.05, ease: "back.out(1.6)", delay: 0.25 });
  }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => { setMobileOpen(false); setSidebarOpen(false); }, [pathname]);

  if (pathname === "/login" || pathname === "/register") return null;

  const glassBg  = scrolled ? (isDark ? "rgba(6,6,10,0.94)" : "rgba(255,255,255,0.94)") : (isDark ? "rgba(6,6,10,0.65)" : "rgba(255,255,255,0.62)");
  const bdr      = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)";
  const shadow   = scrolled ? "0 8px 44px rgba(0,0,0,0.42),0 0 0 1px rgba(255,120,0,0.14),inset 0 1px 0 rgba(255,255,255,0.07)" : "0 4px 28px rgba(0,0,0,0.18),inset 0 1px 0 rgba(255,255,255,0.06)";
  const mobileBdr = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  return (
    <>
      {/* ── Portal sidebar — lives on document.body, can never be clipped ── */}
      {mounted && loggedIn && (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isDark={isDark} user={user} />
      )}

      <div ref={navRef} style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 1000, width: "min(920px,calc(100vw - 32px))" }}>

        {/* Pill bar — overflow:hidden ONLY here, not on wrapper */}
        <div style={{ borderRadius: 9999, overflow: "hidden", background: glassBg, backdropFilter: "blur(28px) saturate(200%)", WebkitBackdropFilter: "blur(28px) saturate(200%)", border: bdr, boxShadow: shadow, transition: "background 0.3s, box-shadow 0.3s", paddingLeft: 8, paddingRight: 8, position: "relative" }}>

          {/* Accent line */}
          <div style={{ position: "absolute", top: 0, left: "12%", right: "12%", height: 1.5, background: "linear-gradient(90deg,transparent,rgba(255,120,0,0.8) 30%,rgba(255,220,0,1) 50%,rgba(255,120,0,0.8) 70%,transparent)", opacity: scrolled ? 1 : 0.5, transition: "opacity 0.3s", pointerEvents: "none" }} />
          {/* Outer glow */}
          <div style={{ position: "absolute", inset: -2, borderRadius: 9999, boxShadow: "0 -2px 24px rgba(255,100,0,0.22),0 -1px 10px rgba(255,200,0,0.18)", pointerEvents: "none", zIndex: -1 }} />

          <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 4, paddingRight: 4, gap: 6 }}>

            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", position: "relative", flexShrink: 0 }}>
              <FireParticles />
              <motion.div whileHover={{ scale: 1.08, rotate: 3 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,var(--accent),#ff8800)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, flexShrink: 0, boxShadow: "0 0 14px rgba(255,120,0,0.55),0 2px 8px rgba(0,0,0,0.3)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={isDark ? "#050508" : "#fff"} /></svg>
              </motion.div>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text)", letterSpacing: "-0.02em", position: "relative", zIndex: 1 }}>
                Crowd<span style={{ color: "var(--accent)" }}>Spark</span>
              </span>
            </Link>

            {/* Nav links */}
            <nav className="nb-links" style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {NAV_LINKS.map(l => {
                const active = pathname === l.href;
                return (
                  <Link key={l.href} href={l.href} className="nb-pill"
                    style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 500, color: active ? "var(--accent)" : "var(--text-muted)", textDecoration: "none", paddingTop: 6, paddingBottom: 6, paddingLeft: 13, paddingRight: 13, borderRadius: 999, background: active ? "var(--accent-dim)" : "transparent", transition: "all 0.18s", whiteSpace: "nowrap" }}>
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {/* Theme toggle always visible */}
              <ThemeToggle />

              {/* Auth */}
              {mounted && (
                loggedIn ? (
                  /* Profile trigger → opens sidebar */
                  <ProfileTrigger isDark={isDark} user={user} onClick={() => setSidebarOpen(true)} />
                ) : (
                  <div className="nb-links" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Link href="/login"
                      style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 500, color: "var(--text-muted)", textDecoration: "none", paddingTop: 7, paddingBottom: 7, paddingLeft: 14, paddingRight: 14, borderRadius: 999, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, transition: "all 0.18s", background: "none" }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "var(--text)"; el.style.borderColor = isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.2)"; el.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "var(--text-muted)"; el.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; el.style.background = "none"; }}
                    >
                      Sign in
                    </Link>
                    <Link href="/register" className="nb-cta"
                      style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", paddingTop: 8, paddingBottom: 8, paddingLeft: 20, paddingRight: 20, borderRadius: 999, background: "linear-gradient(135deg,#ff6b00 0%,#ff9500 50%,#ffcc00 100%)", boxShadow: "0 0 18px rgba(255,100,0,0.5),0 2px 8px rgba(0,0,0,0.3)", overflow: "hidden" }}
                    >
                      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.35) 50%,transparent 70%)", animation: "nbShimmer 2.4s ease-in-out infinite" }} />
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ position: "relative" }}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                      <span style={{ position: "relative" }}>Get started</span>
                    </Link>
                  </div>
                )
              )}

              {/* Hamburger mobile */}
              <button type="button" className="nb-hamburger" onClick={() => setMobileOpen(v => !v)} aria-label="Menu"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--text)", borderRadius: 8, display: "none" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {mobileOpen ? (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>) : (<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>)}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{ marginTop: 10, borderRadius: 22, background: isDark ? "rgba(6,6,10,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: `1px solid ${mobileBdr}`, boxShadow: "0 12px 48px rgba(0,0,0,0.32)", paddingTop: 14, paddingBottom: 20, paddingLeft: 16, paddingRight: 16, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <div style={{ height: 1.5, borderRadius: 1, marginBottom: 10, background: "linear-gradient(90deg,transparent,rgba(255,120,0,0.75),rgba(255,220,0,0.95),rgba(255,120,0,0.75),transparent)" }} />
              {NAV_LINKS.map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link href={l.href} style={{ display: "block", fontFamily: "DM Sans, sans-serif", fontSize: 15, fontWeight: 500, color: pathname === l.href ? "var(--accent)" : "var(--text)", textDecoration: "none", paddingTop: 11, paddingBottom: 11, paddingLeft: 12, paddingRight: 12, borderRadius: 12, background: pathname === l.href ? "var(--accent-dim)" : "transparent", transition: "background 0.18s" }}>
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                {loggedIn ? (
                  <button onClick={() => { setMobileOpen(false); setSidebarOpen(true); }} style={{ flex: 1, textAlign: "center", paddingTop: 12, paddingBottom: 12, borderRadius: 14, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(255,100,0,0.3)" }}>
                    My Account →
                  </button>
                ) : (
                  <>
                    <Link href="/login" style={{ flex: 1, textAlign: "center", paddingTop: 12, paddingBottom: 12, borderRadius: 14, border: `1px solid ${mobileBdr}`, color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
                    <Link href="/register" style={{ flex: 1, textAlign: "center", paddingTop: 12, paddingBottom: 12, borderRadius: 14, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 0 20px rgba(255,100,0,0.4)" }}>Get started</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes nbShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(200%)} 100%{transform:translateX(200%)} }
        .nb-pill:hover  { color: var(--text) !important; background: var(--bg-ghost) !important; }
        .nb-cta:hover   { transform: translateY(-1px) scale(1.04) !important; box-shadow: 0 0 30px rgba(255,100,0,0.8), 0 4px 18px rgba(0,0,0,0.3) !important; }
        .nb-links       { display: flex !important; align-items: center; gap: 8px; }
        @media (max-width: 768px) {
          .nb-links     { display: none !important; }
          .nb-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}