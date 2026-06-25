'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Phone, MessageCircle, Shield, Clock, User } from 'lucide-react';
import type { MarketplaceItem } from '@/hooks/useMarketplace';

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

interface MarketplaceItemDrawerProps {
  item: MarketplaceItem | null;
  onClose: () => void;
}

export default function MarketplaceItemDrawer({ item, onClose }: MarketplaceItemDrawerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEur, setShowEur] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item) {
      setCurrentImageIndex(0);
      requestAnimationFrame(() => setIsVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [item]);

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
    const count = item.images?.length || 1;
    setCurrentImageIndex((prev) => (prev + 1) % count);
  }

  function prevImage() {
    if (!item) return;
    const count = item.images?.length || 1;
    setCurrentImageIndex((prev) => (prev - 1 + count) % count);
  }

  if (!item) return null;

  const images = item.images?.length > 0
    ? item.images
    : ['https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=600&h=400&fit=crop'];

  const whatsappNumber = item.contact_whatsapp || item.contact_phone || '';
  const phoneNumber = item.contact_phone || '';
  const whatsappMessage = encodeURIComponent(`Olá, estou interessado no seu item "${item.title}" anunciado no Pro.CV. Ainda está disponível?`);
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${whatsappMessage}`
    : '#';

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer */}
      <div
        className={`absolute inset-x-0 bottom-0 top-0 bg-white flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Header - Close Button */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-slate-100">
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 text-slate-700 font-medium text-sm active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image Carousel */}
          <div
            className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={images[currentImageIndex]}
              alt={`${item.title} - image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Image navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Image dots */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Image counter */}
            <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
              {currentImageIndex + 1}/{images.length}
            </div>

            {/* Featured badge */}
            {item.is_featured && (
              <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                Featured
              </div>
            )}
          </div>

          {/* Title & Price Section */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-100">
            <h1 className="text-xl font-bold text-slate-900 leading-tight mb-2">
              {item.title}
            </h1>

            <div className="flex items-baseline gap-2 mb-2">
              <button
                onClick={() => setShowEur(!showEur)}
                className="group"
              >
                {!showEur ? (
                  <span className="text-2xl font-extrabold text-slate-900">
                    {formatPrice(item.price_cve)}
                    <span className="text-sm font-semibold text-slate-500 ml-1">CVE</span>
                  </span>
                ) : (
                  <span className="text-2xl font-extrabold text-blue-600">
                    ~{cveToEur(item.price_cve)}
                    <span className="text-sm font-semibold text-blue-400 ml-1">EUR</span>
                  </span>
                )}
              </button>
              <span className="text-[10px] text-slate-400 uppercase font-medium">
                tap to {showEur ? 'show CVE' : 'show EUR'}
              </span>
            </div>

            {/* Condition Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 capitalize">
                {item.condition || 'Used'}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-[11px] font-semibold text-blue-600">
                {item.category}
              </span>
              {item.subcategory && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50 text-[11px] font-medium text-slate-500">
                  {item.subcategory}
                </span>
              )}
            </div>
          </div>

          {/* Location & Verification */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {item.island}{item.municipality ? ` / ${item.municipality}` : ''}
                </p>
                <p className="text-[11px] text-slate-500">Cape Verde</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="w-3 h-3" />
                Posted {timeAgo(item.created_at)}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <Shield className="w-3 h-3" />
                {item.view_count || 0} views
              </span>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>
          )}

          {/* Seller Details Card */}
          <div className="px-4 py-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Seller</h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    Seller
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {item.island} seller
                  </p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
                  <Shield className="w-3 h-3 text-green-600" />
                  <span className="text-[10px] font-semibold text-green-700">Active</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">--</p>
                  <p className="text-[10px] text-slate-500">Listings</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">--</p>
                  <p className="text-[10px] text-slate-500">Member since</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Contact Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3 z-[101] shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          {/* Phone button */}
          {phoneNumber ? (
            <a
              href={`tel:${phoneNumber}`}
              className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-slate-200 text-blue-600 hover:bg-blue-50 active:scale-95 transition-all flex-shrink-0"
            >
              <Phone className="w-5 h-5" />
            </a>
          ) : (
            <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-slate-200 text-slate-300 flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
          )}

          {/* WhatsApp button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-full font-bold text-sm transition-all active:scale-[0.97] ${
              whatsappNumber
                ? 'bg-[#25D366] text-white hover:bg-[#20BD5A] shadow-lg shadow-green-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            onClick={(e) => { if (!whatsappNumber) e.preventDefault(); }}
          >
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
