"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User, Settings, Shield, Bell, Eye, EyeOff, Camera,
  Save, Trash2, Mail, Phone, Globe, Palette,
  CreditCard, UserCheck, AlertTriangle, CheckCircle,
  Lock, Smartphone, Languages, Link2, Loader2
} from "lucide-react";
import UserLinksManager from "@/components/UserLinksManager";
import InternationalPhoneInput from "@/components/InternationalPhoneInput";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPageClient() {
  const { user, isAuthenticated, updateProfile, changePassword, logout } = useAuth();
  const { refreshProfile } = useSupabaseAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [phoneVerified, setPhoneVerified] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    whatsappNumber: "",
    avatar: user?.avatar || "",
    facebookHandle: "",
    twitterHandle: "",
    websiteUrl: "",
    storeName: "",
    storeDescription: "",
    storeLogoUrl: "",
    storeBannerUrl: "",
  });

  const [verificationStatus, setVerificationStatus] = useState<string>("unverified");
  const [verificationSubmitting, setVerificationSubmitting] = useState(false);
  const [verificationForm, setVerificationForm] = useState({ fullName: "", nifNumber: "" });
  const [verificationDoc, setVerificationDoc] = useState<File | null>(null);

  useEffect(() => {
    async function loadVerificationStatus() {
      if (!user?.id) return;
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;
      const { data } = await supabase
        .from("merchant_verifications")
        .select("status")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setVerificationStatus(data.status);
      }
    }
    loadVerificationStatus();
  }, [user?.id]);

  useEffect(() => {
    async function loadPhoneData() {
      if (!user?.id) return;
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;
      const { data } = await supabase
        .from("profiles")
        .select("whatsapp_number, phone_verified, phone")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        if (data.whatsapp_number) {
          setProfileData(prev => ({ ...prev, whatsappNumber: data.whatsapp_number, phone: data.whatsapp_number }));
        } else if (data.phone) {
          setProfileData(prev => ({ ...prev, phone: data.phone }));
        }
        setPhoneVerified(data.phone_verified ?? false);
      }
    }
    loadPhoneData();
  }, [user?.id]);

  const handleVerificationSubmit = async () => {
    if (!user?.id) return;
    if (!verificationForm.fullName.trim() || !verificationForm.nifNumber.trim()) {
      toast({ title: "Erro", description: "Nome completo e NIF/BI sao obrigatorios.", variant: "destructive" });
      return;
    }
    setVerificationSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setVerificationSubmitting(false); return; }

    let docUrl: string | null = null;
    if (verificationDoc) {
      const path = `${user.id}/${Date.now()}-${verificationDoc.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("verification-docs")
        .upload(path, verificationDoc, { upsert: true });
      if (!uploadErr) {
        docUrl = path;
      }
    }

    const { error } = await supabase.from("merchant_verifications").insert({
      full_legal_name: verificationForm.fullName.trim(),
      nif_number: verificationForm.nifNumber.trim(),
      id_document_url: docUrl,
    } as never);

    if (!error) {
      setVerificationStatus("pending_review");
      setVerificationForm({ fullName: "", nifNumber: "" });
      setVerificationDoc(null);
      toast({ title: "Pedido Enviado", description: "Os seus documentos estao em revisao. Sera notificado quando aprovado." });
    } else {
      toast({ title: "Erro", description: "Falha ao submeter pedido. Tente novamente.", variant: "destructive" });
    }
    setVerificationSubmitting(false);
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [agentData, setAgentData] = useState({
    licenseNumber: user?.agentProfile?.licenseNumber || "",
    company: user?.agentProfile?.company || "",
    bio: user?.agentProfile?.bio || "",
    specialties: user?.agentProfile?.specialties || [],
    languages: user?.agentProfile?.languages || [],
    serviceAreas: user?.agentProfile?.serviceAreas || [],
    contactMethods: user?.agentProfile?.contactMethods || {
      phone: true,
      email: true,
      whatsapp: false
    }
  });

  const [preferences, setPreferences] = useState({
    currency: user?.preferences?.currency || "EUR",
    language: user?.preferences?.language || "en",
    theme: user?.preferences?.theme || "light",
    measurementUnit: user?.preferences?.measurementUnit || "metric",
    emailNotifications: user?.preferences?.emailNotifications || true,
    smsNotifications: user?.preferences?.smsNotifications || false,
    priceAlerts: user?.preferences?.priceAlerts || true,
    newListingAlerts: user?.preferences?.newListingAlerts || true,
    priceChangeAlerts: user?.preferences?.priceChangeAlerts || true,
    viewingReminders: user?.preferences?.viewingReminders || true,
    marketInsights: user?.preferences?.marketInsights || false,
    agentMessages: user?.preferences?.agentMessages || true
  });

  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({ system: true, chat: true, recommendation: true, sponsored: true });
  const [savingNotifPrefs, setSavingNotifPrefs] = useState(false);

  // Load notification preferences from Supabase profile
  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("notification_preferences, facebook_handle, twitter_handle, website_url, store_name, store_description, store_logo, store_banner").eq("id", user.id).maybeSingle();
      if (data?.notification_preferences && typeof data.notification_preferences === "object") {
        setNotifPrefs(prev => ({ ...prev, ...(data.notification_preferences as Record<string, boolean>) }));
      }
      if (data) {
        setProfileData(prev => ({
          ...prev,
          facebookHandle: (data as Record<string, string | null>).facebook_handle || "",
          twitterHandle: (data as Record<string, string | null>).twitter_handle || "",
          websiteUrl: (data as Record<string, string | null>).website_url || "",
          storeName: (data as Record<string, string | null>).store_name || "",
          storeDescription: (data as Record<string, string | null>).store_description || "",
          storeLogoUrl: (data as Record<string, string | null>).store_logo || "",
          storeBannerUrl: (data as Record<string, string | null>).store_banner || "",
        }));
      }
    })();
  }, [user]);

  const handleSaveNotifPrefs = async () => {
    if (!user) return;
    setSavingNotifPrefs(true);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setSavingNotifPrefs(false); return; }
    await supabase.from("profiles").update({ notification_preferences: notifPrefs } as never).eq("id", user.id);
    setSavingNotifPrefs(false);
  };

  // Remove automatic redirect - let users authenticate on this page

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (supabase) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await supabase.from('profiles').upsert({
            id: authUser.id,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            whatsapp_number: profileData.whatsappNumber || profileData.phone || null,
            facebook_handle: profileData.facebookHandle || null,
            twitter_handle: profileData.twitterHandle || null,
            website_url: profileData.websiteUrl || null,
            store_name: profileData.storeName || null,
            store_description: profileData.storeDescription || null,
            store_logo: profileData.storeLogoUrl || null,
            store_banner: profileData.storeBannerUrl || null,
          }, { onConflict: 'id' });
        }
      }

      await updateProfile({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        avatar: profileData.avatar,
        preferences: {
          ...preferences,
          notifications: {
            email: preferences.emailNotifications || true,
            sms: preferences.smsNotifications || false,
            newListings: preferences.newListingAlerts || true,
            priceAlerts: preferences.priceAlerts || true,
            marketUpdates: preferences.marketInsights || false
          },
          searchAlerts: user?.preferences?.searchAlerts || []
        }
      });

      await refreshProfile();

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);

      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentProfileUpdate = async () => {
    if (!user.roles?.includes('agent')) return;

    setIsLoading(true);
    try {
      await updateProfile({ agentProfile: agentData });

      toast({
        title: "Agent Profile Updated",
        description: "Your agent profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Account Deletion",
        description: "Account deletion feature will be available soon.",
        variant: "destructive"
      });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Image must be under 5MB. It will be compressed automatically.", variant: "destructive" });
      return;
    }

    // Instant local preview via object URL
    const previewUrl = URL.createObjectURL(file);
    setProfileData(prev => ({ ...prev, avatar: previewUrl }));

    setIsUploadingAvatar(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase not configured");

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Not authenticated");

      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `${authUser.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      await supabase.from('profiles').update({ avatar: avatarUrl }).eq('id', authUser.id);
      setProfileData(prev => ({ ...prev, avatar: avatarUrl }));
      URL.revokeObjectURL(previewUrl);
      await refreshProfile();

      toast({ title: "Foto Atualizada", description: "A sua foto de perfil foi atualizada com sucesso." });
    } catch (err: unknown) {
      toast({ title: "Erro no Upload", description: "Foto guardada localmente. Pode nao persistir entre sessoes.", variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account preferences and profile information</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {user.verified ? 'Verified' : 'Unverified'}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {user.roles?.join(', ')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center">
              <Link2 className="h-4 w-4 mr-2" />
              Links
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            {user.roles?.includes('agent') && (
              <TabsTrigger value="agent" className="flex items-center">
                <UserCheck className="h-4 w-4 mr-2" />
                Agent
              </TabsTrigger>
            )}
            <TabsTrigger value="verification" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Verificacao
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                    <Avatar className="h-24 w-24 ring-2 ring-gray-100">
                      <AvatarImage src={profileData.avatar} alt={profileData.name} />
                      <AvatarFallback className="text-lg bg-blue-50 text-blue-700">
                        {profileData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all pointer-events-none">
                      {isUploadingAvatar ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-file-input"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-md transition-all disabled:opacity-50"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      {isUploadingAvatar ? 'A carregar...' : 'Alterar Foto'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, GIF ou PNG. Maximo 1MB.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                      />
                      {user.verified ? (
                        <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="absolute right-3 top-3 h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    {!user.verified && (
                      <p className="text-sm text-yellow-600 mt-1">
                        Email not verified. <Button variant="link" className="p-0 h-auto">Verify now</Button>
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      WhatsApp / Telefone
                      {phoneVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle className="w-3 h-3" />
                          Contacto Verificado
                        </span>
                      )}
                    </Label>
                    <InternationalPhoneInput
                      value={profileData.whatsappNumber || profileData.phone}
                      onChange={(val) => setProfileData(prev => ({ ...prev, whatsappNumber: val, phone: val }))}
                      placeholder="9XX XXXX"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Formato internacional com prefixo de pais</p>
                  </div>

                  <div>
                    <Label>Account Created</Label>
                    <Input
                      value={new Date(user.createdAt).toLocaleDateString()}
                      disabled
                    />
                  </div>
                </div>

                <Separator />

                {/* Social Handles */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Social & Contact Links</Label>
                  <p className="text-sm text-gray-500 mb-4">Link your social accounts for visibility on your public profile and listings.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facebookHandle">Facebook Page URL</Label>
                      <Input
                        id="facebookHandle"
                        value={profileData.facebookHandle}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          facebookHandle: e.target.value.replace(/^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/?/i, '').replace(/^@/, '').replace(/\/$/, '')
                        }))}
                        placeholder="yourpage"
                      />
                      <p className="text-xs text-gray-400 mt-1">Just the handle, no URL needed</p>
                    </div>
                    <div>
                      <Label htmlFor="twitterHandle">Twitter / X Handle</Label>
                      <Input
                        id="twitterHandle"
                        value={profileData.twitterHandle}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          twitterHandle: e.target.value.replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/?/i, '').replace(/^@/, '').replace(/\/$/, '')
                        }))}
                        placeholder="yourhandle"
                      />
                      <p className="text-xs text-gray-400 mt-1">Just the handle, no @ needed</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="websiteUrl">Website da Empresa (Optional)</Label>
                      <Input
                        id="websiteUrl"
                        value={profileData.websiteUrl}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          websiteUrl: e.target.value
                        }))}
                        placeholder="https://yourwebsite.com"
                      />
                      <p className="text-xs text-gray-400 mt-1">Your business or personal website URL</p>
                    </div>
                  </div>
                </div>

                {/* Store Branding Section */}
                <Separator />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Branding da Loja (Opcional)
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Personalize a aparencia da sua pagina de vendedor. Estes campos sao opcionais.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="storeName">Store Title</Label>
                      <Input
                        id="storeName"
                        value={profileData.storeName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, storeName: e.target.value }))}
                        placeholder="My Store Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storeLogoUrl">Store Logo URL</Label>
                      <Input
                        id="storeLogoUrl"
                        value={profileData.storeLogoUrl}
                        onChange={(e) => setProfileData(prev => ({ ...prev, storeLogoUrl: e.target.value }))}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="storeBannerUrl">Store Banner URL</Label>
                      <Input
                        id="storeBannerUrl"
                        value={profileData.storeBannerUrl}
                        onChange={(e) => setProfileData(prev => ({ ...prev, storeBannerUrl: e.target.value }))}
                        placeholder="https://example.com/banner.jpg"
                      />
                      <p className="text-xs text-gray-400">Recommended: 1200x400 pixels</p>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="storeDescription">Store Description</Label>
                      <Textarea
                        id="storeDescription"
                        value={profileData.storeDescription}
                        onChange={(e) => setProfileData(prev => ({ ...prev, storeDescription: e.target.value }))}
                        placeholder="Tell buyers about your store..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Settings */}
          <TabsContent value="links" className="space-y-6">
            <UserLinksManager userId={user.id} />
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handlePasswordChange} disabled={isLoading}>
                    <Shield className="h-4 w-4 mr-2" />
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email updates about your account' },
                  { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive text messages for urgent updates' },
                  { key: 'priceAlerts', label: 'Price Alerts', description: 'Get notified when property prices change' },
                  { key: 'newListingAlerts', label: 'New Listing Alerts', description: 'Instant alerts for new properties matching your criteria' },
                  { key: 'priceChangeAlerts', label: 'Price Change Alerts', description: 'Notifications when saved property prices change' },
                  { key: 'viewingReminders', label: 'Viewing Reminders', description: 'Reminders for scheduled property viewings' },
                  { key: 'marketInsights', label: 'Market Insights', description: 'Weekly market trends and insights' },
                  { key: 'agentMessages', label: 'Agent Messages', description: 'Messages from estate agents' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{item.label}</Label>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <Switch
                      checked={preferences[item.key as keyof typeof preferences] as boolean}
                      onCheckedChange={(checked) =>
                        setPreferences(prev => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pro.CV Push Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Preferencias de Notificacao Pro.CV
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Controle que tipos de notificacoes push recebe na plataforma.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "system", label: "Notificacoes do Sistema", description: "Alertas sobre a sua conta e atualizacoes da plataforma" },
                  { key: "chat", label: "Mensagens", description: "Novas mensagens de compradores e vendedores" },
                  { key: "recommendation", label: "Recomendacoes", description: "Sugestoes personalizadas com base nos seus interesses" },
                  { key: "sponsored", label: "Promocoes Patrocinadas", description: "Anuncios em destaque de vendedores premium" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{item.label}</Label>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifPrefs[item.key] !== false}
                      onCheckedChange={(checked) => {
                        setNotifPrefs(prev => ({ ...prev, [item.key]: checked }));
                      }}
                    />
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveNotifPrefs} disabled={savingNotifPrefs}>
                    <Save className="h-4 w-4 mr-2" />
                    {savingNotifPrefs ? "A guardar..." : "Guardar Preferencias"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  General Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={preferences.currency} onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value as 'EUR' | 'USD' | 'CVE' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="CVE">CVE (Escudo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value as 'en' | 'pt' | 'fr' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="pt">🇵🇹 Português</SelectItem>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value as 'light' | 'dark' | 'auto' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="measurementUnit">Measurement Unit</Label>
                    <Select value={preferences.measurementUnit} onValueChange={(value) => setPreferences(prev => ({ ...prev, measurementUnit: value as 'metric' | 'imperial' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric">Metric (m², km)</SelectItem>
                        <SelectItem value="imperial">Imperial (ft², miles)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent Profile Settings */}
          {user.roles?.includes('agent') && (
            <TabsContent value="agent" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="h-5 w-5 mr-2" />
                    Agent Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={agentData.licenseNumber}
                        onChange={(e) => setAgentData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                        placeholder="CV-RE-2024-001"
                      />
                    </div>

                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={agentData.company}
                        onChange={(e) => setAgentData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Real Estate Company"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={agentData.bio}
                      onChange={(e) => setAgentData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell potential clients about your experience and expertise..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Contact Methods</Label>
                    <div className="space-y-3 mt-2">
                      {Object.entries(agentData.contactMethods).map(([method, enabled]) => (
                        <div key={method} className="flex items-center justify-between">
                          <Label className="capitalize">{method}</Label>
                          <Switch
                            checked={Boolean(enabled)}
                            onCheckedChange={(checked) =>
                              setAgentData(prev => ({
                                ...prev,
                                contactMethods: { ...prev.contactMethods, [method]: checked }
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleAgentProfileUpdate} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      Update Agent Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verificar Minha Conta
                </CardTitle>
                <CardDescription>
                  A verificacao e gratuita e aumenta a confianca dos compradores no seu perfil.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {verificationStatus === "verified" && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Conta Verificada</p>
                      <p className="text-xs text-emerald-700">O seu perfil exibe o selo de Negocio Verificado.</p>
                    </div>
                  </div>
                )}

                {verificationStatus === "pending_review" && (
                  <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <Eye className="h-6 w-6 text-amber-600" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">Em Revisao</p>
                      <p className="text-xs text-amber-700">Os seus documentos estao a ser analisados pela equipa. Sera notificado em breve.</p>
                    </div>
                  </div>
                )}

                {verificationStatus === "unverified" && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-medium text-gray-900">Documentos Aceites:</p>
                      <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
                        <li>NIF (Numero de Identificacao Fiscal)</li>
                        <li>Bilhete de Identidade (BI) de Cabo Verde</li>
                        <li>Passaporte valido</li>
                        <li>Alvara comercial (para empresas)</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="v-fullname">Nome Legal Completo *</Label>
                        <input
                          id="v-fullname"
                          type="text"
                          value={verificationForm.fullName}
                          onChange={(e) => setVerificationForm(f => ({ ...f, fullName: e.target.value }))}
                          placeholder="Nome conforme o documento..."
                          className="mt-1 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none"
                        />
                      </div>

                      <div>
                        <Label htmlFor="v-nif">NIF / BI *</Label>
                        <input
                          id="v-nif"
                          type="text"
                          value={verificationForm.nifNumber}
                          onChange={(e) => setVerificationForm(f => ({ ...f, nifNumber: e.target.value }))}
                          placeholder="Numero do NIF ou BI..."
                          className="mt-1 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="verification-doc">Carregar Documento (NIF ou BI)</Label>
                      <div
                        className="mt-1.5 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 transition-colors cursor-pointer"
                        onClick={() => document.getElementById("verification-doc")?.click()}
                      >
                        <Shield className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        {verificationDoc ? (
                          <p className="text-xs text-teal-700 font-medium">{verificationDoc.name}</p>
                        ) : (
                          <>
                            <p className="text-xs text-gray-500">Arraste ou clique para carregar</p>
                            <p className="text-[11px] text-gray-400 mt-1">PDF, JPG ou PNG (max 5MB)</p>
                          </>
                        )}
                        <input
                          type="file"
                          id="verification-doc"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setVerificationDoc(e.target.files?.[0] || null)}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleVerificationSubmit}
                      disabled={verificationSubmitting || !verificationForm.fullName.trim() || !verificationForm.nifNumber.trim()}
                      className="w-full"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {verificationSubmitting ? "A submeter..." : "Verificar Minha Loja (Gratis)"}
                    </Button>

                    <p className="text-[11px] text-gray-400 text-center">
                      Este servico e 100% gratuito. A verificacao demora 1-3 dias uteis.
                    </p>
                  </div>
                )}

                {verificationStatus === "rejected" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <Shield className="h-6 w-6 text-red-600" />
                      <div>
                        <p className="text-sm font-bold text-red-900">Verificacao Rejeitada</p>
                        <p className="text-xs text-red-700">Os documentos nao foram aceites. Pode submeter novamente com documentos corretos.</p>
                      </div>
                    </div>
                    <Button onClick={() => setVerificationStatus("unverified")} variant="outline" className="w-full">
                      Tentar Novamente
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
