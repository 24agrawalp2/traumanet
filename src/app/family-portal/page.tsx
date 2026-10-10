"use client";

import React, { useState } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Users,
  CreditCard,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import DocumentAIScanner from "@/components/DocumentAIScanner";
import UpiPaymentModal from "@/components/UpiPaymentModal";
import SoftLockTimer from "@/components/SoftLockTimer";

type FamilyStep = "status" | "payment";

export default function FamilyPortalPage() {
  const { activeSession, activeHospital, completePayment, updateSession } = useTraumaNet();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<FamilyStep>("status");

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
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Top Family Header */}
      <div className="bg-slate-900 border-b border-slate-800 py-4 px-4 sticky top-18 z-30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Family Pre-Admission Portal</h1>
              <p className="text-xs text-slate-400">Zero-Delay Admission &amp; Instant Cashless Clearance</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setCurrentStep("status")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentStep === "status"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              1. Status &amp; Insurance
            </button>
            <button
              onClick={() => setCurrentStep("payment")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentStep === "payment"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              2. Cost &amp; UPI Payment
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Soft-Lock Timer */}
        <SoftLockTimer
          expiresAt={activeSession.soft_lock_expires_at}
          status={activeSession.bed_status}
          hospitalName={activeHospital?.name}
        />

        {/* =========================================================================
            STEP 1: TRANSIT STATUS & ABHA INSURANCE
        ========================================================================= */}
        {currentStep === "status" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Transit Notice Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">
                  Emergency Transit Notice
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  ID: {activeSession.session_id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Patient</span>
                  <div className="font-bold text-white text-base mt-1">
                    {activeSession.patient_info.name}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeSession.patient_info.age} Yrs • {activeSession.patient_info.gender}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Destination Hospital</span>
                  <div className="font-bold text-white text-base mt-1 truncate">
                    {activeHospital?.name}
                  </div>
                  <p className="text-xs text-emerald-400 mt-0.5 font-medium">
                    {activeHospital?.trauma_level}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Ambulance ETA</span>
                  <div className="font-bold text-amber-400 text-base mt-1 font-mono">
                    {activeSession.eta_minutes} Mins
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Speed: {activeSession.speed_kmh} km/h</p>
                </div>
              </div>
            </div>

            {/* Document AI Simulator */}
            <DocumentAIScanner
              onScanComplete={handleDocScanComplete}
              currentDepositInr={activeSession.deposit_amount_inr}
            />

            {/* Next Step Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentStep("payment")}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-2xl shadow-sm flex items-center gap-2 transition-all"
              >
                <span>Continue to Cost Breakdown &amp; Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: COST BREAKDOWN & 1-CLICK UPI PAYMENT
        ========================================================================= */}
        {currentStep === "payment" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Itemized Cost Breakdown Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    Itemized Pre-Admission Cost Breakdown
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Standard ER Tariff</span>
              </div>

              <div className="divide-y divide-slate-800">
                {costBreakdown.items.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-slate-200">{item.item}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Insurance Co-pay: {item.covered_by_insurance_pct}% covered
                      </div>
                    </div>
                    <div className="font-mono font-bold text-white text-base">
                      ₹{item.cost_inr.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Gross ER Admission Tariff:</span>
                  <span className="font-mono text-slate-300">
                    ₹{costBreakdown.subtotal_inr.toLocaleString("en-IN")}
                  </span>
                </div>

                {costBreakdown.abha_subsidy_inr > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Ayushman Bharat Subsidy:</span>
                    <span className="font-mono">
                      - ₹{costBreakdown.abha_subsidy_inr.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm block">
                      Net Patient Pre-Admission Deposit:
                    </span>
                    <span className="text-xs text-slate-400">
                      Unlocks trauma bay admission with zero waiting at cash counters
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">
                    ₹{activeSession.deposit_amount_inr.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {!isPaid ? (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>1-Click Pay ₹{activeSession.deposit_amount_inr.toLocaleString("en-IN")} via UPI</span>
                </button>
              ) : (
                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-1.5">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Pre-Admission Deposit Cleared Successfully</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Transaction Ref: <span className="font-mono font-bold text-white">{activeSession.upi_ref_id}</span>
                  </p>
                  <p className="text-xs text-emerald-300/80">
                    Hospital ER Command notified. Proceed directly to Emergency Trauma Bay.
                  </p>
                </div>
              )}
            </div>

            {/* Back Button */}
            <div className="flex justify-start pt-2">
              <button
                onClick={() => setCurrentStep("status")}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-sm font-semibold rounded-2xl transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Transit &amp; Insurance</span>
              </button>
            </div>
          </div>
        )}
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
