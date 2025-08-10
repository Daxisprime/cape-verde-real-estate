// Property favorites and alerts TypeScript interfaces

export interface PropertyFavorite {
  id: string;
  userId: string;
  propertyId: string;
  addedAt: string;
  notes?: string;
  tags?: string[];
  property?: {
    id: string;
    title: string;
    price: number;
    location: string;
    island: string;
    type: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    mainImage: string;
    status: string;
    priceHistory?: PriceHistoryEntry[];
  };
}

export interface PriceHistoryEntry {
  date: string;
  price: number;
  change: number;
  changePercentage: number;
}

export interface PropertyAlert {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;

  // Alert criteria
  criteria: {
    location?: string;
    island?: string;
    propertyTypes?: string[];
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    bathrooms?: number;
    areaMin?: number;
    areaMax?: number;
    keywords?: string[];
    agentIds?: string[];
  };

  // Notification settings
  notifications: {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    maxPerDay?: number;
  };

  // Alert conditions
  conditions: {
    newListings: boolean;
    priceChanges: boolean;
    priceDrops: boolean;
    statusChanges: boolean;
    priceDropPercentage?: number;
  };
}

export interface AlertMatch {
  id: string;
  alertId: string;
  propertyId: string;
  matchedAt: string;
  matchReason: 'new_listing' | 'price_drop' | 'price_change' | 'status_change';
  details: {
    previousPrice?: number;
    newPrice?: number;
    priceChange?: number;
    priceChangePercentage?: number;
    previousStatus?: string;
    newStatus?: string;
  };
  notified: boolean;
  notifiedAt?: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  searchParams: {
    query?: string;
    location?: string;
    island?: string;
    propertyType?: string;
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    bathrooms?: number;
    areaMin?: number;
    areaMax?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  alertEnabled: boolean;
  lastRun?: string;
  resultCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
    newListings: boolean;
    marketReports: boolean;
    agentMessages: boolean;
  };
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  maxAlertsPerDay: number;
  preferredCommunication: 'email' | 'phone' | 'whatsapp';
  interests: string[];
  budget: {
    min?: number;
    max?: number;
    currency: 'EUR' | 'USD' | 'CVE';
  };
  preferredLocations: string[];
  propertyTypes: string[];
}

// API Response types
export interface FavoritesResponse {
  success: boolean;
  data?: PropertyFavorite[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AlertsResponse {
  success: boolean;
  data?: PropertyAlert[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AlertMatchesResponse {
  success: boolean;
  data?: AlertMatch[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Component props
export interface FavoriteButtonProps {
  propertyId: string;
  initialFavorited?: boolean;
  onToggle?: (favorited: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface PropertyAlertsManagerProps {
  userId: string;
  onCreateAlert?: (alert: PropertyAlert) => void;
  onUpdateAlert?: (alert: PropertyAlert) => void;
  onDeleteAlert?: (alertId: string) => void;
}

export interface FavoritePropertyCardProps {
  favorite: PropertyFavorite;
  onRemove?: (favoriteId: string) => void;
  onViewProperty?: (propertyId: string) => void;
  onAddNote?: (favoriteId: string, note: string) => void;
  showPriceHistory?: boolean;
}

// Utility types
export type AlertTriggerReason = 'new_listing' | 'price_drop' | 'price_change' | 'status_change';
export type NotificationFrequency = 'immediate' | 'daily' | 'weekly';
export type PropertyStatus = 'available' | 'sold' | 'rented' | 'pending' | 'withdrawn' | 'under-offer';

export interface AlertFilters {
  isActive?: boolean;
  hasMatches?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  triggerCount?: number;
}
