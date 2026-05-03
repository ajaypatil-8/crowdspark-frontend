"use client";
/**
 * src/components/ui/EmptyState.tsx
 *
 * Reusable empty-state component used across all pages.
 *
 * Usage:
 *   <EmptyState variant="no-campaigns" />
 *   <EmptyState variant="no-results" onAction={() => clearFilters()} />
 *   <EmptyState
 *     icon={<Rocket size={36}/>}
 *     title="Nothing here yet"
 *     description="Create your first campaign to get started."
 *     actionLabel="Create Campaign"
 *     onAction={() => router.push('/dashboard/create-campaign')}
 *   />
 */

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Rocket, Search, Heart, Bookmark, LayoutDashboard,
  Inbox, FileQuestion, ShieldAlert, Wifi, RefreshCw,
  Megaphone, Trophy, Sparkles,
} from "lucide-react";
import { ReactNode } from "react";

// ─── Preset variants ─────────────────────────────────────────────────────────

type Variant =
  | "no-campaigns"
  | "no-backed"
  | "no-saved"
  | "no-results"
  | "no-notifications"
  | "no-activity"
  | "no-rewards"
  | "no-updates"
  | "no-admin-users"
  | "no-admin-kyc"
  | "no-admin-projects"
  | "offline"
  | "custom";

interface PresetConfig {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  accentColor: string;
  accentDim: string;
}

const PRESETS: Record<Exclude<Variant, "custom">, PresetConfig> = {
  "no-campaigns": {
    icon: <Rocket size={36} />,
    title: "No campaigns yet",
    description: "Launch your first campaign and start raising funds from a passionate community.",
    actionLabel: "Create Campaign",
    actionHref: "/dashboard/create-campaign",
    accentColor: "#ff6b00",
    accentDim: "rgba(255,107,0,0.12)",
  },
  "no-backed": {
    icon: <Heart size={36} />,
    title: "You haven't backed anything yet",
    description: "Discover inspiring campaigns and support the ideas you believe in.",
    actionLabel: "Explore Campaigns",
    actionHref: "/explore",
    accentColor: "#ef4444",
    accentDim: "rgba(239,68,68,0.12)",
  },
  "no-saved": {
    icon: <Bookmark size={36} />,
    title: "No saved campaigns",
    description: "Bookmark campaigns you love to keep track of them here.",
    actionLabel: "Browse Campaigns",
    actionHref: "/explore",
    accentColor: "#00d4b8",
    accentDim: "rgba(0,212,184,0.12)",
  },
  "no-results": {
    icon: <Search size={36} />,
    title: "No results found",
    description: "Try adjusting your search terms or browse all categories.",
    actionLabel: "Clear filters",
    accentColor: "#818cf8",
    accentDim: "rgba(129,140,248,0.12)",
  },
  "no-notifications": {
    icon: <Inbox size={36} />,
    title: "All caught up!",
    description: "You have no new notifications right now. Check back later.",
    accentColor: "#00d4b8",
    accentDim: "rgba(0,212,184,0.12)",
  },
  "no-activity": {
    icon: <LayoutDashboard size={36} />,
    title: "No recent activity",
    description: "Your activity timeline will appear here once you start backing or creating campaigns.",
    accentColor: "#a78bfa",
    accentDim: "rgba(167,139,250,0.12)",
  },
  "no-rewards": {
    icon: <Trophy size={36} />,
    title: "No reward tiers",
    description: "This campaign hasn't set up reward tiers yet. You can still back it with any amount.",
    accentColor: "#ffb300",
    accentDim: "rgba(255,179,0,0.12)",
  },
  "no-updates": {
    icon: <Megaphone size={36} />,
    title: "No updates yet",
    description: "The creator hasn't posted any campaign updates yet. Check back soon.",
    accentColor: "#818cf8",
    accentDim: "rgba(129,140,248,0.12)",
  },
  "no-admin-users": {
    icon: <FileQuestion size={36} />,
    title: "No users found",
    description: "No users match your current filters. Try a different search.",
    accentColor: "#818cf8",
    accentDim: "rgba(129,140,248,0.12)",
  },
  "no-admin-kyc": {
    icon: <ShieldAlert size={36} />,
    title: "No KYC requests",
    description: "There are no pending KYC verification requests at the moment.",
    accentColor: "#10b981",
    accentDim: "rgba(16,185,129,0.12)",
  },
  "no-admin-projects": {
    icon: <Sparkles size={36} />,
    title: "No projects found",
    description: "No campaigns match the current filter. Try clearing or changing it.",
    accentColor: "#ff6b00",
    accentDim: "rgba(255,107,0,0.12)",
  },
  offline: {
    icon: <Wifi size={36} />,
    title: "You appear to be offline",
    description: "Please check your internet connection and try again.",
    actionLabel: "Retry",
    accentColor: "#f59e0b",
    accentDim: "rgba(245,158,11,0.12)",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  variant?: Variant;
  // Custom overrides (work with variant="custom" or to override preset)
  icon?: ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  accentColor?: string;
  accentDim?: string;
  // Size
  size?: "sm" | "md" | "lg";
  // Whether to render inside a card wrapper
  card?: boolean;
  isDark?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmptyState({
  variant = "custom",
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  accentColor,
  accentDim,
  size = "md",
  card = false,
  isDark = true,
  className,
}: EmptyStateProps) {
  const preset = variant !== "custom" ? PRESETS[variant] : null;

  const resolvedIcon        = icon        ?? preset?.icon;
  const resolvedTitle       = title       ?? preset?.title       ?? "Nothing here";
  const resolvedDesc        = description ?? preset?.description ?? "";
  const resolvedActionLabel = actionLabel ?? preset?.actionLabel;
  const resolvedActionHref  = actionHref  ?? preset?.actionHref;
  const resolvedAccent      = accentColor ?? preset?.accentColor ?? "#ff6b00";
  const resolvedAccentDim   = accentDim   ?? preset?.accentDim   ?? "rgba(255,107,0,0.12)";

  const padding  = size === "sm" ? "32px 24px" : size === "lg" ? "80px 40px" : "56px 32px";
  const iconSize = size === "sm" ? 48 : size === "lg" ? 80 : 64;
  const iconR    = size === "sm" ? 14 : size === "lg" ? 24 : 20;
  const titleFs  = size === "sm" ? 16 : size === "lg" ? 24 : 19;
  const descFs   = size === "sm" ? 13 : size === "lg" ? 15.5 : 14;

  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const txt  = isDark ? "#eeeef5" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", padding,
        ...(card ? {} : {}),
      }}
    >
      {/* Icon bubble */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 16, stiffness: 260, delay: 0.08 }}
        style={{
          width: iconSize, height: iconSize, borderRadius: iconR,
          background: resolvedAccentDim,
          border: `1px solid ${resolvedAccent}28`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: resolvedAccent, marginBottom: 20,
          boxShadow: `0 0 0 6px ${resolvedAccent}08`,
        }}
      >
        {resolvedIcon}
      </motion.div>

      {/* Text */}
      <motion.p
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.4 }}
        style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: titleFs, color: txt, margin: "0 0 8px", lineHeight: 1.25 }}
      >
        {resolvedTitle}
      </motion.p>

      {resolvedDesc && (
        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ fontFamily: "DM Sans, sans-serif", fontSize: descFs, color: muted, lineHeight: 1.72, margin: "0 0 28px", maxWidth: 340 }}
        >
          {resolvedDesc}
        </motion.p>
      )}

      {/* Action */}
      {resolvedActionLabel && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
        >
          {resolvedActionHref && !onAction ? (
            <Link
              href={resolvedActionHref}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: size === "sm" ? "9px 18px" : "12px 24px",
                borderRadius: 12,
                background: `linear-gradient(135deg,${resolvedAccent},${resolvedAccent}bb)`,
                color: "#fff", textDecoration: "none",
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: size === "sm" ? 12.5 : 14,
                boxShadow: `0 4px 18px ${resolvedAccent}40`,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px ${resolvedAccent}55`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 18px ${resolvedAccent}40`;
              }}
            >
              {resolvedActionLabel}
            </Link>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: `0 8px 28px ${resolvedAccent}55` }}
              whileTap={{ scale: 0.97 }}
              onClick={onAction}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: size === "sm" ? "9px 18px" : "12px 24px",
                borderRadius: 12,
                background: onAction
                  ? `linear-gradient(135deg,${resolvedAccent},${resolvedAccent}bb)`
                  : "transparent",
                border: onAction ? "none" : `1px solid ${bdr}`,
                color: onAction ? "#fff" : muted,
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: size === "sm" ? 12.5 : 14,
                cursor: "pointer",
                boxShadow: onAction ? `0 4px 18px ${resolvedAccent}40` : "none",
              }}
            >
              {variant === "offline" && <RefreshCw size={14} />}
              {resolvedActionLabel}
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  );

  if (!card) return <div className={className}>{inner}</div>;

  return (
    <div
      className={className}
      style={{
        background: isDark ? "#0e0e0e" : "#ffffff",
        border: `1px solid ${bdr}`,
        borderRadius: 22,
        overflow: "hidden",
      }}
    >
      {inner}
    </div>
  );
}
