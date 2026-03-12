"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchUser = useCallback(async () => {
    const token = tokenStorage.getAccess();
    if (!token) {
      setLoading(false);
      setError("Not logged in");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.me();
      setUser(data);
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
      if (err.message?.includes("Session expired")) {
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) fetchUser();
  }, [mounted, fetchUser]);

  return (
    <ProfileCtx.Provider value={{ user, loading, error, refetch: fetchUser }}>
      {children}
    </ProfileCtx.Provider>
  );
}

export const useProfile = () => useContext(ProfileCtx);