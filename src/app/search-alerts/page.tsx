"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Plus, Edit, Trash2, Eye, EyeOff, Filter,
  MapPin, Home, TrendingUp, Calendar, Mail, Smartphone,
  Search, AlertCircle, CheckCircle, Clock, Settings,
  Target, Star, Pause, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SearchAlert {
  id: string;
  name: string;
  filters: {
    location?: string;
    island?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    minArea?: number;
    maxArea?: number;
    features?: string[];
  };
  frequency: 'instant' | 'daily' | 'weekly';
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  matchCount: number;
  newMatches: number;
  totalNotificationsSent: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface NewMatch {
  id: string;
  alertId: string;
  property: {
    id: string;
    title: string;
    price: number;
    location: string;
    image: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
  };
  matchedAt: string;
  notified: boolean;
}

export default function SearchAlertsPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<SearchAlert | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state for creating/editing alerts
  const [alertForm, setAlertForm] = useState({
    name: "",
    location: "",
    island: "",
    minPrice: 0,
    maxPrice: 1000000,
    propertyType: "",
    bedrooms: 0,
    bathrooms: 0,
    minArea: 0,
    maxArea: 1000,
    features: [] as string[],
    frequency: "daily" as 'instant' | 'daily' | 'weekly',
    emailNotifications: true,
    smsNotifications: false
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Sample search alerts data
  const searchAlerts: SearchAlert[] = [
    {
      id: "1",
      name: "Ocean View Villas in Sal",
      filters: {
        island: "Sal",
        propertyType: "Villa",
        minPrice: 500000,
        maxPrice: 1000000,
        bedrooms: 3,
        features: ["Ocean View", "Pool"]
      },
      frequency: "instant",
      active: true,
      createdAt: "2024-12-15T10:30:00Z",
      lastTriggered: "2024-12-27T08:15:00Z",
      matchCount: 12,
      newMatches: 2,
      totalNotificationsSent: 8,
      emailNotifications: true,
      smsNotifications: true
    },
    {
      id: "2",
      name: "Affordable Apartments in Praia",
      filters: {
        location: "Praia",
        propertyType: "Apartment",
        maxPrice: 400000,
        bedrooms: 2,
        bathrooms: 2
      },
      frequency: "daily",
      active: true,
      createdAt: "2024-12-10T14:20:00Z",
      lastTriggered: "2024-12-26T09:00:00Z",
      matchCount: 25,
      newMatches: 5,
      totalNotificationsSent: 15,
      emailNotifications: true,
      smsNotifications: false
    },
    {
      id: "3",
      name: "Investment Properties",
      filters: {
        propertyType: "any",
        maxPrice: 300000,
        minArea: 100
      },
      frequency: "weekly",
      active: false,
      createdAt: "2024-11-28T16:45:00Z",
      lastTriggered: "2024-12-20T12:00:00Z",
      matchCount: 45,
      newMatches: 0,
      totalNotificationsSent: 32,
      emailNotifications: true,
      smsNotifications: false
    }
  ];

  // Sample new matches
  const recentMatches: NewMatch[] = [
    {
      id: "1",
      alertId: "1",
      property: {
        id: "101",
        title: "Luxury Ocean View Villa",
        price: 850000,
        location: "Santa Maria, Sal",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        bedrooms: 4,
        bathrooms: 3,
        area: 320
      },
      matchedAt: "2024-12-27T08:15:00Z",
      notified: true
    },
    {
      id: "2",
      alertId: "2",
      property: {
        id: "102",
        title: "Modern City Apartment",
        price: 380000,
        location: "Praia, Santiago",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        bedrooms: 2,
        bathrooms: 2,
        area: 150
      },
      matchedAt: "2024-12-26T15:30:00Z",
      notified: true
    }
  ];

  const propertyFeatures = [
    "Ocean View", "Pool", "Garage", "Garden", "Balcony", "Terrace",
    "Modern Kitchen", "Air Conditioning", "Solar Panels", "Security System",
    "Furnished", "Beach Access", "Elevator", "Parking"
  ];

  const resetAlertForm = () => {
    setAlertForm({
      name: "",
      location: "",
      island: "",
      minPrice: 0,
      maxPrice: 1000000,
      propertyType: "",
      bedrooms: 0,
      bathrooms: 0,
      minArea: 0,
      maxArea: 1000,
      features: [],
      frequency: "daily" as 'instant' | 'daily' | 'weekly',
      emailNotifications: true,
      smsNotifications: false
    });
  };

  const handleCreateAlert = () => {
    if (!alertForm.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a name for your search alert.",
        variant: "destructive"
      });
      return;
    }

    // Create alert object
    const newAlert = {
      name: alertForm.name,
      filters: {
        ...(alertForm.location && { location: alertForm.location }),
        ...(alertForm.island && { island: alertForm.island }),
        ...(alertForm.minPrice > 0 && { minPrice: alertForm.minPrice }),
        ...(alertForm.maxPrice < 1000000 && { maxPrice: alertForm.maxPrice }),
        ...(alertForm.propertyType && { propertyType: alertForm.propertyType }),
        ...(alertForm.bedrooms > 0 && { bedrooms: alertForm.bedrooms }),
        ...(alertForm.bathrooms > 0 && { bathrooms: alertForm.bathrooms }),
        ...(alertForm.minArea > 0 && { minArea: alertForm.minArea }),
        ...(alertForm.maxArea < 1000 && { maxArea: alertForm.maxArea }),
        ...(alertForm.features.length > 0 && { features: alertForm.features })
      },
      frequency: alertForm.frequency,
      active: true
    };

    // TODO: Implement addSearchAlert functionality
    console.log('Creating search alert:', newAlert);

    toast({
      title: "Search Alert Created",
      description: "You'll receive notifications when new properties match your criteria.",
    });

    setIsCreateModalOpen(false);
    resetAlertForm();
  };

  const handleDeleteAlert = (alertId: string) => {
    if (confirm("Are you sure you want to delete this search alert?")) {
      // TODO: Implement removeSearchAlert functionality
      console.log('Deleting search alert:', alertId);
      toast({
        title: "Search Alert Deleted",
        description: "The search alert has been removed.",
      });
    }
  };

  const toggleAlertStatus = (alertId: string) => {
    // In a real app, this would update the backend
    toast({
      title: "Alert Status Updated",
      description: "Search alert status has been changed.",
    });
  };

  const handleFeatureToggle = (feature: string) => {
    setAlertForm(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'instant':
        return 'bg-red-100 text-red-800';
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'weekly':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFilters = (filters: SearchAlert['filters']) => {
    const parts = [];
    if (filters.location) parts.push(filters.location);
    if (filters.island) parts.push(filters.island);
    if (filters.propertyType) parts.push(filters.propertyType);
    if (filters.bedrooms) parts.push(`${filters.bedrooms}+ bed`);
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice ? `€${filters.minPrice.toLocaleString()}` : '';
      const max = filters.maxPrice ? `€${filters.maxPrice.toLocaleString()}` : '';
      parts.push(`${min}${min && max ? ' - ' : ''}${max}`);
    }
    return parts.join(' • ');
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
                <Bell className="h-8 w-8 mr-3 text-blue-600" />
                Search Alerts
              </h1>
              <p className="text-gray-600 mt-1">
                Get notified when new properties match your search criteria
              </p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetAlertForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {searchAlerts.filter(alert => alert.active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">New Matches</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {searchAlerts.reduce((sum, alert) => sum + alert.newMatches, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Notifications Sent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {searchAlerts.reduce((sum, alert) => sum + alert.totalNotificationsSent, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Matches</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {searchAlerts.reduce((sum, alert) => sum + alert.matchCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Alerts List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Search Alerts</h2>
              <Badge variant="outline">
                {searchAlerts.length} alerts
              </Badge>
            </div>

            {searchAlerts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Search Alerts</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first search alert to get notified about new properties that match your criteria.
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Alert
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {searchAlerts.map((alert) => (
                  <Card key={alert.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{alert.name}</h3>
                            <Badge className={getFrequencyColor(alert.frequency)}>
                              {alert.frequency}
                            </Badge>
                            {alert.newMatches > 0 && (
                              <Badge className="bg-red-500 text-white">
                                {alert.newMatches} new
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {formatFilters(alert.filters)}
                          </p>

                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Home className="h-4 w-4 mr-1" />
                              {alert.matchCount} matches
                            </span>
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {alert.totalNotificationsSent} sent
                            </span>
                            {alert.lastTriggered && (
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Last: {new Date(alert.lastTriggered).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={alert.active}
                            onCheckedChange={() => toggleAlertStatus(alert.id)}
                          />
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAlert(alert.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {alert.emailNotifications ? 'Email on' : 'Email off'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Smartphone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {alert.smsNotifications ? 'SMS on' : 'SMS off'}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-500">
                          Created {new Date(alert.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Matches Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Recent Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentMatches.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 text-sm">
                      No new matches yet. We'll notify you when properties matching your alerts become available.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentMatches.map((match) => (
                      <div key={match.id} className="border rounded-lg p-4">
                        <div className="flex space-x-3">
                          <img
                            src={match.property.image}
                            alt={match.property.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {match.property.title}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              €{match.property.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {match.property.location}
                            </p>
                            <p className="text-xs text-gray-500">
                              {match.property.bedrooms} bed • {match.property.bathrooms} bath • {match.property.area} m²
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {new Date(match.matchedAt).toLocaleDateString()}
                              </span>
                              {match.notified && (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-gray-500">Receive alerts via email</p>
                  </div>
                  <Switch checked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">SMS Notifications</Label>
                    <p className="text-xs text-gray-500">Receive alerts via SMS</p>
                  </div>
                  <Switch checked={false} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-xs text-gray-500">Browser notifications</p>
                  </div>
                  <Switch checked={true} />
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium mb-2 block">Quiet Hours</Label>
                  <p className="text-xs text-gray-500 mb-3">No notifications during these hours</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Select defaultValue="22">
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select defaultValue="8">
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Alert Modal */}
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Search Alert</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Alert Name */}
            <div>
              <Label htmlFor="alertName">Alert Name</Label>
              <Input
                id="alertName"
                value={alertForm.name}
                onChange={(e) => setAlertForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Ocean View Villas in Sal"
              />
            </div>

            {/* Location Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="island">Island</Label>
                <Select value={alertForm.island} onValueChange={(value) => setAlertForm(prev => ({ ...prev, island: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Island" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Island</SelectItem>
                    <SelectItem value="Santiago">Santiago</SelectItem>
                    <SelectItem value="Sal">Sal</SelectItem>
                    <SelectItem value="São Vicente">São Vicente</SelectItem>
                    <SelectItem value="Boa Vista">Boa Vista</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={alertForm.location}
                  onChange={(e) => setAlertForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Santa Maria, Praia"
                />
              </div>
            </div>

            {/* Property Type and Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={alertForm.propertyType} onValueChange={(value) => setAlertForm(prev => ({ ...prev, propertyType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Type</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bedrooms">Min Bedrooms</Label>
                <Select value={alertForm.bedrooms.toString()} onValueChange={(value) => setAlertForm(prev => ({ ...prev, bedrooms: parseInt(value) }))}>
                  <SelectTrigger>
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
                <Label htmlFor="bathrooms">Min Bathrooms</Label>
                <Select value={alertForm.bathrooms.toString()} onValueChange={(value) => setAlertForm(prev => ({ ...prev, bathrooms: parseInt(value) }))}>
                  <SelectTrigger>
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
            </div>

            {/* Price Range */}
            <div>
              <Label className="text-base font-medium">Price Range</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 w-16">
                    €{alertForm.minPrice.toLocaleString()}
                  </span>
                  <div className="flex-1">
                    <Slider
                      value={[alertForm.minPrice]}
                      onValueChange={([value]) => setAlertForm(prev => ({ ...prev, minPrice: value }))}
                      max={1000000}
                      step={10000}
                      className="w-full"
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-20">
                    €{alertForm.maxPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 w-16">Min</span>
                  <div className="flex-1">
                    <Slider
                      value={[alertForm.maxPrice]}
                      onValueChange={([value]) => setAlertForm(prev => ({ ...prev, maxPrice: value }))}
                      max={1000000}
                      step={10000}
                      className="w-full"
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-20">Max</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <Label className="text-base font-medium">Property Features</Label>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                {propertyFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={alertForm.features.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <Label htmlFor={feature} className="text-sm">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={alertForm.frequency} onValueChange={(value: 'instant' | 'daily' | 'weekly') => setAlertForm(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailNotifications"
                  checked={alertForm.emailNotifications}
                  onCheckedChange={(checked) => setAlertForm(prev => ({ ...prev, emailNotifications: checked as boolean }))}
                />
                <Label htmlFor="emailNotifications">Email Notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smsNotifications"
                  checked={alertForm.smsNotifications}
                  onCheckedChange={(checked) => setAlertForm(prev => ({ ...prev, smsNotifications: checked as boolean }))}
                />
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAlert} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Alert"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </main>

      <Footer />
    </div>
  );
}
