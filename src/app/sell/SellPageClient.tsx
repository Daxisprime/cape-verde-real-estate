"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import PostAdForm, { ListingEditData } from "@/components/PostAdForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SellPageClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [editData, setEditData] = useState<ListingEditData | null>(null);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;

    async function fetchListing() {
      setLoading(true);
      try {
        const supabase = createSupabaseBrowserClient();
        if (!supabase) return;

        const { data: property } = await supabase
          .from("properties")
          .select("*")
          .eq("id", editId)
          .maybeSingle();

        if (property) {
          setEditData({
            id: property.id,
            title: property.title || "",
            description: property.description,
            price: property.price || 0,
            island: property.island || "",
            location: property.location,
            property_type: property.property_type,
            listing_type: property.listing_type,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            total_area: property.total_area,
            latitude: property.latitude,
            longitude: property.longitude,
            images: property.images,
            mode: "real_estate",
          });
        } else {
          const { data: item } = await supabase
            .from("marketplace_items")
            .select("*")
            .eq("id", editId)
            .maybeSingle();

          if (item) {
            setEditData({
              id: item.id,
              title: item.title || "",
              description: item.description,
              price: item.price_cve || 0,
              island: item.island || "",
              municipality: item.municipality,
              category: item.category,
              condition: item.condition || "used",
              images: item.images,
              mode: "item_service",
            });
          }
        }
      } catch {
        // If fetch fails, show empty form
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [editId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 mt-6 pb-20">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-3 py-2 mb-4 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h1 className="text-lg font-bold text-gray-900 mb-1">
            {editId ? t.editListing : t.createNewListing}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {editId ? t.updateDetails : t.postDescription}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-500">{t.loadingData}</span>
            </div>
          ) : (
            <PostAdForm vendorId="vendor-1" editData={editData} />
          )}
        </div>
      </div>
    </div>
  );
}
