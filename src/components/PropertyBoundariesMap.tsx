"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { MapPin, Layers, Home, DollarSign, MapIcon, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import dynamic from 'next/dynamic';
import { capeVerdeProperties, capeVerdePropertiesDataset, priceZonesDataset, beachProximityDataset } from '@/data/cape-verde-properties';
import type { MapLayerMouseEvent } from 'react-map-gl';

// Dynamically import Map components
const Map = dynamic(() => import('react-map-gl').then(mod => mod.default), { ssr: false });
const Source = dynamic(() => import('react-map-gl').then(mod => mod.Source), { ssr: false });
const Layer = dynamic(() => import('react-map-gl').then(mod => mod.Layer), { ssr: false });
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
}

interface PropertyBoundariesMapProps {
  onPropertySelect?: (property: PropertyData) => void;
  selectedProperty?: string | null;
  className?: string;
}

export default function PropertyBoundariesMap({
  onPropertySelect,
  selectedProperty,
  className = ""
}: PropertyBoundariesMapProps) {

  const [viewState, setViewState] = useState({
    longitude: -23.6045,
    latitude: 15.1208,
    zoom: 8.5
  });

  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [clickedProperty, setClickedProperty] = useState<PropertyData | null>(null);
  const [showPriceZones, setShowPriceZones] = useState(false);
  const [showBeachZones, setShowBeachZones] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle property clicks
  const onMapClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (feature && feature.source === 'properties') {
      setClickedProperty(feature.properties as PropertyData);
      onPropertySelect?.(feature.properties as PropertyData);
    }
  }, [onPropertySelect]);

  // Handle hover effects
  const onMapHover = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (feature && feature.source === 'properties') {
      setHoveredProperty((feature.properties as PropertyData).property_id);
    } else {
      setHoveredProperty(null);
    }
  }, []);

  // Show instructions if no token
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('example-token')) {
    return (
      <Card className={`h-[600px] flex items-center justify-center ${className}`}>
        <CardContent className="text-center max-w-md">
          <MapPin className="h-16 w-16 mx-auto text-blue-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">Real Map Integration Ready!</h3>
          <p className="text-gray-600 mb-4">Add your Mapbox token to see property boundaries!</p>
        </CardContent>
      </Card>
    );
  }

  // Client-side loading state
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
    <div className={`relative h-[600px] rounded-lg overflow-hidden ${className}`}>
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <Button
          variant={showPriceZones ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowPriceZones(!showPriceZones)}
          className="bg-white/90 text-gray-900 hover:bg-white"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Price Zones
        </Button>
        <Button
          variant={showBeachZones ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowBeachZones(!showBeachZones)}
          className="bg-white/90 text-gray-900 hover:bg-white"
        >
          <MapIcon className="h-4 w-4 mr-2" />
          Beach Access
        </Button>
      </div>

      {Map && (
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          cursor="grab"
          maxZoom={18}
          minZoom={6}
          onClick={onMapClick}
          onMouseMove={onMapHover}
          interactiveLayerIds={['property-boundaries-fill', 'property-boundaries-line']}
        >
          {/* Property Boundaries Source */}
          {Source && (
            <Source
              id="properties"
              type="geojson"
              data={capeVerdePropertiesDataset}
            >
              {/* Property boundary fills */}
              <Layer
                id="property-boundaries-fill"
                type="fill"
                paint={{
                  'fill-color': [
                    'case',
                    ['==', ['get', 'property_id'], hoveredProperty || ''],
                    '#ff6b6b', // Hovered property
                    ['==', ['get', 'property_id'], selectedProperty || ''],
                    '#e74c3c', // Selected property
                    [
                      'match',
                      ['get', 'property_type'],
                      'villa', '#3498db',
                      'apartment', '#2ecc71',
                      'penthouse', '#9b59b6',
                      'condo', '#f39c12',
                      '#95a5a6' // default
                    ]
                  ],
                  'fill-opacity': [
                    'case',
                    ['==', ['get', 'property_id'], hoveredProperty || ''],
                    0.8, // More opaque when hovered
                    0.5
                  ]
                }}
              />

              {/* Property boundary lines */}
              <Layer
                id="property-boundaries-line"
                type="line"
                paint={{
                  'line-color': [
                    'case',
                    ['==', ['get', 'property_id'], hoveredProperty || ''],
                    '#c0392b', // Darker when hovered
                    ['==', ['get', 'property_id'], selectedProperty || ''],
                    '#a93226', // Darker when selected
                    '#34495e'
                  ],
                  'line-width': [
                    'case',
                    ['==', ['get', 'property_id'], hoveredProperty || ''],
                    3, // Thicker when hovered
                    2
                  ]
                }}
              />
            </Source>
          )}

          {/* Price Zones Layer */}
          {showPriceZones && Source && (
            <Source
              id="price-zones"
              type="geojson"
              data={priceZonesDataset}
            >
              <Layer
                id="price-zones-fill"
                type="fill"
                paint={{
                  'fill-color': [
                    'match',
                    ['get', 'price_category'],
                    'premium', '#e74c3c',
                    'high', '#f39c12',
                    'medium', '#f1c40f',
                    'low', '#2ecc71',
                    '#bdc3c7'
                  ],
                  'fill-opacity': 0.3
                }}
              />
              <Layer
                id="price-zones-line"
                type="line"
                paint={{
                  'line-color': '#34495e',
                  'line-width': 1,
                  'line-dasharray': [2, 2]
                }}
              />
            </Source>
          )}

          {/* Beach Proximity Zones */}
          {showBeachZones && Source && (
            <Source
              id="beach-zones"
              type="geojson"
              data={beachProximityDataset}
            >
              <Layer
                id="beach-zones-fill"
                type="fill"
                paint={{
                  'fill-color': [
                    'match',
                    ['get', 'zone_type'],
                    'beachfront', '#3498db',
                    'near_beach', '#5dade2',
                    '#aed6f1'
                  ],
                  'fill-opacity': 0.4
                }}
              />
            </Source>
          )}

          {/* Property Details Popup */}
          {clickedProperty && Popup && (
            <Popup
              longitude={-22.9023} // Center of clicked property (simplified)
              latitude={16.5902}
              anchor="bottom"
              onClose={() => setClickedProperty(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <div className="p-4 min-w-[300px]">
                <h3 className="font-bold text-lg mb-2">{clickedProperty.title}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-blue-600 text-xl">
                      €{clickedProperty.price.toLocaleString()}
                    </span>
                    <Badge variant="outline">{clickedProperty.property_type}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>📍 {clickedProperty.island}</div>
                    <div>🏠 {clickedProperty.total_area}m²</div>
                    <div>🛏️ {clickedProperty.bedrooms} bed</div>
                    <div>🛁 {clickedProperty.bathrooms} bath</div>
                  </div>

                  <div className="text-sm">
                    <strong>Zone:</strong> {clickedProperty.zone_type.replace('_', ' ')}
                  </div>

                  {clickedProperty.beach_distance && (
                    <div className="text-sm">
                      <strong>Beach:</strong> {clickedProperty.beach_distance}m away
                    </div>
                  )}

                  <div className="text-sm">
                    <strong>Investment:</strong>
                    <Badge className="ml-2" variant={clickedProperty.investment_rating === 'A+' ? 'default' : 'secondary'}>
                      {clickedProperty.investment_rating}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {clickedProperty.features.slice(0, 3).map((feature: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>

                  <Button size="sm" className="w-full mt-3">
                    View Full Details
                  </Button>
                </div>
              </div>
            </Popup>
          )}

          {/* Navigation Controls */}
          {NavigationControl && <NavigationControl position="top-right" />}
        </Map>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg p-3 text-xs shadow-lg border">
        <div className="font-bold mb-2 text-blue-600">Property Boundaries</div>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span>Villa</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>Apartment</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
            <span>Penthouse</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
            <span>Condo</span>
          </div>
        </div>
      </div>

      {/* Property Counter */}
      <div className="absolute bottom-4 right-4 bg-white/95 rounded-lg p-3 text-sm shadow-lg border">
        <div className="font-bold text-blue-600">🏝️ Cape Verde Properties</div>
        <div className="text-gray-700">{capeVerdePropertiesDataset.features.length} properties with boundaries</div>
        <div className="text-xs text-gray-500 mt-1">
          Click boundaries to see details
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-16 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs max-w-xs">
        <div className="font-bold text-blue-900 mb-1">🎯 New Features!</div>
        <div className="text-blue-800 space-y-1">
          <div>• <strong>Property Boundaries:</strong> See exact lot sizes</div>
          <div>• <strong>Price Zones:</strong> Toggle price heat map</div>
          <div>• <strong>Beach Access:</strong> Show proximity zones</div>
          <div>• <strong>Click Boundaries:</strong> Get property details</div>
        </div>
      </div>
    </div>
  );
}
