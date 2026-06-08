"use client";

import { useState, useEffect } from "react";
import { MapPin, Layers, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MapboxPropertyMap from "./MapboxPropertyMap";
import PropertyBoundariesMap from "./PropertyBoundariesMap";
import AdvancedMapSearch from "./AdvancedMapSearch";
import InteractiveDrawMap from "./InteractiveDrawMap";
import SimpleMapSearch from "./SimpleMapSearch";

// Sample property data for map
const mapProperties: PropertyData[] = [
  {
    property_id: "1",
    title: "Modern Beachfront Villa",
    price: 450000,
    island: "Sal",
    property_type: "Villa",
    total_area: 280,
    bedrooms: 4,
    bathrooms: 3,
    zone_type: "tourist_residential",
    investment_rating: "A+",
    beach_distance: 50,
    features: ["ocean_view", "private_pool", "garage"]
  },
  {
    property_id: "2",
    title: "City Center Apartment",
    price: 180000,
    island: "Santiago",
    property_type: "Apartment",
    total_area: 95,
    bedrooms: 2,
    bathrooms: 2,
    zone_type: "urban_center",
    investment_rating: "B+",
    features: ["city_view", "parking"]
  },
  {
    property_id: "3",
    title: "Luxury Ocean View Penthouse",
    price: 680000,
    island: "São Vicente",
    property_type: "Penthouse",
    total_area: 220,
    bedrooms: 3,
    bathrooms: 3,
    zone_type: "premium_residential",
    investment_rating: "A+",
    beach_distance: 200,
    features: ["ocean_view", "roof_terrace", "elevator"]
  }
];

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  island: string;
  type: string;
  coordinates: number[];
  bedrooms: number;
  bathrooms: number;
  area: number;
}

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

interface PropertyMapProps {
  onPropertySelect?: (property: PropertyData) => void;
  selectedProperty?: string | null;
}

export default function PropertyMap({ onPropertySelect, selectedProperty }: PropertyMapProps) {
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>(mapProperties);
  const [selectedIsland, setSelectedIsland] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [mapMode, setMapMode] = useState<'basic' | 'boundaries' | 'search' | 'draw'>('basic');

  // Filter properties based on current filters
  useEffect(() => {
    let filtered = mapProperties;

    if (selectedIsland !== "all") {
      filtered = filtered.filter(p => p.island === selectedIsland);
    }

    if (propertyType !== "all") {
      filtered = filtered.filter(p => p.property_type === propertyType);
    }

    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter(p => {
        if (max) {
          return p.price >= min && p.price <= max;
        } else {
          return p.price >= min;
        }
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.island.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
  }, [selectedIsland, priceRange, propertyType, searchQuery]);

  const clearFilters = () => {
    setSelectedIsland("all");
    setPriceRange("all");
    setPropertyType("all");
    setSearchQuery("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Map Filters Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Map Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium">Search Location</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Island Filter */}
            <div>
              <label className="text-sm font-medium">Island</label>
              <Select value={selectedIsland} onValueChange={setSelectedIsland}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Islands</SelectItem>
                  <SelectItem value="Santiago">Santiago</SelectItem>
                  <SelectItem value="Sal">Sal</SelectItem>
                  <SelectItem value="São Vicente">São Vicente</SelectItem>
                  <SelectItem value="Boa Vista">Boa Vista</SelectItem>
                  <SelectItem value="Santo Antão">Santo Antão</SelectItem>
                  <SelectItem value="Fogo">Fogo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Type Filter */}
            <div>
              <label className="text-sm font-medium">Property Type</label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Penthouse">Penthouse</SelectItem>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="text-sm font-medium">Price Range</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-100000">€0 - €100k</SelectItem>
                  <SelectItem value="100000-200000">€100k - €200k</SelectItem>
                  <SelectItem value="200000-400000">€200k - €400k</SelectItem>
                  <SelectItem value="400000-600000">€400k - €600k</SelectItem>
                  <SelectItem value="600000">€600k+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={clearFilters} className="w-full">
              Clear All Filters
            </Button>

            <div className="text-sm text-gray-500 text-center">
              {filteredProperties.length} properties found
            </div>
          </CardContent>
        </Card>

        {/* Property List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredProperties.map((property) => (
            <Card
              key={property.property_id}
              className={`cursor-pointer transition-all ${
                selectedProperty === property.property_id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : hoveredProperty === property.property_id
                    ? 'bg-gray-50'
                    : ''
              }`}
              onClick={() => onPropertySelect?.(property)}
              onMouseEnter={() => setHoveredProperty(property.property_id)}
              onMouseLeave={() => setHoveredProperty(null)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm">{property.title}</h3>
                  <Badge variant="secondary" className="text-xs">{property.island}</Badge>
                </div>
                <div className="flex items-center text-gray-600 text-xs mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{property.property_type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-600">€{property.price.toLocaleString()}</span>
                  <div className="text-xs text-gray-500">
                    {property.bedrooms}bed • {property.bathrooms}bath • {property.total_area}m²
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Real Interactive Map Display */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Cape Verde Properties Map
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={mapMode === 'basic' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMapMode('basic')}
                >
                  Basic Map
                </Button>
                <Button
                  variant={mapMode === 'boundaries' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMapMode('boundaries')}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Boundaries
                </Button>
                <Button
                  variant={mapMode === 'search' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMapMode('search')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Areas
                </Button>
                <Button
                  variant={mapMode === 'draw' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMapMode('draw')}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Draw Areas
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full p-4">
            {mapMode === 'basic' && (
              <MapboxPropertyMap
                onPropertySelect={onPropertySelect}
                selectedProperty={selectedProperty}
                className="rounded-lg border"
              />
            )}
            {mapMode === 'boundaries' && (
              <PropertyBoundariesMap
                onPropertySelect={onPropertySelect}
                selectedProperty={selectedProperty}
                className="rounded-lg border"
              />
            )}
            {mapMode === 'search' && (
              <SimpleMapSearch
                className="rounded-lg border"
              />
            )}
            {mapMode === 'draw' && (
              <InteractiveDrawMap
                onAreaCreated={(area) => {
                  console.log('Area created:', area);
                }}
                onPropertiesFound={(properties) => {
                  console.log('Properties in drawn area:', properties);
                }}
                className="rounded-lg border"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
