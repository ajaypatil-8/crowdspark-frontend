"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCursor } from "@/hooks/usecursor";

gsap.registerPlugin(ScrollTrigger);

// ─── DATA ─────────────────────────────────────────────────────────────────────

const STATS = [
  { num: "12,400+", label: "Projects funded",   suffix: "" },
  { num: "98",      label: "Total raised",       suffix: "M₹" },
  { num: "3.4L+",   label: "Active backers",     suffix: "" },
  { num: "94",      label: "Success rate",       suffix: "%" },
];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    title: "Lightning fast setup",
    desc: "Launch your campaign in under 5 minutes. No paperwork, no gatekeepers.",
    accent: "#ffcc00",
    accentDim: "rgba(255,204,0,0.12)",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Secure & transparent",
    desc: "Funds in escrow, released on milestones. Full audit trail for every ₹.",
    accent: "#00f5d4",
    accentDim: "rgba(0,245,212,0.12)",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: "Built for India",
    desc: "UPI, NetBanking, wallet support. GST-compliant invoicing out of the box.",
    accent: "#60a5fa",
    accentDim: "rgba(96,165,250,0.12)",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: "Real-time analytics",
    desc: "Live dashboards for backers, conversions, and traffic in one place.",
    accent: "#a78bfa",
    accentDim: "rgba(167,139,250,0.12)",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Community first",
    desc: "A network of verified backers who actively discover campaigns daily.",
    accent: "#f59e0b",
    accentDim: "rgba(245,158,11,0.12)",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    title: "Smart matching",
    desc: "AI surfaces your project to people who care about your category.",
    accent: "#f87171",
    accentDim: "rgba(248,113,113,0.12)",
  },
];

const PROJECTS = [
  { title: "AgroSense IoT",     cat: "AgriTech",      raised: "₹18.4L", pct: 92, days: 4,  backers: 1240, clr: "#00f5d4", clrDim: "rgba(0,245,212,0.15)" },
  { title: "Svara Music App",   cat: "Music & Art",   raised: "₹9.2L",  pct: 74, days: 11, backers: 873,  clr: "#a78bfa", clrDim: "rgba(167,139,250,0.15)" },
  { title: "CleanSip Purifier", cat: "CleanTech",     raised: "₹24.8L", pct: 99, days: 2,  backers: 3102, clr: "#34d399", clrDim: "rgba(52,211,153,0.15)" },
  { title: "Rethread Fashion",  cat: "Sustainability", raised: "₹6.1L", pct: 51, days: 19, backers: 540,  clr: "#f59e0b", clrDim: "rgba(245,158,11,0.15)" },
];

const TESTIMONIALS = [
  {
    quote: "CrowdSpark helped us raise ₹22L in 18 days. The platform's analytics told us exactly who was backing us and why.",
    author: "Priya Sharma",
    role: "Founder, AgroSense",
    avatar: "#00f5d4",
    initials: "PS",
  },
  {
    quote: "We were skeptical at first. Within 48 hours of launching, 300 backers had pledged. The community here is incredible.",
    author: "Rohan Mehta",
    role: "CEO, CleanSip",
    avatar: "#a78bfa",
    initials: "RM",
  },
  {
    quote: "The milestone-based fund release gave our backers complete confidence. We funded 140% of our goal.",
    author: "Kavita Nair",
    role: "Creator, Svara App",
    avatar: "#f59e0b",
    initials: "KN",
  },
];

const CATEGORIES = [
  { label: "Technology",    icon: "💡", count: "2.4K" },
  { label: "Music & Arts",  icon: "🎵", count: "1.8K" },
  { label: "AgriTech",      icon: "🌱", count: "940" },
  { label: "CleanTech",     icon: "♻️",  count: "1.2K" },
  { label: "Healthcare",    icon: "🏥", count: "876" },
  { label: "Education",     icon: "📚", count: "1.5K" },
  { label: "Fashion",       icon: "👗", count: "720" },
  { label: "Food & Bev",    icon: "🍜", count: "630" },
];

const AVATAR_COLORS = ["#00f5d4","#a78bfa","#f59e0b","#34d399","#f87171"];

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true;
        const num = parseFloat(target.replace(/[^\d.]/g, ""));
        if (isNaN(num)) { setDisplay(target); return; }
        let start = 0;
        const duration = 1800;
        const step = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const cur = (eased * num).toFixed(num % 1 !== 0 ? 1 : 0);
          setDisplay(target.includes(".") ? cur : cur.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
          if (progress < 1) requestAnimationFrame(step);
          else setDisplay(target);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function HomePage() {
  const { cursorRef, followerRef } = useCursor();

  const heroTextRef  = useRef<HTMLDivElement>(null);
  const statsRef     = useRef<HTMLElement>(null);
  const featRef      = useRef<HTMLElement>(null);
  const projRef      = useRef<HTMLElement>(null);
  const testiRef     = useRef<HTMLElement>(null);
  const catRef       = useRef<HTMLElement>(null);
  const ctaBanRef    = useRef<HTMLElement>(null);
  const [activeTesti, setActiveTesti] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance — staggered children
      gsap.fromTo(
        heroTextRef.current?.querySelectorAll(".hero-enter") ?? [],
        { y: 60, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.1, stagger: 0.13, ease: "power3.out", delay: 0.4 }
      );

      // Floating orbs parallax on scroll
      gsap.to(".lp-orb-1", {
        y: -120,
        scrollTrigger: { trigger: "body", start: "top top", end: "bottom top", scrub: 1.5 },
      });
      gsap.to(".lp-orb-2", {
        y: -60,
        scrollTrigger: { trigger: "body", start: "top top", end: "bottom top", scrub: 2 },
      });

      // Stats
      gsap.fromTo(
        statsRef.current?.querySelectorAll(".stat-item") ?? [],
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: statsRef.current, start: "top 82%" } }
      );

      // Features
      gsap.fromTo(
        featRef.current?.querySelectorAll(".feat-card") ?? [],
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.08, ease: "back.out(1.4)",
          scrollTrigger: { trigger: featRef.current, start: "top 78%" } }
      );

      // Projects
      gsap.fromTo(
        projRef.current?.querySelectorAll(".proj-card") ?? [],
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: projRef.current, start: "top 78%" } }
      );

      // Progress bars
      projRef.current?.querySelectorAll<HTMLElement>(".p-bar").forEach(bar => {
        const pct = Number(bar.dataset.pct) || 0;
        ScrollTrigger.create({
          trigger: bar, start: "top 90%", once: true,
          onEnter: () => gsap.to(bar, { width: `${Math.min(pct, 100)}%`, duration: 1.6, ease: "power2.out" }),
        });
      });

      // Categories
      gsap.fromTo(
        catRef.current?.querySelectorAll(".cat-pill") ?? [],
        { scale: 0.88, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.6)",
          scrollTrigger: { trigger: catRef.current, start: "top 80%" } }
      );

      // Testimonials
      gsap.fromTo(testiRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: testiRef.current, start: "top 82%" } }
      );

      // CTA banner
      gsap.fromTo(ctaBanRef.current,
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.5)",
          scrollTrigger: { trigger: ctaBanRef.current, start: "top 85%" } }
      );

      // Section headings slide-in
      gsap.utils.toArray<HTMLElement>(".sec-label").forEach(el =>
        gsap.fromTo(el,
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.65, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%" } }
        )
      );
    });

    // Testimonial auto-rotate
    const timerRef = setInterval(() => setActiveTesti(p => (p + 1) % TESTIMONIALS.length), 4500);

    return () => { ctx.revert(); clearInterval(timerRef); };
  }, []);

  return (
    <div className="lp-root">
      {/* Custom cursor */}
      <div ref={cursorRef} className="cursor" aria-hidden />
      <div ref={followerRef} className="cursor-follower" aria-hidden />

      {/* Ambient background */}
      <div className="dot-grid" aria-hidden />
      <div className="lp-orb-1" aria-hidden />
      <div className="lp-orb-2" aria-hidden />
      <div className="lp-orb-3" aria-hidden />

      {/* ══════════ HERO ══════════ */}
      <section className="lp-hero" aria-label="Hero">
        {/* Right decorative glow canvas */}
        <div className="lp-hero-canvas" aria-hidden>
          <div className="lp-canvas-orb lp-canvas-orb-a" />
          <div className="lp-canvas-orb lp-canvas-orb-b" />
          <div className="lp-canvas-orb lp-canvas-orb-c" />
          <div className="lp-hero-grid-overlay" />
          {/* Floating stat card */}
          <div className="lp-float-card lp-float-1">
            <div className="lp-float-icon" style={{ background: "rgba(0,245,212,0.15)", color: "#00f5d4" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <div>
              <div className="lp-float-num">₹24.8L</div>
              <div className="lp-float-label">raised today</div>
            </div>
          </div>
          <div className="lp-float-card lp-float-2">
            <div className="lp-float-icon" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div className="lp-float-num">+847</div>
              <div className="lp-float-label">new backers</div>
            </div>
          </div>
          <div className="lp-float-card lp-float-3">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00f5d4", animation: "lp-pulse 1.4s ease-in-out infinite" }} />
              <span style={{ fontSize: 11, fontFamily: "DM Sans, sans-serif", color: "var(--text-sub)", fontWeight: 600 }}>
                3 campaigns just funded
              </span>
            </div>
          </div>
        </div>

        {/* Left content */}
        <div className="lp-hero-content" ref={heroTextRef}>
          {/* Badge */}
          <div className="lp-badge hero-enter">
            <span className="lp-badge-pill">
              <span className="lp-badge-dot" />
              Live now
            </span>
            <span className="lp-badge-text">12,400+ campaigns funded</span>
          </div>

          {/* Headline */}
          <h1 className="lp-h1 hero-enter">
            Where{" "}
            <span className="lp-h1-gradient">bold ideas</span>
            <br />
            find their{" "}
            <span className="lp-h1-accent">spark.</span>
          </h1>

          {/* Sub */}
          <p className="lp-sub hero-enter">
            India&#39;s most trusted crowdfunding platform — built for creators,
            innovators, and everyone who believes in them.
          </p>

          {/* CTAs */}
          <div className="lp-cta-row hero-enter">
            <Link href="/register" className="btn-primary lp-btn-hero">
              <span className="btn-shimmer" />
              <span style={{ position: "relative" }}>Start your campaign</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14" style={{ position: "relative" }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/explore" className="btn-outline lp-btn-ghost">
              Explore projects
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* Social proof */}
          <div className="lp-social-proof hero-enter">
            <div className="lp-avatars" aria-hidden>
              {AVATAR_COLORS.map((c, i) => (
                <div key={i} className="lp-avatar" style={{ background: c, zIndex: 5 - i }} />
              ))}
            </div>
            <p className="lp-proof-text">
              <strong>3,40,000+</strong> backers already here
            </p>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="lp-scroll-hint" aria-hidden>
          <span className="lp-scroll-label">scroll</span>
          <div className="lp-scroll-mouse">
            <div className="lp-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section ref={statsRef} className="lp-stats" aria-label="Statistics">
        <div className="lp-stats-inner">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item lp-stat">
              <div className="lp-stat-num">
                <AnimatedCounter target={s.num} suffix={s.suffix} />
              </div>
              <p className="lp-stat-label">{s.label}</p>
              <div className="lp-stat-sep" aria-hidden />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ CATEGORIES ══════════ */}
      <section ref={catRef} className="lp-cats" aria-label="Campaign categories">
        <div className="lp-section-inner">
          <div className="sec-label lp-sec-label">
            <p className="lp-overline">Browse by category</p>
            <h2 className="lp-h2">Find what moves you</h2>
          </div>
          <div className="lp-cat-grid">
            {CATEGORIES.map((c, i) => (
              <Link key={i} href={`/explore?category=${c.label.toLowerCase().replace(/\s+/g, "-")}`} className="cat-pill lp-cat-pill">
                <span className="lp-cat-icon">{c.icon}</span>
                <span className="lp-cat-name">{c.label}</span>
                <span className="lp-cat-count">{c.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section ref={featRef} className="lp-features" aria-label="Platform features">
        <div className="lp-section-inner">
          <div className="sec-label lp-sec-label">
            <p className="lp-overline">Why CrowdSpark</p>
            <h2 className="lp-h2">Everything you need<br />to launch and grow</h2>
          </div>
          <div className="lp-feat-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feat-card lp-feat-card" style={{ "--feat-accent": f.accent, "--feat-accent-dim": f.accentDim } as React.CSSProperties}>
                <div className="lp-feat-top-line" />
                <div className="lp-feat-icon" style={{ color: f.accent }}>
                  {f.icon}
                </div>
                <h3 className="lp-feat-title">{f.title}</h3>
                <p className="lp-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TRENDING PROJECTS ══════════ */}
      <section ref={projRef} className="lp-projects" aria-label="Trending campaigns">
        <div className="lp-section-inner">
          <div className="lp-projects-header">
            <div className="sec-label lp-sec-label" style={{ marginBottom: 0 }}>
              <p className="lp-overline">Trending now</p>
              <h2 className="lp-h2" style={{ marginBottom: 0 }}>Campaigns to back today</h2>
            </div>
            <Link href="/explore" className="btn-outline lp-view-all">
              View all
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="13" height="13">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          <div className="lp-proj-grid">
            {PROJECTS.map((p, i) => (
              <article key={i} className="proj-card lp-proj-card" style={{ "--proj-clr": p.clr, "--proj-dim": p.clrDim } as React.CSSProperties}>
                {/* Thumbnail */}
                <div className="lp-proj-thumb">
                  <div className="lp-proj-thumb-bg" />
                  <span className="lp-proj-thumb-title" aria-hidden>{p.title}</span>
                  <div className="lp-proj-cat-badge">{p.cat}</div>
                  {p.pct >= 90 && (
                    <div className="lp-proj-hot-badge">
                      🔥 Hot
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="lp-proj-body">
                  <h3 className="lp-proj-title">{p.title}</h3>

                  {/* Progress */}
                  <div className="lp-prog-track" role="progressbar" aria-valuenow={p.pct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="p-bar lp-prog-fill" data-pct={p.pct} style={{ width: "0%" }} />
                  </div>

                  <div className="lp-proj-meta">
                    <span className="lp-proj-raised">{p.raised}</span>
                    <span className="lp-proj-pct">{p.pct}%</span>
                  </div>
                  <div className="lp-proj-foot">
                    <span className="lp-proj-backers">{p.backers.toLocaleString("en-IN")} backers</span>
                    <span className="lp-proj-days">{p.days}d left</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section ref={testiRef} className="lp-testi" aria-label="Testimonials">
        <div className="lp-section-inner">
          <div className="sec-label lp-sec-label">
            <p className="lp-overline">Creator stories</p>
            <h2 className="lp-h2">Real results, real people</h2>
          </div>

          <div className="lp-testi-stage">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={`lp-testi-card ${activeTesti === i ? "lp-testi-active" : ""}`}
                style={{ display: activeTesti === i ? "flex" : "none" }}
              >
                <div className="lp-testi-quote-icon" aria-hidden>
                  <svg viewBox="0 0 32 32" fill="currentColor" width="28" height="28">
                    <path d="M10 8C6.686 8 4 10.686 4 14v10h10V14H7c0-1.657 1.343-3 3-3V8zm14 0c-3.314 0-6 2.686-6 6v10h10V14h-7c0-1.657 1.343-3 3-3V8z"/>
                  </svg>
                </div>
                <blockquote className="lp-testi-text">{t.quote}</blockquote>
                <div className="lp-testi-author">
                  <div className="lp-testi-avatar" style={{ background: t.avatar }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="lp-testi-name">{t.author}</div>
                    <div className="lp-testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Dots */}
            <div className="lp-testi-dots" role="tablist">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={activeTesti === i}
                  className={`lp-testi-dot ${activeTesti === i ? "lp-testi-dot-active" : ""}`}
                  onClick={() => setActiveTesti(i)}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="lp-how" aria-label="How it works">
        <div className="lp-section-inner">
          <div className="sec-label lp-sec-label">
            <p className="lp-overline">How it works</p>
            <h2 className="lp-h2">From idea to funded<br />in three steps</h2>
          </div>
          <div className="lp-how-grid">
            {[
              { step: "01", title: "Create your campaign", desc: "Set your goal, tell your story, and add rewards for backers. Takes under 5 minutes." },
              { step: "02", title: "Share & promote",      desc: "Our smart matching puts your campaign in front of verified backers who care." },
              { step: "03", title: "Receive funding",      desc: "Funds released securely on milestone completion. GST-compliant. Fully transparent." },
            ].map((h, i) => (
              <div key={i} className="lp-how-step">
                <div className="lp-how-num">{h.step}</div>
                <h3 className="lp-how-title">{h.title}</h3>
                <p className="lp-how-desc">{h.desc}</p>
                {i < 2 && <div className="lp-how-arrow" aria-hidden>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section aria-label="Call to action" className="lp-cta-section">
        <div ref={ctaBanRef as React.RefObject<HTMLDivElement>} className="lp-cta-inner">
          <div className="lp-cta-banner">
            <div className="lp-cta-bg-orb lp-cta-bg-orb-a" aria-hidden />
            <div className="lp-cta-bg-orb lp-cta-bg-orb-b" aria-hidden />
            <div className="lp-cta-noise" aria-hidden />

            <p className="lp-overline lp-cta-overline">Ready to launch?</p>
            <h2 className="lp-cta-h2">
              Your idea deserves
              <br />
              <span className="lp-cta-accent">a real shot.</span>
            </h2>
            <p className="lp-cta-sub">
              Join 12,000+ creators who have already made their vision a reality on CrowdSpark.
            </p>
            <div className="lp-cta-buttons">
              <Link href="/register" className="btn-primary lp-btn-hero">
                <span className="btn-shimmer" />
                <span style={{ position: "relative" }}>Create free account</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14" style={{ position: "relative" }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/explore" className="btn-outline lp-btn-ghost">
                Browse campaigns
              </Link>
            </div>

            {/* Trust badges */}
            <div className="lp-trust-row">
              {["No hidden fees", "UPI supported", "GST compliant", "Secure escrow"].map((t, i) => (
                <span key={i} className="lp-trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="13" height="13">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ STYLES ══════════ */}
      <style>{`
        /* ── Root ── */
        .lp-root { min-height:100vh; background:var(--bg); overflow-x:hidden; position:relative; }

        /* ── Ambient orbs ── */
        .lp-orb-1 {
          position:fixed; width:700px; height:700px; border-radius:50%;
          background:radial-gradient(circle,rgba(0,245,212,0.055) 0%,transparent 70%);
          filter:blur(80px); top:-200px; right:-200px; pointer-events:none; z-index:0;
        }
        .lp-orb-2 {
          position:fixed; width:500px; height:500px; border-radius:50%;
          background:radial-gradient(circle,rgba(100,30,220,0.045) 0%,transparent 70%);
          filter:blur(80px); bottom:-100px; left:-100px; pointer-events:none; z-index:0;
        }
        .lp-orb-3 {
          position:fixed; width:300px; height:300px; border-radius:50%;
          background:radial-gradient(circle,rgba(255,107,0,0.04) 0%,transparent 70%);
          filter:blur(60px); top:50%; left:50%; transform:translate(-50%,-50%);
          pointer-events:none; z-index:0;
        }

        /* ── Hero ── */
        .lp-hero {
          position:relative; min-height:100vh; display:flex; align-items:center;
          padding:120px 0 80px 56px; overflow:hidden; z-index:1;
        }
        .lp-hero-content { flex:0 0 52%; max-width:560px; position:relative; z-index:3; }
        .lp-hero-canvas {
          flex:0 0 48%; position:absolute; right:0; top:0; bottom:0; height:100%;
          display:flex; align-items:center; justify-content:center; overflow:hidden;
          pointer-events:none; z-index:2;
        }

        /* Canvas orbs */
        .lp-canvas-orb { position:absolute; border-radius:50%; pointer-events:none; }
        .lp-canvas-orb-a {
          width:360px; height:360px;
          background:radial-gradient(circle,rgba(0,245,212,0.14) 0%,transparent 70%);
          filter:blur(40px); animation:lp-float-a 7s ease-in-out infinite;
        }
        .lp-canvas-orb-b {
          width:220px; height:220px;
          background:radial-gradient(circle,rgba(255,107,0,0.1) 0%,transparent 70%);
          filter:blur(30px); top:20%; right:15%;
          animation:lp-float-b 9s ease-in-out infinite;
        }
        .lp-canvas-orb-c {
          width:160px; height:160px;
          background:radial-gradient(circle,rgba(167,139,250,0.12) 0%,transparent 70%);
          filter:blur(24px); bottom:20%; left:20%;
          animation:lp-float-c 6s ease-in-out infinite 2s;
        }
        .lp-hero-grid-overlay {
          position:absolute; inset:0;
          background-image:linear-gradient(rgba(0,245,212,0.04) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(0,245,212,0.04) 1px,transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 70% 80% at 50% 50%,black,transparent);
        }
        /* left fade */
        .lp-hero-canvas::before {
          content:""; position:absolute; top:0; bottom:0; left:0; width:120px;
          background:linear-gradient(to right,var(--bg),transparent);
          z-index:10; pointer-events:none;
        }

        /* Floating cards */
        .lp-float-card {
          position:absolute; display:flex; align-items:center; gap:10px;
          padding:12px 16px; border-radius:14px;
          background:var(--card-bg); border:1px solid var(--card-border);
          box-shadow:var(--card-shadow); z-index:5; pointer-events:none;
          backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
        }
        .lp-float-1 { top:22%; left:8%; animation:lp-float-b 6s ease-in-out infinite; }
        .lp-float-2 { bottom:28%; right:12%; animation:lp-float-a 8s ease-in-out infinite 1s; }
        .lp-float-3 { top:62%; left:15%; animation:lp-float-c 5s ease-in-out infinite 0.5s; }
        .lp-float-icon {
          width:34px; height:34px; border-radius:10px;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .lp-float-num {
          font-family:"Syne",sans-serif; font-weight:800; font-size:15px;
          color:var(--text); line-height:1;
        }
        .lp-float-label {
          font-family:"DM Sans",sans-serif; font-size:11px; color:var(--text-muted);
          margin-top:2px;
        }

        /* Badge */
        .lp-badge {
          display:inline-flex; align-items:center; gap:10px;
          padding:5px 14px 5px 5px; border-radius:999px;
          border:1px solid var(--border);
          background:rgba(255,107,0,0.06); margin-bottom:28px;
        }
        .lp-badge-pill {
          display:inline-flex; align-items:center; gap:6px;
          padding:3px 10px; border-radius:999px;
          background:rgba(255,107,0,0.15); font-size:10px;
          font-family:"Syne",sans-serif; font-weight:800; color:#ff8800;
          letter-spacing:.15em; text-transform:uppercase;
        }
        .lp-badge-dot {
          width:6px; height:6px; border-radius:50%; background:#ff8800;
          animation:lp-pulse 1.4s ease-in-out infinite; flex-shrink:0;
        }
        .lp-badge-text {
          font-size:13px; color:var(--text-muted);
          font-family:"DM Sans",sans-serif;
        }

        /* H1 */
        .lp-h1 {
          font-family:"Syne",sans-serif; font-weight:800;
          font-size:clamp(38px,4.8vw,72px); line-height:1.04;
          letter-spacing:-0.03em; color:var(--text); margin:0 0 22px;
        }
        .lp-h1-gradient {
          background:linear-gradient(135deg,#ff6b00,#ffcc00);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
        }
        .lp-h1-accent {
          color:var(--accent);
          text-shadow:0 0 50px var(--accent-glow);
        }

        .lp-sub {
          font-size:clamp(14px,1.5vw,17px); color:var(--text-muted);
          font-family:"DM Sans",sans-serif; line-height:1.82;
          max-width:400px; margin:0 0 40px;
        }
        .lp-cta-row {
          display:flex; gap:14px; flex-wrap:wrap; margin-bottom:52px; align-items:center;
        }
        .lp-btn-hero {
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 30px; font-size:14.5px;
        }
        .lp-btn-ghost {
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 24px; font-size:14.5px;
        }

        /* Social proof */
        .lp-social-proof { display:flex; align-items:center; gap:12px; }
        .lp-avatars { display:flex; }
        .lp-avatar {
          width:32px; height:32px; border-radius:50%;
          border:2.5px solid var(--bg); margin-left:-10px; position:relative;
        }
        .lp-avatars .lp-avatar:first-child { margin-left:0; }
        .lp-proof-text {
          font-size:13px; color:var(--text-muted);
          font-family:"DM Sans",sans-serif;
        }
        .lp-proof-text strong { color:var(--text); }

        /* Scroll hint */
        .lp-scroll-hint {
          position:absolute; bottom:32px; left:50%;
          transform:translateX(-50%); z-index:5;
          display:flex; flex-direction:column; align-items:center; gap:7px;
          opacity:.5; animation:lp-scroll-fade 2s ease-in-out 2.5s infinite alternate;
          pointer-events:none;
        }
        .lp-scroll-label {
          font-size:9px; color:var(--text-muted);
          font-family:"DM Sans",sans-serif; letter-spacing:.2em; text-transform:uppercase;
        }
        .lp-scroll-mouse {
          width:18px; height:26px; border-radius:9px;
          border:1.5px solid var(--border); display:flex;
          justify-content:center; padding-top:5px;
        }
        .lp-scroll-dot {
          width:3px; height:6px; border-radius:2px; background:#ff8800;
          animation:lp-scroll-dot 1.6s ease-in-out infinite;
        }

        /* ── Stats ── */
        .lp-stats {
          position:relative; z-index:1;
          border-top:1px solid var(--border); border-bottom:1px solid var(--border);
          background:var(--bg-2); padding:56px 48px;
        }
        .lp-stats-inner {
          max-width:1100px; margin:0 auto;
          display:grid; grid-template-columns:repeat(4,1fr); gap:24px;
        }
        .lp-stat {
          text-align:center; position:relative;
        }
        .lp-stat-num {
          font-family:"Syne",sans-serif; font-weight:800;
          font-size:clamp(28px,3.2vw,46px); color:var(--text);
          letter-spacing:-0.025em; line-height:1;
        }
        .lp-stat-label {
          font-size:13px; color:var(--text-muted);
          font-family:"DM Sans",sans-serif; margin-top:8px;
        }
        .lp-stat-sep {
          position:absolute; top:50%; right:0;
          width:1px; height:50%; transform:translateY(-50%);
          background:var(--border);
        }
        .lp-stat:last-child .lp-stat-sep { display:none; }

        /* ── Shared section ── */
        .lp-section-inner { max-width:1100px; margin:0 auto; }
        .lp-sec-label { margin-bottom:48px; }
        .lp-overline {
          font-family:"DM Sans",sans-serif; font-weight:700;
          font-size:11px; letter-spacing:.24em; text-transform:uppercase;
          color:var(--cta); margin:0 0 10px;
        }
        .lp-h2 {
          font-family:"Syne",sans-serif; font-weight:800;
          font-size:clamp(28px,4vw,48px); color:var(--text);
          letter-spacing:-0.025em; line-height:1.1; margin:0;
        }

        /* ── Categories ── */
        .lp-cats {
          padding:80px 48px; position:relative; z-index:1;
          background:var(--bg); border-top:1px solid var(--border);
        }
        .lp-cat-grid {
          display:grid; grid-template-columns:repeat(4,1fr); gap:12px;
          margin-top:8px;
        }
        .lp-cat-pill {
          display:flex; align-items:center; gap:10px;
          padding:14px 18px; border-radius:16px;
          background:var(--card-bg); border:1px solid var(--card-border);
          text-decoration:none; transition:all .22s ease;
          position:relative; overflow:hidden;
        }
        .lp-cat-pill:hover {
          border-color:var(--accent-dim);
          box-shadow:var(--card-shadow-h);
          transform:translateY(-3px);
        }
        .lp-cat-icon { font-size:20px; flex-shrink:0; }
        .lp-cat-name {
          flex:1; font-family:"DM Sans",sans-serif; font-weight:600;
          font-size:13.5px; color:var(--text-sub);
        }
        .lp-cat-count {
          font-family:"Syne",sans-serif; font-weight:700; font-size:11px;
          color:var(--text-muted); background:var(--bg-ghost);
          padding:3px 8px; border-radius:999px;
        }

        /* ── Features ── */
        .lp-features {
          padding:80px 48px; background:var(--bg-2);
          border-top:1px solid var(--border); position:relative; z-index:1;
        }
        .lp-feat-grid {
          display:grid; grid-template-columns:repeat(3,1fr); gap:16px;
        }
        .lp-feat-card {
          padding:28px 26px; border-radius:20px;
          background:var(--card-bg); border:1px solid var(--card-border);
          transition:all .25s ease; cursor:default; position:relative; overflow:hidden;
        }
        .lp-feat-card:hover {
          transform:translateY(-5px);
          border-color:var(--feat-accent, var(--accent-dim));
          box-shadow:0 16px 48px rgba(0,0,0,.4), 0 0 0 1px color-mix(in srgb, var(--feat-accent) 20%, transparent);
        }
        .lp-feat-top-line {
          position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,var(--feat-accent,var(--accent)),transparent);
          opacity:.5;
        }
        .lp-feat-icon {
          width:46px; height:46px; border-radius:13px;
          background:var(--feat-accent-dim, var(--accent-dim));
          border:1px solid color-mix(in srgb, var(--feat-accent) 22%, transparent);
          display:flex; align-items:center; justify-content:center;
          margin-bottom:18px;
        }
        .lp-feat-title {
          font-family:"Syne",sans-serif; font-weight:700;
          font-size:16px; color:var(--text); margin:0 0 8px;
        }
        .lp-feat-desc {
          font-size:13.5px; color:var(--text-muted);
          font-family:"DM Sans",sans-serif; line-height:1.75; margin:0;
        }

        /* ── Projects ── */
        .lp-projects {
          padding:80px 48px; background:var(--bg);
          border-top:1px solid var(--border); position:relative; z-index:1;
        }
        .lp-projects-header {
          display:flex; align-items:flex-end;
          justify-content:space-between; margin-bottom:40px; gap:16px; flex-wrap:wrap;
        }
        .lp-view-all {
          display:inline-flex; align-items:center; gap:7px;
          padding:10px 20px; font-size:13px; text-decoration:none;
          white-space:nowrap;
        }
        .lp-proj-grid {
          display:grid; grid-template-columns:repeat(4,1fr); gap:16px;
        }
        .lp-proj-card {
          border-radius:20px; overflow:hidden;
          background:var(--card-bg); border:1px solid var(--card-border);
          cursor:pointer; transition:all .25s ease; text-decoration:none; display:block;
        }
        .lp-proj-card:hover {
          transform:translateY(-6px);
          box-shadow:0 20px 52px rgba(0,0,0,.45);
        }
        .lp-proj-thumb {
          height:148px; position:relative; overflow:hidden;
          border-bottom:1px solid var(--card-border);
        }
        .lp-proj-thumb-bg {
          position:absolute; inset:0;
          background:linear-gradient(135deg,var(--proj-dim),transparent 60%);
        }
        .lp-proj-thumb-title {
          position:absolute; inset:0; display:flex; align-items:center;
          justify-content:center; font-family:"Syne",sans-serif;
          font-weight:800; font-size:18px; color:var(--proj-clr);
          opacity:.28; text-align:center; padding:0 14px;
        }
        .lp-proj-cat-badge {
          position:absolute; top:10px; left:10px;
          padding:4px 10px; border-radius:999px;
          background:color-mix(in srgb,var(--proj-clr) 14%,transparent);
          border:1px solid color-mix(in srgb,var(--proj-clr) 28%,transparent);
          font-size:11px; color:var(--proj-clr);
          font-family:"DM Sans",sans-serif; font-weight:600;
        }
        .lp-proj-hot-badge {
          position:absolute; top:10px; right:10px;
          padding:3px 9px; border-radius:999px;
          background:rgba(255,107,0,.15);
          border:1px solid rgba(255,107,0,.3);
          font-size:10px; color:#ff8800;
          font-family:"DM Sans",sans-serif; font-weight:700;
        }
        .lp-proj-body { padding:18px 18px 20px; }
        .lp-proj-title {
          font-family:"Syne",sans-serif; font-weight:700;
          font-size:14px; color:var(--text); margin:0 0 14px;
        }
        .lp-prog-track {
          height:4px; border-radius:2px;
          background:var(--bg-ghost); margin-bottom:10px; overflow:hidden;
        }
        .lp-prog-fill {
          height:100%; border-radius:2px;
          background:linear-gradient(90deg,var(--proj-clr),color-mix(in srgb,var(--proj-clr) 55%,transparent));
          width:0%; transition:width .3s ease;
        }
        .lp-proj-meta {
          display:flex; justify-content:space-between;
          align-items:center; margin-bottom:6px;
        }
        .lp-proj-raised {
          font-family:"Syne",sans-serif; font-weight:700; font-size:13px; color:var(--text);
        }
        .lp-proj-pct {
          font-family:"DM Sans",sans-serif; font-weight:700;
          font-size:12px; color:var(--proj-clr);
        }
        .lp-proj-foot {
          display:flex; justify-content:space-between;
        }
        .lp-proj-backers, .lp-proj-days {
          font-size:11.5px; color:var(--text-muted);
          font-family:"DM Sans",sans-serif;
        }

        /* ── Testimonials ── */
        .lp-testi {
          padding:80px 48px; background:var(--bg-2);
          border-top:1px solid var(--border); position:relative; z-index:1;
        }
        .lp-testi-stage {
          max-width:640px; margin:0 auto; text-align:center;
        }
        .lp-testi-card {
          flex-direction:column; align-items:center; gap:24px;
          padding:40px 48px; border-radius:24px;
          background:var(--card-bg); border:1px solid var(--card-border);
          box-shadow:var(--card-shadow);
          animation:lp-fade-in .5s ease;
        }
        .lp-testi-quote-icon { color:var(--accent); opacity:.5; }
        .lp-testi-text {
          font-family:"DM Sans",sans-serif; font-size:17px;
          color:var(--text-sub); line-height:1.75; margin:0;
          font-style:italic;
        }
        .lp-testi-author { display:flex; align-items:center; gap:14px; }
        .lp-testi-avatar {
          width:42px; height:42px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-family:"Syne",sans-serif; font-weight:800;
          font-size:14px; color:#fff; flex-shrink:0;
        }
        .lp-testi-name {
          font-family:"Syne",sans-serif; font-weight:700;
          font-size:14px; color:var(--text);
        }
        .lp-testi-role {
          font-size:12px; color:var(--text-muted);
          font-family:"DM Sans",sans-serif; margin-top:2px;
        }
        .lp-testi-dots {
          display:flex; gap:8px; justify-content:center; margin-top:28px;
        }
        .lp-testi-dot {
          width:8px; height:8px; border-radius:50%; border:none; cursor:pointer;
          background:var(--border); transition:all .3s ease; padding:0;
        }
        .lp-testi-dot-active {
          background:var(--accent); width:24px; border-radius:4px;
        }

        /* ── How it works ── */
        .lp-how {
          padding:80px 48px; position:relative; z-index:1;
          border-top:1px solid var(--border);
        }
        .lp-how-grid {
          display:grid; grid-template-columns:repeat(3,1fr); gap:0;
          position:relative;
        }
        .lp-how-step {
          padding:32px 32px 32px 0; position:relative;
        }
        .lp-how-step:not(:first-child) { padding-left:32px; }
        .lp-how-num {
          font-family:"Syne",sans-serif; font-weight:800;
          font-size:42px; color:var(--border-2); letter-spacing:-0.03em;
          line-height:1; margin-bottom:16px;
        }
        .lp-how-title {
          font-family:"Syne",sans-serif; font-weight:700;
          font-size:17px; color:var(--text); margin:0 0 10px;
        }
        .lp-how-desc {
          font-size:13.5px; color:var(--text-muted);
          font-family:"DM Sans",sans-serif; line-height:1.75; margin:0;
        }
        .lp-how-arrow {
          position:absolute; top:38px; right:-12px;
          font-size:22px; color:var(--accent); opacity:.6; z-index:1;
        }

        /* ── CTA Banner ── */
        .lp-cta-section {
          padding:72px 48px 112px; position:relative; z-index:1;
        }
        .lp-cta-inner { max-width:820px; margin:0 auto; }
        .lp-cta-banner {
          border-radius:28px; padding:76px 56px; text-align:center;
          background:var(--card-bg); border:1px solid var(--card-border);
          position:relative; overflow:hidden;
          box-shadow:var(--card-shadow);
        }
        .lp-cta-bg-orb {
          position:absolute; border-radius:50%; pointer-events:none;
        }
        .lp-cta-bg-orb-a {
          width:500px; height:500px;
          background:radial-gradient(circle,rgba(0,245,212,0.07) 0%,transparent 70%);
          top:50%; left:50%; transform:translate(-50%,-50%);
        }
        .lp-cta-bg-orb-b {
          width:200px; height:200px;
          background:rgba(255,107,0,0.06); filter:blur(60px);
          top:-60px; right:-60px;
        }
        .lp-cta-noise {
          position:absolute; inset:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          opacity:.4; mix-blend-mode:overlay; pointer-events:none;
        }
        .lp-cta-overline { position:relative; margin-bottom:18px; }
        .lp-cta-h2 {
          font-family:"Syne",sans-serif; font-weight:800;
          font-size:clamp(30px,4vw,54px); color:var(--text);
          letter-spacing:-0.025em; line-height:1.08;
          margin:0 0 20px; position:relative;
        }
        .lp-cta-accent {
          color:var(--accent); text-shadow:0 0 50px var(--accent-glow);
        }
        .lp-cta-sub {
          font-size:15.5px; color:var(--text-muted);
          font-family:"DM Sans",sans-serif; line-height:1.78;
          max-width:440px; margin:0 auto 40px; position:relative;
        }
        .lp-cta-buttons {
          display:flex; gap:14px; justify-content:center;
          flex-wrap:wrap; position:relative; margin-bottom:32px;
        }
        .lp-trust-row {
          display:flex; gap:20px; justify-content:center;
          flex-wrap:wrap; position:relative;
        }
        .lp-trust-badge {
          display:inline-flex; align-items:center; gap:6px;
          font-size:12px; color:var(--text-muted);
          font-family:"DM Sans",sans-serif;
        }
        .lp-trust-badge svg { color:var(--accent); flex-shrink:0; }

        /* ── Keyframes ── */
        @keyframes lp-float-a {
          0%,100%{transform:translateY(0) scale(1);}
          50%{transform:translateY(-22px) scale(1.04);}
        }
        @keyframes lp-float-b {
          0%,100%{transform:translateY(0);}
          50%{transform:translateY(-16px);}
        }
        @keyframes lp-float-c {
          0%,100%{transform:translateY(0) scale(1);}
          50%{transform:translateY(-12px) scale(1.02);}
        }
        @keyframes lp-pulse {
          0%,100%{opacity:.5;} 50%{opacity:1;}
        }
        @keyframes lp-scroll-fade {
          from{opacity:.2;} to{opacity:.6;}
        }
        @keyframes lp-scroll-dot {
          0%{transform:translateY(0);opacity:1;}
          100%{transform:translateY(10px);opacity:0;}
        }
        @keyframes lp-fade-in {
          from{opacity:0;transform:translateY(10px);}
          to{opacity:1;transform:translateY(0);}
        }

        /* ── Responsive ── */
        @media(max-width:1100px){
          .lp-cat-grid{grid-template-columns:repeat(4,1fr);}
          .lp-feat-grid{grid-template-columns:repeat(2,1fr);}
          .lp-proj-grid{grid-template-columns:repeat(2,1fr);}
          .lp-how-grid{gap:0;}
        }
        @media(max-width:900px){
          .lp-hero{padding:100px 24px 60px;}
          .lp-hero-content{flex:1; max-width:100%;}
          .lp-hero-canvas{display:none;}
          .lp-stats{padding:48px 24px;}
          .lp-stats-inner{grid-template-columns:repeat(2,1fr);}
          .lp-cats,.lp-features,.lp-projects,.lp-testi,.lp-how,.lp-cta-section{padding:60px 24px;}
          .lp-cats .lp-section-inner,.lp-features .lp-section-inner,
          .lp-projects .lp-section-inner,.lp-testi .lp-section-inner,
          .lp-how .lp-section-inner{padding:0;}
          .lp-cat-grid{grid-template-columns:repeat(2,1fr);}
          .lp-how-grid{grid-template-columns:1fr;}
          .lp-how-step{padding:24px 0;}
          .lp-how-arrow{display:none;}
          .lp-cta-banner{padding:48px 28px;}
        }
        @media(max-width:600px){
          .lp-stats-inner{grid-template-columns:repeat(2,1fr);}
          .lp-stat-sep{display:none;}
          .lp-feat-grid{grid-template-columns:1fr;}
          .lp-proj-grid{grid-template-columns:1fr;}
          .lp-cat-grid{grid-template-columns:repeat(2,1fr);}
          .lp-testi-card{padding:28px 20px;}
          .lp-trust-row{gap:12px;}
        }
      `}</style>
    </div>
  );
}