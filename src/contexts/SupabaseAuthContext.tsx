'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Database, Profile, UserRole } from '@/lib/supabase';

// Auth state interface
interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Auth context interface
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
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

function createSupabaseClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (url && key && !url.includes('your-project') && !key.includes('your-anon-key')) {
    return createClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
  return null;
}

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const supabaseRef = useRef(createSupabaseClient());
  const supabase = supabaseRef.current;

  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      return null;
    }
    return data as Profile;
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    let mounted = true;

    // With persistSession: false, there's no stored session to recover.
    // Set initial state to unauthenticated immediately.
    setState(prev => ({ ...prev, isLoading: false }));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (!mounted) return;
          setState({
            user: session.user,
            session,
            profile,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

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
    });
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

export function useAuthRequired() {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  return { isAuthenticated, isLoading };
}

export function useRole(role: UserRole) {
  const { hasRole, isLoading } = useSupabaseAuth();
  return { hasAccess: hasRole(role), isLoading };
}
