'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bed, Bath } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// =============================================
// TRULIA-STYLE PRICE FORMATTING
// =============================================
function formatPriceShort(price: number): string {
  if (price >= 1000000) {
    const millions = price / 1000000;
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  } else if (price >= 1000) {
    const thousands = price / 1000;
    return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(0)}K`;
  }
  return price.toString();
}

// =============================================
// CUSTOM PRICE DOT ICON (Trulia-style circular badge)
// Fixed 44x44 square bounding box prevents oval morphing
// =============================================
function createPriceIcon(price: number, isActive: boolean = false): L.DivIcon {
  const priceLabel = formatPriceShort(price);

  // Default: Deep dark navy blue
  // Active/Hovered: Bright electric blue with scale-up
  const pinClasses = isActive
    ? 'bg-[#3b82f6] text-white border-2 border-white font-black text-[11px] w-11 h-11 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 transform scale-110 z-50'
    : 'bg-[#1e3a8a] text-white border-2 border-white font-bold text-[10px] w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform scale-100';

  return L.divIcon({
    className: 'custom-price-marker',
    html: `
      <div class="${pinClasses}" style="cursor: pointer;">
        ${priceLabel}
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

// =============================================
// INTERNAL MAP CONTROLLER
// Connects external card selection clicks to Leaflet viewport
// =============================================
function MapController({ activeItem }: { activeItem: any }) {
  const map = useMap();
  useEffect(() => {
    if (activeItem && activeItem.latitude && activeItem.longitude) {
      map.flyTo([activeItem.latitude, activeItem.longitude], 15, {
        animate: true,
        duration: 1.5
      });
    }
  }, [activeItem, map]);
  return null;
}

// =============================================
// CUSTOM POPUP STYLES (Bleeding images - zero padding)
// =============================================
const popupStyles = `
  .leaflet-popup-content-wrapper {
    padding: 0 !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18) !important;
  }
  .leaflet-popup-content {
    margin: 0 !important;
    width: 180px !important;
    min-width: 180px !important;
  }
  .leaflet-popup-tip {
    background: white !important;
  }
  .custom-price-marker {
    background: transparent !important;
    border: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
`;

interface MapProps {
  items: any[];
  activeItem: any;
  onPinClick: (item: any) => void;
}

export default function MapboxMap({ items = [], activeItem, onPinClick }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Inject custom popup styles
  useEffect(() => {
    if (isMounted && typeof document !== 'undefined') {
      const styleId = 'trulia-map-styles';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = popupStyles;
        document.head.appendChild(styleEl);
      }
    }
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[400px] bg-gray-50 flex items-center justify-center text-sm text-gray-400">
        Syncing Map Coordinates...
      </div>
    );
  }

  const defaultCenter: [number, number] = [14.9212, -23.5126];

  return (
    <div className="w-full h-full min-h-[400px] relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full absolute inset-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController activeItem={activeItem} />

        {items.map((item) => {
          if (!item.latitude || !item.longitude) return null;

          // Determine if this pin is active (selected or hovered)
          const isActive = item.id === hoveredPinId || item.id === activeItem?.id;

          return (
            <Marker
              key={item.id}
              position={[item.latitude, item.longitude]}
              icon={createPriceIcon(item.price, isActive)}
              ref={(ref) => {
                if (ref) {
                  markersRef.current.set(item.id, ref);
                }
              }}
              eventHandlers={{
                mouseover: (e) => {
                  setHoveredPinId(item.id);
                  e.target.openPopup();
                },
                mouseout: () => {
                  setHoveredPinId(null);
                },
                click: () => onPinClick(item)
              }}
            >
              <Popup closeButton={false} autoPan={false}>
                <div
                  className="cursor-pointer w-[180px]"
                  onClick={() => onPinClick(item)}
                >
                  {/* Bleeding Image - zero padding, full bleed to edges */}
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      className="w-full h-24 object-cover rounded-t-lg"
                      alt="preview"
                    />
                  )}

                  {/* Trulia-style compact text container */}
                  <div className="p-2.5 space-y-0.5 bg-white rounded-b-lg">
                    {/* Price Line - Bold, large black font */}
                    <p className="text-base font-black text-gray-900 leading-tight">
                      CVE {item.price?.toLocaleString()}
                    </p>

                    {/* Trulia Metrics Row - Bed & Bath icons */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                      <span className="flex items-center gap-0.5">
                        <Bed className="h-3.5 w-3.5 text-gray-400" />
                        {item.bedrooms || 0}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-0.5">
                        <Bath className="h-3.5 w-3.5 text-gray-400" />
                        {item.bathrooms || 0}
                      </span>
                    </div>

                    {/* Neighborhood Line - Clean truncated grey text */}
                    <p className="text-[11px] font-normal text-gray-500 truncate mt-0.5">
                      {item.neighborhood || item.title || 'Cape Verde'}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
