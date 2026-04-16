"use client";

interface StoryData {
  fullDescription: string;
}

interface Props {
  data: StoryData;
  onChange: (d: StoryData) => void;
  isDark: boolean;
}

const TIPS = [
  "Why does this project exist? What problem does it solve?",
  "Who are you and why are YOU the right person to do this?",
  "What will the funds be used for — be specific.",
  "What happens if the goal is exceeded?",
  "Share your timeline: when will backers see results?",
];

export default function Step2Story({ data, onChange, isDark }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          padding: "14px 16px",
          borderRadius: 12,
          background: isDark ? "rgba(255,136,0,0.06)" : "rgba(255,136,0,0.05)",
          border: "1px solid rgba(255,136,0,0.18)",
        }}
      >
        <p
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#ff8800",
            margin: "0 0 8px",
          }}
        >
          Story writing tips
        </p>
        <ul style={{ paddingLeft: 16, margin: 0 }}>
          {TIPS.map((t) => (
            <li
              key={t}
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 4,
                lineHeight: 1.5,
              }}
            >
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--text-muted)",
            marginBottom: 6,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Full Campaign Story * (supports markdown)
        </label>
        <textarea
          style={{
            width: "100%",
            minHeight: 360,
            padding: "14px",
            borderRadius: 12,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
            color: "var(--text)",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            lineHeight: 1.7,
            outline: "none",
            resize: "vertical",
          }}
          placeholder={`Tell your complete story here...\n\n## Why this project?\n\n## How will the funds be used?\n\n## About me / our team\n\n## Timeline`}
          value={data.fullDescription}
          onChange={(e) => onChange({ fullDescription: e.target.value })}
        />
        <div
          style={{
            textAlign: "right",
            fontSize: 11,
            color: "var(--text-muted)",
            marginTop: 4,
          }}
        >
          {data.fullDescription.length} chars
          {data.fullDescription.length < 200 && (
            <span style={{ color: "#ef4444", marginLeft: 6 }}>
              (min ~200 chars recommended)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export type { StoryData };
