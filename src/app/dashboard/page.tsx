"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart, Search, Bell, User, Settings, TrendingUp, MapPin,
  Bed, Bath, Square, Calendar, Clock, Star, ArrowRight,
  Filter, BarChart3, Home, Bookmark, AlertCircle, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyManagementDashboard from "@/components/PropertyManagementDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useRouter } from "next/navigation";

interface SavedProperty {
  id: string;
  title: string;
  price: number;
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
  };
}

interface SearchHistory {
  id: string;
  query: string;
  location: string;
  filters: {
    propertyType?: string;
    priceRange?: string;
    bedrooms?: number;
  };
  resultsCount: number;
  searchDate: string;
}

interface Recommendation {
  id: string;
  title: string;
  reason: string;
  properties: SavedProperty[];
  type: 'similar' | 'price-range' | 'location' | 'trending';
}

// Sample data
const sampleSavedProperties: SavedProperty[] = [
  {
    id: "1",
    title: "Modern Beachfront Villa",
    price: 450000,
    location: "Santa Maria, Sal",
    island: "Sal",
    type: "Villa",
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/522602290.jpg",
    savedDate: "2024-12-15",
    priceChange: {
      amount: 15000,
      percentage: 3.4,
      direction: 'up'
    }
  },
  {
    id: "2",
    title: "City Center Apartment",
    price: 180000,
    location: "Praia, Santiago",
    island: "Santiago",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    savedDate: "2024-12-10",
    priceChange: {
      amount: -5000,
      percentage: -2.7,
      direction: 'down'
    }
  }
];

const sampleSearchHistory: SearchHistory[] = [
  {
    id: "1",
    query: "Beachfront villa",
    location: "Sal",
    filters: {
      propertyType: "Villa",
      priceRange: "€400k - €600k",
      bedrooms: 3
    },
    resultsCount: 12,
    searchDate: "2024-12-20"
  },
  {
    id: "2",
    query: "Modern apartment",
    location: "Praia, Santiago",
    filters: {
      propertyType: "Apartment",
      priceRange: "€150k - €250k",
      bedrooms: 2
    },
    resultsCount: 8,
    searchDate: "2024-12-18"
  }
];

const sampleRecommendations: Recommendation[] = [
  {
    id: "1",
    title: "Similar Beachfront Properties",
    reason: "Based on your saved villa in Santa Maria",
    type: "similar",
    properties: [
      {
        id: "3",
        title: "Luxury Ocean Villa",
        price: 680000,
        location: "Espargos, Sal",
        island: "Sal",
        type: "Villa",
        bedrooms: 5,
        bathrooms: 4,
        area: 350,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        savedDate: "2024-12-15"
      }
    ]
  },
  {
    id: "2",
    title: "Trending in Santiago",
    reason: "Popular properties in your preferred location",
    type: "trending",
    properties: [
      {
        id: "4",
        title: "Modern Penthouse",
        price: 320000,
        location: "Praia, Santiago",
        island: "Santiago",
        type: "Penthouse",
        bedrooms: 3,
        bathrooms: 3,
        area: 180,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80",
        savedDate: "2024-12-15"
      }
    ]
  }
];

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { conversations, totalUnreadCount } = useChat();
  const router = useRouter();
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeAlerts, setActiveAlerts] = useState(3);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Load user data
    setSavedProperties(sampleSavedProperties);
    setSearchHistory(sampleSearchHistory);
    setRecommendations(sampleRecommendations);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriceChangeColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'similar': return Star;
      case 'trending': return TrendingUp;
      case 'location': return MapPin;
      case 'price-range': return BarChart3;
      default: return Home;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Manage your saved properties, search alerts, and discover new opportunities.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saved Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{savedProperties.length}</p>
                </div>
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
                  {totalUnreadCount > 0 && (
                    <p className="text-sm text-blue-600">{totalUnreadCount} unread</p>
                  )}
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{activeAlerts}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Searches</p>
                  <p className="text-2xl font-bold text-gray-900">{searchHistory.length}</p>
                </div>
                <Search className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recommendations</p>
                  <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="saved" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="saved">Saved Properties</TabsTrigger>
            <TabsTrigger value="management">Property Management</TabsTrigger>
            <TabsTrigger value="alerts">Search Alerts</TabsTrigger>
            <TabsTrigger value="history">Search History</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Saved Properties */}
          <TabsContent value="saved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Your Saved Properties ({savedProperties.length})
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Properties</h3>
                    <p className="text-gray-600 mb-4">Start saving properties you're interested in to keep track of them here.</p>
                    <Link href="/">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Browse Properties
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProperties.map((property) => (
                      <Card key={property.id} className="overflow-hidden">
                        <div className="relative h-48">
                          <Image
                            src={property.image}
                            alt={property.title}
                            fill
                            className="object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 p-0 bg-white bg-opacity-80 hover:bg-opacity-100"
                          >
                            <Heart className="h-4 w-4 fill-current text-red-600" />
                          </Button>
                          {property.priceChange && property.priceChange.direction !== 'stable' && (
                            <Badge
                              className={`absolute bottom-2 left-2 ${
                                property.priceChange.direction === 'up' ? 'bg-green-600' : 'bg-red-600'
                              } text-white`}
                            >
                              {property.priceChange.direction === 'up' ? '+' : '-'}
                              {property.priceChange.percentage.toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{property.title}</h3>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{property.location}</span>
                          </div>
                          <div className="text-xl font-bold text-blue-600 mb-3">
                            €{property.price.toLocaleString()}
                            {property.priceChange && (
                              <span className={`text-sm ml-2 ${getPriceChangeColor(property.priceChange.direction)}`}>
                                {property.priceChange.direction === 'up' ? '+' : ''}
                                €{property.priceChange.amount.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center">
                                <Bed className="h-3 w-3 mr-1" />
                                <span>{property.bedrooms}</span>
                              </div>
                              <div className="flex items-center">
                                <Bath className="h-3 w-3 mr-1" />
                                <span>{property.bathrooms}</span>
                              </div>
                              <div className="flex items-center">
                                <Square className="h-3 w-3 mr-1" />
                                <span>{property.area}m²</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Saved on {formatDate(property.savedDate)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Property Management */}
          <TabsContent value="management" className="space-y-6">
            <PropertyManagementDashboard userRole="user" />
          </TabsContent>

          {/* Search Alerts */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Your Search Alerts ({activeAlerts})
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Bell className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-blue-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Beachfront Villas in Sal</h3>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Properties: Villa • Price: €300k - €600k • Bedrooms: 3+ • Location: Sal
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Last notified: 2 days ago
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Pause</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Praia Apartments</h3>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Properties: Apartment • Price: €100k - €250k • Bedrooms: 2+ • Location: Praia
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Last notified: 1 week ago
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Pause</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-yellow-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Investment Properties</h3>
                        <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Properties: Any • Price: Under €200k • Location: All Islands
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Paused since: 1 month ago
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Activate</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search History */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Recent Searches
                  </div>
                  <Button variant="outline" size="sm">
                    Clear History
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {searchHistory.map((search) => (
                    <Card key={search.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{search.query}</h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{search.location}</span>
                              {search.filters.propertyType && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{search.filters.propertyType}</span>
                                </>
                              )}
                              {search.filters.priceRange && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{search.filters.priceRange}</span>
                                </>
                              )}
                              {search.filters.bedrooms && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{search.filters.bedrooms}+ bedrooms</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{formatDate(search.searchDate)}</span>
                              <span className="mx-2">•</span>
                              <span>{search.resultsCount} results found</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              Search Again
                            </Button>
                            <Button variant="outline" size="sm">
                              <Bell className="h-3 w-3 mr-1" />
                              Create Alert
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="space-y-6">
              {recommendations.map((recommendation) => {
                const IconComponent = getRecommendationIcon(recommendation.type);
                return (
                  <Card key={recommendation.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <IconComponent className="h-5 w-5 mr-2" />
                        {recommendation.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{recommendation.reason}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendation.properties.map((property) => (
                          <Card key={property.id} className="overflow-hidden">
                            <div className="relative h-32">
                              <Image
                                src={property.image}
                                alt={property.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <CardContent className="p-3">
                              <h4 className="font-medium text-sm mb-1 line-clamp-2">{property.title}</h4>
                              <div className="flex items-center text-gray-600 text-xs mb-1">
                                <MapPin className="h-2 w-2 mr-1" />
                                <span>{property.location}</span>
                              </div>
                              <div className="text-sm font-bold text-blue-600 mb-2">
                                €{property.price.toLocaleString()}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-xs text-gray-500 space-x-2">
                                  <span>{property.bedrooms}bed</span>
                                  <span>{property.bathrooms}bath</span>
                                  <span>{property.area}m²</span>
                                </div>
                                <Link href={`/property/${property.id}`}>
                                  <Button size="sm" variant="outline" className="text-xs h-6">
                                    View
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <div className="mt-4 text-center">
                        <Button variant="outline">
                          See All Similar Properties
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
