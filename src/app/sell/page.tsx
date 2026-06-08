"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import PostAdForm, { CreatedAd } from "@/components/PostAdForm";
import { Phone, MessageCircle, ExternalLink, Pencil, MapPin } from "lucide-react";
import { mockProfiles } from "@/lib/mockProfiles";

export default function SellPage() {
  const vendor = mockProfiles[0];
  const [recentAds, setRecentAds] = useState<CreatedAd[]>([]);

  const handleWhatsApp = () => {
    const phone = vendor.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  const handleAdCreated = (ad: CreatedAd) => {
    setRecentAds((prev) => [ad, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto px-4 mt-6 items-start pb-20">
        {/* LEFT COLUMN: Vendor Profile Dashboard */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-20 space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <img
                  src={vendor.avatar_url}
                  alt={vendor.full_name}
                  className="h-14 w-14 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-gray-900 truncate">{vendor.full_name}</h2>
                  <p className="text-xs text-gray-500 truncate">{vendor.company}</p>
                  <span className="inline-block mt-1 text-xs font-medium text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded capitalize">
                    {vendor.type}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-gray-600 leading-relaxed">{vendor.bio}</p>

              {/* Call + WhatsApp */}
              <div className="flex gap-2">
                <a
                  href={`tel:${vendor.phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </button>
              </div>

              {/* Social Drop-Links */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Social Links</p>
                {vendor.facebook_url && (
                  <a
                    href={vendor.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#2563EB] hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Facebook Group
                  </a>
                )}
                {vendor.facebook_shop_url && (
                  <a
                    href={vendor.facebook_shop_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#2563EB] hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Facebook Shop
                  </a>
                )}
                {vendor.instagram_url && (
                  <a
                    href={vendor.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-pink-600 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Instagram
                  </a>
                )}
              </div>

              {/* Edit Profile Link */}
              <div className="pt-3 border-t border-gray-100">
                <a
                  href="/settings"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Profile Details
                </a>
              </div>
            </div>

            {/* Recent Listings Feed */}
            {recentAds.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Just Posted ({recentAds.length})
                </p>
                <div className="space-y-2">
                  {recentAds.map((ad) => (
                    <div key={ad.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                      {ad.images[0] && (
                        <img src={ad.images[0]} alt={ad.title} className="h-10 w-10 rounded-md object-cover shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{ad.title}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{ad.zone ? `${ad.zone}, ` : ""}{ad.island}</span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{ad.price.toLocaleString()} CVE</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: PostAdForm Upload Wizard */}
        <main className="lg:col-span-8">
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h1 className="text-lg font-bold text-gray-900 mb-1">Create New Listing</h1>
            <p className="text-sm text-gray-500 mb-6">Post a property or item to your storefront.</p>
            <PostAdForm vendorId={vendor.id} onAdCreated={handleAdCreated} />
          </div>
        </main>
      </div>
    </div>
  );
}
