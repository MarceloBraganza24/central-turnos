import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import PostHogProvider from "@/components/providers/PostHogProvider";
import FloatingSupportButton from "@/components/support/FloatingSupportButton";

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
    <html lang="es">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} bg-neutral-950 text-white antialiased`}
      >
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