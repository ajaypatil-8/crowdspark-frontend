"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCursor } from "@/hooks/usecursor";

/* ── data ───────────────────────────────────────────────────────────────── */

const STATS = [
  { num: 12400, suffix: "+", label: "Projects funded"  },
  { num: 98,    suffix: "M", label: "Raised (₹)",      prefix: "₹" },
  { num: 340,   suffix: "K+", label: "Active backers"  },
  { num: 94,    suffix: "%", label: "Success rate"     },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Lightning fast setup",
    desc:  "Launch your campaign in under 5 minutes. No paperwork, no gatekeepers — just your idea and our platform.",
  },
  {
    icon: "🔒",
    title: "Secure & transparent",
    desc:  "Funds are held in escrow and only released when milestones are met. Full audit trail for every rupee.",
  },
  {
    icon: "🌍",
    title: "Built for India",
    desc:  "UPI, NetBanking, and wallet support. Fully GST-compliant invoicing. Designed for the Indian ecosystem.",
  },
  {
    icon: "📊",
    title: "Real-time analytics",
    desc:  "Watch your campaign grow with live dashboards. Track backers, conversions, and traffic in one place.",
  },
  {
    icon: "🤝",
    title: "Community first",
    desc:  "A network of verified backers who actively discover and support new campaigns every day.",
  },
  {
    icon: "🎯",
    title: "Smart recommendations",
    desc:  "AI-powered backer matching surfaces your project to people who actually care about your category.",
  },
];

const PROJECTS = [
  {
    title:    "AgroSense IoT Kit",
    category: "AgriTech",
    raised:   "₹18.4L",
    goal:     "₹20L",
    pct:      92,
    days:     4,
    backers:  1240,
    color:    "#00f5d4",
  },
  {
    title:    "Svara – Indian Music App",
    category: "Music & Art",
    raised:   "₹9.2L",
    goal:     "₹10L",
    pct:      92,
    days:     11,
    backers:  873,
    color:    "#a78bfa",
  },
  {
    title:    "CleanSip Water Purifier",
    category: "CleanTech",
    raised:   "₹24.8L",
    goal:     "₹25L",
    pct:      99,
    days:     2,
    backers:  3102,
    color:    "#34d399",
  },
  {
    title:    "Rethread – Upcycled Fashion",
    category: "Sustainability",
    raised:   "₹6.1L",
    goal:     "₹12L",
    pct:      51,
    days:     19,
    backers:  540,
    color:    "#f59e0b",
  },
];

const STEPS = [
  { n: "01", title: "Create your campaign", desc: "Set your goal, tell your story, and add rewards for backers." },
  { n: "02", title: "Share & get discovered", desc: "Our algorithm surfaces your campaign to the right audience automatically." },
  { n: "03", title: "Reach your goal", desc: "Funds are released securely as milestones are hit. Simple." },
];

const TESTIMONIALS = [
  {
    quote: "CrowdSpark helped us raise ₹28 lakhs in 30 days. The platform is polished, the community is real.",
    name:  "Priya Nair",
    role:  "Founder, AquaFarms",
    init:  "PN",
  },
  {
    quote: "Best crowdfunding experience in India, period. The analytics alone saved us thousands in ad spend.",
    name:  "Rohan Mehta",
    role:  "Creator, Svara",
    init:  "RM",
  },
  {
    quote: "As a backer I've supported 14 campaigns here. The escrow system gives me confidence no other platform does.",
    name:  "Anjali Singh",
    role:  "Angel Backer",
    init:  "AS",
  },
];

const LOGOS = ["Y Combinator","Nasscom","Startup India","Google for Startups","AWS Activate","Sequoia Scout"];

/* ── counter hook ────────────────────────────────────────────────────────── */

function useCountUp(target: number, duration = 1800, active = false) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);

  return val;
}

/* ── stat item ───────────────────────────────────────────────────────────── */

function StatItem({ num, suffix, label, prefix }: typeof STATS[0]) {
  const ref    = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const val    = useCountUp(num, 1600, on);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setOn(true); },
      { threshold: 0.5 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div className="stat-num">
        {prefix}{val.toLocaleString("en-IN")}{suffix}
      </div>
      <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", marginTop: 6 }}>
        {label}
      </p>
    </div>
  );
}

/* ── reveal hook ─────────────────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("visible");
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ── component ───────────────────────────────────────────────────────────── */

export default function HomePage() {
  const { cursorRef, followerRef } = useCursor();
  useReveal();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "hidden" }}>
      <div ref={cursorRef}   className="cursor" />
      <div ref={followerRef} className="cursor-follower" />

      {/* orbs */}
      <div className="orb orb-1" style={{ zIndex: 0 }} />
      <div className="orb orb-2" style={{ zIndex: 0 }} />
      <div className="dot-grid" style={{ zIndex: 0 }} />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight:      "92vh",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        position:       "relative",
        zIndex:         1,
        padding:        "80px 24px 60px",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 840, margin: "0 auto", textAlign: "center" }}
        >
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            8,
              padding:        "6px 16px",
              borderRadius:   999,
              border:         "1px solid var(--card-border)",
              background:     "var(--accent-dim)",
              marginBottom:   28,
            }}
          >
            <span style={{ fontSize: 10, color: "var(--accent)", fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              New
            </span>
            <span style={{ width: 1, height: 12, background: "var(--card-border)" }} />
            <span style={{ fontSize: 13, color: "var(--text-sub)", fontFamily: "DM Sans, sans-serif" }}>
              Introducing KYC-verified creator profiles
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.div>

          {/* headline */}
          <h1 style={{
            fontFamily:    "Syne, sans-serif",
            fontWeight:    800,
            fontSize:      "clamp(42px, 7vw, 80px)",
            lineHeight:    1.04,
            letterSpacing: "-0.03em",
            color:         "var(--text)",
            marginBottom:  24,
          }}>
            Where{" "}
            <span className="hero-gradient">bold ideas</span>
            <br />
            find their{" "}
            <span style={{ color: "var(--accent)", textShadow: "var(--accent-ts)" }}>
              backers.
            </span>
          </h1>

          <p style={{
            fontSize:     "clamp(16px, 2vw, 20px)",
            color:        "var(--text-muted)",
            fontFamily:   "DM Sans, sans-serif",
            lineHeight:   1.65,
            maxWidth:     560,
            margin:       "0 auto 40px",
          }}>
            CrowdSpark is India's most trusted crowdfunding platform — built for creators, innovators, and the community that believes in them.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
            <Link href="/register" style={{
              padding:      "15px 32px",
              borderRadius: 12,
              background:   "linear-gradient(135deg, var(--accent), var(--accent-h))",
              color:        "var(--icon-clr)",
              fontFamily:   "Syne, sans-serif",
              fontWeight:   700,
              fontSize:     15,
              textDecoration: "none",
              boxShadow:    "var(--btn-shadow)",
              display:      "flex",
              alignItems:   "center",
              gap:          8,
              transition:   "transform 0.18s, box-shadow 0.18s",
            }}
            className="btn-primary"
            >
              Start your campaign
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/explore" style={{
              padding:      "15px 32px",
              borderRadius: 12,
              background:   "var(--bg-ghost)",
              border:       "1px solid var(--border)",
              color:        "var(--text)",
              fontFamily:   "DM Sans, sans-serif",
              fontWeight:   600,
              fontSize:     15,
              textDecoration: "none",
              display:      "flex",
              alignItems:   "center",
              gap:          8,
            }}
            className="btn-ghost"
            >
              Explore projects
            </Link>
          </div>

          {/* social proof avatars */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {["#00f5d4","#a78bfa","#f59e0b","#34d399","#f87171"].map((c, i) => (
                <div key={i} style={{
                  width:        34,
                  height:       34,
                  borderRadius: "50%",
                  background:   c,
                  border:       "2px solid var(--bg)",
                  marginLeft:   i > 0 ? -10 : 0,
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                  fontSize:     11,
                  fontWeight:   700,
                  color:        "var(--icon-clr)",
                  fontFamily:   "Syne, sans-serif",
                }} />
              ))}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
              <strong style={{ color: "var(--text)" }}>3,40,000+</strong> backers already on the platform
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── MARQUEE LOGOS ────────────────────────────────────────────────── */}
      <section style={{
        padding:    "20px 0 40px",
        borderTop:  "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        overflow:   "hidden",
        position:   "relative",
        zIndex:     1,
      }}>
        <div style={{ overflow: "hidden" }}>
          <div className="marquee-track">
            {[...LOGOS, ...LOGOS].map((l, i) => (
              <span key={i} style={{
                fontSize:      13,
                color:         "var(--text-muted)",
                fontFamily:    "Syne, sans-serif",
                fontWeight:    700,
                letterSpacing: "0.1em",
                whiteSpace:    "nowrap",
                textTransform: "uppercase",
              }}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section style={{
        padding:  "80px 24px",
        position: "relative",
        zIndex:   1,
      }}>
        <div style={{
          maxWidth:            1100,
          margin:              "0 auto",
          display:             "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap:                 32,
        }}>
          {STATS.map(s => <StatItem key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{
              fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11,
              letterSpacing: "0.24em", textTransform: "uppercase",
              color: "var(--accent)", marginBottom: 14,
            }}>
              Why CrowdSpark
            </p>
            <h2 style={{
              fontFamily:    "Syne, sans-serif",
              fontWeight:    800,
              fontSize:      "clamp(32px, 4vw, 48px)",
              color:         "var(--text)",
              letterSpacing: "-0.02em",
              lineHeight:    1.12,
            }}>
              Everything you need to<br />launch and grow
            </h2>
          </div>

          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap:                 20,
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`feature-card reveal reveal-delay-${(i % 3) + 1}`}
              >
                <div style={{
                  width:        48,
                  height:       48,
                  borderRadius: 12,
                  background:   "var(--accent-dim)",
                  border:       "1px solid var(--card-border)",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                  fontSize:     22,
                  marginBottom: 18,
                }}>
                  {f.icon}
                </div>
                <h3 style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize:   17,
                  color:      "var(--text)",
                  marginBottom: 10,
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize:   14,
                  color:      "var(--text-muted)",
                  fontFamily: "DM Sans, sans-serif",
                  lineHeight: 1.65,
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROJECTS ────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{
            display:        "flex",
            alignItems:     "flex-end",
            justifyContent: "space-between",
            marginBottom:   48,
            flexWrap:       "wrap",
            gap:            16,
          }}>
            <div>
              <p style={{
                fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11,
                letterSpacing: "0.24em", textTransform: "uppercase",
                color: "var(--accent)", marginBottom: 12,
              }}>
                Trending now
              </p>
              <h2 style={{
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: "clamp(28px, 3.5vw, 42px)",
                color: "var(--text)", letterSpacing: "-0.02em",
              }}>
                Campaigns to back today
              </h2>
            </div>
            <Link href="/explore" className="btn-ghost" style={{
              padding: "11px 22px", borderRadius: 10,
              border: "1px solid var(--border)", background: "var(--bg-ghost)",
              color: "var(--text)", fontFamily: "DM Sans, sans-serif",
              fontSize: 14, fontWeight: 600, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              View all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap:                 20,
          }}>
            {PROJECTS.map((p, i) => (
              <ProjectCard key={p.title} project={p} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{
        padding:    "80px 24px",
        position:   "relative",
        zIndex:     1,
        background: "var(--card-bg)",
        borderTop:  "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{
              fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11,
              letterSpacing: "0.24em", textTransform: "uppercase",
              color: "var(--accent)", marginBottom: 14,
            }}>
              Simple process
            </p>
            <h2 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800,
              fontSize: "clamp(32px, 4vw, 48px)",
              color: "var(--text)", letterSpacing: "-0.02em",
            }}>
              Go live in 3 steps
            </h2>
          </div>

          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap:                 32,
            position:            "relative",
          }}>
            {STEPS.map((s, i) => (
              <div key={s.n} className={`reveal reveal-delay-${i + 1}`} style={{ textAlign: "center", position: "relative" }}>
                <div style={{
                  width:          64,
                  height:         64,
                  borderRadius:   "50%",
                  background:     "var(--accent-dim)",
                  border:         "1px solid var(--accent)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  margin:         "0 auto 20px",
                  fontFamily:     "Syne, sans-serif",
                  fontWeight:     800,
                  fontSize:       18,
                  color:          "var(--accent)",
                  position:       "relative",
                  zIndex:         1,
                }}>
                  {s.n}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: "absolute",
                    top:      32,
                    left:     "calc(50% + 36px)",
                    right:    "calc(-50% + 36px)",
                    height:   1,
                    background: "var(--border)",
                    zIndex:   0,
                  }}>
                    <div style={{
                      position:   "absolute",
                      left:       0,
                      top:        0,
                      height:     "100%",
                      width:      "60%",
                      background: "linear-gradient(90deg, var(--accent), transparent)",
                    }} />
                  </div>
                )}
                <h3 style={{
                  fontFamily: "Syne, sans-serif", fontWeight: 700,
                  fontSize: 18, color: "var(--text)", marginBottom: 10,
                }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.65 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{
              fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11,
              letterSpacing: "0.24em", textTransform: "uppercase",
              color: "var(--accent)", marginBottom: 14,
            }}>
              Real stories
            </p>
            <h2 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800,
              fontSize: "clamp(32px, 4vw, 48px)",
              color: "var(--text)", letterSpacing: "-0.02em",
            }}>
              What our community says
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`feature-card reveal reveal-delay-${i + 1}`}>
                {/* quote mark */}
                <div style={{
                  fontSize: 48, color: "var(--accent)", fontFamily: "Syne, sans-serif",
                  lineHeight: 0.8, marginBottom: 16, opacity: 0.5,
                }}>
                  "
                </div>
                <p style={{
                  fontSize: 15, color: "var(--text-sub)",
                  fontFamily: "DM Sans, sans-serif", lineHeight: 1.7,
                  marginBottom: 24, fontStyle: "italic",
                }}>
                  {t.quote}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width:          40,
                    height:         40,
                    borderRadius:   "50%",
                    background:     "var(--accent-dim)",
                    border:         "1px solid var(--accent)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontFamily:     "Syne, sans-serif",
                    fontWeight:     700,
                    fontSize:       13,
                    color:          "var(--accent)",
                  }}>
                    {t.init}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, color: "var(--text)", fontFamily: "Syne, sans-serif", fontWeight: 700 }}>
                      {t.name}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px 100px", position: "relative", zIndex: 1 }}>
        <div className="reveal" style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{
            borderRadius: 24,
            padding:      "72px 48px",
            textAlign:    "center",
            background:   "var(--card-bg)",
            border:       "1px solid var(--card-border)",
            position:     "relative",
            overflow:     "hidden",
          }}
          className="glow-pulse"
          >
            {/* bg accent */}
            <div style={{
              position:      "absolute",
              top:           "50%",
              left:          "50%",
              transform:     "translate(-50%,-50%)",
              width:         400,
              height:        400,
              borderRadius:  "50%",
              background:    "radial-gradient(circle, var(--orb1) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <p style={{
              fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11,
              letterSpacing: "0.24em", textTransform: "uppercase",
              color: "var(--accent)", marginBottom: 16, position: "relative",
            }}>
              Ready to launch?
            </p>
            <h2 style={{
              fontFamily:    "Syne, sans-serif",
              fontWeight:    800,
              fontSize:      "clamp(30px, 4vw, 52px)",
              color:         "var(--text)",
              letterSpacing: "-0.02em",
              lineHeight:    1.1,
              marginBottom:  20,
              position:      "relative",
            }}>
              Your idea deserves<br />
              <span style={{ color: "var(--accent)", textShadow: "var(--accent-ts)" }}>
                a real shot.
              </span>
            </h2>
            <p style={{
              fontSize:   16,
              color:      "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif",
              lineHeight: 1.65,
              maxWidth:   480,
              margin:     "0 auto 36px",
              position:   "relative",
            }}>
              Join 12,000+ creators who have already made their vision a reality on CrowdSpark.
            </p>
            <div style={{
              display:        "flex",
              gap:            12,
              justifyContent: "center",
              flexWrap:       "wrap",
              position:       "relative",
            }}>
              <Link href="/register" className="btn-primary" style={{
                padding:      "15px 36px",
                borderRadius: 12,
                background:   "linear-gradient(135deg, var(--accent), var(--accent-h))",
                color:        "var(--icon-clr)",
                fontFamily:   "Syne, sans-serif",
                fontWeight:   700,
                fontSize:     15,
                textDecoration: "none",
                boxShadow:    "var(--btn-shadow)",
                display:      "flex",
                alignItems:   "center",
                gap:          8,
              }}>
                Create free account
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/explore" className="btn-ghost" style={{
                padding:      "15px 28px",
                borderRadius: 12,
                border:       "1px solid var(--border)",
                background:   "var(--bg-ghost)",
                color:        "var(--text)",
                fontFamily:   "DM Sans, sans-serif",
                fontWeight:   600,
                fontSize:     15,
                textDecoration: "none",
              }}>
                Browse campaigns
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── project card subcomponent ───────────────────────────────────────────── */

function ProjectCard({ project: p, delay }: { project: typeof PROJECTS[0]; delay: number }) {
  const ref    = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setOn(true), delay * 1000); } },
      { threshold: 0.3 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="project-card reveal" style={{ cursor: "pointer" }}>
      {/* thumbnail placeholder */}
      <div style={{
        height:     160,
        background: `linear-gradient(135deg, ${p.color}18, ${p.color}06)`,
        borderBottom: "1px solid var(--border)",
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
        position:   "relative",
      }}>
        <span style={{
          fontFamily:    "Syne, sans-serif",
          fontWeight:    800,
          fontSize:      28,
          color:         p.color,
          opacity:       0.35,
          letterSpacing: "-0.02em",
          textAlign:     "center",
          padding:       "0 16px",
        }}>
          {p.title}
        </span>
        <div style={{
          position:     "absolute",
          top:          12,
          left:         12,
          padding:      "4px 10px",
          borderRadius: 999,
          background:   `${p.color}22`,
          border:       `1px solid ${p.color}44`,
          fontSize:     11,
          color:        p.color,
          fontFamily:   "DM Sans, sans-serif",
          fontWeight:   600,
        }}>
          {p.category}
        </div>
      </div>

      <div style={{ padding: "20px 20px 20px" }}>
        <h3 style={{
          fontFamily: "Syne, sans-serif", fontWeight: 700,
          fontSize: 15, color: "var(--text)", marginBottom: 12,
        }}>
          {p.title}
        </h3>

        {/* progress */}
        <div style={{
          height:       5,
          borderRadius: 3,
          background:   "var(--border)",
          marginBottom: 8,
          overflow:     "hidden",
        }}>
          <div className="progress-fill" style={{ width: on ? `${p.pct}%` : "0%" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: "var(--text)", fontFamily: "Syne, sans-serif", fontWeight: 700 }}>
            {p.raised}
          </span>
          <span style={{ fontSize: 12, color: p.color, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
            {p.pct}% funded
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
            {p.backers.toLocaleString("en-IN")} backers
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
            {p.days}d left
          </span>
        </div>
      </div>
    </div>
  );
}