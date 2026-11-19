'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Plus, ShoppingBag } from 'lucide-react';
import ProductImage from './ProductImage';
import OptionsSheet, { makeCartItem } from './OptionsSheet';
import CheckoutDrawer from './CheckoutDrawer';
import { type CartItem, type ZapProduct, type ZapShop, formatPrice } from '@/lib/zappro';

interface Props {
  shop: ZapShop;
  products: ZapProduct[];
  isDemo: boolean;
}

export default function RetailStore({ shop, products, isDemo }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState('All');
  const [configuring, setConfiguring] = useState<ZapProduct | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [pulse, setPulse] = useState(0);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter((c): c is string => !!c)));
    return cats.length > 1 ? ['All', ...cats] : [];
  }, [products]);

  const visible = category === 'All' ? products : products.filter((p) => p.category === category);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const qtyByProduct = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((i) => { map[i.productId] = (map[i.productId] ?? 0) + i.qty; });
    return map;
  }, [cart]);

  function addItem(item: CartItem) {
    setCart((c) => {
      const existing = c.find((i) => i.key === item.key);
      return existing ? c.map((i) => (i.key === item.key ? { ...i, qty: i.qty + item.qty } : i)) : [...c, item];
    });
    setConfiguring(null);
    setSent(false);
    setPulse((p) => p + 1);
  }

  function handleAdd(product: ZapProduct) {
    if (product.options.length > 0) setConfiguring(product);
    else addItem(makeCartItem(product, {}, 1));
  }

  const changeQty = (key: string, delta: number) =>
    setCart((c) => c.map((i) => (i.key === key ? { ...i, qty: Math.max(1, i.qty + delta) } : i)));
  const removeItem = (key: string) => setCart((c) => c.filter((i) => i.key !== key));

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 pb-36 pt-5">
        {sent && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-900">Order sent to WhatsApp</p>
              <p className="text-emerald-800/80">Tap send in WhatsApp to confirm your order with {shop.name}.</p>
            </div>
          </div>
        )}

        {categories.length > 0 && (
          <div className="sticky top-0 z-20 -mx-4 mb-4 flex gap-2 overflow-x-auto bg-[#F8FAFC]/95 px-4 py-3 backdrop-blur [scrollbar-width:none]">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium transition-all ${
                  category === c ? 'bg-[#0F172A] text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <p className="rounded-2xl bg-white py-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">
            No items available right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <article
                key={p.id}
                className="group flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200/70 shadow-sm transition-shadow hover:shadow-md sm:flex-col sm:p-0 sm:overflow-hidden"
              >
                <div className="relative shrink-0">
                  <ProductImage src={p.image_url} alt={p.title} className="h-28 w-28 rounded-xl sm:h-44 sm:w-full sm:rounded-none" />
                  {qtyByProduct[p.id] > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-xs font-bold text-white ring-2 ring-white sm:right-2 sm:top-2">
                      {qtyByProduct[p.id]}
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col sm:px-4 sm:pb-4">
                  <h3 className="font-semibold leading-snug text-slate-900">{p.title}</h3>
                  {p.description && <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate-500">{p.description}</p>}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                    <span className="font-bold tabular-nums text-slate-900">{formatPrice(p.price, shop.currency)}</span>
                    <button
                      onClick={() => handleAdd(p)}
                      className="flex h-10 items-center gap-1.5 rounded-xl bg-[#16A34A] px-4 text-sm font-semibold text-white transition-all hover:bg-[#15803D] active:scale-95"
                      aria-label={`Add ${p.title}`}
                    >
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  </div>
                  {p.options.length > 0 && <p className="mt-1.5 text-[11px] font-medium text-slate-400">Customisable</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/80 to-transparent pointer-events-none">
          <button
            key={pulse}
            onClick={() => setCheckoutOpen(true)}
            className="pointer-events-auto mx-auto flex h-16 w-full max-w-lg items-center justify-between rounded-2xl bg-[#0F172A] px-5 text-white shadow-2xl shadow-slate-900/30 transition-transform active:scale-[0.98] animate-in zoom-in-95 duration-200"
          >
            <span className="flex items-center gap-3">
              <span className="relative">
                <ShoppingBag className="h-6 w-6" />
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[11px] font-bold">
                  {itemCount}
                </span>
              </span>
              <span className="text-left leading-tight">
                <span className="block text-xs text-slate-400">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                <span className="block font-bold tabular-nums">{formatPrice(subtotal, shop.currency)}</span>
              </span>
            </span>
            <span className="rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold">View Cart</span>
          </button>
        </div>
      )}

      {configuring && (
        <OptionsSheet product={configuring} currency={shop.currency} onClose={() => setConfiguring(null)} onAdd={addItem} />
      )}

      <CheckoutDrawer
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        shop={shop}
        isDemo={isDemo}
        cart={cart}
        onChangeQty={changeQty}
        onRemove={removeItem}
        onComplete={() => {
          setCart([]);
          setCheckoutOpen(false);
          setSent(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </>
  );
}
