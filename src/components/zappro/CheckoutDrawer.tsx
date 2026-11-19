'use client';

import { useState, type ReactNode } from 'react';
import { Banknote, CreditCard, Loader2, MapPin, MessageCircle, Minus, Plus, Smartphone, Trash2 } from 'lucide-react';
import Sheet from './Sheet';
import {
  PAYMENT_METHODS, type CartItem, type PaymentMethod, type ZapShop,
  buildOrderMessage, buildWhatsAppUrl, formatPrice, openPendingTab, saveOrder, sendToWhatsApp,
} from '@/lib/zappro';

interface Props {
  open: boolean;
  onClose: () => void;
  shop: ZapShop;
  isDemo: boolean;
  cart: CartItem[];
  onChangeQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  onComplete: () => void;
}

const PAYMENT_ICONS: Record<PaymentMethod, ReactNode> = {
  Cash: <Banknote className="h-4 w-4" />,
  'Vinti4 / POS': <CreditCard className="h-4 w-4" />,
  'Bank Transfer / Mobile Money': <Smartphone className="h-4 w-4" />,
};

const inputClass =
  'w-full rounded-xl bg-white px-4 py-3 text-[15px] text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 outline-none transition-shadow focus:ring-2 focus:ring-[#16A34A]';

export default function CheckoutDrawer({ open, onClose, shop, isDemo, cart, onChangeQty, onRemove, onComplete }: Props) {
  const zones = shop.delivery_zones;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [zoneName, setZoneName] = useState<string | null>(zones.length === 1 ? zones[0].zone : null);
  const [landmark, setLandmark] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('Cash');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const zone = zones.find((z) => z.zone === zoneName) ?? null;
  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const deliveryFee = zone?.fee ?? 0;
  const total = subtotal + deliveryFee;

  const nameMissing = !name.trim();
  const zoneMissing = zones.length > 0 && !zone;
  const canSubmit = cart.length > 0 && !nameMissing && !zoneMissing;

  async function handleSubmit() {
    setTouched(true);
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const tab = openPendingTab();

    const code = isDemo
      ? null
      : await saveOrder({
          shop_id: shop.id,
          order_type: 'order',
          customer_name: name.trim(),
          customer_phone: phone.trim() || null,
          delivery_zone: zone?.zone ?? null,
          delivery_fee: deliveryFee,
          delivery_landmark: landmark.trim() || null,
          payment_method: payment,
          items: cart.map((i) => ({
            product_id: i.productId,
            title: i.title,
            qty: i.qty,
            options: i.selectedOptions.map((o) => ({ name: o.name, choice: o.choice })),
            unit_price: i.unitPrice,
          })),
          subtotal,
          total,
          status: 'new',
        });

    const message = buildOrderMessage({
      shop, code, items: cart, customerName: name.trim(), customerPhone: phone.trim(),
      zone, landmark: landmark.trim(), payment, subtotal, total,
    });
    sendToWhatsApp(tab, buildWhatsAppUrl(shop.whatsapp_number, message));
    setSubmitting(false);
    onComplete();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      title="Your order"
      footer={
        cart.length > 0 && (
          <div className="space-y-3">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal, shop.currency)}</dd>
              </div>
              {zones.length > 0 && (
                <div className="flex justify-between text-slate-500">
                  <dt>Delivery{zone ? ` · ${zone.zone}` : ''}</dt>
                  <dd className="tabular-nums">{zone ? (zone.fee ? formatPrice(zone.fee, shop.currency) : 'Free') : '—'}</dd>
                </div>
              )}
              <div className="flex justify-between pt-1 text-base font-bold text-slate-900">
                <dt>Total</dt><dd className="tabular-nums">{formatPrice(total, shop.currency)}</dd>
              </div>
            </dl>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#16A34A] text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-[#15803D] active:scale-[0.98] disabled:opacity-70"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
              Complete Order on WhatsApp
            </button>
            {touched && !canSubmit && (
              <p className="text-center text-xs font-medium text-[#EF4444]">
                Please add your name{zoneMissing ? ' and choose a delivery zone' : ''}.
              </p>
            )}
          </div>
        )
      }
    >
      {cart.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <p className="font-medium text-slate-900">Your cart is empty</p>
          <p className="mt-1 text-sm text-slate-500">Add something tasty to get started.</p>
        </div>
      ) : (
        <div className="space-y-7 px-5 py-5">
          <ul className="divide-y divide-slate-100">
            {cart.map((item) => (
              <li key={item.key} className="flex items-start gap-3 py-3 first:pt-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  {item.selectedOptions.length > 0 && (
                    <p className="mt-0.5 text-xs text-slate-500">{item.selectedOptions.map((o) => o.choice).join(' · ')}</p>
                  )}
                  <p className="mt-1 text-sm font-medium tabular-nums text-slate-700">{formatPrice(item.unitPrice * item.qty, shop.currency)}</p>
                </div>
                <div className="flex items-center rounded-full bg-slate-100">
                  <button
                    onClick={() => (item.qty === 1 ? onRemove(item.key) : onChangeQty(item.key, -1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200"
                    aria-label={item.qty === 1 ? `Remove ${item.title}` : `Decrease ${item.title}`}
                  >
                    {item.qty === 1 ? <Trash2 className="h-4 w-4 text-[#EF4444]" /> : <Minus className="h-4 w-4" />}
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.qty}</span>
                  <button
                    onClick={() => onChangeQty(item.key, 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200"
                    aria-label={`Increase ${item.title}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <Section title="Your details">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" autoComplete="name"
              className={`${inputClass} ${touched && nameMissing ? 'ring-2 ring-[#EF4444]' : ''}`} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" type="tel" autoComplete="tel" className={inputClass} />
          </Section>

          {zones.length > 0 && (
            <Section title="Delivery zone" hint={touched && zoneMissing ? 'Required' : undefined}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {zones.map((z) => {
                  const selected = zoneName === z.zone;
                  return (
                    <button
                      key={z.zone}
                      onClick={() => setZoneName(z.zone)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm ring-1 transition-all ${
                        selected ? 'bg-[#0F172A] text-white ring-[#0F172A]' : 'bg-white text-slate-800 ring-slate-200 hover:ring-slate-300'
                      }`}
                      aria-pressed={selected}
                    >
                      <span className="flex items-center gap-2 font-medium"><MapPin className="h-4 w-4 opacity-60" />{z.zone}</span>
                      <span className={`tabular-nums ${selected ? 'text-emerald-300' : 'text-slate-500'}`}>
                        {z.fee ? `+${formatPrice(z.fee, shop.currency)}` : 'Free'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          <Section title="Landmark / address">
            <textarea value={landmark} onChange={(e) => setLandmark(e.target.value)} rows={2}
              placeholder="e.g. Near Padaria Vitória, blue gate" className={`${inputClass} resize-none`} />
          </Section>

          <Section title="Payment method">
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => {
                const selected = payment === m;
                return (
                  <button
                    key={m}
                    onClick={() => setPayment(m)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ring-1 transition-all ${
                      selected ? 'bg-emerald-50 text-slate-900 ring-2 ring-[#16A34A]' : 'bg-white text-slate-700 ring-slate-200 hover:ring-slate-300'
                    }`}
                    aria-pressed={selected}
                  >
                    <span className={selected ? 'text-[#16A34A]' : 'text-slate-400'}>{PAYMENT_ICONS[m]}</span>
                    {m}
                  </button>
                );
              })}
            </div>
          </Section>
        </div>
      )}
    </Sheet>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
        {hint && <span className="normal-case tracking-normal text-[#EF4444]">{hint}</span>}
      </h3>
      {children}
    </section>
  );
}
