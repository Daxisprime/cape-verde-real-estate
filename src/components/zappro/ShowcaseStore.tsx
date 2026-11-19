'use client';

import { useState } from 'react';
import { CalendarClock, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import Sheet from './Sheet';
import ProductImage from './ProductImage';
import {
  type ZapProduct, type ZapShop,
  buildInquiryMessage, buildWhatsAppUrl, formatPrice, openPendingTab, saveOrder, sendToWhatsApp,
} from '@/lib/zappro';

interface Props {
  shop: ZapShop;
  products: ZapProduct[];
  isDemo: boolean;
}

export default function ShowcaseStore({ shop, products, isDemo }: Props) {
  const [selected, setSelected] = useState<ZapProduct | null>(null);
  const [sentFor, setSentFor] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-5">
      {sentFor && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-900">Inquiry ready in WhatsApp</p>
            <p className="text-emerald-800/80">Tap send to reach {shop.name} about “{sentFor}”.</p>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <p className="rounded-2xl bg-white py-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">No listings available right now.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const specs = p.options.flatMap((o) => o.choices.map((c) => `${o.name}: ${c}`)).slice(0, 4);
            return (
              <article key={p.id} className="group flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <ProductImage src={p.image_url} alt={p.title} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
                  {p.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#0F172A]/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {p.category}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xl font-bold tabular-nums text-slate-900">{formatPrice(p.price, shop.currency)}</p>
                  <h3 className="mt-1 font-semibold leading-snug text-slate-800">{p.title}</h3>
                  {p.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{p.description}</p>}
                  {specs.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {specs.map((s) => (
                        <span key={s} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{s}</span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setSelected(p)}
                    className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] font-semibold text-white transition-all hover:bg-[#15803D] active:scale-[0.98]"
                  >
                    <CalendarClock className="h-5 w-5" /> Inquire / Book Viewing
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selected && (
        <InquiryModal
          shop={shop}
          product={selected}
          isDemo={isDemo}
          onClose={() => setSelected(null)}
          onSent={() => { setSentFor(selected.title); setSelected(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      )}
    </div>
  );
}

const inputClass =
  'w-full rounded-xl bg-white px-4 py-3 text-[15px] text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 outline-none transition-shadow focus:ring-2 focus:ring-[#16A34A]';

function InquiryModal({ shop, product, isDemo, onClose, onSent }: {
  shop: ZapShop; product: ZapProduct; isDemo: boolean; onClose: () => void; onSent: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const nameMissing = !name.trim();
  const phoneMissing = !phone.trim();

  async function handleSubmit() {
    setTouched(true);
    if (nameMissing || phoneMissing || submitting) return;
    setSubmitting(true);
    const tab = openPendingTab();

    const code = isDemo
      ? null
      : await saveOrder({
          shop_id: shop.id,
          order_type: 'inquiry',
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          items: [{ product_id: product.id, title: product.title, price: product.price }],
          subtotal: product.price,
          total: product.price,
          notes: message.trim() || null,
          status: 'new',
        });

    const text = buildInquiryMessage({
      shop, code, product, customerName: name.trim(), customerPhone: phone.trim(), message: message.trim(),
    });
    sendToWhatsApp(tab, buildWhatsAppUrl(shop.whatsapp_number, text));
    setSubmitting(false);
    onSent();
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title="Inquire / Book Viewing"
      footer={
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#16A34A] text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-[#15803D] active:scale-[0.98] disabled:opacity-70"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
          Send Inquiry on WhatsApp
        </button>
      }
    >
      <div className="space-y-5 px-5 py-5">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
          <ProductImage src={product.image_url} alt={product.title} className="h-16 w-16 shrink-0 rounded-xl" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{product.title}</p>
            <p className="text-sm font-bold tabular-nums text-[#16A34A]">{formatPrice(product.price, shop.currency)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Maria Silva"
              className={`${inputClass} ${touched && nameMissing ? 'ring-2 ring-[#EF4444]' : ''}`} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" placeholder="+238 ..."
              className={`${inputClass} ${touched && phoneMissing ? 'ring-2 ring-[#EF4444]' : ''}`} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Preferred viewing date/time or question</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
              placeholder="e.g. Saturday morning, or is the price negotiable?" className={`${inputClass} resize-none`} />
          </label>
        </div>

        {touched && (nameMissing || phoneMissing) && (
          <p className="text-sm font-medium text-[#EF4444]">Please add your name and phone so the seller can reach you.</p>
        )}
      </div>
    </Sheet>
  );
}
