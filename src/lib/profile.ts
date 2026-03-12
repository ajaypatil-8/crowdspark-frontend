import type { UserResponse } from "./api";

export type UserProfile = UserResponse;

export const COMPLETION_FIELDS: {
  label: string;
  weight: number;
  check: (u: UserProfile) => boolean;
}[] = [
  { label: "Avatar",       weight: 15, check: u => !!u.profileImageUrl },
  { label: "Bio",          weight: 10, check: u => !!u.bio },
  { label: "About",        weight: 10, check: u => !!u.about },
  { label: "Gender",       weight: 5,  check: u => !!u.gender },
  { label: "Birthday",     weight: 5,  check: u => !!u.dateOfBirth },
  { label: "Location",     weight: 10, check: u => !!u.city },
  { label: "Profession",   weight: 10, check: u => !!u.profession },
  { label: "Social link",  weight: 10, check: u => !!(u.websiteUrl || u.linkedinUrl || u.instagramUrl || u.twitterUrl) },
  { label: "Interests",    weight: 10, check: u => (u.interestedCategories?.length ?? 0) > 0 },
  { label: "Email verify", weight: 10, check: u => u.emailVerified },
  { label: "Phone",        weight: 5,  check: u => !!u.phoneNumber },
];

export function calcCompletion(u: UserProfile): number {
  return COMPLETION_FIELDS.reduce((sum, f) => sum + (f.check(u) ? f.weight : 0), 0);
}

export function getBadge(pct: number): { label: string; emoji: string; color: string } {
  if (pct >= 90) return { label: "Elite",    emoji: "⚡", color: "#ffcc00" };
  if (pct >= 70) return { label: "Pro",      emoji: "🔥", color: "#ff6b00" };
  if (pct >= 50) return { label: "Rising",   emoji: "🚀", color: "#a78bfa" };
  if (pct >= 30) return { label: "Building", emoji: "🌱", color: "#34d399" };
  return                 { label: "Starter",  emoji: "💫", color: "#888" };
}