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
  ArrowRight,
  ArrowLeft,
  FileText,
  Clock,
  Shield,
} from "lucide-react";
import VoiceNotesRecorder from "@/components/VoiceNotesRecorder";
import VitalsMonitor from "@/components/VitalsMonitor";
import SoftLockTimer from "@/components/SoftLockTimer";

type ParamedicStep = "vitals" | "injury" | "routing" | "report";

export default function ParamedicPage() {
  const {
    activeSession,
    hospitals,
    useLiveGemini,
    geminiApiKey,
    createSession,
  } = useTraumaNet();

  const [currentStep, setCurrentStep] = useState<ParamedicStep>("vitals");

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
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

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
        setSubmittedSuccess(true);
        setCurrentStep("report");
      }
    } catch (e: any) {
      console.error(e);
      setCurrentStep("report");
    } finally {
      setIsTriaging(false);
    }
  };

  const steps = [
    { id: "vitals", label: "1. Vitals & Patient", icon: Activity },
    { id: "injury", label: "2. Injury & Notes", icon: Camera },
    { id: "routing", label: "3. Hospital & Bed", icon: Navigation },
    { id: "report", label: "4. Clinical Report", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Top Breadcrumb & Step Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 py-4 px-4 sticky top-18 z-30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-sm">
              <Ambulance className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Paramedic Fleet Terminal</h1>
              <p className="text-xs text-slate-400">Step-by-step emergency intake</p>
            </div>
          </div>

          {/* Clean Step Pills */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {steps.map((s) => {
              const isActive = currentStep === s.id;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(s.id as ParamedicStep)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Soft-lock alert banner if active */}
        {activeSession && (
          <SoftLockTimer
            expiresAt={activeSession.soft_lock_expires_at}
            status={activeSession.bed_status}
            hospitalName={targetHospital?.name}
          />
        )}

        {/* =========================================================================
            STEP 1: PATIENT DEMOGRAPHICS & VITALS
        ========================================================================= */}
        {currentStep === "vitals" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Live ECG Canvas */}
            <VitalsMonitor vitals={vitals} />

            {/* Demographics Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                Patient Demographics
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Patient Full Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Age (Years)</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Vitals Form Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Manual Vitals Calibration</h3>
                <span className="text-xs text-slate-400">Bluetooth Telemetry / Manual Override</span>
              </div>

              <div className="space-y-4">
                {/* BP */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">Blood Pressure (Systolic / Diastolic)</span>
                    <span className="font-mono text-base font-bold text-emerald-400">
                      {vitals.blood_pressure_sys} / {vitals.blood_pressure_dia} mmHg
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <input
                      type="range"
                      min="50"
                      max="220"
                      value={vitals.blood_pressure_sys}
                      onChange={(e) => handleVitalsChange("blood_pressure_sys", Number(e.target.value))}
                      className="accent-red-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <input
                      type="range"
                      min="30"
                      max="140"
                      value={vitals.blood_pressure_dia}
                      onChange={(e) => handleVitalsChange("blood_pressure_dia", Number(e.target.value))}
                      className="accent-red-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                  </div>
                </div>

                {/* Pulse */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">Pulse Rate (Heart Rate)</span>
                    <span className="font-mono text-base font-bold text-rose-400">
                      {vitals.pulse_rate} BPM
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    value={vitals.pulse_rate}
                    onChange={(e) => handleVitalsChange("pulse_rate", Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* SpO2 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">Oxygen Saturation (SpO2)</span>
                    <span className="font-mono text-base font-bold text-cyan-400">
                      {vitals.spo2}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={vitals.spo2}
                    onChange={(e) => handleVitalsChange("spo2", Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Resp & GCS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">Respiration Rate</span>
                      <span className="font-mono text-base font-bold text-slate-200">
                        {vitals.respiratory_rate} rpm
                      </span>
                    </div>
                    <input
                      type="number"
                      min="6"
                      max="50"
                      value={vitals.respiratory_rate}
                      onChange={(e) => handleVitalsChange("respiratory_rate", Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">Glasgow Coma Scale</span>
                      <span className="font-mono text-base font-bold text-purple-400">
                        {vitals.gcs_score} / 15
                      </span>
                    </div>
                    <input
                      type="number"
                      min="3"
                      max="15"
                      value={vitals.gcs_score}
                      onChange={(e) => handleVitalsChange("gcs_score", Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Scenarios */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400 block mb-2">
                  Load Pre-Configured Test Vitals:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => loadPresetInjury("wound")}
                    className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Severe Hemorrhage
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPresetInjury("fracture")}
                    className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Compound Fracture
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPresetInjury("cranial")}
                    className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Head Trauma (GCS 6)
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Next Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentStep("injury")}
                className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-2xl shadow-sm flex items-center gap-2 transition-all"
              >
                <span>Continue to Injury &amp; Notes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: INJURY PHOTO & CLINICAL NOTES
        ========================================================================= */}
        {currentStep === "injury" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Wound Photo Upload */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">Trauma Wound Photo Capture</h3>
                </div>
                <span className="text-xs text-slate-400">Multimodal Gemini Vision</span>
              </div>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center max-h-[320px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Captured Trauma Wound"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setImagePreview(null)}
                    className="absolute top-3 right-3 bg-slate-900 text-white rounded-xl px-4 py-2 text-xs font-bold border border-slate-700 hover:bg-red-600 transition-colors"
                  >
                    Retake Photo
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-800 bg-slate-950 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Upload or take photo of visible trauma
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Images automatically compressed for low-bandwidth 2G/3G ambulances
                    </p>
                  </div>
                  <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors flex items-center gap-2 mt-2">
                    <Upload className="w-4 h-4" />
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

            {/* Audio Notes & Speech-to-Text */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
              <VoiceNotesRecorder value={notes} onChange={setNotes} />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep("vitals")}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-sm font-semibold rounded-2xl transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Vitals</span>
              </button>

              <button
                onClick={() => setCurrentStep("routing")}
                className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-2xl shadow-sm flex items-center gap-2 transition-all"
              >
                <span>Continue to Hospital Routing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: HOSPITAL SELECTION & BED SOFT-LOCK
        ========================================================================= */}
        {currentStep === "routing" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Select Destination Hospital</h3>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">Filtered by Verified ICU Beds</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hospitals.map((hosp) => {
                  const isSelected = hosp.hospital_id === selectedHospitalId;
                  const hasBeds = hosp.icu_beds_free > 0;

                  return (
                    <button
                      key={hosp.hospital_id}
                      type="button"
                      onClick={() => setSelectedHospitalId(hosp.hospital_id)}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "bg-slate-800 border-red-500 shadow-sm"
                          : "bg-slate-950 border-slate-800 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-bold text-white text-sm">
                          {hosp.name}
                        </div>
                        {isSelected && (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{hosp.trauma_level}</div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800 text-xs">
                        <span
                          className={`font-bold flex items-center gap-1.5 ${
                            hasBeds ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          <Bed className="w-4 h-4" />
                          {hosp.icu_beds_free} ICU Beds Free
                        </span>
                        <span className="text-slate-300 font-mono font-bold">
                          {hosp.eta_minutes || 8} min • {hosp.distance_km || 4}km
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Ready for AI Triage &amp; Bed Lock</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sends full clinical payload to Gemini 1.5 and locks bed at {targetHospital.name}.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setCurrentStep("injury")}
                  className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-2xl transition-colors"
                >
                  Back
                </button>

                <button
                  onClick={handleTriggerTriage}
                  disabled={isTriaging}
                  className="flex-1 sm:flex-none px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isTriaging ? (
                    <span>Running Gemini AI Triage...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Submit &amp; Soft-Lock Bed</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: CLINICAL TRIAGE PRE-REPORT
        ========================================================================= */}
        {currentStep === "report" && activeSession && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {submittedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-sm">
                  ICU Bed Soft-Locked at {targetHospital.name}. Hospital ER Command Tower has received the alert.
                </span>
              </div>
            )}

            {/* Score & Doctor Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Gemini 1.5 Medical Pre-Report</h3>
                </div>
                <span className="text-sm font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-300 font-mono">
                  Trauma Score: {activeSession.trauma_score} / 10 ({activeSession.severity})
                </span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-sm text-slate-200 leading-relaxed">
                {activeSession.ai_pre_report}
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Immediate Onboard Stabilization Action Points:
                </span>
                <div className="space-y-2.5">
                  {activeSession.stabilization_steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800"
                    >
                      <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Return or Start New Button */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setCurrentStep("vitals")}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-sm font-semibold rounded-2xl transition-colors"
              >
                Edit Vitals
              </button>

              <button
                onClick={() => setCurrentStep("routing")}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-2xl transition-colors"
              >
                Change Destination Hospital
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
