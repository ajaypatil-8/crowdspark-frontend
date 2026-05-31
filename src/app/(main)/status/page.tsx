"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

type StatusLevel = "operational" | "degraded" | "outage" | "maintenance";

const SERVICES: { name: string; desc: string; status: StatusLevel; uptime: string; emoji: string }[] = [
  { name: "API Gateway",         desc: "Core REST & WebSocket API",        status: "operational",   uptime: "99.98%", emoji: "🔌" },
  { name: "Campaign Service",    desc: "Campaign creation and management", status: "operational",   uptime: "99.95%", emoji: "🚀" },
  { name: "Payment Processing",  desc: "Razorpay integration & payouts",   status: "operational",   uptime: "99.99%", emoji: "💳" },
  { name: "KYC Verification",    desc: "DigiLocker & document review",      status: "operational",   uptime: "99.90%", emoji: "🔍" },
  { name: "Email Notifications", desc: "Transactional & marketing emails", status: "operational",   uptime: "99.87%", emoji: "📧" },
  { name: "Media CDN",           desc: "Image & video delivery network",   status: "operational",   uptime: "99.99%", emoji: "🖼️" },
  { name: "Search & Explore",    desc: "Campaign discovery and filtering", status: "operational",   uptime: "99.93%", emoji: "🔎" },
  { name: "Admin Dashboard",     desc: "Internal operations tooling",      status: "operational",   uptime: "99.80%", emoji: "⚙️" },
];

const INCIDENTS = [
  {
    date: "8 May 2025",
    title: "Intermittent email delivery delays",
    status: "resolved",
    duration: "43 min",
    updates: [
      { time: "14:32 IST", msg: "Investigating reports of delayed transactional emails." },
      { time: "14:51 IST", msg: "Identified root cause: upstream SMTP provider throttling. Switched to secondary relay." },
      { time: "15:15 IST", msg: "All delayed emails delivered. Monitoring for recurrence." },
    ],
  },
  {
    date: "22 April 2025",
    title: "Payment webhook processing lag",
    status: "resolved",
    duration: "18 min",
    updates: [
      { time: "09:14 IST", msg: "Detected increased latency in Razorpay webhook queue." },
      { time: "09:32 IST", msg: "Queue cleared; all payments confirmed. No transactions lost." },
    ],
  },
  {
    date: "5 March 2025",
    title: "Planned maintenance — Database upgrade",
    status: "completed",
    duration: "2 hr",
    updates: [
      { time: "02:00 IST", msg: "Maintenance window begun. Platform in read-only mode." },
      { time: "03:47 IST", msg: "Database migration complete. Full service restored." },
    ],
  },
];

const STATUS_CONFIG: Record<StatusLevel, { label: string; color: string; bg: string; dot: string }> = {
  operational:   { label: "Operational",        color: "#34d399", bg: "rgba(52,211,153,0.1)",  dot: "#34d399" },
  degraded:      { label: "Degraded",           color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  dot: "#f59e0b" },
  outage:        { label: "Major Outage",        color: "#ef4444", bg: "rgba(239,68,68,0.1)",   dot: "#ef4444" },
  maintenance:   { label: "Maintenance",         color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  dot: "#60a5fa" },
};

const formatStatusTime = () =>
  new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short" });

// Generate 90 days of uptime bars (all green for demo)
function UptimeBars() {
  const bars = Array.from({ length: 90 }, (_, i) => ({
    day: i,
    ok: i % 37 !== 0,
  }));
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 32 }}>
      {bars.map((b, i) => (
        <div key={i} title={b.ok ? "Operational" : "Incident"} style={{ flex: 1, height: b.ok ? 24 : 12, borderRadius: 2, background: b.ok ? "#34d399" : "#ef4444", opacity: b.ok ? 0.75 : 1, transition: "opacity 0.15s", cursor: "default" }} />
      ))}
    </div>
  );
}

export default function StatusPage() {
  const { isDark } = useTheme();
  const [openIncident, setOpenIncident] = useState<number | null>(null);
  const [now, setNow] = useState(formatStatusTime);

  useEffect(() => {
    const t = setInterval(() => setNow(formatStatusTime()), 10000);
    return () => clearInterval(t);
  }, []);

  const allOperational = SERVICES.every(s => s.status === "operational");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "80px 44px 64px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${allOperational ? "rgba(52,211,153,0.1)" : "rgba(245,158,11,0.1)"} 0%, transparent 70%)`, pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Big status indicator */}
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 48px", borderRadius: 28, background: isDark ? "rgba(52,211,153,0.06)" : "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.2)", marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 20px rgba(52,211,153,0.7)", animation: "pulse-green 2s ease-in-out infinite" }} />
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#34d399" }}>
              All Systems Operational
            </div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)" }}>
              Last checked: {now || "Loading..."}
            </div>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "var(--text)", margin: "0 0 12px", letterSpacing: "-0.03em" }}>CrowdSpark System Status</h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "var(--text-muted)" }}>Real-time health for all platform services.</p>
        </motion.div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 44px 96px" }}>

        {/* Services */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "var(--text)", marginBottom: 20 }}>Services</h2>
          <div style={{ borderRadius: 22, overflow: "hidden", border: "1px solid var(--border)" }}>
            {SERVICES.map((svc, i) => {
              const cfg = STATUS_CONFIG[svc.status];
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", background: isDark ? (i % 2 === 0 ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.025)") : (i % 2 === 0 ? "#fafafa" : "#fff"), borderBottom: i < SERVICES.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{svc.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{svc.name}</div>
                    <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>{svc.desc}</div>
                  </div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", marginRight: 16 }}>{svc.uptime} uptime</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 999, background: cfg.bg, border: `1px solid ${cfg.color}35` }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }} />
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 90-day uptime */}
        <div style={{ marginBottom: 64, padding: "28px 28px", borderRadius: 22, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "var(--text)", margin: 0 }}>90-Day Uptime</h2>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#34d399", fontWeight: 700 }}>99.94% avg</span>
          </div>
          <UptimeBars />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>90 days ago</span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>Today</span>
          </div>
        </div>

        {/* Incident history */}
        <div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "var(--text)", marginBottom: 20 }}>Incident History</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {INCIDENTS.map((inc, i) => (
              <div key={i} style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)", background: isDark ? "rgba(255,255,255,0.025)" : "#fff" }}>
                <button onClick={() => setOpenIncident(openIncident === i ? null : i)} style={{ width: "100%", padding: "18px 22px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{inc.status === "resolved" ? "✅" : "🔧"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 2 }}>{inc.title}</div>
                    <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>{inc.date} · Duration: {inc.duration}</div>
                  </div>
                  <svg style={{ color: "var(--text-muted)", transform: openIncident === i ? "rotate(180deg)" : "", transition: "transform 0.25s", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {openIncident === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "0 22px 20px 52px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {inc.updates.map((u, j) => (
                        <div key={j} style={{ display: "flex", gap: 12 }}>
                          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#34d399", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>{u.time}</span>
                          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-sub)", lineHeight: 1.6 }}>{u.msg}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-green {
          0%,100% { box-shadow: 0 0 20px rgba(52,211,153,0.7); }
          50% { box-shadow: 0 0 36px rgba(52,211,153,1); }
        }
      `}</style>
    </div>
  );
}
