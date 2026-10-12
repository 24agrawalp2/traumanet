// =====================================================================
// TRAUMANET v2 — HOSPITAL ER COMMAND TOWER (PREMIUM REDESIGN)
// GDG x Ramdeobaba Hackathon | Nagpur Pilot
// =====================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Building2, Bell, CheckCircle2, ShieldCheck, Activity, Sparkles,
  Volume2, VolumeX, Clock, FileText, Stethoscope, PhoneCall,
  AlertTriangle, Printer, UserCheck, Droplet, Scan, ShieldAlert,
  Wifi, TrendingUp, Heart, XCircle, Radio, MapPin, ArrowRight,
} from "lucide-react";
import SoftLockTimer from "@/components/SoftLockTimer";
import VitalsMonitor from "@/components/VitalsMonitor";
import PreReservationToggles from "@/components/PreReservationToggles";
import LiveMap from "@/components/LiveMap";
import PreAuthPacketModal from "@/components/PreAuthPacketModal";
import LegalGuardrailBanner from "@/components/LegalGuardrailBanner";
import { playErAlertChime } from "@/lib/audio";

type ErTab = "incident" | "vitals" | "orders";

export default function HospitalErPage() {
  const {
    activeSession, hospitals, activeHospital,
    respondHospitalRequest, confirmDoctorArrival,
    updateERReadiness, updatePreReservations,
  } = useTraumaNet();

  const [activeTab, setActiveTab] = useState<ErTab>("incident");
  const [soundMuted, setSoundMuted] = useState(false);
  const [showPacketModal, setShowPacketModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [chimeRang, setChimeRang] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-ring chime once on load
  useEffect(() => {
    if (mounted && !soundMuted && !chimeRang) {
      setTimeout(() => { playErAlertChime(); setChimeRang(true); }, 800);
    }
  }, [mounted, soundMuted, chimeRang]);

  if (!mounted || !activeSession) {
    return (
      <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-pulse">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-white">Connecting to ER Command Tower…</h2>
          <p className="text-xs text-slate-500">Nagpur Trauma Network · Inject a scenario to begin</p>
        </div>
      </div>
    );
  }

  const currentHospital = activeHospital || hospitals[0];
  const sbar = activeSession.handover;
  const readiness = activeSession.er_readiness;
  const isAccepted = activeSession.request_status === "accepted";
  const isLimited = activeSession.request_status === "limited";
  const isDeclined = activeSession.request_status === "declined";
  const showTimeoutWarning = elapsedSeconds > 150 && !isAccepted && !isLimited;

  const checkedCount = [
    readiness.trauma_team_alerted,
    readiness.imaging_room_ready,
    readiness.blood_bank_alerted,
    readiness.insurance_packet_received,
  ].filter(Boolean).length;

  const tabs = [
    { id: "incident", label: "Incident & Hold", icon: Clock },
    { id: "vitals", label: "SBAR & Vitals", icon: Activity },
    { id: "orders", label: "ER Checklist", icon: Stethoscope },
  ];

  const sbarSections = [
    { key: "situation", label: "Situation", color: "text-sky-400", bg: "bg-sky-500/5 border-sky-500/15", field: sbar?.situation },
    { key: "background", label: "Background", color: "text-purple-400", bg: "bg-purple-500/5 border-purple-500/15", field: sbar?.background },
    { key: "assessment", label: "Assessment", color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/15", field: sbar?.assessment },
    { key: "recommendation", label: "Recommendation", color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/15", field: sbar?.recommendation },
  ];

  const checklistItems = [
    {
      key: "trauma_team_alerted" as const,
      label: "Trauma Team Alert",
      sub: "Surgeon & Intensivist standby",
      icon: UserCheck,
      checkedColor: "bg-emerald-500/10 border-emerald-500/30",
      iconColor: "text-emerald-400",
      activeLabel: "ALERTED",
    },
    {
      key: "imaging_room_ready" as const,
      label: "CT / Imaging Room",
      sub: "Pan-scan room cleared",
      icon: Scan,
      checkedColor: "bg-cyan-500/10 border-cyan-500/30",
      iconColor: "text-cyan-400",
      activeLabel: "READY",
    },
    {
      key: "blood_bank_alerted" as const,
      label: "Blood Bank Alert",
      sub: "4 units O-Neg cross-matched",
      icon: Droplet,
      checkedColor: "bg-rose-500/10 border-rose-500/30",
      iconColor: "text-rose-400",
      activeLabel: "NOTIFIED",
    },
    {
      key: "insurance_packet_received" as const,
      label: "Insurance Desk Packet",
      sub: "TPA & ABHA pre-loaded",
      icon: FileText,
      checkedColor: "bg-purple-500/10 border-purple-500/30",
      iconColor: "text-purple-400",
      activeLabel: "RECEIVED",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020817] text-white pb-24">
      {/* ── Sticky ER Header ─────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-[#020817]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Hospital info */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
                <Building2 className="w-5 h-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#020817] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-sm font-bold text-white">{currentHospital.name}</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/25">
                    ER COMMAND · NAGPUR
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAccepted ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25" :
                    isLimited  ? "bg-amber-500/15 text-amber-300 border border-amber-500/25" :
                    isDeclined ? "bg-red-500/15 text-red-300 border border-red-500/25" :
                    "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}>
                    {isAccepted ? "● ACCEPTING" : isLimited ? "◐ LIMITED" : isDeclined ? "✕ DECLINED" : "○ AWAITING"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {currentHospital.trauma_level} · Reliability: {Math.round(currentHospital.reliability * 100)}%
                </p>
              </div>
            </div>

            {/* Tab switcher + mute */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl">
                {tabs.map((t) => {
                  const isActive = activeTab === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as ErTab)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isActive ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => { setSoundMuted(!soundMuted); if (soundMuted) playErAlertChime(); }}
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
                title={soundMuted ? "Unmute chime" : "Mute chime"}
              >
                {soundMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-5">
        {/* ── Legal Banner ─────────────────────────────────── */}
        <LegalGuardrailBanner compact />

        {/* ── Timeout Warning ──────────────────────────────── */}
        {showTimeoutWarning && (
          <div className="glass border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glow-amber animate-pulse-red">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-300">No Response in {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s — Auto-Escalation Active</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Next closest hospital will be pinged. Ambulance 108 fallback enabled.</p>
              </div>
            </div>
            <a
              href={`tel:${currentHospital.contact}`}
              className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call 108 Control Room
            </a>
          </div>
        )}

        {/* ── Inbound Alert Strip ───────────────────────────── */}
        <div className="glass rounded-2xl border border-white/[0.08] card-shine overflow-hidden">
          {/* Priority bar */}
          <div className={`h-1 w-full ${
            activeSession.priority === "P1_CRITICAL" ? "bg-gradient-to-r from-red-500 to-rose-600" :
            activeSession.priority === "P2_SERIOUS"  ? "bg-gradient-to-r from-amber-500 to-orange-600" :
            "bg-gradient-to-r from-emerald-500 to-teal-600"
          }`} />

          <div className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              {/* Incident info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">Inbound ALS Transport</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeSession.priority === "P1_CRITICAL" ? "badge-p1" :
                    activeSession.priority === "P2_SERIOUS"  ? "badge-p2" : "badge-p3"
                  }`}>
                    {activeSession.priority?.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{activeSession.ambulance_id}</span>
                </div>
                <h2 className="text-base font-black text-white">{activeSession.incident_title}</h2>
                <p className="text-xs text-slate-400">
                  {activeSession.patient_info.name} · {activeSession.patient_info.age}y · {activeSession.patient_info.gender}
                </p>
              </div>

              {/* 3-Tier Accept Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => respondHospitalRequest(activeSession.session_id, currentHospital.hospital_id, "accepted")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isAccepted
                      ? "bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#020817]"
                      : "bg-emerald-600/80 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isAccepted ? "✓ Accepting" : "Accept & Hold Bay"}
                </button>

                <button
                  onClick={() => respondHospitalRequest(activeSession.session_id, currentHospital.hospital_id, "limited")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isLimited
                      ? "bg-amber-600 text-white ring-2 ring-amber-400 ring-offset-2 ring-offset-[#020817]"
                      : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 hover:-translate-y-0.5"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {isLimited ? "◐ Limited" : "Limited Bay"}
                </button>

                <button
                  onClick={() => respondHospitalRequest(activeSession.session_id, currentHospital.hospital_id, "declined")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isDeclined
                      ? "bg-red-700 text-white ring-2 ring-red-500 ring-offset-2 ring-offset-[#020817]"
                      : "bg-white/[0.03] hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-white/[0.08] hover:border-red-500/30"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {isDeclined ? "✕ Declined" : "Decline / Reroute"}
                </button>
              </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/[0.06]">
              {[
                { label: "ETA", value: `${activeSession.eta_minutes} min`, sub: `${activeSession.speed_kmh} km/h`, color: "text-emerald-400" },
                { label: "Hold Status", value: isAccepted ? "RESERVED" : isLimited ? "LIMITED" : "PENDING", sub: "Auto-expires 15m", color: isAccepted ? "text-emerald-400" : isLimited ? "text-amber-400" : "text-slate-400" },
                { label: "ER Checklist", value: `${checkedCount}/4`, sub: "items ready", color: checkedCount === 4 ? "text-emerald-400" : "text-amber-400" },
                { label: "Doctor Handover", value: activeSession.doctor_arrival_confirmed ? "CONFIRMED" : "PENDING", sub: "tap to confirm", color: activeSession.doctor_arrival_confirmed ? "text-emerald-400" : "text-slate-400" },
              ].map((m) => (
                <div key={m.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{m.label}</p>
                  <p className={`font-black font-mono text-sm mt-0.5 ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-slate-600">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ TAB 1: INCIDENT & 15-MIN HOLD ═══════════════════ */}
        {activeTab === "incident" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in">
            <div className="lg:col-span-2 space-y-5">
              <SoftLockTimer
                expiresAt={activeSession.soft_lock_expires_at}
                hospitalName={currentHospital.name}
                isAccepted={isAccepted}
              />
              {/* Map */}
              <div className="glass border border-white/[0.08] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    <span className="text-sm font-bold text-white">Live Nagpur Emergency Corridor</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    GPS Active
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden border border-white/[0.06]" style={{ height: 340 }}>
                  <LiveMap
                    session={activeSession}
                    ambulanceLat={activeSession.ambulance_lat}
                    ambulanceLng={activeSession.ambulance_lng}
                    hospitalLat={currentHospital.lat}
                    hospitalLng={currentHospital.lng}
                    hospitalName={currentHospital.name}
                    hospitals={hospitals}
                  />
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-4">
              {/* Doctor Arrival */}
              <div className="glass border border-white/[0.08] rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold text-white">Doctor Handover</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Confirm when ambulance arrives and patient is handed to the trauma bay physician.
                </p>
                <button
                  onClick={() => confirmDoctorArrival(activeSession.session_id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    activeSession.doctor_arrival_confirmed
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-blue-600 hover:bg-blue-500 text-white hover:-translate-y-0.5 shadow-lg shadow-blue-600/20"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {activeSession.doctor_arrival_confirmed ? "✓ Handover Confirmed" : "Confirm Patient Arrival"}
                </button>
                {activeSession.arrival_feedback && (
                  <div className={`text-xs text-center font-bold py-1.5 rounded-lg ${
                    activeSession.arrival_feedback === "accepted_as_promised"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-red-500/10 text-red-300"
                  }`}>
                    {activeSession.arrival_feedback === "accepted_as_promised" ? "✓ Accepted as Promised" : "⚠ Turned Away — Reported"}
                  </div>
                )}
              </div>

              {/* Pre-auth packet */}
              <div className="glass border border-white/[0.08] rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Insurance Desk</h4>
                </div>
                <p className="text-xs text-slate-400">Family pre-auth packet received ahead of ambulance arrival.</p>
                <button
                  onClick={() => setShowPacketModal(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-600/20"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Open Pre-Auth Packet
                </button>
              </div>

              {/* Patient snapshot */}
              <div className="glass border border-white/[0.08] rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Patient Details</p>
                <div className="space-y-2">
                  {[
                    { k: "Name", v: activeSession.patient_info.name },
                    { k: "ABHA ID", v: activeSession.patient_info.abha_id || "ABDM Sandbox", mono: true },
                    { k: "Insurance", v: activeSession.patient_info.insurance_provider },
                    { k: "Route", v: activeSession.payment_route_suggestion, highlight: true },
                  ].map((row) => (
                    <div key={row.k} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{row.k}</span>
                      <span className={`font-semibold max-w-[160px] truncate text-right ${
                        row.highlight ? "text-emerald-400" : row.mono ? "font-mono text-sky-300 text-[10px]" : "text-white"
                      }`}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: SBAR & VITALS ════════════════════════════ */}
        {activeTab === "vitals" && (
          <div className="space-y-5 animate-fade-in">
            {/* SBAR grid */}
            <div className="glass border border-white/[0.08] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Structured SBAR Clinical Handover</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                  Gemini Structured · Not a Diagnosis
                </span>
              </div>
              <div className="divider" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sbarSections.map((s, i) => (
                  <div key={s.key} className={`rounded-xl border p-4 space-y-2 ${s.bg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${s.color}`}>
                        {i + 1}. {s.label}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        s.field?.confidence === "high" ? "bg-emerald-500/15 text-emerald-400" :
                        s.field?.confidence === "medium" ? "bg-amber-500/15 text-amber-400" :
                        "bg-red-500/15 text-red-400"
                      }`}>
                        {s.field?.confidence?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{s.field?.text || "—"}</p>
                    {s.field?.source_quote && (
                      <p className="text-[10px] text-slate-500 italic border-l-2 border-white/10 pl-2">
                        "{s.field.source_quote}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {sbar?.missing_info && sbar.missing_info.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Missing Information</p>
                    <ul className="mt-1 space-y-0.5">
                      {sbar.missing_info.map((m, i) => (
                        <li key={i} className="text-[11px] text-slate-400">• {m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <VitalsMonitor vitals={activeSession.vitals} />
          </div>
        )}

        {/* ═══ TAB 3: ER READINESS CHECKLIST ══════════════════ */}
        {activeTab === "orders" && (
          <div className="space-y-5 animate-fade-in">
            <div className="glass border border-white/[0.08] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">4-Point ER Readiness Checklist</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${(checkedCount / 4) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${checkedCount === 4 ? "text-emerald-400" : "text-slate-400"}`}>
                    {checkedCount}/4
                  </span>
                </div>
              </div>
              <div className="divider" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {checklistItems.map((item) => {
                  const Icon = item.icon;
                  const checked = readiness[item.key];
                  return (
                    <button
                      key={item.key}
                      onClick={() => updateERReadiness(activeSession.session_id, { [item.key]: !checked })}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 ${
                        checked
                          ? `${item.checkedColor} text-white`
                          : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.15]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Icon className={`w-5 h-5 ${checked ? item.iconColor : "text-slate-600"}`} />
                        <span className={`text-[9px] font-black tracking-wider ${checked ? item.iconColor : "text-slate-600"}`}>
                          {checked ? item.activeLabel : "PENDING"}
                        </span>
                      </div>
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <PreReservationToggles
              reservations={activeSession.pre_reservations}
              onUpdate={(updated) => updatePreReservations(activeSession.session_id, updated)}
            />
          </div>
        )}
      </div>

      {showPacketModal && (
        <PreAuthPacketModal
          session={activeSession}
          hospital={currentHospital}
          onClose={() => setShowPacketModal(false)}
        />
      )}
    </div>
  );
}
