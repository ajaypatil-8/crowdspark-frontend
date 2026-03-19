"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { useProfile } from "@/contexts/ProfileContext";
import { authApi, isLoggedIn } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Backend role / status types (matches your Spring Boot enums exactly)
// ─────────────────────────────────────────────────────────────────────────────
type Role      = "ADMIN" | "CREATOR" | "BACKER";
type KycStatus = "NOT_SUBMITTED" | "PENDING_SUBMISSION" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

const LINKS = [
  { label: "Explore",      href: "/explore"  },
  { label: "How it works", href: "/#how"     },
  { label: "Creators",     href: "/creators" },
  { label: "Pricing",      href: "/pricing"  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MENU ITEMS — mapped to your exact folder structure:
//   src/app/dashboard/page.tsx
//   src/app/dashboard/profile/page.tsx
//   src/app/dashboard/settings/page.tsx
//   src/app/dashboard/backed/page.tsx
//   src/app/dashboard/saved/page.tsx
//   src/app/dashboard/become-creator/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
const MENU_SECTIONS = {
  account: [
    {
      label: "Overview",
      desc:  "Your dashboard home",
      href:  "/dashboard",
      color: "#ff8800",
      icon:  (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
    },
    {
      label: "Profile",
      desc:  "Edit bio, avatar & links",
      href:  "/dashboard/profile",
      color: "#a78bfa",
      icon:  (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      label: "Settings",
      desc:  "Account & preferences",
      href:  "/dashboard/settings",
      color: "#00d4b8",
      icon:  (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      ),
    },
  ],
  activity: [
    {
      label: "Backed Projects",
      desc:  "Campaigns you funded",
      href:  "/dashboard/backed",
      color: "#ef4444",
      icon:  (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      ),
    },
    {
      label: "Saved",
      desc:  "Bookmarked campaigns",
      href:  "/dashboard/saved",
      color: "#f59e0b",
      icon:  (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
        </svg>
      ),
    },
  ],
};

// KYC status metadata
const KYC_META: Record<KycStatus, { label: string; color: string; dot: string }> = {
  NOT_SUBMITTED:      { label: "KYC not submitted",  color: "#f59e0b", dot: "#f59e0b" },
  PENDING_SUBMISSION: { label: "Submit KYC docs",    color: "#f59e0b", dot: "#f59e0b" },
  PENDING_APPROVAL:   { label: "KYC under review",   color: "#60a5fa", dot: "#60a5fa" },
  APPROVED:           { label: "KYC verified ✓",    color: "#34d399", dot: "#34d399" },
  REJECTED:           { label: "KYC rejected",       color: "#ef4444", dot: "#ef4444" },
};

// Role metadata
const ROLE_META: Record<Role, { label: string; color: string; bg: string }> = {
  ADMIN:   { label: "Admin",   color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  CREATOR: { label: "Creator", color: "#ff8800", bg: "rgba(255,136,0,0.12)"  },
  BACKER:  { label: "Backer",  color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Fire particles (logo decoration)
// ─────────────────────────────────────────────────────────────────────────────
function FireParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 80; canvas.height = 40;
    type P = { x: number; y: number; vy: number; life: number; maxLife: number; size: number };
    const ps: P[] = [];
    let frame = 0, raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick); frame++;
      if (frame % 2 === 0) ps.push({ x: 30 + Math.random() * 20, y: 36, vy: -(0.6 + Math.random()), life: 0, maxLife: 24 + Math.random() * 16, size: 2 + Math.random() * 3 });
      ctx.clearRect(0, 0, 80, 40);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]; p.y += p.vy; p.x += (Math.random() - 0.5) * 0.8; p.life++;
        const t = p.life / p.maxLife; if (t >= 1) { ps.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = (1 - t) * 0.85;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * (1 - t * 0.6));
        g.addColorStop(0, `rgb(255,${Math.round(255 * (1 - t * 0.85))},${Math.round(60 * (1 - t))})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 - t * 0.6), 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
    };
    tick(); return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", bottom: -4, left: -16, width: 80, height: 40, pointerEvents: "none", zIndex: 0 }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────
function Avatar({ url, name, size = 32 }: { url?: string | null; name?: string | null; size?: number }) {
  const initials = name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid rgba(255,107,0,0.55)", boxShadow: "0 0 10px rgba(255,107,0,0.3)" }}>
      {url
        ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: size * 0.36 }}>{initials}</div>
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// A single menu row link
// ─────────────────────────────────────────────────────────────────────────────
function MenuRow({
  href, icon, label, desc, color, isDark, onClick, delay = 0,
}: {
  href: string; icon: React.ReactNode; label: string; desc: string;
  color: string; isDark: boolean; onClick: () => void; delay?: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.22, ease: "easeOut" }}
    >
      <Link
        href={href}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", gap: 11,
          paddingTop: 8, paddingBottom: 8, paddingLeft: 10, paddingRight: 10,
          borderRadius: 13, textDecoration: "none",
          background: hovered
            ? (isDark ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.042)")
            : "transparent",
          transition: "background 0.14s",
        }}
      >
        {/* Icon box */}
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: isDark ? `${color}1a` : `${color}14`,
          border: `1px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color,
          boxShadow: hovered ? `0 0 10px ${color}33` : "none",
          transition: "box-shadow 0.18s",
        }}>
          {icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color: "var(--text)", margin: 0, lineHeight: 1.25 }}>{label}</p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.3 }}>{desc}</p>
        </div>

        {/* Arrow */}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ color: "var(--text-muted)", opacity: hovered ? 0.55 : 0.2, flexShrink: 0, transition: "opacity 0.15s, transform 0.15s", transform: hovered ? "translateX(2px)" : "none" }}
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// User dropdown
// ─────────────────────────────────────────────────────────────────────────────
function UserDropdown({ isDark }: { isDark: boolean }) {
  const router    = useRouter();
  const { user }  = useProfile();
  const [open, setOpen] = useState(false);
  const wrapRef   = useRef<HTMLDivElement>(null);

  // All roles this user has
  const roles = (user?.roles ? Array.from(user.roles as Iterable<Role>) : []) as Role[];
  const isCreator = roles.includes("CREATOR");
  const isAdmin   = roles.includes("ADMIN");

  // Primary role for badge (ADMIN > CREATOR > BACKER)
  const primaryRole: Role = isAdmin ? "ADMIN" : isCreator ? "CREATOR" : "BACKER";
  const kycStatus = (user as any)?.kycStatus as KycStatus | undefined;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const close = () => setOpen(false);

  const handleLogout = useCallback(async () => {
    close();
    try { await authApi.logout(); } catch { /* ignore */ }
    router.push("/login");
  }, [router]);

  const rm     = ROLE_META[primaryRole];
  const dropBg = isDark ? "rgba(7,6,12,0.97)" : "rgba(255,255,255,0.97)";
  const bdr    = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  return (
    <div ref={wrapRef} style={{ position: "relative", zIndex: 200 }}>

      {/* ── Trigger button ───────────────────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          paddingTop: 3, paddingBottom: 3, paddingLeft: 3, paddingRight: 10,
          borderRadius: 999, cursor: "pointer", border: "none",
          background: open
            ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)")
            : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
          outline: `1.5px solid ${open ? (isDark ? "rgba(255,107,0,0.5)" : "rgba(255,107,0,0.38)") : bdr}`,
          boxShadow: open ? "0 0 0 3px rgba(255,107,0,0.13)" : "none",
          transition: "all 0.2s",
        }}
      >
        <Avatar url={user?.profileImageUrl} name={user?.name} size={28} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0 }}>
          {/* Name */}
          <span style={{
            fontFamily: "Syne, sans-serif", fontSize: 12.5, fontWeight: 700,
            color: "var(--text)", maxWidth: 90, overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.35,
          }}>
            {user?.name?.split(" ")[0] ?? "Account"}
          </span>
          {/* Role pill */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            fontFamily: "DM Sans, sans-serif", fontSize: 9, fontWeight: 700,
            color: rm.color, letterSpacing: "0.09em", textTransform: "uppercase",
            lineHeight: 1.3,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: rm.color, flexShrink: 0, boxShadow: `0 0 5px ${rm.color}` }} />
            {rm.label}
          </span>
        </div>

        {/* Chevron */}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ display: "flex", color: "var(--text-muted)", opacity: 0.45 }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </motion.button>

      {/* ── Dropdown panel ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit=  {{ opacity: 0, y: -8,   scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            style={{
              position: "absolute", top: "calc(100% + 12px)", right: 0,
              width: 300, borderRadius: 22,
              background: dropBg,
              border: `1px solid ${bdr}`,
              backdropFilter: "blur(36px) saturate(180%)",
              WebkitBackdropFilter: "blur(36px) saturate(180%)",
              boxShadow: isDark
                ? "0 24px 72px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,107,0,0.07), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "0 24px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(255,107,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
              overflow: "hidden",
            }}
          >
            {/* Glow line at top */}
            <div style={{ height: 2, background: "linear-gradient(90deg,transparent 5%,rgba(255,100,0,0.7) 28%,rgba(255,210,0,1) 50%,rgba(255,100,0,0.7) 72%,transparent 95%)" }} />

            {/* ──── Profile header ──── */}
            <div style={{ paddingTop: 14, paddingBottom: 12, paddingLeft: 14, paddingRight: 14, borderBottom: `1px solid ${bdr}` }}>

              {/* Avatar + name row */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                <Avatar url={user?.profileImageUrl} name={user?.name} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, color: "var(--text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.name ?? "—"}
                  </p>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: "0 0 7px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.username ? `@${user.username}` : ""}{user?.email ? ` · ${user.email}` : ""}
                  </p>

                  {/* All role badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {roles.map(r => {
                      const m = ROLE_META[r];
                      return (
                        <span key={r} style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          paddingTop: 3, paddingBottom: 3, paddingLeft: 8, paddingRight: 8,
                          borderRadius: 999, fontSize: 9.5, fontWeight: 700,
                          fontFamily: "DM Sans, sans-serif", letterSpacing: "0.08em",
                          textTransform: "uppercase" as const,
                          color: m.color, background: m.bg, border: `1px solid ${m.color}30`,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.color, boxShadow: `0 0 4px ${m.color}` }} />
                          {m.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* KYC status strip */}
              {kycStatus && (
                <Link
                  href="/dashboard/settings"
                  onClick={close}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                    paddingTop: 7, paddingBottom: 7, paddingLeft: 10, paddingRight: 10,
                    borderRadius: 10,
                    background: isDark ? `${KYC_META[kycStatus].color}14` : `${KYC_META[kycStatus].color}0d`,
                    border: `1px solid ${KYC_META[kycStatus].color}28`,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: KYC_META[kycStatus].color, boxShadow: `0 0 6px ${KYC_META[kycStatus].color}`, flexShrink: 0 }} />
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 600, color: KYC_META[kycStatus].color, flex: 1 }}>
                    {KYC_META[kycStatus].label}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: KYC_META[kycStatus].color }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              )}

              {/* Stats strip (if user has activity) */}
              {(((user as any)?.totalProjectsBacked ?? 0) > 0 || ((user as any)?.totalProjectsCreated ?? 0) > 0) && (
                <div style={{ display: "flex", gap: 0, borderRadius: 11, overflow: "hidden", border: `1px solid ${bdr}` }}>
                  {[
                    isCreator && { val: (user as any).totalProjectsCreated ?? 0, label: "Created", color: "#34d399" },
                    isCreator && { val: `₹${((user as any).totalFundsRaised ?? 0).toLocaleString("en-IN")}`, label: "Raised", color: "#ff8800" },
                    { val: (user as any).totalProjectsBacked ?? 0, label: "Backed", color: "#60a5fa" },
                  ].filter(Boolean).map((s: any, i, arr) => (
                    <div key={s.label} style={{ flex: 1, paddingTop: 7, paddingBottom: 7, paddingLeft: 4, paddingRight: 4, textAlign: "center", borderRight: i < arr.length - 1 ? `1px solid ${bdr}` : "none", background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)" }}>
                      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, color: s.color, margin: 0, letterSpacing: "-0.02em" }}>{s.val}</p>
                      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 9.5, color: "var(--text-muted)", margin: 0 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ──── Section: Account ──── */}
            <div style={{ paddingTop: 6, paddingLeft: 8, paddingRight: 8 }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.13em", textTransform: "uppercase" as const, margin: "0 0 2px", paddingLeft: 10 }}>
                Account
              </p>
              {MENU_SECTIONS.account.map((item, i) => (
                <MenuRow key={item.href} {...item} isDark={isDark} onClick={close} delay={i * 0.04} />
              ))}
            </div>

            <div style={{ height: 1, background: bdr, marginLeft: 10, marginRight: 10, marginTop: 4, marginBottom: 2 }} />

            {/* ──── Section: Activity ──── */}
            <div style={{ paddingTop: 4, paddingLeft: 8, paddingRight: 8 }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.13em", textTransform: "uppercase" as const, margin: "0 0 2px", paddingLeft: 10 }}>
                Activity
              </p>
              {MENU_SECTIONS.activity.map((item, i) => (
                <MenuRow key={item.href} {...item} isDark={isDark} onClick={close} delay={0.12 + i * 0.04} />
              ))}
            </div>

            <div style={{ height: 1, background: bdr, marginLeft: 10, marginRight: 10, marginTop: 4, marginBottom: 2 }} />

            {/* ──── Section: Creator (conditional) ──── */}
            <div style={{ paddingTop: 4, paddingLeft: 8, paddingRight: 8 }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.13em", textTransform: "uppercase" as const, margin: "0 0 2px", paddingLeft: 10 }}>
                {isCreator ? "Creator" : "Grow"}
              </p>

              {isCreator ? (
                /* Creator has KYC + campaigns */
                <>
                  <MenuRow
                    href="/dashboard/become-creator"
                    label="KYC & Verification"
                    desc="Manage identity docs"
                    color="#60a5fa"
                    isDark={isDark}
                    onClick={close}
                    delay={0.22}
                    icon={
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    }
                  />
                </>
              ) : (
                /* Non-creator: show become-creator promo */
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22 }}>
                  <Link
                    href="/dashboard/become-creator"
                    onClick={close}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, textDecoration: "none",
                      paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 12,
                      borderRadius: 13, margin: "2px 0 4px",
                      background: isDark
                        ? "linear-gradient(135deg,rgba(255,107,0,0.1),rgba(255,204,0,0.07))"
                        : "linear-gradient(135deg,rgba(255,107,0,0.07),rgba(255,204,0,0.05))",
                      border: "1px solid rgba(255,107,0,0.22)",
                      position: "relative", overflow: "hidden",
                    }}
                  >
                    <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.14) 50%,transparent 70%)", animation: "nbShimmer 2.4s ease-in-out infinite" }} />
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(255,100,0,0.4)", flexShrink: 0, position: "relative" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
                        <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, position: "relative" }}>
                      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, color: "#ff8800", margin: "0 0 2px" }}>Become a Creator</p>
                      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Launch your own campaign</p>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff8800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, position: "relative", opacity: 0.7 }}>
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              )}
            </div>

            <div style={{ height: 1, background: bdr, marginLeft: 10, marginRight: 10, marginTop: 2, marginBottom: 2 }} />

            {/* ──── Sign out ──── */}
            <div style={{ paddingTop: 2, paddingBottom: 8, paddingLeft: 8, paddingRight: 8 }}>
              <SignOutRow isDark={isDark} username={user?.username} onLogout={handleLogout} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SignOutRow({ isDark, username, onLogout }: { isDark: boolean; username?: string; onLogout: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      type="button"
      onClick={onLogout}
      whileHover={{ x: 2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 11, width: "100%",
        paddingTop: 8, paddingBottom: 8, paddingLeft: 10, paddingRight: 10,
        borderRadius: 13, background: hovered
          ? (isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.07)")
          : "transparent",
        border: "none", cursor: "pointer", transition: "background 0.13s",
      }}
    >
      <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0, boxShadow: hovered ? "0 0 10px rgba(239,68,68,0.25)" : "none", transition: "box-shadow 0.18s" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </div>
      <div>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 600, color: "#ef4444", margin: 0, lineHeight: 1.25 }}>Sign out</p>
        {username && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10.5, color: "var(--text-muted)", margin: 0 }}>@{username}</p>}
      </div>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Navbar
// ─────────────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { isDark }  = useTheme();
  const pathname    = usePathname();
  const navRef      = useRef<HTMLDivElement>(null);
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const [loggedIn,   setLoggedIn]   = useState(false);

  useEffect(() => { setMounted(true); setLoggedIn(isLoggedIn()); }, []);
  useEffect(() => { setLoggedIn(isLoggedIn()); }, [pathname]);

  // GSAP entrance
  useEffect(() => {
    gsap.fromTo(navRef.current, { y: -80, opacity: 0, scale: 0.88 }, { y: 0, opacity: 1, scale: 1, duration: 1.05, ease: "back.out(1.6)", delay: 0.25 });
  }, []);

  // Scroll glass
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close mobile on nav
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Hide on auth pages
  if (pathname === "/login" || pathname === "/register") return null;

  const glassBg  = scrolled ? (isDark ? "rgba(6,6,10,0.94)" : "rgba(255,255,255,0.94)") : (isDark ? "rgba(6,6,10,0.65)" : "rgba(255,255,255,0.62)");
  const glassBdr = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)";
  const shadow   = scrolled
    ? "0 8px 44px rgba(0,0,0,0.42),0 0 0 1px rgba(255,120,0,0.14),inset 0 1px 0 rgba(255,255,255,0.07)"
    : "0 4px 28px rgba(0,0,0,0.18),inset 0 1px 0 rgba(255,255,255,0.06)";
  const mobileBdr = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  return (
    <>
      <div ref={navRef} style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 1000, width: "min(920px,calc(100vw - 32px))" }}>

        {/* ── Pill shell ── */}
        <motion.div layout transition={{ type: "spring", stiffness: 340, damping: 30 }} style={{ borderRadius: 9999, overflow: "hidden", position: "relative" }}>
          <div style={{ background: glassBg, backdropFilter: "blur(28px) saturate(200%)", WebkitBackdropFilter: "blur(28px) saturate(200%)", border: glassBdr, boxShadow: shadow, transition: "background 0.3s, box-shadow 0.3s", paddingLeft: 8, paddingRight: 8 }}>

            {/* Accent line */}
            <div style={{ position: "absolute", top: 0, left: "12%", right: "12%", height: 1.5, background: "linear-gradient(90deg,transparent,rgba(255,120,0,0.8) 30%,rgba(255,220,0,1) 50%,rgba(255,120,0,0.8) 70%,transparent)", opacity: scrolled ? 1 : 0.5, transition: "opacity 0.3s", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: -2, borderRadius: 9999, boxShadow: "0 -2px 24px rgba(255,100,0,0.22),0 -1px 10px rgba(255,200,0,0.18)", pointerEvents: "none", zIndex: -1 }} />

            <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 4, paddingRight: 4, gap: 6 }}>

              {/* Logo */}
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", position: "relative", flexShrink: 0 }}>
                <FireParticles />
                <motion.div whileHover={{ scale: 1.08, rotate: 3 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,var(--accent),#ff8800)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, flexShrink: 0, boxShadow: "0 0 14px rgba(255,120,0,0.55),0 2px 8px rgba(0,0,0,0.3)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={isDark ? "#050508" : "#fff"} />
                  </svg>
                </motion.div>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text)", letterSpacing: "-0.02em", position: "relative", zIndex: 1 }}>
                  Crowd<span style={{ color: "var(--accent)" }}>Spark</span>
                </span>
              </Link>

              {/* Nav links */}
              <nav className="nb-links" style={{ display: "flex", alignItems: "center", gap: 2 }}>
                {LINKS.map(l => {
                  const active = pathname === l.href;
                  return (
                    <Link key={l.href} href={l.href} className="nb-pill"
                      style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 500, color: active ? "var(--accent)" : "var(--text-muted)", textDecoration: "none", paddingTop: 6, paddingBottom: 6, paddingLeft: 13, paddingRight: 13, borderRadius: 999, background: active ? "var(--accent-dim)" : "transparent", transition: "all 0.18s", whiteSpace: "nowrap" }}>
                      {l.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Right: ThemeToggle + Auth */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

                {/* ThemeToggle — always visible */}
                <ThemeToggle />

                {/* Auth area */}
                {mounted && (
                  loggedIn ? (
                    /* ── Logged in: avatar dropdown ── */
                    <UserDropdown isDark={isDark} />
                  ) : (
                    /* ── Logged out: sign in + get started ── */
                    <div className="nb-links" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Link href="/login"
                        style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, fontWeight: 500, color: "var(--text-muted)", textDecoration: "none", paddingTop: 7, paddingBottom: 7, paddingLeft: 14, paddingRight: 14, borderRadius: 999, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, transition: "all 0.18s", background: "none", display: "inline-block" }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "var(--text)"; el.style.borderColor = isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.2)"; el.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "var(--text-muted)"; el.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; el.style.background = "none"; }}
                      >
                        Sign in
                      </Link>
                      <Link href="/register" className="nb-cta"
                        style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", paddingTop: 8, paddingBottom: 8, paddingLeft: 20, paddingRight: 20, borderRadius: 999, background: "linear-gradient(135deg,#ff6b00 0%,#ff9500 50%,#ffcc00 100%)", boxShadow: "0 0 18px rgba(255,100,0,0.5),0 2px 8px rgba(0,0,0,0.3)", transition: "transform 0.18s, box-shadow 0.18s", overflow: "hidden" }}
                      >
                        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.35) 50%,transparent 70%)", animation: "nbShimmer 2.4s ease-in-out infinite" }} />
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ position: "relative" }}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        <span style={{ position: "relative" }}>Get started</span>
                      </Link>
                    </div>
                  )
                )}

                {/* Hamburger (mobile only) */}
                <button type="button" className="nb-hamburger" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--text)", borderRadius: 8, display: "none" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {mobileOpen ? (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>) : (<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>)}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Mobile drawer ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{ marginTop: 10, borderRadius: 22, background: isDark ? "rgba(6,6,10,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: `1px solid ${mobileBdr}`, boxShadow: "0 12px 48px rgba(0,0,0,0.32),0 0 0 1px rgba(255,100,0,0.1)", paddingTop: 14, paddingBottom: 20, paddingLeft: 16, paddingRight: 16, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <div style={{ height: 1.5, borderRadius: 1, marginBottom: 10, background: "linear-gradient(90deg,transparent,rgba(255,120,0,0.75),rgba(255,220,0,0.95),rgba(255,120,0,0.75),transparent)" }} />
              {LINKS.map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link href={l.href} style={{ display: "block", fontFamily: "DM Sans, sans-serif", fontSize: 15, fontWeight: 500, color: pathname === l.href ? "var(--accent)" : "var(--text)", textDecoration: "none", paddingTop: 11, paddingBottom: 11, paddingLeft: 12, paddingRight: 12, borderRadius: 12, background: pathname === l.href ? "var(--accent-dim)" : "transparent", transition: "background 0.18s" }}>
                    {l.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile dashboard links */}
              {loggedIn && (
                <div style={{ marginTop: 6, paddingTop: 10, borderTop: `1px solid ${mobileBdr}`, display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    { label: "Dashboard",  href: "/dashboard" },
                    { label: "Profile",    href: "/dashboard/profile" },
                    { label: "Settings",   href: "/dashboard/settings" },
                    { label: "Backed",     href: "/dashboard/backed" },
                    { label: "Saved",      href: "/dashboard/saved" },
                    { label: "Become Creator", href: "/dashboard/become-creator" },
                  ].map(item => (
                    <Link key={item.href} href={item.href}
                      style={{ display: "block", fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 500, color: "var(--text)", textDecoration: "none", paddingTop: 9, paddingBottom: 9, paddingLeft: 12, paddingRight: 12, borderRadius: 10, transition: "background 0.16s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                {loggedIn ? (
                  <Link href="/dashboard" style={{ flex: 1, textAlign: "center", paddingTop: 12, paddingBottom: 12, borderRadius: 14, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 0 20px rgba(255,100,0,0.3)" }}>
                    Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link href="/login" style={{ flex: 1, textAlign: "center", paddingTop: 12, paddingBottom: 12, borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-ghost)", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
                    <Link href="/register" style={{ flex: 1, textAlign: "center", paddingTop: 12, paddingBottom: 12, borderRadius: 14, background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 0 20px rgba(255,100,0,0.4)" }}>Get started</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes nbShimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(200%)} 100%{transform:translateX(200%)} }
        .nb-pill:hover  { color: var(--text) !important; background: var(--bg-ghost) !important; }
        .nb-cta:hover   { transform: translateY(-1px) scale(1.04) !important; box-shadow: 0 0 30px rgba(255,100,0,0.8), 0 4px 18px rgba(0,0,0,0.3) !important; }
        .nb-links       { display: flex !important; align-items: center; gap: 8px; }
        @media (max-width: 768px) {
          .nb-links     { display: none !important; }
          .nb-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}