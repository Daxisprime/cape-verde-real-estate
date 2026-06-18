"use client";

import React, { useState, useRef } from "react";
import { Home, Package, ImagePlus, X, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { CAPE_VERDE_ISLANDS } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

type AdMode = "real_estate" | "item_service";

const MARKET_CATEGORIES = [
  { id: "vehicles", label: "Vehicles & Automotive" },
  { id: "electronics", label: "Electronics & Computers" },
  { id: "home", label: "Home, Furniture & Appliances" },
  { id: "building", label: "Building Materials & Tools" },
  { id: "restaurants", label: "Restaurants & Menus (Takeaway)" },
  { id: "fashion", label: "Fashion, Clothing & Retail" },
  { id: "babies", label: "Babies & Kids Items" },
  { id: "pets", label: "Pets & Animal Supplies" },
  { id: "maintenance", label: "Maintenance & Repair Services" },
  { id: "professional", label: "Professional & Event Services" },
];

interface FormData {
  title: string;
  price: string;
  description: string;
  island: string;
  zone: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  squareMeters: string;
  marketCategory: string;
}

export interface CreatedAd {
  id: string;
  mode: AdMode;
  title: string;
  price: number;
  island: string;
  zone: string | null;
  images: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  square_meters: number | null;
}

export default function PostAdForm({ vendorId, onAdCreated }: { vendorId?: string; onAdCreated?: (ad: CreatedAd) => void }) {
  const { user } = useSupabaseAuth();
  const [mode, setMode] = useState<AdMode>("real_estate");
  const [form, setForm] = useState<FormData>({
    title: "",
    price: "",
    description: "",
    island: "",
    zone: "",
    address: "",
    bedrooms: "",
    bathrooms: "",
    squareMeters: "",
    marketCategory: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [menuImages, setMenuImages] = useState<File[]>([]);
  const [menuPreviews, setMenuPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const menuFileRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleMenuImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 2 - menuImages.length;
    const selected = files.slice(0, remaining);
    setMenuImages((prev) => [...prev, ...selected]);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setMenuPreviews((p) => [...p, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeMenuImage = (index: number) => {
    setMenuImages((prev) => prev.filter((_, i) => i !== index));
    setMenuPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.island) return;

    setStatus("submitting");
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Not configured");

      const imageUrls: string[] = [];
      for (const file of images) {
        const filename = `${Date.now()}-${file.name}`;
        const { data } = await supabase.storage
          .from("ad-images")
          .upload(`ads/${filename}`, file, { contentType: file.type });
        if (data?.path) {
          const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(data.path);
          imageUrls.push(urlData.publicUrl);
        }
      }

      const sellerId = user?.id || vendorId;
      if (!sellerId) throw new Error("You must be signed in to post an ad");

      const payload: Record<string, unknown> = {
        vendor_id: sellerId,
        mode,
        title: form.title,
        price: parseFloat(form.price),
        description: form.description || null,
        island: form.island,
        zone: form.zone || null,
        address: form.address || null,
        images: imageUrls,
        market_category: mode === "item_service" ? form.marketCategory || null : null,
      };

      if (mode === "real_estate") {
        payload.bedrooms = form.bedrooms ? parseInt(form.bedrooms) : null;
        payload.bathrooms = form.bathrooms ? parseInt(form.bathrooms) : null;
        payload.square_meters = form.squareMeters ? parseFloat(form.squareMeters) : null;
      }

      const { error } = await supabase.from("vendor_ads" as never).insert(payload as never);
      if (error) throw error;

      onAdCreated?.({
        id: `local-${Date.now()}`,
        mode,
        title: form.title,
        price: parseFloat(form.price),
        island: form.island,
        zone: form.zone || null,
        images: imageUrls.length > 0 ? imageUrls : previews,
        bedrooms: mode === "real_estate" && form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: mode === "real_estate" && form.bathrooms ? parseInt(form.bathrooms) : null,
        square_meters: mode === "real_estate" && form.squareMeters ? parseFloat(form.squareMeters) : null,
      });

      setStatus("success");
      setForm({ title: "", price: "", description: "", island: "", zone: "", address: "", bedrooms: "", bathrooms: "", squareMeters: "", marketCategory: "" });
      setImages([]);
      setPreviews([]);
      setMenuImages([]);
      setMenuPreviews([]);
    } catch {
      setStatus("error");
    }
  };

  const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white";

  return (
    <div className="w-full max-w-lg mx-auto">
      {status === "success" ? (
        <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
          <p className="text-base font-semibold text-green-800">Ad Posted!</p>
          <p className="text-sm text-green-600 mt-1">Your listing is now live.</p>
          <button onClick={() => setStatus("idle")} className="mt-4 text-sm text-blue-600 underline">
            Post another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("real_estate")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                mode === "real_estate" ? "bg-[#2563EB] text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Home className="h-4 w-4" />
              Real Estate
            </button>
            <button
              type="button"
              onClick={() => setMode("item_service")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                mode === "item_service" ? "bg-[#2563EB] text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Package className="h-4 w-4" />
              Item / Service
            </button>
          </div>

          {/* Core Fields */}
          <input
            type="text"
            placeholder="Title"
            required
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className={inputCls}
          />

          <input
            type="number"
            placeholder="Price (CVE)"
            required
            min="0"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            className={inputCls}
          />

          <textarea
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className={`${inputCls} resize-none`}
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              required
              value={form.island}
              onChange={(e) => updateField("island", e.target.value)}
              className={inputCls}
            >
              <option value="">Island</option>
              {CAPE_VERDE_ISLANDS.map((island) => (
                <option key={island} value={island}>{island}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Zone / Area"
              value={form.zone}
              onChange={(e) => updateField("zone", e.target.value)}
              className={inputCls}
            />
          </div>

          <input
            type="text"
            placeholder="Address (Optional)"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            className={inputCls}
          />

          {/* Conditional: Real Estate Fields */}
          {mode === "real_estate" && (
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                placeholder="Beds"
                min="0"
                value={form.bedrooms}
                onChange={(e) => updateField("bedrooms", e.target.value)}
                className={inputCls}
              />
              <input
                type="number"
                placeholder="Baths"
                min="0"
                value={form.bathrooms}
                onChange={(e) => updateField("bathrooms", e.target.value)}
                className={inputCls}
              />
              <input
                type="number"
                placeholder="m\u00B2"
                min="0"
                value={form.squareMeters}
                onChange={(e) => updateField("squareMeters", e.target.value)}
                className={inputCls}
              />
            </div>
          )}

          {/* Conditional: Item/Service Category Selector */}
          {mode === "item_service" && (
            <div className="space-y-3">
              <select
                value={form.marketCategory}
                onChange={(e) => updateField("marketCategory", e.target.value)}
                className={inputCls}
              >
                <option value="">Select Category</option>
                {MARKET_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.label}>{cat.label}</option>
                ))}
              </select>

              {/* Menu photo upload for Restaurants & Menus */}
              {form.marketCategory === "Restaurants & Menus (Takeaway)" && (
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1.5">Menu Booklet Photos ({menuImages.length}/2)</p>
                  <div className="flex gap-2 flex-wrap">
                    {menuPreviews.map((src, i) => (
                      <div key={i} className="relative w-20 h-24 rounded-lg overflow-hidden border border-gray-200">
                        <img src={src} alt="menu" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeMenuImage(i)}
                          className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {menuImages.length < 2 && (
                      <button
                        type="button"
                        onClick={() => menuFileRef.current?.click()}
                        className="w-20 h-24 rounded-lg border-2 border-dashed border-amber-300 flex flex-col items-center justify-center text-amber-500 hover:border-amber-400 hover:text-amber-600 transition-colors gap-0.5"
                      >
                        <ImagePlus className="h-5 w-5" />
                        <span className="text-[9px] font-medium">Menu</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={menuFileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleMenuImageSelect}
                  />
                </div>
              )}
            </div>
          )}

          {/* Image Picker */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Photos ({images.length}/4)</p>
            <div className="flex gap-2 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full py-3 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "submitting" ? "Posting..." : "Post Ad"}
          </button>

          {status === "error" && (
            <p className="text-xs text-red-500 text-center">Failed to post. Please try again.</p>
          )}
        </form>
      )}
    </div>
  );
}
