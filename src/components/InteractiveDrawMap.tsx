"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Pentagon, Trash2, Save, Search, MapPin, Edit3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import dynamic from 'next/dynamic';

// Dynamic imports for Map components
const Map = dynamic(() => import('react-map-gl').then(mod => mod.default), { ssr: false });
const Source = dynamic(() => import('react-map-gl').then(mod => mod.Source), { ssr: false });
const Layer = dynamic(() => import('react-map-gl').then(mod => mod.Layer), { ssr: false });
const NavigationControl = dynamic(() => import('react-map-gl').then(mod => mod.NavigationControl), { ssr: false });

interface DrawnArea {
  id: string;
  name: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  propertyCount: number;
  avgPrice: number;
}

interface InteractiveDrawMapProps {
  onAreaCreated?: (area: DrawnArea) => void;
  onPropertiesFound?: (properties: number) => void;
  className?: string;
}

export default function InteractiveDrawMap({
  onAreaCreated,
  onPropertiesFound,
  className = ""
}: InteractiveDrawMapProps) {
  const [viewState, setViewState] = useState({
    longitude: -23.6045,
    latitude: 15.1208,
    zoom: 8.5
  });

  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [savedAreas, setSavedAreas] = useState<DrawnArea[]>([]);
  const [areaName, setAreaName] = useState("");
  const [propertiesInArea, setPropertiesInArea] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Start drawing mode
  const startDrawing = () => {
    setDrawingMode(true);
    setDrawingPoints([]);
    setPropertiesInArea(0);
  };

  // Handle map clicks for drawing
  const handleMapClick = useCallback((event: { lngLat: { lng: number; lat: number } }) => {
    if (!drawingMode) return;

    const { lng, lat } = event.lngLat;
    const newPoints = [...drawingPoints, [lng, lat] as [number, number]];
    setDrawingPoints(newPoints);

    // Simulate finding properties (simplified)
    if (newPoints.length >= 3) {
      const mockPropertyCount = Math.floor(Math.random() * 10) + 1;
      setPropertiesInArea(mockPropertyCount);
      onPropertiesFound?.(mockPropertyCount);
    }
  }, [drawingMode, drawingPoints, onPropertiesFound]);

  // Finish drawing
  const finishDrawing = () => {
    if (drawingPoints.length >= 3) {
      setDrawingMode(false);
    }
  };

  // Save drawn area
  const saveArea = () => {
    if (drawingPoints.length < 3 || !areaName.trim()) return;

    const area: DrawnArea = {
      id: Date.now().toString(),
      name: areaName,
      geometry: {
        type: 'Polygon',
        coordinates: [[...drawingPoints, drawingPoints[0]]]
      },
      propertyCount: propertiesInArea,
      avgPrice: Math.floor(Math.random() * 300000) + 150000
    };

    setSavedAreas([...savedAreas, area]);
    onAreaCreated?.(area);
    setAreaName("");
    setDrawingPoints([]);
    setPropertiesInArea(0);
  };

  // Clear current drawing
  const clearDrawing = () => {
    setDrawingMode(false);
    setDrawingPoints([]);
    setPropertiesInArea(0);
  };

  // Delete saved area
  const deleteArea = (areaId: string) => {
    setSavedAreas(savedAreas.filter(area => area.id !== areaId));
  };

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('example-token')) {
    return (
      <Card className={`h-[600px] flex items-center justify-center ${className}`}>
        <CardContent className="text-center">
          <Edit3 className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h3 className="font-bold mb-2">Interactive Drawing Ready!</h3>
          <p className="text-gray-600">Add Mapbox token to enable area drawing</p>
        </CardContent>
      </Card>
    );
  }

  if (!isMounted) {
    return (
      <div className={`h-[600px] bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <Edit3 className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drawing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pentagon className="h-5 w-5 mr-2" />
            Draw Custom Search Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drawing Tools */}
          <div className="flex items-center space-x-2">
            {!drawingMode ? (
              <Button onClick={startDrawing} className="bg-blue-600 hover:bg-blue-700">
                <Edit3 className="h-4 w-4 mr-2" />
                Start Drawing
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button onClick={finishDrawing} variant="outline">
                  Finish Drawing
                </Button>
                <Button onClick={clearDrawing} variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Badge variant="secondary">
                  {drawingPoints.length} points
                </Badge>
              </div>
            )}
          </div>

          {/* Save Area */}
          {drawingPoints.length >= 3 && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="space-y-3">
                <div>
                  <strong className="text-green-900">
                    Area drawn! {propertiesInArea} properties found
                  </strong>
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Name this search area..."
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    className="text-gray-900"
                  />
                  <Button onClick={saveArea} disabled={!areaName.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Area
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Saved Areas */}
          {savedAreas.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Saved Search Areas</h4>
              <div className="space-y-2">
                {savedAreas.map((area) => (
                  <div key={area.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-gray-900">{area.name}</div>
                      <div className="text-sm text-gray-500">
                        {area.propertyCount} properties • Avg €{area.avgPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteArea(area.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardContent className="p-0">
          <div className="relative h-[500px] rounded-lg overflow-hidden">
            {Map && (
              <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                onClick={handleMapClick}
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                cursor={drawingMode ? "crosshair" : "grab"}
                maxZoom={18}
                minZoom={6}
              >
                {/* Drawing Points */}
                {Source && drawingPoints.length > 0 && (
                  <Source
                    id="drawing-points"
                    type="geojson"
                    data={{
                      type: 'FeatureCollection' as const,
                      features: drawingPoints.map((point, index) => ({
                        type: 'Feature' as const,
                        geometry: {
                          type: 'Point' as const,
                          coordinates: point
                        },
                        properties: { index }
                      }))
                    }}
                  >
                    <Layer
                      id="points"
                      type="circle"
                      paint={{
                        'circle-color': '#e74c3c',
                        'circle-radius': 6,
                        'circle-stroke-color': '#fff',
                        'circle-stroke-width': 2
                      }}
                    />
                  </Source>
                )}

                {NavigationControl && <NavigationControl position="top-right" />}
              </Map>
            )}

            {/* Drawing Instructions */}
            <div className="absolute top-4 left-4 bg-white/95 rounded-lg p-3 text-sm shadow-lg border max-w-xs">
              <div className="font-bold text-blue-900 mb-2">✏️ Drawing Mode</div>
              {drawingMode ? (
                <div className="text-gray-700 space-y-1 text-xs">
                  <div>• <strong>Click map:</strong> Add points to draw area</div>
                  <div>• <strong>3+ points:</strong> Creates search polygon</div>
                  <div>• <strong>Properties:</strong> Count shown automatically</div>
                  <div>• <strong>Finish:</strong> Click "Finish Drawing"</div>
                </div>
              ) : (
                <div className="text-gray-700 space-y-1 text-xs">
                  <div>• <strong>Start Drawing:</strong> Click to begin</div>
                  <div>• <strong>Custom Areas:</strong> Draw any shape</div>
                  <div>• <strong>Property Search:</strong> Find homes in area</div>
                  <div>• <strong>Save Areas:</strong> Reuse favorite searches</div>
                </div>
              )}
            </div>

            {/* Property Counter */}
            {propertiesInArea > 0 && (
              <div className="absolute bottom-4 right-4 bg-white/95 rounded-lg p-3 text-sm shadow-lg border">
                <div className="font-bold text-red-600">
                  🎯 {propertiesInArea} Properties in Area
                </div>
                <div className="text-gray-700 text-xs">
                  Click "Save Area" to keep this search
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
