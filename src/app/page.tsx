"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Ambulance,
  Building2,
  Users,
  Zap,
  Activity,
  ArrowRight,
  Shield,
  Clock,
  CreditCard,
  Layers,
  Sparkles,
} from "lucide-react";
import SoftLockTimer from "@/components/SoftLockTimer";
import VitalsMonitor from "@/components/VitalsMonitor";
import PreReservationToggles from "@/components/PreReservationToggles";
import DocumentAIScanner from "@/components/DocumentAIScanner";
import VoiceNotesRecorder from "@/components/VoiceNotesRecorder";

export default function HomeHubPage() {
  const {
    activeSession,
    activeHospital,
    injectEmergencyScenario,
    acceptAndLockBed,
    declineAndReroute,
    updatePreReservations,
    completePayment,
  } = useTraumaNet();

  const [showLiveStageView, setShowLiveStageView] = useState(false);

  const roles = [
    {
      title: "Paramedic Fleet App",
      href: "/paramedic",
      icon: Ambulance,
      badge: "Mobile / PWA",
      color: "border-red-500/30 bg-red-950/15 hover:border-red-500/60",
      iconBg: "bg-red-600",
      description:
        "Camera wound capture, real-time vitals monitoring, voice dictation, and multimodal Gemini 1.5 clinical triage en-route.",
      actionLabel: "Open Paramedic App",
    },
    {
      title: "Hospital ER Command Center",
      href: "/hospital-er",
      icon: Building2,
      badge: "Desktop Dashboard",
      color: "border-emerald-500/30 bg-emerald-950/15 hover:border-emerald-500/60",
      iconBg: "bg-emerald-600",
      description:
        "Auditory chime alert, 15-minute flight-booking ICU bed soft-lock countdown, pre-reservation toggles, and live doctor pre-reports.",
      actionLabel: "Open ER Command",
    },
    {
      title: "Family Pre-Admission Portal",
      href: "/family-portal",
      icon: Users,
      badge: "Caregiver Mobile",
      color: "border-blue-500/30 bg-blue-950/15 hover:border-blue-500/60",
      iconBg: "bg-blue-600",
      description:
        "Emergency ambulance transit tracker, Ayushman Bharat (ABHA) Document AI simulator, and 1-click instant UPI pre-admission deposits.",
      actionLabel: "Open Family Portal",
    },
    {
      title: "Demo & Judging Cockpit",
      href: "/admin-demo",
      icon: Activity,
      badge: "Hackathon Presentation",
      color: "border-amber-500/30 bg-amber-950/15 hover:border-amber-500/60",
      iconBg: "bg-amber-600",
      description:
        "Instant 30-second emergency scenario injection, live Gemini API key tester, ambulance GPS corridor simulation, and JSON inspector.",
      actionLabel: "Open Judging Cockpit",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Hero Banner */}
      <section className="bg-slate-900 border-b border-slate-800 py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Golden Hour Emergency Platform
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Welcome to TraumaNet
              </h1>
              <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
                An AI-driven emergency triage and smart bed logistics platform designed to eliminate the 3 critical Golden Hour bottlenecks in trauma care.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLiveStageView(!showLiveStageView)}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all border flex items-center gap-2 ${
                  showLiveStageView
                    ? "bg-slate-800 text-white border-slate-600 shadow-sm"
                    : "bg-slate-950 text-slate-300 border-slate-800 hover:text-white"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{showLiveStageView ? "Hide 3-Pane Stage View" : "Show 3-Pane Stage View"}</span>
              </button>

              <button
                onClick={() => injectEmergencyScenario(0)}
                className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Inject Scenario</span>
              </button>
            </div>
          </div>

          {/* 3 Golden Hour Bottlenecks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <h4 className="text-sm font-bold text-red-400">1. Medical Uncertainty</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini 1.5 analyzes vitals &amp; wound pictures en-route, generating doctor pre-reports before arrival.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <h4 className="text-sm font-bold text-amber-400">2. Hospital Bed Mismatch</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                A 15-minute flight-booking soft-lock holds ICU beds, preventing ambulance turnaways at gate.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <h4 className="text-sm font-bold text-emerald-400">3. Billing Counter Delays</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                ABHA Document AI &amp; 1-click UPI payments clear emergency pre-admission deposits instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Role Portal Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Select User Role or View</h2>
            <span className="text-xs text-slate-400">Each role runs independently with real-time state sync</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.href}
                  className={`border rounded-3xl p-6 transition-all space-y-4 ${role.color}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0" style={{ backgroundColor: role.iconBg.replace("bg-", "") }}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                      {role.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white">{role.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={role.href}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <span>{role.actionLabel}</span>
                      <ArrowRight className="w-4 h-4 text-red-500" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optional 3-Pane Stage View */}
        {showLiveStageView && activeSession && (
          <div className="space-y-4 pt-6 border-t border-slate-800 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">
                  Live Synchronized 3-Pane Stage View
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Active Session: {activeSession.incident_title}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Paramedic */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Ambulance className="w-4 h-4 text-red-500" />
                    Paramedic Fleet
                  </h4>
                  <Link href="/paramedic" className="text-xs text-red-400 hover:underline">
                    Expand Page
                  </Link>
                </div>
                <VitalsMonitor vitals={activeSession.vitals} compact />
                <Link
                  href="/paramedic"
                  className="block w-full py-3 bg-red-600 hover:bg-red-500 text-center text-white font-bold text-xs rounded-xl"
                >
                  Manage Paramedic Intake →
                </Link>
              </div>

              {/* Hospital ER */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    Hospital ER Tower
                  </h4>
                  <Link href="/hospital-er" className="text-xs text-emerald-400 hover:underline">
                    Expand Page
                  </Link>
                </div>
                <SoftLockTimer
                  expiresAt={activeSession.soft_lock_expires_at}
                  status={activeSession.bed_status}
                  hospitalName={activeHospital?.name}
                />
                <Link
                  href="/hospital-er"
                  className="block w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-center text-white font-bold text-xs rounded-xl"
                >
                  Manage Hospital Command →
                </Link>
              </div>

              {/* Family */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Family Portal
                  </h4>
                  <Link href="/family-portal" className="text-xs text-blue-400 hover:underline">
                    Expand Page
                  </Link>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
                  <span className="text-slate-400">Pre-Admission Deposit:</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    ₹{activeSession.deposit_amount_inr.toLocaleString("en-IN")}
                  </div>
                  <p className="text-slate-500">Status: {activeSession.payment_status}</p>
                </div>
                <Link
                  href="/family-portal"
                  className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-center text-white font-bold text-xs rounded-xl"
                >
                  Manage Family Pre-Admission →
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
