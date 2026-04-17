import type { Metadata } from "next";
import "@/app/globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LenisProvider from "@/providers/Lenisprovider";

export const metadata: Metadata = {
  title: "CrowdSpark — Ignite Ideas Together",
  description: "The modern crowdfunding platform for creators and innovators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      {/* suppressHydrationWarning on body fixes "cz-shortcut-listen" attr injected by browser extensions (Grammarly etc) */}
      <body className="font-body" suppressHydrationWarning>
        <ThemeProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
