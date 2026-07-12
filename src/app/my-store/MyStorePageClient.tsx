"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import PromoteListingDrawer from "@/components/PromoteListingDrawer";
import AdminPanel from "@/components/AdminPanel";
import { useToast } from "@/hooks/use-toast";
import { mockProfiles, MockVendorListing } from "@/lib/mockProfiles";
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
  Camera,
  Loader2,
  Globe,
  Eye,
  Sparkles,
  Lock,
  Store,
  Building2,
  Upload,
  Rocket,
  Wallet,
  Gift,
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

export default function MyStorePageClient() {
  const { isAuthenticated, profile, user, refreshProfile } = useSupabaseAuth();
  const { listings: liveListings, loading: listingsLoading } = useMyListings();
  const router = useRouter();
  const { toast } = useToast();
  const fallbackVendor = mockProfiles[0];

  const vendorName = profile?.name || fallbackVendor.full_name;
  const vendorAvatar = profile?.avatar || fallbackVendor.avatar_url;
  const vendorPhone = profile?.phone || fallbackVendor.phone;
  const vendorEmail = user?.email || '';
  const isAdmin = profile?.role === 'admin';

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState({
    name: vendorName,
    bio: fallbackVendor.bio,
    phone: vendorPhone,
    whatsapp: fallbackVendor.whatsapp,
    facebook_url: fallbackVendor.facebook_url,
    instagram_url: fallbackVendor.instagram_url,
    facebook_shop_url: fallbackVendor.facebook_shop_url || "",
    website_url: "",
  });

  // Sync editForm when profile loads or refreshes
  useEffect(() => {
    if (profile) {
      const raw = profile as Record<string, unknown>;
      setEditForm({
        name: (profile.name || '') as string,
        bio: (raw.bio as string) || '',
        phone: (profile.phone || '') as string,
        whatsapp: ((raw.whatsapp_number || raw.whatsapp) as string) || '',
        facebook_url: ((raw.facebook_handle || raw.facebook_url) as string) || '',
        instagram_url: ((raw.instagram_handle || raw.instagram_url) as string) || '',
        facebook_shop_url: (raw.facebook_shop_url as string) || '',
        website_url: ((raw.website_url) as string) || '',
      });
      setIsBusiness(!!(raw.is_business));
      setBusinessForm({
        business_name: (raw.business_name as string) || '',
        business_logo: (raw.business_logo as string) || '',
        business_banner: (raw.business_banner as string) || '',
        business_bio: (raw.bio as string) || '',
      });
    }
  }, [profile]);

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

  useEffect(() => {
    if (user?.id) {
      getWalletBalance(user.id).then(setWalletBalance);
    }
  }, [user?.id]);

  const [activeTab, setActiveTab] = useState<ListingStatus>("active");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<{ id: string; title: string } | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [voucherPin, setVoucherPin] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [bumpConfirmTarget, setBumpConfirmTarget] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBusinessPanel, setShowBusinessPanel] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    business_name: "",
    business_logo: "",
    business_banner: "",
    business_bio: "",
  });
  const [savingBusiness, setSavingBusiness] = useState(false);
  const businessLogoRef = useRef<HTMLInputElement>(null);

  const filteredListings = listings.filter((l) => l.status === activeTab);

  const tabCounts = {
    active: listings.filter((l) => l.status === "active").length,
    reviewing: listings.filter((l) => l.status === "reviewing").length,
    closed: listings.filter((l) => l.status === "closed").length,
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be under 5MB. It will be compressed automatically.', variant: 'destructive' });
      return;
    }
    setPendingAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleSaveProfile = async () => {
    setIsUploadingAvatar(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase || !user) {
        toast({ title: 'Not signed in', description: 'Please log in to save your profile.', variant: 'destructive' });
        setIsEditing(false);
        return;
      }

      const normalizedFacebook = normalizeFacebookUrl(editForm.facebook_url);
      const normalizedInstagram = normalizeInstagramUrl(editForm.instagram_url);
      const normalizedWhatsapp = normalizeWhatsAppUrl(editForm.whatsapp);
      const normalizedWebsite = normalizeWebsiteUrl(editForm.website_url);

      const updates: Record<string, string> = {
        name: editForm.name || '',
        bio: editForm.bio || '',
        phone: editForm.phone || '',
        facebook_handle: normalizedFacebook,
        instagram_handle: normalizedInstagram,
        whatsapp_number: normalizedWhatsapp,
        website_url: normalizedWebsite,
        updated_at: new Date().toISOString(),
      };

      // Upload avatar
      const file = pendingAvatarFile;
      if (file) {
        try {
          const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const filePath = `${user.id}/avatar.${ext}`;
          const contentType = file.type || 'image/jpeg';

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true, contentType });

          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            if (urlData?.publicUrl) {
              updates.avatar = `${urlData.publicUrl}?t=${Date.now()}`;
            }
          } else {
            toast({ title: 'Avatar upload failed', description: `${uploadError.message} (${uploadError.name || 'unknown'})`, variant: 'destructive' });
          }
        } catch (uploadErr) {
          toast({ title: 'Upload error', description: uploadErr instanceof Error ? uploadErr.message : String(uploadErr), variant: 'destructive' });
        }
      }

      const { data: upsertData, error: updateError } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, email: user.email ?? '', ...updates },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (updateError) {
        toast({ title: 'Save failed', description: updateError.message, variant: 'destructive' });
        return;
      }

      if (!upsertData) {
        toast({ title: 'Save failed', description: 'No data returned from server.', variant: 'destructive' });
        return;
      }

      // Immediately update local state
      setEditForm(prev => ({
        ...prev,
        facebook_url: normalizedFacebook,
        instagram_url: normalizedInstagram,
        whatsapp: normalizedWhatsapp,
        website_url: normalizedWebsite,
      }));

      await refreshProfile();
      router.refresh();

      toast({ title: 'Profile saved', description: 'Your changes have been saved successfully.' });

      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
      setIsEditing(false);
      setPendingAvatarFile(null);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleActivateBusiness = async () => {
    setSavingBusiness(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase || !user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          is_business: true,
          business_name: businessForm.business_name || null,
          business_logo: businessForm.business_logo || null,
          business_banner: businessForm.business_banner || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }

      setIsBusiness(true);
      setShowBusinessPanel(false);
      await refreshProfile();
      toast({ title: "Conta de Empresa Ativada!", description: "A sua loja profissional esta agora ativa." });
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro desconhecido", variant: "destructive" });
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleDeactivateBusiness = async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase || !user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ is_business: false, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (!error) {
      setIsBusiness(false);
      await refreshProfile();
      toast({ title: "Modo pessoal ativo", description: "Voltou ao modo vendedor casual." });
    }
  };

  const handleBusinessLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${user.id}/business-logo.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true, contentType: file.type || "image/jpeg" });

    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      if (data?.publicUrl) {
        setBusinessForm((prev) => ({ ...prev, business_logo: `${data.publicUrl}?t=${Date.now()}` }));
      }
    }
  };

  const handleBumpListing = async (id: string) => {
    if (walletBalance >= FEATURE_PRICES.AD_BUMP) {
      setBumpConfirmTarget(id);
      return;
    }
    const listing = listings.find((l) => l.id === id);
    const table = listing?.source === "marketplace" ? "marketplace_items" : "properties";
    const success = await bumpListing(id, table);
    if (success) {
      toast({ title: "Anuncio Impulsionado!", description: "O seu anuncio subiu para o topo dos resultados." });
    } else {
      toast({ title: "Erro", description: "Nao foi possivel impulsionar o anuncio.", variant: "destructive" });
    }
  };

  const handleBumpWithWallet = async () => {
    if (!bumpConfirmTarget || !user?.id) return;
    const { success: deducted, newBalance } = await deductFromWallet(user.id, FEATURE_PRICES.AD_BUMP);
    if (!deducted) {
      toast({ title: "Saldo insuficiente", description: "Recarregue a sua carteira com um voucher.", variant: "destructive" });
      setBumpConfirmTarget(null);
      return;
    }
    setWalletBalance(newBalance);
    const listing = listings.find((l) => l.id === bumpConfirmTarget);
    const table = listing?.source === "marketplace" ? "marketplace_items" : "properties";
    await bumpListing(bumpConfirmTarget, table);
    toast({ title: "Anuncio Impulsionado!", description: `${FEATURE_PRICES.AD_BUMP} CVE debitados. Novo saldo: ${newBalance} CVE` });
    setBumpConfirmTarget(null);
  };

  const handleRedeemVoucher = async () => {
    if (!voucherPin || !user?.id) return;
    setVoucherLoading(true);
    const supabase = createSupabaseBrowserClient();
    const session = supabase ? await supabase.auth.getSession() : null;
    const token = session?.data?.session?.access_token || "";

    const result = await redeemVoucher(voucherPin, token);
    setVoucherLoading(false);

    if (result.success) {
      setWalletBalance(result.newBalance ?? walletBalance);
      setVoucherPin("");
      toast({ title: "Voucher Resgatado!", description: `${result.credited} CVE adicionados a sua carteira.` });
    } else {
      toast({ title: "Erro", description: result.error || "Voucher invalido.", variant: "destructive" });
    }
  };

  const handleMarkSold = async (id: string) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "closed" as ListingStatus } : l)));
    const supabase = createSupabaseBrowserClient();
    if (supabase && user) {
      await supabase.from('properties').update({ status: 'sold' } as never).eq('id', id).eq('agent_id', user.id);
    }
  };

  const handleRelist = async (id: string) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "active" as ListingStatus } : l)));
    const supabase = createSupabaseBrowserClient();
    if (supabase && user) {
      await supabase.from('properties').update({ status: 'active' } as never).eq('id', id).eq('agent_id', user.id);
    }
  };

  const handleDelete = async (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setDeleteTarget(null);
    const supabase = createSupabaseBrowserClient();
    if (supabase && user) {
      await supabase.from('properties').delete().eq('id', id).eq('agent_id', user.id);
    }
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
            <div className="relative group shrink-0">
              <img
                src={avatarPreview || vendorAvatar}
                alt={vendorName}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-100"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center transition-all cursor-pointer hover:bg-black/50"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </button>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarSelect}
                className="hidden"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="mt-2 w-full text-center text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Alterar Foto
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isEditing ? (
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Your name"
                        className="text-xl font-bold text-gray-900 px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    ) : (
                      <h1 className="text-xl font-bold text-gray-900">{vendorName}</h1>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-sm">
                      <Crown className="h-3 w-3" />
                      Plano Patrão (Grátis)
                    </span>
                  </div>
                  {vendorEmail && (
                    <p className="text-sm text-gray-500 mt-0.5">{vendorEmail}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/store/${user?.id || 'unknown'}`}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver Minha Loja
                  </Link>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {isEditing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Facebook (Nome do Grupo / Usuario)</label>
                      <input
                        value={editForm.facebook_url}
                        onChange={(e) => setEditForm((p) => ({ ...p, facebook_url: e.target.value }))}
                        placeholder="meugrupo.cv"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">WhatsApp (N de Telefone)</label>
                      <input
                        value={editForm.whatsapp}
                        onChange={(e) => setEditForm((p) => ({ ...p, whatsapp: e.target.value }))}
                        placeholder="9XX XXXX"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Instagram (Usuario)</label>
                      <input
                        value={editForm.instagram_url}
                        onChange={(e) => setEditForm((p) => ({ ...p, instagram_url: e.target.value }))}
                        placeholder="@minha_loja"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Website Oficial (Opcional)</label>
                      <input
                        value={editForm.website_url}
                        onChange={(e) => setEditForm((p) => ({ ...p, website_url: e.target.value }))}
                        placeholder="www.empresa.cv"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {editForm.facebook_url && (
                      <a href={editForm.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#2563EB] hover:underline">
                        <Facebook className="h-3.5 w-3.5" />
                        Facebook
                      </a>
                    )}
                    {editForm.instagram_url && (
                      <a href={editForm.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-pink-600 hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Instagram
                      </a>
                    )}
                    {editForm.whatsapp && (
                      <a href={editForm.whatsapp.startsWith('http') ? editForm.whatsapp : `https://wa.me/${editForm.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-green-600 hover:underline">
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    )}
                    {editForm.website_url && (
                      <a href={editForm.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm border border-blue-200 bg-blue-50/50 px-3 py-1.5 rounded-lg transition-all">
                        <Globe className="h-3.5 w-3.5" />
                        Website
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

        {/* Admin Panel - only visible for admin role */}
        {isAdmin && <AdminPanel />}

        {/* Business Account Activation Section */}
        <section className="mb-6">
          {!isBusiness ? (
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Ativar Conta de Empresa</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    Transforme o seu perfil numa loja profissional com nome de marca, logotipo e banner personalizados. Totalmente gratuito!
                  </p>
                  <button
                    onClick={() => setShowBusinessPanel(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md shadow-blue-600/20"
                  >
                    <Store className="h-4 w-4" />
                    Ativar Conta de Empresa
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Conta de Empresa Ativa</h3>
                  <p className="text-xs text-gray-500">{businessForm.business_name || "Loja configurada"}</p>
                </div>
                {businessForm.business_logo && (
                  <img src={businessForm.business_logo} alt="Logo" className="ml-auto w-10 h-10 rounded-lg object-cover border border-green-200" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBusinessPanel(true)}
                  className="text-xs px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  Editar Dados
                </button>
                <button
                  onClick={handleDeactivateBusiness}
                  className="text-xs px-3 py-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  Desativar
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Business Panel Modal */}
        {showBusinessPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowBusinessPanel(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              <div className="mb-5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 mb-3">
                  <Building2 className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Configurar Loja Profissional</h3>
                <p className="text-sm text-gray-500 mt-1">Personalize a identidade da sua empresa</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Nome da Empresa *</label>
                  <input
                    type="text"
                    placeholder="Ex: Imobiliaria Sol de Cabo Verde"
                    value={businessForm.business_name}
                    onChange={(e) => setBusinessForm((p) => ({ ...p, business_name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Logotipo da Loja</label>
                  <div className="flex items-center gap-3">
                    {businessForm.business_logo ? (
                      <img src={businessForm.business_logo} alt="Logo" className="w-14 h-14 rounded-xl object-cover border-2 border-blue-100" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                        <Upload className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => businessLogoRef.current?.click()}
                      className="text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-600"
                    >
                      Escolher Ficheiro
                    </button>
                    <input ref={businessLogoRef} type="file" accept="image/*" onChange={handleBusinessLogoUpload} className="hidden" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Bio / Descricao</label>
                  <textarea
                    placeholder="Descreva a sua empresa em poucas palavras..."
                    value={businessForm.business_bio}
                    onChange={(e) => setBusinessForm((p) => ({ ...p, business_bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleActivateBusiness}
                  disabled={savingBusiness || !businessForm.business_name.trim()}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingBusiness ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {isBusiness ? "Guardar Alteracoes" : "Ativar Conta de Empresa"}
                </button>
                <button
                  onClick={() => setShowBusinessPanel(false)}
                  className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Minha Carteira (Wallet) Section */}
        <section className="mb-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-gray-900">Minha Carteira</h3>
                  <span className="text-lg font-bold text-emerald-700">{walletBalance.toFixed(0)} CVE</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Use o saldo para impulsionar anuncios e ativar funcionalidades premium.
                </p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Gift className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Codigo do voucher (ex: XXXX-XXXX-XXXX)"
                      value={voucherPin}
                      onChange={(e) => setVoucherPin(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
                      maxLength={14}
                    />
                  </div>
                  <button
                    onClick={handleRedeemVoucher}
                    disabled={!voucherPin || voucherLoading}
                    className="px-3 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {voucherLoading ? "..." : "Resgatar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bump Confirm Modal (Wallet Checkout) */}
        {bumpConfirmTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in-95">
              <h3 className="text-base font-bold text-gray-900 mb-2">Impulsionar Anuncio</h3>
              <p className="text-sm text-gray-600 mb-4">
                O seu anuncio sera colocado no topo dos resultados.
              </p>
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Custo:</span>
                  <span className="font-bold text-gray-900">{FEATURE_PRICES.AD_BUMP} CVE</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Saldo atual:</span>
                  <span className="font-bold text-emerald-700">{walletBalance.toFixed(0)} CVE</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t border-gray-200">
                  <span className="text-gray-600">Saldo apos:</span>
                  <span className="font-bold text-gray-900">{(walletBalance - FEATURE_PRICES.AD_BUMP).toFixed(0)} CVE</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setBumpConfirmTarget(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBumpWithWallet}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Pagar com Saldo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Listings Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">My Active Listings</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-700 hover:from-amber-100 hover:to-orange-100 transition-colors"
              >
                <Store className="h-3.5 w-3.5" />
                + Criar Nova Loja
              </button>
              <a href="/sell" className="text-sm text-[#2563EB] font-medium hover:underline">+ Post New</a>
            </div>
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
                        onClick={() => handleBumpListing(listing.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-md hover:from-orange-600 hover:to-amber-600 shadow-sm"
                      >
                        <Rocket className="h-3 w-3" />
                        Impulsionar
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

      {/* Premium Multi-Store Upgrade Modal */}
      {showUpgradeModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowUpgradeModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 mb-4">
                  <Sparkles className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Desbloqueie Lojas Adicionais!
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  A sua conta atual permite 1 loja. Atualize para o plano <span className="font-semibold text-amber-700">Premium Multi-Store</span> para expandir a sua marca em Cabo Verde com multiplas lojas tematicas.
                </p>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-800">Plano Premium</span>
                  </div>
                  <ul className="text-xs text-amber-700 space-y-1.5 text-left">
                    <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-500" />Ate 5 lojas independentes</li>
                    <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-500" />URLs personalizados para cada loja</li>
                    <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-500" />Cores e branding customizaveis</li>
                    <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-500" />Estatisticas avancadas por loja</li>
                  </ul>
                </div>

                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
                >
                  Atualizar Agora
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Talvez mais tarde
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
