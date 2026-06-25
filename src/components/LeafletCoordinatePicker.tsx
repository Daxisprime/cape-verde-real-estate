"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  className: "coordinate-picker-pin",
  html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
    <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#2563EB"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function DraggableMarker({ position, onChange }: { position: [number, number]; onChange: (pos: [number, number]) => void }) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker
      position={position}
      icon={pinIcon}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const marker = markerRef.current;
          if (marker) {
            const { lat, lng } = marker.getLatLng();
            onChange([lat, lng]);
          }
        },
      }}
    />
  );
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenter = useRef(center);

  useEffect(() => {
    if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
      map.flyTo(center, 14, { duration: 0.8 });
      prevCenter.current = center;
    }
  }, [center, map]);

  return null;
}

interface Props {
  center: [number, number];
  value: [number, number] | null;
  onChange: (coords: [number, number]) => void;
}

export default function LeafletCoordinatePicker({ center, value, onChange }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="w-full h-40 bg-slate-100 rounded-lg" />;

  const markerPos: [number, number] = value || center;

  return (
    <div className="w-full h-40 relative">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />
        <DraggableMarker position={markerPos} onChange={onChange} />
      </MapContainer>
      <div className="absolute bottom-1 left-1 bg-white/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-[9px] text-slate-500 pointer-events-none z-[400]">
        Drag pin or click to set location
      </div>
    </div>
  );
}
