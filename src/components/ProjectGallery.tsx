"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, ChevronLeft, ChevronRight, Play, Image as ImageIcon } from "lucide-react";

interface Props {
  images: string[];
  videos: string[];
  thumbnail: string | null;
  isDark: boolean;
}

export default function ProjectGallery({ images, videos, thumbnail, isDark }: Props) {
  const all: { type: "image" | "video"; url: string }[] = [
    ...(thumbnail ? [{ type: "image" as const, url: thumbnail }] : []),
    ...images.filter(u => u !== thumbnail).map(u => ({ type: "image" as const, url: u })),
    ...videos.map(u => ({ type: "video" as const, url: u })),
  ];

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const bdr   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card  = isDark ? "#0e0e0e" : "#fff";
  const muted = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";

  const prev = useCallback(() => setActive(a => (a - 1 + all.length) % all.length), [all.length]);
  const next = useCallback(() => setActive(a => (a + 1) % all.length), [all.length]);

  if (all.length === 0) {
    return (
      <div style={{
        width: "100%", paddingTop: "56.25%", position: "relative",
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
        borderRadius: 20, border: `1px solid ${bdr}`,
      }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <ImageIcon size={36} color={muted} />
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, margin: 0 }}>No media available</p>
        </div>
      </div>
    );
  }

  const current = all[active];

  return (
    <div>
      {/* Main viewer */}
      <motion.div
        key={active}
        initial={{ opacity: 0.6, scale: 0.995 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          position: "relative", width: "100%", paddingTop: "56.25%",
          borderRadius: 20, overflow: "hidden",
          background: isDark ? "#0a0a0a" : "#f0f0ee",
          border: `1px solid ${bdr}`,
          cursor: current.type === "image" ? "zoom-in" : "default",
          marginBottom: 10,
        }}
        onClick={() => current.type === "image" && setLightbox(true)}
      >
        {current.type === "image" ? (
          <img
            src={current.url} alt="Project media"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <video
            src={current.url} controls
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.3) 0%,transparent 45%)", pointerEvents: "none" }} />

        {/* Zoom hint */}
        {current.type === "image" && (
          <div style={{
            position: "absolute", bottom: 12, right: 12,
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 10px", borderRadius: 8,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
            color: "rgba(255,255,255,0.8)", fontFamily: "DM Sans, sans-serif", fontSize: 11,
          }}>
            <ZoomIn size={12} /> Enlarge
          </div>
        )}

        {/* Nav arrows */}
        {all.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              style={{
                position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Counter */}
        {all.length > 1 && (
          <div style={{
            position: "absolute", bottom: 12, left: 12,
            padding: "4px 10px", borderRadius: 8,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
            color: "rgba(255,255,255,0.8)", fontFamily: "DM Sans, sans-serif", fontSize: 11,
          }}>
            {active + 1} / {all.length}
          </div>
        )}
      </motion.div>

      {/* Thumbnails strip */}
      {all.length > 1 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {all.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActive(i)}
              style={{
                flexShrink: 0, width: 76, height: 54,
                borderRadius: 10, overflow: "hidden",
                border: `2px solid ${i === active ? "#ff6b00" : bdr}`,
                padding: 0, cursor: "pointer",
                background: isDark ? "#111" : "#eee",
                boxShadow: i === active ? "0 0 0 2px rgba(255,107,0,0.25)" : "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            >
              {item.type === "image" ? (
                <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: isDark ? "#1a1a1a" : "#ddd" }}>
                  <Play size={18} color={i === active ? "#ff6b00" : muted} fill={i === active ? "#ff6b00" : "none"} />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && current.type === "image" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "rgba(0,0,0,0.94)", backdropFilter: "blur(12px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24, cursor: "zoom-out",
            }}
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              src={current.url} alt="Full view"
              style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 16, objectFit: "contain", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}
            />
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => setLightbox(false)}
              style={{
                position: "absolute", top: 20, right: 20,
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={20} />
            </motion.button>
            {all.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); prev(); }} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronLeft size={22} />
                </button>
                <button onClick={e => { e.stopPropagation(); next(); }} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
