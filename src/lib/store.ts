// =====================================================================
// TRAUMANET v2 CENTRAL REACTIVE STORE
// Cross-tab sync via BroadcastChannel & LocalStorage
// =====================================================================

import { EmergencySession, Hospital, AuditLogEntry, HospitalRequest } from "./types";
import { INITIAL_HOSPITALS, TEST_SCENARIOS, TestScenarioPreset } from "./mockData";

export interface TraumaNetState {
  hospitals: Hospital[];
  sessions: EmergencySession[];
  activeSessionId: string | null;
  offlineQueue: Partial<EmergencySession>[];
  auditLogs: AuditLogEntry[];
  requests: HospitalRequest[];
  isOnline: boolean;
  useLiveGemini: boolean;
  geminiApiKey: string;
}

const STORAGE_KEY = "traumanet_state_v2_nagpur";

export function getInitialState(): TraumaNetState {
  if (typeof window === "undefined") {
    const initialSession = createDemoSessionFromPreset(TEST_SCENARIOS[0], "session-nagpur-01");
    return {
      hospitals: INITIAL_HOSPITALS,
      sessions: [initialSession],
      activeSessionId: initialSession.session_id,
      offlineQueue: [],
      auditLogs: [
        {
          id: "audit-01",
          timestamp: new Date().toISOString(),
          who: "Ambulance-MH31-108",
          what: "Case created and initial vitals telemetry synced",
        },
      ],
      requests: [],
      isOnline: true,
      useLiveGemini: false,
      geminiApiKey: "",
    };
  }

  try {
    // Force cleanup of obsolete v1 storage
    if (localStorage.getItem("traumanet_state_v1")) {
      localStorage.removeItem("traumanet_state_v1");
    }

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

  // Initialize fresh Nagpur state
  const initialSession = createDemoSessionFromPreset(TEST_SCENARIOS[0], "session-nagpur-01");
  const state: TraumaNetState = {
    hospitals: INITIAL_HOSPITALS,
    sessions: [initialSession],
    activeSessionId: initialSession.session_id,
    offlineQueue: [],
    auditLogs: [
      {
        id: "audit-01",
        timestamp: new Date().toISOString(),
        who: "Ambulance-MH31-108",
        what: "Initial Nagpur emergency incident initiated",
      },
    ],
    requests: [],
    isOnline: navigator.onLine !== false,
    useLiveGemini: false,
    geminiApiKey: "",
  };

  saveState(state);
  return state;
}

export function saveState(state: TraumaNetState) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      broadcastMessage({ type: "STATE_UPDATED", payload: state });
    } catch (e) {
      console.debug("Failed saving state to localStorage:", e);
    }
  }
}

export function createDemoSessionFromPreset(
  preset: Partial<TestScenarioPreset> | Partial<EmergencySession>,
  customId?: string
): EmergencySession {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 mins soft-lock hold
  const sessionId = customId || `tn-ngp-${Date.now().toString(36)}-${Math.floor(Math.random() * 900 + 100)}`;

  const presetAsTest = preset as Partial<TestScenarioPreset>;
  const presetAsSession = preset as Partial<EmergencySession>;

  const vitals = presetAsTest.vitals || presetAsSession.vitals || {
    hr: 132,
    sbp: 84,
    spo2: 89,
    gcs: 8,
    rr: 28,
    temperature_c: 36.1,
  };

  const patientVitals = {
    blood_pressure_sys: (vitals as any).blood_pressure_sys ?? (vitals as any).sbp ?? 84,
    blood_pressure_dia: (vitals as any).blood_pressure_dia ?? 52,
    pulse_rate: (vitals as any).pulse_rate ?? (vitals as any).hr ?? 132,
    spo2: (vitals as any).spo2 ?? 89,
    respiratory_rate: (vitals as any).respiratory_rate ?? (vitals as any).rr ?? 28,
    gcs_score: (vitals as any).gcs_score ?? (vitals as any).gcs ?? 8,
    temperature_c: vitals.temperature_c ?? 36.1,
  };

  const handover =
    presetAsTest.handover_sbar ||
    presetAsSession.handover || {
      situation: {
        text: "34yo male in acute hemorrhagic shock with GCS 8 following high-speed Wardha Road collision.",
        source_quote: "Open abdominal laceration, massive hemorrhage, GCS 8",
        confidence: "high" as const,
      },
      background: {
        text: "Direct vehicular impact trauma in Nagpur jurisdiction.",
        source_quote: "Wardha Road flyover",
        confidence: "high" as const,
      },
      assessment: {
        text: "Hypotensive (SBP 84, Pulse 132) with altered sensorium requiring immediate Level 1 trauma resuscitation.",
        source_quote: "SBP 84, Pulse 132, GCS 8",
        confidence: "high" as const,
      },
      recommendation: {
        text: "Prepare Trauma Bay Level 1 resuscitation, 4 units O-Negative blood, and emergency pan-scan.",
        source_quote: "Cervical collar placed, two large-bore IVs running",
        confidence: "high" as const,
      },
      missing_info: ["Past medical history not provided"],
      needs_review: false,
    };

  return {
    session_id: sessionId,
    case_id: sessionId,
    incident_title: presetAsTest.label || presetAsSession.incident_title || "Emergent Polytrauma Case (Wardha Road)",
    timestamp: now.toISOString(),
    patient_info: {
      name: presetAsTest.patient_name || presetAsSession.patient_info?.name || "Rahul Ramteke",
      age: presetAsTest.patient_age || presetAsSession.patient_info?.age || 34,
      gender: presetAsTest.patient_gender || presetAsSession.patient_info?.gender || "MALE",
      abha_id: presetAsSession.patient_info?.abha_id || "91-4432-8819-2041",
      insurance_provider: presetAsSession.patient_info?.insurance_provider || "Star Health Comprehensive Insurance",
      policy_number: presetAsSession.patient_info?.policy_number || "SH-NAG-2026-99120",
      tpa: presetAsSession.patient_info?.tpa || "Medi Assist TPA",
      coverage_amount_inr: 500000,
      emergency_contact_name: "Anita Ramteke (Spouse)",
      emergency_contact_phone: "+91-98230-11223",
      relationship: "Spouse",
    },
    vitals: patientVitals,
    language: presetAsTest.language || presetAsSession.language || "en",
    note_text: presetAsTest.note_text || presetAsSession.note_text || "Open abdominal laceration, massive hemorrhage, GCS 8.",
    voice_notes: presetAsSession.voice_notes || presetAsTest.note_text,
    handover,
    priority: presetAsTest.priority || presetAsSession.priority || "P1_CRITICAL",
    severity: "CRITICAL",
    assigned_hospital_id: presetAsSession.assigned_hospital_id || "hosp-aiims-nagpur-01",
    ambulance_id: "MH-31-EM-108 (ALS Team Nagpur)",
    ambulance_lat: 21.085,
    ambulance_lng: 79.055,
    eta_minutes: 11,
    speed_kmh: 58,
    request_status: "accepted",
    soft_lock_expires_at: expiresAt,
    requested_at: now.toISOString(),
    er_readiness: {
      trauma_team_alerted: true,
      imaging_room_ready: true,
      blood_bank_alerted: true,
      insurance_packet_received: true,
      specialists_assigned: ["Trauma Surgery", "Critical Care", "Neurosurgery"],
    },
    dpdp_consent_given: true,
    dpdp_consent_ts: now.toISOString(),
    insurance_confirmed: true,
    payment_route_suggestion: "PM_JAY",
    doctor_arrival_confirmed: false,
    arrival_feedback: undefined,
    is_synced: true,
    // Compatibility fields
    payment_status: "PAID",
    deposit_amount_inr: 0,
    bed_status: "ACCEPTED_LOCKED",
    trauma_score: 8.8,
    ai_pre_report: handover.situation.text,
    required_specialists: ["Trauma Surgery", "Neurosurgery", "Critical Care"],
    stabilization_steps: [
      "Maintain cervical collar & initiate 15L/min O2 via non-rebreather mask.",
      "Dual large-bore 14G peripheral lines; infuse 1000ml warmed saline.",
      "Apply pelvic binder; prepare for emergency pan-scan.",
    ],
    pre_reservations: {
      blood_bank_units: 4,
      ct_scan_reserved: true,
      mri_reserved: false,
      or_theater_ready: true,
      neurosurgery_called: true,
      ortho_called: true,
      vascular_called: false,
      icu_team_notified: true,
    },
  };
}

let channel: BroadcastChannel | null = null;

export function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }
  if (!channel) {
    channel = new BroadcastChannel("traumanet_realtime_sync_v2");
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
