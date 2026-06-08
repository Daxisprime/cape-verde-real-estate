// Supabase Edge Function: get-user-profile
// Fetches a user's profile along with all their active (public) external links
//
// Deploy with: supabase functions deploy get-user-profile
//
// Usage:
// GET /functions/v1/get-user-profile?userId=<uuid>
// GET /functions/v1/get-user-profile?slug=<agent-slug>

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Response types
interface UserLink {
  id: string;
  platform: string;
  formatted_url: string;
  display_label: string | null;
  is_verified: boolean;
  display_order: number;
}

interface UserProfile {
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

interface ProfileWithLinks {
  profile: UserProfile;
  links: UserLink[];
  stats?: {
    properties_count: number;
    active_listings: number;
  };
}

interface ErrorResponse {
  error: string;
  code: string;
  details?: string;
}

// Error codes
const ErrorCodes = {
  MISSING_PARAMS: 'MISSING_PARAMS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  PROFILE_INACTIVE: 'PROFILE_INACTIVE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
} as const;

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
        code: ErrorCodes.INVALID_REQUEST,
      } as ErrorResponse),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Parse URL parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const slug = url.searchParams.get('slug');
    const includeStats = url.searchParams.get('includeStats') === 'true';

    // Validate parameters - need either userId or slug
    if (!userId && !slug) {
      return new Response(
        JSON.stringify({
          error: 'Missing required parameter: userId or slug',
          code: ErrorCodes.MISSING_PARAMS,
          details: 'Provide either ?userId=<uuid> or ?slug=<agent-slug>',
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate UUID format if userId provided
    if (userId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        return new Response(
          JSON.stringify({
            error: 'Invalid userId format',
            code: ErrorCodes.INVALID_REQUEST,
            details: 'userId must be a valid UUID',
          } as ErrorResponse),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Build profile query
    let profileQuery = supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        phone,
        roles,
        is_verified,
        is_active,
        created_at,
        updated_at
      `);

    // Query by userId or slug
    if (userId) {
      profileQuery = profileQuery.eq('id', userId);
    } else if (slug) {
      // Assuming slug is stored or derived from full_name
      // You might have a separate 'slug' column - adjust as needed
      profileQuery = profileQuery.ilike('full_name', slug.replace(/-/g, ' '));
    }

    // Execute profile query
    const { data: profileData, error: profileError } = await profileQuery.single();

    // Handle profile not found
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({
            error: 'User profile not found',
            code: ErrorCodes.PROFILE_NOT_FOUND,
            details: userId
              ? `No profile exists for user ID: ${userId}`
              : `No profile exists for slug: ${slug}`,
          } as ErrorResponse),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Other database errors
      console.error('Profile query error:', profileError);
      return new Response(
        JSON.stringify({
          error: 'Database error while fetching profile',
          code: ErrorCodes.DATABASE_ERROR,
          details: profileError.message,
        } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if profile is active
    if (!profileData.is_active) {
      return new Response(
        JSON.stringify({
          error: 'User profile is inactive',
          code: ErrorCodes.PROFILE_INACTIVE,
          details: 'This profile has been deactivated',
        } as ErrorResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch user's public links
    const { data: linksData, error: linksError } = await supabase
      .from('user_links')
      .select(`
        id,
        platform,
        formatted_url,
        display_label,
        is_verified,
        display_order
      `)
      .eq('user_id', profileData.id)
      .eq('is_public', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (linksError) {
      console.error('Links query error:', linksError);
      // Don't fail the request, just return empty links
    }

    // Optionally fetch property stats for agents
    let stats = undefined;
    if (includeStats && profileData.roles?.includes('agent')) {
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, status', { count: 'exact' })
        .eq('agent_id', profileData.id);

      if (!propertiesError && propertiesData) {
        stats = {
          properties_count: propertiesData.length,
          active_listings: propertiesData.filter(p => p.status === 'active').length,
        };
      }
    }

    // Build response
    const response: ProfileWithLinks = {
      profile: {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        phone: profileData.phone,
        roles: profileData.roles || ['buyer'],
        is_verified: profileData.is_verified || false,
        is_active: profileData.is_active,
        created_at: profileData.created_at,
      },
      links: (linksData || []).map(link => ({
        id: link.id,
        platform: link.platform,
        formatted_url: link.formatted_url,
        display_label: link.display_label,
        is_verified: link.is_verified || false,
        display_order: link.display_order || 0,
      })),
    };

    if (stats) {
      response.stats = stats;
    }

    // Return successful response
    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        },
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        code: ErrorCodes.DATABASE_ERROR,
        details: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
