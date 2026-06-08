"use client";

import { useState } from "react";
import { X, Search, Filter, History, Home, Car, Wifi, Waves, TreePine, Shield, Zap, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  // Basic filters
  location: string;
  island: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
  minArea: number;
  maxArea: number;

  // Advanced filters
  yearBuilt: number[];
  parking: number;
  furnished: string;
  condition: string;

  // Amenities
  amenities: string[];

  // Features
  features: string[];

  // Price history
  priceHistory: {
    timeframe: string;
    priceChange: string;
  };

  // Availability
  availability: string;
  listingAge: string;
}

const amenitiesOptions = [
  { id: "pool", label: "Swimming Pool", icon: Waves },
  { id: "gym", label: "Gym/Fitness Center", icon: Home },
  { id: "parking", label: "Parking", icon: Car },
  { id: "wifi", label: "High-Speed Internet", icon: Wifi },
  { id: "garden", label: "Garden/Landscaping", icon: TreePine },
  { id: "security", label: "24/7 Security", icon: Shield },
  { id: "generator", label: "Generator/Backup Power", icon: Zap },
  { id: "ac", label: "Air Conditioning", icon: Wind },
];

const featuresOptions = [
  "Ocean View", "Mountain View", "Beach Access", "Balcony/Terrace",
  "Fireplace", "Walk-in Closet", "Storage Room", "Laundry Room",
  "Guest Bathroom", "En-suite Bathroom", "Kitchen Island", "Pantry",
  "Solar Panels", "Water Tank", "Garage", "Covered Parking"
];

export default function AdvancedSearchModal({ isOpen, onClose, onSearch }: AdvancedSearchModalProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    location: "",
    island: "",
    propertyType: "",
    minPrice: 0,
    maxPrice: 1000000,
    bedrooms: 0,
    bathrooms: 0,
    minArea: 0,
    maxArea: 1000,
    yearBuilt: [1990, 2025],
    parking: 0,
    furnished: "",
    condition: "",
    amenities: [],
    features: [],
    priceHistory: {
      timeframe: "",
      priceChange: ""
    },
    availability: "",
    listingAge: ""
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | string[] | number[] | { timeframe: string; priceChange: string }) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const resetFilters = () => {
    setFilters({
      location: "",
      island: "",
      propertyType: "",
      minPrice: 0,
      maxPrice: 1000000,
      bedrooms: 0,
      bathrooms: 0,
      minArea: 0,
      maxArea: 1000,
      yearBuilt: [1990, 2025],
      parking: 0,
      furnished: "",
      condition: "",
      amenities: [],
      features: [],
      priceHistory: {
        timeframe: "",
        priceChange: ""
      },
      availability: "",
      listingAge: ""
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Advanced Property Search
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="history">Price History</TabsTrigger>
          </TabsList>

          {/* Basic Filters */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter city, neighborhood, or area"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Island */}
              <div>
                <Label htmlFor="island">Island</Label>
                <Select value={filters.island} onValueChange={(value) => handleFilterChange("island", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select island" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Islands</SelectItem>
                    <SelectItem value="santiago">Santiago</SelectItem>
                    <SelectItem value="sal">Sal</SelectItem>
                    <SelectItem value="sao-vicente">São Vicente</SelectItem>
                    <SelectItem value="boa-vista">Boa Vista</SelectItem>
                    <SelectItem value="santo-antao">Santo Antão</SelectItem>
                    <SelectItem value="fogo">Fogo</SelectItem>
                    <SelectItem value="maio">Maio</SelectItem>
                    <SelectItem value="sao-nicolau">São Nicolau</SelectItem>
                    <SelectItem value="brava">Brava</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type */}
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange("propertyType", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Condition */}
              <div>
                <Label htmlFor="condition">Property Condition</Label>
                <Select value={filters.condition} onValueChange={(value) => handleFilterChange("condition", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Condition</SelectItem>
                    <SelectItem value="new">New Construction</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="renovation">Needs Renovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <Label>Price Range (€)</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="minPrice" className="text-sm">Minimum</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="Min price"
                    value={filters.minPrice || ""}
                    onChange={(e) => handleFilterChange("minPrice", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice" className="text-sm">Maximum</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="Max price"
                    value={filters.maxPrice || ""}
                    onChange={(e) => handleFilterChange("maxPrice", Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  onValueChange={([min, max]) => {
                    handleFilterChange("minPrice", min);
                    handleFilterChange("maxPrice", max);
                  }}
                  max={1000000}
                  min={0}
                  step={10000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>€0</span>
                  <span>€1,000,000+</span>
                </div>
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Select value={filters.bedrooms.toString()} onValueChange={(value) => handleFilterChange("bedrooms", Number(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Select value={filters.bathrooms.toString()} onValueChange={(value) => handleFilterChange("bathrooms", Number(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Area Range */}
            <div>
              <Label>Floor Area (m²)</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="minArea" className="text-sm">Minimum</Label>
                  <Input
                    id="minArea"
                    type="number"
                    placeholder="Min area"
                    value={filters.minArea || ""}
                    onChange={(e) => handleFilterChange("minArea", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxArea" className="text-sm">Maximum</Label>
                  <Input
                    id="maxArea"
                    type="number"
                    placeholder="Max area"
                    value={filters.maxArea || ""}
                    onChange={(e) => handleFilterChange("maxArea", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Year Built */}
            <div>
              <Label>Year Built</Label>
              <div className="mt-2">
                <Slider
                  value={filters.yearBuilt}
                  onValueChange={(value) => handleFilterChange("yearBuilt", value)}
                  max={2025}
                  min={1950}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{filters.yearBuilt[0]}</span>
                  <span>{filters.yearBuilt[1]}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Amenities */}
          <TabsContent value="amenities" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenitiesOptions.map((amenity) => {
                const IconComponent = amenity.icon;
                return (
                  <Card
                    key={amenity.id}
                    className={`cursor-pointer transition-all ${
                      filters.amenities.includes(amenity.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAmenityToggle(amenity.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <IconComponent className={`h-8 w-8 mx-auto mb-2 ${
                        filters.amenities.includes(amenity.id) ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="text-sm font-medium">{amenity.label}</div>
                      <Checkbox
                        checked={filters.amenities.includes(amenity.id)}
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {featuresOptions.map((feature) => (
                <div
                  key={feature}
                  className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    filters.features.includes(feature)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleFeatureToggle(feature)}
                >
                  <Checkbox
                    checked={filters.features.includes(feature)}
                  />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Price History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Price History Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeframe">Time Period</Label>
                    <Select
                      value={filters.priceHistory.timeframe}
                      onValueChange={(value) => handleFilterChange("priceHistory", {...filters.priceHistory, timeframe: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="6months">Last 6 months</SelectItem>
                        <SelectItem value="1year">Last year</SelectItem>
                        <SelectItem value="2years">Last 2 years</SelectItem>
                        <SelectItem value="5years">Last 5 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priceChange">Price Change</Label>
                    <Select
                      value={filters.priceHistory.priceChange}
                      onValueChange={(value) => handleFilterChange("priceHistory", {...filters.priceHistory, priceChange: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select change type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Change</SelectItem>
                        <SelectItem value="increased">Price Increased</SelectItem>
                        <SelectItem value="decreased">Price Decreased</SelectItem>
                        <SelectItem value="stable">Price Stable</SelectItem>
                        <SelectItem value="reduced">Recently Reduced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Select value={filters.availability} onValueChange={(value) => handleFilterChange("availability", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Properties</SelectItem>
                        <SelectItem value="available">Available Now</SelectItem>
                        <SelectItem value="coming-soon">Coming Soon</SelectItem>
                        <SelectItem value="under-contract">Under Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="listingAge">Listing Age</Label>
                    <Select value={filters.listingAge} onValueChange={(value) => handleFilterChange("listingAge", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select listing age" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Age</SelectItem>
                        <SelectItem value="24hours">Last 24 hours</SelectItem>
                        <SelectItem value="week">Last week</SelectItem>
                        <SelectItem value="month">Last month</SelectItem>
                        <SelectItem value="3months">Last 3 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Applied Filters Summary */}
        {(filters.amenities.length > 0 || filters.features.length > 0 || filters.island || filters.propertyType) && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Applied Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {filters.island && <Badge variant="secondary">{filters.island}</Badge>}
                {filters.propertyType && <Badge variant="secondary">{filters.propertyType}</Badge>}
                {filters.amenities.map(amenity => (
                  <Badge key={amenity} variant="outline">{amenitiesOptions.find(a => a.id === amenity)?.label}</Badge>
                ))}
                {filters.features.map(feature => (
                  <Badge key={feature} variant="outline">{feature}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={resetFilters}>
            Reset All Filters
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Search Properties
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
