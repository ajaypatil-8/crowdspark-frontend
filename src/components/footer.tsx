"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

const COLS = {
  Product: [["Explore", "#"], ["Start Campaign", "#"], ["Pricing", "#"], ["Changelog", "#"]],
  Company: [["About", "#"], ["Blog", "#"], ["Careers", "#"], ["Press", "#"]],
  Support: [["Help Center", "#"], ["Community", "#"], ["Contact", "#"], ["Status", "#"]],
  Legal:   [["Privacy", "#"], ["Terms", "#"], ["Cookies", "#"], ["Licenses", "#"]],
};

const SOCIALS = [
  { label: "X", d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.258 5.635 5.906-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "GitHub", d: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" },
  { label: "LinkedIn", d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
];

export default function Footer() {
  const { isDark } = useTheme();
  const iconClr = isDark ? "#050508" : "#fff";

  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      background: "var(--card-bg)",
      paddingTop: 64,
      paddingBottom: 32,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* top grid */}
        <div className="footer-grid" style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
          gap: 40,
          marginBottom: 56,
        }}>

          {/* brand column */}
          <div>
            <Link href="/" className="footer-brand-link" style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 16, textDecoration: "none",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={iconClr} />
                </svg>
              </div>
              <span style={{
                fontFamily: "Syne, sans-serif", fontWeight: 700,
                fontSize: 18, color: "var(--text)", letterSpacing: "-0.02em",
              }}>
                Crowd<span style={{ color: "var(--accent)" }}>Spark</span>
              </span>
            </Link>

            <p style={{
              fontSize: 14, color: "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif", lineHeight: 1.65,
              maxWidth: 240, marginBottom: 24,
            }}>
              Empowering creators and backers to build the future, together.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {SOCIALS.map(s => (
                <a key={s.label} href="#" aria-label={s.label} className="footer-social-icon" style={{
                  width: 36, height: 36, borderRadius: 9,
                  border: "1px solid var(--border)",
                  background: "var(--bg-ghost)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-muted)", textDecoration: "none",
                  transition: "color 0.18s, border-color 0.18s, background 0.18s",
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          {Object.entries(COLS).map(([col, items]) => (
            <div key={col}>
              <p style={{
                fontFamily: "Syne, sans-serif", fontWeight: 700,
                fontSize: 11, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "var(--text)",
                marginBottom: 16,
              }}>
                {col}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map(([label, href]) => (
                  <Link key={label} href={href} className="footer-link" style={{
                    fontSize: 14, color: "var(--text-muted)",
                    fontFamily: "DM Sans, sans-serif",
                    textDecoration: "none", transition: "color 0.18s",
                  }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* newsletter */}
        <div className="footer-newsletter" style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "32px 0", marginBottom: 32,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          gap: 24, flexWrap: "wrap",
        }}>
          <div>
            <p style={{
              fontFamily: "Syne, sans-serif", fontWeight: 700,
              fontSize: 17, color: "var(--text)", marginBottom: 4,
            }}>
              Stay in the loop
            </p>
            <p style={{
              fontSize: 13, color: "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif",
            }}>
              New campaigns, creator stories, and platform updates.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <input
              type="email"
              placeholder="you@example.com"
              className="auth-input"
              style={{
                padding: "11px 16px", borderRadius: 10,
                fontSize: 13, width: 220,
              }}
            />
            <button className="btn-primary" style={{
              padding: "11px 20px", borderRadius: 10,
              border: "none", background: "var(--accent)",
              color: iconClr, fontFamily: "Syne, sans-serif",
              fontWeight: 700, fontSize: 13, cursor: "pointer",
              whiteSpace: "nowrap", boxShadow: "var(--btn-shadow)",
            }}>
              Subscribe
            </button>
          </div>
        </div>

        {/* bottom bar */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <p style={{
            fontSize: 13, color: "var(--text-muted)",
            fontFamily: "DM Sans, sans-serif",
          }}>
            © {new Date().getFullYear()} CrowdSpark. All rights reserved.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "var(--success)",
              boxShadow: "0 0 8px var(--success-dim)",
            }} />
            <span style={{
              fontSize: 12, color: "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif",
            }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-social-icon:hover {
          color: var(--accent) !important;
          border-color: var(--accent) !important;
          background: var(--accent-dim) !important;
        }
        .footer-link:hover {
          color: var(--accent) !important;
        }
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr 1fr !important;
          }
          .footer-grid > div:first-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
          .footer-newsletter {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .footer-newsletter input {
            width: 100% !important;
          }
        }
        @media (max-width: 400px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}