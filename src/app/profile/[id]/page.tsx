"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Phone, MessageCircle, MapPin, Bed, Bath, Square, ExternalLink } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { mockProfiles } from "@/lib/mockProfiles";

interface VendorProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  whatsapp?: string | null;
  bio?: string;
  company?: string;
  type?: string;
  facebook_url?: string;
  instagram_url?: string;
  facebook_shop_url?: string;
  facebook_handle?: string;
  instagram_handle?: string;
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
  created_at?: string;
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

      // Try Supabase first
      if (supabase && vendorId) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("id, name, avatar, phone")
          .eq("id", vendorId)
          .maybeSingle();

        if (profileData && !error) {
          setProfile({
            id: profileData.id,
            full_name: profileData.name,
            avatar_url: profileData.avatar,
            phone: profileData.phone,
          });

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
          return;
        }
      }

      // Fall back to mock profiles
      const mockMatch = mockProfiles.find((p) => p.id === vendorId);
      if (mockMatch) {
        setProfile({
          id: mockMatch.id,
          full_name: mockMatch.full_name,
          avatar_url: mockMatch.avatar_url,
          phone: mockMatch.phone,
          whatsapp: mockMatch.whatsapp,
          bio: mockMatch.bio,
          company: mockMatch.company,
          type: mockMatch.type,
          facebook_url: mockMatch.facebook_url,
          instagram_url: mockMatch.instagram_url,
          facebook_shop_url: mockMatch.facebook_shop_url,
        });
        setAds(
          mockMatch.listings.map((l) => ({
            ...l,
            created_at: new Date().toISOString(),
          }))
        );
      }

      setLoading(false);
    }
    load();
  }, [vendorId]);

  const handleWhatsApp = () => {
    const phone = (profile?.whatsapp || profile?.phone || "").replace(/\D/g, "");
    if (!phone) return;
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 text-sm">Profile not found.</p>
        <Link href="/" className="mt-4 text-sm text-[#2563EB] underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Link href="/map" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
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
              {profile.type && (
                <span className="inline-block mt-1 text-xs font-medium text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded capitalize">
                  {profile.type}
                </span>
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
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            )}
            {(profile.whatsapp || profile.phone) && (
              <button
                onClick={handleWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
            )}
          </div>

          {/* Social Deep-Link Buttons */}
          {(profile.facebook_url || profile.instagram_url || profile.facebook_shop_url || profile.facebook_handle || profile.instagram_handle) && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              {(profile.facebook_handle || profile.facebook_url) && (() => {
                const handle = profile.facebook_handle || (profile.facebook_url || '').replace(/^https?:\/\/(www\.)?facebook\.com\/?/i, '').replace(/\/$/, '');
                if (!handle) return null;
                return (
                  <a
                    href={`fb://facewebmodal/f?href=https://facebook.com/${handle}`}
                    onClick={(e) => {
                      setTimeout(() => { window.open(`https://facebook.com/${handle}`, '_blank'); }, 500);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1877F2] text-white text-xs font-semibold hover:bg-[#166FE5] transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </a>
                );
              })()}
              {profile.facebook_shop_url && (
                <a
                  href={profile.facebook_shop_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1877F2]/10 text-[#1877F2] text-xs font-semibold hover:bg-[#1877F2]/20 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  FB Shop
                </a>
              )}
              {(profile.instagram_handle || profile.instagram_url) && (() => {
                const handle = profile.instagram_handle || (profile.instagram_url || '').replace(/^https?:\/\/(www\.)?instagram\.com\/?/i, '').replace(/\/$/, '');
                if (!handle) return null;
                return (
                  <a
                    href={`instagram://user?username=${handle}`}
                    onClick={(e) => {
                      setTimeout(() => { window.open(`https://instagram.com/${handle}`, '_blank'); }, 500);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                    Instagram
                  </a>
                );
              })()}
            </div>
          )}
        </div>

        {/* Vendor Listings */}
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
                              <Square className="h-3 w-3" />{ad.square_meters}m&sup2;
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
