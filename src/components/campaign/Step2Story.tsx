"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface StoryData { fullDescription: string; }
interface Props { data: StoryData; onChange: (d: StoryData) => void; isDark: boolean; }

const TIPS = [
  { icon: "❓", text: "Why does this project exist? What problem does it solve?" },
  { icon: "🙋", text: "Who are you and why are YOU the right person to do this?" },
  { icon: "💰", text: "What will the funds be used for — be specific with amounts." },
  { icon: "📈", text: "What happens if the goal is exceeded? Stretch goals?" },
  { icon: "📅", text: "Share your timeline: when will backers see results?" },
];

const TEMPLATES = [
  {
    label: "Full Template",
    icon: "📝",
    text: `## Why this project?\n\n[Describe the problem you're solving and why it matters now]\n\n## Our solution\n\n[Explain your idea clearly — what makes it unique?]\n\n## How funds will be used\n\n- **₹X for Y** — [brief explanation]\n- **₹X for Z** — [brief explanation]\n\n## About me / our team\n\n[Who you are, your background, why you can pull this off]\n\n## Timeline\n\n- **Month 1:** [milestone]\n- **Month 2:** [milestone]\n- **Month 3:** [launch / delivery]\n\n## Stretch goals\n\nIf we exceed our goal: [what happens next]`,
  },
  {
    label: "Short & Punchy",
    icon: "⚡",
    text: `## The problem\n\n[1-2 sentences]\n\n## Our fix\n\n[1-2 sentences on your solution]\n\n## Why back us?\n\n[Your strongest 3 reasons]\n\n## The ask\n\n₹X to make this happen by [date].`,
  },
];

function wordCount(s: string) { return s.trim() ? s.trim().split(/\s+/).length : 0; }
function charCount(s: string) { return s.length; }

function QualityBar({ pct, label, color }: { pct: number; label: string; color: string }) {
  const { isDark } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <motion.div
          animate={{ width: `${Math.min(100, pct)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 2, background: color }}
        />
      </div>
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color, fontWeight: 600, minWidth: 70, textAlign: "right" }}>{label}</span>
    </div>
  );
}

export default function Step2Story({ data, onChange }: Props) {
  const { isDark } = useTheme();
  const [showTips, setShowTips] = useState(true);
  const [focused, setFocused]   = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const txt  = data.fullDescription;
  const wc   = wordCount(txt);
  const cc   = charCount(txt);

  const insertTemplate = useCallback((t: string) => {
    if (txt.trim().length > 0 && !window.confirm("Replace current story with template?")) return;
    onChange({ fullDescription: t });
    textRef.current?.focus();
  }, [txt, onChange]);

  const quality = Math.min(100, Math.round((wc / 200) * 100));
  const qualityLabel = quality === 0 ? "Empty" : quality < 25 ? "Too short" : quality < 50 ? "Getting there" : quality < 75 ? "Good" : quality < 90 ? "Great" : "Excellent";
  const qualityColor = quality < 25 ? "#ef4444" : quality < 50 ? "#f59e0b" : quality < 75 ? "#60a5fa" : "#34d399";

  const bdr   = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const muted = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Tips accordion */}
      <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid rgba(255,107,0,0.18)`, background: isDark ? "rgba(255,107,0,0.04)" : "rgba(255,107,0,0.03)" }}>
        <button
          onClick={() => setShowTips(s => !s)}
          style={{ width: "100%", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}
        >
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "#ff8800" }}>
            💡 Story writing tips
          </span>
          <motion.span animate={{ rotate: showTips ? 180 : 0 }} style={{ color: "#ff8800", fontSize: 12 }}>▼</motion.span>
        </button>
        <AnimatePresence>
          {showTips && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
              <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
                {TIPS.map(t => (
                  <div key={t.text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{t.icon}</span>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, lineHeight: 1.6 }}>{t.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Templates */}
      <div>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, fontWeight: 700, color: muted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.09em" }}>Quick-start templates</p>
        <div style={{ display: "flex", gap: 8 }}>
          {TEMPLATES.map(t => (
            <motion.button
              key={t.label}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => insertTemplate(t.text)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, border: `1px solid ${bdr}`, background: "transparent", color: muted, fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,107,0,0.4)"; e.currentTarget.style.color = "#ff8800"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = bdr; e.currentTarget.style.color = muted; }}
            >
              <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <label style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.09em" }}>
            Full Campaign Story <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted }}>
            {wc} words · {cc} chars
          </span>
        </div>
        <textarea
          ref={textRef}
          value={txt}
          onChange={e => onChange({ fullDescription: e.target.value })}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={`Tell your complete story here...\n\n## Why this project?\n\n## How will the funds be used?\n\n## About me / our team\n\n## Timeline`}
          style={{
            width: "100%", minHeight: 360, padding: "16px", borderRadius: 14,
            border: `1px solid ${focused ? "rgba(255,107,0,0.5)" : bdr}`,
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
            color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 14,
            lineHeight: 1.75, outline: "none", resize: "vertical", boxSizing: "border-box",
            boxShadow: focused ? "0 0 0 3px rgba(255,107,0,0.08)" : "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        />
      </div>

      {/* Quality indicators */}
      <div style={{ padding: "14px 16px", borderRadius: 14, background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)", border: `1px solid ${bdr}`, display: "flex", flexDirection: "column", gap: 10 }}>
        <QualityBar pct={quality} label={qualityLabel} color={qualityColor} />
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { label: "Min 50 chars",   done: cc >= 50 },
            { label: "100+ words",     done: wc >= 100 },
            { label: "200+ words",     done: wc >= 200 },
            { label: "Markdown used",  done: txt.includes("##") || txt.includes("**") || txt.includes("- ") },
          ].map(c => (
            <motion.span key={c.label} animate={{ color: c.done ? "#34d399" : muted }} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <motion.span animate={{ opacity: c.done ? 1 : 0.4 }}>{c.done ? "✓" : "○"}</motion.span>
              {c.label}
            </motion.span>
          ))}
        </div>
      </div>

      {cc < 50 && cc > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1}}
          style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "#ef4444", margin: 0 }}>
          ✕ Minimum 50 characters required — {50 - cc} more needed
        </motion.p>
      )}
    </div>
  );
}

export type { StoryData };
