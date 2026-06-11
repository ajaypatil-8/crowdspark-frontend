// src/components/dashboard/MilestonesManager.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, CheckCircle2, RotateCcw,
  Loader2, AlertCircle, Target, Flag, Save, X,
} from "lucide-react";
import { milestoneApi, type MilestoneResponse } from "@/lib/api";

interface Props {
  projectId: number;
  isDark:    boolean;
  goalAmount?: number;
}

interface FormState {
  title:        string;
  description:  string;
  targetAmount: string;
}

const EMPTY: FormState = { title: "", description: "", targetAmount: "" };

function fmt(v: number) {
  if (v >= 100_000) return `₹${(v / 100_000).toFixed(1)}L`;
  if (v >= 1_000)   return `₹${(v / 1_000).toFixed(0)}K`;
  return `₹${v.toLocaleString("en-IN")}`;
}

// ── Inline form ───────────────────────────────────────────────────────────────
function MilestoneForm({
  initial, onSave, onCancel, isDark, saving, error,
}: {
  initial?:  FormState;
  onSave:    (f: FormState) => void;
  onCancel:  () => void;
  isDark:    boolean;
  saving:    boolean;
  error:     string | null;
}) {
  const [form, setForm] = useState<FormState>(initial ?? EMPTY);
  const txt     = isDark ? "#f0f0f0"                : "#0a0a0a";
  const muted   = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr     = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f8f6";

  const field = (label: string, key: keyof FormState, opts?: {
    placeholder?: string; type?: string; required?: boolean;
  }) => (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: muted,
                      textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}{opts?.required && " *"}
      </label>
      <input
        type={opts?.type ?? "text"}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={opts?.placeholder}
        style={{
          width: "100%", marginTop: 4,
          background: inputBg, border: `1px solid ${bdr}`,
          borderRadius: 8, padding: "8px 12px", color: txt,
          fontSize: 14, outline: "none", boxSizing: "border-box",
        }}
      />
    </div>
  );

  return (
    <div style={{
      border: `1px solid rgba(255,92,0,0.25)`, borderRadius: 12,
      padding: "16px 18px", marginBottom: 12,
      background: isDark ? "rgba(255,92,0,0.04)" : "rgba(255,92,0,0.02)",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {field("Title", "title", { placeholder: "e.g. First 100 backers unlocked", required: true })}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: muted,
                          textTransform: "uppercase", letterSpacing: 0.5 }}>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="What does this milestone mean for the project?"
            rows={2}
            style={{
              width: "100%", marginTop: 4,
              background: inputBg, border: `1px solid ${bdr}`,
              borderRadius: 8, padding: "8px 12px", color: txt,
              fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box",
            }}
          />
        </div>
        {field("Target Amount (₹, optional)", "targetAmount", {
          placeholder: "e.g. 500000", type: "number",
        })}
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 6,
                      color: "#ef4444", fontSize: 12, marginTop: 10 }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.title.trim()}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: form.title.trim() ? "#ff5c00" : (isDark ? "#333" : "#e5e5e5"),
            color: form.title.trim() ? "#fff" : muted,
            border: "none", borderRadius: 8, padding: "7px 16px",
            cursor: form.title.trim() && !saving ? "pointer" : "not-allowed",
            fontSize: 13, fontWeight: 600,
          }}
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save
        </button>
        <button onClick={onCancel} style={{
          background: "transparent", color: muted,
          border: `1px solid ${bdr}`, borderRadius: 8,
          padding: "7px 14px", cursor: "pointer", fontSize: 13,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MilestonesManager({ projectId, isDark, goalAmount }: Props) {
  const [milestones,  setMilestones]  = useState<MilestoneResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [busy,        setBusy]        = useState<number | null>(null); // id of milestone being actioned

  const txt   = isDark ? "#f0f0f0"                : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const bdr   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const card  = isDark ? "#111"                   : "#fff";

  useEffect(() => {
    milestoneApi.getAll(projectId)
      .then(setMilestones)
      .catch(() => setError("Failed to load milestones"))
      .finally(() => setLoading(false));
  }, [projectId]);

  // ── handlers ────────────────────────────────────────────────────────────

  async function handleAdd(form: { title: string; description: string; targetAmount: string }) {
    if (!form.title.trim()) return;
    setSaving(true); setActionError(null);
    try {
      const created = await milestoneApi.create(projectId, {
        title:        form.title.trim(),
        description:  form.description.trim() || undefined,
        targetAmount: form.targetAmount ? Number(form.targetAmount) : undefined,
      });
      setMilestones(p => [...p, created]);
      setShowAdd(false);
    } catch (e: any) {
      setActionError(e?.message ?? "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(
    id: number,
    form: { title: string; description: string; targetAmount: string },
  ) {
    setSaving(true); setActionError(null);
    try {
      const updated = await milestoneApi.update(projectId, id, {
        title:        form.title.trim(),
        description:  form.description.trim() || undefined,
        targetAmount: form.targetAmount ? Number(form.targetAmount) : undefined,
      });
      setMilestones(p => p.map(m => m.id === id ? updated : m));
      setEditingId(null);
    } catch (e: any) {
      setActionError(e?.message ?? "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this milestone?")) return;
    setBusy(id);
    try {
      await milestoneApi.delete(projectId, id);
      setMilestones(p => p.filter(m => m.id !== id));
    } catch {
      setActionError("Failed to delete");
    } finally {
      setBusy(null);
    }
  }

  async function handleComplete(id: number) {
    setBusy(id);
    try {
      const updated = await milestoneApi.complete(projectId, id);
      setMilestones(p => p.map(m => m.id === id ? updated : m));
    } catch {
      setActionError("Failed to mark complete");
    } finally {
      setBusy(null);
    }
  }

  async function handleReopen(id: number) {
    setBusy(id);
    try {
      const updated = await milestoneApi.reopen(projectId, id);
      setMilestones(p => p.map(m => m.id === id ? updated : m));
    } catch {
      setActionError("Failed to reopen");
    } finally {
      setBusy(null);
    }
  }

  // ── render ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
      <Loader2 size={20} style={{ color: muted, animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (error) return (
    <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
  );

  const completed = milestones.filter(m => m.status === "COMPLETED").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center",
                    justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: txt }}>
            Project Milestones
          </div>
          <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>
            {milestones.length} total · {completed} completed
          </div>
        </div>
        {!showAdd && milestones.length < 20 && (
          <button
            onClick={() => { setShowAdd(true); setActionError(null); }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#ff5c00", color: "#fff",
              border: "none", borderRadius: 8, padding: "8px 14px",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}
          >
            <Plus size={14} /> Add Milestone
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <MilestoneForm
          onSave={handleAdd}
          onCancel={() => { setShowAdd(false); setActionError(null); }}
          isDark={isDark}
          saving={saving}
          error={actionError}
        />
      )}

      {/* Global error */}
      {actionError && !showAdd && editingId === null && (
        <div style={{ display: "flex", alignItems: "center", gap: 6,
                      color: "#ef4444", fontSize: 12, marginBottom: 12 }}>
          <AlertCircle size={12} /> {actionError}
        </div>
      )}

      {/* List */}
      <AnimatePresence mode="popLayout">
        {milestones.length === 0 && !showAdd ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "32px 0",
                     color: muted, fontSize: 14 }}
          >
            <Flag size={28} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
            No milestones yet. Add one to keep backers informed.
          </motion.div>
        ) : (
          milestones.map((m, i) => {
            const done    = m.status === "COMPLETED";
            const editing = editingId === m.id;
            const isBusy  = busy === m.id;

            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
              >
                {editing ? (
                  <MilestoneForm
                    initial={{
                      title:        m.title,
                      description:  m.description ?? "",
                      targetAmount: m.targetAmount?.toString() ?? "",
                    }}
                    onSave={form => handleEdit(m.id, form)}
                    onCancel={() => { setEditingId(null); setActionError(null); }}
                    isDark={isDark}
                    saving={saving}
                    error={actionError}
                  />
                ) : (
                  <div style={{
                    background: card, border: `1px solid ${bdr}`, borderRadius: 12,
                    padding: "14px 16px", marginBottom: 10,
                    opacity: done ? 0.85 : 1,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      {/* Status dot */}
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                        background: done
                          ? "linear-gradient(135deg,#ff5c00,#ff9000)"
                          : (isDark ? "#1e1e1e" : "#f5f5f3"),
                        border: done ? "none" : `2px solid ${bdr}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {done
                          ? <CheckCircle2 size={12} color="#fff" />
                          : <span style={{ width: 6, height: 6, borderRadius: "50%",
                                           background: muted, display: "block" }} />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center",
                                      gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: txt }}>
                            {m.title}
                          </span>
                          {m.targetAmount != null && (
                            <span style={{
                              display: "flex", alignItems: "center", gap: 3,
                              fontSize: 11, color: "#f59e0b", fontWeight: 600,
                              background: "rgba(245,158,11,0.12)",
                              padding: "2px 7px", borderRadius: 20,
                            }}>
                              <Target size={9} /> {fmt(m.targetAmount)}
                            </span>
                          )}
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
                            background: done ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.12)",
                            color:      done ? "#22c55e"               : muted,
                          }}>
                            {done ? "Completed" : "Pending"}
                          </span>
                        </div>

                        {m.description && (
                          <p style={{ fontSize: 13, color: muted,
                                      margin: "4px 0 0", lineHeight: 1.5 }}>
                            {m.description}
                          </p>
                        )}

                        {done && m.completedAt && (
                          <p style={{ fontSize: 11, color: "#22c55e", marginTop: 4 }}>
                            ✓ Completed {new Date(m.completedAt).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        {/* Edit */}
                        <button
                          onClick={() => { setEditingId(m.id); setActionError(null); }}
                          disabled={isBusy}
                          title="Edit"
                          style={{
                            background: "none", border: `1px solid ${bdr}`, borderRadius: 7,
                            color: muted, padding: "5px 7px", cursor: "pointer", lineHeight: 0,
                          }}
                        >
                          <Pencil size={13} />
                        </button>

                        {/* Complete / Reopen */}
                        {!done ? (
                          <button
                            onClick={() => handleComplete(m.id)}
                            disabled={isBusy}
                            title="Mark complete"
                            style={{
                              background: "none", border: `1px solid rgba(34,197,94,0.35)`,
                              borderRadius: 7, color: "#22c55e",
                              padding: "5px 7px", cursor: isBusy ? "wait" : "pointer",
                              lineHeight: 0,
                            }}
                          >
                            {isBusy
                              ? <Loader2 size={13} className="animate-spin" />
                              : <CheckCircle2 size={13} />}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReopen(m.id)}
                            disabled={isBusy}
                            title="Reopen"
                            style={{
                              background: "none", border: `1px solid ${bdr}`,
                              borderRadius: 7, color: muted,
                              padding: "5px 7px", cursor: isBusy ? "wait" : "pointer",
                              lineHeight: 0,
                            }}
                          >
                            {isBusy
                              ? <Loader2 size={13} className="animate-spin" />
                              : <RotateCcw size={13} />}
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(m.id)}
                          disabled={isBusy}
                          title="Delete"
                          style={{
                            background: "none", border: `1px solid rgba(239,68,68,0.25)`,
                            borderRadius: 7, color: "#ef4444",
                            padding: "5px 7px", cursor: isBusy ? "wait" : "pointer",
                            lineHeight: 0,
                          }}
                        >
                          {isBusy
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Trash2 size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </AnimatePresence>

      {milestones.length >= 20 && (
        <p style={{ fontSize: 12, color: muted, textAlign: "center", marginTop: 8 }}>
          Maximum 20 milestones reached.
        </p>
      )}
    </div>
  );
}
