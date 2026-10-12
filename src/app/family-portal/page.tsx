// =====================================================================
// TRAUMANET v2 FAMILY PRE-ADMISSION PORTAL (NO UPI / DPDP COMPLIANT)
// Aligned with GDG x Ramdeobaba Hackathon Build Guide (Build Guide Page 3, 4 & 5)
// =====================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useTraumaNet } from "@/lib/TraumaNetContext";
import {
  Users,
  CheckCircle2,
  FileText,
  Clock,
  Printer,
  ShieldCheck,
  Share2,
  Lock,
  Phone,
  User,
  AlertCircle,
} from "lucide-react";
import DocumentAIScanner from "@/components/DocumentAIScanner";
import PreAuthPacketModal from "@/components/PreAuthPacketModal";
import DpdpConsentModal from "@/components/DpdpConsentModal";
import LegalGuardrailBanner from "@/components/LegalGuardrailBanner";
import SoftLockTimer from "@/components/SoftLockTimer";
import { SAMPLE_COST_RANGES } from "@/lib/mockData";

export default function FamilyPortalPage() {
  const {
    activeSession,
    activeHospital,
    updateSession,
    recordDPDPConsent,
    geminiApiKey,
  } = useTraumaNet();

  const [showPacketModal, setShowPacketModal] = useState(false);
  const [relativeName, setRelativeName] = useState("Anita Ramteke");
  const [relationship, setRelationship] = useState("Spouse");
  const [relativePhone, setRelativePhone] = useState("+91 98230 11223");
  const [detailsSaved, setDetailsSaved] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !activeSession) {
    return (
      <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
          <h2 className="text-base font-bold">Connecting to Nagpur Family Portal...</h2>
        </div>
      </div>
    );
  }

  const patient = activeSession.patient_info;
  const currentHospital = activeHospital || {
    name: "AIIMS Nagpur Apex Trauma Center",
    city: "Nagpur",
    trauma_level: "Level 1 Apex Trauma Center",
    contact: "+91-712-282-1000",
  };

  const handleConsent = () => {
    recordDPDPConsent(activeSession.session_id);
  };

  const handleSaveContact = () => {
    updateSession(activeSession.session_id, {
      patient_info: {
        ...patient,
        emergency_contact_name: `${relativeName} (${relationship})`,
        emergency_contact_phone: relativePhone,
        relationship,
      },
    });
    setDetailsSaved(true);
    setTimeout(() => setDetailsSaved(false), 2500);
  };

  const handleDocScanComplete = (details: any) => {
    updateSession(activeSession.session_id, {
      insurance_confirmed: true,
      payment_route_suggestion: details.route,
      patient_info: {
        ...patient,
        insurance_provider: details.provider,
        policy_number: details.idNumber,
        tpa: details.tpa,
      },
    });
  };

  const whatsappShareText = encodeURIComponent(
    `🚨 TraumaNet Emergency Transit Link for ${patient.name}:\nPatient is in transit to ${currentHospital.name} (ETA ~${activeSession.eta_minutes} mins). Pre-register insurance paperwork here without payment: ${typeof window !== "undefined" ? window.location.href : "http://localhost:3000/family-portal"}`
  );

  return (
    <div className="min-h-screen bg-[#020817] text-white pb-24">
      {/* DPDP Consent Modal (Must consent first) */}
      {!activeSession.dpdp_consent_given && (
        <DpdpConsentModal
          patientName={patient.name}
          onConsentGiven={handleConsent}
        />
      )}

      {/* Top Header */}
      <div className="bg-[#020817]/90 backdrop-blur-xl border-b border-white/[0.08] py-4 px-4 sticky top-16 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">Family Pre-Admission Portal</h1>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                  Zero Upfront Payment
                </span>
              </div>
              <p className="text-xs text-slate-400">Pre-fill insurance paperwork ahead of ambulance arrival</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/?text=${whatsappShareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share via WhatsApp</span>
            </a>

            <button
              onClick={() => setShowPacketModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.01]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-5 animate-fade-in">
        {/* Supreme Court Guardrail Banner */}
        <LegalGuardrailBanner />

        {/* Emergency Transit Tracker Strip */}
        <div className="glass border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Live Patient Transit Status
              </span>
              <h2 className="text-lg font-black text-white mt-1">
                Inbound to {currentHospital.name}
              </h2>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-white">{patient.name}</strong> • ETA: <strong className="text-emerald-400 font-mono">{activeSession.eta_minutes} Minutes</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Center Contact</span>
              <p className="text-xs font-mono font-bold text-white">{currentHospital.contact}</p>
            </div>
          </div>

          <SoftLockTimer
            expiresAt={activeSession.soft_lock_expires_at}
            hospitalName={currentHospital.name}
            isAccepted={activeSession.request_status === "accepted"}
          />
        </div>

        {/* Section 1: Pre-Registration & Contact Details Form */}
        <div className="glass border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Family Contact Pre-Registration</h3>
            </div>
            <span className="text-[10px] bg-white/[0.05] text-slate-400 px-2.5 py-0.5 rounded-full font-mono border border-white/[0.08]">
              DPDP Act Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Relative / Caregiver Name</label>
              <input
                type="text"
                value={relativeName}
                onChange={(e) => setRelativeName(e.target.value)}
                className="w-full bg-[#0a101f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Relationship to Patient</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full bg-[#0a101f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend / Bystander">Friend / Bystander</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Contact Phone Number</label>
              <input
                type="tel"
                value={relativePhone}
                onChange={(e) => setRelativePhone(e.target.value)}
                className="w-full bg-[#0a101f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveContact}
              className="px-5 py-2 bg-[#0c1526]/80 hover:bg-[#131f38] text-white rounded-xl text-xs font-bold border border-white/[0.08] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{detailsSaved ? "Details Updated!" : "Update Contact Info"}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Synthetic Insurance OCR & ABHA Format Check */}
        <DocumentAIScanner
          onScanComplete={handleDocScanComplete}
          geminiApiKey={geminiApiKey}
        />

        {/* Section 3: Indicative Cost Range Table (Build Guide Page 4 & 5) */}
        <div className="glass border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Indicative Cost Breakdown (Informational Range)</h3>
              <p className="text-xs text-slate-400">Emergency stabilization is never held or delayed for billing</p>
            </div>
            <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-semibold w-fit">
              SIMULATED — Sample Table, Not a Quote
            </span>
          </div>

          <div className="divide-y divide-white/[0.06] bg-[#0a101f]/80 rounded-xl border border-white/[0.06] overflow-hidden text-xs">
            {SAMPLE_COST_RANGES.map((row, idx) => (
              <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02] transition-colors">
                <div>
                  <span className="font-semibold text-white">{row.service}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{row.covered_by_scheme}</p>
                </div>
                <div className="font-mono font-bold text-emerald-400 text-right shrink-0">
                  {row.indicative_range_inr}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0a101f]/60 p-3 rounded-xl border border-white/[0.06] flex items-start gap-2 text-xs text-slate-300">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>Billing Guardrail:</strong> Under Ayushman Bharat (PM-JAY) and statutory emergency regulations, life-saving trauma surgery and diagnostic pan-scans are cashless for eligible cardholders. Remaining balances are handled during regular discharge, never at emergency intake.
            </span>
          </div>
        </div>
      </div>

      {/* Pre-Authorization Dossier Modal */}
      {showPacketModal && (
        <PreAuthPacketModal
          session={activeSession}
          hospital={currentHospital as any}
          onClose={() => setShowPacketModal(false)}
        />
      )}
    </div>
  );
}
