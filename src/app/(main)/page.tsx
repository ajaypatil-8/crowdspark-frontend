"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCursor } from "@/hooks/usecursor";
import { useTheme } from "@/contexts/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { num: "12,400+", label: "Projects funded" },
  { num: "₹98M",    label: "Total raised" },
  { num: "3.4L+",   label: "Active backers" },
  { num: "94%",     label: "Success rate" },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Lightning fast setup",
    desc:
      "Launch your campaign in under 5 minutes." +
      " No paperwork, no gatekeepers.",
    accent: "#ffcc00",
  },
  {
    icon: "🔒",
    title: "Secure & transparent",
    desc:
      "Funds in escrow, released on milestones." +
      " Full audit trail for every ₹.",
    accent: "#34d399",
  },
  {
    icon: "🌍",
    title: "Built for India",
    desc:
      "UPI, NetBanking, wallet support." +
      " GST-compliant invoicing out of the box.",
    accent: "#60a5fa",
  },
  {
    icon: "📊",
    title: "Real-time analytics",
    desc:
      "Live dashboards for backers," +
      " conversions, and traffic in one place.",
    accent: "#a78bfa",
  },
  {
    icon: "🤝",
    title: "Community first",
    desc:
      "A network of verified backers" +
      " who actively discover campaigns daily.",
    accent: "#f59e0b",
  },
  {
    icon: "🎯",
    title: "Smart matching",
    desc:
      "AI surfaces your project to people" +
      " who care about your category.",
    accent: "#f87171",
  },
];

const PROJECTS = [
  {
    title: "AgroSense IoT",
    cat: "AgriTech",
    raised: "₹18.4L",
    pct: 92,
    days: 4,
    backers: 1240,
    clr: "#00f5d4",
  },
  {
    title: "Svara Music App",
    cat: "Music & Art",
    raised: "₹9.2L",
    pct: 74,
    days: 11,
    backers: 873,
    clr: "#a78bfa",
  },
  {
    title: "CleanSip Purifier",
    cat: "CleanTech",
    raised: "₹24.8L",
    pct: 99,
    days: 2,
    backers: 3102,
    clr: "#34d399",
  },
  {
    title: "Rethread Fashion",
    cat: "Sustainability",
    raised: "₹6.1L",
    pct: 51,
    days: 19,
    backers: 540,
    clr: "#f59e0b",
  },
];

const AVATAR_COLORS = [
  "#00c9a7",
  "#a78bfa",
  "#f59e0b",
  "#34d399",
  "#f87171",
];

export default function HomePage() {
  const { cursorRef, followerRef } = useCursor();
  const { isDark } = useTheme();

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
      gsap.fromTo(
        [
          badgeRef.current,
          h1Ref.current,
          subRef.current,
          ctaRef.current,
        ],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.95,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.35,
        },
      );
      gsap.fromTo(
        hintRef.current,
        { opacity: 0, y: 8 },
        {
          opacity: 0.45,
          y: 0,
          duration: 0.9,
          delay: 2.2,
          ease: "power2.out",
          yoyo: true,
          repeat: -1,
          repeatDelay: 0.85,
        },
      );
      gsap.fromTo(
        statsRef.current?.querySelectorAll(
          ".s-item",
        ) ?? [],
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.09,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 82%",
          },
        },
      );
      gsap.fromTo(
        featRef.current?.querySelectorAll(
          ".f-card",
        ) ?? [],
        { y: 56, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: "back.out(1.3)",
          scrollTrigger: {
            trigger: featRef.current,
            start: "top 76%",
          },
        },
      );
      gsap.fromTo(
        projRef.current?.querySelectorAll(
          ".p-card",
        ) ?? [],
        { y: 56, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: projRef.current,
            start: "top 78%",
          },
        },
      );
      projRef.current
        ?.querySelectorAll<HTMLElement>(".p-bar")
        .forEach((bar) => {
          const pct = Number(bar.dataset.pct) || 0;
          ScrollTrigger.create({
            trigger: bar,
            start: "top 88%",
            once: true,
            onEnter: () =>
              gsap.to(bar, {
                width: `${Math.min(pct, 100)}%`,
                duration: 1.4,
                ease: "power2.out",
              }),
          });
        });
      gsap.fromTo(
        ctaBanRef.current,
        { scale: 0.93, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: ctaBanRef.current,
            start: "top 84%",
          },
        },
      );
      gsap.utils
        .toArray<HTMLElement>(".sec-h")
        .forEach((el) =>
          gsap.fromTo(
            el,
            { x: -28, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.65,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 87%",
              },
            },
          ),
        );
    });
    return () => ctx.revert();
  }, []);

  const pageBg  = isDark ? "#080808" : "#fafaf8";
  const cardBg  = isDark ? "#0f0f0f" : "#ffffff";
  const cardBdr = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.08)";
  const secBg   = isDark ? "#0c0c0c" : "#f4f4f2";
  const txt     = isDark ? "#ffffff" : "#0a0a0a";
  const muted   = isDark
    ? "rgba(255,255,255,0.42)"
    : "rgba(0,0,0,0.44)";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        overflowX: "hidden",
      }}
    >
      <div
        ref={cursorRef}
        className="cursor"
        aria-hidden="true"
      />
      <div
        ref={followerRef}
        className="cursor-follower"
        aria-hidden="true"
      />
      <div className="dot-grid" aria-hidden="true" />
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />

      <section
        aria-label="Hero"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "stretch",
          overflow: "hidden",
        }}
      >
        <div
          className="hp-left"
          style={{
            flex: "0 0 52%",
            display: "flex",
            alignItems: "center",
            padding: "120px 0 80px 56px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ maxWidth: 520 }}>
            <div
              ref={badgeRef}
              style={{
                opacity: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px 5px 5px",
                borderRadius: 999,
                border: `1px solid ${cardBdr}`,
                background: isDark
                  ? "rgba(255,107,0,0.07)"
                  : "rgba(255,107,0,0.05)",
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: "rgba(255,107,0,0.15)",
                  fontSize: 10,
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  color: "#ff8800",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#ff8800",
                    animation:
                      "hpPulse 1.4s ease-in-out infinite",
                    flexShrink: 0,
                  }}
                />
                Live now
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: muted,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                12,400+ campaigns funded
              </span>
            </div>

            <h1
              ref={h1Ref}
              style={{
                opacity: 0,
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(38px,4.5vw,68px)",
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                color: txt,
                marginBottom: 22,
                margin: "0 0 22px",
              }}
            >
              Where{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg,#ff6b00,#ffcc00)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                bold ideas
              </span>
              <br />
              find their{" "}
              <span
                style={{
                  color: isDark ? "#00d4b8" : "#009e8c",
                  textShadow: `0 0 40px ${
                    isDark
                      ? "rgba(0,245,212,0.35)"
                      : "rgba(0,200,160,0.2)"
                  }`,
                }}
              >
                spark.
              </span>
            </h1>

            <p
              ref={subRef}
              style={{
                opacity: 0,
                fontSize: "clamp(14px,1.5vw,17px)",
                color: muted,
                fontFamily: "DM Sans, sans-serif",
                lineHeight: 1.8,
                maxWidth: 400,
                marginBottom: 38,
                margin: "0 0 38px",
              }}
            >
              India&#39;s most trusted crowdfunding
              platform — built for creators,
              innovators, and everyone who believes
              in them.
            </p>

            <div
              ref={ctaRef}
              style={{
                opacity: 0,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 52,
              }}
            >
              <Link
                href="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 28px",
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg,#ff6b00,#ffcc00)",
                  color: "#fff",
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 14.5,
                  textDecoration: "none",
                  boxShadow:
                    "0 4px 24px rgba(255,100,0,0.35)",
                  position: "relative",
                  overflow: "hidden",
                  transition:
                    "transform 0.18s, box-shadow 0.18s",
                }}
                onMouseEnter={(e) => {
                  (
                    e.currentTarget as HTMLAnchorElement
                  ).style.transform = "translateY(-2px)";
                  (
                    e.currentTarget as HTMLAnchorElement
                  ).style.boxShadow =
                    "0 8px 36px rgba(255,100,0,0.5)";
                }}
                onMouseLeave={(e) => {
                  (
                    e.currentTarget as HTMLAnchorElement
                  ).style.transform = "translateY(0)";
                  (
                    e.currentTarget as HTMLAnchorElement
                  ).style.boxShadow =
                    "0 4px 24px rgba(255,100,0,0.35)";
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)",
                    animation:
                      "hpShimmer 2.4s ease-in-out infinite",
                  }}
                />
                <span style={{ position: "relative" }}>
                  Start your campaign
                </span>
                <svg
                  width="14" height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ position: "relative" }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/explore"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "13px 24px",
                  borderRadius: 12,
                  background: "none",
                  border: `1px solid ${cardBdr}`,
                  color: muted,
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: 600,
                  fontSize: 14.5,
                  textDecoration: "none",
                  transition:
                    "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (
                    e.currentTarget as HTMLAnchorElement
                  ).style.borderColor =
                    "rgba(255,107,0,0.4)";
                  (
                    e.currentTarget as HTMLAnchorElement
                  ).style.color = txt;
                }}
                onMouseLeave={(e) => {
                  (
                    e.currentTarget as HTMLAnchorElement
                  ).style.borderColor = cardBdr;
                  (
                    e.currentTarget as HTMLAnchorElement
                  ).style.color = muted;
                }}
              >
                Explore projects
              </Link>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{ display: "flex" }}
                aria-hidden="true"
              >
                {AVATAR_COLORS.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: c,
                      border: `2.5px solid ${pageBg}`,
                      marginLeft: i > 0 ? -9 : 0,
                      zIndex: 5 - i,
                      position: "relative",
                    }}
                  />
                ))}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: muted,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <strong style={{ color: txt }}>
                  3,40,000+
                </strong>{" "}
                backers already here
              </p>
            </div>
          </div>
        </div>

        <div
          className="hp-right"
          aria-hidden="true"
          style={{
            flex: "0 0 48%",
            position: "relative",
            zIndex: 2,
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse 65% 55% at 55% 50%,${
                isDark
                  ? "rgba(0,200,160,0.1)"
                  : "rgba(0,200,160,0.07)"
              } 0%,transparent 70%)`,
              pointerEvents: "none",
            }}
          />
          <div className="hp-orb hp-orb-lg" />
          <div className="hp-orb hp-orb-md" />
          <div className="hp-orb hp-orb-sm" />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: 100,
              background: `linear-gradient(to right,${pageBg},transparent)`,
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        </div>

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 160,
            background: `linear-gradient(to top,${pageBg} 0%,transparent 100%)`,
            zIndex: 4,
            pointerEvents: "none",
          }}
        />

        <div
          ref={hintRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 28,
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
              fontSize: 9.5,
              color: muted,
              fontFamily: "DM Sans, sans-serif",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <svg
            width="18" height="26"
            viewBox="0 0 18 26"
            fill="none"
          >
            <rect
              x="1" y="1"
              width="16" height="24"
              rx="8"
              stroke={
                isDark
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.15)"
              }
              strokeWidth="1.5"
            />
            <rect
              x="7.5" y="5"
              width="3" height="6"
              rx="1.5"
              fill="#ff8800"
            />
          </svg>
        </div>
      </section>

      <section
        ref={statsRef}
        aria-label="Statistics"
        style={{
          padding: "60px 48px",
          borderTop: `1px solid ${cardBdr}`,
          borderBottom: `1px solid ${cardBdr}`,
          background: secBg,
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
          {STATS.map((s) => (
            <div
              key={s.label}
              className="s-item"
              style={{
                textAlign: "center",
                opacity: 0,
              }}
            >
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(26px,3vw,42px)",
                  color: txt,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {s.num}
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: muted,
                  fontFamily: "DM Sans, sans-serif",
                  marginTop: 7,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={featRef}
        aria-label="Features"
        style={{
          padding: "88px 48px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{ maxWidth: 1100, margin: "0 auto" }}
        >
          <div
            className="sec-h"
            style={{
              marginBottom: 48,
              opacity: 0,
            }}
          >
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#ff8800",
                marginBottom: 10,
              }}
            >
              Why CrowdSpark
            </p>
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(28px,4vw,46px)",
                color: txt,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Everything you need
              <br />
              to launch and grow
            </h2>
          </div>
          <div
            className="hp-feat-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 16,
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="f-card"
                style={{
                  opacity: 0,
                  padding: "26px 24px",
                  borderRadius: 18,
                  background: cardBg,
                  border: `1px solid ${cardBdr}`,
                  transition:
                    "transform 0.22s, border-color 0.22s, box-shadow 0.22s",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  const el =
                    e.currentTarget as HTMLDivElement;
                  el.style.transform =
                    "translateY(-4px)";
                  el.style.borderColor = `${f.accent}44`;
                  el.style.boxShadow = isDark
                    ? `0 12px 36px rgba(0,0,0,0.35),0 0 0 1px ${f.accent}22`
                    : `0 12px 36px rgba(0,0,0,0.08),0 0 0 1px ${f.accent}18`;
                }}
                onMouseLeave={(e) => {
                  const el =
                    e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(0)";
                  el.style.borderColor = cardBdr;
                  el.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg,transparent,${f.accent}44,transparent)`,
                  }}
                />
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: isDark
                      ? `${f.accent}12`
                      : `${f.accent}0e`,
                    border: `1px solid ${f.accent}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    marginBottom: 16,
                  }}
                  aria-hidden="true"
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: txt,
                    marginBottom: 8,
                    margin: "0 0 8px",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 13.5,
                    color: muted,
                    fontFamily: "DM Sans, sans-serif",
                    lineHeight: 1.72,
                    margin: 0,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={projRef}
        aria-label="Trending campaigns"
        style={{
          padding: "72px 48px",
          background: secBg,
          borderTop: `1px solid ${cardBdr}`,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{ maxWidth: 1100, margin: "0 auto" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 40,
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div
              className="sec-h"
              style={{ opacity: 0 }}
            >
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "#ff8800",
                  margin: "0 0 10px",
                }}
              >
                Trending now
              </p>
              <h2
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(24px,3.5vw,40px)",
                  color: txt,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                Campaigns to back today
              </h2>
            </div>
            <Link
              href="/explore"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 20px",
                borderRadius: 10,
                background: "none",
                border: `1px solid ${cardBdr}`,
                color: muted,
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
                fontSize: 13.5,
                textDecoration: "none",
                transition:
                  "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (
                  e.currentTarget as HTMLAnchorElement
                ).style.borderColor =
                  "rgba(255,107,0,0.4)";
                (
                  e.currentTarget as HTMLAnchorElement
                ).style.color = txt;
              }}
              onMouseLeave={(e) => {
                (
                  e.currentTarget as HTMLAnchorElement
                ).style.borderColor = cardBdr;
                (
                  e.currentTarget as HTMLAnchorElement
                ).style.color = muted;
              }}
            >
              View all
              <svg
                width="12" height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div
            className="hp-proj-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
            }}
          >
            {PROJECTS.map((p) => (
              <article
                key={p.title}
                className="p-card"
                style={{
                  opacity: 0,
                  borderRadius: 18,
                  overflow: "hidden",
                  background: cardBg,
                  border: `1px solid ${cardBdr}`,
                  cursor: "pointer",
                  transition:
                    "transform 0.22s, box-shadow 0.22s",
                }}
                onMouseEnter={(e) => {
                  const el =
                    e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-5px)";
                  el.style.boxShadow = isDark
                    ? "0 16px 40px rgba(0,0,0,0.4)"
                    : "0 16px 40px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  const el =
                    e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    height: 140,
                    background: `linear-gradient(135deg,${p.clr}18,${p.clr}06)`,
                    borderBottom: `1px solid ${cardBdr}`,
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
                      fontSize: 18,
                      color: p.clr,
                      opacity: 0.32,
                      textAlign: "center",
                      padding: "0 14px",
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
                      background: `${p.clr}1a`,
                      border: `1px solid ${p.clr}33`,
                      fontSize: 11,
                      color: p.clr,
                      fontFamily: "DM Sans, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {p.cat}
                  </div>
                </div>
                <div
                  style={{ padding: "16px 16px 18px" }}
                >
                  <h3
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 700,
                      fontSize: 13.5,
                      color: txt,
                      margin: "0 0 12px",
                    }}
                  >
                    {p.title}
                  </h3>
                  <div
                    role="progressbar"
                    aria-valuenow={p.pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{
                      height: 4,
                      borderRadius: 2,
                      background: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.08)",
                      marginBottom: 9,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="p-bar"
                      data-pct={p.pct}
                      style={{
                        height: "100%",
                        borderRadius: 2,
                        background: `linear-gradient(90deg,${p.clr},${p.clr}88)`,
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
                      marginBottom: 7,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Syne, sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: txt,
                      }}
                    >
                      {p.raised}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: "DM Sans, sans-serif",
                        fontWeight: 700,
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
                        fontSize: 11.5,
                        color: muted,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {p.backers.toLocaleString("en-IN")}{" "}
                      backers
                    </span>
                    <span
                      style={{
                        fontSize: 11.5,
                        color: muted,
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

      <section
        aria-label="Call to action"
        style={{
          padding: "72px 48px 112px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          ref={ctaBanRef}
          style={{
            maxWidth: 800,
            margin: "0 auto",
            opacity: 0,
          }}
        >
          <div
            style={{
              borderRadius: 28,
              padding: "72px 52px",
              textAlign: "center",
              background: cardBg,
              border: `1px solid ${cardBdr}`,
              position: "relative",
              overflow: "hidden",
              boxShadow: isDark
                ? "none"
                : "0 4px 40px rgba(0,0,0,0.06)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: 480,
                height: 480,
                borderRadius: "50%",
                background: `radial-gradient(circle,${
                  isDark
                    ? "rgba(0,200,160,0.08)"
                    : "rgba(0,200,160,0.05)"
                } 0%,transparent 70%)`,
                pointerEvents: "none",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,107,0,0.06)",
                filter: "blur(60px)",
                pointerEvents: "none",
              }}
            />
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#ff8800",
                marginBottom: 16,
                position: "relative",
              }}
            >
              Ready to launch?
            </p>
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(28px,4vw,50px)",
                color: txt,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: 16,
                position: "relative",
              }}
            >
              Your idea deserves
              <br />
              <span
                style={{
                  color: isDark ? "#00d4b8" : "#009e8c",
                  textShadow: `0 0 40px ${
                    isDark
                      ? "rgba(0,245,212,0.35)"
                      : "rgba(0,200,160,0.2)"
                  }`,
                }}
              >
                a real shot.
              </span>
            </h2>
            <p
              style={{
                fontSize: 15,
                color: muted,
                fontFamily: "DM Sans, sans-serif",
                lineHeight: 1.75,
                maxWidth: 420,
                margin: "0 auto 36px",
                position: "relative",
              }}
            >
              Join 12,000+ creators who have already
              made their vision a reality on CrowdSpark.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
                position: "relative",
              }}
            >
              <Link
                href="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 28px",
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg,#ff6b00,#ffcc00)",
                  color: "#fff",
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 14.5,
                  textDecoration: "none",
                  boxShadow:
                    "0 4px 24px rgba(255,100,0,0.35)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)",
                    animation:
                      "hpShimmer 2.4s ease-in-out infinite",
                  }}
                />
                <span style={{ position: "relative" }}>
                  Create free account
                </span>
                <svg
                  width="14" height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ position: "relative" }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/explore"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "13px 24px",
                  borderRadius: 12,
                  background: "none",
                  border: `1px solid ${cardBdr}`,
                  color: muted,
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: 600,
                  fontSize: 14.5,
                  textDecoration: "none",
                }}
              >
                Browse campaigns
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes hpShimmer {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(200%); }
          100% { transform: translateX(200%); }
        }
        @keyframes hpPulse {
          0%,100% { opacity: 0.5; }
          50%     { opacity: 1; }
        }
        @keyframes orbFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%     { transform: translateY(-18px) scale(1.04); }
        }
        .hp-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .hp-orb-lg {
          width: 300px; height: 300px;
          background: radial-gradient(circle,rgba(0,200,160,0.16) 0%,transparent 70%);
          filter: blur(36px);
          animation: orbFloat 6s ease-in-out infinite;
        }
        .hp-orb-md {
          width: 180px; height: 180px;
          background: radial-gradient(circle,rgba(255,107,0,0.12) 0%,transparent 70%);
          filter: blur(28px);
          top: 30%; right: 20%;
          animation: orbFloat 8s ease-in-out infinite reverse;
        }
        .hp-orb-sm {
          width: 120px; height: 120px;
          background: radial-gradient(circle,rgba(0,200,160,0.1) 0%,transparent 70%);
          filter: blur(20px);
          bottom: 25%; left: 25%;
          animation: orbFloat 5s ease-in-out infinite 2s;
        }
        @media (max-width: 900px) {
          .hp-left {
            flex: none !important;
            padding: 100px 24px 40px !important;
          }
          .hp-right {
            display: none !important;
          }
          .hp-feat-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .hp-proj-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .hp-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .hp-feat-grid {
            grid-template-columns: 1fr !important;
          }
          .hp-proj-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}