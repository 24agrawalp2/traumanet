// =====================================================================
// TRAUMANET v2 HOSPITAL RANKING ENGINE
// Aligned with Build Guide Page 4
// =====================================================================

import { Hospital, PatientVitals, ParamedicPriority } from "./types";

export interface RankingConfig {
  maxEtaMinutes: number; // 30 mins
  weights: {
    capability: number;  // 40
    eta: number;         // 25
    freshness: number;   // 20
    reliability: number; // 15
  };
  statusMultipliers: {
    Accepting: number;   // 1.0
    Limited: number;     // 0.8
    "No response": number; // 0.5
    "Not accepting": number; // 0.0 (Hard filtered)
  };
}

export const DEFAULT_RANKING_CONFIG: RankingConfig = {
  maxEtaMinutes: 30,
  weights: {
    capability: 40,
    eta: 25,
    freshness: 20,
    reliability: 15,
  },
  statusMultipliers: {
    Accepting: 1.0,
    Limited: 0.8,
    "No response": 0.5,
    "Not accepting": 0.0,
  },
};

export interface HospitalScoreBreakdown {
  hospital: Hospital;
  rawScore: number;
  finalScore: number;
  isEligible: boolean;
  filterReason?: string;
  oneLineReason: string;
  capabilityScore: number; // out of 40
  etaScore: number;        // out of 25
  freshnessScore: number;  // out of 20
  reliabilityScore: number;// out of 15
  multiplier: number;
  neededCapabilities: string[];
  matchedCapabilities: string[];
  isCloseChoice?: boolean; // if within 5 points of top score
}

/**
 * Evaluates needed clinical capabilities based on patient vitals and priority
 */
export function determineNeededCapabilities(
  vitals: PatientVitals,
  priority: ParamedicPriority,
  notes?: string
): { ct: boolean; blood_bank: boolean; trauma_surgeon: boolean; neuro: boolean } {
  const gcs = vitals.gcs_score ?? 15;
  const sbp = vitals.blood_pressure_sys ?? 120;
  const noteLower = (notes || "").toLowerCase();

  const isHeavyBleeding =
    noteLower.includes("bleed") ||
    noteLower.includes("laceration") ||
    noteLower.includes("blood loss") ||
    noteLower.includes("रक्त") ||
    noteLower.includes("खून");

  return {
    // CT needed if GCS <= 12
    ct: gcs <= 12,
    // Blood bank needed if SBP < 90 or heavy bleeding reported
    blood_bank: sbp < 90 || isHeavyBleeding,
    // Trauma surgeon needed if priority marked P1 Critical
    trauma_surgeon: priority === "P1_CRITICAL",
    // Neuro if GCS <= 8
    neuro: gcs <= 8,
  };
}

/**
 * Computes confirmation freshness score out of 20 points
 * Full 20 pts if confirmed <= 10 min ago; linear down to 0 at 60 mins.
 */
export function calculateFreshnessScore(lastConfirmedAt: string, weight = 20): number {
  if (!lastConfirmedAt) return 0;
  const confirmedTime = new Date(lastConfirmedAt).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(0, (now - confirmedTime) / (1000 * 60));

  if (diffMinutes <= 10) {
    return weight;
  }
  if (diffMinutes >= 60) {
    return 0;
  }
  // Linear decay between 10 and 60 minutes
  const fraction = 1 - (diffMinutes - 10) / 50;
  return Math.round(weight * Math.max(0, fraction) * 10) / 10;
}

/**
 * Main TraumaNet v2 Hospital Ranking Algorithm
 */
export function rankHospitalsV2(
  hospitals: Hospital[],
  vitals: PatientVitals,
  priority: ParamedicPriority,
  notes?: string,
  config = DEFAULT_RANKING_CONFIG
): HospitalScoreBreakdown[] {
  const needed = determineNeededCapabilities(vitals, priority, notes);
  const neededKeys = Object.entries(needed)
    .filter(([_, required]) => required)
    .map(([key]) => key);

  // If no specific capability required, treat basic trauma care as needed
  const totalNeededCount = neededKeys.length > 0 ? neededKeys.length : 1;

  // Check if any hospital is within 30 min cutoff
  const anyUnder30Min = hospitals.some(
    (h) => (h.eta_minutes || 0) <= config.maxEtaMinutes && h.status !== "Not accepting"
  );

  const results: HospitalScoreBreakdown[] = hospitals.map((hospital) => {
    // Step 1: Hard Filters
    if (hospital.status === "Not accepting") {
      return {
        hospital,
        rawScore: 0,
        finalScore: 0,
        isEligible: false,
        filterReason: "Hospital replied 'Not accepting' / Hold expired",
        oneLineReason: "Declined intake for current emergency window",
        capabilityScore: 0,
        etaScore: 0,
        freshnessScore: 0,
        reliabilityScore: 0,
        multiplier: 0,
        neededCapabilities: neededKeys,
        matchedCapabilities: [],
      };
    }

    // Capability check: Must have every needed capability
    const missingCrucial: string[] = [];
    if (needed.ct && !hospital.capabilities.ct) missingCrucial.push("CT Scanner (GCS ≤ 12)");
    if (needed.blood_bank && !hospital.capabilities.blood_bank) missingCrucial.push("Blood Bank O-Neg (SBP < 90 / Bleeding)");
    if (needed.trauma_surgeon && !hospital.capabilities.trauma_surgeon) missingCrucial.push("Trauma Surgeon On-Duty (P1 Critical)");
    if (needed.neuro && !hospital.capabilities.neuro) missingCrucial.push("Neurosurgery On-Call (GCS ≤ 8)");

    if (missingCrucial.length > 0) {
      return {
        hospital,
        rawScore: 0,
        finalScore: 0,
        isEligible: false,
        filterReason: `Lacks required capability: ${missingCrucial.join(", ")}`,
        oneLineReason: `Cannot accept case: lacks ${missingCrucial[0]}`,
        capabilityScore: 0,
        etaScore: 0,
        freshnessScore: 0,
        reliabilityScore: 0,
        multiplier: 0,
        neededCapabilities: neededKeys,
        matchedCapabilities: [],
      };
    }

    // ETA cutoff filter
    if (anyUnder30Min && (hospital.eta_minutes || 0) > config.maxEtaMinutes) {
      return {
        hospital,
        rawScore: 0,
        finalScore: 0,
        isEligible: false,
        filterReason: `ETA (${hospital.eta_minutes} min) exceeds 30-minute critical golden window`,
        oneLineReason: "Exceeds 30-min transport threshold",
        capabilityScore: 0,
        etaScore: 0,
        freshnessScore: 0,
        reliabilityScore: 0,
        multiplier: 0,
        neededCapabilities: neededKeys,
        matchedCapabilities: [],
      };
    }

    // Step 2: Scoring out of 100
    // Factor 1: Capability match (40 pts)
    const matchedKeys = neededKeys.filter(
      (key) => (hospital.capabilities as any)[key] === true
    );
    const capabilityScore =
      neededKeys.length > 0
        ? Math.round((matchedKeys.length / totalNeededCount) * config.weights.capability * 10) / 10
        : config.weights.capability;

    // Factor 2: Route ETA (25 pts): 25 * (1 - ETA / 30), minimum 0
    const eta = hospital.eta_minutes || 10;
    const etaFraction = Math.max(0, 1 - eta / config.maxEtaMinutes);
    const etaScore = Math.round(config.weights.eta * etaFraction * 10) / 10;

    // Factor 3: Confirmation freshness (20 pts)
    const freshnessScore = calculateFreshnessScore(hospital.last_confirmed_at, config.weights.freshness);

    // Factor 4: Reliability (15 pts): 15 * hospital.reliability (default 0.7)
    const rel = hospital.reliability !== undefined ? hospital.reliability : 0.7;
    const reliabilityScore = Math.round(config.weights.reliability * rel * 10) / 10;

    const rawScore = capabilityScore + etaScore + freshnessScore + reliabilityScore;

    // Status multiplier: Accepting x1.0, Limited x0.8, No response x0.5
    const multiplier = config.statusMultipliers[hospital.status] ?? 0.5;
    const finalScore = Math.round(rawScore * multiplier * 10) / 10;

    // Build human-readable one-line rationale
    let oneLineReason = "";
    if (hospital.status === "Accepting") {
      oneLineReason = `${matchedKeys.length}/${totalNeededCount} capabilities matched, ${eta}m ETA with traffic, ${Math.round(rel * 100)}% verified acceptance rate.`;
    } else if (hospital.status === "Limited") {
      oneLineReason = `Emergency capacity limited (0.8x penalty), ${eta}m ETA, fully equipped for trauma.`;
    } else {
      oneLineReason = `Awaiting confirmation ping (0.5x multiplier), ${eta}m ETA.`;
    }

    return {
      hospital,
      rawScore,
      finalScore,
      isEligible: true,
      oneLineReason,
      capabilityScore,
      etaScore,
      freshnessScore,
      reliabilityScore,
      multiplier,
      neededCapabilities: neededKeys,
      matchedCapabilities: matchedKeys,
    };
  });

  // Sort eligible hospitals descending by finalScore, then ineligible
  results.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    return b.finalScore - a.finalScore;
  });

  // Tie handling: If top 2 are within 5 points, tag both for human choice
  const eligible = results.filter((r) => r.isEligible);
  if (eligible.length >= 2) {
    const diff = Math.abs(eligible[0].finalScore - eligible[1].finalScore);
    if (diff <= 5) {
      eligible[0].isCloseChoice = true;
      eligible[1].isCloseChoice = true;
    }
  }

  return results;
}
