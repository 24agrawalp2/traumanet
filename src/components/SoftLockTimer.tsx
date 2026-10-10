"use client";

import React, { useEffect, useState } from "react";
import { BedLockStatus } from "@/lib/types";
import { Clock, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { playUrgentPulse } from "@/lib/audio";

interface SoftLockTimerProps {
  expiresAt: string;
  status: BedLockStatus;
  onExpire?: () => void;
  hospitalName?: string;
}

export default function SoftLockTimer({
  expiresAt,
  status,
  onExpire,
  hospitalName,
}: SoftLockTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(15 * 60);

  useEffect(() => {
    const calculateSeconds = () => {
      const expiry = new Date(expiresAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      return diff;
    };

    setSecondsLeft(calculateSeconds());

    const interval = setInterval(() => {
      const remaining = calculateSeconds();
      setSecondsLeft(remaining);

      // Warning beep when exactly 120 seconds left
      if (remaining === 120 && status === "HOLD") {
        playUrgentPulse();
      }

      if (remaining === 0 && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, status, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Progress percentage (15 minutes total = 900 seconds)
  const percentRemaining = Math.min(100, Math.max(0, (secondsLeft / 900) * 100));

  if (status === "ACCEPTED_LOCKED") {
    return (
      <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between text-emerald-300">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>ICU Bed Confirmed &amp; Locked</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[11px] text-emerald-400/80">
              {hospitalName ? `${hospitalName} - Trauma Bay Prepared` : "Priority Bay Allocated"}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
          LOCKED
        </span>
      </div>
    );
  }

  if (status === "DECLINED_REROUTED") {
    return (
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between text-amber-300">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Rerouted to Alternate Trauma Center
            </div>
            <p className="text-[11px] text-amber-400/80">Soft-lock shifted to secondary facility</p>
          </div>
        </div>
        <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
          REROUTED
        </span>
      </div>
    );
  }

  const isUrgent = secondsLeft < 180; // Less than 3 minutes

  return (
    <div
      className={`rounded-xl p-3 border transition-colors ${
        isUrgent
          ? "bg-red-950/50 border-red-500/60 shadow-lg shadow-red-950/40"
          : "bg-slate-900/90 border-slate-700/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isUrgent
                ? "bg-red-500/20 text-red-400 animate-pulse"
                : "bg-blue-500/20 text-blue-400"
            }`}
          >
            {isUrgent ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Flight-Style ICU Soft-Lock</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
                15-Min Hold
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Temporary reservation held pending ER team acceptance
            </p>
          </div>
        </div>

        <div className="text-right">
          <div
            className={`font-mono text-lg font-black tracking-wider ${
              isUrgent ? "text-red-400 animate-pulse" : "text-amber-400"
            }`}
          >
            {formattedTime}
          </div>
          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
            {secondsLeft > 0 ? "Remaining" : "Expired"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isUrgent ? "bg-red-500 animate-pulse" : "bg-amber-400"
          }`}
          style={{ width: `${percentRemaining}%` }}
        />
      </div>
    </div>
  );
}
