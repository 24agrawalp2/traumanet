// =====================================================================
// TRAUMANET v2 PARAMEDIC FLEET TERMINAL (PWA MOBILE)
// Aligned with GDG x Ramdeobaba Hackathon Build Guide (Nagpur Pilot)
// =====================================================================

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import { PatientVitals, ParamedicPriority, HandoverSBAR } from "@/lib/types";
import { rankHospitalsV2 } from "@/lib/ranking";
import {
  Ambulance,
  Camera,
  Upload,
  Activity,
  Sparkles,
  Navigation,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
  Clock,
  Shield,
  AlertTriangle,
  Globe,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  Check,
  PhoneCall,
} from "lucide-react";
import VoiceNotesRecorder from "@/components/VoiceNotesRecorder";
import VitalsMonitor from "@/components/VitalsMonitor";
import SoftLockTimer from "@/components/SoftLockTimer";
import LegalGuardrailBanner from "@/components/LegalGuardrailBanner";
import { TEST_SCENARIOS } from "@/lib/mockData";

type ParamedicStep = "vitals" | "injury" | "sbar" | "routing";

export default function ParamedicPage() {
  const {
    activeSession,
    hospitals,
    useLiveGemini,
    geminiApiKey,
    createSession,
    updateSession,
    respondHospitalRequest,
    recordArrivalFeedback,
    confirmDoctorArrival,
  } = useTraumaNet();

  const [currentStep, setCurrentStep] = useState<ParamedicStep>("vitals");
  const [language, setLanguage] = useState<"en" | "hi" | "mr">(
    activeSession?.language || "en"
  );
  const [priority, setPriority] = useState<ParamedicPriority>(
    activeSession?.priority || "P1_CRITICAL"
  );

  const [vitals, setVitals] = useState<PatientVitals>(
    activeSession?.vitals || {
      blood_pressure_sys: 84,
      blood_pressure_dia: 52,
      pulse_rate: 132,
      spo2: 89,
      respiratory_rate: 28,
      gcs_score: 8,
      temperature_c: 36.1,
    }
  );

  const [notes, setNotes] = useState(
    activeSession?.note_text || "34yo male struck by truck on Wardha Road flyover. Open abdominal laceration, GCS 8."
  );
  const [patientName, setPatientName] = useState(
    activeSession?.patient_info?.name || "Rahul Ramteke"
  );
  const [patientAge, setPatientAge] = useState(
    activeSession?.patient_info?.age || 34
  );

  const [imagePreview, setImagePreview] = useState<string | null>(
    activeSession?.injury_image_url || null
  );

  const [isStructuring, setIsStructuring] = useState(false);

  // Editable SBAR draft
  const [sbarDraft, setSbarDraft] = useState<HandoverSBAR>(
    activeSession?.handover || {
      situation: {
        text: "34yo male post high-velocity truck collision on Wardha Road in acute hemorrhagic shock with GCS 8.",
        source_quote: "Open abdominal laceration with visible bowel, massive hemorrhage. GCS 8",
        confidence: "high",
      },
      background: {
        text: "Two-wheeler rider, direct impact trauma with acute blood loss.",
        source_quote: "struck by truck on Wardha Road flyover",
        confidence: "high",
      },
      assessment: {
        text: "Hemodynamically unstable hemorrhagic shock (SBP 84, HR 132) and traumatic brain injury requiring emergent pan-scan.",
        source_quote: "SBP 84, Pulse 132. GCS 8 with anisocoria",
        confidence: "high",
      },
      recommendation: {
        text: "Prepare immediate Trauma Bay Level 1 resuscitation, 4 units O-Negative blood, and emergency CT Pan-Scan.",
        source_quote: "Cervical collar placed, two large-bore 14G IV lines running warm saline",
        confidence: "high",
      },
      missing_info: ["Past medical history not provided"],
      needs_review: false,
    }
  );

  // Run Ranking v2 Engine
  const rankedHospitals = useMemo(() => {
    return rankHospitalsV2(hospitals, vitals, priority, notes);
  }, [hospitals, vitals, priority, notes]);

  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    activeSession?.assigned_hospital_id ||
      rankedHospitals.find((r) => r.isEligible)?.hospital.hospital_id ||
      hospitals[0].hospital_id
  );

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

  const loadPresetScenario = (index: number) => {
    const preset = TEST_SCENARIOS[index];
    if (!preset) return;
    setLanguage(preset.language);
    setPriority(preset.priority);
    setPatientName(preset.patient_name);
    setPatientAge(preset.patient_age);
    setNotes(preset.note_text);
    setVitals({
      blood_pressure_sys: preset.vitals.sbp,
      blood_pressure_dia: 52,
      pulse_rate: preset.vitals.hr,
      spo2: preset.vitals.spo2,
      respiratory_rate: preset.vitals.rr,
      gcs_score: preset.vitals.gcs,
      temperature_c: preset.vitals.temperature_c ?? 36.5,
    });
    setSbarDraft(preset.handover_sbar);
  };

  // Trigger Gemini SBAR Structuring
  const handleStructureWithGemini = async () => {
    setIsStructuring(true);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vitals,
          notes,
          language,
          imageBase64: imagePreview,
          apiKey: useLiveGemini ? geminiApiKey : undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.handover) {
        setSbarDraft(json.handover);
      }
    } catch (e) {
      console.error("Gemini structuring error:", e);
    } finally {
      setIsStructuring(false);
      setCurrentStep("sbar");
    }
  };

  // Dispatch Request to Hospital ER
  const handleDispatchHospital = () => {
    const target = hospitals.find((h) => h.hospital_id === selectedHospitalId) || hospitals[0];

    createSession({
      incident_title: notes ? notes.slice(0, 48) : "Nagpur Trauma Emergency",
      patient_info: {
        name: patientName,
        age: patientAge,
        gender: "MALE",
        emergency_contact_name: "Family Caregiver",
        emergency_contact_phone: "+91 98230 11223",
      },
      vitals,
      language,
      note_text: notes,
      handover: sbarDraft,
      priority,
      assigned_hospital_id: target.hospital_id,
      injury_image_url: imagePreview || undefined,
      request_status: "accepted",
      soft_lock_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      eta_minutes: target.eta_minutes || 11,
      payment_status: "PAID",
      deposit_amount_inr: 0,
      bed_status: "ACCEPTED_LOCKED",
    });

    // Notify user
    alert(`Emergency request successfully broadcasted to ${target.name}. 15-minute preparation hold started!`);
  };

  const steps = [
    { id: "vitals", label: "1. Vitals & Patient", icon: Activity },
    { id: "injury", label: "2. Multilingual Note", icon: Camera },
    { id: "sbar", label: "3. SBAR Review", icon: FileText },
    { id: "routing", label: "4. Hospital Ranking", icon: Navigation },
  ];

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin mx-auto" />
          <h2 className="text-base font-bold">Connecting to Paramedic ALS Terminal...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white pb-24">
      {/* ── Sticky Paramedic Header ── */}
      <div className="sticky top-16 z-30 bg-[#020817]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-lg shadow-red-500/25 shrink-0">
                <Ambulance className="w-5 h-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#020817] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-white">Paramedic Fleet App</h1>
                  <span className="text-[10px] bg-red-500/15 text-red-300 px-2 py-0.5 rounded-full font-bold border border-red-500/25">
                    Nagpur ALS · MH-31
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Coordination & hospital readiness terminal</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl">
              {steps.map((s) => {
                const isActive = currentStep === s.id;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStep(s.id as ParamedicStep)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? "bg-red-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-5">
        {/* Supreme Court Guardrail Banner */}
        <LegalGuardrailBanner compact />

        {/* =========================================================================
            STEP 1: VITALS, PATIENT IDENTITY & PRIORITY
        ========================================================================= */}
        {currentStep === "vitals" && (
          <div className="space-y-5 animate-fade-in">
            {/* Quick Test Preset Injectors */}
            <div className="glass border border-white/[0.08] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Quick Load Official Test Cases (Build Guide Page 7)
                </span>
                <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">
                  Synthetic Nagpur Data
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => loadPresetScenario(0)}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs text-slate-300 font-semibold"
                >
                  <div className="text-white">1. Clean English</div>
                  <div className="text-[10px] text-slate-400 font-normal">Wardha Rd, GCS 8, Shock</div>
                </button>
                <button
                  onClick={() => loadPresetScenario(1)}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs text-slate-300 font-semibold"
                >
                  <div className="text-orange-400">2. Hindi Audio Note</div>
                  <div className="text-[10px] text-slate-400 font-normal">सीताबर्डी, बीपी 88, उल्टी</div>
                </button>
                <button
                  onClick={() => loadPresetScenario(2)}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs text-slate-300 font-semibold"
                >
                  <div className="text-emerald-400">3. Marathi Mixed Note</div>
                  <div className="text-[10px] text-slate-400 font-normal">धरमपेठ, SpO2 86%, Flail</div>
                </button>
              </div>
            </div>

            {/* Paramedic Priority Selector (Human Sets Priority!) */}
            <div className="glass border border-white/[0.08] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Paramedic Triage Priority Selection</h3>
                  <p className="text-xs text-slate-400">AI never sets priority. Paramedic clinician assigns classification:</p>
                </div>
                <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full font-semibold border border-amber-500/30">
                  Human Authority
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPriority("P1_CRITICAL")}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    priority === "P1_CRITICAL"
                      ? "bg-red-500/20 border-red-500 text-white shadow-lg shadow-red-500/10 ring-1 ring-red-500"
                      : "bg-[#0c1526]/80 border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <div className="text-xs font-bold text-red-400">P1 CRITICAL</div>
                  <div className="text-[10px] text-slate-400 mt-1">Life-Threatening • Shock</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("P2_SERIOUS")}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    priority === "P2_SERIOUS"
                      ? "bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500"
                      : "bg-[#0c1526]/80 border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <div className="text-xs font-bold text-amber-400">P2 SERIOUS</div>
                  <div className="text-[10px] text-slate-400 mt-1">Potentially Unstable</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("P3_STABLE")}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    priority === "P3_STABLE"
                      ? "bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500"
                      : "bg-[#0c1526]/80 border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <div className="text-xs font-bold text-emerald-400">P3 STABLE</div>
                  <div className="text-[10px] text-slate-400 mt-1">Delayed Urgent Care</div>
                </button>
              </div>
            </div>

            {/* Patient Demographics */}
            <div className="glass border border-white/[0.08] rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Patient Identification (Synthetic)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Patient Full Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-[#0a101f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/80 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full bg-[#0a101f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/80 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Vitals Monitor */}
            <VitalsMonitor vitals={vitals} onChange={handleVitalsChange} />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentStep("injury")}
                className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/30 flex items-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Continue to Multilingual Note</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: MULTILINGUAL NOTE & OPTIONAL PHOTO
        ========================================================================= */}
        {currentStep === "injury" && (
          <div className="space-y-5 animate-fade-in">
            {/* Optional Trauma Photo */}
            <div className="glass border border-white/[0.08] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Trauma Wound Photo (Optional)</h3>
                </div>
                <span className="text-[10px] text-slate-400">Documentary use only</span>
              </div>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-white/[0.1] max-h-64 flex items-center justify-center bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Wound capture" className="w-full h-full object-cover max-h-64" />
                  <button
                    onClick={() => setImagePreview(null)}
                    className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-white/20 hover:bg-red-600 transition-colors"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/[0.1] rounded-xl bg-[#0a101f]/60 cursor-pointer hover:border-blue-500/40 hover:bg-[#0a101f] transition-all text-center">
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-white">Upload or Capture Trauma Image</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Compressed client-side for low-bandwidth 2G/3G connectivity</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Multilingual Voice Notes Recorder */}
            <div className="glass border border-white/[0.08] rounded-2xl p-5">
              <VoiceNotesRecorder
                value={notes}
                onChange={setNotes}
                language={language}
                onLanguageChange={setLanguage}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep("vitals")}
                className="px-6 py-3 bg-[#0c1526]/80 hover:bg-[#131f38] text-slate-300 border border-white/[0.08] text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Vitals</span>
              </button>

              <button
                onClick={handleStructureWithGemini}
                disabled={isStructuring}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isStructuring ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Gemini Structuring SBAR...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Generate SBAR Handover</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: SBAR REVIEW & EDIT DRAFT (Build Guide Page 7)
        ========================================================================= */}
        {currentStep === "sbar" && (
          <div className="space-y-5 animate-fade-in">
            <div className="glass border border-white/[0.08] rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">4-Part SBAR Handover (Editable Draft)</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-semibold border border-emerald-500/30">
                    Cites Exact Source Quotes
                  </span>
                  {sbarDraft.needs_review && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-semibold border border-amber-500/30">
                      Flagged for Review
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Situation */}
                <div className="bg-[#0a101f]/80 p-3.5 rounded-xl border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">1. Situation</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      sbarDraft.situation.confidence === "high"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}>
                      Confidence: {sbarDraft.situation.confidence}
                    </span>
                  </div>
                  <textarea
                    value={sbarDraft.situation.text}
                    onChange={(e) =>
                      setSbarDraft({
                        ...sbarDraft,
                        situation: { ...sbarDraft.situation, text: e.target.value },
                      })
                    }
                    rows={2}
                    className="w-full bg-[#070c18] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-colors"
                  />
                  <div className="text-[10px] text-slate-400 italic">
                    Source Quote: &ldquo;{sbarDraft.situation.source_quote}&rdquo;
                  </div>
                </div>

                {/* Background */}
                <div className="bg-[#0a101f]/80 p-3.5 rounded-xl border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">2. Background</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      sbarDraft.background.confidence === "high"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}>
                      Confidence: {sbarDraft.background.confidence}
                    </span>
                  </div>
                  <textarea
                    value={sbarDraft.background.text}
                    onChange={(e) =>
                      setSbarDraft({
                        ...sbarDraft,
                        background: { ...sbarDraft.background, text: e.target.value },
                      })
                    }
                    rows={2}
                    className="w-full bg-[#070c18] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500/80 transition-colors"
                  />
                  <div className="text-[10px] text-slate-400 italic">
                    Source Quote: &ldquo;{sbarDraft.background.source_quote}&rdquo;
                  </div>
                </div>

                {/* Assessment */}
                <div className="bg-[#0a101f]/80 p-3.5 rounded-xl border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">3. Assessment</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      sbarDraft.assessment.confidence === "high"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}>
                      Confidence: {sbarDraft.assessment.confidence}
                    </span>
                  </div>
                  <textarea
                    value={sbarDraft.assessment.text}
                    onChange={(e) =>
                      setSbarDraft({
                        ...sbarDraft,
                        assessment: { ...sbarDraft.assessment, text: e.target.value },
                      })
                    }
                    rows={2}
                    className="w-full bg-[#070c18] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/80 transition-colors"
                  />
                  <div className="text-[10px] text-slate-400 italic">
                    Source Quote: &ldquo;{sbarDraft.assessment.source_quote}&rdquo;
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-[#0a101f]/80 p-3.5 rounded-xl border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">4. Recommendation</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      sbarDraft.recommendation.confidence === "high"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}>
                      Confidence: {sbarDraft.recommendation.confidence}
                    </span>
                  </div>
                  <textarea
                    value={sbarDraft.recommendation.text}
                    onChange={(e) =>
                      setSbarDraft({
                        ...sbarDraft,
                        recommendation: { ...sbarDraft.recommendation, text: e.target.value },
                      })
                    }
                    rows={2}
                    className="w-full bg-[#070c18] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition-colors"
                  />
                  <div className="text-[10px] text-slate-400 italic">
                    Source Quote: &ldquo;{sbarDraft.recommendation.source_quote}&rdquo;
                  </div>
                </div>

                {/* Missing Data Flagging */}
                {sbarDraft.missing_info.length > 0 && (
                  <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Missing Data Flagged (Not Invented):</span>
                      <ul className="list-disc pl-4 mt-1 text-[11px] text-slate-300">
                        {sbarDraft.missing_info.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep("injury")}
                className="px-6 py-3 bg-[#0c1526]/80 hover:bg-[#131f38] text-slate-300 border border-white/[0.08] text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Note</span>
              </button>

              <button
                onClick={() => setCurrentStep("routing")}
                className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/30 flex items-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Confirm SBAR &amp; Proceed to Ranking</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: HOSPITAL RANKING V2 & DISPATCH
        ========================================================================= */}
        {currentStep === "routing" && (
          <div className="space-y-5 animate-fade-in">
            <div className="glass border border-white/[0.08] rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Algorithmic Hospital Shortlist (Nagpur Pilot)</h3>
                </div>
                <span className="text-[10px] bg-white/[0.05] text-slate-300 px-2.5 py-0.5 rounded-full border border-white/[0.08] font-mono">
                  Stage 1 Hard Filter + 100-Pt Score
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Ranked by Capability Match (40), Route ETA (25), Confirmation Freshness (20), and Historical Reliability (15) with Status Multiplier. <strong className="text-white">The system suggests; the human paramedic decides.</strong>
              </p>

              <div className="space-y-3">
                {rankedHospitals.map((res, idx) => {
                  const hosp = res.hospital;
                  const isSelected = hosp.hospital_id === selectedHospitalId;

                  if (!res.isEligible) {
                    return (
                      <div
                        key={hosp.hospital_id}
                        className="p-4 rounded-xl border border-white/[0.04] bg-[#0a101f]/30 opacity-60 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-400 line-through">{hosp.name}</div>
                          <div className="text-[11px] text-rose-400 mt-1 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Filtered: {res.filterReason}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">
                          DISQUALIFIED
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={hosp.hospital_id}
                      onClick={() => setSelectedHospitalId(hosp.hospital_id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#0f1d36] border-red-500/80 shadow-xl shadow-red-500/10 ring-1 ring-red-500"
                          : "bg-[#0a101f]/70 border-white/[0.06] hover:border-white/20 hover:bg-[#0c1526]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              #{idx + 1} {hosp.name}
                            </span>
                            {res.isCloseChoice && (
                              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-semibold border border-purple-500/30">
                                Close Score (Paramedic Choice)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{hosp.trauma_level} • {hosp.city}</p>
                          <p className="text-xs text-emerald-400 font-medium">{res.oneLineReason}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-black font-mono text-white">
                            {res.finalScore}
                            <span className="text-xs text-slate-500">/100</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            hosp.status === "Accepting"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}>
                            {hosp.status} ({res.multiplier}x)
                          </span>
                        </div>
                      </div>

                      {/* Capabilities pill row */}
                      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/[0.06] text-[10px]">
                        <span className="text-slate-400">Capabilities:</span>
                        {hosp.capabilities.ct && (
                          <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08]">CT Scanner</span>
                        )}
                        {hosp.capabilities.blood_bank && (
                          <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08]">Blood Bank O-Neg</span>
                        )}
                        {hosp.capabilities.trauma_surgeon && (
                          <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08]">Trauma Surgeon</span>
                        )}
                        {hosp.capabilities.neuro && (
                          <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08]">Neurosurgery</span>
                        )}
                        <span className="text-slate-400 ml-auto">
                          Historical Reliability: <strong className="text-white">{Math.round(hosp.reliability * 100)}%</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dispatch Action */}
              <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  Target Destination: <strong className="text-white">
                    {hospitals.find((h) => h.hospital_id === selectedHospitalId)?.name}
                  </strong>
                </div>

                <button
                  onClick={handleDispatchHospital}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Send Handover &amp; Request 15-Min Hold</span>
                </button>
              </div>
            </div>

            {/* Arrival Feedback Loop Section (Build Guide Page 3 & 4) */}
            <div className="glass border border-white/[0.08] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Trauma Bay Arrival Feedback Loop</h3>
                </div>
                <span className="text-[10px] bg-white/[0.05] text-slate-400 px-2.5 py-0.5 rounded-full font-mono border border-white/[0.08]">
                  Updates Hospital Reliability
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Upon patient physical handover at the trauma center, record the actual intake outcome to calibrate the platform&apos;s predictive reliability model:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (activeSession) {
                      recordArrivalFeedback(activeSession.session_id, "accepted_as_promised");
                      alert("Recorded: Patient accepted as promised! Hospital reliability score positively updated.");
                    }
                  }}
                  className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 text-left transition-all flex items-center gap-3 hover:border-emerald-500/50"
                >
                  <ThumbsUp className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-300">Accepted as Promised</div>
                    <div className="text-[10px] text-slate-400">Hospital prepared; immediate bed admission</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (activeSession) {
                      recordArrivalFeedback(activeSession.session_id, "turned_away");
                      alert("Recorded: Patient turned away / bounced. Hospital reliability score penalized.");
                    }
                  }}
                  className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-left transition-all flex items-center gap-3 hover:border-rose-500/50"
                >
                  <ThumbsDown className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-rose-300">Turned Away / Diverted</div>
                    <div className="text-[10px] text-slate-400">Hospital declined on arrival or unprepared</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
