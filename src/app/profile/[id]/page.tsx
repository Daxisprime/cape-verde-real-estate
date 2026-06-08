"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Phone, MessageCircle, MapPin, Bed, Bath, Square, ExternalLink } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface VendorProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  bio?: string;
  company?: string;
  facebook_url?: string;
  instagram_url?: string;
  facebook_shop_url?: string;
}

interface VendorAd {
  id: string;
  mode: "real_estate" | "item_service";
  title: string;
  price: number;
  island: string;
  zone: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_meters: number | null;
  images: string[];
  created_at: string;
}

export default function VendorProfilePage() {
  const params = useParams();
  const vendorId = params.id as string;

  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [ads, setAds] = useState<VendorAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase || !vendorId) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, phone")
        .eq("id", vendorId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as VendorProfile);
      }

      const { data: adsData } = await supabase
        .from("vendor_ads" as never)
        .select("id, mode, title, price, island, zone, bedrooms, bathrooms, square_meters, images, created_at")
        .eq("vendor_id", vendorId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (adsData) {
        setAds(adsData as unknown as VendorAd[]);
      }

      setLoading(false);
    }
    load();
  }, [vendorId]);

  const handleWhatsApp = () => {
    if (!profile?.phone) return;
    const phone = profile.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 text-sm">Profile not found.</p>
        <Link href="/" className="mt-4 text-sm text-blue-600 underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name || ""} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-bold">
                  {(profile.full_name || "V")[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">{profile.full_name || "Vendor"}</h1>
              {profile.company && (
                <p className="text-sm text-gray-500 truncate">{profile.company}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">{ads.length} active listing{ads.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            )}
            {profile.phone && (
              <button
                onClick={handleWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
            )}
          </div>

          {/* Social Links */}
          {(profile.facebook_url || profile.instagram_url || profile.facebook_shop_url) && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
              {profile.facebook_url && (
                <a
                  href={profile.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Facebook
                </a>
              )}
              {profile.facebook_shop_url && (
                <a
                  href={profile.facebook_shop_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Facebook Shop
                </a>
              )}
              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-pink-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Instagram
                </a>
              )}
            </div>
          )}
        </div>

        {/* Vendor Listings — Masonry Feed */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Listings</h2>
          {ads.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No active listings yet.</p>
          ) : (
            <div className="columns-2 gap-2 w-full">
              {ads.map((ad) => (
                <div key={ad.id} className="break-inside-avoid mb-2 w-full inline-block">
                  <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                    {ad.images.length > 0 && (
                      <img
                        src={ad.images[0]}
                        alt={ad.title}
                        loading="lazy"
                        className="w-full object-cover"
                        style={{ aspectRatio: ad.mode === "real_estate" ? "4/3" : "1/1" }}
                      />
                    )}
                    <div className="p-2.5">
                      <p className="text-sm font-bold text-gray-900">{ad.price.toLocaleString()} CVE</p>
                      <p className="text-xs text-gray-700 mt-0.5 line-clamp-2">{ad.title}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{ad.zone ? `${ad.zone}, ` : ""}{ad.island}</span>
                      </div>
                      {ad.mode === "real_estate" && (ad.bedrooms || ad.bathrooms || ad.square_meters) && (
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                          {ad.bedrooms != null && (
                            <span className="inline-flex items-center gap-0.5">
                              <Bed className="h-3 w-3" />{ad.bedrooms}
                            </span>
                          )}
                          {ad.bathrooms != null && (
                            <span className="inline-flex items-center gap-0.5">
                              <Bath className="h-3 w-3" />{ad.bathrooms}
                            </span>
                          )}
                          {ad.square_meters != null && (
                            <span className="inline-flex items-center gap-0.5">
                              <Square className="h-3 w-3" />{ad.square_meters}m²
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
