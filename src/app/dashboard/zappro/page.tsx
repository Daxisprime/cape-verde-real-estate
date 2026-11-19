'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ShoppingBag, Car, ArrowRight, Loader2 } from 'lucide-react';
import { zapproClient } from '@/lib/zappro';

export default function ZapProDashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const client = zapproClient();
    if (!client) { setReady(true); return; }
    client.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login');
      else setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="bg-[#0F172A] text-white">
        <div className="mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
          <Link href="/zappro" className="flex items-center gap-2 font-bold">ZapPro</Link>
          <button
            onClick={async () => { const c = zapproClient(); await c?.auth.signOut(); router.replace('/login'); }}
            className="text-sm text-slate-300 hover:text-white"
          >Sign out</button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">Welcome to your dashboard</h1>
        <p className="mt-2 text-slate-500">Your ZapPro merchant workspace. Store builder, orders, and analytics come next.</p>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <Link href="/s/demo-retail" className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#16A34A] text-white"><ShoppingBag className="h-5 w-5" /></div>
            <h2 className="mt-4 font-bold">Retail Demo Store</h2>
            <p className="mt-1 text-sm text-slate-500">See the food/retail cart experience your customers get.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#16A34A]">Open <ArrowRight className="h-4 w-4" /></span>
          </Link>
          <Link href="/s/demo-showcase" className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EF4444] text-white"><Car className="h-5 w-5" /></div>
            <h2 className="mt-4 font-bold">Showcase Demo Store</h2>
            <p className="mt-1 text-sm text-slate-500">See the high-ticket inquiry experience for cars and real estate.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#16A34A]">Open <ArrowRight className="h-4 w-4" /></span>
          </Link>
        </div>
      </main>
    </div>
  );
}
