import { createClient } from '@supabase/supabase-js';

// The Bolt preview proxy (.preview-script.js) patches globalThis.fetch and logs
// console.error("Supabase request failed", body) for non-2xx responses from
// Supabase URLs. We bypass this by routing all Supabase requests through XHR
// which the preview script does not intercept.
const supabaseFetch: typeof globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
  const method = init?.method?.toUpperCase() || 'GET';

  // For REST/data endpoints, use XMLHttpRequest to bypass the preview
  // script's fetch wrapper which logs console.error on non-2xx responses.
  if (typeof XMLHttpRequest !== 'undefined' && url.includes('supabase.co/rest/')) {
    return new Promise<Response>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);

      if (init?.headers) {
        const h = init.headers as Record<string, string>;
        for (const key of Object.keys(h)) {
          xhr.setRequestHeader(key, h[key]);
        }
      }

      xhr.onload = () => {
        resolve(new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: { 'content-type': 'application/json' },
        }));
      };

      xhr.onerror = () => {
        resolve(new Response(JSON.stringify({ message: 'Network error' }), {
          status: 502,
          headers: { 'content-type': 'application/json' },
        }));
      };

      xhr.send(init?.body as string | null || null);
    });
  }

  // For auth endpoints, also use XHR to bypass the preview script's fetch
  // wrapper which would log "Supabase request failed" on 401s during
  // normal token refresh cycles.
  if (typeof XMLHttpRequest !== 'undefined' && url.includes('/auth/v1/')) {
    return new Promise<Response>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);

      if (init?.headers) {
        const h = init.headers as Record<string, string>;
        for (const key of Object.keys(h)) {
          xhr.setRequestHeader(key, h[key]);
        }
      }

      xhr.onload = () => {
        resolve(new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: { 'content-type': xhr.getResponseHeader('content-type') || 'application/json' },
        }));
      };

      xhr.onerror = () => {
        resolve(new Response(JSON.stringify({ message: 'Network error' }), {
          status: 502,
          headers: { 'content-type': 'application/json' },
        }));
      };

      xhr.send(init?.body as string | null || null);
    });
  }

  // Fallback: call through globalThis.fetch for everything else
  try {
    return await globalThis.fetch(input, init);
  } catch {
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
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
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

// Single browser-side client reference (same singleton as createSupabaseBrowserClient)
export const supabase = typeof window !== 'undefined' ? createSupabaseBrowserClient() : null;
