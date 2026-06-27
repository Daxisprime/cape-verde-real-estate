'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Bed, Bath, Ruler, Phone, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight, Facebook, ExternalLink } from 'lucide-react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';

interface PropertyDrawerItem {
  id: string;
  title: string;
  price: number;
  location: string;
  island: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  images: string[];
  coordinates: [number, number];
  featured: boolean;
  description?: string;
  features?: string[];
  agentId?: string;
}

interface SellerProfile {
  id: string;
  name: string | null;
  avatar: string | null;
  role: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  facebook_handle: string | null;
  twitter_handle: string | null;
}

interface PropertyDetailDrawerProps {
  property: PropertyDrawerItem | null;
  onClose: () => void;
}

export type { PropertyDrawerItem };

export default function PropertyDetailDrawer({ property, onClose }: PropertyDetailDrawerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);

  useEffect(() => {
    if (!property) {
      setSeller(null);
      setCurrentImageIndex(0);
      return;
    }
    fetchSellerProfile(property.agentId);
  }, [property?.id, property?.agentId]);

  async function fetchSellerProfile(agentId?: string) {
    if (!agentId || !isSupabaseConfigured()) {
      setSeller(null);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setSeller(null); return; }

    setSellerLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar, role, phone, whatsapp_number, facebook_handle, twitter_handle')
        .eq('id', agentId)
        .maybeSingle();
      setSeller(data || null);
    } catch {
      setSeller(null);
    } finally {
      setSellerLoading(false);
    }
  }

  if (!property) return null;

  const allImages = property.images?.length > 0 ? property.images : [property.image || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?w=800'];

  const nextImage = () => setCurrentImageIndex((i) => (i + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((i) => (i - 1 + allImages.length) % allImages.length);

  const handleShare = () => {
    const text = `${property.title} - ${formatPrice(property.price)} in ${property.location}`;
    if (navigator.share) {
      navigator.share({ title: property.title, text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  function formatPrice(price: number): string {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M CVE`;
    if (price >= 1000) return `${Math.round(price / 1000).toLocaleString()}K CVE`;
    return `${price.toLocaleString()} CVE`;
  }

  const sellerName = seller?.name || null;
  const sellerRole = seller?.role || null;
  const sellerWhatsApp = seller?.whatsapp_number || seller?.phone || null;
  const sellerFacebook = seller?.facebook_handle || null;
  const sellerTwitter = seller?.twitter_handle || null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-x-0 bottom-0 z-[61] max-h-[92vh] bg-white rounded-t-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Close + actions bar */}
        <div className="flex items-center justify-between px-4 pb-2 flex-shrink-0">
          <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={`p-2 rounded-full transition-colors ${isFavorited ? 'bg-red-50 text-red-500' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image Gallery */}
          <div className="relative w-full h-56 sm:h-72 bg-slate-100">
            <img
              src={allImages[currentImageIndex]}
              alt={property.title || 'Property'}
              className="w-full h-full object-cover"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-white transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-slate-700" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
            {property.featured && (
              <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">
                Featured
              </span>
            )}
            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-blue-600 px-2 py-0.5 rounded-full">
              {property.type || 'Property'}
            </span>
          </div>

          {/* Details */}
          <div className="px-5 py-4 space-y-4">
            {/* Price + Title */}
            <div>
              <p className="text-2xl font-black text-slate-900">{formatPrice(property.price)}</p>
              <h2 className="text-base font-semibold text-slate-800 mt-1">{property.title || 'Untitled Property'}</h2>
              <div className="flex items-center gap-1.5 mt-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-sm text-slate-500">{property.location || property.island || 'Cape Verde'}</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {property.bedrooms > 0 && (
                <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                  <Bed className="h-4 w-4 text-slate-500 mb-1" />
                  <span className="text-sm font-bold text-slate-800">{property.bedrooms}</span>
                  <span className="text-[10px] text-slate-400">Bedrooms</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                  <Bath className="h-4 w-4 text-slate-500 mb-1" />
                  <span className="text-sm font-bold text-slate-800">{property.bathrooms}</span>
                  <span className="text-[10px] text-slate-400">Bathrooms</span>
                </div>
              )}
              {property.area > 0 && (
                <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                  <Ruler className="h-4 w-4 text-slate-500 mb-1" />
                  <span className="text-sm font-bold text-slate-800">{property.area}</span>
                  <span className="text-[10px] text-slate-400">m2</span>
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Features</h3>
                <div className="flex flex-wrap gap-1.5">
                  {property.features.map((f) => (
                    <span key={f} className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Seller / Agent Profile Card */}
            <SellerCard
              seller={seller}
              loading={sellerLoading}
              propertyTitle={property.title}
            />

            {/* Primary Contact CTA */}
            <div className="pt-2 pb-4 flex gap-2">
              <a
                href={`tel:${sellerWhatsApp || '+2389000000'}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call Agent
              </a>
              <a
                href={`https://wa.me/${(sellerWhatsApp || '2389000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in: ${property.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SellerCard({ seller, loading, propertyTitle }: { seller: SellerProfile | null; loading: boolean; propertyTitle: string }) {
  if (loading) {
    return (
      <div className="p-4 rounded-xl border border-slate-200 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-2/3" />
            <div className="h-2.5 bg-slate-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  const hasProfile = seller && seller.name;
  const name = hasProfile ? seller.name : 'Pro.CV Verified Partner';
  const role = seller?.role || (hasProfile ? 'Agent' : 'Independent Seller');
  const avatar = seller?.avatar || null;
  const facebookHandle = seller?.facebook_handle || null;
  const twitterHandle = seller?.twitter_handle || null;
  const whatsapp = seller?.whatsapp_number || seller?.phone || null;

  const initials = (name || 'P')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {avatar ? (
          <img src={avatar} alt={name || ''} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">{initials}</span>
          </div>
        )}

        {/* Name + Badge */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
          <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${
            role === 'Agent' || role === 'agent'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {role === 'agent' ? 'Agent' : role === 'vendor' ? 'Vendor' : role || 'Seller'}
          </span>
        </div>
      </div>

      {/* Social Links */}
      {(facebookHandle || twitterHandle || whatsapp) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          {facebookHandle && (
            <a
              href={`https://facebook.com/${facebookHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2]/10 text-[#1877F2] text-xs font-semibold hover:bg-[#1877F2]/20 transition-colors"
            >
              <Facebook className="h-3.5 w-3.5" />
              Facebook
            </a>
          )}
          {twitterHandle && (
            <a
              href={`https://x.com/${twitterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/10 text-slate-800 text-xs font-semibold hover:bg-slate-900/20 transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              @{twitterHandle}
            </a>
          )}
          {!facebookHandle && !twitterHandle && whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          )}
        </div>
      )}

      {/* Fallback: no social links at all */}
      {!facebookHandle && !twitterHandle && !whatsapp && !hasProfile && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <a
            href={`https://wa.me/2389000000?text=${encodeURIComponent(`Hi, I'm interested in: ${propertyTitle}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Contact via WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
