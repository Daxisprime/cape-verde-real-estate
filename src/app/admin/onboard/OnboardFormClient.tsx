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
  MapPin,
  DollarSign,
  Package,
  Lock,
  FileText,
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
  "Books & Media",
  "Health & Beauty",
];

const REGIONS = [
  "Praia - Plateau",
  "Praia - Palmarejo",
  "Praia - Achada Sto Antonio",
  "Praia - Fazenda",
  "Praia - Sucupira",
  "Mindelo - Centro",
  "Mindelo - Laginha",
  "Santa Maria - Sal",
  "Espargos - Sal",
  "Assomada - Santiago",
  "Tarrafal - Santiago",
  "Sal Rei - Boa Vista",
  "Porto Novo - Santo Antao",
  "Sao Filipe - Fogo",
];

interface FormState {
  owner_name: string;
  whatsapp: string;
  store_name: string;
  category: string;
  region: string;
  nif: string;
  seed_title: string;
  seed_price: string;
}

const INITIAL_FORM: FormState = {
  owner_name: "",
  whatsapp: "",
  store_name: "",
  category: "",
  region: "",
  nif: "",
  seed_title: "",
  seed_price: "",
};

export default function OnboardFormClient() {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const productPhotoRef = useRef<HTMLInputElement>(null);
  const idDocRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [productPhotos, setProductPhotos] = useState<File[]>([]);
  const [productPreviews, setProductPreviews] = useState<string[]>([]);
  const [idDocFile, setIdDocFile] = useState<File | null>(null);
  const [idDocPreview, setIdDocPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleProductCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const compressed: File[] = [];
    const previews: string[] = [];

    for (const file of files) {
      try {
        const result = await compressImage(file);
        compressed.push(result);
        previews.push(URL.createObjectURL(result));
      } catch {
        compressed.push(file);
        previews.push(URL.createObjectURL(file));
      }
    }

    setProductPhotos((p) => [...p, ...compressed]);
    setProductPreviews((p) => [...p, ...previews]);
  };

  const handleIdDocCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setIdDocFile(compressed);
      setIdDocPreview(URL.createObjectURL(compressed));
    } catch {
      setIdDocFile(file);
      setIdDocPreview(URL.createObjectURL(file));
    }
  };

  const removeProductPhoto = (idx: number) => {
    setProductPhotos((p) => p.filter((_, i) => i !== idx));
    setProductPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.owner_name.trim() || !form.store_name.trim() || !form.whatsapp.trim()) return;

    setSubmitting(true);

    const payload = {
      p_merchant_name: form.owner_name.trim(),
      p_merchant_phone: form.whatsapp.trim(),
      p_store_name: form.store_name.trim(),
      p_category: form.category || null,
      p_region: form.region || null,
      p_nif: form.nif.trim() || "",
      p_id_image_path: null as string | null,
      p_seed_product_title: form.seed_title.trim() || null,
      p_seed_product_price: form.seed_price ? parseInt(form.seed_price, 10) : null,
      p_product_image_path: null as string | null,
    };

    if (isOffline()) {
      await enqueueOfflineSubmission("merchant_onboardings:rpc", payload, []);
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
      if (!supabase) throw new Error("Supabase nao configurado");

      // Upload ID document to private bucket
      if (idDocFile) {
        const idPath = `${user.id}/${Date.now()}-id-doc.webp`;
        const { error: idUpErr } = await supabase.storage
          .from("verification-docs")
          .upload(idPath, idDocFile, { upsert: true, contentType: idDocFile.type });
        if (!idUpErr) {
          payload.p_id_image_path = idPath;
        }
      }

      // Upload product photo to ad-images bucket
      if (productPhotos.length > 0) {
        const prodPath = `onboarding/${user.id}/${Date.now()}-product.webp`;
        const { error: prodUpErr } = await supabase.storage
          .from("ad-images")
          .upload(prodPath, productPhotos[0], { upsert: true, contentType: "image/webp" });
        if (!prodUpErr) {
          payload.p_product_image_path = prodPath;
        }
      }

      // Call the encrypted RPC — NIF is encrypted server-side via pgp_sym_encrypt
      const { data, error } = await supabase.rpc("insert_merchant_onboarding", payload);

      if (error) throw error;

      toast({
        title: "Vendedor Registado!",
        description: `ID: ${(data as string)?.slice(0, 8) || "OK"} — NIF encriptado com sucesso.`,
      });
      setSuccess(true);
      resetForm();
    } catch (err) {
      toast({
        title: "Erro",
        description: (err as Error).message || "Falha ao submeter registo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setProductPhotos([]);
    setProductPreviews([]);
    setIdDocFile(null);
    setIdDocPreview(null);
    setTimeout(() => setSuccess(false), 4000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">A carregar sessao do agente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <a href="/admin" className="p-1.5 -ml-1.5 text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-base font-bold text-gray-900">Registar Vendedor</h1>
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> NIF encriptado PGP
              </p>
            </div>
          </div>
          <SyncStatusBadge />
        </div>
      </header>

      {/* Form */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-28">
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 animate-in fade-in-0">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-700">Registo guardado com encriptacao!</p>
          </div>
        )}

        {isOffline() && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm font-medium text-amber-700">Modo offline — dados serao sincronizados depois.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Owner Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <User className="w-4 h-4" /> Nome do Proprietario *
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
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Phone className="w-4 h-4" /> WhatsApp *
            </label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
              placeholder="+238 9XX XXXX"
              required
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none bg-white"
              autoComplete="tel"
            />
          </div>

          {/* Store Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Store className="w-4 h-4" /> Nome da Loja *
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

          {/* Category Dropdown */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Tag className="w-4 h-4" /> Categoria Principal
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none bg-white appearance-none"
            >
              <option value="">Selecionar...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Region Dropdown */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <MapPin className="w-4 h-4" /> Bairro / Regiao
            </label>
            <select
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none bg-white appearance-none"
            >
              <option value="">Selecionar zona...</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* NIF / BI (Encrypted) */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Lock className="w-4 h-4 text-teal-600" /> NIF / BI (Encriptado)
            </label>
            <input
              type="text"
              value={form.nif}
              onChange={(e) => setForm((f) => ({ ...f, nif: e.target.value }))}
              placeholder="Numero NIF ou BI..."
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none bg-white pr-12"
              autoComplete="off"
            />
            <div className="absolute right-3 top-[38px] text-[9px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
              PGP
            </div>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Encriptado com AES-256 antes de ser guardado
            </p>
          </div>

          {/* ID Document Photo */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <FileText className="w-4 h-4" /> Foto do Documento (NIF/BI)
            </label>

            {idDocPreview && (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 mb-2">
                <img src={idDocPreview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setIdDocFile(null); setIdDocPreview(null); }}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs"
                >
                  x
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => idDocRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-teal-400 hover:text-teal-600 active:bg-teal-50 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Fotografar Documento
            </button>
            <input
              ref={idDocRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleIdDocCapture}
              className="hidden"
            />
            <p className="text-[10px] text-gray-400 mt-1">Foto privada — armazenada em bucket encriptado</p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Produto Inicial</p>
          </div>

          {/* Seed Product Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Package className="w-4 h-4" /> Titulo do Produto
            </label>
            <input
              type="text"
              value={form.seed_title}
              onChange={(e) => setForm((f) => ({ ...f, seed_title: e.target.value }))}
              placeholder="Ex: iPhone 13 Pro Max 256GB"
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none bg-white"
            />
          </div>

          {/* Seed Product Price */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <DollarSign className="w-4 h-4" /> Preco (CVE)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={form.seed_price}
              onChange={(e) => setForm((f) => ({ ...f, seed_price: e.target.value }))}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none bg-white"
            />
          </div>

          {/* Product Photo Capture */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Camera className="w-4 h-4" /> Foto do Produto
            </label>

            {productPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {productPreviews.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeProductPhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => productPhotoRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-teal-400 hover:text-teal-600 active:bg-teal-50 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Tirar Foto do Produto
            </button>
            <input
              ref={productPhotoRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleProductCapture}
              className="hidden"
            />
            <p className="text-[10px] text-gray-400 mt-1">Compressao automatica WebP (max 200KB, 1024px)</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !form.owner_name.trim() || !form.store_name.trim() || !form.whatsapp.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-base font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {submitting ? "A encriptar e enviar..." : "Guardar Loja"}
          </button>
        </form>

        {/* Agent footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">
            Agente: {user.email}
          </p>
          <p className="text-[10px] text-gray-300 mt-0.5">
            ID: {user.id.slice(0, 8)}... | Dados NIF encriptados (pgp_sym_encrypt)
          </p>
        </div>
      </main>
    </div>
  );
}
