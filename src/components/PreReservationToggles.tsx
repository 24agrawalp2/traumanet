"use client";

import React from "react";
import { PreReservations } from "@/lib/types";
import { Droplet, Scan, Stethoscope, CheckCircle2, UserCheck, ShieldAlert } from "lucide-react";

interface PreReservationTogglesProps {
  reservations: PreReservations;
  onUpdate: (updated: Partial<PreReservations>) => void;
  disabled?: boolean;
}

export default function PreReservationToggles({
  reservations,
  onUpdate,
  disabled = false,
}: PreReservationTogglesProps) {
  const handleBloodUnitsChange = (delta: number) => {
    const current = reservations.blood_bank_units || 0;
    const nextVal = Math.max(0, Math.min(10, current + delta));
    onUpdate({ blood_bank_units: nextVal });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Pre-Admission Preparation &amp; Clinical Reservations
          </h4>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
          Zero-Delay Protocols
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Blood Bank O-Negative Cross-Match */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-rose-500 fill-rose-500" />
              Blood Bank O-Neg
            </span>
            <span className="text-[10px] text-slate-400">Emergency Units</span>
          </div>

          <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1.5 border border-slate-800">
            <button
              onClick={() => handleBloodUnitsChange(-1)}
              disabled={disabled || reservations.blood_bank_units <= 0}
              className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-sm transition-colors"
            >
              -
            </button>
            <div className="text-center">
              <span className="font-mono text-base font-black text-rose-400">
                {reservations.blood_bank_units} Units
              </span>
              <p className="text-[9px] text-slate-400">Cross-match queued</p>
            </div>
            <button
              onClick={() => handleBloodUnitsChange(1)}
              disabled={disabled || reservations.blood_bank_units >= 8}
              className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-sm transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Imaging Pre-Clearing (CT / MRI) */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Scan className="w-4 h-4 text-cyan-400" />
              Radiology Bay Lock
            </span>
            <span className="text-[10px] text-slate-400">Gantry Ready</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => onUpdate({ ct_scan_reserved: !reservations.ct_scan_reserved })}
              disabled={disabled}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                reservations.ct_scan_reserved
                  ? "bg-cyan-950/60 border-cyan-500/60 text-cyan-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>CT Pan-Scan Reserve</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  reservations.ct_scan_reserved
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {reservations.ct_scan_reserved ? "STANDBY" : "OFF"}
              </span>
            </button>

            <button
              onClick={() => onUpdate({ mri_reserved: !reservations.mri_reserved })}
              disabled={disabled}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                reservations.mri_reserved
                  ? "bg-cyan-950/60 border-cyan-500/60 text-cyan-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Emergency 3T MRI</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  reservations.mri_reserved
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {reservations.mri_reserved ? "STANDBY" : "OFF"}
              </span>
            </button>
          </div>
        </div>

        {/* Surgical Team Pre-Dispatches */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              On-Call Specialists
            </span>
            <span className="text-[10px] text-slate-400">Stat Pager</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() =>
                onUpdate({ neurosurgery_called: !reservations.neurosurgery_called })
              }
              disabled={disabled}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                reservations.neurosurgery_called
                  ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Neurosurgery On-Call</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  reservations.neurosurgery_called
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {reservations.neurosurgery_called ? "PAGE SENT" : "IDLE"}
              </span>
            </button>

            <button
              onClick={() => onUpdate({ ortho_called: !reservations.ortho_called })}
              disabled={disabled}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                reservations.ortho_called
                  ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Ortho Trauma Team</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  reservations.ortho_called
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {reservations.ortho_called ? "PAGE SENT" : "IDLE"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
