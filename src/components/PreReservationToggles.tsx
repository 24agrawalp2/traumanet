"use client";

import React from "react";
import { PreReservations } from "@/lib/types";
import { Droplet, Scan, Stethoscope, UserCheck } from "lucide-react";

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
    const nextVal = Math.max(0, Math.min(8, current + delta));
    onUpdate({ blood_bank_units: nextVal });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-bold text-white">
            Pre-Admission Preparation &amp; Clinical Orders
          </h4>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
          Zero-Wait ER
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Blood Bank O-Negative */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-rose-500 fill-rose-500" />
              Blood Bank O-Neg
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-900 rounded-xl p-2 border border-slate-800">
            <button
              onClick={() => handleBloodUnitsChange(-1)}
              disabled={disabled || reservations.blood_bank_units <= 0}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-base transition-colors"
            >
              -
            </button>
            <div className="text-center">
              <span className="font-mono text-lg font-bold text-rose-400">
                {reservations.blood_bank_units} Units
              </span>
            </div>
            <button
              onClick={() => handleBloodUnitsChange(1)}
              disabled={disabled || reservations.blood_bank_units >= 8}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-base transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Radiology / Imaging */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Scan className="w-4 h-4 text-cyan-400" />
            Radiology Bay
          </span>

          <div className="space-y-2">
            <button
              onClick={() => onUpdate({ ct_scan_reserved: !reservations.ct_scan_reserved })}
              disabled={disabled}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                reservations.ct_scan_reserved
                  ? "bg-cyan-950/50 border-cyan-500/60 text-cyan-200"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Whole-Body CT</span>
              <span className="font-mono font-bold">
                {reservations.ct_scan_reserved ? "STANDBY" : "OFF"}
              </span>
            </button>

            <button
              onClick={() => onUpdate({ mri_reserved: !reservations.mri_reserved })}
              disabled={disabled}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                reservations.mri_reserved
                  ? "bg-cyan-950/50 border-cyan-500/60 text-cyan-200"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Emergency MRI</span>
              <span className="font-mono font-bold">
                {reservations.mri_reserved ? "STANDBY" : "OFF"}
              </span>
            </button>
          </div>
        </div>

        {/* Specialists On Call */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Specialists On-Call
          </span>

          <div className="space-y-2">
            <button
              onClick={() =>
                onUpdate({ neurosurgery_called: !reservations.neurosurgery_called })
              }
              disabled={disabled}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                reservations.neurosurgery_called
                  ? "bg-emerald-950/50 border-emerald-500/60 text-emerald-200"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Neurosurgery</span>
              <span className="font-mono font-bold">
                {reservations.neurosurgery_called ? "NOTIFIED" : "OFF"}
              </span>
            </button>

            <button
              onClick={() => onUpdate({ ortho_called: !reservations.ortho_called })}
              disabled={disabled}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                reservations.ortho_called
                  ? "bg-emerald-950/50 border-emerald-500/60 text-emerald-200"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Ortho Trauma</span>
              <span className="font-mono font-bold">
                {reservations.ortho_called ? "NOTIFIED" : "OFF"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
