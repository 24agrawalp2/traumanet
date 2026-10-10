import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiTriageResponse, PatientVitals } from "./types";

export const GEMINI_SYSTEM_PROMPT = `You are a clinical emergency triage assistant. Analyze the provided patient injury image and/or vitals data. Output strictly valid JSON with keys: 'trauma_score' (1.0-10.0), 'severity' ('LOW'|'MEDIUM'|'HIGH'|'CRITICAL'), 'required_specialists' (array), 'ai_pre_report' (2-sentence doctor summary), 'stabilization_steps' (array of 3 action points), and 'estimated_deposit_inr' (number). Output ONLY the raw JSON object without markdown fences.`;

export async function triageWithGemini(
  vitals: PatientVitals,
  notes?: string,
  imageBase64?: string,
  apiKey?: string
): Promise<GeminiTriageResponse> {
  const key = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!key) {
    // Clinical algorithm fallback (RTS / ATLS based)
    return generateDeterministicTriage(vitals, notes);
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    // Use gemini-1.5-flash for fastest sub-second emergency response
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
      systemInstruction: GEMINI_SYSTEM_PROMPT,
    });

    const promptText = `
Emergency Patient Triage Data:
- Blood Pressure: ${vitals.blood_pressure_sys}/${vitals.blood_pressure_dia} mmHg
- Pulse Rate: ${vitals.pulse_rate} bpm
- SpO2 (Oxygen Saturation): ${vitals.spo2}%
- Respiratory Rate: ${vitals.respiratory_rate} breaths/min
- Glasgow Coma Scale (GCS): ${vitals.gcs_score} / 15
${vitals.temperature_c ? `- Temperature: ${vitals.temperature_c}°C` : ""}
${notes ? `- Paramedic Clinical Notes: ${notes}` : ""}

Evaluate the trauma severity, determine required specialists, provide a concise 2-sentence clinical pre-report for the receiving ER trauma team, 3 immediate stabilization steps, and estimate the pre-admission deposit in INR. Output strictly JSON.
`;

    let parts: any[] = [{ text: promptText }];

    if (imageBase64) {
      // Clean base64 header if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const result = await model.generateContent(parts);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      trauma_score: Number(parsed.trauma_score) || 7.5,
      severity: (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(parsed.severity)
        ? parsed.severity
        : "HIGH") as any,
      required_specialists: Array.isArray(parsed.required_specialists)
        ? parsed.required_specialists
        : ["Trauma Surgery", "Critical Care"],
      ai_pre_report:
        parsed.ai_pre_report ||
        "Patient presenting with acute trauma requiring immediate Level 1 resuscitation and diagnostic pan-scan upon arrival.",
      stabilization_steps: Array.isArray(parsed.stabilization_steps)
        ? parsed.stabilization_steps
        : [
            "Maintain spinal immobilization and high-flow oxygen.",
            "Establish two large-bore IV lines with crystalloids.",
            "Monitor continuous vitals and pupillary reflexes.",
          ],
      estimated_deposit_inr: Number(parsed.estimated_deposit_inr) || 15000,
    };
  } catch (err: any) {
    console.warn("Live Gemini API call failed or timed out, using clinical fallback engine:", err?.message);
    return generateDeterministicTriage(vitals, notes);
  }
}

/**
 * Clinical Revised Trauma Score (RTS) & ATLS Rule-Based Engine
 * Evaluates real vital signs deterministically
 */
export function generateDeterministicTriage(
  vitals: PatientVitals,
  notes?: string
): GeminiTriageResponse {
  const gcs = vitals.gcs_score || 15;
  const sys = vitals.blood_pressure_sys || 120;
  const rr = vitals.respiratory_rate || 16;
  const pulse = vitals.pulse_rate || 75;
  const spo2 = vitals.spo2 || 98;

  let penalty = 0;

  // GCS Score penalties
  if (gcs <= 5) penalty += 4.5;
  else if (gcs <= 8) penalty += 3.8;
  else if (gcs <= 12) penalty += 2.2;
  else if (gcs <= 14) penalty += 1.0;

  // SBP penalties
  if (sys < 70) penalty += 3.5;
  else if (sys < 90) penalty += 2.8;
  else if (sys > 180) penalty += 2.0;

  // Pulse penalties
  if (pulse > 130 || pulse < 50) penalty += 2.0;
  else if (pulse > 110) penalty += 1.2;

  // SpO2 penalties
  if (spo2 < 85) penalty += 3.0;
  else if (spo2 < 92) penalty += 1.8;

  // Respiratory rate penalties
  if (rr < 10 || rr > 30) penalty += 2.2;

  // Check notes for keywords
  const notesLower = (notes || "").toLowerCase();
  const hasHead = notesLower.includes("head") || notesLower.includes("brain") || notesLower.includes("skull");
  const hasBleeding = notesLower.includes("blood") || notesLower.includes("bleed") || notesLower.includes("hemorrhag");
  const hasFracture = notesLower.includes("fracture") || notesLower.includes("bone") || notesLower.includes("crush");
  const hasChest = notesLower.includes("chest") || notesLower.includes("lung") || notesLower.includes("breath");

  if (hasHead) penalty += 1.2;
  if (hasBleeding) penalty += 1.0;
  if (hasChest) penalty += 1.0;

  let calculatedScore = Math.min(10.0, Math.max(1.0, 1.5 + penalty));
  calculatedScore = Math.round(calculatedScore * 10) / 10;

  let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
  let deposit = 5000;

  if (calculatedScore >= 8.0) {
    severity = "CRITICAL";
    deposit = 25000;
  } else if (calculatedScore >= 6.0) {
    severity = "HIGH";
    deposit = 18000;
  } else if (calculatedScore >= 4.0) {
    severity = "MEDIUM";
    deposit = 10000;
  } else {
    severity = "LOW";
    deposit = 5000;
  }

  // Required specialists based on clinical findings
  const specialists: string[] = ["Emergency Medicine"];
  if (gcs <= 12 || hasHead) specialists.push("Neurosurgery");
  if (sys < 90 || hasBleeding) specialists.push("Trauma Surgery", "Critical Care");
  if (hasFracture) specialists.push("Orthopedics");
  if (hasChest || spo2 < 90) specialists.push("Thoracic Surgery");
  if (specialists.length < 3) specialists.push("ICU Intensivist");

  // Construct clinical pre-report
  let report = "";
  if (severity === "CRITICAL") {
    report = `Patient in profound physiological decompensation with GCS ${gcs}, hemodynamic instability (BP ${sys}/${vitals.blood_pressure_dia || 60}), and SpO2 ${spo2}%. Immediate Level 1 trauma resuscitation bay, endotracheal intubation capability, and immediate blood bank activation required upon ER arrival.`;
  } else if (severity === "HIGH") {
    report = `Acute trauma patient presenting with moderate-to-severe physiological distress (Pulse ${pulse} bpm, BP ${sys}/${vitals.blood_pressure_dia || 70}). Emergency imaging (CT Pan-Scan) and surgical subspecialty evaluation required immediately upon arrival.`;
  } else if (severity === "MEDIUM") {
    report = `Patient stabilized en-route with abnormal vitals requiring monitored trauma bay admission. Secondary survey, focused FAST ultrasound, and orthopedic/general surgical consultation advised.`;
  } else {
    report = `Patient conscious and hemodynamically stable. Superficial trauma managed en-route; requires standard ER triage examination and minor surgical wound closure.`;
  }

  const steps = [
    spo2 < 92
      ? "Administer high-flow 100% O2 via non-rebreather mask at 15 L/min; monitor pulse oximetry continuously."
      : "Maintain supplemental O2 via nasal cannula (4L/min); ensure cervical collar neutrality.",
    sys < 90
      ? "Establish dual wide-bore (14/16G) peripheral IV access; initiate rapid bolus of warmed balanced crystalloid."
      : "Establish patent 18G peripheral IV access; run normal saline at keep-vein-open rate.",
    gcs <= 8
      ? "Protect airway immediately: prepare for RSI (Rapid Sequence Intubation); elevate head 30° if spine cleared."
      : "Perform serial neurological checks (pupils & motor response every 5 min); splint injured extremities.",
  ];

  return {
    trauma_score: calculatedScore,
    severity,
    required_specialists: specialists.slice(0, 4),
    ai_pre_report: report,
    stabilization_steps: steps,
    estimated_deposit_inr: deposit,
  };
}
