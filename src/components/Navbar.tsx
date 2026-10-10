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
  Wifi,
  WifiOff,
  Sparkles,
  Layers,
  Settings,
  Shield,
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
    setTimeout(() => setInjecting(false), 600);
  };

  const navLinks = [
    { href: "/", label: "Live Cockpit", icon: Layers, desc: "3-Role Split View" },
    { href: "/paramedic", label: "Paramedic App", icon: Ambulance, desc: "Triage & Vitals" },
    { href: "/hospital-er", label: "Hospital ER", icon: Building2, desc: "Command Center" },
    { href: "/family-portal", label: "Family Portal", icon: Users, desc: "Pre-Auth & Pay" },
    { href: "/admin-demo", label: "Demo & Judging", icon: Activity, desc: "Scenario Control" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-md shadow-red-900/30 group-hover:bg-red-500 transition-colors">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg tracking-tight text-white">
                      TRAUMA<span className="text-red-500">NET</span>
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Real-Time
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 hidden sm:block">
                    Emergency Triage &amp; Bed Soft-Lock Platform
                  </p>
                </div>
              </Link>
            </div>

            {/* Role Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-red-500" : "text-slate-400"
                      }`}
                    />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions & System Status */}
            <div className="flex items-center gap-2.5">
              {/* 30-Sec Hackathon Inject Button */}
              <button
                onClick={handleQuickInject}
                disabled={injecting}
                title="Inject instant emergency scenario for demo"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                  injecting
                    ? "bg-amber-600 text-white scale-95"
                    : "bg-red-600 hover:bg-red-500 text-white shadow-red-900/20"
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Inject Scenario</span>
              </button>

              {/* Network Toggle Button */}
              <button
                onClick={toggleNetworkOnline}
                title={isOnline ? "Network: Online (Click to toggle)" : "Network: Offline (Click to restore)"}
                className={`p-2.5 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isOnline
                    ? "bg-slate-900 border-slate-800 text-emerald-400 hover:border-slate-700"
                    : "bg-amber-950/40 border-amber-500/50 text-amber-400"
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span className="hidden lg:inline text-xs">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span className="hidden lg:inline text-xs">Offline</span>
                  </>
                )}
              </button>

              {/* AI Settings Trigger */}
              <button
                onClick={() => setShowSettingsModal(true)}
                title="AI Triage & Engine Settings"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-3 py-2 flex items-center justify-around">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center py-1 px-2 text-xs font-medium rounded-lg ${
                  isActive ? "text-red-500 font-bold bg-slate-900" : "text-slate-400"
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">TraumaNet AI Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <label className="flex items-center justify-between cursor-pointer font-medium text-white">
                  <span>Use Live Gemini 1.5 API</span>
                  <input
                    type="checkbox"
                    checked={useLiveGemini}
                    onChange={(e) => setUseLiveGemini(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                </label>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When enabled, wound images &amp; vitals call Google Gemini 1.5. When disabled, the deterministic clinical ATLS algorithm is used.
                </p>
              </div>

              {useLiveGemini && (
                <div className="space-y-2">
                  <label className="block text-slate-200 font-medium text-xs">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              )}

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Real-Time State</span>
                </div>
                <p className="text-slate-400">
                  Active Incident: <span className="font-medium text-white">{activeSession?.incident_title}</span>
                </p>
                <p className="text-slate-400">
                  Assigned Facility: <span className="font-medium text-white">{activeSession?.assigned_hospital_id}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
