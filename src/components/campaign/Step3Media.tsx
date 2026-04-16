"use client";
import { useRef, useState } from "react";
import { tokenStorage } from "@/lib/api";
import type { ProjectMediaRequest, MediaType, MediaUsage } from "@/lib/api";

interface MediaData {
  media: ProjectMediaRequest[];
}

interface Props {
  data: MediaData;
  onChange: (d: MediaData) => void;
  isDark: boolean;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/crowdspark";

async function uploadToCloudinary(file: File): Promise<{ secure_url: string; resource_type: string }> {
  const form = new FormData();
  form.append("file", file);
  const token = tokenStorage.getAccess();
  const res = await fetch(`${BASE_URL}/api/creator/upload-kyc-doc`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  const body = await res.json();
  const d = body?.data ?? body;
  return { secure_url: d.secure_url, resource_type: file.type.startsWith("video") ? "video" : "image" };
}

const SLOT_CFG: { label: string; usage: MediaUsage; mediaType: MediaType; required: boolean; hint: string }[] = [
  { label: "Thumbnail Image", usage: "THUMBNAIL", mediaType: "IMAGE", required: true, hint: "Main card image (recommended 16:9, ≥800px wide)" },
  { label: "Preview Video", usage: "CARD_VIDEO", mediaType: "VIDEO", required: false, hint: "Short teaser video shown in explore cards (MP4, max 60s)" },
  { label: "Gallery Image 1", usage: "GALLERY_IMAGE", mediaType: "IMAGE", required: false, hint: "Project gallery" },
  { label: "Gallery Image 2", usage: "GALLERY_IMAGE", mediaType: "IMAGE", required: false, hint: "Project gallery" },
  { label: "Gallery Image 3", usage: "GALLERY_IMAGE", mediaType: "IMAGE", required: false, hint: "Project gallery" },
  { label: "Story Image 1", usage: "STORY_IMAGE", mediaType: "IMAGE", required: false, hint: "Inline image for your story section" },
  { label: "Story Image 2", usage: "STORY_IMAGE", mediaType: "IMAGE", required: false, hint: "Inline image for your story section" },
];

export default function Step3Media({ data, onChange, isDark }: Props) {
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const findSlotMedia = (idx: number): ProjectMediaRequest | undefined => {
    // track by slot index using displayOrder
    return data.media.find((m) => m.displayOrder === idx);
  };

  const handleFileChange = async (idx: number, file: File | null) => {
    if (!file) return;
    const cfg = SLOT_CFG[idx];
    const isVideo = cfg.mediaType === "VIDEO";
    const acceptedVideo = isVideo && file.type.startsWith("video");
    const acceptedImage = !isVideo && file.type.startsWith("image");
    if (!acceptedVideo && !acceptedImage) {
      setErrors((e) => ({ ...e, [idx]: `Expected ${isVideo ? "video" : "image"} file` }));
      return;
    }

    setUploading((u) => ({ ...u, [idx]: true }));
    setErrors((e) => ({ ...e, [idx]: "" }));

    try {
      const result = await uploadToCloudinary(file);
      const newEntry: ProjectMediaRequest = {
        mediaUrl: result.secure_url,
        mediaType: cfg.mediaType,
        usage: cfg.usage,
        displayOrder: idx,
      };
      const filtered = data.media.filter((m) => m.displayOrder !== idx);
      onChange({ media: [...filtered, newEntry] });
    } catch (err: unknown) {
      setErrors((e) => ({
        ...e,
        [idx]: err instanceof Error ? err.message : "Upload failed",
      }));
    } finally {
      setUploading((u) => ({ ...u, [idx]: false }));
    }
  };

  const removeSlot = (idx: number) => {
    onChange({ media: data.media.filter((m) => m.displayOrder !== idx) });
  };

  const bdr = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
        Upload your campaign media. Only the thumbnail is required. Files are uploaded directly to Cloudinary.
      </p>

      {SLOT_CFG.map((cfg, idx) => {
        const existing = findSlotMedia(idx);
        const isUploading = uploading[idx];
        const errMsg = errors[idx];

        return (
          <div
            key={idx}
            style={{
              borderRadius: 14,
              border: `1px solid ${errMsg ? "rgba(239,68,68,0.4)" : bdr}`,
              background: isDark ? "rgba(255,255,255,0.02)" : "#fafafa",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
              {/* Preview */}
              <div
                style={{
                  width: 72,
                  height: 52,
                  borderRadius: 8,
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  flexShrink: 0,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  fontSize: 22,
                }}
              >
                {existing ? (
                  cfg.mediaType === "IMAGE" ? (
                    <img src={existing.mediaUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <video src={existing.mediaUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                  )
                ) : (
                  <span>{cfg.mediaType === "VIDEO" ? "🎬" : "🖼️"}</span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
                    {cfg.label}
                  </span>
                  {cfg.required && (
                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(239,68,68,0.12)", color: "#ef4444", fontWeight: 700 }}>
                      Required
                    </span>
                  )}
                  {existing && (
                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(52,211,153,0.12)", color: "#34d399", fontWeight: 700 }}>
                      ✓ Uploaded
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                  {cfg.hint}
                </p>
                {errMsg && (
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>
                    {errMsg}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {existing && (
                  <button
                    onClick={() => removeSlot(idx)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
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
                )}
                <button
                  disabled={isUploading}
                  onClick={() => inputRefs.current[idx]?.click()}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}`,
                    background: isDark ? "rgba(255,255,255,0.06)" : "#fff",
                    color: "var(--text)",
                    fontSize: 12.5,
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 600,
                    cursor: isUploading ? "not-allowed" : "pointer",
                    opacity: isUploading ? 0.6 : 1,
                  }}
                >
                  {isUploading ? "Uploading…" : existing ? "Replace" : "Upload"}
                </button>
              </div>

              <input
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="file"
                accept={cfg.mediaType === "VIDEO" ? "video/*" : "image/*"}
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(idx, e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type { MediaData };
