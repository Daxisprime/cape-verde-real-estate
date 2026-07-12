"use client";

import React, { useState } from "react";
import { Star, X, Send } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ReviewDrawerProps {
  vendorId: string;
  vendorName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewDrawer({ vendorId, vendorName, isOpen, onClose, onSuccess }: ReviewDrawerProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Erro", description: "Selecione uma avaliacao.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const session = supabase ? await supabase.auth.getSession() : null;
    const token = session?.data?.session?.access_token || "";

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vendorId, rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Erro", description: data.error || "Falha ao submeter.", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      toast({ title: "Avaliacao Enviada!", description: "Obrigado pelo seu feedback." });
      setRating(0);
      setComment("");
      onSuccess?.();
      onClose();
    } catch {
      toast({ title: "Erro", description: "Erro de rede.", variant: "destructive" });
    }

    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Avaliar Vendedor</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Vendor Name */}
          <p className="text-sm text-gray-600">
            Como foi a sua experiencia com <span className="font-semibold text-gray-900">{vendorName}</span>?
          </p>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400">
            {rating === 0 && "Toque para avaliar"}
            {rating === 1 && "Muito mau"}
            {rating === 2 && "Mau"}
            {rating === 3 && "Razoavel"}
            {rating === 4 && "Bom"}
            {rating === 5 && "Excelente"}
          </p>

          {/* Comment */}
          <textarea
            placeholder="Escreva um comentario (opcional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl resize-none h-24 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
            maxLength={500}
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitting ? "A enviar..." : "Enviar Avaliacao"}
          </button>
        </div>
      </div>
    </div>
  );
}
