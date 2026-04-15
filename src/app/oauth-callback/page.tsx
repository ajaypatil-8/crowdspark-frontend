"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/api";

type State = "loading" | "error";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access  = params.get("token");
    const refresh = params.get("refresh");
    const error   = params.get("error");

    if (error) {
      const messages: Record<string, string> = {
        oauth_failed:           "OAuth sign-in failed. Please try again.",
        unsupported_provider:   "That login provider is not supported.",
        account_suspended:      "Your account has been suspended.",
      };
      setErrorMsg(messages[error] ?? "Sign-in failed. Please try again.");
      setState("error");
      return;
    }

    if (access && refresh) {
      tokenStorage.set(access, refresh);
      router.replace("/dashboard");
    } else {
      setErrorMsg("No tokens received from server. Please try again.");
      setState("error");
    }
  }, [router]);

  if (state === "error") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconError}>✕</div>
          <h2 style={styles.title}>Sign-in Failed</h2>
          <p style={styles.sub}>{errorMsg}</p>
          <button style={styles.btn} onClick={() => router.push("/login")}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.spinnerWrap}>
          <div style={styles.spinner} className="cs-spinner" />
        </div>
        <h2 style={styles.title}>Completing sign in…</h2>
        <p style={styles.sub}>Hang tight, you&apos;re being redirected.</p>
      </div>
      <style>{`
        @keyframes cs-spin { to { transform: rotate(360deg); } }
        .cs-spinner { animation: cs-spin 0.75s linear infinite; }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg, #0d0d0d)",
  },
  card: {
    textAlign: "center",
    padding: "48px 40px",
    borderRadius: 16,
    background: "var(--card-bg, #1a1a1a)",
    border: "1px solid var(--border, rgba(255,255,255,0.08))",
    maxWidth: 360,
    width: "90%",
  },
  spinnerWrap: { display: "flex", justifyContent: "center", marginBottom: 24 },
  spinner: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "3px solid rgba(255,107,0,0.2)",
    borderTopColor: "#ff6b00",
    // className used for animation — inline style can't do @keyframes
  } as React.CSSProperties,
  iconError: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "rgba(239,68,68,0.15)",
    color: "#ef4444",
    fontSize: 22,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  title: {
    fontFamily: "DM Sans, sans-serif",
    color: "var(--text, #fff)",
    fontSize: 18,
    fontWeight: 600,
    margin: "0 0 8px",
  },
  sub: {
    fontFamily: "DM Sans, sans-serif",
    color: "var(--text-muted, #888)",
    fontSize: 14,
    margin: "0 0 24px",
  },
  btn: {
    padding: "10px 24px",
    borderRadius: 8,
    background: "#ff6b00",
    color: "#fff",
    border: "none",
    fontFamily: "DM Sans, sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
