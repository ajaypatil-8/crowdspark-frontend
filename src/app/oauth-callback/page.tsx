"use client";

import { useEffect } from "react";
import { tokenStorage } from "@/lib/api";

export default function OAuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access  = params.get("token");
    const refresh = params.get("refresh");

    if (access && refresh) {
      tokenStorage.set(access, refresh);
      window.location.href = "/dashboard";
    } else {
      // no tokens — backend hasn't been updated yet, redirect to login
      window.location.href = "/login?error=oauth_failed";
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #ff6b00", borderTopColor: "transparent", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: "DM Sans, sans-serif", color: "var(--text-muted)", fontSize: 14 }}>Completing sign in…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}