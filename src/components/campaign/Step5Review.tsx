"use client";
import type { BasicInfo } from "./Step1BasicInfo";
import type { StoryData } from "./Step2Story";
import type { MediaData } from "./Step3Media";
import type { RewardsData } from "./Step4Rewards";
import type { Category } from "@/lib/api";

interface Props {
  basic: BasicInfo;
  story: StoryData;
  media: MediaData;
  rewards: RewardsData;
  categories: Category[];
  isDark: boolean;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", minWidth: 130, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "var(--text)", flex: 1 }}>
        {value}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 2, letterSpacing: "-0.02em" }}>
        {title}
      </h3>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 2 }}>
        {children}
      </div>
    </div>
  );
}

export default function Step5Review({ basic, story, media, rewards, categories, isDark }: Props) {
  const catNames = basic.categoryIds
    .map((id) => categories.find((c) => c.id === id)?.name ?? `#${id}`)
    .join(", ");

  const thumbnail = media.media.find((m) => m.usage === "THUMBNAIL");
  const uploadedCount = media.media.length;

  const deadline = basic.deadline ? new Date(basic.deadline).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

  const missing: string[] = [];
  if (!basic.title.trim()) missing.push("Title");
  if (!basic.shortDescription.trim()) missing.push("Short description");
  if (!story.fullDescription.trim()) missing.push("Full story");
  if (!basic.goalAmount || Number(basic.goalAmount) <= 0) missing.push("Funding goal");
  if (!basic.deadline) missing.push("Deadline");
  if (basic.categoryIds.length === 0) missing.push("At least one category");
  if (!thumbnail) missing.push("Thumbnail image");

  return (
    <div>
      {missing.length > 0 && (
        <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", marginBottom: 24 }}>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#ef4444", margin: "0 0 8px" }}>
            ⚠ Missing required fields:
          </p>
          {missing.map((m) => (
            <p key={m} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#ef4444", margin: "2px 0" }}>
              • {m}
            </p>
          ))}
        </div>
      )}

      {missing.length === 0 && (
        <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.25)", marginBottom: 24 }}>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#34d399", margin: 0 }}>
            ✓ All required fields complete. Ready to submit for review!
          </p>
        </div>
      )}

      <Section title="Basic Info">
        <Row label="Title" value={basic.title || "—"} />
        <Row label="Short Desc." value={basic.shortDescription || "—"} />
        <Row label="Location" value={basic.location || "—"} />
        <Row label="Goal" value={basic.goalAmount ? `₹${Number(basic.goalAmount).toLocaleString("en-IN")}` : "—"} />
        <Row label="Deadline" value={deadline} />
        <Row label="Categories" value={catNames || "—"} />
      </Section>

      <Section title="Story">
        <Row
          label="Length"
          value={`${story.fullDescription.length} chars ${story.fullDescription.length < 200 ? "(a bit short)" : "✓"}`}
        />
        <Row
          label="Preview"
          value={
            <span style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", opacity: 0.8 }}>
              {story.fullDescription.slice(0, 300) || "—"}
            </span>
          }
        />
      </Section>

      <Section title="Media">
        <Row label="Files uploaded" value={`${uploadedCount} file${uploadedCount !== 1 ? "s" : ""}`} />
        {thumbnail && (
          <Row
            label="Thumbnail"
            value={
              <img src={thumbnail.mediaUrl} alt="thumb" style={{ width: 120, height: 70, objectFit: "cover", borderRadius: 8 }} />
            }
          />
        )}
        {media.media.filter((m) => m.usage !== "THUMBNAIL").map((m, i) => (
          <Row key={i} label={m.usage.replace(/_/g, " ")} value={
            m.mediaType === "IMAGE"
              ? <img src={m.mediaUrl} alt="" style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 6 }} />
              : <span style={{ color: "var(--text-muted)", fontSize: 13 }}>🎬 {m.mediaUrl.slice(-40)}</span>
          } />
        ))}
      </Section>

      <Section title="Reward Tiers">
        {rewards.rewards.length === 0 ? (
          <Row label="Tiers" value="None (optional)" />
        ) : (
          rewards.rewards.map((r, i) => (
            <Row
              key={i}
              label={`Tier ${i + 1}`}
              value={`${r.title} — ₹${Number(r.minimumAmount).toLocaleString("en-IN")} min`}
            />
          ))
        )}
      </Section>

      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 8 }}>
        Your campaign will be submitted for admin review. You'll be notified once it's approved or if changes are needed.
      </p>
    </div>
  );
}
