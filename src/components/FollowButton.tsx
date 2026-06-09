"use client";
// src/components/FollowButton.tsx
// Drop-in follow/unfollow button. Use on the project detail page
// beside the creator info, and on any public creator profile.
//
// Usage:
//   <FollowButton targetUserId={project.creator.id} isDark={isDark} />

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { followApi } from "@/lib/api";

interface Props {
  targetUserId: number;
  isDark:       boolean;
  initialFollowing?: boolean;
  onToggle?:   (following: boolean, followerCount: number) => void;
  size?:       "sm" | "md";
  isLoggedIn?: boolean;
}

export default function FollowButton({
  targetUserId, isDark, initialFollowing = false,
  onToggle, size = "md", isLoggedIn = true,
}: Props) {
  const [following,     setFollowing]     = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [checked,       setChecked]       = useState(false);

  const accent = "#ff5c00";
  const pad    = size === "sm" ? "6px 14px" : "9px 20px";
  const fSize  = size === "sm" ? 12.5 : 14;

  // Fetch current follow state on mount
  useEffect(() => {
    if (!isLoggedIn) { setChecked(true); return; }
    followApi.checkStatus(targetUserId)
      .then(s => {
        setFollowing(s.following);
        setFollowerCount(s.followerCount);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [targetUserId, isLoggedIn]);

  async function handleClick() {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    try {
      const result = await followApi.toggle(targetUserId);
      setFollowing(result.following);
      setFollowerCount(result.followerCount);
      onToggle?.(result.following, result.followerCount);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  if (!checked) return (
    <div style={{ width: size === "sm" ? 80 : 110, height: size === "sm" ? 28 : 36,
      borderRadius: 10, background: isDark ? "rgba(255,255,255,0.06)" : "#f0f0f0",
      animation: "pulse 1.5s ease-in-out infinite" }} />
  );

  return (
    <motion.button
      whileHover={{ scale: loading ? 1 : 1.04 }}
      whileTap={{ scale: loading ? 1 : 0.96 }}
      onClick={handleClick}
      disabled={loading}
      style={{
        padding: pad,
        borderRadius: 10,
        border: following
          ? `1.5px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`
          : `1.5px solid ${accent}`,
        background: following
          ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)")
          : `${accent}18`,
        color: following
          ? (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)")
          : accent,
        fontFamily: "Syne, sans-serif",
        fontWeight: 700,
        fontSize: fSize,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.18s",
        display: "flex", alignItems: "center", gap: 6,
        whiteSpace: "nowrap",
      }}
    >
      {loading ? (
        <span style={{ width: 12, height: 12, borderRadius: "50%",
          border: "2px solid rgba(255,92,0,0.3)",
          borderTopColor: accent,
          animation: "bspin 0.7s linear infinite",
          display: "inline-block" }} />
      ) : following ? "✓ Following" : "+ Follow"}
      {followerCount > 0 && (
        <span style={{ fontSize: fSize - 2,
          opacity: 0.65, fontFamily: "DM Mono, monospace" }}>
          {followerCount.toLocaleString("en-IN")}
        </span>
      )}
      <style>{`@keyframes bspin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </motion.button>
  );
}
