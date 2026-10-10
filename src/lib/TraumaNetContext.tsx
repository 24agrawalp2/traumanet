"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { EmergencySession, Hospital, PreReservations } from "./types";
import {
  TraumaNetState,
  getInitialState,
  saveState,
  getBroadcastChannel,
  broadcastMessage,
  createDemoSessionFromPreset,
} from "./store";
import { DEMO_SCENARIOS, INITIAL_HOSPITALS } from "./mockData";
import { playErAlertChime, playSuccessChime } from "./audio";

interface TraumaNetContextType {
  state: TraumaNetState;
  hospitals: Hospital[];
  sessions: EmergencySession[];
  activeSession: EmergencySession | null;
  activeHospital: Hospital | null;
  isOnline: boolean;
  useLiveGemini: boolean;
  geminiApiKey: string;
  setActiveSessionId: (id: string) => void;
  updateSession: (sessionId: string, updates: Partial<EmergencySession>) => void;
  createSession: (data: Partial<EmergencySession>) => EmergencySession;
  acceptAndLockBed: (sessionId: string) => void;
  declineAndReroute: (sessionId: string, targetHospitalId?: string) => void;
  updatePreReservations: (sessionId: string, reservations: Partial<PreReservations>) => void;
  completePayment: (sessionId: string, upiRefId?: string) => void;
  injectEmergencyScenario: (index?: number) => EmergencySession;
  resetAllData: () => void;
  setUseLiveGemini: (val: boolean) => void;
  setGeminiApiKey: (key: string) => void;
  toggleNetworkOnline: () => void;
  simulateAmbulanceProgress: () => void;
}

const TraumaNetContext = createContext<TraumaNetContextType | null>(null);

export function TraumaNetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TraumaNetState>(getInitialState);
  const ambulanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with localStorage & BroadcastChannel
  useEffect(() => {
    // Ensure state is loaded on client
    const loaded = getInitialState();
    setState(loaded);

    // Listen for broadcast messages from other tabs
    const channel = getBroadcastChannel();
    if (channel) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "STATE_UPDATED" && event.data.payload) {
          setState(event.data.payload);
        } else if (event.data?.type === "NEW_EMERGENCY_ALERT") {
          playErAlertChime();
        } else if (event.data?.type === "PAYMENT_RECEIVED") {
          playSuccessChime();
        }
      };
      channel.addEventListener("message", handleMessage);
      return () => {
        channel.removeEventListener("message", handleMessage);
      };
    }
  }, []);

  // Listen to browser online/offline events
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

  // Live ambulance movement simulation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        let changed = false;
        const updatedSessions = prev.sessions.map((session) => {
          if (session.eta_minutes > 1 && session.bed_status !== "ADMITTED") {
            changed = true;
            // Minor coordinate drift towards assigned hospital
            const hospital = prev.hospitals.find((h) => h.hospital_id === session.assigned_hospital_id);
            let nextLat = session.ambulance_lat;
            let nextLng = session.ambulance_lng;
            if (hospital) {
              const deltaLat = (hospital.lat - session.ambulance_lat) * 0.05;
              const deltaLng = (hospital.lng - session.ambulance_lng) * 0.05;
              nextLat += deltaLat;
              nextLng += deltaLng;
            }
            return {
              ...session,
              ambulance_lat: nextLat,
              ambulance_lng: nextLng,
              eta_minutes: Math.max(1, Math.round((session.eta_minutes - 0.1) * 10) / 10),
            };
          }
          return session;
        });

        if (changed) {
          const nextState = { ...prev, sessions: updatedSessions };
          saveState(nextState);
          return nextState;
        }
        return prev;
      });
    }, 15000); // update every 15s

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

  const setActiveSessionId = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev, activeSessionId: id };
      saveState(next);
      return next;
    });
  }, []);

  const updateSession = useCallback((sessionId: string, updates: Partial<EmergencySession>) => {
    setState((prev) => {
      const updatedSessions = prev.sessions.map((s) =>
        s.session_id === sessionId ? { ...s, ...updates } : s
      );
      const next = { ...prev, sessions: updatedSessions };
      saveState(next);
      return next;
    });
  }, []);

  const createSession = useCallback((data: Partial<EmergencySession>) => {
    const newSession = createDemoSessionFromPreset(data);
    setState((prev) => {
      // Mark assigned hospital as soft-locked
      const updatedHospitals = prev.hospitals.map((h) =>
        h.hospital_id === newSession.assigned_hospital_id
          ? { ...h, is_soft_locked: true, soft_locked_session_id: newSession.session_id }
          : h
      );
      const next: TraumaNetState = {
        ...prev,
        sessions: [newSession, ...prev.sessions],
        activeSessionId: newSession.session_id,
        hospitals: updatedHospitals,
      };
      saveState(next);
      broadcastMessage({ type: "NEW_EMERGENCY_ALERT", payload: newSession });
      return next;
    });
    playErAlertChime();
    return newSession;
  }, []);

  const acceptAndLockBed = useCallback((sessionId: string) => {
    setState((prev) => {
      const session = prev.sessions.find((s) => s.session_id === sessionId);
      if (!session) return prev;

      const targetHospId = session.assigned_hospital_id;
      const updatedHospitals = prev.hospitals.map((h) => {
        if (h.hospital_id === targetHospId) {
          return {
            ...h,
            is_soft_locked: false,
            icu_beds_free: Math.max(0, h.icu_beds_free - 1),
          };
        }
        return h;
      });

      const updatedSessions = prev.sessions.map((s) =>
        s.session_id === sessionId
          ? {
              ...s,
              bed_status: "ACCEPTED_LOCKED" as const,
            }
          : s
      );

      const next = { ...prev, hospitals: updatedHospitals, sessions: updatedSessions };
      saveState(next);
      broadcastMessage({ type: "BED_LOCKED", payload: { sessionId, targetHospId } });
      return next;
    });
    playSuccessChime();
  }, []);

  const declineAndReroute = useCallback((sessionId: string, explicitTargetId?: string) => {
    setState((prev) => {
      const session = prev.sessions.find((s) => s.session_id === sessionId);
      if (!session) return prev;

      // Find best alternate hospital with free beds
      const fallbackHospital =
        prev.hospitals.find(
          (h) => h.hospital_id !== session.assigned_hospital_id && h.icu_beds_free > 0
        ) || prev.hospitals[0];

      const reroutedHospitalId = explicitTargetId || fallbackHospital.hospital_id;

      const updatedSessions = prev.sessions.map((s) =>
        s.session_id === sessionId
          ? {
              ...s,
              assigned_hospital_id: reroutedHospitalId,
              rerouted_to_hospital_id: reroutedHospitalId,
              bed_status: "HOLD" as const,
              soft_lock_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
              eta_minutes: Math.round(s.eta_minutes + 6),
            }
          : s
      );

      const next = { ...prev, sessions: updatedSessions };
      saveState(next);
      broadcastMessage({ type: "SESSION_REROUTED", payload: { sessionId, reroutedHospitalId } });
      return next;
    });
    playErAlertChime();
  }, []);

  const updatePreReservations = useCallback((sessionId: string, reservations: Partial<PreReservations>) => {
    setState((prev) => {
      const updatedSessions = prev.sessions.map((s) => {
        if (s.session_id === sessionId) {
          return {
            ...s,
            pre_reservations: {
              ...s.pre_reservations,
              ...reservations,
            },
          };
        }
        return s;
      });
      const next = { ...prev, sessions: updatedSessions };
      saveState(next);
      return next;
    });
  }, []);

  const completePayment = useCallback((sessionId: string, upiRefId?: string) => {
    const ref = upiRefId || `UPI-TXN-${Date.now().toString().slice(-6)}-SUCCESS`;
    setState((prev) => {
      const updatedSessions = prev.sessions.map((s) =>
        s.session_id === sessionId
          ? {
              ...s,
              payment_status: "PAID" as const,
              upi_ref_id: ref,
            }
          : s
      );
      const next = { ...prev, sessions: updatedSessions };
      saveState(next);
      broadcastMessage({ type: "PAYMENT_RECEIVED", payload: { sessionId, ref } });
      return next;
    });
    playSuccessChime();
  }, []);

  const injectEmergencyScenario = useCallback((index = 0) => {
    const scenarioPreset = DEMO_SCENARIOS[index % DEMO_SCENARIOS.length];
    const newSession = createDemoSessionFromPreset(scenarioPreset);
    setState((prev) => {
      const updatedHospitals = prev.hospitals.map((h) =>
        h.hospital_id === newSession.assigned_hospital_id
          ? { ...h, is_soft_locked: true, soft_locked_session_id: newSession.session_id }
          : h
      );
      const next = {
        ...prev,
        sessions: [newSession, ...prev.sessions],
        activeSessionId: newSession.session_id,
        hospitals: updatedHospitals,
      };
      saveState(next);
      broadcastMessage({ type: "NEW_EMERGENCY_ALERT", payload: newSession });
      return next;
    });
    playErAlertChime();
    return newSession;
  }, []);

  const resetAllData = useCallback(() => {
    const initialSession = createDemoSessionFromPreset(DEMO_SCENARIOS[0], "session-demo-01");
    const freshState: TraumaNetState = {
      hospitals: INITIAL_HOSPITALS,
      sessions: [initialSession],
      activeSessionId: initialSession.session_id,
      offlineQueue: [],
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
    setState((prev) => {
      const updatedSessions = prev.sessions.map((s) => {
        if (s.session_id === prev.activeSessionId) {
          const nextEta = Math.max(1, s.eta_minutes - 2);
          return { ...s, eta_minutes: nextEta };
        }
        return s;
      });
      const next = { ...prev, sessions: updatedSessions };
      saveState(next);
      return next;
    });
  }, []);

  return (
    <TraumaNetContext.Provider
      value={{
        state,
        hospitals: state.hospitals,
        sessions: state.sessions,
        activeSession,
        activeHospital,
        isOnline: state.isOnline,
        useLiveGemini: state.useLiveGemini,
        geminiApiKey: state.geminiApiKey,
        setActiveSessionId,
        updateSession,
        createSession,
        acceptAndLockBed,
        declineAndReroute,
        updatePreReservations,
        completePayment,
        injectEmergencyScenario,
        resetAllData,
        setUseLiveGemini,
        setGeminiApiKey,
        toggleNetworkOnline,
        simulateAmbulanceProgress,
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
