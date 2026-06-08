"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

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

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role?: 'user' | 'agent' | 'admin';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapProfileToUser(
  profile: Record<string, unknown>,
  favorites: string[],
  savedSearches: User['savedSearches'],
  viewingHistory: User['viewingHistory'],
  inquiries: User['inquiries'],
  searchAlerts: ExtendedPreferences['searchAlerts']
): User {
  return {
    id: profile.id as string,
    email: profile.email as string,
    name: profile.name as string,
    avatar: profile.avatar as string | undefined,
    phone: profile.phone as string | undefined,
    role: (profile.role as User['role']) || 'user',
    membershipLevel: (profile.membership_level as User['membershipLevel']) || 'basic',
    verified: (profile.verified as boolean) ?? false,
    createdAt: (profile.created_at as string) || new Date().toISOString(),
    lastLoginAt: (profile.updated_at as string) || new Date().toISOString(),
    preferences: {
      currency: (profile.currency as ExtendedPreferences['currency']) || 'EUR',
      language: (profile.language as ExtendedPreferences['language']) || 'en',
      theme: (profile.theme as ExtendedPreferences['theme']) || 'light',
      measurementUnit: (profile.measurement_unit as ExtendedPreferences['measurementUnit']) || 'metric',
      notifications: {
        email: (profile.email_notifications as boolean) ?? true,
        sms: (profile.sms_notifications as boolean) ?? false,
        newListings: (profile.new_listing_alerts as boolean) ?? true,
        priceAlerts: (profile.price_alerts as boolean) ?? false,
        marketUpdates: (profile.market_insights as boolean) ?? false,
      },
      emailNotifications: (profile.email_notifications as boolean) ?? true,
      smsNotifications: (profile.sms_notifications as boolean) ?? false,
      priceAlerts: (profile.price_alerts as boolean) ?? false,
      newListingAlerts: (profile.new_listing_alerts as boolean) ?? true,
      priceChangeAlerts: false,
      viewingReminders: true,
      marketInsights: (profile.market_insights as boolean) ?? false,
      agentMessages: (profile.agent_messages as boolean) ?? true,
      searchAlerts,
    },
    favorites,
    savedSearches,
    viewingHistory,
    inquiries,
  };
}

async function loadUserData(userId: string): Promise<User | null> {
  const [profileRes, favoritesRes, searchesRes, historyRes, inquiriesRes, alertsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('favorites').select('property_id').eq('user_id', userId),
    supabase.from('saved_searches').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('viewing_history').select('property_id, viewed_at').eq('user_id', userId).order('viewed_at', { ascending: false }),
    supabase.from('inquiries').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('search_alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  const profile = profileRes.data;
  if (!profile) return null;

  const favorites = (favoritesRes.data || []).map((f: Record<string, unknown>) => f.property_id as string);
  const savedSearches = (searchesRes.data || []).map((s: Record<string, unknown>) => ({
    id: s.id as string,
    name: s.name as string,
    criteria: (s.criteria as SearchCriteria) || {},
    createdAt: s.created_at as string,
  }));
  const viewingHistory = (historyRes.data || []).map((v: Record<string, unknown>) => ({
    propertyId: v.property_id as string,
    viewedAt: v.viewed_at as string,
  }));
  const inquiries = (inquiriesRes.data || []).map((i: Record<string, unknown>) => ({
    id: i.id as string,
    propertyId: i.property_id as string,
    agentId: i.agent_id as string,
    message: i.message as string,
    status: i.status as 'pending' | 'responded' | 'closed',
    createdAt: i.created_at as string,
  }));
  const searchAlerts = (alertsRes.data || []).map((a: Record<string, unknown>) => ({
    id: a.id as string,
    name: a.name as string,
    criteria: (a.criteria as SearchCriteria) || {},
    frequency: a.frequency as 'daily' | 'weekly' | 'monthly',
    active: a.active as boolean,
  }));

  return mapProfileToUser(profile, favorites, savedSearches, viewingHistory, inquiries, searchAlerts);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (userId: string) => {
    const u = await loadUserData(userId);
    setUser(u);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && mounted) {
        await refreshUser(session.user.id);
      }
      if (mounted) setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (!mounted) return;
        if (session?.user) {
          setIsLoading(true);
          await refreshUser(session.user.id);
          setIsLoading(false);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }
    // onAuthStateChange will handle setting the user
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }
    // The trigger will create the profile; onAuthStateChange will refresh
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    setIsLoading(true);

    const profileUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) profileUpdates.name = updates.name;
    if (updates.avatar !== undefined) profileUpdates.avatar = updates.avatar;
    if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
    if (updates.role !== undefined) profileUpdates.role = updates.role;
    if (updates.membershipLevel !== undefined) profileUpdates.membership_level = updates.membershipLevel;
    if (updates.verified !== undefined) profileUpdates.verified = updates.verified;
    if (updates.preferences) {
      const p = updates.preferences;
      if (p.currency !== undefined) profileUpdates.currency = p.currency;
      if (p.language !== undefined) profileUpdates.language = p.language;
      if (p.theme !== undefined) profileUpdates.theme = p.theme;
      if (p.measurementUnit !== undefined) profileUpdates.measurement_unit = p.measurementUnit;
      if (p.emailNotifications !== undefined) profileUpdates.email_notifications = p.emailNotifications;
      if (p.smsNotifications !== undefined) profileUpdates.sms_notifications = p.smsNotifications;
      if (p.priceAlerts !== undefined) profileUpdates.price_alerts = p.priceAlerts;
      if (p.newListingAlerts !== undefined) profileUpdates.new_listing_alerts = p.newListingAlerts;
      if (p.marketInsights !== undefined) profileUpdates.market_insights = p.marketInsights;
      if (p.agentMessages !== undefined) profileUpdates.agent_messages = p.agentMessages;
    }

    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id);

    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }

    await refreshUser(user.id);
    setIsLoading(false);
  };

  const addToFavorites = async (propertyId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, property_id: propertyId });
    if (!error) {
      setUser(prev => prev ? { ...prev, favorites: [...prev.favorites, propertyId] } : null);
    }
  };

  const removeFromFavorites = async (propertyId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId);
    if (!error) {
      setUser(prev => prev ? { ...prev, favorites: prev.favorites.filter(id => id !== propertyId) } : null);
    }
  };

  const isFavorite = (propertyId: string): boolean => {
    return user?.favorites.includes(propertyId) ?? false;
  };

  const saveSearch = async (name: string, criteria: SearchCriteria) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('saved_searches')
      .insert({ user_id: user.id, name, criteria })
      .select()
      .single();
    if (!error && data) {
      const newSearch = {
        id: (data as Record<string, unknown>).id as string,
        name,
        criteria,
        createdAt: (data as Record<string, unknown>).created_at as string,
      };
      setUser(prev => prev ? { ...prev, savedSearches: [...prev.savedSearches, newSearch] } : null);
    }
  };

  const deleteSavedSearch = async (searchId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', searchId)
      .eq('user_id', user.id);
    if (!error) {
      setUser(prev => prev ? { ...prev, savedSearches: prev.savedSearches.filter(s => s.id !== searchId) } : null);
    }
  };

  const addToViewingHistory = async (propertyId: string) => {
    if (!user) return;
    // Upsert: if already viewed, update timestamp
    const { error } = await supabase
      .from('viewing_history')
      .upsert(
        { user_id: user.id, property_id: propertyId, viewed_at: new Date().toISOString() },
        { onConflict: 'user_id,property_id' }
      );
    if (!error) {
      setUser(prev => {
        if (!prev) return null;
        const filtered = prev.viewingHistory.filter(v => v.propertyId !== propertyId);
        return {
          ...prev,
          viewingHistory: [{ propertyId, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 50),
        };
      });
    }
  };

  const createInquiry = async (propertyId: string, agentId: string, message: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    setIsLoading(true);

    const { data, error } = await supabase
      .from('inquiries')
      .insert({ user_id: user.id, property_id: propertyId, agent_id: agentId, message })
      .select()
      .single();

    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }

    if (data) {
      const newInquiry = {
        id: (data as Record<string, unknown>).id as string,
        propertyId,
        agentId,
        message,
        status: 'pending' as const,
        createdAt: (data as Record<string, unknown>).created_at as string,
      };
      setUser(prev => prev ? { ...prev, inquiries: [...prev.inquiries, newInquiry] } : null);
    }
    setIsLoading(false);
  };

  const resendVerification = async (): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
    if (error) throw new Error(error.message);
  };

  const resetPassword = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    // Supabase requires re-authentication to change password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) throw new Error('Current password is incorrect');

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
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
