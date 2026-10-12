// =====================================================================
// TRAUMANET v2 MOCK & SEED DATA (NAGPUR PILOT)
// Aligned with GDG x Ramdeobaba University Hackathon Specifications
// =====================================================================

import { Hospital, EmergencySession, HandoverSBAR } from "./types";

/**
 * 5 Pre-Seeded Nagpur Trauma Centers (Pages 2 & 4 of Build Guide)
 * Note: RAW BED COUNTS ARE REMOVED entirely per v2 rules.
 * Status is confirmed on-request with a 15-minute hold.
 */
export const INITIAL_HOSPITALS: Hospital[] = [
  {
    hospital_id: "hosp-aiims-nagpur-01",
    name: "AIIMS Nagpur Apex Trauma Center",
    city: "Nagpur",
    address: "Plot No. 2, Sector 20, MIHAN, Nagpur 441108",
    lat: 21.0543,
    lng: 79.0272,
    capabilities: {
      ct: true,
      blood_bank: true,
      trauma_surgeon: true,
      neuro: true,
      cath_lab: true,
    },
    reliability: 0.92,
    accepted_count: 46,
    turned_away_count: 4,
    last_confirmed_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 mins ago (Freshness: Full)
    contact: "+91-712-282-1000",
    trauma_level: "Level 1 Apex Trauma Center",
    distance_km: 6.8,
    eta_minutes: 11,
    status: "Accepting",
  },
  {
    hospital_id: "hosp-gmch-nagpur-02",
    name: "Government Medical College & Hospital (GMCH)",
    city: "Nagpur",
    address: "Hanuman Nagar, Medical Square, Nagpur 440003",
    lat: 21.1292,
    lng: 79.0984,
    capabilities: {
      ct: true,
      blood_bank: true,
      trauma_surgeon: true,
      neuro: true,
      cath_lab: false,
    },
    reliability: 0.88,
    accepted_count: 79,
    turned_away_count: 11,
    last_confirmed_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 mins ago
    contact: "+91-712-274-4401",
    trauma_level: "Level 1 Tertiary Government Center",
    distance_km: 4.2,
    eta_minutes: 8,
    status: "Accepting",
  },
  {
    hospital_id: "hosp-kingsway-nagpur-03",
    name: "Kingsway Hospitals (Trauma & Critical Care)",
    city: "Nagpur",
    address: "Near Kasturchand Park, Station Road, Nagpur 440001",
    lat: 21.1528,
    lng: 79.0886,
    capabilities: {
      ct: true,
      blood_bank: true,
      trauma_surgeon: true,
      neuro: true,
      cath_lab: true,
    },
    reliability: 0.94,
    accepted_count: 62,
    turned_away_count: 4,
    last_confirmed_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(), // 22 mins ago (Decayed freshness)
    contact: "+91-712-668-8888",
    trauma_level: "Level 1 Advanced Polytrauma Hub",
    distance_km: 5.5,
    eta_minutes: 9,
    status: "Limited", // 0.8x status penalty
  },
  {
    hospital_id: "hosp-alexis-max-nagpur-04",
    name: "Max Super Speciality / Alexis Hospital",
    city: "Nagpur",
    address: "Survey No. 232, Mankapur, Koradi Road, Nagpur 440030",
    lat: 21.1963,
    lng: 79.0805,
    capabilities: {
      ct: true,
      blood_bank: true,
      trauma_surgeon: true,
      neuro: false, // Lacks Neuro
      cath_lab: true,
    },
    reliability: 0.85,
    accepted_count: 34,
    turned_away_count: 6,
    last_confirmed_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    contact: "+91-712-712-0000",
    trauma_level: "Level 2 Emergency Trauma Care",
    distance_km: 8.9,
    eta_minutes: 14,
    status: "Accepting",
  },
  {
    hospital_id: "hosp-orange-city-nagpur-05",
    name: "Orange City Hospital & Research Institute",
    city: "Nagpur",
    address: "19, Khamla Square, Ring Road, Nagpur 440015",
    lat: 21.1147,
    lng: 79.0621,
    capabilities: {
      ct: true,
      blood_bank: true,
      trauma_surgeon: false, // Lacks dedicated trauma surgeon
      neuro: false,
      cath_lab: false,
    },
    reliability: 0.76,
    accepted_count: 22,
    turned_away_count: 7,
    last_confirmed_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    contact: "+91-712-223-8431",
    trauma_level: "Level 2 Community Trauma Care",
    distance_km: 7.1,
    eta_minutes: 12,
    status: "Accepting",
  },
];

/**
 * 5 Test Inputs Specified in Page 7 of the Build Guide:
 * 1. Clean English note with all vitals
 * 2. Hindi voice-note transcript
 * 3. Marathi note with a spelling mix
 * 4. Incomplete note with no GCS
 * 5. Contradictory note (tests confidence/review flags)
 */
export interface TestScenarioPreset {
  id: string;
  label: string;
  language: "en" | "hi" | "mr";
  note_text: string;
  patient_name: string;
  patient_age: number;
  patient_gender: "MALE" | "FEMALE" | "OTHER";
  mechanism: string;
  vitals: {
    hr: number;
    sbp: number;
    spo2: number;
    gcs: number;
    rr: number;
    temperature_c?: number;
  };
  priority: "P1_CRITICAL" | "P2_SERIOUS" | "P3_STABLE";
  handover_sbar: HandoverSBAR;
  description: string;
}

export const TEST_SCENARIOS: TestScenarioPreset[] = [
  {
    id: "preset-01-clean-english",
    label: "1. Clean English Note (All Vitals)",
    language: "en",
    patient_name: "Rahul Ramteke",
    patient_age: 34,
    patient_gender: "MALE",
    mechanism: "High-speed two-wheeler collision on Wardha Road",
    vitals: {
      hr: 132,
      sbp: 84,
      spo2: 89,
      gcs: 8,
      rr: 28,
      temperature_c: 36.1,
    },
    priority: "P1_CRITICAL",
    note_text:
      "34yo male struck by truck on Wardha Road flyover. Open abdominal laceration with visible bowel, massive hemorrhage. GCS 8 with anisocoria. SBP 84, Pulse 132. Cervical collar placed, two large-bore 14G IV lines running warm saline.",
    handover_sbar: {
      situation: {
        text: "34yo male post high-velocity truck collision on Wardha Road in acute hemorrhagic shock with GCS 8.",
        source_quote: "34yo male struck by truck on Wardha Road flyover. Open abdominal laceration with visible bowel, massive hemorrhage. GCS 8",
        confidence: "high",
      },
      background: {
        text: "Two-wheeler rider, direct impact trauma with acute blood loss.",
        source_quote: "struck by truck on Wardha Road flyover",
        confidence: "high",
      },
      assessment: {
        text: "Hemodynamically unstable hemorrhagic shock (SBP 84, HR 132) and traumatic brain injury requiring emergent pan-scan and neuro/trauma laparotomy.",
        source_quote: "SBP 84, Pulse 132. GCS 8 with anisocoria",
        confidence: "high",
      },
      recommendation: {
        text: "Prepare immediate Trauma Bay Level 1 resuscitation, 4 units O-Negative blood, and emergency CT Pan-Scan.",
        source_quote: "Cervical collar placed, two large-bore 14G IV lines running warm saline",
        confidence: "high",
      },
      missing_info: ["Past medical history not provided", "Allergies not provided"],
      needs_review: false,
    },
    description: "Evaluates standard English SBAR extraction, quotes match input exactly, zero invented fields.",
  },
  {
    id: "preset-02-hindi-transcript",
    label: "2. Hindi Voice-Note Transcript",
    language: "hi",
    patient_name: "Sunita Deshmukh",
    patient_age: 42,
    patient_gender: "FEMALE",
    mechanism: "सीताबर्डी चौराहे पर ऑटो पलटने से गंभीर चोट",
    vitals: {
      hr: 124,
      sbp: 88,
      spo2: 91,
      gcs: 10,
      rr: 26,
      temperature_c: 36.5,
    },
    priority: "P1_CRITICAL",
    note_text:
      "मरीज 42 साल की महिला है, सीताबर्डी पर ऑटो रिक्शा पलटने से सिर पर गंभीर चोट लगी है। बहुत खून बह रहा है, बेहोश है और उल्टी हुई है। बीपी 88 और नब्ज 124 है। हमने ऑक्सीजन 10 लीटर शुरू कर दिया है।",
    handover_sbar: {
      situation: {
        text: "42yo female with severe blunt head trauma and active hemorrhage after auto-rickshaw rollover at Sitabuldi.",
        source_quote: "मरीज 42 साल की महिला है, सीताबर्डी पर ऑटो रिक्शा पलटने से सिर पर गंभीर चोट लगी है।",
        confidence: "high",
      },
      background: {
        text: "Auto-rickshaw rollover with head strike and post-injury vomiting.",
        source_quote: "ऑटो रिक्शा पलटने से सिर पर गंभीर चोट लगी है... उल्टी हुई है।",
        confidence: "high",
      },
      assessment: {
        text: "Hypotensive (SBP 88) with altered mental status and suspected intracranial hypertension.",
        source_quote: "बहुत खून बह रहा है, बेहोश है... बीपी 88 और नब्ज 124 है।",
        confidence: "high",
      },
      recommendation: {
        text: "Emergency non-contrast head CT and blood bank readiness for transfusion.",
        source_quote: "हमने ऑक्सीजन 10 लीटर शुरू कर दिया है।",
        confidence: "high",
      },
      missing_info: ["Exact GCS motor/verbal breakdown not provided", "Pupillary reaction not provided"],
      needs_review: true,
    },
    description: "Tests multilingual Hindi transcription structured into English while retaining exact Hindi source quotes.",
  },
  {
    id: "preset-03-marathi-transcript",
    label: "3. Marathi Mixed Spelling Note",
    language: "mr",
    patient_name: "Vitthalrao Kadam",
    patient_age: 56,
    patient_gender: "MALE",
    mechanism: "धरमपेठ येथे दुचाकी घसरून छातीला मार",
    vitals: {
      hr: 110,
      sbp: 102,
      spo2: 86,
      gcs: 13,
      rr: 32,
      temperature_c: 36.8,
    },
    priority: "P2_SERIOUS",
    note_text:
      "रुग्ण 56 वर्षे पुरुष, धरमपेठ परिसरात दुचाकी स्लिप झाली. उजव्या छातीवर तीव्र मार, श्वास घ्यायला प्रचंड त्रास होतोय. SpO2 फक्त 86% आहे, छातीमध्ये flail segment जाणवतोय. सलाइन लावली आहे.",
    handover_sbar: {
      situation: {
        text: "56yo male involved in two-wheeler skid at Dharampeth with blunt thoracic trauma and acute respiratory distress.",
        source_quote: "रुग्ण 56 वर्षे पुरुष, धरमपेठ परिसरात दुचाकी स्लिप झाली. उजव्या छातीवर तीव्र मार",
        confidence: "high",
      },
      background: {
        text: "Motorcycle fall with isolated right hemithorax impact.",
        source_quote: "दुचाकी स्लिप झाली. उजव्या छातीवर तीव्र मार",
        confidence: "high",
      },
      assessment: {
        text: "Severe hypoxia (SpO2 86%, RR 32) with suspected flail chest and traumatic pneumothorax/hemothorax.",
        source_quote: "SpO2 फक्त 86% आहे, छातीमध्ये flail segment जाणवतोय.",
        confidence: "high",
      },
      recommendation: {
        text: "High-flow oxygen, bedside thoracic ultrasound/X-ray, prepare chest tube insertion tray.",
        source_quote: "श्वास घ्यायला प्रचंड त्रास होतोय... सलाइन लावली आहे.",
        confidence: "high",
      },
      missing_info: ["Blood pressure diastolic not provided", "Pupillary reflexes not provided"],
      needs_review: false,
    },
    description: "Tests regional Marathi dialect handling with mixed orthography structured into SBAR.",
  },
  {
    id: "preset-04-incomplete-gcs",
    label: "4. Incomplete Note (No GCS Provided)",
    language: "en",
    patient_name: "Anand Meshram",
    patient_age: 28,
    patient_gender: "MALE",
    mechanism: "Industrial crush injury in Hingna MIDC",
    vitals: {
      hr: 116,
      sbp: 110,
      spo2: 96,
      gcs: 15, // defaulted
      rr: 22,
    },
    priority: "P2_SERIOUS",
    note_text:
      "Worker suffered crush trauma to right lower limb beneath machinery in Hingna MIDC. Open compound fracture right tibia/fibula with bleeding. Tourniquet placed at 14:15. Responsive and complaining of severe pain.",
    handover_sbar: {
      situation: {
        text: "28yo male with severe industrial crush trauma to right lower extremity from Hingna MIDC factory.",
        source_quote: "crush trauma to right lower limb beneath machinery in Hingna MIDC",
        confidence: "high",
      },
      background: {
        text: "Factory machine crush incident; tourniquet applied en-route.",
        source_quote: "Tourniquet placed at 14:15",
        confidence: "high",
      },
      assessment: {
        text: "Open Grade III compound tibial fracture with ischemic risk; requires urgent orthopedic fixation.",
        source_quote: "Open compound fracture right tibia/fibula with bleeding",
        confidence: "high",
      },
      recommendation: {
        text: "Orthopedic trauma surgeon standby, X-ray of extremity, prophylactic IV antibiotics and analgesia.",
        source_quote: "Responsive and complaining of severe pain",
        confidence: "medium",
      },
      missing_info: ["Glasgow Coma Scale (GCS) not provided", "Distal pulse verification not provided"],
      needs_review: true,
    },
    description: "Tests strict guardrail: GCS is flagged as 'not provided' instead of invented by AI.",
  },
  {
    id: "preset-05-contradictory-flag",
    label: "5. Contradictory Note (Tests Review Flags)",
    language: "en",
    patient_name: "Prakash Gawande",
    patient_age: 50,
    patient_gender: "MALE",
    mechanism: "Fall from height during construction at Manewada",
    vitals: {
      hr: 144,
      sbp: 76,
      spo2: 84,
      gcs: 7,
      rr: 34,
    },
    priority: "P1_CRITICAL",
    note_text:
      "Patient fell from scaffolding. Note says patient is fully alert and chatting normally with stable vitals, but telemetry monitor shows SBP 76, Pulse 144, SpO2 84%, GCS 7 with severe respiratory distress.",
    handover_sbar: {
      situation: {
        text: "50yo male fall from height at Manewada with severe physiological collapse (SBP 76, HR 144, SpO2 84%).",
        source_quote: "fell from scaffolding... monitor shows SBP 76, Pulse 144, SpO2 84%, GCS 7",
        confidence: "low",
      },
      background: {
        text: "Construction fall from height with conflicting clinical narratives.",
        source_quote: "Patient fell from scaffolding",
        confidence: "medium",
      },
      assessment: {
        text: "Severe hypovolemic and respiratory failure. Discrepancy detected between narrative note and telemetry vitals.",
        source_quote: "Note says patient is fully alert... but telemetry shows SBP 76, Pulse 144, GCS 7",
        confidence: "low",
      },
      recommendation: {
        text: "Immediate invasive resuscitation in Level 1 Trauma Bay; treat telemetry vitals as active emergency.",
        source_quote: "severe respiratory distress",
        confidence: "low",
      },
      missing_info: ["Clinical narrative contradicts vitals - manual re-verification required immediately"],
      needs_review: true,
    },
    description: "Tests contradiction detection: flags low confidence and sets needs_review: true.",
  },
];

// Re-export DEMO_SCENARIOS for backward compatibility
export const DEMO_SCENARIOS = TEST_SCENARIOS;

/**
 * Indicative non-binding cost range estimates for Nagpur trauma care
 * Clearly marked as 'Sample estimate only - not a quote' per Page 4 & 5
 */
export const SAMPLE_COST_RANGES = [
  {
    service: "Emergency Trauma Bay Resuscitation & Diagnostic Pan-Scan",
    indicative_range_inr: "₹4,500 – ₹9,000",
    covered_by_scheme: "100% Cashless under PM-JAY & Road Accident Scheme",
  },
  {
    service: "ICU Bed Stabilization & Monitoring (Per 24h)",
    indicative_range_inr: "₹6,000 – ₹12,000",
    covered_by_scheme: "Covered under PM-JAY / Private TPA",
  },
  {
    service: "Emergency Surgical Theater Setup & Consumables",
    indicative_range_inr: "₹15,000 – ₹35,000",
    covered_by_scheme: "Cashless authorization prior to discharge",
  },
  {
    service: "Blood Bank O-Negative Cross-Match (Per Unit)",
    indicative_range_inr: "₹1,200 – ₹2,000",
    covered_by_scheme: "Statutory Free Supply in Apex Govt Centers",
  },
];
