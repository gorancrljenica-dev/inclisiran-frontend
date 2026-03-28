import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inclisiran Dose Tracker",
  description: "Internal tool for tracking Inclisiran therapy",
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
