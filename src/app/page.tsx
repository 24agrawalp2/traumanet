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
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Droplet,
  Scan,
  UserCheck,
  Camera,
  Upload,
  Send,
  Navigation,
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
    createSession,
    completePayment,
    injectEmergencyScenario,
    isOnline,
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
      {/* Sub-Header Presentation Control Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Synchronized 3-Pane Cockpit
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden lg:inline">
              Simultaneous real-time view across Paramedic Mobile, Hospital ER Tower &amp; Family UPI Portal
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode("split")}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  viewMode === "split"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                3-Pane Split View
              </button>
              <button
                onClick={() => setViewMode("tabs")}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  viewMode === "tabs"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Tabbed Focus View
              </button>
            </div>

            <button
              onClick={() => injectEmergencyScenario(0)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Reset &amp; Inject Case #1</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Selectors when in Tabbed Mode */}
      {viewMode === "tabs" && (
        <div className="max-w-5xl mx-auto px-4 pt-4 flex gap-2">
          <button
            onClick={() => setActiveTab("paramedic")}
            className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === "paramedic"
                ? "bg-red-950/60 border-red-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Ambulance className="w-4 h-4 text-red-400" />
            <span>Role 1: Paramedic Fleet App</span>
          </button>
          <button
            onClick={() => setActiveTab("er")}
            className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === "er"
                ? "bg-emerald-950/60 border-emerald-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Role 2: Hospital ER Command Center</span>
          </button>
          <button
            onClick={() => setActiveTab("family")}
            className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === "family"
                ? "bg-blue-950/60 border-blue-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Role 3: Family Pre-Admission &amp; UPI</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-[1700px] mx-auto px-4 py-6">
        {viewMode === "split" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* =========================================================================
                PANE 1: PARAMEDIC FLEET APP (MOBILE VIEW)
            ========================================================================= */}
            <section className="bg-slate-900/95 border-2 border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emergency-red flex items-center justify-center shadow-lg shadow-red-950/50">
                    <Ambulance className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      1. Paramedic Fleet App
                    </h3>
                    <p className="text-[10px] text-slate-400">PWA Mobile View • In-Transit</p>
                  </div>
                </div>
                <Link
                  href="/paramedic"
                  title="Open standalone page"
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Vitals & ECG Stream */}
              <VitalsMonitor vitals={activeSession.vitals} compact />

              {/* Camera & Injury Preview */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-accent-blue" />
                    Visible Trauma Wound Capture
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Edge AI</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <p className="font-semibold text-white">
                    Incident: {activeSession.incident_title}
                  </p>
                  <p className="text-slate-400">
                    Patient: {activeSession.patient_info.name} ({activeSession.patient_info.age}y / {activeSession.patient_info.gender})
                  </p>
                </div>
              </div>

              {/* Voice Notes & Overrides */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <VoiceNotesRecorder value={paramedicNotes} onChange={setParamedicNotes} />
              </div>

              {/* Smart Routing Preview */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    Target Hospital Matched
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    {activeHospital?.icu_beds_free} ICU Free
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {activeHospital?.name}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>ETA: {activeSession.eta_minutes} mins</span>
                  <span>Dist: {activeHospital?.distance_km} km</span>
                </div>
              </div>

              {/* Paramedic Triage Trigger */}
              <div className="pt-auto mt-auto">
                <button
                  onClick={handleParamedicTriage}
                  disabled={isTriaging}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-all uppercase"
                >
                  {isTriaging ? (
                    <span>Running Multimodal Triage...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Re-Run AI Triage &amp; Update ER</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* =========================================================================
                PANE 2: HOSPITAL ER COMMAND CENTER (DESKTOP VIEW)
            ========================================================================= */}
            <section className="bg-slate-900/95 border-2 border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      2. Hospital ER Command Center
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {activeHospital?.name.split(" ")[0]} • Level 1 Trauma
                    </p>
                  </div>
                </div>
                <Link
                  href="/hospital-er"
                  title="Open standalone page"
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* 15-Minute Soft Lock Countdown */}
              <SoftLockTimer
                expiresAt={activeSession.soft_lock_expires_at}
                status={activeSession.bed_status}
                hospitalName={activeHospital?.name}
              />

              {/* Accept & Lock Bed Action Buttons */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">
                    Bed Soft-Lock Protocol:
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Status: <strong className="text-white">{activeSession.bed_status}</strong>
                  </span>
                </div>

                {!isBedLocked ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptAndLockBed(activeSession.session_id)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-950/40 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>[ACCEPT &amp; LOCK BED]</span>
                    </button>
                    <button
                      onClick={() => declineAndReroute(activeSession.session_id)}
                      className="px-3 py-2.5 bg-slate-900 hover:bg-red-950 text-red-300 border border-slate-800 hover:border-red-500 text-xs font-semibold rounded-xl transition-all"
                    >
                      <span>[REROUTE]</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>ICU BED LOCKED • TRAUMA BAY READY</span>
                  </div>
                )}
              </div>

              {/* AI Clinical Pre-Report */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Gemini 1.5 Medical Pre-Report
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold">
                    SCORE: {activeSession.trauma_score}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {activeSession.ai_pre_report}
                </p>
              </div>

              {/* Pre-Reservation Toggles */}
              <PreReservationToggles
                reservations={activeSession.pre_reservations}
                onUpdate={(updates) => updatePreReservations(activeSession.session_id, updates)}
              />

              {/* Live Billing Clearance Status */}
              <div
                className={`p-3 rounded-xl border mt-auto transition-all ${
                  isDepositPaid
                    ? "bg-emerald-950/40 border-emerald-500/50"
                    : "bg-slate-950 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Pre-Admission Deposit Clearance:</span>
                  <span
                    className={`font-mono font-bold ${
                      isDepositPaid ? "text-emerald-400" : "text-amber-400 animate-pulse"
                    }`}
                  >
                    {isDepositPaid ? "CLEARANCE APPROVED" : "PENDING UPI DEPOSIT"}
                  </span>
                </div>
                {isDepositPaid && (
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Ref: {activeSession.upi_ref_id}
                  </p>
                )}
              </div>
            </section>

            {/* =========================================================================
                PANE 3: FAMILY PRE-ADMISSION & PAYMENT PORTAL (MOBILE VIEW)
            ========================================================================= */}
            <section className="bg-slate-900/95 border-2 border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent-blue flex items-center justify-center shadow-lg shadow-blue-950/50">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      3. Family Pre-Admission Portal
                    </h3>
                    <p className="text-[10px] text-slate-400">Instant Pre-Auth &amp; UPI Deposit</p>
                  </div>
                </div>
                <Link
                  href="/family-portal"
                  title="Open standalone page"
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Emergency Banner */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Inbound Ambulance:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    ETA {activeSession.eta_minutes} Mins
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Hospital:</span>
                  <span className="font-bold text-white truncate max-w-[170px]">
                    {activeHospital?.name}
                  </span>
                </div>
              </div>

              {/* Document AI Simulator (ABHA / Insurance OCR) */}
              <DocumentAIScanner
                onScanComplete={handleDocScanComplete}
                currentDepositInr={activeSession.deposit_amount_inr}
              />

              {/* Itemized Cost Breakdown */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-white border-b border-slate-800 pb-1.5 flex justify-between">
                  <span>Transparent ER Pre-Admission Deposit</span>
                  <span className="text-emerald-400 font-mono">
                    ₹{activeSession.deposit_amount_inr.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Includes ICU reservation lock, emergency stabilization kit, and initial surgical standby.
                </p>
              </div>

              {/* 1-Click UPI Payment Button */}
              <div className="mt-auto pt-2">
                {!isDepositPaid ? (
                  <button
                    onClick={() => setShowUpiModal(true)}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{activeSession.deposit_amount_inr.toLocaleString("en-IN")} via UPI (Instant ER Clearance)</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold text-xs uppercase">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Deposit Paid Successfully</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
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
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Ambulance className="w-5 h-5 text-emergency-red" />
                    Paramedic Fleet Terminal
                  </h3>
                  <Link
                    href="/paramedic"
                    className="text-xs text-emergency-red hover:underline flex items-center gap-1"
                  >
                    <span>Full Screen</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <VitalsMonitor vitals={activeSession.vitals} />
                <VoiceNotesRecorder value={paramedicNotes} onChange={setParamedicNotes} />
                <button
                  onClick={handleParamedicTriage}
                  disabled={isTriaging}
                  className="w-full py-3.5 bg-emergency-red hover:bg-emergency-red-dark text-white font-bold text-xs rounded-xl transition-all"
                >
                  Submit &amp; Soft-Lock ICU Bed
                </button>
              </div>
            )}

            {activeTab === "er" && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    Hospital ER Command Center
                  </h3>
                  <Link
                    href="/hospital-er"
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Full Screen</span>
                    <ExternalLink className="w-3 h-3" />
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
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl"
                  >
                    [ACCEPT PATIENT &amp; LOCK BED]
                  </button>
                  <button
                    onClick={() => declineAndReroute(activeSession.session_id)}
                    className="px-4 py-3 bg-slate-800 hover:bg-red-950 text-red-300 font-semibold text-xs rounded-xl"
                  >
                    [DECLINE / REROUTE]
                  </button>
                </div>
                <PreReservationToggles
                  reservations={activeSession.pre_reservations}
                  onUpdate={(updates) => updatePreReservations(activeSession.session_id, updates)}
                />
              </div>
            )}

            {activeTab === "family" && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent-blue" />
                    Family Pre-Admission &amp; Payment Portal
                  </h3>
                  <Link
                    href="/family-portal"
                    className="text-xs text-accent-blue hover:underline flex items-center gap-1"
                  >
                    <span>Full Screen</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <DocumentAIScanner
                  onScanComplete={handleDocScanComplete}
                  currentDepositInr={activeSession.deposit_amount_inr}
                />
                <button
                  onClick={() => setShowUpiModal(true)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl"
                >
                  Pay ₹{activeSession.deposit_amount_inr.toLocaleString("en-IN")} via UPI
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* UPI Payment Modal */}
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
