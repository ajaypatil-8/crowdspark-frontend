// src/hooks/useFundingStream.ts
// NEW FILE — React hook that subscribes to the SSE funding stream.
// Drop this file into src/hooks/ (create the folder if it doesn't exist).

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

/**
 * Connects to GET /api/projects/{projectId}/funding-stream (SSE).
 * Returns the latest funding data, updating live whenever a donation is confirmed.
 *
 * @param projectId  — project to watch
 * @param initial    — initial data from the server-side page fetch (shown instantly)
 * @param enabled    — set false to skip connecting (e.g. project is FAILED/CLOSED)
 *
 * Usage:
 *   const funding = useFundingStream(project.id, {
 *     projectId:        project.id,
 *     currentAmount:    project.currentAmount,
 *     goalAmount:       project.goalAmount,
 *     fundedPercentage: project.fundedPercentage,
 *     backersCount:     project.backersCount ?? 0,
 *     status:           project.status ?? "APPROVED",
 *     timestamp:        Date.now(),
 *   });
 *
 *   // Then use funding.currentAmount, funding.fundedPercentage, etc.
 */
export function useFundingStream(
  projectId: number,
  initial: FundingUpdate,
  enabled = true
): FundingUpdate {
  const [data, setData] = useState<FundingUpdate>(initial);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Sync if parent re-fetches (e.g. onSuccess after payment)
    setData(initial);
  }, [initial.currentAmount, initial.fundedPercentage]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/crowdspark";
    const url = `${BACKEND}/api/projects/${projectId}/funding-stream`;

    const connect = () => {
      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener("funding-update", (e: MessageEvent) => {
        try {
          const update: FundingUpdate = JSON.parse(e.data);
          setData(prev => {
            // Only apply if the incoming update is newer
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
        // Auto-reconnect after 5 seconds (SSE spec says browser does this,
        // but being explicit is safer across all browsers)
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
