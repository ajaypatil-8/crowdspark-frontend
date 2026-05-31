"use client";
import { useState, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { categoryApi, type Category } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

interface BasicInfo {
  title: string;
  shortDescription: string;
  location: string;
  goalAmount: string;
  deadline: string;
  categoryIds: number[];
}

interface Props {
  data: BasicInfo;
  onChange: (d: BasicInfo) => void;
  isDark: boolean;
}

// ─── Shared field wrapper ─────────────────────────────────────────────────────
function Field({ label, required, hint, children, error, count, max }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
  error?: string; count?: number; max?: number;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
        <label style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.09em" }}>
          {label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
        </label>
        {max != null && count != null && (
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: count > max * 0.9 ? "#f59e0b" : "var(--text-muted)" }}>
            {count}/{max}
          </span>
        )}
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "#ef4444", margin: "5px 0 0" }}>
            ✕ {error}
          </motion.p>
        )}
        {hint && !error && (
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: "var(--text-muted)", margin: "5px 0 0" }}>{hint}</p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Styled input ─────────────────────────────────────────────────────────────
function FInput({ value, onChange, placeholder, type = "text", maxLength, min, error, disabled, rows }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; maxLength?: number; min?: string; error?: boolean; disabled?: boolean; rows?: number;
}) {
  const { isDark } = useTheme();
  const [focused, setFocused] = useState(false);
  const base: React.CSSProperties = {
    width: "100%", padding: rows ? "13px 14px" : "12px 14px", borderRadius: 12, boxSizing: "border-box" as const,
    fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", resize: "vertical" as const, lineHeight: 1.65,
    border: `1px solid ${error ? "rgba(239,68,68,0.55)" : focused ? "rgba(255,107,0,0.55)" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
    color: "var(--text)",
    boxShadow: focused ? (error ? "0 0 0 3px rgba(239,68,68,0.08)" : "0 0 0 3px rgba(255,107,0,0.08)") : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };
  return rows
    ? <textarea rows={rows} value={value} maxLength={maxLength} placeholder={placeholder} disabled={disabled} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={base} />
    : <input type={type} value={value} maxLength={maxLength} placeholder={placeholder} min={min} disabled={disabled} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={base} />;
}

const GOAL_PRESETS = [
  { label: "₹10K", value: "10000" },
  { label: "₹50K", value: "50000" },
  { label: "₹1L",  value: "100000" },
  { label: "₹5L",  value: "500000" },
  { label: "₹10L", value: "1000000" },
];

export default function Step1BasicInfo({ data, onChange }: Props) {
  const { isDark } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [catError, setCatError]     = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [touched, setTouched]       = useState<Record<string, boolean>>({});
  const [minDeadline] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 16));

  useEffect(() => {
    categoryApi.getAll()
      .then(cats => { setCategories(cats); setCatError(false); })
      .catch(() => setCatError(true))
      .finally(() => setCatLoading(false));
  }, []);

  const set = (k: keyof BasicInfo, v: unknown) => onChange({ ...data, [k]: v });
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  const toggleCat = (id: number) => {
    const next = data.categoryIds.includes(id)
      ? data.categoryIds.filter(x => x !== id)
      : [...data.categoryIds, id];
    set("categoryIds", next);
    touch("cats");
  };

  const goalNum = Number(data.goalAmount);
  const goalErr = touched.goalAmount && data.goalAmount && goalNum < 1000 ? "Minimum goal is ₹1,000" : undefined;
  const bdr   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const muted = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Title */}
      <Field label="Campaign Title" required count={data.title.length} max={120}>
        <FInput value={data.title} onChange={v => { set("title", v); touch("title"); }} placeholder="What's your big idea? (make it punchy!)" maxLength={120} />
      </Field>

      {/* Short description */}
      <Field label="Short Description" required hint="Shown in campaign cards — hook your audience in 2 sentences." count={data.shortDescription.length} max={300}>
        <FInput value={data.shortDescription} onChange={v => { set("shortDescription", v); touch("desc"); }} placeholder="One punchy paragraph that hooks backers instantly…" maxLength={300} rows={3} />
      </Field>

      {/* Goal amount */}
      <Field label="Funding Goal (₹)" required error={goalErr} hint={!goalErr ? "Minimum ₹1,000 · You keep funds even if goal isn't met (all-or-nothing optional)" : undefined}>
        <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
          <FInput value={data.goalAmount} onChange={v => { set("goalAmount", v.replace(/\D/g, "")); touch("goalAmount"); }} placeholder="e.g. 500000" type="number" min="1000" error={!!goalErr} />
          {/* Presets */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {GOAL_PRESETS.map(p => (
              <motion.button
                key={p.value}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => { set("goalAmount", p.value); touch("goalAmount"); }}
                style={{ padding: "5px 13px", borderRadius: 999, fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", background: data.goalAmount === p.value ? "rgba(255,107,0,0.1)" : "transparent", border: `1px solid ${data.goalAmount === p.value ? "rgba(255,107,0,0.4)" : bdr}`, color: data.goalAmount === p.value ? "#ff8800" : muted }}
              >
                {p.label}
              </motion.button>
            ))}
          </div>
          {/* Formatted preview */}
          {goalNum >= 1000 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: "9px 14px", borderRadius: 10, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#34d399" }}>
              Goal: ₹{goalNum.toLocaleString("en-IN")}
            </motion.div>
          )}
        </div>
      </Field>

      {/* Deadline + Location */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="s10grid2">
        <Field label="Campaign Deadline" required hint="Min. 1 day from today">
          <FInput value={data.deadline} onChange={v => { set("deadline", v); touch("deadline"); }} type="datetime-local" min={minDeadline} />
        </Field>
        <Field label="Location" required hint="City, State">
          <FInput value={data.location} onChange={v => { set("location", v); touch("location"); }} placeholder="e.g. Mumbai, Maharashtra" />
        </Field>
      </div>

      {/* Categories */}
      <Field label="Categories" required hint="Select at least one">
        {catLoading && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ height: 34, width: 90, borderRadius: 999, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", animation: "s1pulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        )}
        {catError && !catLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}>⚠ Failed to load categories</span>
            <button onClick={() => { setCatLoading(true); setCatError(false); categoryApi.getAll().then(setCategories).catch(() => setCatError(true)).finally(() => setCatLoading(false)); }}
              style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.4)", background: "transparent", color: "#ef4444", cursor: "pointer" }}>
              Retry
            </button>
          </div>
        )}
        {!catLoading && !catError && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
            {categories.map(c => {
              const active = data.categoryIds.includes(c.id);
              return (
                <motion.button
                  key={c.id}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => toggleCat(c.id)}
                  style={{ padding: "8px 16px", borderRadius: 999, fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: active ? 700 : 400, cursor: "pointer", transition: "all 0.15s", background: active ? "rgba(255,107,0,0.1)" : "transparent", border: `1px solid ${active ? "rgba(255,107,0,0.45)" : bdr}`, color: active ? "#ff8800" : muted, boxShadow: active ? "0 0 12px rgba(255,107,0,0.2)" : "none", display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  {active && <span style={{ fontSize: 9 }}>✓</span>}
                  {c.name}
                </motion.button>
              );
            })}
            {categories.length === 0 && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted }}>No categories found — add via admin panel.</p>}
          </div>
        )}
        {data.categoryIds.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#ff8800", margin: "8px 0 0", fontWeight: 600 }}>
            {data.categoryIds.length} {data.categoryIds.length === 1 ? "category" : "categories"} selected
          </motion.p>
        )}
      </Field>

      <style>{`
        @keyframes s1pulse { 0%,100%{opacity:.3} 50%{opacity:.8} }
        @media(max-width:520px){ .s10grid2{ grid-template-columns:1fr!important; } }
      `}</style>
    </div>
  );
}

export type { BasicInfo };
