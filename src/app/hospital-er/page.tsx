"use client";

import React, { useState } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Building2,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Activity,
  DollarSign,
  Sparkles,
  RefreshCw,
  Volume2,
  VolumeX,
  Clock,
  Layers,
  FileText,
  Stethoscope,
} from "lucide-react";
import SoftLockTimer from "@/components/SoftLockTimer";
import VitalsMonitor from "@/components/VitalsMonitor";
import PreReservationToggles from "@/components/PreReservationToggles";
import LiveMap from "@/components/LiveMap";
import { playErAlertChime } from "@/lib/audio";

type ErTab = "incident" | "vitals" | "orders";

export default function HospitalErPage() {
  const {
    activeSession,
    hospitals,
    activeHospital,
    acceptAndLockBed,
    declineAndReroute,
    updatePreReservations,
  } = useTraumaNet();

  const [activeTab, setActiveTab] = useState<ErTab>("incident");
  const [soundMuted, setSoundMuted] = useState(false);
  const [rerouting, setRerouting] = useState(false);

  const handleTestChime = () => {
    if (!soundMuted) {
      playErAlertChime();
    }
  };

  const handleAccept = () => {
    if (activeSession) {
      acceptAndLockBed(activeSession.session_id);
    }
  };

  const handleDecline = () => {
    if (activeSession) {
      setRerouting(true);
      declineAndReroute(activeSession.session_id);
      setTimeout(() => setRerouting(false), 500);
    }
  };

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold">No Active Inbound Emergencies</h2>
          <p className="text-xs text-slate-400">All trauma bays currently at standby readiness.</p>
        </div>
      </div>
    );
  }

  const isDepositPaid = activeSession.payment_status === "PAID";
  const isBedLocked = activeSession.bed_status === "ACCEPTED_LOCKED";

  const tabs = [
    { id: "incident", label: "1. Incident & Bed Soft-Lock", icon: Clock },
    { id: "vitals", label: "2. Vitals & Medical Pre-Report", icon: Activity },
    { id: "orders", label: "3. Clinical Orders & Billing", icon: Stethoscope },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Top ER Header */}
      <div className="bg-slate-900 border-b border-slate-800 py-4 px-4 sticky top-18 z-30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">
                  {activeHospital?.name || "AIIMS Apex Trauma Center"}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-300">
                  ER Command Tower
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {activeHospital?.address} • Hotline: {activeHospital?.emergency_contact}
              </p>
            </div>
          </div>

          {/* Quick Chime & ICU Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              title={soundMuted ? "Unmute Chime" : "Mute Chime"}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={handleTestChime}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Chime</span>
            </button>

            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
              <span className="text-slate-400">ICU Capacity:</span>
              <strong className="text-emerald-400 font-mono text-sm">
                {activeHospital?.icu_beds_free} Free
              </strong>
            </div>
          </div>
        </div>

        {/* Clean Sub-Tabs */}
        <div className="max-w-6xl mx-auto pt-3 flex gap-2">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as ErTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* =========================================================================
            TAB 1: INCIDENT & BED SOFT-LOCK
        ========================================================================= */}
        {activeTab === "incident" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Urgent Alert Banner */}
            <div
              className={`rounded-3xl p-6 border transition-all ${
                isBedLocked
                  ? "bg-emerald-950/25 border-emerald-500/40"
                  : "bg-red-950/40 border-red-500/50"
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs uppercase font-bold tracking-wider text-red-400">
                      Inbound Golden Hour Emergency
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 font-mono">
                      {activeSession.ambulance_id}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {activeSession.patient_info.name} ({activeSession.patient_info.age}y / {activeSession.patient_info.gender})
                  </h2>
                  <p className="text-sm text-slate-300">
                    Incident: {activeSession.incident_title}
                  </p>
                </div>

                {/* Accept / Reroute Action Buttons */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {!isBedLocked ? (
                    <>
                      <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Accept Patient &amp; Lock Bed</span>
                      </button>

                      <button
                        onClick={handleDecline}
                        disabled={rerouting}
                        className="px-5 py-4 bg-slate-800 hover:bg-red-950 text-red-300 hover:text-red-200 border border-slate-700 text-xs sm:text-sm font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${rerouting ? "animate-spin" : ""}`} />
                        <span>Reroute</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-sm">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>ICU Bed Locked • Trauma Bay 4 Prepared</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 15-Minute Soft Lock Countdown */}
            <SoftLockTimer
              expiresAt={activeSession.soft_lock_expires_at}
              status={activeSession.bed_status}
              hospitalName={activeHospital?.name}
            />

            {/* Interactive Corridor Map */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-white">
                Live Ambulance Corridor &amp; ETA Progress
              </h3>
              <LiveMap session={activeSession} hospitals={hospitals} height="380px" />
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: VITALS STREAM & MEDICAL PRE-REPORT
        ========================================================================= */}
        {activeTab === "vitals" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <VitalsMonitor vitals={activeSession.vitals} />

            {/* Gemini Pre-Report Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Gemini 1.5 Clinical Summary</h3>
                </div>
                <span className="text-sm font-mono font-bold px-3 py-1 rounded-full bg-red-500/15 text-red-300">
                  Score: {activeSession.trauma_score} / 10 ({activeSession.severity})
                </span>
              </div>

              <p className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans">
                {activeSession.ai_pre_report}
              </p>

              <div>
                <span className="text-xs font-bold text-slate-300 block mb-3">
                  Required Sub-Specialties On Arrival:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {activeSession.required_specialists.map((spec, i) => (
                    <span
                      key={i}
                      className="text-xs sm:text-sm px-4 py-1.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-300 font-semibold"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: CLINICAL ORDERS & BILLING CLEARANCE
        ========================================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Pre-Reservation Orders */}
            <PreReservationToggles
              reservations={activeSession.pre_reservations}
              onUpdate={(updates) => updatePreReservations(activeSession.session_id, updates)}
            />

            {/* Billing Deposit Clearance Status */}
            <div
              className={`p-6 rounded-3xl border transition-all ${
                isDepositPaid
                  ? "bg-emerald-950/25 border-emerald-500/40"
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <DollarSign
                    className={`w-5 h-5 ${isDepositPaid ? "text-emerald-400" : "text-amber-400"}`}
                  />
                  <h4 className="text-base font-bold text-white">
                    Emergency Pre-Admission Billing Deposit
                  </h4>
                </div>
                <span
                  className={`text-xs px-3.5 py-1 rounded-full font-bold ${
                    isDepositPaid
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {isDepositPaid ? "CLEARANCE APPROVED" : "PENDING DEPOSIT"}
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Pre-Admission Deposit:</span>
                  <div className="text-3xl font-bold text-white font-mono mt-1">
                    ₹{activeSession.deposit_amount_inr.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="text-right">
                  {isDepositPaid ? (
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                        <CheckCircle2 className="w-4 h-4" />
                        PAID VIA UPI
                      </span>
                      <p className="text-xs font-mono text-slate-300">
                        {activeSession.upi_ref_id || "UPI-VERIFIED"}
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-amber-400 font-medium">
                      Awaiting UPI confirmation from Family Portal
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
