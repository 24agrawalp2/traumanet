"use client";

import React, { useState } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Users,
  ShieldCheck,
  CreditCard,
  Building2,
  Clock,
  Navigation,
  CheckCircle2,
  Sparkles,
  Phone,
  AlertCircle,
  FileText,
  Lock,
} from "lucide-react";
import DocumentAIScanner from "@/components/DocumentAIScanner";
import UpiPaymentModal from "@/components/UpiPaymentModal";
import SoftLockTimer from "@/components/SoftLockTimer";

export default function FamilyPortalPage() {
  const { activeSession, activeHospital, completePayment, updateSession } = useTraumaNet();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold">No Active Emergency Session Found</h2>
        </div>
      </div>
    );
  }

  const isPaid = activeSession.payment_status === "PAID";
  const costBreakdown = activeSession.cost_breakdown || {
    items: [
      { item: "Emergency ICU Bed Soft-Lock & Setup", cost_inr: 8000, covered_by_insurance_pct: 80 },
      { item: "Trauma Bay Rapid Stabilization Kit", cost_inr: 5000, covered_by_insurance_pct: 90 },
      { item: "Whole Body Polytrauma CT (Pan-Scan)", cost_inr: 9000, covered_by_insurance_pct: 85 },
      { item: "Emergency Blood Bank Cross-Match (4 units)", cost_inr: 4500, covered_by_insurance_pct: 70 },
    ],
    subtotal_inr: 26500,
    abha_subsidy_inr: 5000,
    insurance_deductible_inr: 6500,
    final_patient_deposit_inr: activeSession.deposit_amount_inr,
  };

  const handleDocScanComplete = (details: any) => {
    updateSession(activeSession.session_id, {
      cost_breakdown: details.breakdown,
      deposit_amount_inr: details.breakdown.final_patient_deposit_inr,
      patient_info: {
        ...activeSession.patient_info,
        insurance_provider: details.provider,
        policy_number: details.idNumber,
        coverage_amount_inr: details.coverageInr,
      },
    });
  };

  const handlePaymentSuccess = (txnId: string) => {
    completePayment(activeSession.session_id, txnId);
    setShowPaymentModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
      {/* Top Family Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-16 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-blue flex items-center justify-center shadow-lg shadow-blue-950/50">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white">Family Pre-Admission Portal</h1>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                  PASSENGER CAREGIVER
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Transparent Pre-Authorization &amp; Zero-Counter Admission
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border ${
                isPaid
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {isPaid ? "DEPOSIT PAID" : "DEPOSIT PENDING"}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Urgent Emergency Notification Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emergency-red animate-ping" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Emergency Transit Notice
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Session: {activeSession.session_id}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Patient</span>
              <div className="font-extrabold text-white text-sm mt-0.5">
                {activeSession.patient_info.name}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {activeSession.patient_info.age} Yrs • {activeSession.patient_info.gender}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Destination Hospital
              </span>
              <div className="font-extrabold text-white text-sm mt-0.5 truncate">
                {activeHospital?.name}
              </div>
              <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">
                {activeHospital?.trauma_level}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Ambulance Arrival
              </span>
              <div className="font-extrabold text-amber-400 text-sm mt-0.5 font-mono">
                ETA {activeSession.eta_minutes} Mins
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Speed: {activeSession.speed_kmh} km/h</p>
            </div>
          </div>
        </div>

        {/* Soft-Lock Countdown */}
        <SoftLockTimer
          expiresAt={activeSession.soft_lock_expires_at}
          status={activeSession.bed_status}
          hospitalName={activeHospital?.name}
        />

        {/* Document AI Simulator (ABHA & Insurance OCR) */}
        <DocumentAIScanner
          onScanComplete={handleDocScanComplete}
          currentDepositInr={activeSession.deposit_amount_inr}
        />

        {/* Itemized Cost Estimator & Transparent Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Itemized Pre-Admission Cost Estimator
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">100% Transparent ER Tariff</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {costBreakdown.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-slate-200">{item.item}</div>
                  <div className="text-[10px] text-slate-400">
                    Insurance Co-pay: {item.covered_by_insurance_pct}% covered
                  </div>
                </div>
                <div className="font-mono font-bold text-white">
                  ₹{item.cost_inr.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal, Insurance Discount & Final Deposit */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Gross ER Admission Tariff:</span>
              <span className="font-mono text-slate-300">
                ₹{costBreakdown.subtotal_inr.toLocaleString("en-IN")}
              </span>
            </div>

            {costBreakdown.abha_subsidy_inr > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Ayushman Bharat (PM-JAY) Subsidy:</span>
                <span className="font-mono">
                  - ₹{costBreakdown.abha_subsidy_inr.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">
                  Net Immediate Patient Pre-Admission Deposit:
                </span>
                <span className="text-[10px] text-slate-400">
                  Secures ICU Bed &amp; unlocks trauma bay without waiting at cash counters
                </span>
              </div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                ₹{activeSession.deposit_amount_inr.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Payment Trigger Button */}
          {!isPaid ? (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
            >
              <CreditCard className="w-5 h-5" />
              <span>1-Click Pay ₹{activeSession.deposit_amount_inr.toLocaleString("en-IN")} via UPI</span>
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pre-Admission Deposit Cleared Successfully</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Transaction Ref: <span className="font-mono font-bold text-white">{activeSession.upi_ref_id}</span>
              </p>
              <p className="text-[10px] text-emerald-300/80">
                Hospital ER Command Center notified. Proceed directly to Emergency Trauma Bay 4.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* UPI Payment Modal */}
      {showPaymentModal && (
        <UpiPaymentModal
          amountInr={activeSession.deposit_amount_inr}
          patientName={activeSession.patient_info.name}
          hospitalName={activeHospital?.name || "Target Hospital"}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
