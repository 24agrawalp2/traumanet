import { EmergencySession, Hospital, PatientVitals } from "./types";
import { INITIAL_HOSPITALS, DEMO_SCENARIOS } from "./mockData";

export interface TraumaNetState {
  hospitals: Hospital[];
  sessions: EmergencySession[];
  activeSessionId: string | null;
  offlineQueue: Partial<EmergencySession>[];
  isOnline: boolean;
  useLiveGemini: boolean;
  geminiApiKey: string;
}

const STORAGE_KEY = "traumanet_state_v1";

// In-memory fallback if localStorage is unavailable
let stateCache: TraumaNetState | null = null;

export function getInitialState(): TraumaNetState {
  if (typeof window === "undefined") {
    return {
      hospitals: INITIAL_HOSPITALS,
      sessions: [createDemoSessionFromPreset(DEMO_SCENARIOS[0])],
      activeSessionId: "session-demo-01",
      offlineQueue: [],
      isOnline: true,
      useLiveGemini: false,
      geminiApiKey: "",
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.hospitals && parsed.sessions && parsed.sessions.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.debug("Failed reading state from localStorage:", e);
  }

  // First time initialization
  const initialSession = createDemoSessionFromPreset(DEMO_SCENARIOS[0], "session-demo-01");
  const state: TraumaNetState = {
    hospitals: INITIAL_HOSPITALS,
    sessions: [initialSession],
    activeSessionId: initialSession.session_id,
    offlineQueue: [],
    isOnline: navigator.onLine !== false,
    useLiveGemini: false,
    geminiApiKey: "",
  };

  saveState(state);
  return state;
}

export function saveState(state: TraumaNetState) {
  stateCache = state;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Notify other tabs immediately via BroadcastChannel
      broadcastMessage({ type: "STATE_UPDATED", payload: state });
    } catch (e) {
      console.debug("Failed saving state to localStorage:", e);
    }
  }
}

export function createDemoSessionFromPreset(
  preset: Partial<EmergencySession>,
  customId?: string
): EmergencySession {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 mins soft-lock countdown
  const sessionId = customId || `tn-ses-${Date.now().toString(36)}-${Math.floor(Math.random() * 900 + 100)}`;

  return {
    session_id: sessionId,
    incident_title: preset.incident_title || "Emergent Polytrauma Case",
    timestamp: now.toISOString(),
    patient_info: preset.patient_info || {
      name: "Suresh Narang",
      age: 35,
      gender: "MALE",
      abha_id: "91-4432-8819-2041",
      insurance_provider: "Star Health Comprehensive Trauma Shield",
      policy_number: "SH-EM-884210",
      coverage_amount_inr: 1000000,
      emergency_contact_name: "Anita Narang (Spouse)",
      emergency_contact_phone: "+91 98112 45890",
    },
    vitals: preset.vitals || {
      blood_pressure_sys: 84,
      blood_pressure_dia: 52,
      pulse_rate: 132,
      spo2: 89,
      respiratory_rate: 28,
      gcs_score: 8,
      temperature_c: 36.1,
    },
    trauma_score: preset.trauma_score || 8.8,
    severity: preset.severity || "CRITICAL",
    ai_pre_report:
      preset.ai_pre_report ||
      "Patient in severe hypovolemic and neurogenic shock post high-velocity collision with suspected tension pneumothorax. Immediate Level 1 surgical resuscitation required upon arrival.",
    required_specialists: preset.required_specialists || ["Neurosurgery", "Trauma Surgery", "Critical Care"],
    stabilization_steps: preset.stabilization_steps || [
      "Maintain cervical collar & initiate 15L/min O2 via non-rebreather mask.",
      "Dual large-bore 14G peripheral lines; infuse 1000ml warmed saline.",
      "Apply pelvic binder; prepare for needle decompression if SpO2 drops.",
    ],
    assigned_hospital_id: preset.assigned_hospital_id || "hosp-aiims-01",
    ambulance_id: preset.ambulance_id || "TN-ALS-04 (DL-1T-4912)",
    ambulance_lat: preset.ambulance_lat || 28.585,
    ambulance_lng: preset.ambulance_lng || 77.185,
    eta_minutes: preset.eta_minutes || 8,
    speed_kmh: preset.speed_kmh || 65,
    payment_status: preset.payment_status || "PENDING",
    deposit_amount_inr: preset.deposit_amount_inr || 15000,
    bed_status: preset.bed_status || "HOLD",
    soft_lock_expires_at: expiresAt,
    pre_reservations: preset.pre_reservations || {
      blood_bank_units: 4,
      ct_scan_reserved: true,
      mri_reserved: false,
      or_theater_ready: true,
      neurosurgery_called: true,
      ortho_called: true,
      vascular_called: false,
      icu_team_notified: true,
    },
    cost_breakdown: preset.cost_breakdown || {
      items: [
        { item: "Emergency ICU Bed Soft-Lock & Setup", cost_inr: 8000, covered_by_insurance_pct: 80 },
        { item: "Trauma Bay Rapid Stabilization Kit", cost_inr: 5000, covered_by_insurance_pct: 90 },
        { item: "Whole Body Polytrauma CT (Pan-Scan)", cost_inr: 9000, covered_by_insurance_pct: 85 },
        { item: "Emergency Blood Bank Cross-Match (4 units)", cost_inr: 4500, covered_by_insurance_pct: 70 },
      ],
      subtotal_inr: 26500,
      abha_subsidy_inr: 5000,
      insurance_deductible_inr: 6500,
      final_patient_deposit_inr: 15000,
    },
    is_synced: true,
  };
}

// BroadcastChannel for cross-tab sync in real-time
let channel: BroadcastChannel | null = null;

export function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }
  if (!channel) {
    channel = new BroadcastChannel("traumanet_realtime_sync");
  }
  return channel;
}

export function broadcastMessage(data: any) {
  try {
    const ch = getBroadcastChannel();
    if (ch) {
      ch.postMessage(data);
    }
  } catch (e) {
    console.debug("BroadcastChannel post error:", e);
  }
}
