"use client";

/**
 * src/hooks/useLoadingState.ts
 * Pairs with ToastProvider for clean async operation feedback.
 *
 * Usage:
 *   const { run, loading } = useLoadingState();
 *   await run(() => api.createCampaign(data), {
 *     loading: "Creating campaign…",
 *     success: "Campaign created!",
 *     error: "Failed to create campaign",
 *   });
 */

import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

interface RunOptions {
  loading?: string;
  success?: string | ((data: unknown) => string);
  error?: string | ((err: unknown) => string);
  onSuccess?: (data: unknown) => void;
  onError?: (err: unknown) => void;
}

export function useLoadingState() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const run = useCallback(
    async <T>(fn: () => Promise<T>, opts: RunOptions = {}): Promise<T | undefined> => {
      setLoading(true);

      const loadingId = opts.loading ? toast.loading(opts.loading) : null;

      try {
        const data = await fn();

        if (loadingId) toast.dismiss(loadingId);

        if (opts.success) {
          const msg =
            typeof opts.success === "function"
              ? opts.success(data as unknown)
              : opts.success;
          toast.success(msg);
        }

        opts.onSuccess?.(data as unknown);
        return data;
      } catch (err) {
        if (loadingId) toast.dismiss(loadingId);

        if (opts.error !== undefined) {
          const msg =
            typeof opts.error === "function" ? opts.error(err) : opts.error;
          toast.error(msg);
        }

        opts.onError?.(err);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  return { run, loading };
}

/**
 * src/hooks/usePageLoader.ts
 * Triggers the global route progress bar.
 *
 * Usage (in fetch wrappers or Next.js router events):
 *   startRouteLoader();
 *   doneRouteLoader();
 */

export function startRouteLoader() {
  const fn = (window as unknown as Record<string, unknown>).__routeLoaderStart;
  if (typeof fn === "function") (fn as () => void)();
}

export function doneRouteLoader() {
  const fn = (window as unknown as Record<string, unknown>).__routeLoaderDone;
  if (typeof fn === "function") (fn as () => void)();
}
