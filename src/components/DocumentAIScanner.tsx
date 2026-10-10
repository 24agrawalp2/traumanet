"use client";

import React, { useState } from "react";
import { FileText, Upload, Sparkles, CheckCircle2, ShieldCheck, CreditCard } from "lucide-react";
import { CostBreakdown } from "@/lib/types";

interface DocumentAIScannerProps {
  onScanComplete: (details: {
    provider: string;
    idNumber: string;
    coverageInr: number;
    breakdown: CostBreakdown;
  }) => void;
  currentDepositInr: number;
}

export default function DocumentAIScanner({
  onScanComplete,
  currentDepositInr,
}: DocumentAIScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scannedDoc, setScannedDoc] = useState<{
    name: string;
    idNumber: string;
    provider: string;
    type: string;
    coverageInr: number;
    subsidyInr: number;
  } | null>(null);

  const simulateDocAiScan = (type: "ABHA" | "PRIVATE") => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);

      if (type === "ABHA") {
        const breakdown: CostBreakdown = {
          items: [
            { item: "Emergency ICU Bed Soft-Lock & Setup", cost_inr: 8000, covered_by_insurance_pct: 100 },
            { item: "Trauma Bay Rapid Stabilization Kit", cost_inr: 5000, covered_by_insurance_pct: 100 },
            { item: "Whole Body Polytrauma CT (Pan-Scan)", cost_inr: 9000, covered_by_insurance_pct: 100 },
            { item: "Emergency Blood Bank Cross-Match (4 units)", cost_inr: 4500, covered_by_insurance_pct: 90 },
          ],
          subtotal_inr: 26500,
          abha_subsidy_inr: 5000,
          insurance_deductible_inr: 0,
          final_patient_deposit_inr: 2500, // Minimal token deposit under PM-JAY
        };

        const result = {
          name: "Ayushman Bharat National Health Card",
          idNumber: "14-9921-5502-3819 (ABHA ID)",
          provider: "Ayushman Bharat PM-JAY (Govt of India)",
          type: "Govt Health ID",
          coverageInr: 500000,
          subsidyInr: 5000,
        };

        setScannedDoc(result);
        onScanComplete({
          provider: result.provider,
          idNumber: result.idNumber,
          coverageInr: result.coverageInr,
          breakdown,
        });
      } else {
        const breakdown: CostBreakdown = {
          items: [
            { item: "Emergency ICU Bed Soft-Lock & Setup", cost_inr: 8000, covered_by_insurance_pct: 85 },
            { item: "Trauma Bay Rapid Stabilization Kit", cost_inr: 5000, covered_by_insurance_pct: 90 },
            { item: "Whole Body Polytrauma CT (Pan-Scan)", cost_inr: 9000, covered_by_insurance_pct: 80 },
            { item: "Emergency Blood Bank Cross-Match (4 units)", cost_inr: 4500, covered_by_insurance_pct: 75 },
          ],
          subtotal_inr: 26500,
          abha_subsidy_inr: 0,
          insurance_deductible_inr: 5000,
          final_patient_deposit_inr: 8500,
        };

        const result = {
          name: "Star Health Comprehensive Trauma Shield",
          idNumber: "SH-EM-884210",
          provider: "Star Health & Allied Insurance",
          type: "Private Cashless TPA",
          coverageInr: 1000000,
          subsidyInr: 0,
        };

        setScannedDoc(result);
        onScanComplete({
          provider: result.provider,
          idNumber: result.idNumber,
          coverageInr: result.coverageInr,
          breakdown,
        });
      }
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateDocAiScan("PRIVATE");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-blue" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Document AI Simulator (ABHA / Insurance OCR)
          </h4>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
          Auto-TPA Verification
        </span>
      </div>

      {scanning ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-3 bg-slate-950/80 rounded-xl border border-slate-800">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-accent-blue/30 border-t-accent-blue animate-spin" />
            <Sparkles className="w-5 h-5 text-accent-blue absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-white">Extracting Health ID &amp; Policy Limits...</div>
            <p className="text-[10px] text-slate-400">
              Querying National Health Stack (ABHA) &amp; TPA Pre-Auth Gateway
            </p>
          </div>
        </div>
      ) : scannedDoc ? (
        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white">{scannedDoc.name}</span>
                <p className="text-[11px] text-emerald-300 font-mono">{scannedDoc.idNumber}</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400">Total Sum Insured:</span>
              <p className="font-bold text-white font-mono">
                ₹{(scannedDoc.coverageInr).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Pre-Auth Out-of-Pocket:</span>
              <p className="font-bold text-emerald-400 font-mono">
                ₹{currentDepositInr.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => simulateDocAiScan("ABHA")}
              className="text-[10px] text-slate-400 hover:text-white underline"
            >
              Scan Another Card
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Upload patient ABHA Health Card or Private Insurance to auto-calculate out-of-pocket deposit and eliminate billing counter delays:
          </p>

          {/* Quick preset trigger buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => simulateDocAiScan("ABHA")}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CreditCard className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Ayushman Bharat (ABHA)</div>
                <div className="text-[10px] text-slate-400">PM-JAY ₹5L Cashless Shield</div>
              </div>
            </button>

            <button
              onClick={() => simulateDocAiScan("PRIVATE")}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Star Health / Private TPA</div>
                <div className="text-[10px] text-slate-400">Instant Pre-Auth Waiver</div>
              </div>
            </button>
          </div>

          {/* Real file upload option */}
          <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer text-xs transition-colors">
            <Upload className="w-4 h-4" />
            <span>Or upload image / PDF document</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
