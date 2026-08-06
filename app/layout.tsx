import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rolograph | Cursor Miami Ship Night",
  description:
    "A kinetic event-intelligence graph for recruiting builders at Cursor Miami Ship Night.",
  openGraph: {
    title: "Rolograph | Cursor Miami Ship Night",
    description:
      "Hyperpop relationship intelligence for finding teammates, recording interactions, and shipping live.",
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
