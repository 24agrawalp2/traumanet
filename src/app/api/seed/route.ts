import { NextResponse } from "next/server";
import { INITIAL_HOSPITALS, DEMO_SCENARIOS } from "@/lib/mockData";
import { createDemoSessionFromPreset } from "@/lib/store";

export async function GET() {
  const initialSession = createDemoSessionFromPreset(DEMO_SCENARIOS[0]);
  return NextResponse.json({
    hospitals: INITIAL_HOSPITALS,
    sessions: [initialSession],
  });
}
