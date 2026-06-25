'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';

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

  const fetchItems = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('marketplace_items')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

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
      if (options.minPrice != null) {
        query = query.gte('price_cve', options.minPrice);
      }
      if (options.maxPrice != null) {
        query = query.lte('price_cve', options.maxPrice);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setItems([]);
      } else {
        setItems((data || []) as MarketplaceItem[]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [options.category, options.subcategory, options.island, options.searchQuery, options.minPrice, options.maxPrice]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
}
