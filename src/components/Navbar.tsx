"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { label: "Explore",      href: "/explore"  },
  { label: "How it works", href: "/#how"     },
  { label: "Creators",     href: "/creators" },
  { label: "Pricing",      href: "/pricing"  },
];

/* ── tiny canvas-based fire particles behind the logo ── */
function FireParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width  = 80;
    canvas.height = 40;

    type Particle = { x:number; y:number; vy:number; life:number; maxLife:number; size:number };
    const particles: Particle[] = [];

    const spawn = () => {
      particles.push({
        x:       30 + Math.random() * 20,
        y:       36,
        vy:      -(0.6 + Math.random() * 1.0),
        life:    0,
        maxLife: 24 + Math.random() * 16,
        size:    2 + Math.random() * 3,
      });
    };

    let frame = 0;
    let rafId: number;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      frame++;
      if (frame % 2 === 0) spawn();

      ctx.clearRect(0, 0, 80, 40);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y    += p.vy;
        p.x    += (Math.random() - 0.5) * 0.8;
        p.life ++;
        const t = p.life / p.maxLife;         /* 0 → 1 */
        if (t >= 1) { particles.splice(i, 1); continue; }

        const alpha = (1 - t) * 0.85;
        const size  = p.size * (1 - t * 0.6);
        /* colour: white-yellow → orange → red */
        const r = 255;
        const g = Math.round(255 * (1 - t * 0.85));
        const b = Math.round(60  * (1 - t));

        ctx.save();
        ctx.globalAlpha = alpha;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        grad.addColorStop(0, `rgb(${r},${g},${b})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
    tick();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "absolute",
        bottom:        -4,
        left:          -16,
        width:         80,
        height:        40,
        pointerEvents: "none",
        zIndex:        0,
      }}
    />
  );
}

export default function Navbar() {
  const { isDark }  = useTheme();
  const pathname    = usePathname();
  const navRef      = useRef<HTMLDivElement>(null);
  const [scrolled,  setScrolled]  = useState(false);
  const [open,      setOpen]      = useState(false);
  const [hasToken,  setHasToken]  = useState(false);
  const [expanded,  setExpanded]  = useState(false); /* Dynamic Island expand */

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -60, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "back.out(1.4)", delay: 0.3 }
    );
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    try { setHasToken(!!localStorage.getItem("cs_access_token")); } catch {}
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const isAuth = pathname === "/login" || pathname === "/register";
  if (isAuth) return null;

  const iconClr = isDark ? "#050508" : "#fff";

  return (
    <>
      {/* ── Island wrapper ─────────────────────────────────── */}
      <div
        ref={navRef}
        style={{
          position:        "fixed",
          top:             16,
          left:            "50%",
          transform:       "translateX(-50%)",
          zIndex:          50,
          width:           "min(820px, calc(100vw - 32px))",
        }}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          style={{
            borderRadius:  9999,
            overflow:      "hidden",
            position:      "relative",
          }}
        >
          {/* ── Glass pill ── */}
          <div style={{
            background:    scrolled
              ? isDark
                ? "rgba(8,8,14,0.82)"
                : "rgba(255,255,255,0.78)"
              : isDark
                ? "rgba(8,8,14,0.60)"
                : "rgba(255,255,255,0.55)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border:        isDark
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(0,0,0,0.07)",
            boxShadow:     scrolled
              ? "0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,200,160,0.12), inset 0 1px 0 rgba(255,255,255,0.08)"
              : "0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
            transition:    "background 0.3s, box-shadow 0.3s",
            padding:       "0 6px",
          }}>

            {/* ── Fire glow ring (top edge only) ── */}
            <div style={{
              position:      "absolute",
              top:           0, left: "15%", right: "15%",
              height:        1,
              background:    "linear-gradient(90deg, transparent, rgba(255,120,0,0.7) 30%, rgba(255,220,0,0.9) 50%, rgba(255,120,0,0.7) 70%, transparent)",
              opacity:       scrolled ? 1 : 0.6,
              transition:    "opacity 0.3s",
            }} />

            {/* ── outer ambient fire glow ── */}
            <div style={{
              position:      "absolute",
              inset:         -1,
              borderRadius:  9999,
              background:    "transparent",
              boxShadow:     "0 -2px 20px rgba(255,100,0,0.25), 0 -1px 8px rgba(255,200,0,0.2)",
              pointerEvents: "none",
              zIndex:        -1,
            }} />

            {/* ── main nav bar ── */}
            <div style={{
              height:         56,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              padding:        "0 8px",
              gap:            8,
            }}>

              {/* logo */}
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", position: "relative", flexShrink: 0 }}>
                <FireParticles />
                <div style={{
                  width:          34, height: 34,
                  borderRadius:   10,
                  background:     "linear-gradient(135deg, var(--accent), #ff8800)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  position:       "relative",
                  zIndex:         1,
                  boxShadow:      "0 0 12px rgba(255,120,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
                  flexShrink:     0,
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={iconClr} />
                  </svg>
                </div>
                <span style={{
                  fontFamily:    "Syne, sans-serif",
                  fontWeight:    700,
                  fontSize:      18,
                  color:         "var(--text)",
                  letterSpacing: "-0.02em",
                  position:      "relative",
                  zIndex:        1,
                }}>
                  Crowd<span style={{ color: "var(--accent)" }}>Spark</span>
                </span>
              </Link>

              {/* center links */}
              <nav className="nav-desktop-links" style={{ display: "flex", alignItems: "center", gap: 2 }}>
                {LINKS.map(l => {
                  const active = pathname === l.href;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      style={{
                        fontFamily:     "DM Sans, sans-serif",
                        fontSize:       13.5,
                        fontWeight:     500,
                        color:          active ? "var(--accent)" : "var(--text-muted)",
                        textDecoration: "none",
                        padding:        "6px 14px",
                        borderRadius:   999,
                        background:     active ? "var(--accent-dim)" : "transparent",
                        transition:     "all 0.18s",
                        whiteSpace:     "nowrap",
                      }}
                      onMouseEnter={e => {
                        const a = e.currentTarget as HTMLAnchorElement;
                        if (!active) { a.style.color = "var(--text)"; a.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"; }
                      }}
                      onMouseLeave={e => {
                        const a = e.currentTarget as HTMLAnchorElement;
                        if (!active) { a.style.color = "var(--text-muted)"; a.style.background = "transparent"; }
                      }}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </nav>

              {/* right actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <ThemeToggle />

                {hasToken ? (
                  <Link href="/dashboard" className="nav-desktop-links" style={{
                    fontFamily:     "DM Sans, sans-serif",
                    fontSize:       13,
                    fontWeight:     600,
                    color:          "var(--text)",
                    textDecoration: "none",
                    padding:        "7px 16px",
                    borderRadius:   999,
                    border:         "1px solid var(--border)",
                    background:     "var(--bg-ghost)",
                    transition:     "border-color 0.15s",
                  }}>
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="nav-desktop-links" style={{
                      fontFamily:     "DM Sans, sans-serif",
                      fontSize:       13,
                      fontWeight:     500,
                      color:          "var(--text-muted)",
                      textDecoration: "none",
                      padding:        "7px 12px",
                      borderRadius:   999,
                      transition:     "color 0.15s",
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
                    >
                      Sign in
                    </Link>

                    {/* ── FIRE BUTTON ── */}
                    <Link href="/register" style={{
                      position:       "relative",
                      display:        "flex",
                      alignItems:     "center",
                      gap:            6,
                      fontFamily:     "Syne, sans-serif",
                      fontSize:       13,
                      fontWeight:     700,
                      color:          "#fff",
                      textDecoration: "none",
                      padding:        "8px 20px",
                      borderRadius:   999,
                      background:     "linear-gradient(135deg, #ff6b00 0%, #ff9500 50%, #ffcc00 100%)",
                      boxShadow:      "0 0 16px rgba(255,100,0,0.55), 0 2px 8px rgba(0,0,0,0.3)",
                      transition:     "transform 0.18s, box-shadow 0.18s",
                      overflow:       "hidden",
                    }}
                      onMouseEnter={e => {
                        const a = e.currentTarget as HTMLAnchorElement;
                        a.style.transform  = "translateY(-1px) scale(1.03)";
                        a.style.boxShadow  = "0 0 28px rgba(255,100,0,0.75), 0 4px 16px rgba(0,0,0,0.3)";
                      }}
                      onMouseLeave={e => {
                        const a = e.currentTarget as HTMLAnchorElement;
                        a.style.transform  = "translateY(0) scale(1)";
                        a.style.boxShadow  = "0 0 16px rgba(255,100,0,0.55), 0 2px 8px rgba(0,0,0,0.3)";
                      }}
                    >
                      {/* shimmer sweep */}
                      <span style={{
                        position:    "absolute",
                        inset:       0,
                        background:  "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                        animation:   "shimmerSweep 2.4s ease-in-out infinite",
                      }} />
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ position: "relative" }}>
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      <span style={{ position: "relative" }}>Get started</span>
                    </Link>
                  </>
                )}

                {/* hamburger */}
                <button
                  className="nav-hamburger"
                  onClick={() => setOpen(v => !v)}
                  aria-label="Toggle menu"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--text)", display: "none", borderRadius: 8 }}
                >
                  <motion.div animate={open ? "open" : "closed"}>
                    {open ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6"  x2="6"  y2="18" />
                        <line x1="6"  y1="6"  x2="18" y2="18" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6"  x2="21" y2="6"  />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                      </svg>
                    )}
                  </motion.div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Mobile dropdown (attached below island) ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,   scale: 1    }}
              exit={{    opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{
                marginTop:     8,
                borderRadius:  20,
                background:    isDark ? "rgba(8,8,14,0.90)" : "rgba(255,255,255,0.90)",
                backdropFilter:"blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border:        isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
                boxShadow:     "0 8px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,100,0,0.1)",
                padding:       "12px 16px 20px",
                display:       "flex",
                flexDirection: "column",
                gap:           2,
              }}
            >
              {/* fire line at top */}
              <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(255,120,0,0.7),rgba(255,220,0,0.9),rgba(255,120,0,0.7),transparent)", borderRadius: 1, marginBottom: 8 }} />

              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={l.href} style={{
                    display:        "block",
                    fontFamily:     "DM Sans, sans-serif",
                    fontSize:       15,
                    fontWeight:     500,
                    color:          "var(--text)",
                    textDecoration: "none",
                    padding:        "11px 12px",
                    borderRadius:   12,
                    transition:     "background 0.15s",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <Link href="/login" style={{
                  flex: 1, textAlign: "center",
                  padding: "11px 0", borderRadius: 12,
                  border: "1px solid var(--border)", background: "var(--bg-ghost)",
                  color: "var(--text)", fontFamily: "DM Sans, sans-serif",
                  fontSize: 14, fontWeight: 600, textDecoration: "none",
                }}>Sign in</Link>
                <Link href="/register" style={{
                  flex: 1, textAlign: "center",
                  padding: "11px 0", borderRadius: 12,
                  background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
                  color: "#fff", fontFamily: "Syne, sans-serif",
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                  boxShadow: "0 0 16px rgba(255,100,0,0.4)",
                }}>Get started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes shimmerSweep {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(200%); }
          100% { transform: translateX(200%); }
        }
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-hamburger      { display: flex !important; }
        }
      `}</style>
    </>
  );
}