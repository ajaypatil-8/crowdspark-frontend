"use client";

/**
 * src/components/ui/Skeletons.tsx
 * Comprehensive skeleton screen library for CrowdSpark-X.
 *
 * Exports:
 *   <SkeletonPulse />             — single shimmer block
 *   <CampaignCardSkeleton />      — explore page card
 *   <CampaignCardSkeletonGrid />  — 6/9/12 card grid
 *   <ProjectDetailSkeleton />     — project detail page
 *   <DashboardStatsSkeleton />    — 4-stat dashboard row
 *   <DashboardTableSkeleton />    — table with rows
 *   <ProfileSkeleton />           — user profile header
 *   <ActivityFeedSkeleton />      — activity list items
 *   <NotificationSkeleton />      — notification dropdown items
 *   <StepFormSkeleton />          — create campaign form
 *   <AdminTableSkeleton />        — admin data table
 *   <NavSkeleton />               — navbar loading state
 */

import { motion } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

// ─── Base shimmer ─────────────────────────────────────────────────────────────

interface PulseProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
  className?: string;
}

export function SkeletonPulse({
  width = "100%",
  height = 14,
  radius = 6,
  style,
}: PulseProps) {
  return (
    <div
      className="sk-pulse"
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
    />
  );
}

// ─── Avatar skeleton ──────────────────────────────────────────────────────────

function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <SkeletonPulse width={size} height={size} radius="50%" />;
}

// ─── Campaign card skeleton ───────────────────────────────────────────────────

export function CampaignCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className="sk-card"
      style={{
        borderRadius: featured ? 24 : 20,
        overflow: "hidden",
      }}
    >
      {/* Thumbnail */}
      <SkeletonPulse height={featured ? 200 : 168} radius={0} />

      <div style={{ padding: featured ? "20px 20px 22px" : "16px 16px 18px" }}>
        {/* Category */}
        <SkeletonPulse width="35%" height={10} radius={20} style={{ marginBottom: 10 }} />

        {/* Title */}
        <SkeletonPulse width="92%" height={15} style={{ marginBottom: 5 }} />
        <SkeletonPulse width="68%" height={15} style={{ marginBottom: 14 }} />

        {/* Description */}
        <SkeletonPulse height={10} style={{ marginBottom: 5 }} />
        <SkeletonPulse width="80%" height={10} style={{ marginBottom: 14 }} />

        {/* Progress bar */}
        <SkeletonPulse height={5} radius={99} style={{ marginBottom: 8 }} />

        {/* Meta row */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <SkeletonPulse width="38%" height={11} />
          <SkeletonPulse width="22%" height={11} />
        </div>
      </div>
    </div>
  );
}

export function CampaignCardSkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 24,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Project detail page skeleton ────────────────────────────────────────────

export function ProjectDetailSkeleton() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px 80px" }}>
      {/* Hero banner */}
      <SkeletonPulse height={480} radius={24} style={{ marginBottom: 40 }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48 }}>
        {/* Left content */}
        <div>
          {/* Category + title */}
          <SkeletonPulse width="20%" height={10} radius={20} style={{ marginBottom: 12 }} />
          <SkeletonPulse width="85%" height={32} radius={8} style={{ marginBottom: 8 }} />
          <SkeletonPulse width="60%" height={32} radius={8} style={{ marginBottom: 24 }} />

          {/* Creator row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <SkeletonAvatar size={44} />
            <div style={{ flex: 1 }}>
              <SkeletonPulse width="40%" height={13} style={{ marginBottom: 6 }} />
              <SkeletonPulse width="25%" height={10} />
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
            {[80, 60, 70, 55].map((w, i) => (
              <SkeletonPulse key={i} width={w} height={34} radius={20} />
            ))}
          </div>

          {/* Body text */}
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonPulse
              key={i}
              width={i === 4 ? "60%" : "100%"}
              height={13}
              style={{ marginBottom: 8 }}
            />
          ))}
        </div>

        {/* Right sidebar */}
        <div>
          <div className="sk-card" style={{ borderRadius: 24, padding: 28 }}>
            {/* Funding amount */}
            <SkeletonPulse width="60%" height={40} radius={8} style={{ marginBottom: 8 }} />
            <SkeletonPulse width="45%" height={11} radius={20} style={{ marginBottom: 16 }} />

            {/* Progress */}
            <SkeletonPulse height={8} radius={99} style={{ marginBottom: 12 }} />

            {/* Stats row */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <SkeletonPulse width={60} height={20} style={{ marginBottom: 5 }} />
                  <SkeletonPulse width={50} height={10} />
                </div>
              ))}
            </div>

            {/* CTA */}
            <SkeletonPulse height={52} radius={14} style={{ marginBottom: 12 }} />
            <SkeletonPulse height={42} radius={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard stats row ──────────────────────────────────────────────────────

export function DashboardStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gap: 20,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="sk-card" style={{ borderRadius: 18, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <SkeletonPulse width="55%" height={11} />
            <SkeletonPulse width={36} height={36} radius={10} />
          </div>
          <SkeletonPulse width="65%" height={28} radius={8} style={{ marginBottom: 8 }} />
          <SkeletonPulse width="45%" height={10} />
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard table ──────────────────────────────────────────────────────────

export function DashboardTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="sk-card" style={{ borderRadius: 18, padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-2)",
        }}
      >
        {[30, 20, 15, 12, 10].map((w, i) => (
          <SkeletonPulse key={i} width={`${w}%`} height={10} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-2)",
            opacity: 1 - i * 0.06,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 30%" }}>
            <SkeletonAvatar size={32} />
            <SkeletonPulse width="60%" height={12} />
          </div>
          {[20, 15, 12, 10].map((w, j) => (
            <SkeletonPulse key={j} width={`${w}%`} height={12} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Profile header skeleton ──────────────────────────────────────────────────

export function ProfileSkeleton() {
  return (
    <div style={{ padding: "100px 0 40px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 32 }}>
          {/* Avatar */}
          <SkeletonPulse width={96} height={96} radius="50%" />

          <div style={{ flex: 1 }}>
            <SkeletonPulse width="40%" height={28} radius={8} style={{ marginBottom: 8 }} />
            <SkeletonPulse width="25%" height={13} radius={6} style={{ marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 8 }}>
              {[60, 80, 70].map((w, i) => (
                <SkeletonPulse key={i} width={w} height={30} radius={20} />
              ))}
            </div>
          </div>

          <SkeletonPulse width={120} height={40} radius={12} />
        </div>

        {/* Bio */}
        <SkeletonPulse height={13} style={{ marginBottom: 6 }} />
        <SkeletonPulse width="75%" height={13} style={{ marginBottom: 24 }} />

        {/* Stats row */}
        <div style={{ display: "flex", gap: 32 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <SkeletonPulse width={50} height={22} radius={6} style={{ marginBottom: 4 }} />
              <SkeletonPulse width={70} height={10} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Activity feed skeleton ───────────────────────────────────────────────────

export function ActivityFeedSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 14,
            padding: "14px 0",
            borderBottom: "1px solid var(--border-2)",
            opacity: 1 - i * 0.12,
          }}
        >
          {/* Icon box */}
          <SkeletonPulse width={38} height={38} radius={10} style={{ flexShrink: 0 }} />

          <div style={{ flex: 1 }}>
            <SkeletonPulse width="80%" height={12} style={{ marginBottom: 6 }} />
            <SkeletonPulse width="40%" height={10} />
          </div>

          <SkeletonPulse width={50} height={10} style={{ flexShrink: 0, marginTop: 4 }} />
        </div>
      ))}
    </div>
  );
}

// ─── Notification dropdown skeleton ───────────────────────────────────────────

export function NotificationSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 12,
            padding: "12px 16px",
            borderRadius: 12,
            opacity: 1 - i * 0.15,
          }}
        >
          <SkeletonAvatar size={36} />
          <div style={{ flex: 1 }}>
            <SkeletonPulse width="85%" height={11} style={{ marginBottom: 5 }} />
            <SkeletonPulse width="50%" height={9} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Create campaign form skeleton ───────────────────────────────────────────

export function StepFormSkeleton() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "100px 24px" }}>
      {/* Step indicator */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 48 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonPulse key={i} width={i === 2 ? 40 : 28} height={28} radius={99} />
        ))}
      </div>

      {/* Form card */}
      <div className="sk-card" style={{ borderRadius: 24, padding: 36 }}>
        <SkeletonPulse width="45%" height={28} radius={8} style={{ marginBottom: 8 }} />
        <SkeletonPulse width="70%" height={13} style={{ marginBottom: 36 }} />

        {/* Fields */}
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <SkeletonPulse width="25%" height={11} style={{ marginBottom: 8 }} />
            <SkeletonPulse height={48} radius={12} />
          </div>
        ))}

        {/* Textarea */}
        <SkeletonPulse width="20%" height={11} style={{ marginBottom: 8 }} />
        <SkeletonPulse height={120} radius={12} style={{ marginBottom: 36 }} />

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <SkeletonPulse width={100} height={44} radius={12} />
          <SkeletonPulse width={130} height={44} radius={12} />
        </div>
      </div>
    </div>
  );
}

// ─── Admin table skeleton ─────────────────────────────────────────────────────

export function AdminTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div>
      {/* Search/filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <SkeletonPulse height={40} radius={12} style={{ flex: 1 }} />
        <SkeletonPulse width={120} height={40} radius={12} />
        <SkeletonPulse width={100} height={40} radius={12} />
      </div>

      <DashboardTableSkeleton rows={rows} />

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonPulse key={i} width={36} height={36} radius={10} />
        ))}
      </div>
    </div>
  );
}

// ─── Nav skeleton ─────────────────────────────────────────────────────────────

export function NavSkeleton() {
  return (
    <div
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
      }}
    >
      <SkeletonPulse width={120} height={28} radius={8} />
      <div style={{ display: "flex", gap: 24 }}>
        {[80, 70, 65, 75].map((w, i) => (
          <SkeletonPulse key={i} width={w} height={13} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <SkeletonPulse width={80} height={36} radius={12} />
        <SkeletonPulse width={100} height={36} radius={12} />
      </div>
    </div>
  );
}

// ─── Generic list skeleton ────────────────────────────────────────────────────

export function ListSkeleton({ items = 5, avatarSize = 40 }: { items?: number; avatarSize?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: 1 - i * 0.1,
          }}
        >
          <SkeletonAvatar size={avatarSize} />
          <div style={{ flex: 1 }}>
            <SkeletonPulse width="65%" height={13} style={{ marginBottom: 6 }} />
            <SkeletonPulse width="40%" height={10} />
          </div>
          <SkeletonPulse width={70} height={28} radius={20} />
        </div>
      ))}
    </div>
  );
}

// ─── Reward tier skeleton ─────────────────────────────────────────────────────

export function RewardTierSkeleton({ tiers = 3 }: { tiers?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Array.from({ length: tiers }).map((_, i) => (
        <div key={i} className="sk-card" style={{ borderRadius: 18, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <SkeletonPulse width="40%" height={18} radius={6} />
            <SkeletonPulse width={70} height={18} radius={6} />
          </div>
          <SkeletonPulse height={11} style={{ marginBottom: 5 }} />
          <SkeletonPulse width="80%" height={11} style={{ marginBottom: 14 }} />
          <SkeletonPulse width={110} height={36} radius={12} />
        </div>
      ))}
    </div>
  );
}
