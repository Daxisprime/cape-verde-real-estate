'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';

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
}

export function useListings() {
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
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (data && data.length > 0) {
          setListings(data as unknown as LiveListing[]);
          setIsLive(true);
        }
      } catch {
        // Silently fall back to mock data
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  return { listings, loading, isLive };
}

export function useMyListings() {
  const [listings, setListings] = useState<LiveListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch user's properties
        const { data: props } = await supabase
          .from('properties')
          .select('*')
          .eq('agent_id', user.id)
          .order('created_at', { ascending: false });

        // Fetch user's marketplace items
        const { data: items } = await supabase
          .from('marketplace_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        const combined: LiveListing[] = [
          ...((props || []) as unknown as LiveListing[]),
          ...((items || []).map((item: Record<string, unknown>) => ({
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
          }))),
        ];

        setListings(combined);
      } catch {
        // Silently skip
      } finally {
        setLoading(false);
      }
    }

    fetchMyListings();
  }, []);

  return { listings, loading };
}
