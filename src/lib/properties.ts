import { createClient } from '@supabase/supabase-js';

export interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  property_type: string;
  listing_type: 'sale' | 'rent';
  bedrooms: number;
  bathrooms: number;
  total_area: number | null;
  location: string;
  island: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  features: string[];
  agent_id: string | null;
  is_featured: boolean;
  is_verified: boolean;
  status: 'active' | 'pending' | 'sold' | 'rented' | 'archived';
  year_built: number | null;
  furnished: boolean;
  ocean_view: boolean;
  beach_distance: number | null;
  price_per_sqm: number | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyFilters {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  propertyType?: string;
  bedrooms?: number;
  island?: string;
  listingType?: 'sale' | 'rent';
}

export interface PropertyQueryResult {
  data: Property[];
  error: string | null;
  count: number;
}

export interface SinglePropertyResult {
  data: Property | null;
  error: string | null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function fetchProperties(
  filters: PropertyFilters = {},
  sortBy: string = 'popular',
  limit?: number
): Promise<PropertyQueryResult> {
  const supabase = getClient();
  if (!supabase) {
    return { data: [], error: 'Database connection not configured.', count: 0 };
  }

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('status', 'active');

  if (filters.location) {
    query = query.or(
      `location.ilike.%${filters.location}%,island.ilike.%${filters.location}%`
    );
  }

  if (filters.priceMin) {
    query = query.gte('price', filters.priceMin);
  }

  if (filters.priceMax) {
    query = query.lte('price', filters.priceMax);
  }

  if (filters.propertyType && filters.propertyType !== 'all') {
    query = query.ilike('property_type', filters.propertyType);
  }

  if (filters.bedrooms) {
    query = query.gte('bedrooms', filters.bedrooms);
  }

  if (filters.island && filters.island !== 'all') {
    query = query.eq('island', filters.island);
  }

  if (filters.listingType) {
    query = query.eq('listing_type', filters.listingType);
  }

  switch (sortBy) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'size_asc':
      query = query.order('total_area', { ascending: true });
      break;
    case 'size_desc':
      query = query.order('total_area', { ascending: false });
      break;
    case 'popular':
    default:
      query = query.order('is_featured', { ascending: false }).order('price', { ascending: false });
      break;
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error, count } = await query;

  if (error) {
    return { data: [], error: 'Unable to load properties. Please try again later.', count: 0 };
  }

  return { data: (data ?? []) as Property[], error: null, count: count ?? 0 };
}

export async function fetchPropertyById(id: string): Promise<SinglePropertyResult> {
  const supabase = getClient();
  if (!supabase) {
    return { data: null, error: 'Database connection not configured.' };
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: 'Property not found or unavailable.' };
  }

  return { data: data as Property, error: null };
}

export async function fetchFeaturedProperties(limit = 6): Promise<PropertyQueryResult> {
  const supabase = getClient();
  if (!supabase) {
    return { data: [], error: 'Database connection not configured.', count: 0 };
  }

  const { data, error, count } = await supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [], error: 'Unable to load featured properties.', count: 0 };
  }

  return { data: (data ?? []) as Property[], error: null, count: count ?? 0 };
}

export async function incrementViewCount(id: string): Promise<void> {
  const supabase = getClient();
  if (!supabase) return;

  await supabase.rpc('increment_view_count', { property_id: id }).catch(() => {});
}
