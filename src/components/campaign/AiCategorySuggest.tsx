// src/components/campaign/AiCategorySuggest.tsx
// Feature #47 — AI Auto-Tagging & Category Detection (UI)
//
// Small and inline on purpose — this sits directly above the category chip
// picker it feeds into, not a full panel like the other AI features. It
// only ever ADDS to the current selection (never replaces it), so it can't
// clobber a choice the creator already made manually.

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aiApi, type Category } from "@/lib/api";

interface Props {
  title: string;
  shortDescription: string;
  categories: Category[];
  onApply: (categoryIds: number[]) => void;
  isDark: boolean;
}

export default function AiCategorySuggest({ title, shortDescription, categories, onApply, isDark }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [note, setNote]       = useState("");

  const ready = title.trim().length >= 5 && shortDescription.trim().length >= 10 && categories.length > 0;
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";

  const suggest = async () => {
    if (!ready || loading) return;
    setLoading(true);
    setError("");
    setNote("");
    try {
      const res = await aiApi.suggestCategories({ title, shortDescription });
      const names = categories.filter(c => res.categoryIds.includes(c.id)).map(c => c.name);
      if (names.length === 0) {
        setError("Couldn't match a category confidently — pick manually below.");
      } else {
        onApply(res.categoryIds);
        setNote(`Added ${names.join(" & ")} — ${res.reasoning}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Couldn't suggest categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 10, display: "flex", flexDirection: "column", gap: 6 }}>
      <motion.button
        onClick={suggest}
        disabled={!ready || loading}
        whileHover={ready && !loading ? { scale: 1.02 } : {}}
        whileTap={ready && !loading ? { scale: 0.97 } : {}}
        style={{
          alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 13px", borderRadius: 999, border: "1px solid rgba(255,107,0,0.3)",
          background: "rgba(255,107,0,0.08)", color: "#ff8800",
          fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 12,
          cursor: ready && !loading ? "pointer" : "not-allowed", opacity: ready ? 1 : 0.5,
        }}
      >
        {loading ? (
          <>
            <span style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid rgba(255,136,0,0.35)", borderTopColor: "#ff8800", animation: "acsSpin .7s linear infinite", display: "block" }} />
            Suggesting…
          </>
        ) : (
          <>✨ Suggest categories with AI</>
        )}
      </motion.button>

      <AnimatePresence>
        {note && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ margin: 0, fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted }}>
            ✓ {note}
          </motion.p>
        )}
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ margin: 0, fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "#ef4444" }}>
            ✕ {error}
          </motion.p>
        )}
      </AnimatePresence>

      <style>{`@keyframes acsSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
