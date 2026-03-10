"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCursor } from "@/hooks/usecursor";

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */
const FUNDED_COUNT = "12,400+";

const STATS = [
  { num: FUNDED_COUNT, label: "Projects funded" },
  { num: "₹98M",      label: "Raised total" },
  { num: "3,40,000+",  label: "Active backers" },
  { num: "94%",        label: "Success rate" },
];

const FEATURES = [
  { icon: "⚡", title: "Lightning fast setup",  desc: "Launch your campaign in under 5 minutes. No paperwork, no gatekeepers." },
  { icon: "🔒", title: "Secure & transparent",  desc: "Funds held in escrow, released on milestones. Full audit trail for every ₹." },
  { icon: "🌍", title: "Built for India",        desc: "UPI, NetBanking, wallet support. GST-compliant invoicing out of the box." },
  { icon: "📊", title: "Real-time analytics",   desc: "Live dashboards tracking backers, conversions, and traffic in one place." },
  { icon: "🤝", title: "Community first",        desc: "A network of verified backers who actively discover campaigns daily." },
  { icon: "🎯", title: "Smart matching",         desc: "AI surfaces your project to people who genuinely care about your category." },
];

const PROJECTS = [
  { title: "AgroSense IoT",     cat: "AgriTech",       raised: "₹18.4L", pct: 92,  days: 4,  backers: 1240, clr: "#00f5d4" },
  { title: "Svara Music App",   cat: "Music & Art",    raised: "₹9.2L",  pct: 92,  days: 11, backers: 873,  clr: "#a78bfa" },
  { title: "CleanSip Purifier", cat: "CleanTech",      raised: "₹24.8L", pct: 99,  days: 2,  backers: 3102, clr: "#34d399" },
  { title: "Rethread Fashion",  cat: "Sustainability", raised: "₹6.1L",  pct: 51,  days: 19, backers: 540,  clr: "#f59e0b" },
];

const AVATAR_COLORS = ["#00c9a7", "#a78bfa", "#f59e0b", "#34d399", "#f87171"];

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { cursorRef, followerRef } = useCursor();

  const badgeRef  = useRef<HTMLDivElement>(null);
  const h1Ref     = useRef<HTMLHeadingElement>(null);
  const subRef    = useRef<HTMLParagraphElement>(null);
  const ctaRef    = useRef<HTMLDivElement>(null);
  const hintRef   = useRef<HTMLDivElement>(null);
  const statsRef  = useRef<HTMLDivElement>(null);
  const featRef   = useRef<HTMLDivElement>(null);
  const projRef   = useRef<HTMLDivElement>(null);
  const ctaBanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* hero entrance */
      gsap.fromTo(
        [badgeRef.current, h1Ref.current, subRef.current, ctaRef.current],
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.4 }
      );

      /* scroll hint pulse */
      gsap.fromTo(hintRef.current,
        { opacity: 0, y: 8 },
        {
          opacity: 0.5, y: 0, duration: 0.9, delay: 2.2, ease: "power2.out",
          yoyo: true, repeat: -1, repeatDelay: 0.8,
        }
      );

      /* stats reveal */
      gsap.fromTo(
        statsRef.current?.querySelectorAll(".stat-item") ?? [],
        { y: 36, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: "power2.out",
          /* note: camelCase `scrollTrigger` is the GSAP 3 shorthand property,
             distinct from the `ScrollTrigger` plugin class */
          scrollTrigger: { trigger: statsRef.current, start: "top 82%" },
        }
      );

      /* features reveal */
      gsap.fromTo(
        featRef.current?.querySelectorAll(".feat-card") ?? [],
        { y: 55, opacity: 0, scale: 0.96 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.08, ease: "back.out(1.3)",
          scrollTrigger: { trigger: featRef.current, start: "top 76%" },
        }
      );

      /* projects reveal */
      gsap.fromTo(
        projRef.current?.querySelectorAll(".proj-card") ?? [],
        { y: 55, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: projRef.current, start: "top 78%" },
        }
      );

      /* progress bar fill on scroll */
      projRef.current?.querySelectorAll<HTMLElement>(".prog-fill").forEach(bar => {
        const pct = Number(bar.dataset.pct) || 0;
        ScrollTrigger.create({
          trigger: bar,
          start: "top 88%",
          once: true,
          onEnter: () => gsap.to(bar, {
            width: `${Math.min(pct, 100)}%`,
            duration: 1.4,
            ease: "power2.out",
          }),
        });
      });

      /* CTA banner */
      gsap.fromTo(ctaBanRef.current,
        { scale: 0.92, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.5)",
          scrollTrigger: { trigger: ctaBanRef.current, start: "top 84%" },
        }
      );

      /* section headings */
      gsap.utils.toArray<HTMLElement>(".sec-head").forEach(el =>
        gsap.fromTo(el,
          { x: -28, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.65, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 87%" },
          }
        )
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "hidden" }}>

      {/* decorative — hidden from assistive tech */}
      <div ref={cursorRef} className="cursor" aria-hidden="true" />
      <div ref={followerRef} className="cursor-follower" aria-hidden="true" />
      <div className="dot-grid" aria-hidden="true" />
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section
        className="hp-hero"
        aria-label="Hero"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "stretch",
          overflow: "hidden",
        }}
      >
        {/* ── LEFT: text ── */}
        <div
          className="hp-hero-left"
          style={{
            flex: "0 0 50%",
            display: "flex",
            alignItems: "center",
            padding: "120px 0 80px 48px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ maxWidth: 540 }}>
            {/* badge */}
            <div
              ref={badgeRef}
              className="hp-animated-el"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 999,
                border: "1px solid var(--card-border)",
                background: "var(--accent-dim)",
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  color: "var(--accent)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                Live now
              </span>
              <span
                style={{
                  width: 1,
                  height: 12,
                  background: "var(--card-border)",
                }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-sub)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {FUNDED_COUNT} campaigns funded
              </span>
            </div>

            {/* heading */}
            <h1
              ref={h1Ref}
              className="hp-animated-el"
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(40px, 4.5vw, 72px)",
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                color: "var(--text)",
                marginBottom: 24,
              }}
            >
              Where{" "}
              <span className="hero-gradient">bold ideas</span>
              <br />
              find their{" "}
              <span
                style={{
                  color: "var(--accent)",
                  textShadow: "0 0 40px rgba(0,245,212,0.4)",
                }}
              >
                spark.
              </span>
            </h1>

            {/* subtitle */}
            <p
              ref={subRef}
              className="hp-animated-el"
              style={{
                fontSize: "clamp(15px, 1.6vw, 18px)",
                color: "var(--text-muted)",
                fontFamily: "DM Sans, sans-serif",
                lineHeight: 1.75,
                maxWidth: 420,
                marginBottom: 40,
              }}
            >
              India&#39;s most trusted crowdfunding platform — built for
              creators, innovators, and everyone who believes in them.
            </p>

            {/* CTAs */}
            <div
              ref={ctaRef}
              className="hp-animated-el"
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginBottom: 56,
              }}
            >
              <Link href="/register" className="hp-btn-primary">
                Start your campaign
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/explore" className="hp-btn-ghost">
                Explore projects
              </Link>
            </div>

            {/* social proof */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{ display: "flex" }}
                role="presentation"
                aria-hidden="true"
              >
                {AVATAR_COLORS.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: c,
                      border: "2px solid var(--bg)",
                      marginLeft: i > 0 ? -10 : 0,
                      zIndex: 5 - i,
                      position: "relative",
                    }}
                  />
                ))}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <strong style={{ color: "var(--text)" }}>3,40,000+</strong>{" "}
                backers already here
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: decorative canvas ── */}
        <div
          className="hp-hero-right"
          aria-hidden="true"
          style={{
            flex: "0 0 52%",
            position: "relative",
            zIndex: 2,
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* ambient gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 65% 55% at 55% 50%, rgba(0,200,160,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* floating orbs */}
          <div className="hp-orb hp-orb-lg" />
          <div className="hp-orb hp-orb-md" />
          <div className="hp-orb hp-orb-sm" />

          {/* left edge fade into text column */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: 120,
              background: "linear-gradient(to right, var(--bg), transparent)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        </div>

        {/* bottom fade into stats section */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 160,
            background:
              "linear-gradient(to top, var(--bg) 0%, transparent 100%)",
            zIndex: 4,
            pointerEvents: "none",
          }}
        />

        {/* scroll hint */}
        <div
          ref={hintRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <svg width="18" height="26" viewBox="0 0 18 26" fill="none">
            <rect
              x="1"
              y="1"
              width="16"
              height="24"
              rx="8"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
            <rect
              x="7.5"
              y="5"
              width="3"
              height="6"
              rx="1.5"
              fill="var(--accent)"
            />
          </svg>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section
        ref={statsRef}
        className="hp-section"
        aria-label="Platform statistics"
        style={{
          padding: "72px 48px",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          background: "var(--card-bg)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="hp-stats-grid"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 24,
          }}
        >
          {STATS.map(s => (
            <div
              key={s.label}
              className="stat-item hp-animated-el"
              style={{ textAlign: "center" }}
            >
              <div className="stat-num">{s.num}</div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  fontFamily: "DM Sans, sans-serif",
                  marginTop: 6,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section
        ref={featRef}
        className="hp-section"
        aria-label="Features"
        style={{
          padding: "96px 48px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="sec-head" style={{ marginBottom: 52 }}>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 12,
              }}
            >
              Why CrowdSpark
            </p>
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(32px,4vw,48px)",
                color: "var(--text)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Everything you need
              <br />
              to launch and grow
            </h2>
          </div>

          <div
            className="hp-features-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 18,
            }}
          >
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="feat-card hp-feature-card hp-animated-el"
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "var(--accent-dim)",
                    border: "1px solid var(--card-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    marginBottom: 18,
                  }}
                  aria-hidden="true"
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    color: "var(--text)",
                    marginBottom: 10,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-muted)",
                    fontFamily: "DM Sans, sans-serif",
                    lineHeight: 1.7,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PROJECTS ════���══════════════ */}
      <section
        ref={projRef}
        aria-label="Trending campaigns"
        style={{
          padding: "80px 48px",
          background: "var(--card-bg)",
          borderTop: "1px solid var(--border)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 44,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div className="sec-head">
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 12,
                }}
              >
                Trending now
              </p>
              <h2
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(28px,3.5vw,42px)",
                  color: "var(--text)",
                  letterSpacing: "-0.02em",
                }}
              >
                Campaigns to back today
              </h2>
            </div>
            <Link href="/explore" className="hp-btn-ghost hp-btn-sm">
              View all
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div
            className="hp-projects-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 18,
            }}
          >
            {PROJECTS.map(p => (
              <article
                key={p.title}
                className="proj-card hp-project-card hp-animated-el"
              >
                {/* thumbnail area */}
                <div
                  style={{
                    height: 148,
                    background: `linear-gradient(135deg,${p.clr}20,${p.clr}06)`,
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 800,
                      fontSize: 20,
                      color: p.clr,
                      opacity: 0.4,
                      textAlign: "center",
                      padding: "0 12px",
                    }}
                  >
                    {p.title}
                  </span>
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: `${p.clr}22`,
                      border: `1px solid ${p.clr}44`,
                      fontSize: 11,
                      color: p.clr,
                      fontFamily: "DM Sans, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {p.cat}
                  </div>
                </div>

                {/* card body */}
                <div style={{ padding: "18px 18px 20px" }}>
                  <h3
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "var(--text)",
                      marginBottom: 12,
                    }}
                  >
                    {p.title}
                  </h3>

                  {/* progress bar */}
                  <div
                    role="progressbar"
                    aria-valuenow={p.pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${p.title} funding progress`}
                    style={{
                      height: 5,
                      borderRadius: 3,
                      background: "var(--border)",
                      marginBottom: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="prog-fill"
                      data-pct={p.pct}
                      style={{
                        height: "100%",
                        borderRadius: 3,
                        background: `linear-gradient(90deg,${p.clr},${p.clr}99)`,
                        width: "0%",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Syne, sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--text)",
                      }}
                    >
                      {p.raised}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: "DM Sans, sans-serif",
                        fontWeight: 600,
                        color: p.clr,
                      }}
                    >
                      {p.pct}%
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {p.backers.toLocaleString("en-IN")} backers
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {p.days}d left
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ BOTTOM CTA ═══════════════════ */}
      <section
        className="hp-section"
        aria-label="Call to action"
        style={{
          padding: "80px 48px 120px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          ref={ctaBanRef}
          className="hp-animated-el"
          style={{ maxWidth: 820, margin: "0 auto" }}
        >
          <div className="glow-pulse hp-cta-banner">
            {/* radial glow */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: 500,
                height: 500,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,var(--orb1) 0%,transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 18,
                position: "relative",
              }}
            >
              Ready to launch?
            </p>

            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(30px,4vw,54px)",
                color: "var(--text)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: 18,
                position: "relative",
              }}
            >
              Your idea deserves
              <br />
              <span
                style={{
                  color: "var(--accent)",
                  textShadow: "0 0 40px rgba(0,200,160,0.4)",
                }}
              >
                a real shot.
              </span>
            </h2>

            <p
              style={{
                fontSize: 16,
                color: "var(--text-muted)",
                fontFamily: "DM Sans, sans-serif",
                lineHeight: 1.7,
                maxWidth: 460,
                margin: "0 auto 40px",
                position: "relative",
              }}
            >
              Join 12,000+ creators who have already made their vision a
              reality on CrowdSpark.
            </p>

            <div
              style={{
                display: "flex",
                gap: 14,
                justifyContent: "center",
                flexWrap: "wrap",
                position: "relative",
              }}
            >
              <Link href="/register" className="hp-btn-primary">
                Create free account
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/explore" className="hp-btn-ghost">
                Browse campaigns
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SCOPED STYLES ═══════════════════ */}
      <style>{`
        /* ── keyframes ─────────────────────────────── */
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-20px) scale(1.05); }
        }

        /* ── fallback visibility for JS-animated elements ── */
        .hp-animated-el {
          opacity: 0;
        }

        /* ── hero orbs ─────────────────────────────── */
        .hp-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .hp-orb-lg {
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(0,200,160,0.18) 0%, transparent 70%);
          filter: blur(40px);
          animation: orbFloat 6s ease-in-out infinite;
        }
        .hp-orb-md {
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(123,47,255,0.15) 0%, transparent 70%);
          filter: blur(30px);
          top: 30%; right: 20%;
          animation: orbFloat 8s ease-in-out infinite reverse;
        }
        .hp-orb-sm {
          width: 140px; height: 140px;
          background: radial-gradient(circle, rgba(0,200,160,0.12) 0%, transparent 70%);
          filter: blur(20px);
          bottom: 25%; left: 25%;
          animation: orbFloat 5s ease-in-out infinite 2s;
        }

        /* ── stat numbers ──────────────────────────── */
        .stat-num {
          font-family: "Syne", sans-serif;
          font-weight: 800;
          font-size: clamp(28px, 3.5vw, 42px);
          color: var(--text);
          letter-spacing: -0.02em;
          line-height: 1;
        }

        /* ── buttons ───────────────────────────────── */
        .hp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 30px; border-radius: 12px;
          background: linear-gradient(135deg, var(--accent), var(--accent-h));
          color: var(--icon-clr);
          font-family: "Syne", sans-serif; font-weight: 700; font-size: 15px;
          text-decoration: none;
          box-shadow: 0 4px 24px var(--accent-glow);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .hp-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px var(--accent-glow);
        }
        .hp-btn-primary:active {
          transform: translateY(0);
        }

        .hp-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 26px; border-radius: 12px;
          background: var(--bg-ghost);
          border: 1px solid var(--border);
          color: var(--text);
          font-family: "DM Sans", sans-serif; font-weight: 600; font-size: 15px;
          text-decoration: none;
          transition: border-color 0.18s, color 0.18s;
        }
        .hp-btn-ghost:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .hp-btn-sm {
          padding: 11px 22px; border-radius: 10px; font-size: 14px;
        }

        /* ── feature cards ─────────────────────────── */
        .hp-feature-card {
          padding: 28px; border-radius: 18px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          cursor: default;
          transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
        }
        .hp-feature-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
          box-shadow: 0 12px 36px rgba(0,0,0,0.2);
        }

        /* ── project cards ─────────────────────────── */
        .hp-project-card {
          border-radius: 18px; overflow: hidden;
          background: var(--bg);
          border: 1px solid var(--card-border);
          cursor: pointer;
          transition: transform 0.22s, box-shadow 0.22s;
        }
        .hp-project-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.2);
        }

        /* ── CTA banner ────────────────────────────── */
        .hp-cta-banner {
          border-radius: 28px; padding: 80px 56px;
          text-align: center;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          position: relative; overflow: hidden;
        }

        /* ── no-JS fallback: show all animated elements ─────── */
        @media (scripting: none) {
          .hp-animated-el {
            opacity: 1 !important;
          }
        }

        /* ── responsive ────────────────────────────── */
        @media (max-width: 900px) {
          .hp-hero {
            flex-direction: column !important;
          }
          .hp-hero-left {
            flex: none !important;
            padding: 100px 24px 40px !important;
          }
          .hp-hero-right {
            flex: none !important;
            min-height: 40vh !important;
            height: auto !important;
          }
          .hp-features-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .hp-projects-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .hp-cta-banner {
            padding: 56px 24px !important;
          }
        }

        @media (max-width: 600px) {
          .hp-hero-left {
            padding: 90px 20px 32px !important;
          }
          .hp-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .hp-features-grid {
            grid-template-columns: 1fr !important;
          }
          .hp-projects-grid {
            grid-template-columns: 1fr !important;
          }
          .hp-section {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .hp-cta-banner {
            padding: 48px 20px !important;
          }
        }
      `}</style>
    </div>
  );
}