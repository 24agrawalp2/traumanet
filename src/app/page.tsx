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
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Camera,
  Navigation,
  ArrowRight,
  Shield,
  Clock,
  HeartHandshake,
} from "lucide-react";
import SoftLockTimer from "@/components/SoftLockTimer";
import VitalsMonitor from "@/components/VitalsMonitor";
import PreReservationToggles from "@/components/PreReservationToggles";
import DocumentAIScanner from "@/components/DocumentAIScanner";
import UpiPaymentModal from "@/components/UpiPaymentModal";
import VoiceNotesRecorder from "@/components/VoiceNotesRecorder";

export default function UnifiedCockpitPage() {
  const {
    activeSession,
    hospitals,
    activeHospital,
    acceptAndLockBed,
    declineAndReroute,
    updatePreReservations,
    updateSession,
    completePayment,
    injectEmergencyScenario,
    useLiveGemini,
    geminiApiKey,
  } = useTraumaNet();

  const [showUpiModal, setShowUpiModal] = useState(false);
  const [paramedicNotes, setParamedicNotes] = useState(activeSession?.voice_notes || "");
  const [isTriaging, setIsTriaging] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "tabs">("split");
  const [activeTab, setActiveTab] = useState<"paramedic" | "er" | "family">("er");

  if (!activeSession) return null;

  const isDepositPaid = activeSession.payment_status === "PAID";
  const isBedLocked = activeSession.bed_status === "ACCEPTED_LOCKED";

  const handleParamedicTriage = async () => {
    setIsTriaging(true);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vitals: activeSession.vitals,
          notes: paramedicNotes,
          apiKey: useLiveGemini ? geminiApiKey : undefined,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const triage = json.data;
        updateSession(activeSession.session_id, {
          trauma_score: triage.trauma_score,
          severity: triage.severity,
          ai_pre_report: triage.ai_pre_report,
          required_specialists: triage.required_specialists,
          stabilization_steps: triage.stabilization_steps,
          deposit_amount_inr: triage.estimated_deposit_inr,
          voice_notes: paramedicNotes,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTriaging(false);
    }
  };

  const handleDocScanComplete = (details: any) => {
    updateSession(activeSession.session_id, {
      cost_breakdown: details.breakdown,
      deposit_amount_inr: details.breakdown.final_patient_deposit_inr,
      patient_info: {
        ...activeSession.patient_info,
        insurance_provider: details.provider,
        policy_number: details.idNumber,
        coverage_amount_inr: details.coverageInr,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
      {/* Golden Hour Value Proposition Banner */}
      <section className="bg-slate-900 border-b border-slate-800 py-6 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Golden Hour Bottleneck Elimination
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                TraumaNet AI Emergency Triage &amp; Bed Soft-Lock Platform
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Zero-delay healthcare logistics connecting In-Transit Paramedics, Hospital ER Command, and Patient Families.
              </p>
            </div>

            {/* View Mode Toggle & Inject Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setViewMode("split")}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                    viewMode === "split"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  3-Pane Split View
                </button>
                <button
                  onClick={() => setViewMode("tabs")}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                    viewMode === "tabs"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tabbed View
                </button>
              </div>

              <button
                onClick={() => injectEmergencyScenario(0)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Inject Scenario</span>
              </button>
            </div>
          </div>

          {/* 3 Bottlenecks Solved Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">1. Medical Uncertainty</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gemini 1.5 analyzes vitals &amp; wound imagery en-route to classify trauma severity.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">2. Hospital Bed Mismatch</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  15-minute flight-booking soft-lock holds ICU bed while ambulance travels.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">3. Billing Counter Delays</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  ABHA Document AI &amp; 1-click UPI payments clear admission before arrival.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Switcher if in Tabbed Mode */}
      {viewMode === "tabs" && (
        <div className="max-w-6xl mx-auto px-4 pt-6 flex gap-3">
          <button
            onClick={() => setActiveTab("paramedic")}
            className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === "paramedic"
                ? "bg-slate-800 border-red-500 text-white shadow-sm"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Ambulance className="w-4 h-4 text-red-500" />
            <span>Paramedic Fleet App</span>
          </button>
          <button
            onClick={() => setActiveTab("er")}
            className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === "er"
                ? "bg-slate-800 border-emerald-500 text-white shadow-sm"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Hospital ER Command Center</span>
          </button>
          <button
            onClick={() => setActiveTab("family")}
            className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === "family"
                ? "bg-slate-800 border-blue-500 text-white shadow-sm"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Family Pre-Admission Portal</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-[1700px] mx-auto px-4 py-6">
        {viewMode === "split" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* =========================================================================
                PANE 1: PARAMEDIC FLEET APP
            ========================================================================= */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-sm">
                    <Ambulance className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Paramedic Fleet App</h3>
                    <p className="text-xs text-slate-400">PWA Mobile • En-Route Triage</p>
                  </div>
                </div>
                <Link
                  href="/paramedic"
                  title="Open standalone view"
                  className="text-xs text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-1 transition-colors"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Vitals Telemetry */}
              <VitalsMonitor vitals={activeSession.vitals} compact />

              {/* Patient Details Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300">Active Patient</span>
                <div className="text-sm font-semibold text-white">
                  {activeSession.patient_info.name} ({activeSession.patient_info.age}y / {activeSession.patient_info.gender})
                </div>
                <p className="text-xs text-slate-400">
                  Incident: {activeSession.incident_title}
                </p>
              </div>

              {/* Paramedic Audio / Notes */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <VoiceNotesRecorder value={paramedicNotes} onChange={setParamedicNotes} />
              </div>

              {/* Hospital Destination Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    Target Hospital
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {activeHospital?.icu_beds_free} Beds Free
                  </span>
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {activeHospital?.name}
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>ETA: {activeSession.eta_minutes} mins</span>
                  <span>Dist: {activeHospital?.distance_km} km</span>
                </div>
              </div>

              {/* Paramedic Action Button */}
              <button
                onClick={handleParamedicTriage}
                disabled={isTriaging}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isTriaging ? (
                  <span>Running AI Triage...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Run AI Triage &amp; Update Hospital</span>
                  </>
                )}
              </button>
            </section>

            {/* =========================================================================
                PANE 2: HOSPITAL ER COMMAND CENTER
            ========================================================================= */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Hospital ER Command</h3>
                    <p className="text-xs text-slate-400">
                      {activeHospital?.name.split(" ")[0]} • Trauma Bay Tower
                    </p>
                  </div>
                </div>
                <Link
                  href="/hospital-er"
                  title="Open standalone view"
                  className="text-xs text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-1 transition-colors"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 15-Minute Soft Lock Countdown */}
              <SoftLockTimer
                expiresAt={activeSession.soft_lock_expires_at}
                status={activeSession.bed_status}
                hospitalName={activeHospital?.name}
              />

              {/* Bed Lock Action Buttons */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">ICU Bed Reservation:</span>
                  <span className="font-mono text-slate-400">
                    Status: <strong className="text-white">{activeSession.bed_status}</strong>
                  </span>
                </div>

                {!isBedLocked ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptAndLockBed(activeSession.session_id)}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept &amp; Lock Bed</span>
                    </button>
                    <button
                      onClick={() => declineAndReroute(activeSession.session_id)}
                      className="px-3.5 py-3 bg-slate-900 hover:bg-red-950 text-red-300 border border-slate-800 hover:border-red-500 text-xs font-semibold rounded-xl transition-all"
                    >
                      <span>Reroute</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold text-xs flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Bed Locked • Trauma Bay 4 Allocated</span>
                  </div>
                )}
              </div>

              {/* Gemini Pre-Report */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Clinical AI Pre-Report
                  </span>
                  <span className="text-xs font-mono font-bold text-red-400">
                    Score: {activeSession.trauma_score} / 10
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeSession.ai_pre_report}
                </p>
              </div>

              {/* Orders & Pre-Reservations */}
              <PreReservationToggles
                reservations={activeSession.pre_reservations}
                onUpdate={(updates) => updatePreReservations(activeSession.session_id, updates)}
              />

              {/* Live Billing Clearance */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isDepositPaid
                    ? "bg-emerald-950/25 border-emerald-500/40"
                    : "bg-slate-950 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Pre-Admission Deposit:</span>
                  <span
                    className={`font-mono font-bold ${
                      isDepositPaid ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {isDepositPaid ? "CLEARED VIA UPI" : "PENDING DEPOSIT"}
                  </span>
                </div>
                {isDepositPaid && (
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Ref: {activeSession.upi_ref_id}
                  </p>
                )}
              </div>
            </section>

            {/* =========================================================================
                PANE 3: FAMILY PRE-ADMISSION PORTAL
            ========================================================================= */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Family Pre-Admission</h3>
                    <p className="text-xs text-slate-400">Caregiver Portal • 1-Click UPI</p>
                  </div>
                </div>
                <Link
                  href="/family-portal"
                  title="Open standalone view"
                  className="text-xs text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-1 transition-colors"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Transit Notice */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Inbound Ambulance:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    ETA {activeSession.eta_minutes} Mins
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hospital:</span>
                  <span className="font-bold text-white truncate max-w-[190px]">
                    {activeHospital?.name}
                  </span>
                </div>
              </div>

              {/* Document AI Scanner */}
              <DocumentAIScanner
                onScanComplete={handleDocScanComplete}
                currentDepositInr={activeSession.deposit_amount_inr}
              />

              {/* Cost Breakdown */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-white border-b border-slate-800 pb-2 flex justify-between">
                  <span>Transparent Pre-Admission Deposit</span>
                  <span className="text-emerald-400 font-mono text-sm">
                    ₹{activeSession.deposit_amount_inr.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Secures ICU bed reservation, trauma bay kit, and emergency diagnostics without stopping at admission cash counters.
                </p>
              </div>

              {/* 1-Click UPI Payment Button */}
              <div>
                {!isDepositPaid ? (
                  <button
                    onClick={() => setShowUpiModal(true)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{activeSession.deposit_amount_inr.toLocaleString("en-IN")} via UPI</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Deposit Paid Successfully</span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Ref: {activeSession.upi_ref_id}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          /* Tabbed View */
          <div className="max-w-4xl mx-auto">
            {activeTab === "paramedic" && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Ambulance className="w-5 h-5 text-red-500" />
                    Paramedic Fleet App
                  </h3>
                  <Link
                    href="/paramedic"
                    className="text-xs text-red-400 hover:underline flex items-center gap-1"
                  >
                    <span>Full Screen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <VitalsMonitor vitals={activeSession.vitals} />
                <VoiceNotesRecorder value={paramedicNotes} onChange={setParamedicNotes} />
                <button
                  onClick={handleParamedicTriage}
                  disabled={isTriaging}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Submit &amp; Soft-Lock ICU Bed
                </button>
              </div>
            )}

            {activeTab === "er" && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    Hospital ER Command Center
                  </h3>
                  <Link
                    href="/hospital-er"
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Full Screen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <SoftLockTimer
                  expiresAt={activeSession.soft_lock_expires_at}
                  status={activeSession.bed_status}
                  hospitalName={activeHospital?.name}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => acceptAndLockBed(activeSession.session_id)}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                  >
                    Accept Patient &amp; Lock Bed
                  </button>
                  <button
                    onClick={() => declineAndReroute(activeSession.session_id)}
                    className="px-4 py-3 bg-slate-800 hover:bg-red-950 text-red-300 font-semibold text-xs rounded-xl"
                  >
                    Reroute
                  </button>
                </div>
                <PreReservationToggles
                  reservations={activeSession.pre_reservations}
                  onUpdate={(updates) => updatePreReservations(activeSession.session_id, updates)}
                />
              </div>
            )}

            {activeTab === "family" && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Family Pre-Admission Portal
                  </h3>
                  <Link
                    href="/family-portal"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Full Screen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <DocumentAIScanner
                  onScanComplete={handleDocScanComplete}
                  currentDepositInr={activeSession.deposit_amount_inr}
                />
                <button
                  onClick={() => setShowUpiModal(true)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                >
                  Pay ₹{activeSession.deposit_amount_inr.toLocaleString("en-IN")} via UPI
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* UPI Modal */}
      {showUpiModal && (
        <UpiPaymentModal
          amountInr={activeSession.deposit_amount_inr}
          patientName={activeSession.patient_info.name}
          hospitalName={activeHospital?.name || "Target Hospital"}
          onPaymentSuccess={(txnId) => {
            completePayment(activeSession.session_id, txnId);
            setShowUpiModal(false);
          }}
          onClose={() => setShowUpiModal(false)}
        />
      )}
    </div>
  );
}
