"use client";

import { useState } from "react";
import { Share2, Link2, Check } from "lucide-react";
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

  const shareText = price
    ? `Veja este ${title} por ${price} no Pro.CV!`
    : `Veja ${title} no Pro.CV!`;

  const handleShare = async () => {
    // Try native share API (mobile devices)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: fullUrl });
        return;
      } catch (err) {
        // User cancelled or API failed — fall through to clipboard
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    // Desktop fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      // Last resort fallback
      const textArea = document.createElement("textarea");
      textArea.value = fullUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    toast({ title: "Link copiado para a area de transferencia!" });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700">Link Copiado!</span>
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Partilhar
          </>
        )}
      </button>
      <button
        onClick={async () => {
          try { await navigator.clipboard.writeText(fullUrl); } catch { /* noop */ }
          setCopied(true);
          toast({ title: "Link copiado para a area de transferencia!" });
          setTimeout(() => setCopied(false), 2500);
        }}
        className="inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        title="Copiar link"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
