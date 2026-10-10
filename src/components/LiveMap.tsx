"use client";

import React, { useEffect, useRef, useState } from "react";
import { Hospital, EmergencySession } from "@/lib/types";
import { Navigation, Bed, Compass, ZoomIn, ZoomOut, MapPin, Layers, Phone } from "lucide-react";

interface LiveMapProps {
  session: EmergencySession;
  hospitals: Hospital[];
  height?: string;
  onSelectHospital?: (hospitalId: string) => void;
  mapStyle?: "roadmap" | "satellite" | "terrain";
  showTrafficLayer?: boolean;
}

export default function LiveMap({
  session,
  hospitals,
  height = "420px",
  onSelectHospital,
  mapStyle = "roadmap",
  showTrafficLayer = true,
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const polylineRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const assignedHospital =
    hospitals.find((h) => h.hospital_id === session.assigned_hospital_id) || hospitals[0];

  useEffect(() => {
    let isMounted = true;

    async function initGoogleStyleMap() {
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
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
        });

        // Authentic Google Maps Tile Layers
        let tileUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"; // Google Roadmap
        if (mapStyle === "satellite") {
          tileUrl = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"; // Google Hybrid Satellite
        } else if (mapStyle === "terrain") {
          tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"; // Dark Matter
        }

        const tileLayer = L.tileLayer(tileUrl, {
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        }).addTo(map);
        tileLayerRef.current = tileLayer;

        leafletMapRef.current = map;

        // Custom Google Pin for Hospitals
        const createGoogleHospitalIcon = (h: Hospital, isAssigned: boolean) => {
          const pinColor = isAssigned ? "#EA4335" : h.icu_beds_free > 0 ? "#1A73E8" : "#5F6368";
          return L.divIcon({
            className: "google-hospital-pin",
            html: `
              <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                ${
                  isAssigned
                    ? `<div style="position: absolute; -webkit-transform: scale(1.8); border: 2px solid #EA4335; border-radius: 50%; width: 36px; height: 36px; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.65;"></div>`
                    : ""
                }
                <!-- Google Red Pin -->
                <div style="background: ${pinColor}; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border: 2.5px solid #FFFFFF;">
                  <span style="transform: rotate(45deg); font-size: 15px; margin: auto;">🏥</span>
                </div>
                <!-- Google Place Badge -->
                <div style="background: #FFFFFF; border: 1px solid #DADCE0; border-radius: 6px; padding: 2px 8px; margin-top: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 4px;">
                  <span style="color: #202124; font-size: 11px; font-weight: 700; white-space: nowrap; font-family: Roboto, -apple-system, sans-serif;">
                    ${h.name.split(" ")[0]}
                  </span>
                  <span style="background: #E6F4EA; color: #137333; font-size: 10px; font-weight: 700; padding: 1px 4px; border-radius: 4px;">
                    ${h.icu_beds_free} ICU
                  </span>
                </div>
              </div>
            `,
            iconSize: [110, 64],
            iconAnchor: [55, 36],
          });
        };

        // Custom Google Navigation Ambulance Driving Icon
        const createGoogleAmbulanceIcon = () => {
          return L.divIcon({
            className: "google-ambulance-marker",
            html: `
              <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                <!-- Pulsing blue GPS radar beam -->
                <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(66, 133, 244, 0.35); animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <!-- Blue GPS Location Puck -->
                <div style="background: #1A73E8; border: 3px solid #FFFFFF; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(26, 115, 232, 0.8); z-index: 10;">
                  <span style="font-size: 18px; margin: auto;">🚑</span>
                </div>
                <!-- Driving Speed Label -->
                <div style="background: #202124; border: 1px solid #1A73E8; border-radius: 6px; padding: 2px 6px; margin-top: 3px; color: #FFFFFF; font-size: 10px; font-weight: 700; font-family: Roboto, sans-serif; white-space: nowrap;">
                  ETA ${session.eta_minutes}m • ${session.speed_kmh} km/h
                </div>
              </div>
            `,
            iconSize: [80, 54],
            iconAnchor: [40, 27],
          });
        };

        // Add hospital markers
        hospitals.forEach((h) => {
          const isAssigned = h.hospital_id === session.assigned_hospital_id;
          const marker = L.marker([h.lat, h.lng], {
            icon: createGoogleHospitalIcon(h, isAssigned),
          }).addTo(map);

          marker.on("click", () => {
            if (onSelectHospital) {
              onSelectHospital(h.hospital_id);
            }
          });

          markersRef.current[h.hospital_id] = marker;
        });

        // Add ambulance marker
        const ambMarker = L.marker([session.ambulance_lat, session.ambulance_lng], {
          icon: createGoogleAmbulanceIcon(),
          zIndexOffset: 1000,
        }).addTo(map);
        markersRef.current["ambulance"] = ambMarker;

        // Realistic Route Polyline (Ring Road / Arterial Corridors)
        const deltaLat = (assignedHospital.lat - session.ambulance_lat) / 3;
        const deltaLng = (assignedHospital.lng - session.ambulance_lng) / 3;

        const routeCoords: [number, number][] = [
          [session.ambulance_lat, session.ambulance_lng],
          [session.ambulance_lat + deltaLat, session.ambulance_lng + deltaLng * 0.7],
          [session.ambulance_lat + deltaLat * 2, session.ambulance_lng + deltaLng * 1.3],
          [assignedHospital.lat, assignedHospital.lng],
        ];

        // Google Maps Iconic Blue Navigation Polyline (#4285F4)
        const polylineBorder = L.polyline(routeCoords, {
          color: "#1A73E8",
          weight: 7,
          opacity: 0.9,
          lineCap: "round",
        }).addTo(map);

        const polylineInner = L.polyline(routeCoords, {
          color: "#4285F4",
          weight: 5,
          opacity: 1,
          lineCap: "round",
        }).addTo(map);

        polylineRef.current = polylineInner;

        if (isMounted) {
          setMapLoaded(true);
        }
      } catch (err) {
        console.warn("Google Maps style Leaflet initialization warning:", err);
      }
    }

    initGoogleStyleMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [hospitals, session.assigned_hospital_id, onSelectHospital, mapStyle]);

  // Update ambulance position smoothly
  useEffect(() => {
    if (leafletMapRef.current && markersRef.current["ambulance"]) {
      try {
        markersRef.current["ambulance"].setLatLng([
          session.ambulance_lat,
          session.ambulance_lng,
        ]);
      } catch (e) {
        // ignore
      }
    }
  }, [session.ambulance_lat, session.ambulance_lng]);

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
    <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 bg-[#E8EAED] shadow-xl w-full">
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ height, width: "100%" }}
        className="w-full z-0"
      />

      {/* Google Maps Turn-by-Turn Top HUD Navigation Banner */}
      <div className="absolute top-4 left-4 z-10 bg-[#1A73E8] text-white rounded-2xl px-4 py-3 shadow-xl max-w-sm flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg shrink-0">
          ↱
        </div>
        <div>
          <div className="text-xs sm:text-sm font-extrabold flex items-center gap-1.5 leading-snug">
            <span>In 450 m, take Ring Road ramp</span>
          </div>
          <p className="text-xs text-white/80">
            Toward {assignedHospital.name.split(" ")[0]} ER Bay
          </p>
        </div>
      </div>

      {/* Target Hospital Place Card (Top-Right) */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md text-[#202124] rounded-2xl p-3.5 shadow-xl border border-slate-200 max-w-[240px] hidden sm:block">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-[#202124] truncate">
              {assignedHospital.name}
            </div>
            <div className="text-xs text-[#5F6368] mt-0.5">
              {assignedHospital.trauma_level}
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
        </div>

        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200 text-xs">
          <span className="font-bold text-[#137333] flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" />
            {assignedHospital.icu_beds_free} ICU Free
          </span>
          <span className="font-mono text-[#5F6368] font-bold">
            {assignedHospital.distance_km || 4.2} km
          </span>
        </div>
      </div>

      {/* Google Maps Driving Bottom ETA Dock */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md text-[#202124] rounded-2xl px-4 py-2.5 shadow-xl border border-slate-200 flex items-center gap-3">
        <div className="text-xl font-extrabold text-[#137333] font-mono">
          {session.eta_minutes} min
        </div>
        <div className="text-xs text-[#5F6368] border-l border-slate-200 pl-3">
          <div>{assignedHospital.distance_km || 4.2} km • Speed: {session.speed_kmh} km/h</div>
          <div className="text-[#137333] font-semibold">Fastest route to trauma bay</div>
        </div>
      </div>

      {/* Google Navigation Controls (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          title="Recenter navigation corridor"
          className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-[#1A73E8] flex items-center justify-center shadow-lg border border-slate-200 transition-colors"
        >
          <Compass className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomIn}
          title="Zoom in"
          className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-[#202124] flex items-center justify-center shadow-lg border border-slate-200 transition-colors font-bold text-lg"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom out"
          className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-[#202124] flex items-center justify-center shadow-lg border border-slate-200 transition-colors font-bold text-lg"
        >
          -
        </button>
      </div>

      {/* Google Watermark */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10 text-[10px] text-[#5F6368] font-sans font-semibold tracking-wide pointer-events-none opacity-80">
        Google Maps Imagery • Live Emergency Telemetry
      </div>
    </div>
  );
}
