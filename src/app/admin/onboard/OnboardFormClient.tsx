"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  Loader2,
  CheckCircle,
  WifiOff,
  User,
  Phone,
  Store,
  Tag,
  Send,
  ArrowLeft,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { compressImage } from "@/lib/image-compression";
import { enqueueOfflineSubmission, isOffline } from "@/lib/offline-queue";
import { useToast } from "@/hooks/use-toast";
import SyncStatusBadge from "@/components/SyncStatusBadge";

const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Smartphones",
  "Home & Furniture",
  "Services",
  "Food & Restaurants",
  "Building Materials",
  "Vehicles",
  "Books",
];

export default function OnboardFormClient() {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    owner_name: "",
    whatsapp: "",
    store_name: "",
    category: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const compressed: File[] = [];
    const previews: string[] = [];

    for (const file of files) {
      try {
        const blob = await compressImage(file);
        if (blob) {
          const compFile = new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
          compressed.push(compFile);
          previews.push(URL.createObjectURL(compFile));
        } else {
          compressed.push(file);
          previews.push(URL.createObjectURL(file));
        }
      } catch {
        compressed.push(file);
        previews.push(URL.createObjectURL(file));
      }
    }

    setPhotos((p) => [...p, ...compressed]);
    setPhotoPreview((p) => [...p, ...previews]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.owner_name.trim() || !form.store_name.trim()) return;

    setSubmitting(true);

    const payload: Record<string, unknown> = {
      title: form.store_name,
      description: `Loja de ${form.owner_name} - ${form.category}`,
      category: form.category || "Services",
      island: "Santiago",
      contact_whatsapp: form.whatsapp || null,
      user_id: user.id,
      status: "active",
      condition: "new",
      price_cve: 0,
      onboarded_by_agent: user.id,
      images: [],
    };

    if (isOffline()) {
      const imageBlobs = photos.map((f, i) => ({
        name: f.name,
        blob: f as Blob,
        bucket: "ad-images",
        path: `onboarding/${user.id}/${Date.now()}-${i}.webp`,
      }));

      await enqueueOfflineSubmission("marketplace_items:insert", payload, imageBlobs);

      toast({
        title: "Guardado localmente",
        description: "Sera sincronizado automaticamente quando tiver sinal.",
      });
      setSuccess(true);
      setSubmitting(false);
      resetForm();
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase not configured");

      const imageUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const path = `onboarding/${user.id}/${Date.now()}-${i}.webp`;
        const { error: upErr } = await supabase.storage
          .from("ad-images")
          .upload(path, photos[i], { upsert: true, contentType: "image/webp" });

        if (!upErr) {
          const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);
          imageUrls.push(urlData.publicUrl);
        }
      }

      payload.images = imageUrls;

      const { error } = await supabase.from("marketplace_items").insert(payload as never);

      if (error) throw error;

      toast({ title: "Vendedor registado!", description: "Dados enviados com sucesso." });
      setSuccess(true);
      resetForm();
    } catch (err) {
      toast({ title: "Erro", description: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ owner_name: "", whatsapp: "", store_name: "", category: "" });
    setPhotos([]);
    setPhotoPreview([]);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">A carregar sessao...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 safe-area-inset">
      {/* Compact Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <a href="/admin" className="p-1.5 -ml-1.5 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="text-base font-bold text-gray-900">Onboarding</h1>
          </div>
          <SyncStatusBadge />
        </div>
      </header>

      {/* Form */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-700">Registo guardado com sucesso!</p>
          </div>
        )}

        {isOffline() && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm font-medium text-amber-700">Modo offline - dados serao sincronizados depois.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Owner Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4" /> Nome do Proprietario
            </label>
            <input
              type="text"
              value={form.owner_name}
              onChange={(e) => setForm((f) => ({ ...f, owner_name: e.target.value }))}
              placeholder="Nome completo..."
              required
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none bg-white"
              autoComplete="name"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4" /> WhatsApp
            </label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
              placeholder="+238 9XX XXXX"
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none bg-white"
              autoComplete="tel"
            />
          </div>

          {/* Store Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Store className="w-4 h-4" /> Nome da Loja
            </label>
            <input
              type="text"
              value={form.store_name}
              onChange={(e) => setForm((f) => ({ ...f, store_name: e.target.value }))}
              placeholder="Nome da loja ou negocio..."
              required
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none bg-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Tag className="w-4 h-4" /> Categoria
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none bg-white appearance-none"
            >
              <option value="">Selecionar categoria...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Photo Capture */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Camera className="w-4 h-4" /> Fotos
            </label>

            {photoPreview.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {photoPreview.map((url, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-teal-400 hover:text-teal-600 active:bg-teal-50 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Tirar Foto
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoCapture}
              className="hidden"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !form.owner_name.trim() || !form.store_name.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-base font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {submitting ? "A enviar..." : "Registar Vendedor"}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-400 mt-6">
          Agente: {user.email} | ID: {user.id.slice(0, 8)}
        </p>
      </main>
    </div>
  );
}
