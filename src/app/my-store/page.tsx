"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { mockProfiles, MockVendorListing } from "@/lib/mockProfiles";
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
} from "lucide-react";

export default function MyStorePage() {
  const [vendor, setVendor] = useState(mockProfiles[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: vendor.bio,
    phone: vendor.phone,
    whatsapp: vendor.whatsapp,
    facebook_url: vendor.facebook_url,
    instagram_url: vendor.instagram_url,
    facebook_shop_url: vendor.facebook_shop_url || "",
  });
  const [listings, setListings] = useState<MockVendorListing[]>(vendor.listings);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleSaveProfile = () => {
    setVendor((prev) => ({
      ...prev,
      bio: editForm.bio,
      phone: editForm.phone,
      whatsapp: editForm.whatsapp,
      facebook_url: editForm.facebook_url,
      instagram_url: editForm.instagram_url,
      facebook_shop_url: editForm.facebook_shop_url,
    }));
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setDeleteTarget(null);
  };

  const handleWhatsApp = () => {
    const phone = vendor.whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <img
              src={vendor.avatar_url}
              alt={vendor.full_name}
              className="h-20 w-20 rounded-full object-cover shrink-0 ring-2 ring-gray-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{vendor.full_name}</h1>
                  {vendor.company && (
                    <p className="text-sm text-gray-500 mt-0.5">{vendor.company}</p>
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

              {/* Bio */}
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={2}
                  className="mt-3 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
                />
              ) : (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{vendor.bio}</p>
              )}

              {/* Communication Row */}
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
                      href={`tel:${vendor.phone}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
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
                  </>
                )}
              </div>

              {/* Social Links */}
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
                    {vendor.facebook_url && (
                      <a href={vendor.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#2563EB] hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Facebook Group
                      </a>
                    )}
                    {vendor.facebook_shop_url && (
                      <a href={vendor.facebook_shop_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#2563EB] hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Facebook Shop
                      </a>
                    )}
                    {vendor.instagram_url && (
                      <a href={vendor.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-pink-600 hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Save button when editing */}
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

        {/* Listings Grid Section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">My Active Listings</h2>
            <span className="text-sm text-gray-500">{listings.length} item{listings.length !== 1 ? "s" : ""}</span>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500 text-sm">No active listings yet.</p>
              <a href="/sell" className="mt-3 inline-block text-sm text-[#2563EB] font-medium hover:underline">
                Post your first ad
              </a>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 gap-4 space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="break-inside-avoid bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative group"
                >
                  {/* Owner Controls Overlay */}
                  <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(listing.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur border border-red-200 rounded-md text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>

                  {/* Image */}
                  {listing.images[0] && (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-40 object-cover"
                    />
                  )}

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
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mt-1">{listing.title}</h3>
                    <p className="text-base font-bold text-gray-900 mt-2">
                      {listing.price.toLocaleString()} <span className="text-xs font-medium text-gray-400">CVE</span>
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{listing.zone ? `${listing.zone}, ` : ""}{listing.island}</span>
                    </div>

                    {/* Property Details */}
                    {listing.mode === "real_estate" && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        {listing.bedrooms && (
                          <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{listing.bedrooms}</span>
                        )}
                        {listing.bathrooms && (
                          <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{listing.bathrooms}</span>
                        )}
                        {listing.square_meters && (
                          <span className="flex items-center gap-1"><Ruler className="h-3 w-3" />{listing.square_meters}m&sup2;</span>
                        )}
                      </div>
                    )}
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
                <h3 className="text-base font-bold text-gray-900">Delete Listing</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
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
    </div>
  );
}
