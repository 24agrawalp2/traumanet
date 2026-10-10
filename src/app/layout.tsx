import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TraumaNetProvider } from "@/lib/TraumaNetContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TraumaNet | AI Emergency Triage, Smart Routing & Pre-Admission Platform",
  description:
    "AI-driven healthcare logistics eliminating the 3 Golden Hour bottlenecks: medical uncertainty, hospital bed mismatch, and billing counter delays.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
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
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen selection:bg-red-500 selection:text-white">
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
