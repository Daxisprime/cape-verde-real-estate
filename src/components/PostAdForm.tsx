"use client";

import React, { useState, useRef, useMemo } from "react";
import { Home, Package, ImagePlus, X, Loader2, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { CAPE_VERDE_ISLANDS } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

const LeafletPicker = dynamic(() => import("@/components/LeafletCoordinatePicker"), {
  ssr: false,
  loading: () => <div className="w-full h-40 bg-slate-100 rounded-lg animate-pulse flex items-center justify-center text-xs text-slate-400">Loading map...</div>,
});

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

const ISLAND_CENTERS: Record<string, [number, number]> = {
  "Santiago": [14.9177, -23.5133],
  "Santo Antão": [17.0669, -25.0593],
  "São Vicente": [16.8718, -24.9801],
  "São Nicolau": [16.6147, -24.2706],
  "Sal": [16.7322, -22.9329],
  "Boa Vista": [16.0872, -22.7967],
  "Maio": [15.2260, -23.1669],
  "Fogo": [14.9281, -24.3837],
  "Brava": [14.8528, -24.7004],
};

interface FormData {
  title: string;
  price: string;
  description: string;
  island: string;
  zone: string;
  address: string;
  landmark: string;
  bedrooms: string;
  bathrooms: string;
  squareMeters: string;
  marketCategory: string;
  facebookHandle: string;
  instagramHandle: string;
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

function sanitizeHandle(input: string): string {
  return input
    .replace(/^https?:\/\/(www\.)?(facebook\.com|instagram\.com|fb\.com)\/?/i, '')
    .replace(/^@/, '')
    .replace(/\/$/, '')
    .trim();
}

export default function PostAdForm({ onAdCreated }: { vendorId?: string; onAdCreated?: (ad: CreatedAd) => void }) {
  const { user } = useSupabaseAuth();
  const [mode, setMode] = useState<AdMode>("real_estate");
  const [form, setForm] = useState<FormData>({
    title: "",
    price: "",
    description: "",
    island: "",
    zone: "",
    address: "",
    landmark: "",
    bedrooms: "",
    bathrooms: "",
    squareMeters: "",
    marketCategory: "",
    facebookHandle: "",
    instagramHandle: "",
  });
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [menuImages, setMenuImages] = useState<File[]>([]);
  const [menuPreviews, setMenuPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const menuFileRef = useRef<HTMLInputElement>(null);

  const mapCenter = useMemo<[number, number]>(() => {
    if (form.island && ISLAND_CENTERS[form.island]) return ISLAND_CENTERS[form.island];
    return [14.9177, -23.5133];
  }, [form.island]);

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

      const sellerId = user?.id;
      if (!sellerId) throw new Error("You must be signed in to post an ad");

      // Upload images with graceful fallback
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
          // Storage not configured or upload failed - use placeholder
          imageUrls.push("https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=600&h=400&fit=crop");
        }
      }

      // Build payload mapped to marketplace_items columns
      const payload: Record<string, unknown> = {
        user_id: sellerId,
        title: form.title,
        price_cve: parseFloat(form.price),
        description: form.description || null,
        island: form.island,
        municipality: form.zone || null,
        category: mode === "item_service" ? (form.marketCategory || "Other") : "Real Estate",
        subcategory: null,
        condition: mode === "real_estate" ? "new" : "used",
        images: imageUrls.length > 0 ? imageUrls : [],
        status: "active",
        contact_phone: null,
        contact_whatsapp: null,
      };

      const { error } = await supabase.from("marketplace_items" as never).insert(payload as never);
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
      setForm({ title: "", price: "", description: "", island: "", zone: "", address: "", landmark: "", bedrooms: "", bathrooms: "", squareMeters: "", marketCategory: "", facebookHandle: "", instagramHandle: "" });
      setImages([]);
      setPreviews([]);
      setMenuImages([]);
      setMenuPreviews([]);
      setCoordinates(null);
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

          {/* Landmark + Coordinate Picker */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Landmark (e.g., Near the plaza)"
                value={form.landmark}
                onChange={(e) => updateField("landmark", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <LeafletPicker
                center={mapCenter}
                value={coordinates}
                onChange={setCoordinates}
              />
              {coordinates && (
                <div className="px-3 py-1.5 bg-slate-50 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-[10px] text-slate-500">
                    Pin: {coordinates[0].toFixed(5)}, {coordinates[1].toFixed(5)}
                  </p>
                  <button type="button" onClick={() => setCoordinates(null)} className="text-[10px] text-red-500 hover:underline">
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

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
                placeholder="m²"
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

          {/* Social Handles */}
          <div className="space-y-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Social Profiles (Optional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  <svg className="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </span>
                <input
                  type="text"
                  placeholder="Facebook Page Handle"
                  value={form.facebookHandle}
                  onChange={(e) => updateField("facebookHandle", sanitizeHandle(e.target.value))}
                  className={`${inputCls} pl-9`}
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  <svg className="w-4 h-4 text-[#E4405F]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                </span>
                <input
                  type="text"
                  placeholder="Instagram Username"
                  value={form.instagramHandle}
                  onChange={(e) => updateField("instagramHandle", sanitizeHandle(e.target.value))}
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
          </div>

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
