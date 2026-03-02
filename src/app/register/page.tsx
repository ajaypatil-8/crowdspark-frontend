"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import gsap from "gsap";

const steps = [
  { id: 1, label: "Account" },
  { id: 2, label: "Profile" },
  { id: 3, label: "Done" },
];

export default function RegisterPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    username: "",
    role: "",
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

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

    return () => window.removeEventListener("mousemove", move);
  }, []);

  // GSAP entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo([orb1Ref.current, orb2Ref.current, orb3Ref.current],
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2, ease: "power2.out", stagger: 0.3 }
      ).fromTo(
        cardRef.current,
        { y: 50, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 1 },
        "-=1.2"
      );

      // Float animations
      gsap.to(orb1Ref.current, { y: -50, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(orb2Ref.current, { y: 40, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.5 });
      gsap.to(orb3Ref.current, { y: -30, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.8 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleNext = async () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 2000));
      setIsLoading(false);
      setCurrentStep(3);
      setIsDone(true);
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  const roles = ["Creator", "Backer", "Startup", "Agency"];

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-10"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Custom Cursor */}
      <div ref={cursorRef} className="cursor" />
      <div ref={followerRef} className="cursor-follower" />

      {/* Orbs */}
      <div ref={orb1Ref} className="absolute top-[-20%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-0"
        style={{ background: "radial-gradient(circle, rgba(0,245,212,0.1) 0%, rgba(0,245,212,0.03) 50%, transparent 70%)", filter: "blur(50px)" }}
      />
      <div ref={orb2Ref} className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-0"
        style={{ background: "radial-gradient(circle, rgba(123,47,255,0.1) 0%, rgba(123,47,255,0.03) 50%, transparent 70%)", filter: "blur(60px)" }}
      />
      <div ref={orb3Ref} className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-0"
        style={{ background: "radial-gradient(circle, rgba(0,245,212,0.05) 0%, transparent 70%)", filter: "blur(40px)" }}
      />

      {/* Scan line */}
      <div className="scan-line" />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,245,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,212,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Logo */}
      <div className="absolute top-8 left-10">
        <Link href="/login" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent-cyan)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#050508" />
            </svg>
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }} className="text-xl tracking-tight">
            Crowd<span style={{ color: "var(--accent-cyan)" }}>Spark</span>
          </span>
        </Link>
      </div>

      {/* Card */}
      <div ref={cardRef} className="relative w-full max-w-[460px] mx-4 opacity-0">
        <div className="glass-card glow-cyan rounded-2xl p-8" style={{ border: "1px solid rgba(0,245,212,0.15)" }}>
          {/* Top accent */}
          <div className="absolute top-0 left-8 right-8 h-[1px]"
            style={{ background: "linear-gradient(90deg, transparent, var(--accent-cyan), transparent)" }} />

          {/* Progress steps */}
          {!isDone && (
            <div className="flex items-center gap-2 mb-8">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        backgroundColor: currentStep >= step.id ? "var(--accent-cyan)" : "rgba(255,255,255,0.06)",
                        borderColor: currentStep >= step.id ? "var(--accent-cyan)" : "rgba(255,255,255,0.12)",
                        scale: currentStep === step.id ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.4 }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        border: "1.5px solid",
                        fontFamily: "Syne, sans-serif",
                        color: currentStep >= step.id ? "#050508" : "var(--text-muted)",
                      }}
                    >
                      {currentStep > step.id ? (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5l3.5 3.5L11 1" stroke="#050508" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : step.id}
                    </motion.div>
                    <span className="text-xs" style={{
                      color: currentStep >= step.id ? "var(--text-primary)" : "var(--text-muted)",
                      fontFamily: "DM Sans, sans-serif",
                    }}>
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 h-px mx-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div
                        className="h-full"
                        animate={{ width: currentStep > step.id ? "100%" : "0%" }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        style={{ background: "var(--accent-cyan)" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step content */}
          <AnimatePresence mode="wait" custom={currentStep}>
            {isDone ? (
              <motion.div
                key="done"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "backOut" }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: "backOut" }}
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{
                    background: "radial-gradient(circle, rgba(0,245,212,0.2), rgba(0,245,212,0.05))",
                    border: "1px solid var(--accent-cyan)",
                    boxShadow: "0 0 40px rgba(0,245,212,0.3)",
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-3xl font-bold mb-3"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  You&apos;re in!
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-sm mb-8"
                  style={{ color: "var(--text-muted)" }}
                >
                  Your CrowdSpark account is ready.<br />Start igniting ideas today.
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <Link href="/dashboard"
                    className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm"
                  >
                    Go to Dashboard
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              </motion.div>
            ) : currentStep === 1 ? (
              <motion.div
                key="step1"
                custom={1}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="mb-7">
                  <p className="text-xs font-medium tracking-[0.25em] uppercase mb-2"
                    style={{ color: "var(--accent-cyan)", fontFamily: "DM Sans, sans-serif" }}>
                    Step 1 of 2
                  </p>
                  <h1 className="text-3xl font-800 leading-tight"
                    style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}>
                    Create your
                    <br />
                    <span style={{ color: "var(--accent-cyan)" }}>free account</span>
                  </h1>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs tracking-wider uppercase"
                      style={{ color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                      Email address
                    </label>
                    <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                      placeholder="you@example.com" className="auth-input w-full px-4 py-3.5 rounded-xl text-sm" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs tracking-wider uppercase"
                      style={{ color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                      Password
                    </label>
                    <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)}
                      placeholder="Min 8 characters" className="auth-input w-full px-4 py-3.5 rounded-xl text-sm" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs tracking-wider uppercase"
                      style={{ color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                      Confirm password
                    </label>
                    <input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)}
                      placeholder="Repeat password" className="auth-input w-full px-4 py-3.5 rounded-xl text-sm" required />
                  </div>

                  {/* Password strength */}
                  {form.password && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="space-y-1.5">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex-1 h-1 rounded-full overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.06)" }}>
                            <motion.div className="h-full rounded-full"
                              animate={{ width: form.password.length >= i * 3 ? "100%" : "0%" }}
                              transition={{ duration: 0.3 }}
                              style={{
                                background: form.password.length < 4 ? "#ef4444"
                                  : form.password.length < 7 ? "#f59e0b"
                                    : form.password.length < 10 ? "#3b82f6"
                                      : "var(--accent-cyan)",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {form.password.length < 4 ? "Weak" : form.password.length < 7 ? "Fair" : form.password.length < 10 ? "Good" : "Strong"} password
                      </p>
                    </motion.div>
                  )}
                </div>

                <button onClick={handleNext} className="btn-primary w-full py-4 rounded-xl text-sm mt-6 flex items-center justify-center gap-2">
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Social */}
                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
                  <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {["Google", "GitHub"].map((p) => (
                    <button key={p} type="button"
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "var(--text-primary)", fontFamily: "DM Sans, sans-serif",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,245,212,0.3)"; e.currentTarget.style.background = "rgba(0,245,212,0.05)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    >
                      {p === "Google" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                        </svg>
                      )}
                      {p}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                custom={2}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="mb-7">
                  <p className="text-xs font-medium tracking-[0.25em] uppercase mb-2"
                    style={{ color: "var(--accent-cyan)", fontFamily: "DM Sans, sans-serif" }}>
                    Step 2 of 2
                  </p>
                  <h1 className="text-3xl font-800 leading-tight"
                    style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}>
                    Tell us about
                    <br />
                    <span style={{ color: "var(--accent-cyan)" }}>yourself</span>
                  </h1>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs tracking-wider uppercase"
                        style={{ color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                        Full name
                      </label>
                      <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
                        placeholder="Jane Smith" className="auth-input w-full px-4 py-3.5 rounded-xl text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs tracking-wider uppercase"
                        style={{ color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                        Username
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm"
                          style={{ color: "var(--text-muted)" }}>@</span>
                        <input type="text" value={form.username} onChange={(e) => update("username", e.target.value)}
                          placeholder="janesmith" className="auth-input w-full pl-7 pr-4 py-3.5 rounded-xl text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs tracking-wider uppercase"
                      style={{ color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                      I am a...
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map((role) => (
                        <motion.button
                          key={role}
                          type="button"
                          onClick={() => update("role", role)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="py-3 rounded-xl text-sm font-medium text-left px-4 transition-all duration-200"
                          style={{
                            background: form.role === role ? "rgba(0,245,212,0.1)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${form.role === role ? "var(--accent-cyan)" : "rgba(255,255,255,0.08)"}`,
                            color: form.role === role ? "var(--accent-cyan)" : "var(--text-primary)",
                            fontFamily: "DM Sans, sans-serif",
                            boxShadow: form.role === role ? "0 0 20px rgba(0,245,212,0.1)" : "none",
                          }}
                        >
                          <span className="flex items-center gap-2">
                            {form.role === role && (
                              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                  <path d="M1 5l3.5 3.5L11 1" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              </motion.span>
                            )}
                            {role}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <button type="button"
                      className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                      style={{ border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)" }}
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                    <span className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      I agree to CrowdSpark&apos;s{" "}
                      <span style={{ color: "var(--accent-cyan)" }} className="cursor-pointer">Terms of Service</span>
                      {" "}and{" "}
                      <span style={{ color: "var(--accent-cyan)" }} className="cursor-pointer">Privacy Policy</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-4 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--text-muted)",
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="btn-primary flex-[2] py-4 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#050508] border-t-transparent rounded-full animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign in link */}
          {!isDone && (
            <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
              Already have an account?{" "}
              <Link href="/login"
                className="font-medium transition-colors"
                style={{ color: "var(--accent-cyan)" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Sign in →
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}