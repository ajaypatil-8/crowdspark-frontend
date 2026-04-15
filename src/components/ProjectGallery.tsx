"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  images: string[];
  videos: string[];
  thumbnail: string | null;
  isDark: boolean;
}

export default function ProjectGallery({ images, videos, thumbnail, isDark }: Props) {
  const all: { type: "image" | "video"; url: string }[] = [
    ...(thumbnail ? [{ type: "image" as const, url: thumbnail }] : []),
    ...images.filter((u) => u !== thumbnail).map((u) => ({ type: "image" as const, url: u })),
    ...videos.map((u) => ({ type: "video" as const, url: u })),
  ];

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (all.length === 0) return null;

  const current = all[active];
  const bdr = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div>
      {/* Main viewer */}
      <div
        onClick={() => current.type === "image" && setLightbox(true)}
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%", // 16:9
          borderRadius: 16,
          overflow: "hidden",
          background: isDark ? "#111" : "#f0f0f0",
          border: `1px solid ${bdr}`,
          cursor: current.type === "image" ? "zoom-in" : "default",
          marginBottom: 12,
        }}
      >
        {current.type === "image" ? (
          <img
            src={current.url}
            alt="Project media"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <video
            src={current.url}
            controls
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        {/* zoom hint */}
        {current.type === "image" && (
          <div style={{
            position: "absolute", bottom: 10, right: 10,
            padding: "4px 8px", borderRadius: 6,
            background: "rgba(0,0,0,0.5)", color: "#fff",
            fontFamily: "DM Sans, sans-serif", fontSize: 11,
          }}>
            🔍 Click to enlarge
          </div>
        )}
      </div>

      {/* Thumbnails strip */}
      {all.length > 1 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {all.map((item, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                flexShrink: 0,
                width: 72,
                height: 52,
                borderRadius: 8,
                overflow: "hidden",
                border: `2px solid ${i === active ? "#ff6b00" : bdr}`,
                padding: 0,
                cursor: "pointer",
                background: isDark ? "#111" : "#eee",
                position: "relative",
              }}
            >
              {item.type === "image" ? (
                <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  ▶
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && current.type === "image" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "rgba(0,0,0,0.92)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24, cursor: "zoom-out",
            }}
          >
            <motion.img
              initial={{ scale: 0.88 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.88 }}
              src={current.url}
              alt="Full view"
              style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12, objectFit: "contain" }}
            />
            <button
              onClick={() => setLightbox(false)}
              style={{
                position: "absolute", top: 20, right: 20,
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)", border: "none",
                color: "#fff", fontSize: 18, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
