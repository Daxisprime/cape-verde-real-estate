"use client";

import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phone: string | null | undefined;
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "full";
}

export default function WhatsAppButton({
  phone,
  message = "Olá, vi o seu anuncio no Pro.CV. Ainda está disponível?",
  className = "",
  size = "sm",
  variant = "icon",
}: WhatsAppButtonProps) {
  if (!phone) return null;

  const cleanPhone = phone.replace(/\D/g, "");
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-4.5 w-4.5",
    lg: "h-5 w-5",
  };

  if (variant === "full") {
    const fullSizeClasses = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-2.5 text-sm",
    };

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center justify-center gap-1.5 font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 active:bg-green-800 transition-colors ${fullSizeClasses[size]} ${className}`}
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className={iconSizes[size]} />
        <span>WhatsApp</span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700 active:bg-green-800 transition-colors ${sizeClasses[size]} ${className}`}
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle className={iconSizes[size]} />
    </a>
  );
}
