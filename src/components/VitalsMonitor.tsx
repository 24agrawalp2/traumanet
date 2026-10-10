"use client";

import React, { useEffect, useRef } from "react";
import { PatientVitals } from "@/lib/types";
import { Activity, Heart, Wind, Brain } from "lucide-react";

interface VitalsMonitorProps {
  vitals: PatientVitals;
  compact?: boolean;
}

export default function VitalsMonitor({ vitals, compact = false }: VitalsMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    ctx.fillStyle = "#090D16";
    ctx.fillRect(0, 0, width, height);

    let beatCounter = 0;
    const step = 2.5;

    const render = () => {
      ctx.fillStyle = "#090D16";
      ctx.fillRect(x, 0, 16, height);

      beatCounter += 1;
      let y = midY;
      const cycle = beatCounter % 40;

      if (cycle === 10) y = midY - 5;
      else if (cycle === 14) y = midY + 4;
      else if (cycle === 16) y = midY - 26;
      else if (cycle === 18) y = midY + 16;
      else if (cycle === 24) y = midY - 8;
      else {
        y = midY + Math.sin(x * 0.1) * 1.2;
      }

      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - step, midY);
      ctx.lineTo(x, y);
      ctx.stroke();

      x += step;
      if (x >= width) {
        x = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [vitals.pulse_rate]);

  const isCriticalSpO2 = vitals.spo2 < 90;
  const isCriticalPulse = vitals.pulse_rate > 120 || vitals.pulse_rate < 50;
  const isCriticalBP = vitals.blood_pressure_sys < 90 || vitals.blood_pressure_sys > 180;
  const isCriticalGCS = vitals.gcs_score <= 8;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
      {/* Title & Live Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Live Vitals &amp; ECG Telemetry</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400 font-semibold">LEAD II • Live</span>
        </div>
      </div>

      {/* ECG Waveform Canvas */}
      <div className="rounded-xl overflow-hidden border border-slate-800/80 bg-[#090D16]">
        <canvas
          ref={canvasRef}
          width={compact ? 360 : 580}
          height={56}
          className="w-full h-14 block"
        />
      </div>

      {/* Numerical Vital Gauges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Pulse */}
        <div
          className={`p-3 rounded-xl border transition-colors ${
            isCriticalPulse
              ? "bg-red-950/30 border-red-500/50"
              : "bg-slate-950 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              PULSE
            </span>
            <span className="text-xs font-mono text-slate-500">BPM</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold font-mono ${
                isCriticalPulse ? "text-red-400 animate-pulse" : "text-white"
              }`}
            >
              {vitals.pulse_rate}
            </span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div
          className={`p-3 rounded-xl border transition-colors ${
            isCriticalBP
              ? "bg-red-950/30 border-red-500/50"
              : "bg-slate-950 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              BP
            </span>
            <span className="text-xs font-mono text-slate-500">mmHg</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold font-mono ${
                isCriticalBP ? "text-red-400 animate-pulse" : "text-white"
              }`}
            >
              {vitals.blood_pressure_sys}/{vitals.blood_pressure_dia}
            </span>
          </div>
        </div>

        {/* SpO2 */}
        <div
          className={`p-3 rounded-xl border transition-colors ${
            isCriticalSpO2
              ? "bg-red-950/30 border-red-500/50"
              : "bg-slate-950 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              SpO2
            </span>
            <span className="text-xs font-mono text-slate-500">%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold font-mono ${
                isCriticalSpO2 ? "text-cyan-300 animate-pulse" : "text-cyan-400"
              }`}
            >
              {vitals.spo2}%
            </span>
          </div>
        </div>

        {/* GCS */}
        <div
          className={`p-3 rounded-xl border transition-colors ${
            isCriticalGCS
              ? "bg-red-950/30 border-red-500/50"
              : "bg-slate-950 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              GCS
            </span>
            <span className="text-xs font-mono text-slate-500">/15</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold font-mono ${
                isCriticalGCS ? "text-purple-300 animate-pulse" : "text-purple-400"
              }`}
            >
              {vitals.gcs_score}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary vitals footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
        <div>
          Respiration: <strong className="text-slate-200 font-mono">{vitals.respiratory_rate} rpm</strong>
        </div>
        {vitals.temperature_c && (
          <div>
            Temperature: <strong className="text-slate-200 font-mono">{vitals.temperature_c}°C</strong>
          </div>
        )}
      </div>
    </div>
  );
}
