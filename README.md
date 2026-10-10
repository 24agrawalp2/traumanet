# TraumaNet 🚨
### AI Emergency Triage, Smart Routing & Pre-Admission Platform

> **Eliminating the 3 "Golden Hour" Bottlenecks in Accident Care:**  
> 1. **Medical Uncertainty** (solved via Gemini 1.5 Multimodal Triage + ATLS RTS clinical engine)  
> 2. **Hospital Bed Mismatch** (solved via real-time ICU capacity filtering & 15-minute Flight-Booking Bed Soft-Locks)  
> 3. **Billing Counter Delays** (solved via ABHA / Insurance Document AI & 1-Click Instant UPI Pre-Admission Deposits)

---

## 🌟 Key Features & Live Synchronized Roles

TraumaNet provides 3 real-time synchronized user roles plus a 3-in-1 Stage Cockpit:

| Route | Role / Module | Key Capabilities |
|---|---|---|
| **`/`** | **Unified 3-Pane Cockpit** | Side-by-side presentation view synchronizing Paramedic, ER Command, and Family Portal in real time. |
| **`/paramedic`** | **Paramedic Fleet App (PWA Mobile)** | Camera wound capture, manual vitals (BP, Pulse, SpO2, RR, GCS), speech-to-text audio override, Gemini 1.5 triage trigger, smart ICU bed routing card, offline queue resilience & automatic image compression. |
| **`/hospital-er`** | **Hospital ER Command Tower** | Auditory synthesized chime + pulsing alert panel, flight-booking 15-minute soft-lock countdown, `[ACCEPT PATIENT & LOCK BED]` & `[DECLINE / REROUTE]` actions, live telemetry ECG stream, pre-reservation toggles (Blood Bank O-Neg, CT/MRI, Specialists), and real-time billing clearance status. |
| **`/family-portal`** | **Family Pre-Admission & UPI Portal** | Emergency notification transit banner, Document AI simulator for Ayushman Bharat (ABHA) and private insurance OCR, transparent itemized cost estimator, and 1-click UPI payments (GPay, PhonePe, Paytm, dynamic QR) that immediately unlock trauma bay admission. |
| **`/admin-demo`** | **Demo & Judging Control Panel** | "⚡ Inject 30-Second Emergency Scenario" button for hackathon stages, Mock vs. Live Gemini 1.5 API key toggle, interactive ambulance movement simulator, and live JSON database inspector. |

---

## 🏗️ Architecture & Tech Stack

- **Frontend & App Router**: Next.js 14, React 18, TypeScript, Tailwind CSS (High-contrast emergency dark theme: `#0F172A` background, `#EF4444` emergency red, `#10B981` success green, `#3B82F6` accent blue).
- **AI Triage Engine**: Google Gemini 1.5 Pro / Flash Multimodal API (`@google/generative-ai`) returning strict structured JSON, with an ATLS (Advanced Trauma Life Support) / RTS deterministic clinical fallback.
- **Real-Time Cross-Client Sync**: Browser `BroadcastChannel` for instantaneous zero-latency local cross-tab synchronization + Next.js REST API endpoints (`/api/triage`, `/api/hospitals`, `/api/sessions`, `/api/demo-inject`, `/api/seed`).
- **Interactive Emergency Corridor**: Dynamic Leaflet maps with CARTO Dark Matter styling, moving ambulance marker with pulse beacon, hospital ICU availability markers, and route polyline.
- **Audio Feedback**: Synthesized browser Web Audio API hospital chime and warning alerts (zero external audio file dependencies).
- **PWA & Offline First**: Service Worker caching (`/sw.js`), Web App Manifest (`/manifest.json`), network state detection (`navigator.onLine`), and offline queue handling.

---

## 🏥 Pre-Seeded Mock Indian Hospitals

TraumaNet is pre-configured with 5 top Indian trauma centers:

1. **AIIMS Apex Trauma Center** (Ring Road, New Delhi) — 6 Free ICU Beds • Level 1 Apex Trauma
2. **Apollo Emergency & Trauma Care** (Sarita Vihar, New Delhi) — 4 Free ICU Beds • Level 1 Tertiary Emergency
3. **Fortis Memorial Research Institute (FMRI)** (Gurugram / NCR) — 5 Free ICU Beds • Level 1 Advanced Polytrauma
4. **Max Super Speciality Hospital** (Saket, New Delhi) — 3 Free ICU Beds • Level 2 Trauma Center
5. **Manipal Hospital Comprehensive Trauma Center** (Dwarka, New Delhi) — 7 Free ICU Beds • Level 1 Multi-Specialty

---

## 🚀 Running Locally

### 1. Prerequisites
- Node.js 18+ (tested on Node v20 & v24)
- npm or yarn

### 2. Setup
```bash
cd traumanet
npm install
```

### 3. Environment Variables (Optional)
Create `.env.local` to use your live Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If no key is provided, TraumaNet runs seamlessly using its built-in ATLS clinical triage engine!)*

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ☁️ Deployment Instructions

### Option 1: Deploy to Vercel (Recommended 1-Click)
1. Push your repository to GitHub / GitLab.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In Environment Variables, optionally add:
   - `GEMINI_API_KEY`: Your Gemini API key
4. Click **Deploy**. Vercel will automatically build and serve the Next.js app with Edge caching.

### Option 2: Deploy to Google Cloud Run (Containerized)
1. Make sure you have the [Google Cloud CLI](https://cloud.google.com/sdk) installed and authenticated:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_GCP_PROJECT_ID
   ```
2. Build and submit the container to Google Cloud Artifact Registry / Container Registry:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/traumanet:latest
   ```
3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy traumanet \
     --image gcr.io/YOUR_GCP_PROJECT_ID/traumanet:latest \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --set-env-vars GEMINI_API_KEY="your_gemini_api_key"
   ```
4. Cloud Run will output your live production URL (e.g., `https://traumanet-xyz-el.a.run.app`).
