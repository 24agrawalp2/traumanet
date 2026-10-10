"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Ambulance,
  Building2,
  Users,
  Zap,
  Activity,
  Radio,
  Wifi,
  WifiOff,
  Sparkles,
  Layers,
  Settings,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const {
    activeSession,
    isOnline,
    toggleNetworkOnline,
    injectEmergencyScenario,
    useLiveGemini,
    setUseLiveGemini,
    geminiApiKey,
    setGeminiApiKey,
  } = useTraumaNet();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [injecting, setInjecting] = useState(false);

  const handleQuickInject = () => {
    setInjecting(true);
    injectEmergencyScenario(Math.floor(Math.random() * 3));
    setTimeout(() => setInjecting(false), 800);
  };

  const navLinks = [
    { href: "/", label: "Split Cockpit", icon: Layers, badge: "3-in-1" },
    { href: "/paramedic", label: "Paramedic Fleet", icon: Ambulance, badge: "Mobile" },
    { href: "/hospital-er", label: "Hospital ER Command", icon: Building2, badge: "Live ER" },
    { href: "/family-portal", label: "Family Pre-Admission", icon: Users, badge: "UPI Pay" },
    { href: "/admin-demo", label: "Demo & Judging", icon: Activity, badge: "Judging" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emergency-red to-emergency-red-dark flex items-center justify-center shadow-lg shadow-emergency-red/20 group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xl tracking-tight text-white">
                      TRAUMA<span className="text-emergency-red">NET</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      v2.0 Real-Time
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 hidden sm:block">
                    Golden Hour Emergency Triage &amp; Bed Soft-Lock
                  </p>
                </div>
              </Link>
            </div>

            {/* Role Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-emergency-red" : "text-slate-400"
                      }`}
                    />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          isActive
                            ? "bg-red-500/20 text-red-300"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions & System Status */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* 30-Sec Hackathon Inject Button */}
              <button
                onClick={handleQuickInject}
                disabled={injecting}
                title="Inject instant 30-second emergency scenario for stage presentation"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                  injecting
                    ? "bg-amber-600 text-white scale-95"
                    : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/30 animate-pulse"
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">⚡ Inject Emergency</span>
                <span className="sm:hidden">⚡ Inject</span>
              </button>

              {/* Network Toggle Button (PWA Offline simulator) */}
              <button
                onClick={toggleNetworkOnline}
                title={isOnline ? "Network: Online (Click to simulate offline)" : "Network: Offline (Click to restore)"}
                className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isOnline
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 animate-pulse"
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline text-[11px]">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline text-[11px]">Offline</span>
                  </>
                )}
              </button>

              {/* Gemini / System Settings Trigger */}
              <button
                onClick={() => setShowSettingsModal(true)}
                title="AI Triage & Engine Settings"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-2 py-1.5 flex items-center justify-around overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium rounded ${
                  isActive ? "text-emergency-red font-bold" : "text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{link.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-blue" />
                <h3 className="text-base font-bold text-white">TraumaNet AI Engine Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <label className="flex items-center justify-between cursor-pointer font-semibold text-white">
                  <span>Use Live Gemini 1.5 API</span>
                  <input
                    type="checkbox"
                    checked={useLiveGemini}
                    onChange={(e) => setUseLiveGemini(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  When enabled, patient vitals &amp; trauma wound photos are analyzed via Google Gemini 1.5. When disabled, the deterministic ATLS clinical triage engine is used.
                </p>
              </div>

              {useLiveGemini && (
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">
                    Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Key is securely stored in your browser session for live multimodal triage.
                  </p>
                </div>
              )}

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-Time Sync State</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Active Session: <span className="font-mono text-white">{activeSession?.session_id}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Target Hospital: <span className="font-semibold text-white">{activeSession?.assigned_hospital_id}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-emergency-red hover:bg-emergency-red-dark text-white text-xs font-bold rounded-lg transition-colors"
              >
                Apply &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
