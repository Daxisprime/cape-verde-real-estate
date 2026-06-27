'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
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

// Lightweight marker struct for initial payload (4 core fields + display metadata)
export interface MapMarkerLight {
  id: string;
  latitude: number;
  longitude: number;
  category?: string;
  price?: number;
  is_featured?: boolean;
  is_premium?: boolean;
  vendor_avatar?: string | null;
  title?: string;
}

// Full detail payload fetched lazily on click
export interface MapMarkerDetail {
  id: string;
  title: string;
  image_url: string;
  neighborhood: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  seller_phone?: string;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

function createPremiumPinHtml(item: MapMarkerLight, isActive: boolean): string {
  const price = item.price || 0;
  const priceLabel = formatPriceShort(price);
  const isPremium = item.is_premium || false;
  const isFeatured = item.is_featured || false;

  // Golden priority pin
  if (isPremium && isFeatured) {
    const pulseRing = `<div class="animate-ping absolute rounded-full h-full w-full bg-amber-400/30"></div>`;
    const avatarContent = item.vendor_avatar
      ? `<img src="${item.vendor_avatar}" class="w-full h-full rounded-full object-cover" />`
      : `<span class="text-[10px] font-black">${priceLabel}</span>`;

    return `<div class="relative flex items-center justify-center" style="width:48px;height:48px;">
      ${pulseRing}
      <div class="relative bg-amber-400 text-slate-900 border-2 border-amber-500 font-black text-[10px] w-12 h-12 rounded-full flex items-center justify-center shadow-xl z-10 ${isActive ? 'scale-[1.2]' : 'scale-[1.05]'}" style="transition:all 0.2s ease;">
        ${avatarContent}
      </div>
    </div>`;
  }

  // Premium animated pin with avatar
  if (isPremium) {
    const pulseRing = `<div class="animate-ping absolute rounded-full h-full w-full bg-[#0044FF]/30"></div>`;
    const avatarContent = item.vendor_avatar
      ? `<img src="${item.vendor_avatar}" class="w-full h-full rounded-full object-cover" />`
      : `<span class="text-[10px] font-black text-white">${priceLabel}</span>`;

    return `<div class="relative flex items-center justify-center" style="width:48px;height:48px;">
      ${pulseRing}
      <div class="relative bg-[#0044FF] text-white border-2 border-white font-black text-[10px] w-11 h-11 rounded-full flex items-center justify-center shadow-xl z-10 ${isActive ? 'scale-[1.2]' : 'scale-[1.05]'}" style="transition:all 0.2s ease;">
        ${avatarContent}
      </div>
    </div>`;
  }

  // Featured (non-premium) pin - vibrant amber-gold with star
  if (isFeatured) {
    return `<div class="relative flex items-center justify-center" style="width:46px;height:46px;">
      <div class="absolute inset-0 rounded-full bg-amber-400/25 animate-pulse"></div>
      <div class="relative bg-gradient-to-br from-amber-400 to-orange-500 text-white border-2 border-amber-300 font-black text-[10px] w-11 h-11 rounded-full flex items-center justify-center shadow-lg shadow-amber-300/40 z-10" style="cursor:pointer;transition:all 0.2s ease;transform:${isActive ? 'scale(1.2)' : 'scale(1.05)'};">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1" class="absolute top-0.5 right-0.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        ${priceLabel}
      </div>
    </div>`;
  }

  // Active standard pin
  if (isActive) {
    return `<div class="bg-[#0044FF] text-white border-2 border-white font-black text-[11px] w-12 h-12 rounded-full flex items-center justify-center shadow-2xl" style="cursor:pointer;transition:all 0.2s ease;transform:scale(1.15);">${priceLabel}</div>`;
  }

  // Standard free pin
  return `<div class="bg-white text-gray-800 border border-gray-200 font-bold text-[10px] w-10 h-10 rounded-full flex items-center justify-center shadow-md" style="cursor:pointer;transition:all 0.2s ease;">${priceLabel}</div>`;
}

function createPinIcon(item: MapMarkerLight, isActive: boolean): L.DivIcon {
  const isPremium = item.is_premium || false;
  const isFeatured = item.is_featured || false;
  const size = isActive || (isPremium && isFeatured) ? 48 : isPremium || isFeatured ? 44 : 40;

  return L.divIcon({
    className: 'custom-price-marker',
    html: createPremiumPinHtml(item, isActive),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}

// Bounding box watcher that reports viewport changes
function BoundsWatcher({ onBoundsChange }: { onBoundsChange: (bounds: BoundingBox) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    },
    zoomend: () => {
      const b = map.getBounds();
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    },
  });

  useEffect(() => {
    const b = map.getBounds();
    onBoundsChange({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    });
  }, [map, onBoundsChange]);

  return null;
}

function MapController({ activeItem }: { activeItem: MapMarkerLight | null }) {
  const map = useMap();
  useEffect(() => {
    if (activeItem?.latitude && activeItem?.longitude) {
      const targetLatLng = L.latLng(activeItem.latitude, activeItem.longitude);
      const bounds = map.getBounds();
      if (!bounds.contains(targetLatLng)) {
        map.flyTo(targetLatLng, map.getZoom(), { animate: true, duration: 0.8 });
      } else {
        map.panTo(targetLatLng, { animate: true, duration: 0.5 });
      }
    }
  }, [activeItem, map]);
  return null;
}

// Cluster layer managed imperatively
function ClusterLayer({
  items,
  activeItem,
  onPinClick,
  onDetailRequest,
}: {
  items: MapMarkerLight[];
  activeItem: MapMarkerLight | null;
  onPinClick: (item: MapMarkerLight) => void;
  onDetailRequest?: (item: MapMarkerLight) => void;
}) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const [clusterReady, setClusterReady] = useState(false);

  // Dynamically load leaflet.markercluster at runtime
  useEffect(() => {
    if (typeof window !== 'undefined' && !clusterReady) {
      require('leaflet.markercluster');
      setClusterReady(true);
    }
  }, [clusterReady]);

  useEffect(() => {
    if (!clusterReady) return;

    if (!clusterGroupRef.current) {
      clusterGroupRef.current = L.markerClusterGroup({
        maxClusterRadius: 60,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          let size = 36;
          let classes = 'bg-[#0044FF]/90 text-white';
          if (count > 50) { size = 52; classes = 'bg-[#0044FF] text-white'; }
          else if (count > 20) { size = 44; classes = 'bg-[#0044FF]/95 text-white'; }

          return L.divIcon({
            html: `<div class="${classes} font-bold text-xs rounded-full flex items-center justify-center shadow-lg border-2 border-white/50" style="width:${size}px;height:${size}px;">${count}</div>`,
            className: 'custom-cluster-icon',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
        },
      });
      map.addLayer(clusterGroupRef.current);
    }

    const cluster = clusterGroupRef.current;
    const existingMarkers = markersMapRef.current;
    const newIds = new Set(items.map(i => i.id));

    // Remove markers no longer in items
    existingMarkers.forEach((marker, id) => {
      if (!newIds.has(id)) {
        cluster.removeLayer(marker);
        existingMarkers.delete(id);
      }
    });

    // Add/update markers
    items.forEach(item => {
      if (!item.latitude || !item.longitude) return;
      const isActive = item.id === activeItem?.id;

      if (existingMarkers.has(item.id)) {
        const marker = existingMarkers.get(item.id)!;
        marker.setIcon(createPinIcon(item, isActive));
        marker.setZIndexOffset(isActive ? 1000 : item.is_premium ? 800 : item.is_featured ? 500 : 0);
      } else {
        const marker = L.marker([item.latitude, item.longitude], {
          icon: createPinIcon(item, isActive),
          zIndexOffset: isActive ? 1000 : item.is_premium ? 800 : item.is_featured ? 500 : 0,
        });

        marker.on('click', () => {
          onPinClick(item);
          if (onDetailRequest) onDetailRequest(item);
        });

        marker.on('mouseover', () => {
          marker.setIcon(createPinIcon(item, true));
        });

        marker.on('mouseout', () => {
          if (item.id !== activeItem?.id) {
            marker.setIcon(createPinIcon(item, false));
          }
        });

        cluster.addLayer(marker);
        existingMarkers.set(item.id, marker);
      }
    });

    return () => {};
  }, [items, activeItem, map, onPinClick, onDetailRequest, clusterReady]);

  // Update active marker icon when activeItem changes
  useEffect(() => {
    const existingMarkers = markersMapRef.current;
    existingMarkers.forEach((marker, id) => {
      const item = items.find(i => i.id === id);
      if (item) {
        const isActive = id === activeItem?.id;
        marker.setIcon(createPinIcon(item, isActive));
        marker.setZIndexOffset(isActive ? 1000 : item.is_premium ? 800 : item.is_featured ? 500 : 0);
      }
    });
  }, [activeItem, items]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
        markersMapRef.current.clear();
      }
    };
  }, [map]);

  return null;
}

const mapStyles = `
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
  .custom-cluster-icon {
    background: transparent !important;
    border: none !important;
  }
  .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large {
    background: transparent !important;
  }
  .marker-cluster {
    background-clip: padding-box;
    border-radius: 20px;
  }
  .marker-cluster div {
    width: 30px;
    height: 30px;
    margin-left: 5px;
    margin-top: 5px;
    text-align: center;
    border-radius: 15px;
    font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
  }
  .marker-cluster span {
    line-height: 30px;
  }
  .leaflet-cluster-anim .leaflet-marker-icon, .leaflet-cluster-anim .leaflet-marker-shadow {
    -webkit-transition: -webkit-transform 0.3s ease-out, opacity 0.3s ease-in;
    -moz-transition: -moz-transform 0.3s ease-out, opacity 0.3s ease-in;
    -o-transition: -o-transform 0.3s ease-out, opacity 0.3s ease-in;
    transition: transform 0.3s ease-out, opacity 0.3s ease-in;
  }
  .leaflet-cluster-spider-leg {
    -webkit-transition: -webkit-stroke-dashoffset 0.3s ease-out, -webkit-stroke-opacity 0.3s ease-in;
    -moz-transition: -moz-stroke-dashoffset 0.3s ease-out, -moz-stroke-opacity 0.3s ease-in;
    -o-transition: -o-stroke-dashoffset 0.3s ease-out, -o-stroke-opacity 0.3s ease-in;
    transition: stroke-dashoffset 0.3s ease-out, stroke-opacity 0.3s ease-in;
  }
`;

interface MapProps {
  items: MapMarkerLight[];
  activeItem: MapMarkerLight | null;
  onPinClick: (item: MapMarkerLight) => void;
  onBoundsChange?: (bounds: BoundingBox) => void;
  onDetailRequest?: (item: MapMarkerLight) => void;
}

export default function MapboxMap({ items = [], activeItem, onPinClick, onBoundsChange, onDetailRequest }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const styleId = 'map-cluster-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = mapStyles;
      document.head.appendChild(styleEl);
    }
  }, [isMounted]);

  const handleBoundsChange = useCallback((bounds: BoundingBox) => {
    if (onBoundsChange) onBoundsChange(bounds);
  }, [onBoundsChange]);

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
        <BoundsWatcher onBoundsChange={handleBoundsChange} />
        <ClusterLayer
          items={items}
          activeItem={activeItem}
          onPinClick={onPinClick}
          onDetailRequest={onDetailRequest}
        />
      </MapContainer>
    </div>
  );
}
