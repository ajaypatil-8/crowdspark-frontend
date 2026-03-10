"use client";

import { createContext, useContext } from "react";
import type { UserProfile } from "@/lib/api";

export type ProfileCtxType = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const ProfileCtx = createContext<ProfileCtxType>({
  user: null,
  loading: true,
  error: null,
  refetch: async () => {},
});

export const useProfile = () => useContext(ProfileCtx);