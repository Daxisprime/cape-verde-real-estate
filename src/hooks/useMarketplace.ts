'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';
import { onListingCreated } from '@/lib/listing-events';

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

export const MARKETPLACE_CATEGORIES = [
  { name: 'Electronics', icon: '\uD83D\uDCF1', subcategories: ['Smartphones', 'Laptops', 'TVs & Audio', 'Cameras', 'Gaming'] },
  { name: 'Vehicles', icon: '\uD83D\uDE97', subcategories: ['Cars', 'Motorbikes', 'Parts & Accessories', 'Boats'] },
  { name: 'Fashion', icon: '\uD83D\uDC55', subcategories: ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Bags & Accessories', 'Jewelry'] },
  { name: 'Home & Furniture', icon: '\uD83D\uDECB\uFE0F', subcategories: ['Sofas', 'Beds', 'Kitchen', 'Decor', 'Appliances'] },
  { name: 'Services', icon: '\uD83D\uDEE0\uFE0F', subcategories: ['Plumbing', 'Electrician', 'Cleaning', 'IT & Web', 'Tutoring'] },
  { name: 'Building Materials', icon: '\uD83C\uDFD7\uFE0F', subcategories: ['Cement & Blocks', 'Tiles', 'Tools', 'Electrical', 'Plumbing'] },
  { name: 'Food & Restaurants', icon: '\uD83C\uDF73', subcategories: ['Takeaway', 'Catering', 'Bakery', 'Groceries'] },
  { name: 'Babies & Kids', icon: '\uD83D\uDC76', subcategories: ['Clothing', 'Toys', 'Strollers', 'Baby Care'] },
  { name: 'Pets & Animals', icon: '\uD83D\uDC3E', subcategories: ['Pet Food', 'Accessories', 'Livestock'] },
  { name: 'Other', icon: '\uD83D\uDCE6', subcategories: [] },
] as const;

export const CAPE_VERDE_ISLANDS = [
  'Santiago', 'Santo Antao', 'Sao Vicente', 'Sao Nicolau',
  'Sal', 'Boa Vista', 'Maio', 'Fogo', 'Brava'
] as const;

const MOCK_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'mock-1',
    title: 'Samsung Galaxy S24 Ultra - Like New',
    description: 'Barely used Samsung Galaxy S24 Ultra, 256GB, comes with original box and charger.',
    price_cve: 85000,
    category: 'Electronics',
    subcategory: 'Smartphones',
    condition: 'Like New',
    island: 'Santiago',
    municipality: 'Praia',
    images: ['https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?w=600&h=400&fit=crop'],
    status: 'active',
    user_id: null,
    contact_phone: null,
    contact_whatsapp: null,
    view_count: 42,
    is_featured: true,
    created_at: '2026-06-20T10:00:00Z',
    updated_at: '2026-06-20T10:00:00Z',
  },
  {
    id: 'mock-2',
    title: 'Toyota Hilux 2019 - Excellent Condition',
    description: 'Well-maintained Toyota Hilux, 65,000km, diesel, manual transmission. Perfect for island roads.',
    price_cve: 3200000,
    category: 'Vehicles',
    subcategory: 'Cars',
    condition: 'Used',
    island: 'Sal',
    municipality: 'Santa Maria',
    images: ['https://images.pexels.com/photos/2533092/pexels-photo-2533092.jpeg?w=600&h=400&fit=crop'],
    status: 'active',
    user_id: null,
    contact_phone: null,
    contact_whatsapp: null,
    view_count: 89,
    is_featured: true,
    created_at: '2026-06-19T14:00:00Z',
    updated_at: '2026-06-19T14:00:00Z',
  },
  {
    id: 'mock-3',
    title: 'L-Shaped Sofa - Modern Grey Fabric',
    description: 'Comfortable L-shaped sofa in excellent condition. Seats 6 people comfortably.',
    price_cve: 125000,
    category: 'Home & Furniture',
    subcategory: 'Sofas',
    condition: 'Used',
    island: 'Sao Vicente',
    municipality: 'Mindelo',
    images: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=600&h=400&fit=crop'],
    status: 'active',
    user_id: null,
    contact_phone: null,
    contact_whatsapp: null,
    view_count: 31,
    is_featured: false,
    created_at: '2026-06-18T09:00:00Z',
    updated_at: '2026-06-18T09:00:00Z',
  },
  {
    id: 'mock-4',
    title: 'Professional Plumbing Services',
    description: 'Licensed plumber with 10+ years experience. Installations, repairs, and maintenance across Santiago.',
    price_cve: 5000,
    category: 'Services',
    subcategory: 'Plumbing',
    condition: 'New',
    island: 'Santiago',
    municipality: 'Praia',
    images: ['https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?w=600&h=400&fit=crop'],
    status: 'active',
    user_id: null,
    contact_phone: null,
    contact_whatsapp: null,
    view_count: 56,
    is_featured: false,
    created_at: '2026-06-17T16:00:00Z',
    updated_at: '2026-06-17T16:00:00Z',
  },
  {
    id: 'mock-5',
    title: 'MacBook Pro M3 14" - 512GB',
    description: 'Apple MacBook Pro with M3 chip, 16GB RAM. Perfect for professionals. Includes carry case.',
    price_cve: 180000,
    category: 'Electronics',
    subcategory: 'Laptops',
    condition: 'Like New',
    island: 'Santiago',
    municipality: 'Praia',
    images: ['https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?w=600&h=400&fit=crop'],
    status: 'active',
    user_id: null,
    contact_phone: null,
    contact_whatsapp: null,
    view_count: 67,
    is_featured: false,
    created_at: '2026-06-16T11:00:00Z',
    updated_at: '2026-06-16T11:00:00Z',
  },
  {
    id: 'mock-6',
    title: 'Cement Blocks - Wholesale Price',
    description: 'Quality cement blocks available in bulk. Delivery available across Santiago. Minimum order 100 units.',
    price_cve: 150,
    category: 'Building Materials',
    subcategory: 'Cement & Blocks',
    condition: 'New',
    island: 'Santiago',
    municipality: 'Praia',
    images: ['https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?w=600&h=400&fit=crop'],
    status: 'active',
    user_id: null,
    contact_phone: null,
    contact_whatsapp: null,
    view_count: 103,
    is_featured: false,
    created_at: '2026-06-15T08:00:00Z',
    updated_at: '2026-06-15T08:00:00Z',
  },
  {
    id: 'mock-7',
    title: 'Women\'s Summer Dress Collection',
    description: 'Beautiful handmade dresses inspired by Cape Verdean patterns. Sizes S-XL available.',
    price_cve: 4500,
    category: 'Fashion',
    subcategory: 'Women\'s Clothing',
    condition: 'New',
    island: 'Boa Vista',
    municipality: 'Sal Rei',
    images: ['https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=600&h=400&fit=crop'],
    status: 'active',
    user_id: null,
    contact_phone: null,
    contact_whatsapp: null,
    view_count: 28,
    is_featured: false,
    created_at: '2026-06-14T13:00:00Z',
    updated_at: '2026-06-14T13:00:00Z',
  },
  {
    id: 'mock-8',
    title: 'Fresh Grilled Fish Takeaway - Daily Menu',
    description: 'Fresh catch of the day, grilled to perfection. Tuna, Wahoo, and Grouper available. Order by 4pm for same-day pickup.',
    price_cve: 1200,
    category: 'Food & Restaurants',
    subcategory: 'Takeaway',
    condition: 'New',
    island: 'Sal',
    municipality: 'Santa Maria',
    images: ['https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?w=600&h=400&fit=crop'],
    status: 'active',
    user_id: null,
    contact_phone: null,
    contact_whatsapp: null,
    view_count: 145,
    is_featured: true,
    created_at: '2026-06-13T07:00:00Z',
    updated_at: '2026-06-13T07:00:00Z',
  },
];

interface UseMarketplaceOptions {
  category?: string | null;
  subcategory?: string | null;
  island?: string | null;
  searchQuery?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
}

export function useMarketplace(options: UseMarketplaceOptions = {}) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    return onListingCreated((detail) => {
      if (detail.type === "marketplace") setRefreshKey((k) => k + 1);
    });
  }, []);

  const fetchItems = useCallback(async () => {
    console.log('Fetching from URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, using mock data');
      setItems(filterMockItems(options));
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      console.log('Supabase client creation failed, using mock data');
      setItems(filterMockItems(options));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // DIAGNOSTIC: raw unfiltered query first
      const { data: rawAll, error: rawError, count } = await supabase
        .from('marketplace_items')
        .select('*', { count: 'exact' });

      console.group('[DIAG] marketplace_items raw query');
      console.log('Raw row count:', count);
      console.log('Raw data:', rawAll);
      console.log('Raw error:', rawError);
      console.groupEnd();

      // DIAGNOSTIC: the actual filtered query
      let query = supabase
        .from('marketplace_items')
        .select('id, title, description, price_cve, category, subcategory, condition, island, municipality, images, status, user_id, contact_phone, contact_whatsapp, view_count, is_featured, created_at, updated_at')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('last_bumped_at', { ascending: false });

      if (options.category) {
        console.log('[DIAG] Filtering by category:', options.category);
        query = query.eq('category', options.category);
      }
      if (options.subcategory) {
        console.log('[DIAG] Filtering by subcategory:', options.subcategory);
        query = query.eq('subcategory', options.subcategory);
      }
      if (options.island) {
        console.log('[DIAG] Filtering by island:', options.island);
        query = query.eq('island', options.island);
      }
      if (options.searchQuery) {
        console.log('[DIAG] Filtering by searchQuery:', options.searchQuery);
        query = query.ilike('title', `%${options.searchQuery}%`);
      }

      const { data, error: fetchError, status, statusText } = await query;

      console.group('[DIAG] marketplace_items filtered query');
      console.log('HTTP status:', status, statusText);
      console.log('Fetch error object:', fetchError);
      console.log('Data array:', data);
      console.log('Data length:', data?.length ?? 'null');
      console.log('Options passed:', JSON.stringify(options));
      console.groupEnd();

      if (fetchError) {
        console.log('Error details:', fetchError);
        setError(fetchError.message);
        setItems(filterMockItems(options));
      } else if (data && data.length > 0) {
        console.log('Marketplace items fetched:', data.length);
        const sanitized = data.map((item: Record<string, unknown>) => ({
          ...item,
          images: Array.isArray(item.images) ? item.images : [],
        })) as MarketplaceItem[];
        setItems(sanitized);
      } else {
        console.log('DB returned empty, using mock data');
        setItems(filterMockItems(options));
      }
    } catch (err) {
      console.log('Error details:', err);
      setItems(filterMockItems(options));
    } finally {
      setLoading(false);
    }
  }, [options.category, options.subcategory, options.island, options.searchQuery, options.minPrice, options.maxPrice, refreshKey]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
}

function filterMockItems(options: UseMarketplaceOptions): MarketplaceItem[] {
  return MOCK_MARKETPLACE_ITEMS.filter(item => {
    if (options.category && item.category !== options.category) return false;
    if (options.subcategory && item.subcategory !== options.subcategory) return false;
    if (options.island && item.island !== options.island) return false;
    if (options.searchQuery && !item.title.toLowerCase().includes(options.searchQuery.toLowerCase())) return false;
    if (options.minPrice != null && item.price_cve < options.minPrice) return false;
    if (options.maxPrice != null && item.price_cve > options.maxPrice) return false;
    return true;
  });
}

