"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { ImagePlus, X, Loader2, Zap } from "lucide-react";
import { createSupabaseBrowserClient, CAPE_VERDE_ISLANDS } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [island, setIsland] = useState("");
  const [category, setCategory] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
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
    if (!title || !price || !island || !category) return;

    if (!user) {
      setPendingSubmit(true);
      setShowAuthModal(true);
      return;
    }

    await executeSubmit();
  };

  const executeSubmit = useCallback(async () => {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase not configured");
      if (!user?.id) throw new Error("Authentication required");

      const imageUrls: string[] = [];
      for (const file of images) {
        try {
          const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          const { data, error: uploadError } = await supabase.storage
            .from("ad-images")
            .upload(`ads/${filename}`, file, { contentType: file.type });
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
        const { error } = await supabase
          .from("properties")
          .insert({
            title,
            price: parseFloat(price),
            property_type: category,
            listing_type: "sale",
            island,
            location: island,
            images: imageUrls,
            agent_id: user.id,
            status: "active",
          } as never);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("marketplace_items")
          .insert({
            title,
            price_cve: parseFloat(price),
            category,
            island,
            images: imageUrls,
            user_id: user.id,
            status: "active",
            condition: "used",
            contact_whatsapp: whatsapp || null,
          } as never);
        if (error) throw error;
      }

      if (whatsapp) {
        await supabase.from("profiles").upsert({
          id: user.id,
          whatsapp: whatsapp,
        }, { onConflict: "id" });
      }

      setStatus("success");
      onSuccess?.();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Failed to post. Try again.";
      setErrorMessage(msg);
      setStatus("error");
    }
  }, [user, title, price, island, category, whatsapp, images, isProperty, onSuccess]);

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
          onClick={() => { setStatus("idle"); setTitle(""); setPrice(""); setCategory(""); setImages([]); setPreviews([]); }}
          className="mt-4 text-sm text-blue-600 font-medium hover:underline"
        >
          Post another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Photos - big touch target */}
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

      {/* Title */}
      <input
        type="text"
        placeholder="What are you selling?"
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
          placeholder="Price (CVE)"
          required
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputCls}
        />
        <select
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`${inputCls} appearance-none`}
        >
          <option value="">Category</option>
          {QUICK_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Island + WhatsApp row */}
      <div className="grid grid-cols-2 gap-3">
        <select
          required
          value={island}
          onChange={(e) => setIsland(e.target.value)}
          className={`${inputCls} appearance-none`}
        >
          <option value="">Island</option>
          {CAPE_VERDE_ISLANDS.map((isl) => (
            <option key={isl} value={isl}>{isl}</option>
          ))}
        </select>
        <input
          type="tel"
          placeholder="WhatsApp (optional)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting" || !title || !price || !island || !category}
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
    </form>
  );
}
