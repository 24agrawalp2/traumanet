// =====================================================================
// TRAUMANET v2 ADMIN DEMO & JUDGE PRESENTATION COCKPIT
// Aligned with Build Guide Pages 8, 9 & 10 (Demo script, 5 Presets, Judge Q&A)
// =====================================================================

"use client";

import React, { useState } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import { TEST_SCENARIOS } from "@/lib/mockData";
import {
  Zap,
  Activity,
  Sparkles,
  Play,
  RotateCcw,
  ExternalLink,
  Code,
  Key,
  HelpCircle,
  Clock,
  ShieldCheck,
  List,
  CheckCircle2,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import Link from "next/link";
import LegalGuardrailBanner from "@/components/LegalGuardrailBanner";

export default function AdminDemoPage() {
  const {
    activeSession,
    hospitals,
    auditLogs,
    injectEmergencyScenario,
    resetAllData,
    useLiveGemini,
    setUseLiveGemini,
    geminiApiKey,
    setGeminiApiKey,
    simulateAmbulanceProgress,
  } = useTraumaNet();

  const [injectedMessage, setInjectedMessage] = useState<string | null>(null);
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"presets" | "qa" | "audit" | "script">("presets");

  const handleInject = (index: number) => {
    const s = injectEmergencyScenario(index);
    setInjectedMessage(`Loaded Preset #${index + 1}: "${s.incident_title}"`);
    setTimeout(() => setInjectedMessage(null), 2500);
  };

  const handleTestGemini = async () => {
    if (!geminiApiKey && !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      setKeyTestStatus("Please enter a valid Gemini API key first.");
      return;
    }
    setTestingApiKey(true);
    setKeyTestStatus(null);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vitals: {
            blood_pressure_sys: 84,
            blood_pressure_dia: 52,
            pulse_rate: 132,
            spo2: 89,
            respiratory_rate: 28,
            gcs_score: 8,
          },
          notes: "Live Hackathon Gemini API Connectivity Check from Nagpur",
          apiKey: geminiApiKey,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setKeyTestStatus("✅ Gemini Connected! SBAR Situation: " + data.handover.situation.text.slice(0, 50) + "...");
      } else {
        setKeyTestStatus("⚠️ API error: " + (data.error || "Unknown"));
      }
    } catch (e: any) {
      setKeyTestStatus("❌ Connection error: " + e.message);
    } finally {
      setTestingApiKey(false);
    }
  };

  const judgeQuestions = [
    {
      q: "What if the hospital's data is wrong?",
      a: "We do not use live bed counts. The hospital confirms for each individual case, holds auto-expire at 15 minutes, and hospitals that confirm then turn patients away are penalized via dynamic reliability scoring.",
    },
    {
      q: "Who is liable if Gemini is wrong?",
      a: "Gemini only structures the paramedic's words into SBAR, displays the exact source text and confidence flag, and a clinician confirms. It makes zero medical diagnoses and never sets priority.",
    },
    {
      q: "Why would hospitals use this instead of a phone call?",
      a: "They receive an unambiguous structured SBAR handover, verified pre-authorization paperwork, and a prepared trauma bay ahead of arrival, replacing chaotic phone tag.",
    },
    {
      q: "What did you really build versus mock?",
      a: "Core loop is 100% built: Paramedic multilingual intake, Gemini SBAR structuring, 100-point ranking algorithm, 15-min hold state machine, and arrival feedback. Sample hospitals, ABHA sandbox, and cost range table are simulated and clearly labelled.",
    },
    {
      q: "What is your moat?",
      a: "Hospital trust network, empirical reliability performance data from real cases, and ambulance operator workflows. Pilot data compounds exponentially.",
    },
    {
      q: "Is this payment before emergency treatment?",
      a: "No! Absolutely not. UPI is removed. Treatment begins immediately upon arrival under the Supreme Court Parmanand Katara ruling. Family pre-registers strictly for paperwork readiness.",
    },
    {
      q: "How do you handle privacy?",
      a: "DPDP Act 2023 consent modal, minimal data principles, synthetic patients in the demo, role-based boundaries, and an immutable cryptographic audit log.",
    },
    {
      q: "Who pays for TraumaNet?",
      a: "Ambulance fleet operators per vehicle subscription (free during the 3-month Nagpur pilot). Hospitals are never charged for accepting patients.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020817] text-white pb-16">
      {/* Top Demo Header */}
      <div className="bg-[#020817]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">Demo &amp; Judge Presentation Cockpit</h1>
                <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                  v2 Nagpur Pilot
                </span>
              </div>
              <p className="text-xs text-slate-400">GDG x Ramdeobaba University Hackathon Presentation Controller</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleInject(0)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-900/30 flex items-center gap-1.5 transition-all hover:scale-[1.01]"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>⚡ Inject 30-Sec Scenario</span>
            </button>

            <button
              onClick={resetAllData}
              className="px-3.5 py-2 rounded-xl bg-[#0c1526]/80 hover:bg-[#131f38] text-slate-300 border border-white/[0.08] text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-5 animate-fade-in">
        <LegalGuardrailBanner compact />

        {/* Injected Notification Alert */}
        {injectedMessage && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-300 animate-fade-in shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{injectedMessage}</span>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 glass p-1.5 rounded-2xl border border-white/[0.08] w-fit shadow-md">
          <button
            onClick={() => setActiveTab("presets")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "presets"
                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-900/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            1. 5 Official Test Presets
          </button>
          <button
            onClick={() => setActiveTab("qa")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "qa"
                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-900/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            2. Judge Q&amp;A Cheat Sheet
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "audit"
                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-900/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            3. Live Audit Trail ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("script")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "script"
                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-900/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            4. 3-Minute Demo Script
          </button>
        </div>

        {/* =========================================================================
            TAB 1: 5 OFFICIAL TEST PRESETS (Page 7)
        ========================================================================= */}
        {activeTab === "presets" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEST_SCENARIOS.map((preset, idx) => (
                <div
                  key={preset.id}
                  className="glass border border-white/[0.08] rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{preset.label}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        preset.priority === "P1_CRITICAL"
                          ? "bg-red-500/15 text-red-300 border-red-500/30"
                          : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      }`}>
                        {preset.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{preset.mechanism}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{preset.description}</p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      Lang: {preset.language.toUpperCase()} • GCS {preset.vitals.gcs}
                    </span>
                    <button
                      onClick={() => handleInject(idx)}
                      className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-xs font-bold border border-amber-500/30 transition-all shadow-sm"
                    >
                      Load Preset
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Gemini API Connectivity Tool */}
            <div className="glass border border-white/[0.08] rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Live Gemini 1.5 Multimodal API Key Tester</h3>
                </div>
                <span className="text-[10px] bg-white/[0.05] text-slate-300 px-2 py-0.5 rounded-full font-mono border border-white/[0.08]">
                  Stage Verification
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="password"
                  placeholder="Paste GEMINI_API_KEY for live Vertex/Gemini call..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="bg-[#0a101f] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white flex-1 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                />
                <button
                  onClick={handleTestGemini}
                  disabled={testingApiKey}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shrink-0 shadow-lg shadow-blue-900/30"
                >
                  {testingApiKey ? "Calling Vertex AI..." : "Test Live Structuring"}
                </button>
              </div>

              {keyTestStatus && (
                <div className="p-3 rounded-xl bg-[#0a101f] border border-white/[0.08] text-xs font-mono text-slate-300">
                  {keyTestStatus}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: JUDGE Q&A CHEAT SHEET (Build Guide Page 9 & 10)
        ========================================================================= */}
        {activeTab === "qa" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {judgeQuestions.map((qa, idx) => (
              <div key={idx} className="glass border border-white/[0.08] rounded-2xl p-5 space-y-2 shadow-lg">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <h4 className="text-xs font-bold text-white">{qa.q}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">{qa.a}</p>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            TAB 3: LIVE AUDIT TRAIL (Page 2 & 7)
        ========================================================================= */}
        {activeTab === "audit" && (
          <div className="glass border border-white/[0.08] rounded-2xl p-6 space-y-4 animate-fade-in shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Cryptographic Audit Trail (DPDP Compliance)</h3>
              </div>
              <span className="text-[10px] bg-white/[0.05] text-slate-400 px-2 py-0.5 rounded-full font-mono border border-white/[0.08]">
                Immutable Event Log
              </span>
            </div>

            <div className="divide-y divide-white/[0.06] bg-[#0a101f]/80 rounded-xl border border-white/[0.06] overflow-hidden text-xs max-h-96 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white text-xs">{log.who}</div>
                    <p className="text-slate-300 text-xs">{log.what}</p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: 3-MINUTE DEMO SCRIPT (Page 9)
        ========================================================================= */}
        {activeTab === "script" && (
          <div className="glass border border-white/[0.08] rounded-2xl p-6 space-y-4 animate-fade-in shadow-xl">
            <h3 className="text-sm font-bold text-white">3-Minute Stage Pitch Script (Strict Timing)</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0a101f]/80 border border-white/[0.06] space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-amber-400 font-bold">
                  <span>0:00 - 0:20 (Problem Slide)</span>
                  <span>Say this</span>
                </div>
                <p className="text-slate-200">
                  &ldquo;In India, trauma patients bounce between hospitals that cannot treat them and arrive unprepared. TraumaNet does not make ambulances faster; it eliminates wrong-hospital bouncing and unprepared arrivals.&rdquo;
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a101f]/80 border border-white/[0.06] space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-blue-400 font-bold">
                  <span>0:20 - 1:00 (Paramedic App)</span>
                  <span>Say this</span>
                </div>
                <p className="text-slate-200">
                  &ldquo;Paramedic speaks a Hindi or Marathi note. Gemini structures it into SBAR, citing exact quotes. The AI never diagnoses or sets priority — the paramedic sets P1 Critical.&rdquo;
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a101f]/80 border border-white/[0.06] space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-purple-400 font-bold">
                  <span>1:00 - 1:30 (Ranked List)</span>
                  <span>Say this</span>
                </div>
                <p className="text-slate-200">
                  &ldquo;Our 100-point ranking algorithm uses required capabilities, traffic ETA, and hospital reliability to recommend the top destination with a clear one-line rationale.&rdquo;
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a101f]/80 border border-white/[0.06] space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-emerald-400 font-bold">
                  <span>1:30 - 2:10 (ER Command Tower)</span>
                  <span>Say this</span>
                </div>
                <p className="text-slate-200">
                  &ldquo;The hospital ER taps &apos;Accepting&apos;, locking a 15-minute hold and alerting the trauma team. We confirm on-request rather than relying on fake live bed data.&rdquo;
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a101f]/80 border border-white/[0.06] space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-teal-400 font-bold">
                  <span>2:10 - 2:40 (Family Portal)</span>
                  <span>Say this</span>
                </div>
                <p className="text-slate-200">
                  &ldquo;Family completes paperwork ahead of time. Under Supreme Court law, treatment never waits on payment — UPI is completely removed. Paperwork is pre-registered so doctors can immediately operate.&rdquo;
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a101f]/80 border border-white/[0.06] space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-red-400 font-bold">
                  <span>2:40 - 3:00 (Safeguards &amp; Nagpur Pilot)</span>
                  <span>Say this</span>
                </div>
                <p className="text-slate-200">
                  &ldquo;Piloting in Nagpur with 1 ambulance fleet and 5 hospitals for 3 months, expanding to 108/112 state emergency fleets.&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
