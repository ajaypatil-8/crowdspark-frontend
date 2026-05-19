"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

const LICENSES = [
  {
    category: "Frontend Framework",
    packages: [
      { name: "Next.js", version: "15.3.1", license: "MIT", author: "Vercel, Inc.", url: "https://nextjs.org" },
      { name: "React", version: "19.0.0", license: "MIT", author: "Meta Platforms, Inc.", url: "https://react.dev" },
      { name: "TypeScript", version: "5.x", license: "Apache 2.0", author: "Microsoft Corporation", url: "https://typescriptlang.org" },
    ],
  },
  {
    category: "Animation & UI",
    packages: [
      { name: "Framer Motion", version: "12.x", license: "MIT", author: "Framer B.V.", url: "https://framer.com/motion" },
      { name: "GSAP", version: "3.x", license: "GSAP Standard License", author: "GreenSock, LLC", url: "https://gsap.com" },
      { name: "Lucide React", version: "0.x", license: "ISC", author: "Lucide Contributors", url: "https://lucide.dev" },
      { name: "Lenis", version: "1.x", license: "MIT", author: "Studio Freight", url: "https://github.com/studio-freight/lenis" },
    ],
  },
  {
    category: "Styling",
    packages: [
      { name: "Tailwind CSS", version: "4.x", license: "MIT", author: "Tailwind Labs, Inc.", url: "https://tailwindcss.com" },
      { name: "PostCSS", version: "8.x", license: "MIT", author: "PostCSS Contributors", url: "https://postcss.org" },
    ],
  },
  {
    category: "Payments & Verification",
    packages: [
      { name: "Razorpay JS SDK", version: "latest", license: "Proprietary", author: "Razorpay Software Pvt. Ltd.", url: "https://razorpay.com" },
      { name: "DigiLocker API", version: "v3", license: "Government Open Data", author: "Ministry of Electronics & IT, India", url: "https://digilocker.gov.in" },
    ],
  },
  {
    category: "Backend & Infrastructure",
    packages: [
      { name: "Node.js", version: "22.x", license: "MIT", author: "OpenJS Foundation", url: "https://nodejs.org" },
      { name: "Express", version: "5.x", license: "MIT", author: "OpenJS Foundation", url: "https://expressjs.com" },
      { name: "PostgreSQL", version: "17.x", license: "PostgreSQL License", author: "PostgreSQL Global Development Group", url: "https://postgresql.org" },
      { name: "Redis", version: "7.x", license: "RSALv2 / SSPL v1", author: "Redis Ltd.", url: "https://redis.io" },
      { name: "AWS SDK for JS", version: "3.x", license: "Apache 2.0", author: "Amazon Web Services, Inc.", url: "https://aws.amazon.com/sdk-for-javascript" },
    ],
  },
  {
    category: "Security & Auth",
    packages: [
      { name: "jsonwebtoken", version: "9.x", license: "MIT", author: "Auth0, Inc.", url: "https://github.com/auth0/node-jsonwebtoken" },
      { name: "bcryptjs", version: "2.x", license: "MIT", author: "Daniel Wirtz", url: "https://github.com/dcodeIO/bcrypt.js" },
      { name: "helmet", version: "7.x", license: "MIT", author: "Adam Baldwin", url: "https://helmetjs.github.io" },
    ],
  },
  {
    category: "Fonts",
    packages: [
      { name: "Syne", version: "Variable", license: "SIL Open Font License 1.1", author: "Lucas Descroix", url: "https://fonts.google.com/specimen/Syne" },
      { name: "DM Sans", version: "Variable", license: "SIL Open Font License 1.1", author: "Colophon Foundry", url: "https://fonts.google.com/specimen/DM+Sans" },
    ],
  },
];

const LICENSE_COLORS: Record<string, { color: string; bg: string }> = {
  "MIT":                      { color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  "Apache 2.0":               { color: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  "ISC":                      { color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  "GSAP Standard License":    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  "Proprietary":              { color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
  "Government Open Data":     { color: "#ff8800", bg: "rgba(255,136,0,0.1)"   },
  "PostgreSQL License":       { color: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  "RSALv2 / SSPL v1":         { color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  "SIL Open Font License 1.1":{ color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
};

export default function LicensesPage() {
  const { isDark } = useTheme();
  const [openCategory, setOpenCategory] = useState<string | null>(LICENSES[0].category);
  const [search, setSearch] = useState("");

  const totalPackages = LICENSES.reduce((sum, cat) => sum + cat.packages.length, 0);

  const filtered = search
    ? LICENSES.map(cat => ({
        ...cat,
        packages: cat.packages.filter(pkg =>
          pkg.name.toLowerCase().includes(search.toLowerCase()) ||
          pkg.license.toLowerCase().includes(search.toLowerCase()) ||
          pkg.author.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.packages.length > 0)
    : LICENSES;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "80px 44px 64px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(167,139,250,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", color: "var(--text)", margin: "0 0 12px", letterSpacing: "-0.03em" }}>Open Source Licenses</h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "var(--text-muted)", maxWidth: 540, margin: "0 auto 32px", lineHeight: 1.7 }}>
            CrowdSpark is built on the shoulders of giants. We're grateful to the open-source community for the {totalPackages}+ libraries that power our platform.
          </p>
          {/* Search */}
          <div style={{ maxWidth: 420, margin: "0 auto", position: "relative" }}>
            <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="15" height="15"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search packages or licenses…" style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 44px 96px" }}>
        {/* Summary chips */}
        {!search && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 40 }}>
            {[
              { label: `${totalPackages} packages`, color: "#a78bfa" },
              { label: "MIT", color: "#34d399" },
              { label: "Apache 2.0", color: "#60a5fa" },
              { label: "Open Font", color: "#34d399" },
              { label: "100% audited", color: "#ff8800" },
            ].map((chip, i) => (
              <span key={i} style={{ padding: "6px 14px", borderRadius: 999, background: `${chip.color}18`, border: `1px solid ${chip.color}30`, fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 700, color: chip.color }}>
                {chip.label}
              </span>
            ))}
          </div>
        )}

        {/* License categories accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((cat, ci) => (
            <motion.div key={cat.category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}>
              <div style={{ borderRadius: 20, overflow: "hidden", border: `1px solid ${openCategory === cat.category ? "rgba(167,139,250,0.4)" : "var(--border)"}`, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", transition: "border-color 0.2s" }}>
                <button onClick={() => setOpenCategory(openCategory === cat.category ? null : cat.category)} style={{ width: "100%", padding: "18px 22px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}>
                  <div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{cat.category}</div>
                    <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{cat.packages.length} package{cat.packages.length !== 1 ? "s" : ""}</div>
                  </div>
                  <svg style={{ color: "var(--text-muted)", transform: openCategory === cat.category ? "rotate(180deg)" : "", transition: "transform 0.25s", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>
                </button>

                <AnimatePresence>
                  {(openCategory === cat.category || search) && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                      <div style={{ borderTop: "1px solid var(--border)" }}>
                        {cat.packages.map((pkg, pi) => {
                          const lc = LICENSE_COLORS[pkg.license] || { color: "#9ca3af", bg: "rgba(156,163,175,0.1)" };
                          return (
                            <div key={pi} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderBottom: pi < cat.packages.length - 1 ? "1px solid var(--border)" : "none" }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                  <a href={pkg.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", textDecoration: "none" }}
                                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#a78bfa")}
                                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "")}>
                                    {pkg.name}
                                  </a>
                                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", padding: "2px 7px", borderRadius: 6, background: "var(--bg-ghost)", border: "1px solid var(--border)" }}>v{pkg.version}</span>
                                </div>
                                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{pkg.author}</div>
                              </div>
                              <span style={{ padding: "4px 12px", borderRadius: 999, background: lc.bg, border: `1px solid ${lc.color}30`, fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700, color: lc.color, flexShrink: 0, whiteSpace: "nowrap" }}>
                                {pkg.license}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>No packages found</div>
            <div style={{ fontSize: 13 }}>Try a different search term.</div>
          </div>
        )}

        {/* Notice */}
        <div style={{ marginTop: 48, padding: "24px 28px", borderRadius: 18, background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 8 }}>📌 Notice</div>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            This page lists the primary open-source dependencies used in CrowdSpark's platform. The full list of transitive dependencies is available in our{" "}
            <a href="https://github.com/crowdspark" target="_blank" rel="noopener noreferrer" style={{ color: "#a78bfa", textDecoration: "none" }}>GitHub repository</a>.{" "}
            For licensing queries, contact <a href="mailto:legal@crowdspark.in" style={{ color: "#a78bfa", textDecoration: "none" }}>legal@crowdspark.in</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
