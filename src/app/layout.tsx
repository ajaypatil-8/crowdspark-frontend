import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
// @ts-ignore - Next.js handles global CSS imports here.
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider }   from "@/components/ui/Toast";
import { ConfirmProvider }  from "@/components/ui/ConfirmDialog";
import { RouteLoader }          from "@/components/ui/PageLoader";
import { SkipToMain }       from "@/components/ui/Accessibility";
import CustomCursor from "@/components/CustomCursor";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: true,
});

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "CrowdSpark — Fund What Matters",
    template: "%s | CrowdSpark",
  },
  description:
    "CrowdSpark is a modern, premium crowdfunding platform. Back visionary projects or launch your own campaign and connect with a global community of supporters.",
  keywords: ["crowdfunding", "campaigns", "fundraising", "startup", "creators"],
  authors: [{ name: "CrowdSpark Team" }],
  creator: "CrowdSpark",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "CrowdSpark — Fund What Matters",
    description:
      "Back visionary projects or launch your own campaign on CrowdSpark.",
    siteName: "CrowdSpark",
  },
  twitter: {
    card: "summary_large_image",
    title: "CrowdSpark — Fund What Matters",
    description:
      "Back visionary projects or launch your own campaign on CrowdSpark.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#04040a" },
    { media: "(prefers-color-scheme: light)", color: "#f8f8fc" },
  ],
};

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${dmSans.variable}`}
    >
      <head>
        {/* Prevent flash of unstyled theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem("cs-theme") || "dark";
                document.documentElement.setAttribute("data-theme", t);
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <ConfirmProvider>
              {/* Accessibility: skip navigation for keyboard users */}
              <SkipToMain />

              {/* Route transition progress bar */}
              <RouteLoader />

              {/* Global custom cursor for all routes */}
              <CustomCursor />

              {/* Main content landmark for skip-link target */}
              <main id="main-content" style={{ display: "contents" }}>
                {children}
              </main>
            </ConfirmProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
