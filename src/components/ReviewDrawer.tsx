"use client";

import React, { useState } from "react";
import { Star, X, Send } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReviewDrawerProps {
  itemId?: string;
  vendorId?: string;
  vendorName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewDrawer({ itemId, vendorId, vendorName, isOpen, onClose, onSuccess }: ReviewDrawerProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const ratingLabels = [t.ratingBad, t.ratingFair, t.ratingGood, t.ratingVeryGood, t.ratingExcellent];

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Error", description: t.selectRating, variant: "destructive" });
      return;
    }

    if (!itemId && !vendorId) {
      toast({ title: "Error", description: t.networkError, variant: "destructive" });
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
        body: JSON.stringify({ itemId: itemId || undefined, vendorId: vendorId || undefined, rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Error", description: data.error || t.networkError, variant: "destructive" });
        setSubmitting(false);
        return;
      }

      toast({ title: t.reviewSubmitted, description: t.thanksFeedback });
      setRating(0);
      setComment("");
      onSuccess?.();
      onClose();
    } catch {
      toast({ title: "Error", description: t.networkError, variant: "destructive" });
    }

    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">{t.rateVendor}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm text-gray-600">
            {t.howWasExperience} <span className="font-semibold text-gray-900">{vendorName}</span>?
          </p>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm font-medium text-gray-700">
                {ratingLabels[rating - 1]}
              </span>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{t.commentOptional}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t.describeExperience}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-medium text-sm transition-colors"
          >
            <Send className="h-4 w-4" />
            {submitting ? t.submittingReview : t.submitReview}
          </button>
        </div>
      </div>
    </div>
  );
}
