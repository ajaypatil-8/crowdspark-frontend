"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { authApi, type UserProfile } from "@/lib/api";

/* ── re-export types needed by child pages ──────────────────── */
export type { UserProfile };

/* ── completion config ──────────────────────────────────────── */
export const COMPLETION_FIELDS: {
  label: string; weight: number; check: (u: UserProfile) => boolean;
}[] = [
  { label: "Profile photo",  weight: 15, check: u => !!u.profileImageUrl },
  { label: "Banner image",   weight:  5, check: u => !!u.bannerImageUrl  },
  { label: "Bio",            weight: 10, check: u => !!u.bio             },
  { label: "About me",       weight: 10, check: u => !!u.about           },
  { label: "Email verified", weight: 15, check: u => u.emailVerified      },
  { label: "Location",       weight: 10, check: u => !!u.city            },
  { label: "Social link",    weight:  5, check: u => !!(u.linkedinUrl || u.twitterUrl || u.instagramUrl || u.websiteUrl) },
  { label: "Profession",     weight: 10, check: u => !!u.profession      },
  { label: "Date of birth",  weight:  5, check: u => !!u.dateOfBirth     },
  { label: "Gender",         weight:  5, check: u => !!u.gender          },
  { label: "Interests",      weight: 10, check: u => (u.interestedCategories?.length ?? 0) > 0 },
];

export const calcCompletion = (u: UserProfile) =>
  COMPLETION_FIELDS.reduce((sum, f) => sum + (f.check(u) ? f.weight : 0), 0);

export const getBadge = (pct: number) => {
  if (pct === 100) return { label: "Champion",    emoji: "⚡", color: "#ff8800" };
  if (pct >= 80)   return { label: "Advocate",    emoji: "🔥", color: "#ff6b00" };
  if (pct >= 60)   return { label: "Contributor", emoji: "🌟", color: "#a78bfa" };
  if (pct >= 30)   return { label: "Explorer",    emoji: "🧭", color: "#00f5d4" };
  return               { label: "Newcomer",    emoji: "🌱", color: "#34d399" };
};

/* ── profile context ────────────────────────────────────────── */
type ProfileCtxType = {
  user: UserProfile | null;
  loading: boolean;
  refetch: () => Promise<void>;
};
const ProfileCtx = createContext<ProfileCtxType>({
  user: null, loading: true, refetch: async () => {},
});
export const useProfile = () => useContext(ProfileCtx);

/* ── nav items ──────────────────────────────────────────────── */
const NAV = [
  { href: "/dashboard",          label: "Overview",        icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/dashboard/profile",  label: "My Profile",      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { href: "/dashboard/backed",   label: "Backed Projects", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { href: "/dashboard/saved",    label: "Saved",           icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
  { href: "/dashboard/settings", label: "Settings",        icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

/* ── completion ring ────────────────────────────────────────── */
function CompletionRing({ pct, size = 44 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const badge = getBadge(pct);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={3} stroke="rgba(255,255,255,0.08)" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={3}
          stroke={badge.color} strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 700, color: badge.color, fontFamily: "Syne, sans-serif",
      }}>{pct}</span>
    </div>
  );
}

/* ── layout ─────────────────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { isDark } = useTheme();
  const [user,        setUser]        = useState<UserProfile | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data);
    } catch (err: any) {
      if (err?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleLogout = async () => {
    await authApi.logout();
    router.push("/login");
  };

  const pct       = user ? calcCompletion(user) : 0;
  const badge     = getBadge(pct);
  const isCreator = user?.roles?.includes("CREATOR");

  function Sidebar() {
    return (
      <aside style={{
        width: 248, flexShrink: 0, height: "100vh", position: "sticky", top: 0,
        display: "flex", flexDirection: "column",
        background: isDark ? "rgba(8,8,14,0.96)" : "rgba(255,255,255,0.96)",
        backdropFilter: "blur(24px)",
        borderRight: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
        boxShadow: isDark ? "4px 0 24px rgba(0,0,0,0.3)" : "4px 0 24px rgba(0,0,0,0.06)",
        overflowY: "auto", zIndex: 40,
      }}>
        {/* fire top line */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #ff6b00 30%, #ffcc00 60%, transparent)", flexShrink: 0 }} />

        {/* logo */}
        <div style={{ padding: "20px 20px 0" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, var(--accent), #ff8800)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 12px rgba(255,120,0,0.4)",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={isDark ? "#050508" : "#fff"}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", letterSpacing: "-0.02em" }}>
              Crowd<span style={{ color: "var(--accent)" }}>Spark</span>
            </span>
          </Link>
        </div>

        {/* user card */}
        <div style={{
          margin: "16px 12px", padding: "14px", borderRadius: 16,
          background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
          border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,140,0,0.5), transparent)" }} />

          {loading ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.08)", marginBottom: 6, width: "70%" }} />
                <div style={{ height: 8,  borderRadius: 4, background: "rgba(255,255,255,0.05)", width: "50%" }} />
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="avatar" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,120,0,0.4)", flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, var(--accent), #ff8800)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
                    color: isDark ? "#050508" : "#fff",
                  }}>
                    {user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.name}
                  </p>
                  <p style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>
                    @{user?.username}
                  </p>
                </div>
                <CompletionRing pct={pct} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "3px 8px", borderRadius: 999,
                  background: `${badge.color}18`, border: `1px solid ${badge.color}40`,
                  fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, color: badge.color,
                }}>
                  {badge.emoji} {badge.label}
                </span>
                <span style={{
                  fontSize: 10, fontFamily: "DM Sans, sans-serif", fontWeight: 600,
                  color: isCreator ? "#a78bfa" : "var(--text-muted)",
                  padding: "2px 7px", borderRadius: 999,
                  background: isCreator ? "rgba(167,139,250,0.12)" : "transparent",
                  border: isCreator ? "1px solid rgba(167,139,250,0.3)" : "none",
                  textTransform: "uppercase", letterSpacing: "0.1em",
                }}>
                  {isCreator ? "Creator" : "Backer"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* nav */}
        <nav style={{ flex: 1, padding: "0 8px" }}>
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 12, marginBottom: 2,
                textDecoration: "none",
                background: active ? (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)") : "transparent",
                color: active ? "var(--accent)" : "var(--text-muted)",
                fontFamily: "DM Sans, sans-serif", fontWeight: active ? 600 : 500, fontSize: 14,
                transition: "all 0.15s",
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
              }}
                onMouseEnter={e => { if (!active) { const a = e.currentTarget as HTMLAnchorElement; a.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"; a.style.color = "var(--text)"; } }}
                onMouseLeave={e => { if (!active) { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "transparent"; a.style.color = "var(--text-muted)"; } }}
              >
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}

          {/* become creator CTA */}
          {!isCreator && !loading && (
            <div style={{
              margin: "10px 4px", padding: "12px", borderRadius: 14,
              background: "linear-gradient(135deg, rgba(255,107,0,0.1), rgba(167,139,250,0.07))",
              border: "1px solid rgba(255,107,0,0.2)",
            }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: "var(--text)", margin: "0 0 4px" }}>🚀 Become a Creator</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: "0 0 8px", lineHeight: 1.5 }}>
                Launch campaigns and raise funds.
              </p>
              <Link href="/dashboard/settings" style={{
                display: "block", textAlign: "center", padding: "6px 0", borderRadius: 8,
                background: "linear-gradient(135deg, #ff6b00, #ffaa00)",
                color: "#fff", fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700,
                textDecoration: "none", boxShadow: "0 0 12px rgba(255,100,0,0.3)",
              }}>
                Apply now →
              </Link>
            </div>
          )}

          {/* creator dashboard link — only for creators */}
          {isCreator && !loading && (
            <Link href="/creator" style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 12, marginBottom: 2,
              textDecoration: "none",
              background: pathname.startsWith("/creator") ? "rgba(167,139,250,0.1)" : "transparent",
              color: pathname.startsWith("/creator") ? "#a78bfa" : "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: 14,
              transition: "all 0.15s",
              borderLeft: pathname.startsWith("/creator") ? "2px solid #a78bfa" : "2px solid transparent",
              border: "1px solid rgba(167,139,250,0.2)",
              marginTop: 8,
            }}>
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Creator Dashboard
            </Link>
          )}
        </nav>

        {/* logout */}
        <div style={{ padding: "12px 8px 20px", borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)" }}>
          <button onClick={handleLogout} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 12,
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 500,
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(239,68,68,0.08)"; b.style.color = "#ef4444"; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "none"; b.style.color = "var(--text-muted)"; }}
          >
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    );
  }

  return (
    <ProfileCtx.Provider value={{ user, loading, refetch: fetchUser }}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
        <div className="dash-sidebar-desktop"><Sidebar /></div>

        {/* mobile hamburger */}
        <button className="dash-hamburger" onClick={() => setMobileOpen(v => !v)} style={{
          position: "fixed", top: 16, left: 16, zIndex: 60,
          width: 40, height: 40, borderRadius: 12,
          background: isDark ? "rgba(8,8,14,0.9)" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          display: "none", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--text)",
          boxShadow: "0 0 0 1px rgba(255,100,0,0.15)",
        }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileOpen
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>

        {mobileOpen && (
          <>
            <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 49 }} />
            <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50 }}><Sidebar /></div>
          </>
        )}

        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>{children}</main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dash-sidebar-desktop { display: none !important; }
          .dash-hamburger       { display: flex !important; }
        }
      `}</style>
    </ProfileCtx.Provider>
  );
}