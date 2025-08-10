'use client';

import React, { useState } from 'react';
import { Search, Filter, X, MapPin, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePropertySearch } from '@/contexts/PropertySearchContext';
import { useRouter } from 'next/navigation';

interface PropertyFilterBarProps {
  showAdvanced?: boolean;
  listingType?: 'buy' | 'rent' | 'all';
}

export default function PropertyFilterBar({
  showAdvanced = true,
  listingType = 'all'
}: PropertyFilterBarProps) {
  const {
    filters,
    updateFilter,
    clearFilters,
    filteredProperties,
    isLoading,
    searchPerformed,
    resultsCount,
    performSearch
  } = usePropertySearch();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const router = useRouter();

  // Set listing type when component mounts
  React.useEffect(() => {
    if (listingType !== 'all') {
      updateFilter('listingType', listingType);
    }
  }, [listingType, updateFilter]); // Include updateFilter dependency

  // Perform initial search once when component mounts
  React.useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [performSearch]); // Include performSearch dependency

  const islands = [
    'All Islands', 'Santiago', 'Sal', 'São Vicente', 'Boa Vista',
    'Fogo', 'Santo Antão', 'Maio', 'Brava', 'São Nicolau'
  ];

  const propertyTypes = [
    'All Types', 'Apartment', 'House', 'Villa', 'Penthouse', 'Townhouse', 'Land'
  ];

  const priceRanges = listingType === 'rent' ? [
    { label: 'Any Price', min: 0, max: 10000 },
    { label: '€200 - €500', min: 200, max: 500 },
    { label: '€500 - €800', min: 500, max: 800 },
    { label: '€800 - €1,200', min: 800, max: 1200 },
    { label: '€1,200 - €1,800', min: 1200, max: 1800 },
    { label: '€1,800 - €2,500', min: 1800, max: 2500 },
    { label: '€2,500+', min: 2500, max: 10000 }
  ] : [
    { label: 'Any Price', min: 0, max: 2000000 },
    { label: '€50k - €100k', min: 50000, max: 100000 },
    { label: '€100k - €200k', min: 100000, max: 200000 },
    { label: '€200k - €300k', min: 200000, max: 300000 },
    { label: '€300k - €500k', min: 300000, max: 500000 },
    { label: '€500k - €750k', min: 500000, max: 750000 },
    { label: '€750k - €1M', min: 750000, max: 1000000 },
    { label: '€1M+', min: 1000000, max: 2000000 }
  ];

  const bedroomOptions = ['Any', '1+', '2+', '3+', '4+', '5+'];
  const bathroomOptions = ['Any', '1+', '2+', '3+', '4+'];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'size-asc', label: 'Size: Small to Large' },
    { value: 'size-desc', label: 'Size: Large to Small' }
  ];

  const handleSearch = () => {
    performSearch();
  };

  const handleClearFilters = () => {
    clearFilters();
    if (listingType !== 'all') {
      updateFilter('listingType', listingType);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.propertyType !== 'all') count++;
    if (filters.minPrice > 0 || filters.maxPrice < (listingType === 'rent' ? 10000 : 2000000)) count++;
    if (filters.bedrooms > 0) count++;
    if (filters.bathrooms > 0) count++;
    if (filters.island !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Main Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by location, property type, or features..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10 h-12 text-gray-900"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 lg:flex-nowrap">
            <Select
              value={filters.propertyType}
              onValueChange={(value) => updateFilter('propertyType', value)}
            >
              <SelectTrigger className="h-12 min-w-[140px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type === 'All Types' ? 'all' : type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priceRanges.find(range => range.min === filters.minPrice && range.max === filters.maxPrice)?.label || 'Any Price'}
              onValueChange={(value) => {
                const range = priceRanges.find(r => r.label === value);
                if (range) {
                  updateFilter('minPrice', range.min);
                  updateFilter('maxPrice', range.max);
                }
              }}
            >
              <SelectTrigger className="h-12 min-w-[140px]">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.label} value={range.label}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.bedrooms === 0 ? 'Any' : `${filters.bedrooms}+`}
              onValueChange={(value) => updateFilter('bedrooms', value === 'Any' ? 0 : parseInt(value))}
            >
              <SelectTrigger className="h-12 min-w-[100px]">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                {bedroomOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 h-12 px-8"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Searching...
              </div>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>

        {/* Advanced Filters Toggle */}
        {showAdvanced && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="h-10"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Advanced Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-blue-600">{activeFilterCount}</Badge>
              )}
            </Button>

            <div className="flex items-center space-x-4">
              {searchPerformed && (
                <div className="text-sm text-gray-600">
                  {isLoading ? 'Searching...' : `${resultsCount} properties found`}
                </div>
              )}

              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="text-gray-600 hover:text-gray-900"
                  size="sm"
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear Filters
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => router.push('/map')}
                className="h-10"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Map View
              </Button>
            </div>
          </div>
        )}

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Island</label>
                <Select
                  value={filters.island}
                  onValueChange={(value) => updateFilter('island', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Island" />
                  </SelectTrigger>
                  <SelectContent>
                    {islands.map((island) => (
                      <SelectItem key={island} value={island === 'All Islands' ? 'all' : island}>
                        {island}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Bathrooms</label>
                <Select
                  value={filters.bathrooms === 0 ? 'Any' : `${filters.bathrooms}+`}
                  onValueChange={(value) => updateFilter('bathrooms', value === 'Any' ? 0 : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bathrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {bathroomOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Min Area (m²)</label>
                <Input
                  type="number"
                  placeholder="Minimum area"
                  min="0"
                  max="1000"
                  className="h-10"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.searchQuery && (
              <Badge variant="secondary" className="flex items-center">
                Search: "{filters.searchQuery}"
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('searchQuery', '')}
                />
              </Badge>
            )}
            {filters.propertyType !== 'all' && (
              <Badge variant="secondary" className="flex items-center">
                Type: {filters.propertyType}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('propertyType', 'all')}
                />
              </Badge>
            )}
            {(filters.minPrice > 0 || filters.maxPrice < (listingType === 'rent' ? 10000 : 2000000)) && (
              <Badge variant="secondary" className="flex items-center">
                Price: €{filters.minPrice.toLocaleString()} - €{filters.maxPrice.toLocaleString()}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => {
                    updateFilter('minPrice', 0);
                    updateFilter('maxPrice', listingType === 'rent' ? 10000 : 2000000);
                  }}
                />
              </Badge>
            )}
            {filters.bedrooms > 0 && (
              <Badge variant="secondary" className="flex items-center">
                {filters.bedrooms}+ Bedrooms
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('bedrooms', 0)}
                />
              </Badge>
            )}
            {filters.bathrooms > 0 && (
              <Badge variant="secondary" className="flex items-center">
                {filters.bathrooms}+ Bathrooms
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('bathrooms', 0)}
                />
              </Badge>
            )}
            {filters.island !== 'all' && (
              <Badge variant="secondary" className="flex items-center">
                Island: {filters.island}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('island', 'all')}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
