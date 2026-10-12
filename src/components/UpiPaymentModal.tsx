// =====================================================================
// TRAUMANET v2 REPLACEMENT: PRE-AUTH PACKET VIEW
// UPI Removed per v2 Legal & Ethical Guidelines (Build Guide Page 2)
// =====================================================================

"use client";

import React from "react";
import PreAuthPacketModal from "./PreAuthPacketModal";
import { useTraumaNet } from "@/lib/TraumaNetContext";

interface UpiPaymentModalProps {
  amountInr: number;
  hospitalName: string;
  patientName: string;
  onPaymentSuccess: (txnId: string) => void;
  onClose: () => void;
}

export default function UpiPaymentModal({
  onPaymentSuccess,
  onClose,
}: UpiPaymentModalProps) {
  const { activeSession, activeHospital } = useTraumaNet();

  if (!activeSession || !activeHospital) return null;

  return (
    <PreAuthPacketModal
      session={activeSession}
      hospital={activeHospital}
      onClose={onClose}
    />
  );
}
