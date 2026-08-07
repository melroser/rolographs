import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rolograph | Cursor Miami Ship Night",
  description:
    "Turn an event into a live relationship graph: who matters, how they connect, what was said, and what to do next.",
  openGraph: {
    title: "Rolograph | Cursor Miami Ship Night",
    description:
      "Turn an event into a live relationship graph: who matters, how they connect, what was said, and what to do next.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05040a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
