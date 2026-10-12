// =====================================================================
// TRAUMANET v2 DPDP ACT PATIENT PRIVACY CONSENT MODAL
// Digital Personal Data Protection Act Compliance (Page 2 & 5)
// =====================================================================

"use client";

import React from "react";
import { ShieldCheck, Lock, CheckCircle2, UserCheck, FileText } from "lucide-react";

interface DpdpConsentModalProps {
  patientName: string;
  onConsentGiven: () => void;
}

export default function DpdpConsentModal({
  patientName,
  onConsentGiven,
}: DpdpConsentModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">DPDP Act 2023 Consent Verification</h2>
            <p className="text-xs text-slate-400">Emergency Medical Data Access Authorization</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <p>
            You are accessing the emergency pre-admission portal for patient <strong className="text-white">{patientName}</strong>. Under the provisions of the Digital Personal Data Protection Act (DPDP Act 2023), health data is processed solely for life-critical emergency coordination:
          </p>
          <ul className="space-y-2 text-slate-400 list-disc pl-4">
            <li>
              <strong className="text-slate-200">Purpose Limitation:</strong> Transmitting insurance and identification details directly to the verified receiving trauma center only.
            </li>
            <li>
              <strong className="text-slate-200">Zero Commercial Usage:</strong> Data will never be sold, used for underwriting, or shared with third parties.
            </li>
            <li>
              <strong className="text-slate-200">Right to Audit:</strong> Every access is cryptographically time-stamped in the hospital audit trail.
            </li>
          </ul>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Synthetic demo data enabled. No real personal records are stored on public servers.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onConsentGiven}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            I Agree &amp; Proceed to Pre-Registration
          </button>
        </div>
      </div>
    </div>
  );
}
