"use client";
import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/contexts/ThemeContext";
import { calcCompletion } from "@/lib/profile";

const IcHeart = () => (
  <svg width="17" height="17" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const IcCoin = () => (
  <svg width="17" height="17" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v1m0 6v1M9.5 10.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 2-5 2-5 4 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5"/>
  </svg>
);
const IcRocket = () => (
  <svg width="17" height="17" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
  </svg>
);
const IcChart = () => (
  <svg width="17" height="17" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round"
    strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IcCheck = () => (
  <svg width="10" height="10" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round"
    strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcCircle = () => (
  <svg width="9" height="9" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
  </svg>
);
const IcArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IcUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IcGear = () => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
const IcBookmark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
  </svg>
);
const IcZap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IcTriangle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

function StatCard({
  icon,
  label,
  value,
  accentR,
  accentG,
  accentB,
  delay,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accentR: number;
  accentG: number;
  accentB: number;
  delay: number;
  isDark: boolean;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(
      () => setVisible(true),
      delay,
    );
    return () => clearTimeout(t);
  }, [delay]);

  const accent =
    `rgb(${accentR},${accentG},${accentB})`;
  const accentBg =
    isDark
      ? `rgba(${accentR},${accentG},${accentB},0.1)`
      : `rgba(${accentR},${accentG},${accentB},0.08)`;
  const accentBdr =
    `rgba(${accentR},${accentG},${accentB},0.2)`;

  return (
    <div
      style={{
        borderRadius: 16,
        padding: "20px 22px",
        background: isDark
          ? "rgba(255,255,255,0.03)"
          : "#ffffff",
        border: `1px solid ${
          isDark
            ? "rgba(255,255,255,0.07)"
            : "rgba(0,0,0,0.07)"
        }`,
        boxShadow: isDark
          ? "none"
          : "0 2px 14px rgba(0,0,0,0.04)",
        transform: visible
          ? "translateY(0)"
          : "translateY(16px)",
        opacity: visible ? 1 : 0,
        transition:
          "transform 0.4s cubic-bezier(.22,.68,0,1.2),opacity 0.3s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg,transparent,${accentBdr},transparent)`,
        }}
      />
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: accentBg,
          border: `1px solid ${accentBdr}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
          color: accent,
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 800,
          fontSize: 26,
          color: "var(--text)",
          margin: "0 0 4px",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 12.5,
          color: "var(--text-muted)",
          margin: 0,
        }}
      >
        {label}
      </p>
    </div>
  );
}

function StatusRow({
  label,
  verified,
  link,
  isDark,
}: {
  label: string;
  verified: boolean;
  link?: string;
  isDark: boolean;
}) {
  const inner = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 13px",
        borderRadius: 10,
        background: isDark
          ? "rgba(255,255,255,0.025)"
          : "rgba(0,0,0,0.025)",
        border: `1px solid ${
          verified
            ? "rgba(52,211,153,0.22)"
            : isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.06)"
        }`,
        cursor: link ? "pointer" : "default",
        transition:
          "border-color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (link) {
          (
            e.currentTarget as HTMLDivElement
          ).style.background = isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(0,0,0,0.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (link) {
          (
            e.currentTarget as HTMLDivElement
          ).style.background = isDark
            ? "rgba(255,255,255,0.025)"
            : "rgba(0,0,0,0.025)";
        }
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: verified
              ? "rgba(52,211,153,0.12)"
              : isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.05)",
            border: `1px solid ${
              verified
                ? "rgba(52,211,153,0.3)"
                : isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)"
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: verified
              ? "#34d399"
              : "var(--text-muted)",
          }}
        >
          {verified ? <IcCheck /> : <IcCircle />}
        </div>
        <span
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13.5,
            fontWeight: 500,
            color: "var(--text)",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: verified
              ? "#34d399"
              : "var(--text-muted)",
          }}
        >
          {verified ? "Verified" : "Not verified"}
        </span>
        {link && (
          <span
            style={{
              color: "var(--text-muted)",
              opacity: 0.5,
              display: "flex",
            }}
          >
            <IcArrow />
          </span>
        )}
      </div>
    </div>
  );

  return link ? (
    <Link
      href={link}
      style={{ textDecoration: "none", display: "block" }}
    >
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  );
}

function QuickAction({
  icon,
  label,
  sub,
  href,
  accent,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  href: string;
  accent: string;
  isDark: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 11,
        border: `1px solid ${
          isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.05)"
        }`,
        textDecoration: "none",
        transition: "all 0.15s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        const el =
          e.currentTarget as HTMLAnchorElement;
        el.style.background = isDark
          ? "rgba(255,255,255,0.04)"
          : "rgba(0,0,0,0.025)";
        el.style.borderColor = isDark
          ? "rgba(255,255,255,0.1)"
          : "rgba(0,0,0,0.1)";
        el.style.transform = "translateX(3px)";
      }}
      onMouseLeave={(e) => {
        const el =
          e.currentTarget as HTMLAnchorElement;
        el.style.background = "transparent";
        el.style.borderColor = isDark
          ? "rgba(255,255,255,0.05)"
          : "rgba(0,0,0,0.05)";
        el.style.transform = "translateX(0)";
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--text)",
            margin: 0,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 11.5,
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          {sub}
        </p>
      </div>
      <span
        style={{
          color: "var(--text-muted)",
          opacity: 0.38,
          flexShrink: 0,
          display: "flex",
        }}
      >
        <IcArrow />
      </span>
    </Link>
  );
}

function SectionCard({
  title,
  children,
  isDark,
}: {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        background: isDark
          ? "rgba(255,255,255,0.03)"
          : "#ffffff",
        border: `1px solid ${
          isDark
            ? "rgba(255,255,255,0.07)"
            : "rgba(0,0,0,0.07)"
        }`,
        boxShadow: isDark
          ? "none"
          : "0 2px 14px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "13px 18px",
          borderBottom: `1px solid ${
            isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)"
          }`,
          background: isDark
            ? "rgba(255,255,255,0.015)"
            : "rgba(0,0,0,0.01)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: 1,
            background:
              "linear-gradient(90deg,transparent,rgba(255,140,0,0.4),transparent)",
          }}
        />
        <p
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 13.5,
            color: "var(--text)",
            margin: 0,
          }}
        >
          {title}
        </p>
      </div>
      <div style={{ padding: "14px 16px" }}>
        {children}
      </div>
    </div>
  );
}

function PageSkeleton({ isDark }: { isDark: boolean }) {
  const b = isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.05)";
  return (
    <div
      style={{
        padding: "40px 36px 60px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            width: 140,
            height: 12,
            borderRadius: 6,
            background: b,
            marginBottom: 10,
            animation: "ovPulse 2s ease-in-out infinite",
          }}
        />
        <div
          style={{
            width: 280,
            height: 36,
            borderRadius: 10,
            background: b,
            animation: "ovPulse 2s ease-in-out infinite",
          }}
        />
      </div>
      <div
        className="ov-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 118,
              borderRadius: 16,
              background: b,
              animation:
                "ovPulse 2s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          height: 220,
          borderRadius: 18,
          background: b,
          animation: "ovPulse 2s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes ovPulse {
          0%,100% { opacity: 0.4; }
          50%     { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading, error, refetch } =
    useProfile();
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(
      () => setVisible(true),
      80,
    );
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return <PageSkeleton isDark={isDark} />;
  }

  if (error || !user) {
    return (
      <div
        style={{
          padding: "40px 36px",
          maxWidth: 600,
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderRadius: 14,
            background: "rgba(239,68,68,0.06)",
            border:
              "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                color: "#ef4444",
                marginTop: 2,
              }}
            >
              <IcTriangle />
            </div>
            <div>
              <p
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#ef4444",
                  margin: "0 0 5px",
                }}
              >
                Could not load dashboard
              </p>
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 13.5,
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                {error ??
                  "Unknown error. Check the backend."}
              </p>
            </div>
          </div>
          <button
            onClick={refetch}
            style={{
              padding: "9px 18px",
              background:
                "linear-gradient(135deg,#ff6b00,#ffcc00)",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              cursor: "pointer",
              fontSize: 13.5,
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)",
                animation:
                  "ovShimmer 2.4s ease-in-out infinite",
              }}
            />
            <span style={{ position: "relative" }}>
              Retry
            </span>
          </button>
        </div>
      </div>
    );
  }

  const isCreator = user.roles?.includes("CREATOR");
  const pct = calcCompletion(user);
  const cardBdr = isDark
    ? "rgba(255,255,255,0.07)"
    : "rgba(0,0,0,0.07)";

  const stats = [
    {
      icon: <IcHeart />,
      label: "Projects Backed",
      value: user.totalProjectsBacked ?? 0,
      accentR: 239,
      accentG: 68,
      accentB: 68,
      delay: 100,
    },
    {
      icon: <IcCoin />,
      label: "Total Backed",
      value: `₹${(
        (user.totalAmountBacked ?? 0)
      ).toLocaleString("en-IN")}`,
      accentR: 52,
      accentG: 211,
      accentB: 153,
      delay: 180,
    },
    {
      icon: <IcRocket />,
      label: "Projects Created",
      value: user.totalProjectsCreated ?? 0,
      accentR: 255,
      accentG: 107,
      accentB: 0,
      delay: 260,
    },
    {
      icon: <IcChart />,
      label: "Funds Raised",
      value: `₹${(
        (user.totalFundsRaised ?? 0)
      ).toLocaleString("en-IN")}`,
      accentR: 167,
      accentG: 139,
      accentB: 250,
      delay: 340,
    },
  ];

  const quickActions = [
    {
      icon: <IcUser />,
      label: "Edit profile",
      sub: "Update bio, links & avatar",
      href: "/dashboard/profile",
      accent: "#ff8800",
    },
    {
      icon: <IcGear />,
      label: "Settings",
      sub: "Verification & KYC status",
      href: "/dashboard/settings",
      accent: "#a78bfa",
    },
    {
      icon: <IcBookmark />,
      label: "Saved campaigns",
      sub: "Your bookmarked projects",
      href: "/dashboard/saved",
      accent: "#00d4b8",
    },
    isCreator
      ? {
          icon: <IcZap />,
          label: "My campaigns",
          sub: "Manage your projects",
          href: "/dashboard/my-campaigns",
          accent: "#34d399",
        }
      : {
          icon: <IcRocket />,
          label: "Become a creator",
          sub: "Start raising funds",
          href: "/dashboard/become-creator",
          accent: "#ff8800",
        },
  ];

  return (
    <div
      style={{
        padding: "40px 36px 60px",
        maxWidth: 1100,
        margin: "0 auto",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0)"
          : "translateY(12px)",
        transition:
          "opacity 0.4s, transform 0.4s",
      }}
    >
      <div style={{ marginBottom: 34 }}>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            color: "var(--text-muted)",
            margin: "0 0 6px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(22px,3vw,34px)",
            color: "var(--text)",
            letterSpacing: "-0.03em",
            margin: "0 0 5px",
          }}
        >
          Welcome back,{" "}
          {user.name?.split(" ")[0]} 👋
        </h1>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            color: "var(--text-muted)",
            fontSize: 14,
            margin: 0,
          }}
        >
          {"Here's what's happening with your account"}
        </p>
      </div>

      <div
        className="ov-stats"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {stats.map((s) => (
          <StatCard
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={s.value}
            accentR={s.accentR}
            accentG={s.accentG}
            accentB={s.accentB}
            delay={s.delay}
            isDark={isDark}
          />
        ))}
      </div>

      <div
        className="ov-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <SectionCard
          title="Profile Status"
          isDark={isDark}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: isDark
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(0,0,0,0.07)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 3,
                  background:
                    "linear-gradient(90deg,#ff6b00,#ffcc00)",
                  transition: "width 0.8s ease",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: "#ff8800",
                flexShrink: 0,
              }}
            >
              {pct}%
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <StatusRow
              label="Email"
              verified={user.emailVerified}
              link={
                !user.emailVerified
                  ? "/dashboard/settings"
                  : undefined
              }
              isDark={isDark}
            />
            <StatusRow
              label="Phone"
              verified={user.phoneVerified ?? false}
              isDark={isDark}
            />
            <StatusRow
              label="KYC"
              verified={user.kycVerified ?? false}
              link={
                !user.kycVerified
                  ? "/dashboard/settings"
                  : undefined
              }
              isDark={isDark}
            />
            <StatusRow
              label="Creator"
              verified={!!isCreator}
              link={
                !isCreator
                  ? "/dashboard/become-creator"
                  : undefined
              }
              isDark={isDark}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Quick Actions"
          isDark={isDark}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {quickActions.map((a) => (
              <QuickAction
                key={a.href}
                icon={a.icon}
                label={a.label}
                sub={a.sub}
                href={a.href}
                accent={a.accent}
                isDark={isDark}
              />
            ))}
          </div>
        </SectionCard>
      </div>

      {!isCreator && (
        <div
          style={{
            borderRadius: 18,
            padding: "22px 28px",
            background: isDark
              ? "rgba(255,107,0,0.06)"
              : "rgba(255,107,0,0.04)",
            border:
              "1px solid rgba(255,107,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(255,107,0,0.08)",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />
          <div>
            <p
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 17,
                color: "var(--text)",
                margin: "0 0 4px",
              }}
            >
              Ready to launch your campaign?
            </p>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 13.5,
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Complete KYC to start raising
              funds on CrowdSpark
            </p>
          </div>
          <Link
            href="/dashboard/become-creator"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 22px",
              borderRadius: 11,
              background:
                "linear-gradient(135deg,#ff6b00,#ffcc00)",
              color: "#fff",
              textDecoration: "none",
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 13.5,
              boxShadow:
                "0 0 20px rgba(255,100,0,0.3)",
              position: "relative",
              overflow: "hidden",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)",
                animation:
                  "ovShimmer 2.4s ease-in-out infinite",
              }}
            />
            <span style={{ position: "relative" }}>
              Apply now →
            </span>
          </Link>
        </div>
      )}

      <style>{`
        @keyframes ovShimmer {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(200%); }
          100% { transform: translateX(200%); }
        }
        @keyframes ovPulse {
          0%,100% { opacity: 0.4; }
          50%     { opacity: 0.9; }
        }
        @media (max-width: 900px) {
          .ov-stats {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 700px) {
          .ov-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .ov-stats {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}