# TraumaNet v2 — Comprehensive Feature Comparison & Implementation Plan
**GDG x Ramdeobaba University Hackathon Build Guide Alignment**

---

## 1. Executive Summary: The TraumaNet v2 Paradigm Shift

TraumaNet v2 reframes the platform from an idealized "ambulance dispatcher & billing collector" to a pragmatic, legally compliant **Hospital Readiness & Coordination Layer** designed specifically for Indian emergency conditions (piloting in **Nagpur**).

### Core Philosophical Shifts (v1 vs v2)
| Dimension | Existing Implementation (v1) | TraumaNet v2 (PDF Specification) | Status / Action Needed |
|---|---|---|---|
| **Core Problem Claim** | Claims to solve "Golden Hour delays" and "Faster ambulance routing" | Claims **only** fewer wrong-hospital transfers and a prepared hospital arrival. Does **not** claim to make ambulances faster. | 🔄 Reframe messaging & copy across all pages |
| **Hospital Bed Availability** | Exposes live bed counts (`icu_beds_free: 6`, `total_icu_beds: 35`) and filters on bed counts | **Hospitals NEVER expose live counts** (does not exist reliably in India). Availability is verified strictly on-demand via **Hospital-Confirmed Acceptance** with a 15-minute auto-expiring hold. | ⚠️ **Critical Violation in v1**: Remove bed count displays, replace with request-response status |
| **Payment & Billing** | Includes `UpiPaymentModal.tsx`, QR codes, UPI IDs, deposit collection before ER entry | **UPI REMOVED ENTIRELY.** Treatment never waits on payment (Supreme Court *Parmanand Katara* ruling). Pre-registration & insurance capture is for paperwork readiness only. | ⚠️ **Critical Violation in v1**: Remove UPI modal and payment gates. Convert to paperwork pre-registration. |
| **AI Role & Medical Liability** | Gemini diagnoses trauma score (1-10), sets severity, and evaluates wound images | **Gemini extracts and structures ONLY.** It **never** diagnoses or sets priority. Produces 4-part **SBAR** handover citing source quotes and confidence levels. Clinician and paramedic retain 100% medical authority. | ⚠️ **Critical Violation in v1**: Redesign Gemini prompt, input/output schemas, and UI to SBAR format |
| **Target Geography** | New Delhi hospitals (AIIMS New Delhi, Apollo, Fortis) | **Nagpur pilot**: 1 ambulance operator, 5 Nagpur hospitals (AIIMS Nagpur, GMC Nagpur, Kingsway, Alexis/Max, Orange City Hospital). | 🔄 Update seed data and coordinates |
| **Language Support** | English only | **Hindi, Marathi, and English** voice/text notes structured into standardized English with original quotes preserved. | 🚀 Feature to add |
| **Hospital Ranking** | Simple distance / ETA sort | **Two-stage algorithmic ranking**: Stage 1 Hard Filters + Stage 2 100-Point Scoring (Capability, Traffic ETA, Confirmation Freshness, Historical Reliability) × Status Multiplier. | 🚀 Feature to add |
| **Feedback Loop** | None | **Arrival Feedback**: Doctor confirms handover; Paramedic marks "Accepted as promised" or "Turned away", dynamically updating the hospital's reliability score. | 🚀 Feature to add |
| **Patient Privacy** | Basic form fields | **DPDP Act consent screen**, synthetic patients only, and immutable audit trail (`audit/{id}`). | 🚀 Feature to add |
| **Simulation Transparency** | Unlabeled mock data | Explicit labels: "Simulated", "ABDM sandbox not connected", "Sample table - not a quote", "Synthetic patient". | 🚀 Polish required |

---

## 2. Feature-by-Feature Gap Analysis

### Legend
- ✅ **Already Present**: Fully implemented and working.
- 🟡 **Partially Present**: Partially implemented but needs adaptation or fixes to match v2 specs.
- 🔴 **Missing**: Required in v2 build guide but completely absent in current codebase.
- ⚠️ **Violates v2 / Anti-Pattern**: Present in codebase but contradicts v2 legal/ethical guardrails (needs removal or refactoring).

---

### A. Paramedic Module (`/paramedic`)

| Feature | PDF v2 Requirement | Current Status | Analysis & Remediation |
|---|---|---|---|
| **Vitals Capture** | HR, SBP, SpO2, GCS, RR | ✅ **Present** | Vitals monitor with live sliders/inputs is already implemented. |
| **Multilingual Voice/Text Notes** | Support Hindi, Marathi, and English notes | 🟡 **Partially Present** | Speech-to-text recorder exists (`VoiceNotesRecorder.tsx`), but defaults to browser English without Hindi/Marathi dialect selection or guidance. |
| **Language Selector** | Explicit language choice (Hindi / Marathi / English) | 🔴 **Missing** | Need UI selector for language and prompt instruction to handle multilingual transcripts. |
| **Optional Photo Capture** | Optional camera capture/upload | ✅ **Present** | Image upload and preview exists. |
| **Gemini Handover Structuring** | 4-part SBAR (`situation`, `background`, `assessment`, `recommendation`) with `source_quote` and `confidence` (`high`\|`medium`\|`low`) | ⚠️ **Violates v2** | Currently calculates diagnostic `trauma_score` (1-10) and `severity`. Must be rewritten to output strict SBAR JSON where missing data is marked `"not provided"` and quotes are preserved. |
| **Paramedic Priority Setting** | Paramedic explicitly sets Priority (`P1 Critical` / `P2 Serious` / `P3 Stable`) themselves | ⚠️ **Violates v2** | Currently AI automatically assigns priority. Paramedic must review SBAR draft and set priority themselves. |
| **Review & Edit Draft** | Paramedic can edit SBAR draft before broadcasting | 🔴 **Missing** | Currently AI output is displayed statically without inline editing or confirmation. |
| **Hospital Request Dispatch** | Dispatch request to top 1-3 shortlisted hospitals | 🟡 **Partially Present** | Currently assigns to a single hospital directly rather than broadcasting request cards to top candidates. |
| **Offline Resilience** | Offline queue and network state indicator | ✅ **Present** | `isOnline` detection and local broadcast channel implemented. |

---

### B. Hospital Shortlist & Ranking Engine (`v2 Algorithm`)

| Feature | PDF v2 Requirement | Current Status | Analysis & Remediation |
|---|---|---|---|
| **No Exposed Bed Counts** | "Hospitals never expose counts." No live ICU bed numbers shown | ⚠️ **Violates v2** | Code currently exposes `icu_beds_free` and `total_icu_beds`. Must remove bed count numbers and replace with "Acceptance on request". |
| **Hard Filter 1: Response Status** | Filter out hospitals that replied "Not accepting" or whose hold expired | 🔴 **Missing** | Current system only has a binary decline button. |
| **Hard Filter 2: Clinical Capabilities** | - CT scan required if GCS ≤ 12<br>- Blood bank required if SBP < 90 or heavy bleeding<br>- Trauma surgeon required if marked Critical | 🔴 **Missing** | Not currently implemented in ranking logic. |
| **Hard Filter 3: ETA Boundary** | Exclude hospitals > 30 minutes away unless no other options exist | 🔴 **Missing** | Not implemented. |
| **100-Point Scoring Algorithm** | - Capability Match: 40 pts<br>- Route ETA: 25 pts `[25 * (1 - ETA/30)]`<br>- Confirmation Freshness: 20 pts (full if ≤ 10m, linear to 0 at 60m)<br>- Reliability Score: 15 pts `[15 * reliability]` | 🔴 **Missing** | Currently sorts purely by hardcoded ETA/distance. Algorithm needs to be implemented in a dedicated module `ranking.ts`. |
| **Status Multipliers** | Accepting: ×1.0, Limited: ×0.8, No response: ×0.5 | 🔴 **Missing** | Not implemented. |
| **One-Line Explanation** | Generate human-readable one-line rationale for each ranked hospital | 🔴 **Missing** | Not implemented. |
| **Top-Score Tie Handling** | If top scores are within 5 points, present both for human choice | 🔴 **Missing** | Not implemented. |
| **Nagpur Seed Hospitals** | 5 trauma centers in Nagpur (AIIMS Nagpur, GMC, Kingsway, Alexis, Orange City) | 🔴 **Missing** | Currently using Delhi hospitals (AIIMS New Delhi, Apollo, Fortis). |

---

### C. Hospital ER Command Tower (`/hospital-er`)

| Feature | PDF v2 Requirement | Current Status | Analysis & Remediation |
|---|---|---|---|
| **Auditory synthesized chime** | Web Audio API alert sound | ✅ **Present** | Web Audio synth chime implemented in `audio.ts`. |
| **3-Tier Acceptance Action** | Taps `Accepting`, `Limited`, or `Not accepting` | 🟡 **Partially Present** | Currently has binary `[Accept & Lock Bed]` and `[Decline / Reroute]`. Needs `Limited` option with status multiplier logic. |
| **15-Minute Auto-Expiring Hold** | Auto-expiring countdown timer | ✅ **Present** | `SoftLockTimer.tsx` exists and runs a 15-minute countdown. |
| **2-3 Minute Timeout Fallback** | If no ER response in 2-3 mins: auto-ping next hospital and display "Call Control Room" fallback phone | 🔴 **Missing** | Currently stays waiting indefinitely until manually interacted with. |
| **ER Readiness Checklist** | 4-part checklist: Trauma Team Alert, Imaging (CT) Room, Blood Bank Alert, Insurance Desk Packet | 🟡 **Partially Present** | `PreReservationToggles.tsx` has raw toggles, but needs restructuring into the specific 4-point clinical checklist described in PDF. |
| **Telemetry & Live Vitals** | Real-time vitals monitoring | ✅ **Present** | ECG wave and vitals monitor are working. |

---

### D. Family Pre-Registration & Insurance Portal (`/family-portal`)

| Feature | PDF v2 Requirement | Current Status | Analysis & Remediation |
|---|---|---|---|
| **No-Payment Guardrail** | **UPI removed completely.** No payment is demanded or collected | ⚠️ **Violates v2** | `UpiPaymentModal.tsx`, QR codes, UPI IDs, deposit collection MUST BE REMOVED. Banner explaining Parmanand Katara Supreme Court legal mandate must be displayed. |
| **DPDP Act Consent Screen** | Patient data consent under DPDP Act before viewing/filling | 🔴 **Missing** | Currently goes straight into the portal without privacy disclosure. |
| **Family Pre-Registration Form** | Pre-fill patient name, age, relation, emergency contact | 🟡 **Partially Present** | Basic fields exist, but need clean form inputs where relatives can submit/verify patient info. |
| **Synthetic Insurance Card OCR** | Gemini multimodal image-to-JSON reading (Insurer, Policy Number, TPA) + human review | 🟡 **Partially Present** | `DocumentAIScanner.tsx` uses a static hardcoded timer. Needs real Gemini prompt or realistic synthetic card upload flow where family confirms each extracted field. |
| **Payment Route Suggester** | Rules-based engine showing: PM-JAY, Private Cashless, Road-Accident Scheme (MoRTH), or Self-Pay | 🔴 **Missing** | Not implemented. Must show options and state that the hospital desk confirms eligibility. |
| **ABHA Number Field** | Format validation (`XX-XXXX-XXXX-XXXX`), labeled "ABDM sandbox not connected" | 🟡 **Partially Present** | ABHA ID displayed as static string. Needs validation and simulation label badge. |
| **Cost Estimate Range** | Sample cost range table, clearly labeled: "Sample estimate only - not a quote" | ⚠️ **Violates v2** | Currently presents an itemized billing breakdown with a required deposit amount. Needs refactoring into an informational cost range. |
| **WhatsApp Family Link Preview** | Preview text message and one-click WhatsApp share link (`wa.me/?text=...`) | 🔴 **Missing** | Not implemented. |

---

### E. Clinical Handover & Arrival Feedback Loop

| Feature | PDF v2 Requirement | Current Status | Analysis & Remediation |
|---|---|---|---|
| **Pre-Authorization Packet** | One clean downloadable / printable summary page for the hospital insurance desk | 🔴 **Missing** | Not implemented. Needs print-friendly HTML/PDF export with patient details, policy info, and clinical handover. |
| **Arrival Confirmation** | Doctor confirms physical handover at trauma bay | 🔴 **Missing** | Not implemented. |
| **Arrival Feedback Buttons** | Paramedic records: `[Accepted as promised]` or `[Turned away]` | 🔴 **Missing** | Not implemented. |
| **Reliability Score Update** | Hospital reliability score updates dynamically based on accepted vs turned-away feedback | 🔴 **Missing** | Not implemented. |
| **Audit Log Trail** | `audit/{id}` records: `who`, `what`, `when` | 🔴 **Missing** | Not implemented. |

---

### F. Demo, Judging & Presentation Controls (`/admin-demo`)

| Feature | PDF v2 Requirement | Current Status | Analysis & Remediation |
|---|---|---|---|
| **3-Minute Demo Flow** | Step-by-step guidance following the PDF demo script | 🟡 **Partially Present** | Demo panel exists, but scenarios reflect v1 format. |
| **5 Synthetic Test Inputs** | - Clean English with all vitals<br>- Hindi voice-note transcript<br>- Marathi note with spelling mix<br>- Incomplete note (no GCS)<br>- Contradictory note (tests flags) | 🔴 **Missing** | Only 3 generic trauma presets currently exist. Needs exact 5 scenarios from PDF. |
| **Simulation Labels** | Visible badges on simulated elements (ABDM, sample hospitals, cost table) | 🔴 **Missing** | No simulation badges currently visible. |
| **Judge Q&A Cheat Sheet** | Quick-reference answers to the 8 standard judge questions in the PDF | 🔴 **Missing** | Can be integrated into `/admin-demo` for rapid presenter reference. |

---

## 3. Architecture & Data Model (v2)

### Updated TypeScript Schema (`src/lib/types.ts`)

```typescript
// Hospital model without live bed counts
export interface Hospital {
  hospital_id: string;
  name: string;
  city: string; // "Nagpur"
  address: string;
  lat: number;
  lng: number;
  capabilities: {
    ct: boolean;
    blood_bank: boolean;
    trauma_surgeon: boolean;
    neuro: boolean;
    cath_lab?: boolean;
  };
  reliability: number; // 0.0 - 1.0 (default 0.7 for new hospitals)
  accepted_count: number;
  turned_away_count: number;
  last_confirmed_at?: string; // ISO string
  contact: string;
  trauma_level: string; // "Level 1 Apex", "Level 2"
}

// SBAR Structured Handover
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

export type ParamedicPriority = "P1_CRITICAL" | "P2_SERIOUS" | "P3_STABLE";

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
  hold_expires_at?: string; // 15 mins after acceptance
  score: number;
  reason: string;
}

export interface CaseRecord {
  case_id: string;
  created_at: string;
  status: "active" | "arrived" | "completed";
  vitals: {
    hr: number;
    sbp: number;
    spo2: number;
    gcs: number;
    rr: number;
    temperature_c?: number;
  };
  age: number;
  sex: "MALE" | "FEMALE" | "OTHER";
  mechanism: string;
  note_text: string;
  language: "en" | "hi" | "mr";
  photo_ref?: string;
  handover: HandoverSBAR;
  priority: ParamedicPriority;
  consent_ts?: string;
  assigned_hospital_id?: string;
  arrival_feedback?: "accepted_as_promised" | "turned_away";
}

export interface FamilyRecord {
  case_id: string;
  consent_given: boolean;
  contact: {
    relative_name: string;
    relationship: string;
    phone: string;
  };
  insurance?: {
    insurer: string;
    policy_number: string;
    tpa: string;
    confirmed_by_family: boolean;
  };
  abha_id?: string; // Format validated
  payment_route_suggestion: "PM_JAY" | "PRIVATE_INSURANCE" | "ROAD_ACCIDENT_SCHEME" | "SELF_PAY";
  packet_downloaded: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  who: string; // e.g. "Paramedic-MH31-108", "ER-Desk-Kingsway", "Family-Portal"
  what: string; // e.g. "Case created", "Hospital requested", "Hold initiated", "DPDP consent recorded"
}
```

---

## 4. Hospital Ranking v2 Engine Logic

The ranking algorithm in `src/lib/ranking.ts` must execute as follows:

```typescript
export interface RankingResult {
  hospital: Hospital;
  score: number;
  breakdown: {
    capabilityMatch: number; // Max 40
    routeEta: number;        // Max 25
    freshness: number;       // Max 20
    reliability: number;     // Max 15
    statusMultiplier: number;// 1.0, 0.8, 0.5
  };
  oneLineReason: string;
  isEligible: boolean;
  filterOutReason?: string;
}
```

### Evaluation Steps
1. **Hard Filters (Disqualification)**:
   - Check if status is `"declined"` or hold `"expired"` -> Disqualify.
   - GCS ≤ 12 requires `ct: true` -> If missing, disqualify.
   - SBP < 90 requires `blood_bank: true` -> If missing, disqualify.
   - Priority `P1_CRITICAL` requires `trauma_surgeon: true` -> If missing, disqualify.
   - ETA > 30 minutes -> Disqualify unless all hospitals exceed 30 mins.
2. **Score Calculation (0 - 100)**:
   - **Capability Match (40 pts)**: `(Matched Required Capabilities / Total Required) * 40`.
   - **Route ETA (25 pts)**: `25 * Math.max(0, 1 - (ETA_min / 30))`.
   - **Confirmation Freshness (20 pts)**:
     - Full 20 pts if confirmed ≤ 10 min ago.
     - Linear decay from 20 down to 0 between 10 min and 60 min.
     - 0 pts if older than 60 min or never confirmed.
   - **Reliability (15 pts)**: `15 * hospital.reliability` (default 0.7 for new hospitals).
   - **Raw Score**: `Capability + RouteETA + Freshness + Reliability`.
3. **Status Multipliers**:
   - `Accepting` -> Score × 1.0
   - `Limited` -> Score × 0.8
   - `No response / Unknown` -> Score × 0.5
4. **Reason Generation**:
   - Synthesizes a one-line reason (e.g., *"Top capability match with 8-min ETA and 92% reliability rate"*).
5. **Tie-Breaking Rule**:
   - If top 2 hospitals are within 5 points, highlight both with tag *"Close score — Paramedic decision recommended"*.

---

## 5. Implementation Roadmap (Phases)

### Phase 1: Core Domain & Data Cleanup
- [ ] **Remove UPI & Payment Artifacts**:
  - Delete `src/components/UpiPaymentModal.tsx`.
  - Remove all payment states (`isDepositPaid`, `deposit_amount_inr`, `completePayment`) from store and context.
  - Add prominent Legal Notice banner: *Emergency Care Act / Supreme Court Parmanand Katara: Medical care is never conditioned on payment.*
- [ ] **Refactor Data Model & Types**:
  - Update `src/lib/types.ts` with v2 interfaces (SBAR, Nagpur hospitals, request state machine, feedback loop, audit log).
  - Update `src/lib/mockData.ts` with 5 Nagpur trauma centers (AIIMS Nagpur, GMC Nagpur, Kingsway Hospitals, Alexis/Max Nagpur, Orange City Hospital).
  - Remove exposed bed counts (`icu_beds_free`).

### Phase 2: Paramedic Capture & Gemini SBAR Engine
- [ ] **Multilingual Paramedic Interface**:
  - Add Hindi / Marathi / English language selector.
  - Add speech dictation helper with language tags.
- [ ] **SBAR Gemini Prompting**:
  - Update `src/lib/gemini.ts` with the exact system prompt from Page 7 of the build guide.
  - Implement JSON parser validating `situation`, `background`, `assessment`, `recommendation`, `source_quote`, and `confidence`.
  - Mark missing fields as `"not provided"`.
  - Disable all AI diagnostic grading (`trauma_score`, auto-severity).
- [ ] **Paramedic Review & Priority**:
  - Paramedic reviews editable SBAR cards.
  - Paramedic manually sets priority (`P1 Critical`, `P2 Serious`, `P3 Stable`).

### Phase 3: Hospital Ranking v2 Engine & State Machine
- [ ] **Implement `src/lib/ranking.ts`**:
  - Hard filters (GCS, SBP, critical surgeon, 30-min cutoff).
  - 100-point formula + multipliers + one-line rationale generator.
- [ ] **Hospital Confirmation State Machine**:
  - Update ER command buttons: `[Accepting]`, `[Limited]`, `[Not Accepting]`.
  - 15-minute auto-expiring hold timer.
  - 2-3 minute fallback timer with *"Ping next hospital"* & *"Call control room"* banner.

### Phase 4: Family Portal, DPDP Consent & Pre-Auth Packet
- [ ] **DPDP Consent Screen**:
  - Add initial consent modal explaining minimal data usage under the Digital Personal Data Protection Act.
- [ ] **Family Pre-Registration**:
  - Patient & relation contact details.
  - Insurance card upload with Gemini image-to-JSON extraction + manual review table.
  - ABHA format validator (`XX-XXXX-XXXX-XXXX`) with badge: `[SIMULATED - ABDM Sandbox Not Connected]`.
  - Payment route suggester (PM-JAY vs Private vs Motor Accident Scheme).
  - Sample cost range table with badge: `[Sample Estimate - Not a Quote]`.
- [ ] **Pre-Authorization Packet**:
  - One-click printable/downloadable summary page for the receiving hospital insurance desk.
- [ ] **WhatsApp Family Link Preview**:
  - Message generator with direct `https://wa.me/?text=...` deep link.

### Phase 5: Arrival Feedback Loop & Audit Log
- [ ] **Arrival Handover Screen**:
  - Doctor handover confirmation at hospital.
  - Paramedic arrival feedback buttons: `[Accepted as promised]` vs `[Turned away]`.
  - Updates hospital reliability score dynamically.
- [ ] **Audit Trail**:
  - In-memory / Firestore audit trail viewable in Admin Cockpit.

### Phase 6: Admin Demo, 5 Presets & Judging Q&A Cockpit
- [ ] **5 Standard Test Presets**:
  1. Clean English note with all vitals
  2. Hindi voice-note transcript
  3. Marathi note with spelling mix
  4. Incomplete note with missing GCS
  5. Contradictory note
- [ ] **Simulation Badges**:
  - Label all simulated components explicitly across all screens.
- [ ] **Judge Q&A Quick Reference**:
  - Add drawer/tab in `/admin-demo` containing the 8 key hackathon judge answers.

---

## 6. Verification & Quality Checklist

- [ ] Dev server compiles cleanly with 0 TypeScript errors.
- [ ] No mention of "UPI deposit", "GPay", "PhonePe", or required payment before emergency care.
- [ ] No hospital exposes raw live ICU bed numbers.
- [ ] Gemini API call outputs strictly structured SBAR JSON with source quotes and confidence indicators.
- [ ] Ranking engine correctly eliminates hospitals lacking CT when GCS ≤ 12, or lacking Blood Bank when SBP < 90.
- [ ] ER Command reflects `Accepting`, `Limited`, and `Not Accepting` responses with 15-minute hold timer.
- [ ] Arrival feedback buttons update the hospital's reliability percentage in real time.
- [ ] All pages function with responsive, dark-mode medical cockpit styling.
