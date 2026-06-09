'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PropertyListings from '@/components/PropertyListings';
import ResultsFilterStrip from '@/components/ResultsFilterStrip';
import MarketsView from '@/components/MarketsView';
import Footer from '@/components/Footer';
import { useSearchMode } from '@/contexts/SearchModeContext';
import { capeVerdeProperties } from '@/data/cape-verde-properties';
import { MapPin, Bed, Bath, Map, LayoutGrid } from 'lucide-react';

const SafeLeafletMap = dynamic(
  () => import('@/components/MapboxMap'),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
  }
);

function formatPrice(price: number): string {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M CVE`;
  if (price >= 1000) return `${Math.round(price / 1000)}K CVE`;
  return `${price.toLocaleString()} CVE`;
}

export default function HomeContent() {
  const {
    isResultsViewActive, setIsResultsViewActive,
    searchMode, listingType, headerSearchQuery,
  } = useSearchMode();

  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const scrollTriggeredRef = useRef(false);

  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY;
      if (scrollY > 150 && !scrollTriggeredRef.current) {
        scrollTriggeredRef.current = true;
        setHasScrolledPastHero(true);
        setIsResultsViewActive(true);
      } else if (scrollY <= 10 && scrollTriggeredRef.current) {
        scrollTriggeredRef.current = false;
        setHasScrolledPastHero(false);
        setIsResultsViewActive(false);
        setShowMapView(false);
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsResultsViewActive]);

  const filteredProperties = useMemo(() => {
    return capeVerdeProperties.filter(property => {
      const matchesQuery = !headerSearchQuery ||
        property.location.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
        property.island.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
        property.title.toLowerCase().includes(headerSearchQuery.toLowerCase());
      return matchesQuery;
    });
  }, [headerSearchQuery]);

  const mapMarkers = useMemo(() => {
    return filteredProperties.map(p => ({
      id: p.id,
      latitude: p.coordinates[1],
      longitude: p.coordinates[0],
      price: p.price,
      title: p.title,
      listing_type: listingType,
    }));
  }, [filteredProperties, listingType]);

  const scrolledActive = hasScrolledPastHero || isResultsViewActive;

  // Markets mode fully active (user searched or scrolled)
  if (scrolledActive && searchMode === "markets") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        {/* Filter strip with fade-in animation */}
        <div className={`transition-all duration-500 ease-in-out transform ${
          scrolledActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}>
          <ResultsFilterStrip />
        </div>
        <MarketsView />
      </div>
    );
  }

  // Real estate with map view toggled ON
  if (scrolledActive && showMapView) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className={`transition-all duration-500 ease-in-out transform ${
          scrolledActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}>
          <ResultsFilterStrip />
        </div>
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px-44px)] w-full overflow-hidden">
          <div className="w-full md:w-[400px] lg:w-[440px] h-[50vh] md:h-full overflow-y-auto border-r border-gray-100 bg-white">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {filteredProperties.length} Properties
                </p>
                <button
                  onClick={() => setShowMapView(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-semibold text-gray-700 transition"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Grid View
                </button>
              </div>
              <div className="space-y-2">
                {filteredProperties.slice(0, 20).map(property => (
                  <Link
                    key={property.id}
                    href={`/property/${property.id}`}
                    className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                  >
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-gray-900 truncate">{property.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {property.location}
                      </p>
                      <p className="font-black text-sm text-gray-800 mt-1">{formatPrice(property.price)}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                        <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{property.bedrooms}</span>
                        <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{property.bathrooms}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full md:flex-1 h-[50vh] md:h-full relative bg-gray-100">
            <SafeLeafletMap items={mapMarkers} activeItem={null} onPinClick={() => {}} />
          </div>
        </div>
      </div>
    );
  }

  // Unified layout: Hero (with transitions) + Listing Feed
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero section with smooth collapse */}
      <div className={`relative overflow-hidden transition-all duration-700 ease-in-out will-change-[max-height,opacity] ${
        scrolledActive
          ? 'max-h-0 opacity-0'
          : 'max-h-[80vh] opacity-100'
      }`}>
        <HeroSection />
      </div>

      {/* Filter strip - fades in from above when scrolled */}
      <div className={`transition-all duration-500 ease-in-out transform will-change-[opacity,transform] ${
        scrolledActive
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-3 pointer-events-none h-0 overflow-hidden'
      }`}>
        <ResultsFilterStrip />
      </div>

      {/* Content area with smooth padding transition */}
      <div className={`transition-all duration-500 ease-in-out ${
        scrolledActive ? 'pt-2' : 'pt-0'
      }`}>
        {/* Masonry listing grid - shown when scrolled past hero in real estate mode */}
        <div className={`transition-all duration-500 ease-in-out will-change-[opacity,transform] ${
          scrolledActive && searchMode === 'realestate'
            ? 'opacity-100 translate-y-0'
            : scrolledActive ? 'opacity-0 translate-y-4 h-0 overflow-hidden pointer-events-none' : 'opacity-0 h-0 overflow-hidden pointer-events-none'
        }`}>
          <div className="relative w-full max-w-7xl mx-auto px-3 pt-4 pb-10">
            {/* Floating map toggle pill */}
            <div className="flex justify-center mb-4 sticky top-28 z-20">
              <button
                onClick={() => setShowMapView(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-full shadow-lg transition transform hover:scale-105"
              >
                <Map className="h-4 w-4" />
                View on Map
              </button>
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {filteredProperties.length} Available Properties
            </p>

            {/* Masonry grid */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
              {filteredProperties.slice(0, 24).map((property, index) => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="break-inside-avoid inline-block w-full mb-3"
                >
                  <div className="rounded-xl bg-white overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <div className="relative overflow-hidden">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className={`w-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ${
                          index % 3 === 0 ? 'h-48' : index % 3 === 1 ? 'h-56' : 'h-40'
                        }`}
                      />
                      <span className="absolute top-2 left-2 text-[9px] font-bold bg-white/90 backdrop-blur-sm text-[#2563EB] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {listingType === 'rent' ? 'Rent' : 'Sale'}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <p className="font-extrabold text-sm text-gray-900">{formatPrice(property.price)}</p>
                      <h3 className="font-medium text-xs text-gray-700 line-clamp-1 mt-0.5">{property.title}</h3>
                      <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-1">
                        <MapPin className="h-2.5 w-2.5" /> {property.location}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                        <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{property.bedrooms}</span>
                        <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{property.bathrooms}</span>
                        {property.totalArea > 0 && (
                          <span>{property.totalArea}m&sup2;</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Default property listings - shown on hero landing */}
        <div className={`transition-all duration-500 ease-in-out ${
          scrolledActive ? 'opacity-0 h-0 overflow-hidden pointer-events-none' : 'opacity-100'
        }`}>
          <PropertyListings />
          <Footer />
        </div>
      </div>
    </div>
  );
}


export default HomeContent