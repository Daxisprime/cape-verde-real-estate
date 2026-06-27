"use client";

import React, { useEffect, useState } from "react";
import { Star, MapPin, Bed, Bath } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { capeVerdeProperties } from "@/data/cape-verde-properties";

interface FeaturedItem {
  id: string;
  title: string;
  price: number;
  location: string;
  island: string;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  type: string;
}

interface FeaturedCarouselProps {
  mode: "realestate" | "markets";
  onItemClick?: (item: FeaturedItem) => void;
}

function formatPrice(price: number): string {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M CVE`;
  if (price >= 1000) return `${Math.round(price / 1000)}K CVE`;
  return `${price.toLocaleString()} CVE`;
}

export default function FeaturedCarousel({ mode, onItemClick }: FeaturedCarouselProps) {
  const [items, setItems] = useState<FeaturedItem[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      const supabase = createSupabaseBrowserClient();
      let fetched: FeaturedItem[] = [];

      if (supabase && mode === "realestate") {
        const { data } = await supabase
          .from("properties")
          .select("id, title, price, location, island, images, bedrooms, bathrooms, property_type")
          .eq("is_featured", true)
          .gte("featured_until", new Date().toISOString())
          .order("featured_until", { ascending: false })
          .limit(10);

        if (data && data.length > 0) {
          fetched = data.map((p) => ({
            id: p.id,
            title: p.title || "Untitled",
            price: p.price || 0,
            location: p.location || "",
            island: p.island || "Cape Verde",
            image: p.images?.[0] || "",
            bedrooms: p.bedrooms || undefined,
            bathrooms: p.bathrooms || undefined,
            type: p.property_type || "apartment",
          }));
        }
      }

      if (supabase && mode === "markets") {
        const { data } = await supabase
          .from("marketplace_items")
          .select("id, title, price, island, images, category")
          .eq("is_featured", true)
          .gte("featured_until", new Date().toISOString())
          .order("featured_until", { ascending: false })
          .limit(10);

        if (data && data.length > 0) {
          fetched = data.map((m) => ({
            id: m.id,
            title: m.title || "Untitled",
            price: m.price || 0,
            location: "",
            island: m.island || "Cape Verde",
            image: m.images?.[0] || "",
            type: m.category || "item",
          }));
        }
      }

      // Fallback to premium mock data if nothing featured yet
      if (fetched.length === 0 && mode === "realestate") {
        fetched = capeVerdeProperties
          .filter((p) => p.isFeatured)
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            location: p.location,
            island: p.island,
            image: p.images[0] || "",
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            type: p.type,
          }));

        // If no featured flag, pick top 5 by price
        if (fetched.length === 0) {
          fetched = [...capeVerdeProperties]
            .sort((a, b) => b.price - a.price)
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              title: p.title,
              price: p.price,
              location: p.location,
              island: p.island,
              image: p.images[0] || "",
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              type: p.type,
            }));
        }
      }

      setItems(fetched);
    }

    fetchFeatured();
  }, [mode]);

  if (items.length === 0) return null;

  const title = mode === "realestate" ? "Imoveis em Destaque" : "Artigos em Destaque";

  return (
    <section className="w-full mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        <span className="text-xs text-gray-400 font-medium">({items.length})</span>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1 snap-x snap-mandatory -mx-1">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] cursor-pointer group"
          >
            <div className="rounded-2xl overflow-hidden border-2 border-amber-200/80 shadow-lg shadow-amber-100/50 hover:shadow-xl hover:shadow-amber-200/60 hover:border-amber-300 transition-all bg-gradient-to-b from-amber-50/40 to-white">
              <div className="relative h-44 sm:h-48 overflow-hidden">
                <img
                  src={item.image || "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?w=800"}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full uppercase tracking-wider shadow-md">
                    <Star className="h-3 w-3 fill-white" />
                    Destaque
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-2.5">
                  <p className="font-black text-lg text-white drop-shadow-lg">{formatPrice(item.price)}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1.5">
                  <MapPin className="h-3 w-3 text-amber-500" />
                  {item.location || item.island}
                </p>
                {mode === "realestate" && (item.bedrooms || item.bathrooms) && (
                  <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-600">
                    {item.bedrooms && item.bedrooms > 0 && (
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full"><Bed className="h-3 w-3" />{item.bedrooms}</span>
                    )}
                    {item.bathrooms && item.bathrooms > 0 && (
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full"><Bath className="h-3 w-3" />{item.bathrooms}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
