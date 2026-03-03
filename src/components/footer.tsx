"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

const LINKS = {
  Product:   [["Explore Projects","#"],["Start a Campaign","#"],["Pricing","#"],["Changelog","#"]],
  Company:   [["About","#"],["Blog","#"],["Careers","#"],["Press","#"]],
  Support:   [["Help Center","#"],["Community","#"],["Contact","#"],["Status","#"]],
  Legal:     [["Privacy","#"],["Terms","#"],["Cookies","#"],["Licenses","#"]],
};

const SOCIALS = [
  { label: "Twitter / X",
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.258 5.635 5.906-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { label: "GitHub",
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg> },
  { label: "LinkedIn",
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { label: "Instagram",
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg> },
];

export default function Footer() {
  const { isDark } = useTheme();
  const btnClr = isDark ? "#050508" : "#fff";

  return (
    <footer style={{
      borderTop:  "1px solid var(--border)",
      background: "var(--card-bg)",
      padding:    "64px 0 32px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* top row */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
          gap:                 40,
          marginBottom:        56,
        }}>
          {/* brand */}
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={btnClr} />
                </svg>
              </div>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)", letterSpacing: "-0.02em" }}>
                Crowd<span style={{ color: "var(--accent)" }}>Spark</span>
              </span>
            </Link>
            <p style={{
              fontSize: 14, color: "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif", lineHeight: 1.6,
              maxWidth: 260, marginBottom: 24,
            }}>
              Empowering creators and backers to build the future, together.
            </p>

            {/* socials */}
            <div style={{ display: "flex", gap: 10 }}>
              {SOCIALS.map(s => (
                <a key={s.label} href="#" aria-label={s.label}
                  style={{
                    width: 36, height: 36, borderRadius: 9,
                    border: "1px solid var(--border)",
                    background: "var(--bg-ghost)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--text-muted)", textDecoration: "none",
                    transition: "color 0.18s, border-color 0.18s, background 0.18s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color       = "var(--accent)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLAnchorElement).style.background  = "var(--accent-dim)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color       = "var(--text-muted)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLAnchorElement).style.background  = "var(--bg-ghost)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          {Object.entries(LINKS).map(([col, items]) => (
            <div key={col}>
              <p style={{
                fontFamily:    "Syne, sans-serif",
                fontWeight:    700,
                fontSize:      12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color:         "var(--text)",
                marginBottom:  16,
              }}>
                {col}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map(([label, href]) => (
                  <Link key={label} href={href} style={{
                    fontSize:       14,
                    color:          "var(--text-muted)",
                    textDecoration: "none",
                    fontFamily:     "DM Sans, sans-serif",
                    transition:     "color 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* newsletter */}
        <div style={{
          borderTop:   "1px solid var(--border)",
          borderBottom:"1px solid var(--border)",
          padding:     "32px 0",
          marginBottom: 32,
          display:     "flex",
          alignItems:  "center",
          justifyContent: "space-between",
          gap:         24,
          flexWrap:    "wrap",
        }}>
          <div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text)", marginBottom: 4 }}>
              Stay in the loop
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
              New campaigns, creator stories, and platform updates.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <input
              type="email"
              placeholder="you@example.com"
              style={{
                padding:      "11px 16px",
                borderRadius: 10,
                border:       "1px solid var(--border)",
                background:   "var(--bg-input)",
                color:        "var(--text)",
                fontFamily:   "DM Sans, sans-serif",
                fontSize:     13,
                outline:      "none",
                width:        220,
              }}
            />
            <button style={{
              padding:      "11px 20px",
              borderRadius: 10,
              border:       "none",
              background:   "var(--accent)",
              color:        btnClr,
              fontFamily:   "Syne, sans-serif",
              fontWeight:   700,
              fontSize:     13,
              cursor:       "pointer",
              whiteSpace:   "nowrap",
              transition:   "opacity 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* bottom */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
            © {new Date().getFullYear()} CrowdSpark. All rights reserved.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "glowPulse 3s ease-in-out infinite" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}