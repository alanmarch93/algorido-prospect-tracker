import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Algorido AI — Prospect Tracker",
  description: "Track prospect customers for Algorido AI Market Maker Volume Bot",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Algorido CRM",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0f1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={`${inter.className} min-h-full`}>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
