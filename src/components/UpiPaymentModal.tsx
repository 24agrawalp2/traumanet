"use client";

import React, { useState } from "react";
import { CheckCircle2, QrCode, Smartphone, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { playSuccessChime } from "@/lib/audio";

interface UpiPaymentModalProps {
  amountInr: number;
  patientName: string;
  hospitalName: string;
  onPaymentSuccess: (txnId: string) => void;
  onClose: () => void;
}

export default function UpiPaymentModal({
  amountInr,
  patientName,
  hospitalName,
  onPaymentSuccess,
  onClose,
}: UpiPaymentModalProps) {
  const [selectedApp, setSelectedApp] = useState<string>("GPay");
  const [processing, setProcessing] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const apps = [
    { name: "Google Pay", id: "GPay", color: "from-blue-600 to-emerald-600", icon: "🌐" },
    { name: "PhonePe", id: "PhonePe", color: "from-purple-600 to-indigo-600", icon: "🟣" },
    { name: "Paytm UPI", id: "Paytm", color: "from-cyan-600 to-blue-600", icon: "💳" },
    { name: "BHIM UPI", id: "BHIM", color: "from-amber-600 to-orange-600", icon: "🇮🇳" },
  ];

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const txnId = `UPI-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
      playSuccessChime();
      onPaymentSuccess(txnId);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">1-Click Emergency UPI Deposit</h3>
              <p className="text-[11px] text-slate-400">NPCI Unified Payments Interface</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Deposit Summary */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Pre-Admission Deposit
          </span>
          <div className="text-3xl font-black text-white font-mono tracking-tight text-emerald-400">
            ₹{amountInr.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            Beneficiary: <span className="text-slate-200 font-semibold">{hospitalName}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Patient: <span className="text-slate-200 font-semibold">{patientName}</span>
          </div>
        </div>

        {/* Toggle QR vs App */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setShowQr(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !showQr
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            UPI Apps (1-Click)
          </button>
          <button
            onClick={() => setShowQr(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              showQr
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Scan Dynamic QR
          </button>
        </div>

        {showQr ? (
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl space-y-2">
            {/* SVG simulated dynamic QR */}
            <div className="w-44 h-44 bg-slate-900 rounded-xl p-2.5 flex items-center justify-center relative">
              <div className="grid grid-cols-6 grid-rows-6 gap-1 w-full h-full p-2 bg-white rounded-lg">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${
                      (i % 2 === 0 || i % 7 === 0 || i < 6 || i > 30)
                        ? "bg-black"
                        : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
              <div className="absolute inset-0 m-auto w-10 h-10 bg-slate-950 rounded-lg border-2 border-emerald-400 flex items-center justify-center text-[10px] font-black text-emerald-400">
                UPI
              </div>
            </div>
            <p className="text-[11px] font-mono text-slate-800 font-bold">
              Scan with any UPI App • Instant Bed Clearance
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app.id)}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  selectedApp === app.id
                    ? "bg-slate-800 border-emerald-500 shadow-md shadow-emerald-950/40 text-white scale-[1.02]"
                    : "bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <span className="text-xl">{app.icon}</span>
                <div className="text-left">
                  <div className="text-xs font-bold">{app.name}</div>
                  <div className="text-[10px] text-slate-400">Direct Fast-Checkout</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Security / Instant Guarantee Notice */}
        <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            Payment automatically unlocks ER Admission Clearance &amp; notifies Hospital Dashboard with zero wait time.
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={handlePay}
          disabled={processing}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying UPI Gateway...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {showQr ? "Simulate QR Scan Payment" : `Pay ₹${amountInr.toLocaleString("en-IN")} via ${selectedApp}`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
