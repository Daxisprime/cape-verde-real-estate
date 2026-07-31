"use client";

import React, { useEffect, useState, useCallback } from "react";
import { notFound } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { mockProfiles } from "@/lib/mockProfiles";
import { capeVerdeProperties, agentDatabase } from "@/data/cape-verde-properties";
import { MARKETPLACE_ITEMS } from "@/data/marketplace-items";
import Header from "@/components/Header";
import ReviewDrawer from "@/components/ReviewDrawer";
import SocialShareBar from "@/components/SocialShareBar";
import { useSearchMode } from "@/contexts/SearchModeContext";
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
  verified_at: string | null;
  bio: string | null;
  whatsapp_number: string | null;
  facebook_handle: string | null;
  instagram_handle: string | null;
  twitter_handle: string | null;
  website_url: string | null;
  created_at: string;
  store_name: string | null;
  store_description: string | null;
  store_logo: string | null;
  store_banner: string | null;
  banner_style: string | null;
  rating_average: number;
  review_count: number;
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
  bedrooms?: number;
  bathrooms?: number;
  total_area?: number | null;
  property_type?: string;
  listing_type?: string;
  category?: string;
  condition?: string;
}

interface Props {
  profileId: string | null;
  slug: string;
  storeId?: string | null;
}

function hydrateFromSlug(slug: string): { profile: Profile; listings: UnifiedListing[] } | null {
  const mockMatch = mockProfiles.find((p) => p.id === slug);
  if (mockMatch) {
    const profile: Profile = {
      id: mockMatch.id,
      name: mockMatch.full_name,
      email: "",
      avatar: mockMatch.avatar_url,
      phone: mockMatch.phone,
      verified: true,
      bio: mockMatch.bio,
      whatsapp_number: mockMatch.whatsapp,
      facebook_handle: mockMatch.facebook_url || null,
      instagram_handle: mockMatch.instagram_url || null,
      twitter_handle: null,
      website_url: null,
      created_at: "2026-01-15T00:00:00Z",
    };
    const listings: UnifiedListing[] = mockMatch.listings.map((l) => ({
      id: l.id,
      type: l.mode === "real_estate" ? "property" as const : "marketplace" as const,
      title: l.title,
      description: null,
      price: l.price,
      images: l.images,
      island: l.island,
      location: l.zone,
      created_at: "2026-06-15T00:00:00Z",
      bedrooms: l.bedrooms || undefined,
      bathrooms: l.bathrooms || undefined,
      total_area: l.square_meters,
      property_type: l.mode === "real_estate" ? "apartment" : undefined,
      listing_type: l.mode === "real_estate" ? "sale" : undefined,
      category: l.mode !== "real_estate" ? "Item" : undefined,
    }));
    return { profile, listings };
  }

  const agent = agentDatabase[slug as keyof typeof agentDatabase];
  if (agent) {
    const agentProperties = capeVerdeProperties.filter(
      (p) => (p as typeof p & { agentId?: string }).agentId === slug
    );
    const profile: Profile = {
      id: agent.id,
      name: agent.name,
      email: agent.email,
      avatar: agent.image,
      phone: agent.phone,
      verified: true,
      bio: `${agent.title} - ${agent.company}. ${agent.specialties.join(", ")}. ${agent.experience} anos de experiencia.`,
      whatsapp_number: agent.phone,
      facebook_handle: null,
      instagram_handle: null,
      twitter_handle: null,
      website_url: null,
      created_at: "2025-01-01T00:00:00Z",
    };
    const listings: UnifiedListing[] = agentProperties.map((p) => ({
      id: p.id,
      type: "property" as const,
      title: p.title,
      description: p.description || null,
      price: p.price,
      images: p.images,
      island: p.island,
      location: p.location,
      created_at: (p as typeof p & { listingDate?: string }).listingDate || "2026-01-01T00:00:00Z",
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      total_area: p.totalArea,
      property_type: p.type,
      listing_type: "sale",
    }));
    return { profile, listings };
  }

  // Handle marketplace vendor IDs (vendor-001, vendor-002, etc.)
  const vendorMarketItems = MARKETPLACE_ITEMS.filter(
    (p) => (p as typeof p & { agentId?: string }).agentId === slug
  );
  if (vendorMarketItems.length > 0) {
    const vendorProfiles: Record<string, { name: string; avatar: string | null; bio: string; facebook: string | null }> = {
      "vendor-001": { name: "Praia Building Supplies", avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=64&h=64&fit=crop", bio: "Materiais de construcao de qualidade em Santiago. Entrega disponivel.", facebook: "praia.building.supplies" },
      "vendor-002": { name: "TechStore Sal", avatar: null, bio: "Electronica e tecnologia em Santa Maria, Sal.", facebook: null },
      "vendor-003": { name: "Mindelo Plumbing Pro", avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=64&h=64&fit=crop", bio: "Servicos profissionais de canalizacao em Sao Vicente. Servico de emergencia disponivel.", facebook: "mindelo.plumbing.pro" },
      "vendor-004": { name: "Casa & Design Sal", avatar: null, bio: "Mobiliario moderno e design de cozinha em Espargos.", facebook: null },
      "vendor-005": { name: "Servicos Juridicos Praia", avatar: null, bio: "Servicos juridicos e notariais para transacoes imobiliarias e registos comerciais.", facebook: null },
      "vendor-006": { name: "Moda Santa Maria", avatar: null, bio: "Colecao de moda e acessorios de design cabo-verdiano.", facebook: null },
    };
    const vendorInfo = vendorProfiles[slug] || { name: "Vendedor Pro.CV", avatar: null, bio: "Vendedor verificado na plataforma Pro.CV", facebook: null };
    const profile: Profile = {
      id: slug,
      name: vendorInfo.name,
      email: "",
      avatar: vendorInfo.avatar,
      phone: null,
      verified: true,
      bio: vendorInfo.bio,
      whatsapp_number: null,
      facebook_handle: vendorInfo.facebook,
      instagram_handle: null,
      twitter_handle: null,
      website_url: null,
      created_at: "2026-01-01T00:00:00Z",
    };
    const listings: UnifiedListing[] = vendorMarketItems.map((p) => ({
      id: p.id,
      type: "marketplace" as const,
      title: p.title,
      description: p.description || null,
      price: p.price,
      images: p.images,
      island: p.island,
      location: p.location,
      created_at: (p as typeof p & { listingDate?: string }).listingDate || "2026-01-01T00:00:00Z",
      category: p.type,
    }));
    return { profile, listings };
  }

  return null;
}

const GRADIENT_MAP: Record<string, string> = {
  santiago_blue: 'bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500',
  fogo_volcanic: 'bg-gradient-to-r from-orange-500 via-rose-500 to-red-600',
  sal_turquoise: 'bg-gradient-to-r from-cyan-400 via-teal-400 to-sky-500',
  mindelo_night: 'bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800',
  // Legacy names (backwards compat)
  ocean_blue: 'bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500',
  volcanic_sunset: 'bg-gradient-to-r from-orange-500 via-rose-500 to-red-600',
  praia_palm: 'bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400',
};

function getGradientClass(banner: string | null): string {
  if (!banner) return GRADIENT_MAP.ocean_blue;
  return GRADIENT_MAP[banner] || GRADIENT_MAP.ocean_blue;
}

export default function StorePageClient({ profileId, slug, storeId }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<UnifiedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [isMockProfile, setIsMockProfile] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { setSearchMode } = useSearchMode();

  useEffect(() => {
    if (listings.length === 0) return;
    const marketplaceCount = listings.filter((l) => l.type === "marketplace").length;
    const propertyCount = listings.filter((l) => l.type === "property").length;
    if (marketplaceCount > propertyCount) {
      setSearchMode("markets");
    } else {
      setSearchMode("realestate");
    }
  }, [listings, setSearchMode]);

  const [profileNotFound, setProfileNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    let resolvedProfileId = profileId;

    if (!resolvedProfileId) {
      const supabase = createSupabaseBrowserClient();
      if (supabase) {
        const { data: bySlug } = await supabase.from("profiles").select("id").eq("slug", slug).maybeSingle();
        if (bySlug) {
          resolvedProfileId = bySlug.id;
        } else {
          const { data: byId } = await supabase.from("profiles").select("id").eq("id", slug).maybeSingle();
          if (byId) resolvedProfileId = byId.id;
        }
      }

      if (!resolvedProfileId) {
        const mockData = hydrateFromSlug(slug);
        if (mockData) {
          setProfile(mockData.profile);
          setListings(mockData.listings);
          setIsMockProfile(true);
        } else {
          setProfileNotFound(true);
        }
        setLoading(false);
        return;
      }
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {

    console.log("[StorePageClient] fetchData called with:", { profileId: resolvedProfileId, storeId, slug });

    let propertiesQuery = supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("last_bumped_at", { ascending: false });

    let marketplaceQuery = supabase
        .from("marketplace_items")
        .select("*")
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("last_bumped_at", { ascending: false });

    if (storeId) {
      propertiesQuery = propertiesQuery.or(`store_id.eq.${storeId},and(store_id.is.null,agent_id.eq.${resolvedProfileId})`);
      marketplaceQuery = marketplaceQuery.or(`store_id.eq.${storeId},and(store_id.is.null,user_id.eq.${resolvedProfileId})`);
    } else {
      propertiesQuery = propertiesQuery.eq("agent_id", resolvedProfileId);
      marketplaceQuery = marketplaceQuery.eq("user_id", resolvedProfileId);
    }

    console.log("[StorePageClient] Query params:", { resolvedProfileId, storeId });

    const [profileRes, propertiesRes, marketplaceRes, reviewsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", resolvedProfileId).maybeSingle(),
      propertiesQuery,
      marketplaceQuery,
      supabase
        .from("vendor_reviews")
        .select("rating")
        .eq("vendor_id", resolvedProfileId),
    ]);

    console.log("Public fetch result:", {
      profile: { data: profileRes.data, error: profileRes.error },
      properties: { data: propertiesRes.data, error: propertiesRes.error },
      marketplace: { data: marketplaceRes.data, error: marketplaceRes.error },
      reviews: { data: reviewsRes.data, error: reviewsRes.error },
    });

    if (profileRes.data) {
      setProfile(profileRes.data as unknown as Profile);
    } else if (!profileRes.error) {
      setProfileNotFound(true);
    }

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

    console.log("[StorePageClient] Setting listings, count:", unified.length, "titles:", unified.slice(0, 3).map(l => l.title));
    setListings(unified);
    } catch (err) {
      console.error("[StorePageClient] fetchData failed:", err);
    } finally {
      setLoading(false);
    }
  }, [profileId, slug, storeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    function handleFocus() {
      if (profileId) fetchData();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchData, profileId]);

  const filteredListings = listings.filter((item) => {
    if (categoryFilter === "all") return true;
    if (categoryFilter === "property") return item.type === "property";
    if (categoryFilter === "marketplace") return item.type === "marketplace";
    if (categoryFilter.startsWith("cat:")) return item.category === categoryFilter.slice(4);
    return true;
  });

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

  if (!profile && profileNotFound) {
    notFound();
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Nao foi possivel carregar o perfil. Tente novamente.</p>
      </div>
    );
  }

  const memberDate = new Date(profile.created_at);
  const memberSince = memberDate.toLocaleDateString("pt-CV", {
    month: "long",
    year: "numeric",
  });

  const whatsappLink = profile.whatsapp_number
    ? `https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, "")}`
    : null;

  const isVerified = !!(profile.verified || profile.verified_at);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Store Header - only rendered if store_name or store_banner are present */}
      {(profile.store_name || profile.store_banner || profile.banner_style) && (
        <div className="w-full relative overflow-hidden">
          {/* Banner - respects banner_style preference */}
          {profile.banner_style === 'gradient' ? (
            <div className={`w-full h-48 sm:h-56 lg:h-64 ${getGradientClass(profile.store_banner)}`} />
          ) : profile.banner_style === 'stock' && profile.store_banner ? (
            <div className="w-full h-48 sm:h-56 lg:h-64 relative">
              <img
                src={profile.store_banner}
                alt={`${profile.store_name || profile.name} banner`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
          ) : profile.store_banner && profile.store_banner.startsWith('http') ? (
            <div className="w-full h-48 sm:h-56 lg:h-64 relative">
              <img
                src={profile.store_banner}
                alt={`${profile.store_name || profile.name} banner`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-36 sm:h-44 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500" />
          )}

          {/* Store identity overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-5">
            <div className="max-w-7xl mx-auto flex items-end gap-4">
              {profile.store_logo && (
                <img
                  src={profile.store_logo}
                  alt={`${profile.store_name || profile.name} logo`}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white shadow-lg flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white truncate drop-shadow-sm">
                  {profile.store_name}
                </h1>
                {profile.store_description && (
                  <p className="text-sm text-white/80 line-clamp-2 mt-0.5 drop-shadow-sm">
                    {profile.store_description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Sidebar - Profile Card */}
          <aside className="lg:col-span-1 mb-6 lg:mb-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-6 text-center border-b border-gray-100">
                <div className="relative inline-block">
                  {(profile.store_logo || profile.avatar) ? (
                    <img
                      src={profile.store_logo || profile.avatar || ""}
                      alt={profile.store_name || profile.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto">
                      {profile.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  {isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                      <CheckCircle className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                    </div>
                  )}
                </div>

                <h1 className="mt-4 text-xl font-bold text-gray-900 flex items-center justify-center gap-1.5">
                  {profile.store_name || profile.name}
                  {isVerified && (
                    <CheckCircle className="w-5 h-5 text-emerald-500 inline-block" />
                  )}
                </h1>

                {profile.store_description && (
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{profile.store_description}</p>
                )}

                {/* Rating */}
                {(reviewCount > 0 || profile.review_count > 0) && (
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= Math.round(avgRating || profile.rating_average) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{(avgRating || profile.rating_average).toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({reviewCount || profile.review_count} avaliacoes)</span>
                  </div>
                )}

                {isVerified && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-semibold text-emerald-700">
                    <CheckCircle className="w-3 h-3" /> Verificado
                  </span>
                )}

                <p className="mt-2 text-sm text-gray-500 flex items-center justify-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Membro desde: {memberSince}
                </p>

                {listings.length > 0 && (
                  <p className="mt-2 text-sm font-medium text-teal-600">
                    {listings.length} {listings.length === 1 ? "anuncio" : "anuncios"} activos
                  </p>
                )}

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

                  <div className="mt-3">
                    <SocialShareBar
                      title={profile.name || "Loja"}
                      url={`/store/${slug}`}
                    />
                  </div>
              </div>

              {profile.bio && (
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                </div>
              )}

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

              <div className="px-4 pb-4">
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium text-teal-700">
                      Praia, Santiago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Listing Feed */}
          <section className="lg:col-span-2">
            {/* Category Tab Buttons */}
            {listings.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    { value: "all", label: "Todos" },
                    { value: "property", label: "Imoveis" },
                    { value: "marketplace", label: "Moveis" },
                    ...[...new Set(listings.filter(l => l.category).map(l => l.category!))].map((cat) => ({
                      value: `cat:${cat}`,
                      label: cat,
                    })),
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setCategoryFilter(tab.value)}
                      className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                        categoryFilter === tab.value
                          ? "bg-teal-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {filteredListings.length} {filteredListings.length === 1 ? "resultado" : "resultados"}
                </p>
              </div>
            )}

            {filteredListings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Sem anuncios</h3>
                <p className="text-gray-500 mt-1">Este vendedor ainda nao publicou anuncios.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {profile && (
        <ReviewDrawer
          vendorId={profileId || profile.id}
          vendorName={profile.name || ""}
          isOpen={isReviewDrawerOpen}
          onClose={() => setIsReviewDrawerOpen(false)}
        />
      )}
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

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-teal-600 transition-colors">
          {listing.title}
        </h3>

        <p className="mt-2 text-lg font-bold text-gray-900">
          {formattedPrice}
          <span className="text-xs font-normal text-gray-500 ml-1">CVE</span>
        </p>

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

        {listing.type === "marketplace" && listing.condition && (
          <p className="mt-1 text-xs text-gray-500 capitalize">{listing.condition}</p>
        )}

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
