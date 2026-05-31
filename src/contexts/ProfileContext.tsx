"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { authApi, tokenStorage, type UserResponse } from "@/lib/api";

interface ProfileCtxType {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const ProfileCtx = createContext<ProfileCtxType>({
  user: null,
  loading: true,
  error: null,
  refetch: async () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  // Increments on every fetchUser call so stale in-flight responses are ignored
  const fetchIdRef = useRef(0);

  const fetchUser = useCallback(async () => {
    const token = tokenStorage.getAccess();

    // No token → not logged in, stop spinner immediately
    if (!token) {
      setLoading(false);
      setUser(null);
      setError(null);
      return;
    }

    const thisId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await authApi.me();

      // Ignore response if a newer fetch has already started
      if (fetchIdRef.current !== thisId) return;

      setUser(data);
      setError(null);
    } catch (err: unknown) {
      if (fetchIdRef.current !== thisId) return;

      const msg = err instanceof Error ? err.message : "Failed to load profile";
      setError(msg);
      setUser(null);

      // Session expired: clear tokens so the layout redirects to /login
      if (msg.includes("Session expired") || msg.includes("Unauthorized")) {
        tokenStorage.clear();
      }
    } finally {
      if (fetchIdRef.current === thisId) {
        setLoading(false);
      }
    }
  }, []);

  // useEffect never runs on the server so we don't need the mounted gate.
  // localStorage is always available here.
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <ProfileCtx.Provider value={{ user, loading, error, refetch: fetchUser }}>
      {children}
    </ProfileCtx.Provider>
  );
}

export const useProfile = () => useContext(ProfileCtx);
