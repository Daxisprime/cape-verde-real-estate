"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X, Loader2, Zap, AlertTriangle, Crown, Facebook } from "lucide-react";
import { createSupabaseBrowserClient, CAPE_VERDE_ISLANDS } from "@/lib/supabase";
import { compressImage } from "@/lib/image-compression";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { checkListingLimit } from "@/lib/listing-limits";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";

const QUICK_CATEGORIES = [
  { value: "Electronics", label: "Electronics" },
  { value: "Vehicles", label: "Vehicles" },
  { value: "Home & Furniture", label: "Furniture" },
  { value: "Building Materials", label: "Building Materials" },
  { value: "Fashion", label: "Fashion" },
  { value: "Services", label: "Services" },
  { value: "Food & Restaurants", label: "Food" },
  { value: "Apartment", label: "Apartment (Rent/Sale)" },
  { value: "House", label: "House (Rent/Sale)" },
  { value: "Land", label: "Land" },
];

const PROPERTY_TYPES = ["Apartment", "House", "Villa", "Land", "Duplex", "Studio", "Penthouse", "Townhouse"];

interface QuickPostFormProps {
  onSuccess?: () => void;
}

export default function QuickPostForm({ onSuccess }: QuickPostFormProps) {
  const { user } = useSupabaseAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const { toast } = useToast();
  const [price, setPrice] = useState("");
  const [island, setIsland] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [facebookHandle, setFacebookHandle] = useState("");
  const [condition, setCondition] = useState<"new" | "used">("used");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ current: number; limit: number } | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isProperty = PROPERTY_TYPES.includes(category);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - images.length;
    const selected = files.slice(0, remaining);
    setImages((prev) => [...prev, ...selected]);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews((p) => [...p, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !island) return;

    if (!user) {
      setPendingSubmit(true);
      setShowAuthModal(true);
      return;
    }

    let paywallActive = false;
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("paywall_active")
        .eq("id", user.id)
        .maybeSingle();
      paywallActive = !!(prof as Record<string, unknown>)?.paywall_active;
    }

    const result = await checkListingLimit(user.id, category || "General", paywallActive);
    if (!result.allowed) {
      setLimitInfo({ current: result.current, limit: result.limit });
      setShowLimitModal(true);
      return;
    }

    await executeSubmit();
  };

  const executeSubmit = useCallback(async () => {
    setStatus("submitting");
    setErrorMessage("");

    try {
      if (!user?.id) throw new Error("Authentication required");

      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase not configured");

      const imageUrls: string[] = [];
      for (const file of images) {
        try {
          let uploadFile: File | Blob = file;
          try {
            const compressed = await compressImage(file);
            if (compressed && compressed.size > 0) uploadFile = compressed;
          } catch {
            // compression failed, use raw file
          }
          const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          const { data, error: uploadError } = await supabase.storage
            .from("ad-images")
            .upload(`ads/${filename}`, uploadFile, { contentType: file.type || 'image/jpeg' });
          if (uploadError) throw uploadError;
          if (data?.path) {
            const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(data.path);
            imageUrls.push(urlData.publicUrl);
          }
        } catch {
          imageUrls.push("https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=600&h=400&fit=crop");
        }
      }

      if (isProperty) {
        const insertPayload = {
            title,
            description: description || null,
            price: parseFloat(price),
            property_type: category,
            listing_type: "sale",
            island,
            zone: municipality || null,
            location: municipality || island,
            images: imageUrls,
            agent_id: user.id,
            status: "active",
        };
        console.log("[QuickPostForm] Inserting property:", insertPayload);
        const { data: insertedRow, error } = await supabase
          .from("properties")
          .insert(insertPayload as never)
          .select("id")
          .single();
        if (error) {
          console.error("[QuickPostForm] Property insert error:", error);
          throw error;
        }
        if (!insertedRow) {
          console.error("[QuickPostForm] Property insert returned no row -- likely RLS block");
          throw new Error("Insert failed: no row returned. Please sign out and sign back in.");
        }
        console.log("[QuickPostForm] Property inserted successfully, id:", insertedRow.id);
      } else {
        const insertPayload = {
            title,
            description: description || null,
            price_cve: parseFloat(price),
            category: category || "General",
            island,
            zone: municipality || null,
            municipality: municipality || null,
            images: imageUrls,
            user_id: user.id,
            status: "active",
            condition,
            contact_whatsapp: whatsapp || null,
        };
        console.log("[QuickPostForm] Inserting marketplace_item:", insertPayload);
        const { data: insertedRow, error } = await supabase
          .from("marketplace_items")
          .insert(insertPayload as never)
          .select("id")
          .single();
        if (error) {
          console.error("[QuickPostForm] Marketplace insert error:", error);
          throw error;
        }
        if (!insertedRow) {
          console.error("[QuickPostForm] Marketplace insert returned no row -- likely RLS block");
          throw new Error("Insert failed: no row returned. Please sign out and sign back in.");
        }
        console.log("[QuickPostForm] Marketplace item inserted successfully, id:", insertedRow.id);
      }

      if (facebookHandle || whatsapp) {
        const profileUpdate: Record<string, unknown> = { id: user.id };
        if (whatsapp) profileUpdate.whatsapp = whatsapp;
        if (facebookHandle) profileUpdate.facebook_handle = facebookHandle;
        await supabase.from("profiles").upsert(profileUpdate, { onConflict: "id" });
      }

      setStatus("success");
      router.refresh();
      onSuccess?.();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "";
      const isNetworkError = msg.includes("fetch") || msg.includes("network") || msg.includes("Failed to fetch") || !navigator.onLine;
      const displayMsg = isNetworkError
        ? "Erro de conexão. Certifique-se de que tem os dados móveis ativos e tente novamente."
        : msg || "Failed to post. Try again.";
      setErrorMessage(displayMsg);
      setStatus("error");
      toast({
        title: "Erro",
        description: displayMsg,
        variant: "destructive",
      });
    }
  }, [user, title, price, island, municipality, category, description, whatsapp, facebookHandle, condition, images, isProperty, onSuccess]);

  useEffect(() => {
    if (pendingSubmit && user) {
      setPendingSubmit(false);
      executeSubmit();
    }
  }, [pendingSubmit, user, executeSubmit]);

  const inputCls = "w-full px-3 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white";

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-100 bg-green-50 p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
          <Zap className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-lg font-semibold text-green-800">Posted!</p>
        <p className="text-sm text-green-600 mt-1">Your listing is now live on Pro.CV</p>
        <button
          onClick={() => { setStatus("idle"); setTitle(""); setPrice(""); setCategory(""); setIsland(""); setMunicipality(""); setDescription(""); setWhatsapp(""); setFacebookHandle(""); setCondition("used"); setImages([]); setPreviews([]); }}
          className="mt-4 text-sm text-blue-600 font-medium hover:underline"
        >
          Post another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Photos */}
      <div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {previews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
          {images.length < 4 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors flex-shrink-0"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-[10px] mt-0.5">Photo</span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          onChange={handleImageSelect}
        />
      </div>

      {/* Title (required) */}
      <input
        type="text"
        placeholder="What are you selling? *"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={inputCls}
        autoFocus
      />

      {/* Price + Category row */}
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          placeholder="Price (CVE) *"
          required
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputCls}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`${inputCls} appearance-none`}
        >
          <option value="">Category (optional)</option>
          {QUICK_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Island (required) + Municipality */}
      <div className="grid grid-cols-2 gap-3">
        <select
          required
          value={island}
          onChange={(e) => setIsland(e.target.value)}
          className={`${inputCls} appearance-none`}
        >
          <option value="">Island *</option>
          {CAPE_VERDE_ISLANDS.map((isl) => (
            <option key={isl} value={isl}>{isl}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Zona / Bairro"
          value={municipality}
          onChange={(e) => setMunicipality(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Description (optional) */}
      <textarea
        placeholder="Description (optional)"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={`${inputCls} resize-none`}
      />

      {/* Condition toggle - shown when a non-property category is selected */}
      {!isProperty && category && (
        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setCondition("new")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              condition === "new" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            New
          </button>
          <button
            type="button"
            onClick={() => setCondition("used")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              condition === "used" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Used
          </button>
        </div>
      )}

      {/* Additional fields shown after at least one photo is added */}
      {previews.length > 0 && (
        <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact & Social (optional)</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="tel"
              placeholder="WhatsApp number"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className={inputCls}
            />
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1877F2]" />
              <input
                type="text"
                placeholder="Facebook page"
                value={facebookHandle}
                onChange={(e) => setFacebookHandle(e.target.value.replace(/^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/?/i, '').replace(/^@/, '').replace(/\/$/, ''))}
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp and Facebook shown even without photos if no previews */}
      {previews.length === 0 && (
        <div className="grid grid-cols-2 gap-3">
          <input
            type="tel"
            placeholder="WhatsApp (optional)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className={inputCls}
          />
          <div className="relative">
            <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1877F2]" />
            <input
              type="text"
              placeholder="Facebook (optional)"
              value={facebookHandle}
              onChange={(e) => setFacebookHandle(e.target.value.replace(/^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/?/i, '').replace(/^@/, '').replace(/\/$/, ''))}
              className={`${inputCls} pl-9`}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting" || !title || !price || !island}
        className="w-full py-3.5 rounded-xl bg-green-600 text-white text-base font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === "submitting" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Zap className="h-5 w-5" />
        )}
        {status === "submitting" ? "Posting..." : "Post Now"}
      </button>

      {status === "error" && (
        <p className="text-sm text-red-600 text-center">{errorMessage}</p>
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => { setShowAuthModal(false); setPendingSubmit(false); }}
          defaultTab="register"
          onSuccess={() => setShowAuthModal(false)}
        />
      )}

      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowLimitModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 mb-4">
                <AlertTriangle className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Limite de Anuncios Atingido!
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                O seu plano atual atingiu o limite gratuito para esta categoria.
                Atualize para o plano Premium para publicar mais anuncios.
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700 font-medium">Anuncios ativos</span>
                  <span className="font-bold text-amber-900">{limitInfo?.current ?? 0} / {limitInfo?.limit ?? 0}</span>
                </div>
                <div className="mt-2 h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Atualizar para Premium
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
