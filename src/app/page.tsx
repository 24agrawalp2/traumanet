// =====================================================================
// TRAUMANET v2 — COMMAND HUB LANDING PAGE
// Premium redesign — GDG x Ramdeobaba Hackathon
// =====================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Ambulance, Building2, Users, Zap, Activity, ArrowRight,
  Shield, Clock, Sparkles, CheckCircle2, Navigation, MapPin,
  Radio, AlertTriangle, TrendingUp, Heart, Cpu, Globe,
} from "lucide-react";

export default function HomeHubPage() {
  const { activeSession, activeHospital, injectEmergencyScenario, hospitals } = useTraumaNet();
  const [injecting, setInjecting] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const handleInject = (idx: number) => {
    setInjecting(true);
    injectEmergencyScenario(idx);
    setTimeout(() => setInjecting(false), 1200);
  };

  const roles = [
    {
      title: "Paramedic Fleet App",
      href: "/paramedic",
      icon: Ambulance,
      badge: "Mobile · PWA",
      accent: "red",
      gradient: "from-red-500/10 to-rose-600/5",
      border: "border-red-500/20 hover:border-red-500/45",
      iconGrad: "from-red-500 to-rose-600",
      glow: "hover:shadow-red-500/10",
      description: "Multilingual voice notes (Hindi/Marathi/English) → Gemini SBAR structuring → Paramedic priority setting → 100-pt hospital ranking.",
      features: ["Voice-to-SBAR (3 languages)", "Camera wound capture", "Algorithmic hospital ranking", "Offline resilience"],
    },
    {
      title: "Hospital ER Command",
      href: "/hospital-er",
      icon: Building2,
      badge: "Desktop · Tablet",
      accent: "emerald",
      gradient: "from-emerald-500/10 to-teal-600/5",
      border: "border-emerald-500/20 hover:border-emerald-500/45",
      iconGrad: "from-emerald-500 to-teal-600",
      glow: "hover:shadow-emerald-500/10",
      description: "Live inbound alert chime, 3-tier confirmation (Accepting/Limited/Not Accepting), 15-min hold timer, 4-part ER readiness checklist.",
      features: ["Synth chime alert", "3-tier acceptance", "15-min auto-expiring hold", "ER readiness checklist"],
    },
    {
      title: "Family Pre-Admission",
      href: "/family-portal",
      icon: Users,
      badge: "Caregiver Mobile",
      accent: "blue",
      gradient: "from-blue-500/10 to-indigo-600/5",
      border: "border-blue-500/20 hover:border-blue-500/45",
      iconGrad: "from-blue-500 to-indigo-600",
      glow: "hover:shadow-blue-500/10",
      description: "DPDP consent → insurance card AI-OCR → payment route suggestion → WhatsApp share. Zero UPI, zero payment barriers to emergency care.",
      features: ["DPDP consent screen", "Insurance card OCR", "PM-JAY / Road Accident route", "WhatsApp family link"],
    },
    {
      title: "Live GPS Navigation",
      href: "/navigation",
      icon: Navigation,
      badge: "In-Ambulance HUD",
      accent: "sky",
      gradient: "from-sky-500/10 to-cyan-600/5",
      border: "border-sky-500/20 hover:border-sky-500/45",
      iconGrad: "from-sky-500 to-cyan-600",
      glow: "hover:shadow-sky-500/10",
      description: "Google Maps–style driving HUD for Nagpur ambulance corridors with real-time traffic overlay and ETA countdown.",
      features: ["Real-time traffic layer", "Nagpur corridor mapping", "Ambulance progress tracker", "Map type toggle"],
    },
    {
      title: "Demo & Judging Cockpit",
      href: "/admin-demo",
      icon: Radio,
      badge: "Hackathon Presentation",
      accent: "amber",
      gradient: "from-amber-500/10 to-orange-600/5",
      border: "border-amber-500/20 hover:border-amber-500/45",
      iconGrad: "from-amber-500 to-orange-600",
      glow: "hover:shadow-amber-500/10",
      description: "5 official PDF presets (EN/Hindi/Marathi), 30-second scenario injector, live audit trail, and judge Q&A cheat sheet.",
      features: ["5 test presets (3 languages)", "30-sec scenario injector", "Live audit trail", "Judge Q&A answers"],
    },
  ];

  const stats = [
    { label: "Nagpur Hospitals", value: hospitals.length.toString(), sub: "pre-seeded trauma centers", icon: Building2, color: "text-emerald-400" },
    { label: "Ranking Factors", value: "100", sub: "pts across 4 weighted dimensions", icon: TrendingUp, color: "text-blue-400" },
    { label: "Languages", value: "3", sub: "Hindi · Marathi · English", icon: Globe, color: "text-purple-400" },
    { label: "Hold Duration", value: "15m", sub: "auto-expiring hospital lock", icon: Clock, color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen hero-gradient text-white">
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-14 px-4 overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
            {/* Left copy */}
            <div className="flex-1 space-y-6 animate-slide-up">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                  Nagpur Emergency AI Layer · v2
                </span>
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                  Wrong hospital transfers{" "}
                  <span className="gradient-text-red">cost lives.</span>
                  <br />
                  <span className="text-slate-300 font-light">TraumaNet stops them.</span>
                </h1>
                <p className="mt-4 text-slate-400 text-base md:text-lg leading-relaxed max-w-xl">
                  India's Golden Hour is lost not in traffic — it's lost in phone calls, bed mismatches, and billing delays.
                  TraumaNet is a <strong className="text-slate-200">hospital readiness coordination layer</strong> for Nagpur ambulances.
                </p>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleInject(0)}
                  disabled={injecting}
                  className="btn-primary flex items-center gap-2 px-6 py-3 text-sm"
                >
                  <Zap className={`w-4 h-4 ${injecting ? "animate-spin" : "fill-current"}`} />
                  {injecting ? "Injecting scenario..." : "Inject Live Scenario"}
                </button>
                <Link
                  href="/admin-demo"
                  className="btn-ghost flex items-center gap-2 px-6 py-3 text-sm font-semibold"
                >
                  <Radio className="w-4 h-4" />
                  Open Demo Cockpit
                </Link>
              </div>

              {/* Legal note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Supreme Court mandate</strong> — <em>Parmanand Katara v. Union of India</em>: Emergency care is never conditional on payment. TraumaNet collects zero payments.
                </p>
              </div>
            </div>

            {/* Right — live status card */}
            <div className="lg:w-80 w-full shrink-0 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <div className="glass rounded-2xl p-5 space-y-4 card-shine glow-red">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Status</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeSession ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                    {activeSession ? "● ACTIVE CASE" : "○ STANDBY"}
                  </span>
                </div>

                <div className="divider" />

                {activeSession ? (
                  <div className="space-y-3 animate-slide-up">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Case ID</span>
                      <span className="font-mono text-slate-200">{activeSession.case_id?.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Priority</span>
                      <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                        activeSession.priority === "P1_CRITICAL" ? "badge-p1" :
                        activeSession.priority === "P2_SERIOUS" ? "badge-p2" : "badge-p3"
                      }`}>
                        {activeSession.priority?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Hospital</span>
                      <span className="text-slate-200 text-right max-w-[140px] truncate">{activeHospital?.name || "Routing…"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">ETA</span>
                      <span className="font-mono text-emerald-400">{activeSession.eta_minutes} min</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {[
                        { label: "HR", value: activeSession.vitals?.pulse_rate, unit: "bpm" },
                        { label: "SBP", value: activeSession.vitals?.blood_pressure_sys, unit: "mmHg" },
                        { label: "SpO₂", value: activeSession.vitals?.spo2, unit: "%" },
                      ].map((v) => (
                        <div key={v.label} className="bg-white/[0.04] rounded-lg p-2 text-center">
                          <p className="text-[9px] text-slate-500 uppercase">{v.label}</p>
                          <p className="font-mono text-sm font-bold text-white">{v.value}</p>
                          <p className="text-[9px] text-slate-500">{v.unit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-500">No active emergency</p>
                    <p className="text-xs text-slate-600">Inject a scenario to begin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────── */}
      <section className="border-y border-white/[0.05] bg-white/[0.02] py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-slate-500 leading-tight">{s.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Module Cards ───────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Platform Modules</h2>
            <p className="text-slate-400 text-sm mt-1">Each module serves a distinct role in the emergency care chain</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role, i) => {
              const Icon = role.icon;
              return (
                <Link
                  key={role.href}
                  href={role.href}
                  className={`group relative rounded-2xl border bg-gradient-to-br ${role.gradient} ${role.border} p-5 transition-all duration-300 hover:shadow-xl ${role.glow} card-shine animate-slide-up`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.iconGrad} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full">
                      {role.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{role.description}</p>

                  <ul className="space-y-1.5 mb-4">
                    {role.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[11px] text-slate-400">
                        <CheckCircle2 className="w-3 h-3 text-slate-600 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                    Open module
                    <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-2xl p-6 md:p-8 card-shine">
            <div className="flex items-center gap-2 mb-6">
              <Cpu className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold text-white">How TraumaNet v2 Works</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 ml-auto">
                3 bottlenecks solved
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "SBAR Structuring",
                  color: "text-red-400 bg-red-500/10 border-red-500/20",
                  icon: Sparkles,
                  desc: "Paramedic records Hindi/Marathi/English note. Gemini structures it into 4-part clinical SBAR with source quotes and confidence scores — never diagnosing, only organizing.",
                },
                {
                  step: "02",
                  title: "100-Point Hospital Ranking",
                  color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                  icon: TrendingUp,
                  desc: "Hard filters (CT, Blood Bank, Trauma Surgeon, 30-min ETA) eliminate ineligible hospitals. Score = Capability (40) + ETA (25) + Freshness (20) + Reliability (15) × Status multiplier.",
                },
                {
                  step: "03",
                  title: "15-Min Confirmation Hold",
                  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                  icon: Shield,
                  desc: "ER Command Tower accepts/limits/declines with an auto-expiring 15-minute hold. If no response in 2 minutes, next hospital is pinged and the 108 fallback number is shown.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="space-y-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${item.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      Step {item.step}
                    </div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
