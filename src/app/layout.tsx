import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trump Trade Tracker",
  description: "Real-time OGE Form 278-T trade disclosures for President Trump",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
