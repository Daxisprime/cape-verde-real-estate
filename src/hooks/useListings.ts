'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';

export interface LiveListing {
  id: string;
  title: string;
  price: number;
  island: string;
  zone: string | null;
  mode: 'real_estate' | 'item_service';
  images: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  square_meters: number | null;
  description: string | null;
  market_category: string | null;
  vendor_id: string;
  status: string;
  created_at: string;
  is_featured: boolean;
  latitude: number | null;
  longitude: number | null;
}

export function useListings(mode?: 'real_estate' | 'item_service') {
  const [listings, setListings] = useState<LiveListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchListings() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('vendor_ads' as never)
          .select('*')
          .eq('status', 'active')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (mode) {
          query = query.eq('mode', mode);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          setListings(data as unknown as LiveListing[]);
          setIsLive(true);
        }
      } catch {
        // Table may not exist yet -- silently fall back to mock data
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [mode]);

  return { listings, loading, isLive };
}

export function useMyListings() {
  const [listings, setListings] = useState<LiveListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyListings() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('vendor_ads' as never)
          .select('*')
          .eq('vendor_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings((data || []) as unknown as LiveListing[]);
      } catch {
        // User not authenticated or table missing -- silently skip
      } finally {
        setLoading(false);
      }
    }

    fetchMyListings();
  }, []);

  return { listings, loading, refetch: () => { setLoading(true); } };
}
