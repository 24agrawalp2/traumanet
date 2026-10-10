"use client";

import React, { useState, useEffect } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import LiveMap from "@/components/LiveMap";
import {
  Navigation,
  Compass,
  Bed,
  Phone,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Zap,
  MapPin,
  Clock,
  ArrowUpRight,
  Maximize2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function NavigationPage() {
  const {
    activeSession,
    hospitals,
    activeHospital,
    simulateAmbulanceProgress,
    declineAndReroute,
    acceptAndLockBed,
  } = useTraumaNet();

  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "terrain">("roadmap");
  const [showTraffic, setShowTraffic] = useState(true);

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Navigation className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
          <h2 className="text-base font-bold">No Active Inbound Ambulance Vector</h2>
        </div>
      </div>
    );
  }

  const assignedHospital =
    hospitals.find((h) => h.hospital_id === activeSession.assigned_hospital_id) ||
    hospitals[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Google Maps Driving Top HUD Navigation Bar */}
      <div className="bg-[#1A73E8] text-white px-4 py-3 shadow-md z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xl">
              ↱
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <span>In 450 m, take the ramp onto Mahatma Gandhi Ring Road</span>
              </div>
              <p className="text-xs text-white/80">
                Toward {assignedHospital.name} Emergency Trauma Bay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold font-mono">
              Speed: {activeSession.speed_kmh} km/h
            </div>
            <button
              onClick={simulateAmbulanceProgress}
              className="px-3.5 py-1.5 rounded-xl bg-white text-[#1A73E8] hover:bg-white/90 text-xs font-extrabold transition-all shadow-sm"
            >
              Advance Vector (-2m)
            </button>
          </div>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="flex-1 relative w-full h-[calc(100vh-140px)] min-h-[550px]">
        {/* Full View LiveMap */}
        <LiveMap
          session={activeSession}
          hospitals={hospitals}
          height="100%"
          mapStyle={mapType}
          showTrafficLayer={showTraffic}
        />

        {/* Floating Google Navigation Bottom Control Dock */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-4xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* ETA & Distance in Google Maps Driving Style */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tracking-tight">
                {activeSession.eta_minutes} min
              </span>
              <div className="text-sm text-slate-300 font-medium">
                <span>{assignedHospital.distance_km || 4.2} km</span> •{" "}
                <span className="text-emerald-400 font-semibold">Fastest route now</span>
              </div>
            </div>

            {/* Hospital Facility Quick Info */}
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <Bed className="w-4 h-4" />
                <span>{assignedHospital.icu_beds_free} ICU Beds Free</span>
              </span>

              <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">
                {assignedHospital.trauma_level}
              </span>
            </div>
          </div>

          {/* Destination Details & Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-semibold text-white">{assignedHospital.name}</span>
              <span className="text-slate-400 hidden md:inline">({assignedHospital.address})</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/hospital-er"
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors text-center"
              >
                ER Command View
              </Link>
              <Link
                href="/paramedic"
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
              >
                Paramedic Terminal
              </Link>
            </div>
          </div>
        </div>

        {/* Google Maps Layer Switcher & Map Mode HUD (Top-Right) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-1.5 shadow-lg flex gap-1">
            <button
              onClick={() => setMapType("roadmap")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapType === "roadmap"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Default
            </button>
            <button
              onClick={() => setMapType("satellite")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapType === "satellite"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType("terrain")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapType === "terrain"
                  ? "bg-blue-600 text-white shadow-sm"
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
                ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                : "bg-slate-900/90 border-slate-800 text-slate-400"
            }`}
          >
            Traffic Overlay: {showTraffic ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </div>
  );
}
