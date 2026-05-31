import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import PostHogProvider from "@/components/providers/PostHogProvider";
import FloatingSupportButton from "@/components/support/FloatingSupportButton";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Central Turnos",
  description: "Sistema de turnos multi-profesional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className="theme-saas">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} bg-[var(--background)] text-[var(--foreground)] antialiased`}
      >
        <Toaster
          position="top-right"
          richColors
          theme="dark"
        />
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
        <FloatingSupportButton />
      </body>
    </html>
  );
}