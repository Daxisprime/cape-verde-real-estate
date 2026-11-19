import Link from 'next/link';
import { Zap, ShoppingBag, Car, MessageCircle, Smartphone, Receipt, Globe2, ArrowRight, Check } from 'lucide-react';

export const metadata = {
  title: 'ZapPro — Turn WhatsApp Chats Into Structured Orders',
  description:
    'No commissions. No complicated apps for your customers. Share one link and get clean, itemized receipts sent straight to your WhatsApp. Built for Cabo Verde and emerging markets.',
};

export default function ZapProLanding() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-white font-bold text-xl tracking-tight">ZapPro</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EF4444]" />
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <Link href="/s/demo-retail" className="hover:text-white transition-colors">Retail Demo</Link>
            <Link href="/s/demo-showcase" className="hover:text-white transition-colors">Showcase Demo</Link>
            <Link href="/login" className="px-4 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold transition-colors">
              Merchant Login / Start Free
            </Link>
          </nav>
          <div className="md:hidden">
            <Link href="/login" className="px-3 py-1.5 rounded-lg bg-[#16A34A] text-white text-sm font-semibold">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0F172A] text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/30">
            <MessageCircle className="h-3.5 w-3.5" /> Built for WhatsApp Business Sellers
          </span>
          <h1 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
            Turn WhatsApp Chats Into Structured Orders in 60 Seconds.
          </h1>
          <p className="mt-5 text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            No commissions. No complicated apps for your customers. Share one link on Instagram, TikTok, or WhatsApp Status — get clean, itemized receipts sent straight to your WhatsApp.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/s/demo-retail"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-base transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
            >
              <ShoppingBag className="h-5 w-5" /> Explore Live Food/Retail Demo
            </Link>
            <Link
              href="/s/demo-showcase"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-all ring-1 ring-white/20"
            >
              <Car className="h-5 w-5" /> Explore Car/Real Estate Demo
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl md:text-3xl font-bold">How ZapPro Works</h2>
          <p className="mt-3 text-center text-slate-500 max-w-xl mx-auto">Three steps from link to order. Your customers never install anything.</p>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <StepCard
              n={1}
              icon={<Zap className="h-6 w-6" />}
              title="Share your storefront link"
              body="Post your zappro.app/s/yourshop link on WhatsApp Status, Instagram bio, or TikTok. One link, zero friction."
            />
            <StepCard
              n={2}
              icon={<Smartphone className="h-6 w-6" />}
              title="Customers browse & order"
              body="They open the link on their phone, pick items, choose delivery zone and payment method — no account needed."
            />
            <StepCard
              n={3}
              icon={<Receipt className="h-6 w-6" />}
              title="Get a clean receipt on WhatsApp"
              body="An itemized order receipt with order code, total and customer details lands in your WhatsApp instantly."
            />
          </div>
        </div>
      </section>

      {/* Dual mode features */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl md:text-3xl font-bold">Two Modes, One Platform</h2>
          <p className="mt-3 text-center text-slate-500 max-w-xl mx-auto">From a quick burger to a million-escudo apartment, ZapPro adapts to what you sell.</p>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <ModeCard
              tag="Retail / Food"
              accent="emerald"
              title="Cart Mode for everyday sellers"
              points={[
                'Fast product grid with + Add buttons',
                'Option modifiers with live price updates',
                'Sticky cart bar with count and subtotal',
                'Delivery zones, landmarks, payment pills',
                'Itemized WhatsApp receipt with order code',
              ]}
              demoHref="/s/demo-retail"
              icon={<ShoppingBag className="h-7 w-7" />}
            />
            <ModeCard
              tag="Showcase"
              accent="crimson"
              title="Inquiry Mode for high-ticket listings"
              points={[
                'Clean grid of cars, properties, services',
                'Spec pills parsed automatically (year, gearbox, km)',
                'Detail modal with full description and specs',
                'Inline inquiry form with preferred date/time',
                'Pre-filled WhatsApp inquiry message',
              ]}
              demoHref="/s/demo-showcase"
              icon={<Car className="h-7 w-7" />}
            />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-[#0F172A] text-white py-16">
        <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-8 text-center">
          <Stat value="0%" label="Commission on every order" />
          <Stat value="< 60s" label="From link to WhatsApp receipt" />
          <Stat value="1 link" label="No app for your customers to install" />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <Globe2 className="h-10 w-10 mx-auto text-[#16A34A]" />
          <h2 className="mt-5 text-2xl md:text-3xl font-bold">Start selling on WhatsApp today</h2>
          <p className="mt-3 text-slate-500">Free to start. Live in minutes. Built for Cabo Verde, ready for emerging markets.</p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-base transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
          >
            Start Free <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-[#0F172A] text-slate-400 py-8 text-center text-sm">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-white font-semibold"><Zap className="h-4 w-4" /> ZapPro</span>
          <span>zappro.app — Built for WhatsApp Business sellers in Cabo Verde</span>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ n, icon, title, body }: { n: number; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F172A] text-white">{icon}</div>
        <span className="text-5xl font-black text-slate-100">{n}</span>
      </div>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-slate-500 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function ModeCard({
  tag, accent, title, points, demoHref, icon,
}: { tag: string; accent: 'emerald' | 'crimson'; title: string; points: string[]; demoHref: string; icon: React.ReactNode }) {
  const ring = accent === 'emerald' ? 'ring-emerald-200 bg-emerald-50 text-emerald-700' : 'ring-rose-200 bg-rose-50 text-rose-700';
  const iconBg = accent === 'emerald' ? 'bg-[#16A34A]' : 'bg-[#EF4444]';
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm flex flex-col">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} text-white`}>{icon}</div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${ring}`}>{tag}</span>
      </div>
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      <ul className="mt-4 space-y-2.5 flex-1">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm text-slate-600">
            <Check className="h-4 w-4 mt-0.5 shrink-0 text-[#16A34A]" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <Link href={demoHref} className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors">
        View demo <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-black text-white">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
    </div>
  );
}
