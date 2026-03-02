import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrowdSpark — Ignite Ideas Together",
  description: "The modern crowdfunding platform built for creators and innovators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="noise antialiased">
        {children}
      </body>
    </html>
  );
}