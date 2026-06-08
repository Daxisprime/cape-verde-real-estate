"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Bed, Bath, Square, Phone, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
    };
    coordinates: number[];
    priceHistory: Array<{ date: string; price: number }>;
  };
  similarProperties?: SimilarProperty[];
}

export default function PropertyDetailClient({ property, similarProperties = [] }: PropertyDetailClientProps) {
  const router = useRouter();
  const { currentLanguage } = useLanguage();

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

  const title = getTitle();

  return (
    <div className="min-h-screen bg-white">
      {/* Back nav */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 pb-40">
        {/* Photo gallery - lazy loaded images */}
        <section className="mt-4">
          {property.images.length > 0 && (
            <div className="space-y-2">
              <img
                src={property.images[0]}
                alt={title}
                loading="eager"
                className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-xl"
              />
              {property.images.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {property.images.slice(1, 4).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${title} ${i + 2}`}
                      loading="lazy"
                      className="w-full h-24 sm:h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Price + Title */}
        <section className="mt-6">
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

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <section className="mt-10">
            <hr className="border-gray-100 mb-6" />
            <h2 className="text-base font-semibold text-gray-800 mb-4">Similar Listings in the Area</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {similarProperties.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/property/${item.id}`)}
                  className="group text-left rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-28 sm:h-24 object-cover"
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
        )}
      </main>

      {/* Seller Contact Card - fixed at bottom */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
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
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
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
        </div>
      </div>
    </div>
  );
}
