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
  creator: { username: string };
  category: string | null;
}

async function fetchProjectMeta(id: string): Promise<ProjectMeta | null> {
  try {
    // ✅ FIX: was /api/projects/${id} — must be /api/v1/projects/${id}
    const res = await fetch(`${API_BASE}/api/v1/projects/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    // ApiResponse<T> wrapper — unwrap the data field
    return (json.data ?? json) as ProjectMeta;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {

  const { id } = await params;

  const project = await fetchProjectMeta(id);

  if (!project) {
    return {

      title: { absolute: "Campaign | CrowdSpark" },
      description: "Discover and back visionary projects on CrowdSpark.",
    };
  }

  const title       = `${project.title} | CrowdSpark`;
  const description = project.shortDescription;
  const image       = project.thumbnailUrl ?? `${SITE_URL}/og-default.png`;
  const url         = `${SITE_URL}/projects/${project.id}`;

  return {

    title: { absolute: title },
    description,
    openGraph: {
      type:        "website",
      locale:      "en_IN",
      url,
      siteName:    "CrowdSpark",
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: project.title }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [image],
      creator:     `@${project.creator.username}`,
      site:        "@CrowdSpark",
    },
    alternates: { canonical: url },
    other: {
      "og:image":        image,
      "og:image:width":  "1200",
      "og:image:height": "630",
    },
  };
}

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}