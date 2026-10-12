// =====================================================================
// TRAUMANET v2 TYPE DEFINITIONS
// Aligned with GDG x Ramdeobaba University Hackathon Build Guide (Nagpur Pilot)
// =====================================================================

export interface HospitalCapabilities {
  ct: boolean;
  blood_bank: boolean;
  trauma_surgeon: boolean;
  neuro: boolean;
  cath_lab?: boolean;
}

export type HospitalResponseStatus = "Accepting" | "Limited" | "Not accepting" | "No response";

export interface Hospital {
  hospital_id: string;
  name: string;
  city: string; // "Nagpur"
  address: string;
  lat: number;
  lng: number;
  capabilities: HospitalCapabilities;
  reliability: number; // 0.0 - 1.0 (new hospitals start at 0.7)
  accepted_count: number;
  turned_away_count: number;
  last_confirmed_at: string; // ISO string
  contact: string;
  trauma_level: string; // "Level 1 Apex", "Level 1 Tertiary", "Level 2 Comprehensive"
  distance_km: number;
  eta_minutes: number;
  status: HospitalResponseStatus;
  is_soft_locked?: boolean;
  soft_locked_session_id?: string;
}

export interface PatientVitals {
  blood_pressure_sys: number;
  blood_pressure_dia: number;
  pulse_rate: number;
  spo2: number;
  respiratory_rate: number;
  gcs_score: number; // Glasgow Coma Scale 3-15
  temperature_c?: number;
}

export type ParamedicPriority = "P1_CRITICAL" | "P2_SERIOUS" | "P3_STABLE";

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SBARField {
  text: string;
  source_quote: string;
  confidence: "high" | "medium" | "low";
}

export interface HandoverSBAR {
  situation: SBARField;
  background: SBARField;
  assessment: SBARField;
  recommendation: SBARField;
  missing_info: string[];
  needs_review: boolean;
}

export type RequestStatus =
  | "requested"
  | "accepted"
  | "limited"
  | "declined"
  | "no_response"
  | "expired";

export interface HospitalRequest {
  request_id: string;
  case_id: string;
  hospital_id: string;
  status: RequestStatus;
  requested_at: string;
  hold_expires_at?: string;
  score: number;
  reason: string;
}

export interface ERReadinessChecklist {
  trauma_team_alerted: boolean;
  imaging_room_ready: boolean; // CT/X-Ray
  blood_bank_alerted: boolean; // O-Negative cross-matched
  insurance_packet_received: boolean;
  specialists_assigned: string[];
}

export interface PatientInfo {
  name: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  abha_id?: string;
  insurance_provider?: string;
  policy_number?: string;
  tpa?: string;
  coverage_amount_inr?: number;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  relationship?: string;
}

export type PaymentRouteSuggestion =
  | "PM_JAY"
  | "PRIVATE_INSURANCE"
  | "ROAD_ACCIDENT_SCHEME"
  | "SELF_PAY";

export interface CostRangeEstimate {
  service: string;
  indicative_range_inr: string;
  covered_by_scheme: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  who: string; // e.g. "Paramedic-MH31-ALS02", "ER-Tower-Kingsway", "Family-Portal"
  what: string; // e.g. "Case created", "SBAR structured", "15-min hold started"
}

export interface EmergencySession {
  session_id: string;
  case_id: string; // Synonymous with session_id
  incident_title: string;
  timestamp: string; // ISO string
  patient_info: PatientInfo;
  vitals: PatientVitals;
  language: "en" | "hi" | "mr";
  note_text: string;
  voice_notes?: string;
  injury_image_url?: string;
  handover: HandoverSBAR;
  priority: ParamedicPriority;
  severity: SeverityLevel;
  assigned_hospital_id: string;
  ambulance_id: string;
  ambulance_lat: number;
  ambulance_lng: number;
  eta_minutes: number;
  speed_kmh: number;
  request_status: RequestStatus;
  soft_lock_expires_at: string;
  requested_at?: string;
  er_readiness: ERReadinessChecklist;
  dpdp_consent_given: boolean;
  dpdp_consent_ts?: string;
  insurance_confirmed: boolean;
  payment_route_suggestion: PaymentRouteSuggestion;
  doctor_arrival_confirmed: boolean;
  arrival_feedback?: "accepted_as_promised" | "turned_away";
  is_synced: boolean;
  // Legacy compatibility helpers (mapped gracefully without payment barriers)
  payment_status: "PENDING" | "PAID";
  deposit_amount_inr: number;
  bed_status: "HOLD" | "ACCEPTED_LOCKED" | "DECLINED_REROUTED" | "ADMITTED";
  trauma_score: number;
  ai_pre_report: string;
  required_specialists: string[];
  stabilization_steps: string[];
  pre_reservations: PreReservations;
}

export interface PreReservations {
  blood_bank_units: number;
  ct_scan_reserved: boolean;
  mri_reserved: boolean;
  or_theater_ready: boolean;
  neurosurgery_called: boolean;
  ortho_called: boolean;
  vascular_called: boolean;
  icu_team_notified: boolean;
}

export interface GeminiTriageResponse {
  handover: HandoverSBAR;
  priority_suggestion?: ParamedicPriority;
  required_specialists: string[];
  stabilization_steps: string[];
}
