"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, MapPin, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import dynamic from 'next/dynamic';

// Dynamic imports for Map components to prevent SSR issues
const Map = dynamic(() => import('react-map-gl').then(mod => mod.default), { ssr: false });
const NavigationControl = dynamic(() => import('react-map-gl').then(mod => mod.NavigationControl), { ssr: false });

interface SimpleMapSearchProps {
  className?: string;
}

export default function SimpleMapSearch({ className = "" }: SimpleMapSearchProps) {
  const [viewState, setViewState] = useState({
    longitude: -23.6045,
    latitude: 15.1208,
    zoom: 8.5
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    place_name: string;
    center: [number, number];
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simple search function
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !MAPBOX_TOKEN || MAPBOX_TOKEN.includes('example-token')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?country=CV&access_token=${MAPBOX_TOKEN}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const [lng, lat] = feature.center;

          setViewState({
            longitude: lng,
            latitude: lat,
            zoom: 12
          });

          setSearchResults(data.features.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, MAPBOX_TOKEN]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('example-token')) {
    return (
      <Card className={`h-[600px] flex items-center justify-center ${className}`}>
        <CardContent className="text-center">
          <MapPin className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h3 className="font-bold mb-2">Map Search Ready!</h3>
          <p className="text-gray-600">Add Mapbox token to enable location search</p>
        </CardContent>
      </Card>
    );
  }

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
    <div className={`space-y-4 ${className}`}>
      {/* Simple Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Location Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Santa Maria, Praia, Mindelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 text-gray-900 placeholder-gray-500"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Quick Locations */}
          <div>
            <label className="text-sm font-medium mb-2 block">Quick Search</label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Santa Maria", coords: [-22.9018, 16.5897] },
                { name: "Praia", coords: [-23.5133, 14.9177] },
                { name: "Mindelo", coords: [-24.9956, 16.8755] }
              ].map((location) => (
                <Button
                  key={location.name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewState({
                      longitude: location.coords[0],
                      latitude: location.coords[1],
                      zoom: 12
                    });
                  }}
                >
                  {location.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Found Locations</label>
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    const [lng, lat] = result.center;
                    setViewState({ longitude: lng, latitude: lat, zoom: 14 });
                  }}
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">{result.place_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simple Map */}
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
                maxZoom={16}
                minZoom={6}
              >
                {NavigationControl && <NavigationControl position="top-right" />}
              </Map>
            )}

            {/* Instructions */}
            <div className="absolute top-4 left-4 bg-white/95 rounded-lg p-3 text-sm shadow-lg border">
              <div className="font-bold text-blue-900 mb-2">🗺️ Location Search</div>
              <div className="text-gray-700 space-y-1 text-xs">
                <div>• <strong>Search locations:</strong> Type city names</div>
                <div>• <strong>Quick buttons:</strong> Jump to major cities</div>
                <div>• <strong>Click results:</strong> Navigate to location</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
