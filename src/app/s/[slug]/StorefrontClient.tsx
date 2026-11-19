'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Search, ShoppingBag, Plus, Minus, X, Trash2, Check, MapPin, CreditCard,
  MessageCircle, Car, Home as HomeIcon, Phone, User, Calendar, ChevronRight,
  ShieldCheck, Loader2,
} from 'lucide-react';
import {
  ZapShop, ZapProduct, ZapOrderInsert, RetailOption, ShowcaseSpec,
  CartItem, formatPrice, buildWhatsAppUrl, orderCodeFromId,
  zapproClient,
} from '@/lib/zappro';

interface Props {
  shop: ZapShop;
  products: ZapProduct[];
  isDemo: boolean;
}

type PaymentMethod = 'Cash' | 'Vinti4 / POS' | 'Bank Transfer';

export default function StorefrontClient({ shop, products, isDemo }: Props) {
  if (shop.store_type === 'showcase') {
    return <ShowcaseMode shop={shop} products={products} isDemo={isDemo} />;
  }
  return <RetailMode shop={shop} products={products} isDemo={isDemo} />;
}

/* ============================================================
   RETAIL / FOOD MODE
   ============================================================ */

function RetailMode({ shop, products, isDemo }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string>('All');
  const [optionProduct, setOptionProduct] = useState<ZapProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
    return ['All', ...cats];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCat === 'All' || p.category === activeCat;
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, activeCat, search]);

  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.lineTotal, 0);

  const addToCartSimple = useCallback((p: ZapProduct) => {
    const opts = (p.options || []) as RetailOption[];
    if (opts.length > 0) {
      setOptionProduct(p);
      return;
    }
    setCart((c) => {
      const existing = c.find((i) => i.productId === p.id && i.selectedOptions.length === 0);
      if (existing) {
        return c.map((i) => i.productId === p.id && i.selectedOptions.length === 0
          ? { ...i, qty: i.qty + 1, lineTotal: (i.qty + 1) * i.unitPrice }
          : i);
      }
      return [...c, {
        productId: p.id, title: p.title, basePrice: p.price, qty: 1,
        selectedOptions: [], unitPrice: p.price, lineTotal: p.price,
      }];
    });
  }, []);

  const addConfiguredItem = (item: CartItem) => {
    setCart((c) => [...c, item]);
    setOptionProduct(null);
  };

  const updateQty = (idx: number, delta: number) => {
    setCart((c) => c.map((it, i) => {
      if (i !== idx) return it;
      const qty = Math.max(1, it.qty + delta);
      return { ...it, qty, lineTotal: qty * it.unitPrice };
    }));
  };

  const removeItem = (idx: number) => setCart((c) => c.filter((_, i) => i !== idx));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32">
      <RetailHeader shop={shop} isDemo={isDemo} />
      <div className="mx-auto max-w-3xl px-4">
        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-[#16A34A] outline-none text-sm"
          />
        </div>
        {/* Category pills */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCat === c ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {/* Product grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} currency={shop.currency} onAdd={() => addToCartSimple(p)} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 py-16 text-sm">No items match your search.</p>
        )}
      </div>

      {/* Sticky cart bar */}
      {itemCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-md flex items-center justify-between px-5 py-3.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold shadow-xl shadow-emerald-500/30 transition-colors"
        >
          <span className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> View Cart • {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          <span>{formatPrice(subtotal, shop.currency)}</span>
        </button>
      )}

      {/* Options modal */}
      {optionProduct && (
        <OptionsModal
          product={optionProduct}
          currency={shop.currency}
          onClose={() => setOptionProduct(null)}
          onConfirm={addConfiguredItem}
        />
      )}

      {/* Checkout drawer */}
      <CheckoutDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        shop={shop}
        isDemo={isDemo}
        onUpdateQty={updateQty}
        onRemove={removeItem}
      />
    </div>
  );
}

function RetailHeader({ shop, isDemo }: { shop: ZapShop; isDemo: boolean }) {
  return (
    <header className="bg-[#0F172A] text-white">
      {shop.banner_url && (
        <div className="h-28 sm:h-36 w-full bg-cover bg-center" style={{ backgroundImage: `url(${shop.banner_url})` }} />
      )}
      <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-3">
        {shop.logo_url ? (
          <img src={shop.logo_url} alt={shop.name} className="h-12 w-12 rounded-xl object-cover ring-2 ring-white/20" />
        ) : (
          <div className="h-12 w-12 rounded-xl bg-[#16A34A] flex items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{shop.name}</h1>
          <div className="flex items-center gap-1.5 text-xs text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" /> WhatsApp Orders
            {isDemo && <span className="ml-2 rounded bg-[#EF4444] px-1.5 py-0.5 text-white font-semibold">DEMO</span>}
          </div>
        </div>
      </div>
    </header>
  );
}

function ProductCard({ product, currency, onAdd }: { product: ZapProduct; currency: string; onAdd: () => void }) {
  const hasOptions = ((product.options || []) as RetailOption[]).length > 0;
  return (
    <div className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-100 shadow-sm">
      {product.image_url && (
        <img src={product.image_url} alt={product.title} className="h-20 w-20 rounded-xl object-cover shrink-0" />
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <h3 className="font-semibold text-sm leading-tight">{product.title}</h3>
        {product.description && <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{product.description}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-sm">{formatPrice(product.price, currency)}</span>
          <button
            onClick={onAdd}
            className="flex items-center gap-1 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-3 py-1.5 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> {hasOptions ? 'Add' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

function OptionsModal({
  product, currency, onClose, onConfirm,
}: {
  product: ZapProduct;
  currency: string;
  onClose: () => void;
  onConfirm: (item: CartItem) => void;
}) {
  const opts = (product.options || []) as RetailOption[];
  const [choices, setChoices] = useState<Record<string, RetailOption['choices'][0]>>({});
  const [qty, setQty] = useState(1);

  const unitPrice = useMemo(() => {
    return product.price + Object.values(choices).reduce((s, c) => s + (c?.price_delta || 0), 0);
  }, [product.price, choices]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base">{product.title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-5 py-4 space-y-5">
          {product.image_url && <img src={product.image_url} alt="" className="w-full h-40 rounded-xl object-cover" />}
          {opts.map((opt) => (
            <div key={opt.name}>
              <p className="text-sm font-semibold mb-2">{opt.name}</p>
              <div className="flex flex-wrap gap-2">
                {opt.choices.map((ch) => {
                  const selected = choices[opt.name]?.label === ch.label;
                  return (
                    <button
                      key={ch.label}
                      onClick={() => setChoices((c) => ({ ...c, [opt.name]: ch }))}
                      className={`px-3 py-1.5 rounded-lg text-sm ring-1 transition-colors ${
                        selected ? 'bg-[#0F172A] text-white ring-[#0F172A]' : 'bg-white text-slate-700 ring-slate-200'
                      }`}
                    >
                      {ch.label}
                      {ch.price_delta > 0 && <span className="ml-1 opacity-70">+{formatPrice(ch.price_delta, currency)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Quantity</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-1.5 rounded-lg ring-1 ring-slate-200"><Minus className="h-4 w-4" /></button>
              <span className="font-semibold w-6 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-1.5 rounded-lg ring-1 ring-slate-200"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white px-5 py-3 border-t border-slate-100 flex items-center gap-3">
          <span className="font-bold">{formatPrice(unitPrice * qty, currency)}</span>
          <button
            onClick={() => onConfirm({
              productId: product.id,
              title: product.title,
              basePrice: product.price,
              qty,
              selectedOptions: Object.entries(choices).map(([name, c]) => ({ name, choice: c.label, priceDelta: c.price_delta })),
              unitPrice,
              lineTotal: unitPrice * qty,
            })}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-sm transition-colors"
          >
            <Plus className="h-4 w-4" /> Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutDrawer({
  open, onClose, cart, shop, isDemo, onUpdateQty, onRemove,
}: {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  shop: ZapShop;
  isDemo: boolean;
  onUpdateQty: (idx: number, delta: number) => void;
  onRemove: (idx: number) => void;
}) {
  const zones = shop.delivery_zones || [];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [landmark, setLandmark] = useState('');
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cart.reduce((s, i) => s + i.lineTotal, 0);
  const selectedZone = zones.find((z) => z.id === zoneId) || null;
  const deliveryFee = selectedZone?.fee || 0;
  const total = subtotal + deliveryFee;

  const canSubmit = name.trim() && cart.length > 0 && (zones.length === 0 || selectedZone) && payment;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      let orderCode = 'DEMO00';
      if (!isDemo) {
        const client = zapproClient();
        if (!client) throw new Error('Database not configured.');
        const insert: ZapOrderInsert = {
          shop_id: shop.id,
          order_type: 'order',
          customer_name: name.trim(),
          customer_phone: phone.trim() || null,
          delivery_zone: selectedZone?.name || null,
          delivery_fee: deliveryFee,
          delivery_landmark: landmark.trim() || null,
          payment_method: payment || null,
          items: cart.map((i) => ({
            title: i.title,
            qty: i.qty,
            options: i.selectedOptions.map((o) => `${o.name}: ${o.choice}`),
            unit_price: i.unitPrice,
            line_total: i.lineTotal,
          })),
          subtotal,
          total,
          notes: notes.trim() || null,
          status: 'new',
        };
        const { data, error: insErr } = await client.from('zappro_orders').insert(insert as never).select('id').single() as { data: { id: string } | null; error: { message?: string } | null };
        if (insErr || !data) throw new Error(insErr?.message || 'Could not save order.');
        orderCode = orderCodeFromId(data.id);
      } else {
        orderCode = '[DEMO] ' + Math.random().toString(36).slice(2, 8).toUpperCase();
      }

      const lines = cart.map((i) => {
        const optStr = i.selectedOptions.length ? ` (+${i.selectedOptions.map((o) => o.choice).join(', ')})` : '';
        return `• ${i.qty}x ${i.title}${optStr} — ${formatPrice(i.lineTotal, shop.currency)}`;
      }).join('\n');

      const msg =
        `*${isDemo ? '[DEMO] ' : ''}NEW ORDER #${orderCode} — ${shop.name}*\n\n` +
        `*Items:*\n${lines}\n\n` +
        `*Subtotal:* ${formatPrice(subtotal, shop.currency)}\n` +
        (selectedZone ? `*Delivery (${selectedZone.name}):* ${formatPrice(deliveryFee, shop.currency)}\n` : '') +
        `*TOTAL: ${formatPrice(total, shop.currency)}*\n\n` +
        `*Customer:* ${name.trim()}\n` +
        (landmark ? `*Landmark:* ${landmark.trim()}\n` : '') +
        (payment ? `*Payment:* ${payment}\n` : '') +
        (notes ? `*Notes:* ${notes.trim()}\n` : '') +
        `\n⚡ _Storefront powered by ZapPro_`;

      window.open(buildWhatsAppUrl(shop.whatsapp_number, msg), '_blank');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="font-bold">Your Order</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Cart items */}
          {cart.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">Your cart is empty.</p>}
          {cart.map((it, idx) => (
            <div key={idx} className="flex items-start gap-3 pb-3 border-b border-slate-50">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{it.title}</p>
                {it.selectedOptions.length > 0 && (
                  <p className="text-xs text-slate-500">{it.selectedOptions.map((o) => `${o.name}: ${o.choice}`).join(' • ')}</p>
                )}
                <p className="text-xs text-slate-400 mt-0.5">{formatPrice(it.unitPrice, shop.currency)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onUpdateQty(idx, -1)} className="p-1 rounded ring-1 ring-slate-200"><Minus className="h-3.5 w-3.5" /></button>
                <span className="w-5 text-center text-sm font-medium">{it.qty}</span>
                <button onClick={() => onUpdateQty(idx, 1)} className="p-1 rounded ring-1 ring-slate-200"><Plus className="h-3.5 w-3.5" /></button>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{formatPrice(it.lineTotal, shop.currency)}</p>
                <button onClick={() => onRemove(idx)} className="text-xs text-rose-500 mt-1 inline-flex items-center gap-0.5"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}

          {cart.length > 0 && (
            <>
              {/* Customer info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700">Customer details</h4>
                <Field icon={<User className="h-4 w-4" />}>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name *" className="w-full bg-transparent outline-none text-sm" />
                </Field>
                <Field icon={<Phone className="h-4 w-4" />}>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="w-full bg-transparent outline-none text-sm" />
                </Field>
              </div>

              {/* Delivery zone */}
              {zones.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Delivery zone</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {zones.map((z) => (
                      <button
                        key={z.id}
                        onClick={() => setZoneId(z.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ring-1 transition-colors ${
                          zoneId === z.id ? 'bg-[#0F172A] text-white ring-[#0F172A]' : 'bg-white ring-slate-200'
                        }`}
                      >
                        <span>{z.name}</span>
                        <span className={zoneId === z.id ? 'text-emerald-300' : 'text-slate-400'}>+{formatPrice(z.fee, shop.currency)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Landmark */}
              <Field icon={<MapPin className="h-4 w-4" />}>
                <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Landmark / street note (e.g. near Padaria, blue gate)" className="w-full bg-transparent outline-none text-sm" />
              </Field>

              {/* Payment */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><CreditCard className="h-4 w-4" /> Payment method</h4>
                <div className="flex flex-wrap gap-2">
                  {(['Cash', 'Vinti4 / POS', 'Bank Transfer'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayment(m)}
                      className={`px-3 py-1.5 rounded-lg text-sm ring-1 transition-colors ${
                        payment === m ? 'bg-[#16A34A] text-white ring-[#16A34A]' : 'bg-white ring-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Order notes (optional)"
                rows={2}
                className="w-full rounded-lg bg-white ring-1 ring-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#16A34A]"
              />
            </>
          )}
        </div>

        {/* Footer summary + CTA */}
        {cart.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-3 space-y-2 bg-white">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span><span>{formatPrice(subtotal, shop.currency)}</span>
            </div>
            {selectedZone && (
              <div className="flex justify-between text-sm text-slate-500">
                <span>Delivery ({selectedZone.name})</span><span>{formatPrice(deliveryFee, shop.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total</span><span>{formatPrice(total, shop.currency)}</span>
            </div>
            {error && <p className="text-xs text-rose-500">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
              Complete Order on WhatsApp
            </button>
            {!canSubmit && <p className="text-xs text-slate-400 text-center">Fill in name{zones.length ? ', zone' : ''} and payment to continue.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-white ring-1 ring-slate-200 px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#16A34A]">
      <span className="text-slate-400 shrink-0">{icon}</span>
      {children}
    </div>
  );
}

/* ============================================================
   SHOWCASE MODE
   ============================================================ */

function ShowcaseMode({ shop, products, isDemo }: Props) {
  const [selected, setSelected] = useState<ZapProduct | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <ShowcaseHeader shop={shop} isDemo={isDemo} />
      <div className="mx-auto max-w-5xl px-4 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <ShowcaseCard key={p.id} product={p} currency={shop.currency} onClick={() => setSelected(p)} />
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-center text-slate-400 py-20 text-sm">No listings available.</p>
        )}
      </div>

      {selected && (
        <ShowcaseDetailModal
          product={selected}
          shop={shop}
          isDemo={isDemo}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function ShowcaseHeader({ shop, isDemo }: { shop: ZapShop; isDemo: boolean }) {
  return (
    <header className="bg-[#0F172A] text-white">
      {shop.banner_url && (
        <div className="h-36 sm:h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${shop.banner_url})` }} />
      )}
      <div className="mx-auto max-w-5xl px-4 py-5 flex items-center gap-3">
        {shop.logo_url ? (
          <img src={shop.logo_url} alt={shop.name} className="h-14 w-14 rounded-xl object-cover ring-2 ring-white/20" />
        ) : (
          <div className="h-14 w-14 rounded-xl bg-[#EF4444] flex items-center justify-center">
            <Car className="h-7 w-7 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{shop.name}</h1>
          <div className="flex items-center gap-1.5 text-xs text-rose-300 mt-0.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified Showcase
            {isDemo && <span className="ml-2 rounded bg-[#EF4444] px-1.5 py-0.5 text-white font-semibold">DEMO</span>}
          </div>
        </div>
      </div>
    </header>
  );
}

function ShowcaseCard({ product, currency, onClick }: { product: ZapProduct; currency: string; onClick: () => void }) {
  const specs = (product.options || []) as ShowcaseSpec[];
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-2xl bg-white overflow-hidden ring-1 ring-slate-100 shadow-sm hover:shadow-md transition-all"
    >
      {product.image_url && (
        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
          <img src={product.image_url} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-4">
        {product.category && <span className="text-xs font-semibold text-[#EF4444]">{product.category}</span>}
        <h3 className="mt-1 font-bold text-base leading-tight line-clamp-1">{product.title}</h3>
        {specs.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {specs.slice(0, 3).map((s) => (
              <span key={s.label} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {s.value}
              </span>
            ))}
          </div>
        )}
        <p className="mt-3 font-bold text-lg">{formatPrice(product.price, currency)}</p>
        <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A] group-hover:gap-2 transition-all">
          View details <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </button>
  );
}

function ShowcaseDetailModal({
  product, shop, isDemo, onClose,
}: { product: ZapProduct; shop: ZapShop; isDemo: boolean; onClose: () => void }) {
  const specs = (product.options || []) as ShowcaseSpec[];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [when, setWhen] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !!name.trim();

  async function handleInquire() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      let orderCode = 'DEMO00';
      if (!isDemo) {
        const client = zapproClient();
        if (!client) throw new Error('Database not configured.');
        const insert: ZapOrderInsert = {
          shop_id: shop.id,
          order_type: 'inquiry',
          customer_name: name.trim(),
          customer_phone: phone.trim() || null,
          delivery_zone: null,
          delivery_fee: 0,
          delivery_landmark: null,
          payment_method: null,
          items: [{ title: product.title, product_id: product.id }],
          subtotal: product.price,
          total: product.price,
          notes: when.trim() || null,
          status: 'new',
        };
        const { data, error: insErr } = await client.from('zappro_orders').insert(insert as never).select('id').single() as { data: { id: string } | null; error: { message?: string } | null };
        if (insErr || !data) throw new Error(insErr?.message || 'Could not save inquiry.');
        orderCode = orderCodeFromId(data.id);
      } else {
        orderCode = '[DEMO] ' + Math.random().toString(36).slice(2, 8).toUpperCase();
      }

      const msg =
        `*${isDemo ? '[DEMO] ' : ''}INQUIRY #${orderCode} — ${shop.name}*\n\n` +
        `*Item:* ${product.title}\n` +
        `*Price:* ${formatPrice(product.price, shop.currency)}\n\n` +
        `*Customer:* ${name.trim()}\n` +
        (phone ? `*Phone:* ${phone.trim()}\n` : '') +
        (when ? `*Preferred date/time / question:* ${when.trim()}\n` : '') +
        `\n⚡ _Storefront powered by ZapPro_`;

      window.open(buildWhatsAppUrl(shop.whatsapp_number, msg), '_blank');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {product.image_url && <img src={product.image_url} alt={product.title} className="w-full h-56 object-cover sm:rounded-t-3xl" />}
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {product.category && <span className="text-xs font-semibold text-[#EF4444]">{product.category}</span>}
          <h2 className="text-xl font-bold leading-tight">{product.title}</h2>
          <p className="text-lg font-bold">{formatPrice(product.price, shop.currency)}</p>
          {product.description && <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>}

          {specs.length > 0 && (
            <div className="rounded-xl bg-slate-50 p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Specifications</h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {specs.map((s) => (
                  <div key={s.label}>
                    <dt className="text-xs text-slate-400">{s.label}</dt>
                    <dd className="text-sm font-semibold text-slate-800">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Inquiry form */}
          <div className="space-y-3 pt-1">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Inquire / Book viewing
            </h4>
            <div className="rounded-lg ring-1 ring-slate-200 px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#16A34A]">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" className="w-full bg-transparent outline-none text-sm" />
            </div>
            <div className="rounded-lg ring-1 ring-slate-200 px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#16A34A]">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="w-full bg-transparent outline-none text-sm" />
            </div>
            <div className="rounded-lg ring-1 ring-slate-200 px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#16A34A]">
              <input value={when} onChange={(e) => setWhen(e.target.value)} placeholder="Preferred date/time or question" className="w-full bg-transparent outline-none text-sm" />
            </div>

            {error && <p className="text-xs text-rose-500">{error}</p>}

            <button
              onClick={handleInquire}
              disabled={!canSubmit || submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
              Inquire / Book Viewing on WhatsApp
            </button>
            {!canSubmit && <p className="text-xs text-slate-400 text-center">Enter your name to continue.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
