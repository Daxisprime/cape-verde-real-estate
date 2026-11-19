'use client';

import { useMemo, useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import Sheet from './Sheet';
import ProductImage from './ProductImage';
import { type CartItem, type ZapProduct, choiceLabel, choicePriceDelta, formatPrice } from '@/lib/zappro';

interface Props {
  product: ZapProduct;
  currency: string;
  onClose: () => void;
  onAdd: (item: CartItem) => void;
}

export function makeCartItem(product: ZapProduct, picks: Record<string, string>, qty: number): CartItem {
  const selectedOptions = product.options
    .filter((o) => picks[o.name])
    .map((o) => ({ name: o.name, choice: choiceLabel(picks[o.name]), priceDelta: choicePriceDelta(picks[o.name]) }));
  const unitPrice = product.price + selectedOptions.reduce((s, o) => s + o.priceDelta, 0);
  const key = [product.id, ...selectedOptions.map((o) => `${o.name}=${o.choice}`)].join('|');
  return { key, productId: product.id, title: product.title, qty, selectedOptions, unitPrice };
}

export default function OptionsSheet({ product, currency, onClose, onAdd }: Props) {
  const [picks, setPicks] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((o) => [o.name, o.choices[0]])),
  );
  const [qty, setQty] = useState(1);
  const item = useMemo(() => makeCartItem(product, picks, qty), [product, picks, qty]);

  return (
    <Sheet
      open
      onClose={onClose}
      title={product.title}
      footer={
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl ring-1 ring-slate-200">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-12 w-11 items-center justify-center text-slate-600 disabled:opacity-40"
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center font-semibold tabular-nums">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="flex h-12 w-11 items-center justify-center text-slate-600" aria-label="Increase quantity">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => onAdd(item)}
            className="flex h-12 flex-1 items-center justify-between rounded-xl bg-[#16A34A] px-5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-[#15803D] active:scale-[0.98]"
          >
            <span>Add to cart</span>
            <span className="tabular-nums">{formatPrice(item.unitPrice * qty, currency)}</span>
          </button>
        </div>
      }
    >
      <ProductImage src={product.image_url} alt={product.title} className="h-48 w-full" />
      <div className="space-y-6 px-5 py-5">
        {product.description && <p className="text-sm leading-relaxed text-slate-600">{product.description}</p>}
        {product.options.map((opt) => (
          <fieldset key={opt.name}>
            <legend className="mb-3 flex w-full items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">{opt.name}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">Pick 1</span>
            </legend>
            <div className="space-y-2">
              {opt.choices.map((choice) => {
                const selected = picks[opt.name] === choice;
                const delta = choicePriceDelta(choice);
                return (
                  <button
                    key={choice}
                    onClick={() => setPicks((p) => ({ ...p, [opt.name]: choice }))}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm ring-1 transition-all ${
                      selected ? 'bg-emerald-50 ring-2 ring-[#16A34A]' : 'bg-white ring-slate-200 hover:ring-slate-300'
                    }`}
                    aria-pressed={selected}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        selected ? 'border-[#16A34A] bg-[#16A34A]' : 'border-slate-300'
                      }`}
                    >
                      {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className="flex-1 font-medium text-slate-800">{choiceLabel(choice)}</span>
                    {delta > 0 && <span className="text-slate-500 tabular-nums">+{formatPrice(delta, currency)}</span>}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </Sheet>
  );
}
