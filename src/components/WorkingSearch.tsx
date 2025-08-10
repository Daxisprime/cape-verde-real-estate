"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search, MapPin, X, Home, Building, Building2, TreePine, ShoppingBag, Clock, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
  context?: Array<{ id: string; text: string }>;
  category: 'location' | 'property_type' | 'recent' | 'popular';
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  popularity?: number;
}

interface SelectedLocation {
  id: string;
  name: string;
  type: string;
  category: 'location' | 'property_type' | 'price_range';
  priceRange?: [number, number];
}

interface SearchHistoryItem {
  id: string;
  query: string;
  selections: SelectedLocation[];
  timestamp: number;
  type: 'location' | 'property_type' | 'combined';
}

interface WorkingSearchProps {
  placeholder?: string;
  onLocationSelect?: (locations: SelectedLocation[]) => void;
  onSearch?: (query: string) => void;
  onMapClick?: () => void;
  className?: string;
  showMapButton?: boolean;
}

// Property types data with icons and descriptions
const propertyTypes = [
  { id: 'villa', name: 'Villa', icon: Home, description: 'Luxury standalone properties', popularity: 8 },
  { id: 'apartment', name: 'Apartment', icon: Building, description: 'Modern residential units', popularity: 9 },
  { id: 'house', name: 'House', icon: Home, description: 'Traditional family homes', popularity: 7 },
  { id: 'townhouse', name: 'Townhouse', icon: Building2, description: 'Connected residential properties', popularity: 6 },
  { id: 'land', name: 'Land', icon: TreePine, description: 'Development plots and lots', popularity: 5 },
  { id: 'commercial', name: 'Commercial', icon: ShoppingBag, description: 'Business and retail spaces', popularity: 4 },
];

// Cape Verde locations data with popularity scoring
const capeVerdeLocations = [
  // Santiago Island
  { id: 'praia', name: 'Praia', island: 'Santiago', type: 'City', popularity: 10 },
  { id: 'cidade-velha', name: 'Cidade Velha', island: 'Santiago', type: 'City', popularity: 6 },
  { id: 'tarrafal-santiago', name: 'Tarrafal', island: 'Santiago', type: 'City', popularity: 5 },
  { id: 'assomada', name: 'Assomada', island: 'Santiago', type: 'City', popularity: 4 },
  { id: 'pedra-badejo', name: 'Pedra Badejo', island: 'Santiago', type: 'City', popularity: 3 },

  // Sal Island
  { id: 'santa-maria', name: 'Santa Maria', island: 'Sal', type: 'City', popularity: 10 },
  { id: 'espargos', name: 'Espargos', island: 'Sal', type: 'City', popularity: 7 },
  { id: 'palmeira', name: 'Palmeira', island: 'Sal', type: 'City', popularity: 5 },
  { id: 'pedra-lume', name: 'Pedra de Lume', island: 'Sal', type: 'City', popularity: 6 },

  // São Vicente Island
  { id: 'mindelo', name: 'Mindelo', island: 'São Vicente', type: 'City', popularity: 9 },
  { id: 'baía-das-gatas', name: 'Baía das Gatas', island: 'São Vicente', type: 'City', popularity: 4 },
  { id: 'calhau', name: 'Calhau', island: 'São Vicente', type: 'City', popularity: 3 },
  { id: 'são-pedro', name: 'São Pedro', island: 'São Vicente', type: 'City', popularity: 5 },

  // Boa Vista Island
  { id: 'sal-rei', name: 'Sal Rei', island: 'Boa Vista', type: 'City', popularity: 8 },
  { id: 'povoação-velha', name: 'Povoação Velha', island: 'Boa Vista', type: 'City', popularity: 3 },
  { id: 'joão-galego', name: 'João Galego', island: 'Boa Vista', type: 'City', popularity: 2 },
  { id: 'cabeça-dos-tarafes', name: 'Cabeça dos Tarafes', island: 'Boa Vista', type: 'City', popularity: 2 },

  // Santo Antão Island
  { id: 'porto-novo', name: 'Porto Novo', island: 'Santo Antão', type: 'City', popularity: 6 },
  { id: 'ribeira-grande', name: 'Ribeira Grande', island: 'Santo Antão', type: 'City', popularity: 5 },
  { id: 'paúl', name: 'Paúl', island: 'Santo Antão', type: 'City', popularity: 4 },
  { id: 'ponta-do-sol', name: 'Ponta do Sol', island: 'Santo Antão', type: 'City', popularity: 3 },

  // Fogo Island
  { id: 'são-filipe', name: 'São Filipe', island: 'Fogo', type: 'City', popularity: 6 },
  { id: 'mosteiros', name: 'Mosteiros', island: 'Fogo', type: 'City', popularity: 3 },
  { id: 'chã-das-caldeiras', name: 'Chã das Caldeiras', island: 'Fogo', type: 'City', popularity: 4 },
  { id: 'cova-figueira', name: 'Cova Figueira', island: 'Fogo', type: 'City', popularity: 2 },

  // Islands as search options
  { id: 'santiago-island', name: 'Santiago', island: 'Santiago', type: 'Island', popularity: 9 },
  { id: 'sal-island', name: 'Sal', island: 'Sal', type: 'Island', popularity: 10 },
  { id: 'sao-vicente-island', name: 'São Vicente', island: 'São Vicente', type: 'Island', popularity: 8 },
  { id: 'boa-vista-island', name: 'Boa Vista', island: 'Boa Vista', type: 'Island', popularity: 7 },
  { id: 'santo-antao-island', name: 'Santo Antão', island: 'Santo Antão', type: 'Island', popularity: 6 },
  { id: 'fogo-island', name: 'Fogo', island: 'Fogo', type: 'Island', popularity: 5 },
];

// Search Analytics Service
class SearchAnalyticsService {
  private static readonly STORAGE_KEY = 'search_analytics';

  static trackSearch(query: string, category: string) {
    const analytics = this.getAnalytics();
    const key = `${category}:${query.toLowerCase()}`;
    analytics[key] = (analytics[key] || 0) + 1;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(analytics));
  }

  static trackSelection(item: SearchResult) {
    const analytics = this.getAnalytics();
    const key = `selection:${item.category}:${item.id}`;
    analytics[key] = (analytics[key] || 0) + 1;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(analytics));
  }

  static getPopularItems(): string[] {
    const analytics = this.getAnalytics();
    return Object.entries(analytics)
      .filter(([key]) => key.startsWith('selection:'))
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([key]) => key.split(':')[2]);
  }

  private static getAnalytics(): Record<string, number> {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }
}

// Search History Service
class SearchHistoryService {
  private static readonly STORAGE_KEY = 'search_history';
  private static readonly MAX_HISTORY = 10;

  static addToHistory(query: string, selections: SelectedLocation[]) {
    const history = this.getHistory();
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      selections,
      timestamp: Date.now(),
      type: selections.length > 0 ? 'combined' : 'location'
    };

    // Remove duplicates and add new item
    const filtered = history.filter(item =>
      item.query !== query || JSON.stringify(item.selections) !== JSON.stringify(selections)
    );

    const updated = [newItem, ...filtered].slice(0, this.MAX_HISTORY);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  static getHistory(): SearchHistoryItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  static clearHistory() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export default function WorkingSearch({
  placeholder = "Search Santa Maria, Praia, Mindelo...",
  onLocationSelect,
  onSearch,
  onMapClick,
  className = "",
  showMapButton = false
}: WorkingSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([50000, 1000000]);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Load search history on component mount
  useEffect(() => {
    setSearchHistory(SearchHistoryService.getHistory());
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Perform comprehensive search
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      setIsLoading(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];
    const popularItems = SearchAnalyticsService.getPopularItems();

    // Track search query
    SearchAnalyticsService.trackSearch(searchQuery, 'general');

    // Search locations
    const locationResults = capeVerdeLocations
      .filter(location =>
        location.name.toLowerCase().includes(query) ||
        location.island.toLowerCase().includes(query)
      )
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 6)
      .map(location => ({
        id: location.id,
        place_name: `${location.name}, ${location.island}`,
        center: [0, 0] as [number, number],
        place_type: [location.type.toLowerCase()],
        context: [{ id: 'island', text: location.island }],
        category: 'location' as const,
        popularity: location.popularity
      }));

    // Search property types
    const propertyResults = propertyTypes
      .filter(property =>
        property.name.toLowerCase().includes(query) ||
        property.description.toLowerCase().includes(query)
      )
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 4)
      .map(property => ({
        id: property.id,
        place_name: property.name,
        center: [0, 0] as [number, number],
        place_type: ['property_type'],
        category: 'property_type' as const,
        icon: property.icon,
        description: property.description,
        popularity: property.popularity
      }));

    // Add recent searches if query is short
    const recentResults = searchQuery.length <= 2 ? searchHistory
      .slice(0, 3)
      .map(item => ({
        id: `recent-${item.id}`,
        place_name: item.query,
        center: [0, 0] as [number, number],
        place_type: ['recent'],
        category: 'recent' as const,
        description: `${item.selections.length} filters applied`
      })) : [];

    // Combine results with priority: locations, property types, recent
    searchResults.push(...locationResults, ...propertyResults, ...recentResults);

    setResults(searchResults);
    setShowResults(searchResults.length > 0);
    setIsLoading(false);
  }, [searchHistory]);

  // Handle input change with debouncing
  const handleInputChange = (value: string) => {
    setQuery(value);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length >= 2) {
      setIsLoading(true);
      setShowResults(false);
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    } else if (value.length === 0) {
      // Show recent searches when input is empty
      const recentResults = searchHistory.slice(0, 5).map(item => ({
        id: `recent-${item.id}`,
        place_name: item.query,
        center: [0, 0] as [number, number],
        place_type: ['recent'],
        category: 'recent' as const,
        description: `${item.selections.length} filters applied`
      }));
      setResults(recentResults);
      setShowResults(recentResults.length > 0);
      setIsLoading(false);
    } else {
      setResults([]);
      setShowResults(false);
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) {
        handleLocationSelect(results[0]);
      } else {
        onSearch?.(query);
      }
    }
  };

  // Handle clear button
  const handleClear = () => {
    handleInputChange("");
  };

  // Handle location selection
  const handleLocationSelect = (location: SearchResult) => {
    let newLocation: SelectedLocation;

    // Track selection analytics
    SearchAnalyticsService.trackSelection(location);

    if (location.category === 'recent') {
      // Handle recent search selection
      const historyItem = searchHistory.find(item => `recent-${item.id}` === location.id);
      if (historyItem) {
        setSelectedLocations(historyItem.selections);
        onLocationSelect?.(historyItem.selections);
        setQuery(historyItem.query);
      }
      setResults([]);
      setShowResults(false);
      return;
    } else if (location.category === 'property_type') {
      newLocation = {
        id: location.id,
        name: location.place_name,
        type: 'property_type',
        category: 'property_type'
      };
    } else {
      newLocation = {
        id: location.id,
        name: location.place_name.split(',')[0],
        type: location.place_type[0] || 'place',
        category: 'location'
      };
    }

    // Check if location is already selected
    if (!selectedLocations.find(loc => loc.id === newLocation.id)) {
      const updatedLocations = [...selectedLocations, newLocation];
      setSelectedLocations(updatedLocations);
      onLocationSelect?.(updatedLocations);

      // Add to search history
      SearchHistoryService.addToHistory(query, updatedLocations);
      setSearchHistory(SearchHistoryService.getHistory());
    }

    // Clear search
    handleInputChange("");
  };

  // Handle price range changes
  const handlePriceChange = (values: number[]) => {
    const [min, max] = values;
    setPriceRange([min, max]);

    // Update selected locations with price range
    const priceLocation: SelectedLocation = {
      id: 'price-range',
      name: `€${min.toLocaleString()} - €${max.toLocaleString()}`,
      type: 'price_range',
      category: 'price_range',
      priceRange: [min, max]
    };

    const updatedLocations = selectedLocations.filter(loc => loc.category !== 'price_range');
    updatedLocations.push(priceLocation);
    setSelectedLocations(updatedLocations);
    onLocationSelect?.(updatedLocations);
  };

  // Remove selected location
  const removeLocation = (locationId: string) => {
    const updatedLocations = selectedLocations.filter(loc => loc.id !== locationId);
    setSelectedLocations(updatedLocations);
    onLocationSelect?.(updatedLocations);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedLocations([]);
    handleInputChange("");
    onLocationSelect?.([]);
  };

  // Clear search history
  const clearSearchHistory = () => {
    SearchHistoryService.clearHistory();
    setSearchHistory([]);
  };

  // Get icon for search result
  const getResultIcon = (result: SearchResult) => {
    if (result.category === 'property_type' && result.icon) {
      const IconComponent = result.icon;
      return <IconComponent className="h-4 w-4" />;
    } else if (result.category === 'recent') {
      return <Clock className="h-4 w-4" />;
    } else {
      return <MapPin className="h-4 w-4" />;
    }
  };

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className={`relative ${className}`}>
      {/* Selected Locations Tags */}
      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedLocations.map((location) => (
            <div
              key={location.id}
              className={`flex items-center px-3 py-1 rounded-full text-sm ${
                location.category === 'property_type'
                  ? 'bg-green-600 text-white'
                  : location.category === 'price_range'
                  ? 'bg-purple-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <span>{location.name}</span>
              <button
                onClick={() => removeLocation(location.id)}
                className="ml-2 text-white hover:text-gray-200"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            onClick={clearAllSelections}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Search Input with Map Button */}
      <div className="relative bg-white rounded-lg">
        <div className="flex items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
            <Input
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="pl-10 pr-4 h-12 text-gray-900 placeholder:text-gray-500 bg-white border border-white focus:border-white focus:ring-1 focus:ring-white"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Map Button Inside Search Rectangle */}
          {showMapButton && (
            <Button
              variant="ghost"
              className="bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-3 h-10 ml-2 rounded-md shadow-none relative before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-gray-300"
              onClick={onMapClick}
            >
              <MapPin className="h-4 w-4 mr-1 stroke-current" />
              Map
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Price Range Filter */}
          <div className="border-b border-gray-100 p-3">
            <button
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <span>Price Range: €{priceRange[0].toLocaleString()} - €{priceRange[1].toLocaleString()}</span>
              {showPriceFilter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showPriceFilter && (
              <div className="mt-3">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  min={50000}
                  max={2000000}
                  step={25000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>€50k</span>
                  <span>€2M+</span>
                </div>
              </div>
            )}
          </div>

          {/* Recent Searches */}
          {groupedResults.recent && (
            <div className="border-b border-gray-100">
              <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Recent Searches</span>
                <button
                  onClick={clearSearchHistory}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>
              {groupedResults.recent.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleLocationSelect(result)}
                  className="flex items-center p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                >
                  <Clock className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{result.place_name}</div>
                    <div className="text-xs text-gray-600">{result.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Location Results */}
          {groupedResults.location && (
            <div className="border-b border-gray-100">
              <div className="px-3 py-2 bg-gray-50">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Locations</span>
              </div>
              {groupedResults.location.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleLocationSelect(result)}
                  className="flex items-center p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                >
                  <MapPin className="h-4 w-4 text-blue-600 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 flex items-center">
                      {result.place_name}
                      {result.popularity && result.popularity >= 8 && (
                        <Badge className="ml-2 bg-orange-100 text-orange-800 text-xs">Popular</Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      {result.place_type.join(', ')}
                    </div>
                  </div>
                  <div className="text-xs text-blue-600">+ Add</div>
                </div>
              ))}
            </div>
          )}

          {/* Property Type Results */}
          {groupedResults.property_type && (
            <div>
              <div className="px-3 py-2 bg-gray-50">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Property Types</span>
              </div>
              {groupedResults.property_type.map((result) => {
                const IconComponent = result.icon;
                return (
                  <div
                    key={result.id}
                    onClick={() => handleLocationSelect(result)}
                    className="flex items-center p-3 hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                  >
                    {IconComponent && <IconComponent className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />}
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 flex items-center">
                        {result.place_name}
                        {result.popularity && result.popularity >= 8 && (
                          <Badge className="ml-2 bg-orange-100 text-orange-800 text-xs">Popular</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">{result.description}</div>
                    </div>
                    <div className="text-xs text-green-600">+ Add</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {showResults && Object.keys(groupedResults).length === 0 && !isLoading && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-3">
          <div className="text-sm text-gray-700 text-center">
            No results found for "{query}"
          </div>
        </div>
      )}

      {/* Token Warning */}
      {!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('example-token') ? (
        <div className="absolute top-full left-0 right-0 mt-1 bg-amber-50 border border-amber-200 rounded-lg p-3 z-50">
          <div className="text-xs text-amber-800">
            <strong>Enhanced Search Ready:</strong> Location search, property types, price filtering & analytics enabled
          </div>
        </div>
      ) : null}
    </div>
  );
}
