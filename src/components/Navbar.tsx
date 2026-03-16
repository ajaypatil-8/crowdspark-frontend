"use client";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import gsap from "gsap";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { useProfile } from "@/contexts/ProfileContext";
import {
  authApi,
  isLoggedIn,
} from "@/lib/api";

const LINKS = [
  { label: "Explore",      href: "/explore"  },
  { label: "How it works", href: "/#how"     },
  { label: "Creators",     href: "/creators" },
  { label: "Pricing",      href: "/pricing"  },
];

const IcGrid = () => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IcUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IcGear = () => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
const IcHeart = () => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const IcBookmark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
  </svg>
);
const IcZap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IcRocket = () => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
  </svg>
);
const IcLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IcChevronDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round"
    strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

function FireParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse)").matches
    ) {
      setIsTouch(true);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 80;
    canvas.height = 40;
    type P = {
      x: number;
      y: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
    };
    const particles: P[] = [];
    const spawn = () => {
      particles.push({
        x: 30 + Math.random() * 20,
        y: 36,
        vy: -(0.6 + Math.random() * 1.0),
        life: 0,
        maxLife: 24 + Math.random() * 16,
        size: 2 + Math.random() * 3,
      });
    };
    let frame = 0;
    let rafId: number;
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      frame++;
      if (frame % 2 === 0) spawn();
      ctx.clearRect(0, 0, 80, 40);
      for (
        let i = particles.length - 1;
        i >= 0;
        i--
      ) {
        const p = particles[i];
        p.y += p.vy;
        p.x += (Math.random() - 0.5) * 0.8;
        p.life++;
        const t = p.life / p.maxLife;
        if (t >= 1) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = (1 - t) * 0.85;
        const sz = p.size * (1 - t * 0.6);
        const g = Math.round(255 * (1 - t * 0.85));
        const b = Math.round(60 * (1 - t));
        ctx.save();
        ctx.globalAlpha = alpha;
        const gr = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, sz,
        );
        gr.addColorStop(0, `rgb(255,${g},${b})`);
        gr.addColorStop(1, "transparent");
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
    tick();
    return () => cancelAnimationFrame(rafId);
  }, []);
  if (isTouch) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        bottom: -4,
        left: -16,
        width: 80,
        height: 40,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

function UserDropdown({
  isDark,
}: {
  isDark: boolean;
}) {
  const router = useRouter();
  const { user } = useProfile();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isCreator = user?.roles?.includes("CREATOR");
  const initials =
    user?.name
      ?.split(" ")
      .map((w: string) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () =>
      document.removeEventListener("mousedown", fn);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await authApi.logout();
    router.push("/login");
  };

  const bg = isDark
    ? "rgba(9,9,13,0.97)"
    : "rgba(255,255,255,0.97)";
  const bdr = isDark
    ? "rgba(255,255,255,0.1)"
    : "rgba(0,0,0,0.09)";

  const groups = [
    {
      title: "Dashboard",
      items: [
        {
          href: "/dashboard",
          icon: <IcGrid />,
          label: "Overview",
          color: "#ff8800",
        },
        {
          href: "/dashboard/profile",
          icon: <IcUser />,
          label: "Profile",
          color: "#a78bfa",
        },
        {
          href: "/dashboard/settings",
          icon: <IcGear />,
          label: "Settings",
          color: "#00d4b8",
        },
      ],
    },
    {
      title: "Activity",
      items: [
        {
          href: "/dashboard/backed",
          icon: <IcHeart />,
          label: "Backed",
          color: "#ef4444",
        },
        {
          href: "/dashboard/saved",
          icon: <IcBookmark />,
          label: "Saved",
          color: "#f59e0b",
        },
        isCreator
          ? {
              href: "/dashboard/my-campaigns",
              icon: <IcZap />,
              label: "My Campaigns",
              color: "#34d399",
            }
          : {
              href: "/dashboard/become-creator",
              icon: <IcRocket />,
              label: "Become Creator",
              color: "#ff8800",
            },
      ],
    },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Account menu"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "4px 10px 4px 4px",
          borderRadius: 999,
          background: open
            ? isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.06)"
            : "none",
          border: `1px solid ${
            open ? bdr : "transparent"
          }`,
          cursor: "pointer",
          transition: "all 0.18s",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid rgba(255,107,0,0.4)",
            flexShrink: 0,
          }}
        >
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(135deg,#ff6b00,#ffcc00)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 11,
              }}
            >
              {initials}
            </div>
          )}
        </div>
        <span
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            maxWidth: 72,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user?.name?.split(" ")[0] ?? "Account"}
        </span>
        <span
          style={{
            color: "var(--text-muted)",
            opacity: 0.55,
            display: "flex",
            transform: open
              ? "rotate(180deg)"
              : "rotate(0deg)",
            transition: "transform 0.22s",
          }}
        >
          <IcChevronDown />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 330,
              damping: 28,
            }}
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 240,
              borderRadius: 18,
              background: bg,
              border: `1px solid ${bdr}`,
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              boxShadow: isDark
                ? "0 24px 60px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,107,0,0.08)"
                : "0 24px 60px rgba(0,0,0,0.13), 0 0 0 1px rgba(255,107,0,0.07)",
              overflow: "hidden",
              zIndex: 200,
            }}
          >
            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(90deg,transparent,rgba(255,120,0,0.65),rgba(255,220,0,0.85),rgba(255,120,0,0.65),transparent)",
              }}
            />

            <div
              style={{
                padding: "13px 14px 10px",
                borderBottom: `1px solid ${bdr}`,
              }}
            >
              <p
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--text)",
                  margin: "0 0 1px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name}
              </p>
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 11.5,
                  color: "var(--text-muted)",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email}
              </p>
            </div>

            {groups.map(({ title, items }) => (
              <div
                key={title}
                style={{ padding: "5px 6px 0" }}
              >
                <p
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "5px 8px 3px",
                    margin: 0,
                  }}
                >
                  {title}
                </p>
                {items.map(({ href, icon, label, color }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 10,
                      textDecoration: "none",
                      color: "var(--text)",
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 13.5,
                      fontWeight: 500,
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      (
                        e.currentTarget as HTMLAnchorElement
                      ).style.background = isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      (
                        e.currentTarget as HTMLAnchorElement
                      ).style.background = "transparent";
                    }}
                  >
                    <div
                      style={{
                        width: 27,
                        height: 27,
                        borderRadius: 8,
                        background: isDark
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color,
                        flexShrink: 0,
                      }}
                    >
                      {icon}
                    </div>
                    {label}
                  </Link>
                ))}
                <div
                  style={{
                    height: 1,
                    background: bdr,
                    margin: "5px 0",
                  }}
                />
              </div>
            ))}

            <div style={{ padding: "0 6px 8px" }}>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => {
                  (
                    e.currentTarget as HTMLButtonElement
                  ).style.background = isDark
                    ? "rgba(239,68,68,0.09)"
                    : "rgba(239,68,68,0.06)";
                }}
                onMouseLeave={(e) => {
                  (
                    e.currentTarget as HTMLButtonElement
                  ).style.background = "transparent";
                }}
              >
                <div
                  style={{
                    width: 27,
                    height: 27,
                    borderRadius: 8,
                    background: "rgba(239,68,68,0.09)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ef4444",
                    flexShrink: 0,
                  }}
                >
                  <IcLogout />
                </div>
                <span
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: "#ef4444",
                  }}
                >
                  Sign out
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { isDark } = useTheme();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -60, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: "back.out(1.4)",
        delay: 0.3,
      },
    );
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, {
      passive: true,
    });
    return () =>
      window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register";
  if (isAuthPage) return null;

  const iconClr = isDark ? "#050508" : "#fff";

  const glassBg = scrolled
    ? isDark
      ? "rgba(8,8,14,0.88)"
      : "rgba(255,255,255,0.88)"
    : isDark
      ? "rgba(8,8,14,0.62)"
      : "rgba(255,255,255,0.58)";

  const glassBdr = isDark
    ? "1px solid rgba(255,255,255,0.08)"
    : "1px solid rgba(0,0,0,0.07)";

  const glassShadow = scrolled
    ? "0 8px 40px rgba(0,0,0,0.35),0 0 0 1px rgba(255,120,0,0.1),inset 0 1px 0 rgba(255,255,255,0.07)"
    : "0 4px 24px rgba(0,0,0,0.18),inset 0 1px 0 rgba(255,255,255,0.06)";

  return (
    <>
      <div
        ref={navRef}
        style={{
          position: "fixed",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          width: "min(860px,calc(100vw - 32px))",
        }}
      >
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 340,
            damping: 30,
          }}
          style={{
            borderRadius: 9999,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              background: glassBg,
              backdropFilter:
                "blur(24px) saturate(180%)",
              WebkitBackdropFilter:
                "blur(24px) saturate(180%)",
              border: glassBdr,
              boxShadow: glassShadow,
              transition:
                "background 0.3s, box-shadow 0.3s",
              padding: "0 6px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "15%",
                right: "15%",
                height: 1,
                background:
                  "linear-gradient(90deg,transparent,rgba(255,120,0,0.7) 30%,rgba(255,220,0,0.9) 50%,rgba(255,120,0,0.7) 70%,transparent)",
                opacity: scrolled ? 1 : 0.55,
                transition: "opacity 0.3s",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: -1,
                borderRadius: 9999,
                boxShadow:
                  "0 -2px 20px rgba(255,100,0,0.22),0 -1px 8px rgba(255,200,0,0.18)",
                pointerEvents: "none",
                zIndex: -1,
              }}
            />

            <div
              style={{
                height: 58,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 8px",
                gap: 8,
              }}
            >
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  textDecoration: "none",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <FireParticles />
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg,var(--accent),#ff8800)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                    flexShrink: 0,
                    boxShadow:
                      "0 0 12px rgba(255,120,0,0.5),0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  <svg
                    width="15" height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                      fill={iconClr}
                    />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: "var(--text)",
                    letterSpacing: "-0.02em",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  Crowd
                  <span style={{ color: "var(--accent)" }}>
                    Spark
                  </span>
                </span>
              </Link>

              <nav
                className="nb-desktop"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {LINKS.map((l) => {
                  const active = pathname === l.href;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="nb-pill"
                      style={{
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: 13.5,
                        fontWeight: 500,
                        color: active
                          ? "var(--accent)"
                          : "var(--text-muted)",
                        textDecoration: "none",
                        padding: "6px 14px",
                        borderRadius: 999,
                        background: active
                          ? "var(--accent-dim)"
                          : "transparent",
                        transition: "all 0.18s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </nav>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <ThemeToggle />

                {loggedIn ? (
                  <div className="nb-desktop">
                    <UserDropdown isDark={isDark} />
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="nb-desktop nb-signin"
                      style={{
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text-muted)",
                        textDecoration: "none",
                        padding: "7px 12px",
                        borderRadius: 999,
                        transition: "color 0.18s",
                      }}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="nb-desktop nb-cta"
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: "Syne, sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#fff",
                        textDecoration: "none",
                        padding: "8px 20px",
                        borderRadius: 999,
                        background:
                          "linear-gradient(135deg,#ff6b00 0%,#ff9500 50%,#ffcc00 100%)",
                        boxShadow:
                          "0 0 16px rgba(255,100,0,0.55),0 2px 8px rgba(0,0,0,0.3)",
                        transition:
                          "transform 0.18s, box-shadow 0.18s",
                        overflow: "hidden",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.35) 50%,transparent 70%)",
                          animation:
                            "nbShimmer 2.4s ease-in-out infinite",
                        }}
                      />
                      <svg
                        width="13" height="13"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ position: "relative" }}
                      >
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      <span style={{ position: "relative" }}>
                        Get started
                      </span>
                    </Link>
                  </>
                )}

                <button
                  className="nb-hamburger"
                  onClick={() => setOpen((v) => !v)}
                  aria-label="Toggle menu"
                  aria-expanded={open}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 6,
                    color: "var(--text)",
                    display: "none",
                    borderRadius: 8,
                  }}
                >
                  <svg
                    width="20" height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    {open ? (
                      <>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </>
                    ) : (
                      <>
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 28,
              }}
              style={{
                marginTop: 8,
                borderRadius: 20,
                background: isDark
                  ? "rgba(8,8,14,0.94)"
                  : "rgba(255,255,255,0.94)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(0,0,0,0.07)",
                boxShadow:
                  "0 8px 40px rgba(0,0,0,0.3),0 0 0 1px rgba(255,100,0,0.1)",
                padding: "12px 16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div
                style={{
                  height: 1,
                  borderRadius: 1,
                  marginBottom: 8,
                  background:
                    "linear-gradient(90deg,transparent,rgba(255,120,0,0.7),rgba(255,220,0,0.9),rgba(255,120,0,0.7),transparent)",
                }}
              />
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={l.href}
                    style={{
                      display: "block",
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 15,
                      fontWeight: 500,
                      color:
                        pathname === l.href
                          ? "var(--accent)"
                          : "var(--text)",
                      textDecoration: "none",
                      padding: "11px 12px",
                      borderRadius: 12,
                      background:
                        pathname === l.href
                          ? "var(--accent-dim)"
                          : "transparent",
                      transition: "background 0.18s",
                    }}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                {loggedIn ? (
                  <Link
                    href="/dashboard"
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "11px 0",
                      borderRadius: 12,
                      background: "var(--accent)",
                      color: iconClr,
                      fontFamily: "Syne, sans-serif",
                      fontSize: 14,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      style={{
                        flex: 1,
                        textAlign: "center",
                        padding: "11px 0",
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--bg-ghost)",
                        color: "var(--text)",
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      style={{
                        flex: 1,
                        textAlign: "center",
                        padding: "11px 0",
                        borderRadius: 12,
                        background:
                          "linear-gradient(135deg,#ff6b00,#ffcc00)",
                        color: "#fff",
                        fontFamily: "Syne, sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: "none",
                        boxShadow:
                          "0 0 16px rgba(255,100,0,0.4)",
                      }}
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes nbShimmer {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(200%); }
          100% { transform: translateX(200%); }
        }
        .nb-pill:hover {
          color: var(--text) !important;
          background: var(--bg-ghost) !important;
        }
        .nb-signin:hover {
          color: var(--text) !important;
        }
        .nb-cta:hover {
          transform: translateY(-1px) scale(1.03);
          box-shadow:
            0 0 28px rgba(255,100,0,0.75),
            0 4px 16px rgba(0,0,0,0.3) !important;
        }
        @media (max-width: 768px) {
          .nb-desktop { display: none !important; }
          .nb-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}