import { NextResponse } from "next/server";
import { INITIAL_HOSPITALS } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json({
    success: true,
    hospitals: INITIAL_HOSPITALS,
    total: INITIAL_HOSPITALS.length,
  });
}
