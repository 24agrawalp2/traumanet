"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Ambulance,
  Building2,
  Users,
  Zap,
  Activity,
  Navigation,
  Settings,
  X,
  Menu,
  Wifi,
  WifiOff,
  ChevronRight,
  Radio,
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleQuickInject = () => {
    setInjecting(true);
    injectEmergencyScenario(Math.floor(Math.random() * 5));
    setTimeout(() => setInjecting(false), 1200);
  };

  const navLinks = [
    { href: "/", label: "Command Hub", icon: Activity, color: "text-rose-400" },
    { href: "/navigation", label: "Live GPS", icon: Navigation, color: "text-sky-400" },
    { href: "/paramedic", label: "Paramedic", icon: Ambulance, color: "text-red-400" },
    { href: "/hospital-er", label: "Hospital ER", icon: Building2, color: "text-emerald-400" },
    { href: "/family-portal", label: "Family Portal", icon: Users, color: "text-blue-400" },
    { href: "/admin-demo", label: "Demo", icon: Radio, color: "text-amber-400" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#020817]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
            : "bg-[#020817]/80 backdrop-blur-md border-b border-white/[0.04]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 transition-shadow">
                <Activity className="w-5 h-5 text-white" />
                {activeSession && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#020817] animate-pulse" />
                )}
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white leading-none">
                  TRAUMA<span className="gradient-text-red">NET</span>
                </span>
                <p className="text-[10px] text-slate-500 font-medium hidden sm:block leading-none mt-0.5">
                  Nagpur Emergency AI Layer v2
                </p>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-white/[0.08] text-white border border-white/[0.1]"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${
                        isActive ? link.color : "text-slate-500"
                      }`}
                    />
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-2">
              {/* Online indicator */}
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${
                  isOnline
                    ? "text-emerald-400 bg-emerald-400/8"
                    : "text-red-400 bg-red-400/8"
                }`}
              >
                {isOnline ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                <span>{isOnline ? "Online" : "Offline"}</span>
              </div>

              {/* Inject Emergency */}
              <button
                onClick={handleQuickInject}
                disabled={injecting}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                  injecting
                    ? "bg-amber-600/80 text-white scale-95"
                    : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/25 hover:shadow-red-600/40 hover:-translate-y-0.5"
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${injecting ? "animate-spin" : "fill-current"}`} />
                <span className="hidden sm:inline">{injecting ? "Injecting..." : "Inject"}</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.15] transition-all"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-all"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Dropdown ── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/[0.06] bg-[#020817]/98 backdrop-blur-xl animate-slide-up">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-white/[0.08] text-white border border-white/[0.1]"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? link.color : "text-slate-500"}`} />
                      {link.label}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* ── Settings Modal ── */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowSettingsModal(false)}
        >
          <div className="bg-[#0c1526] border border-white/[0.1] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">AI Configuration</h3>
                <p className="text-xs text-slate-500 mt-0.5">TraumaNet v2 Gemini Engine</p>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divider" />

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div>
                  <p className="text-sm font-semibold text-white">Live Gemini 2.0 API</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    When off, uses the built-in ATLS clinical engine
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useLiveGemini}
                    onChange={(e) => setUseLiveGemini(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {useLiveGemini && (
                <div className="space-y-2 animate-slide-up">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="input-field w-full px-4 py-3 font-mono text-sm"
                  />
                  <p className="text-[11px] text-slate-500">
                    🔒 Stored in memory only. Never persisted or transmitted to any server.
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
                <p className="text-[11px] text-amber-300 leading-relaxed">
                  <strong>Simulation mode:</strong> All patient data is synthetic. ABDM not connected. Sample hospitals only.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="btn-primary w-full py-2.5 text-sm"
            >
              Save & Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
