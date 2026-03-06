// src/app/layout.tsx — ROOT layout (global providers only, NO Navbar/Footer)
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LenisProvider from "@/providers/Lenisprovider";

export const metadata: Metadata = {
  title: "CrowdSpark — Where bold ideas find their spark",
  description: "India's most trusted crowdfunding platform for creators and backers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}