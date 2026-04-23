import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Logistic Controls Dashboard",
  description: "Industrial control surface for fleet telemetry and command flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--bg-canvas)] text-[var(--ink-strong)]">
        {children}
      </body>
    </html>
  );
}
