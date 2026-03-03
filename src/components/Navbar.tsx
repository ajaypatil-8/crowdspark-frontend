"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { label: "Explore",   href: "/explore"  },
  { label: "How it works", href: "/#how"  },
  { label: "Creators",  href: "/creators" },
  { label: "Pricing",   href: "/pricing"  },
];

export default function Navbar() {
  const { isDark } = useTheme();
  const pathname   = usePathname();

  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [hasToken,    setHasToken]    = useState(false);

  const btnClr = isDark ? "#050508" : "#fff";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setHasToken(!!localStorage.getItem("cs_access_token"));
  }, []);

  /* close menu on route change */
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isAuth = pathname === "/login" || pathname === "/register";
  if (isAuth) return null;

  return (
    <>
      <header className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding:  "0 32px",
          height:   68,
          display:  "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={btnClr} />
              </svg>
            </div>
            <span style={{
              fontFamily:    "Syne, sans-serif",
              fontWeight:    700,
              fontSize:      19,
              color:         "var(--text)",
              letterSpacing: "-0.02em",
            }}>
              Crowd<span style={{ color: "var(--accent)" }}>Spark</span>
            </span>
          </Link>

          {/* desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}
            className="desktop-nav">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="nav-link"
                style={{ color: pathname === l.href ? "var(--accent)" : undefined }}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* right */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
            {hasToken ? (
              <Link href="/dashboard" style={{
                fontSize:     13,
                fontFamily:   "DM Sans, sans-serif",
                fontWeight:   600,
                color:        "var(--text)",
                textDecoration: "none",
                padding:      "8px 18px",
                borderRadius: 999,
                border:       "1px solid var(--border)",
                background:   "var(--bg-ghost)",
              }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" style={{
                  fontSize: 13, fontFamily: "DM Sans, sans-serif",
                  fontWeight: 500, color: "var(--text-muted)",
                  textDecoration: "none",
                }}>
                  Sign in
                </Link>
                <Link href="/register" style={{
                  fontSize:     13,
                  fontFamily:   "DM Sans, sans-serif",
                  fontWeight:   600,
                  color:        btnClr,
                  textDecoration: "none",
                  padding:      "9px 20px",
                  borderRadius: 999,
                  background:   "var(--accent)",
                  boxShadow:    "0 2px 12px var(--accent-glow)",
                  whiteSpace:   "nowrap",
                }}>
                  Get started
                </Link>
              </>
            )}

            {/* hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="hamburger"
              style={{
                display:    "none",
                background: "none",
                border:     "none",
                cursor:     "pointer",
                padding:    4,
                color:      "var(--text)",
              }}
            >
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6"  y2="18" />
                  <line x1="6"  y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6"  x2="21" y2="6"  />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            style={{
              position:   "fixed",
              top:        68,
              left:       0, right: 0,
              zIndex:     99,
              background: "var(--card-bg)",
              borderBottom: "1px solid var(--card-border)",
              padding:    "16px 24px 24px",
              display:    "flex",
              flexDirection: "column",
              gap:        4,
            }}
          >
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                fontFamily:     "DM Sans, sans-serif",
                fontSize:       15,
                fontWeight:     500,
                color:          pathname === l.href ? "var(--accent)" : "var(--text)",
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
                background: "var(--accent)", color: btnClr,
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14, fontWeight: 700, textDecoration: "none",
              }}>
                Get started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger   { display: flex !important; }
        }
      `}</style>
    </>
  );
}