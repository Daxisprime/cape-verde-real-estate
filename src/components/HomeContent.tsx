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
import { useListings } from '@/hooks/useListings';
import { MapPin, Bed, Bath } from 'lucide-react';

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

  const { listings: liveRealEstate, isLive } = useListings();
  const [isMapViewActive, setIsMapViewActive] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // One-way gate scroll listener: removed once triggered
  useEffect(() => {
    if (isResultsViewActive) return;

    function handleScroll() {
      if (window.scrollY > 300) {
        setIsResultsViewActive(true);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isResultsViewActive, setIsResultsViewActive]);

  // Reset map view when results view is deactivated (logo click)
  useEffect(() => {
    if (!isResultsViewActive) {
      setIsMapViewActive(false);
      setHoveredId(null);
    }
  }, [isResultsViewActive]);

  const filteredProperties = useMemo(() => {
    // Merge live listings with mock data
    const liveMapped = liveRealEstate.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      location: item.location || item.island,
      island: item.island,
      type: item.property_type || 'apartment',
      bedrooms: item.bedrooms || 0,
      bathrooms: item.bathrooms || 0,
      area: item.total_area || 0,
      image: item.images?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?w=800',
      images: item.images || [],
      coordinates: [item.longitude || 0, item.latitude || 0] as [number, number],
      featured: item.is_featured || false,
    }));
    const base = isLive && liveMapped.length > 0
      ? [...liveMapped, ...capeVerdeProperties]
      : capeVerdeProperties;

    return base.filter(property => {
      const matchesQuery = !headerSearchQuery ||
        property.location.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
        property.island.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
        property.title.toLowerCase().includes(headerSearchQuery.toLowerCase());
      return matchesQuery;
    });
  }, [headerSearchQuery, liveRealEstate, isLive]);

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

  const hoveredMapItem = useMemo(() => {
    if (!hoveredId) return null;
    return mapMarkers.find(m => m.id === hoveredId) || null;
  }, [hoveredId, mapMarkers]);

  // === LOCKED RESULTS VIEW ===

  // Markets mode
  if (isResultsViewActive && searchMode === "markets") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <MarketsView />
      </div>
    );
  }

  // Real estate with map view toggled ON
  if (isResultsViewActive && isMapViewActive) {
    return (
      <div className="w-full h-screen overflow-hidden flex flex-col bg-white">
        <Header />
        <ResultsFilterStrip />

        {/* Floating toggle pill */}
        <button
          onClick={() => setIsMapViewActive(false)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5 cursor-pointer font-semibold text-xs text-slate-800 active:scale-95"
        >
          <span aria-hidden>&#x1F4CB;</span> List
        </button>

        <div className="w-full flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Left listing feed */}
          <div className="w-full md:w-[450px] lg:w-[500px] h-full overflow-y-auto z-10 px-3 pt-4 pb-24 border-r border-gray-100 bg-white">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {filteredProperties.length} Properties
            </p>
            <div className="space-y-2">
              {filteredProperties.slice(0, 20).map(property => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className={`flex gap-3 p-2 rounded-lg transition border ${
                    hoveredId === property.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHoveredId(property.id)}
                  onMouseLeave={() => setHoveredId(null)}
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
          {/* Right map panel */}
          <div className="w-full md:flex-1 h-full relative z-20">
            <SafeLeafletMap items={mapMarkers} activeItem={hoveredMapItem} onPinClick={() => {}} />
          </div>
        </div>
      </div>
    );
  }

  // Real estate masonry grid (default results view, no map)
  if (isResultsViewActive) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <ResultsFilterStrip />

        {/* Floating toggle pill */}
        <button
          onClick={() => setIsMapViewActive(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5 cursor-pointer font-semibold text-xs text-slate-800 active:scale-95"
        >
          <span aria-hidden>&#x1F5FA;&#xFE0F;</span> Map
        </button>

        <div className="relative w-full max-w-7xl mx-auto px-3 pt-4 pb-24">
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
                onMouseEnter={() => setHoveredId(property.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className={`rounded-xl bg-white overflow-hidden border transition-all duration-200 cursor-pointer group ${
                  hoveredId === property.id
                    ? 'border-blue-500 shadow-lg ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-lg'
                }`}>
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
    );
  }

  // === HERO LANDING (gate not yet triggered) ===
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <PropertyListings />
      <Footer />
    </div>
  );
}
