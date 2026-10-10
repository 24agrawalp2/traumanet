"use client";

import React, { useState } from "react";
import { CheckCircle2, QrCode, Zap, ShieldCheck } from "lucide-react";
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
    { name: "Google Pay", id: "GPay", icon: "🌐" },
    { name: "PhonePe", id: "PhonePe", icon: "🟣" },
    { name: "Paytm UPI", id: "Paytm", icon: "💳" },
    { name: "BHIM UPI", id: "BHIM", icon: "🇮🇳" },
  ];

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const txnId = `UPI-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
      playSuccessChime();
      onPaymentSuccess(txnId);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Emergency UPI Pre-Admission</h3>
              <p className="text-xs text-slate-400">Zero-Delay Hospital Admission Deposit</p>
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
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1.5">
          <span className="text-xs font-semibold text-slate-400">
            Total Pre-Admission Deposit
          </span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            ₹{amountInr.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-300 pt-1">
            Payee: <strong className="text-white">{hospitalName}</strong>
          </div>
          <div className="text-xs text-slate-400">
            Patient: <span className="text-slate-200">{patientName}</span>
          </div>
        </div>

        {/* Toggle QR vs App */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setShowQr(false)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              !showQr
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            UPI App (1-Click)
          </button>
          <button
            onClick={() => setShowQr(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              showQr
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan Dynamic QR</span>
          </button>
        </div>

        {showQr ? (
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl space-y-2">
            <div className="w-40 h-40 bg-slate-900 rounded-xl p-2.5 flex items-center justify-center relative">
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
              <div className="absolute inset-0 m-auto w-10 h-10 bg-slate-950 rounded-lg border-2 border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-400">
                UPI
              </div>
            </div>
            <p className="text-xs font-mono text-slate-800 font-bold">
              Scan with any UPI App • Instant ER Clearance
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app.id)}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  selectedApp === app.id
                    ? "bg-slate-800 border-emerald-500 text-white scale-[1.02] shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <span className="text-xl">{app.icon}</span>
                <div className="text-left">
                  <div className="text-xs font-bold">{app.name}</div>
                  <div className="text-xs text-slate-400">Fast Checkout</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            Payment automatically unlocks ER Admission Clearance &amp; notifies Hospital Dashboard.
          </span>
        </div>

        <button
          onClick={handlePay}
          disabled={processing}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {processing ? (
            <span>Verifying UPI Gateway...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {showQr ? "Confirm QR Payment" : `Pay ₹${amountInr.toLocaleString("en-IN")} via ${selectedApp}`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
