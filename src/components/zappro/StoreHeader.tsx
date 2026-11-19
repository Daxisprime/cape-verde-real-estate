import { BadgeCheck, Store, Building2 } from 'lucide-react';
import type { ZapShop } from '@/lib/zappro';

export default function StoreHeader({ shop }: { shop: ZapShop }) {
  const FallbackIcon = shop.store_type === 'showcase' ? Building2 : Store;

  return (
    <header className="bg-[#0F172A] text-white">
      <div className="relative h-36 sm:h-48 overflow-hidden">
        {shop.banner_url ? (
          <img src={shop.banner_url} alt="" className="h-full w-full object-cover opacity-70" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-800 via-[#0F172A] to-emerald-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
      </div>

      <div className="relative mx-auto -mt-10 max-w-5xl px-4 pb-5">
        <div className="flex items-end gap-4">
          {shop.logo_url ? (
            <img
              src={shop.logo_url}
              alt={`${shop.name} logo`}
              className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-4 ring-[#0F172A] bg-white"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#16A34A] ring-4 ring-[#0F172A]">
              <FallbackIcon className="h-9 w-9 text-white" />
            </div>
          )}
          <div className="min-w-0 flex-1 pb-1">
            <h1 className="truncate text-xl sm:text-2xl font-bold leading-tight">{shop.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#16A34A]/15 px-2.5 py-1 font-medium text-emerald-300 ring-1 ring-emerald-400/30">
                <BadgeCheck className="h-3.5 w-3.5" /> WhatsApp Verified
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-medium text-slate-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EF4444] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EF4444]" />
                </span>
                Open now
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 font-medium text-slate-200">{shop.currency}</span>
            </div>
          </div>
        </div>
        {shop.description && <p className="mt-4 text-sm leading-relaxed text-slate-300">{shop.description}</p>}
      </div>
    </header>
  );
}
