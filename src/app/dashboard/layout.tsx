"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import { authApi, type UserProfile } from "@/lib/api";
import { calcCompletion, getBadge } from "@/lib/profile";
import { ProfileCtx } from "@/hooks/useProfileContext";

export { useProfile } from "@/hooks/useProfileContext";
export {
  calcCompletion,
  getBadge,
  COMPLETION_FIELDS,
} from "@/lib/profile";
export type { UserProfile } from "@/lib/api";

const NAV = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: "/dashboard/profile",
    label: "My Profile",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    href: "/dashboard/backed",
    label: "Backed Projects",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
  {
    href: "/dashboard/saved",
    label: "Saved",
    icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
] as const;

function CompletionRing({
  pct,
  size = 44,
}: {
  pct: number;
  size?: number;
}) {
  const { isDark } = useTheme();
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const badge = getBadge(pct);
  const track = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.08)";

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
      role="img"
      aria-label={`Profile ${pct}% complete`}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={3}
          stroke={track}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={3}
          stroke={badge.color}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
          color: badge.color,
          fontFamily: "Syne, sans-serif",
        }}
      >
        {pct}
      </span>
    </div>
  );
}

function UserCardSkeleton() {
  const { isDark } = useTheme();
  const bg = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.08)";
  const bgLight = isDark
    ? "rgba(255,255,255,0.05)"
    : "rgba(0,0,0,0.05)";

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
      }}
    >
      <div
        className="dash-skeleton"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: bg,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          className="dash-skeleton"
          style={{
            height: 10,
            borderRadius: 5,
            background: bg,
            marginBottom: 6,
            width: "70%",
          }}
        />
        <div
          className="dash-skeleton"
          style={{
            height: 8,
            borderRadius: 4,
            background: bgLight,
            width: "50%",
          }}
        />
      </div>
    </div>
  );
}

function Sidebar({
  user,
  loading,
  error,
  pct,
  isCreator,
  pathname,
  onLogout,
  onRetry,
}: {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  pct: number;
  isCreator: boolean;
  pathname: string;
  onLogout: () => void;
  onRetry: () => void;
}) {
  const { isDark } = useTheme();
  const badge = getBadge(pct);

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/dashboard" &&
      pathname.startsWith(href + "/")) ||
    (href !== "/dashboard" && pathname === href);

  const creatorActive =
    pathname === "/creator" ||
    pathname.startsWith("/creator/");

  return (
    <aside
      className="dash-sidebar"
      role="complementary"
      aria-label="Dashboard sidebar"
    >
      <div
        aria-hidden="true"
        style={{
          height: 2,
          background:
            "linear-gradient(90deg, transparent, #ff6b00 30%, #ffcc00 60%, transparent)",
          flexShrink: 0,
        }}
      />

      <div style={{ padding: "20px 20px 0" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background:
                "linear-gradient(135deg, var(--accent), #ff8800)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(255,120,0,0.4)",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill={isDark ? "#050508" : "#fff"}
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            Crowd
            <span style={{ color: "var(--accent)" }}>
              Spark
            </span>
          </span>
        </Link>
      </div>

      <div className="dash-user-card">
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,140,0,0.5), transparent)",
          }}
        />

        {loading ? (
          <UserCardSkeleton />
        ) : error ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <p
              style={{
                fontSize: 12,
                color: "#ef4444",
                fontFamily: "DM Sans, sans-serif",
                margin: "0 0 8px",
              }}
            >
              Failed to load profile
            </p>
            <button
              onClick={onRetry}
              style={{
                padding: "4px 12px",
                borderRadius: 8,
                border: "1px solid rgba(239,68,68,0.3)",
                background: "transparent",
                color: "#ef4444",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              {user?.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt={`${user.name ?? "User"}'s avatar`}
                  width={40}
                  height={40}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid rgba(255,120,0,0.4)",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background:
                      "linear-gradient(135deg, var(--accent), #ff8800)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: isDark ? "#050508" : "#fff",
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: "var(--text)",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.name}
                </p>
                <p
                  style={{
                    fontSize: 11.5,
                    color: "var(--text-muted)",
                    fontFamily: "DM Sans, sans-serif",
                    margin: 0,
                  }}
                >
                  @{user?.username}
                </p>
              </div>
              <CompletionRing pct={pct} />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: `${badge.color}18`,
                  border: `1px solid ${badge.color}40`,
                  fontSize: 11,
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  color: badge.color,
                }}
              >
                {badge.emoji} {badge.label}
              </span>
              <span
                className={
                  isCreator
                    ? "dash-role-badge creator"
                    : "dash-role-badge"
                }
              >
                {isCreator ? "Creator" : "Backer"}
              </span>
            </div>
          </>
        )}
      </div>

      <nav
        aria-label="Dashboard navigation"
        style={{ flex: 1, padding: "0 8px" }}
      >
        {NAV.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`dash-nav-link ${active ? "active" : ""}`}
            >
              <svg
                width="17"
                height="17"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={item.icon}
                />
              </svg>
              {item.label}
            </Link>
          );
        })}

        {!isCreator && !loading && (
          <div className="dash-creator-cta">
            <p
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--text)",
                margin: "0 0 4px",
              }}
            >
              🚀 Become a Creator
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "DM Sans, sans-serif",
                margin: "0 0 8px",
                lineHeight: 1.5,
              }}
            >
              Launch campaigns and raise funds.
            </p>
            <Link
              href="/dashboard/settings"
              className="dash-creator-cta-btn"
            >
              Apply now →
            </Link>
          </div>
        )}

        {isCreator && !loading && (
          <Link
            href="/creator"
            aria-current={creatorActive ? "page" : undefined}
            className={`dash-nav-link dash-creator-link ${
              creatorActive ? "active" : ""
            }`}
          >
            <svg
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Creator Dashboard
          </Link>
        )}
      </nav>

      <div className="dash-logout-section">
        <button onClick={onLogout} className="dash-logout-btn">
          <svg
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const { isDark } = useTheme();

  const [user, setUser]         = useState<UserProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const fetchUser = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await authApi.me();
      setUser(data);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 401) {
        router.push("/login");
        return;
      }
      setError("Failed to load profile. Try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  // close sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  // focus first element when opened
  useEffect(() => {
    if (mobileOpen && sidebarRef.current) {
      const el = sidebarRef.current.querySelector(
        "a, button"
      ) as HTMLElement | null;
      el?.focus();
    }
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear session anyway
    }
    router.push("/login");
  };

  const pct       = user ? calcCompletion(user) : 0;
  const isCreator = user?.roles?.includes("CREATOR") ?? false;

  const sidebarProps = {
    user,
    loading,
    error,
    pct,
    isCreator,
    pathname,
    onLogout: handleLogout,
    onRetry: fetchUser,
  };

  return (
    <ProfileCtx.Provider
      value={{ user, loading, error, refetch: fetchUser }}
    >
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--bg)",
        }}
      >
        <div className="dash-sidebar-desktop">
          <Sidebar {...sidebarProps} />
        </div>

        <button
          className="dash-hamburger"
          onClick={() => setMobileOpen(v => !v)}
          aria-label={
            mobileOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        {mobileOpen && (
          <>
            <div
              className="dash-overlay"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div
              ref={sidebarRef}
              id="mobile-sidebar"
              role="dialog"
              aria-label="Navigation menu"
              aria-modal="true"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 50,
              }}
            >
              <Sidebar {...sidebarProps} />
            </div>
          </>
        )}

        <main
          id="dashboard-content"
          style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}
        >
          {children}
        </main>
      </div>

      <style>{`
        @keyframes dashPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        .dash-skeleton {
          animation: dashPulse 2s ease-in-out infinite;
        }

        .dash-sidebar {
          width: 248px;
          flex-shrink: 0;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          background: ${
            isDark
              ? "rgba(8,8,14,0.96)"
              : "rgba(255,255,255,0.96)"
          };
          backdrop-filter: blur(24px);
          border-right: 1px solid ${
            isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.06)"
          };
          box-shadow: ${
            isDark
              ? "4px 0 24px rgba(0,0,0,0.3)"
              : "4px 0 24px rgba(0,0,0,0.06)"
          };
          overflow-y: auto;
          z-index: 40;
        }

        .dash-user-card {
          margin: 16px 12px;
          padding: 14px;
          border-radius: 16px;
          background: ${
            isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.03)"
          };
          border: 1px solid ${
            isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.06)"
          };
          position: relative;
          overflow: hidden;
        }

        .dash-role-badge {
          font-size: 10px;
          font-family: "DM Sans", sans-serif;
          font-weight: 600;
          color: var(--text-muted);
          padding: 2px 7px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .dash-role-badge.creator {
          color: #a78bfa;
          background: rgba(167,139,250,0.12);
          border: 1px solid rgba(167,139,250,0.3);
        }

        .dash-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          margin-bottom: 2px;
          text-decoration: none;
          background: transparent;
          color: var(--text-muted);
          font-family: "DM Sans", sans-serif;
          font-weight: 500;
          font-size: 14px;
          transition: background 0.15s, color 0.15s;
          border-left: 2px solid transparent;
        }
        .dash-nav-link:hover {
          background: ${
            isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.03)"
          };
          color: var(--text);
        }
        .dash-nav-link.active {
          background: ${
            isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.05)"
          };
          color: var(--accent);
          font-weight: 600;
          border-left-color: var(--accent);
        }
        .dash-nav-link.active:hover {
          color: var(--accent);
        }

        .dash-creator-link {
          margin-top: 8px;
          border: 1px solid rgba(167,139,250,0.2);
          border-left: 2px solid transparent;
        }
        .dash-creator-link.active {
          background: rgba(167,139,250,0.1);
          color: #a78bfa;
          border-left-color: #a78bfa;
        }

        .dash-creator-cta {
          margin: 10px 4px;
          padding: 12px;
          border-radius: 14px;
          background: linear-gradient(
            135deg,
            rgba(255,107,0,0.1),
            rgba(167,139,250,0.07)
          );
          border: 1px solid rgba(255,107,0,0.2);
        }
        .dash-creator-cta-btn {
          display: block;
          text-align: center;
          padding: 6px 0;
          border-radius: 8px;
          background: linear-gradient(135deg, #ff6b00, #ffaa00);
          color: #fff;
          font-size: 11px;
          font-family: "Syne", sans-serif;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 0 12px rgba(255,100,0,0.3);
          transition: box-shadow 0.18s, transform 0.18s;
        }
        .dash-creator-cta-btn:hover {
          box-shadow: 0 0 18px rgba(255,100,0,0.5);
          transform: translateY(-1px);
        }

        .dash-logout-section {
          padding: 12px 8px 20px;
          border-top: 1px solid ${
            isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)"
          };
        }
        .dash-logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          font-family: "DM Sans", sans-serif;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.15s, color 0.15s;
        }
        .dash-logout-btn:hover {
          background: rgba(239,68,68,0.08);
          color: #ef4444;
        }

        .dash-hamburger {
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 60;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: ${
            isDark
              ? "rgba(8,8,14,0.9)"
              : "rgba(255,255,255,0.9)"
          };
          backdrop-filter: blur(12px);
          border: 1px solid ${
            isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.08)"
          };
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text);
          box-shadow: 0 0 0 1px rgba(255,100,0,0.15);
        }

        .dash-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 49;
        }

        @media (max-width: 768px) {
          .dash-sidebar-desktop { display: none !important; }
          .dash-hamburger       { display: flex !important; }
        }
      `}</style>
    </ProfileCtx.Provider>
  );
}