'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase';
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
  signUp: (email: string, password: string, metadata?: { full_name?: string }, captchaToken?: string) => Promise<{ error: AuthError | null; confirmationRequired: boolean }>;
  signIn: (email: string, password: string, captchaToken?: string) => Promise<{ error: AuthError | null }>;
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

// Use the global singleton -- never create a new instance
const supabase = createSupabaseBrowserClient();

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
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
    if (error || !data) {
      // Profile doesn't exist yet — create it from auth user metadata
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const newProfile = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
          avatar: authUser.user_metadata?.avatar_url || null,
          phone: authUser.user_metadata?.phone || null,
          role: 'buyer',
          roles: ['buyer'] as UserRole[],
          verified: false,
        };
        await supabase.from('profiles').upsert(newProfile as never);
        return newProfile as unknown as Profile;
      }
      return null;
    }
    const raw = data as Record<string, unknown>;
    const rawRole = typeof raw.role === 'string'
      ? raw.role.replace(/^"|"$/g, '')
      : raw.role != null ? String(raw.role).replace(/^"|"$/g, '') : null;
    return {
      ...raw,
      role: rawRole,
      roles: raw.roles ? (raw.roles as UserRole[]) : (rawRole ? [rawRole as UserRole] : ['buyer']),
    } as Profile;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!supabase) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    let isMounted = true;

    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (!isMounted) return;
        setState({
          user: session.user,
          session,
          profile,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        if (event === 'SIGNED_OUT' || !session?.user) {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
          });
          return;
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          // Wrap async work in IIFE to avoid deadlock
          (async () => {
            const profile = await fetchProfile(session.user.id);
            if (!isMounted) return;
            setState({
              user: session.user,
              session,
              profile,
              isLoading: false,
              isAuthenticated: true,
            });
          })();
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
    // supabase and fetchProfile are stable module-level/useCallback refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string },
    captchaToken?: string
  ): Promise<{ error: AuthError | null; confirmationRequired: boolean }> => {
    if (!supabase) return { error: { message: 'Supabase not configured' } as AuthError, confirmationRequired: false };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        ...(captchaToken ? { captchaToken } : {}),
      },
    });
    if (error) return { error, confirmationRequired: false };

    const confirmationRequired = !data.session;

    // If no session was returned (confirmation required), sign in immediately
    // so the user isn't blocked from accessing their account
    if (confirmationRequired && data.user) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!signInError && signInData?.user && signInData?.session) {
        const profile = await ensureProfile(signInData.user);
        setState({
          user: signInData.user,
          session: signInData.session,
          profile,
          isLoading: false,
          isAuthenticated: true,
        });
        return { error: null, confirmationRequired: true };
      }
    } else if (data.session && data.user) {
      const profile = await ensureProfile(data.user);
      setState({
        user: data.user,
        session: data.session,
        profile,
        isLoading: false,
        isAuthenticated: true,
      });
    }

    return { error: null, confirmationRequired };
  };

  const ensureProfile = useCallback(async (user: User): Promise<Profile | null> => {
    if (!supabase) return null;
    let profile = await fetchProfile(user.id);
    if (!profile) {
      const email = user.email || '';
      const name = user.user_metadata?.full_name || email.split('@')[0] || '';
      await supabase.from('profiles').upsert({
        id: user.id,
        email,
        name,
        role: 'buyer',
        verified: false,
      } as never, { onConflict: 'id' });
      profile = await fetchProfile(user.id);
    }
    return profile;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string, captchaToken?: string): Promise<{ error: AuthError | null }> => {
    if (!supabase) return { error: { message: 'Supabase not configured' } as AuthError };
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    });
    if (authError) return { error: authError };
    if (!authData || !authData.user || !authData.session) {
      return { error: { message: 'Authentication executed but user context is missing.' } as AuthError };
    }
    const profile = await ensureProfile(authData.user);
    setState({
      user: authData.user,
      session: authData.session,
      profile,
      isLoading: false,
      isAuthenticated: true,
    });
    return { error: null };
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
    const { role, roles, ...safeUpdates } = updates as Partial<Profile> & { roles?: unknown };
    const { error } = await supabase.from('profiles').update(safeUpdates as never).eq('id', state.user.id);
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
