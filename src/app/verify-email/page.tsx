"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { emailVerifyApi } from "@/lib/api";

type State = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setState("error");
      setMessage("Invalid verification link. Please request a new one.");
      return;
    }

    emailVerifyApi
      .verify(token, email)
      .then(() => {
        setState("success");
        // Redirect to settings after 3s so user sees success
        setTimeout(() => router.push("/dashboard/settings"), 3000);
      })
      .catch((err: Error) => {
        setState("error");
        setMessage(err.message || "Verification failed. Please request a new link.");
      });
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #0d0d0d)",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
          padding: "48px 40px",
          borderRadius: 24,
          background: "var(--card, #141414)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
        }}
      >
        {state === "loading" && (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "3px solid rgba(255,136,0,0.2)",
                borderTopColor: "#ff8800",
                margin: "0 auto 24px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 22,
                color: "var(--text, #fff)",
                margin: "0 0 8px",
              }}
            >
              Verifying your email…
            </h2>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                color: "var(--text-muted, #888)",
                margin: 0,
              }}
            >
              Just a moment
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(52,211,153,0.1)",
                border: "1px solid rgba(52,211,153,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 32,
              }}
            >
              ✅
            </div>
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 24,
                color: "#34d399",
                margin: "0 0 10px",
              }}
            >
              Email verified!
            </h2>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                color: "var(--text-muted, #888)",
                margin: "0 0 28px",
                lineHeight: 1.7,
              }}
            >
              Your email has been successfully verified.
              <br />
              Redirecting you to settings…
            </p>
            <button
              onClick={() => router.push("/dashboard/settings")}
              style={{
                padding: "12px 28px",
                borderRadius: 12,
                background: "linear-gradient(135deg,#ff6b00,#ffcc00)",
                color: "#fff",
                border: "none",
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Go to Settings
            </button>
          </>
        )}

        {state === "error" && (
          <>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 32,
              }}
            >
              ❌
            </div>
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: "#ef4444",
                margin: "0 0 10px",
              }}
            >
              Verification failed
            </h2>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                color: "var(--text-muted, #888)",
                margin: "0 0 28px",
                lineHeight: 1.7,
              }}
            >
              {message}
            </p>
            <button
              onClick={() => router.push("/dashboard/settings")}
              style={{
                padding: "12px 28px",
                borderRadius: 12,
                background: "rgba(239,68,68,0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.3)",
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Request new link
            </button>
          </>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
