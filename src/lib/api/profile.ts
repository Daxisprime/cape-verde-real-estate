// Client-side API utility for fetching user profiles with links

import { createSupabaseBrowserClient } from '@/lib/supabase';

// Types
export interface UserLink {
  id: string;
  platform: string;
  formatted_url: string;
  display_label: string | null;
  is_verified: boolean;
  display_order: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  roles: string[];
  is_verified: boolean;
  is_active: boolean;
  bio?: string;
  company?: string;
  license_number?: string;
  years_experience?: number;
  specialties?: string[];
  languages?: string[];
  service_areas?: string[];
  created_at: string;
}

export interface ProfileWithLinks {
  profile: UserProfile;
  links: UserLink[];
  stats?: {
    properties_count: number;
    active_listings: number;
  };
}

export interface ProfileError {
  error: string;
  code: string;
  details?: string;
}

// Error codes
export const ProfileErrorCodes = {
  MISSING_PARAMS: 'MISSING_PARAMS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  PROFILE_INACTIVE: 'PROFILE_INACTIVE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

/**
 * Fetch a user's profile along with their public links
 * Uses the Supabase Edge Function for optimized single-call fetching
 */
export async function getUserProfileWithLinks(
  options: { userId?: string; slug?: string; includeStats?: boolean }
): Promise<{ data: ProfileWithLinks | null; error: ProfileError | null }> {
  const { userId, slug, includeStats = false } = options;

  // Validate parameters
  if (!userId && !slug) {
    return {
      data: null,
      error: {
        error: 'Missing required parameter',
        code: ProfileErrorCodes.MISSING_PARAMS,
        details: 'Provide either userId or slug',
      },
    };
  }

  try {
    // Build URL with query parameters
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Fallback to direct database query if Edge Functions not available
      return await getUserProfileDirect(options);
    }

    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (slug) params.set('slug', slug);
    if (includeStats) params.set('includeStats', 'true');

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-user-profile?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data as ProfileError,
      };
    }

    return {
      data: data as ProfileWithLinks,
      error: null,
    };

  } catch (err) {
    console.error('Error fetching profile:', err);

    // Fallback to direct database query on network error
    try {
      return await getUserProfileDirect(options);
    } catch (fallbackErr) {
      return {
        data: null,
        error: {
          error: 'Network error',
          code: ProfileErrorCodes.NETWORK_ERROR,
          details: err instanceof Error ? err.message : 'Failed to fetch profile',
        },
      };
    }
  }
}

/**
 * Direct database query fallback (when Edge Function is unavailable)
 */
async function getUserProfileDirect(
  options: { userId?: string; slug?: string; includeStats?: boolean }
): Promise<{ data: ProfileWithLinks | null; error: ProfileError | null }> {
  const { userId, slug, includeStats = false } = options;

  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return {
      data: null,
      error: {
        error: 'Database not configured',
        code: ProfileErrorCodes.DATABASE_ERROR,
      },
    };
  }

  try {
    // Build profile query
    let profileQuery = supabase
      .from('profiles')
      .select('*');

    if (userId) {
      profileQuery = profileQuery.eq('id', userId);
    } else if (slug) {
      profileQuery = profileQuery.ilike('full_name', slug.replace(/-/g, ' '));
    }

    const { data: profile, error: profileError } = await profileQuery.single();

    if (profileError || !profile) {
      return {
        data: null,
        error: {
          error: 'Profile not found',
          code: ProfileErrorCodes.PROFILE_NOT_FOUND,
          details: profileError?.message,
        },
      };
    }

    // Check if active
    if (!profile.is_active) {
      return {
        data: null,
        error: {
          error: 'Profile is inactive',
          code: ProfileErrorCodes.PROFILE_INACTIVE,
        },
      };
    }

    // Fetch public links
    const { data: links, error: linksError } = await supabase
      .from('user_links')
      .select('id, platform, formatted_url, display_label, is_verified, display_order')
      .eq('user_id', profile.id)
      .eq('is_public', true)
      .order('display_order', { ascending: true });

    if (linksError) {
      console.error('Error fetching links:', linksError);
    }

    // Build response
    const result: ProfileWithLinks = {
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        roles: profile.roles || ['buyer'],
        is_verified: profile.is_verified || false,
        is_active: profile.is_active,
        created_at: profile.created_at,
      },
      links: (links || []).map(link => ({
        id: link.id,
        platform: link.platform,
        formatted_url: link.formatted_url,
        display_label: link.display_label,
        is_verified: link.is_verified || false,
        display_order: link.display_order || 0,
      })),
    };

    // Optionally fetch stats
    if (includeStats && profile.roles?.includes('agent')) {
      const { data: properties } = await supabase
        .from('properties')
        .select('id, status')
        .eq('agent_id', profile.id);

      if (properties) {
        result.stats = {
          properties_count: properties.length,
          active_listings: properties.filter(p => p.status === 'active').length,
        };
      }
    }

    return { data: result, error: null };

  } catch (err) {
    console.error('Direct query error:', err);
    return {
      data: null,
      error: {
        error: 'Database error',
        code: ProfileErrorCodes.DATABASE_ERROR,
        details: err instanceof Error ? err.message : 'Unknown error',
      },
    };
  }
}

/**
 * React hook for fetching profile with links
 */
export function useProfileWithLinks(userId?: string, slug?: string) {
  const [data, setData] = React.useState<ProfileWithLinks | null>(null);
  const [error, setError] = React.useState<ProfileError | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId && !slug) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      const result = await getUserProfileWithLinks({ userId, slug, includeStats: true });
      setData(result.data);
      setError(result.error);
      setIsLoading(false);
    };

    fetchProfile();
  }, [userId, slug]);

  return { data, error, isLoading };
}

// Import React for the hook
import React from 'react';
