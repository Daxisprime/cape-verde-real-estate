"use client";

import React, { useState, useCallback, useMemo } from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMountedState } from "@/lib/mounting";
import dynamic from 'next/dynamic';

// Dynamically import Map components to avoid SSR issues
const Map = dynamic(() => import('react-map-gl').then(mod => mod.default), { ssr: false });
const Marker = dynamic(() => import('react-map-gl').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-map-gl').then(mod => mod.Popup), { ssr: false });
const NavigationControl = dynamic(() => import('react-map-gl').then(mod => mod.NavigationControl), { ssr: false });

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

// Default Cape Verde property data with real coordinates
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
    description: "Stunning modern villa with direct beach access and panoramic ocean views"
  },
  {
    property_id: "2",
    title: "City Center Apartment",
    price: 180000,
    property_type: "Apartment",
    island: "Santiago",
    total_area: 95,
    bedrooms: 2,
    bathrooms: 2,
    zone_type: "urban_center",
    investment_rating: "B+",
    features: ["city_view", "parking"],
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop",
    location: "Praia, Santiago",
    coordinates: [-23.5133, 14.9177],
    description: "Modern apartment in the heart of Cape Verde's capital city"
  },
  {
    property_id: "3",
    title: "Ocean View Penthouse",
    price: 680000,
    property_type: "Penthouse",
    island: "São Vicente",
    total_area: 220,
    bedrooms: 3,
    bathrooms: 3,
    zone_type: "premium_residential",
    investment_rating: "A+",
    beach_distance: 200,
    features: ["ocean_view", "roof_terrace", "elevator"],
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300&h=200&fit=crop",
    location: "Mindelo, São Vicente",
    coordinates: [-24.9956, 16.8755],
    description: "Luxury penthouse with panoramic views"
  }
];

// Instructions component for when token is not available
function MapboxInstructionsCard({ className }: { className?: string }) {
  return (
    <Card className={`h-[600px] flex items-center justify-center ${className}`}>
      <CardContent className="text-center max-w-md">
        <div className="mb-4">
          <MapPin className="h-16 w-16 mx-auto text-blue-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">Real Map Integration Ready!</h3>
          <p className="text-gray-600 mb-4">
            To enable the interactive Mapbox map with zoom functionality:
          </p>
        </div>

        <div className="text-left space-y-3 mb-6">
          <div className="bg-gray-50 p-3 rounded">
            <strong>1. Get Mapbox Token:</strong>
            <br />
            <a
              href="https://www.mapbox.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Sign up at mapbox.com
            </a>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <strong>2. Add to .env.local:</strong>
            <br />
            <code className="text-xs bg-gray-100 p-1 rounded">
              NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
            </code>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <strong>3. Restart dev server:</strong>
            <br />
            <code className="text-xs bg-gray-100 p-1 rounded">
              bun run dev
            </code>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm text-blue-800">
            <strong>Features Ready:</strong> Real Cape Verde geography, property markers,
            zoom controls, satellite view, hover cards, and interactive property selection!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Main map component
export default function MapboxPropertyMap({
  properties = defaultProperties,
  onPropertySelect,
  onPropertyHover,
  selectedProperty,
  hoveredProperty,
  initialCenter,
  initialZoom,
  className = ""
}: MapboxPropertyMapProps) {
  // Map state
  const [viewState, setViewState] = useState({
    longitude: initialCenter ? initialCenter[0] : -23.6045,
    latitude: initialCenter ? initialCenter[1] : 15.1208,
    zoom: initialZoom || 8.5
  });

  const [popupInfo, setPopupInfo] = useState<PropertyData | null>(null);
  const isMounted = useMountedState();

  // Update viewState when initialCenter or initialZoom changes
  React.useEffect(() => {
    if (initialCenter || initialZoom) {
      setViewState(prev => ({
        ...prev,
        longitude: initialCenter ? initialCenter[0] : prev.longitude,
        latitude: initialCenter ? initialCenter[1] : prev.latitude,
        zoom: initialZoom || prev.zoom
      }));
    }
  }, [initialCenter, initialZoom]);

  // Get Mapbox token from environment
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Callback for marker clicks - only show popup
  const onMarkerClick = useCallback((property: PropertyData) => {
    setPopupInfo(property);
  }, []);

  // Callback for popup view button - open modal
  const onPopupViewClick = useCallback((property: PropertyData) => {
    onPropertySelect?.(property);
  }, [onPropertySelect]);

  // Handle marker hover - only for external callback, no visual hover
  const onMarkerHover = useCallback((property: PropertyData | null) => {
    onPropertyHover?.(property);
  }, [onPropertyHover]);

  // Memoized markers
  const markers = useMemo(() => {
    if (!Map || !Marker) return null;

    return properties.map((property) => {
      const isSelected = selectedProperty === property.property_id;

      return (
        <Marker
          key={property.property_id}
          longitude={property.coordinates[0]}
          latitude={property.coordinates[1]}
          anchor="bottom"
        >
          <div
            className={`cursor-pointer transition-all transform ${
              isSelected ? 'scale-125 z-50' : 'scale-100 z-30'
            }`}
            onClick={() => onMarkerClick(property)}
          >
            <div className={`px-3 py-2 rounded-full shadow-lg border-2 border-white text-xs font-bold transition-all ${
              isSelected
                ? 'bg-red-600 text-white ring-4 ring-red-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}>
              €{Math.round(property.price / 1000)}k
            </div>
          </div>
        </Marker>
      );
    });
  }, [properties, selectedProperty, onMarkerClick]);

  // Show instructions if no token is provided
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('example-token')) {
    return <MapboxInstructionsCard className={className} />;
  }

  // Show loading state for SSR
  if (!isMounted) {
    return (
      <div className={`h-[600px] bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full rounded-lg overflow-hidden ${className}`}>
      {Map && (
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          cursor="grab"
          maxZoom={16}
          minZoom={6}
        >
          {/* Property Markers */}
          {markers}

          {/* Pin Popup - EXACTLY like sidebar cards but smaller */}
          {popupInfo && Popup && (
            <Popup
              longitude={popupInfo.coordinates[0]}
              latitude={popupInfo.coordinates[1]}
              anchor="bottom"
              onClose={() => setPopupInfo(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <Card
                className="cursor-pointer transition-all hover:shadow-md w-56"
                onClick={() => onPopupViewClick(popupInfo)}
              >
                <CardContent className="p-3">
                  {/* Property Image - SAME AS SIDEBAR */}
                  <div className="mb-3">
                    <img
                      src={popupInfo.image}
                      alt={popupInfo.title}
                      className="w-full h-28 object-cover rounded"
                    />
                  </div>

                  {/* Property Info - EXACTLY LIKE SIDEBAR */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-blue-600 text-base">€{popupInfo.price.toLocaleString()}</span>
                      <Badge variant="secondary" className="text-xs">{popupInfo.island}</Badge>
                    </div>

                    <h4 className="font-semibold text-sm line-clamp-2">{popupInfo.title}</h4>

                    <div className="flex items-center text-gray-600 text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{popupInfo.location}</span>
                    </div>

                    <div className="flex gap-3 text-xs text-gray-500">
                      {popupInfo.bedrooms > 0 && <span>{popupInfo.bedrooms} bed</span>}
                      {popupInfo.bathrooms > 0 && <span>{popupInfo.bathrooms} bath</span>}
                      <span>{popupInfo.total_area}m²</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Popup>
          )}

          {/* Map Controls */}
          {NavigationControl && <NavigationControl position="top-right" />}
        </Map>
      )}
    </div>
  );
}
