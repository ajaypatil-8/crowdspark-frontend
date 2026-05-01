"use client";
import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { tokenStorage } from "@/lib/api";
import type { ProjectMediaRequest, MediaType, MediaUsage } from "@/lib/api";

interface MediaData { media: ProjectMediaRequest[]; }
interface Props { data: MediaData; onChange: (d: MediaData) => void; isDark: boolean; }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/crowdspark";

async function uploadToCloudinary(file: File): Promise<{ secure_url: string; resource_type: string }> {
  const form = new FormData();
  form.append("file", file);
  const token = tokenStorage.getAccess();
  const res = await fetch(`${BASE_URL}/api/projects/upload-media`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body?.message ?? "Upload failed"); }
  const body = await res.json();
  const d = body?.data ?? body;
  return { secure_url: d.secure_url, resource_type: file.type.startsWith("video") ? "video" : "image" };
}

const SLOT_CFG: { label: string; usage: MediaUsage; mediaType: MediaType; required: boolean; hint: string; emoji: string }[] = [
  { label: "Thumbnail",      usage: "THUMBNAIL",    mediaType: "IMAGE", required: true,  emoji: "🖼", hint: "Main card image — 16:9 ratio, min 800×450px" },
  { label: "Preview Video",  usage: "CARD_VIDEO",   mediaType: "VIDEO", required: false, emoji: "🎬", hint: "Short teaser shown in explore cards — MP4, max 60s" },
  { label: "Gallery 1",      usage: "GALLERY_IMAGE", mediaType: "IMAGE", required: false, emoji: "📸", hint: "Additional project photo" },
  { label: "Gallery 2",      usage: "GALLERY_IMAGE", mediaType: "IMAGE", required: false, emoji: "📸", hint: "Additional project photo" },
  { label: "Gallery 3",      usage: "GALLERY_IMAGE", mediaType: "IMAGE", required: false, emoji: "📸", hint: "Additional project photo" },
  { label: "Story Image 1",  usage: "STORY_IMAGE",  mediaType: "IMAGE", required: false, emoji: "🖼", hint: "Inline image for your story section" },
  { label: "Story Image 2",  usage: "STORY_IMAGE",  mediaType: "IMAGE", required: false, emoji: "🖼", hint: "Inline image for your story section" },
];

function UploadSlot({ idx, cfg, existing, uploading, error, onFile, onRemove }: {
  idx: number; cfg: typeof SLOT_CFG[0]; existing?: ProjectMediaRequest;
  uploading: boolean; error?: string; onFile: (f: File) => void; onRemove: () => void;
}) {
  const { isDark } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [hov, setHov]   = useState(false);

  const has = !!existing;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0]; if (f) onFile(f);
  }, [onFile]);

  const bdr = has
    ? "rgba(52,211,153,0.4)"
    : drag
      ? "rgba(255,107,0,0.55)"
      : error
        ? "rgba(239,68,68,0.4)"
        : isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, duration: 0.3 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onDragEnter={() => setDrag(true)}
      onDragLeave={() => setDrag(false)}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        borderRadius: 16, border: `1.5px dashed ${bdr}`,
        background: has
          ? isDark ? "rgba(52,211,153,0.05)" : "rgba(52,211,153,0.03)"
          : drag
            ? isDark ? "rgba(255,107,0,0.07)" : "rgba(255,107,0,0.04)"
            : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
        transition: "all 0.2s",
        boxShadow: has ? "0 0 20px rgba(52,211,153,0.1)" : hov && !has ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
        overflow: "hidden",
      }}
    >
      <input
        ref={inputRef} type="file"
        accept={cfg.mediaType === "VIDEO" ? "video/*" : "image/*"}
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
        {/* Preview thumb */}
        <div style={{ width: 78, height: 58, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, position: "relative", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
          {uploading ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)", borderRadius: 10 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#ff8800", animation: "s3spin .7s linear infinite", display: "block" }} />
            </div>
          ) : existing ? (
            cfg.mediaType === "IMAGE"
              ? <img src={existing.mediaUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <video src={existing.mediaUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />
          ) : (
            <span>{cfg.emoji}</span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: has ? "#34d399" : "var(--text)" }}>{cfg.label}</span>
            {cfg.required && !has && <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 4, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontWeight: 700, border: "1px solid rgba(239,68,68,0.2)" }}>Required</span>}
            {has && <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 4, background: "rgba(52,211,153,0.1)", color: "#34d399", fontWeight: 700, border: "1px solid rgba(52,211,153,0.2)" }}>✓ Uploaded</span>}
          </div>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
            {drag ? "Drop to upload!" : cfg.hint}
          </p>
          {error && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>✕ {error}</p>}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
          {has && (
            <button onClick={onRemove}
              style={{ padding: "7px 13px", borderRadius: 9, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontSize: 12.5, fontFamily: "DM Sans, sans-serif", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              Remove
            </button>
          )}
          <motion.button
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            whileHover={!uploading ? { scale: 1.02 } : {}}
            whileTap={!uploading ? { scale: 0.97 } : {}}
            style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: has ? "transparent" : "linear-gradient(135deg,#ff6b00,#ffcc00)", border2: has ? `1px solid rgba(52,211,153,0.35)` : "none", color: has ? "#34d399" : "#fff", fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: uploading ? "wait" : "pointer", opacity: uploading ? 0.6 : 1, boxShadow: !has && !uploading ? "0 0 14px rgba(255,107,0,0.25)" : "none", position: "relative", overflow: "hidden", transition: "all 0.18s" } as any}
          >
            {!has && <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.2) 50%,transparent 70%)", animation: "s3shimmer 2.4s ease-in-out infinite" }} />}
            <span style={{ position: "relative" }}>{uploading ? "Uploading…" : has ? "Replace" : "Upload"}</span>
          </motion.button>
        </div>
      </div>

      {/* Full-width preview for thumbnail */}
      <AnimatePresence>
        {has && idx === 0 && cfg.mediaType === "IMAGE" && existing && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 160, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: "hidden" }}>
            <img src={existing.mediaUrl} alt="Thumbnail preview" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Step3Media({ data, onChange }: Props) {
  const { isDark } = useTheme();
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [errors,    setErrors]    = useState<Record<number, string>>({});

  const findSlotMedia = (idx: number) => data.media.find(m => m.displayOrder === idx);

  const handleFile = useCallback(async (idx: number, file: File) => {
    const cfg = SLOT_CFG[idx];
    const isVideo = cfg.mediaType === "VIDEO";
    if (isVideo && !file.type.startsWith("video")) { setErrors(e => ({ ...e, [idx]: "Expected a video file" })); return; }
    if (!isVideo && !file.type.startsWith("image")) { setErrors(e => ({ ...e, [idx]: "Expected an image file" })); return; }
    if (file.size > 50 * 1024 * 1024) { setErrors(e => ({ ...e, [idx]: "Max file size is 50MB" })); return; }

    setUploading(u => ({ ...u, [idx]: true }));
    setErrors(e => ({ ...e, [idx]: "" }));
    try {
      const result = await uploadToCloudinary(file);
      const entry: ProjectMediaRequest = { mediaUrl: result.secure_url, mediaType: cfg.mediaType, usage: cfg.usage, displayOrder: idx };
      onChange({ media: [...data.media.filter(m => m.displayOrder !== idx), entry] });
    } catch (err: unknown) {
      setErrors(e => ({ ...e, [idx]: err instanceof Error ? err.message : "Upload failed" }));
    } finally {
      setUploading(u => ({ ...u, [idx]: false }));
    }
  }, [data.media, onChange]);

  const removeSlot = (idx: number) => onChange({ media: data.media.filter(m => m.displayOrder !== idx) });

  const muted = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";
  const uploadedCount = data.media.length;
  const hasThumbnail = !!data.media.find(m => m.usage === "THUMBNAIL");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Stats bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", borderRadius: 12, background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>📎</span>
          <span style={{ fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{uploadedCount}</span>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted }}>/ {SLOT_CFG.length} files uploaded</span>
        </div>
        <div style={{ width: 1, height: 16, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5, color: hasThumbnail ? "#34d399" : "#f59e0b", fontWeight: 600 }}>
          {hasThumbnail ? "✓ Thumbnail ready" : "⚠ Thumbnail required"}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: muted }}>Drag & drop or click Upload</span>
      </div>

      {/* Slots */}
      {SLOT_CFG.map((cfg, idx) => (
        <UploadSlot
          key={idx} idx={idx} cfg={cfg}
          existing={findSlotMedia(idx)}
          uploading={uploading[idx] ?? false}
          error={errors[idx]}
          onFile={f => handleFile(idx, f)}
          onRemove={() => removeSlot(idx)}
        />
      ))}

      <style>{`
        @keyframes s3spin { to{transform:rotate(360deg)} }
        @keyframes s3shimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(220%)} 100%{transform:translateX(220%)} }
      `}</style>
    </div>
  );
}

export type { MediaData };
