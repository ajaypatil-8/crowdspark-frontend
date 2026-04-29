import type { Metadata } from "next";
import "@/app/globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LenisProvider from "@/providers/Lenisprovider";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "CrowdSpark — Ignite Ideas Together",
  description: "The modern crowdfunding platform for creators and innovators.",
  keywords: ["crowdfunding", "creators", "campaigns", "kickstarter", "funding"],
  openGraph: {
    title: "CrowdSpark — Ignite Ideas Together",
    description: "The modern crowdfunding platform for creators and innovators.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="font-body" suppressHydrationWarning>
        <ThemeProvider>
          <LenisProvider>
            {/* Ambient atmosphere */}
            <div className="orb orb-1" aria-hidden="true" />
            <div className="orb orb-2" aria-hidden="true" />
            <div className="orb orb-3" aria-hidden="true" />
            <div className="dot-grid" aria-hidden="true" />

            {/* Custom cursor — hidden on touch devices via CSS */}
            <CustomCursor />

            {children}
          </LenisProvider>
        </ThemeProvider>

        <style>{`
          @keyframes shimmerBtn {
            0% { transform: translateX(-100%); }
            60% { transform: translateX(200%); }
            100% { transform: translateX(200%); }
          }
          @keyframes progressShine {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 0 2px var(--accent-glow); }
            50% { box-shadow: 0 0 0 4px var(--accent-glow); }
          }
        `}</style>
      </body>
    </html>
  );
}
