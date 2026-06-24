// src/hooks/useFundingStream.ts
// FIX: Changed URL from /api/projects/ → /api/v1/projects/ (API versioning #26)
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
    // ✅ FIX: was /api/projects/ — must be /api/v1/projects/ to match the versioned backend
    const url = `${BACKEND}/api/v1/projects/${projectId}/funding-stream`;

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
        setTimeout(connect, 5_000);
      };
    };

    connect();

    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [projectId, enabled]);

  return data;
}