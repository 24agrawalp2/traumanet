// =====================================================================
// TRAUMANET v2 STATUTORY LEGAL GUARDRAIL BANNER
// Supreme Court of India - Parmanand Katara Mandate
// =====================================================================

"use client";

import React from "react";
import { ShieldCheck, Scale, AlertCircle } from "lucide-react";

export default function LegalGuardrailBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-emerald-300">
        <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-white">Supreme Court Guardrail:</strong> Emergency care is never delayed for payment. Paperwork is pre-filled for arrival readiness.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Statutory Emergency Care Guarantee
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                SC Landmark Ruling • Parmanand Katara
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Every hospital is legally bound to initiate immediate trauma stabilization without demanding advance deposits or waiting for paperwork. TraumaNet prepares hospital insurance packets en-route to ensure zero delay upon handover.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            No Upfront Payments Demanded
          </span>
        </div>
      </div>
    </div>
  );
}
