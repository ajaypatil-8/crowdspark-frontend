"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

export default function SavedPage() {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      padding:"36px 32px 60px", maxWidth:1100, margin:"0 auto",
      opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(12px)",
      transition:"opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {/* header */}
      <div style={{ marginBottom:36, display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:"rgba(0,245,212,0.12)", border:"1px solid rgba(0,245,212,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🔖</div>
            <span style={{ fontFamily:"DM Sans, sans-serif", fontSize:12, color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Collection</span>
          </div>
          <h1 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:"clamp(24px,3vw,36px)", color:"var(--text)", letterSpacing:"-0.03em", margin:0 }}>
            Saved Campaigns
          </h1>
        </div>
        <Link href="/explore" style={{
          display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:12,
          background: isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",
          border: isDark?"1px solid rgba(255,255,255,0.08)":"1px solid rgba(0,0,0,0.07)",
          color:"var(--text)", textDecoration:"none", fontFamily:"DM Sans, sans-serif", fontWeight:600, fontSize:13,
          transition:"all 0.15s",
        }}>
          Browse campaigns →
        </Link>
      </div>

      {/* empty state */}
      <div style={{
        borderRadius:24, padding:"80px 40px", textAlign:"center",
        background: isDark
          ? "linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))"
          : "linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,255,255,0.7))",
        border: isDark?"1px dashed rgba(255,255,255,0.08)":"1px dashed rgba(0,0,0,0.08)",
        position:"relative", overflow:"hidden",
      }}>
        {/* decorative blobs */}
        <div style={{ position:"absolute", top:-60, left:-60, width:200, height:200, borderRadius:"50%", background:"rgba(0,245,212,0.05)", filter:"blur(60px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-60, right:-60, width:200, height:200, borderRadius:"50%", background:"rgba(255,107,0,0.05)", filter:"blur(60px)", pointerEvents:"none" }} />

        <div style={{
          width:80, height:80, borderRadius:24, margin:"0 auto 20px",
          background: isDark?"rgba(0,245,212,0.08)":"rgba(0,245,212,0.06)",
          border:"1px solid rgba(0,245,212,0.2)", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:36, position:"relative",
        }}>
          🔖
          <div style={{ position:"absolute", inset:-1, borderRadius:24, background:"linear-gradient(135deg,rgba(0,245,212,0.15),transparent)", pointerEvents:"none" }} />
        </div>

        <h2 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:22, color:"var(--text)", margin:"0 0 10px", letterSpacing:"-0.02em" }}>
          Nothing saved yet
        </h2>
        <p style={{ fontSize:14, color:"var(--text-muted)", fontFamily:"DM Sans, sans-serif", margin:"0 auto 28px", maxWidth:360, lineHeight:1.7 }}>
          Hit the bookmark icon on any campaign to save it here. Revisit and back the ideas that excite you most.
        </p>

        <Link href="/explore" style={{
          display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:12,
          background:"linear-gradient(135deg,#ff6b00,#ffcc00)", color:"#fff", textDecoration:"none",
          fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14,
          boxShadow:"0 0 24px rgba(255,100,0,0.4)", position:"relative", overflow:"hidden",
        }}>
          <span style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.25) 50%,transparent 70%)", animation:"shimmer 2.4s ease-in-out infinite" }} />
          <span style={{ position:"relative" }}>Browse campaigns →</span>
        </Link>

        {/* tips row */}
        <div style={{ display:"flex", justifyContent:"center", gap:24, marginTop:40, flexWrap:"wrap" }}>
          {[["🔍","Discover","Find campaigns you love"],["🔖","Save","Bookmark for later"],["💸","Back","Fund when you're ready"]].map(([e,t,d])=>(
            <div key={t} style={{ textAlign:"center" }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{e}</div>
              <p style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:"var(--text)", margin:"0 0 2px" }}>{t}</p>
              <p style={{ fontSize:11.5, color:"var(--text-muted)", fontFamily:"DM Sans, sans-serif", margin:0 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}60%{transform:translateX(200%)}100%{transform:translateX(200%)}}`}</style>
    </div>
  );
}