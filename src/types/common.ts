// Common TypeScript interfaces and types used throughout the application

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  verified: boolean;
  createdAt: string;
  lastLogin?: string;
  preferences?: UserPreferences;
  profile?: UserProfile;
}

export type UserRole = 'user' | 'agent' | 'admin' | 'developer';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  location?: string;
  languages?: string[];
  interests?: string[];
  notifications?: NotificationSettings;
}

export interface UserPreferences {
  currency: 'EUR' | 'USD' | 'CVE';
  language: 'en' | 'pt' | 'es' | 'fr';
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'auto';
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

export interface NotificationSettings {
  propertyAlerts: boolean;
  priceChanges: boolean;
  newListings: boolean;
  marketUpdates: boolean;
  messages: boolean;
  viewingReminders: boolean;
}

export interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
  external?: boolean;
  requiresAuth?: boolean;
  roles?: UserRole[];
}

export interface DropdownMenuItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  onClick?: () => void;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: unknown) => string | null;
  };
  disabled?: boolean;
  hint?: string;
}

export interface FormData {
  [key: string]: unknown;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  [key: string]: unknown;
}

export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export interface ImageGallery {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  thumbnail?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  isOpen: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error | ApiError;
  retry?: () => void;
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

export interface LayoutProps extends ComponentProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}

// Event types
export interface CustomEvent<T = unknown> {
  type: string;
  data: T;
  timestamp: string;
  source?: string;
}

export interface AnalyticsEvent extends CustomEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId?: string;
}

export interface PropertyViewEvent extends AnalyticsEvent {
  data: {
    propertyId: string;
    viewDuration?: number;
    source: 'search' | 'featured' | 'related' | 'direct' | 'favorite';
    userAgent?: string;
    location?: {
      city?: string;
      country?: string;
    };
  };
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Component state types
export interface ComponentState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
}

export interface AsyncState<T = unknown> extends ComponentState<T> {
  refresh: () => Promise<void>;
  reset: () => void;
}
