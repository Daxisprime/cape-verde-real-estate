"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, MapPin, Pentagon, Trash2, Save, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from 'next/dynamic';
import { capeVerdeProperties } from '@/data/cape-verde-properties';

// Dynamically import Map and Draw components
const Map = dynamic(() => import('react-map-gl').then(mod => mod.default), { ssr: false });
const Source = dynamic(() => import('react-map-gl').then(mod => mod.Source), { ssr: false });
const Layer = dynamic(() => import('react-map-gl').then(mod => mod.Layer), { ssr: false });
const NavigationControl = dynamic(() => import('react-map-gl').then(mod => mod.NavigationControl), { ssr: false });

// Cape Verde neighborhoods and districts data
const capeVerdeNeighborhoods = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: {
        name: 'Santa Maria Tourist Zone',
        island: 'Sal',
        type: 'tourist_district',
        property_count: 45,
        avg_price: 420000
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-22.910, 16.600],
          [-22.895, 16.600],
          [-22.895, 16.585],
          [-22.910, 16.585],
          [-22.910, 16.600]
        ]]
      }
    },
    {
      type: 'Feature' as const,
      properties: {
        name: 'Praia City Center',
        island: 'Santiago',
        type: 'urban_center',
        property_count: 78,
        avg_price: 185000
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-23.525, 14.930],
          [-23.505, 14.930],
          [-23.505, 14.910],
          [-23.525, 14.910],
          [-23.525, 14.930]
        ]]
      }
    },
    {
      type: 'Feature' as const,
      properties: {
        name: 'Mindelo Cultural District',
        island: 'São Vicente',
        type: 'cultural_district',
        property_count: 32,
        avg_price: 320000
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-25.005, 16.885],
          [-24.985, 16.885],
          [-24.985, 16.865],
          [-25.005, 16.865],
          [-25.005, 16.885]
        ]]
      }
    }
  ]
};

interface AdvancedMapSearchProps {
  onPropertiesFound?: (properties: typeof capeVerdeProperties) => void;
  className?: string;
}

export default function AdvancedMapSearch({
  onPropertiesFound,
  className = ""
}: AdvancedMapSearchProps) {

  const [viewState, setViewState] = useState({
    longitude: -23.6045,
    latitude: 15.1208,
    zoom: 8.5
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnAreas, setDrawnAreas] = useState<Array<{
    id: string;
    name: string;
    geometry: {
      type: string;
      coordinates: number[][][];
    };
  }>>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [filteredProperties, setFilteredProperties] = useState<typeof capeVerdeProperties>([]);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; place_name: string; center: [number, number]; place_type: string[] }>>([]);
  const [isMounted, setIsMounted] = useState(false);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Geocoding search function
  const handleLocationSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?country=CV&access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;

        // Fly to location
        setViewState({
          longitude: lng,
          latitude: lat,
          zoom: 12
        });

        setSearchResults(data.features);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }, [searchQuery, MAPBOX_TOKEN]);

  // Handle Enter key in search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLocationSearch();
    }
  };

  // Search properties in neighborhood
  const searchInNeighborhood = useCallback((neighborhoodName: string) => {
    setSelectedNeighborhood(neighborhoodName);

    // In a real app, this would do spatial query
    // For demo, we'll show relevant properties
    const relevant = capeVerdeProperties.filter(property => {
      const island = property.island;
      return neighborhoodName.toLowerCase().includes(island.toLowerCase());
    });

    setFilteredProperties(relevant);
    onPropertiesFound?.(relevant);
  }, [onPropertiesFound]);

  // Clear all search results
  const clearSearch = () => {
    setSearchQuery("");
    setSelectedNeighborhood(null);
    setFilteredProperties([]);
    setSearchResults([]);
    setDrawnAreas([]);
  };

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('example-token')) {
    return (
      <Card className={`h-[600px] flex items-center justify-center ${className}`}>
        <CardContent className="text-center">
          <MapPin className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h3 className="font-bold mb-2">Advanced Search Ready!</h3>
          <p className="text-gray-600">Add Mapbox token to enable location search</p>
        </CardContent>
      </Card>
    );
  }

  if (!isMounted) {
    return (
      <div className={`h-[600px] bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <MapPin className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Advanced Property Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Search */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Santa Maria, Praia, Mindelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleLocationSearch}>
              Search Location
            </Button>
          </div>

          {/* Quick Neighborhood Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">Popular Areas</label>
            <div className="flex flex-wrap gap-2">
              {capeVerdeNeighborhoods.features.map((neighborhood) => (
                <Button
                  key={neighborhood.properties.name}
                  variant={selectedNeighborhood === neighborhood.properties.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => searchInNeighborhood(neighborhood.properties.name)}
                >
                  {neighborhood.properties.name}
                  <Badge variant="secondary" className="ml-2">
                    {neighborhood.properties.property_count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Search Results Summary */}
          {(filteredProperties.length > 0 || selectedNeighborhood) && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-blue-900">
                    {filteredProperties.length} properties found
                  </strong>
                  {selectedNeighborhood && (
                    <div className="text-sm text-blue-700">
                      in {selectedNeighborhood}
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={clearSearch}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Search Results List */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Results</label>
              {searchResults.slice(0, 3).map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    const [lng, lat] = result.center;
                    setViewState({ longitude: lng, latitude: lat, zoom: 14 });
                  }}
                >
                  <div>
                    <div className="font-medium">{result.place_name}</div>
                    <div className="text-sm text-gray-500">{result.place_type}</div>
                  </div>
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Display */}
      <Card>
        <CardContent className="p-0">
          <div className="relative h-[500px] rounded-lg overflow-hidden">
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
              >
                {/* Neighborhood Boundaries */}
                {Source && (
                  <Source
                    id="neighborhoods"
                    type="geojson"
                    data={capeVerdeNeighborhoods}
                  >
                    <Layer
                      id="neighborhood-fills"
                      type="fill"
                      paint={{
                        'fill-color': [
                          'case',
                          ['==', ['get', 'name'], selectedNeighborhood || ''],
                          '#3498db', // Selected neighborhood
                          '#e8f4fd' // Default
                        ],
                        'fill-opacity': [
                          'case',
                          ['==', ['get', 'name'], selectedNeighborhood || ''],
                          0.6,
                          0.3
                        ]
                      }}
                    />
                    <Layer
                      id="neighborhood-borders"
                      type="line"
                      paint={{
                        'line-color': '#2980b9',
                        'line-width': 2
                      }}
                    />
                  </Source>
                )}

                {/* Property Points */}
                {Source && filteredProperties.length > 0 && (
                  <Source
                    id="filtered-properties"
                    type="geojson"
                    data={{
                      type: 'FeatureCollection' as const,
                      features: filteredProperties.map(property => ({
                        type: 'Feature' as const,
                        properties: {
                          id: property.id,
                          title: property.title,
                          price: property.price,
                          island: property.island,
                          type: property.type,
                          bedrooms: property.bedrooms,
                          bathrooms: property.bathrooms
                        },
                        geometry: {
                          type: 'Point' as const,
                          coordinates: [property.coordinates[0], property.coordinates[1]]
                        }
                      }))
                    }}
                  >
                    <Layer
                      id="property-points"
                      type="circle"
                      paint={{
                        'circle-color': '#e74c3c',
                        'circle-radius': 8,
                        'circle-stroke-color': '#fff',
                        'circle-stroke-width': 2
                      }}
                    />
                  </Source>
                )}

                {NavigationControl && <NavigationControl position="top-right" />}
              </Map>
            )}

            {/* Map Instructions */}
            <div className="absolute top-4 left-4 bg-white/95 rounded-lg p-3 text-sm shadow-lg border max-w-xs">
              <div className="font-bold text-blue-900 mb-2">🔍 Search Features</div>
              <div className="text-gray-700 space-y-1 text-xs">
                <div>• <strong>Search locations:</strong> Type city/area names</div>
                <div>• <strong>Click neighborhoods:</strong> Quick area search</div>
                <div>• <strong>View results:</strong> Properties highlighted in red</div>
                <div>• <strong>Clear search:</strong> Reset to see all areas</div>
              </div>
            </div>

            {/* Property Counter */}
            {filteredProperties.length > 0 && (
              <div className="absolute bottom-4 right-4 bg-white/95 rounded-lg p-3 text-sm shadow-lg border">
                <div className="font-bold text-blue-600">
                  📍 {filteredProperties.length} Properties Found
                </div>
                <div className="text-gray-700 text-xs">
                  {selectedNeighborhood && `in ${selectedNeighborhood}`}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
