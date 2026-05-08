"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { authApi, tokenStorage } from "@/lib/api";
import DashboardNotificationBell from "@/components/dashboard/DashboardNotificationBell";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Grid: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>),
  User: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
  Heart: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>),
  Bookmark: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>),
  Zap: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
  Plus: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  Gear: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>),
  Logout: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>),
  Compass: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>),
  Rocket: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg>),
  Menu: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>),
  ChevronDown: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>),
  X: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
};

// ─── Top Nav Item ─────────────────────────────────────────────────────────────
function NavItem({ href, label, icon, active, isDark, onClick }: {
  href: string; label: string; icon: ReactNode; active: boolean; isDark: boolean; onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "7px 12px", borderRadius: 10,
      textDecoration: "none",
      transition: "all 0.15s ease",
      color: active ? "#ff8800" : (isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"),
      background: active ? (isDark ? "rgba(255,136,0,0.1)" : "rgba(255,107,0,0.07)") : "transparent",
      fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
      fontWeight: active ? 700 : 500, whiteSpace: "nowrap" as const,
    }}
    onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLAnchorElement; el.style.color = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.75)"; el.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; }}}
    onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLAnchorElement; el.style.color = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"; el.style.background = "transparent"; }}}
    >
      <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>
      {label}
    </Link>
  );
}

// ─── User Dropdown ────────────────────────────────────────────────────────────
function UserDropdown({ user, initials, isCreator, isDark, handleLogout, onClose }: {
  user: any; initials: string; isCreator: boolean; isDark: boolean;
  handleLogout: () => void; onClose: () => void;
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
        borderRadius: 16, background: bg,
        border: `1px solid ${bdr}`,
        boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.6)" : "0 24px 64px rgba(0,0,0,0.14)",
        zIndex: 200, overflow: "hidden",
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${bdr}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
        {isCreator && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.2)", marginTop: 7 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff8800" }} />
            <span style={{ fontSize: 9.5, fontFamily: "DM Sans, sans-serif", fontWeight: 700, color: "#ff8800", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Verified Creator</span>
          </div>
        )}
      </div>
      <div style={{ padding: "8px 6px" }}>
        {[
          { href: "/dashboard/profile", label: "Profile", icon: <Icons.User /> },
          { href: "/dashboard/settings", label: "Settings", icon: <Icons.Gear /> },
          { href: "/explore", label: "Explore", icon: <Icons.Compass /> },
        ].map(item => (
          <Link key={item.href} href={item.href} onClick={onClose} style={{
            display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 10,
            textDecoration: "none", color: "var(--text-muted)",
            fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 500, transition: "all 0.15s",
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "var(--text)"; el.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "var(--text-muted)"; el.style.background = "transparent"; }}>
            <span style={{ display: "flex", opacity: 0.6 }}>{item.icon}</span>{item.label}
          </Link>
        ))}
      </div>
      <div style={{ height: 1, background: bdr, margin: "0 6px" }} />
      <div style={{ padding: "8px 6px" }}>
        <div style={{ padding: "4px 10px" }}><ThemeToggle /></div>
        <button onClick={() => { handleLogout(); onClose(); }}
          style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 10px", borderRadius: 10, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 500, transition: "all 0.15s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = "#ef4444"; el.style.background = "rgba(239,68,68,0.07)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = "var(--text-muted)"; el.style.background = "transparent"; }}>
          <span style={{ display: "flex", opacity: 0.6 }}><Icons.Logout /></span>Sign out
        </button>
      </div>
    </motion.div>
  );
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
function MobileMenu({ navItems, pathname, isDark, user, initials, isCreator, handleLogout, onClose }: {
  navItems: any[]; pathname: string; isDark: boolean; user: any; initials: string;
  isCreator: boolean; handleLogout: () => void; onClose: () => void;
}) {
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const bg  = isDark ? "#111111" : "#ffffff";
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 299 }} />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, background: bg, borderBottom: `1px solid ${bdr}`, zIndex: 300, padding: "16px 20px 20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "Syne, sans-serif" }}>C</div>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CrowdSpark</span>
          </Link>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${bdr}`, background: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icons.X /></button>
        </div>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,107,0,0.3)", flexShrink: 0 }}>
              {user.profileImageUrl
                ? <img src={user.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14 }}>{initials}</div>
              }
            </div>
            <div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 1px" }}>{user.name}</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: 0 }}>@{user.username}</p>
            </div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {navItems.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, textDecoration: "none",
                color: active ? "#ff8800" : "var(--text-muted)",
                background: active ? (isDark ? "rgba(255,136,0,0.1)" : "rgba(255,107,0,0.07)") : "transparent",
                fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: active ? 700 : 500,
              }}>
                <span style={{ display: "flex" }}>{item.icon}</span>{item.label}
              </Link>
            );
          })}
        </div>
        <div style={{ height: 1, background: bdr, margin: "12px 0" }} />
        <div style={{ padding: "4px 10px" }}><ThemeToggle /></div>
      </motion.div>
    </>
  );
}

// ─── Inner Layout ──────────────────────────────────────────────────────────────
function DashboardInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useProfile();
  const { isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !tokenStorage.getAccess()) router.replace("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    if (!loading && user?.roles?.includes("ADMIN")) router.replace("/admin");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [pathname]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const handleLogout = async () => { await authApi.logout(); router.push("/login"); };

  const isCreator = !!user?.roles?.includes("CREATOR");
  const initials = user?.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  const navItems = [
    { href: "/dashboard",               label: "Overview",        icon: <Icons.Grid />,    exact: true },
    { href: "/dashboard/backed",         label: "Backed",          icon: <Icons.Heart />,   exact: false },
    { href: "/dashboard/saved",          label: "Saved",           icon: <Icons.Bookmark />, exact: false },
    isCreator
      ? { href: "/dashboard/my-campaigns",   label: "My Campaigns", icon: <Icons.Zap />,     exact: false }
      : { href: "/dashboard/become-creator", label: "Become Creator", icon: <Icons.Rocket />, exact: false },
    ...(isCreator ? [{ href: "/dashboard/create-campaign", label: "New Campaign", icon: <Icons.Plus />, exact: false }] : []),
    { href: "/dashboard/settings",       label: "Settings",        icon: <Icons.Gear />,    exact: false },
  ];

  const pageBg = isDark ? "#0a0a0a" : "#f3f3f1";
  const navBg  = isDark ? "rgba(10,10,10,0.9)" : "rgba(255,255,255,0.9)";
  const navBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{ width: 36, height: 36, borderRadius: "50%", border: "2.5px solid rgba(255,136,0,0.15)", borderTopColor: "#ff8800" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      {/* ── Top Navigation ── */}
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
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "Syne, sans-serif", boxShadow: "0 4px 12px rgba(255,107,0,0.35)" }}>C</div>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 800, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CrowdSpark</span>
          </Link>

          <div style={{ width: 1, height: 22, background: navBdr, flexShrink: 0 }} className="cs-divider" />

          {/* Nav items */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, overflow: "hidden" }} className="cs-topnav">
            {navItems.map(item => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} active={active} isDark={isDark} />;
            })}
          </nav>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
            <div className="cs-bell"><DashboardNotificationBell /></div>

            {/* Avatar + dropdown */}
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button onClick={() => setDropdownOpen(o => !o)} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "4px 9px 4px 4px",
                borderRadius: 100, border: `1px solid ${dropdownOpen ? "rgba(255,107,0,0.4)" : navBdr}`,
                background: dropdownOpen ? (isDark ? "rgba(255,136,0,0.08)" : "rgba(255,107,0,0.05)") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                cursor: "pointer", transition: "all 0.18s",
              }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,107,0,0.3)", flexShrink: 0 }}>
                  {user?.profileImageUrl
                    ? <img src={user.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 11 }}>{initials}</div>
                  }
                </div>
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: "var(--text)", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }} className="cs-uname">
                  {user?.name?.split(" ")[0]}
                </span>
                <span style={{ color: "var(--text-muted)", display: "flex", transition: "transform 0.18s", transform: dropdownOpen ? "rotate(180deg)" : "none" }}><Icons.ChevronDown /></span>
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <UserDropdown user={user} initials={initials} isCreator={isCreator} isDark={isDark} handleLogout={handleLogout} onClose={() => setDropdownOpen(false)} />
                )}
              </AnimatePresence>
            </div>

            {/* Hamburger */}
            <button onClick={() => setMobileOpen(true)} className="cs-hamburger" style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${navBdr}`, background: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icons.Menu />
            </button>
          </div>
        </div>
        {/* Subtle gradient underline */}
        <div style={{ position: "absolute", bottom: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(255,107,0,0.25),transparent)", pointerEvents: "none" }} />
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu navItems={navItems} pathname={pathname} isDark={isDark} user={user}
            initials={initials} isCreator={isCreator} handleLogout={handleLogout} onClose={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      <main style={{ minHeight: "calc(100vh - 62px)" }}>{children}</main>

      <style>{`
        .cs-topnav  { display:flex!important; }
        .cs-divider { display:block!important; }
        .cs-bell    { display:flex!important; }
        .cs-uname   { display:block!important; }
        .cs-hamburger { display:none!important; }
        @media(max-width:768px){
          .cs-topnav  { display:none!important; }
          .cs-divider { display:none!important; }
          .cs-bell    { display:none!important; }
          .cs-uname   { display:none!important; }
          .cs-hamburger { display:flex!important; }
        }
      `}</style>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <DashboardInner>{children}</DashboardInner>
    </ProfileProvider>
  );
}
