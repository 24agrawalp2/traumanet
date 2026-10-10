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
  Layers,
  Settings,
  MapPin,
  Navigation,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const {
    activeSession,
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
    setTimeout(() => setInjecting(false), 500);
  };

  const navLinks = [
    { href: "/", label: "Home Hub", icon: Layers },
    { href: "/navigation", label: "Live GPS Map", icon: Navigation },
    { href: "/paramedic", label: "Paramedic", icon: Ambulance },
    { href: "/hospital-er", label: "Hospital ER", icon: Building2 },
    { href: "/family-portal", label: "Family Portal", icon: Users },
    { href: "/admin-demo", label: "Demo & Judging", icon: Activity },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-18 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white">
                  TRAUMA<span className="text-red-500">NET</span>
                </span>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Emergency AI Triage &amp; Bed Logistics
                </p>
              </div>
            </Link>

            {/* Clean Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
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

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleQuickInject}
                disabled={injecting}
                title="Inject test emergency scenario"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md ${
                  injecting
                    ? "bg-amber-600 text-white scale-95"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Inject Scenario</span>
              </button>

              <button
                onClick={() => setShowSettingsModal(true)}
                title="AI Settings"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-2 py-2 flex items-center justify-around overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center py-1 px-2 text-xs font-semibold rounded-lg ${
                  isActive ? "text-red-500 bg-slate-900" : "text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">TraumaNet AI Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <label className="flex items-center justify-between cursor-pointer font-bold text-white text-base">
                  <span>Use Live Gemini 1.5 API</span>
                  <input
                    type="checkbox"
                    checked={useLiveGemini}
                    onChange={(e) => setUseLiveGemini(e.target.checked)}
                    className="w-5 h-5 accent-red-600 rounded"
                  />
                </label>
                <p className="text-xs text-slate-400">
                  When enabled, patient vitals &amp; trauma wound photos call Google Gemini 1.5. When disabled, the built-in clinical ATLS engine runs deterministically.
                </p>
              </div>

              {useLiveGemini && (
                <div className="space-y-2">
                  <label className="block text-slate-200 font-semibold text-sm">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
