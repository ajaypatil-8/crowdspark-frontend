"use client";
import type { RewardTierRequest } from "@/lib/api";

interface RewardsData {
  rewards: RewardTierRequest[];
}

interface Props {
  data: RewardsData;
  onChange: (d: RewardsData) => void;
  isDark: boolean;
}

const EMPTY: RewardTierRequest = { title: "", description: "", minimumAmount: 0 };

const PRESETS = [
  { title: "Early Backer", description: "A heartfelt thank-you and your name in our credits.", minimumAmount: 500 },
  { title: "Supporter", description: "Thank-you + exclusive project updates via email.", minimumAmount: 1500 },
  { title: "Champion", description: "Early access to the product/service + all previous perks.", minimumAmount: 5000 },
  { title: "Patron", description: "Recognition + one-on-one call with the creator.", minimumAmount: 15000 },
];

export default function Step4Rewards({ data, onChange, isDark }: Props) {
  const set = (rewards: RewardTierRequest[]) => onChange({ rewards });

  const add = () => set([...data.rewards, { ...EMPTY }]);

  const remove = (i: number) => set(data.rewards.filter((_, idx) => idx !== i));

  const update = (i: number, key: keyof RewardTierRequest, val: string | number) => {
    const next = data.rewards.map((r, idx) =>
      idx === i ? { ...r, [key]: val } : r
    );
    set(next);
  };

  const addPreset = (p: RewardTierRequest) => {
    if (data.rewards.length < 8) set([...data.rewards, { ...p }]);
  };

  const bdr = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const inp: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${bdr}`,
    background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
    color: "var(--text)",
    fontFamily: "DM Sans, sans-serif",
    fontSize: 13.5,
    outline: "none",
  };
  const lbl: React.CSSProperties = {
    fontSize: 11.5,
    fontWeight: 600,
    color: "var(--text-muted)",
    fontFamily: "DM Sans, sans-serif",
    marginBottom: 4,
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
        Reward tiers are optional but strongly boost conversion. Backers who pledge ≥ the minimum amount receive that tier's reward.
      </p>

      {/* Presets */}
      <div>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 10 }}>
          Quick-add presets
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRESETS.map((p) => (
            <button
              key={p.title}
              onClick={() => addPreset(p)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
                background: "transparent",
                color: "var(--text-muted)",
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12.5,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#ff8800";
                (e.currentTarget as HTMLButtonElement).style.color = "#ff8800";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
              }}
            >
              + {p.title} (₹{p.minimumAmount.toLocaleString("en-IN")})
            </button>
          ))}
        </div>
      </div>

      {/* Tier cards */}
      {data.rewards.map((r, i) => (
        <div
          key={i}
          style={{
            borderRadius: 14,
            border: `1px solid ${bdr}`,
            padding: "16px",
            background: isDark ? "rgba(255,255,255,0.025)" : "#fafafa",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
              Tier #{i + 1}
            </span>
            <button
              onClick={() => remove(i)}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid rgba(239,68,68,0.3)",
                background: "transparent",
                color: "#ef4444",
                fontSize: 12,
                fontFamily: "DM Sans, sans-serif",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Tier Name *</label>
              <input
                style={inp}
                placeholder="e.g. Early Backer"
                value={r.title}
                onChange={(e) => update(i, "title", e.target.value)}
              />
            </div>
            <div>
              <label style={lbl}>Min. Amount (₹) *</label>
              <input
                style={inp}
                type="number"
                min={1}
                placeholder="500"
                value={r.minimumAmount || ""}
                onChange={(e) => update(i, "minimumAmount", Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label style={lbl}>What backers receive</label>
            <textarea
              style={{ ...inp, height: 72, resize: "vertical" }}
              placeholder="Describe what this tier includes..."
              value={r.description ?? ""}
              onChange={(e) => update(i, "description", e.target.value)}
            />
          </div>
        </div>
      ))}

      {data.rewards.length < 8 && (
        <button
          onClick={add}
          style={{
            padding: "12px",
            borderRadius: 12,
            border: `2px dashed ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
            background: "transparent",
            color: "var(--text-muted)",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#ff8800";
            (e.currentTarget as HTMLButtonElement).style.color = "#ff8800";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
          }}
        >
          + Add reward tier
        </button>
      )}

      {data.rewards.length === 0 && (
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", textAlign: "center" }}>
          No tiers added — that's fine! You can skip this step.
        </p>
      )}
    </div>
  );
}

export type { RewardsData };
