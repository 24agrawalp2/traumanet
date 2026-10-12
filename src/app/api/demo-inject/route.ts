import { NextRequest, NextResponse } from "next/server";
import { DEMO_SCENARIOS, INITIAL_HOSPITALS } from "@/lib/mockData";
import { createDemoSessionFromPreset } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const index = Number(body.index) || 0;
    const preset = DEMO_SCENARIOS[index % DEMO_SCENARIOS.length];
    const session = createDemoSessionFromPreset(preset);

    return NextResponse.json({
      success: true,
      message: `Scenario injected: ${(preset as any).label || (preset as any).incident_title}`,
      session,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
