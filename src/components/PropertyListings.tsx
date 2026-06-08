"use client";

import React, { useState, useMemo } from 'react';
import { TrendingUp, Filter, Grid, List, GitCompare, X } from 'lucide-react';
import VerifiedPropertyCard from '@/components/VerifiedPropertyCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import PropertyComparison from '@/components/PropertyComparison';
import { capeVerdeProperties, type Property } from '@/data/cape-verde-properties';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyListingsProps {
  searchFilters?: {
    location?: string;
    priceMin?: number;
    priceMax?: number;
    propertyType?: string;
    bedrooms?: number;
    island?: string;
  };
  showFilters?: boolean;
  maxProperties?: number;
  title?: string;
  subtitle?: string;
}

type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'size_asc' | 'size_desc' | 'popular';
type ViewMode = 'grid' | 'list';

export default function PropertyListings({
  searchFilters = {},
  showFilters = true,
  maxProperties,
  title = "Featured PropTech Properties in Cape Verde",
  subtitle = "Discover exceptional properties enhanced with next-generation PropTech features across Cape Verde's beautiful islands"
}: PropertyListingsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedForComparison, setSelectedForComparison] = useState<Property[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(searchFilters);

  const { user } = useAuth();

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let filtered = [...capeVerdeProperties];

    // Apply search filters
    if (currentFilters.location) {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(currentFilters.location!.toLowerCase()) ||
        property.island.toLowerCase().includes(currentFilters.location!.toLowerCase())
      );
    }

    if (currentFilters.priceMin) {
      filtered = filtered.filter(property => property.price >= currentFilters.priceMin!);
    }

    if (currentFilters.priceMax) {
      filtered = filtered.filter(property => property.price <= currentFilters.priceMax!);
    }

    if (currentFilters.propertyType && currentFilters.propertyType !== 'all') {
      filtered = filtered.filter(property =>
        property.type.toLowerCase() === currentFilters.propertyType!.toLowerCase()
      );
    }

    if (currentFilters.bedrooms) {
      filtered = filtered.filter(property => property.bedrooms >= currentFilters.bedrooms!);
    }

    if (currentFilters.island && currentFilters.island !== 'all') {
      filtered = filtered.filter(property => property.island === currentFilters.island);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.listingDate).getTime() - new Date(b.listingDate).getTime());
        break;
      case 'size_asc':
        filtered.sort((a, b) => a.totalArea - b.totalArea);
        break;
      case 'size_desc':
        filtered.sort((a, b) => b.totalArea - a.totalArea);
        break;
      case 'popular':
      default:
        // Sort by featured first, then by price desc
        filtered.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.price - a.price;
        });
        break;
    }

    // Limit number of properties if specified
    if (maxProperties) {
      filtered = filtered.slice(0, maxProperties);
    }

    return filtered;
  }, [currentFilters, sortBy, maxProperties]);

  const handleCompareToggle = (property: Property, selected: boolean) => {
    if (selected) {
      if (selectedForComparison.length < 3) {
        setSelectedForComparison(prev => [...prev, property]);
      }
    } else {
      setSelectedForComparison(prev => prev.filter(p => p.id !== property.id));
    }
  };

  const clearComparison = () => {
    setSelectedForComparison([]);
  };

  const startComparison = () => {
    setIsComparisonOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getFilterSummary = () => {
    const filters = [];
    if (currentFilters.location) filters.push(`Location: ${currentFilters.location}`);
    if (currentFilters.propertyType && currentFilters.propertyType !== 'all') filters.push(`Type: ${currentFilters.propertyType}`);
    if (currentFilters.priceMin) filters.push(`Min: ${formatCurrency(currentFilters.priceMin)}`);
    if (currentFilters.priceMax) filters.push(`Max: ${formatCurrency(currentFilters.priceMax)}`);
    if (currentFilters.bedrooms) filters.push(`${currentFilters.bedrooms}+ bedrooms`);
    if (currentFilters.island && currentFilters.island !== 'all') filters.push(`Island: ${currentFilters.island}`);
    return filters;
  };

  return (
    <>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
          </div>

          {/* Filters and Controls */}
          {showFilters && (
            <div className="mb-8">
              {/* Top Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {filteredProperties.length} properties found
                  </span>

                  {/* Active Filters */}
                  {getFilterSummary().length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {getFilterSummary().map((filter, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {filter}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="size_desc">Largest First</SelectItem>
                      <SelectItem value="size_asc">Smallest First</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode Toggle */}
                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comparison Bar */}
          {selectedForComparison.length > 0 && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <GitCompare className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        {selectedForComparison.length} properties selected for comparison
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {selectedForComparison.map((property) => (
                        <Badge key={property.id} variant="outline" className="bg-white">
                          {property.title.substring(0, 20)}...
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => handleCompareToggle(property, false)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearComparison}
                      className="text-blue-600 border-blue-600"
                    >
                      Clear All
                    </Button>
                    <Button
                      size="sm"
                      onClick={startComparison}
                      disabled={selectedForComparison.length < 2}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Compare {selectedForComparison.length > 1 ? `(${selectedForComparison.length})` : ''}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Property Grid/List */}
          {filteredProperties.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredProperties.map((property) => (
                <VerifiedPropertyCard
                  key={property.id}
                  property={property}
                  enableComparison={true}
                  onCompareToggle={handleCompareToggle}
                  isInComparison={selectedForComparison.some(p => p.id === property.id)}
                  className={viewMode === 'list' ? 'max-w-none' : ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria to find more properties.
              </p>
              <Button onClick={() => setCurrentFilters({})}>
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Load More or Show All */}
          {maxProperties && filteredProperties.length === maxProperties && capeVerdeProperties.length > maxProperties && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                View All Properties
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Showing {maxProperties} of {capeVerdeProperties.length} properties
              </p>
            </div>
          )}

          {/* Statistics */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {capeVerdeProperties.length}+
              </div>
              <div className="text-gray-600">Verified Properties</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {new Set(capeVerdeProperties.map(p => p.island)).size}
              </div>
              <div className="text-gray-600">Islands Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {formatCurrency(Math.round(capeVerdeProperties.reduce((sum, p) => sum + p.price, 0) / capeVerdeProperties.length))}
              </div>
              <div className="text-gray-600">Average Property Price</div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Comparison Modal */}
      {isComparisonOpen && (
        <PropertyComparison
          isOpen={isComparisonOpen}
          onClose={() => setIsComparisonOpen(false)}
          initialProperties={selectedForComparison}
        />
      )}
    </>
  );
}
