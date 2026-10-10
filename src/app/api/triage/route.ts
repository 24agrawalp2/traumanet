import { NextRequest, NextResponse } from "next/server";
import { triageWithGemini } from "@/lib/gemini";
import { PatientVitals } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vitals, notes, imageBase64, apiKey } = body;

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
      gcs_score: Number(vitals.gcs_score) || 15,
      temperature_c: Number(vitals.temperature_c) || 37.0,
    };

    const triageResult = await triageWithGemini(
      defaultVitals,
      notes,
      imageBase64,
      apiKey
    );

    return NextResponse.json({
      success: true,
      data: triageResult,
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
