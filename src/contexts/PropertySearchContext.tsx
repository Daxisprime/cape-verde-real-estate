'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';

// Cape Verde cities organized by island
export const CAPE_VERDE_CITIES: Record<string, string[]> = {
  'Santiago': ['Praia', 'Tarrafal', 'Assomada', 'Cidade Velha', 'Santa Cruz', 'São Domingos'],
  'Sal': ['Santa Maria', 'Espargos', 'Pedra de Lume', 'Palmeira'],
  'Boa Vista': ['Sal Rei', 'Rabil', 'Povoação Velha'],
  'São Vicente': ['Mindelo', 'Salamansa', 'São Pedro'],
  'Santo Antão': ['Ribeira Grande', 'Porto Novo', 'Paul', 'Ponta do Sol'],
  'Fogo': ['São Filipe', 'Chã das Caldeiras', 'Mosteiros', 'Cova Figueira'],
  'Maio': ['Vila do Maio', 'Calheta', 'Morro'],
  'Brava': ['Nova Sintra', 'Furna', 'Fajã d\'Água'],
  'São Nicolau': ['Ribeira Brava', 'Tarrafal de São Nicolau', 'Preguiça']
};

// Get all cities as a flat array
export const getAllCities = (): string[] => {
  return Object.values(CAPE_VERDE_CITIES).flat();
};

// Get cities for a specific island
export const getCitiesForIsland = (island: string): string[] => {
  if (island === 'all' || !island) {
    return getAllCities();
  }
  return CAPE_VERDE_CITIES[island] || [];
};

export interface PropertyFilters {
  searchQuery: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
  island: string;
  city: string;
  sortBy: 'price-asc' | 'price-desc' | 'newest' | 'oldest' | 'size-asc' | 'size-desc';
  listingType: 'buy' | 'rent' | 'all';
}

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  city?: string;
  island: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  totalArea: number;
  images: string[];
  features: string[];
  isFeatured: boolean;
  listingType: 'buy' | 'rent';
  dateAdded: string;
}

interface PropertySearchContextType {
  // Filters
  filters: PropertyFilters;
  updateFilter: (key: keyof PropertyFilters, value: string | number) => void;
  clearFilters: () => void;

  // Properties
  allProperties: Property[];
  filteredProperties: Property[];
  isLoading: boolean;

  // Search state
  searchPerformed: boolean;
  resultsCount: number;

  // Actions
  performSearch: () => void;
}

const defaultFilters: PropertyFilters = {
  searchQuery: '',
  propertyType: 'all',
  minPrice: 0,
  maxPrice: 2000000,
  bedrooms: 0,
  bathrooms: 0,
  island: 'all',
  city: 'all',
  sortBy: 'newest',
  listingType: 'all'
};

// Sample property data for demonstration
const sampleProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Beachfront Villa',
    price: 450000,
    location: 'Santa Maria, Sal',
    city: 'Santa Maria',
    island: 'Sal',
    type: 'villa',
    bedrooms: 4,
    bathrooms: 3,
    totalArea: 280,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    features: ['Ocean View', 'Pool', 'Garden'],
    isFeatured: true,
    listingType: 'buy',
    dateAdded: '2024-12-20'
  },
  {
    id: '2',
    title: 'City Center Apartment',
    price: 185000,
    location: 'Praia, Santiago',
    city: 'Praia',
    island: 'Santiago',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    totalArea: 95,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    features: ['City View', 'Balcony'],
    isFeatured: false,
    listingType: 'buy',
    dateAdded: '2024-12-18'
  },
  {
    id: '3',
    title: 'Luxury Ocean View Penthouse',
    price: 680000,
    location: 'Mindelo, São Vicente',
    city: 'Mindelo',
    island: 'São Vicente',
    type: 'penthouse',
    bedrooms: 3,
    bathrooms: 3,
    totalArea: 220,
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    features: ['Ocean View', 'Rooftop Terrace', 'Jacuzzi'],
    isFeatured: true,
    listingType: 'buy',
    dateAdded: '2024-12-22'
  },
  {
    id: '4',
    title: 'Traditional Island Home',
    price: 95000,
    location: 'Ribeira Grande, Santo Antão',
    city: 'Ribeira Grande',
    island: 'Santo Antão',
    type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    totalArea: 150,
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    features: ['Garden', 'Traditional Architecture'],
    isFeatured: false,
    listingType: 'buy',
    dateAdded: '2024-12-15'
  },
  {
    id: '5',
    title: 'Modern Rental Apartment',
    price: 1200,
    location: 'Santa Maria, Sal',
    city: 'Santa Maria',
    island: 'Sal',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    totalArea: 85,
    images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    features: ['Furnished', 'Beach Access'],
    isFeatured: false,
    listingType: 'rent',
    dateAdded: '2024-12-21'
  },
  {
    id: '6',
    title: 'Family House with Garden',
    price: 850,
    location: 'Mindelo, São Vicente',
    city: 'Mindelo',
    island: 'São Vicente',
    type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    totalArea: 150,
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    features: ['Garden', 'Family Friendly'],
    isFeatured: false,
    listingType: 'rent',
    dateAdded: '2024-12-19'
  },
  {
    id: '7',
    title: 'Luxury Villa Rental',
    price: 2800,
    location: 'Sal Rei, Boa Vista',
    city: 'Sal Rei',
    island: 'Boa Vista',
    type: 'villa',
    bedrooms: 4,
    bathrooms: 3,
    totalArea: 280,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    features: ['Pool', 'Ocean View', 'Furnished'],
    isFeatured: true,
    listingType: 'rent',
    dateAdded: '2024-12-20'
  },
  {
    id: '8',
    title: 'City Center Studio Rental',
    price: 450,
    location: 'Praia, Santiago',
    city: 'Praia',
    island: 'Santiago',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    totalArea: 45,
    images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    features: ['City View', 'Furnished'],
    isFeatured: false,
    listingType: 'rent',
    dateAdded: '2024-12-18'
  },
  {
    id: '9',
    title: 'Beachfront House for Sale',
    price: 320000,
    location: 'Tarrafal, Santiago',
    city: 'Tarrafal',
    island: 'Santiago',
    type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    totalArea: 180,
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    features: ['Beach Access', 'Garden', 'Terrace'],
    isFeatured: true,
    listingType: 'buy',
    dateAdded: '2024-12-21'
  },
  {
    id: '10',
    title: 'Mountain View Apartment',
    price: 145000,
    location: 'Ribeira Grande, Santo Antão',
    city: 'Ribeira Grande',
    island: 'Santo Antão',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    totalArea: 75,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    features: ['Mountain View', 'Balcony'],
    isFeatured: false,
    listingType: 'buy',
    dateAdded: '2024-12-17'
  },
  {
    id: '11',
    title: 'Espargos City Apartment',
    price: 125000,
    location: 'Espargos, Sal',
    city: 'Espargos',
    island: 'Sal',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    totalArea: 70,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    features: ['City Center', 'Near Airport'],
    isFeatured: false,
    listingType: 'buy',
    dateAdded: '2024-12-16'
  },
  {
    id: '12',
    title: 'Volcanic View House',
    price: 175000,
    location: 'Chã das Caldeiras, Fogo',
    city: 'Chã das Caldeiras',
    island: 'Fogo',
    type: 'house',
    bedrooms: 2,
    bathrooms: 1,
    totalArea: 120,
    images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    features: ['Volcano View', 'Wine Region', 'Eco-Tourism'],
    isFeatured: false,
    listingType: 'buy',
    dateAdded: '2024-12-14'
  }
];

const PropertySearchContext = createContext<PropertySearchContextType | undefined>(undefined);

export function PropertySearchProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters);
  const [allProperties, setAllProperties] = useState<Property[]>(sampleProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(sampleProperties);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(true);

  // Attempt to load live properties from Supabase on mount
  useEffect(() => {
    async function loadLiveProperties() {
      if (!isSupabaseConfigured()) return;
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(100);

        if (error || !data || data.length === 0) return;

        const mapped: Property[] = data.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          location: p.city ? `${p.city}, ${p.island}` : p.island,
          city: p.city,
          island: p.island,
          type: p.property_type,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          totalArea: p.total_area || 0,
          images: p.images || [],
          features: p.features || [],
          isFeatured: p.is_featured,
          listingType: p.price_type === 'rent' ? 'rent' : 'buy',
          dateAdded: p.created_at,
        }));

        const merged = [...mapped, ...sampleProperties];
        setAllProperties(merged);
        setFilteredProperties(merged);
      } catch {
        // Keep mock data on any failure
      }
    }

    loadLiveProperties();
  }, []);

  const updateFilter = (key: keyof PropertyFilters, value: string | number) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };

      // If island changes, reset city to 'all'
      if (key === 'island' && value !== prev.island) {
        newFilters.city = 'all';
      }

      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setFilteredProperties(allProperties);
    setSearchPerformed(false);
  };

  const filterProperties = (properties: Property[], filters: PropertyFilters) => {
    let filtered = [...properties];

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.island.toLowerCase().includes(query) ||
        (property.city && property.city.toLowerCase().includes(query)) ||
        property.features.some(feature => feature.toLowerCase().includes(query))
      );
    }

    // Property type filter
    if (filters.propertyType && filters.propertyType !== 'all') {
      filtered = filtered.filter(property => property.type === filters.propertyType);
    }

    // Price range filter
    filtered = filtered.filter(property =>
      property.price >= filters.minPrice && property.price <= filters.maxPrice
    );

    // Bedrooms filter
    if (filters.bedrooms > 0) {
      filtered = filtered.filter(property => property.bedrooms >= filters.bedrooms);
    }

    // Bathrooms filter
    if (filters.bathrooms > 0) {
      filtered = filtered.filter(property => property.bathrooms >= filters.bathrooms);
    }

    // Island filter
    if (filters.island && filters.island !== 'all') {
      filtered = filtered.filter(property => property.island === filters.island);
    }

    // City filter
    if (filters.city && filters.city !== 'all') {
      filtered = filtered.filter(property =>
        property.city === filters.city ||
        property.location.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Listing type filter
    if (filters.listingType && filters.listingType !== 'all') {
      filtered = filtered.filter(property => property.listingType === filters.listingType);
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'size-asc':
          return a.totalArea - b.totalArea;
        case 'size-desc':
          return b.totalArea - a.totalArea;
        case 'oldest':
          return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        case 'newest':
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

    return filtered;
  };

  const performSearch = () => {
    setIsLoading(true);
    setSearchPerformed(true);

    // Simulate API call delay
    setTimeout(() => {
      const filtered = filterProperties(allProperties, filters);
      setFilteredProperties(filtered);
      setIsLoading(false);
    }, 500);
  };

  // Auto-filter when filters change
  useEffect(() => {
    if (searchPerformed) {
      const filtered = filterProperties(allProperties, filters);
      setFilteredProperties(filtered);
    }
  }, [filters, allProperties, searchPerformed]);

  const value: PropertySearchContextType = {
    filters,
    updateFilter,
    clearFilters,
    allProperties,
    filteredProperties,
    isLoading,
    searchPerformed,
    resultsCount: filteredProperties.length,
    performSearch
  };

  return (
    <PropertySearchContext.Provider value={value}>
      {children}
    </PropertySearchContext.Provider>
  );
}

export function usePropertySearch() {
  const context = useContext(PropertySearchContext);
  if (context === undefined) {
    throw new Error('usePropertySearch must be used within a PropertySearchProvider');
  }
  return context;
}
