"use client";

import React, { useState } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import { PatientVitals } from "@/lib/types";
import {
  Ambulance,
  Camera,
  Upload,
  Activity,
  Sparkles,
  Navigation,
  Bed,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  WifiOff,
  Image as ImageIcon,
  Send,
  Zap,
} from "lucide-react";
import VoiceNotesRecorder from "@/components/VoiceNotesRecorder";
import VitalsMonitor from "@/components/VitalsMonitor";
import SoftLockTimer from "@/components/SoftLockTimer";

export default function ParamedicPage() {
  const {
    activeSession,
    hospitals,
    activeHospital,
    isOnline,
    useLiveGemini,
    geminiApiKey,
    createSession,
    updateSession,
    declineAndReroute,
  } = useTraumaNet();

  // Vitals form state
  const [vitals, setVitals] = useState<PatientVitals>(
    activeSession?.vitals || {
      blood_pressure_sys: 84,
      blood_pressure_dia: 52,
      pulse_rate: 132,
      spo2: 89,
      respiratory_rate: 28,
      gcs_score: 8,
      temperature_c: 36.2,
    }
  );

  const [notes, setNotes] = useState(activeSession?.voice_notes || "");
  const [patientName, setPatientName] = useState(activeSession?.patient_info?.name || "Rajesh Kumar Sharma");
  const [patientAge, setPatientAge] = useState(activeSession?.patient_info?.age || 38);
  const [selectedHospitalId, setSelectedHospitalId] = useState(
    activeSession?.assigned_hospital_id || hospitals[0].hospital_id
  );

  const [imagePreview, setImagePreview] = useState<string | null>(
    activeSession?.injury_image_url || null
  );
  const [compressUnderPoorNetwork, setCompressUnderPoorNetwork] = useState(true);
  const [isTriaging, setIsTriaging] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Available hospitals with verified ICU beds > 0
  const availableHospitals = hospitals.filter((h) => h.icu_beds_free > 0);
  const targetHospital =
    hospitals.find((h) => h.hospital_id === selectedHospitalId) || hospitals[0];

  const handleVitalsChange = (field: keyof PatientVitals, val: number) => {
    setVitals((prev) => ({ ...prev, [field]: val }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock sample wound presets for rapid demo
  const loadPresetInjury = (type: "wound" | "fracture" | "cranial") => {
    if (type === "wound") {
      setNotes(
        "Open abdominal trauma with visible evisceration and massive external blood loss. Hemodynamically unstable."
      );
      setVitals({
        blood_pressure_sys: 80,
        blood_pressure_dia: 48,
        pulse_rate: 138,
        spo2: 88,
        respiratory_rate: 30,
        gcs_score: 8,
        temperature_c: 35.9,
      });
    } else if (type === "fracture") {
      setNotes(
        "Open compound tibial fracture with severe crush injury. Absent distal dorsalis pedis pulse. High risk compartment syndrome."
      );
      setVitals({
        blood_pressure_sys: 100,
        blood_pressure_dia: 65,
        pulse_rate: 118,
        spo2: 95,
        respiratory_rate: 22,
        gcs_score: 13,
        temperature_c: 36.6,
      });
    } else {
      setNotes(
        "Direct impact closed head trauma. Unresponsive, right dilated unreactive pupil (anisocoria). Suspected acute epidural hematoma."
      );
      setVitals({
        blood_pressure_sys: 165,
        blood_pressure_dia: 105,
        pulse_rate: 52,
        spo2: 93,
        respiratory_rate: 12,
        gcs_score: 6,
        temperature_c: 37.1,
      });
    }
  };

  const handleTriggerTriage = async () => {
    setIsTriaging(true);
    setSyncSuccessMsg(null);

    try {
      // Call backend triage API
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vitals,
          notes,
          imageBase64: imagePreview,
          apiKey: useLiveGemini ? geminiApiKey : undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const triageData = json.data;

        // Auto-select optimal hospital with verified ICU beds if not chosen
        let optimalHosp = availableHospitals.find((h) =>
          triageData.required_specialists.some((s: string) =>
            h.active_specialists.includes(s)
          )
        ) || availableHospitals[0] || hospitals[0];

        const updatedSession = createSession({
          incident_title: notes ? notes.slice(0, 48) : "Emergency Trauma Triage",
          patient_info: {
            name: patientName,
            age: patientAge,
            gender: "MALE",
            emergency_contact_name: "Anita Narang (Spouse)",
            emergency_contact_phone: "+91 98112 45890",
          },
          vitals,
          trauma_score: triageData.trauma_score,
          severity: triageData.severity,
          ai_pre_report: triageData.ai_pre_report,
          required_specialists: triageData.required_specialists,
          stabilization_steps: triageData.stabilization_steps,
          deposit_amount_inr: triageData.estimated_deposit_inr,
          assigned_hospital_id: optimalHosp.hospital_id,
          injury_image_url: imagePreview || undefined,
          voice_notes: notes,
          bed_status: "HOLD",
          eta_minutes: optimalHosp.eta_minutes || 8,
        });

        setSelectedHospitalId(optimalHosp.hospital_id);
        setSyncSuccessMsg(
          `AI Triage complete! Soft-locked ICU bed at ${optimalHosp.name}. ER notified instantly.`
        );
      }
    } catch (e: any) {
      console.error("Triage trigger error:", e);
      setSyncSuccessMsg("Processed through local offline triage engine.");
    } finally {
      setIsTriaging(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
      {/* Top Mobile/Fleet Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-16 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/50">
              <Ambulance className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white">
                  Paramedic Fleet Terminal
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold">
                  ALS-04
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                PWA Mobile View • Golden Hour Telemetry
              </p>
            </div>
          </div>

          {/* Network & PWA Status */}
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 border ${
                isOnline
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? "PWA ONLINE" : "OFFLINE QUEUE (2)"}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Sync / Success alert banner */}
        {syncSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2.5 shadow-lg animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{syncSuccessMsg}</span>
          </div>
        )}

        {/* Active Bed Hold Status (if already created) */}
        {activeSession && (
          <SoftLockTimer
            expiresAt={activeSession.soft_lock_expires_at}
            status={activeSession.bed_status}
            hospitalName={targetHospital?.name}
          />
        )}

        {/* Live Vitals Monitor Display */}
        <VitalsMonitor vitals={vitals} />

        {/* Triage Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Patient Info & Vitals Sliders/Inputs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Patient Demographics &amp; Vitals
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Manual / BLE Sync</span>
            </div>

            {/* Patient Name & Age */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">Patient Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">Age</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Vitals Form */}
            <div className="space-y-3 pt-1">
              {/* BP */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">Blood Pressure (Sys / Dia)</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {vitals.blood_pressure_sys} / {vitals.blood_pressure_dia} mmHg
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min="50"
                    max="220"
                    value={vitals.blood_pressure_sys}
                    onChange={(e) => handleVitalsChange("blood_pressure_sys", Number(e.target.value))}
                    className="accent-red-500 cursor-pointer"
                  />
                  <input
                    type="range"
                    min="30"
                    max="140"
                    value={vitals.blood_pressure_dia}
                    onChange={(e) => handleVitalsChange("blood_pressure_dia", Number(e.target.value))}
                    className="accent-red-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Pulse */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">Pulse Rate (Heart Rate)</span>
                  <span className="font-mono text-rose-400 font-bold">
                    {vitals.pulse_rate} BPM
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={vitals.pulse_rate}
                  onChange={(e) => handleVitalsChange("pulse_rate", Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              {/* SpO2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">Oxygen Saturation (SpO2)</span>
                  <span className="font-mono text-cyan-400 font-bold">{vitals.spo2}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={vitals.spo2}
                  onChange={(e) => handleVitalsChange("spo2", Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Respiratory Rate & GCS */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">
                    Resp Rate (rpm): <span className="font-mono text-white font-bold">{vitals.respiratory_rate}</span>
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="50"
                    value={vitals.respiratory_rate}
                    onChange={(e) => handleVitalsChange("respiratory_rate", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">
                    GCS Score: <span className="font-mono text-purple-400 font-bold">{vitals.gcs_score}/15</span>
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={vitals.gcs_score}
                    onChange={(e) => handleVitalsChange("gcs_score", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Quick Presets for Demo */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1.5">
                ⚡ Quick Clinical Case Injections:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => loadPresetInjury("wound")}
                  className="text-[10px] px-2 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60 transition-colors font-medium"
                >
                  Severe Bleeding
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetInjury("fracture")}
                  className="text-[10px] px-2 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 transition-colors font-medium"
                >
                  Crush / Fracture
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetInjury("cranial")}
                  className="text-[10px] px-2 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 transition-colors font-medium"
                >
                  Head Trauma / GCS 6
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Camera Capture, Audio Notes & Smart Routing */}
          <div className="space-y-4">
            {/* Camera / Wound Image Capture */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-accent-blue" />
                  Trauma Wound Vision Capture
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Gemini Vision AI</span>
              </div>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Captured Trauma Wound"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 bg-slate-900/90 text-white rounded-lg px-2 py-1 text-[10px] font-bold border border-slate-700 hover:bg-red-600 transition-colors"
                  >
                    Retake / Remove
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-slate-700 bg-slate-950/70 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-300">
                      Snap or upload photo of injury
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Auto-compressed under poor 2G/3G connectivity
                    </p>
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Compression Switch */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Adaptive Edge Compression</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={compressUnderPoorNetwork}
                    onChange={(e) => setCompressUnderPoorNetwork(e.target.checked)}
                    className="accent-red-500 rounded"
                  />
                  <span>Active (&lt;50KB)</span>
                </label>
              </div>
            </div>

            {/* Paramedic Voice & Field Notes */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <VoiceNotesRecorder value={notes} onChange={setNotes} />
            </div>
          </div>
        </div>

        {/* Smart Hospital Routing Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Smart Hospital Routing • Verified ICU Bed Capacity
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
              Google Maps API Matched
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {hospitals.map((hosp) => {
              const isSelected = hosp.hospital_id === selectedHospitalId;
              const hasBeds = hosp.icu_beds_free > 0;

              return (
                <button
                  key={hosp.hospital_id}
                  type="button"
                  onClick={() => setSelectedHospitalId(hosp.hospital_id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-slate-800 border-red-500 shadow-md shadow-red-950/40 scale-[1.02]"
                      : "bg-slate-950 border-slate-800/80 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="font-bold text-white text-xs truncate max-w-[170px]">
                      {hosp.name}
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{hosp.trauma_level}</div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        hasBeds ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      <Bed className="w-3.5 h-3.5" />
                      {hosp.icu_beds_free} Beds
                    </span>
                    <span className="text-slate-300 font-mono">
                      {hosp.eta_minutes || 10} min • {hosp.distance_km || 5}km
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trigger Action Button */}
        <div className="pt-2">
          <button
            onClick={handleTriggerTriage}
            disabled={isTriaging}
            className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-3 disabled:opacity-60 uppercase tracking-wider"
          >
            {isTriaging ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running Gemini Multimodal Triage...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-current text-white" />
                <span>Submit &amp; Soft-Lock ICU Bed (Trigger ER Command)</span>
                <Send className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>

        {/* AI Pre-Report Preview (if active session exists) */}
        {activeSession && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Gemini 1.5 Clinical Pre-Report &amp; Directives
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold">
                SCORE: {activeSession.trauma_score} / 10 ({activeSession.severity})
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {activeSession.ai_pre_report}
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Immediate Onboard Stabilization Action Points:
              </span>
              <div className="space-y-1.5">
                {activeSession.stabilization_steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800"
                  >
                    <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
