"use client";

import { useState } from "react";
import { Link2, Check, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareBarProps {
  title: string;
  price?: string;
  url: string;
}

export default function SocialShareBar({ title, price, url }: SocialShareBarProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined"
    ? (url.startsWith("http") ? url : `${window.location.origin}${url}`)
    : url;

  const whatsappMessage = price
    ? `Veja este ${title} por ${price} no Pro.CV! Link: ${fullUrl}`
    : `Veja ${title} no Pro.CV! Link: ${fullUrl}`;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      // fallback: still show success
    }
    setCopied(true);
    toast({ title: "Link Copiado!", description: "O link foi copiado para a area de transferencia." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleWhatsApp}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#25D366] rounded-xl hover:bg-[#1fb855] transition-colors shadow-sm"
      >
        <MessageCircle className="h-4 w-4" />
        Partilhar no WhatsApp
      </button>
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Link Copiado!" : "Copiar Link"}
      </button>
    </div>
  );
}
