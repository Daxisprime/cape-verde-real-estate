'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bed, Bath } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

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

function createPriceIcon(price: number, isActive = false): L.DivIcon {
  const priceLabel = formatPriceShort(price);
  const pinClasses = isActive
    ? 'bg-[#0044FF] text-white border-2 border-white font-black text-[11px] w-12 h-12 rounded-full flex items-center justify-center shadow-2xl scale-110 z-50'
    : 'bg-white text-gray-800 border border-gray-200 font-bold text-[10px] w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-[#0044FF] hover:text-white transition-colors';

  return L.divIcon({
    className: 'custom-price-marker',
    html: `<div class="${pinClasses}" style="cursor:pointer;transition:all 0.2s ease;">${priceLabel}</div>`,
    iconSize: isActive ? [48, 48] : [44, 44],
    iconAnchor: isActive ? [24, 24] : [22, 22],
    popupAnchor: [0, -24],
  });
}

function MapController({ activeItem }: { activeItem: any }) {
  const map = useMap();
  useEffect(() => {
    if (activeItem?.latitude && activeItem?.longitude) {
      const targetLatLng = L.latLng(activeItem.latitude, activeItem.longitude);
      const bounds = map.getBounds();
      if (!bounds.contains(targetLatLng)) {
        map.flyTo(targetLatLng, map.getZoom(), {
          animate: true,
          duration: 0.8,
        });
      } else {
        map.panTo(targetLatLng, { animate: true, duration: 0.4 });
      }
    }
  }, [activeItem, map]);
  return null;
}

const popupStyles = `
  .leaflet-popup-content-wrapper {
    padding: 0 !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.18) !important;
  }
  .leaflet-popup-content {
    margin: 0 !important;
    width: 180px !important;
    min-width: 180px !important;
  }
  .leaflet-popup-tip { background: white !important; }
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const styleId = 'trulia-map-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = popupStyles;
      document.head.appendChild(styleEl);
    }
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">
        Loading Map...
      </div>
    );
  }

  const defaultCenter: [number, number] = [14.9212, -23.5126];

  return (
    <div className="w-full h-full relative z-0">
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
          const isActive = item.id === activeItem?.id;

          return (
            <Marker
              key={item.id}
              position={[item.latitude, item.longitude]}
              icon={createPriceIcon(item.price, isActive)}
              eventHandlers={{
                mouseover: (e) => {
                  e.target.setIcon(createPriceIcon(item.price, true));
                  e.target.openPopup();
                },
                mouseout: (e) => {
                  e.target.setIcon(createPriceIcon(item.price, isActive));
                },
                click: () => onPinClick(item),
              }}
            >
              <Popup closeButton={false} autoPan={false}>
                <div className="cursor-pointer w-[180px]" onClick={() => onPinClick(item)}>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      className="w-full h-24 object-cover rounded-t-lg"
                      alt="preview"
                    />
                  )}
                  <div className="p-2.5 space-y-0.5 bg-white rounded-b-lg">
                    <p className="text-base font-black text-gray-900 leading-tight">
                      CVE {item.price?.toLocaleString()}
                    </p>
                    {item.listing_type === 'marketplace' ? (
                      <>
                        <p className="text-[11px] font-medium text-gray-700 truncate">
                          {item.title || 'Market Item'}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {item.neighborhood || ''}
                        </p>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Hi, I'm interested in: ${item.title}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-1.5 text-center text-[10px] font-bold text-white bg-emerald-500 rounded-md py-1 px-2 hover:bg-emerald-600 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          WhatsApp Seller
                        </a>
                      </>
                    ) : (
                      <>
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
                        <p className="text-[11px] font-normal text-gray-500 truncate mt-0.5">
                          {item.neighborhood || item.title || 'Cape Verde'}
                        </p>
                      </>
                    )}
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
