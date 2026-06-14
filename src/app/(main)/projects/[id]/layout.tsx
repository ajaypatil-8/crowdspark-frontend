// src/app/(main)/projects/[id]/layout.tsx
// Server component — generates per-project Open Graph + Twitter meta tags.
// The actual page (page.tsx) stays as a client component unchanged.

import type { Metadata } from "next";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/crowdspark";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://crowdspark.in";

interface ProjectMeta {
  id:               number;
  title:            string;
  shortDescription: string;
  thumbnailUrl:     string | null;
  creator: {
    username: string;
  };
  category: string | null;
}

/** Server-side project fetch — used only for metadata, not rendered content. */
async function fetchProjectMeta(id: string): Promise<ProjectMeta | null> {
  try {
    const res = await fetch(`${API_BASE}/api/projects/${id}`, {
      // Cache for 60 s so every page request doesn't hit the DB
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<ProjectMeta>;
  } catch {
    return null;
  }
}

// ── generateMetadata ──────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const project = await fetchProjectMeta(params.id);

  // Fallback when project is not found or API is down
  if (!project) {
    return {
      title: "Campaign | CrowdSpark",
      description: "Discover and back visionary projects on CrowdSpark.",
    };
  }

  const title       = `${project.title} | CrowdSpark`;
  const description = project.shortDescription;
  const image       = project.thumbnailUrl ?? `${SITE_URL}/og-default.png`;
  const url         = `${SITE_URL}/projects/${project.id}`;

  return {
    title,
    description,

    // ── Open Graph ──────────────────────────────────────────────────────────
    openGraph: {
      type:        "website",
      locale:      "en_IN",
      url,
      siteName:    "CrowdSpark",
      title,
      description,
      images: [
        {
          url,
          width:  1200,
          height: 630,
          alt:    project.title,
        },
      ],
    },

    // ── Twitter / X card ────────────────────────────────────────────────────
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [image],
      creator:     `@${project.creator.username}`,
      site:        "@CrowdSpark",
    },

    // ── Canonical ───────────────────────────────────────────────────────────
    alternates: {
      canonical: url,
    },

    // ── Extra meta (WhatsApp picks up og:* automatically) ───────────────────
    other: {
      "og:image":       image,
      "og:image:width": "1200",
      "og:image:height":"630",
    },
  };
}

// ── Layout component ──────────────────────────────────────────────────────────
// Just passes children through — all rendering is in page.tsx.

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
