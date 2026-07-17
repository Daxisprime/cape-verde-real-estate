"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import AdminPanel from "@/components/AdminPanel";
import PromoteListingDrawer from "@/components/PromoteListingDrawer";
import { useToast } from "@/hooks/use-toast";
import { mockProfiles } from "@/lib/mockProfiles";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useMyListings } from "@/hooks/useListings";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { bumpListing } from "@/lib/vendor-performance";
import { getWalletBalance, deductFromWallet, redeemVoucher, FEATURE_PRICES } from "@/lib/wallet";
import {
  normalizeFacebookUrl,
  normalizeInstagramUrl,
  normalizeWhatsAppUrl,
  normalizeWebsiteUrl,
} from "@/lib/social-normalize";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Phone,
  MessageCircle,
  ExternalLink,
  Pencil,
  X,
  Star,
  Rocket,
  Archive,
  Trash2,
  Gift,
  Wallet,
  Store,
  Plus,
  Facebook,
  Eye,
  Camera,
  Building2,
  Sparkles,
  Lock,
  Crown,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Globe,
  RotateCcw,
  Mail,
} from "lucide-react";

type ListingStatus = "active" | "reviewing" | "closed";

interface ManagedListing {
  id: string;
  mode: "real_estate" | "marketplace";
  title: string;
  price: number;
  island: string;
  zone?: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  square_meters?: number;
  status: string;
  source?: "properties" | "marketplace";
}

const STATUS_TABS: { key: ListingStatus; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "reviewing", label: "Reviewing" },
  { key: "closed", label: "Closed" },
];

export default function MyStorePageClient() {
  const { user, profile, isAuthenticated } = useSupabaseAuth();
  const { listings: liveListings, loading: listingsLoading, refetch: refetchListings } = useMyListings();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const fallbackVendor = mockProfiles[0];

  const vendorName = profile?.name || fallbackVendor.full_name;
  const vendorAvatar = profile?.avatar || fallbackVendor.avatar_url;
  const vendorPhone = profile?.phone || fallbackVendor.phone;
  const vendorEmail = user?.email || "";
  const isAdmin = profile?.role === "admin";

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    bio: "",
    facebook_handle: "",
    instagram_handle: "",
    whatsapp_number: "",
    website_url: "",
  });

  const [isBusiness, setIsBusiness] = useState(false);
  const [showBusinessPanel, setShowBusinessPanel] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    business_name: "",
    business_logo: "",
    business_banner: "",
    business_bio: "",
  });
  const businessLogoRef = useRef<HTMLInputElement>(null);

  const [storefrontForm, setStorefrontForm] = useState({ store_name: "", store_description: "", store_logo: "", store_banner: "", banner_style: "custom" as "custom" | "gradient" | "stock" });
  const [showStorefrontPanel, setShowStorefrontPanel] = useState(false);

  const [activeTab, setActiveTab] = useState<ListingStatus>("active");
  const [walletBalance, setWalletBalance] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState<{ id: string; title: string } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBoostModal, setShowBoostModal] = useState<string | null>(null);

  const [userStores, setUserStores] = useState<Array<{ id: string; slug: string; title: string; category_focus: string | null; store_location: string | null; created_at: string }>>([]);
  const [showNewStoreForm, setShowNewStoreForm] = useState(false);
  const [newStoreForm, setNewStoreForm] = useState({ title: "", slug: "", location: "", category_focus: "", description: "", logo_url: "", banner_url: "" });

  const [allListings, setAllListings] = useState<ManagedListing[]>([]);

  useEffect(() => {
    if (isAuthenticated && !listingsLoading) {
      if (liveListings.length > 0) {
        const live: ManagedListing[] = liveListings.map((item) => ({
          id: item.id,
          mode: item.source === "marketplace" ? ("marketplace" as const) : ("real_estate" as const),
          title: item.title || "Untitled Listing",
          price: item.price || 0,
          island: item.island || "Cape Verde",
          zone: item.location || undefined,
          images: item.images || [],
          bedrooms: item.bedrooms || undefined,
          bathrooms: item.bathrooms || undefined,
          square_meters: item.total_area ? Number(item.total_area) : undefined,
          status: item.status || "active",
          source: item.source,
        }));
        setAllListings(live);
      } else {
        setAllListings([]);
      }
    }
  }, [liveListings, listingsLoading, isAuthenticated]);

  useEffect(() => {
    if (user?.id) {
      getWalletBalance(user.id).then(setWalletBalance);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("stores")
      .select("id, slug, title, category_focus, store_location, created_at")
      .eq("owner_id", user.id)
      .order("created_at")
      .then(({ data }) => {
        if (data) setUserStores(data);
      });
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        facebook_handle: profile.facebook_handle || "",
        instagram_handle: profile.instagram_handle || "",
        whatsapp_number: profile.whatsapp_number || "",
        website_url: profile.website_url || "",
      });
      const hasBusiness = !!(profile as Record<string, unknown>).is_business;
      setIsBusiness(hasBusiness);
      setBusinessForm({
        business_name: ((profile as Record<string, unknown>).business_name as string) || "",
        business_logo: ((profile as Record<string, unknown>).business_logo as string) || "",
        business_banner: ((profile as Record<string, unknown>).business_banner as string) || "",
        business_bio: ((profile as Record<string, unknown>).store_description as string) || "",
      });
      setStorefrontForm({
        store_name: ((profile as Record<string, unknown>).store_name as string) || "",
        store_description: ((profile as Record<string, unknown>).store_description as string) || "",
        store_logo: ((profile as Record<string, unknown>).store_logo as string) || "",
        store_banner: ((profile as Record<string, unknown>).store_banner as string) || "",
        banner_style: (((profile as Record<string, unknown>).banner_style as string) || "custom") as "custom" | "gradient" | "stock",
      });
    }
  }, [profile]);

  const createNewStore = async () => {
    if (!user?.id || !newStoreForm.title.trim() || !newStoreForm.slug.trim()) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const slug = newStoreForm.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    const { data, error } = await supabase
      .from("stores")
      .insert({
        title: newStoreForm.title.trim(),
        slug,
        owner_id: user.id,
        category_focus: newStoreForm.category_focus || null,
        store_location: newStoreForm.location || null,
        logo_url: newStoreForm.logo_url || null,
        banner_url: newStoreForm.banner_url || null,
      } as never)
      .select("id, slug, title, category_focus, store_location, created_at")
      .maybeSingle();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setUserStores((prev) => [...prev, data]);
      setNewStoreForm({ title: "", slug: "", location: "", category_focus: "", description: "", logo_url: "", banner_url: "" });
      setShowNewStoreForm(false);
      toast({ title: t.createNewStore, description: data.title });
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be under 5MB.", variant: "destructive" });
      return;
    }
    setPendingAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast({ title: "Not signed in", description: "Please log in to save your profile.", variant: "destructive" });
      return;
    }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    let avatarUrl = profile?.avatar || null;
    if (pendingAvatarFile) {
      setIsUploadingAvatar(true);
      const ext = pendingAvatarFile.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, pendingAvatarFile, { upsert: true });
      if (uploadError) {
        toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
        setIsUploadingAvatar(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      avatarUrl = publicUrlData.publicUrl + `?t=${Date.now()}`;
      setIsUploadingAvatar(false);
    }

    const updates: Record<string, unknown> = {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      bio: editForm.bio.trim(),
      facebook_handle: normalizeFacebookUrl(editForm.facebook_handle.trim()),
      instagram_handle: normalizeInstagramUrl(editForm.instagram_handle.trim()),
      whatsapp_number: normalizeWhatsAppUrl(editForm.whatsapp_number.trim()),
      website_url: normalizeWebsiteUrl(editForm.website_url.trim()),
    };
    if (avatarUrl) updates.avatar = avatarUrl;

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t.saveChanges, description: "Profile updated." });
      setIsEditing(false);
      setPendingAvatarFile(null);
      setAvatarPreview(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleSaveBusiness = async () => {
    if (!user?.id) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const updates: Record<string, unknown> = {
      is_business: true,
      business_name: businessForm.business_name.trim(),
      business_logo: businessForm.business_logo.trim(),
      business_banner: businessForm.business_banner.trim(),
      store_description: businessForm.business_bio.trim(),
    };
    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setIsBusiness(true);
      setShowBusinessPanel(false);
      toast({ title: t.businessAccountActive + "!", description: t.storeConfigured + "." });
    }
  };

  const handleDeactivateBusiness = async () => {
    if (!user?.id) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("profiles").update({ is_business: false } as never).eq("id", user.id);
    setIsBusiness(false);
    toast({ title: "Business deactivated" });
  };

  const handleSaveStorefront = async () => {
    if (!user?.id) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        store_name: storefrontForm.store_name.trim(),
        store_description: storefrontForm.store_description.trim(),
        store_logo: storefrontForm.store_logo.trim(),
        store_banner: storefrontForm.store_banner.trim(),
        banner_style: storefrontForm.banner_style,
      } as never)
      .eq("id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t.saveStorefront });
      setShowStorefrontPanel(false);
    }
  };

  const handleBusinessLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/business-logo.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setBusinessForm((p) => ({ ...p, business_logo: pub.publicUrl + `?t=${Date.now()}` }));
  };

  const handleRedeemVoucher = async () => {
    if (!user?.id || !voucherCode.trim()) return;
    setVoucherLoading(true);
    const result = await redeemVoucher(user.id, voucherCode.trim());
    setVoucherLoading(false);
    if (result.success) {
      setWalletBalance(result.newBalance ?? walletBalance);
      setVoucherCode("");
      toast({ title: "Voucher Redeemed!", description: `${result.credited} CVE added.` });
    } else {
      toast({ title: "Error", description: result.error || "Invalid voucher.", variant: "destructive" });
    }
  };

  const handleMarkSold = async (id: string) => {
    const listing = allListings.find((l) => l.id === id);
    if (!listing || !user?.id) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const table = listing.source === "marketplace" ? "marketplace_items" : "properties";
    await supabase.from(table).update({ status: "closed" } as never).eq("id", id);
    setAllListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "closed" } : l)));
  };

  const handleRelist = async (id: string) => {
    const listing = allListings.find((l) => l.id === id);
    if (!listing || !user?.id) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const table = listing.source === "marketplace" ? "marketplace_items" : "properties";
    await supabase.from(table).update({ status: "active" } as never).eq("id", id);
    setAllListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "active" } : l)));
  };

  const handleDelete = async (id: string) => {
    const listing = allListings.find((l) => l.id === id);
    if (!listing || !user?.id) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const table = listing.source === "marketplace" ? "marketplace_items" : "properties";
    await supabase.from(table).delete().eq("id", id);
    setAllListings((prev) => prev.filter((l) => l.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleEdit = (id: string) => {
    router.push(`/sell?edit=${id}`);
  };

  const handleBoost = async (id: string) => {
    if (!user?.id) return;
    const cost = FEATURE_PRICES.bump;
    if (walletBalance < cost) {
      toast({ title: "Insufficient balance", variant: "destructive" });
      return;
    }
    const result = await deductFromWallet(user.id, cost, "bump");
    if (result.success) {
      await bumpListing(id, user.id);
      setWalletBalance(result.newBalance ?? walletBalance - cost);
      setShowBoostModal(null);
      toast({ title: t.boostListing, description: t.boostListingDesc });
    }
  };

  const tabCounts = useMemo(
    () => ({
      active: allListings.filter((l) => l.status === "active").length,
      reviewing: allListings.filter((l) => l.status === "reviewing" || l.status === "pending").length,
      closed: allListings.filter((l) => l.status === "closed" || l.status === "sold").length,
    }),
    [allListings]
  );

  const filteredListings = useMemo(() => {
    if (activeTab === "active") return allListings.filter((l) => l.status === "active");
    if (activeTab === "reviewing") return allListings.filter((l) => l.status === "reviewing" || l.status === "pending");
    return allListings.filter((l) => l.status === "closed" || l.status === "sold");
  }, [allListings, activeTab]);

  const paywallActive = (profile as Record<string, unknown> | null)?.paywall_active === true;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="relative group shrink-0">
              <img alt={vendorName} className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-100" src={avatarPreview || vendorAvatar} />
              <input ref={avatarInputRef} accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" type="file" onChange={handleAvatarSelect} />
              {isEditing && (
                <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {isEditing && (
                    <button onClick={() => avatarInputRef.current?.click()} className="text-xs text-blue-600 hover:underline mb-1 block">
                      {t.changePhoto}
                    </button>
                  )}
                  {isEditing ? (
                    <input className="text-xl font-bold text-gray-900 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent w-full" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-gray-900">{vendorName}</h1>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-sm">
                        <Crown className="h-3 w-3" />
                        {t.planFree}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-0.5">{vendorEmail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 transition-colors" href={`/store/${user?.id || fallbackVendor.id}`}>
                    <Eye className="h-3.5 w-3.5" />
                    {t.viewMyStore}
                  </a>
                  <button onClick={() => setIsEditing(!isEditing)} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    {isEditing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    {isEditing ? t.cancel : t.editProfile}
                  </button>
                </div>
              </div>
              {isEditing ? (
                <textarea className="mt-2 text-sm text-gray-600 leading-relaxed w-full border border-gray-200 rounded-lg p-2 resize-none h-16" value={editForm.bio} onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))} />
              ) : (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{profile?.bio || fallbackVendor.bio}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {isEditing ? (
                  <div className="w-full space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                        <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">WhatsApp</label>
                        <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" value={editForm.whatsapp_number} onChange={(e) => setEditForm((p) => ({ ...p, whatsapp_number: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Facebook</label>
                      <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" value={editForm.facebook_handle} onChange={(e) => setEditForm((p) => ({ ...p, facebook_handle: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Instagram</label>
                      <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" value={editForm.instagram_handle} onChange={(e) => setEditForm((p) => ({ ...p, instagram_handle: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Website</label>
                      <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" value={editForm.website_url} onChange={(e) => setEditForm((p) => ({ ...p, website_url: e.target.value }))} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={handleSaveProfile} disabled={isUploadingAvatar} className="flex-1 py-2 px-4 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50">
                        {isUploadingAvatar ? "Uploading..." : t.saveChanges}
                      </button>
                      <button onClick={() => { setIsEditing(false); setPendingAvatarFile(null); setAvatarPreview(null); }} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {vendorPhone && (
                      <a href={`tel:${vendorPhone}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0044FF] text-white text-sm font-medium hover:bg-[#0033CC] transition-colors">
                        <Phone className="h-3.5 w-3.5" />Call
                      </a>
                    )}
                    {(profile?.whatsapp_number || fallbackVendor.whatsapp) && (
                      <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" />WhatsApp
                      </button>
                    )}
                    {(profile?.facebook_handle || fallbackVendor.facebook_url) && (
                      <a href={`fb://facewebmodal/f?href=${profile?.facebook_handle || fallbackVendor.facebook_url}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1877F2] text-white text-sm font-medium hover:bg-[#166FE5] transition-colors">
                        <Facebook className="h-3.5 w-3.5" />Facebook
                      </a>
                    )}
                  </>
                )}
              </div>
              {!isEditing && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-4">
                    {profile?.facebook_handle && (
                      <a href={profile.facebook_handle} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#2563EB] hover:underline">
                        <Facebook className="h-3.5 w-3.5" />Facebook
                      </a>
                    )}
                    {profile?.instagram_handle && (
                      <a href={`https://instagram.com/${profile.instagram_handle.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-pink-600 hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />Instagram
                      </a>
                    )}
                    {profile?.whatsapp_number && (
                      <a href={`https://wa.me/${profile.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-green-600 hover:underline">
                        <MessageCircle className="h-3.5 w-3.5" />WhatsApp
                      </a>
                    )}
                    {profile?.website_url && (
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm border border-blue-200 bg-blue-50/50 px-3 py-1.5 rounded-lg transition-all">
                        <Globe className="h-3.5 w-3.5" />Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {isAdmin && <AdminPanel />}

        {/* Email Verification Reminder */}
        {user && !user.email_confirmed_at && user.email && (
          <section className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-blue-900">Verifique o seu Email</h3>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Enviamos um link de confirmacao para <strong>{user.email}</strong>. Verifique a caixa de entrada e spam. A sua conta funciona normalmente enquanto isso.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {paywallActive && (
          <section className="mb-6">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900">{t.paywallTitle}</h3>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">{t.paywallDesc}</p>
                  <a href="/subscription" className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors">
                    {t.viewSubscriptionPlans}
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Business Account */}
        <section className="mb-6">
          {!isBusiness ? (
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{t.activateBusinessAccount}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{t.activateBusinessDesc}</p>
                  <button onClick={() => setShowBusinessPanel(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4ed8] transition-all shadow-md shadow-blue-600/20">
                    <Store className="h-4 w-4" />
                    {t.activateBusinessAccount}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{t.businessAccountActive}</h3>
                    <p className="text-xs text-gray-500">{businessForm.business_name || t.storeConfigured}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowBusinessPanel(true)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50">{t.editData}</button>
                  <button onClick={handleDeactivateBusiness} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50">{t.deactivate}</button>
                </div>
              </div>
            </div>
          )}
          {showBusinessPanel && (
            <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900">{t.configureBusinessStore}</h3>
              <p className="text-sm text-gray-500 mt-1">{t.personalizeIdentity}</p>
              <div className="space-y-4 mt-5">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">{t.businessName} *</label>
                  <input className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none" value={businessForm.business_name} onChange={(e) => setBusinessForm((p) => ({ ...p, business_name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">{t.storeLogo}</label>
                  <div className="flex items-center gap-3">
                    {businessForm.business_logo && <img src={businessForm.business_logo} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                    <input ref={businessLogoRef} type="file" accept="image/*" className="hidden" onChange={handleBusinessLogoUpload} />
                    <button onClick={() => businessLogoRef.current?.click()} className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50">{t.chooseFile}</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">{t.bioDescription}</label>
                  <textarea className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none h-20 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none" placeholder={t.describeYourBusiness} value={businessForm.business_bio} onChange={(e) => setBusinessForm((p) => ({ ...p, business_bio: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSaveBusiness} disabled={!businessForm.business_name.trim()} className="flex-1 py-3 px-4 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Store className="h-4 w-4" />
                  {isBusiness ? t.saveChanges : t.saveOrActivate}
                </button>
                <button onClick={() => setShowBusinessPanel(false)} className="px-6 py-3 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">{t.cancel}</button>
              </div>
            </div>
          )}
        </section>

        {/* Storefront */}
        {isBusiness && (
          <section className="mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{t.manageStorefront}</h3>
                    <p className="text-[11px] text-gray-500">{storefrontForm.store_name || "..."}</p>
                  </div>
                </div>
                <button onClick={() => setShowStorefrontPanel(!showStorefrontPanel)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
                  {showStorefrontPanel ? t.close : t.edit}
                </button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{t.manageStorefrontDesc}</p>
              {showStorefrontPanel && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">{t.storeName}</label>
                    <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none" value={storefrontForm.store_name} onChange={(e) => setStorefrontForm((p) => ({ ...p, store_name: e.target.value }))} placeholder={t.storeName + "..."} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">{t.storeDescription}</label>
                    <textarea className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none h-16 outline-none" value={storefrontForm.store_description} onChange={(e) => setStorefrontForm((p) => ({ ...p, store_description: e.target.value }))} placeholder={t.describeStoreFocus} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">{t.logoUrl}</label>
                      <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none" value={storefrontForm.store_logo} onChange={(e) => setStorefrontForm((p) => ({ ...p, store_logo: e.target.value }))} placeholder="https://..." />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">Estilo do Banner</label>
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-white"
                        value={storefrontForm.banner_style}
                        onChange={(e) => setStorefrontForm((p) => ({ ...p, banner_style: e.target.value as "custom" | "gradient" | "stock" }))}
                      >
                        <option value="custom">Imagem Personalizada</option>
                        <option value="gradient">Gradiente Moderno</option>
                        <option value="stock">Foto de Cabo Verde</option>
                      </select>
                    </div>
                  </div>

                  {storefrontForm.banner_style === "custom" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">{t.bannerUrl}</label>
                      <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none" value={storefrontForm.store_banner} onChange={(e) => setStorefrontForm((p) => ({ ...p, store_banner: e.target.value }))} placeholder="https://..." />
                    </div>
                  )}

                  {storefrontForm.banner_style === "gradient" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">Escolha um Gradiente</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "santiago_blue", label: "Santiago Blue", css: "bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500" },
                          { id: "fogo_volcanic", label: "Fogo Volcanic", css: "bg-gradient-to-r from-orange-500 via-rose-500 to-red-600" },
                          { id: "sal_turquoise", label: "Sal Turquoise", css: "bg-gradient-to-r from-cyan-400 via-teal-400 to-sky-500" },
                          { id: "mindelo_night", label: "Mindelo Night", css: "bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800" },
                        ].map((grad) => (
                          <button
                            key={grad.id}
                            type="button"
                            onClick={() => setStorefrontForm((p) => ({ ...p, store_banner: grad.id }))}
                            className={`relative rounded-lg overflow-hidden border-2 transition-all ${storefrontForm.store_banner === grad.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"}`}
                          >
                            <div className={`w-full h-14 ${grad.css}`} />
                            <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] py-0.5 text-center font-medium">{grad.label}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Gradiente CSS — 0 bytes de imagem, carregamento instantaneo.</p>
                    </div>
                  )}

                  {storefrontForm.banner_style === "stock" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">Escolha uma Foto</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { url: "https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=600", label: "Santiago" },
                          { url: "https://images.pexels.com/photos/12674924/pexels-photo-12674924.jpeg?auto=compress&cs=tinysrgb&w=600", label: "Fogo" },
                          { url: "https://images.pexels.com/photos/5618735/pexels-photo-5618735.jpeg?auto=compress&cs=tinysrgb&w=600", label: "Sao Vicente" },
                        ].map((photo) => (
                          <button
                            key={photo.label}
                            type="button"
                            onClick={() => setStorefrontForm((p) => ({ ...p, store_banner: photo.url }))}
                            className={`relative rounded-lg overflow-hidden border-2 transition-all ${storefrontForm.store_banner === photo.url ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"}`}
                          >
                            <img src={photo.url} alt={photo.label} className="w-full h-14 object-cover" />
                            <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] py-0.5 text-center font-medium">{photo.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={handleSaveStorefront} disabled={!storefrontForm.store_name.trim()} className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                    {t.saveStorefront}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* My Stores */}
        <section className="mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{t.myStores}</h3>
                  <p className="text-[11px] text-gray-500">{userStores.length} {t.activeStores}</p>
                </div>
              </div>
              <button onClick={() => setShowNewStoreForm(!showNewStoreForm)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-lg transition-colors shadow-sm">
                <Plus className="h-3.5 w-3.5" />
                {t.createNewStore}
              </button>
            </div>
            {userStores.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Store className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">{t.noStoresYet}</p>
                <p className="text-[10px] text-gray-400 mt-1">{t.createSeparateStorefronts}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {userStores.map((store) => (
                  <a key={store.id} href={`/store/${store.slug}`} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                    <Store className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{store.title}</p>
                      <p className="text-[10px] text-gray-400">{store.category_focus || "General"} {store.store_location ? `· ${store.store_location}` : ""}</p>
                    </div>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* New Store Form */}
        {showNewStoreForm && (
          <section className="mb-6">
            <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-md">
              <h3 className="text-base font-bold text-gray-900 mb-4">{t.createNewStore}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">{t.storeTitle} *</label>
                  <input placeholder="Ex: Casa & Decoracao CV" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none" value={newStoreForm.title} onChange={(e) => setNewStoreForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">{t.customUrl} *</label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">pro.cv/store/</span>
                    <input placeholder="minha-loja" className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none" value={newStoreForm.slug} onChange={(e) => setNewStoreForm((p) => ({ ...p, slug: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">{t.locationLabel}</label>
                    <input placeholder="Praia, Santiago" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none" value={newStoreForm.location} onChange={(e) => setNewStoreForm((p) => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">{t.categoryLabel}</label>
                    <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none bg-white appearance-none" value={newStoreForm.category_focus} onChange={(e) => setNewStoreForm((p) => ({ ...p, category_focus: e.target.value }))}>
                      <option value="">{t.selectCategory}</option>
                      <option value="Imobiliario">Imobiliario</option>
                      <option value="Automovel">Automovel</option>
                      <option value="Moveis">Moveis</option>
                      <option value="Electrodomesticos">Electrodomesticos</option>
                      <option value="Moda">Moda</option>
                      <option value="Servicos">Servicos</option>
                      <option value="Geral">Geral</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">{t.descriptionLabel}</label>
                  <textarea className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none resize-none h-16" maxLength={300} placeholder={t.describeStoreFocus} value={newStoreForm.description} onChange={(e) => setNewStoreForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">{t.logoUrl}</label>
                    <input placeholder="https://..." className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none" type="url" value={newStoreForm.logo_url} onChange={(e) => setNewStoreForm((p) => ({ ...p, logo_url: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">{t.bannerUrl}</label>
                    <input placeholder="https://..." className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none" type="url" value={newStoreForm.banner_url} onChange={(e) => setNewStoreForm((p) => ({ ...p, banner_url: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowNewStoreForm(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">{t.cancel}</button>
                  <button disabled={!newStoreForm.title.trim() || !newStoreForm.slug.trim()} onClick={createNewStore} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-lg transition-colors disabled:opacity-50">
                    <Plus className="h-4 w-4" />
                    {t.createStore}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Wallet */}
        <section className="mb-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-gray-900">{t.myWallet}</h3>
                  <span className="text-lg font-bold text-emerald-700">{walletBalance} CVE</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{t.walletDesc}</p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Gift className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input placeholder={t.voucherPlaceholder} className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none" maxLength={14} value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} />
                  </div>
                  <button disabled={!voucherCode.trim() || voucherLoading} onClick={handleRedeemVoucher} className="px-3 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
                    {voucherLoading ? "..." : t.redeem}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Boost Modal */}
        {showBoostModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBoostModal(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-bold text-gray-900 mb-2">{t.boostListing}</h3>
              <p className="text-sm text-gray-500 mb-4">{t.boostListingDesc}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs"><span className="text-gray-500">{t.cost}:</span><span className="font-bold">{FEATURE_PRICES.bump} CVE</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">{t.currentBalance}:</span><span className="font-bold">{walletBalance} CVE</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">{t.balanceAfter}:</span><span className="font-bold text-emerald-600">{walletBalance - FEATURE_PRICES.bump} CVE</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowBoostModal(null)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">{t.cancel}</button>
                <button onClick={() => handleBoost(showBoostModal)} disabled={walletBalance < FEATURE_PRICES.bump} className="flex-1 py-2.5 text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-lg disabled:opacity-50">{t.payWithBalance}</button>
              </div>
            </div>
          </div>
        )}

        {/* My Active Listings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{t.myActiveListings}</h2>
            <div className="flex items-center gap-3">
              <a href="/sell" className="text-sm text-[#2563EB] font-medium hover:underline">{t.postNew}</a>
            </div>
          </div>
          <div className="bg-gray-100 rounded-full p-1 flex mb-6">
            {STATUS_TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.key ? "bg-[#1e3a8a] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {tab.label} ({tabCounts[tab.key]})
              </button>
            ))}
          </div>
          {filteredListings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <Archive className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">{t.noListingsFound}</p>
              <a href="/sell" className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8]">
                <Plus className="h-4 w-4" />
                {t.postYourFirstAd}
              </a>
            </div>
          ) : (
            <div className="columns-2 gap-2 w-full block">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="break-inside-avoid inline-block w-full mb-2">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative group">
                    <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {listing.status === "active" && (
                        <>
                          <button onClick={() => setPromoteTarget({ id: listing.id, title: listing.title })} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-400/95 backdrop-blur border border-amber-300 rounded-md text-white hover:bg-amber-500 shadow-sm">
                            <Star className="h-3 w-3 fill-white" />{t.highlight}
                          </button>
                          <button onClick={() => setShowBoostModal(listing.id)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-md hover:from-orange-600 hover:to-amber-600 shadow-sm">
                            <Rocket className="h-3 w-3" />{t.boost}
                          </button>
                          <button onClick={() => handleEdit(listing.id)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 shadow-sm">
                            <Pencil className="h-3 w-3" />{t.edit}
                          </button>
                          <button onClick={() => handleMarkSold(listing.id)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 shadow-sm">
                            <Archive className="h-3 w-3" />{t.sold}
                          </button>
                        </>
                      )}
                      {listing.status === "closed" && (
                        <button onClick={() => handleRelist(listing.id)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 shadow-sm">
                          <RotateCcw className="h-3 w-3" />{t.relistAd}
                        </button>
                      )}
                      <button onClick={() => setShowDeleteConfirm(listing.id)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur border border-red-200 rounded-md text-red-600 hover:bg-red-50 shadow-sm">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <img alt={listing.title} className="w-full h-40 object-cover" src={listing.images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"} />
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-[#2563EB]">{listing.mode === "real_estate" ? t.property : t.itemService}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mt-1">{listing.title}</h3>
                      <p className="text-base font-bold text-gray-900 mt-2">{listing.price.toLocaleString()} <span className="text-xs font-medium text-gray-400">CVE</span></p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{listing.zone ? `${listing.zone}, ` : ""}{listing.island || "Cape Verde"}</span>
                      </div>
                      {listing.mode === "real_estate" && (listing.bedrooms || listing.bathrooms || listing.square_meters) && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          {listing.bedrooms && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{listing.bedrooms}</span>}
                          {listing.bathrooms && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{listing.bathrooms}</span>}
                          {listing.square_meters && <span className="flex items-center gap-1"><Ruler className="h-3 w-3" />{listing.square_meters}m&sup2;</span>}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-2">{t.deletePermanently}</h3>
            <p className="text-sm text-gray-500 mb-4">{t.deleteConfirmDesc}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">{t.cancel}</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg">{t.deleteLabel}</button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUpgradeModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 mb-4">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.unlockAdditionalStores}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">{t.unlockAdditionalStoresDesc}</p>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold text-amber-800">{t.premiumPlan}</span>
                </div>
                <ul className="text-xs text-amber-700 space-y-1.5 text-left">
                  <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-500" />{t.upTo5Stores}</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-500" />{t.customUrlsPerStore}</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-500" />{t.customBranding}</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-500" />{t.advancedStatsPerStore}</li>
                </ul>
              </div>
              <button onClick={() => setShowUpgradeModal(false)} className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20">{t.upgradeNow}</button>
              <button onClick={() => setShowUpgradeModal(false)} className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors">{t.maybeLater}</button>
            </div>
          </div>
        </div>
      )}

      {promoteTarget && (
        <PromoteListingDrawer listingId={promoteTarget.id} listingTitle={promoteTarget.title} onClose={() => setPromoteTarget(null)} />
      )}
    </div>
  );
}
