import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LenisProvider from "@/providers/Lenisprovider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title:       "CrowdSpark — Ignite Ideas Together",
  description: "The modern crowdfunding platform for creators and innovators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LenisProvider>
            <Navbar />
            <main style={{ paddingTop: 68 }}>
              {children}
            </main>
            <Footer />
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}