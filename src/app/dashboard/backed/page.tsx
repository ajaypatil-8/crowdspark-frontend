"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";

const IcTarget = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IcCoin = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v1m0 6v1M9.5 10.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 2-5 2-5 4 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5"/>
  </svg>
);
const IcRocket = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
  </svg>
);
const IcSearch = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcChart = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IcTriangle = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

function PageSkeleton() {
  const { isDark } = useTheme();
  const b = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  return (
    <div style={{ padding: "40px 32px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ width: 140, height: 12, borderRadius: 6, background: b, marginBottom: 10, animation: "bkpulse 2s ease-in-out infinite" }} />
        <div style={{ width: 280, height: 36, borderRadius: 10, background: b, animation: "bkpulse 2s ease-in-out infinite" }} />
      </div>
      <div style={{ height: 380, borderRadius: 22, background: b, animation: "bkpulse 2s ease-in-out infinite" }} />
      <style>{`@keyframes bkpulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </div>
  );
}

function StatPill({ icon, label, value, accent, isDark }: { icon: React.ReactNode; label: string; value: string; accent: string; isDark: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "14px 20px", borderRadius: 14, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}` }}>
      <div style={{ color: accent }}>{icon}</div>
      <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: accent, lineHeight: 1 }}>{value}</span>
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function EmptyCard({ isDark }: { isDark: boolean }) {
  const card = isDark ? "rgba(255,255,255,0.025)" : "#fff";
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const tips = [
    { icon: <IcSearch s={15} />, accent: "#ff8800", title: "Discover", desc: "Find campaigns you love" },
    { icon: <IcCoin s={15} />, accent: "#34d399", title: "Back", desc: "Contribute any amount" },
    { icon: <IcChart s={15} />, accent: "#a78bfa", title: "Track", desc: "Watch your impact grow" },
  ];
  return (
    <div style={{ borderRadius: 24, padding: "72px 40px", textAlign: "center", position: "relative", overflow: "hidden", background: card, border: `1px solid ${bdr}`, boxShadow: isDark ? "none" : "0 2px 24px rgba(0,0,0,0.05)" }}>
      <div style={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,107,0,0.07)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -70, left: -70, width: 220, height: 220, borderRadius: "50%", background: "rgba(167,139,250,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ width: 72, height: 72, borderRadius: 22, margin: "0 auto 22px", background: isDark ? "rgba(255,107,0,0.08)" : "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800", position: "relative" }}>
        <IcTarget s={30} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "linear-gradient(135deg,rgba(255,107,0,0.14),transparent)", pointerEvents: "none" }} />
      </div>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>No backed projects yet</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: "0 auto 28px", maxWidth: 360, lineHeight: 1.75 }}>
        Discover campaigns that excite you and back the ideas you believe in. Every contribution makes a difference.
      </p>
      <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 0 24px rgba(255,100,0,0.35)", position: "relative", overflow: "hidden" }}>
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "bkshimmer 2.4s ease-in-out infinite" }} />
        <span style={{ position: "relative" }}>Explore campaigns →</span>
      </Link>
      <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 48, flexWrap: "wrap" }}>
        {tips.map(({ icon, accent, title, desc }) => (
          <div key={title} style={{ textAlign: "center" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, margin: "0 auto 8px", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>{icon}</div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: "var(--text)", margin: "0 0 2px" }}>{title}</p>
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BackedPage() {
  const { isDark } = useTheme();
  const { user, loading, error, refetch } = useProfile();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || loading) return <PageSkeleton />;

  if (error || !user) return (
    <div style={{ padding: "40px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ padding: "18px 20px", borderRadius: 14, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ color: "#ef4444", marginTop: 1 }}><IcTriangle s={17} /></div>
        <div>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14.5, color: "#ef4444", margin: "0 0 5px" }}>Failed to load</p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 12px" }}>{error ?? "Unable to load data."}</p>
          <button onClick={refetch} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Retry</button>
        </div>
      </div>
    </div>
  );

  const hasBacked = (user.totalProjectsBacked ?? 0) > 0;
  const totalBacked = user.totalAmountBacked ?? 0;
  const projectsBacked = user.totalProjectsBacked ?? 0;
  const cardBg = isDark ? "rgba(255,255,255,0.025)" : "#fff";
  const cardBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div style={{ padding: "40px 32px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 36, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800" }}>
              <IcTarget s={13} />
            </div>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Your backing history</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>Backed Projects</h1>
        </div>
        {hasBacked && (
          <div style={{ display: "flex", gap: 10 }}>
            <StatPill icon={<IcTarget s={16} />} label="Projects" value={String(projectsBacked)} accent="#ff8800" isDark={isDark} />
            <StatPill icon={<IcCoin s={16} />} label="Total backed" value={`₹${totalBacked.toLocaleString("en-IN")}`} accent="#34d399" isDark={isDark} />
          </div>
        )}
      </div>

      {!hasBacked ? <EmptyCard isDark={isDark} /> : (
        <div style={{ borderRadius: 24, padding: 40, textAlign: "center", background: cardBg, border: `1px solid ${cardBdr}`, boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,107,0,0.06)", filter: "blur(70px)", pointerEvents: "none" }} />
          <div style={{ width: 64, height: 64, borderRadius: 20, margin: "0 auto 18px", background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800" }}>
            <IcRocket s={28} />
          </div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 8px" }}>Projects coming soon!</h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", margin: "0 0 24px", maxWidth: 360, lineHeight: 1.65 }}>
            Your backed projects will appear here once campaigns are live.
          </p>
          <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, boxShadow: "0 0 20px rgba(255,100,0,0.3)", position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "bkshimmer 2.4s ease-in-out infinite" }} />
            <span style={{ position: "relative" }}>Find campaigns →</span>
          </Link>
        </div>
      )}

      <style>{`@keyframes bkshimmer{0%{transform:translateX(-100%)}60%{transform:translateX(200%)}100%{transform:translateX(200%)}} @keyframes bkpulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </div>
  );
}