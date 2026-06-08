// Property-related TypeScript interfaces and types

export interface Property {
  id: string | number;
  title: string;
  price: number;
  location: string;
  island: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: number; // in square meters
  description?: string;
  features?: string[];
  images: string[];
  mainImage: string;
  agent?: Agent;
  status: PropertyStatus;
  dateAdded: string;
  lastUpdated?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  verified?: boolean;
  featured?: boolean;
  newListing?: boolean;
  furnished?: boolean;
  availableFrom?: string;
  pricePerSqm?: number;
  virtualTourUrl?: string;
  documentUrls?: string[];
}

export type PropertyType =
  | 'house'
  | 'apartment'
  | 'villa'
  | 'townhouse'
  | 'studio'
  | 'penthouse'
  | 'land'
  | 'commercial'
  | 'office'
  | 'warehouse'
  | 'retail';

export type PropertyStatus =
  | 'available'
  | 'sold'
  | 'rented'
  | 'pending'
  | 'withdrawn'
  | 'under-offer';

export interface Agent {
  id: string | number;
  name: string;
  company: string;
  email: string;
  phone: string;
  image?: string;
  experience?: number;
  propertiesSold?: number;
  avgSaleTime?: number;
  avgSalePrice?: number;
  rating?: number;
  reviews?: number;
  specialties?: string[];
  islands?: string[];
  verified?: boolean;
  languages?: string[];
}

export interface PropertyFilters {
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: PropertyType;
  island?: string;
  location?: string;
  furnished?: boolean;
  verified?: boolean;
  featured?: boolean;
  newListing?: boolean;
  areaMin?: number;
  areaMax?: number;
  availableFrom?: string;
}

export interface SearchParams extends PropertyFilters {
  query?: string;
  sortBy?: 'price' | 'date' | 'area' | 'bedrooms';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PropertySearchResult {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface MarketStats {
  averagePrice: number;
  medianPrice: number;
  pricePerSqm: number;
  totalProperties: number;
  newListings: number;
  priceGrowth: number;
  marketActivity: 'low' | 'medium' | 'high';
  foreignBuyerPercentage: number;
  averageSaleTime: number;
  priceAchievement: number; // percentage of asking price achieved
}

export interface PropertyValuation {
  propertyId: string;
  estimatedValue: number;
  confidenceLevel: number; // 0-100
  priceRange: {
    min: number;
    max: number;
  };
  pricePerSqm: number;
  factors: ValuationFactor[];
  comparableProperties: Property[];
  generatedAt: string;
  validUntil: string;
}

export interface ValuationFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number; // 0-1
  description: string;
}

export interface PropertyInquiry {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  inquiryType: 'viewing' | 'information' | 'offer' | 'other';
  createdAt: string;
  status: 'new' | 'responded' | 'closed';
}

export interface PropertyFavorite {
  userId: string;
  propertyId: string;
  addedAt: string;
  notes?: string;
}

export interface PropertyAlert {
  id: string;
  userId: string;
  name: string;
  filters: PropertyFilters;
  frequency: 'immediate' | 'daily' | 'weekly';
  active: boolean;
  createdAt: string;
  lastRun?: string;
  matchCount?: number;
}

export interface PropertyComparison {
  properties: Property[];
  comparisonDate: string;
  userId?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Form data types
export interface PropertyFormData extends Omit<Property, 'id' | 'dateAdded' | 'status'> {
  agentId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface PropertyFilterFormData {
  location?: string;
  island?: string;
  propertyType?: string;
  priceRange?: string;
  bedrooms?: string;
  bathrooms?: string;
  furnished?: boolean;
  verified?: boolean;
  newListing?: boolean;
}

// Component prop types
export interface PropertyCardProps {
  property: Property;
  onClick?: (property: Property) => void;
  showFavorite?: boolean;
  showComparison?: boolean;
  layout?: 'grid' | 'list' | 'featured';
  className?: string;
}

export interface PropertySearchProps {
  initialFilters?: PropertyFilters;
  onSearch?: (params: SearchParams) => void;
  showAdvanced?: boolean;
  className?: string;
}

export interface PropertyMapProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPropertyClick?: (property: Property) => void;
  clustered?: boolean;
  className?: string;
}
