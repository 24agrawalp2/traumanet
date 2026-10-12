// =====================================================================
// TRAUMANET v2 TRIAGE / SBAR STRUCTURE API ROUTE
// =====================================================================

import { NextRequest, NextResponse } from "next/server";
import { structureHandoverWithGemini, triageWithGemini } from "@/lib/gemini";
import { PatientVitals } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vitals, notes, language = "en", imageBase64, apiKey } = body;

    if (!vitals) {
      return NextResponse.json(
        { error: "Missing required vitals object" },
        { status: 400 }
      );
    }

    const defaultVitals: PatientVitals = {
      blood_pressure_sys: Number(vitals.blood_pressure_sys) || 120,
      blood_pressure_dia: Number(vitals.blood_pressure_dia) || 80,
      pulse_rate: Number(vitals.pulse_rate) || 80,
      spo2: Number(vitals.spo2) || 98,
      respiratory_rate: Number(vitals.respiratory_rate) || 16,
      gcs_score: vitals.gcs_score !== undefined && vitals.gcs_score !== null ? Number(vitals.gcs_score) : 15,
      temperature_c: Number(vitals.temperature_c) || 37.0,
    };

    const sbarHandover = await structureHandoverWithGemini(
      defaultVitals,
      notes || "",
      language,
      imageBase64,
      apiKey
    );

    const legacyTriage = await triageWithGemini(defaultVitals, notes, imageBase64, apiKey);

    return NextResponse.json({
      success: true,
      handover: sbarHandover,
      data: {
        ...legacyTriage,
        handover: sbarHandover,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Triage API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during triage" },
      { status: 500 }
    );
  }
}
