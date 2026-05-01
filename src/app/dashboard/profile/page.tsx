"use client";
import { useState, useRef, useEffect, useCallback, useId, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "@/contexts/ProfileContext";
import { calcCompletion, getBadge, COMPLETION_FIELDS, type UserProfile } from "@/lib/profile";
import { profileApi } from "@/lib/api";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcUser = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IcLink = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);
const IcPin = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IcBriefcase = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
  </svg>
);
const IcTarget = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IcCamera = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const IcPlus = ({ s = 10 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcImage = ({ s = 22 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);
const IcCheck = ({ s = 11 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcSave = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  const c = type === "success"
    ? { bg: "rgba(52,211,153,0.12)", bdr: "rgba(52,211,153,0.3)", text: "#34d399" }
    : { bg: "rgba(239,68,68,0.12)", bdr: "rgba(239,68,68,0.3)", text: "#ef4444" };
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      role="alert"
      style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, padding: "14px 20px", borderRadius: 16, backdropFilter: "blur(20px)", background: c.bg, border: `1px solid ${c.bdr}`, color: c.text, fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: 13.5, display: "flex", alignItems: "center", gap: 12, maxWidth: 380, boxShadow: `0 12px 40px rgba(0,0,0,0.2)` }}
    >
      <span style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${c.text}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {type === "success" ? <IcCheck s={10} /> : "✕"}
      </span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: c.text, padding: 0, fontSize: 18, opacity: 0.6, lineHeight: 1 }}>×</button>
    </motion.div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ previewUrl, onFile, onError, loading, shape, height, label }: {
  previewUrl: string; onFile: (f: File) => void; onError: (msg: string) => void;
  loading: boolean; shape: "circle" | "rect"; height: number; label: string;
}) {
  const { isDark } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const radius = shape === "circle" ? 9999 : 20;

  const handleFile = useCallback((f: File) => {
    if (f.size > 5 * 1024 * 1024) { onError("File must be less than 5MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { onError("Only JPG, PNG or WebP"); return; }
    onFile(f);
  }, [onFile, onError]);

  return (
    <div
      role="button" tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
      style={{ position: "relative", width: shape === "circle" ? height : "100%", height, borderRadius: radius, cursor: loading ? "wait" : "pointer", flexShrink: 0 }}
      className="prof-upload"
    >
      <input ref={inputRef} id={id} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }}
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }} />
      {previewUrl ? (
        <img src={previewUrl} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: radius, display: "block" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", borderRadius: radius, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `2px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
          {shape === "circle" ? <IcUser s={28} /> : <IcImage s={30} />}
          <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}>{label}</span>
        </div>
      )}
      <div className="prof-upload-overlay" style={{ position: "absolute", inset: 0, borderRadius: radius, background: "rgba(0,0,0,0.55)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, opacity: loading ? 1 : undefined, pointerEvents: "none" }}>
        {loading ? <div className="prof-spin" /> : (<><IcCamera s={20} /><span style={{ fontSize: 10.5, color: "#fff", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Change</span></>)}
      </div>
      {shape === "circle" && (
        <div style={{ position: "absolute", bottom: 2, right: 2, width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", border: "2.5px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(255,107,0,0.4)" }}>
          <IcPlus s={9} />
        </div>
      )}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children, isDark }: { title: string; icon: React.ReactNode; children: React.ReactNode; isDark: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ borderRadius: 22, overflow: "hidden", marginBottom: 18, background: isDark ? "rgba(255,255,255,0.03)" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`, boxShadow: isDark ? "none" : "0 2px 20px rgba(0,0,0,0.04)" }}
    >
      <div style={{ padding: "16px 22px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`, background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,136,0,0.45),transparent)" }} />
        <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,136,0,0.1)", border: "1px solid rgba(255,136,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8800" }}>{icon}</div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: 0 }}>{title}</h2>
      </div>
      <div style={{ padding: 22 }}>{children}</div>
    </motion.div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text", maxLength, hint, disabled, rows, error }: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string;
  type?: string; maxLength?: number; hint?: string; disabled?: boolean; rows?: number; error?: string;
}) {
  const { isDark } = useTheme();
  const fid = useId();
  const hasErr = !!error;
  const base: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 12, boxSizing: "border-box",
    fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", resize: "none" as const, lineHeight: 1.6,
    border: `1px solid ${hasErr ? "#ef4444" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
    background: disabled ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)") : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.025)"),
    color: disabled ? "var(--text-muted)" : "var(--text)",
    cursor: disabled ? "not-allowed" : "text",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };
  return (
    <div>
      <label htmlFor={fid} style={{ display: "block", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", marginBottom: 7, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</label>
      {rows
        ? <textarea id={fid} value={value} rows={rows} maxLength={maxLength} disabled={disabled} placeholder={placeholder} onChange={e => onChange?.(e.target.value)} style={base}
            onFocus={e => { if (!disabled) { e.currentTarget.style.borderColor = "rgba(255,107,0,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,0,0.08)"; }}}
            onBlur={e => { e.currentTarget.style.borderColor = hasErr ? "#ef4444" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        : <input id={fid} type={type} value={value} maxLength={maxLength} disabled={disabled} placeholder={placeholder} onChange={e => onChange?.(e.target.value)} style={base}
            onFocus={e => { if (!disabled) { e.currentTarget.style.borderColor = "rgba(255,107,0,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,0,0.08)"; }}}
            onBlur={e => { e.currentTarget.style.borderColor = hasErr ? "#ef4444" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
          />
      }
      {hasErr && <p role="alert" style={{ fontSize: 11.5, color: "#ef4444", fontFamily: "DM Sans, sans-serif", margin: "5px 0 0" }}>✕ {error}</p>}
      {hint && !hasErr && <p style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", margin: "5px 0 0" }}>{hint}</p>}
      {maxLength != null && value.length > 0 && (
        <p style={{ fontSize: 11, fontFamily: "DM Sans, sans-serif", margin: "4px 0 0", textAlign: "right", color: value.length > maxLength * 0.9 ? "#f59e0b" : "var(--text-muted)" }}>{value.length}/{maxLength}</p>
      )}
    </div>
  );
}

const CATS = ["Technology","Art","Music","Film","Food","Games","Fashion","Education","Environment","Health","Sports","Social","Science","Design","Writing","Photography"];
const GENDERS = [{ value: "", label: "Select gender" }, { value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }, { value: "OTHER", label: "Other" }, { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" }];

// ─── Completion Ring ──────────────────────────────────────────────────────────
function CompletionRing({ pct, color }: { pct: number; color: string }) {
  const { isDark } = useTheme();
  const size = 60; const r = (size - 6) / 2; const c = 2 * Math.PI * r;
  const track = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5} stroke={track} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5} stroke={color} strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 11, color }}>{pct}</span>
    </div>
  );
}

function ProfileSkeleton() {
  const { isDark } = useTheme();
  const b = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 0 60px" }}>
      <div style={{ height: 200, background: b, borderRadius: 22, marginBottom: 68, animation: "pfpulse 2s ease-in-out infinite" }} />
      <div style={{ padding: "0 28px" }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ height: 180, background: b, borderRadius: 22, marginBottom: 18, animation: "pfpulse 2s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <style>{`@keyframes pfpulse{0%,100%{opacity:.35}50%{opacity:.85}}`}</style>
    </div>
  );
}

function buildDraft(user: UserProfile, form: Record<string, any>): UserProfile {
  return { ...user, bio: form.bio, about: form.about, gender: form.gender as any, dateOfBirth: form.dob, websiteUrl: form.website, linkedinUrl: form.linkedin, instagramUrl: form.instagram, twitterUrl: form.twitter, city: form.city, profession: form.profession, interestedCategories: form.cats };
}

export default function ProfilePage() {
  const { user, loading, refetch } = useProfile();
  const { isDark } = useTheme();
  const genderSelId = useId();

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAL] = useState(false);
  const [bannerLoading, setBL] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

  useEffect(() => { setMounted(true); }, []);
  const show = useCallback((msg: string, type: "success" | "error") => setToast({ msg, type }), []);

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
  const [stateProv, setStateProv] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  const [profession, setProfession] = useState("");
  const [org, setOrg] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    setBio(user.bio ?? ""); setAbout(user.about ?? ""); setGender(user.gender ?? "");
    setDob(user.dateOfBirth ?? ""); setWebsite(user.websiteUrl ?? ""); setLinkedin(user.linkedinUrl ?? "");
    setInstagram(user.instagramUrl ?? ""); setTwitter(user.twitterUrl ?? ""); setAddress(user.addressLine ?? "");
    setCity(user.city ?? ""); setStateProv(user.state ?? ""); setCountry(user.country ?? "");
    setPincode(user.pincode ?? ""); setProfession(user.profession ?? ""); setOrg(user.organization ?? "");
    setCats(user.interestedCategories ?? []);
    setAvatarPreview(user.profileImageUrl ?? "");
    setBannerPreview(user.bannerImageUrl ?? "");
    setIsDirty(false);
  }, [user]);

  const track = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (val: T) => { setter(val); setIsDirty(true); }, []);
  const form = useMemo(() => ({ bio, about, gender, dob, website, linkedin, instagram, twitter, city, profession, cats }), [bio, about, gender, dob, website, linkedin, instagram, twitter, city, profession, cats]);
  const draft = useMemo(() => user ? buildDraft(user, form) : null, [user, form]);
  const pct = draft ? calcCompletion(draft) : 0;
  const badge = getBadge(pct);

  const handleAvatar = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview); setAL(true);
    try { await profileApi.uploadAvatar(file); await refetch(); show("Avatar updated!", "success"); }
    catch (e: any) { setAvatarPreview(user?.profileImageUrl ?? ""); show(e.message ?? "Upload failed", "error"); }
    finally { setAL(false); }
  }, [refetch, show, user?.profileImageUrl]);

  const handleBanner = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file);
    setBannerPreview(preview); setBL(true);
    try { await profileApi.uploadBanner(file); await refetch(); show("Banner updated!", "success"); }
    catch (e: any) { setBannerPreview(user?.bannerImageUrl ?? ""); show(e.message ?? "Upload failed", "error"); }
    finally { setBL(false); }
  }, [refetch, show, user?.bannerImageUrl]);

  const handleErr = useCallback((msg: string) => show(msg, "error"), [show]);

  const save = useCallback(async () => {
    const errors: Record<string, string> = {};
    if (website && !/^https?:\/\//.test(website)) errors.website = "Must start with http:// or https://";
    if (linkedin && !/linkedin\.com/.test(linkedin)) errors.linkedin = "Must be a valid LinkedIn URL";
    if (pincode && !/^\d{6}$/.test(pincode)) errors.pincode = "Must be 6 digits";
    if (Object.keys(errors).length > 0) { setFormErrors(errors); show("Please fix the errors below", "error"); return; }
    setSaving(true);
    try {
      await profileApi.update({ bio, about, gender: gender as any, dateOfBirth: dob, websiteUrl: website, linkedinUrl: linkedin, instagramUrl: instagram, twitterUrl: twitter, addressLine: address, city, state: stateProv, country, pincode, profession, organization: org, interestedCategories: cats });
      await refetch(); setIsDirty(false); show("Profile saved!", "success");
    } catch (e: any) {
      if (e.errors) setFormErrors(e.errors);
      show(e.message ?? "Save failed", "error");
    } finally { setSaving(false); }
  }, [bio, about, gender, dob, website, linkedin, instagram, twitter, address, city, stateProv, country, pincode, profession, org, cats, refetch, show]);

  useEffect(() => {
    if (!isDirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [isDirty]);

  if (!mounted || loading) return <ProfileSkeleton />;

  const bdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const txt = isDark ? "#fff" : "#0a0a0a";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const G2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ maxWidth: 880, margin: "0 auto", padding: "0 0 80px" }}
    >
      {/* ── Banner + Avatar ── */}
      <div style={{ position: "relative", marginBottom: 72 }}>
        <div style={{ position: "relative", borderRadius: "0 0 0 0", overflow: "hidden" }}>
          <UploadZone previewUrl={bannerPreview} onFile={handleBanner} onError={handleErr} loading={bannerLoading} shape="rect" height={200} label="Upload banner" />
          {/* Gradient overlay on banner */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)", pointerEvents: "none" }} />
          {bannerLoading && (
            <div style={{ position: "absolute", top: 12, right: 12, padding: "5px 12px", borderRadius: 8, background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 11.5, fontFamily: "DM Sans, sans-serif", backdropFilter: "blur(8px)" }}>Uploading…</div>
          )}
        </div>

        {/* Avatar */}
        <div style={{ position: "absolute", bottom: -50, left: 28, display: "flex", alignItems: "flex-end", gap: 16 }}>
          <div style={{ borderRadius: "50%", border: "3px solid var(--bg)", boxShadow: "0 0 0 2px rgba(255,107,0,0.45)", position: "relative" }}>
            <UploadZone previewUrl={avatarPreview} onFile={handleAvatar} onError={handleErr} loading={avatarLoading} shape="circle" height={88} label="Photo" />
          </div>
          <div style={{ paddingBottom: 8 }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: txt, margin: "0 0 2px", lineHeight: 1 }}>{user?.name}</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: muted, margin: 0 }}>@{user?.username}</p>
          </div>
        </div>

        {/* Completion ring */}
        <div style={{ position: "absolute", bottom: -48, right: 28, display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 14, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.95)", border: `1px solid ${bdr}`, boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.08)", backdropFilter: "blur(10px)" }}>
          <CompletionRing pct={pct} color={badge.color} />
          <div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12.5, color: badge.color, margin: "0 0 1px" }}>{pct}% complete</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11.5, color: muted, margin: 0 }}>{badge.emoji} {badge.label}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 28px" }}>
        {/* Completion chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 28 }} role="list" aria-label="Profile completion">
          {COMPLETION_FIELDS.map(f => {
            const done = draft ? f.check(draft) : false;
            return (
              <motion.span
                key={f.label} role="listitem"
                whileHover={{ scale: 1.03 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 999, fontSize: 11.5, fontFamily: "DM Sans, sans-serif", background: done ? "rgba(52,211,153,0.08)" : "rgba(255,136,0,0.08)", border: `1px solid ${done ? "rgba(52,211,153,0.25)" : "rgba(255,136,0,0.2)"}`, color: done ? "#34d399" : "#ff8800", cursor: "default" }}
              >
                {done ? <IcCheck s={9} /> : `+${f.weight}%`} {f.label}
              </motion.span>
            );
          })}
        </div>

        {/* ── Sections ── */}
        <SectionCard title="Basic Info" icon={<IcUser s={14} />} isDark={isDark}>
          <div style={G2} className="pfgrid">
            <Field label="Full name" value={user?.name ?? ""} disabled hint="Contact support to change" />
            <Field label="Username" value={"@" + (user?.username ?? "")} disabled hint="Cannot be changed" />
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Bio" value={bio} onChange={track(setBio)} placeholder="A short line about yourself" maxLength={160} rows={2} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="About me" value={about} onChange={track(setAbout)} placeholder="Tell creators and backers about you…" maxLength={1000} rows={4} />
            </div>
            <div>
              <label htmlFor={genderSelId} style={{ display: "block", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", marginBottom: 7, letterSpacing: "0.08em", textTransform: "uppercase" }}>Gender</label>
              <select id={genderSelId} value={gender} onChange={e => { setGender(e.target.value); setIsDirty(true); }}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, boxSizing: "border-box" as const, fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.025)", color: "var(--text)", cursor: "pointer", transition: "border-color 0.15s" }}>
                {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <Field label="Date of birth" value={dob} onChange={track(setDob)} type="date" />
          </div>
        </SectionCard>

        <SectionCard title="Social Links" icon={<IcLink s={14} />} isDark={isDark}>
          <div style={G2} className="pfgrid">
            <Field label="Website" value={website} onChange={track(setWebsite)} placeholder="https://yoursite.com" error={formErrors.website} />
            <Field label="LinkedIn" value={linkedin} onChange={track(setLinkedin)} placeholder="linkedin.com/in/you" error={formErrors.linkedin} />
            <Field label="Instagram" value={instagram} onChange={track(setInstagram)} placeholder="@yourhandle" />
            <Field label="Twitter / X" value={twitter} onChange={track(setTwitter)} placeholder="@yourhandle" />
          </div>
        </SectionCard>

        <SectionCard title="Location" icon={<IcPin s={14} />} isDark={isDark}>
          <div style={G2} className="pfgrid">
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Address" value={address} onChange={track(setAddress)} placeholder="Street address" />
            </div>
            <Field label="City" value={city} onChange={track(setCity)} placeholder="Mumbai" />
            <Field label="State" value={stateProv} onChange={track(setStateProv)} placeholder="Maharashtra" />
            <Field label="Country" value={country} onChange={track(setCountry)} placeholder="India" />
            <Field label="Pincode" value={pincode} onChange={track(setPincode)} placeholder="400001" maxLength={6} error={formErrors.pincode} />
          </div>
        </SectionCard>

        <SectionCard title="Professional" icon={<IcBriefcase s={14} />} isDark={isDark}>
          <div style={G2} className="pfgrid">
            <Field label="Profession" value={profession} onChange={track(setProfession)} placeholder="Designer, Engineer…" />
            <Field label="Organization" value={org} onChange={track(setOrg)} placeholder="Company or institution" />
          </div>
        </SectionCard>

        <SectionCard title="Interests" icon={<IcTarget s={14} />} isDark={isDark}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13.5, color: muted, margin: "0 0 16px" }}>Select categories you care about</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }} role="group">
            {CATS.map(cat => {
              const sel = cats.includes(cat);
              return (
                <motion.button
                  key={cat} type="button" aria-pressed={sel}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setCats(p => sel ? p.filter(c => c !== cat) : [...p, cat]); setIsDirty(true); }}
                  style={{ padding: "8px 16px", borderRadius: 999, fontFamily: "DM Sans, sans-serif", fontSize: 13, cursor: "pointer", transition: "all 0.15s", background: sel ? "linear-gradient(135deg,rgba(255,107,0,0.15),rgba(255,204,0,0.1))" : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"), border: `1px solid ${sel ? "rgba(255,107,0,0.4)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)")}`, color: sel ? "#ff8800" : "var(--text)", fontWeight: sel ? 600 : 400, boxShadow: sel ? "0 0 14px rgba(255,107,0,0.2)" : "none", display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  {sel && <IcCheck s={9} />}{cat}
                </motion.button>
              );
            })}
          </div>
        </SectionCard>

        {/* ── Save bar ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16, paddingTop: 6 }}>
          <AnimatePresence>
            {isDirty && (
              <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                style={{ fontSize: 12.5, color: "#f59e0b", fontFamily: "DM Sans, sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                Unsaved changes
              </motion.span>
            )}
          </AnimatePresence>
          <motion.button
            type="button" onClick={save} disabled={saving}
            whileHover={!saving ? { scale: 1.02 } : {}} whileTap={!saving ? { scale: 0.98 } : {}}
            style={{ padding: "13px 30px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#ff6b00,#ffcc00)", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, boxShadow: saving ? "none" : "0 0 28px rgba(255,100,0,0.35)", position: "relative", overflow: "hidden", transition: "opacity 0.18s, box-shadow 0.18s", display: "flex", alignItems: "center", gap: 9, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
          >
            <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)", animation: "pfshimmer 2.4s ease-in-out infinite" }} />
            {saving ? <span className="prof-spin-sm" /> : <IcSave s={14} />}
            <span style={{ position: "relative" }}>{saving ? "Saving…" : "Save changes"}</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <style>{`
        @keyframes pfshimmer{0%{transform:translateX(-100%)}60%{transform:translateX(200%)}100%{transform:translateX(200%)}}
        @keyframes pfpulse{0%,100%{opacity:.35}50%{opacity:.85}}
        @keyframes pfspin{to{transform:rotate(360deg)}}
        .prof-spin{width:24px;height:24px;border-radius:50%;border:2.5px solid rgba(255,255,255,0.3);border-top-color:#fff;animation:pfspin .7s linear infinite}
        .prof-spin-sm{width:15px;height:15px;border-radius:50%;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;animation:pfspin .7s linear infinite;position:relative;flex-shrink:0}
        .prof-upload-overlay{opacity:0;transition:opacity .2s}
        .prof-upload:hover .prof-upload-overlay,.prof-upload:focus-visible .prof-upload-overlay{opacity:1}
        .prof-upload:focus-visible{outline:2px solid #ff6b00;outline-offset:3px}
        @media(max-width:640px){.pfgrid{grid-template-columns:1fr!important}}
      `}</style>
    </motion.div>
  );
}
