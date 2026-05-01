"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { authApi, isLoggedIn } from "@/lib/api";
import {
  LayoutGrid, FolderCheck, FileCheck, Users, LogOut,
  Shield, ArrowLeft, ChevronRight, Activity, Menu, X,
} from "lucide-react";

const ACCENT = "#7c3aed";

const NAV = [
  { href: "/admin",          label: "Overview",   icon: LayoutGrid,   exact: true,  color: "#7c3aed" },
  { href: "/admin/projects", label: "Projects",   icon: FolderCheck,  exact: false, color: "#f59e0b" },
  { href: "/admin/kyc",      label: "KYC Queue",  icon: FileCheck,    exact: false, color: "#34d399" },
  { href: "/admin/users",    label: "Users",      icon: Users,        exact: false, color: "#60a5fa" },
];

function Sidebar({ onClose, mobile = false }: { onClose?: () => void; mobile?: boolean }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user } = useProfile();
  const { isDark } = useTheme();

  const sdBg  = isDark ? "#0d0d0d" : "#ffffff";
  const sdBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const muted = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";

  const initials = user?.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  const handleLogout = async () => {
    await authApi.logout();
    router.push("/login");
  };

  return (
    <div style={{
      width: 240, height: "100vh", background: sdBg,
      borderRight: `1px solid ${sdBdr}`,
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* Top shimmer */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${ACCENT}60,transparent)`, zIndex: 2 }} />
      {/* Ambient orb */}
      <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle,${ACCENT}18 0%,transparent 70%)`, filter: "blur(30px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Logo */}
      <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${sdBdr}`, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 19, fontWeight: 800, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              CrowdSpark
            </span>
          </Link>
          {mobile && (
            <button onClick={onClose} style={{ background: "none", border: "none", color: muted, cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={16} />
            </button>
          )}
        </div>
        <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px", borderRadius: 8, background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
          <Shield size={11} color={ACCENT} />
          <span style={{ fontSize: 10, fontFamily: "DM Sans, sans-serif", fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin Panel</span>
        </div>
      </div>

      {/* User */}
      {user && (
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${sdBdr}`, display: "flex", alignItems: "center", gap: 11, position: "relative", zIndex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: `2px solid ${ACCENT}44`, boxShadow: `0 0 12px ${ACCENT}22` }}>
            {user.profileImageUrl
              ? <img src={user.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${ACCENT},#a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13 }}>{initials}</div>
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px #34d399", animation: "adPulse 1.5s ease-in-out infinite" }} />
              <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700, fontFamily: "DM Sans, sans-serif" }}>Administrator</span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 10px", position: "relative", zIndex: 1, overflowY: "auto" }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 9.5, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.12em", padding: "0 10px", marginBottom: 8 }}>Navigation</p>
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={mobile ? onClose : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 12, color: active ? item.color : muted,
                textDecoration: "none", fontSize: 13.5,
                fontWeight: active ? 700 : 500, fontFamily: "DM Sans, sans-serif",
                transition: "all 0.15s", marginBottom: 3,
                background: active ? `${item.color}12` : "transparent",
                border: `1px solid ${active ? `${item.color}25` : "transparent"}`,
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)";
                  el.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = muted;
                  el.style.background = "transparent";
                }
              }}
            >
              {active && (
                <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 2.5, borderRadius: 2, background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
              )}
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
            </Link>
          );
        })}

        <div style={{ height: 1, background: sdBdr, margin: "14px 0" }} />
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, color: muted, textDecoration: "none", fontSize: 13, fontFamily: "DM Sans, sans-serif", transition: "color 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = muted; }}
        >
          <ArrowLeft size={13} /> Back to site
        </Link>
      </nav>

      {/* Bottom */}
      <div style={{ padding: "10px 10px 16px", borderTop: `1px solid ${sdBdr}`, position: "relative", zIndex: 1 }}>
        <div style={{ padding: "6px 12px", marginBottom: 4 }}><ThemeToggle /></div>
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 10, background: "none", border: "none", color: muted, cursor: "pointer", fontSize: 13.5, fontFamily: "DM Sans, sans-serif", transition: "all 0.15s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = "#ef4444"; el.style.background = "rgba(239,68,68,0.07)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = muted; el.style.background = "transparent"; }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      <style>{`@keyframes adPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}`}</style>
    </div>
  );
}

function AdminInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useProfile();
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn()) { router.replace("/login"); return; }
      if (user && !user.roles?.includes("ADMIN")) { router.replace("/dashboard"); }
    }
  }, [loading, user, router]);

  const pgBg = isDark ? "#0a0a0a" : "#f6f6f6";

  if (!mounted || loading) {
    return (
      <div style={{ minHeight: "100vh", background: pgBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${ACCENT}30`, borderTopColor: ACCENT, animation: "adSpin 0.8s linear infinite" }} />
        <style>{`@keyframes adSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: pgBg }}>
      {/* Desktop sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}
        className="ad-sidebar-desktop"
      >
        <Sidebar />
      </motion.div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201 }}
            >
              <Sidebar mobile onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main style={{ flex: 1, overflowX: "hidden", minWidth: 0, position: "relative" }}>
        {/* Mobile topbar */}
        <div className="ad-mobile-bar" style={{
          display: "none", alignItems: "center", gap: 12,
          padding: "14px 18px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
          background: isDark ? "#0d0d0d" : "#fff", position: "sticky", top: 0, zIndex: 50,
        }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Menu size={20} />
          </button>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            CrowdSpark
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 8, background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
            <Shield size={10} color={ACCENT} />
            <span style={{ fontSize: 10, color: ACCENT, fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>ADMIN</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
        >
          {children}
        </motion.div>
      </main>

      <style>{`
        @media(max-width:768px){
          .ad-sidebar-desktop{display:none!important;}
          .ad-mobile-bar{display:flex!important;}
        }
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
