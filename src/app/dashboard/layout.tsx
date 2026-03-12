"use client";
// ─────────────────────────────────────────────────────────────────────────────
// app/dashboard/layout.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { authApi, isLoggedIn } from "@/lib/api";

// ─── Sidebar inner (needs profile context) ───────────────────────────────────

function DashboardInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useProfile();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn()) {
      router.replace("/login");
    }
  }, [loading, router]);

  const handleLogout = async () => {
    await authApi.logout();
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "⊞" },
    { href: "/dashboard/profile", label: "Profile", icon: "👤" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
    { href: "/dashboard/backed", label: "Backed", icon: "💚" },
    { href: "/dashboard/saved", label: "Saved", icon: "🔖" },
    // Only show if CREATOR role
    ...(user?.roles?.includes("CREATOR")
      ? [{ href: "/dashboard/my-campaigns", label: "My Campaigns", icon: "🚀" }]
      : [{ href: "/dashboard/become-creator", label: "Become Creator", icon: "✨" }]),
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          borderRight: "1px solid #1e1e1e",
          padding: "32px 0",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 24px 24px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: "var(--accent, #ff6b00)",
              }}
            >
              CrowdSpark
            </span>
          </Link>
        </div>

        {/* User info */}
        {user && (
          <div style={{ padding: "0 24px 24px", borderBottom: "1px solid #1e1e1e" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: user.profileImageUrl ? "none" : "var(--accent, #ff6b00)",
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", margin: 0 }}>
              {user.name}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
              @{user.username}
            </p>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {user.roles?.map((r) => (
                <span
                  key={r}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: r === "CREATOR" ? "#ff6b0033" : "#ffffff11",
                    color: r === "CREATOR" ? "var(--accent, #ff6b00)" : "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                color: "var(--text-muted)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "0 12px" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "none",
              border: "none",
              borderRadius: 8,
              color: "var(--text-muted)",
              cursor: "pointer",
              textAlign: "left",
              fontSize: 14,
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
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