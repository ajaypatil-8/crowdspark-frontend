"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { authApi, isLoggedIn } from "@/lib/api";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcShield    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcProject   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>;
const IcKyc       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IcUsers     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IcLogout    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcGrid      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;

const NAV = [
  { href: "/admin",          label: "Overview",  icon: <IcGrid />,    exact: true  },
  { href: "/admin/projects", label: "Projects",  icon: <IcProject />, exact: false },
  { href: "/admin/kyc",      label: "KYC Queue", icon: <IcKyc />,     exact: false },
  { href: "/admin/users",    label: "Users",     icon: <IcUsers />,   exact: false },
];

function AdminInner({ children }: { children: ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, loading } = useProfile();
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn()) { router.replace("/login"); return; }
      if (user && !user.roles?.includes("ADMIN")) {
        // non-admin tried to access /admin → kick to their dashboard
        router.replace("/dashboard");
      }
    }
  }, [loading, user, router]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    router.push("/login");
  };

  const initials = user?.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  const sdBg  = isDark ? "#0e0e0e" : "#ffffff";
  const sdBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const pgBg  = isDark ? "#0a0a0a" : "#f4f4f2";
  const muted = isDark ? "rgba(255,255,255,0.36)" : "rgba(0,0,0,0.38)";
  const ACCENT = "#7c3aed"; // purple for admin — different from user orange

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: pgBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(124,58,237,0.2)", borderTopColor: ACCENT, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: pgBg }}>
      {/* Sidebar */}
      <aside style={{
        width: 230, borderRight: `1px solid ${sdBdr}`, display: "flex", flexDirection: "column",
        flexShrink: 0, background: sdBg, position: "sticky", top: 0, height: "100vh", overflowY: "auto",
        transform: visible ? "translateX(0)" : "translateX(-18px)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(.22,.68,0,1.2),opacity 0.3s",
      }}>
        {/* Logo + Admin badge */}
        <div style={{ padding: "22px 18px 18px", borderBottom: `1px solid ${sdBdr}` }}>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              CrowdSpark
            </span>
          </Link>
          <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 6, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.28)" }}>
            <IcShield />
            <span style={{ fontSize: 10, fontFamily: "DM Sans, sans-serif", fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin Panel</span>
          </div>
        </div>

        {/* User info */}
        {user && (
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${sdBdr}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: `2px solid ${ACCENT}44` }}>
              {user.profileImageUrl
                ? <img src={user.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${ACCENT},#a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 12 }}>{initials}</div>
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
              <p style={{ fontSize: 11, color: ACCENT, margin: "2px 0 0", fontWeight: 600 }}>Administrator</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 9, padding: "9px 10px",
                borderRadius: 10, color: active ? ACCENT : muted, textDecoration: "none",
                fontSize: 13.5, fontWeight: active ? 600 : 500, fontFamily: "DM Sans, sans-serif",
                transition: "all 0.15s", marginBottom: 2,
                background: active ? `${ACCENT}14` : "transparent",
                borderLeft: `2px solid ${active ? ACCENT : "transparent"}`,
              }}
                onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.color = isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.55)"; (e.currentTarget as HTMLAnchorElement).style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"; } }}
                onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.color = muted; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; } }}
              >
                <span style={{ opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          {/* Divider + back to site */}
          <div style={{ margin: "12px 0", height: 1, background: sdBdr }} />
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 10, color: muted, textDecoration: "none", fontSize: 13, fontFamily: "DM Sans, sans-serif", opacity: 0.7 }}>
            ← Back to site
          </Link>
        </nav>

        {/* Bottom */}
        <div style={{ padding: "10px 10px 14px", borderTop: `1px solid ${sdBdr}` }}>
          <div style={{ padding: "6px 10px", marginBottom: 4 }}><ThemeToggle /></div>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 12px", borderRadius: 10, background: "none", border: "none", color: muted, cursor: "pointer", fontSize: 13.5, fontFamily: "DM Sans, sans-serif", transition: "color 0.15s, background 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(239,68,68,0.07)" : "rgba(239,68,68,0.05)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = muted; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <span style={{ opacity: 0.65 }}><IcLogout /></span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {children}
      </main>
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
