"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart, Filter, SortAsc, TrendingUp, TrendingDown,
  MapPin, Bed, Bath, Square, Eye, Share2, Trash2,
  Bell, BellOff, Calendar, ArrowUpDown, Search,
  Grid, List, Star, Mail, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SavedProperty {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  location: string;
  island: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  savedDate: string;
  priceChange?: {
    amount: number;
    percentage: number;
    direction: 'up' | 'down' | 'stable';
    lastUpdated: string;
  };
  agent: {
    name: string;
    phone: string;
    email: string;
    avatar?: string;
  };
  features: string[];
  status: 'available' | 'pending' | 'sold';
  priceAlert: boolean;
  notes?: string;
}

export default function FavoritesPage() {
  const { user, isAuthenticated, removeFromFavorites } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('savedDate');
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Sample saved properties data
  const savedProperties: SavedProperty[] = [
    {
      id: "1",
      title: "Modern Ocean View Villa",
      price: 750000,
      originalPrice: 780000,
      location: "Santa Maria",
      island: "Sal",
      type: "Villa",
      bedrooms: 4,
      bathrooms: 3,
      area: 320,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      savedDate: "2024-12-20T10:30:00Z",
      priceChange: {
        amount: -30000,
        percentage: -3.8,
        direction: 'down',
        lastUpdated: "2024-12-27T09:00:00Z"
      },
      agent: {
        name: "Maria Santos",
        phone: "+238 987 654 321",
        email: "maria.santos@atlanticrealestate.cv",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
      },
      features: ["Ocean View", "Pool", "Garage", "Solar Panels"],
      status: "available",
      priceAlert: true,
      notes: "Perfect for family vacation home"
    },
    {
      id: "2",
      title: "Luxury Apartment with Pool",
      price: 450000,
      location: "Praia",
      island: "Santiago",
      type: "Apartment",
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      savedDate: "2024-12-15T14:20:00Z",
      priceChange: {
        amount: 0,
        percentage: 0,
        direction: 'stable',
        lastUpdated: "2024-12-27T09:00:00Z"
      },
      agent: {
        name: "João Silva",
        phone: "+238 123 456 789",
        email: "joao.silva@praiarealty.cv"
      },
      features: ["Pool", "Modern Kitchen", "Balcony", "Parking"],
      status: "available",
      priceAlert: false
    },
    {
      id: "3",
      title: "Beachfront Townhouse",
      price: 620000,
      originalPrice: 600000,
      location: "Mindelo",
      island: "São Vicente",
      type: "Townhouse",
      bedrooms: 3,
      bathrooms: 3,
      area: 250,
      image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      savedDate: "2024-12-10T08:15:00Z",
      priceChange: {
        amount: 20000,
        percentage: 3.3,
        direction: 'up',
        lastUpdated: "2024-12-25T12:00:00Z"
      },
      agent: {
        name: "Ana Pereira",
        phone: "+238 555 123 456",
        email: "ana.pereira@mindelo.properties"
      },
      features: ["Beach Access", "Terrace", "Sea View", "Furnished"],
      status: "pending",
      priceAlert: true,
      notes: "Great investment opportunity"
    }
  ];

  // Filter and sort properties
  const filteredProperties = savedProperties
    .filter(property => {
      if (filterBy === 'all') return true;
      if (filterBy === 'price-alerts') return property.priceAlert;
      if (filterBy === 'price-changes') return property.priceChange && property.priceChange.direction !== 'stable';
      if (filterBy === 'available') return property.status === 'available';
      return property.island.toLowerCase() === filterBy;
    })
    .filter(property =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'savedDate':
          return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleRemoveFromFavorites = (propertyId: string) => {
    removeFromFavorites(propertyId);
    toast({
      title: "Property Removed",
      description: "Property has been removed from your favorites.",
    });
  };

  const togglePriceAlert = (propertyId: string) => {
    // In a real app, this would update the backend
    toast({
      title: "Price Alert Updated",
      description: "Price alert preferences have been updated.",
    });
  };

  const getPriceChangeColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriceChangeIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return ArrowUpDown;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Heart className="h-8 w-8 mr-3 text-red-500" />
                Saved Properties
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your favorite properties and track price changes
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {filteredProperties.length} properties
              </Badge>
              <Badge className="bg-red-100 text-red-800">
                {filteredProperties.filter(p => p.priceAlert).length} with alerts
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search saved properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="price-alerts">Price Alerts On</SelectItem>
                    <SelectItem value="price-changes">Recent Price Changes</SelectItem>
                    <SelectItem value="available">Available Only</SelectItem>
                    <Separator />
                    <SelectItem value="santiago">Santiago</SelectItem>
                    <SelectItem value="sal">Sal</SelectItem>
                    <SelectItem value="são vicente">São Vicente</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savedDate">Recently Saved</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="title">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Display */}
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Properties</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterBy !== 'all'
                  ? "No properties match your current filters."
                  : "Start exploring properties and save your favorites to see them here."
                }
              </p>
              <Link href="/">
                <Button>
                  Explore Properties
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredProperties.map((property) => {
              const PriceChangeIcon = getPriceChangeIcon(property.priceChange?.direction || 'stable');

              if (viewMode === 'list') {
                return (
                  <Card key={property.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="relative w-64 h-48">
                          <img
                            src={property.image}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                          {property.status !== 'available' && (
                            <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                              {property.status}
                            </Badge>
                          )}
                          {property.priceChange && property.priceChange.direction !== 'stable' && (
                            <Badge className={`absolute top-2 right-2 ${
                              property.priceChange.direction === 'up' ? 'bg-red-500' : 'bg-green-500'
                            } text-white`}>
                              {property.priceChange.direction === 'up' ? '+' : ''}
                              {property.priceChange.percentage.toFixed(1)}%
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                {property.location}, {property.island}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center">
                                  <Bed className="h-4 w-4 mr-1" />
                                  {property.bedrooms} bed
                                </span>
                                <span className="flex items-center">
                                  <Bath className="h-4 w-4 mr-1" />
                                  {property.bathrooms} bath
                                </span>
                                <span className="flex items-center">
                                  <Square className="h-4 w-4 mr-1" />
                                  {property.area} m²
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600 mb-1">
                                €{property.price.toLocaleString()}
                              </div>
                              {property.priceChange && (
                                <div className={`flex items-center text-sm ${getPriceChangeColor(property.priceChange.direction)}`}>
                                  <PriceChangeIcon className="h-3 w-3 mr-1" />
                                  €{Math.abs(property.priceChange.amount).toLocaleString()}
                                  ({property.priceChange.percentage > 0 ? '+' : ''}{property.priceChange.percentage.toFixed(1)}%)
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {property.features.slice(0, 3).map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {property.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{property.features.length - 3} more
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={property.priceAlert}
                                  onCheckedChange={() => togglePriceAlert(property.id)}
                                />
                                <Label className="text-sm">Price alerts</Label>
                              </div>

                              <div className="text-sm text-gray-500">
                                Saved {new Date(property.savedDate).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Link href={`/property/${property.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                              <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveFromFavorites(property.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              // Grid view
              return (
                <Card key={property.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    {property.status !== 'available' && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                        {property.status}
                      </Badge>
                    )}
                    {property.priceChange && property.priceChange.direction !== 'stable' && (
                      <Badge className={`absolute top-2 right-2 ${
                        property.priceChange.direction === 'up' ? 'bg-red-500' : 'bg-green-500'
                      } text-white`}>
                        {property.priceChange.direction === 'up' ? '+' : ''}
                        {property.priceChange.percentage.toFixed(1)}%
                      </Badge>
                    )}

                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white"
                        onClick={() => handleRemoveFromFavorites(property.id)}
                      >
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg leading-tight">{property.title}</h3>
                      <div className="flex items-center">
                        {property.priceAlert ? (
                          <Bell className="h-4 w-4 text-blue-600" />
                        ) : (
                          <BellOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}, {property.island}
                    </div>

                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      €{property.price.toLocaleString()}
                    </div>

                    {property.priceChange && (
                      <div className={`flex items-center text-sm mb-3 ${getPriceChangeColor(property.priceChange.direction)}`}>
                        <PriceChangeIcon className="h-3 w-3 mr-1" />
                        €{Math.abs(property.priceChange.amount).toLocaleString()}
                        ({property.priceChange.percentage > 0 ? '+' : ''}{property.priceChange.percentage.toFixed(1)}%)
                        <span className="ml-2 text-gray-500">
                          {new Date(property.priceChange.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {property.bedrooms}
                      </span>
                      <span className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms}
                      </span>
                      <span className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        {property.area} m²
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {property.features.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {property.features.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{property.features.length - 2}
                        </Badge>
                      )}
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={property.priceAlert}
                          onCheckedChange={() => togglePriceAlert(property.id)}
                        />
                        <Label className="text-xs">Alerts</Label>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Link href={`/property/${property.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      Saved {new Date(property.savedDate).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
