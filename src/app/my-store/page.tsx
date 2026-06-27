"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PromoteListingDrawer from "@/components/PromoteListingDrawer";
import { mockProfiles, MockVendorListing } from "@/lib/mockProfiles";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useMyListings } from "@/hooks/useListings";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  Phone,
  MessageCircle,
  ExternalLink,
  Pencil,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Ruler,
  X,
  Check,
  AlertTriangle,
  RotateCcw,
  Archive,
  Facebook,
  Star,
  Crown,
} from "lucide-react";

type ListingStatus = "active" | "reviewing" | "closed";

const PLACEHOLDER_IMAGE = "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?w=800&h=400&fit=crop";

interface ManagedListing extends MockVendorListing {
  status: ListingStatus;
}

const STATUS_TABS: { key: ListingStatus; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "reviewing", label: "Reviewing" },
  { key: "closed", label: "Closed" },
];

export default function MyStorePage() {
  const { isAuthenticated, profile, user } = useSupabaseAuth();
  const { listings: liveListings, loading: listingsLoading } = useMyListings();
  const router = useRouter();
  const fallbackVendor = mockProfiles[0];

  const vendorName = profile?.name || fallbackVendor.full_name;
  const vendorAvatar = profile?.avatar || fallbackVendor.avatar_url;
  const vendorPhone = profile?.phone || fallbackVendor.phone;
  const vendorEmail = user?.email || '';

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: fallbackVendor.bio,
    phone: vendorPhone,
    whatsapp: fallbackVendor.whatsapp,
    facebook_url: fallbackVendor.facebook_url,
    instagram_url: fallbackVendor.instagram_url,
    facebook_shop_url: fallbackVendor.facebook_shop_url || "",
  });

  // Merge live listings with mock fallback
  const [listings, setListings] = useState<ManagedListing[]>(() =>
    fallbackVendor.listings.map((l, i) => ({
      ...l,
      status: i === 0 ? "active" : i === 1 ? "reviewing" : "active",
    }))
  );

  useEffect(() => {
    if (liveListings.length > 0) {
      const live: ManagedListing[] = liveListings.map(item => ({
        id: item.id,
        mode: 'real_estate' as const,
        title: item.title || 'Untitled Listing',
        price: item.price || 0,
        island: item.island || 'Cape Verde',
        zone: item.location || '',
        images: item.images?.length ? item.images : [PLACEHOLDER_IMAGE],
        bedrooms: item.bedrooms || null,
        bathrooms: item.bathrooms || null,
        square_meters: item.total_area || null,
        status: (item.status === 'sold' ? 'closed' : item.status === 'draft' ? 'reviewing' : 'active') as ListingStatus,
      }));
      setListings(live);
    }
  }, [liveListings]);

  const [activeTab, setActiveTab] = useState<ListingStatus>("active");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<{ id: string; title: string } | null>(null);

  const filteredListings = listings.filter((l) => l.status === activeTab);

  const tabCounts = {
    active: listings.filter((l) => l.status === "active").length,
    reviewing: listings.filter((l) => l.status === "reviewing").length,
    closed: listings.filter((l) => l.status === "closed").length,
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  const handleMarkSold = (id: string) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "closed" as ListingStatus } : l)));
  };

  const handleRelist = (id: string) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "active" as ListingStatus } : l)));
  };

  const handleDelete = async (id: string) => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      await supabase.from('properties').delete().eq('id', id);
    }
    setListings((prev) => prev.filter((l) => l.id !== id));
    setDeleteTarget(null);
  };

  const handleEdit = (id: string) => {
    router.push(`/sell?edit=${id}`);
  };

  const handleWhatsApp = () => {
    const phone = (editForm.whatsapp || vendorPhone || '').replace(/\D/g, "");
    if (phone) window.open(`https://wa.me/${phone}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <img
              src={vendorAvatar}
              alt={vendorName}
              className="h-20 w-20 rounded-full object-cover shrink-0 ring-2 ring-gray-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-gray-900">{vendorName}</h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-sm">
                      <Crown className="h-3 w-3" />
                      Plano Patrão (Grátis)
                    </span>
                  </div>
                  {vendorEmail && (
                    <p className="text-sm text-gray-500 mt-0.5">{vendorEmail}</p>
                  )}
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {isEditing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={2}
                  className="mt-3 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
                />
              ) : (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{editForm.bio}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {isEditing ? (
                  <>
                    <div className="flex-1 min-w-[140px]">
                      <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                      <input
                        value={editForm.phone}
                        onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <label className="text-xs text-gray-500 mb-1 block">WhatsApp</label>
                      <input
                        value={editForm.whatsapp}
                        onChange={(e) => setEditForm((p) => ({ ...p, whatsapp: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <a
                      href={`tel:${vendorPhone}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0044FF] text-white text-sm font-medium hover:bg-[#0033CC] transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call
                    </a>
                    <button
                      onClick={handleWhatsApp}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </button>
                    {editForm.facebook_url && (
                      <a
                        href={`fb://facewebmodal/f?href=${editForm.facebook_url}`}
                        onClick={() => {
                          setTimeout(() => { window.open(editForm.facebook_url, '_blank'); }, 500);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1877F2] text-white text-sm font-medium hover:bg-[#166FE5] transition-colors"
                      >
                        <Facebook className="h-3.5 w-3.5" />
                        Facebook
                      </a>
                    )}
                  </>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Facebook Group</label>
                      <input
                        value={editForm.facebook_url}
                        onChange={(e) => setEditForm((p) => ({ ...p, facebook_url: e.target.value }))}
                        placeholder="https://facebook.com/..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Facebook Shop</label>
                      <input
                        value={editForm.facebook_shop_url}
                        onChange={(e) => setEditForm((p) => ({ ...p, facebook_shop_url: e.target.value }))}
                        placeholder="https://facebook.com/marketplace/..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Instagram</label>
                      <input
                        value={editForm.instagram_url}
                        onChange={(e) => setEditForm((p) => ({ ...p, instagram_url: e.target.value }))}
                        placeholder="https://instagram.com/..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {editForm.facebook_url && (
                      <a href={editForm.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#2563EB] hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Facebook Group
                      </a>
                    )}
                    {editForm.facebook_shop_url && (
                      <a href={editForm.facebook_shop_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#2563EB] hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Facebook Shop
                      </a>
                    )}
                    {editForm.instagram_url && (
                      <a href={editForm.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-pink-600 hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="mt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">My Active Listings</h2>
            <a href="/sell" className="text-sm text-[#2563EB] font-medium hover:underline">+ Post New</a>
          </div>

          {/* Status Tab Bar */}
          <div className="bg-gray-100 rounded-full p-1 flex mb-6">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-[#1e3a8a] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label} ({tabCounts[tab.key]})
              </button>
            ))}
          </div>

          {/* Filtered Listings Grid */}
          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <p className="text-sm text-gray-500">No listings found in this category.</p>
              {activeTab === "active" && (
                <a href="/sell" className="mt-3 inline-block text-sm text-[#2563EB] font-medium hover:underline">
                  Post your first ad
                </a>
              )}
            </div>
          ) : (
            <div className="columns-2 gap-2 w-full block">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="break-inside-avoid inline-block w-full mb-2"
                >
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative group">
                  {/* Reviewing Badge */}
                  {listing.status === "reviewing" && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                        Under Review
                      </span>
                    </div>
                  )}

                  {/* Active Card Controls */}
                  {listing.status === "active" && (
                    <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPromoteTarget({ id: listing.id, title: listing.title || "Untitled" })}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-400/95 backdrop-blur border border-amber-300 rounded-md text-white hover:bg-amber-500 shadow-sm"
                      >
                        <Star className="h-3 w-3 fill-white" />
                        Promover
                      </button>
                      <button
                        onClick={() => handleEdit(listing.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 shadow-sm"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleMarkSold(listing.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 shadow-sm"
                      >
                        <Archive className="h-3 w-3" />
                        Sold
                      </button>
                      <button
                        onClick={() => setDeleteTarget(listing.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur border border-red-200 rounded-md text-red-600 hover:bg-red-50 shadow-sm"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Closed Card Controls */}
                  {listing.status === "closed" && (
                    <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRelist(listing.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur border border-blue-200 rounded-md text-[#2563EB] hover:bg-blue-50 shadow-sm"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Relist Ad
                      </button>
                      <button
                        onClick={() => setDeleteTarget(listing.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur border border-red-200 rounded-md text-red-600 hover:bg-red-50 shadow-sm"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}

                  {/* Image */}
                  <img
                    src={listing.images?.[0] || PLACEHOLDER_IMAGE}
                    alt={listing.title || "Listing"}
                    className={`w-full h-40 object-cover ${listing.status === "closed" ? "opacity-60 grayscale" : ""}`}
                  />

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        listing.mode === "real_estate"
                          ? "bg-blue-50 text-[#2563EB]"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {listing.mode === "real_estate" ? "Property" : "Item / Service"}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mt-1">{listing.title || "Untitled Listing"}</h3>
                    <p className="text-base font-bold text-gray-900 mt-2">
                      {(listing.price ?? 0).toLocaleString()} <span className="text-xs font-medium text-gray-400">CVE</span>
                    </p>

                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{listing.zone ? `${listing.zone}, ` : ""}{listing.island || "Cape Verde"}</span>
                    </div>

                    {listing.mode === "real_estate" && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        {listing.bedrooms != null && listing.bedrooms > 0 && (
                          <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{listing.bedrooms}</span>
                        )}
                        {listing.bathrooms != null && listing.bathrooms > 0 && (
                          <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{listing.bathrooms}</span>
                        )}
                        {listing.square_meters != null && listing.square_meters > 0 && (
                          <span className="flex items-center gap-1"><Ruler className="h-3 w-3" />{listing.square_meters}m&sup2;</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Permanently</h3>
                <p className="text-sm text-gray-500">This listing will be removed forever.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promote Listing Drawer */}
      <PromoteListingDrawer
        isOpen={!!promoteTarget}
        onClose={() => setPromoteTarget(null)}
        listingId={promoteTarget?.id || ""}
        listingTitle={promoteTarget?.title || ""}
        listingType="property"
        onSuccess={() => setPromoteTarget(null)}
      />
    </div>
  );
}
