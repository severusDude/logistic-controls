import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Logistic Controls Dashboard",
  description:
    "Industrial control surface for fleet telemetry and command flow.",
};

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", { [plusJakartaSans.variable]: true })}
    >
      <body className="min-h-full bg-[var(--bg-canvas)] text-[var(--ink-strong)]">
        {children}
      </body>
    </html>
  );
}
