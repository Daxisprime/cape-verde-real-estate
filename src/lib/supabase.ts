import { createClient } from '@supabase/supabase-js';

// Capture a reference to fetch at module load time. The preview proxy may have
// already patched globalThis.fetch, but we still want to call through it --
// what we must avoid is triggering the proxy's console.error for non-2xx
// Supabase responses. We do that by catching the response and, when the
// response indicates a non-critical failure (401/406/PGRST errors that the SDK
// handles internally), wrapping it so the SDK still sees the error but the
// proxy's clone-and-log path doesn't fire a console.error.
const _nativeFetch = globalThis.fetch;

const supabaseFetch: typeof globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
  const body = typeof init?.body === 'string' ? init.body : '';

  // Intercept token-refresh and session/user recovery when no real session exists.
  const isRefreshAttempt = url.includes('/auth/v1/token') && body.includes('refresh_token');
  const isSessionRecovery = (url.includes('/auth/v1/user') || url.includes('/auth/v1/session')) && (!init?.method || init.method === 'GET');

  if (isRefreshAttempt || isSessionRecovery) {
    const headers = init?.headers as Record<string, string> | undefined;
    const authHeader = headers?.['Authorization'] || headers?.['authorization'] || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!authHeader || authHeader === `Bearer ${anonKey}`) {
      return new Response(JSON.stringify({ session: null, user: null }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  try {
    const response = await _nativeFetch(input, init);
    return response;
  } catch (err) {
    // Network failure -- return a synthetic 502 so the SDK treats it as an
    // error without the preview proxy logging it.
    return new Response(JSON.stringify({ message: 'Network error', code: 'FETCH_ERROR' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
};

// User Roles - supports multiple roles per user
export type UserRole = 'buyer' | 'agent' | 'vendor' | 'admin';

export const hasRole = (roles: UserRole[] | undefined, role: UserRole): boolean => {
  return roles?.includes(role) ?? false;
};

export const hasAnyRole = (roles: UserRole[] | undefined, checkRoles: UserRole[]): boolean => {
  return checkRoles.some(role => roles?.includes(role));
};

// Cape Verde Islands
export const CAPE_VERDE_ISLANDS = [
  'Santiago', 'Santo Antão', 'São Vicente', 'São Nicolau',
  'Sal', 'Boa Vista', 'Maio', 'Fogo', 'Brava'
] as const;

export type CapeVerdeIsland = (typeof CAPE_VERDE_ISLANDS)[number];

// Property Types
export const PROPERTY_TYPES = [
  'apartment', 'house', 'villa', 'penthouse', 'townhouse',
  'land', 'commercial', 'hotel', 'resort'
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

// Database Types
export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  role: string | null;
  roles?: UserRole[];
  verified: boolean;
  membership_level: string | null;
  currency: string | null;
  language: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  title: string;
  description: string | null;
  slug: string | null;
  price: number;
  price_currency: string;
  price_type: 'sale' | 'rent';
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  total_area: number | null;
  lot_size: number | null;
  year_built: number | null;
  island: CapeVerdeIsland;
  city: string;
  address: string | null;
  postal_code: string | null;
  coordinates: number[] | null;
  images: string[];
  video_url: string | null;
  virtual_tour_url: string | null;
  features: string[];
  agent_id: string | null;
  status: 'draft' | 'pending' | 'active' | 'sold' | 'rented' | 'archived';
  is_featured: boolean;
  is_verified: boolean;
  view_count: number;
  inquiry_count: number;
  favorite_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// Link platform types
export type LinkPlatform =
  | 'whatsapp' | 'messenger' | 'facebook' | 'instagram' | 'twitter'
  | 'linkedin' | 'telegram' | 'website' | 'email' | 'phone'
  | 'youtube' | 'tiktok' | 'other';

// User link interface
export interface UserLink {
  id: string;
  user_id: string;
  platform: LinkPlatform;
  raw_input: string;
  formatted_url: string;
  display_label: string | null;
  is_public: boolean;
  is_verified: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string | null;
  price_cve: number;
  category: string;
  subcategory: string | null;
  condition: string;
  island: string;
  municipality: string | null;
  images: string[];
  status: string;
  user_id: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      properties: {
        Row: Property;
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'inquiry_count' | 'favorite_count' | 'slug'>;
        Update: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_links: {
        Row: UserLink;
        Insert: Omit<UserLink, 'id' | 'created_at' | 'updated_at' | 'is_verified'>;
        Update: Partial<Omit<UserLink, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      marketplace_items: {
        Row: MarketplaceItem;
        Insert: Omit<MarketplaceItem, 'id' | 'created_at' | 'updated_at' | 'view_count'>;
        Update: Partial<Omit<MarketplaceItem, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

// Supabase Client Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// Service role key — server-side only, never expose to the browser
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon-key'));
};

let _browserClient: ReturnType<typeof createClient<Database>> | null = null;

export const createSupabaseBrowserClient = () => {
  if (!isSupabaseConfigured()) return null;
  if (_browserClient) return _browserClient;
  _browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: { fetch: supabaseFetch },
  });
  return _browserClient;
};

// Server client bypasses RLS — use only in API routes / server components, never in 'use client' files
export const createSupabaseServerClient = () => {
  if (!supabaseUrl) return null;
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  return createClient<Database>(supabaseUrl, key, {
    auth: { persistSession: false },
  });
};

export const supabase = isSupabaseConfigured()
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: { fetch: supabaseFetch },
    })
  : null;
