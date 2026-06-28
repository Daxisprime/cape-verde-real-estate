'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PropertyListings from '@/components/PropertyListings';
import ResultsFilterStrip from '@/components/ResultsFilterStrip';
import MarketsView from '@/components/MarketsView';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import PropertyDetailDrawer, { type PropertyDrawerItem } from '@/components/PropertyDetailDrawer';
import Footer from '@/components/Footer';
import { useSearchMode } from '@/contexts/SearchModeContext';
import { capeVerdeProperties } from '@/data/cape-verde-properties';
import { useListings } from '@/hooks/useListings';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Bed, Bath } from 'lucide-react';

const SafeLeafletMap = dynamic(
  () => import('@/components/MapboxMap'),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">{/* Loading Map */}</div>
  }
);

function formatPrice(price: number): string {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M CVE`;
  if (price >= 1000) return `${Math.round(price / 1000)}K CVE`;
  return `${price.toLocaleString()} CVE`;
}

export default function HomeContent() {
  const { t } = useLanguage();
  const {
    isResultsViewActive, setIsResultsViewActive,
    searchMode, listingType, headerSearchQuery,
  } = useSearchMode();

  const { listings: liveRealEstate, isLive } = useListings();
  const [isMapViewActive, setIsMapViewActive] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyDrawerItem | null>(null);

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
      description: item.description || '',
      features: [] as string[],
      agentId: item.agent_id || undefined,
    }));
    const base = isLive && liveMapped.length > 0
      ? [...liveMapped, ...capeVerdeProperties.map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          location: p.location,
          island: p.island,
          type: p.type,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area: p.totalArea,
          image: p.images[0] || '',
          images: p.images,
          coordinates: p.coordinates,
          featured: p.isFeatured || false,
          description: p.description || '',
          features: p.features || [],
          agentId: p.agentId || undefined,
        }))]
      : capeVerdeProperties.map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          location: p.location,
          island: p.island,
          type: p.type,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area: p.totalArea,
          image: p.images[0] || '',
          images: p.images,
          coordinates: p.coordinates,
          featured: p.isFeatured || false,
          description: p.description || '',
          features: p.features || [],
          agentId: p.agentId || undefined,
        }));

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
      is_featured: p.featured,
    }));
  }, [filteredProperties]);

  const hoveredMapItem = useMemo(() => {
    if (!hoveredId) return null;
    return mapMarkers.find(m => m.id === hoveredId) || null;
  }, [hoveredId, mapMarkers]);

  function handlePropertyClick(property: typeof filteredProperties[number]) {
    setSelectedProperty({
      id: property.id,
      title: property.title,
      price: property.price,
      location: property.location,
      island: property.island,
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      image: property.image,
      images: property.images,
      coordinates: property.coordinates,
      featured: property.featured,
      description: property.description,
      features: property.features,
      agentId: property.agentId,
    });
  }

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
          <span aria-hidden>&#x1F4CB;</span> {t.list}
        </button>

        <div className="w-full flex-1 flex flex-col-reverse md:flex-row overflow-hidden relative">
          {/* Left listing feed */}
          <div className="w-full md:w-[450px] lg:w-[500px] h-full overflow-y-auto z-10 px-3 pt-4 pb-24 border-r border-gray-100 bg-white">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {filteredProperties.length} {t.properties}
            </p>
            <div className="space-y-2">
              {filteredProperties.slice(0, 20).map(property => (
                <div
                  key={property.id}
                  onClick={() => handlePropertyClick(property)}
                  className={`flex gap-3 p-2 rounded-lg transition border cursor-pointer ${
                    hoveredId === property.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHoveredId(property.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <img
                    src={property.images?.[0] || property.image}
                    alt={property.title || 'Property'}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-gray-900 truncate">{property.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {property.location || property.island || 'Cape Verde'}
                    </p>
                    <p className="font-black text-sm text-gray-800 mt-1">{formatPrice(property.price || 0)}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                      {property.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{property.bedrooms}</span>}
                      {property.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{property.bathrooms}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right map panel */}
          <div className="w-full md:flex-1 h-full relative z-20">
            <SafeLeafletMap items={mapMarkers} activeItem={hoveredMapItem} onPinClick={(item: { id: string }) => {
              const property = filteredProperties.find(p => p.id === item.id);
              if (property) handlePropertyClick(property);
            }} />
          </div>
        </div>

        <PropertyDetailDrawer property={selectedProperty} onClose={() => setSelectedProperty(null)} />
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
          <span aria-hidden>&#x1F5FA;&#xFE0F;</span> {t.map}
        </button>

        <div className="relative w-full max-w-7xl mx-auto px-3 pt-4 pb-24">
          {/* Featured Carousel */}
          <FeaturedCarousel
            mode="realestate"
            onItemClick={(item) => handlePropertyClick({
              id: item.id,
              title: item.title,
              price: item.price,
              location: item.location,
              island: item.island,
              type: item.type,
              bedrooms: item.bedrooms || 0,
              bathrooms: item.bathrooms || 0,
              area: 0,
              image: item.image,
              images: [item.image],
              coordinates: [0, 0],
              featured: true,
              description: '',
              features: [],
              agentId: undefined,
            })}
          />

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {filteredProperties.length} {t.availableProperties}
          </p>

          {/* Masonry grid */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
            {filteredProperties.slice(0, 24).map((property, index) => (
              <div
                key={property.id}
                onClick={() => handlePropertyClick(property)}
                className="break-inside-avoid inline-block w-full mb-3 cursor-pointer"
                onMouseEnter={() => setHoveredId(property.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className={`rounded-xl bg-white overflow-hidden border transition-all duration-200 group ${
                  hoveredId === property.id
                    ? 'border-blue-500 shadow-lg ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-lg'
                }`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={property.images?.[0] || property.image}
                      alt={property.title || 'Property'}
                      className={`w-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ${
                        index % 3 === 0 ? 'h-48' : index % 3 === 1 ? 'h-56' : 'h-40'
                      }`}
                    />
                    <span className="absolute top-2 left-2 text-[9px] font-bold bg-white/90 backdrop-blur-sm text-[#2563EB] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {listingType === 'rent' ? t.forRent : t.forSale}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="font-extrabold text-sm text-gray-900">{formatPrice(property.price || 0)}</p>
                    <h3 className="font-medium text-xs text-gray-700 line-clamp-1 mt-0.5">{property.title || 'Untitled'}</h3>
                    <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-1">
                      <MapPin className="h-2.5 w-2.5" /> {property.location || property.island || 'Cape Verde'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                      {property.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{property.bedrooms}</span>}
                      {property.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{property.bathrooms}</span>}
                      {property.area > 0 && (
                        <span>{property.area}m&sup2;</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <PropertyDetailDrawer property={selectedProperty} onClose={() => setSelectedProperty(null)} />
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
