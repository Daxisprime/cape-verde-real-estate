'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Database, Profile, UserRole } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  favorites: string[];
}

interface SupabaseAuthContextType extends AuthState {
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithProvider: (provider: 'google' | 'facebook' | 'github') => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  supabase: SupabaseClient<Database> | null;

  // Convenience aliases for legacy consumers
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;

  // Favorites
  addToFavorites: (propertyId: string) => void;
  removeFromFavorites: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;

  // Viewing history
  addToViewingHistory: (propertyId: string) => void;

  // Inquiries
  createInquiry: (propertyId: string, agentId: string, message: string) => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return url && key && !url.includes('your-project') && !key.includes('your-anon-key');
};

const FAVORITES_STORAGE_KEY = 'procv_favorites';

function getFavoritesFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavoritesToStorage(favorites: string[]) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {}
}

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    favorites: [],
  });

  const supabase = isSupabaseConfigured()
    ? createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    : null;

  useEffect(() => {
    setState(prev => ({ ...prev, favorites: getFavoritesFromStorage() }));
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  }, [supabase]);

  const fetchFavorites = useCallback(async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', userId);
    if (data) {
      const ids = data.map((f: { property_id: string }) => f.property_id);
      setState(prev => ({ ...prev, favorites: ids }));
      saveFavoritesToStorage(ids);
    }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState(prev => ({
            ...prev,
            user: session.user,
            session,
            profile,
            isLoading: false,
            isAuthenticated: true,
          }));
          fetchFavorites(session.user.id);
        } else {
          setState(prev => ({
            ...prev,
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
          }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState(prev => ({
            ...prev,
            user: session.user,
            session,
            profile,
            isLoading: false,
            isAuthenticated: true,
          }));
          fetchFavorites(session.user.id);
        } else {
          setState(prev => ({
            ...prev,
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
            favorites: [],
          }));
          saveFavoritesToStorage([]);
        }
      }
    );

    return () => { subscription.unsubscribe(); };
  }, [supabase, fetchProfile, fetchFavorites]);

  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string }
  ): Promise<{ error: AuthError | null }> => {
    if (!supabase) return { error: { message: 'Supabase not configured' } as AuthError };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    if (!supabase) return { error: { message: 'Supabase not configured' } as AuthError };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signInWithProvider = async (
    provider: 'google' | 'facebook' | 'github'
  ): Promise<{ error: AuthError | null }> => {
    if (!supabase) return { error: { message: 'Supabase not configured' } as AuthError };
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error };
  };

  const signOut = async (): Promise<void> => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setState({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      favorites: [],
    });
    saveFavoritesToStorage([]);
  };

  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    if (!supabase) return { error: { message: 'Supabase not configured' } as AuthError };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
    if (!supabase) return { error: { message: 'Supabase not configured' } as AuthError };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: Error | null }> => {
    if (!supabase || !state.user) return { error: new Error('Not authenticated') };
    const { error } = await supabase.from('profiles').update(updates).eq('id', state.user.id);
    if (error) return { error };
    const profile = await fetchProfile(state.user.id);
    setState(prev => ({ ...prev, profile }));
    return { error: null };
  };

  const refreshProfile = async (): Promise<void> => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    setState(prev => ({ ...prev, profile }));
  };

  const hasRole = (role: UserRole): boolean => {
    return state.profile?.roles?.includes(role) ?? false;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => state.profile?.roles?.includes(role));
  };

  // Legacy-compatible convenience methods

  const login = async (email: string, password: string): Promise<void> => {
    const { error } = await signIn(email, password);
    if (error) throw new Error(error.message);
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    const { error } = await signUp(email, password, { full_name: name });
    if (error) throw new Error(error.message);
  };

  const logout = signOut;

  const changePassword = async (_currentPassword: string, newPassword: string): Promise<void> => {
    const { error } = await updatePassword(newPassword);
    if (error) throw new Error(error.message);
  };

  const addToFavorites = (propertyId: string) => {
    const updated = [...state.favorites];
    if (!updated.includes(propertyId)) {
      updated.push(propertyId);
      setState(prev => ({ ...prev, favorites: updated }));
      saveFavoritesToStorage(updated);

      if (supabase && state.user) {
        supabase.from('favorites').insert({ user_id: state.user.id, property_id: propertyId }).then();
      }
    }
  };

  const removeFromFavorites = (propertyId: string) => {
    const updated = state.favorites.filter(id => id !== propertyId);
    setState(prev => ({ ...prev, favorites: updated }));
    saveFavoritesToStorage(updated);

    if (supabase && state.user) {
      supabase.from('favorites').delete().eq('user_id', state.user.id).eq('property_id', propertyId).then();
    }
  };

  const isFavorite = (propertyId: string): boolean => {
    return state.favorites.includes(propertyId);
  };

  const addToViewingHistory = (propertyId: string) => {
    if (!supabase || !state.user) return;
    supabase.from('viewing_history').upsert({
      user_id: state.user.id,
      property_id: propertyId,
      viewed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,property_id' }).then();
  };

  const createInquiry = async (propertyId: string, agentId: string, message: string): Promise<void> => {
    if (!supabase || !state.user) throw new Error('Not authenticated');
    const { error } = await supabase.from('inquiries').insert({
      user_id: state.user.id,
      property_id: propertyId,
      agent_id: agentId,
      message,
      status: 'pending',
    });
    if (error) throw new Error(error.message);
  };

  const value: SupabaseAuthContextType = {
    ...state,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    hasRole,
    hasAnyRole,
    supabase,
    login,
    register,
    logout,
    changePassword,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addToViewingHistory,
    createInquiry,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}

export const useAuth = useSupabaseAuth;

export function useAuthRequired() {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  return { isAuthenticated, isLoading };
}

export function useRole(role: UserRole) {
  const { hasRole, isLoading } = useSupabaseAuth();
  return { hasAccess: hasRole(role), isLoading };
}
