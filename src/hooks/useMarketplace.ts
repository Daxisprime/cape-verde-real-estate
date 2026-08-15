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
  { name: 'Vehicles & Automotive', icon: '\uD83D\uDE97', subcategories: ['Cars', 'Motorbikes', 'Parts & Accessories', 'Boats'] },
  { name: 'Electronics & Computers', icon: '\uD83D\uDCF1', subcategories: ['Smartphones', 'Laptops', 'TVs & Audio', 'Cameras', 'Gaming'] },
  { name: 'Home, Furniture & Appliances', icon: '\uD83D\uDECB\uFE0F', subcategories: ['Sofas', 'Beds', 'Kitchen', 'Decor', 'Appliances'] },
  { name: 'Building Materials & Tools', icon: '\uD83C\uDFD7\uFE0F', subcategories: ['Cement & Blocks', 'Tiles', 'Tools', 'Electrical', 'Plumbing'] },
  { name: 'Restaurants & Menus (Takeaway)', icon: '\uD83C\uDF73', subcategories: ['Takeaway', 'Catering', 'Bakery', 'Groceries'] },
  { name: 'Fashion, Clothing & Retail', icon: '\uD83D\uDC55', subcategories: ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Bags & Accessories', 'Jewelry'] },
  { name: 'Babies & Kids Items', icon: '\uD83D\uDC76', subcategories: ['Clothing', 'Toys', 'Strollers', 'Baby Care'] },
  { name: 'Pets & Animal Supplies', icon: '\uD83D\uDC3E', subcategories: ['Pet Food', 'Accessories', 'Livestock'] },
  { name: 'Maintenance & Repair Services', icon: '\uD83D\uDEE0\uFE0F', subcategories: ['Plumbing', 'Electrician', 'Cleaning', 'IT & Web', 'Tutoring'] },
  { name: 'Professional & Event Services', icon: '\uD83D\uDCBC', subcategories: ['Photography', 'Event Planning', 'Consulting', 'Legal'] },
  { name: 'Other', icon: '\uD83D\uDCE6', subcategories: [] },
] as const;

export const CAPE_VERDE_ISLANDS = [
  'Santiago', 'Santo Antão', 'São Vicente', 'São Nicolau',
  'Sal', 'Boa Vista', 'Maio', 'Fogo', 'Brava'
] as const;


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
    if (!isSupabaseConfigured()) {
      setItems([]);
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('marketplace_items')
        .select('id, title, description, price_cve, category, subcategory, condition, island, municipality, images, status, user_id, contact_phone, contact_whatsapp, view_count, is_featured, created_at, updated_at, last_bumped_at')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('last_bumped_at', { ascending: false });

      if (options.category) {
        query = query.eq('category', options.category);
      }
      if (options.subcategory) {
        query = query.eq('subcategory', options.subcategory);
      }
      if (options.island) {
        query = query.eq('island', options.island);
      }
      if (options.searchQuery) {
        query = query.ilike('title', `%${options.searchQuery}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setItems([]);
      } else {
        const sanitized = (data || []).map((item: Record<string, unknown>) => ({
          ...item,
          images: Array.isArray(item.images) ? item.images : [],
        })) as MarketplaceItem[];
        setItems(sanitized);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [options.category, options.subcategory, options.island, options.searchQuery, options.minPrice, options.maxPrice, refreshKey]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
}


