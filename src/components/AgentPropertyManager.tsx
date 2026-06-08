'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Edit, Trash2, Eye, EyeOff, Star, TrendingUp, Users,
  Home, Filter, Search, MoreVertical, CheckCircle, Clock,
  AlertTriangle, BarChart3, RefreshCw, Upload, Download,
  Copy, Archive, Sparkles, MapPin, DollarSign, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CAPE_VERDE_CITIES, getCitiesForIsland } from '@/contexts/PropertySearchContext';

interface AgentProperty {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceType: 'sale' | 'rent';
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  island: string;
  city: string;
  address: string;
  description: string;
  images: string[];
  features: string[];
  status: 'draft' | 'pending' | 'active' | 'sold' | 'rented' | 'archived';
  isFeatured: boolean;
  isVerified: boolean;
  views: number;
  inquiries: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface AgentPropertyManagerProps {
  agentId: string;
}

export default function AgentPropertyManager({ agentId }: AgentPropertyManagerProps) {
  const { toast } = useToast();
  const [properties, setProperties] = useState<AgentProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [islandFilter, setIslandFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [isBatchActionDialogOpen, setIsBatchActionDialogOpen] = useState(false);
  const [batchAction, setBatchAction] = useState<string>('');

  // New property form
  const [newProperty, setNewProperty] = useState({
    title: '',
    price: '',
    priceType: 'sale',
    propertyType: 'apartment',
    bedrooms: '2',
    bathrooms: '1',
    area: '',
    island: 'Santiago',
    city: 'Praia',
    address: '',
    description: '',
  });

  // Load properties (mock data for now)
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock data
      const mockProperties: AgentProperty[] = [
        {
          id: '1',
          title: 'Modern Ocean View Villa',
          slug: 'modern-ocean-view-villa',
          price: 750000,
          priceType: 'sale',
          propertyType: 'villa',
          bedrooms: 4,
          bathrooms: 3,
          area: 320,
          island: 'Sal',
          city: 'Santa Maria',
          address: 'Rua da Praia 123',
          description: 'Stunning villa with panoramic ocean views',
          images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
          features: ['Pool', 'Ocean View', 'Garden', 'Garage'],
          status: 'active',
          isFeatured: true,
          isVerified: true,
          views: 245,
          inquiries: 12,
          favorites: 34,
          createdAt: '2024-12-15T10:00:00Z',
          updatedAt: '2024-12-28T10:00:00Z',
          publishedAt: '2024-12-16T10:00:00Z'
        },
        {
          id: '2',
          title: 'Luxury Apartment with Pool',
          slug: 'luxury-apartment-pool',
          price: 450000,
          priceType: 'sale',
          propertyType: 'apartment',
          bedrooms: 3,
          bathrooms: 2,
          area: 180,
          island: 'Santiago',
          city: 'Praia',
          address: 'Av. Cidade de Lisboa 45',
          description: 'Beautiful apartment in prime location',
          images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
          features: ['Pool', 'Balcony', 'Parking'],
          status: 'pending',
          isFeatured: false,
          isVerified: false,
          views: 189,
          inquiries: 8,
          favorites: 22,
          createdAt: '2024-12-10T10:00:00Z',
          updatedAt: '2024-12-27T10:00:00Z',
          publishedAt: null
        },
        {
          id: '3',
          title: 'Beachfront Townhouse',
          slug: 'beachfront-townhouse',
          price: 620000,
          priceType: 'sale',
          propertyType: 'townhouse',
          bedrooms: 3,
          bathrooms: 3,
          area: 250,
          island: 'São Vicente',
          city: 'Mindelo',
          address: 'Rua do Mar 78',
          description: 'Steps from the beach with stunning views',
          images: ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'],
          features: ['Beach Access', 'Terrace', 'Parking'],
          status: 'sold',
          isFeatured: false,
          isVerified: true,
          views: 312,
          inquiries: 15,
          favorites: 45,
          createdAt: '2024-11-28T10:00:00Z',
          updatedAt: '2024-12-20T10:00:00Z',
          publishedAt: '2024-11-30T10:00:00Z'
        },
        {
          id: '4',
          title: 'Mountain Retreat',
          slug: 'mountain-retreat',
          price: 175000,
          priceType: 'sale',
          propertyType: 'house',
          bedrooms: 2,
          bathrooms: 1,
          area: 120,
          island: 'Fogo',
          city: 'Chã das Caldeiras',
          address: 'Zona Vulcânica',
          description: 'Unique property near the volcano',
          images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'],
          features: ['Mountain View', 'Garden', 'Eco-Tourism'],
          status: 'draft',
          isFeatured: false,
          isVerified: false,
          views: 0,
          inquiries: 0,
          favorites: 0,
          createdAt: '2024-12-28T10:00:00Z',
          updatedAt: '2024-12-28T10:00:00Z',
          publishedAt: null
        }
      ];

      setProperties(mockProperties);
      setIsLoading(false);
    };

    loadProperties();
  }, [agentId]);

  // Filter and sort properties
  const filteredProperties = properties
    .filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (islandFilter !== 'all' && p.island !== islandFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        case 'views':
          return b.views - a.views;
        case 'inquiries':
          return b.inquiries - a.inquiries;
        default:
          return 0;
      }
    });

  // Stats
  const stats = {
    total: properties.length,
    active: properties.filter(p => p.status === 'active').length,
    pending: properties.filter(p => p.status === 'pending').length,
    sold: properties.filter(p => p.status === 'sold').length,
    totalViews: properties.reduce((acc, p) => acc + p.views, 0),
    totalInquiries: properties.reduce((acc, p) => acc + p.inquiries, 0),
    featured: properties.filter(p => p.isFeatured).length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'rented': return 'bg-purple-100 text-purple-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectProperty = (propertyId: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map(p => p.id));
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast({
        title: 'Property Deleted',
        description: 'The property has been successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete property.',
        variant: 'destructive',
      });
    }
    setIsDeleteDialogOpen(false);
    setPropertyToDelete(null);
  };

  const handleBatchAction = async () => {
    if (!batchAction || selectedProperties.length === 0) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      switch (batchAction) {
        case 'publish':
          setProperties(prev => prev.map(p =>
            selectedProperties.includes(p.id) ? { ...p, status: 'active' as const } : p
          ));
          toast({ title: 'Properties Published', description: `${selectedProperties.length} properties are now active.` });
          break;
        case 'archive':
          setProperties(prev => prev.map(p =>
            selectedProperties.includes(p.id) ? { ...p, status: 'archived' as const } : p
          ));
          toast({ title: 'Properties Archived', description: `${selectedProperties.length} properties have been archived.` });
          break;
        case 'feature':
          setProperties(prev => prev.map(p =>
            selectedProperties.includes(p.id) ? { ...p, isFeatured: true } : p
          ));
          toast({ title: 'Properties Featured', description: `${selectedProperties.length} properties are now featured.` });
          break;
        case 'delete':
          setProperties(prev => prev.filter(p => !selectedProperties.includes(p.id)));
          toast({ title: 'Properties Deleted', description: `${selectedProperties.length} properties have been deleted.` });
          break;
      }

      setSelectedProperties([]);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to perform batch action.', variant: 'destructive' });
    }

    setIsBatchActionDialogOpen(false);
    setBatchAction('');
  };

  const handleCreateProperty = async () => {
    try {
      // Validate
      if (!newProperty.title || !newProperty.price) {
        toast({ title: 'Error', description: 'Please fill in required fields.', variant: 'destructive' });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const property: AgentProperty = {
        id: `new-${Date.now()}`,
        title: newProperty.title,
        slug: newProperty.title.toLowerCase().replace(/\s+/g, '-'),
        price: parseFloat(newProperty.price),
        priceType: newProperty.priceType as 'sale' | 'rent',
        propertyType: newProperty.propertyType,
        bedrooms: parseInt(newProperty.bedrooms),
        bathrooms: parseInt(newProperty.bathrooms),
        area: parseFloat(newProperty.area) || 0,
        island: newProperty.island,
        city: newProperty.city,
        address: newProperty.address,
        description: newProperty.description,
        images: [],
        features: [],
        status: 'draft',
        isFeatured: false,
        isVerified: false,
        views: 0,
        inquiries: 0,
        favorites: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: null,
      };

      setProperties(prev => [property, ...prev]);
      toast({ title: 'Property Created', description: 'Your property has been saved as a draft.' });
      setIsCreateDialogOpen(false);
      setNewProperty({
        title: '', price: '', priceType: 'sale', propertyType: 'apartment',
        bedrooms: '2', bathrooms: '1', area: '', island: 'Santiago',
        city: 'Praia', address: '', description: '',
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create property.', variant: 'destructive' });
    }
  };

  const islands = ['Santiago', 'Sal', 'São Vicente', 'Boa Vista', 'Fogo', 'Santo Antão', 'Maio', 'Brava', 'São Nicolau'];
  const propertyTypes = ['apartment', 'house', 'villa', 'penthouse', 'townhouse', 'land', 'commercial'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-gray-500">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
            <div className="text-xs text-gray-500">Sold</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalViews}</div>
            <div className="text-xs text-gray-500">Views</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalInquiries}</div>
            <div className="text-xs text-gray-500">Inquiries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.featured}</div>
            <div className="text-xs text-gray-500">Featured</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search & Filters */}
            <div className="flex flex-wrap gap-2 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={islandFilter} onValueChange={setIslandFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Island" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Islands</SelectItem>
                  {islands.map(island => (
                    <SelectItem key={island} value={island}>{island}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                  <SelectItem value="inquiries">Most Inquiries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {selectedProperties.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Batch Actions ({selectedProperties.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setBatchAction('publish'); setIsBatchActionDialogOpen(true); }}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Publish Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setBatchAction('feature'); setIsBatchActionDialogOpen(true); }}>
                      <Star className="h-4 w-4 mr-2" />
                      Feature Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setBatchAction('archive'); setIsBatchActionDialogOpen(true); }}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => { setBatchAction('delete'); setIsBatchActionDialogOpen(true); }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Properties ({filteredProperties.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedProperties.length === filteredProperties.length && filteredProperties.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-500">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No properties found</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProperties.map(property => (
                <div
                  key={property.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                    selectedProperties.includes(property.id) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <Checkbox
                    checked={selectedProperties.includes(property.id)}
                    onCheckedChange={() => handleSelectProperty(property.id)}
                  />

                  <img
                    src={property.images[0] || 'https://via.placeholder.com/100'}
                    alt={property.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                      {property.isFeatured && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      )}
                      {property.isVerified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{property.city}, {property.island}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>{property.area} m²</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      €{property.price.toLocaleString()}
                      {property.priceType === 'rent' && <span className="text-sm font-normal">/mo</span>}
                    </div>
                    <Badge className={getStatusColor(property.status)}>
                      {property.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="text-center">
                      <div className="font-medium">{property.views}</div>
                      <div className="text-xs">views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{property.inquiries}</div>
                      <div className="text-xs">inquiries</div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {property.status === 'draft' && (
                        <DropdownMenuItem>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setPropertyToDelete(property.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Property Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Fill in the basic details. You can add more information after creating.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Title *</Label>
              <Input
                value={newProperty.title}
                onChange={(e) => setNewProperty(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Modern Apartment with Ocean View"
              />
            </div>

            <div>
              <Label>Price (€) *</Label>
              <Input
                type="number"
                value={newProperty.price}
                onChange={(e) => setNewProperty(p => ({ ...p, price: e.target.value }))}
                placeholder="e.g., 250000"
              />
            </div>

            <div>
              <Label>Listing Type</Label>
              <Select
                value={newProperty.priceType}
                onValueChange={(v) => setNewProperty(p => ({ ...p, priceType: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Property Type</Label>
              <Select
                value={newProperty.propertyType}
                onValueChange={(v) => setNewProperty(p => ({ ...p, propertyType: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Island</Label>
              <Select
                value={newProperty.island}
                onValueChange={(v) => {
                  const cities = getCitiesForIsland(v);
                  setNewProperty(p => ({ ...p, island: v, city: cities[0] || '' }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {islands.map(island => (
                    <SelectItem key={island} value={island}>{island}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>City</Label>
              <Select
                value={newProperty.city}
                onValueChange={(v) => setNewProperty(p => ({ ...p, city: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getCitiesForIsland(newProperty.island).map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Bedrooms</Label>
              <Select
                value={newProperty.bedrooms}
                onValueChange={(v) => setNewProperty(p => ({ ...p, bedrooms: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['0', '1', '2', '3', '4', '5', '6+'].map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Bathrooms</Label>
              <Select
                value={newProperty.bathrooms}
                onValueChange={(v) => setNewProperty(p => ({ ...p, bathrooms: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['1', '2', '3', '4', '5+'].map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Area (m²)</Label>
              <Input
                type="number"
                value={newProperty.area}
                onChange={(e) => setNewProperty(p => ({ ...p, area: e.target.value }))}
                placeholder="e.g., 120"
              />
            </div>

            <div className="col-span-2">
              <Label>Address</Label>
              <Input
                value={newProperty.address}
                onChange={(e) => setNewProperty(p => ({ ...p, address: e.target.value }))}
                placeholder="e.g., Rua da Praia 123"
              />
            </div>

            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={newProperty.description}
                onChange={(e) => setNewProperty(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe your property..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProperty}>
              Create Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => propertyToDelete && handleDeleteProperty(propertyToDelete)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Action Dialog */}
      <Dialog open={isBatchActionDialogOpen} onOpenChange={setIsBatchActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Batch Action</DialogTitle>
            <DialogDescription>
              You are about to {batchAction} {selectedProperties.length} properties. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={batchAction === 'delete' ? 'destructive' : 'default'}
              onClick={handleBatchAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
