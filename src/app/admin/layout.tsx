"use client";
import { ReactNode, useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { authApi, isLoggedIn, type UserResponse } from "@/lib/api";

const ACCENT = "#7c3aed";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Grid:    () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>),
  Folder:  () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>),
  File:    () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>),
  Message: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z"/></svg>),
  Users:   () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>),
  Shield:  () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
  Home:    () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Logout:  () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>),
  Menu:    () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>),
  ChevronDown: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>),
  X: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  Dot:     () => (<div style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px #34d399", animation: "adPulse 1.5s ease-in-out infinite" }} />),
};

const NAV = [
  { href: "/admin",          label: "Overview",   icon: <Ic.Grid />,   exact: true,  color: ACCENT },
  { href: "/admin/projects", label: "Projects",   icon: <Ic.Folder />, exact: false, color: "#f59e0b" },
  { href: "/admin/kyc",      label: "KYC Queue",  icon: <Ic.File />,   exact: false, color: "#34d399" },
  { href: "/admin/messages", label: "Messages",   icon: <Ic.Message />, exact: false, color: "#ec4899" },
  { href: "/admin/users",    label: "Users",      icon: <Ic.Users />,  exact: false, color: "#60a5fa" },
];

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({ href, label, icon, active, isDark, color, onClick }: {
  href: string; label: string; icon: ReactNode; active: boolean; isDark: boolean; color: string; onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 10,
      textDecoration: "none", transition: "all 0.15s ease",
      color: active ? color : (isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"),
      background: active ? `${color}14` : "transparent",
      fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
      fontWeight: active ? 700 : 500, whiteSpace: "nowrap" as const,
      border: active ? `1px solid ${color}22` : "1px solid transparent",
    }}
    onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLAnchorElement; el.style.color = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.75)"; el.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; }}}
    onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLAnchorElement; el.style.color = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"; el.style.background = "transparent"; }}}
    >
      <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>
      {label}
    </Link>
  );
}

// ─── Admin Dropdown ───────────────────────────────────────────────────────────
function AdminDropdown({ user, isDark, handleLogout, onClose }: {
  user: UserResponse | null; isDark: boolean; handleLogout: () => void; onClose: () => void;
}) {
  const bdr = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const bg  = isDark ? "#161616" : "#ffffff";
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute", top: "calc(100% + 10px)", right: 0, width: 220,
        borderRadius: 16, background: bg, border: `1px solid ${bdr}`,
        boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.6)" : "0 24px 64px rgba(0,0,0,0.14)",
        zIndex: 200, overflow: "hidden",
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
          <Ic.Dot />
          <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700, fontFamily: "DM Sans, sans-serif" }}>Administrator</span>
        </div>
      </div>
      <div style={{ padding: "8px 6px" }}>
        <Link href="/" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 10, textDecoration: "none", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 500, transition: "all 0.15s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "var(--text)"; el.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "var(--text-muted)"; el.style.background = "transparent"; }}>
          <span style={{ display: "flex", opacity: 0.6 }}><Ic.Home /></span> Back to site
        </Link>
      </div>
      <div style={{ height: 1, background: bdr, margin: "0 6px" }} />
      <div style={{ padding: "8px 6px" }}>
        <div style={{ padding: "4px 10px" }}><ThemeToggle /></div>
        <button onClick={() => { handleLogout(); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 10px", borderRadius: 10, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 500, transition: "all 0.15s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = "#ef4444"; el.style.background = "rgba(239,68,68,0.07)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = "var(--text-muted)"; el.style.background = "transparent"; }}>
          <span style={{ display: "flex", opacity: 0.6 }}><Ic.Logout /></span>Sign out
        </button>
      </div>
      <style>{`@keyframes adPulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.6)}}`}</style>
    </motion.div>
  );
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
function MobileMenu({ pathname, isDark, onClose }: {
  pathname: string; isDark: boolean; onClose: () => void;
}) {
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const bg  = isDark ? "#111111" : "#ffffff";
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", zIndex: 299 }} />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, background: bg, borderBottom: `1px solid ${bdr}`, zIndex: 300, padding: "16px 20px 20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CrowdSpark</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 7, background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
              <Ic.Shield /><span style={{ fontSize: 9.5, color: ACCENT, fontFamily: "DM Sans, sans-serif", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Admin</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${bdr}`, background: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic.X /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, textDecoration: "none",
                color: active ? item.color : "var(--text-muted)",
                background: active ? `${item.color}12` : "transparent",
                fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: active ? 700 : 500,
              }}>{item.icon}{item.label}</Link>
            );
          })}
          <Link href="/" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, textDecoration: "none", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 500 }}>
            <Ic.Home /> Back to site
          </Link>
        </div>
        <div style={{ height: 1, background: bdr, margin: "12px 0" }} />
        <div style={{ padding: "4px 10px" }}><ThemeToggle /></div>
      </motion.div>
    </>
  );
}

// ─── Inner Layout ──────────────────────────────────────────────────────────────
function AdminInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useProfile();
  const { isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn()) { router.replace("/login"); return; }
      if (user && !user.roles?.includes("ADMIN")) router.replace("/dashboard");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const handleLogout = async () => { await authApi.logout(); router.push("/login"); };
  const initials = user?.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  const pageBg = isDark ? "#0a0a0a" : "#f3f3f1";
  const navBg  = isDark ? "rgba(10,10,10,0.9)" : "rgba(255,255,255,0.9)";
  const navBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${ACCENT}30`, borderTopColor: ACCENT }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      {/* ── Top Nav ── */}
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "sticky", top: 0, zIndex: 100,
          background: navBg,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: `1px solid ${navBdr}`,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 62, display: "flex", alignItems: "center", gap: 12 }}>
          {/* Logo + badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <Link href="/admin" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "Syne, sans-serif", boxShadow: "0 4px 12px rgba(255,107,0,0.35)" }}>C</div>
              <span style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 800, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CrowdSpark</span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}25` }} className="ad-badge">
              <Ic.Shield />
              <span style={{ fontSize: 10, fontFamily: "DM Sans, sans-serif", fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Admin</span>
            </div>
          </div>

          <div style={{ width: 1, height: 22, background: navBdr, flexShrink: 0 }} className="ad-divider" />

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }} className="ad-topnav">
            {NAV.map(item => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} active={active} isDark={isDark} color={item.color} />;
            })}
          </nav>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
            {/* Avatar + dropdown */}
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button onClick={() => setDropdownOpen(o => !o)} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "4px 9px 4px 4px",
                borderRadius: 100, border: `1px solid ${dropdownOpen ? `${ACCENT}55` : navBdr}`,
                background: dropdownOpen ? `${ACCENT}10` : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                cursor: "pointer", transition: "all 0.18s",
              }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", border: `2px solid ${ACCENT}44`, flexShrink: 0 }}>
                  {user?.profileImageUrl
                    ? <img src={user.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${ACCENT},#a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 11 }}>{initials}</div>
                  }
                </div>
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "var(--text)", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }} className="ad-uname">
                  {user?.name?.split(" ")[0]}
                </span>
                <span style={{ color: "var(--text-muted)", display: "flex", transition: "transform 0.18s", transform: dropdownOpen ? "rotate(180deg)" : "none" }}><Ic.ChevronDown /></span>
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <AdminDropdown user={user} isDark={isDark} handleLogout={handleLogout} onClose={() => setDropdownOpen(false)} />
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setMobileOpen(true)} className="ad-hamburger" style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${navBdr}`, background: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic.Menu />
            </button>
          </div>
        </div>
        {/* Accent underline */}
        <div style={{ position: "absolute", bottom: 0, left: "15%", right: "15%", height: 1, background: `linear-gradient(90deg,transparent,${ACCENT}35,transparent)`, pointerEvents: "none" }} />
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu pathname={pathname} isDark={isDark} onClose={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
        style={{ minHeight: "calc(100vh - 62px)" }}
      >
        {children}
      </motion.main>

      <style>{`
        .ad-topnav   { display:flex!important; }
        .ad-divider  { display:block!important; }
        .ad-badge    { display:flex!important; }
        .ad-uname    { display:block!important; }
        .ad-hamburger{ display:none!important; }
        @media(max-width:768px){
          .ad-topnav   { display:none!important; }
          .ad-divider  { display:none!important; }
          .ad-badge    { display:none!important; }
          .ad-uname    { display:none!important; }
          .ad-hamburger{ display:flex!important; }
        }
        @keyframes adPulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.6)}}
      `}</style>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <AdminInner>{children}</AdminInner>
    </ProfileProvider>
  );
}
