'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Building2, RotateCw, ShoppingBag, Store, Zap } from 'lucide-react';
import StoreHeader from '@/components/zappro/StoreHeader';
import RetailStore from '@/components/zappro/RetailStore';
import ShowcaseStore from '@/components/zappro/ShowcaseStore';
import {
  type StoreType, type ZapProduct, type ZapShop,
  isProductActive, parseProduct, parseShop, zapproClient,
} from '@/lib/zappro';
import { DEMO_SLUG, getDemoStore } from '@/data/zappro-demo';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; shop: ZapShop; products: ZapProduct[]; isDemo: boolean }
  | { status: 'not-found' }
  | { status: 'error' };

async function loadStore(slug: string): Promise<{ shop: ZapShop; products: ZapProduct[] } | null> {
  const db = zapproClient();
  if (!db) throw new Error('Database is not configured');

  const { data: shopRow, error: shopErr } = await db.from('zappro_shops').select('*').eq('slug', slug).maybeSingle();
  if (shopErr) throw shopErr;
  if (!shopRow) return null;

  const shop = parseShop(shopRow as Record<string, unknown>);
  const { data: rows, error: prodErr } = await db.from('zappro_products').select('*').eq('shop_id', shop.id);
  if (prodErr) throw prodErr;

  const products = ((rows ?? []) as Record<string, unknown>[]).filter(isProductActive).map(parseProduct);
  return { shop, products };
}

export default function StorefrontClient({ slug }: { slug: string }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [demoMode, setDemoMode] = useState<StoreType>('retail');

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const store = await loadStore(slug);
      if (store) setState({ status: 'ready', ...store, isDemo: false });
      else setState(slug === DEMO_SLUG ? { status: 'ready', ...getDemoStore('retail'), isDemo: true } : { status: 'not-found' });
    } catch (err) {
      console.error('ZapPro: could not load store', err);
      setState(slug === DEMO_SLUG ? { status: 'ready', ...getDemoStore('retail'), isDemo: true } : { status: 'error' });
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  if (state.status === 'loading') return <StorefrontSkeleton />;
  if (state.status === 'not-found') return <StoreMessage title="Store not found" body="This storefront link doesn't exist or has been taken down." />;
  if (state.status === 'error') {
    return (
      <StoreMessage title="We couldn't load this store" body="Check your connection and try again." error>
        <button onClick={load} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#0F172A] px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
          <RotateCw className="h-4 w-4" /> Try again
        </button>
      </StoreMessage>
    );
  }

  const { shop, products } = state.isDemo ? getDemoStore(demoMode) : state;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {state.isDemo && <DemoBar mode={demoMode} onChange={setDemoMode} />}
      <StoreHeader shop={shop} />
      {shop.store_type === 'showcase' ? (
        <ShowcaseStore key={shop.id} shop={shop} products={products} isDemo={state.isDemo} />
      ) : (
        <RetailStore key={shop.id} shop={shop} products={products} isDemo={state.isDemo} />
      )}
      <PoweredBy />
    </div>
  );
}

function DemoBar({ mode, onChange }: { mode: StoreType; onChange: (m: StoreType) => void }) {
  const options: { value: StoreType; label: string; icon: typeof Store }[] = [
    { value: 'retail', label: 'Retail / Food', icon: ShoppingBag },
    { value: 'showcase', label: 'Showcase', icon: Building2 },
  ];
  return (
    <div className="relative z-30 border-b border-white/10 bg-[#0F172A]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-semibold text-white">
          <span className="rounded bg-[#EF4444] px-1.5 py-0.5 text-[10px] tracking-wider">DEMO</span>
          <span className="hidden sm:inline text-slate-300">Switch store mode</span>
        </span>
        <div className="flex rounded-full bg-white/10 p-1" role="tablist" aria-label="Store mode">
          {options.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              role="tab"
              aria-selected={mode === value}
              onClick={() => { onChange(value); window.scrollTo({ top: 0 }); }}
              className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all ${
                mode === value ? 'bg-white text-[#0F172A] shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PoweredBy() {
  return (
    <footer className="pb-28 pt-4 text-center">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600">
        <Zap className="h-3.5 w-3.5 text-[#16A34A]" /> Storefront powered by ZapPro
      </Link>
    </footer>
  );
}

function StoreMessage({ title, body, error, children }: { title: string; body: string; error?: boolean; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center">
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${error ? 'bg-red-50 text-[#EF4444]' : 'bg-slate-100 text-slate-500'}`}>
        {error ? <AlertTriangle className="h-7 w-7" /> : <Store className="h-7 w-7" />}
      </div>
      <h1 className="mt-5 text-xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{body}</p>
      {children}
      <Link href="/" className="mt-8 text-sm font-medium text-[#16A34A] hover:underline">Create your own store with ZapPro</Link>
    </div>
  );
}

function StorefrontSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#F8FAFC]" aria-busy="true" aria-label="Loading store">
      <div className="bg-[#0F172A]">
        <div className="h-36 sm:h-48 bg-slate-800" />
        <div className="mx-auto -mt-10 flex max-w-5xl items-end gap-4 px-4 pb-6">
          <div className="h-20 w-20 rounded-2xl bg-slate-700 ring-4 ring-[#0F172A]" />
          <div className="flex-1 space-y-2 pb-1">
            <div className="h-5 w-40 rounded bg-slate-700" />
            <div className="h-4 w-56 rounded bg-slate-800" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <div className="mb-5 flex gap-2">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-9 w-20 rounded-full bg-slate-200" />)}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200/70">
              <div className="h-28 w-28 shrink-0 rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
                <div className="mt-4 h-9 w-20 rounded-xl bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
