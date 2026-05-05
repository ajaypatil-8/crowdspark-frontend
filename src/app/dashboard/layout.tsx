"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { authApi, tokenStorage } from "@/lib/api";
import DashboardNotificationBell from "@/components/dashboard/DashboardNotificationBell";

// ─── Icons ─────────────────────────────────────────────────────────────────────
const Ic = {
  Grid: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Gear: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  Heart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  Bookmark: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
    </svg>
  ),
  Zap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Rocket: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Explore: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  ),
};

// ─── Nav Item ──────────────────────────────────────────────────────────────────
function NavItem({
  href, label, icon, active, isDark, badge, onClick
}: {
  href: string; label: string; icon: ReactNode; active: boolean;
  isDark: boolean; badge?: number; onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px", borderRadius: 12,
        textDecoration: "none", position: "relative",
        transition: "all 0.18s cubic-bezier(.22,1,.36,1)",
        marginBottom: 2,
        color: active ? "#ff8800" : (hovered ? (isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)") : (isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)")),
        background: active
          ? (isDark ? "rgba(255,136,0,0.1)" : "rgba(255,107,0,0.07)")
          : (hovered ? (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)") : "transparent"),
      }}
    >
      {active && (
        <span style={{
          position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
          width: 3, height: "60%", borderRadius: "0 3px 3px 0",
          background: "linear-gradient(180deg,#ff6b00,#ffcc00)",
        }}/>
      )}
      <span style={{ opacity: active ? 1 : (hovered ? 0.85 : 0.6), flexShrink: 0, display: "flex" }}>
        {icon}
      </span>
      <span style={{
        fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
        fontWeight: active ? 600 : 500, flex: 1,
      }}>
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 700, fontFamily: "DM Sans, sans-serif",
          background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
          color: "#fff", padding: "2px 6px", borderRadius: 20,
          minWidth: 18, textAlign: "center",
        }}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {active && (
        <span style={{ opacity: 0.35, display: "flex" }}>
          <Ic.ChevronRight />
        </span>
      )}
    </Link>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────
function SidebarContent({
  isDark, pathname, user, isCreator, initials, handleLogout, onNavClick
}: {
  isDark: boolean; pathname: string; user: any; isCreator: boolean;
  initials: string; handleLogout: () => void; onNavClick?: () => void;
}) {
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const muted = isDark ? "rgba(255,255,255,0.36)" : "rgba(0,0,0,0.36)";

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: <Ic.Grid />, exact: true },
    { href: "/dashboard/profile", label: "Profile", icon: <Ic.User />, exact: false },
    { href: "/dashboard/backed", label: "Backed Projects", icon: <Ic.Heart />, exact: false },
    { href: "/dashboard/saved", label: "Saved", icon: <Ic.Bookmark />, exact: false },
    isCreator
      ? { href: "/dashboard/my-campaigns", label: "My Campaigns", icon: <Ic.Zap />, exact: false }
      : { href: "/dashboard/become-creator", label: "Become Creator", icon: <Ic.Rocket />, exact: false },
    ...(isCreator ? [{ href: "/dashboard/create-campaign", label: "New Campaign", icon: <Ic.Plus />, exact: false }] : []),
    { href: "/dashboard/settings", label: "Settings", icon: <Ic.Gear />, exact: false },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div style={{ padding: "22px 18px 18px", borderBottom: `1px solid ${bdr}` }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "Syne, sans-serif",
            boxShadow: "0 4px 12px rgba(255,107,0,0.35)",
          }}>
            C
          </div>
          <span style={{
            fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 800,
            background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            CrowdSpark
          </span>
        </Link>
      </div>

      {/* User Card */}
      {user && (
        <div style={{ padding: "14px 16px 14px", borderBottom: `1px solid ${bdr}` }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 12,
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)",
            border: `1px solid ${bdr}`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              overflow: "hidden",
              border: "2px solid",
              borderColor: isDark ? "rgba(255,107,0,0.4)" : "rgba(255,107,0,0.3)",
              boxShadow: "0 0 10px rgba(255,107,0,0.2)",
            }}>
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              ) : (
                <div style={{
                  width: "100%", height: "100%",
                  background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13,
                }}>
                  {initials}
                </div>
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13,
                color: "var(--text)", margin: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {user.name}
              </p>
              <p style={{
                fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                @{user.username}
              </p>
            </div>
            {isCreator && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 7px",
                borderRadius: 6, background: "rgba(255,107,0,0.12)",
                border: "1px solid rgba(255,107,0,0.25)", flexShrink: 0,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff8800" }}/>
                <span style={{
                  fontSize: 9, fontFamily: "DM Sans, sans-serif", fontWeight: 700,
                  color: "#ff8800", letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  Creator
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700,
          color: muted, letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "6px 12px 8px", margin: 0,
        }}>
          Navigation
        </p>
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={active}
              isDark={isDark}
              onClick={onNavClick}
            />
          );
        })}

        <div style={{ height: 1, background: bdr, margin: "14px 4px 14px" }}/>

        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700,
          color: muted, letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "0 12px 8px", margin: 0,
        }}>
          Discover
        </p>
        <NavItem href="/explore" label="Explore" icon={<Ic.Explore />} active={false} isDark={isDark} onClick={onNavClick}/>
      </nav>

      {/* Footer */}
      <div style={{ padding: "10px 10px 14px", borderTop: `1px solid ${bdr}` }}>
        <div style={{ padding: "4px 10px 6px" }}>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "9px 12px", borderRadius: 12, background: "none", border: "none",
            color: muted, cursor: "pointer", fontSize: 13.5,
            fontFamily: "DM Sans, sans-serif", fontWeight: 500,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.color = "#ef4444";
            el.style.background = isDark ? "rgba(239,68,68,0.07)" : "rgba(239,68,68,0.05)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.color = muted;
            el.style.background = "transparent";
          }}
        >
          <span style={{ opacity: 0.6, display: "flex" }}><Ic.Logout /></span>
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── Mobile Top Bar ────────────────────────────────────────────────────────────
function MobileTopBar({
  isDark, user, initials, onMenuOpen
}: {
  isDark: boolean; user: any; initials: string; onMenuOpen: () => void;
}) {
  const bg = isDark ? "rgba(10,10,10,0.92)" : "rgba(255,255,255,0.92)";
  const bdr = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      padding: "12px 16px",
      background: bg,
      backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${bdr}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 900, color: "#fff", fontFamily: "Syne, sans-serif",
        }}>C</div>
        <span style={{
          fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 800,
          background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>CrowdSpark</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <DashboardNotificationBell compact />
        <button
          onClick={onMenuOpen}
          style={{
            padding: "7px", borderRadius: 10, border: `1px solid ${bdr}`,
            background: "none", cursor: "pointer", color: "var(--text)",
            display: "flex", alignItems: "center",
          }}
        >
          <Ic.Menu />
        </button>
      </div>
    </div>
  );
}

// ─── Inner Layout ──────────────────────────────────────────────────────────────
function DashboardInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useProfile();
  const { isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Redirect to login once loading completes and there is no token in storage.
  // We intentionally exclude `router` from deps — it is stable in Next.js App Router
  // and including it caused extra effect fires that raced with the profile fetch.
  useEffect(() => {
    if (!loading && !tokenStorage.getAccess()) {
      router.replace("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    if (!loading && user?.roles?.includes("ADMIN")) router.replace("/admin");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await authApi.logout();
    router.push("/login");
  };

  const isCreator = user?.roles?.includes("CREATOR");
  const initials = user?.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  const pageBg = isDark ? "#0a0a0a" : "#f5f5f3";
  const sidebarBg = isDark ? "#0d0d0d" : "#ffffff";
  const sidebarBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: "2.5px solid rgba(255,136,0,0.15)",
          borderTopColor: "#ff8800",
          animation: "spin 0.8s linear infinite",
        }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: pageBg }}>
      {/* ── Desktop Sidebar ── */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 240, flexShrink: 0,
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBdr}`,
          position: "sticky", top: 0, height: "100vh",
          overflowY: "auto",
          boxShadow: isDark ? "none" : "2px 0 20px rgba(0,0,0,0.04)",
        }}
        className="cs-sidebar-desktop"
      >
        <SidebarContent
          isDark={isDark} pathname={pathname} user={user}
          isCreator={!!isCreator} initials={initials} handleLogout={handleLogout}
        />
      </motion.aside>

      {/* ── Mobile Drawer Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 99,
                background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
              }}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed", top: 0, left: 0, bottom: 0, width: 260,
                zIndex: 100, background: sidebarBg,
                borderRight: `1px solid ${sidebarBdr}`,
                overflowY: "auto",
              }}
            >
              <div style={{ position: "absolute", top: 14, right: 14 }}>
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: `1px solid ${sidebarBdr}`,
                    background: "none", cursor: "pointer", color: "var(--text-muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Ic.X />
                </button>
              </div>
              <SidebarContent
                isDark={isDark} pathname={pathname} user={user}
                isCreator={!!isCreator} initials={initials} handleLogout={handleLogout}
                onNavClick={() => setMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Mobile bar */}
        <div className="cs-mobile-topbar">
          <MobileTopBar
            isDark={isDark} user={user} initials={initials}
            onMenuOpen={() => setMobileOpen(true)}
          />
        </div>

        {/* Desktop top strip with notification bell */}
        <div className="cs-desktop-topbar" style={{
          padding: "14px 36px",
          borderBottom: `1px solid ${sidebarBdr}`,
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          gap: 10,
          background: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
        }}>
          <DashboardNotificationBell />
        </div>

        <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          {children}
        </main>
      </div>

      <style>{`
        .cs-sidebar-desktop { display: flex !important; }
        .cs-mobile-topbar   { display: none !important; }
        .cs-desktop-topbar  { display: flex !important; }
        @media (max-width: 768px) {
          .cs-sidebar-desktop { display: none !important; }
          .cs-mobile-topbar   { display: block !important; }
          .cs-desktop-topbar  { display: none !important; }
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
