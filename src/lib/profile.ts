import type { UserProfile } from "@/lib/api";

export const COMPLETION_FIELDS: {
  label: string;
  weight: number;
  check: (u: UserProfile) => boolean;
}[] = [
  { label: "Profile photo",  weight: 15, check: u => !!u.profileImageUrl },
  { label: "Banner image",   weight:  5, check: u => !!u.bannerImageUrl },
  { label: "Bio",            weight: 10, check: u => !!u.bio },
  { label: "About me",       weight: 10, check: u => !!u.about },
  { label: "Email verified", weight: 15, check: u => u.emailVerified },
  { label: "Location",       weight: 10, check: u => !!u.city },
  { label: "Social link",    weight:  5, check: u => !!(u.linkedinUrl || u.twitterUrl || u.instagramUrl || u.websiteUrl) },
  { label: "Profession",     weight: 10, check: u => !!u.profession },
  { label: "Date of birth",  weight:  5, check: u => !!u.dateOfBirth },
  { label: "Gender",         weight:  5, check: u => !!u.gender },
  { label: "Interests",      weight: 10, check: u => (u.interestedCategories?.length ?? 0) > 0 },
];

export const calcCompletion = (u: UserProfile): number =>
  COMPLETION_FIELDS.reduce((sum, f) => sum + (f.check(u) ? f.weight : 0), 0);

export type Badge = {
  label: string;
  emoji: string;
  color: string;
};

export const getBadge = (pct: number): Badge => {
  if (pct === 100) return { label: "Champion",    emoji: "⚡", color: "#ff8800" };
  if (pct >= 80)   return { label: "Advocate",    emoji: "🔥", color: "#ff6b00" };
  if (pct >= 60)   return { label: "Contributor", emoji: "🌟", color: "#a78bfa" };
  if (pct >= 30)   return { label: "Explorer",    emoji: "🧭", color: "#00f5d4" };
  return             { label: "Newcomer",    emoji: "🌱", color: "#34d399" };
};