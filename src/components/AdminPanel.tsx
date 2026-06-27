"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  ShieldAlert,
  Ban,
  Users,
  Package,
  Home,
  Loader2,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

interface AdminListing {
  id: string;
  title: string;
  price: number;
  status: string;
  island: string;
  images: string[] | null;
  created_at: string;
  source: "property" | "marketplace";
  owner_id: string | null;
}

interface AdminProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState<"listings" | "users">("listings");
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [banningId, setBanningId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoadingListings(true);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setLoadingListings(false); return; }

    const [{ data: props }, { data: items }] = await Promise.all([
      supabase
        .from("properties")
        .select("id, title, price, status, island, images, created_at, agent_id")
        .neq("status", "banned")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("marketplace_items")
        .select("id, title, price_cve, status, island, images, created_at, user_id")
        .neq("status", "banned")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const merged: AdminListing[] = [];
    if (props) {
      props.forEach((p) =>
        merged.push({
          id: p.id,
          title: p.title || "Untitled",
          price: p.price || 0,
          status: p.status || "active",
          island: p.island || "",
          images: p.images,
          created_at: p.created_at,
          source: "property",
          owner_id: p.agent_id,
        })
      );
    }
    if (items) {
      items.forEach((m) =>
        merged.push({
          id: m.id,
          title: m.title || "Untitled",
          price: m.price_cve || 0,
          status: m.status || "active",
          island: m.island || "",
          images: m.images,
          created_at: m.created_at,
          source: "marketplace",
          owner_id: m.user_id,
        })
      );
    }
    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setListings(merged);
    setLoadingListings(false);
  }, []);

  const fetchProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setLoadingProfiles(false); return; }

    const { data } = await supabase
      .from("profiles")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (data) {
      setProfiles(data as AdminProfile[]);
    }
    setLoadingProfiles(false);
  }, []);

  useEffect(() => {
    if (activeSection === "listings") fetchListings();
    else fetchProfiles();
  }, [activeSection, fetchListings, fetchProfiles]);

  const handleBanListing = async (listing: AdminListing) => {
    setBanningId(listing.id);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setBanningId(null); return; }

    const table = listing.source === "property" ? "properties" : "marketplace_items";
    await supabase.from(table).update({ status: "banned" } as never).eq("id", listing.id);
    setListings((prev) => prev.filter((l) => l.id !== listing.id));
    setBanningId(null);
  };

  const handleChangeRole = async (profileId: string, newRole: string) => {
    setUpdatingRoleId(profileId);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setUpdatingRoleId(null); return; }

    await supabase.from("profiles").update({ role: newRole } as never).eq("id", profileId);
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
    );
    setUpdatingRoleId(null);
  };

  return (
    <section className="bg-white rounded-xl border-2 border-red-200 shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-white" />
          <div>
            <h2 className="text-base font-bold text-white">Painel de Administracao / Moderador</h2>
            <p className="text-xs text-red-100">Admin Control Panel</p>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSection("listings")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeSection === "listings"
              ? "text-red-700 border-b-2 border-red-600 bg-red-50/50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Package className="h-4 w-4" />
          Global Listings Moderation
        </button>
        <button
          onClick={() => setActiveSection("users")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeSection === "users"
              ? "text-red-700 border-b-2 border-red-600 bg-red-50/50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Users className="h-4 w-4" />
          User Management
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeSection === "listings" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {listings.length} active ads across platform
              </p>
              <button
                onClick={fetchListings}
                disabled={loadingListings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingListings ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {loadingListings ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                No active listings to moderate.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {listings.map((listing) => (
                  <div
                    key={`${listing.source}-${listing.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <img
                      src={listing.images?.[0] || "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?w=100"}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          listing.source === "property"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {listing.source === "property" ? <Home className="h-2.5 w-2.5" /> : <Package className="h-2.5 w-2.5" />}
                          {listing.source === "property" ? "Property" : "Market"}
                        </span>
                        <span className="text-[10px] text-gray-400">{listing.island}</span>
                        <span className="text-[10px] font-semibold text-gray-600">
                          {listing.price.toLocaleString()} CVE
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBanListing(listing)}
                      disabled={banningId === listing.id}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {banningId === listing.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Ban className="h-3.5 w-3.5" />
                      )}
                      Take Down Ad
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "users" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {profiles.length} registered profiles
              </p>
              <button
                onClick={fetchProfiles}
                disabled={loadingProfiles}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingProfiles ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {loadingProfiles ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                No registered profiles found.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-3 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-3 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Role</th>
                      <th className="px-3 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Change Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {profiles.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {p.name || "Unnamed"}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {p.email}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            p.role === "admin"
                              ? "bg-red-100 text-red-700"
                              : p.role === "agent"
                              ? "bg-blue-100 text-blue-700"
                              : p.role === "vendor"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {p.role || "user"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="relative">
                            <select
                              value={p.role || "user"}
                              onChange={(e) => handleChangeRole(p.id, e.target.value)}
                              disabled={updatingRoleId === p.id}
                              className="appearance-none w-full px-3 py-1.5 pr-8 text-xs font-medium border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 disabled:opacity-50 cursor-pointer"
                            >
                              <option value="user">Buyer</option>
                              <option value="vendor">Vendor</option>
                              <option value="agent">Agent</option>
                              <option value="admin">Admin</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                            {updatingRoleId === p.id && (
                              <Loader2 className="absolute right-7 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-red-500" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
