

"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Trash2, CornerDownRight,
  ChevronDown, ChevronUp, Loader2, AlertCircle
} from "lucide-react";
import {
  commentApi,
  type ProjectCommentResponse,
  type PageResponse
} from "@/lib/api";

interface Props {
  projectId: number;
  creatorId: number;
  isDark: boolean;
  myUserId?: number | null;  // null = not logged in
}

// ── Single comment card ───────────────────────────────────────────────────────
function CommentCard({
  comment, projectId, creatorId, myUserId, isDark,
  onDelete, onReplyPosted,
}: {
  comment: ProjectCommentResponse;
  projectId: number;
  creatorId: number;
  myUserId?: number | null;
  isDark: boolean;
  onDelete: (id: number) => void;
  onReplyPosted: (reply: ProjectCommentResponse, parentId: number) => void;
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies,  setShowReplies]  = useState(false);
  const [replyText,    setReplyText]    = useState("");
  const [posting,      setPosting]      = useState(false);
  const [replyError,   setReplyError]   = useState<string | null>(null);

  const txt    = isDark ? "#f0f0f0" : "#0a0a0a";
  const muted  = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr    = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card   = isDark ? "#111" : "#fff";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f8f6";
  const accent = "#ff5c00";

  const canDelete = myUserId === comment.authorId || myUserId === creatorId;
  const isCreator = comment.authorIsCreator;

  async function submitReply() {
    if (!replyText.trim()) return;
    setPosting(true);
    setReplyError(null);
    try {
      const newReply = await commentApi.postComment(projectId, {
        content: replyText.trim(),
        parentCommentId: comment.id,
      });
      setReplyText("");
      setShowReplyBox(false);
      setShowReplies(true);
      onReplyPosted(newReply, comment.id);
    } catch (e: any) {
      setReplyError(e?.message ?? "Failed to post reply");
    } finally {
      setPosting(false);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Main comment */}
      <div style={{
        padding: "16px 18px", borderRadius: 16,
        background: card, border: `1px solid ${bdr}`,
        opacity: comment.deleted ? 0.55 : 1,
      }}>
        {/* Author row */}
        <div style={{ display: "flex", alignItems: "center",
          gap: 9, marginBottom: 10 }}>
          {/* Avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: isCreator
              ? "linear-gradient(135deg,#ff5c00,#ff9900)"
              : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0, overflow: "hidden",
          }}>
            {comment.authorProfileImage ? (
              <img src={comment.authorProfileImage}
                alt={comment.authorUsername}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontFamily: "Syne, sans-serif",
                fontWeight: 800, fontSize: 13, color: "#fff" }}>
                {comment.authorUsername?.[0]?.toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontFamily: "Syne, sans-serif",
                fontWeight: 700, fontSize: 13, color: txt }}>
                {comment.authorUsername}
              </span>
              {isCreator && (
                <span style={{
                  fontFamily: "DM Mono, monospace", fontSize: 10,
                  color: "#ff5c00", background: "rgba(255,92,0,0.12)",
                  padding: "1px 7px", borderRadius: 6, fontWeight: 600,
                  letterSpacing: "0.05em"
                }}>CREATOR</span>
              )}
            </div>
            <span style={{ fontFamily: "DM Sans, sans-serif",
              fontSize: 11.5, color: muted }}>
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Delete */}
          {canDelete && !comment.deleted && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(comment.id)}
              style={{ width: 28, height: 28, borderRadius: 8,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer" }}>
              <Trash2 size={12} color="#ef4444" />
            </motion.button>
          )}
        </div>

        {/* Content */}
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14,
          color: comment.deleted ? muted : txt, margin: "0 0 12px",
          lineHeight: 1.7, fontStyle: comment.deleted ? "italic" : "normal",
          whiteSpace: "pre-wrap" }}>
          {comment.content}
        </p>

        {/* Actions */}
        {!comment.deleted && (
          <div style={{ display: "flex", gap: 10 }}>
            {myUserId && (
              <motion.button whileHover={{ scale: 1.04 }}
                onClick={() => setShowReplyBox(v => !v)}
                style={{ display: "flex", alignItems: "center", gap: 5,
                  fontFamily: "DM Sans, sans-serif", fontSize: 12.5,
                  color: showReplyBox ? accent : muted,
                  background: "none", border: "none", cursor: "pointer",
                  padding: "3px 8px", borderRadius: 8,
                  transition: "color 0.15s" }}>
                <CornerDownRight size={13} /> Reply
              </motion.button>
            )}

            {comment.replyCount > 0 && (
              <motion.button whileHover={{ scale: 1.04 }}
                onClick={() => setShowReplies(v => !v)}
                style={{ display: "flex", alignItems: "center", gap: 5,
                  fontFamily: "DM Sans, sans-serif", fontSize: 12.5,
                  color: muted, background: "none",
                  border: "none", cursor: "pointer",
                  padding: "3px 8px", borderRadius: 8 }}>
                {showReplies
                  ? <><ChevronUp size={13}/> Hide {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}</>
                  : <><ChevronDown size={13}/> {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}</>
                }
              </motion.button>
            )}
          </div>
        )}

        {/* Reply box */}
        <AnimatePresence>
          {showReplyBox && (
            <motion.div initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: 12, overflow: "hidden" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Reply to @${comment.authorUsername}...`}
                  rows={2} maxLength={2000}
                  style={{ flex: 1, padding: "10px 12px",
                    borderRadius: 10, border: `1.5px solid ${bdr}`,
                    background: inputBg, color: txt,
                    fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
                    outline: "none", resize: "vertical" }}
                  onFocus={e => (e.target.style.borderColor = `${accent}60`)}
                  onBlur={e => (e.target.style.borderColor = bdr)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitReply();
                  }}
                />
                <motion.button whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={submitReply} disabled={posting || !replyText.trim()}
                  style={{ padding: "0 14px", borderRadius: 10,
                    background: replyText.trim()
                      ? `linear-gradient(135deg,${accent},#ff8c00)`
                      : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"),
                    border: "none",
                    color: replyText.trim() ? "#fff" : muted,
                    cursor: replyText.trim() ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center" }}>
                  {posting
                    ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                    : <Send size={15} />
                  }
                </motion.button>
              </div>
              {replyError && (
                <p style={{ fontFamily: "DM Sans, sans-serif",
                  fontSize: 12, color: "#ef4444", margin: "6px 0 0",
                  display: "flex", alignItems: "center", gap: 5 }}>
                  <AlertCircle size={12} /> {replyError}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Replies */}
      <AnimatePresence>
        {showReplies && comment.replies.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ paddingLeft: 28, display: "flex",
              flexDirection: "column", gap: 8, marginTop: 8 }}>
            {comment.replies.map(reply => (
              <div key={reply.id} style={{
                padding: "14px 16px", borderRadius: 14,
                background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${bdr}`,
                opacity: reply.deleted ? 0.55 : 1,
              }}>
                <div style={{ display: "flex", alignItems: "center",
                  gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: reply.authorIsCreator
                      ? "linear-gradient(135deg,#ff5c00,#ff9900)"
                      : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                    overflow: "hidden",
                  }}>
                    {reply.authorProfileImage ? (
                      <img src={reply.authorProfileImage}
                        alt={reply.authorUsername}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontFamily: "Syne, sans-serif",
                        fontWeight: 800, fontSize: 11, color: "#fff" }}>
                        {reply.authorUsername?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "Syne, sans-serif",
                        fontWeight: 700, fontSize: 12.5, color: txt }}>
                        {reply.authorUsername}
                      </span>
                      {reply.authorIsCreator && (
                        <span style={{ fontFamily: "DM Mono, monospace",
                          fontSize: 9.5, color: "#ff5c00",
                          background: "rgba(255,92,0,0.12)",
                          padding: "1px 6px", borderRadius: 5,
                          fontWeight: 600, letterSpacing: "0.05em" }}>
                          CREATOR
                        </span>
                      )}
                    </div>
                    <span style={{ fontFamily: "DM Sans, sans-serif",
                      fontSize: 11, color: muted }}>
                      {timeAgo(reply.createdAt)}
                    </span>
                  </div>
                  {(myUserId === reply.authorId || myUserId === creatorId) && !reply.deleted && (
                    <motion.button whileHover={{ scale: 1.1 }}
                      onClick={() => onDelete(reply.id)}
                      style={{ width: 24, height: 24, borderRadius: 6,
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer" }}>
                      <Trash2 size={10} color="#ef4444" />
                    </motion.button>
                  )}
                </div>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
                  color: reply.deleted ? muted : txt, margin: 0,
                  lineHeight: 1.7, whiteSpace: "pre-wrap",
                  fontStyle: reply.deleted ? "italic" : "normal" }}>
                  {reply.content}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main CommentsTab ──────────────────────────────────────────────────────────
export default function CommentsTab({ projectId, creatorId, isDark, myUserId }: Props) {
  const [page,     setPage]     = useState<PageResponse<ProjectCommentResponse> | null>(null);
  const [comments, setComments] = useState<ProjectCommentResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [postText, setPostText] = useState("");
  const [posting,  setPosting]  = useState(false);
  const [postErr,  setPostErr]  = useState<string | null>(null);
  const [pageNum,  setPageNum]  = useState(0);
  const [loadMore, setLoadMore] = useState(false);

  const txt    = isDark ? "#f0f0f0" : "#0a0a0a";
  const muted  = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr    = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card   = isDark ? "rgba(255,255,255,0.03)" : "#f6f6f4";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f8f6";
  const accent = "#ff5c00";

  const fetchComments = useCallback(async (pg: number, append: boolean) => {
    try {
      const data = await commentApi.getComments(projectId, pg, 20);
      setPage(data);
      setComments(prev => append ? [...prev, ...data.content] : data.content);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadMore(false);
    }
  }, [projectId]);

  useEffect(() => { fetchComments(0, false); }, [fetchComments]);

  async function handlePost() {
    if (!postText.trim()) return;
    setPosting(true);
    setPostErr(null);
    try {
      const newComment = await commentApi.postComment(projectId, {
        content: postText.trim(),
      });
      setPostText("");
      setComments(prev => [newComment, ...prev]);
    } catch (e: any) {
      setPostErr(e?.message ?? "Failed to post comment");
    } finally {
      setPosting(false);
    }
  }

  function handleDelete(commentId: number) {
    commentApi.deleteComment(projectId, commentId)
      .then(() => {
        setComments(prev => prev.map(c => {
          if (c.id === commentId) {
            return { ...c, content: "[deleted]", deleted: true };
          }
          return {
            ...c,
            replies: c.replies.map(r =>
              r.id === commentId ? { ...r, content: "[deleted]", deleted: true } : r
            ),
          };
        }));
      })
      .catch(() => {});
  }

  function handleReplyPosted(reply: ProjectCommentResponse, parentId: number) {
    setComments(prev => prev.map(c => {
      if (c.id !== parentId) return c;
      return {
        ...c,
        replies: [...c.replies, reply],
        replyCount: c.replyCount + 1,
      };
    }));
  }

  function handleLoadMore() {
    const next = pageNum + 1;
    setPageNum(next);
    setLoadMore(true);
    fetchComments(next, true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Post a comment */}
      {myUserId ? (
        <div style={{ padding: "20px", borderRadius: 18,
          background: card, border: `1px solid ${bdr}` }}>
          <p style={{ fontFamily: "DM Mono, monospace", fontSize: 10.5,
            color: muted, margin: "0 0 10px",
            letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Leave a comment
          </p>
          <textarea
            value={postText} onChange={e => setPostText(e.target.value)}
            placeholder="Ask the creator a question or share your thoughts…"
            rows={3} maxLength={2000}
            style={{ width: "100%", boxSizing: "border-box",
              padding: "12px 14px", borderRadius: 12,
              border: `1.5px solid ${bdr}`, background: inputBg,
              color: txt, fontFamily: "DM Sans, sans-serif",
              fontSize: 14, outline: "none", resize: "vertical",
              lineHeight: 1.65, marginBottom: 10 }}
            onFocus={e => (e.target.style.borderColor = `${accent}60`)}
            onBlur={e => (e.target.style.borderColor = bdr)}
            onKeyDown={e => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif",
              fontSize: 11.5, color: muted }}>
              {postText.length}/2000 · Ctrl+Enter to post
            </span>
            <motion.button whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePost}
              disabled={posting || !postText.trim()}
              style={{ padding: "9px 20px", borderRadius: 11,
                background: postText.trim()
                  ? `linear-gradient(135deg,${accent},#ff8c00)`
                  : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"),
                border: "none",
                color: postText.trim() ? "#fff" : muted,
                fontFamily: "Syne, sans-serif", fontWeight: 700,
                fontSize: 13.5, cursor: postText.trim() ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: 7 }}>
              {posting
                ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Posting…</>
                : <><Send size={14} /> Post</>
              }
            </motion.button>
          </div>
          {postErr && (
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12.5,
              color: "#ef4444", margin: "8px 0 0",
              display: "flex", alignItems: "center", gap: 5 }}>
              <AlertCircle size={13} /> {postErr}
            </p>
          )}
        </div>
      ) : (
        <div style={{ padding: "16px 20px", borderRadius: 16,
          background: card, border: `1px solid ${bdr}`,
          textAlign: "center" }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14,
            color: muted, margin: 0 }}>
            <a href="/login" style={{ color: accent, textDecoration: "none",
              fontWeight: 600 }}>Sign in</a> to join the conversation
          </p>
        </div>
      )}

      {/* Comment list */}
      {loading ? (
        [0,1,3].map(i => (
          <div key={`cskel-${i}`} style={{
            padding: "20px", borderRadius: 18,
            background: card, border: `1px solid ${bdr}`,
            animation: "pulse 1.5s ease-in-out infinite" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%",
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, width: "30%", borderRadius: 6, marginBottom: 6,
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
                <div style={{ height: 10, width: "15%", borderRadius: 6,
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
              </div>
            </div>
            <div style={{ height: 14, width: "90%", borderRadius: 6, marginBottom: 8,
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
            <div style={{ height: 14, width: "70%", borderRadius: 6,
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
          </div>
        ))
      ) : comments.length === 0 ? (
        <div style={{ padding: "48px 32px", borderRadius: 22,
          background: card, border: `1px solid ${bdr}`, textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 18,
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)",
            display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px" }}>
            <MessageSquare size={26} color="#818cf8" />
          </div>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700,
            fontSize: 16, color: txt, margin: "0 0 8px" }}>
            No comments yet
          </p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5,
            color: muted, margin: 0, lineHeight: 1.65 }}>
            Be the first to ask a question or leave a message for the creator!
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {comments.map((c, i) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <CommentCard
                  comment={c} projectId={projectId}
                  creatorId={creatorId} myUserId={myUserId}
                  isDark={isDark} onDelete={handleDelete}
                  onReplyPosted={handleReplyPosted}
                />
              </motion.div>
            ))}
          </div>

          {/* Load more */}
          {page && !page.last && (
            <motion.button whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadMore} disabled={loadMore}
              style={{ padding: "12px", borderRadius: 14,
                background: "transparent",
                border: `1.5px solid ${bdr}`, color: muted,
                fontFamily: "Syne, sans-serif", fontWeight: 600,
                fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8 }}>
              {loadMore
                ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Loading…</>
                : `Load more comments`
              }
            </motion.button>
          )}
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
