"use client";

import React, { useState } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Building2,
  Bell,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Droplet,
  Scan,
  UserCheck,
  DollarSign,
  Clock,
  Sparkles,
  RefreshCw,
  Phone,
  Volume2,
  VolumeX,
} from "lucide-react";
import SoftLockTimer from "@/components/SoftLockTimer";
import VitalsMonitor from "@/components/VitalsMonitor";
import PreReservationToggles from "@/components/PreReservationToggles";
import LiveMap from "@/components/LiveMap";
import { playErAlertChime } from "@/lib/audio";

export default function HospitalErPage() {
  const {
    activeSession,
    hospitals,
    activeHospital,
    acceptAndLockBed,
    declineAndReroute,
    updatePreReservations,
    setActiveSessionId,
    sessions,
  } = useTraumaNet();

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
      setTimeout(() => setRerouting(false), 600);
    }
  };

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
          <h2 className="text-lg font-bold">No Active Inbound Emergencies</h2>
          <p className="text-xs text-slate-400">All trauma bays currently at standby readiness.</p>
        </div>
      </div>
    );
  }

  const isDepositPaid = activeSession.payment_status === "PAID";
  const isBedLocked = activeSession.bed_status === "ACCEPTED_LOCKED";

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
      {/* Top ER Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emergency-red flex items-center justify-center shadow-lg shadow-red-950/60 animate-pulse">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white">
                  {activeHospital?.name || "AIIMS Apex Trauma Center"}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold uppercase border border-red-500/30">
                  ER COMMAND TOWER
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {activeHospital?.address} • Trauma Hotline: {activeHospital?.emergency_contact}
              </p>
            </div>
          </div>

          {/* Quick Audio & Bay Stats */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              title={soundMuted ? "Unmute ER Chime" : "Mute ER Chime"}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={handleTestChime}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Chime</span>
            </button>

            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 text-xs">
              <span className="text-slate-400">ICU Capacity:</span>
              <span className="font-black text-emerald-400 font-mono">
                {activeHospital?.icu_beds_free} / {activeHospital?.total_icu_beds} Free
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Urgent Inbound Emergency Alert Panel */}
        <div
          className={`rounded-2xl p-4 border transition-all ${
            isBedLocked
              ? "bg-emerald-950/40 border-emerald-500/50"
              : "bg-red-950/60 border-red-500/70 shadow-2xl shadow-red-950/40 animate-pulse_fast"
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emergency-red animate-ping" />
                <span className="text-xs uppercase font-black tracking-widest text-red-400">
                  INBOUND PRIORITY EMERGENCY • GOLDEN HOUR ACTIVE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono">
                  {activeSession.ambulance_id}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-white">
                {activeSession.patient_info.name} ({activeSession.patient_info.age}y / {activeSession.patient_info.gender})
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Incident: {activeSession.incident_title}
              </p>
            </div>

            {/* Prominent Action Buttons: Accept & Lock vs Decline / Reroute */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {!isBedLocked ? (
                <>
                  <button
                    onClick={handleAccept}
                    className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs md:text-sm rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>[ACCEPT PATIENT &amp; LOCK BED]</span>
                  </button>

                  <button
                    onClick={handleDecline}
                    disabled={rerouting}
                    className="px-4 py-3 bg-slate-800 hover:bg-red-950/80 text-red-300 hover:text-red-200 border border-slate-700 hover:border-red-500 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-4 h-4 ${rerouting ? "animate-spin" : ""}`} />
                    <span>[DECLINE / REROUTE]</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>BED LOCKED • TRAUMA BAY 4 ALLOCATED</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 15-Minute Flight-Booking Soft-Lock Countdown */}
        <SoftLockTimer
          expiresAt={activeSession.soft_lock_expires_at}
          status={activeSession.bed_status}
          hospitalName={activeHospital?.name}
        />

        {/* Grid: Live Vitals Stream & Interactive Corridor Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Patient Vitals Stream */}
          <div className="space-y-4">
            <VitalsMonitor vitals={activeSession.vitals} />

            {/* Gemini AI Clinical Pre-Report */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Gemini 1.5 Medical Pre-Report
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold">
                  TRAUMA SCORE: {activeSession.trauma_score} / 10 ({activeSession.severity})
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                {activeSession.ai_pre_report}
              </div>

              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Required Sub-Specialties On Arrival:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeSession.required_specialists.map((spec, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-300 font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Routing Map */}
          <div className="space-y-4">
            <LiveMap session={activeSession} hospitals={hospitals} height="360px" />

            {/* Real-Time Billing & Deposit Clearance Status Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isDepositPaid
                  ? "bg-emerald-950/40 border-emerald-500/50 shadow-xl shadow-emerald-950/30"
                  : "bg-slate-900 border-slate-800 shadow-xl"
              }`}
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <DollarSign
                    className={`w-4 h-4 ${isDepositPaid ? "text-emerald-400" : "text-amber-400"}`}
                  />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Pre-Admission Billing Deposit Clearance
                  </h4>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded font-mono font-bold ${
                    isDepositPaid
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                  }`}
                >
                  {isDepositPaid ? "CLEARANCE APPROVED" : "PENDING FAMILY DEPOSIT"}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400">Required Pre-Admission Deposit:</span>
                  <div className="text-xl font-black text-white font-mono">
                    ₹{activeSession.deposit_amount_inr.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="text-right">
                  {isDepositPaid ? (
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PAID VIA UPI
                      </span>
                      <p className="text-[10px] font-mono text-slate-300">
                        {activeSession.upi_ref_id || "UPI-884920-VERIFIED"}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-400 font-medium">
                      Awaiting UPI confirmation from Family Portal
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-Reservation Toggles (Blood Bank, CT/MRI, Specialists) */}
        <PreReservationToggles
          reservations={activeSession.pre_reservations}
          onUpdate={(updates) => updatePreReservations(activeSession.session_id, updates)}
        />
      </main>
    </div>
  );
}
