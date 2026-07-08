"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Star, MessageCircle, Send, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface Review {
  id: string;
  vendor_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
}

interface ReviewDrawerProps {
  vendorId: string;
  vendorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewDrawer({ vendorId, vendorName, isOpen, onClose }: ReviewDrawerProps) {
  const { user } = useSupabaseAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const fetchReviews = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const { data } = await supabase
      .from("vendor_reviews")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      const reviewerIds = [...new Set(data.map((r: Review) => r.reviewer_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar")
        .in("id", reviewerIds);

      const profileMap = new Map(
        (profiles || []).map((p: { id: string; name: string | null; avatar: string | null }) => [p.id, p])
      );

      const enriched = data.map((r: Review) => {
        const profile = profileMap.get(r.reviewer_id);
        return {
          ...r,
          reviewer_name: profile?.name || "Anonymous",
          reviewer_avatar: profile?.avatar || null,
        };
      });

      setReviews(enriched);
    } else {
      setReviews([]);
    }

    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchReviews();
    }
  }, [isOpen, fetchReviews]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedRating === 0) return;

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    setSubmitting(true);
    setSubmitStatus("idle");

    const { error } = await supabase.from("vendor_reviews").upsert(
      {
        vendor_id: vendorId,
        reviewer_id: user.id,
        rating: selectedRating,
        comment: comment.trim() || null,
      },
      { onConflict: "vendor_id,reviewer_id" }
    );

    if (error) {
      setSubmitStatus("error");
    } else {
      setSubmitStatus("success");
      setSelectedRating(0);
      setComment("");
      await fetchReviews();
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }

    setSubmitting(false);
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">Feedback</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Aggregate Score */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {avgRating > 0 ? avgRating.toFixed(1) : "--"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">de 5 Estrelas</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(avgRating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                {reviews.length} {reviews.length === 1 ? "avaliacao" : "avaliacoes"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{vendorName}</p>
            </div>
          </div>
        </div>

        {/* Review Form (authenticated only) */}
        {user && user.id !== vendorId && (
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">A sua avaliacao:</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= (hoverRating || selectedRating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {selectedRating > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      {selectedRating}/5
                    </span>
                  )}
                </div>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva a sua opiniao..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 resize-none bg-white"
              />

              <div className="flex items-center justify-between">
                {submitStatus === "success" && (
                  <p className="text-xs text-green-600 font-medium">Feedback enviado!</p>
                )}
                {submitStatus === "error" && (
                  <p className="text-xs text-red-600 font-medium">Erro ao enviar. Tente novamente.</p>
                )}
                {submitStatus === "idle" && <div />}

                <button
                  type="submit"
                  disabled={selectedRating === 0 || submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submeter Feedback
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Not logged in prompt */}
        {!user && (
          <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/50">
            <p className="text-sm text-blue-700 text-center">
              Faca login para deixar uma avaliacao
            </p>
          </div>
        )}

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Sem avaliacoes ainda</p>
              <p className="text-xs text-gray-400 mt-1">
                Seja o primeiro a avaliar este vendedor
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const timeAgo = getRelativeTime(review.created_at);

  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        {review.reviewer_avatar ? (
          <img
            src={review.reviewer_avatar}
            alt={review.reviewer_name || ""}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {(review.reviewer_name || "A").charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {review.reviewer_name}
            </p>
            <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo}</span>
          </div>
          <div className="flex items-center gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= review.rating
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>
          {review.comment && (
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `ha ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `ha ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `ha ${days} ${days === 1 ? "dia" : "dias"}`;
  const months = Math.floor(days / 30);
  return `ha ${months} ${months === 1 ? "mes" : "meses"}`;
}
