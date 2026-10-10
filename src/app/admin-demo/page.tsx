"use client";

import React, { useState } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import { DEMO_SCENARIOS } from "@/lib/mockData";
import {
  Zap,
  Activity,
  Sparkles,
  RefreshCcw,
  Play,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Code,
  Sliders,
  Radio,
  Key,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import Link from "next/link";

export default function AdminDemoPage() {
  const {
    activeSession,
    hospitals,
    injectEmergencyScenario,
    resetAllData,
    useLiveGemini,
    setUseLiveGemini,
    geminiApiKey,
    setGeminiApiKey,
    simulateAmbulanceProgress,
    sessions,
    setActiveSessionId,
  } = useTraumaNet();

  const [injectedMessage, setInjectedMessage] = useState<string | null>(null);
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<string | null>(null);

  const handleInject = (index: number) => {
    const s = injectEmergencyScenario(index);
    setInjectedMessage(`Scenario Injected: "${s.incident_title}"`);
    setTimeout(() => setInjectedMessage(null), 3000);
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
            blood_pressure_sys: 85,
            blood_pressure_dia: 50,
            pulse_rate: 130,
            spo2: 89,
            respiratory_rate: 26,
            gcs_score: 8,
          },
          notes: "Live Hackathon Gemini API Connectivity Check",
          apiKey: geminiApiKey,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setKeyTestStatus("✅ Gemini 1.5 Connected! Trauma Score: " + data.data.trauma_score);
      } else {
        setKeyTestStatus("⚠️ API error: " + (data.error || "Unknown"));
      }
    } catch (e: any) {
      setKeyTestStatus("❌ Connection error: " + e.message);
    } finally {
      setTestingApiKey(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
      {/* Top Demo Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-950/50">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white">
                  Demo &amp; Hackathon Judging Cockpit
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  STAGE PRESENTATION MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                1-Click Emergency Scenario Injection &amp; Live Real-Time Telemetry Inspector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-emergency-red hover:bg-emergency-red-dark text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open 3-Pane View</span>
            </Link>
            <button
              onClick={resetAllData}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Flash banner */}
        {injectedMessage && (
          <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-500/70 text-amber-200 text-xs flex items-center gap-2.5 shadow-xl animate-in fade-in duration-300">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 fill-current" />
            <span className="font-bold">{injectedMessage}</span>
          </div>
        )}

        {/* Section 1: 30-Second Scenario Injector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 fill-current" />
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                ⚡ Inject 30-Second Emergency Scenario (Stage Demo)
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Instant Cross-Tab Dispatch</span>
          </div>

          <p className="text-xs text-slate-300">
            Trigger a complete end-to-end incident in 1 click. Watch the Paramedic terminal, ER Command Tower chime, and Family Portal update synchronously in under 200ms:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEMO_SCENARIOS.map((scenario, index) => (
              <div
                key={index}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
                      SCORE: {scenario.trauma_score} • {scenario.severity}
                    </span>
                    <span className="text-[10px] text-slate-500">Preset #{index + 1}</span>
                  </div>
                  <h3 className="font-bold text-white text-xs mt-2">{scenario.incident_title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {scenario.ai_pre_report}
                  </p>
                </div>

                <button
                  onClick={() => handleInject(index)}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs rounded-lg transition-all shadow-md shadow-red-950/40 flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Inject Case #{index + 1}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: AI Engine Switcher & Live Gemini Key Config */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-blue" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                AI Triage Engine Selector (Mock ATLS vs. Live Gemini 1.5)
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Multimodal Vision &amp; Text</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode Toggle */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Use Live Google Gemini 1.5 API
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Calls Google Gemini 1.5 for clinical reasoning
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={useLiveGemini}
                  onChange={(e) => setUseLiveGemini(e.target.checked)}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </label>

              <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {useLiveGemini
                  ? "Status: Live Gemini API Mode ACTIVE. Wound pictures and paramedic vitals are sent directly to Gemini 1.5 Flash."
                  : "Status: Deterministic ATLS Fallback Engine ACTIVE. Clinical scores computed via Revised Trauma Score formulas offline."}
              </div>
            </div>

            {/* Key Input & Test */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-accent-blue" />
                <span>Gemini API Key</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Paste AIzaSy... or leave blank for env key"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={handleTestGemini}
                  disabled={testingApiKey}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                >
                  {testingApiKey ? "Testing..." : "Test Key"}
                </button>
              </div>

              {keyTestStatus && (
                <p className="text-[11px] font-mono font-medium text-slate-300">
                  {keyTestStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Live Map & Ambulance Movement Simulator */}
        {activeSession && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Interactive Ambulance Corridor &amp; Hospital Network
                </h3>
              </div>
              <button
                onClick={simulateAmbulanceProgress}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-emerald-950/40"
              >
                <span>Advance Ambulance ETA (-2m)</span>
              </button>
            </div>

            <LiveMap session={activeSession} hospitals={hospitals} height="360px" />
          </div>
        )}

        {/* Section 4: Live Session JSON Inspector */}
        {activeSession && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Real-Time Database Inspector (Live Synchronized Document)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-purple-300">
                Session ID: {activeSession.session_id}
              </span>
            </div>

            <div className="max-h-64 overflow-auto bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400">
              <pre>{JSON.stringify(activeSession, null, 2)}</pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
