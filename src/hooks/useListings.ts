'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSearchMode } from '@/contexts/SearchModeContext';

export interface LiveListing {
  id: string;
  title: string;
  price: number;
  island: string;
  location: string | null;
  property_type: string;
  listing_type: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  total_area: number | null;
  description: string | null;
  agent_id: string | null;
  status: string;
  created_at: string;
  is_featured: boolean;
  latitude: number | null;
  longitude: number | null;
  source?: "properties" | "marketplace";
}

export function useListings() {
  const [listings, setListings] = useState<LiveListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const { selectedIslands } = useSearchMode();

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
        console.log('Fetching from URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

        let query = supabase
          .from('properties')
          .select('id, title, price, island, location, property_type, listing_type, images, bedrooms, bathrooms, total_area, description, agent_id, status, created_at, is_featured, latitude, longitude, last_bumped_at')
          .eq('status', 'active');

        if (selectedIslands.length > 0) {
          const orFilter = selectedIslands.map(island => `island.eq.${island}`).join(',');
          query = query.or(orFilter);
        }

        const { data, error } = await query
          .order('is_featured', { ascending: false })
          .order('last_bumped_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          console.log('Properties fetched:', data.length);
          setListings(data as unknown as LiveListing[]);
          setIsLive(true);
        } else {
          console.log('Error details:', error);
          setListings([]);
          setIsLive(true);
        }
      } catch (err) {
        console.log('Error details:', err);
        setListings([]);
        setIsLive(true);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [selectedIslands]);

  return { listings, loading, isLive };
}

export function useMyListings() {
  const [listings, setListings] = useState<LiveListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, isAuthenticated } = useSupabaseAuth();

  const refetch = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    async function fetchMyListings() {
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
      console.log('Fetching my listings from URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      let props: unknown[] = [];
      let items: unknown[] = [];

      const { data: propsData, error: propsError } = await supabase
        .from('properties')
        .select('id, title, price, island, location, property_type, listing_type, images, bedrooms, bathrooms, total_area, description, agent_id, status, created_at, is_featured, latitude, longitude')
        .eq('agent_id', user!.id)
        .order('created_at', { ascending: false });

      if (!propsError && propsData) {
        props = propsData;
        console.log('My properties fetched:', propsData.length);
      } else if (propsError) {
        console.log('Error details:', propsError);
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from('marketplace_items')
        .select('id, title, description, price_cve, category, subcategory, condition, island, municipality, images, status, user_id, contact_phone, contact_whatsapp, view_count, is_featured, created_at, updated_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (!itemsError && itemsData) {
        items = itemsData;
        console.log('My marketplace items fetched:', itemsData.length);
      } else if (itemsError) {
        console.log('Error details:', itemsError);
      }

      const combined: LiveListing[] = [
        ...(props as unknown as LiveListing[]).map((p) => ({ ...p, source: "properties" as const })),
        ...(items as Record<string, unknown>[]).map((item) => ({
          id: item.id as string,
          title: item.title as string,
          price: item.price_cve as number,
          island: item.island as string,
          location: item.municipality as string | null,
          property_type: item.category as string,
          listing_type: 'sale',
          images: item.images as string[],
          bedrooms: 0,
          bathrooms: 0,
          total_area: null,
          description: item.description as string | null,
          agent_id: item.user_id as string | null,
          status: item.status as string,
          created_at: item.created_at as string,
          is_featured: item.is_featured as boolean,
          latitude: null,
          longitude: null,
          source: "marketplace" as const,
        })),
      ];

      setListings(combined);
      setLoading(false);
    }

    fetchMyListings();
  }, [isAuthenticated, user, refreshKey]);

  useEffect(() => {
    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return { listings, loading, refetch };
}
