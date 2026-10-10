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
      return Math.max(0, Math.floor((expiry - now) / 1000));
    };

    setSecondsLeft(calculateSeconds());

    const interval = setInterval(() => {
      const remaining = calculateSeconds();
      setSecondsLeft(remaining);

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
  const percentRemaining = Math.min(100, Math.max(0, (secondsLeft / 900) * 100));

  if (status === "ACCEPTED_LOCKED") {
    return (
      <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between text-emerald-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>ICU Bed Confirmed &amp; Locked</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {hospitalName ? `${hospitalName} • Priority Bay Ready` : "Priority Bay Allocated"}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30">
          CONFIRMED
        </span>
      </div>
    );
  }

  if (status === "DECLINED_REROUTED") {
    return (
      <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between text-amber-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              Patient Rerouted
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Shifted to alternate verified trauma center
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30">
          REROUTED
        </span>
      </div>
    );
  }

  const isUrgent = secondsLeft < 180;

  return (
    <div
      className={`rounded-2xl p-4 border transition-colors ${
        isUrgent
          ? "bg-red-950/40 border-red-500/50"
          : "bg-slate-900 border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isUrgent
                ? "bg-red-500/20 text-red-400"
                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            }`}
          >
            {isUrgent ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>ICU Bed Temporary Soft-Lock</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-medium">
                15-Min Hold
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Reserved in-transit awaiting hospital team confirmation
            </p>
          </div>
        </div>

        <div className="text-right">
          <div
            className={`font-mono text-xl font-bold tracking-tight ${
              isUrgent ? "text-red-400 animate-pulse" : "text-amber-400"
            }`}
          >
            {formattedTime}
          </div>
          <p className="text-xs text-slate-400">
            {secondsLeft > 0 ? "Remaining" : "Expired"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isUrgent ? "bg-red-500" : "bg-amber-400"
          }`}
          style={{ width: `${percentRemaining}%` }}
        />
      </div>
    </div>
  );
}
