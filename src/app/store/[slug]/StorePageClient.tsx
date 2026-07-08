"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import Header from "@/components/Header";
import ReviewDrawer from "@/components/ReviewDrawer";
import {
  CheckCircle,
  MapPin,
  Phone,
  ExternalLink,
  BedDouble,
  Bath,
  Maximize,
  Calendar,
  Eye,
  MessageCircle,
  Star,
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  verified: boolean;
  bio: string | null;
  whatsapp_number: string | null;
  facebook_handle: string | null;
  instagram_handle: string | null;
  twitter_handle: string | null;
  website_url: string | null;
  created_at: string;
}

interface UnifiedListing {
  id: string;
  type: "property" | "marketplace";
  title: string;
  description: string | null;
  price: number;
  images: string[];
  island: string;
  location: string | null;
  created_at: string;
  // Property-specific
  bedrooms?: number;
  bathrooms?: number;
  total_area?: number | null;
  property_type?: string;
  listing_type?: string;
  // Marketplace-specific
  category?: string;
  condition?: string;
}

interface Props {
  profileId: string;
  slug: string;
}

export default function StorePageClient({ profileId }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<UnifiedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;

      const [profileRes, propertiesRes, marketplaceRes, reviewsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", profileId).maybeSingle(),
        supabase
          .from("properties")
          .select("*")
          .eq("agent_id", profileId)
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase
          .from("marketplace_items")
          .select("*")
          .eq("user_id", profileId)
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase
          .from("vendor_reviews")
          .select("rating")
          .eq("vendor_id", profileId),
      ]);

      if (profileRes.data) setProfile(profileRes.data as unknown as Profile);

      if (reviewsRes.data) {
        setReviewCount(reviewsRes.data.length);
        if (reviewsRes.data.length > 0) {
          const avg = reviewsRes.data.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewsRes.data.length;
          setAvgRating(avg);
        }
      }

      const unified: UnifiedListing[] = [];

      if (propertiesRes.data) {
        for (const p of propertiesRes.data) {
          unified.push({
            id: p.id,
            type: "property",
            title: p.title,
            description: p.description || null,
            price: Number(p.price),
            images: (p.images as string[]) || [],
            island: p.island || "",
            location: p.location || null,
            created_at: p.created_at,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            total_area: p.total_area ? Number(p.total_area) : null,
            property_type: p.property_type,
            listing_type: p.listing_type,
          });
        }
      }

      if (marketplaceRes.data) {
        for (const m of marketplaceRes.data) {
          unified.push({
            id: m.id,
            type: "marketplace",
            title: m.title,
            description: m.description || null,
            price: Number(m.price_cve),
            images: (m.images as string[]) || [],
            island: m.island || "",
            location: m.municipality || null,
            created_at: m.created_at,
            category: m.category,
            condition: m.condition,
          });
        }
      }

      unified.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setListings(unified);
      setLoading(false);
    }

    fetchData();
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="flex gap-6">
              <div className="w-1/3 hidden lg:block">
                <div className="bg-white rounded-xl h-96" />
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl h-64" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const memberDate = new Date(profile.created_at);
  const memberSince = memberDate.toLocaleDateString("pt-CV", {
    month: "long",
    year: "numeric",
  });

  const whatsappLink = profile.whatsapp_number
    ? `https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Sidebar / Top Card on mobile */}
          <aside className="lg:col-span-1 mb-6 lg:mb-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              {/* Avatar & Identity */}
              <div className="p-6 text-center border-b border-gray-100">
                <div className="relative inline-block">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto">
                      {profile.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  {profile.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                      <CheckCircle className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                    </div>
                  )}
                </div>

                <h1 className="mt-4 text-xl font-bold text-gray-900 flex items-center justify-center gap-1.5">
                  {profile.name}
                  {profile.verified && (
                    <CheckCircle className="w-5 h-5 text-emerald-500 inline-block" />
                  )}
                </h1>

                <p className="mt-1 text-sm text-gray-500 flex items-center justify-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Membro desde: {memberSince}
                </p>

                {listings.length > 0 && (
                  <p className="mt-2 text-sm font-medium text-teal-600">
                    {listings.length} {listings.length === 1 ? "anuncio" : "anuncios"} activos
                  </p>
                )}

                {/* Feedback Trigger */}
                <button
                  onClick={() => setIsReviewDrawerOpen(true)}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors group"
                >
                  <MessageCircle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-amber-700">
                    Feedback ({reviewCount})
                  </span>
                  {avgRating > 0 && (
                    <span className="flex items-center gap-0.5 ml-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-amber-600">{avgRating.toFixed(1)}</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Social Actions */}
              <div className="p-4 space-y-2">
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium text-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.108-1.132l-.288-.171-2.988.888.888-2.988-.171-.288A8 8 0 1112 20z" />
                    </svg>
                    WhatsApp
                  </a>
                )}

                {profile.instagram_handle && (
                  <a
                    href={`https://instagram.com/${profile.instagram_handle.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors font-medium text-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                    Instagram
                  </a>
                )}

                {profile.facebook_handle && (
                  <a
                    href={`https://facebook.com/${profile.facebook_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium text-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </a>
                )}

                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors font-medium text-sm"
                  >
                    <Phone className="w-5 h-5" />
                    {profile.phone}
                  </a>
                )}

                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors font-medium text-sm"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Website
                  </a>
                )}
              </div>

              {/* Mini Map */}
              <div className="px-4 pb-4">
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium text-teal-700">
                      Cabo Verde
                    </span>
                  </div>
                  <img
                    src="https://api.mapbox.com/styles/v1/mapbox/light-v11/static/[-25.0,16.0,-22.5,17.2]/300x150@2x?access_token=pk.placeholder&attribution=false"
                    alt="Cape Verde location"
                    className="w-full h-24 object-cover bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Unified Listing Feed */}
          <section className="lg:col-span-2">
            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">No listings yet</h3>
                <p className="text-gray-500 mt-1">This seller hasn&apos;t posted any listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Review Drawer */}
      <ReviewDrawer
        vendorId={profileId}
        vendorName={profile?.name || ""}
        isOpen={isReviewDrawerOpen}
        onClose={() => setIsReviewDrawerOpen(false)}
      />
    </div>
  );
}

function ListingCard({ listing }: { listing: UnifiedListing }) {
  const imageUrl =
    listing.images?.[0] ||
    "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?w=400&h=300&fit=crop";

  const formattedPrice = new Intl.NumberFormat("pt-CV", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(listing.price);

  const timeAgo = getTimeAgo(listing.created_at);

  return (
    <a
      href={
        listing.type === "property"
          ? `/property/${listing.id}`
          : `/marketplace?item=${listing.id}`
      }
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
              listing.type === "property"
                ? "bg-teal-500 text-white"
                : "bg-amber-500 text-white"
            }`}
          >
            {listing.type === "property"
              ? listing.listing_type === "rent"
                ? "Aluguer"
                : "Venda"
              : listing.category || "Item"}
          </span>
        </div>
        {listing.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-md">
            {listing.images.length} fotos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-teal-600 transition-colors">
          {listing.title}
        </h3>

        <p className="mt-2 text-lg font-bold text-gray-900">
          {formattedPrice}
          <span className="text-xs font-normal text-gray-500 ml-1">CVE</span>
        </p>

        {/* Property details */}
        {listing.type === "property" && (
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            {listing.bedrooms !== undefined && listing.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5" />
                {listing.bedrooms}
              </span>
            )}
            {listing.bathrooms !== undefined && listing.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5" />
                {listing.bathrooms}
              </span>
            )}
            {listing.total_area && (
              <span className="flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5" />
                {listing.total_area}m&sup2;
              </span>
            )}
          </div>
        )}

        {/* Marketplace condition */}
        {listing.type === "marketplace" && listing.condition && (
          <p className="mt-1 text-xs text-gray-500 capitalize">{listing.condition}</p>
        )}

        {/* Location & time */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {listing.location || listing.island}
          </span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </a>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}
