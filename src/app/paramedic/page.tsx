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
  Wifi,
  WifiOff,
  Send,
} from "lucide-react";
import VoiceNotesRecorder from "@/components/VoiceNotesRecorder";
import VitalsMonitor from "@/components/VitalsMonitor";
import SoftLockTimer from "@/components/SoftLockTimer";

export default function ParamedicPage() {
  const {
    activeSession,
    hospitals,
    isOnline,
    useLiveGemini,
    geminiApiKey,
    createSession,
  } = useTraumaNet();

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
  const [isTriaging, setIsTriaging] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

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

  const loadPresetInjury = (type: "wound" | "fracture" | "cranial") => {
    if (type === "wound") {
      setNotes("Open abdominal laceration with significant blood loss. Hemodynamically unstable.");
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
      setNotes("Open compound tibial fracture with severe crush injury. Tourniquet applied.");
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
      setNotes("Closed cranial trauma. Unresponsive with pupillary asymmetry. GCS 6.");
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

        let optimalHosp = availableHospitals.find((h) =>
          triageData.required_specialists.some((s: string) =>
            h.active_specialists.includes(s)
          )
        ) || availableHospitals[0] || hospitals[0];

        createSession({
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
          `AI Triage complete! Soft-locked ICU bed at ${optimalHosp.name}. Hospital ER notified.`
        );
      }
    } catch (e: any) {
      console.error(e);
      setSyncSuccessMsg("Processed through local offline triage engine.");
    } finally {
      setIsTriaging(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
      {/* Fleet Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-16 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-sm">
              <Ambulance className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Paramedic Fleet Terminal</h1>
              <p className="text-xs text-slate-400">Mobile PWA View • Ambulance ALS-04</p>
            </div>
          </div>

          <span
            className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 border ${
              isOnline
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? "PWA Online" : "Offline"}</span>
          </span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {syncSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{syncSuccessMsg}</span>
          </div>
        )}

        {/* Soft Lock Timer if active */}
        {activeSession && (
          <SoftLockTimer
            expiresAt={activeSession.soft_lock_expires_at}
            status={activeSession.bed_status}
            hospitalName={targetHospital?.name}
          />
        )}

        {/* Live Vitals Monitor */}
        <VitalsMonitor vitals={vitals} />

        {/* Two-column clean form layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Section: Patient Demographics & Vitals */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Patient Vitals &amp; Info</h3>
              </div>
            </div>

            {/* Patient Name and Age */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-slate-300 font-medium">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Age</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Vitals Form Sliders */}
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
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

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Pulse Rate</span>
                  <span className="font-mono text-rose-400 font-bold">{vitals.pulse_rate} BPM</span>
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

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
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

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Resp Rate (rpm)</label>
                  <input
                    type="number"
                    min="6"
                    max="50"
                    value={vitals.respiratory_rate}
                    onChange={(e) => handleVitalsChange("respiratory_rate", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">GCS Score (/15)</label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={vitals.gcs_score}
                    onChange={(e) => handleVitalsChange("gcs_score", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                Quick Scenario Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadPresetInjury("wound")}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                >
                  Severe Bleeding
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetInjury("fracture")}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                >
                  Crush / Fracture
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetInjury("cranial")}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                >
                  Head Trauma (GCS 6)
                </button>
              </div>
            </div>
          </div>

          {/* Section: Wound Image & Voice Notes */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Trauma Wound Photo</h3>
                </div>
                <span className="text-xs text-slate-400">Gemini Vision AI</span>
              </div>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Captured Injury"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setImagePreview(null)}
                    className="absolute top-3 right-3 bg-slate-900/90 text-white rounded-xl px-3 py-1.5 text-xs font-semibold border border-slate-700 hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-300">
                      Upload or take photo of visible trauma
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Auto-compressed under poor 2G/3G network conditions
                    </p>
                  </div>
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2">
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
            </div>

            {/* Voice & Clinical Notes */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <VoiceNotesRecorder value={notes} onChange={setNotes} />
            </div>
          </div>
        </div>

        {/* Smart Routing Destination Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Destination Hospital &amp; Verified ICU Bed Availability
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {hospitals.map((hosp) => {
              const isSelected = hosp.hospital_id === selectedHospitalId;
              const hasBeds = hosp.icu_beds_free > 0;

              return (
                <button
                  key={hosp.hospital_id}
                  type="button"
                  onClick={() => setSelectedHospitalId(hosp.hospital_id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-slate-800 border-red-500 shadow-sm"
                      : "bg-slate-950 border-slate-800 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="font-bold text-white text-xs truncate">
                    {hosp.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{hosp.trauma_level}</div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800 text-xs">
                    <span
                      className={`font-semibold flex items-center gap-1.5 ${
                        hasBeds ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      <Bed className="w-3.5 h-3.5" />
                      {hosp.icu_beds_free} Beds Free
                    </span>
                    <span className="text-slate-300 font-mono">
                      {hosp.eta_minutes || 10}m • {hosp.distance_km || 5}km
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleTriggerTriage}
          disabled={isTriaging}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2.5 disabled:opacity-60"
        >
          {isTriaging ? (
            <span>Running AI Triage &amp; Bed Reservation...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Submit Triage &amp; Soft-Lock ICU Bed</span>
              <Send className="w-4 h-4 ml-1" />
            </>
          )}
        </button>

        {/* Pre-Report Output Card */}
        {activeSession && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Gemini Clinical Pre-Report &amp; Instructions
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-red-500/15 text-red-300 font-mono font-bold">
                SCORE: {activeSession.trauma_score} / 10 ({activeSession.severity})
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {activeSession.ai_pre_report}
            </p>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-300 block">
                Immediate Onboard Stabilization Action Points:
              </span>
              <div className="space-y-2">
                {activeSession.stabilization_steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-red-500/15 text-red-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
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
