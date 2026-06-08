"use client";

import React, { useState, useEffect } from 'react';
import { X, Plus, MapPin, Bed, Bath, Square, Star, DollarSign, TrendingUp, Clock, Heart, Share2, Calculator, Ruler, Waves, Mountain, Home, Car, Shield, Wifi, Phone, Users, Accessibility } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { capeVerdeProperties, agentDatabase, type Property } from '@/data/cape-verde-properties';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  initialProperties?: Property[];
}

interface ComparisonMetrics {
  pricePerSqm: number;
  walkScore?: number;
  investmentRating: 'A+' | 'A' | 'B+' | 'B' | 'C';
  rentalYield?: number;
  appreciationForecast?: number;
  liquidity: 'High' | 'Medium' | 'Low';
  maintenance: 'Low' | 'Medium' | 'High';
}

const getPropertyMetrics = (property: Property): ComparisonMetrics => {
  // Calculate investment metrics (mock data - in real app would come from API)
  const baseRating = property.price > 500000 ? 'A+' : property.price > 300000 ? 'A' : property.price > 150000 ? 'B+' : 'B';
  const beachBonus = property.beachDistance && property.beachDistance < 200 ? 1 : 0;
  const rentalYield = property.oceanView ? 6.5 + beachBonus : 4.5 + beachBonus;

  return {
    pricePerSqm: property.pricePerSqm,
    walkScore: Math.floor(Math.random() * 40) + 60, // Mock walk score
    investmentRating: baseRating as ComparisonMetrics['investmentRating'],
    rentalYield: rentalYield,
    appreciationForecast: Math.floor(Math.random() * 8) + 3, // 3-10% forecast
    liquidity: property.beachDistance && property.beachDistance < 500 ? 'High' : 'Medium',
    maintenance: property.type === 'Apartment' ? 'Low' : property.type === 'House' ? 'Medium' : 'High'
  };
};

const featureCategories = {
  'Location': ['Ocean View', 'Beach Access', 'City View', 'Mountain Views', 'Historic Location'],
  'Interior': ['Furnished', 'AC', 'Elevator', 'Balcony', 'Roof Terrace', 'Wine Cellar'],
  'Exterior': ['Private Pool', 'Garden', 'Terrace', 'Garage', 'Parking', 'Direct Beach Access'],
  'Amenities': ['Gym', 'Spa Access', '24/7 Security', 'Pool Access', 'Restaurant', 'Resort Access'],
  'Technology': ['Smart Home', 'Fiber Internet', 'Solar Panels', 'Security System'],
  'Accessibility': ['Wheelchair Access', 'Elevator Access', 'Ground Floor', 'Ramp Access']
};

export default function PropertyComparison({ isOpen, onClose, initialProperties = [] }: PropertyComparisonProps) {
  const [selectedProperties, setSelectedProperties] = useState<Property[]>(initialProperties);
  const [searchQuery, setSearchQuery] = useState('');
  const [islandFilter, setIslandFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const { user, addToFavorites, removeFromFavorites, isFavorite } = useAuth();

  // Reset when dialog opens/closes
  useEffect(() => {
    if (isOpen && initialProperties.length > 0) {
      setSelectedProperties(initialProperties);
    }
  }, [isOpen, initialProperties]);

  // Available properties for selection (excluding already selected)
  const availableProperties = capeVerdeProperties.filter(property => {
    const isNotSelected = !selectedProperties.find(p => p.id === property.id);
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIsland = islandFilter === 'all' || property.island === islandFilter;

    return isNotSelected && matchesSearch && matchesIsland;
  });

  const addProperty = (property: Property) => {
    if (selectedProperties.length < 3) {
      setSelectedProperties([...selectedProperties, property]);
    }
  };

  const removeProperty = (propertyId: string) => {
    setSelectedProperties(selectedProperties.filter(p => p.id !== propertyId));
  };

  const clearAll = () => {
    setSelectedProperties([]);
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'A+': return 'text-green-600 bg-green-50';
      case 'A': return 'text-green-500 bg-green-50';
      case 'B+': return 'text-yellow-500 bg-yellow-50';
      case 'B': return 'text-orange-500 bg-orange-50';
      default: return 'text-red-500 bg-red-50';
    }
  };

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getWinnerIndex = (values: number[], reverse = false) => {
    if (values.length === 0) return -1;
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const targetValue = reverse ? minValue : maxValue;
    return values.findIndex(v => v === targetValue);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Property Comparison</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[80vh]">
          {/* Property Selection Header */}
          <div className="border-b pb-4 mb-4">
            <div className="flex flex-wrap gap-4 mb-4">
              {/* Selected Properties */}
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex-1 min-w-[200px]">
                  {selectedProperties[index] ? (
                    <Card className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 z-10"
                        onClick={() => removeProperty(selectedProperties[index].id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <CardContent className="p-3">
                        <img
                          src={selectedProperties[index].images[0]}
                          alt={selectedProperties[index].title}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                        <h4 className="font-semibold text-sm line-clamp-2">
                          {selectedProperties[index].title}
                        </h4>
                        <p className="text-xs text-gray-600 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {selectedProperties[index].location}
                        </p>
                        <p className="font-bold text-blue-600 text-sm mt-1">
                          {formatCurrency(selectedProperties[index].price)}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
                      <CardContent className="p-3 flex flex-col items-center justify-center h-32 text-gray-500">
                        <Plus className="h-8 w-8 mb-2" />
                        <span className="text-sm">Add Property {index + 1}</span>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>

            {/* Search and Add Properties */}
            {selectedProperties.length < 3 && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search properties to add..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={islandFilter} onValueChange={setIslandFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Islands" />
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

                {availableProperties.length > 0 && (searchQuery || islandFilter !== 'all') && (
                  <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                    {availableProperties.slice(0, 5).map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => addProperty(property)}
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium text-sm">{property.title}</div>
                            <div className="text-xs text-gray-500">{property.location}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm text-blue-600">
                            {formatCurrency(property.price)}
                          </div>
                          <Plus className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {selectedProperties.length > 0 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <Button variant="outline" onClick={clearAll}>
                  Clear All
                </Button>
                <span className="text-sm text-gray-600">
                  {selectedProperties.length} of 3 properties selected
                </span>
              </div>
            )}
          </div>

          {/* Comparison Content */}
          {selectedProperties.length >= 2 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="investment">Investment</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <div className="mt-4 overflow-y-auto flex-1">
                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-0">
                  <div className="grid gap-4">
                    {/* Basic Info Comparison */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2 font-medium">Property</th>
                                {selectedProperties.map((property, index) => (
                                  <th key={property.id} className="text-left p-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Property {index + 1}</span>
                                      {user && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={() => isFavorite(property.id) ?
                                            removeFromFavorites(property.id) :
                                            addToFavorites(property.id)
                                          }
                                        >
                                          <Heart className={`h-3 w-3 ${isFavorite(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                        </Button>
                                      )}
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 font-medium">Price</td>
                                {selectedProperties.map((property, index) => {
                                  const prices = selectedProperties.map(p => p.price);
                                  const isWinner = getWinnerIndex(prices, true) === index;
                                  return (
                                    <td key={property.id} className={`p-2 ${isWinner ? 'bg-green-50 font-bold text-green-700' : ''}`}>
                                      {formatCurrency(property.price)}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b">
                                <td className="p-2 font-medium">Price per m²</td>
                                {selectedProperties.map((property, index) => {
                                  const pricesPerSqm = selectedProperties.map(p => p.pricePerSqm);
                                  const isWinner = getWinnerIndex(pricesPerSqm, true) === index;
                                  return (
                                    <td key={property.id} className={`p-2 ${isWinner ? 'bg-green-50 font-bold text-green-700' : ''}`}>
                                      {formatCurrency(property.pricePerSqm)}/m²
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b">
                                <td className="p-2 font-medium">Total Area</td>
                                {selectedProperties.map((property, index) => {
                                  const areas = selectedProperties.map(p => p.totalArea);
                                  const isWinner = getWinnerIndex(areas) === index;
                                  return (
                                    <td key={property.id} className={`p-2 ${isWinner ? 'bg-green-50 font-bold text-green-700' : ''}`}>
                                      {property.totalArea}m²
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b">
                                <td className="p-2 font-medium">Bedrooms</td>
                                {selectedProperties.map((property, index) => {
                                  const bedrooms = selectedProperties.map(p => p.bedrooms);
                                  const isWinner = getWinnerIndex(bedrooms) === index;
                                  return (
                                    <td key={property.id} className={`p-2 ${isWinner ? 'bg-green-50 font-bold text-green-700' : ''}`}>
                                      {property.bedrooms}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b">
                                <td className="p-2 font-medium">Bathrooms</td>
                                {selectedProperties.map((property, index) => {
                                  const bathrooms = selectedProperties.map(p => p.bathrooms);
                                  const isWinner = getWinnerIndex(bathrooms) === index;
                                  return (
                                    <td key={property.id} className={`p-2 ${isWinner ? 'bg-green-50 font-bold text-green-700' : ''}`}>
                                      {property.bathrooms}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b">
                                <td className="p-2 font-medium">Year Built</td>
                                {selectedProperties.map((property) => (
                                  <td key={property.id} className="p-2">
                                    {property.yearBuilt || 'N/A'}
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="p-2 font-medium">Beach Distance</td>
                                {selectedProperties.map((property, index) => {
                                  const distances = selectedProperties.map(p => p.beachDistance || 10000);
                                  const isWinner = getWinnerIndex(distances, true) === index;
                                  return (
                                    <td key={property.id} className={`p-2 ${isWinner ? 'bg-green-50 font-bold text-green-700' : ''}`}>
                                      {property.beachDistance ? `${property.beachDistance}m` : 'N/A'}
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features" className="mt-0">
                  <div className="space-y-4">
                    {Object.entries(featureCategories).map(([category, categoryFeatures]) => (
                      <Card key={category}>
                        <CardHeader>
                          <CardTitle className="text-lg">{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-2 font-medium">Feature</th>
                                  {selectedProperties.map((_, index) => (
                                    <th key={index} className="text-center p-2">Property {index + 1}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {categoryFeatures.map((feature) => (
                                  <tr key={feature} className="border-b">
                                    <td className="p-2 font-medium">{feature}</td>
                                    {selectedProperties.map((property) => {
                                      const hasFeature = property.features.some(f =>
                                        f.toLowerCase().includes(feature.toLowerCase()) ||
                                        feature.toLowerCase().includes(f.toLowerCase())
                                      );
                                      return (
                                        <td key={property.id} className="p-2 text-center">
                                          {hasFeature ? (
                                            <span className="text-green-600 font-bold">✓</span>
                                          ) : (
                                            <span className="text-gray-300">✗</span>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Investment Tab */}
                <TabsContent value="investment" className="mt-0">
                  <div className="grid gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Investment Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2 font-medium">Metric</th>
                                {selectedProperties.map((_, index) => (
                                  <th key={index} className="text-left p-2">Property {index + 1}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 font-medium">Investment Rating</td>
                                {selectedProperties.map((property) => {
                                  const metrics = getPropertyMetrics(property);
                                  return (
                                    <td key={property.id} className="p-2">
                                      <Badge className={getRatingColor(metrics.investmentRating)}>
                                        {metrics.investmentRating}
                                      </Badge>
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b">
                                <td className="p-2 font-medium">Rental Yield</td>
                                {selectedProperties.map((property, index) => {
                                  const yields = selectedProperties.map(p => getPropertyMetrics(p).rentalYield || 0);
                                  const isWinner = getWinnerIndex(yields) === index;
                                  const metrics = getPropertyMetrics(property);
                                  return (
                                    <td key={property.id} className={`p-2 ${isWinner ? 'bg-green-50 font-bold text-green-700' : ''}`}>
                                      {metrics.rentalYield?.toFixed(1)}%
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b">
                                <td className="p-2 font-medium">Appreciation Forecast</td>
                                {selectedProperties.map((property, index) => {
                                  const forecasts = selectedProperties.map(p => getPropertyMetrics(p).appreciationForecast || 0);
                                  const isWinner = getWinnerIndex(forecasts) === index;
                                  const metrics = getPropertyMetrics(property);
                                  return (
                                    <td key={property.id} className={`p-2 ${isWinner ? 'bg-green-50 font-bold text-green-700' : ''}`}>
                                      +{metrics.appreciationForecast}% annually
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-b">
                                <td className="p-2 font-medium">Liquidity</td>
                                {selectedProperties.map((property) => {
                                  const metrics = getPropertyMetrics(property);
                                  const colorClass = metrics.liquidity === 'High' ? 'text-green-600' :
                                                   metrics.liquidity === 'Medium' ? 'text-yellow-600' : 'text-red-600';
                                  return (
                                    <td key={property.id} className={`p-2 ${colorClass} font-medium`}>
                                      {metrics.liquidity}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr>
                                <td className="p-2 font-medium">Maintenance</td>
                                {selectedProperties.map((property) => {
                                  const metrics = getPropertyMetrics(property);
                                  const colorClass = metrics.maintenance === 'Low' ? 'text-green-600' :
                                                   metrics.maintenance === 'Medium' ? 'text-yellow-600' : 'text-red-600';
                                  return (
                                    <td key={property.id} className={`p-2 ${colorClass} font-medium`}>
                                      {metrics.maintenance}
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="location" className="mt-0">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Location Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          {selectedProperties.map((property, index) => (
                            <div key={property.id} className="border rounded-lg p-4">
                              <h4 className="font-semibold mb-2">Property {index + 1}: {property.title}</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>Location:</strong> {property.location}
                                </div>
                                <div>
                                  <strong>Island:</strong> {property.island}
                                </div>
                                <div>
                                  <strong>Beach Distance:</strong> {property.beachDistance ? `${property.beachDistance}m` : 'N/A'}
                                </div>
                                <div>
                                  <strong>Walk Score:</strong> {getPropertyMetrics(property).walkScore}/100
                                </div>
                              </div>
                              {property.agentId && agentDatabase[property.agentId as keyof typeof agentDatabase] && (
                                <div className="mt-3 pt-3 border-t">
                                  <strong>Listed by:</strong> {agentDatabase[property.agentId as keyof typeof agentDatabase].name} - {agentDatabase[property.agentId as keyof typeof agentDatabase].company}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold mb-2">Compare Properties</h3>
                <p className="text-gray-600 mb-4">
                  Select at least 2 properties to start comparing their features, prices, and investment potential.
                </p>
                {selectedProperties.length === 1 && (
                  <p className="text-sm text-blue-600">
                    Add one more property to begin comparison
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
