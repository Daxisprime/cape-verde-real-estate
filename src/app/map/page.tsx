"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Share2, Heart, Search, Filter, X, MapPin, Home, Bed, Bath, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import MapboxPropertyMap from "@/components/MapboxPropertyMap";
import PropertyDetailModal from "@/components/PropertyDetailModal";
import { capeVerdeProperties } from "@/data/cape-verde-properties";

// Convert cape verde properties to map format
const mapProperties = capeVerdeProperties.map(property => ({
  property_id: property.id,
  title: property.title,
  price: property.price,
  property_type: property.type,
  island: property.island,
  total_area: property.totalArea,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  zone_type: property.type.toLowerCase().includes('villa') ? 'luxury_residential' :
             property.type.toLowerCase().includes('apartment') ? 'urban_residential' : 'residential',
  investment_rating: property.price > 500000 ? "A+" : property.price > 300000 ? "A" : property.price > 150000 ? "B+" : "B",
  beach_distance: property.beachDistance || Math.floor(Math.random() * 2000) + 100,
  features: property.features,
  image: property.images[0],
  location: property.location,
  coordinates: property.coordinates,
  description: property.description
}));

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

function MapPageContent() {
  const searchParams = useSearchParams();
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<PropertyData | null>(null);
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>(mapProperties);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIsland, setSelectedIsland] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState<number | null>(null);

  // Handle URL parameters for property highlighting and zoom
  useEffect(() => {
    const propertyId = searchParams.get('property');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const zoom = searchParams.get('zoom');

    if (propertyId) {
      const property = mapProperties.find(p => p.property_id === propertyId);
      if (property) {
        setSelectedProperty(property);

        // Set map center and zoom if coordinates are provided
        if (lat && lng) {
          setMapCenter([parseFloat(lng), parseFloat(lat)]);
        }
        if (zoom) {
          setMapZoom(parseInt(zoom));
        }
      }
    }
  }, [searchParams]);

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
        p.island.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
  }, [selectedIsland, priceRange, propertyType, searchQuery]);

  const handlePropertySelect = (property: PropertyData) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handlePropertyHover = (property: PropertyData | null) => {
    setHoveredProperty(property);
  };

  const clearFilters = () => {
    setSelectedIsland("all");
    setPriceRange("all");
    setPropertyType("all");
    setSearchQuery("");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Full Screen Map Layout */}
      <div className="flex-1 relative">
        {/* Main Map Area */}
        <div className="absolute inset-0">
          <MapboxPropertyMap
            properties={filteredProperties}
            onPropertySelect={handlePropertySelect}
            onPropertyHover={handlePropertyHover}
            selectedProperty={selectedProperty?.property_id}
            hoveredProperty={hoveredProperty?.property_id}
            initialCenter={mapCenter}
            initialZoom={mapZoom}
            className="w-full h-full"
          />
        </div>

        {/* Floating Top Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties in Cape Verde..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedIsland} onValueChange={setSelectedIsland}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Island" />
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
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Price Range" />
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
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Property Sidebar - POSITIONED JUST UNDER SEARCH RECTANGLE */}
        <div className={`absolute top-28 bottom-4 transition-all duration-300 z-10 ${
          isSidebarOpen ? 'left-4 w-[480px] max-w-2xl' : 'left-4 w-12'
        }`}>
          {isSidebarOpen ? (
            <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{filteredProperties.length} Properties</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">Cape Verde Real Estate</p>
              </div>

              {/* Property List - 2 Column Grid ZILLOW STYLE */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-4">
                  {filteredProperties.map((property) => (
                    <Card
                      key={property.property_id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedProperty?.property_id === property.property_id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : hoveredProperty?.property_id === property.property_id
                            ? 'bg-gray-50'
                            : ''
                      }`}
                      onClick={() => handlePropertySelect(property)}
                      onMouseEnter={() => handlePropertyHover(property)}
                      onMouseLeave={() => handlePropertyHover(null)}
                    >
                      <CardContent className="p-3">
                        {/* Property Image */}
                        <div className="mb-3">
                          <img
                            src={property.image}
                            alt={property.title}
                            className="w-full h-28 object-cover rounded"
                          />
                        </div>

                        {/* Property Info */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-blue-600 text-base">€{property.price.toLocaleString()}</span>
                            <Badge variant="secondary" className="text-xs">{property.island}</Badge>
                          </div>

                          <h4 className="font-semibold text-sm line-clamp-2">{property.title}</h4>

                          <div className="flex items-center text-gray-600 text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{property.location}</span>
                          </div>

                          <div className="flex gap-3 text-xs text-gray-500">
                            {property.bedrooms > 0 && <span>{property.bedrooms} bed</span>}
                            {property.bathrooms > 0 && <span>{property.bathrooms} bath</span>}
                            <span>{property.total_area}m²</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Button
              className="h-12 w-12 rounded-lg shadow-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Home className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Property Detail Modal */}
        <PropertyDetailModal
          property={selectedProperty}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProperty(null);
          }}
        />
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading map...</div>}>
      <MapPageContent />
    </Suspense>
  );
}
