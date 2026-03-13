"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

const IcBookmark = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
  </svg>
);
const IcSearch = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcHeart = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const IcZap = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

function PageSkeleton() {
  const { isDark } = useTheme();
  const b = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  return (
    <div style={{ padding: "40px 32px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ width: 140, height: 12, borderRadius: 6, background: b, marginBottom: 10, animation: "svpulse 2s ease-in-out infinite" }} />
        <div style={{ width: 260, height: 36, borderRadius: 10, background: b, animation: "svpulse 2s ease-in-out infinite" }} />
      </div>
      <div style={{ height: 400, borderRadius: 22, background: b, animation: "svpulse 2s ease-in-out infinite" }} />
      <style>{`@keyframes svpulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </div>
  );
}

export default function SavedPage() {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <PageSkeleton />;

  const card = isDark ? "rgba(255,255,255,0.025)" : "#fff";
  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const tips = [
    { icon: <IcSearch s={15} />, accent: "#00d4b8", title: "Discover", desc: "Find campaigns you love" },
    { icon: <IcBookmark s={15} />, accent: "#ff8800", title: "Save", desc: "Bookmark for later" },
    { icon: <IcZap s={15} />, accent: "#a78bfa", title: "Back", desc: "Fund when ready" },
  ];

  return (
    <div style={{ padding: "40px 32px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 36, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4b8" }}>
              <IcBookmark s={13} />
            </div>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Collection</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>Saved Campaigns</h1>
        </div>
        <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${bdr}`, color: "var(--text)", textDecoration: "none", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13 }}>
          <IcSearch s={13} />
          Browse campaigns
        </Link>
      </div>

      <div style={{ borderRadius: 24, padding: "72px 40px", textAlign: "center", position: "relative", overflow: "hidden", background: card, border: `1px solid ${bdr}`, boxShadow: isDark ? "none" : "0 2px 24px rgba(0,0,0,0.05)" }}>
        <div style={{ position: "absolute", top: -60, left: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(0,245,212,0.06)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,107,0,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />

        <div style={{ width: 72, height: 72, borderRadius: 22, margin: "0 auto 22px", background: isDark ? "rgba(0,245,212,0.08)" : "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4b8", position: "relative" }}>
          <IcBookmark s={30} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "linear-gradient(135deg,rgba(0,245,212,0.14),transparent)", pointerEvents: "none" }} />
        </div>

        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>Nothing saved yet</h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: "0 auto 28px", maxWidth: 360, lineHeight: 1.75 }}>
          Hit the bookmark icon on any campaign to save it here. Revisit and back the ideas that excite you most.
        </p>
        <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 0 24px rgba(255,100,0,0.35)", position: "relative", overflow: "hidden" }}>
          <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "svshimmer 2.4s ease-in-out infinite" }} />
          <span style={{ position: "relative" }}>Browse campaigns →</span>
        </Link>

        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 48, flexWrap: "wrap" }}>
          {tips.map(({ icon, accent, title, desc }) => (
            <div key={title} style={{ textAlign: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, margin: "0 auto 8px", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>{icon}</div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: "var(--text)", margin: "0 0 2px" }}>{title}</p>
              <p style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes svshimmer{0%{transform:translateX(-100%)}60%{transform:translateX(200%)}100%{transform:translateX(200%)}} @keyframes svpulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </div>
  );
}