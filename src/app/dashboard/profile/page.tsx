"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile, calcCompletion, getBadge, COMPLETION_FIELDS } from "../layout";
import { profileApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

/* ── toast ── */
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  const colors = type === "success"
    ? { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", text: "#34d399", icon: "✓" }
    : { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", text: "#ef4444", icon: "✕" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 9999,
        padding: "12px 18px", borderRadius: 14, backdropFilter: "blur(20px)",
        background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text,
        fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: 13.5,
        display: "flex", alignItems: "center", gap: 10, maxWidth: 360,
        boxShadow: `0 8px 32px ${colors.border}`,
      }}
    >
      <span style={{
        width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${colors.text}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, flexShrink: 0
      }}>{colors.icon}</span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{
        background: "none", border: "none", cursor: "pointer",
        color: colors.text, padding: 0, fontSize: 18, opacity: 0.6, lineHeight: 1
      }}>×</button>
    </motion.div>
  );
}

/* ── image upload zone ── */
function UploadZone({ url, onFile, loading, shape, size, label }: {
  url: string; onFile: (f: File) => void; loading: boolean;
  shape: "circle" | "rect"; size: number; label: string;
}) {
  const { isDark } = useTheme();
  const ref = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);

  const handleFile = (f: File) => {
    const maxSize = 5 * 1024 * 1024;
    if (f.size > maxSize) {
      alert("File must be less than 5MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(f.type)) {
      alert("Only JPG, PNG, or WebP files allowed");
      return;
    }
    onFile(f);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      style={{
        position: "relative", width: shape === "circle" ? size : "100%", height: size,
        borderRadius: shape === "circle" ? 9999 : 16, cursor: "pointer", flexShrink: 0
      }}
      onClick={() => ref.current?.click()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />

      {url
        ? <motion.img
          src={url} alt={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            borderRadius: shape === "circle" ? 9999 : 16, display: "block"
          }} />
        : <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            width: "100%", height: "100%", borderRadius: shape === "circle" ? 9999 : 16,
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            border: `2px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 6
          }}
        >
          <span style={{ fontSize: 22 }}>📷</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>{label}</span>
        </motion.div>
      }

      <motion.div
        animate={{ opacity: hover || loading ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute", inset: 0, borderRadius: shape === "circle" ? 9999 : 16,
          background: "rgba(0,0,0,0.55)", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 6, pointerEvents: "none"
        }}
      >
        {loading
          ? <div style={{
            width: 22, height: 22, borderRadius: "50%",
            border: "2.5px solid rgba(255,255,255,0.8)", borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite"
          }} />
          : <>
            <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span style={{ fontSize: 10, color: "#fff", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Change</span>
          </>
        }
      </motion.div>

      {shape === "circle" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            position: "absolute", bottom: 2, right: 2, width: 22, height: 22, borderRadius: "50%",
            background: "linear-gradient(135deg,#ff6b00,#ffcc00)", border: "2px solid var(--bg)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >
          <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── section wrapper ── */
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        borderRadius: 20, overflow: "hidden", marginBottom: 16,
        background: isDark
          ? "linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))"
          : "linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,255,255,0.8))",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)",
        boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.05)" : "0 2px 16px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{
        padding: "14px 20px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.04)",
        display: "flex", alignItems: "center", gap: 10,
        background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
          background: "linear-gradient(90deg,transparent,rgba(255,140,0,0.4),transparent)"
        }} />
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{
          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "var(--text)"
        }}>{title}</span>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </motion.div>
  );
}

/* ── field ── */
function Field({
  label, value, onChange, placeholder, type = "text", maxLength, hint, disabled, rows, error
}: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string;
  type?: string; maxLength?: number; hint?: string; disabled?: boolean; rows?: number; error?: string;
}) {
  const { isDark } = useTheme();
  const hasError = !!error;

  const base: React.CSSProperties = {
    width: "100%", padding: "10px 13px", borderRadius: 11, boxSizing: "border-box",
    border: hasError
      ? "1px solid #ef4444"
      : isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
    background: disabled
      ? isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
      : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.025)",
    color: disabled ? "var(--text-muted)" : "var(--text)",
    fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s", resize: "none" as any,
    cursor: disabled ? "not-allowed" : "text",
  };

  return (
    <div>
      <label style={{
        display: "block", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11.5,
        color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase"
      }}>{label}</label>

      {rows
        ? <motion.textarea
          value={value} maxLength={maxLength} disabled={disabled} placeholder={placeholder} rows={rows}
          onChange={e => onChange?.(e.target.value)}
          whileFocus={{ scale: 1.01 }}
          style={{ ...base, lineHeight: 1.6 }}
          onFocus={e => {
            if (!disabled) {
              e.currentTarget.style.borderColor = hasError ? "#ef4444" : "var(--accent)";
              e.currentTarget.style.boxShadow = hasError ? "0 0 0 3px rgba(239,68,68,0.1)" : "0 0 0 3px rgba(255,107,0,0.1)";
            }
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = hasError ? "#ef4444" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        : <motion.input
          type={type} value={value} maxLength={maxLength} disabled={disabled} placeholder={placeholder}
          onChange={e => onChange?.(e.target.value)}
          whileFocus={{ scale: 1.01 }}
          style={base}
          onFocus={e => {
            if (!disabled) {
              e.currentTarget.style.borderColor = hasError ? "#ef4444" : "var(--accent)";
              e.currentTarget.style.boxShadow = hasError ? "0 0 0 3px rgba(239,68,68,0.1)" : "0 0 0 3px rgba(255,107,0,0.1)";
            }
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = hasError ? "#ef4444" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      }

      {error && (
        <p style={{
          fontSize: 11.5, color: "#ef4444", fontFamily: "DM Sans, sans-serif",
          margin: "4px 0 0"
        }}>✕ {error}</p>
      )}

      {hint && !error && (
        <p style={{
          fontSize: 11.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif",
          margin: "4px 0 0"
        }}>{hint}</p>
      )}

      {maxLength && value.length > 0 && (
        <p style={{
          fontSize: 11, color: value.length > maxLength * 0.9 ? "#f59e0b" : "var(--text-muted)",
          fontFamily: "DM Sans, sans-serif", margin: "3px 0 0", textAlign: "right"
        }}>
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

/* ── categories ── */
const CATEGORIES = ["Technology", "Art", "Music", "Film", "Food", "Games", "Fashion", "Education", "Environment", "Health", "Sports", "Social", "Science", "Design", "Writing", "Photography"];

/* ── completion ring (small inline) ── */
function InlineRing({ pct, color, size = 52 }: { pct: number; color: string; size?: number }) {
  const r = (size - 5) / 2;
  const c = 2 * Math.PI * r;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} stroke="rgba(255,255,255,0.07)" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} stroke={color}
          strokeDasharray={c} strokeLinecap="round"
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 11, color
        }}
      >{pct}</motion.span>
    </motion.div>
  );
}

/* ── skeleton loader ── */
function ProfileSkeleton() {
  const { isDark } = useTheme();
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 0 60px" }}>
      <div style={{ height: 180, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: 16, marginBottom: 60, animation: "pulse 2s ease-in-out infinite" }} />
      <div style={{ padding: "0 24px" }}>
        {Array(3).fill(0).map((_, i) => (
          <div key={i} style={{
            height: 200, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            borderRadius: 20, marginBottom: 16, animation: "pulse 2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`
          }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.6 } 50% { opacity: 1 } }`}</style>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading, refetch } = useProfile();
  const { isDark } = useTheme();

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAL] = useState(false);
  const [bannerLoading, setBL] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ HYDRATION FIX: Direct state update
  useEffect(() => {
    setMounted(true);
  }, []);

  const show = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const [bio, setBio] = useState("");
  const [about, setAbout] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState_] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  const [profession, setProfession] = useState("");
  const [org, setOrg] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    setBio(user.bio ?? "");
    setAbout(user.about ?? "");
    setGender(user.gender ?? "");
    setDob(user.dateOfBirth ?? "");
    setWebsite(user.websiteUrl ?? "");
    setLinkedin(user.linkedinUrl ?? "");
    setInstagram(user.instagramUrl ?? "");
    setTwitter(user.twitterUrl ?? "");
    setAddress(user.addressLine ?? "");
    setCity(user.city ?? "");
    setState_(user.state ?? "");
    setCountry(user.country ?? "");
    setPincode(user.pincode ?? "");
    setProfession(user.profession ?? "");
    setOrg(user.organization ?? "");
    setCats(user.interestedCategories ?? []);
  }, [user]);

  const draftUser = user ? {
    ...user, bio, about, gender, dateOfBirth: dob, websiteUrl: website,
    linkedinUrl: linkedin, instagramUrl: instagram, twitterUrl: twitter,
    city, profession, interestedCategories: cats
  } : null;

  const pct = draftUser ? calcCompletion(draftUser as any) : 0;
  const badge = getBadge(pct);

  const handleAvatar = async (file: File) => {
    setAL(true);
    try {
      await profileApi.uploadAvatar(file);
      await refetch();
      show("Avatar updated!", "success");
    } catch (e: any) {
      show(e.message ?? "Upload failed", "error");
    } finally {
      setAL(false);
    }
  };

  const handleBanner = async (file: File) => {
    setBL(true);
    try {
      await profileApi.uploadBanner(file);
      await refetch();
      show("Banner updated!", "success");
    } catch (e: any) {
      show(e.message ?? "Upload failed", "error");
    } finally {
      setBL(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (website && !/^https?:\/\//.test(website)) {
      errors.website = "Must start with http:// or https://";
    }
    if (linkedin && !/linkedin\.com/.test(linkedin)) {
      errors.linkedin = "Must be a valid LinkedIn URL";
    }
    if (pincode && !/^\d{6}$/.test(pincode)) {
      errors.pincode = "Must be 6 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const save = async () => {
    if (!validateForm()) {
      show("Please fix the errors below", "error");
      return;
    }

    setSaving(true);
    try {
      await profileApi.update({
        bio, about, gender, dateOfBirth: dob, websiteUrl: website,
        linkedinUrl: linkedin, instagramUrl: instagram, twitterUrl: twitter,
        addressLine: address, city, state, country, pincode,
        profession, organization: org, interestedCategories: cats
      });
      await refetch();
      show("Profile saved!", "success");
    } catch (e: any) {
      show(e.message ?? "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Don't render until mounted
  if (!mounted) return <ProfileSkeleton />;

  if (loading) return <ProfileSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        maxWidth: 860, margin: "0 auto", padding: "0 0 60px"
      }}
    >
      {/* banner + avatar hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ position: "relative", marginBottom: 60 }}
      >
        <UploadZone url={user?.bannerImageUrl ?? ""} onFile={handleBanner} loading={bannerLoading} shape="rect" size={180} label="Upload banner" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ position: "absolute", bottom: -40, left: 28, display: "flex", alignItems: "flex-end", gap: 16 }}
        >
          <div style={{
            borderRadius: "50%", border: `3px solid var(--bg)`,
            boxShadow: "0 0 0 2px rgba(255,107,0,0.4)", overflow: "visible", position: "relative"
          }}>
            <UploadZone url={user?.profileImageUrl ?? ""} onFile={handleAvatar} loading={avatarLoading} shape="circle" size={80} label="Photo" />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ paddingBottom: 8 }}
          >
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text)", margin: 0, lineHeight: 1 }}>
              {user?.name}
            </p>
            <p style={{
              fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: "3px 0 0"
            }}>@{user?.username}</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{ position: "absolute", bottom: -38, right: 24, display: "flex", alignItems: "center", gap: 10 }}
        >
          <InlineRing pct={pct} color={badge.color} />
          <div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: badge.color, margin: 0 }}>
              {pct}% complete
            </p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "var(--text-muted)", margin: "1px 0 0" }}>
              {badge.emoji} {badge.label}
            </p>
          </div>
        </motion.div>
      </motion.div>

      <div style={{ padding: "0 24px" }}>
        {/* completion chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}
        >
          {COMPLETION_FIELDS.map((f, idx) => {
            const done = draftUser ? f.check(draftUser as any) : false;
            return (
              <motion.span
                key={f.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px",
                  borderRadius: 999, fontSize: 11, fontFamily: "DM Sans, sans-serif",
                  background: done ? "rgba(52,211,153,0.08)" : "rgba(255,136,0,0.08)",
                  border: done ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(255,136,0,0.2)",
                  color: done ? "#34d399" : "#ff8800",
                  transition: "all 0.2s"
                }}
              >
                {done ? "✓" : "+" + f.weight + "%"} {f.label}
              </motion.span>
            );
          })}
        </motion.div>

        {/* basic info */}
        <Section title="Basic Info" icon="👤">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="form-grid">
            <Field label="Full name" value={user?.name ?? ""} disabled hint="Contact support to change name" />
            <Field label="Username" value={"@" + (user?.username ?? "")} disabled hint="Cannot be changed" />
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Bio" value={bio} onChange={setBio} placeholder="A short line about yourself" maxLength={160} rows={2} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <Field
                label="About me" value={about} onChange={setAbout}
                placeholder="Tell creators and backers about you…" maxLength={1000} rows={4}
              />
            </div>
            <div>
              <label style={{
                display: "block", fontFamily: "DM Sans, sans-serif", fontWeight: 600,
                fontSize: 11.5, color: "var(--text-muted)", marginBottom: 6,
                letterSpacing: "0.06em", textTransform: "uppercase"
              }}>Gender</label>
              <motion.select
                value={gender} onChange={e => setGender(e.target.value)}
                whileFocus={{ scale: 1.01 }}
                style={{
                  width: "100%", padding: "10px 13px", borderRadius: 11,
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.025)",
                  color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s", cursor: "pointer"
                }}
              >
                <option value="">Select gender</option>
                {["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"].map(g => (
                  <option key={g} value={g}>{g.replace(/_/g, " ")}</option>
                ))}
              </motion.select>
            </div>
            <Field label="Date of birth" value={dob} onChange={setDob} type="date" />
          </div>
        </Section>

        {/* social links */}
        <Section title="Social Links" icon="🔗">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="form-grid">
            <Field
              label="Website" value={website} onChange={setWebsite}
              placeholder="https://yoursite.com" error={formErrors.website}
            />
            <Field
              label="LinkedIn" value={linkedin} onChange={setLinkedin}
              placeholder="linkedin.com/in/you" error={formErrors.linkedin}
            />
            <Field label="Instagram" value={instagram} onChange={setInstagram} placeholder="@yourhandle" />
            <Field label="Twitter / X" value={twitter} onChange={setTwitter} placeholder="@yourhandle" />
          </div>
        </Section>

        {/* location */}
        <Section title="Location" icon="📍">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="form-grid">
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Address" value={address} onChange={setAddress} placeholder="Street address" />
            </div>
            <Field label="City" value={city} onChange={setCity} placeholder="Mumbai" />
            <Field label="State" value={state} onChange={setState_} placeholder="Maharashtra" />
            <Field label="Country" value={country} onChange={setCountry} placeholder="India" />
            <Field
              label="Pincode" value={pincode} onChange={setPincode}
              placeholder="400001" maxLength={6} error={formErrors.pincode}
            />
          </div>
        </Section>

        {/* professional */}
        <Section title="Professional" icon="💼">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="form-grid">
            <Field label="Profession" value={profession} onChange={setProfession} placeholder="Designer, Engineer…" />
            <Field label="Organization" value={org} onChange={setOrg} placeholder="Company or institution" />
          </div>
        </Section>

        {/* interests */}
        <Section title="Interests" icon="🎯">
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "var(--text-muted)", margin: "0 0 14px" }}>
            Select categories you care about.
          </p>
          <motion.div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map((cat, idx) => {
              const sel = cats.includes(cat);
              return (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCats(p => sel ? p.filter(c => c !== cat) : [...p, cat])}
                  style={{
                    padding: "7px 14px", borderRadius: 999, fontFamily: "DM Sans, sans-serif",
                    fontSize: 13, fontWeight: sel ? 600 : 400, cursor: "pointer",
                    background: sel
                      ? "linear-gradient(135deg,rgba(255,107,0,0.15),rgba(255,204,0,0.1))"
                      : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    border: sel
                      ? "1px solid rgba(255,107,0,0.4)"
                      : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
                    color: sel ? "#ff8800" : "var(--text)", transition: "all 0.15s",
                    boxShadow: sel ? "0 0 12px rgba(255,107,0,0.2)" : "none",
                  }}
                >
                  {sel ? "✓ " : ""}{cat}
                </motion.button>
              );
            })}
          </motion.div>
        </Section>

        {/* save button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}
        >
          <motion.button
            onClick={save}
            disabled={saving}
            whileHover={!saving ? { scale: 1.05 } : {}}
            whileTap={!saving ? { scale: 0.95 } : {}}
            style={{
              padding: "12px 32px", borderRadius: 14, border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff",
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
              boxShadow: "0 0 24px rgba(255,100,0,0.4)", position: "relative",
              overflow: "hidden", opacity: saving ? 0.7 : 1, transition: "all 0.18s",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <span style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.25) 50%,transparent 70%)",
              animation: "shimmer 2.4s ease-in-out infinite"
            }} />
            {saving
              ? <>
                <div style={{
                  width: 14, height: 14, borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.7)", borderTopColor: "#fff",
                  animation: "spin 0.7s linear infinite"
                }} />
                <span style={{ position: "relative" }}>Saving…</span>
              </>
              : <span style={{ position: "relative" }}>Save changes →</span>
            }
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { transform: translateX(-100%) } 60% { transform: translateX(200%) } 100% { transform: translateX(200%) } }
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes pulse { 0%, 100% { opacity: 0.6 } 50% { opacity: 1 } }
        @media(max-width:600px){ .form-grid { grid-template-columns: 1fr !important } }
      `}</style>
    </motion.div>
  );
}