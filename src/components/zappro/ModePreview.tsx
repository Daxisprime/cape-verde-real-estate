'use client';

import { useState } from 'react';
import { BadgeCheck, Building2, CalendarClock, Plus, ShoppingBag } from 'lucide-react';

type Mode = 'retail' | 'showcase';

const retailItems = [
  { title: 'Smash Burger', price: '950 CVE', tint: 'from-amber-200 to-orange-300' },
  { title: 'Frango Grelhado', price: '850 CVE', tint: 'from-yellow-200 to-amber-300' },
  { title: 'Sumo de Papaia', price: '300 CVE', tint: 'from-orange-200 to-rose-300' },
];

const showcaseItems = [
  { title: 'T3 Ocean View — Palmarejo', price: '18 500 000 CVE', meta: '3 bed · 128 m²', tint: 'from-sky-200 to-cyan-300' },
  { title: 'Toyota Hilux 4x4 2022', price: '4 500 000 CVE', meta: 'Diesel · 38k km', tint: 'from-slate-300 to-slate-400' },
];

export default function ModePreview() {
  const [mode, setMode] = useState<Mode>('retail');

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex rounded-full bg-white/10 p-1 ring-1 ring-white/10" role="tablist" aria-label="Preview mode">
        {([
          { value: 'retail', label: 'Retail / Food', icon: ShoppingBag },
          { value: 'showcase', label: 'Showcase', icon: Building2 },
        ] as const).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all ${
              mode === value ? 'bg-white text-[#0F172A] shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="relative w-[290px] rounded-[2.75rem] bg-slate-950 p-3 shadow-2xl shadow-black/50 ring-1 ring-white/10">
        <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-slate-950" />
        <div className="relative h-[540px] overflow-hidden rounded-[2.25rem] bg-[#F8FAFC]">
          <div className="bg-[#0F172A] px-4 pb-4 pt-9 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#16A34A]">
                {mode === 'retail' ? <ShoppingBag className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-bold">{mode === 'retail' ? 'Sabor da Praia' : 'Praia Motors & Imóveis'}</p>
                <p className="flex items-center gap-1 text-[11px] text-emerald-300"><BadgeCheck className="h-3 w-3" /> WhatsApp Verified</p>
              </div>
            </div>
          </div>

          <div key={mode} className="space-y-2.5 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {mode === 'retail'
              ? retailItems.map((item) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-2xl bg-white p-2.5 ring-1 ring-slate-200/70">
                    <div className={`h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br ${item.tint}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs font-bold text-slate-700">{item.price}</p>
                    </div>
                    <span className="flex h-8 items-center gap-1 rounded-lg bg-[#16A34A] px-2.5 text-[11px] font-semibold text-white">
                      <Plus className="h-3 w-3" /> Add
                    </span>
                  </div>
                ))
              : showcaseItems.map((item) => (
                  <div key={item.title} className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70">
                    <div className={`h-24 bg-gradient-to-br ${item.tint}`} />
                    <div className="p-3">
                      <p className="text-sm font-bold text-slate-900">{item.price}</p>
                      <p className="truncate text-xs text-slate-600">{item.title}</p>
                      <p className="text-[11px] text-slate-400">{item.meta}</p>
                      <span className="mt-2 flex h-8 items-center justify-center gap-1 rounded-lg bg-[#16A34A] text-[11px] font-semibold text-white">
                        <CalendarClock className="h-3 w-3" /> Inquire / Book Viewing
                      </span>
                    </div>
                  </div>
                ))}
          </div>

          {mode === 'retail' && (
            <div className="absolute inset-x-3 bottom-4 flex h-12 items-center justify-between rounded-2xl bg-[#0F172A] px-4 text-white shadow-xl animate-in slide-in-from-bottom-4 duration-300">
              <span className="flex items-center gap-2 text-xs">
                <span className="relative">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-0.5 text-[9px] font-bold">3</span>
                </span>
                <span className="ml-1 font-bold">2 100 CVE</span>
              </span>
              <span className="rounded-lg bg-[#16A34A] px-3 py-1.5 text-[11px] font-semibold">View Cart</span>
            </div>
          )}
        </div>
      </div>

      <p className="mt-5 max-w-xs text-center text-sm text-slate-400">
        {mode === 'retail'
          ? 'Cart, options, delivery zones and payment — sent as one clean WhatsApp receipt.'
          : 'No cart. Every listing gets a one-tap inquiry that lands in your WhatsApp.'}
      </p>
    </div>
  );
}
