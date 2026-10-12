// =====================================================================
// TRAUMANET v2 DOCUMENT AI & INSURANCE PRE-REGISTRATION
// Aligned with Build Guide Page 3 & 4 (Pre-authorization readiness, No UPI)
// =====================================================================

"use client";

import React, { useState } from "react";
import { Sparkles, ShieldCheck, CreditCard, Upload, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { scanInsuranceCardWithGemini } from "@/lib/gemini";
import { PaymentRouteSuggestion } from "@/lib/types";

interface DocumentAIScannerProps {
  onScanComplete: (details: {
    provider: string;
    idNumber: string;
    tpa: string;
    route: PaymentRouteSuggestion;
  }) => void;
  geminiApiKey?: string;
}

export default function DocumentAIScanner({
  onScanComplete,
  geminiApiKey,
}: DocumentAIScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    insurer: string;
    policyNumber: string;
    tpa: string;
    patientName: string;
    route: PaymentRouteSuggestion;
    isConfirmed: boolean;
  } | null>(null);

  const [abhaInput, setAbhaInput] = useState("91-4432-8819-2041");
  const [abhaValid, setAbhaValid] = useState(true);

  const validateAbha = (val: string) => {
    setAbhaInput(val);
    // ABHA standard format: 14 digits with hyphens (e.g., 91-4432-8819-2041)
    const regex = /^\d{2}-\d{4}-\d{4}-\d{4}$/;
    setAbhaValid(regex.test(val));
  };

  const handleSimulateCard = async (type: "ABHA" | "PRIVATE" | "MORTH") => {
    setScanning(true);

    setTimeout(() => {
      setScanning(false);
      let res;
      if (type === "ABHA") {
        res = {
          insurer: "Ayushman Bharat PM-JAY (Govt of India)",
          policyNumber: abhaInput || "14-9921-5502-3819",
          tpa: "National Health Authority (NHA)",
          patientName: "Rahul Ramteke",
          route: "PM_JAY" as PaymentRouteSuggestion,
          isConfirmed: false,
        };
      } else if (type === "MORTH") {
        res = {
          insurer: "MoRTH Road Accident Cashless Scheme",
          policyNumber: "MORTH-NGP-2026-TR881",
          tpa: "General Insurance Council (GIC)",
          patientName: "Rahul Ramteke",
          route: "ROAD_ACCIDENT_SCHEME" as PaymentRouteSuggestion,
          isConfirmed: false,
        };
      } else {
        res = {
          insurer: "Star Health Comprehensive Trauma Shield",
          policyNumber: "SH-NAG-2026-99120",
          tpa: "Medi Assist Insurance TPA",
          patientName: "Rahul Ramteke",
          route: "PRIVATE_INSURANCE" as PaymentRouteSuggestion,
          isConfirmed: false,
        };
      }
      setExtractedData(res);
    }, 700);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScanning(true);
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await scanInsuranceCardWithGemini(base64, geminiApiKey);
          setExtractedData({
            insurer: res.insurer,
            policyNumber: res.policy_number,
            tpa: res.tpa,
            patientName: res.patient_name,
            route: "PRIVATE_INSURANCE",
            isConfirmed: false,
          });
        } catch {
          handleSimulateCard("PRIVATE");
        } finally {
          setScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmFields = () => {
    if (!extractedData) return;
    setExtractedData({ ...extractedData, isConfirmed: true });
    onScanComplete({
      provider: extractedData.insurer,
      idNumber: extractedData.policyNumber,
      tpa: extractedData.tpa,
      route: extractedData.route,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-bold text-white">
            Insurance &amp; ABHA Paperwork Pre-Registration
          </h4>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700 font-semibold w-fit">
          Paperwork Readiness • Zero Delay
        </span>
      </div>

      {/* ABHA Format Check Field (Simulated ABDM) */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            Ayushman Bharat Health Account (ABHA ID)
          </label>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
            SIMULATED — ABDM Sandbox Not Connected
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={abhaInput}
            onChange={(e) => validateAbha(e.target.value)}
            placeholder="XX-XXXX-XXXX-XXXX"
            className={`bg-slate-900 text-white font-mono text-xs px-3 py-2 rounded-xl border flex-1 focus:outline-none ${
              abhaValid ? "border-slate-700 focus:border-blue-500" : "border-rose-500"
            }`}
          />
          <button
            onClick={() => handleSimulateCard("ABHA")}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shrink-0"
          >
            Verify ABHA
          </button>
        </div>
        {!abhaValid && (
          <p className="text-[11px] text-rose-400">
            Format should be 14 digits separated by hyphens (e.g., 91-4432-8819-2041).
          </p>
        )}
      </div>

      {/* Card Upload / OCR Scan */}
      {scanning ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-3 bg-slate-950 rounded-xl border border-slate-800">
          <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          <div className="text-center">
            <div className="text-sm font-semibold text-white">Gemini Extracting Policy Details...</div>
            <p className="text-xs text-slate-400 mt-0.5">
              Parsing Insurer, Policy Number &amp; TPA from card image
            </p>
          </div>
        </div>
      ) : extractedData ? (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Extracted Card Details — Confirm Each Field</span>
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono">
              Human Review Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Insurance Company</span>
              <input
                type="text"
                value={extractedData.insurer}
                onChange={(e) => setExtractedData({ ...extractedData, insurer: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-medium"
              />
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Policy / ABHA Number</span>
              <input
                type="text"
                value={extractedData.policyNumber}
                onChange={(e) => setExtractedData({ ...extractedData, policyNumber: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Third-Party Administrator (TPA)</span>
              <input
                type="text"
                value={extractedData.tpa}
                onChange={(e) => setExtractedData({ ...extractedData, tpa: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-medium"
              />
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Suggested Cashless Route</span>
              <select
                value={extractedData.route}
                onChange={(e) => setExtractedData({ ...extractedData, route: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 text-xs font-bold"
              >
                <option value="PM_JAY">Ayushman Bharat PM-JAY (Govt)</option>
                <option value="PRIVATE_INSURANCE">Private TPA Cashless</option>
                <option value="ROAD_ACCIDENT_SCHEME">MoRTH Road Accident Scheme</option>
                <option value="SELF_PAY">Self-Pay / Post-Discharge</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              *The hospital insurance desk will confirm final eligibility upon arrival.
            </span>
            <button
              onClick={handleConfirmFields}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                extractedData.isConfirmed
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-md"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {extractedData.isConfirmed ? "Verified & Locked" : "Confirm Extracted Fields"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            Upload or select synthetic test insurance cards to pre-fill the hospital admission dossier:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => handleSimulateCard("ABHA")}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex flex-col justify-between"
            >
              <span className="text-xs font-bold text-orange-400">Ayushman Bharat</span>
              <span className="text-[10px] text-slate-400 mt-1">PM-JAY National Health ID</span>
            </button>
            <button
              onClick={() => handleSimulateCard("PRIVATE")}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex flex-col justify-between"
            >
              <span className="text-xs font-bold text-blue-400">Private Cashless</span>
              <span className="text-[10px] text-slate-400 mt-1">Star Health / TPA Card</span>
            </button>
            <button
              onClick={() => handleSimulateCard("MORTH")}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex flex-col justify-between"
            >
              <span className="text-xs font-bold text-emerald-400">Road Accident Scheme</span>
              <span className="text-[10px] text-slate-400 mt-1">MoRTH Statutory Fund</span>
            </button>
          </div>

          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 hover:bg-slate-950 cursor-pointer text-xs text-slate-400 hover:text-white transition-all">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Upload Synthetic Insurance Card (Gemini Multimodal OCR)</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}
    </div>
  );
}
