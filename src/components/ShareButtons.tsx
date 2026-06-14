// src/components/ShareButtons.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2, Link2, Check, Twitter, Linkedin,
  MessageCircle, X as XIcon,
} from "lucide-react";

interface Props {
  title:       string;
  description: string;
  url?:        string;   // defaults to window.location.href
  isDark:      boolean;
  /** Called after any share action fires (for analytics, etc.) */
  onShare?:    (platform: string) => void;
}

interface Platform {
  id:    string;
  label: string;
  color: string;
  icon:  React.ReactNode;
  href:  (url: string, title: string, description: string) => string;
}

const PLATFORMS: Platform[] = [
  {
    id:    "twitter",
    label: "Twitter / X",
    color: "#000000",
    icon:  <Twitter size={14} />,
    href:  (url, title) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&via=CrowdSpark`,
  },
  {
    id:    "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    icon:  <MessageCircle size={14} />,
    href:  (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
  },
  {
    id:    "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    icon:  <Linkedin size={14} />,
    href:  (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

export default function ShareButtons({
  title,
  description,
  url,
  isDark,
  onShare,
}: Props) {
  const [open,    setOpen]    = useState(false);
  const [copied,  setCopied]  = useState(false);
  const popoverRef            = useRef<HTMLDivElement>(null);

  const resolvedUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: description, url: resolvedUrl });
        onShare?.("native");
      } catch {
        // User cancelled — no-op
      }
      return;
    }
    setOpen(p => !p);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(resolvedUrl);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = resolvedUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    onShare?.("copy");
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePlatform(platform: Platform) {
    const href = platform.href(resolvedUrl, title, description);
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
    onShare?.(platform.id);
    setOpen(false);
  }

  // ── Style tokens ─────────────────────────────────────────────────────────
  const bdr   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const card  = isDark ? "#141414"                : "#ffffff";
  const txt   = isDark ? "#f0f0f0"                : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const hover = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  return (
    <div ref={popoverRef} style={{ position: "relative" }}>

      {/* ── Trigger button ── */}
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleNativeShare}
        aria-label="Share this project"
        style={{
          display:     "flex",
          alignItems:  "center",
          gap:         7,
          padding:     "11px 16px",
          borderRadius: 14,
          border:      `1px solid ${bdr}`,
          background:  card,
          color:       muted,
          fontFamily:  "DM Sans, sans-serif",
          fontSize:    13,
          fontWeight:  600,
          cursor:      "pointer",
          whiteSpace:  "nowrap",
        }}
      >
        <Share2 size={14} />
        Share
      </motion.button>

      {/* ── Popover — shown when native share is unavailable ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 8,  scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position:   "absolute",
              bottom:     "calc(100% + 10px)",
              right:      0,
              zIndex:     50,
              background: card,
              border:     `1px solid ${bdr}`,
              borderRadius: 16,
              padding:    "10px 8px",
              minWidth:   210,
              boxShadow:  isDark
                ? "0 16px 48px rgba(0,0,0,0.6)"
                : "0 8px 32px rgba(0,0,0,0.14)",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close share menu"
              style={{
                position: "absolute", top: 8, right: 8,
                background: "none", border: "none", cursor: "pointer",
                color: muted, padding: 4, lineHeight: 0,
              }}
            >
              <XIcon size={13} />
            </button>

            <p style={{
              fontSize: 11, fontWeight: 700, color: muted,
              textTransform: "uppercase", letterSpacing: 0.6,
              padding: "2px 10px 8px",
            }}>
              Share via
            </p>

            {/* Platform buttons */}
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => handlePlatform(p)}
                style={{
                  display:     "flex",
                  alignItems:  "center",
                  gap:         10,
                  width:       "100%",
                  padding:     "9px 12px",
                  background:  "none",
                  border:      "none",
                  borderRadius: 10,
                  cursor:      "pointer",
                  color:       txt,
                  fontSize:    13,
                  fontWeight:  500,
                  fontFamily:  "DM Sans, sans-serif",
                  transition:  "background 0.14s",
                  textAlign:   "left",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = hover)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: p.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff",
                }}>
                  {p.icon}
                </span>
                {p.label}
              </button>
            ))}

            {/* Divider */}
            <div style={{ height: 1, background: bdr, margin: "6px 8px" }} />

            {/* Copy link */}
            <button
              onClick={handleCopy}
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        10,
                width:      "100%",
                padding:    "9px 12px",
                background: "none",
                border:     "none",
                borderRadius: 10,
                cursor:     "pointer",
                color:      copied ? "#22c55e" : txt,
                fontSize:   13,
                fontWeight: 500,
                fontFamily: "DM Sans, sans-serif",
                transition: "background 0.14s, color 0.2s",
                textAlign:  "left",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = hover)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: copied ? "#22c55e" : (isDark ? "#222" : "#f0f0f0"),
                display: "flex", alignItems: "center", justifyContent: "center",
                color: copied ? "#fff" : muted,
                transition: "all 0.2s",
              }}>
                {copied ? <Check size={14} /> : <Link2 size={14} />}
              </span>
              {copied ? "Link copied!" : "Copy link"}
            </button>

            {/* URL preview */}
            <p style={{
              fontSize: 10, color: muted, padding: "6px 12px 2px",
              overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap", maxWidth: 190,
            }}>
              {resolvedUrl}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
