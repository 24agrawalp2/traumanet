// =====================================================================
// TRAUMANET v2 LIVE EMERGENCY MAP COMPONENT
// Leaflet with OSM / CartoDB / Satellite World Imagery
// =====================================================================

"use client";

import React, { useEffect, useRef, useState } from "react";
import { Hospital, EmergencySession } from "@/lib/types";
import { Navigation, Compass, ZoomIn, ZoomOut, MapPin, Layers, AlertCircle } from "lucide-react";

interface LiveMapProps {
  session?: EmergencySession;
  hospitals: Hospital[];
  height?: string;
  onSelectHospital?: (hospitalId: string) => void;
  mapStyle?: "roadmap" | "satellite" | "terrain";
  showTrafficLayer?: boolean;
  ambulanceLat?: number;
  ambulanceLng?: number;
  hospitalLat?: number;
  hospitalLng?: number;
  hospitalName?: string;
}

export default function LiveMap({
  session,
  hospitals = [],
  height = "520px",
  onSelectHospital,
  mapStyle = "roadmap",
  showTrafficLayer = true,
  ambulanceLat,
  ambulanceLng,
  hospitalLat,
  hospitalLng,
  hospitalName,
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const polylineRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Nagpur coordinates fallback
  const ambLat = ambulanceLat ?? session?.ambulance_lat ?? 21.085;
  const ambLng = ambulanceLng ?? session?.ambulance_lng ?? 79.055;

  const assignedHospital =
    (session ? hospitals.find((h) => h.hospital_id === session.assigned_hospital_id) : null) ||
    hospitals[0] || {
      name: hospitalName || "AIIMS Nagpur Apex Trauma Center",
      city: "Nagpur",
      trauma_level: "Level 1 Apex",
      lat: hospitalLat || 21.0543,
      lng: hospitalLng || 79.0272,
      reliability: 0.92,
      status: "Accepting",
      distance_km: 6.8,
    };

  const targetLat = hospitalLat ?? assignedHospital?.lat ?? 21.0543;
  const targetLng = hospitalLng ?? assignedHospital?.lng ?? 79.0272;

  useEffect(() => {
    let isMounted = true;
    let resizeTimer1: any = null;
    let resizeTimer2: any = null;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        // Destroy old map if re-rendering
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const centerLat = (ambLat + targetLat) / 2;
        const centerLng = (ambLng + targetLng) / 2;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 12,
          zoomControl: false,
          attributionControl: false,
        });

        leafletMapRef.current = map;

        // 100% Reliable Tile Providers (Zero CORS / Zero Auth issues)
        let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        let subdomains: string[] | string = "abc";

        if (mapStyle === "terrain") {
          tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
          subdomains = "abcd";
        } else if (mapStyle === "satellite") {
          tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
          subdomains = "";
        }

        const tileLayer = L.tileLayer(tileUrl, {
          maxZoom: 19,
          subdomains: subdomains as any,
        }).addTo(map);

        tileLayerRef.current = tileLayer;

        // Custom Hospital Pin Icon
        const createHospitalIcon = (h: any, isAssigned: boolean) => {
          const pinColor = isAssigned ? "#EF4444" : h.status === "Accepting" ? "#10B981" : "#F59E0B";
          return L.divIcon({
            className: "hospital-pin",
            html: `
              <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                ${
                  isAssigned
                    ? `<div style="position: absolute; transform: scale(1.6); border: 2px solid #EF4444; border-radius: 50%; width: 34px; height: 34px; animation: ping 1.8s infinite; opacity: 0.7;"></div>`
                    : ""
                }
                <div style="background: ${pinColor}; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 2px solid #FFFFFF;">
                  <span style="transform: rotate(45deg); font-size: 15px; margin: auto;">🏥</span>
                </div>
                <div style="background: #0F172A; border: 1px solid #334155; border-radius: 6px; padding: 2px 6px; margin-top: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px;">
                  <span style="color: #F8FAFC; font-size: 11px; font-weight: 700; white-space: nowrap;">
                    ${(h.name || "Hospital").split(" ")[0]}
                  </span>
                  <span style="background: #064E3B; color: #34D399; font-size: 10px; font-weight: 700; padding: 1px 3px; border-radius: 3px;">
                    ${h.status || "Ready"}
                  </span>
                </div>
              </div>
            `,
            iconSize: [100, 60],
            iconAnchor: [50, 34],
          });
        };

        // Ambulance Icon
        const createAmbulanceIcon = () => {
          return L.divIcon({
            className: "ambulance-marker",
            html: `
              <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; width: 44px; height: 44px; background: rgba(239, 68, 68, 0.3); border: 2px solid #EF4444; border-radius: 50%; animation: ping 1.5s infinite;"></div>
                <div style="width: 36px; height: 36px; background: #EF4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.6); border: 2px solid #FFFFFF; z-index: 2;">
                  <span style="font-size: 17px;">🚑</span>
                </div>
              </div>
            `,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          });
        };

        // Plot hospitals
        hospitals.forEach((h) => {
          const isAssigned = h.hospital_id === assignedHospital?.hospital_id;
          const marker = L.marker([h.lat, h.lng], {
            icon: createHospitalIcon(h, isAssigned),
            zIndexOffset: isAssigned ? 1000 : 100,
          }).addTo(map);

          marker.on("click", () => {
            if (onSelectHospital) onSelectHospital(h.hospital_id);
          });
          markersRef.current[h.hospital_id] = marker;
        });

        // Plot ambulance
        const ambMarker = L.marker([ambLat, ambLng], {
          icon: createAmbulanceIcon(),
          zIndexOffset: 2000,
        }).addTo(map);
        markersRef.current["ambulance"] = ambMarker;

        // Route Polyline
        const routeCoords = [
          [ambLat, ambLng],
          [ambLat + (targetLat - ambLat) * 0.45, ambLng + (targetLng - ambLng) * 0.4],
          [targetLat, targetLng],
        ];

        const polyline = L.polyline(routeCoords as any, {
          color: "#3B82F6",
          weight: 5,
          opacity: 0.85,
          dashArray: "8, 6",
        }).addTo(map);
        polylineRef.current = polyline;

        // Auto-fit bounds
        try {
          const bounds = L.latLngBounds([
            [ambLat, ambLng],
            [targetLat, targetLng],
          ]);
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
        } catch {}

        // Invalidate map size so Leaflet fills full container immediately
        map.invalidateSize();
        resizeTimer1 = setTimeout(() => {
          map.invalidateSize();
        }, 150);
        resizeTimer2 = setTimeout(() => {
          map.invalidateSize();
        }, 500);

        if (isMounted) setMapLoaded(true);
      } catch (e) {
        console.error("Leaflet map load error:", e);
      }
    }

    initMap();

    // Resize handler
    const handleWindowResize = () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    };
    window.addEventListener("resize", handleWindowResize);

    return () => {
      isMounted = false;
      if (resizeTimer1) clearTimeout(resizeTimer1);
      if (resizeTimer2) clearTimeout(resizeTimer2);
      window.removeEventListener("resize", handleWindowResize);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [hospitals, assignedHospital, ambLat, ambLng, targetLat, targetLng, mapStyle]);

  // Update ambulance marker on position tick
  useEffect(() => {
    if (leafletMapRef.current && markersRef.current["ambulance"]) {
      try {
        markersRef.current["ambulance"].setLatLng([ambLat, ambLng]);
      } catch {}
    }
  }, [ambLat, ambLng]);

  const handleZoomIn = () => leafletMapRef.current?.zoomIn();
  const handleZoomOut = () => leafletMapRef.current?.zoomOut();
  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([ambLat, ambLng], 13);
    }
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800"
      style={{ height, minHeight: "450px" }}
    >
      {/* Actual Leaflet DOM canvas container */}
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%", minHeight: "450px" }}
        className="w-full h-full z-0"
      />

      {/* Floating Hospital Card */}
      {assignedHospital && (
        <div className="absolute top-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-slate-800 max-w-xs text-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                Target Trauma Center
              </span>
              <h4 className="font-bold text-sm text-white mt-0.5">{assignedHospital.name}</h4>
              <p className="text-[11px] text-slate-400">{assignedHospital.city} • {assignedHospital.trauma_level}</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 mt-1" />
          </div>

          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800 text-[11px]">
            <span className="font-bold text-emerald-400">
              Hold: {assignedHospital.status}
            </span>
            <span className="font-mono text-slate-400 font-semibold">
              Reliability: {Math.round(assignedHospital.reliability * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Floating Bottom ETA Strip */}
      {session && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md text-white rounded-2xl px-4 py-2.5 shadow-2xl border border-slate-800 flex items-center gap-3 text-xs">
          <div className="text-xl font-extrabold text-emerald-400 font-mono">
            {session.eta_minutes} min
          </div>
          <div className="border-l border-slate-800 pl-3 text-slate-400 text-[11px]">
            <div>Speed: {session.speed_kmh} km/h • Nagpur Corridor</div>
            <div className="text-emerald-400 font-medium">Active ALS Transit</div>
          </div>
        </div>
      )}

      {/* Map Control Buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          title="Recenter on ambulance"
          className="w-9 h-9 rounded-xl bg-slate-950 hover:bg-slate-850 text-blue-400 flex items-center justify-center shadow-lg border border-slate-800 transition-colors"
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomIn}
          title="Zoom in"
          className="w-9 h-9 rounded-xl bg-slate-950 hover:bg-slate-850 text-white flex items-center justify-center shadow-lg border border-slate-800 transition-colors font-bold text-base"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom out"
          className="w-9 h-9 rounded-xl bg-slate-950 hover:bg-slate-850 text-white flex items-center justify-center shadow-lg border border-slate-800 transition-colors font-bold text-base"
        >
          -
        </button>
      </div>
    </div>
  );
}
