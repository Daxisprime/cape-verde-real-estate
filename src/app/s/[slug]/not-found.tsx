import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function StorefrontNotFound() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="h-14 w-14 rounded-2xl bg-[#16A34A] flex items-center justify-center mb-5">
        <Zap className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-bold">Store not found</h1>
      <p className="mt-2 text-slate-400 max-w-sm">This storefront link doesn't exist or has been unpublished.</p>
      <Link href="/zappro" className="mt-6 px-5 py-2.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] font-semibold text-sm">
        Back to ZapPro
      </Link>
    </div>
  );
}
