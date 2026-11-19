import Link from 'next/link';
import {
  ArrowRight, Car, Check, Home, MessageCircle, Receipt, Smartphone, Store, UserX, Utensils, Shirt, Zap,
} from 'lucide-react';
import ModePreview from '@/components/zappro/ModePreview';

export const metadata = {
  title: 'ZapPro — Turn Your WhatsApp Into a 1-Click Storefront',
  description:
    'Customers order without downloading an app or creating an account. Structured receipts land straight in your WhatsApp. Built for restaurants, boutiques, car and real estate dealers.',
};

const DEMO_HREF = '/s/demo-praia';

export default function ZapProLanding() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0F172A]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16A34A]"><Zap className="h-4 w-4 text-white" /></span>
            <span className="text-lg font-bold tracking-tight text-white">ZapPro</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-5 text-sm">
            <Link href={DEMO_HREF} className="hidden sm:inline text-slate-300 transition-colors hover:text-white">Live demo</Link>
            <Link href="/login" className="rounded-lg bg-[#16A34A] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#15803D]">
              Launch Your Store
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#0F172A] text-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#16A34A]/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-white/15">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EF4444] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EF4444]" />
              </span>
              For WhatsApp merchants in Cabo Verde & beyond
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Turn Your WhatsApp Into a <span className="text-[#22C55E]">1-Click Storefront.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0">
              Customers browse and order without downloading an app or creating an account. Every order arrives as a structured receipt straight in your WhatsApp.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/login" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#16A34A] px-7 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-[#15803D] active:scale-[0.98]">
                Launch Your Store <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href={DEMO_HREF} className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white/10 px-7 text-base font-semibold text-white ring-1 ring-white/20 transition-all hover:bg-white/15">
                <Store className="h-5 w-5" /> View Live Demo Store
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400 lg:justify-start">
              {['No app download', 'No customer accounts', '0% commission'].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#22C55E]" /> {t}</li>
              ))}
            </ul>
          </div>
          <ModePreview />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 text-sm font-medium text-slate-500">
          <span className="flex items-center gap-2"><Utensils className="h-5 w-5 text-slate-400" /> Restaurants</span>
          <span className="flex items-center gap-2"><Shirt className="h-5 w-5 text-slate-400" /> Boutiques</span>
          <span className="flex items-center gap-2"><Car className="h-5 w-5 text-slate-400" /> Car dealers</span>
          <span className="flex items-center gap-2"><Home className="h-5 w-5 text-slate-400" /> Real estate</span>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">From link to order in three taps</h2>
          <p className="mx-auto mt-3 max-w-xl text-center leading-relaxed text-slate-500">Share one link on your Status, Instagram bio or TikTok. That's your whole store.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <Feature icon={<Smartphone className="h-6 w-6" />} title="Customers browse on their phone" body="A fast, thumb-friendly store opens instantly in any browser. Nothing to install." />
            <Feature icon={<UserX className="h-6 w-6" />} title="No sign-up, no friction" body="They pick items, options, delivery zone and payment method. Just a name is required." />
            <Feature icon={<Receipt className="h-6 w-6" />} title="Clean receipts in WhatsApp" body="Itemised totals, landmark and payment method arrive as one tidy message in your chat." />
          </div>
        </div>
      </section>

      <section className="bg-[#0F172A] py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <MessageCircle className="mx-auto h-10 w-10 text-[#22C55E]" />
          <h2 className="mt-5 text-3xl font-bold tracking-tight">Stop copying orders out of chat threads</h2>
          <p className="mt-4 leading-relaxed text-slate-300">Launch your storefront today and let ZapPro turn every conversation into a structured order.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#16A34A] px-7 font-semibold text-white transition-all hover:bg-[#15803D] active:scale-[0.98]">
              Launch Your Store <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href={DEMO_HREF} className="inline-flex h-14 items-center justify-center rounded-2xl px-7 font-semibold text-slate-200 ring-1 ring-white/20 transition-colors hover:bg-white/10">
              View Live Demo Store
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#0F172A] border-t border-white/10 py-8 text-sm text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <span className="flex items-center gap-2 font-semibold text-white"><Zap className="h-4 w-4 text-[#22C55E]" /> ZapPro</span>
          <span>WhatsApp storefronts for modern merchants</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-3xl bg-white p-7 ring-1 ring-slate-200/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F172A] text-white">{icon}</div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}
