import { createClient, User, Session } from '@supabase/supabase-js';
import type { UserRole, Profile } from './supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase client for auth
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

// Auth result types
export interface AuthResult {
  success: boolean;
  user?: User | null;
  session?: Session | null;
  profile?: Profile | null;
  error?: string;
}

// Sign up with email and password
export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Fetch the profile that was auto-created by trigger
    if (data.user) {
      const profile = await getProfile(data.user.id);
      return {
        success: true,
        user: data.user,
        session: data.session,
        profile
      };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Sign in with email and password
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Fetch the user's profile
    if (data.user) {
      const profile = await getProfile(data.user.id);
      return {
        success: true,
        user: data.user,
        session: data.session,
        profile
      };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Sign out
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAuth.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get current session
export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabaseAuth.auth.getSession();
  return session;
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabaseAuth.auth.getUser();
  return user;
}

// Get user profile from profiles table
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabaseAuth
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

// Update user profile
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  try {
    const { data, error } = await supabaseAuth
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile: data as Profile };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Add role to user
export async function addRole(
  userId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    // First get current roles
    const profile = await getProfile(userId);
    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Check if already has role
    if (profile.roles.includes(role)) {
      return { success: true }; // Already has role
    }

    // Add new role
    const newRoles = [...profile.roles, role];
    const { error } = await supabaseAuth
      .from('profiles')
      .update({ roles: newRoles })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Remove role from user
export async function removeRole(
  userId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await getProfile(userId);
    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Ensure at least one role remains
    if (profile.roles.length <= 1) {
      return { success: false, error: 'User must have at least one role' };
    }

    const newRoles = profile.roles.filter(r => r !== role);
    const { error } = await supabaseAuth
      .from('profiles')
      .update({ roles: newRoles })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Reset password
export async function resetPassword(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Update password
export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAuth.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Listen to auth state changes
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabaseAuth.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
