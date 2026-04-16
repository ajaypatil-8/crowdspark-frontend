"use client";
import { useState, useEffect } from "react";
import { categoryApi, type Category } from "@/lib/api";

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

export default function Step1BasicInfo({ data, onChange, isDark }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(() => {});
  }, []);

  const set = (k: keyof BasicInfo, v: unknown) =>
    onChange({ ...data, [k]: v });

  const toggleCat = (id: number) => {
    const next = data.categoryIds.includes(id)
      ? data.categoryIds.filter((x) => x !== id)
      : [...data.categoryIds, id];
    set("categoryIds", next);
  };

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
    background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
    color: "var(--text)",
    fontFamily: "DM Sans, sans-serif",
    fontSize: 14,
    outline: "none",
    transition: "border 0.15s",
  };
  const lbl: React.CSSProperties = {
    display: "block",
    fontFamily: "DM Sans, sans-serif",
    fontSize: 12.5,
    fontWeight: 600,
    color: "var(--text-muted)",
    marginBottom: 6,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <label style={lbl}>Campaign Title *</label>
        <input
          style={inp}
          placeholder="What's your big idea?"
          value={data.title}
          maxLength={120}
          onChange={(e) => set("title", e.target.value)}
        />
        <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          {data.title.length}/120
        </div>
      </div>

      <div>
        <label style={lbl}>Short Description * (shown in cards, max 300)</label>
        <textarea
          style={{ ...inp, height: 90, resize: "vertical" }}
          placeholder="One punchy paragraph that hooks backers instantly..."
          value={data.shortDescription}
          maxLength={300}
          onChange={(e) => set("shortDescription", e.target.value)}
        />
        <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          {data.shortDescription.length}/300
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={lbl}>Funding Goal (₹) *</label>
          <input
            style={inp}
            type="number"
            min={1000}
            placeholder="e.g. 500000"
            value={data.goalAmount}
            onChange={(e) => set("goalAmount", e.target.value)}
          />
        </div>
        <div>
          <label style={lbl}>Campaign Deadline *</label>
          <input
            style={inp}
            type="datetime-local"
            value={data.deadline}
            min={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
            onChange={(e) => set("deadline", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label style={lbl}>Location *</label>
        <input
          style={inp}
          placeholder="e.g. Mumbai, Maharashtra"
          value={data.location}
          onChange={(e) => set("location", e.target.value)}
        />
      </div>

      <div>
        <label style={lbl}>Categories * (pick at least one)</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
          {categories.map((c) => {
            const active = data.categoryIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCat(c.id)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 20,
                  border: `1px solid ${active ? "#ff8800" : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
                  background: active ? "rgba(255,136,0,0.12)" : "transparent",
                  color: active ? "#ff8800" : "var(--text-muted)",
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {c.name}
              </button>
            );
          })}
          {categories.length === 0 && (
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading categories…</span>
          )}
        </div>
      </div>
    </div>
  );
}

export type { BasicInfo };
