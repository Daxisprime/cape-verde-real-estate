"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface SearchCriteria {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  propertyType?: string;
  bedrooms?: number;
  island?: string;
  beachDistance?: number;
  type?: string;
  maxPrice?: number;
}

interface AgentProfile {
  licenseNumber: string;
  company: string;
  bio: string;
  specialties: string[];
  languages: string[];
  serviceAreas: string[];
  contactMethods: {
    phone: boolean;
    email: boolean;
    whatsapp: boolean;
  };
}

interface ExtendedPreferences {
  currency: 'EUR' | 'CVE' | 'USD';
  language: 'en' | 'pt' | 'fr';
  theme?: 'light' | 'dark' | 'auto';
  measurementUnit?: 'metric' | 'imperial';
  notifications: {
    email: boolean;
    sms: boolean;
    newListings: boolean;
    priceAlerts: boolean;
    marketUpdates: boolean;
  };
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  priceAlerts?: boolean;
  newListingAlerts?: boolean;
  priceChangeAlerts?: boolean;
  viewingReminders?: boolean;
  marketInsights?: boolean;
  agentMessages?: boolean;
  searchAlerts: Array<{
    id: string;
    name: string;
    criteria: SearchCriteria;
    frequency: 'daily' | 'weekly' | 'monthly';
    active: boolean;
  }>;
}

export type UserRole = 'buyer' | 'agent' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  roles: UserRole[];
  agentProfile?: AgentProfile;
  preferences: ExtendedPreferences;
  favorites: string[];
  savedSearches: Array<{
    id: string;
    name: string;
    criteria: SearchCriteria;
    createdAt: string;
  }>;
  viewingHistory: Array<{
    propertyId: string;
    viewedAt: string;
  }>;
  inquiries: Array<{
    id: string;
    propertyId: string;
    agentId: string;
    message: string;
    status: 'pending' | 'responded' | 'closed';
    createdAt: string;
  }>;
  membershipLevel: 'basic' | 'premium' | 'vip';
  createdAt: string;
  lastLoginAt: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addToFavorites: (propertyId: string) => void;
  removeFromFavorites: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  saveSearch: (name: string, criteria: SearchCriteria) => void;
  deleteSavedSearch: (searchId: string) => void;
  addToViewingHistory: (propertyId: string) => void;
  createInquiry: (propertyId: string, agentId: string, message: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  addRole: (role: UserRole) => Promise<void>;
  removeRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PREFS_STORAGE_KEY = 'procv_user_prefs';

const defaultPreferences: ExtendedPreferences = {
  currency: 'EUR',
  language: 'en',
  theme: 'light',
  measurementUnit: 'metric',
  notifications: {
    email: true,
    sms: false,
    newListings: true,
    priceAlerts: false,
    marketUpdates: false,
  },
  emailNotifications: true,
  smsNotifications: false,
  priceAlerts: false,
  newListingAlerts: true,
  priceChangeAlerts: false,
  viewingReminders: true,
  marketInsights: false,
  agentMessages: true,
  searchAlerts: [],
};

function loadLocalPrefs(): { favorites: string[]; savedSearches: User['savedSearches']; viewingHistory: User['viewingHistory']; preferences: ExtendedPreferences } {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PREFS_STORAGE_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return { favorites: [], savedSearches: [], viewingHistory: [], preferences: defaultPreferences };
}

function saveLocalPrefs(data: { favorites: string[]; savedSearches: User['savedSearches']; viewingHistory: User['viewingHistory']; preferences: ExtendedPreferences }) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(data));
    }
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabaseAuth = useSupabaseAuth();
  const [localData, setLocalData] = useState(loadLocalPrefs);

  useEffect(() => {
    saveLocalPrefs(localData);
  }, [localData]);

  const mapToUser = useCallback((): User | null => {
    if (!supabaseAuth.isAuthenticated || !supabaseAuth.user) return null;
    const profile = supabaseAuth.profile;
    const roleStr = profile?.role as UserRole | null;
    const roles: UserRole[] = roleStr ? [roleStr] : ['buyer'];

    return {
      id: supabaseAuth.user.id,
      email: supabaseAuth.user.email || '',
      name: profile?.name || supabaseAuth.user.user_metadata?.full_name || supabaseAuth.user.email?.split('@')[0] || '',
      avatar: profile?.avatar || undefined,
      phone: profile?.phone || undefined,
      roles,
      preferences: localData.preferences,
      favorites: localData.favorites,
      savedSearches: localData.savedSearches,
      viewingHistory: localData.viewingHistory,
      inquiries: [],
      membershipLevel: (profile?.membership_level as User['membershipLevel']) || 'basic',
      createdAt: profile?.created_at || supabaseAuth.user.created_at || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      verified: profile?.verified ?? false,
    };
  }, [supabaseAuth.isAuthenticated, supabaseAuth.user, supabaseAuth.profile, localData]);

  const user = mapToUser();
  const isAuthenticated = !!user;
  const isLoading = supabaseAuth.isLoading;

  const login = async (email: string, password: string): Promise<void> => {
    const { error } = await supabaseAuth.signIn(email, password);
    if (error) throw new Error(error.message);
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    const { error } = await supabaseAuth.signUp(email, password, { full_name: name });
    if (error) throw new Error(error.message);
  };

  const logout = () => {
    supabaseAuth.signOut();
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (updates.preferences) {
      setLocalData(prev => ({ ...prev, preferences: { ...prev.preferences, ...updates.preferences } }));
    }
    if (updates.favorites !== undefined) {
      setLocalData(prev => ({ ...prev, favorites: updates.favorites! }));
    }
    if (updates.savedSearches !== undefined) {
      setLocalData(prev => ({ ...prev, savedSearches: updates.savedSearches! }));
    }
    if (updates.viewingHistory !== undefined) {
      setLocalData(prev => ({ ...prev, viewingHistory: updates.viewingHistory! }));
    }
    const profileUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) profileUpdates.name = updates.name;
    if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
    if (updates.avatar !== undefined) profileUpdates.avatar = updates.avatar;
    if (Object.keys(profileUpdates).length > 0) {
      await supabaseAuth.updateProfile(profileUpdates as never);
    }
  };

  const addToFavorites = (propertyId: string) => {
    setLocalData(prev => {
      if (prev.favorites.includes(propertyId)) return prev;
      return { ...prev, favorites: [...prev.favorites, propertyId] };
    });
  };

  const removeFromFavorites = (propertyId: string) => {
    setLocalData(prev => ({
      ...prev,
      favorites: prev.favorites.filter(id => id !== propertyId),
    }));
  };

  const isFavorite = (propertyId: string): boolean => {
    return localData.favorites.includes(propertyId);
  };

  const saveSearch = (name: string, criteria: SearchCriteria) => {
    setLocalData(prev => ({
      ...prev,
      savedSearches: [...prev.savedSearches, { id: `search-${Date.now()}`, name, criteria, createdAt: new Date().toISOString() }],
    }));
  };

  const deleteSavedSearch = (searchId: string) => {
    setLocalData(prev => ({
      ...prev,
      savedSearches: prev.savedSearches.filter(s => s.id !== searchId),
    }));
  };

  const addToViewingHistory = (propertyId: string) => {
    setLocalData(prev => ({
      ...prev,
      viewingHistory: [
        { propertyId, viewedAt: new Date().toISOString() },
        ...prev.viewingHistory.filter(v => v.propertyId !== propertyId),
      ].slice(0, 50),
    }));
  };

  const createInquiry = async (): Promise<void> => {};
  const resendVerification = async (): Promise<void> => {};

  const resetPassword = async (email: string): Promise<void> => {
    const { error } = await supabaseAuth.resetPassword(email);
    if (error) throw new Error(error.message);
  };

  const changePassword = async (_currentPassword: string, newPassword: string): Promise<void> => {
    const { error } = await supabaseAuth.updatePassword(newPassword);
    if (error) throw new Error(error.message);
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.roles.includes(role) ?? false;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(r => user?.roles.includes(r));
  };

  const addRole = async (): Promise<void> => {};
  const removeRole = async (): Promise<void> => {};

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    saveSearch,
    deleteSavedSearch,
    addToViewingHistory,
    createInquiry,
    resendVerification,
    resetPassword,
    changePassword,
    hasRole,
    hasAnyRole,
    addRole,
    removeRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
