// src/components/dashboard/PostUpdateModal.tsx
// NEW FILE — Modal for creators to post campaign updates
// Usage in my-campaigns/[id]/page.tsx:
//   <PostUpdateModal open={showUpdateModal} onClose={() => setShowUpdateModal(false)}
//     projectId={project.id} isDark={isDark} onPosted={() => { /* refetch updates */ }} />

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Image, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { campaignUpdateApi } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: number;
  isDark: boolean;
  onPosted?: () => void;
}

export default function PostUpdateModal({
  open, onClose, projectId, isDark, onPosted
}: Props) {
  const [title,   setTitle]   = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const accent  = "#ff5c00";
  const bg      = isDark ? "#0c0c0c" : "#ffffff";
  const bdr     = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const txt     = isDark ? "#f0f0f0" : "#0a0a0a";
  const muted   = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f8f6";

  async function handlePost() {
    if (!title.trim()) { setError("Title is required"); return; }
    if (!content.trim()) { setError("Content is required"); return; }
    setLoading(true);
    setError(null);
    try {
      await campaignUpdateApi.createUpdate(projectId, {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
      });
      setDone(true);
      onPosted?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to post update. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setTitle(""); setContent(""); setImageUrl("");
    setDone(false); setError(null);
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "12px 14px", borderRadius: 12,
    border: `1.5px solid ${bdr}`, background: inputBg,
    color: txt, fontFamily: "DM Sans, sans-serif",
    fontSize: 14, outline: "none"
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{ position: "fixed", inset: 0, zIndex: 9000,
            background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center",
            justifyContent: "center", padding: 16 }}
        >
          <motion.div
            initial={{ scale: 0.88, y: 32, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, y: 32, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            style={{ background: bg, border: `1px solid ${bdr}`,
              borderRadius: 24, padding: "32px 28px",
              maxWidth: 540, width: "100%", position: "relative" }}
          >
            {!loading && (
              <motion.button whileHover={{ scale: 1.1 }} onClick={handleClose}
                style={{ position: "absolute", top: 18, right: 18,
                  width: 32, height: 32, borderRadius: "50%",
                  background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                  border: `1px solid ${bdr}`, color: muted,
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center" }}>
                <X size={14} />
              </motion.button>
            )}

            {/* Success */}
            {done ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "24px 0" }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 14, stiffness: 250, delay: 0.1 }}
                  style={{ width: 64, height: 64, borderRadius: 20,
                    background: "rgba(34,197,94,0.15)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", margin: "0 auto 18px" }}>
                  <CheckCircle size={30} color="#22c55e" />
                </motion.div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900,
                  fontSize: 20, color: txt, margin: "0 0 8px" }}>
                  Update posted! 🎉
                </h3>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
                  color: muted, margin: "0 0 24px", lineHeight: 1.65 }}>
                  All your backers have been notified.
                </p>
                <motion.button whileHover={{ scale: 1.03 }}
                  onClick={handleClose}
                  style={{ padding: "12px 28px", borderRadius: 12,
                    background: `linear-gradient(135deg,${accent},#ff9900)`,
                    color: "#fff", border: "none",
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                  Done
                </motion.button>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div style={{ marginBottom: 22, paddingRight: 36 }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 900,
                    fontSize: 20, color: txt, margin: "0 0 4px" }}>
                    Post a Campaign Update
                  </h2>
                  <p style={{ fontFamily: "DM Sans, sans-serif",
                    fontSize: 13, color: muted, margin: 0 }}>
          Keep your backers in the loop. They&apos;ll be notified instantly.
                  </p>
                </div>

                {/* Title */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontFamily: "DM Mono, monospace",
                    fontSize: 10.5, color: muted, display: "block",
                    marginBottom: 7, letterSpacing: "0.1em",
                    textTransform: "uppercase" }}>
                    Update Title *
                  </label>
                  <input
                    type="text" value={title} maxLength={255}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Production has started!"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = `${accent}60`)}
                    onBlur={e => (e.target.style.borderColor = bdr)}
                  />
                </div>

                {/* Content */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontFamily: "DM Mono, monospace",
                    fontSize: 10.5, color: muted, display: "block",
                    marginBottom: 7, letterSpacing: "0.1em",
                    textTransform: "uppercase" }}>
                    Content *
                  </label>
                  <textarea
                    value={content} maxLength={5000} rows={6}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Share the latest news with your backers..."
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
                    onFocus={e => (e.target.style.borderColor = `${accent}60`)}
                    onBlur={e => (e.target.style.borderColor = bdr)}
                  />
                  <div style={{ textAlign: "right", marginTop: 4 }}>
                    <span style={{ fontFamily: "DM Sans, sans-serif",
                      fontSize: 11, color: muted }}>
                      {content.length}/5000
                    </span>
                  </div>
                </div>

                {/* Image URL (optional) */}
                <div style={{ marginBottom: 22 }}>
                  <label style={{ fontFamily: "DM Mono, monospace",
                    fontSize: 10.5, color: muted, display: "block",
                    marginBottom: 7, letterSpacing: "0.1em",
                    textTransform: "uppercase" }}>
                    Image URL (Optional)
                  </label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: 12,
                      top: "50%", transform: "translateY(-50%)" }}>
                      <Image size={14} color={muted} />
                    </div>
                    <input
                      type="url" value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="https://cloudinary.com/..."
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      onFocus={e => (e.target.style.borderColor = `${accent}60`)}
                      onBlur={e => (e.target.style.borderColor = bdr)}
                    />
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{ display: "flex", alignItems: "center",
                        gap: 8, fontSize: 13, color: "#ef4444",
                        marginBottom: 16, padding: "10px 14px",
                        borderRadius: 10,
                        background: "rgba(239,68,68,0.07)",
                        border: "1px solid rgba(239,68,68,0.18)",
                        fontFamily: "DM Sans, sans-serif" }}>
                      <AlertCircle size={14} /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  onClick={handlePost} disabled={loading}
                  style={{ width: "100%", padding: "14px",
                    borderRadius: 14,
                    background: loading
                      ? `${accent}55`
                      : `linear-gradient(135deg,${accent},#ff8c00)`,
                    border: "none", color: "#fff",
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 800, fontSize: 15,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 10 }}>
                  {loading
                    ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Posting…</>
                    : <><Send size={15} /> Post Update to Backers</>
                  }
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AnimatePresence>
  );
}
