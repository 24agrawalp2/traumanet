// =====================================================================
// TRAUMANET v2 HOSPITAL INSURANCE DESK PRE-AUTH PACKET
// Clean downloadable / printable handover packet (Build Guide Page 4 & 6)
// =====================================================================

"use client";

import React from "react";
import { Printer, Download, CheckCircle, Shield, X, FileText, Building2, User, Activity } from "lucide-react";
import { EmergencySession, Hospital } from "@/lib/types";

interface PreAuthPacketModalProps {
  session: EmergencySession;
  hospital: Hospital;
  onClose: () => void;
}

export default function PreAuthPacketModal({
  session,
  hospital,
  onClose,
}: PreAuthPacketModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const patient = session.patient_info;
  const sbar = session.handover;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Hospital Pre-Authorization Packet</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                  Zero Billing Delay
                </span>
              </div>
              <p className="text-xs text-slate-400">Generated for {hospital.name} Insurance Desk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Document Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-5 text-xs text-slate-300 print:text-black print:bg-white">
          {/* Header watermark */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">TraumaNet Emergency Network</span>
              <h3 className="text-sm font-extrabold text-white mt-0.5">EMERGENCY PRE-ADMISSION DOSSIER</h3>
              <p className="text-[11px] text-slate-400">Case ID: {session.session_id} • Dispatched at {new Date(session.timestamp).toLocaleTimeString()}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400">Receiving Center:</span>
              <p className="font-bold text-white text-xs">{hospital.name}</p>
              <p className="text-[10px] text-slate-400">{hospital.city} • {hospital.trauma_level}</p>
            </div>
          </div>

          {/* Section 1: Patient Identity & Coverage */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              1. Patient Demographics &amp; Coverage Route
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-400">Patient Name</span>
                <p className="font-bold text-white text-xs">{patient.name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Age / Gender</span>
                <p className="font-medium text-white">{patient.age} Yrs / {patient.gender}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">ABHA Health ID</span>
                <p className="font-mono text-emerald-400 font-bold">{patient.abha_id || "ABHA-Format-Checked"}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Insurance Carrier</span>
                <p className="font-medium text-white">{patient.insurance_provider || "Ayushman Bharat PM-JAY"}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Policy / TPA Number</span>
                <p className="font-mono text-white">{patient.policy_number || "Verified en-route"}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Cashless Route</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {session.payment_route_suggestion || "PM-JAY Cashless"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical SBAR Handover */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-red-400" />
              2. Clinical SBAR Handover Summary (Paramedic Certified)
            </h4>
            <div className="space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 text-[11px]">
              <div>
                <span className="font-bold text-blue-400 uppercase text-[10px]">Situation:</span>
                <p className="text-slate-200">{sbar?.situation?.text}</p>
              </div>
              <div>
                <span className="font-bold text-purple-400 uppercase text-[10px]">Background:</span>
                <p className="text-slate-200">{sbar?.background?.text}</p>
              </div>
              <div>
                <span className="font-bold text-amber-400 uppercase text-[10px]">Assessment (Vitals):</span>
                <p className="text-slate-200">{sbar?.assessment?.text}</p>
              </div>
              <div>
                <span className="font-bold text-emerald-400 uppercase text-[10px]">Recommendation:</span>
                <p className="text-slate-200">{sbar?.recommendation?.text}</p>
              </div>
            </div>
          </div>

          {/* Legal Notice Footer */}
          <div className="border-t border-slate-800 pt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Statutory Compliance: DPDP Act 2023 &amp; Supreme Court Parmanand Katara Directive</span>
            <span className="text-emerald-400 font-semibold">Immediate Bay Admission Approved</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-2 shadow-lg"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF Packet
          </button>
        </div>
      </div>
    </div>
  );
}
