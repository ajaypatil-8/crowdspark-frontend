"use client";
// ─────────────────────────────────────────────────────────────────────────────
// app/dashboard/page.tsx — Overview
// ─────────────────────────────────────────────────────────────────────────────
import { useProfile } from "@/contexts/ProfileContext";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, error, refetch } = useProfile();

  if (loading) {
    return (
      <div style={{ padding: 48, color: "var(--text-muted)", fontSize: 14 }}>
        Loading your dashboard...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ padding: 48 }}>
        <div
          style={{
            background: "#ff000018",
            border: "1px solid #ff4444",
            borderRadius: 12,
            padding: 24,
            maxWidth: 480,
          }}
        >
          <h2 style={{ color: "#ff6666", margin: "0 0 8px", fontSize: 18 }}>
            Could not load dashboard
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 16px" }}>
            {error || "Unknown error"}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 16px" }}>
            Make sure the backend is running at{" "}
            <code style={{ color: "#ff9944" }}>http://localhost:8080/crowdspark</code>
          </p>
          <button
            onClick={refetch}
            style={{
              padding: "10px 20px",
              background: "var(--accent, #ff6b00)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isCreator = user.roles?.includes("CREATOR");

  const stats = [
    { label: "Projects Backed", value: user.totalProjectsBacked ?? 0, icon: "💚" },
    { label: "Total Backed", value: `₹${(user.totalAmountBacked ?? 0).toLocaleString()}`, icon: "💰" },
    { label: "Projects Created", value: user.totalProjectsCreated ?? 0, icon: "🚀" },
    { label: "Funds Raised", value: `₹${(user.totalFundsRaised ?? 0).toLocaleString()}`, icon: "📈" },
  ];

  return (
    <div style={{ padding: "40px 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: 32,
            fontWeight: 700,
            color: "var(--text)",
            margin: "0 0 8px",
          }}
        >
          Welcome back, {user.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, margin: 0 }}>
          Here&apos;s what&apos;s happening with your account
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 20,
          marginBottom: 40,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "#111",
              border: "1px solid #1e1e1e",
              borderRadius: 12,
              padding: "24px 20px",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "var(--text)",
                fontFamily: "Syne, sans-serif",
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Profile completeness */}
      <div
        style={{
          background: "#111",
          border: "1px solid #1e1e1e",
          borderRadius: 12,
          padding: 28,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", margin: "0 0 16px" }}>
          Profile status
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <StatusBadge label="Email" verified={user.emailVerified} />
          <StatusBadge label="Phone" verified={user.phoneVerified} />
          <StatusBadge label="KYC" verified={user.kycVerified} />
          <StatusBadge
            label="Creator"
            verified={isCreator}
            link={!isCreator ? "/dashboard/become-creator" : undefined}
          />
        </div>
      </div>

      {/* Become creator CTA */}
      {!isCreator && (
        <div
          style={{
            background: "linear-gradient(135deg, #ff6b0018, #ffcc0008)",
            border: "1px solid #ff6b0033",
            borderRadius: 12,
            padding: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ color: "var(--accent, #ff6b00)", fontWeight: 700, fontSize: 18, margin: "0 0 6px" }}>
              Ready to create your campaign?
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
              Complete KYC verification to start raising funds on CrowdSpark
            </p>
          </div>
          <Link
            href="/dashboard/become-creator"
            style={{
              padding: "12px 24px",
              background: "var(--accent, #ff6b00)",
              color: "#fff",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Apply now →
          </Link>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  label,
  verified,
  link,
}: {
  label: string;
  verified: boolean;
  link?: string;
}) {
  const content = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 500,
        background: verified ? "#00ff8818" : "#ffffff0d",
        color: verified ? "#00cc66" : "var(--text-muted)",
        border: `1px solid ${verified ? "#00cc6633" : "#333"}`,
        textDecoration: "none",
        cursor: link ? "pointer" : "default",
      }}
    >
      {verified ? "✓" : "○"} {label}
    </span>
  );

  return link ? <a href={link}>{content}</a> : content;
}