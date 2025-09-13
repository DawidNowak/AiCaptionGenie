import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Caption Genie",
  description: "Generate engaging social media captions with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
