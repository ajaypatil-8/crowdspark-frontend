"use client";
import { motion } from "framer-motion";

interface Props { isDark: boolean; featured?: boolean; }

function Shimmer({ isDark, style }: { isDark: boolean; style?: React.CSSProperties }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.85, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      style={{
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        borderRadius: 6,
        ...style,
      }}
    />
  );
}

export default function SkeletonCard({ isDark, featured = false }: Props) {
  const card = isDark ? "rgba(14,14,14,0.9)" : "rgba(255,255,255,0.9)";
  const bdr  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div style={{
      borderRadius: featured ? 24 : 20,
      overflow: "hidden",
      background: card,
      border: `1px solid ${bdr}`,
      backdropFilter: "blur(12px)",
    }}>
      {/* Thumbnail */}
      <Shimmer isDark={isDark} style={{ height: featured ? 200 : 168, borderRadius: 0 }} />

      <div style={{ padding: featured ? "20px 20px 22px" : "16px 16px 18px" }}>
        <Shimmer isDark={isDark} style={{ height: 10, width: "40%", marginBottom: 8 }} />
        <Shimmer isDark={isDark} style={{ height: 15, width: "90%", marginBottom: 5 }} />
        <Shimmer isDark={isDark} style={{ height: 15, width: "70%", marginBottom: 12 }} />
        <Shimmer isDark={isDark} style={{ height: 10, width: "100%", marginBottom: 6 }} />
        <Shimmer isDark={isDark} style={{ height: 10, width: "100%", marginBottom: 12 }} />
        <Shimmer isDark={isDark} style={{ height: 5, width: "100%", borderRadius: 3, marginBottom: 10 }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Shimmer isDark={isDark} style={{ height: 12, width: "38%" }} />
          <Shimmer isDark={isDark} style={{ height: 12, width: "20%" }} />
        </div>
      </div>
    </div>
  );
}
