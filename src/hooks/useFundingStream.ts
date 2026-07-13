// src/hooks/useFundingStream.ts
// FIX: Changed URL from /api/projects/ → /api/v1/projects/ (API versioning #26)
// FIX (Feature #15): the reconnect setTimeout scheduled in onerror was never
// cancelled on cleanup. If the component unmounted (or projectId/enabled
// changed) while a reconnect was pending, the timer still fired afterward and
// opened a brand-new EventSource nobody would ever close — a zombie SSE
// connection per dropped reconnect. Now tracked and cleared on cleanup.
"use client";
import { useState, useEffect, useRef } from "react";

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

    const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/crowdspark";
    // was /api/projects/ — must be /api/v1/projects/ to match the versioned backend
    const url = `${BACKEND}/api/v1/projects/${projectId}/funding-stream`;

    // Scoped to this effect run so the cleanup below always cancels the right timer.
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
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
        reconnectTimer = setTimeout(connect, 5_000);
      };
    };

    connect();

    return () => {
      // FIX: cancel any pending reconnect before tearing down — otherwise it
      // fires after unmount and opens a connection nothing will ever close.
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      esRef.current?.close();
      esRef.current = null;
    };
  }, [projectId, enabled]);

  return data;
}