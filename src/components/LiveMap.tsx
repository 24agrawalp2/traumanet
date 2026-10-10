"use client";

import React, { useEffect, useRef, useState } from "react";
import { Hospital, EmergencySession } from "@/lib/types";
import { Navigation, Bed, Compass, ZoomIn, ZoomOut } from "lucide-react";

interface LiveMapProps {
  session: EmergencySession;
  hospitals: Hospital[];
  height?: string;
  onSelectHospital?: (hospitalId: string) => void;
}

export default function LiveMap({
  session,
  hospitals,
  height = "380px",
  onSelectHospital,
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const polylineRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const assignedHospital =
    hospitals.find((h) => h.hospital_id === session.assigned_hospital_id) || hospitals[0];

  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      try {
        const L = (await import("leaflet")).default;
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
        }

        const centerLat = (session.ambulance_lat + assignedHospital.lat) / 2;
        const centerLng = (session.ambulance_lng + assignedHospital.lng) / 2;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 12,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 19,
            subdomains: "abcd",
          }
        ).addTo(map);

        leafletMapRef.current = map;

        const createHospitalIcon = (h: Hospital, isAssigned: boolean) => {
          const isLocked = h.is_soft_locked || (isAssigned && session.bed_status === "ACCEPTED_LOCKED");
          const bgCol = isLocked ? "#10B981" : h.icu_beds_free > 0 ? "#2563EB" : "#DC2626";
          const borderCol = isAssigned ? "#F59E0B" : "rgba(255,255,255,0.3)";

          return L.divIcon({
            className: "custom-hospital-marker",
            html: `
              <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                <div style="background: ${bgCol}; border: 2px solid ${borderCol}; border-radius: 8px; padding: 4px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 5px; color: white; font-family: sans-serif; font-weight: 700; font-size: 11px;">
                  <span>🏥</span>
                  <span>${h.icu_beds_free} Beds</span>
                </div>
                <div style="background: #0F172A; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 2px 6px; margin-top: 3px; color: #E2E8F0; font-size: 10px; font-weight: 600; white-space: nowrap; max-width: 140px; overflow: hidden; text-overflow: ellipsis;">
                  ${h.name.split(" ")[0]}
                </div>
              </div>
            `,
            iconSize: [90, 48],
            iconAnchor: [45, 24],
          });
        };

        const ambulanceIcon = L.divIcon({
          className: "custom-ambulance-marker",
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
              <div style="background: #DC2626; border: 2px solid #FFFFFF; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-center; box-shadow: 0 0 16px rgba(220, 38, 38, 0.7); z-index: 10;">
                <span style="font-size: 17px; margin: auto;">🚑</span>
              </div>
              <div style="background: #1E293B; border: 1px solid #DC2626; border-radius: 6px; padding: 2px 6px; margin-top: 3px; color: white; font-size: 10px; font-weight: bold; white-space: nowrap;">
                ETA: ${session.eta_minutes}m
              </div>
            </div>
          `,
          iconSize: [60, 46],
          iconAnchor: [30, 23],
        });

        hospitals.forEach((h) => {
          const isAssigned = h.hospital_id === session.assigned_hospital_id;
          const marker = L.marker([h.lat, h.lng], {
            icon: createHospitalIcon(h, isAssigned),
          }).addTo(map);

          marker.on("click", () => {
            if (onSelectHospital) {
              onSelectHospital(h.hospital_id);
            }
          });

          markersRef.current[h.hospital_id] = marker;
        });

        const ambMarker = L.marker([session.ambulance_lat, session.ambulance_lng], {
          icon: ambulanceIcon,
          zIndexOffset: 1000,
        }).addTo(map);
        markersRef.current["ambulance"] = ambMarker;

        const routeCoords: [number, number][] = [
          [session.ambulance_lat, session.ambulance_lng],
          [(session.ambulance_lat + assignedHospital.lat) / 2 + 0.005, (session.ambulance_lng + assignedHospital.lng) / 2 - 0.004],
          [assignedHospital.lat, assignedHospital.lng],
        ];

        const polyline = L.polyline(routeCoords, {
          color: "#EF4444",
          weight: 4,
          opacity: 0.85,
          dashArray: "8, 6",
          lineCap: "round",
        }).addTo(map);
        polylineRef.current = polyline;

        if (isMounted) {
          setMapLoaded(true);
        }
      } catch (err) {
        console.warn("Leaflet map initialization warning:", err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [hospitals, session.assigned_hospital_id, onSelectHospital]);

  useEffect(() => {
    if (leafletMapRef.current && markersRef.current["ambulance"]) {
      try {
        markersRef.current["ambulance"].setLatLng([
          session.ambulance_lat,
          session.ambulance_lng,
        ]);
        if (polylineRef.current && assignedHospital) {
          polylineRef.current.setLatLngs([
            [session.ambulance_lat, session.ambulance_lng],
            [(session.ambulance_lat + assignedHospital.lat) / 2 + 0.005, (session.ambulance_lng + assignedHospital.lng) / 2 - 0.004],
            [assignedHospital.lat, assignedHospital.lng],
          ]);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [session.ambulance_lat, session.ambulance_lng, assignedHospital]);

  const handleZoomIn = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (leafletMapRef.current && assignedHospital) {
      leafletMapRef.current.setView(
        [
          (session.ambulance_lat + assignedHospital.lat) / 2,
          (session.ambulance_lng + assignedHospital.lng) / 2,
        ],
        13
      );
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-sm">
      <div
        ref={mapContainerRef}
        style={{ height, width: "100%" }}
        className="bg-slate-950 z-0"
      />

      {/* Floating HUD Overlay */}
      <div className="absolute top-3 left-3 z-10 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs shadow-md space-y-1">
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-red-500" />
          <span className="font-bold text-white">
            {session.ambulance_id.split(" ")[0]} Corridor
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-300 font-mono">
          <div>Speed: <strong className="text-emerald-400">{session.speed_kmh} km/h</strong></div>
          <div>ETA: <strong className="text-amber-400">{session.eta_minutes} mins</strong></div>
        </div>
      </div>

      {/* Target Hospital Card */}
      <div className="absolute top-3 right-3 z-10 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs shadow-md max-w-[220px] hidden sm:block">
        <div className="text-xs font-medium text-slate-400">Destination Hospital</div>
        <div className="font-bold text-white text-xs truncate mt-0.5">
          {assignedHospital.name}
        </div>
        <div className="flex items-center justify-between mt-1.5 text-xs">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" />
            {assignedHospital.icu_beds_free} ICU Free
          </span>
          <span className="text-slate-400 font-mono">{assignedHospital.distance_km || 4.5} km</span>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={handleRecenter}
          title="Recenter corridor"
          className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center shadow-md transition-colors"
        >
          <Compass className="w-4 h-4 text-blue-400" />
        </button>
        <button
          onClick={handleZoomIn}
          title="Zoom in"
          className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center shadow-md transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom out"
          className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center shadow-md transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
