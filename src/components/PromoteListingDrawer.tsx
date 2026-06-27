"use client";

import React, { useState } from "react";
import { X, Star, Zap, Crown, Check, Sparkles } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface PromoteListingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  listingType: "property" | "marketplace";
  onSuccess: () => void;
}

const PROMO_OPTIONS = [
  {
    id: "bump",
    icon: Star,
    label: "Basic Bump",
    duration: "24 Horas",
    durationDays: 1,
    price: "250 CVE",
    description: "Empurra o seu anúncio para o topo da lista de resultados.",
    color: "from-amber-400 to-orange-500",
    ring: "ring-amber-200",
    bg: "bg-amber-50",
  },
  {
    id: "vip",
    icon: Zap,
    label: "VIP Search Boost",
    duration: "5 Dias",
    durationDays: 5,
    price: "1,500 CVE",
    description: "Fixa o seu anúncio no topo das pesquisas da sua categoria.",
    color: "from-blue-500 to-indigo-600",
    ring: "ring-blue-200",
    bg: "bg-blue-50",
  },
  {
    id: "patrao",
    icon: Crown,
    label: "Patrão Homepage Spot",
    duration: "10 Dias",
    durationDays: 10,
    price: "3,500 CVE",
    description: "Coloca o seu anúncio no carrossel de destaques da página principal.",
    color: "from-emerald-500 to-teal-600",
    ring: "ring-emerald-200",
    bg: "bg-emerald-50",
  },
];

export default function PromoteListingDrawer({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  listingType,
  onSuccess,
}: PromoteListingDrawerProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePromote = async () => {
    if (!selectedOption) return;

    const option = PROMO_OPTIONS.find((o) => o.id === selectedOption);
    if (!option) return;

    setIsProcessing(true);

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase not configured");

      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + option.durationDays);

      const table = listingType === "property" ? "properties" : "marketplace_items";
      const { error } = await supabase
        .from(table)
        .update({ is_featured: true, featured_until: featuredUntil.toISOString() })
        .eq("id", listingId);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedOption(null);
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Promote error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-gray-900">Promover Anúncio</h2>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{listingTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Free Launch Banner */}
        <div className="mx-5 mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-800">
                Fase de Lançamento Pro.CV
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                Todas as promoções estão temporariamente 100% GRÁTIS para impulsionar o seu negócio!
              </p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {PROMO_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedOption === option.id;

            return (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? `${option.ring} border-current shadow-md scale-[1.01]`
                    : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{option.label}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs line-through text-gray-400">{option.price}</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">GRÁTIS</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">({option.duration})</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{option.description}</p>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-5 py-4">
          <button
            onClick={handlePromote}
            disabled={!selectedOption || isProcessing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
          >
            {isProcessing ? "A processar..." : "Promover Grátis"}
          </button>
        </div>

        {/* Success Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Anúncio Promovido!</h3>
              <p className="text-sm text-gray-500 mt-1">O seu anúncio está agora em destaque.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
