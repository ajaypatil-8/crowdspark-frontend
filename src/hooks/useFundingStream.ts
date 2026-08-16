// src/hooks/useFundingStream.ts
// FIX: Changed URL from /api/projects/ → /api/v1/projects/ (API versioning #26)
"use client";
import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/lib/api";

export interface FundingUpdate {
  projectId: number;
  currentAmount: number;
  goalAmount: number;
  fundedPercentage: number;
  backersCount: number;
  status: string;
  timestamp: number;
}

export function useFundingStream(
  projectId: number,
  initial: FundingUpdate,
  enabled = true
): FundingUpdate {
  const [data, setData] = useState<FundingUpdate>(initial);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setData(initial);
  }, [initial.currentAmount, initial.fundedPercentage]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // ✅ FIX: was /api/projects/ — must be /api/v1/projects/ to match the versioned backend
    const url = `${API_BASE_URL}/api/v1/projects/${projectId}/funding-stream`;

    // FIX #15: the backend's SseEmitter times out every 5 minutes (by design —
    // see FundingStreamServiceImpl), which closes the connection and lands
    // here in onerror for *any* visitor who keeps a project page open that
    // long, not just on real network failures. Without this guard, navigating
    // away within the 5s reconnect window still fires connect() afterwards —
    // creating a brand new EventSource that nothing will ever close, since
    // esRef.current was already nulled out and the cleanup below has already run.
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (cancelled) return;

      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener("funding-update", (e: MessageEvent) => {
        try {
          const update: FundingUpdate = JSON.parse(e.data);
          setData(prev => {
            if (update.timestamp >= (prev.timestamp ?? 0)) return update;
            return prev;
          });
        } catch {
          // Malformed event — ignore
        }
      });

      es.onerror = () => {
        es.close();
        esRef.current = null;
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, 5_000);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [projectId, enabled]);

  return data;
}