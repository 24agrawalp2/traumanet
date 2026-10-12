import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TraumaNetProvider } from "@/lib/TraumaNetContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TraumaNet | AI Emergency Triage, Smart Routing & Pre-Admission Platform",
  description:
    "AI-driven hospital readiness coordination eliminating wrong transfers in Nagpur's Golden Hour emergency care chain.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#020817",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body className="bg-[#020817] text-slate-100 min-h-screen antialiased">
        <TraumaNetProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1">{children}</div>
          </div>
        </TraumaNetProvider>
      </body>
    </html>
  );
}
