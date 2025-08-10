'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Home, Plus, Edit, Trash2, Eye, MapPin, Bed, Bath, Square,
  DollarSign, TrendingUp, Users, Calendar, Filter, Search,
  BarChart3, PieChart, Activity, RefreshCw, CheckCircle,
  AlertCircle, Clock, Star, Heart, Download, Upload
} from 'lucide-react';
import type { Property, PropertyFilters, Agent } from '@/types/property';
import type { ApiResponse, PaginatedResponse } from '@/types/property';
import Image from 'next/image';

interface PropertyManagementDashboardProps {
  initialProperties?: Property[];
  userRole?: 'admin' | 'agent' | 'user';
}

export default function PropertyManagementDashboard({
  initialProperties = [],
  userRole = 'admin'
}: PropertyManagementDashboardProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch properties from API
  const fetchProperties = async (params: Record<string, string> = {}) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams(params);
      const response = await fetch(`/api/properties?${searchParams}`);
      const data: PaginatedResponse<{
        properties: Property[];
        total: number;
        page: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
      }> = await response.json();

      if (data.success && data.data) {
        setProperties(data.data.properties);
        setFilteredProperties(data.data.properties);
        setCurrentPage(data.data.page);
        setTotalPages(data.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (initialProperties.length === 0) {
      fetchProperties();
    }
  }, [initialProperties.length]);

  // Filter properties based on search and filters
  useEffect(() => {
    let filtered = [...properties];

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.island.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.island) {
      filtered = filtered.filter(property => property.island === filters.island);
    }
    if (filters.propertyType) {
      filtered = filtered.filter(property => property.type === filters.propertyType);
    }
    if (filters.verified !== undefined) {
      filtered = filtered.filter(property => property.verified === filters.verified);
    }
    if (filters.featured !== undefined) {
      filtered = filtered.filter(property => property.featured === filters.featured);
    }

    setFilteredProperties(filtered);
  }, [properties, searchQuery, filters]);

  // Delete property
  const deleteProperty = async (propertyId: string | number) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        alert('Property deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete property:', error);
      alert('Failed to delete property');
    }
  };

  // Calculate statistics
  const stats = {
    total: properties.length,
    available: properties.filter(p => p.status === 'available').length,
    sold: properties.filter(p => p.status === 'sold').length,
    rented: properties.filter(p => p.status === 'rented').length,
    verified: properties.filter(p => p.verified).length,
    featured: properties.filter(p => p.featured).length,
    averagePrice: properties.length > 0 ? Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length) : 0,
    totalValue: properties.reduce((sum, p) => sum + p.price, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
            <p className="text-gray-600">Manage your Cape Verde property portfolio</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => fetchProperties()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {userRole !== 'user' && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Home className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Price</p>
                  <p className="text-3xl font-bold text-purple-600">€{stats.averagePrice.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-3xl font-bold text-orange-600">€{(stats.totalValue / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Properties</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by title, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="island-filter">Island</Label>
                <Select value={filters.island || ''} onValueChange={(value) =>
                  setFilters(prev => ({ ...prev, island: value || undefined }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Islands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Islands</SelectItem>
                    <SelectItem value="Sal">Sal</SelectItem>
                    <SelectItem value="Santiago">Santiago</SelectItem>
                    <SelectItem value="São Vicente">São Vicente</SelectItem>
                    <SelectItem value="Boa Vista">Boa Vista</SelectItem>
                    <SelectItem value="Santo Antão">Santo Antão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type-filter">Property Type</Label>
                <Select value={filters.propertyType || ''} onValueChange={(value) =>
                  setFilters(prev => ({ ...prev, propertyType: value as Property['type'] || undefined }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={filters.verified?.toString() || ''} onValueChange={(value) =>
                  setFilters(prev => ({ ...prev, verified: value === '' ? undefined : value === 'true' }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Properties ({filteredProperties.length})</span>
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProperties.map((property) => (
                <div key={property.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <Image
                          src={property.mainImage}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold">{property.title}</h3>
                          <div className="flex space-x-2">
                            {property.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                            )}
                            {property.verified && (
                              <Badge className="bg-green-100 text-green-800">Verified</Badge>
                            )}
                            {property.newListing && (
                              <Badge className="bg-blue-100 text-blue-800">New</Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{property.location}, {property.island}</span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            <span>{property.bedrooms}</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            <span>{property.bathrooms}</span>
                          </div>
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-1" />
                            <span>{property.area}m²</span>
                          </div>
                          <Badge variant="outline">{property.type}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          €{property.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          €{property.pricePerSqm}/m²
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {userRole !== 'user' && (
                          <>
                            <Button variant="outline" size="sm"
                              onClick={() => {
                                setSelectedProperty(property);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this property?')) {
                                  deleteProperty(property.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredProperties.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No properties found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Property Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Property Title</Label>
                <Input id="title" placeholder="Enter property title" />
              </div>
              <div>
                <Label htmlFor="price">Price (€)</Label>
                <Input id="price" type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Enter location" />
              </div>
              <div>
                <Label htmlFor="island">Island</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select island" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sal">Sal</SelectItem>
                    <SelectItem value="santiago">Santiago</SelectItem>
                    <SelectItem value="sao-vicente">São Vicente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Property description" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Property
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
