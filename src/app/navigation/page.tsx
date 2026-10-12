// =====================================================================
// TRAUMANET v2 LIVE EMERGENCY NAVIGATION HUD
// Google Maps Driving Mode Styled HUD for Nagpur Ambulance Corridor
// =====================================================================

"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Navigation,
  Compass,
  Bed,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[550px] flex flex-col items-center justify-center bg-slate-950 text-slate-400 text-xs gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      <span>Loading Live Nagpur GPS Corridor...</span>
    </div>
  ),
});

export default function NavigationPage() {
  const {
    activeSession,
    hospitals,
    activeHospital,
    simulateAmbulanceProgress,
  } = useTraumaNet();

  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "terrain">("roadmap");
  const [showTraffic, setShowTraffic] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !activeSession) {
    return (
      <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Navigation className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
          <h2 className="text-base font-bold">Connecting to Nagpur Emergency Vector...</h2>
        </div>
      </div>
    );
  }

  const assignedHospital =
    hospitals.find((h) => h.hospital_id === activeSession.assigned_hospital_id) ||
    hospitals[0];

  return (
    <div className="min-h-screen bg-[#020817] text-white flex flex-col">
      {/* Driving Top HUD Navigation Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-3 shadow-lg shadow-blue-900/30 border-b border-blue-500/30 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
              ↱
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <span>In 450 m, take the ramp onto Wardha / Ring Road</span>
              </div>
              <p className="text-xs text-blue-100/80">
                Toward {assignedHospital.name} Emergency Bay • Green Corridor Signal Priority
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold font-mono border border-white/15 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Speed: {activeSession.speed_kmh} km/h</span>
            </div>
            <button
              onClick={simulateAmbulanceProgress}
              className="px-3.5 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-white/90 text-xs font-extrabold transition-all shadow-md active:scale-95"
            >
              Advance Vector (-2m)
            </button>
          </div>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="flex-1 relative w-full h-[calc(100vh-140px)] min-h-[550px]">
        {/* Full View LiveMap */}
        <div className="w-full h-full min-h-[550px] relative">
          <LiveMap
            session={activeSession}
            hospitals={hospitals}
            height="100%"
            mapStyle={mapType}
            showTrafficLayer={showTraffic}
          />
        </div>

        {/* Floating Navigation Bottom Control Dock */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-4xl glass border border-white/[0.12] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* ETA & Distance */}
            <div className="flex items-baseline gap-3" suppressHydrationWarning>
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight drop-shadow-sm" suppressHydrationWarning>
                {activeSession.eta_minutes} min
              </span>
              <div className="text-sm text-slate-300 font-medium" suppressHydrationWarning>
                <span>{assignedHospital.distance_km || 6.8} km</span> •{" "}
                <span className="text-emerald-400 font-semibold">Fastest route now</span>
              </div>
            </div>

            {/* Hospital Facility Quick Info */}
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <Bed className="w-4 h-4" />
                <span>15-Min Hold: {assignedHospital.status}</span>
              </span>

              <span className="px-3 py-1 rounded-xl bg-white/[0.06] text-slate-300 border border-white/[0.08] text-xs font-bold">
                {assignedHospital.trauma_level}
              </span>
            </div>
          </div>

          {/* Destination Details & Action Buttons */}
          <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-semibold text-white">{assignedHospital.name}</span>
              <span className="text-slate-400 hidden md:inline">({assignedHospital.address})</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/hospital-er"
                className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition-all shadow-md text-center"
              >
                ER Command View
              </Link>
              <Link
                href="/paramedic"
                className="flex-1 sm:flex-none px-4 py-2 bg-[#0c1526]/80 hover:bg-[#131f38] text-slate-200 border border-white/[0.08] text-xs font-bold rounded-xl transition-all text-center"
              >
                Paramedic Terminal
              </Link>
            </div>
          </div>
        </div>

        {/* Map Layer Switcher (Top-Right) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <div className="glass border border-white/[0.1] rounded-2xl p-1.5 shadow-xl flex gap-1">
            <button
              onClick={() => setMapType("roadmap")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapType === "roadmap"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => setMapType("satellite")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapType === "satellite"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType("terrain")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapType === "terrain"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Dark Mode
            </button>
          </div>

          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors self-end shadow-md ${
              showTraffic
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 backdrop-blur-md"
                : "bg-black/60 border-white/[0.08] text-slate-400 backdrop-blur-md"
            }`}
          >
            Live Corridor: {showTraffic ? "ACTIVE" : "STANDBY"}
          </button>
        </div>
      </div>
    </div>
  );
}
