"use client";
// ─────────────────────────────────────────────────────────────────────────────
// app/register/page.tsx
//
// RegisterRequest fields (from actual backend):
//   username: min 3, max 30 (@NotBlank @Size)
//   name: @NotBlank
//   email: @NotBlank @Email
//   phoneNumber: optional — Indian format (+91)XXXXXXXXXX or 10 digits starting 6-9
//   password: min 8 chars (@Size)
//
// On success: returns UserResponse with 201 Created
// Then auto-login so user doesn't have to log in separately
// ─────────────────────────────────────────────────────────────────────────────
import { useState, FormEvent } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Register
      await authApi.register({
        username: form.username.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        password: form.password,
      });

      // Step 2: Auto-login (identifier can be username OR email)
      await authApi.login(form.email.trim(), form.password);

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    color: "var(--text-muted)",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--bg-card, #111)",
          border: "1px solid #222",
          borderRadius: 16,
          padding: 40,
        }}
      >
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 8,
          }}
        >
          Create account
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: 14 }}>
          Join CrowdSpark and back or create campaigns
        </p>

        {error && (
          <div
            style={{
              background: "#ff000018",
              border: "1px solid #ff4444",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 24,
              color: "#ff6666",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              required
              placeholder="John Doe"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Username * (3–30 chars)</label>
            <input
              type="text"
              value={form.username}
              onChange={set("username")}
              required
              minLength={3}
              maxLength={30}
              placeholder="john_doe"
              autoComplete="username"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              required
              placeholder="john@example.com"
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Phone Number (optional, Indian)</label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={set("phoneNumber")}
              placeholder="+91XXXXXXXXXX"
              style={inputStyle}
            />
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Format: +91XXXXXXXXXX or 10 digits starting with 6-9
            </p>
          </div>

          <div>
            <label style={labelStyle}>Password * (min 8 chars)</label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Confirm Password *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#555" : "var(--accent, #ff6b00)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 8,
            }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent, #ff6b00)", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}