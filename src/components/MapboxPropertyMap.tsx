"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { MapPin, Bed, Bath, Maximize } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Types
interface PropertyData {
  property_id: string;
  title: string;
  price: number;
  property_type: string;
  island: string;
  total_area: number;
  bedrooms: number;
  bathrooms: number;
  zone_type: string;
  investment_rating: string;
  beach_distance?: number;
  features: string[];
  image: string;
  location: string;
  coordinates: [number, number];
  description: string;
}

interface MapboxPropertyMapProps {
  properties?: PropertyData[];
  onPropertySelect?: (property: PropertyData) => void;
  onPropertyHover?: (property: PropertyData | null) => void;
  selectedProperty?: string | null;
  hoveredProperty?: string | null;
  initialCenter?: [number, number] | null;
  initialZoom?: number | null;
  className?: string;
}

// Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  'process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

// Default properties
const defaultProperties: PropertyData[] = [
  {
    property_id: "1",
    title: "Modern Beachfront Villa",
    price: 450000,
    property_type: "Villa",
    island: "Sal",
    total_area: 280,
    bedrooms: 4,
    bathrooms: 3,
    zone_type: "tourist_residential",
    investment_rating: "A+",
    beach_distance: 50,
    features: ["ocean_view", "private_pool", "garage"],
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300&h=200&fit=crop",
    location: "Santa Maria, Sal",
    coordinates: [-22.9018, 16.5897],
    description: "Stunning modern villa with direct beach access"
  }
];

export default function MapboxPropertyMap({
  properties = defaultProperties,
  onPropertySelect,
  selectedProperty,
  initialCenter,
  initialZoom,
  className = ""
}: MapboxPropertyMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [MapComponents, setMapComponents] = useState<Record<string, React.ComponentType<any>> | null>(null);
  const [selectedPin, setSelectedPin] = useState<PropertyData | null>(null);
  const [viewState, setViewState] = useState({
    longitude: initialCenter?.[0] ?? -23.6045,
    latitude: initialCenter?.[1] ?? 15.1208,
    zoom: initialZoom ?? 8.5
  });

  // Load react-map-gl dynamically
  useEffect(() => {
    let mounted = true;

    const loadMap = async () => {
      try {
        // First check if we're in a browser environment
        if (typeof window === 'undefined') {
          return;
        }

        const mapgl = await import('react-map-gl');
        if (mounted) {
          setMapComponents({
            Map: mapgl.default,
            Marker: mapgl.Marker,
            Popup: mapgl.Popup,
            NavigationControl: mapgl.NavigationControl
          });
          setMapReady(true);
        }
      } catch (err) {
        console.error('Failed to load map:', err);
        if (mounted) {
          setMapError('Failed to load map. Please refresh the page.');
        }
      }
    };

    // Small delay to ensure client-side rendering
    const timer = setTimeout(loadMap, 100);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Update view when props change
  useEffect(() => {
    if (initialCenter || initialZoom) {
      setViewState(prev => ({
        longitude: initialCenter?.[0] ?? prev.longitude,
        latitude: initialCenter?.[1] ?? prev.latitude,
        zoom: initialZoom ?? prev.zoom
      }));
    }
  }, [initialCenter, initialZoom]);

  const handleMarkerClick = useCallback((property: PropertyData) => {
    setSelectedPin(property);
  }, []);

  const handlePopupClose = useCallback(() => {
    setSelectedPin(null);
  }, []);

  const handleViewDetails = useCallback((property: PropertyData) => {
    onPropertySelect?.(property);
    setSelectedPin(null);
  }, [onPropertySelect]);

  // Error state
  if (mapError) {
    return (
      <div className={`relative h-full rounded-lg overflow-hidden bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Map could not be loaded</p>
          <p className="text-red-500 text-sm">{mapError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!mapReady || !MapComponents) {
    return (
      <div className={`relative h-full rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-600 font-medium">Loading Map...</p>
        </div>
      </div>
    );
  }

  const { Map, Marker, Popup, NavigationControl } = MapComponents;

  return (
    <div className={`relative h-full rounded-lg overflow-hidden ${className}`}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        maxZoom={18}
        minZoom={5}
      >
        <NavigationControl position="top-right" />

        {/* Property Markers */}
        {properties.map((property) => (
          <Marker
            key={property.property_id}
            longitude={property.coordinates[0]}
            latitude={property.coordinates[1]}
            anchor="center"
            onClick={() => handleMarkerClick(property)}
          >
            <div
              className={`cursor-pointer transition-transform hover:scale-125 ${
                selectedProperty === property.property_id ? 'scale-125' : ''
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                selectedProperty === property.property_id
                  ? 'bg-blue-600'
                  : 'bg-red-500'
              }`} />
            </div>
          </Marker>
        ))}

        {/* Popup */}
        {selectedPin && (
          <Popup
            longitude={selectedPin.coordinates[0]}
            latitude={selectedPin.coordinates[1]}
            anchor="bottom"
            onClose={handlePopupClose}
            closeButton={true}
            closeOnClick={false}
          >
            <Card
              className="w-56 cursor-pointer hover:shadow-md transition-shadow border-0"
              onClick={() => handleViewDetails(selectedPin)}
            >
              <CardContent className="p-3">
                <img
                  src={selectedPin.image}
                  alt={selectedPin.title}
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-blue-600">
                      €{selectedPin.price.toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {selectedPin.island}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm line-clamp-1">
                    {selectedPin.title}
                  </h4>
                  <div className="flex items-center text-gray-500 text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedPin.location}
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Bed className="h-3 w-3" /> {selectedPin.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-3 w-3" /> {selectedPin.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize className="h-3 w-3" /> {selectedPin.total_area}m²
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Popup>
        )}
      </Map>
    </div>
  );
}
