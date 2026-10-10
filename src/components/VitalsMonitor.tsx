"use client";

import React, { useEffect, useRef } from "react";
import { PatientVitals } from "@/lib/types";
import { Activity, Heart, Wind, Brain, Thermometer } from "lucide-react";

interface VitalsMonitorProps {
  vitals: PatientVitals;
  compact?: boolean;
}

export default function VitalsMonitor({ vitals, compact = false }: VitalsMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated ECG sweep simulation
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

    // Draw grid background once
    ctx.fillStyle = "#0B1120";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
    ctx.lineWidth = 1;
    for (let gx = 0; gx < width; gx += 20) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += 20) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    let beatCounter = 0;
    const step = 2.5;

    const render = () => {
      // Clear a small leading window ahead of the sweep line
      ctx.fillStyle = "#0B1120";
      ctx.fillRect(x, 0, 15, height);

      // Re-draw subtle grid in the cleared area
      ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
      ctx.strokeRect(x, 0, 15, height);

      // Compute P-Q-R-S-T ECG wave pattern
      beatCounter += 1;
      let y = midY;
      const cycle = beatCounter % 40;

      if (cycle === 10) y = midY - 6; // P wave
      else if (cycle === 14) y = midY + 4; // Q wave
      else if (cycle === 16) y = midY - 32; // R wave peak
      else if (cycle === 18) y = midY + 18; // S wave valley
      else if (cycle === 24) y = midY - 10; // T wave
      else {
        // baseline jitter
        y = midY + (Math.sin(x * 0.1) * 1.5);
      }

      ctx.strokeStyle = "#10B981"; // emerald cardiac trace
      ctx.lineWidth = 2.2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#10B981";

      ctx.beginPath();
      ctx.moveTo(x - step, midY);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.shadowBlur = 0;

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
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Header with live ECG sweep */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Live Telemetry Vitals Stream
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </div>
        <div className="text-[11px] font-mono text-emerald-400 font-bold">
          LEAD II • 25mm/s
        </div>
      </div>

      {/* ECG Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-emerald-950/60 bg-[#0B1120]">
        <canvas
          ref={canvasRef}
          width={compact ? 340 : 560}
          height={64}
          className="w-full h-16 block"
        />
        <div className="absolute top-1.5 left-2.5 text-[10px] font-mono text-emerald-400/70">
          ECG Real-Time
        </div>
      </div>

      {/* Numerical Vital Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Heart Rate / Pulse */}
        <div
          className={`p-2.5 rounded-xl border transition-colors ${
            isCriticalPulse
              ? "bg-red-950/40 border-red-500/50"
              : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
              PULSE
            </span>
            <span className="text-[9px] font-mono">BPM</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                isCriticalPulse ? "text-red-400 animate-pulse" : "text-white"
              }`}
            >
              {vitals.pulse_rate}
            </span>
            {isCriticalPulse && (
              <span className="text-[9px] text-red-400 font-bold uppercase">TACHY</span>
            )}
          </div>
        </div>

        {/* Blood Pressure */}
        <div
          className={`p-2.5 rounded-xl border transition-colors ${
            isCriticalBP
              ? "bg-red-950/40 border-red-500/50"
              : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              BP (SYS/DIA)
            </span>
            <span className="text-[9px] font-mono">mmHg</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                isCriticalBP ? "text-red-400 animate-pulse" : "text-white"
              }`}
            >
              {vitals.blood_pressure_sys}/{vitals.blood_pressure_dia}
            </span>
            {isCriticalBP && (
              <span className="text-[9px] text-red-400 font-bold uppercase">HYPO</span>
            )}
          </div>
        </div>

        {/* SpO2 */}
        <div
          className={`p-2.5 rounded-xl border transition-colors ${
            isCriticalSpO2
              ? "bg-red-950/40 border-red-500/50"
              : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              SpO2
            </span>
            <span className="text-[9px] font-mono">%</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                isCriticalSpO2 ? "text-cyan-300 animate-pulse" : "text-cyan-400"
              }`}
            >
              {vitals.spo2}%
            </span>
            {isCriticalSpO2 && (
              <span className="text-[9px] text-red-400 font-bold uppercase">LOW</span>
            )}
          </div>
        </div>

        {/* GCS Coma Scale */}
        <div
          className={`p-2.5 rounded-xl border transition-colors ${
            isCriticalGCS
              ? "bg-red-950/40 border-red-500/50"
              : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              GCS SCORE
            </span>
            <span className="text-[9px] font-mono">/15</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                isCriticalGCS ? "text-purple-300 animate-pulse" : "text-purple-400"
              }`}
            >
              {vitals.gcs_score}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold">
              {vitals.gcs_score <= 8 ? "SEVERE" : vitals.gcs_score <= 12 ? "MOD" : "MILD"}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary vitals row */}
      <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <span>Resp Rate:</span>
          <span className="font-mono font-bold text-white">
            {vitals.respiratory_rate} rpm
          </span>
        </div>
        {vitals.temperature_c && (
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3 h-3 text-amber-400" />
            <span>Temp:</span>
            <span className="font-mono font-bold text-white">
              {vitals.temperature_c}°C
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
