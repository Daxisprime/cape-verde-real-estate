"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Bed, Bath, Square, Phone, MessageCircle, X, ChevronLeft, ChevronRight, Facebook } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { submitInquiry } from "@/app/actions/sendNotification";

export interface SimilarProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  island: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  image: string;
}

interface PropertyDetailClientProps {
  property: {
    id: string;
    title: string;
    titlePt: string;
    titleCv: string;
    price: number;
    location: string;
    island: string;
    type: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    lotSize: number;
    yearBuilt: number;
    parking: number;
    featured: boolean;
    description: string;
    descriptionPt: string;
    descriptionCv: string;
    features: string[];
    featuresPt: string[];
    featuresCv: string[];
    images: string[];
    virtualTourUrl: string;
    agent: {
      name: string;
      company: string;
      phone: string;
      email: string;
      avatar: string;
      facebook_handle?: string;
    };
    coordinates: number[];
    priceHistory: Array<{ date: string; price: number }>;
  };
  similarProperties?: SimilarProperty[];
}

const FALLBACK_LISTINGS: SimilarProperty[] = [
  {
    id: "cv-fallback-1",
    title: "Modern Apartment in Palmarejo",
    price: 185000,
    location: "Palmarejo, Praia",
    island: "Santiago",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"
  },
  {
    id: "cv-fallback-2",
    title: "Cozy Studio near Santa Maria Beach",
    price: 95000,
    location: "Santa Maria, Sal",
    island: "Sal",
    type: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"
  },
  {
    id: "cv-fallback-3",
    title: "Hillside Villa with Ocean View",
    price: 420000,
    location: "Mindelo, Sao Vicente",
    island: "Sao Vicente",
    type: "Villa",
    bedrooms: 4,
    bathrooms: 3,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"
  }
];

export default function PropertyDetailClient({ property, similarProperties = [] }: PropertyDetailClientProps) {
  const router = useRouter();
  const { currentLanguage } = useLanguage();

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    message: "I am interested in this property. Please contact me with more details."
  });
  const [inquiryStatus, setInquiryStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const listings = similarProperties.length >= 3
    ? similarProperties.slice(0, 3)
    : [
        ...similarProperties,
        ...FALLBACK_LISTINGS.filter(f => !similarProperties.some(s => s.id === f.id) && f.id !== property.id)
      ].slice(0, 3);

  const getTitle = () => {
    switch (currentLanguage) {
      case 'pt': return property.titlePt;
      case 'cv': return property.titleCv;
      default: return property.title;
    }
  };

  const getDescription = () => {
    switch (currentLanguage) {
      case 'pt': return property.descriptionPt;
      case 'cv': return property.descriptionCv;
      default: return property.description;
    }
  };

  const getFeatures = () => {
    switch (currentLanguage) {
      case 'pt': return property.featuresPt;
      case 'cv': return property.featuresCv;
      default: return property.features;
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi, I'm interested in "${getTitle()}" in ${property.location}. Could you provide more details?`
    );
    const phone = property.agent.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const shortenLocation = (loc: string) => {
    const parts = loc.split(',').map(s => s.trim());
    return parts.slice(0, 2).join(', ');
  };

  const openGallery = useCallback((index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  }, []);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.fullName || !inquiryForm.email) return;

    setInquiryStatus("sending");
    try {
      const result = await submitInquiry({
        property_id: property.id,
        seller_id: property.id,
        full_name: inquiryForm.fullName,
        email: inquiryForm.email,
        phone: inquiryForm.phone || undefined,
        message: inquiryForm.message,
      });
      if (result.error) throw new Error(result.error);
      setInquiryStatus("sent");
    } catch {
      // Fallback: try direct client insert
      try {
        const supabase = createSupabaseBrowserClient();
        if (supabase) {
          await supabase.from("property_inquiries" as never).insert({
            property_id: property.id,
            full_name: inquiryForm.fullName,
            phone: inquiryForm.phone || null,
            email: inquiryForm.email,
            message: inquiryForm.message,
          } as never);
        }
        setInquiryStatus("sent");
      } catch {
        setInquiryStatus("error");
      }
    }
  };

  const title = getTitle();
  const features = getFeatures();
  const extraPhotos = property.images.length > 4 ? property.images.length - 4 : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Back nav */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-40">
        {/* TOP ZONE: Full-Width Photo Gallery */}
        <section className="mt-4">
          {property.images.length > 0 && (
            <div className="space-y-2">
              <button onClick={() => openGallery(0)} className="w-full block">
                <img
                  src={property.images[0]}
                  alt={title}
                  loading="eager"
                  className="w-full h-64 sm:h-80 md:h-[420px] object-cover rounded-xl"
                />
              </button>
              <div className="grid grid-cols-3 gap-2">
                {property.images.slice(1, 4).map((img, i) => {
                  const isLast = i === 2 || i === property.images.length - 2;
                  const showOverlay = isLast && extraPhotos > 0;
                  return (
                    <button
                      key={i}
                      onClick={() => openGallery(i + 1)}
                      className="relative w-full aspect-[4/3] overflow-hidden rounded-lg"
                    >
                      <img
                        src={img}
                        alt={`${title} ${i + 2}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      {showOverlay && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">+{extraPhotos} Photos</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* MIDDLE ZONE: 2-Column Trulia Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start w-full">

          {/* LEFT COLUMN — 8 cols */}
          <main className="lg:col-span-8">
            {/* Price + Title */}
            <section>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              &euro;{property.price.toLocaleString()}
            </p>
            <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-800">
              {title}
            </h1>
          </section>

          {/* Specs row */}
          <section className="mt-4 flex items-center gap-5 text-gray-600 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Bed className="h-4 w-4" />
              {property.bedrooms} Beds
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bath className="h-4 w-4" />
              {property.bathrooms} Baths
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Square className="h-4 w-4" />
              {property.area} m&sup2;
            </span>
          </section>

          {/* Location */}
          <section className="mt-4 flex items-start gap-1.5 text-gray-600">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="text-sm leading-snug">{property.location}, {property.island}</span>
          </section>

          {/* Description */}
          <section className="mt-6">
            <p className="text-gray-600 text-[15px] leading-relaxed">
              {getDescription()}
            </p>
          </section>

          {/* Amenities & Specs */}
          {features.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-3 py-1"
                  >
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                    {feature}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Static Mini-Map */}
          {property.coordinates && property.coordinates.length === 2 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Location</h2>
              <div className="rounded-xl overflow-hidden border border-gray-100 pointer-events-none select-none">
                <img
                  src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+1e3a8a(${property.coordinates[0]},${property.coordinates[1]})/${property.coordinates[0]},${property.coordinates[1]},14,0/600x200@2x?access_token=pk.placeholder&attribution=false`}
                  alt={`Map of ${property.location}`}
                  loading="lazy"
                  className="w-full h-[160px] object-cover bg-gray-100"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling;
                    if (fallback) (fallback as HTMLElement).style.display = 'flex';
                  }}
                />
                <div className="hidden items-center justify-center h-[160px] bg-gray-50 text-gray-400 text-sm">
                  <MapPin className="h-5 w-5 mr-2" />
                  {property.location}, {property.island}
                </div>
              </div>
            </section>
          )}

          {/* MOBILE-ONLY INQUIRY FORM — renders here on mobile, hidden on desktop */}
          <section className="mt-8 lg:hidden">
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={property.agent.avatar}
                  alt={property.agent.name}
                  className="h-9 w-9 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{property.agent.name}</p>
                  <p className="text-xs text-gray-500 truncate">{property.agent.company}</p>
                </div>
              </div>

              {inquiryStatus === "sent" ? (
                <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
                  <p className="text-sm font-medium text-green-800">Inquiry sent!</p>
                  <p className="text-xs text-green-600 mt-0.5">The agent will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={inquiryForm.fullName}
                    onChange={(e) => setInquiryForm(f => ({ ...f, fullName: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm(f => ({ ...f, email: e.target.value }))}
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
                    disabled={inquiryStatus === "sending"}
                    className="w-full py-3 rounded-lg bg-[#0044FF] text-white text-sm font-semibold hover:bg-[#0033CC] transition-colors disabled:opacity-60"
                  >
                    {inquiryStatus === "sending" ? "Sending..." : "Send Inquiry"}
                  </button>
                  {inquiryStatus === "error" && (
                    <p className="text-xs text-red-500 text-center">Failed to send. Please try again.</p>
                  )}
                </form>
              )}

              <div className="flex gap-2 pt-1">
                <a
                  href={`tel:${property.agent.phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call
                </a>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </button>
                {property.agent.facebook_handle && (
                  <a
                    href={`fb://facewebmodal/f?href=https://facebook.com/${property.agent.facebook_handle}`}
                    onClick={() => {
                      setTimeout(() => { window.open(`https://facebook.com/${property.agent.facebook_handle}`, '_blank'); }, 500);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-xs font-medium text-[#1877F2] hover:bg-blue-50 transition-colors"
                  >
                    <Facebook className="h-3.5 w-3.5" />
                    Facebook
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* Similar Properties — always at bottom of left column */}
          <section className="mt-10">
            <hr className="border-gray-100 mb-6" />
            <h2 className="text-base font-semibold text-gray-800 mb-4">Similar Listings in the Area</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              {listings.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/property/${item.id}`)}
                  className="group text-left rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full aspect-square sm:h-28 object-cover"
                  />
                  <div className="p-2.5">
                    <p className="text-sm font-bold text-gray-900">
                      &euro;{item.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {shortenLocation(item.location)}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        {item.bedrooms}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        {item.bathrooms}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
          </main>

          {/* RIGHT COLUMN: Sticky Inquiry Side-Card — 4 cols, desktop only */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="lg:sticky lg:top-20 bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 max-w-[360px] ml-auto w-full">
            {/* Agent mini-header */}
            <div className="flex items-center gap-3">
              <img
                src={property.agent.avatar}
                alt={property.agent.name}
                className="h-9 w-9 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{property.agent.name}</p>
                <p className="text-xs text-gray-500 truncate">{property.agent.company}</p>
              </div>
            </div>

            {inquiryStatus === "sent" ? (
              <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
                <p className="text-sm font-medium text-green-800">Inquiry sent!</p>
                <p className="text-xs text-green-600 mt-0.5">The agent will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={inquiryForm.fullName}
                  onChange={(e) => setInquiryForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={inquiryForm.phone}
                  onChange={(e) => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={inquiryForm.email}
                  onChange={(e) => setInquiryForm(f => ({ ...f, email: e.target.value }))}
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
                  disabled={inquiryStatus === "sending"}
                  className="w-full py-2 rounded-lg bg-[#0044FF] text-white text-sm font-semibold hover:bg-[#0033CC] transition-colors disabled:opacity-60"
                >
                  {inquiryStatus === "sending" ? "Sending..." : "Send Inquiry"}
                </button>
                {inquiryStatus === "error" && (
                  <p className="text-xs text-red-500 text-center">Failed to send. Please try again.</p>
                )}
              </form>
            )}

            {/* Quick contact shortcuts */}
            <div className="flex gap-2 pt-1">
              <a
                href={`tel:${property.agent.phone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>
              <button
                onClick={handleWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </button>
              {property.agent.facebook_handle && (
                <a
                  href={`fb://facewebmodal/f?href=https://facebook.com/${property.agent.facebook_handle}`}
                  onClick={() => {
                    setTimeout(() => { window.open(`https://facebook.com/${property.agent.facebook_handle}`, '_blank'); }, 500);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-xs font-medium text-[#1877F2] hover:bg-blue-50 transition-colors"
                >
                  <Facebook className="h-3.5 w-3.5" />
                  Facebook
                </a>
              )}
            </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile fixed bottom bar (visible only below lg) */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-20 lg:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <img
            src={property.agent.avatar}
            alt={property.agent.name}
            className="h-10 w-10 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{property.agent.name}</p>
            <p className="text-xs text-gray-500 truncate">{property.agent.company}</p>
          </div>
          <a
            href={`tel:${property.agent.phone}`}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#0044FF] text-white hover:bg-[#0033CC] transition-colors shrink-0"
            aria-label="Call agent"
          >
            <Phone className="h-4 w-4" />
          </a>
          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shrink-0"
            aria-label="WhatsApp agent"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          {property.agent.facebook_handle && (
            <a
              href={`fb://facewebmodal/f?href=https://facebook.com/${property.agent.facebook_handle}`}
              onClick={() => {
                setTimeout(() => { window.open(`https://facebook.com/${property.agent.facebook_handle}`, '_blank'); }, 500);
              }}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#1877F2] text-white hover:bg-[#166FE5] transition-colors shrink-0"
              aria-label="Facebook profile"
            >
              <Facebook className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-white/70 text-sm">{galleryIndex + 1} / {property.images.length}</span>
            <button onClick={() => setGalleryOpen(false)} className="text-white/70 hover:text-white p-1">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 relative">
            <img
              src={property.images[galleryIndex]}
              alt={`${title} ${galleryIndex + 1}`}
              loading="lazy"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {galleryIndex > 0 && (
              <button
                onClick={() => setGalleryIndex(i => i - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
            )}
            {galleryIndex < property.images.length - 1 && (
              <button
                onClick={() => setGalleryIndex(i => i + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
