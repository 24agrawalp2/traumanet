// =====================================================================
// TRAUMANET v2 REACTIVE CONTEXT & REALTIME BROADCASTER
// Aligned with GDG Hackathon Guide
// =====================================================================

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  EmergencySession,
  Hospital,
  ERReadinessChecklist,
  ParamedicPriority,
  HandoverSBAR,
  AuditLogEntry,
  PreReservations,
} from "./types";
import {
  TraumaNetState,
  getInitialState,
  saveState,
  getBroadcastChannel,
  broadcastMessage,
  createDemoSessionFromPreset,
} from "./store";
import { TEST_SCENARIOS, INITIAL_HOSPITALS } from "./mockData";
import { playErAlertChime, playSuccessChime } from "./audio";

interface TraumaNetContextType {
  state: TraumaNetState;
  hospitals: Hospital[];
  sessions: EmergencySession[];
  activeSession: EmergencySession | null;
  activeHospital: Hospital | null;
  auditLogs: AuditLogEntry[];
  isOnline: boolean;
  useLiveGemini: boolean;
  geminiApiKey: string;
  setActiveSessionId: (id: string) => void;
  updateSession: (sessionId: string, updates: Partial<EmergencySession>) => void;
  createSession: (data: Partial<EmergencySession>) => EmergencySession;
  respondHospitalRequest: (
    sessionId: string,
    hospitalId: string,
    status: "accepted" | "limited" | "declined"
  ) => void;
  recordArrivalFeedback: (
    sessionId: string,
    outcome: "accepted_as_promised" | "turned_away"
  ) => void;
  confirmDoctorArrival: (sessionId: string) => void;
  updateERReadiness: (sessionId: string, updates: Partial<ERReadinessChecklist>) => void;
  recordDPDPConsent: (sessionId: string) => void;
  addAuditLog: (who: string, what: string) => void;
  injectEmergencyScenario: (index?: number) => EmergencySession;
  resetAllData: () => void;
  setUseLiveGemini: (val: boolean) => void;
  setGeminiApiKey: (key: string) => void;
  toggleNetworkOnline: () => void;
  simulateAmbulanceProgress: () => void;
  // Legacy compatibility helpers
  acceptAndLockBed: (sessionId: string) => void;
  declineAndReroute: (sessionId: string, targetHospitalId?: string) => void;
  completePayment: (sessionId: string, txnId?: string) => void;
  updatePreReservations: (sessionId: string, reservations: Partial<PreReservations>) => void;
}

const TraumaNetContext = createContext<TraumaNetContextType | null>(null);

export function TraumaNetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TraumaNetState>(getInitialState);

  // Sync with localStorage & BroadcastChannel
  useEffect(() => {
    const loaded = getInitialState();
    setState(loaded);

    const channel = getBroadcastChannel();
    if (channel) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "STATE_UPDATED" && event.data.payload) {
          setState(event.data.payload);
        } else if (event.data?.type === "NEW_EMERGENCY_ALERT") {
          playErAlertChime();
        } else if (event.data?.type === "CONFIRMATION_RECEIVED") {
          playSuccessChime();
        }
      };
      channel.addEventListener("message", handleMessage);
      return () => {
        channel.removeEventListener("message", handleMessage);
      };
    }
  }, []);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => {
        const next = { ...prev, isOnline: true };
        saveState(next);
        return next;
      });
    };
    const handleOffline = () => {
      setState((prev) => {
        const next = { ...prev, isOnline: false };
        saveState(next);
        return next;
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Ambulance GPS movement simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        let changed = false;
        const updatedSessions = prev.sessions.map((ses) => {
          if (ses.request_status === "accepted" && ses.eta_minutes > 1 && !ses.doctor_arrival_confirmed) {
            changed = true;
            const newEta = Math.max(1, ses.eta_minutes - 0.2);
            // Move coordinates slightly towards assigned hospital
            const hosp = prev.hospitals.find((h) => h.hospital_id === ses.assigned_hospital_id);
            const targetLat = hosp?.lat || 21.0543;
            const targetLng = hosp?.lng || 79.0272;
            const newLat = ses.ambulance_lat + (targetLat - ses.ambulance_lat) * 0.03;
            const newLng = ses.ambulance_lng + (targetLng - ses.ambulance_lng) * 0.03;

            return {
              ...ses,
              eta_minutes: Math.round(newEta * 10) / 10,
              ambulance_lat: Number(newLat.toFixed(5)),
              ambulance_lng: Number(newLng.toFixed(5)),
            };
          }
          return ses;
        });

        if (changed) {
          const next = { ...prev, sessions: updatedSessions };
          saveState(next);
          return next;
        }
        return prev;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const activeSession =
    state.sessions.find((s) => s.session_id === state.activeSessionId) ||
    state.sessions[0] ||
    null;

  const activeHospital =
    state.hospitals.find((h) => h.hospital_id === activeSession?.assigned_hospital_id) ||
    state.hospitals[0] ||
    null;

  const addAuditLog = useCallback((who: string, what: string) => {
    setState((prev) => {
      const entry: AuditLogEntry = {
        id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        who,
        what,
      };
      const next = { ...prev, auditLogs: [entry, ...prev.auditLogs].slice(0, 100) };
      saveState(next);
      return next;
    });
  }, []);

  const setActiveSessionId = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev, activeSessionId: id };
      saveState(next);
      return next;
    });
  }, []);

  const updateSession = useCallback(
    (sessionId: string, updates: Partial<EmergencySession>) => {
      setState((prev) => {
        const nextSessions = prev.sessions.map((s) =>
          s.session_id === sessionId ? { ...s, ...updates } : s
        );
        const next = { ...prev, sessions: nextSessions };
        saveState(next);
        return next;
      });
    },
    []
  );

  const createSession = useCallback(
    (data: Partial<EmergencySession>): EmergencySession => {
      const newSession = createDemoSessionFromPreset(data);
      setState((prev) => {
        const next = {
          ...prev,
          sessions: [newSession, ...prev.sessions],
          activeSessionId: newSession.session_id,
        };
        saveState(next);
        return next;
      });
      addAuditLog("Ambulance Paramedic", `Initiated emergency case: ${newSession.incident_title}`);
      broadcastMessage({ type: "NEW_EMERGENCY_ALERT", payload: newSession });
      return newSession;
    },
    [addAuditLog]
  );

  // Hospital response state machine: Accepting / Limited / Declined
  const respondHospitalRequest = useCallback(
    (
      sessionId: string,
      hospitalId: string,
      status: "accepted" | "limited" | "declined"
    ) => {
      setState((prev) => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

        const updatedHospitals = prev.hospitals.map((h) => {
          if (h.hospital_id === hospitalId) {
            return {
              ...h,
              status: (status === "accepted" ? "Accepting" : status === "limited" ? "Limited" : "Not accepting") as any,
              last_confirmed_at: now.toISOString(),
            };
          }
          return h;
        });

        const updatedSessions = prev.sessions.map((s) => {
          if (s.session_id === sessionId) {
            return {
              ...s,
              assigned_hospital_id: hospitalId,
              request_status: status as any,
              bed_status: (status === "accepted" ? "ACCEPTED_LOCKED" : status === "declined" ? "DECLINED_REROUTED" : "HOLD") as any,
              soft_lock_expires_at: status === "accepted" ? expiresAt : s.soft_lock_expires_at,
            };
          }
          return s;
        });

        const next = { ...prev, hospitals: updatedHospitals, sessions: updatedSessions };
        saveState(next);
        return next;
      });

      const hospName = state.hospitals.find((h) => h.hospital_id === hospitalId)?.name || hospitalId;
      addAuditLog(`Hospital ER (${hospName})`, `Responded '${status.toUpperCase()}' - 15-min hold status updated`);
      broadcastMessage({ type: "CONFIRMATION_RECEIVED", payload: { sessionId, hospitalId, status } });
    },
    [addAuditLog, state.hospitals]
  );

  // Arrival feedback loop: Doctor confirms handover -> Paramedic rates outcome
  const recordArrivalFeedback = useCallback(
    (sessionId: string, outcome: "accepted_as_promised" | "turned_away") => {
      setState((prev) => {
        const ses = prev.sessions.find((s) => s.session_id === sessionId);
        const hospitalId = ses?.assigned_hospital_id;

        const updatedHospitals = prev.hospitals.map((h) => {
          if (h.hospital_id === hospitalId) {
            const newAccepted = h.accepted_count + (outcome === "accepted_as_promised" ? 1 : 0);
            const newTurned = h.turned_away_count + (outcome === "turned_away" ? 1 : 0);
            const total = newAccepted + newTurned;
            const newReliability = total > 0 ? Math.round((newAccepted / total) * 100) / 100 : 0.7;

            return {
              ...h,
              accepted_count: newAccepted,
              turned_away_count: newTurned,
              reliability: newReliability,
            };
          }
          return h;
        });

        const updatedSessions = prev.sessions.map((s) => {
          if (s.session_id === sessionId) {
            return {
              ...s,
              arrival_feedback: outcome,
              doctor_arrival_confirmed: true,
            };
          }
          return s;
        });

        const next = { ...prev, hospitals: updatedHospitals, sessions: updatedSessions };
        saveState(next);
        return next;
      });

      addAuditLog("Arrival Clinician", `Handover finalized: ${outcome === "accepted_as_promised" ? "Accepted as promised" : "Patient turned away / diverted"}`);
    },
    [addAuditLog]
  );

  const confirmDoctorArrival = useCallback(
    (sessionId: string) => {
      updateSession(sessionId, { doctor_arrival_confirmed: true });
      addAuditLog("Receiving Doctor", "Clinician confirmed physical patient arrival in Trauma Bay");
    },
    [updateSession, addAuditLog]
  );

  const updateERReadiness = useCallback(
    (sessionId: string, updates: Partial<ERReadinessChecklist>) => {
      setState((prev) => {
        const updatedSessions = prev.sessions.map((s) => {
          if (s.session_id === sessionId) {
            return {
              ...s,
              er_readiness: { ...s.er_readiness, ...updates },
            };
          }
          return s;
        });
        const next = { ...prev, sessions: updatedSessions };
        saveState(next);
        return next;
      });
      addAuditLog("ER Command", "Readiness checklist updated");
    },
    [addAuditLog]
  );

  const recordDPDPConsent = useCallback(
    (sessionId: string) => {
      updateSession(sessionId, {
        dpdp_consent_given: true,
        dpdp_consent_ts: new Date().toISOString(),
      });
      addAuditLog("Family Portal", "DPDP Act patient data consent recorded with timestamp");
    },
    [updateSession, addAuditLog]
  );

  const injectEmergencyScenario = useCallback(
    (index = 0): EmergencySession => {
      const preset = TEST_SCENARIOS[index % TEST_SCENARIOS.length];
      const newSession = createDemoSessionFromPreset(preset);
      setState((prev) => {
        const next = {
          ...prev,
          sessions: [newSession, ...prev.sessions],
          activeSessionId: newSession.session_id,
        };
        saveState(next);
        return next;
      });
      addAuditLog("Demo Control", `Injected official preset #${index + 1}: ${preset.label}`);
      broadcastMessage({ type: "NEW_EMERGENCY_ALERT", payload: newSession });
      playErAlertChime();
      return newSession;
    },
    [addAuditLog]
  );

  const resetAllData = useCallback(() => {
    localStorage.removeItem("traumanet_state_v2_nagpur");
    localStorage.removeItem("traumanet_state_v1");
    const freshSession = createDemoSessionFromPreset(TEST_SCENARIOS[0], "session-nagpur-01");
    const freshState: TraumaNetState = {
      hospitals: INITIAL_HOSPITALS,
      sessions: [freshSession],
      activeSessionId: freshSession.session_id,
      offlineQueue: [],
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          who: "System Reset",
          what: "Restored pristine Nagpur pilot initial state",
        },
      ],
      requests: [],
      isOnline: true,
      useLiveGemini: false,
      geminiApiKey: "",
    };
    setState(freshState);
    saveState(freshState);
  }, []);

  const setUseLiveGemini = useCallback((val: boolean) => {
    setState((prev) => {
      const next = { ...prev, useLiveGemini: val };
      saveState(next);
      return next;
    });
  }, []);

  const setGeminiApiKey = useCallback((key: string) => {
    setState((prev) => {
      const next = { ...prev, geminiApiKey: key };
      saveState(next);
      return next;
    });
  }, []);

  const toggleNetworkOnline = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, isOnline: !prev.isOnline };
      saveState(next);
      return next;
    });
  }, []);

  const simulateAmbulanceProgress = useCallback(() => {
    if (!activeSession) return;
    updateSession(activeSession.session_id, {
      eta_minutes: Math.max(1, activeSession.eta_minutes - 2),
    });
  }, [activeSession, updateSession]);

  // Compatibility wrappers
  const acceptAndLockBed = useCallback(
    (sessionId: string) => {
      respondHospitalRequest(sessionId, activeSession?.assigned_hospital_id || state.hospitals[0].hospital_id, "accepted");
    },
    [respondHospitalRequest, activeSession, state.hospitals]
  );

  const declineAndReroute = useCallback(
    (sessionId: string, targetHospitalId?: string) => {
      respondHospitalRequest(sessionId, activeSession?.assigned_hospital_id || state.hospitals[0].hospital_id, "declined");
    },
    [respondHospitalRequest, activeSession, state.hospitals]
  );

  const completePayment = useCallback(
    (sessionId: string) => {
      updateSession(sessionId, { insurance_confirmed: true, payment_status: "PAID" });
      addAuditLog("Insurance Desk", "Pre-admission insurance packet verified; zero billing delay confirmed");
    },
    [updateSession, addAuditLog]
  );

  const updatePreReservations = useCallback(
    (sessionId: string, reservations: Partial<PreReservations>) => {
      if (!activeSession) return;
      updateSession(sessionId, {
        pre_reservations: { ...activeSession.pre_reservations, ...reservations },
      });
    },
    [activeSession, updateSession]
  );

  return (
    <TraumaNetContext.Provider
      value={{
        state,
        hospitals: state.hospitals,
        sessions: state.sessions,
        activeSession,
        activeHospital,
        auditLogs: state.auditLogs,
        isOnline: state.isOnline,
        useLiveGemini: state.useLiveGemini,
        geminiApiKey: state.geminiApiKey,
        setActiveSessionId,
        updateSession,
        createSession,
        respondHospitalRequest,
        recordArrivalFeedback,
        confirmDoctorArrival,
        updateERReadiness,
        recordDPDPConsent,
        addAuditLog,
        injectEmergencyScenario,
        resetAllData,
        setUseLiveGemini,
        setGeminiApiKey,
        toggleNetworkOnline,
        simulateAmbulanceProgress,
        // Legacy
        acceptAndLockBed,
        declineAndReroute,
        completePayment,
        updatePreReservations,
      }}
    >
      {children}
    </TraumaNetContext.Provider>
  );
}

export function useTraumaNet() {
  const context = useContext(TraumaNetContext);
  if (!context) {
    throw new Error("useTraumaNet must be used within a TraumaNetProvider");
  }
  return context;
}
