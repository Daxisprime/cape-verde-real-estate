"use client";

import React, { useState, useMemo } from 'react';
import { Grid, List, GitCompare, X } from 'lucide-react';
import VerifiedPropertyCard from '@/components/VerifiedPropertyCard';
import PropertyDetailDrawer, { type PropertyDrawerItem } from '@/components/PropertyDetailDrawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import PropertyComparison from '@/components/PropertyComparison';
import { capeVerdeProperties, type Property } from '@/data/cape-verde-properties';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchMode } from '@/contexts/SearchModeContext';
import { useLanguage } from '@/contexts/LanguageContext';

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
}

type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'size_asc' | 'size_desc' | 'popular';
type ViewMode = 'grid' | 'list';

const MARKETPLACE_ITEMS: Property[] = [
  {
    id: "mkt-001",
    propertyId: "MKT-001",
    title: "Premium Building Cement (50kg bags)",
    price: 850,
    location: "Praia, Santiago",
    island: "Santiago",
    type: "Building Materials & Tools",
    bedrooms: 0,
    bathrooms: 0,
    totalArea: 0,
    images: ["https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?w=800&h=600&fit=crop"],
    features: ["Bulk Available", "Delivery"],
    description: "High-quality Portland cement for construction projects.",
    coordinates: [-23.5133, 14.9177],
    pricePerSqm: 0,
    agentId: "vendor-001",
    listingDate: "2026-05-20"
  },
  {
    id: "mkt-002",
    propertyId: "MKT-002",
    title: "Samsung Smart TV 55\" 4K",
    price: 65000,
    location: "Santa Maria, Sal",
    island: "Sal",
    type: "Electronics & Computers",
    bedrooms: 0,
    bathrooms: 0,
    totalArea: 0,
    images: ["https://images.pexels.com/photos/6782567/pexels-photo-6782567.jpeg?w=800&h=600&fit=crop"],
    features: ["Warranty", "Free Setup"],
    description: "Brand new Samsung 55 inch smart TV with 4K resolution.",
    coordinates: [-22.9, 16.73],
    pricePerSqm: 0,
    agentId: "vendor-002",
    listingDate: "2026-06-01"
  },
  {
    id: "mkt-003",
    propertyId: "MKT-003",
    title: "Professional Plumbing Services",
    price: 3500,
    location: "Mindelo, Sao Vicente",
    island: "Sao Vicente",
    type: "Maintenance & Repair Services",
    bedrooms: 0,
    bathrooms: 0,
    totalArea: 0,
    images: ["https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?w=800&h=600&fit=crop"],
    features: ["Licensed", "Emergency Service", "Free Estimate"],
    description: "Reliable plumbing installation and repair services across Sao Vicente.",
    coordinates: [-24.98, 16.87],
    pricePerSqm: 0,
    agentId: "vendor-003",
    listingDate: "2026-05-28"
  },
  {
    id: "mkt-004",
    propertyId: "MKT-004",
    title: "Modern Kitchen Set - Complete",
    price: 185000,
    location: "Espargos, Sal",
    island: "Sal",
    type: "Home, Furniture & Appliances",
    bedrooms: 0,
    bathrooms: 0,
    totalArea: 0,
    images: ["https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?w=800&h=600&fit=crop"],
    features: ["Installation Included", "Custom Design"],
    description: "Complete modern kitchen cabinetry and appliance package.",
    coordinates: [-22.93, 16.74],
    pricePerSqm: 0,
    agentId: "vendor-004",
    listingDate: "2026-06-03"
  },
  {
    id: "mkt-005",
    propertyId: "MKT-005",
    title: "Legal & Notary Services",
    price: 15000,
    location: "Praia, Santiago",
    island: "Santiago",
    type: "Professional Services",
    bedrooms: 0,
    bathrooms: 0,
    totalArea: 0,
    images: ["https://images.pexels.com/photos/5668882/pexels-photo-5668882.jpeg?w=800&h=600&fit=crop"],
    features: ["Property Transfers", "Contracts", "Bilingual"],
    description: "Comprehensive legal services for property transactions and business registrations.",
    coordinates: [-23.51, 14.92],
    pricePerSqm: 0,
    agentId: "vendor-005",
    listingDate: "2026-05-15"
  },
  {
    id: "mkt-006",
    propertyId: "MKT-006",
    title: "Designer Clothing Boutique Collection",
    price: 4500,
    location: "Santa Maria, Sal",
    island: "Sal",
    type: "Fashion & Retail",
    bedrooms: 0,
    bathrooms: 0,
    totalArea: 0,
    images: ["https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=800&h=600&fit=crop"],
    features: ["Local Designs", "Custom Orders"],
    description: "Curated collection of Cape Verdean designer fashion and accessories.",
    coordinates: [-22.9, 16.73],
    pricePerSqm: 0,
    agentId: "vendor-006",
    listingDate: "2026-06-05"
  },
];

export default function PropertyListings({
  searchFilters = {},
  showFilters = true,
  maxProperties,
}: PropertyListingsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedForComparison, setSelectedForComparison] = useState<Property[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(searchFilters);

  const { user } = useAuth();
  const { searchMode, listingType } = useSearchMode();
  const { t } = useLanguage();
  const [selectedDrawerProperty, setSelectedDrawerProperty] = useState<PropertyDrawerItem | null>(null);

  function handlePropertySelect(property: Property) {
    setSelectedDrawerProperty({
      id: property.id,
      title: property.title,
      price: property.price,
      location: property.location,
      island: property.island,
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.totalArea,
      image: property.images?.[0] || '',
      images: property.images || [],
      coordinates: property.coordinates,
      featured: property.isFeatured || false,
      description: property.description || '',
      features: property.features || [],
      agentId: property.agentId || undefined,
    });
  }

  const getDynamicTitle = () => {
    if (searchMode === "markets") return t.markets;
    if (listingType === "rent") return t.forRent;
    return t.forSaleTab;
  };

  const filteredProperties = useMemo(() => {
    let filtered: Property[];

    if (searchMode === "markets") {
      filtered = [...MARKETPLACE_ITEMS];
    } else {
      filtered = [...capeVerdeProperties];
    }

    if (searchMode === "realestate") {
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
    }

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
        filtered.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.price - a.price;
        });
        break;
    }

    if (maxProperties) {
      filtered = filtered.slice(0, maxProperties);
    }

    return filtered;
  }, [searchMode, listingType, currentFilters, sortBy, maxProperties]);

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
          {/* Dynamic Mode-dependent Headline */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{getDynamicTitle()}</h2>
          </div>

          {/* Filters and Controls */}
          {showFilters && (
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {filteredProperties.length} {searchMode === "markets" ? t.itemsFound : t.properties}
                  </span>

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
                      {searchMode === "realestate" && <SelectItem value="size_desc">Largest First</SelectItem>}
                      {searchMode === "realestate" && <SelectItem value="size_asc">Smallest First</SelectItem>}
                    </SelectContent>
                  </Select>

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
                        {selectedForComparison.length} selected for comparison
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
            viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredProperties.map((property) => (
                  <VerifiedPropertyCard
                    key={property.id}
                    property={property}
                    enableComparison={searchMode === "realestate"}
                    onCompareToggle={handleCompareToggle}
                    isInComparison={selectedForComparison.some(p => p.id === property.id)}
                    onSelect={handlePropertySelect}
                    className="max-w-none"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full">
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProperties.map((property) => (
                    <VerifiedPropertyCard
                      key={property.id}
                      property={property}
                      enableComparison={searchMode === "realestate"}
                      onCompareToggle={handleCompareToggle}
                      isInComparison={selectedForComparison.some(p => p.id === property.id)}
                      onSelect={handlePropertySelect}
                    />
                  ))}
                </div>
                <div className="columns-2 gap-2 sm:hidden">
                  {filteredProperties.map((property) => (
                    <div key={property.id} className="break-inside-avoid mb-2 w-full inline-block">
                      <VerifiedPropertyCard
                        property={property}
                        enableComparison={searchMode === "realestate"}
                        onCompareToggle={handleCompareToggle}
                        isInComparison={selectedForComparison.some(p => p.id === property.id)}
                        onSelect={handlePropertySelect}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria to find more listings.
              </p>
              <Button onClick={() => setCurrentFilters({})}>
                Clear All Filters
              </Button>
            </div>
          )}

          {maxProperties && filteredProperties.length === maxProperties && capeVerdeProperties.length > maxProperties && searchMode === "realestate" && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                View All Properties
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Showing {maxProperties} of {capeVerdeProperties.length} properties
              </p>
            </div>
          )}
        </div>
      </section>

      {isComparisonOpen && (
        <PropertyComparison
          isOpen={isComparisonOpen}
          onClose={() => setIsComparisonOpen(false)}
          initialProperties={selectedForComparison}
        />
      )}

      <PropertyDetailDrawer property={selectedDrawerProperty} onClose={() => setSelectedDrawerProperty(null)} />
    </>
  );
}
