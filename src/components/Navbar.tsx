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

export default function Navbar() {
  const { isDark }  = useTheme();
  const pathname    = usePathname();
  const navRef      = useRef<HTMLElement>(null);
  const [scrolled,  setScrolled]  = useState(false);
  const [open,      setOpen]      = useState(false);
  const [hasToken,  setHasToken]  = useState(false);

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
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
      <header
        ref={navRef}
        style={{
          position:     "fixed",
          top: 0, left: 0, right: 0,
          zIndex:       50,
          height:       68,
          borderBottom: scrolled ? "1px solid var(--card-border)" : "1px solid transparent",
          background:   scrolled ? "var(--card-bg)" : "transparent",
          boxShadow:    scrolled ? "0 4px 24px rgba(0,0,0,0.2)" : "none",
          transition:   "background 0.3s, border-color 0.3s, box-shadow 0.3s",
        }}
      >
        <div style={{
          maxWidth:       1200,
          margin:         "0 auto",
          padding:        "0 32px",
          height:         "100%",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
        }}>

          {/* logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={iconClr} />
              </svg>
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 19, color: "var(--text)", letterSpacing: "-0.02em" }}>
              Crowd<span style={{ color: "var(--accent)" }}>Spark</span>
            </span>
          </Link>

          {/* desktop nav — hidden on mobile via media query in globals */}
          <nav className="nav-desktop-links">
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily:     "DM Sans, sans-serif",
                  fontSize:       14,
                  fontWeight:     500,
                  color:          pathname === l.href ? "var(--accent)" : "var(--text-muted)",
                  textDecoration: "none",
                  transition:     "color 0.15s",
                }}
                onMouseEnter={e => { if (pathname !== l.href) (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
                onMouseLeave={e => { if (pathname !== l.href) (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* right */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />

            {hasToken ? (
              <Link href="/dashboard" className="nav-desktop-links" style={{
                fontFamily:     "DM Sans, sans-serif",
                fontSize:       13,
                fontWeight:     600,
                color:          "var(--text)",
                textDecoration: "none",
                padding:        "8px 18px",
                borderRadius:   999,
                border:         "1px solid var(--border)",
                background:     "var(--bg-ghost)",
                transition:     "border-color 0.15s, color 0.15s",
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
                  transition:     "color 0.15s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
                >
                  Sign in
                </Link>
                <Link href="/register" style={{
                  fontFamily:     "Syne, sans-serif",
                  fontSize:       13,
                  fontWeight:     700,
                  color:          iconClr,
                  textDecoration: "none",
                  padding:        "9px 22px",
                  borderRadius:   999,
                  background:     "var(--accent)",
                  boxShadow:      "0 2px 12px var(--accent-glow)",
                  whiteSpace:     "nowrap",
                  transition:     "opacity 0.15s, transform 0.15s",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                  }}
                >
                  Get started
                </Link>
              </>
            )}

            {/* hamburger — show only on mobile */}
            <button
              className="nav-hamburger"
              onClick={() => setOpen(v => !v)}
              aria-label="Toggle menu"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text)", display: "none" }}
            >
              {open ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6"  x2="6"  y2="18" />
                  <line x1="6"  y1="6"  x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6"  x2="21" y2="6"  />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{
              position:      "fixed",
              top:           68,
              left: 0, right: 0,
              zIndex:        40,
              background:    "var(--card-bg)",
              borderBottom:  "1px solid var(--card-border)",
              padding:       "16px 24px 24px",
              display:       "flex",
              flexDirection: "column",
              gap:           4,
            }}
          >
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                fontFamily:     "DM Sans, sans-serif",
                fontSize:       15,
                fontWeight:     500,
                color:          "var(--text)",
                textDecoration: "none",
                padding:        "12px 8px",
                borderBottom:   "1px solid var(--border)",
              }}>
                {l.label}
              </Link>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Link href="/login" style={{
                flex: 1, textAlign: "center",
                padding: "12px 0", borderRadius: 10,
                border: "1px solid var(--border)", background: "var(--bg-ghost)",
                color: "var(--text)", fontFamily: "DM Sans, sans-serif",
                fontSize: 14, fontWeight: 600, textDecoration: "none",
              }}>
                Sign in
              </Link>
              <Link href="/register" style={{
                flex: 1, textAlign: "center",
                padding: "12px 0", borderRadius: 10,
                background: "var(--accent)", color: iconClr,
                fontFamily: "Syne, sans-serif",
                fontSize: 14, fontWeight: 700, textDecoration: "none",
              }}>
                Get started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* responsive rules for this component */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-hamburger      { display: flex !important; }
        }
      `}</style>
    </>
  );
}