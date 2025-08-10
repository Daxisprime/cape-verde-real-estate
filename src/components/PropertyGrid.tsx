'use client';

import React from 'react';
import { usePropertySearch } from '@/contexts/PropertySearchContext';
import VerifiedPropertyCard from '@/components/VerifiedPropertyCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, Home, RefreshCw } from 'lucide-react';

interface PropertyGridProps {
  showTitle?: boolean;
  maxProperties?: number;
  className?: string;
}

export default function PropertyGrid({
  showTitle = true,
  maxProperties,
  className = ''
}: PropertyGridProps) {
  const {
    filteredProperties,
    isLoading,
    searchPerformed,
    resultsCount,
    performSearch,
    clearFilters,
    filters
  } = usePropertySearch();

  // Limit properties if maxProperties is specified
  const propertiesToShow = maxProperties
    ? filteredProperties.slice(0, maxProperties)
    : filteredProperties;

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="h-48 bg-gray-200 animate-pulse" />
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="flex space-x-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <Card className="text-center py-12">
      <CardContent>
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {searchPerformed ? 'No Properties Found' : 'Start Your Property Search'}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {searchPerformed
            ? 'Try adjusting your search criteria or clear filters to see more properties.'
            : 'Use the search filters above to find your perfect property in Cape Verde.'
          }
        </p>
        <div className="flex justify-center space-x-4">
          {searchPerformed && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
          <Button
            onClick={performSearch}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Search className="mr-2 h-4 w-4" />
            {searchPerformed ? 'Search Again' : 'Search Properties'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const NoResultsState = () => (
    <Card className="text-center py-12">
      <CardContent>
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Filter className="h-8 w-8 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Properties Match Your Criteria
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          We couldn't find any properties matching your current search filters.
          Try expanding your search criteria for better results.
        </p>

        {/* Show active filters */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Current filters:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {filters.searchQuery && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Search: "{filters.searchQuery}"
              </span>
            )}
            {filters.propertyType !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Type: {filters.propertyType}
              </span>
            )}
            {filters.minPrice > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Min Price: €{filters.minPrice.toLocaleString()}
              </span>
            )}
            {filters.maxPrice < 2000000 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Max Price: €{filters.maxPrice.toLocaleString()}
              </span>
            )}
            {filters.bedrooms > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {filters.bedrooms}+ Bedrooms
              </span>
            )}
            {filters.island !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Island: {filters.island}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={clearFilters}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear All Filters
          </Button>
          <Button
            onClick={() => {
              // Expand search criteria slightly
              if (filters.maxPrice < 2000000) {
                // Increase max price by 50%
                const newMaxPrice = Math.min(filters.maxPrice * 1.5, 2000000);
                // updateFilter('maxPrice', newMaxPrice);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Search className="mr-2 h-4 w-4" />
            Expand Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className={className}>
        {showTitle && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Searching Properties...
            </h2>
            <p className="text-gray-600">Please wait while we find the best matches for you.</p>
          </div>
        )}
        <LoadingSkeleton />
      </div>
    );
  }

  if (!searchPerformed) {
    return (
      <div className={className}>
        {showTitle && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Property Search
            </h2>
            <p className="text-gray-600">Use the filters above to search for properties in Cape Verde.</p>
          </div>
        )}
        <EmptyState />
      </div>
    );
  }

  if (propertiesToShow.length === 0) {
    return (
      <div className={className}>
        {showTitle && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Search Results
            </h2>
            <p className="text-gray-600">No properties found matching your criteria.</p>
          </div>
        )}
        <NoResultsState />
      </div>
    );
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results
              </h2>
              <p className="text-gray-600">
                {resultsCount} properties found
                {maxProperties && resultsCount > maxProperties && ` (showing first ${maxProperties})`}
              </p>
            </div>

            {maxProperties && resultsCount > maxProperties && (
              <Button variant="outline">
                View All {resultsCount} Properties
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {propertiesToShow.length} of {resultsCount} properties
        </div>
        <div className="flex items-center space-x-2">
          <span>Sort by: {filters.sortBy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {propertiesToShow.map((property) => (
          <VerifiedPropertyCard
            key={property.id}
            property={{
              id: property.id,
              title: property.title,
              price: property.price,
              location: property.location,
              island: property.island,
              type: property.type,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              totalArea: property.totalArea,
              images: property.images,
              features: property.features,
              isFeatured: property.isFeatured
            }}
          />
        ))}
      </div>

      {/* Load More Button */}
      {maxProperties && resultsCount > maxProperties && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              // Navigate to full results page or increase maxProperties
              window.location.href = '/buy'; // Or use router.push
            }}
          >
            View All {resultsCount} Properties
          </Button>
        </div>
      )}
    </div>
  );
}
