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

function createPriceIcon(price: number, isActive = false, isFeatured = false): L.DivIcon {
  const priceLabel = formatPriceShort(price);
  let pinClasses: string;
  if (isActive) {
    pinClasses = 'bg-[#0044FF] text-white border-2 border-white font-black text-[11px] w-12 h-12 rounded-full flex items-center justify-center shadow-2xl';
  } else if (isFeatured) {
    pinClasses = 'bg-amber-500 text-white border-2 border-amber-300 font-black text-[10px] w-11 h-11 rounded-full flex items-center justify-center shadow-lg';
  } else {
    pinClasses = 'bg-white text-gray-800 border border-gray-200 font-bold text-[10px] w-10 h-10 rounded-full flex items-center justify-center shadow-md';
  }

  const size = isActive ? 48 : isFeatured ? 44 : 44;
  const anchor = isActive ? 24 : isFeatured ? 22 : 22;

  return L.divIcon({
    className: `custom-price-marker ${isActive ? 'active-marker' : ''} ${isFeatured ? 'featured-marker' : ''}`,
    html: `<div class="${pinClasses}" style="cursor:pointer;transition:all 0.2s ease;transform:${isActive ? 'scale(1.15)' : isFeatured ? 'scale(1.05)' : 'scale(1)'};">${priceLabel}</div>`,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
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
        map.panTo(targetLatLng, { animate: true, duration: 0.5 });
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
    width: 200px !important;
    min-width: 200px !important;
  }
  .leaflet-popup-tip { background: white !important; }
  .custom-price-marker {
    background: transparent !important;
    border: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .active-marker {
    z-index: 999 !important;
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
          const isFeatured = item.is_featured || false;

          return (
            <Marker
              key={item.id}
              position={[item.latitude, item.longitude]}
              icon={createPriceIcon(item.price, isActive, isFeatured)}
              zIndexOffset={isActive ? 1000 : isFeatured ? 500 : 0}
              eventHandlers={{
                mouseover: (e) => {
                  e.target.setIcon(createPriceIcon(item.price, true, isFeatured));
                  e.target.openPopup();
                },
                mouseout: (e) => {
                  if (!isActive) {
                    e.target.setIcon(createPriceIcon(item.price, false, isFeatured));
                  }
                },
                click: () => onPinClick(item),
              }}
            >
              <Popup closeButton={false} autoPan={false}>
                <div className="cursor-pointer w-[200px]" onClick={() => onPinClick(item)}>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      className="w-full h-28 object-cover"
                      alt="preview"
                    />
                  )}
                  <div className="p-2.5 space-y-1 bg-white">
                    <p className="text-sm font-black text-gray-900 leading-tight">
                      CVE {item.price?.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-medium text-gray-700 truncate">
                      {item.title || 'Property'}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
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
                    <p className="text-[10px] text-gray-500 truncate">
                      {item.neighborhood || 'Cape Verde'}
                    </p>
                    {item.seller_phone && (
                      <a
                        href={`https://wa.me/${item.seller_phone.replace(/[^\d+]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in: ${item.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1.5 text-center text-[10px] font-bold text-white bg-emerald-500 rounded-md py-1 px-2 hover:bg-emerald-600 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        WhatsApp Seller
                      </a>
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
