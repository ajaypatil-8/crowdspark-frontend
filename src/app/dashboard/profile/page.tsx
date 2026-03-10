"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  useMemo,
} from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useProfile,
  calcCompletion,
  getBadge,
  COMPLETION_FIELDS,
  type UserProfile,
} from "../layout";
import { profileApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════ */
function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  const colors =
    type === "success"
      ? {
          bg: "rgba(52,211,153,0.12)",
          border: "rgba(52,211,153,0.3)",
          text: "#34d399",
          icon: "✓",
        }
      : {
          bg: "rgba(239,68,68,0.12)",
          border: "rgba(239,68,68,0.3)",
          text: "#ef4444",
          icon: "✕",
        };

  /* auto-dismiss with proper cleanup */
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      role="alert"
      aria-live="assertive"
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 9999,
        padding: "12px 18px",
        borderRadius: 14,
        backdropFilter: "blur(20px)",
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontFamily: "DM Sans, sans-serif",
        fontWeight: 500,
        fontSize: 13.5,
        display: "flex",
        alignItems: "center",
        gap: 10,
        maxWidth: 360,
        boxShadow: `0 8px 32px ${colors.border}`,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: `1.5px solid ${colors.text}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          flexShrink: 0,
        }}
      >
        {colors.icon}
      </span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: colors.text,
          padding: 0,
          fontSize: 18,
          opacity: 0.6,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   IMAGE UPLOAD ZONE
══════════════════════════════════════════════════════════════ */
function UploadZone({
  url,
  onFile,
  onError,
  loading,
  shape,
  size,
  label,
}: {
  url: string;
  onFile: (f: File) => void;
  onError: (msg: string) => void;
  loading: boolean;
  shape: "circle" | "rect";
  size: number;
  label: string;
}) {
  const { isDark } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadId = useId();
  const radius = shape === "circle" ? 9999 : 16;

  const handleFile = useCallback(
    (f: File) => {
      const maxSize = 5 * 1024 * 1024;
      if (f.size > maxSize) {
        onError("File must be less than 5MB");
        return;
      }
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(f.type)) {
        onError("Only JPG, PNG, or WebP files allowed");
        return;
      }
      onFile(f);
    },
    [onFile, onError]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        handleFile(e.target.files[0]);
      }
      // Reset input so re-selecting the same file triggers onChange
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      role="button"
      tabIndex={0}
      aria-label={url ? `Change ${label}` : `Upload ${label}`}
      aria-describedby={`${uploadId}-hint`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="profile-upload-zone"
      style={{
        position: "relative",
        width: shape === "circle" ? size : "100%",
        height: size,
        borderRadius: radius,
        cursor: loading ? "wait" : "pointer",
        flexShrink: 0,
      }}
    >
      <span id={`${uploadId}-hint`} className="sr-only">
        Accepted formats: JPG, PNG, WebP. Max 5MB.
      </span>
      <input
        ref={inputRef}
        id={uploadId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {url ? (
        <img
          src={url}
          alt={label}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: radius,
            display: "block",
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            width: "100%",
            height: "100%",
            borderRadius: radius,
            background: isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.04)",
            border: `2px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 22 }}>📷</span>
          <span
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {label}
          </span>
        </div>
      )}

      {/* hover / loading overlay */}
      <div
        aria-hidden="true"
        className="profile-upload-overlay"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background: "rgba(0,0,0,0.55)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          pointerEvents: "none",
          opacity: loading ? 1 : undefined,
        }}
      >
        {loading ? (
          <div className="profile-spinner" />
        ) : (
          <>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span
              style={{
                fontSize: 10,
                color: "#fff",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
              }}
            >
              Change
            </span>
          </>
        )}
      </div>

      {shape === "circle" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 2,
            right: 2,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
            border: "2px solid var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="10"
            height="10"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION WRAPPER
══════════════════════════════════════════════════════════════ */
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  const { isDark } = useTheme();
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label={title}
      className={`profile-section ${isDark ? "dark" : "light"}`}
    >
      <div className="profile-section-header">
        <div className="profile-section-shimmer" aria-hidden="true" />
        <span aria-hidden="true" style={{ fontSize: 16 }}>
          {icon}
        </span>
        <h2 className="profile-section-title">{title}</h2>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </motion.section>
  );
}

/* ═════════════════���════════════════════════════════════════════
   FIELD
══════════════════════════════════════════════════════════════ */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  hint,
  disabled,
  rows,
  error,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  hint?: string;
  disabled?: boolean;
  rows?: number;
  error?: string;
}) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const countId = `${fieldId}-count`;
  const hasError = !!error;

  const describedBy = [
    hasError ? errorId : null,
    hint && !hasError ? hintId : null,
    maxLength && value.length > 0 ? countId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  const inputProps = {
    id: fieldId,
    value,
    maxLength,
    disabled,
    placeholder,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => onChange?.(e.target.value),
    "aria-invalid": hasError ? (true as const) : undefined,
    "aria-describedby": describedBy,
    className: `profile-field-input ${hasError ? "has-error" : ""} ${disabled ? "is-disabled" : ""}`,
  };

  return (
    <div>
      <label htmlFor={fieldId} className="profile-field-label">
        {label}
      </label>

      {rows ? (
        <textarea {...inputProps} rows={rows} />
      ) : (
        <input {...inputProps} type={type} />
      )}

      {hasError && (
        <p id={errorId} className="profile-field-error" role="alert">
          ✕ {error}
        </p>
      )}

      {hint && !hasError && (
        <p id={hintId} className="profile-field-hint">
          {hint}
        </p>
      )}

      {maxLength != null && value.length > 0 && (
        <p
          id={countId}
          className="profile-field-count"
          style={{
            color:
              value.length > maxLength * 0.9
                ? "#f59e0b"
                : "var(--text-muted)",
          }}
          aria-live="polite"
        >
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CATEGORIES
══════════════════════════════════════════════════════════════ */
const CATEGORIES = [
  "Technology",
  "Art",
  "Music",
  "Film",
  "Food",
  "Games",
  "Fashion",
  "Education",
  "Environment",
  "Health",
  "Sports",
  "Social",
  "Science",
  "Design",
  "Writing",
  "Photography",
];

/* ══════════════════════════════════════════════════════════════
   GENDER OPTIONS
══════════════════════════════════════════════════════════════ */
const GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Select gender" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

/* ══════════════════════════════════════════════════════════════
   COMPLETION RING (SMALL INLINE)
══════════════════════════════════════════════════════════════ */
function InlineRing({
  pct,
  color,
  size = 52,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const { isDark } = useTheme();
  const r = (size - 5) / 2;
  const c = 2 * Math.PI * r;
  const trackColor = isDark
    ? "rgba(255,255,255,0.07)"
    : "rgba(0,0,0,0.07)";

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
      role="img"
      aria-label={`Profile ${pct}% complete`}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={4}
          stroke={trackColor}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={4}
          stroke={color}
          strokeDasharray={c}
          strokeLinecap="round"
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Syne, sans-serif",
          fontWeight: 800,
          fontSize: 11,
          color,
        }}
      >
        {pct}
      </motion.span>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SKELETON LOADER
══════════════════════════════════════════════════════════════ */
function ProfileSkeleton() {
  const { isDark } = useTheme();
  const bg = isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.06)";

  return (
    <div
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "0 0 60px",
      }}
    >
      <div
        className="profile-skeleton-block"
        style={{
          height: 180,
          background: bg,
          borderRadius: 16,
          marginBottom: 60,
        }}
      />
      <div style={{ padding: "0 24px" }}>
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="profile-skeleton-block"
            style={{
              height: 200,
              background: bg,
              borderRadius: 20,
              marginBottom: 16,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DRAFT USER HELPER
══════════════════════════════════════════════════════════════ */
function buildDraftUser(
  user: UserProfile,
  overrides: {
    bio: string;
    about: string;
    gender: string;
    dob: string;
    website: string;
    linkedin: string;
    instagram: string;
    twitter: string;
    city: string;
    profession: string;
    cats: string[];
  }
): UserProfile {
  return {
    ...user,
    bio: overrides.bio,
    about: overrides.about,
    gender: overrides.gender,
    dateOfBirth: overrides.dob,
    websiteUrl: overrides.website,
    linkedinUrl: overrides.linkedin,
    instagramUrl: overrides.instagram,
    twitterUrl: overrides.twitter,
    city: overrides.city,
    profession: overrides.profession,
    interestedCategories: overrides.cats,
  };
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { user, loading, refetch } = useProfile();
  const { isDark } = useTheme();
  const genderSelectId = useId();
  const formRef = useRef<HTMLDivElement>(null);

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAL] = useState(false);
  const [bannerLoading, setBL] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const show = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  /* ── form state ── */
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>(
    {}
  );

  /* ── sync from server ── */
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
    setStateProv(user.state ?? "");
    setCountry(user.country ?? "");
    setPincode(user.pincode ?? "");
    setProfession(user.profession ?? "");
    setOrg(user.organization ?? "");
    setCats(user.interestedCategories ?? []);
    setIsDirty(false);
  }, [user]);

  /* ── dirty tracking wrappers ── */
  const track = useCallback(
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
      (val: T) => {
        setter(val);
        setIsDirty(true);
      },
    []
  );

  /* ── draft user for live completion preview ── */
  const draftUser = useMemo(
    () =>
      user
        ? buildDraftUser(user, {
            bio,
            about,
            gender,
            dob,
            website,
            linkedin,
            instagram,
            twitter,
            city,
            profession,
            cats,
          })
        : null,
    [
      user,
      bio,
      about,
      gender,
      dob,
      website,
      linkedin,
      instagram,
      twitter,
      city,
      profession,
      cats,
    ]
  );

  const pct = draftUser ? calcCompletion(draftUser) : 0;
  const badge = getBadge(pct);

  /* ── uploads ── */
  const handleAvatar = useCallback(
    async (file: File) => {
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
    },
    [refetch, show]
  );

  const handleBanner = useCallback(
    async (file: File) => {
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
    },
    [refetch, show]
  );

  const handleUploadError = useCallback(
    (msg: string) => {
      show(msg, "error");
    },
    [show]
  );

  /* ── validation ── */
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (website && !/^https?:\/\//.test(website)) {
      errors.website = "Must start with http:// or https://";
    }
    if (linkedin && !/linkedin\.com/.test(linkedin)) {
      errors.linkedin = "Must be a valid LinkedIn URL";
    }
    if (
      instagram &&
      !/^@?[\w.]{1,30}$/.test(instagram) &&
      !/instagram\.com/.test(instagram)
    ) {
      errors.instagram = "Enter a valid handle (@name) or URL";
    }
    if (
      twitter &&
      !/^@?[\w]{1,15}$/.test(twitter) &&
      !/twitter\.com|x\.com/.test(twitter)
    ) {
      errors.twitter = "Enter a valid handle (@name) or URL";
    }
    if (pincode && !/^\d{6}$/.test(pincode)) {
      errors.pincode = "Must be 6 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [website, linkedin, instagram, twitter, pincode]);

  /* ── save ── */
  const save = useCallback(async () => {
    if (!validateForm()) {
      show("Please fix the errors below", "error");
      /* scroll to first error */
      const firstError = formRef.current?.querySelector(
        '[role="alert"]'
      ) as HTMLElement | null;
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstError?.focus();
      return;
    }

    setSaving(true);
    try {
      await profileApi.update({
        bio,
        about,
        gender,
        dateOfBirth: dob,
        websiteUrl: website,
        linkedinUrl: linkedin,
        instagramUrl: instagram,
        twitterUrl: twitter,
        addressLine: address,
        city,
        state: stateProv,
        country,
        pincode,
        profession,
        organization: org,
        interestedCategories: cats,
      });
      await refetch();
      setIsDirty(false);
      show("Profile saved!", "success");
    } catch (e: any) {
      /* map API field errors if available */
      if (e.errors && typeof e.errors === "object") {
        setFormErrors(e.errors);
        show("Please fix the errors below", "error");
      } else {
        show(e.message ?? "Save failed", "error");
      }
    } finally {
      setSaving(false);
    }
  }, [
    validateForm,
    show,
    bio,
    about,
    gender,
    dob,
    website,
    linkedin,
    instagram,
    twitter,
    address,
    city,
    stateProv,
    country,
    pincode,
    profession,
    org,
    cats,
    refetch,
  ]);

  /* ── unsaved changes warning ── */
  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  /* ── guards ── */
  if (!mounted) return <ProfileSkeleton />;
  if (loading) return <ProfileSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: 860, margin: "0 auto", padding: "0 0 60px" }}
    >
      {/* ═══ banner + avatar hero ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ position: "relative", marginBottom: 60 }}
      >
        <UploadZone
          url={user?.bannerImageUrl ?? ""}
          onFile={handleBanner}
          onError={handleUploadError}
          loading={bannerLoading}
          shape="rect"
          size={180}
          label="banner image"
        />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            position: "absolute",
            bottom: -40,
            left: 28,
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
          }}
        >
          <div
            style={{
              borderRadius: "50%",
              border: "3px solid var(--bg)",
              boxShadow: "0 0 0 2px rgba(255,107,0,0.4)",
              overflow: "visible",
              position: "relative",
            }}
          >
            <UploadZone
              url={user?.profileImageUrl ?? ""}
              onFile={handleAvatar}
              onError={handleUploadError}
              loading={avatarLoading}
              shape="circle"
              size={80}
              label="profile photo"
            />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ paddingBottom: 8 }}
          >
            <p
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: "var(--text)",
                margin: 0,
                lineHeight: 1,
              }}
            >
              {user?.name}
            </p>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 13,
                color: "var(--text-muted)",
                margin: "3px 0 0",
              }}
            >
              @{user?.username}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            position: "absolute",
            bottom: -38,
            right: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <InlineRing pct={pct} color={badge.color} />
          <div>
            <p
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: badge.color,
                margin: 0,
              }}
            >
              {pct}% complete
            </p>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 11,
                color: "var(--text-muted)",
                margin: "1px 0 0",
              }}
            >
              {badge.emoji} {badge.label}
            </p>
          </div>
        </motion.div>
      </motion.div>

      <div ref={formRef} style={{ padding: "0 24px" }}>
        {/* ═══ completion chips ═══ */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04, delayChildren: 0.3 } },
          }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 20,
          }}
          role="list"
          aria-label="Profile completion checklist"
        >
          {COMPLETION_FIELDS.map(f => {
            const done = draftUser ? f.check(draftUser) : false;
            return (
              <motion.span
                key={f.label}
                role="listitem"
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  show: { opacity: 1, scale: 1 },
                }}
                className={`profile-chip ${done ? "done" : "todo"}`}
              >
                {done ? "✓" : `+${f.weight}%`} {f.label}
              </motion.span>
            );
          })}
        </motion.div>

        {/* ═══ basic info ═══ */}
        <Section title="Basic Info" icon="👤">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
            className="form-grid"
          >
            <Field
              label="Full name"
              value={user?.name ?? ""}
              disabled
              hint="Contact support to change name"
            />
            <Field
              label="Username"
              value={"@" + (user?.username ?? "")}
              disabled
              hint="Cannot be changed"
            />
            <div style={{ gridColumn: "1/-1" }}>
              <Field
                label="Bio"
                value={bio}
                onChange={track(setBio)}
                placeholder="A short line about yourself"
                maxLength={160}
                rows={2}
              />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <Field
                label="About me"
                value={about}
                onChange={track(setAbout)}
                placeholder="Tell creators and backers about you…"
                maxLength={1000}
                rows={4}
              />
            </div>
            <div>
              <label
                htmlFor={genderSelectId}
                className="profile-field-label"
              >
                Gender
              </label>
              <select
                id={genderSelectId}
                value={gender}
                onChange={e => {
                  setGender(e.target.value);
                  setIsDirty(true);
                }}
                className="profile-field-input profile-select"
              >
                {GENDER_OPTIONS.map(g => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Date of birth"
              value={dob}
              onChange={track(setDob)}
              type="date"
            />
          </div>
        </Section>

        {/* ═══ social links ═══ */}
        <Section title="Social Links" icon="🔗">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
            className="form-grid"
          >
            <Field
              label="Website"
              value={website}
              onChange={track(setWebsite)}
              placeholder="https://yoursite.com"
              error={formErrors.website}
            />
            <Field
              label="LinkedIn"
              value={linkedin}
              onChange={track(setLinkedin)}
              placeholder="linkedin.com/in/you"
              error={formErrors.linkedin}
            />
            <Field
              label="Instagram"
              value={instagram}
              onChange={track(setInstagram)}
              placeholder="@yourhandle"
              error={formErrors.instagram}
            />
            <Field
              label="Twitter / X"
              value={twitter}
              onChange={track(setTwitter)}
              placeholder="@yourhandle"
              error={formErrors.twitter}
            />
          </div>
        </Section>

        {/* ═══ location ═══ */}
        <Section title="Location" icon="📍">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
            className="form-grid"
          >
            <div style={{ gridColumn: "1/-1" }}>
              <Field
                label="Address"
                value={address}
                onChange={track(setAddress)}
                placeholder="Street address"
              />
            </div>
            <Field
              label="City"
              value={city}
              onChange={track(setCity)}
              placeholder="Mumbai"
            />
            <Field
              label="State"
              value={stateProv}
              onChange={track(setStateProv)}
              placeholder="Maharashtra"
            />
            <Field
              label="Country"
              value={country}
              onChange={track(setCountry)}
              placeholder="India"
            />
            <Field
              label="Pincode"
              value={pincode}
              onChange={track(setPincode)}
              placeholder="400001"
              maxLength={6}
              error={formErrors.pincode}
            />
          </div>
        </Section>

        {/* ═══ professional ═══ */}
        <Section title="Professional" icon="💼">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
            className="form-grid"
          >
            <Field
              label="Profession"
              value={profession}
              onChange={track(setProfession)}
              placeholder="Designer, Engineer…"
            />
            <Field
              label="Organization"
              value={org}
              onChange={track(setOrg)}
              placeholder="Company or institution"
            />
          </div>
        </Section>

        {/* ═══ interests ═══ */}
        <Section title="Interests" icon="🎯">
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              color: "var(--text-muted)",
              margin: "0 0 14px",
            }}
          >
            Select categories you care about.
          </p>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.02 },
              },
            }}
            style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
            role="group"
            aria-label="Interest categories"
          >
            {CATEGORIES.map(cat => {
              const sel = cats.includes(cat);
              return (
                <motion.button
                  key={cat}
                  type="button"
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    show: { opacity: 1, scale: 1 },
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={sel}
                  onClick={() => {
                    setCats(p =>
                      sel
                        ? p.filter(c => c !== cat)
                        : [...p, cat]
                    );
                    setIsDirty(true);
                  }}
                  className={`profile-cat-btn ${sel ? "selected" : ""} ${isDark ? "dark" : "light"}`}
                >
                  {sel ? "✓ " : ""}
                  {cat}
                </motion.button>
              );
            })}
          </motion.div>
        </Section>

        {/* ═══ save button ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 14,
            paddingTop: 4,
          }}
        >
          {isDirty && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: 12,
                color: "#f59e0b",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 500,
              }}
            >
              Unsaved changes
            </motion.span>
          )}
          <motion.button
            type="button"
            onClick={save}
            disabled={saving}
            whileHover={!saving ? { scale: 1.05 } : {}}
            whileTap={!saving ? { scale: 0.95 } : {}}
            className="profile-save-btn"
            style={{
              opacity: saving ? 0.7 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            <span
              aria-hidden="true"
              className="profile-save-shimmer"
            />
            {saving ? (
              <>
                <span className="profile-spinner-sm" />
                <span style={{ position: "relative" }}>Saving…</span>
              </>
            ) : (
              <span style={{ position: "relative" }}>
                Save changes →
              </span>
            )}
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onClose={dismissToast}
          />
        )}
      </AnimatePresence>

      {/* ═══════════════════ SCOPED STYLES ═══════════════════ */}
      <style>{`
        /* ── animations ─────────────────────────── */
        @keyframes profileSpin    { to { transform: rotate(360deg); } }
        @keyframes profileShimmer { 0% { transform: translateX(-100%); } 60% { transform: translateX(200%); } 100% { transform: translateX(200%); } }
        @keyframes profilePulse   { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

        /* ── screen reader only ─────────────────── */
        .sr-only {
          position: absolute; width: 1px; height: 1px;
          padding: 0; margin: -1px; overflow: hidden;
          clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }

        /* ── skeleton ───────────────────────────── */
        .profile-skeleton-block {
          animation: profilePulse 2s ease-in-out infinite;
        }

        /* ── section ────────────────────────────── */
        .profile-section {
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .profile-section.dark {
          background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .profile-section.light {
          background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8));
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 16px rgba(0,0,0,0.04);
        }
        .profile-section-header {
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }
        .profile-section.dark .profile-section-header {
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.015);
        }
        .profile-section.light .profile-section-header {
          border-bottom: 1px solid rgba(0,0,0,0.04);
          background: rgba(0,0,0,0.01);
        }
        .profile-section-shimmer {
          position: absolute;
          top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,140,0,0.4), transparent);
        }
        .profile-section-title {
          font-family: "Syne", sans-serif;
          font-weight: 700;
          font-size: 13.5px;
          color: var(--text);
          margin: 0;
        }

        /* ── field ──────────────────────────────── */
        .profile-field-label {
          display: block;
          font-family: "DM Sans", sans-serif;
          font-weight: 600;
          font-size: 11.5px;
          color: var(--text-muted);
          margin-bottom: 6px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .profile-field-input {
          width: 100%;
          padding: 10px 13px;
          border-radius: 11px;
          box-sizing: border-box;
          font-family: "DM Sans", sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          resize: none;
          line-height: 1.6;
        }
        .profile-field-input {
          border: 1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"};
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.025)"};
          color: var(--text);
        }
        .profile-field-input.is-disabled {
          background: ${isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"};
          color: var(--text-muted);
          cursor: not-allowed;
        }
        .profile-field-input.has-error {
          border-color: #ef4444;
        }
        .profile-field-input:focus:not(.is-disabled) {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(255,107,0,0.1);
        }
        .profile-field-input.has-error:focus:not(.is-disabled) {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }
        .profile-select {
          cursor: pointer;
          appearance: auto;
        }
        .profile-field-error {
          font-size: 11.5px;
          color: #ef4444;
          font-family: "DM Sans", sans-serif;
          margin: 4px 0 0;
        }
        .profile-field-hint {
          font-size: 11.5px;
          color: var(--text-muted);
          font-family: "DM Sans", sans-serif;
          margin: 4px 0 0;
        }
        .profile-field-count {
          font-size: 11px;
          font-family: "DM Sans", sans-serif;
          margin: 3px 0 0;
          text-align: right;
        }

        /* ── upload zone ────────────────────────── */
        .profile-upload-overlay {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .profile-upload-zone:hover .profile-upload-overlay,
        .profile-upload-zone:focus-visible .profile-upload-overlay {
          opacity: 1;
        }
        .profile-upload-zone:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        /* ── spinners ───────────────────────────── */
        .profile-spinner {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.8);
          border-top-color: transparent;
          animation: profileSpin 0.7s linear infinite;
        }
        .profile-spinner-sm {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.7);
          border-top-color: #fff;
          animation: profileSpin 0.7s linear infinite;
          position: relative;
        }

        /* ── completion chips ───────────────────── */
        .profile-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-family: "DM Sans", sans-serif;
          transition: all 0.2s;
        }
        .profile-chip.done {
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.25);
          color: #34d399;
        }
        .profile-chip.todo {
          background: rgba(255,136,0,0.08);
          border: 1px solid rgba(255,136,0,0.2);
          color: #ff8800;
        }

        /* ── category buttons ───────────────────── */
        .profile-cat-btn {
          padding: 7px 14px;
          border-radius: 999px;
          font-family: "DM Sans", sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .profile-cat-btn:not(.selected).dark {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text);
          font-weight: 400;
        }
        .profile-cat-btn:not(.selected).light {
          background: rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.07);
          color: var(--text);
          font-weight: 400;
        }
        .profile-cat-btn.selected {
          background: linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,204,0,0.1));
          border: 1px solid rgba(255,107,0,0.4);
          color: #ff8800;
          font-weight: 600;
          box-shadow: 0 0 12px rgba(255,107,0,0.2);
        }

        /* ── save button ────────────────────────── */
        .profile-save-btn {
          padding: 12px 32px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #ff6b00, #ffcc00);
          color: #fff;
          font-family: "Syne", sans-serif;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 0 24px rgba(255,100,0,0.4);
          position: relative;
          overflow: hidden;
          transition: opacity 0.18s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .profile-save-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%);
          animation: profileShimmer 2.4s ease-in-out infinite;
        }

        /* ── responsive ─────────────────────────── */
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
}