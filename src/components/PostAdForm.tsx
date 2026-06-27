"use client";

import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { ImagePlus, X, Loader2, MapPin, Facebook } from "lucide-react";
import dynamic from "next/dynamic";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { CAPE_VERDE_ISLANDS } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useLanguage, type Translations } from "@/contexts/LanguageContext";
import AuthModal from "@/components/AuthModal";

const LeafletPicker = dynamic(() => import("@/components/LeafletCoordinatePicker"), {
  ssr: false,
  loading: () => <div className="w-full h-40 bg-slate-100 rounded-lg animate-pulse flex items-center justify-center text-xs text-slate-400"></div>,
});

const PROPERTY_TYPES = ["House", "Apartment", "Villa", "Land", "Duplex", "Studio", "Penthouse", "Townhouse"];

const MARKET_CATEGORIES = [
  "Vehicles & Automotive",
  "Electronics & Computers",
  "Home, Furniture & Appliances",
  "Building Materials & Tools",
  "Restaurants & Menus (Takeaway)",
  "Fashion, Clothing & Retail",
  "Babies & Kids Items",
  "Pets & Animal Supplies",
  "Maintenance & Repair Services",
  "Professional & Event Services",
];

const PROPERTY_TYPE_KEYS: Record<string, keyof Translations> = {
  "House": "house",
  "Apartment": "apartment",
  "Villa": "villa",
  "Land": "land",
  "Duplex": "duplex",
  "Studio": "studio",
  "Penthouse": "penthouse",
  "Townhouse": "townhouse",
};

const MARKET_CATEGORY_KEYS: Record<string, keyof Translations> = {
  "Vehicles & Automotive": "catVehicles",
  "Electronics & Computers": "catElectronics",
  "Home, Furniture & Appliances": "catHomeFurniture",
  "Building Materials & Tools": "catBuildingMaterials",
  "Restaurants & Menus (Takeaway)": "catRestaurants",
  "Fashion, Clothing & Retail": "catFashion",
  "Babies & Kids Items": "catBabiesKids",
  "Pets & Animal Supplies": "catPets",
  "Maintenance & Repair Services": "catMaintenance",
  "Professional & Event Services": "catProfessionalServices",
};

const ALL_CATEGORIES = [
  { group: "Real Estate", items: PROPERTY_TYPES },
  { group: "General Markets", items: MARKET_CATEGORIES },
];

const ISLAND_CENTERS: Record<string, [number, number]> = {
  "Santiago": [14.9177, -23.5133],
  "Santo Antao": [17.0669, -25.0593],
  "Sao Vicente": [16.8718, -24.9801],
  "Sao Nicolau": [16.6147, -24.2706],
  "Sal": [16.7322, -22.9329],
  "Boa Vista": [16.0872, -22.7967],
  "Maio": [15.2260, -23.1669],
  "Fogo": [14.9281, -24.3837],
  "Brava": [14.8528, -24.7004],
};

export interface CreatedAd {
  id: string;
  mode: "real_estate" | "item_service";
  title: string;
  price: number;
  island: string;
  zone: string | null;
  images: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  square_meters: number | null;
}

export interface ListingEditData {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  island: string;
  location?: string | null;
  municipality?: string | null;
  property_type?: string | null;
  category?: string | null;
  listing_type?: string | null;
  condition?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  total_area?: number | null;
  square_meters?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  images?: string[] | null;
  mode?: "real_estate" | "item_service";
}

interface PostAdFormProps {
  vendorId?: string;
  onAdCreated?: (ad: CreatedAd) => void;
  editData?: ListingEditData | null;
}

export default function PostAdForm({ onAdCreated, editData }: PostAdFormProps) {
  const { user } = useSupabaseAuth();
  const { t } = useLanguage();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [island, setIsland] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [dealType, setDealType] = useState<"sale" | "rent">("sale");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [squareMeters, setSquareMeters] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [facebookHandle, setFacebookHandle] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [condition, setCondition] = useState<"new" | "used">("used");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editData;

  useEffect(() => {
    if (!editData) return;
    setTitle(editData.title || "");
    setDescription(editData.description || "");
    setPrice(editData.price ? String(editData.price) : "");
    setIsland(editData.island || "");
    setMunicipality(editData.municipality || editData.location || "");
    setCategory(editData.property_type || editData.category || "");
    setDealType((editData.listing_type as "sale" | "rent") || "sale");
    setBedrooms(editData.bedrooms ? String(editData.bedrooms) : "");
    setBathrooms(editData.bathrooms ? String(editData.bathrooms) : "");
    setSquareMeters(editData.total_area ? String(editData.total_area) : editData.square_meters ? String(editData.square_meters) : "");
    setCondition((editData.condition as "new" | "used") || "used");
    if (editData.latitude && editData.longitude) {
      setCoordinates([editData.latitude, editData.longitude]);
    }
    if (editData.images && editData.images.length > 0) {
      setPreviews(editData.images);
    }
  }, [editData]);

  const isPropertyCategory = PROPERTY_TYPES.includes(category);

  const mapCenter = useMemo<[number, number]>(() => {
    if (island && ISLAND_CENTERS[island]) return ISLAND_CENTERS[island];
    return [14.9177, -23.5133];
  }, [island]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 6 - images.length;
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

    const sellerId = user?.id;

    // Optimistic UI: fire callback immediately so the local list updates
    if (isEditing) {
      onAdCreated?.({
        id: editData?.id || `local-${Date.now()}`,
        mode: isPropertyCategory ? "real_estate" : "item_service",
        title,
        price: parseFloat(price),
        island,
        zone: municipality || null,
        images: previews,
        bedrooms: isPropertyCategory && bedrooms ? parseInt(bedrooms) : null,
        bathrooms: isPropertyCategory && bathrooms ? parseInt(bathrooms) : null,
        square_meters: isPropertyCategory && squareMeters ? parseFloat(squareMeters) : null,
      });
    }

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase not configured");
      if (!sellerId) throw new Error("Authentication required");

      // Upload new images (skip for existing URL previews from edit mode)
      const imageUrls: string[] = [];
      // Keep existing images that came from the database
      if (isEditing && editData?.images) {
        const existingUrls = previews.filter(p => p.startsWith('http'));
        imageUrls.push(...existingUrls);
      }
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

      if (isPropertyCategory) {
        const propertyPayload = {
          title,
          description: description || null,
          price: parseFloat(price),
          property_type: category,
          listing_type: dealType,
          bedrooms: bedrooms ? parseInt(bedrooms) : 0,
          bathrooms: bathrooms ? parseInt(bathrooms) : 0,
          total_area: squareMeters ? parseFloat(squareMeters) : null,
          location: municipality || island,
          island,
          latitude: coordinates?.[0] ?? null,
          longitude: coordinates?.[1] ?? null,
          images: imageUrls,
        };

        if (isEditing && editData) {
          const { error } = await supabase
            .from("properties")
            .update(propertyPayload as never)
            .eq("id", editData.id)
            .eq("agent_id", sellerId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("properties")
            .insert({ ...propertyPayload, agent_id: sellerId, status: "active" } as never);
          if (error) throw error;
        }
      } else {
        const marketPayload = {
          title,
          description: description || null,
          price_cve: parseFloat(price),
          category,
          condition,
          island,
          municipality: municipality || null,
          images: imageUrls,
        };

        if (isEditing && editData) {
          const { error } = await supabase
            .from("marketplace_items")
            .update(marketPayload as never)
            .eq("id", editData.id)
            .eq("user_id", sellerId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("marketplace_items")
            .insert({ ...marketPayload, user_id: sellerId, status: "active" } as never);
          if (error) throw error;
        }
      }

      if (facebookHandle || twitterHandle) {
        await supabase.from("profiles").upsert({
          id: sellerId,
          facebook_handle: facebookHandle || null,
          twitter_handle: twitterHandle || null,
        }, { onConflict: 'id' });
      }

      if (!isEditing) {
        onAdCreated?.({
          id: `local-${Date.now()}`,
          mode: isPropertyCategory ? "real_estate" : "item_service",
          title,
          price: parseFloat(price),
          island,
          zone: municipality || null,
          images: imageUrls.length > 0 ? imageUrls : previews,
          bedrooms: isPropertyCategory && bedrooms ? parseInt(bedrooms) : null,
          bathrooms: isPropertyCategory && bathrooms ? parseInt(bathrooms) : null,
          square_meters: isPropertyCategory && squareMeters ? parseFloat(squareMeters) : null,
        });
      }

      setStatus("success");
      if (!isEditing) {
        setCategory("");
        setTitle("");
        setDescription("");
        setPrice("");
        setIsland("");
        setMunicipality("");
        setDealType("sale");
        setBedrooms("");
        setBathrooms("");
        setSquareMeters("");
        setCondition("used");
        setCoordinates(null);
        setImages([]);
        setPreviews([]);
      }
    } catch (err: unknown) {
      const supaError = err as { message?: string; details?: string; hint?: string; code?: string };
      const msg = supaError?.message || supaError?.details || "An unexpected error occurred.";
      setErrorMessage(msg);
      setStatus("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, title, price, island, category, description, municipality, dealType, bedrooms, bathrooms, squareMeters, coordinates, images, previews, condition, facebookHandle, twitterHandle, isEditing, editData, isPropertyCategory, onAdCreated]);

  useEffect(() => {
    if (pendingSubmit && user) {
      setPendingSubmit(false);
      executeSubmit();
    }
  }, [pendingSubmit, user, executeSubmit]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white";

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
        <p className="text-base font-semibold text-green-800">{isEditing ? "Listing Updated!" : "Ad Posted!"}</p>
        <p className="text-sm text-green-600 mt-1">{isEditing ? "Your changes have been saved." : "Your listing is now live."}</p>
        <button onClick={() => setStatus("idle")} className="mt-4 text-sm text-blue-600 underline">
          {isEditing ? "Continue editing" : "Post another"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-5">
      {/* Photo Upload */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">{t.photos} ({images.length}/6)</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {previews.map((src, i) => (
            <div key={i} className="relative w-[72px] h-[72px] rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
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
          {images.length < 6 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-[72px] h-[72px] rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors flex-shrink-0"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-[9px] mt-0.5">Add</span>
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

      {/* Category Dropdown */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">{t.category}</label>
        <select
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputCls}
        >
          <option value="">{t.category}...</option>
          <optgroup label={t.realEstate}>
            {PROPERTY_TYPES.map((item) => (
              <option key={item} value={item}>{t[PROPERTY_TYPE_KEYS[item]] || item}</option>
            ))}
          </optgroup>
          <optgroup label={t.markets}>
            {MARKET_CATEGORIES.map((item) => (
              <option key={item} value={item}>{t[MARKET_CATEGORY_KEYS[item]] || item}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">{t.title}</label>
        <input
          type="text"
          placeholder="e.g. 3-Bedroom Villa in Sal"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">{t.description}</label>
        <textarea
          rows={3}
          placeholder="Describe your listing..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Price */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">{t.priceCVE}</label>
        <input
          type="number"
          placeholder="0"
          required
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Location: Island + Municipality */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">{t.island}</label>
          <select
            required
            value={island}
            onChange={(e) => setIsland(e.target.value)}
            className={inputCls}
          >
            <option value="">Select island...</option>
            {CAPE_VERDE_ISLANDS.map((isl) => (
              <option key={isl} value={isl}>{isl}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">{t.municipality}</label>
          <input
            type="text"
            placeholder="Zone / Area"
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Property-Specific Fields */}
      {isPropertyCategory && (
        <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 space-y-3">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">{t.propertyType}</p>

          {/* Deal Type Toggle */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t.dealType}</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setDealType("sale")}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  dealType === "sale" ? "bg-[#2563EB] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t.forSale}
              </button>
              <button
                type="button"
                onClick={() => setDealType("rent")}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  dealType === "rent" ? "bg-[#2563EB] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t.forRent}
              </button>
            </div>
          </div>

          {/* Beds, Baths, Area */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{t.bedrooms}</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{t.bathrooms}</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{t.areaM2}</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={squareMeters}
                onChange={(e) => setSquareMeters(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      )}

      {/* Marketplace-Specific: Condition */}
      {!isPropertyCategory && category && (
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t.condition}</label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setCondition("new")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                condition === "new" ? "bg-[#2563EB] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.newItem}
            </button>
            <button
              type="button"
              onClick={() => setCondition("used")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                condition === "used" ? "bg-[#2563EB] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.usedItem}
            </button>
          </div>
        </div>
      )}

      {/* Map Coordinate Picker */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-600">{t.pinLocation}</span>
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

      {/* Social & Contact Links (Optional) */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Social & Contact Links <span className="font-normal normal-case text-slate-400">(Optional)</span></p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
              <Facebook className="h-3 w-3 text-[#1877F2]" /> Facebook
            </label>
            <input
              type="text"
              placeholder="yourpage"
              value={facebookHandle}
              onChange={(e) => setFacebookHandle(e.target.value.replace(/^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/?/i, '').replace(/^@/, '').replace(/\/$/, ''))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Twitter / X
            </label>
            <input
              type="text"
              placeholder="yourhandle"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value.replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/?/i, '').replace(/^@/, '').replace(/\/$/, ''))}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full py-3 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "submitting" ? (isEditing ? "..." : "...") : isEditing ? t.editListing : isPropertyCategory ? t.listProperty : t.postAdButton}
      </button>

      {status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
          <p className="text-sm font-medium text-red-700">
            {errorMessage || "Failed to save. Please sign in and try again."}
          </p>
          <button
            type="button"
            onClick={() => { setStatus("idle"); setErrorMessage(""); }}
            className="mt-2 text-xs text-red-600 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => { setShowAuthModal(false); setPendingSubmit(false); }}
          defaultTab="register"
          onSuccess={handleAuthSuccess}
        />
      )}
    </form>
  );
}
