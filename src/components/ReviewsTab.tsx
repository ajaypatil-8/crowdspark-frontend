// src/components/ReviewsTab.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Pencil, Trash2, Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  reviewApi,
  type ReviewSummaryResponse,
  type ProjectReviewResponse,
  type PageResponse,
} from "@/lib/api";

interface Props {
  projectId: number;
  isDark:    boolean;
  myUserId?: number | null;
}

// ── Star row ─────────────────────────────────────────────────────────────────
function Stars({
  value, max = 5, size = 16, interactive = false, onChange,
}: {
  value: number; max?: number; size?: number; interactive?: boolean;
  onChange?: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: max }, (_, i) => {
        const filled = (interactive ? hover || value : value) > i;
        return (
          <Star
            key={i}
            size={size}
            fill={filled ? "#f59e0b" : "none"}
            stroke={filled ? "#f59e0b" : "#9ca3af"}
            style={{ cursor: interactive ? "pointer" : "default", transition: "all 0.1s" }}
            onMouseEnter={() => interactive && setHover(i + 1)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange?.(i + 1)}
          />
        );
      })}
    </span>
  );
}

// ── Distribution bar ─────────────────────────────────────────────────────────
function DistBar({ label, count, total, isDark }: {
  label: string; count: number; total: number; isDark: boolean;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const muted = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";
  const track = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
      <span style={{ color: muted, width: 30, textAlign: "right" }}>{label}</span>
      <div style={{ flex: 1, background: track, borderRadius: 4, height: 6, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ height: "100%", background: "#f59e0b", borderRadius: 4 }}
        />
      </div>
      <span style={{ color: muted, width: 22 }}>{count}</span>
    </div>
  );
}

// ── Single review card ────────────────────────────────────────────────────────
function ReviewCard({
  review, projectId, myUserId, isDark, onDeleted, onUpdated,
}: {
  review:    ProjectReviewResponse;
  projectId: number;
  myUserId?: number | null;
  isDark:    boolean;
  onDeleted: (id: number) => void;
  onUpdated: (r: ProjectReviewResponse) => void;
}) {
  const [editing,  setEditing]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [editRating,   setEditRating]   = useState(review.rating);
  const [editTitle,    setEditTitle]    = useState(review.title ?? "");
  const [editContent,  setEditContent]  = useState(review.content ?? "");
  const [err, setErr] = useState<string | null>(null);

  const txt   = isDark ? "#f0f0f0"                   : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)"    : "rgba(0,0,0,0.42)";
  const bdr   = isDark ? "rgba(255,255,255,0.07)"    : "rgba(0,0,0,0.07)";
  const card  = isDark ? "#111"                       : "#fff";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f8f6";

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return d < 30 ? `${d}d ago` : new Date(dateStr).toLocaleDateString();
  }

  async function handleSave() {
    if (!editRating) return;
    setSaving(true); setErr(null);
    try {
      const updated = await reviewApi.updateReview(projectId, review.id, {
        rating: editRating,
        title:  editTitle.trim() || undefined,
        content: editContent.trim() || undefined,
      });
      onUpdated(updated);
      setEditing(false);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true); setErr(null);
    try {
      await reviewApi.deleteReview(projectId, review.id);
      onDeleted(review.id);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to delete");
      setDeleting(false);
    }
  }

  const isOwn = myUserId === review.reviewerId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      style={{
        background: card, border: `1px solid ${bdr}`, borderRadius: 12,
        padding: "16px 18px", marginBottom: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#ff5c00,#ff9000)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: 14, overflow: "hidden",
        }}>
          {review.reviewerProfileImageUrl
            ? <img src={review.reviewerProfileImageUrl} alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : review.reviewerName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: txt, fontWeight: 600, fontSize: 14 }}>
              {review.reviewerName}
            </span>
            <span style={{ color: muted, fontSize: 12 }}>@{review.reviewerUsername}</span>
            <span style={{ color: muted, fontSize: 12, marginLeft: "auto" }}>
              {timeAgo(review.createdAt)}
              {review.updatedAt && review.updatedAt !== review.createdAt && " (edited)"}
            </span>
          </div>
          {!editing && <Stars value={review.rating} size={14} />}
        </div>
        {/* Actions */}
        {isOwn && !editing && (
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setEditing(true)} title="Edit"
              style={{ background: "none", border: "none", cursor: "pointer",
                       color: muted, padding: 4, lineHeight: 0 }}>
              <Pencil size={14} />
            </button>
            <button onClick={handleDelete} disabled={deleting} title="Delete"
              style={{ background: "none", border: "none", cursor: "pointer",
                       color: "#ef4444", padding: 4, lineHeight: 0 }}>
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        )}
      </div>

      {/* Content — view or edit */}
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: muted, marginBottom: 4 }}>Rating</div>
            <Stars value={editRating} size={20} interactive onChange={setEditRating} />
          </div>
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="Short headline (optional)"
            maxLength={255}
            style={{
              background: inputBg, border: `1px solid ${bdr}`, borderRadius: 8,
              padding: "8px 12px", color: txt, fontSize: 14, outline: "none",
            }}
          />
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            placeholder="Share your experience…"
            rows={3}
            style={{
              background: inputBg, border: `1px solid ${bdr}`, borderRadius: 8,
              padding: "8px 12px", color: txt, fontSize: 14, outline: "none",
              resize: "vertical",
            }}
          />
          {err && <span style={{ color: "#ef4444", fontSize: 12 }}>{err}</span>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{
              background: "#ff5c00", color: "#fff", border: "none",
              borderRadius: 8, padding: "7px 16px", cursor: "pointer",
              fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
            }}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Save
            </button>
            <button onClick={() => { setEditing(false); setErr(null); }} style={{
              background: "transparent", color: muted, border: `1px solid ${bdr}`,
              borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13,
            }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {review.title && (
            <p style={{ color: txt, fontWeight: 600, fontSize: 14, margin: "4px 0" }}>
              {review.title}
            </p>
          )}
          {review.content && (
            <p style={{ color: muted, fontSize: 14, lineHeight: 1.55, margin: "4px 0 0" }}>
              {review.content}
            </p>
          )}
          {!review.content && !review.title && (
            <p style={{ color: muted, fontSize: 13, fontStyle: "italic" }}>
              No written review.
            </p>
          )}
        </>
      )}

      {err && !editing && (
        <p style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>{err}</p>
      )}
    </motion.div>
  );
}

// ── Write-review form ─────────────────────────────────────────────────────────
function WriteReviewForm({
  projectId, isDark, onSubmitted,
}: {
  projectId: number; isDark: boolean; onSubmitted: (r: ProjectReviewResponse) => void;
}) {
  const [rating,   setRating]   = useState(0);
  const [title,    setTitle]    = useState("");
  const [content,  setContent]  = useState("");
  const [posting,  setPosting]  = useState(false);
  const [err,      setErr]      = useState<string | null>(null);
  const [success,  setSuccess]  = useState(false);

  const txt   = isDark ? "#f0f0f0"                   : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)"    : "rgba(0,0,0,0.42)";
  const bdr   = isDark ? "rgba(255,255,255,0.07)"    : "rgba(0,0,0,0.07)";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f8f6";

  async function handleSubmit() {
    if (!rating) { setErr("Please select a star rating"); return; }
    setPosting(true); setErr(null);
    try {
      const newReview = await reviewApi.submitReview(projectId, {
        rating,
        title:   title.trim()   || undefined,
        content: content.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => onSubmitted(newReview), 600);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to submit review");
    } finally {
      setPosting(false);
    }
  }

  if (success) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ display: "flex", alignItems: "center", gap: 10, color: "#22c55e",
               fontSize: 14, padding: "12px 0" }}>
      <CheckCircle2 size={18} /> Review submitted!
    </motion.div>
  );

  return (
    <div style={{
      border: `1px solid ${bdr}`, borderRadius: 12,
      padding: "16px 18px", marginBottom: 20,
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: txt, marginBottom: 12 }}>
        Write a Review
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>Your rating *</div>
        <Stars value={rating} size={24} interactive onChange={setRating} />
      </div>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Headline (optional)"
        maxLength={255}
        style={{
          width: "100%", background: inputBg, border: `1px solid ${bdr}`,
          borderRadius: 8, padding: "8px 12px", color: txt, fontSize: 14,
          outline: "none", marginBottom: 10, boxSizing: "border-box",
        }}
      />
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Tell other backers about your experience… (min 10 characters)"
        rows={4}
        style={{
          width: "100%", background: inputBg, border: `1px solid ${bdr}`,
          borderRadius: 8, padding: "8px 12px", color: txt, fontSize: 14,
          outline: "none", resize: "vertical", marginBottom: 10, boxSizing: "border-box",
        }}
      />
      {err && (
        <div style={{ display: "flex", alignItems: "center", gap: 6,
                      color: "#ef4444", fontSize: 12, marginBottom: 8 }}>
          <AlertCircle size={13} /> {err}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={posting || !rating}
        style={{
          background: rating ? "#ff5c00" : (isDark ? "#333" : "#e5e5e5"),
          color: rating ? "#fff" : muted,
          border: "none", borderRadius: 8, padding: "8px 20px",
          cursor: rating && !posting ? "pointer" : "not-allowed",
          fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
        }}
      >
        {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        Submit Review
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReviewsTab({ projectId, isDark, myUserId }: Props) {
  const [summary, setSummary]   = useState<ReviewSummaryResponse | null>(null);
  const [reviews, setReviews]   = useState<ProjectReviewResponse[]>([]);
  const [page,    setPage]      = useState(0);
  const [hasMore, setHasMore]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,   setError]     = useState<string | null>(null);

  const txt   = isDark ? "#f0f0f0"                : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";

  // initial load
  useEffect(() => {
    setLoading(true); setError(null);
    Promise.all([
      reviewApi.getSummary(projectId),
      reviewApi.getReviews(projectId, 0, 10),
    ]).then(([s, r]) => {
      setSummary(s);
      setReviews(r.content);
      setHasMore(!r.last);
      setPage(0);
    }).catch(() => setError("Failed to load reviews"))
      .finally(() => setLoading(false));
  }, [projectId]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const next = await reviewApi.getReviews(projectId, page + 1, 10);
      setReviews(prev => [...prev, ...next.content]);
      setHasMore(!next.last);
      setPage(p => p + 1);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }, [projectId, page]);

  function onReviewSubmitted(newReview: ProjectReviewResponse) {
    setReviews(prev => [newReview, ...prev]);
    setSummary(prev => prev ? {
      ...prev,
      totalReviews: prev.totalReviews + 1,
      canReview: false,
      myReview: newReview,
    } : prev);
  }

  function onReviewDeleted(id: number) {
    setReviews(prev => prev.filter(r => r.id !== id));
    setSummary(prev => prev ? {
      ...prev,
      totalReviews: Math.max(0, prev.totalReviews - 1),
      myReview: prev.myReview?.id === id ? null : prev.myReview,
      canReview: prev.myReview?.id === id ? true : prev.canReview,
    } : prev);
  }

  function onReviewUpdated(updated: ProjectReviewResponse) {
    setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
    setSummary(prev => prev ? {
      ...prev,
      myReview: prev.myReview?.id === updated.id ? updated : prev.myReview,
    } : prev);
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ padding: "20px 0" }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: 80, borderRadius: 12, marginBottom: 12,
          background: isDark ? "rgba(255,255,255,0.04)" : "#f0f0f0",
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
      ))}
    </div>
  );

  if (error) return (
    <div style={{ padding: "24px 0", color: "#ef4444", textAlign: "center", fontSize: 14 }}>
      {error}
    </div>
  );

  const dist = summary?.ratingDistribution ?? {};
  const total = summary?.totalReviews ?? 0;
  const avg   = summary?.averageRating;

  return (
    <div style={{ paddingTop: 8 }}>
      {/* ── Aggregate section ── */}
      {total > 0 && (
        <div style={{
          display: "flex", gap: 24, flexWrap: "wrap",
          marginBottom: 24, alignItems: "flex-start",
        }}>
          {/* Big number */}
          <div style={{ textAlign: "center", minWidth: 90 }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: txt, lineHeight: 1 }}>
              {avg?.toFixed(1) ?? "—"}
            </div>
            <Stars value={Math.round(avg ?? 0)} size={18} />
            <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>
              {total} review{total !== 1 ? "s" : ""}
            </div>
          </div>
          {/* Histogram */}
          <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 5 }}>
            {[5, 4, 3, 2, 1].map(star => (
              <DistBar key={star} label={`${star}★`}
                count={dist[star] ?? 0} total={total} isDark={isDark} />
            ))}
          </div>
        </div>
      )}

      {/* ── Write-review form ── */}
      {myUserId && summary?.canReview && (
        <WriteReviewForm
          projectId={projectId}
          isDark={isDark}
          onSubmitted={onReviewSubmitted}
        />
      )}

      {/* ── Login prompt ── */}
      {!myUserId && total === 0 && (
        <p style={{ color: muted, fontSize: 14, marginBottom: 16 }}>
          No reviews yet. Back this project to leave the first review.
        </p>
      )}

      {/* ── Reviews list ── */}
      <AnimatePresence mode="popLayout">
        {reviews.map(review => (
          <ReviewCard
            key={review.id}
            review={review}
            projectId={projectId}
            myUserId={myUserId}
            isDark={isDark}
            onDeleted={onReviewDeleted}
            onUpdated={onReviewUpdated}
          />
        ))}
      </AnimatePresence>

      {total === 0 && !summary?.canReview && (
        <p style={{ color: muted, fontSize: 14, textAlign: "center", padding: "20px 0" }}>
          No reviews yet.
        </p>
      )}

      {/* ── Load more ── */}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          style={{
            display: "block", margin: "8px auto 0",
            background: "none", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
            color: muted, borderRadius: 8, padding: "8px 24px",
            cursor: loadingMore ? "wait" : "pointer", fontSize: 13,
          }}
        >
          {loadingMore ? "Loading…" : "Load more reviews"}
        </button>
      )}
    </div>
  );
}
