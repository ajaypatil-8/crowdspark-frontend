"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import gsap from "gsap";

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Custom cursor
  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    const move = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0 });
    };

    const animate = () => {
      followerX += (mouseX - followerX) * 0.1;
      followerY += (mouseY - followerY) * 0.1;
      gsap.set(follower, { x: followerX, y: followerY });
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move);
    animate();

    const hoverEls = document.querySelectorAll("a, button, input");
    hoverEls.forEach((el) => {
      el.addEventListener("mouseenter", () => follower?.classList.add("hover"));
      el.addEventListener("mouseleave", () => follower?.classList.remove("hover"));
    });

    return () => window.removeEventListener("mousemove", move);
  }, [mounted]);

  // GSAP entrance
  useEffect(() => {
    setMounted(true);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        orb1Ref.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.8, ease: "power2.out" }
      )
        .fromTo(
          orb2Ref.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.8, ease: "power2.out" },
          "-=1.4"
        )
        .fromTo(
          logoRef.current,
          { y: -30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          "-=1"
        )
        .fromTo(
          cardRef.current,
          { y: 40, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
          "-=0.6"
        );

      // Orb float animations
      gsap.to(orb1Ref.current, {
        y: -40,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(orb2Ref.current, {
        y: 30,
        duration: 6.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000));
    setIsLoading(false);
  };

  const inputVariants = {
    idle: { borderColor: "rgba(255,255,255,0.1)" },
    focus: { borderColor: "rgba(0, 245, 212, 0.8)" },
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Custom Cursor */}
      <div ref={cursorRef} className="cursor" />
      <div ref={followerRef} className="cursor-follower" />

      {/* Background orbs */}
      <div
        ref={orb1Ref}
        className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-0"
        style={{
          background: "radial-gradient(circle, rgba(0,245,212,0.12) 0%, rgba(0,245,212,0.04) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        ref={orb2Ref}
        className="absolute bottom-[-20%] left-[-15%] w-[700px] h-[700px] rounded-full opacity-0"
        style={{
          background: "radial-gradient(circle, rgba(123,47,255,0.1) 0%, rgba(123,47,255,0.03) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Scan line */}
      <div className="scan-line" style={{ top: 0 }} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 245, 212, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 245, 212, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Logo */}
      <div ref={logoRef} className="absolute top-8 left-10 opacity-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center relative"
            style={{ background: "var(--accent-cyan)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#050508" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-syne font-700 text-xl tracking-tight"
            style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }}>
            Crowd<span style={{ color: "var(--accent-cyan)" }}>Spark</span>
          </span>
        </Link>
      </div>

      {/* Card */}
      <div ref={cardRef} className="relative w-full max-w-[440px] mx-4 opacity-0">
        {/* Animated border card */}
        <div className="glass-card glow-cyan rounded-2xl p-8" style={{ border: "1px solid rgba(0,245,212,0.15)" }}>
          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-[1px]"
            style={{ background: "linear-gradient(90deg, transparent, var(--accent-cyan), transparent)" }} />

          {/* Header */}
          <div className="mb-8">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-xs font-medium tracking-[0.25em] uppercase mb-3"
              style={{ color: "var(--accent-cyan)", fontFamily: "DM Sans, sans-serif" }}
            >
              Welcome back
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="text-4xl font-800 leading-tight"
              style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
            >
              Sign in to
              <br />
              <span style={{ color: "var(--accent-cyan)" }} className="text-glow">your account</span>
            </motion.h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="space-y-1.5"
            >
              <label className="text-xs font-medium tracking-wider uppercase"
                style={{ color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  className="auth-input w-full px-4 py-3.5 rounded-xl text-sm"
                  required
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-40">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium tracking-wider uppercase"
                  style={{ color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                  Password
                </label>
                <Link href="/forgot-password"
                  className="text-xs transition-colors duration-200"
                  style={{ color: "var(--accent-cyan)", opacity: 0.7 }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••••"
                  className="auth-input w-full px-4 py-3.5 rounded-xl text-sm pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Remember me */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <button
                type="button"
                className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.03)"
                }}
              >
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>Keep me signed in</span>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-4 rounded-xl text-sm relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <div className="w-4 h-4 border-2 border-[#050508] border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      Sign in
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="flex items-center gap-4 my-6"
          >
            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or continue with</span>
            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
          </motion.div>

          {/* Social logins */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              {
                name: "Google",
                icon: (
                  <svg width="17" height="17" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                ),
              },
              {
                name: "GitHub",
                icon: (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                ),
              },
            ].map((provider) => (
              <button
                key={provider.name}
                type="button"
                className="flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--text-primary)",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,245,212,0.3)";
                  e.currentTarget.style.background = "rgba(0,245,212,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              >
                {provider.icon}
                <span>{provider.name}</span>
              </button>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="text-center text-sm mt-6"
            style={{ color: "var(--text-muted)" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium transition-colors duration-200"
              style={{ color: "var(--accent-cyan)" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Create one free →
            </Link>
          </motion.p>
        </div>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.6 }}
          className="text-center text-xs mt-4"
          style={{ color: "rgba(107, 107, 128, 0.5)" }}
        >
          Protected by reCAPTCHA · Privacy · Terms
        </motion.p>
      </div>
    </div>
  );
}