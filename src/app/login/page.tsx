"use client";
// ─────────────────────────────────────────────────────────────────────────────
// app/login/page.tsx
//
// KEY FACTS from backend:
//   - LoginRequest has "identifier" field (not "email")
//   - authService tries username → email → phone in order
//   - On success: tokens returned in JSON body, also set as HttpOnly cookies
//   - We store tokens in localStorage and send via Authorization header
// ─────────────────────────────────────────────────────────────────────────────
import { useState, FormEvent } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // authApi.login sends { identifier, password } to POST /auth/login
      // and stores the returned tokens in localStorage automatically
      await authApi.login(identifier, password);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
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
          maxWidth: 420,
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
          Welcome back
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: 14 }}>
          Sign in with your username, email, or phone number
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label
              style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}
            >
              Username / Email / Phone
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              required
              placeholder="e.g. john_doe or john@email.com"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
              }}
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* OAuth — these work via redirect, no token handling needed on this page */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 12 }}>
            or continue with
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <a
              href="http://localhost:8080/crowdspark/oauth2/authorization/google"
              style={{
                flex: 1,
                padding: "12px",
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: 8,
                color: "var(--text)",
                textAlign: "center",
                fontSize: 14,
                textDecoration: "none",
                display: "block",
              }}
            >
              Google
            </a>
            <a
              href="http://localhost:8080/crowdspark/oauth2/authorization/github"
              style={{
                flex: 1,
                padding: "12px",
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: 8,
                color: "var(--text)",
                textAlign: "center",
                fontSize: 14,
                textDecoration: "none",
                display: "block",
              }}
            >
              GitHub
            </a>
          </div>
        </div>

        <p style={{ marginTop: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "var(--accent, #ff6b00)", fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}