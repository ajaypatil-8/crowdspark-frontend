"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const COLS = {
  Platform: [
    ["Explore campaigns", "/explore"],
    ["Start a campaign",  "/register"],
    ["Pricing",          "/pricing"],
    ["How it works",     "/how-it-works"],
    ["Changelog",        "#"],
  ],
  Company: [
    ["About us",  "/about"],
    ["Creators",  "/creators"],
    ["Blog",      "#"],
    ["Careers",   "#"],
    ["Press",     "#"],
  ],
  Support: [
    ["Help center",   "/help"],
    ["Community",     "#"],
    ["Contact us",    "/contact"],
    ["Status",        "#"],
    ["FAQ",           "/faq"],
  ],
  Legal: [
    ["Privacy policy",   "/privacy"],
    ["Terms of service", "/terms"],
    ["Cookie policy",    "#"],
    ["Licenses",         "#"],
  ],
};

const SOCIALS = [
  {
    label: "X / Twitter", href: "#",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.258 5.635 5.906-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    label: "Instagram", href: "#",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  },
  {
    label: "LinkedIn", href: "#",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  },
  {
    label: "GitHub", href: "#",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>,
  },
];

const TRUST_ITEMS = [
  { icon: "⚡", label: "No hidden fees" },
  { icon: "🔒", label: "Escrow protected" },
  { icon: "🇮🇳", label: "UPI & NetBanking" },
  { icon: "📋", label: "GST compliant" },
];

export default function Footer() {
  const { isDark } = useTheme();
  const [email, setEmail]           = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError]     = useState(false);
  const canvasRef                   = useRef<HTMLCanvasElement>(null);

  // Animated ambient canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);
    let frame = 0;
    const orbs = [
      { x: 0.15, y: 0.5,  r: 0.35, vx:  0.0003, vy:  0.0002, hue: 22,  a: isDark ? 0.07 : 0.04 },
      { x: 0.85, y: 0.3,  r: 0.28, vx: -0.0002, vy:  0.0003, hue: 195, a: isDark ? 0.06 : 0.035 },
      { x: 0.5,  y: 0.8,  r: 0.22, vx:  0.0002, vy: -0.0002, hue: 270, a: isDark ? 0.05 : 0.03  },
    ];
    const W = () => canvas.offsetWidth, H = () => canvas.offsetHeight;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      frame++;
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -0.1 || o.x > 1.1) o.vx *= -1;
        if (o.y < -0.1 || o.y > 1.1) o.vy *= -1;
        const gx = o.x * w, gy = o.y * h, gr = o.r * Math.min(w, h);
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        g.addColorStop(0, `hsla(${o.hue},80%,${isDark ? 58 : 50}%,${o.a})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.fill();
      });
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [isDark]);

  const handleSubscribe = () => {
    if (!email.includes("@") || !email.includes(".")) { setSubError(true); setTimeout(() => setSubError(false), 2000); return; }
    setSubscribed(true);
  };

  const iconClr = isDark ? "#050508" : "#fff";

  return (
    <footer className="ft-root">
      {/* Ambient canvas */}
      <canvas ref={canvasRef} className="ft-canvas" aria-hidden />

      {/* Top glow line */}
      <div className="ft-top-glow" aria-hidden />

      <div className="ft-inner">

        {/* ── Top Section: Brand + Newsletter ── */}
        <div className="ft-top">

          {/* Brand */}
          <div className="ft-brand-col">
            <Link href="/" className="ft-brand-link">
              <div className="ft-logo-mark">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={iconClr} />
                </svg>
              </div>
              <span className="ft-logo-text">
                Crowd<span style={{ color: "#ff8800" }}>Spark</span>
              </span>
            </Link>

            <p className="ft-tagline">
              Empowering creators and backers to build the future, together. India&apos;s most trusted crowdfunding platform.
            </p>

            {/* Social icons */}
            <div className="ft-socials">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label} className="ft-social">
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Trust items */}
            <div className="ft-trust-grid">
              {TRUST_ITEMS.map((t, i) => (
                <div key={i} className="ft-trust-item">
                  <span className="ft-trust-icon">{t.icon}</span>
                  <span className="ft-trust-label">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="ft-newsletter">
            <div className="ft-newsletter-inner">
              <div className="ft-nl-top-line" aria-hidden />
              <div className="ft-nl-corner ft-nl-corner-tl" aria-hidden />
              <div className="ft-nl-corner ft-nl-corner-br" aria-hidden />

              <div className="ft-nl-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>

              <h3 className="ft-nl-title">Stay in the loop</h3>
              <p className="ft-nl-sub">
                New campaigns, creator stories, and platform updates — delivered weekly. No spam, ever.
              </p>

              {subscribed ? (
                <div className="ft-nl-success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                  You&apos;re subscribed! Watch your inbox.
                </div>
              ) : (
                <div className="ft-nl-form">
                  <div className={`ft-nl-input-wrap ${subError ? "ft-nl-error" : ""}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="14" height="14" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setSubError(false); }}
                      onKeyDown={e => e.key === "Enter" && handleSubscribe()}
                      placeholder="you@example.com"
                      className="ft-nl-input"
                    />
                  </div>
                  <button onClick={handleSubscribe} className="ft-nl-btn">
                    Subscribe
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="13" height="13"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
                  </button>
                </div>
              )}

              {subError && (
                <p className="ft-nl-err-msg">Please enter a valid email address.</p>
              )}

              <p className="ft-nl-note">
                By subscribing you agree to our <Link href="/privacy" style={{ color: "var(--text-sub)", textDecoration: "none" }}>Privacy Policy</Link>. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="ft-divider" />

        {/* ── Link Columns ── */}
        <div className="ft-links">
          {Object.entries(COLS).map(([col, items]) => (
            <div key={col} className="ft-col">
              <h4 className="ft-col-head">{col}</h4>
              <ul className="ft-col-list">
                {items.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="ft-link">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Platform stats mini column */}
          <div className="ft-col">
            <h4 className="ft-col-head">Platform</h4>
            <div className="ft-mini-stats">
              {[
                { v: "1,240+", l: "Campaigns funded" },
                { v: "₹2.3Cr",  l: "Total raised" },
                { v: "18,400", l: "Active backers" },
                { v: "78%",    l: "Success rate" },
              ].map((s, i) => (
                <div key={i} className="ft-mini-stat">
                  <div className="ft-mini-stat-val">{s.v}</div>
                  <div className="ft-mini-stat-label">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="ft-divider" />

        {/* ── Bottom Bar ── */}
        <div className="ft-bottom">
          <div className="ft-bottom-left">
            <p className="ft-copy">
              © {new Date().getFullYear()} CrowdSpark Technologies Pvt. Ltd.
            </p>
            <span className="ft-bottom-sep" aria-hidden>·</span>
            <p className="ft-made">Made with ♥ in India 🇮🇳</p>
          </div>

          <div className="ft-bottom-right">
            {/* System status */}
            <div className="ft-status">
              <div className="ft-status-dot" />
              <span>All systems operational</span>
            </div>

            {/* Locale */}
            <div className="ft-locale">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="13" height="13">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              India · ₹ INR · English
            </div>
          </div>
        </div>

      </div>

      {/* ── Styles ── */}
      <style>{`
        /* ── Root ── */
        .ft-root {
          position: relative; overflow: hidden;
          border-top: 1px solid var(--border);
          background: var(--bg-2);
        }
        .ft-canvas {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
          opacity: 0.7;
        }
        .ft-top-glow {
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,107,0,0.45) 28%, rgba(255,204,0,0.6) 50%, rgba(255,107,0,0.45) 72%, transparent);
          pointer-events: none; z-index: 1;
        }
        .ft-inner {
          position: relative; z-index: 2;
          max-width: 1200px; margin: 0 auto;
          padding: 72px 44px 44px;
        }

        /* ── Top ── */
        .ft-top {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 56px;
          margin-bottom: 56px;
          align-items: start;
        }

        /* Brand column */
        .ft-brand-link {
          display: inline-flex; align-items: center; gap: 10px;
          text-decoration: none; margin-bottom: 16px;
        }
        .ft-logo-mark {
          width: 36px; height: 36px; border-radius: 11px;
          background: linear-gradient(135deg,#ff5500,#ffcc00);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 0 18px rgba(255,100,0,0.4);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .ft-brand-link:hover .ft-logo-mark {
          transform: scale(1.08) rotate(4deg);
          box-shadow: 0 0 28px rgba(255,100,0,0.55);
        }
        .ft-logo-text {
          font-family: "Syne", sans-serif; font-weight: 800; font-size: 19px;
          color: var(--text); letter-spacing: -0.025em;
        }
        .ft-tagline {
          font-family: "DM Sans", sans-serif; font-size: 13.5px;
          color: var(--text-muted); line-height: 1.72; max-width: 300px;
          margin: 0 0 22px;
        }
        .ft-socials {
          display: flex; gap: 8px; margin-bottom: 28px;
        }
        .ft-social {
          width: 36px; height: 36px; border-radius: 10px;
          border: 1px solid var(--border); background: var(--bg-ghost);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); text-decoration: none;
          transition: all 0.18s ease;
        }
        .ft-social:hover {
          color: #ff8800; border-color: rgba(255,107,0,0.4);
          background: rgba(255,107,0,0.08); transform: translateY(-2px);
        }

        /* Trust grid */
        .ft-trust-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .ft-trust-item {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 12px; border-radius: 10px;
          background: var(--card-bg); border: 1px solid var(--card-border);
          transition: border-color 0.18s;
        }
        .ft-trust-item:hover { border-color: rgba(255,107,0,0.3); }
        .ft-trust-icon { font-size: 15px; flex-shrink: 0; }
        .ft-trust-label {
          font-family: "DM Sans", sans-serif; font-size: 12px;
          font-weight: 600; color: var(--text-sub);
        }

        /* ── Newsletter ── */
        .ft-newsletter { }
        .ft-newsletter-inner {
          padding: 32px 30px; border-radius: 22px;
          background: var(--card-bg); border: 1px solid var(--card-border);
          position: relative; overflow: hidden;
          box-shadow: var(--card-shadow);
        }
        .ft-nl-top-line {
          position: absolute; top: 0; left: "8%"; right: "8%"; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255,107,0,0.7) 30%, rgba(255,204,0,0.8) 50%, rgba(255,107,0,0.7) 70%, transparent);
        }
        .ft-nl-corner {
          position: absolute; width: 44px; height: 44px; pointer-events: none;
        }
        .ft-nl-corner-tl {
          top: 10px; right: 10px;
          border-top: 1.5px solid rgba(255,136,0,0.18);
          border-right: 1.5px solid rgba(255,136,0,0.18);
          border-radius: 0 10px 0 0;
        }
        .ft-nl-corner-br {
          bottom: 10px; left: 10px;
          border-bottom: 1.5px solid rgba(96,165,250,0.14);
          border-left: 1.5px solid rgba(96,165,250,0.14);
          border-radius: 0 0 0 10px;
        }

        .ft-nl-icon {
          width: 44px; height: 44px; border-radius: 13px;
          background: rgba(255,107,0,0.09); border: 1px solid rgba(255,107,0,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #ff8800; margin-bottom: 14px;
        }
        .ft-nl-title {
          font-family: "Syne", sans-serif; font-weight: 800; font-size: 18px;
          color: var(--text); margin: 0 0 7px; letter-spacing: -0.02em;
        }
        .ft-nl-sub {
          font-family: "DM Sans", sans-serif; font-size: 13px;
          color: var(--text-muted); line-height: 1.68; margin: 0 0 20px;
        }

        .ft-nl-form { display: flex; gap: 8px; }
        .ft-nl-input-wrap {
          flex: 1; display: flex; align-items: center; gap: 8px;
          padding: 10px 13px; border-radius: 11px;
          background: var(--bg); border: 1.5px solid var(--border);
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .ft-nl-input-wrap:focus-within {
          border-color: rgba(255,107,0,0.55);
          box-shadow: 0 0 0 3px rgba(255,107,0,0.1);
        }
        .ft-nl-input-wrap.ft-nl-error {
          border-color: rgba(239,68,68,0.6);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
          animation: ft-shake 0.35s ease;
        }
        .ft-nl-input {
          flex: 1; background: none; border: none; outline: none;
          font-family: "DM Sans", sans-serif; font-size: 13.5px;
          color: var(--text); min-width: 0;
        }
        .ft-nl-input::placeholder { color: var(--text-muted); }
        .ft-nl-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 18px; border-radius: 11px; border: none; cursor: pointer;
          background: linear-gradient(135deg,#ff5500,#ff8800);
          color: #fff; font-family: "Syne", sans-serif; font-weight: 700;
          font-size: 13px; white-space: nowrap;
          box-shadow: 0 0 20px rgba(255,100,0,0.3);
          transition: all 0.18s ease;
        }
        .ft-nl-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 24px rgba(255,100,0,0.42); }
        .ft-nl-btn:active { transform: translateY(0); }

        .ft-nl-success {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 14px; border-radius: 11px;
          background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.25);
          font-family: "DM Sans", sans-serif; font-size: 13.5px;
          color: #34d399; margin-bottom: 12px;
        }
        .ft-nl-err-msg {
          font-family: "DM Sans", sans-serif; font-size: 12px;
          color: #ef4444; margin: 8px 0 0;
        }
        .ft-nl-note {
          font-family: "DM Sans", sans-serif; font-size: 11px;
          color: var(--text-muted); margin: 12px 0 0; line-height: 1.6;
        }

        /* ── Divider ── */
        .ft-divider {
          height: 1px;
          background: var(--border);
          margin: 0 0 44px;
        }

        /* ── Links ── */
        .ft-links {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 28px;
          margin-bottom: 44px;
        }
        .ft-col-head {
          font-family: "Syne", sans-serif; font-weight: 700; font-size: 11px;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--text); margin: 0 0 16px;
        }
        .ft-col-list {
          list-style: none; margin: 0; padding: 0;
          display: flex; flex-direction: column; gap: 10px;
        }
        .ft-link {
          font-family: "DM Sans", sans-serif; font-size: 13.5px;
          color: var(--text-muted); text-decoration: none;
          transition: color 0.15s ease;
          display: inline-flex; align-items: center;
        }
        .ft-link:hover { color: #ff8800; }

        /* Mini stats */
        .ft-mini-stats { display: flex; flex-direction: column; gap: 12px; }
        .ft-mini-stat {
          padding: 10px 12px; border-radius: 10px;
          background: var(--card-bg); border: 1px solid var(--card-border);
          transition: border-color 0.18s;
        }
        .ft-mini-stat:hover { border-color: rgba(255,107,0,0.3); }
        .ft-mini-stat-val {
          font-family: "Syne", sans-serif; font-weight: 800; font-size: 15px;
          color: var(--text); letter-spacing: -0.02em; line-height: 1;
        }
        .ft-mini-stat-label {
          font-family: "DM Sans", sans-serif; font-size: 11px;
          color: var(--text-muted); margin-top: 3px;
        }

        /* ── Bottom bar ── */
        .ft-bottom {
          display: flex; align-items: center;
          justify-content: space-between;
          flex-wrap: wrap; gap: 14px;
        }
        .ft-bottom-left {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .ft-copy, .ft-made {
          font-family: "DM Sans", sans-serif; font-size: 13px;
          color: var(--text-muted); margin: 0;
        }
        .ft-bottom-sep { color: var(--border); font-size: 16px; }
        .ft-bottom-right {
          display: flex; align-items: center; gap: 20px;
        }
        .ft-status {
          display: flex; align-items: center; gap: 7px;
          font-family: "DM Sans", sans-serif; font-size: 12px;
          color: var(--text-muted);
        }
        .ft-status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399; flex-shrink: 0;
          box-shadow: 0 0 8px rgba(52,211,153,0.6);
          animation: ft-pulse 2s ease-in-out infinite;
        }
        .ft-locale {
          display: flex; align-items: center; gap: 5px;
          font-family: "DM Sans", sans-serif; font-size: 12px;
          color: var(--text-muted);
        }

        /* ── Keyframes ── */
        @keyframes ft-pulse {
          0%,100%{opacity:0.55;} 50%{opacity:1;}
        }
        @keyframes ft-shake {
          0%,100%{transform:translateX(0);}
          20%{transform:translateX(-5px);}
          40%{transform:translateX(5px);}
          60%{transform:translateX(-4px);}
          80%{transform:translateX(4px);}
        }

        /* ── Responsive ── */
        @media(max-width:1000px){
          .ft-top { grid-template-columns:1fr; gap:40px; }
          .ft-links { grid-template-columns:repeat(3,1fr); }
        }
        @media(max-width:768px){
          .ft-inner { padding:56px 24px 36px; }
          .ft-links { grid-template-columns:repeat(2,1fr); gap:24px; }
          .ft-bottom { flex-direction:column; align-items:flex-start; }
          .ft-bottom-right { flex-direction:column; align-items:flex-start; gap:10px; }
        }
        @media(max-width:480px){
          .ft-links { grid-template-columns:1fr 1fr; gap:20px; }
          .ft-nl-form { flex-direction:column; }
          .ft-trust-grid { grid-template-columns:1fr; }
          .ft-top { gap:32px; }
        }
      `}</style>
    </footer>
  );
}