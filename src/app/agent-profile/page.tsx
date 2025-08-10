"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  UserCheck, Building, MapPin, Phone, Mail, MessageSquare,
  Star, TrendingUp, Calendar, Eye, Heart, Filter,
  Plus, Edit, Trash2, Users, Home, BarChart3,
  Award, Globe, Languages, CheckCircle, Clock,
  Target, Briefcase, Camera, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AgentListing {
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
  status: 'active' | 'pending' | 'sold' | 'draft';
  views: number;
  inquiries: number;
  listedDate: string;
  featured: boolean;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyTitle: string;
  message: string;
  status: 'new' | 'contacted' | 'viewing_scheduled' | 'closed';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  lastContact?: string;
}

interface AgentStats {
  totalListings: number;
  activeListings: number;
  soldThisMonth: number;
  totalLeads: number;
  newLeads: number;
  scheduledViewings: number;
  averageResponse: string;
  rating: number;
  reviewCount: number;
  profileViews: number;
}

export default function AgentProfilePage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not authenticated or not an agent
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else if (user?.role !== 'agent') {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== 'agent') {
    return null;
  }

  // Sample data for agent
  const agentStats: AgentStats = {
    totalListings: 24,
    activeListings: 18,
    soldThisMonth: 3,
    totalLeads: 47,
    newLeads: 8,
    scheduledViewings: 12,
    averageResponse: "2.5 hours",
    rating: 4.8,
    reviewCount: 32,
    profileViews: 156
  };

  const agentListings: AgentListing[] = [
    {
      id: "1",
      title: "Modern Ocean View Villa",
      price: 750000,
      location: "Santa Maria",
      island: "Sal",
      type: "Villa",
      bedrooms: 4,
      bathrooms: 3,
      area: 320,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      status: "active",
      views: 245,
      inquiries: 12,
      listedDate: "2024-12-15",
      featured: true
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
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      status: "pending",
      views: 189,
      inquiries: 8,
      listedDate: "2024-12-10",
      featured: false
    },
    {
      id: "3",
      title: "Beachfront Townhouse",
      price: 620000,
      location: "Mindelo",
      island: "São Vicente",
      type: "Townhouse",
      bedrooms: 3,
      bathrooms: 3,
      area: 250,
      image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      status: "sold",
      views: 312,
      inquiries: 15,
      listedDate: "2024-11-28",
      featured: false
    }
  ];

  const recentLeads: Lead[] = [
    {
      id: "1",
      name: "João Silva",
      email: "joao.silva@email.com",
      phone: "+238 123 456 789",
      propertyId: "1",
      propertyTitle: "Modern Ocean View Villa",
      message: "I'm interested in viewing this property this weekend.",
      status: "new",
      priority: "high",
      createdAt: "2024-12-28T10:30:00Z"
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "+238 987 654 321",
      propertyId: "2",
      propertyTitle: "Luxury Apartment with Pool",
      message: "Can you provide more details about the monthly fees?",
      status: "contacted",
      priority: "medium",
      createdAt: "2024-12-27T14:20:00Z",
      lastContact: "2024-12-27T16:45:00Z"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
      case 'closed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              <h1 className="text-3xl font-bold text-gray-900">Agent Profile</h1>
              <p className="text-gray-600 mt-1">Manage your professional profile and listings</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Update Photo
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Listing
              </Button>
            </div>
          </div>
        </div>

        {/* Agent Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-600">Real Estate Professional</p>
                    <div className="flex items-center mt-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">{agentStats.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({agentStats.reviewCount} reviews)</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800 mb-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified Agent
                    </Badge>
                    <div className="text-sm text-gray-500">
                      License: RE-CV-2024
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">5+</div>
                    <div className="text-sm text-gray-500">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">124</div>
                    <div className="text-sm text-gray-500">Properties Sold</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">{agentStats.totalListings}</div>
                    <div className="text-sm text-gray-500">Total Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{agentStats.profileViews}</div>
                    <div className="text-sm text-gray-500">Profile Views</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Home className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Listings</p>
                      <p className="text-2xl font-bold text-gray-900">{agentStats.activeListings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Sold This Month</p>
                      <p className="text-2xl font-bold text-gray-900">{agentStats.soldThisMonth}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">New Leads</p>
                      <p className="text-2xl font-bold text-gray-900">{agentStats.newLeads}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Scheduled Viewings</p>
                      <p className="text-2xl font-bold text-gray-900">{agentStats.scheduledViewings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Listings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Listings</span>
                    <Button variant="outline" size="sm">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agentListings.slice(0, 3).map((listing) => (
                      <div key={listing.id} className="flex items-center space-x-4">
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {listing.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            €{listing.price.toLocaleString()} • {listing.views} views
                          </p>
                        </div>
                        <Badge className={getStatusColor(listing.status)}>
                          {listing.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Leads */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Leads</span>
                    <Button variant="outline" size="sm">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentLeads.map((lead) => (
                      <div key={lead.id} className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {lead.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {lead.propertyTitle}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getPriorityColor(lead.priority)}>
                            {lead.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Input placeholder="Search listings..." className="w-64" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Listing
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                    {listing.featured && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                        Featured
                      </Badge>
                    )}
                    <Badge className={`absolute top-2 right-2 ${getStatusColor(listing.status)}`}>
                      {listing.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      €{listing.price.toLocaleString()}
                    </p>
                    <p className="text-gray-600 text-sm mb-3">
                      {listing.location}, {listing.island}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{listing.bedrooms} bed • {listing.bathrooms} bath</span>
                      <span>{listing.area} m²</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {listing.views} views
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {listing.inquiries} inquiries
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Input placeholder="Search leads..." className="w-64" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="viewing_scheduled">Viewing Scheduled</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <Card key={lead.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{lead.name}</h3>
                          <p className="text-gray-600">{lead.email}</p>
                          <p className="text-gray-600">{lead.phone}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Interested in: <Link href={`/property/${lead.propertyId}`} className="text-blue-600 hover:underline">
                              {lead.propertyTitle}
                            </Link>
                          </p>
                          <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                            "{lead.message}"
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex space-x-2">
                          <Badge className={getPriorityColor(lead.priority)}>
                            {lead.priority} priority
                          </Badge>
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                        {lead.lastContact && (
                          <div className="text-xs text-gray-400">
                            Last contact: {new Date(lead.lastContact).toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Lead Conversion Rate</span>
                      <span>23%</span>
                    </div>
                    <Progress value={23} className="mt-1" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Average Response Time</span>
                      <span>{agentStats.averageResponse}</span>
                    </div>
                    <Progress value={85} className="mt-1" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Client Satisfaction</span>
                      <span>{agentStats.rating}/5.0</span>
                    </div>
                    <Progress value={(agentStats.rating / 5) * 100} className="mt-1" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Monthly Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Listings Goal</span>
                      <span>18/25</span>
                    </div>
                    <Progress value={72} className="mt-1" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Sales Goal</span>
                      <span>3/5</span>
                    </div>
                    <Progress value={60} className="mt-1" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Lead Follow-up</span>
                      <span>89%</span>
                    </div>
                    <Progress value={89} className="mt-1" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Top Performer</p>
                        <p className="text-xs text-gray-500">Q4 2024</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Star className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">5-Star Rating</p>
                        <p className="text-xs text-gray-500">Customer satisfaction</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Fast Response</p>
                        <p className="text-xs text-gray-500">Under 3 hours average</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      defaultValue="RE-CV-2024"
                      disabled
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      defaultValue="Real Estate Company"
                      placeholder="Real Estate Company"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    defaultValue="Professional real estate agent in Cape Verde"
                    placeholder="Tell potential clients about your experience and expertise..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Specialties</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Residential', 'Commercial'].map((specialty, index) => (
                        <Badge key={index} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Languages</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['English', 'Portuguese'].map((language, index) => (
                        <Badge key={index} variant="outline">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    Save Profile Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
