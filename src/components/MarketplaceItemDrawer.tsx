'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Phone, MessageCircle, Shield, CheckCircle2, Clock, User, Send, ExternalLink } from 'lucide-react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';
import type { MarketplaceItem } from '@/hooks/useMarketplace';
import { useLanguage } from '@/contexts/LanguageContext';
import ShareButton from '@/components/ShareButton';

const CVE_TO_EUR = 0.00907;

function formatPrice(cve: number): string {
  return cve.toLocaleString('pt-CV');
}

function cveToEur(cve: number): string {
  return (cve * CVE_TO_EUR).toFixed(0);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('pt-CV');
}

interface SellerProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  island: string | null;
  municipality: string | null;
  phone: string | null;
  whatsapp: string | null;
  created_at: string | null;
}

interface SellerLink {
  platform: string;
  url: string;
}

interface MarketplaceItemDrawerProps {
  item: MarketplaceItem | null;
  onClose: () => void;
}

export default function MarketplaceItemDrawer({ item, onClose }: MarketplaceItemDrawerProps) {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEur, setShowEur] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Seller data
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [sellerLinks, setSellerLinks] = useState<SellerLink[]>([]);
  const [sellerLoading, setSellerLoading] = useState(false);

  // Inquiry form
  const [inquiryForm, setInquiryForm] = useState({ fullName: '', email: '', phone: '', message: '' });
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Touch handling for carousel
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    if (item) {
      setCurrentImageIndex(0);
      setInquiryStatus('idle');
      setInquiryForm(f => ({ ...f, message: `Olá, estou interessado no item "${item.title}". Ainda está disponível?` }));
      requestAnimationFrame(() => setIsVisible(true));
      document.body.style.overflow = 'hidden';
      fetchSellerProfile(item.user_id);
    } else {
      setIsVisible(false);
      setSeller(null);
      setSellerLinks([]);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [item]);

  const fetchSellerProfile = useCallback(async (userId: string | null) => {
    if (!userId || !isSupabaseConfigured()) {
      setSeller(null);
      setSellerLinks([]);
      setSellerLoading(false);
      return;
    }

    setSellerLoading(true);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setSellerLoading(false); return; }

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, island, municipality, phone, whatsapp, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setSeller(profileData as unknown as SellerProfile);
      }

      const { data: linksData } = await supabase
        .from('user_links')
        .select('platform, url')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (linksData) {
        setSellerLinks(linksData as unknown as SellerLink[]);
      }
    } catch {
      // Graceful fallback
    } finally {
      setSellerLoading(false);
    }
  }, []);

  function handleClose() {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }

  function handleTouchEnd() {
    if (Math.abs(touchDeltaX.current) > 50) {
      if (touchDeltaX.current < -50) nextImage();
      if (touchDeltaX.current > 50) prevImage();
    }
    touchDeltaX.current = 0;
  }

  function nextImage() {
    if (!item) return;
    const count = images.length;
    setCurrentImageIndex((prev) => (prev + 1) % count);
  }

  function prevImage() {
    if (!item) return;
    const count = images.length;
    setCurrentImageIndex((prev) => (prev - 1 + count) % count);
  }

  async function handleInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiryForm.fullName || !inquiryForm.email || !item) return;

    setInquiryStatus('sending');
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error('No client');

      const { error } = await supabase.from('marketplace_inquiries' as never).insert({
        item_id: item.id,
        seller_id: item.user_id || null,
        full_name: inquiryForm.fullName,
        email: inquiryForm.email,
        phone: inquiryForm.phone || null,
        message: inquiryForm.message || null,
      } as never);

      if (error) throw error;
      setInquiryStatus('sent');
    } catch {
      setInquiryStatus('error');
    }
  }

  if (!item) return null;

  const images = item.images?.length > 0
    ? item.images
    : ['https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=600&h=400&fit=crop'];

  const sellerPhone = seller?.phone || item.contact_phone || '';
  const sellerWhatsapp = seller?.whatsapp || item.contact_whatsapp || sellerPhone;
  const whatsappMessage = encodeURIComponent(`Olá, estou interessado no seu item "${item.title}" anunciado no Pro.CV. Ainda está disponível?`);
  const whatsappUrl = sellerWhatsapp
    ? `https://wa.me/${sellerWhatsapp.replace(/\D/g, '')}?text=${whatsappMessage}`
    : '#';
  const sellerName = seller?.full_name || 'Seller';
  const sellerAvatar = seller?.avatar_url || null;
  const sellerIsland = seller?.island || item.island;
  const memberSince = seller?.created_at
    ? new Date(seller.created_at).toLocaleDateString('pt-CV', { month: 'short', year: 'numeric' })
    : '--';

  const extraPhotos = images.length > 4 ? images.length - 4 : 0;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer panel */}
      <div
        className={`absolute inset-0 bg-white flex flex-col transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        {/* Back nav - mirrors property detail */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1.5" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <ShareButton
                title={item.title}
                text={`${item.title} - ${formatPrice(item.price_cve)} CVE in ${item.island}, Cape Verde`}
                url={`/marketplace?item=${item.id}`}
                size="sm"
              />
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 pb-8">

            {/* Full-Width Photo Gallery - same as property */}
            <section className="mt-4">
              <div className="space-y-2">
                <button
                  onClick={() => { setGalleryOpen(true); setCurrentImageIndex(0); }}
                  className="w-full block"
                >
                  <img
                    src={images[0]}
                    alt={item.title}
                    className="w-full h-64 sm:h-80 md:h-[420px] object-cover rounded-xl bg-slate-100"
                  />
                </button>
                {images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.slice(1, 4).map((img, i) => {
                      const isLast = i === 2 || i === images.length - 2;
                      const showOverlay = isLast && extraPhotos > 0;
                      return (
                        <button
                          key={i}
                          onClick={() => { setGalleryOpen(true); setCurrentImageIndex(i + 1); }}
                          className="relative w-full aspect-[4/3] overflow-hidden rounded-lg"
                        >
                          <img src={img} alt={`${item.title} ${i + 2}`} className="w-full h-full object-cover bg-slate-100" />
                          {showOverlay && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">+{extraPhotos} Photos</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* 2-Column Layout: Left Content / Right Inquiry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start w-full">

              {/* LEFT COLUMN - 8 cols */}
              <main className="lg:col-span-8">
                {/* Price + Title */}
                <section>
                  <button onClick={() => setShowEur(!showEur)} className="group text-left">
                    {!showEur ? (
                      <p className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                        {formatPrice(item.price_cve)} <span className="text-lg font-semibold text-gray-500">CVE</span>
                      </p>
                    ) : (
                      <p className="text-3xl sm:text-4xl font-bold tracking-tight text-blue-600">
                        ~{cveToEur(item.price_cve)} <span className="text-lg font-semibold text-blue-400">EUR</span>
                      </p>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-medium">
                    tap price to {showEur ? 'show CVE' : 'show EUR'}
                  </p>
                  <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-800">
                    {item.title}
                  </h1>
                </section>

                {/* Specs row */}
                <section className="mt-4 flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 capitalize">
                    {item.condition || 'Used'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                    {item.category}
                  </span>
                  {item.subcategory && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-50 text-xs font-medium text-slate-500">
                      {item.subcategory}
                    </span>
                  )}
                  {item.is_featured && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-xs font-semibold text-amber-700">
                      Featured
                    </span>
                  )}
                </section>

                {/* Location */}
                <section className="mt-4 flex items-start gap-1.5 text-gray-600">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="text-sm leading-snug">
                    {item.island}{item.municipality ? ` / ${item.municipality}` : ''}, Cape Verde
                  </span>
                </section>

                {/* Posted / Views */}
                <section className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Posted {timeAgo(item.created_at)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    {item.view_count || 0} views
                  </span>
                </section>

                {/* Description */}
                {item.description && (
                  <section className="mt-6">
                    <h2 className="text-sm font-semibold text-gray-800 mb-2">Description</h2>
                    <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </section>
                )}

                {/* Seller Profile Card */}
                <section className="mt-8">
                  <h2 className="text-sm font-semibold text-gray-800 mb-3">About the Seller</h2>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      {sellerAvatar ? (
                        <img src={sellerAvatar} alt={sellerName} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{sellerName}</p>
                        <p className="text-xs text-gray-500">{sellerIsland} seller</p>
                      </div>
                      {sellerPhone ? (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-full flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          <span className="text-[10px] font-semibold text-green-700">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-full flex-shrink-0">
                          <Shield className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-semibold text-slate-500">Active</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-base font-bold text-slate-900">{memberSince}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Member since</p>
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold text-slate-900">{sellerIsland}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Location</p>
                      </div>
                    </div>

                    {/* Seller Links */}
                    {sellerLinks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                        {sellerLinks.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {link.platform}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* MOBILE-ONLY INQUIRY FORM */}
                <section className="mt-8 lg:hidden">
                  <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      {sellerAvatar ? (
                        <img src={sellerAvatar} alt={sellerName} className="h-9 w-9 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{sellerName}</p>
                        <p className="text-xs text-gray-500 truncate">{sellerIsland} seller</p>
                      </div>
                    </div>

                    {inquiryStatus === 'sent' ? (
                      <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
                        <p className="text-sm font-medium text-green-800">{t.inquirySent}</p>
                      </div>
                    ) : (
                      <form onSubmit={handleInquirySubmit} className="space-y-3">
                        <input
                          type="text"
                          placeholder={t.name}
                          required
                          value={inquiryForm.fullName}
                          onChange={(e) => setInquiryForm(f => ({ ...f, fullName: e.target.value }))}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                        <input
                          type="email"
                          placeholder={t.email}
                          required
                          value={inquiryForm.email}
                          onChange={(e) => setInquiryForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                        <input
                          type="tel"
                          placeholder={t.phoneOptional}
                          value={inquiryForm.phone}
                          onChange={(e) => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                        <textarea
                          rows={3}
                          value={inquiryForm.message}
                          onChange={(e) => setInquiryForm(f => ({ ...f, message: e.target.value }))}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                        <button
                          type="submit"
                          disabled={inquiryStatus === 'sending'}
                          className="w-full py-3 rounded-lg bg-[#0044FF] text-white text-sm font-semibold hover:bg-[#0033CC] transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          {inquiryStatus === 'sending' ? t.sending : t.sendMessage}
                        </button>
                        {inquiryStatus === 'error' && (
                          <p className="text-xs text-red-500 text-center">Failed to send. Please try again.</p>
                        )}
                      </form>
                    )}

                    <div className="flex gap-2 pt-1">
                      {sellerPhone ? (
                        <a
                          href={`tel:${sellerPhone}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Call
                        </a>
                      ) : (
                        <span className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-300">
                          <Phone className="h-3.5 w-3.5" />
                          Call
                        </span>
                      )}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => { if (!sellerWhatsapp) e.preventDefault(); }}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-xs font-medium transition-colors ${
                          sellerWhatsapp ? 'text-green-700 hover:bg-green-50' : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </section>
              </main>

              {/* RIGHT COLUMN: Sticky Inquiry Card - 4 cols, desktop only */}
              <aside className="hidden lg:block lg:col-span-4">
                <div className="lg:sticky lg:top-20 bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 max-w-[360px] ml-auto w-full">
                  {/* Seller mini-header */}
                  <div className="flex items-center gap-3">
                    {sellerAvatar ? (
                      <img src={sellerAvatar} alt={sellerName} className="h-9 w-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{sellerName}</p>
                      <p className="text-xs text-gray-500 truncate">{sellerIsland} seller</p>
                    </div>
                  </div>

                  {inquiryStatus === 'sent' ? (
                    <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
                      <p className="text-sm font-medium text-green-800">{t.inquirySent}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-3">
                      <input
                        type="text"
                        placeholder={t.name}
                        required
                        value={inquiryForm.fullName}
                        onChange={(e) => setInquiryForm(f => ({ ...f, fullName: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                      <input
                        type="email"
                        placeholder={t.email}
                        required
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                      <input
                        type="tel"
                        placeholder={t.phoneOptional}
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                      <textarea
                        rows={3}
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm(f => ({ ...f, message: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                      <button
                        type="submit"
                        disabled={inquiryStatus === 'sending'}
                        className="w-full py-2.5 rounded-lg bg-[#0044FF] text-white text-sm font-semibold hover:bg-[#0033CC] transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {inquiryStatus === 'sending' ? t.sending : t.sendMessage}
                      </button>
                      {inquiryStatus === 'error' && (
                        <p className="text-xs text-red-500 text-center">Failed to send. Please try again.</p>
                      )}
                    </form>
                  )}

                  {/* Quick contact shortcuts */}
                  <div className="flex gap-2 pt-1">
                    {sellerPhone ? (
                      <a
                        href={`tel:${sellerPhone}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call
                      </a>
                    ) : (
                      <span className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-300">
                        <Phone className="h-3.5 w-3.5" />
                        Call
                      </span>
                    )}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => { if (!sellerWhatsapp) e.preventDefault(); }}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-xs font-medium transition-colors ${
                        sellerWhatsapp ? 'text-green-700 hover:bg-green-50' : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* Mobile fixed bottom bar - matches property detail */}
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-[101] lg:hidden">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            {sellerAvatar ? (
              <img src={sellerAvatar} alt={sellerName} className="h-10 w-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{sellerName}</p>
              <p className="text-xs text-gray-500 truncate">{sellerIsland}</p>
            </div>
            {sellerPhone ? (
              <a
                href={`tel:${sellerPhone}`}
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#0044FF] text-white hover:bg-[#0033CC] transition-colors shrink-0"
                aria-label="Call seller"
              >
                <Phone className="h-4 w-4" />
              </a>
            ) : (
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 text-gray-400 shrink-0">
                <Phone className="h-4 w-4" />
              </div>
            )}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { if (!sellerWhatsapp) e.preventDefault(); }}
              className={`inline-flex items-center justify-center h-10 w-10 rounded-full shrink-0 transition-colors ${
                sellerWhatsapp
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="WhatsApp seller"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/95 flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-white/70 text-sm">{currentImageIndex + 1} / {images.length}</span>
            <button onClick={() => setGalleryOpen(false)} className="text-white/70 hover:text-white p-1">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 relative">
            <img
              src={images[currentImageIndex]}
              alt={`${item.title} ${currentImageIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {currentImageIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
            )}
            {currentImageIndex < images.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            )}
          </div>
          {/* Dots */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 py-4">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}